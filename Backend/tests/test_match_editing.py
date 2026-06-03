from datetime import datetime, timedelta

from app.match_editing import (
    is_prediction_editable,
    prediction_edit_deadline,
    utc_now,
)


def test_editable_more_than_one_hour_before_kickoff():
    kickoff = datetime(2026, 6, 15, 18, 0)
    now = datetime(2026, 6, 15, 16, 0)
    assert is_prediction_editable(kickoff, now) is True


def test_locked_within_one_hour_before_kickoff():
    kickoff = datetime(2026, 6, 15, 18, 0)
    now = datetime(2026, 6, 15, 17, 30)
    assert is_prediction_editable(kickoff, now) is False


def test_locked_after_kickoff():
    kickoff = datetime(2026, 6, 15, 18, 0)
    now = datetime(2026, 6, 15, 18, 1)
    assert is_prediction_editable(kickoff, now) is False


def test_locked_at_kickoff():
    kickoff = datetime(2026, 6, 15, 18, 0)
    assert is_prediction_editable(kickoff, kickoff) is False


def test_locked_at_exactly_one_hour_before():
    kickoff = datetime(2026, 6, 15, 18, 0)
    now = prediction_edit_deadline(kickoff)
    assert is_prediction_editable(kickoff, now) is False


def test_editable_without_kickoff():
    assert is_prediction_editable(None, utc_now()) is True
