from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Day, Dish
from app.schemas import DishOut, PlanOut

router = APIRouter(prefix="/api", tags=["plan"])


# Simple check that the API is running.
@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# Return the full weekly plan in the shape the frontend expects.
@router.get("/plan", response_model=PlanOut)
def get_plan(db: Session = Depends(get_db)):
    days = db.scalars(select(Day).order_by(Day.position)).all()
    dishes = db.scalars(select(Dish).order_by(Dish.id)).all()
    return {
        "schedule": {
            d.name: {"isWorkout": d.is_workout, "time": d.workout_time, "focus": d.workout_focus}
            for d in days
        },
        "mealPlan": [{"day": d.name, "lunch": d.lunch_dish_id, "dinner": d.dinner_dish_id} for d in days],
        "dishes": {dish.id: dish.name for dish in dishes},
    }


# List all dishes.
@router.get("/dishes", response_model=list[DishOut])
def list_dishes(db: Session = Depends(get_db)):
    return db.scalars(select(Dish).order_by(Dish.id)).all()