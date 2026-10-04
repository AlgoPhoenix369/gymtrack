from pydantic import BaseModel, ConfigDict, Field


class ScheduleEntry(BaseModel):
    isWorkout: bool
    time: str | None
    focus: str | None


class MealEntry(BaseModel):
    day: str
    lunch: int
    dinner: int


class PlanOut(BaseModel):
    schedule: dict[str, ScheduleEntry]
    mealPlan: list[MealEntry]
    dishes: dict[int, str]


class DishOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class DishUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class MealUpdate(BaseModel):
    lunch_dish_id: int | None = None
    dinner_dish_id: int | None = None