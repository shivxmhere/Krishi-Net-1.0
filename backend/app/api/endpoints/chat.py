"""
Chat endpoint using Groq AI for fast, persona-based agricultural advice.
"""

import json
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.config import settings

router = APIRouter(prefix="/chat", tags=["Chat"])

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
CHAT_MODEL = "llama-3.3-70b-versatile"


class Message(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []
    context: Optional[str] = None
    language: str = "en"


@router.post("/")
async def chat_response(request: ChatRequest):
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise HTTPException(status_code=503, detail="AI Service not configured")

    try:
        # Build message history in OpenAI format
        system_prompt = f"""You are Krishi-Net's AI Friend and Advisor.
Speak warmly in {request.language}. Use 🌾🚜 emojis.
Keep replies under 3 sentences unless asked for more detail.
Context: {request.context or "General farming help."}"""

        messages = [{"role": "system", "content": system_prompt}]

        for msg in request.history:
            role = "user" if msg.role == "user" else "assistant"
            messages.append({"role": role, "content": msg.text})

        messages.append({"role": "user", "content": request.message})

        payload = {
            "model": CHAT_MODEL,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 400,
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        print(f"💬 Chat request via Groq ({CHAT_MODEL})...")

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
                return {"response": ai_text or "I'm listening, but my thoughts are a bit cloudy. Ask again? 🌾"}

            elif response.status_code == 429:
                print("⚠️ Chat rate limited")
                return {"response": "I'm a bit busy right now. Please try again in a few seconds! 🌾"}

            else:
                print(f"❌ Chat error: {response.status_code} - {response.text[:200]}")
                return {"response": "My connection to the farm network is a bit shaky. Please ask again! 🌾"}

    except Exception as e:
        print(f"❌ Chat Critical Error: {e}")
        return {"response": "My connection to the farm network is a bit shaky. Please ask again in a moment! 🌾"}
