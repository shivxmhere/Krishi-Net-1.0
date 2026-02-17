"""
Central API router that aggregates all endpoint routers.
"""

from fastapi import APIRouter
from app.api.endpoints import auth, crops, weather, predict, chat, market, ai

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(crops.router)
api_router.include_router(weather.router)
api_router.include_router(predict.router)
api_router.include_router(chat.router)
api_router.include_router(market.router)
api_router.include_router(ai.router)
