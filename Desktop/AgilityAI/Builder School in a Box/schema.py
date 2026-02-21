from typing import List
from pydantic import BaseModel


class StartupPlan(BaseModel):
    name: str
    problem: str
    audience: str
    features: List[str]
    revenue: str
    roadmap: List[str]
