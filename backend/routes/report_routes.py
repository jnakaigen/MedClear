import hashlib
from collections import OrderedDict
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from auth import get_current_user
from database import get_db
from llm_service import chat_about_report, simplify_report, simplify_report_from_image
from models import (
    AnalysisResponse,
    ChatMessage,
    ChatRequest,
    ChatResponse,
    ReportListItem,
    ReportOut,
)
from text_extractor import extract_text

router = APIRouter(prefix="/api/reports", tags=["reports"])

ALLOWED_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/tiff",
    "image/bmp",
    "image/gif",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# In-memory LRU cache for LLM results (avoids duplicate API calls)
CACHE_MAX_SIZE = 50
_cache: OrderedDict = OrderedDict()


def _build_report_context(report: dict) -> str:
    """Build a text summary of the report for chat context."""
    parts = [f"Report: {report['report_title']}", f"Summary: {report['summary']}", ""]
    for s in report.get("sections", []):
        parts.append(f"Section: {s['title']} (Severity: {s['severity']})")
        parts.append(f"  Original: {s['original_text']}")
        parts.append(f"  Simplified: {s['simplified_text']}")
        parts.append("")
    if report.get("action_items"):
        parts.append("Action Items:")
        for item in report["action_items"]:
            parts.append(f"  - {item}")
    parts.append(f"Follow-up: {report.get('follow_up', 'N/A')}")
    return "\n".join(parts)


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_report(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. "
            "Please upload a PDF or image file.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File is too large. Max 10 MB.")

    try:
        is_image = file.content_type.startswith("image/")
        use_multimodal = False
        extracted_text = ""

        try:
            extracted_text = extract_text(file_bytes, file.content_type)
        except ValueError:
            if is_image:
                use_multimodal = True
            else:
                raise

        if is_image and len(extracted_text.split()) < 5:
            use_multimodal = True

        cache_key = hashlib.sha256(file_bytes).hexdigest() if use_multimodal else hashlib.sha256(extracted_text.encode()).hexdigest()
        if cache_key in _cache:
            _cache.move_to_end(cache_key)
            result = _cache[cache_key]
        elif use_multimodal:
            result = await simplify_report_from_image(file_bytes, file.content_type)
            _cache[cache_key] = result
            if len(_cache) > CACHE_MAX_SIZE:
                _cache.popitem(last=False)
        else:
            result = await simplify_report(extracted_text)
            _cache[cache_key] = result
            if len(_cache) > CACHE_MAX_SIZE:
                _cache.popitem(last=False)

        # Save to MongoDB
        db = get_db()
        report_doc = {
            "user_id": user["id"],
            "filename": file.filename or "upload",
            "report_title": result.report_title,
            "summary": result.summary,
            "sections": [s.model_dump() for s in result.sections],
            "action_items": result.action_items,
            "follow_up": result.follow_up,
            "chat_history": [],
            "created_at": datetime.now(timezone.utc),
        }
        insert_result = await db.reports.insert_one(report_doc)
        report_id = str(insert_result.inserted_id)

        return AnalysisResponse(success=True, data=result, report_id=report_id)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while analyzing the report.",
        )


# --- Chat endpoints ---


@router.post("/{report_id}/chat", response_model=ChatResponse)
async def chat_with_report(
    report_id: str,
    request: ChatRequest,
    user: dict = Depends(get_current_user),
):
    db = get_db()

    try:
        oid = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report ID")

    report = await db.reports.find_one({"_id": oid, "user_id": user["id"]})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report_context = _build_report_context(report)
    chat_history = report.get("chat_history", [])

    try:
        reply = await chat_about_report(report_context, chat_history, request.message)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Append to chat history in MongoDB
    new_messages = [
        {"role": "user", "content": request.message},
        {"role": "assistant", "content": reply},
    ]
    await db.reports.update_one(
        {"_id": oid},
        {"$push": {"chat_history": {"$each": new_messages}}},
    )

    updated_history = chat_history + new_messages

    return ChatResponse(
        reply=reply,
        history=[ChatMessage(role=m["role"], content=m["content"]) for m in updated_history],
    )


@router.get("/{report_id}/chat", response_model=list[ChatMessage])
async def get_chat_history(
    report_id: str,
    user: dict = Depends(get_current_user),
):
    db = get_db()

    try:
        oid = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report ID")

    report = await db.reports.find_one(
        {"_id": oid, "user_id": user["id"]},
        {"chat_history": 1},
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return [
        ChatMessage(role=m["role"], content=m["content"])
        for m in report.get("chat_history", [])
    ]


# --- List / Detail / Delete ---


@router.get("", response_model=list[ReportListItem])
async def list_reports(user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.reports.find({"user_id": user["id"]}).sort("created_at", -1)
    reports = await cursor.to_list(length=100)

    items = []
    for r in reports:
        severity_counts = {"normal": 0, "watch": 0, "urgent": 0}
        for section in r.get("sections", []):
            sev = section.get("severity", "normal")
            severity_counts[sev] = severity_counts.get(sev, 0) + 1

        items.append(
            ReportListItem(
                id=str(r["_id"]),
                filename=r["filename"],
                report_title=r["report_title"],
                summary=r["summary"],
                severity_counts=severity_counts,
                created_at=r["created_at"],
            )
        )

    return items


@router.get("/{report_id}", response_model=ReportOut)
async def get_report(report_id: str, user: dict = Depends(get_current_user)):
    db = get_db()

    try:
        oid = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report ID")

    report = await db.reports.find_one({"_id": oid, "user_id": user["id"]})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return ReportOut(
        id=str(report["_id"]),
        filename=report["filename"],
        report_title=report["report_title"],
        summary=report["summary"],
        sections=report["sections"],
        action_items=report["action_items"],
        follow_up=report["follow_up"],
        created_at=report["created_at"],
    )


@router.delete("/{report_id}")
async def delete_report(report_id: str, user: dict = Depends(get_current_user)):
    db = get_db()

    try:
        oid = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report ID")

    result = await db.reports.delete_one({"_id": oid, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")

    return {"success": True}
