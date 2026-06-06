from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import SettingsOut
from app.services import get_settings

router = APIRouter(prefix="/settings", tags=["setting"])


@router.get("", response_model=SettingsOut)
def read_settings(db: Session = Depends(get_db)):
    setting = get_settings(db)
    return SettingsOut(
        show_second_winner=setting.show_second_winner,
        winner_info_readonly=setting.winner_info_readonly,
    )
