from fastapi import APIRouter, Depends

from auth import get_current_user
from database import get_db
from models import TimelineEntry

router = APIRouter(prefix="/api/timeline", tags=["timeline"])


@router.get("", response_model=list[TimelineEntry])
async def get_timeline(user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.reports.find({"user_id": user["id"]}).sort("created_at", 1)
    reports = await cursor.to_list(length=200)

    entries = []
    for r in reports:
        findings = [
            {
                "title": s["title"],
                "simplified_text": s["simplified_text"],
                "severity": s["severity"],
            }
            for s in r.get("sections", [])
        ]

        entries.append(
            TimelineEntry(
                report_id=str(r["_id"]),
                report_title=r["report_title"],
                date=r["created_at"],
                findings=findings,
                action_items=r.get("action_items", []),
            )
        )

    return entries
