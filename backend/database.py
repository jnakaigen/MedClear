import os
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient

_client: Optional[AsyncIOMotorClient] = None


def get_db():
    return _client["medclear"]


async def connect_db():
    global _client
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    _client = AsyncIOMotorClient(mongo_url)
    db = _client["medclear"]

    # Ensure indexes
    await db.users.create_index("email", unique=True)
    await db.reports.create_index("user_id")
    await db.reports.create_index("created_at")


async def close_db():
    global _client
    if _client:
        _client.close()
        _client = None
