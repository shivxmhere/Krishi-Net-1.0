"""
Generic AI text generation endpoint using Groq.
Serves frontend functions that previously called Gemini directly.
"""

import json
import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from app.core.config import settings
from app.core.security import get_current_user

router = APIRouter(prefix="/ai", tags=["AI"])

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
TEXT_MODEL = "llama-3.3-70b-versatile"


class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=5000)
    json_mode: bool = False
    max_tokens: int = Field(default=1024, ge=32, le=2048)
    temperature: float = Field(default=0.5, ge=0, le=1)


@router.post("/generate")
async def generate_text(request: GenerateRequest, current_user=Depends(get_current_user)):
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise HTTPException(status_code=503, detail="AI Service not configured")

    payload = {
        "model": TEXT_MODEL,
        "messages": [{"role": "user", "content": request.prompt}],
        "temperature": request.temperature,
        "max_tokens": request.max_tokens,
    }

    if request.json_mode:
        payload["response_format"] = {"type": "json_object"}

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
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
                return {"response": ai_text}

            elif response.status_code == 429:
                raise HTTPException(status_code=429, detail="AI rate limited")

            raise HTTPException(
                status_code=500, detail=f"AI error: {response.status_code}"
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ AI Generate Error: {e}")
        raise HTTPException(status_code=500, detail="AI generation failed")
