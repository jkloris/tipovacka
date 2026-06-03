from datetime import datetime, timedelta, timezone

EDIT_LOCK_BEFORE_KICKOFF = timedelta(hours=1)


def _as_utc_naive(dt: datetime) -> datetime:
    """Normalize to naive UTC for comparison with DB kickoff_at values."""
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def prediction_edit_deadline(kickoff_at: datetime) -> datetime:
    return _as_utc_naive(kickoff_at) - EDIT_LOCK_BEFORE_KICKOFF


def is_prediction_editable(
    kickoff_at: datetime | None,
    now: datetime | None = None,
) -> bool:
    """
    Predictions can be changed only before kickoff and at least 1 hour before
    kickoff (all times UTC, matching kickoff_at in the database).
    """
    if kickoff_at is None:
        return True

    kickoff = _as_utc_naive(kickoff_at)
    if now is None:
        now = utc_now()
    else:
        now = _as_utc_naive(now)

    if now >= kickoff:
        return False

    return now < prediction_edit_deadline(kickoff)


def lock_reason(kickoff_at: datetime | None, now: datetime | None = None) -> str | None:
    if kickoff_at is None or is_prediction_editable(kickoff_at, now):
        return None

    kickoff = _as_utc_naive(kickoff_at)
    if now is None:
        now = utc_now()
    else:
        now = _as_utc_naive(now)

    if now >= kickoff:
        return "Match has already started"
    return "Predictions are locked from 1 hour before kickoff"
