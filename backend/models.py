from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr


# --- Auth models ---

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut


# --- Report models ---

class ReportSection(BaseModel):
    title: str
    original_text: str
    simplified_text: str
    severity: Literal["normal", "watch", "urgent"]


class SimplifiedReport(BaseModel):
    report_title: str
    summary: str
    sections: list[ReportSection]
    action_items: list[str]
    follow_up: str


class AnalysisResponse(BaseModel):
    success: bool
    data: Optional[SimplifiedReport] = None
    error: Optional[str] = None


class ReportOut(BaseModel):
    id: str
    filename: str
    report_title: str
    summary: str
    sections: list[ReportSection]
    action_items: list[str]
    follow_up: str
    created_at: datetime


class ReportListItem(BaseModel):
    id: str
    filename: str
    report_title: str
    summary: str
    severity_counts: dict[str, int]
    created_at: datetime


# --- Timeline models ---

class TimelineEntry(BaseModel):
    report_id: str
    report_title: str
    date: datetime
    findings: list[dict]  # [{title, simplified_text, severity}]
    action_items: list[str]
