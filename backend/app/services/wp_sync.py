"""
Background job to sync OpenProject Work Packages into local wp_cache table.
"""
import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Tuple

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.repositories.wp_cache_repository import WPCacheRepository
from app.services.openproject_client import openproject_client

logger = logging.getLogger(__name__)


def _parse_iso(dt: Any):
    if not dt:
        return None
    try:
        s = str(dt)
        if s.endswith("Z"):
            s = s.replace("Z", "+00:00")
        return datetime.fromisoformat(s)
    except Exception:
        return None


def _normalize_wp(wp: Dict[str, Any]) -> Dict[str, Any]:
    """Convert OpenProject fields to WPCache-compatible payload."""
    return {
        "wp_id": wp.get("wp_id"),
        "subject": wp.get("subject", ""),
        "status": wp.get("status"),
        "priority": wp.get("priority"),
        "type": wp.get("type"),
        "assignee_id": wp.get("assignee_id"),
        "assignee_name": wp.get("assignee_name"),
        "project_id": wp.get("project_id"),
        "project_name": wp.get("project_name"),
        "start_date": _parse_iso(wp.get("start_date")),
        "due_date": _parse_iso(wp.get("due_date")),
        "created_at": _parse_iso(wp.get("created_at")),
        "updated_at": _parse_iso(wp.get("updated_at")),
        "raw": wp,
    }


def sync_once(limit_total: int = 1000, page_size: int = 200) -> Tuple[int, int]:
    """Fetch work packages from OpenProject and upsert into wp_cache.

    Returns (processed, total_from_source)
    """
    db: Session = SessionLocal()
    repo = WPCacheRepository(db)
    processed = 0
    total_from_source = 0
    try:
        offset = 0
        while processed < limit_total:
            batch, total = openproject_client.list_work_packages(
                offset=offset,
                limit=min(page_size, limit_total - processed),
                filters=None,
                sort_by="desc",
            )
            if total_from_source == 0:
                total_from_source = total or 0

            if not batch:
                break

            normalized = [_normalize_wp(wp) for wp in batch]
            repo.bulk_upsert(normalized)

            batch_count = len(batch)
            processed += batch_count
            offset += batch_count
            if batch_count == 0:
                break

        db.commit()
        logger.info(f"wp_cache sync complete: processed={processed}, source_total={total_from_source}")
        return processed, total_from_source
    except Exception as e:
        logger.error(f"wp_cache sync failed: {e}", exc_info=True)
        db.rollback()
        return processed, total_from_source
    finally:
        db.close()


async def periodic_sync(interval_seconds: int = 300):
    """Run sync in a loop with given interval."""
    # Small initial delay to let app settle
    await asyncio.sleep(2)
    while True:
        try:
            sync_once()
        except Exception as e:
            logger.error(f"periodic wp_cache sync error: {e}")
        await asyncio.sleep(interval_seconds)

