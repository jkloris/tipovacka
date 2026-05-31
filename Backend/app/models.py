from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    player_name: Mapped[str | None] = mapped_column(String(64), nullable=True)

    ticket: Mapped["Ticket | None"] = relationship(back_populates="user", uselist=False)


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    match_number: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    home: Mapped[str] = mapped_column(String(128))
    away: Mapped[str] = mapped_column(String(128))
    kickoff_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    home_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    away_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    winner1: Mapped[str] = mapped_column(String(128), default="")
    winner2: Mapped[str | None] = mapped_column(String(128), nullable=True)
    top_scorer: Mapped[str] = mapped_column(String(128), default="")

    user: Mapped["User"] = relationship(back_populates="ticket")
    predictions: Mapped[list["Prediction"]] = relationship(
        back_populates="ticket", cascade="all, delete-orphan"
    )


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id"), index=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id"), index=True)
    home_score: Mapped[int] = mapped_column(Integer)
    away_score: Mapped[int] = mapped_column(Integer)

    ticket: Mapped["Ticket"] = relationship(back_populates="predictions")
    match: Mapped["Match"] = relationship()

    __table_args__ = (
        UniqueConstraint("ticket_id", "match_id", name="uq_prediction_ticket_match"),
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    __table_args__ = (UniqueConstraint("user_id", name="uq_refresh_user"),)
