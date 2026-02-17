"""
Market analysis endpoint using Groq AI for agricultural market intelligence.
"""

import json
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter(prefix="/market", tags=["Market"])

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MARKET_MODEL = "llama-3.3-70b-versatile"


class MarketRequest(BaseModel):
    location: str
    state: str
    district: str
    language: str = "en"


@router.post("/analysis")
async def get_market_analysis(request: MarketRequest):
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise HTTPException(status_code=503, detail="AI Service not configured")

    prompt = f"""
    Act as an expert Agricultural Market Analyst for India with access to real-time Mandi rates.
    Analyze the CURRENT market situation for:
    District: {request.district}
    State: {request.state}
    Language: {request.language}
    
    Provide STRICTLY ACCURATE and HYPER-LOCAL data.
    Return JSON:
    {{
        "trendingCrops": [{{"name": "Crop Name", "price": "₹Current_Price", "trend": "up/down/stable", "demand": "High/Medium/Low"}}],
        "mandis": [{{"name": "Mandi Name", "distance": "Distance", "bestFor": "Crops"}}],
        "buyers": [{{"name": "Buyer Name", "type": "Wholesaler", "contact": "Phone", "requirements": "Requirement"}}],
        "advisory": "Specific advice in {request.language}"
    }}
    """

    payload = {
        "model": MARKET_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.4,
        "max_tokens": 1024,
        "response_format": {"type": "json_object"},
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        print(f"📊 Market analysis request via Groq ({MARKET_MODEL})...")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                GROQ_API_URL, json=payload, headers=headers, timeout=20.0
            )

            if response.status_code == 200:
                data = response.json()
                ai_text = (
                    data.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "")
                )
                if ai_text:
                    return json.loads(ai_text.strip())

            elif response.status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail="AI rate limited. Please try again in a few seconds.",
                )

            print(f"❌ Market error: {response.status_code} - {response.text[:200]}")
            raise HTTPException(status_code=500, detail="Market analysis failed")

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Market Analysis Error: {e}")
        raise HTTPException(status_code=500, detail="Market analysis failed")
