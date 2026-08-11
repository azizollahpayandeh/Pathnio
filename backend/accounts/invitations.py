"""
Driver-invitation token helpers.

The raw token is high-entropy and returned to the owner exactly once; only its
SHA-256 hash is persisted. Activation looks up by hash, so a DB compromise never
yields a usable code.
"""
import hashlib
import secrets
from datetime import timedelta

from django.utils import timezone

from .models import DriverInvitation

# How long a fresh invitation stays valid.
INVITATION_TTL = timedelta(days=7)


def generate_raw_token() -> str:
    """A cryptographically secure, URL-safe activation code (~32 chars)."""
    return secrets.token_urlsafe(24)


def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.strip().encode("utf-8")).hexdigest()


def issue_invitation(driver, company, created_by) -> tuple[DriverInvitation, str]:
    """Revoke any existing PENDING invitation for the driver, then create a
    fresh one. Returns (invitation, raw_token). The raw token is caller-only.
    """
    now = timezone.now()
    DriverInvitation.objects.filter(
        driver=driver, status=DriverInvitation.Status.PENDING
    ).update(status=DriverInvitation.Status.REVOKED, revoked_at=now)

    raw = generate_raw_token()
    invitation = DriverInvitation.objects.create(
        driver=driver,
        company=company,
        token_hash=hash_token(raw),
        created_by=created_by,
        expires_at=now + INVITATION_TTL,
    )
    return invitation, raw
