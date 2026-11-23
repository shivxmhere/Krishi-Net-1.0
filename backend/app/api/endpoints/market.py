"""Market endpoints.

A trustworthy live mandi source has not yet been integrated. Never generate
fake real-time mandi quotes, buyers, or contact details with an LLM.
"""
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/market", tags=["Market"])

@router.get("/status")
def market_status():
    return {
        "live_prices_available": False,
        "source": None,
        "message": "Verified mandi data feed is not configured. Do not treat sample values as market observations."
    }

@router.post("/analysis")
def market_analysis_unavailable():
    raise HTTPException(
        status_code=503,
        detail="Verified mandi market data is not configured. Please check an official market source."
    )
