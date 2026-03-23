import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def _supabase_headers(token: str | None = None) -> dict:
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    headers = {"apikey": key}
    if settings.SUPABASE_SERVICE_ROLE_KEY:
        headers["Authorization"] = f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}"
    elif token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def insert_supabase_dispute(dispute, token: str | None = None) -> None:
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        return

    gig_id = None
    try:
        gig_id = dispute.transaction.gig_id
    except Exception:
        gig_id = None

    payload = {
        "gig_id": str(gig_id) if gig_id else None,
        "raised_by": str(dispute.raised_by_id) if dispute.raised_by_id else None,
        "reason": dispute.reason,
        "status": dispute.status,
        "admin_notes": dispute.admin_notes,
        "resolved_at": dispute.resolved_at.isoformat() if dispute.resolved_at else None,
    }

    try:
        resp = requests.post(
            f"{settings.SUPABASE_URL}/rest/v1/disputes",
            headers={**_supabase_headers(token), "Prefer": "return=representation"},
            json=payload,
            timeout=10,
        )
        if resp.status_code >= 300:
            logger.warning("Supabase dispute insert failed: %s %s", resp.status_code, resp.text)
            return
        try:
            data = resp.json()
            if isinstance(data, list) and data:
                dispute.supabase_id = data[0].get("id")
                dispute.save(update_fields=["supabase_id"])
        except Exception:
            return
    except Exception as exc:
        logger.warning("Supabase dispute insert error: %s", exc)


def update_supabase_dispute(dispute, token: str | None = None) -> None:
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        return
    if not dispute.supabase_id:
        return

    payload = {
        "status": dispute.status,
        "admin_notes": dispute.admin_notes,
        "resolved_at": dispute.resolved_at.isoformat() if dispute.resolved_at else None,
    }
    try:
        resp = requests.patch(
            f"{settings.SUPABASE_URL}/rest/v1/disputes",
            headers=_supabase_headers(token),
            params={"id": f"eq.{dispute.supabase_id}"},
            json=payload,
            timeout=10,
        )
        if resp.status_code >= 300:
            logger.warning("Supabase dispute update failed: %s %s", resp.status_code, resp.text)
    except Exception as exc:
        logger.warning("Supabase dispute update error: %s", exc)
