from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models import Day, Dish
from app.schemas import DishOut, DishUpdate, MealEntry, MealUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


# Change which dishes are served for lunch and dinner on a given day.
@router.put("/days/{day_name}/meals", response_model=MealEntry)
def update_day_meals(day_name: str, body: MealUpdate, db: Session = Depends(get_db)):
    day = db.scalar(select(Day).where(func.lower(Day.name) == day_name.lower()))
    if day is None:
        raise HTTPException(status_code=404, detail="Day not found")
    for field, value in (("lunch_dish_id", body.lunch_dish_id), ("dinner_dish_id", body.dinner_dish_id)):
        if value is None:
            continue
        if db.get(Dish, value) is None:
            raise HTTPException(status_code=422, detail=f"Dish {value} does not exist")
        setattr(day, field, value)
    db.commit()
    return {"day": day.name, "lunch": day.lunch_dish_id, "dinner": day.dinner_dish_id}


# Rename a dish.
@router.put("/dishes/{dish_id}", response_model=DishOut)
def rename_dish(dish_id: int, body: DishUpdate, db: Session = Depends(get_db)):
    dish = db.get(Dish, dish_id)
    if dish is None:
        raise HTTPException(status_code=404, detail="Dish not found")
    dish.name = body.name
    db.commit()
    db.refresh(dish)
    return dish