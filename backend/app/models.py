from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


# A dish. The id matches its image file, for example images/1.png.
class Dish(Base):
    __tablename__ = "dishes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)


# One day of the week with its workout details and lunch and dinner dishes.
class Day(Base):
    __tablename__ = "days"

    position: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    is_workout: Mapped[bool] = mapped_column(Boolean, default=False)
    workout_time: Mapped[str | None] = mapped_column(String(40), nullable=True)
    workout_focus: Mapped[str | None] = mapped_column(String(80), nullable=True)
    lunch_dish_id: Mapped[int] = mapped_column(ForeignKey("dishes.id"))
    dinner_dish_id: Mapped[int] = mapped_column(ForeignKey("dishes.id"))