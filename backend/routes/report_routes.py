import hashlib
from collections import OrderedDict
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from auth import get_current_user
from database import get_db
from llm_service import simplify_report
from models import AnalysisResponse, ReportListItem, ReportOut
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
        extracted_text = extract_text(file_bytes, file.content_type)

        # Check LLM cache
        text_hash = hashlib.sha256(extracted_text.encode()).hexdigest()
        if text_hash in _cache:
            _cache.move_to_end(text_hash)
            result = _cache[text_hash]
        else:
            result = await simplify_report(extracted_text)
            _cache[text_hash] = result
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
            "created_at": datetime.now(timezone.utc),
        }
        insert_result = await db.reports.insert_one(report_doc)

        return AnalysisResponse(success=True, data=result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while analyzing the report.",
        )


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
