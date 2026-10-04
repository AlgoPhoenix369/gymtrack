from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Day, Dish

# Names taken from the meal photos. Others are placeholders, editable through the admin API.
DISH_NAMES = {
    1: "Steamed mixed veggies, hard-boiled eggs, sliced avocado",
    4: "Cooked nduma, seared beef, sauteed kienyeji veggies, sliced avocado",
}

# (position, day, is_workout, time, focus, lunch dish, dinner dish)
DAYS = [
    (1, "Monday", True, "4:30 \u2013 6:30 PM", "Cardio + Chest", 1, 4),
    (2, "Tuesday", True, "4:30 \u2013 6:30 PM", "Cardio + Shoulders & Triceps", 11, 9),
    (3, "Wednesday", True, "3:00 \u2013 5:00 PM", "Cardio + Back & Biceps", 5, 3),
    (4, "Thursday", True, "11:30 AM \u2013 2:30 PM", "Cardio + Legs", 14, 5),
    (5, "Friday", True, "4:00 \u2013 6:00 PM", "Cardio + Chest", 13, 4),
    (6, "Saturday", False, None, None, 8, 12),
    (7, "Sunday", False, None, None, 10, 6),
]


# Fill an empty database with the 14 dishes and the 7 days.
def seed_database(db: Session) -> None:
    if db.scalars(select(Dish).limit(1)).first() is not None:
        return
    for number in range(1, 15):
        db.add(Dish(id=number, name=DISH_NAMES.get(number, f"Dish {number:02d}")))
    for position, name, is_workout, time, focus, lunch, dinner in DAYS:
        db.add(
            Day(
                position=position,
                name=name,
                is_workout=is_workout,
                workout_time=time,
                workout_focus=focus,
                lunch_dish_id=lunch,
                dinner_dish_id=dinner,
            )
        )
    db.commit()