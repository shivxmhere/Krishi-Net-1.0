"""
Disease prediction endpoint.
- If trained model exists: uses TensorFlow CNN
- Fallback: uses Groq AI (Llama Vision) for image analysis
"""

import asyncio
import json
import base64
import traceback
import httpx
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.config import settings
from app.services.ml_service import ml_service
from app.services.advice_service import get_safe_advice

router = APIRouter(prefix="/predict", tags=["Disease Detection"])

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_TIMEOUT = 45

# Vision models to try in order (Llama 4 supports native vision)
VISION_MODELS = ["meta-llama/llama-4-scout-17b-16e-instruct", "meta-llama/llama-4-maverick-17b-128e-instruct"]


@router.post("/")
async def predict_disease(
    file: UploadFile = File(...),
    crop: str = Form(""),
    db: Session = Depends(get_db),
):
    """
    Disease Prediction Engine.
    Hybrid Intelligence: Edge ML Identification + Groq AI Vision.
    """
    print(f"📸 Received Analysis Request | Crop Context: {crop or 'None'}")

    # 1. Read Data
    image_bytes = await file.read()
    if not image_bytes:
        print("❌ Error: Received empty file")
        raise HTTPException(status_code=400, detail="Empty file")

    # 2. Local Identification (Optional Edge ML)
    ml_id = None
    if ml_service.model_loaded:
        try:
            print("🧠 Running Local ML Identification...")
            res = await ml_service.predict(image_bytes)
            if "error" not in res:
                ml_id = res
                print(f"✅ Local ML suggests: {ml_id['diseaseName']}")
        except Exception as e:
            print(f"⚠️ Local ML Failed: {e}")

    # 3. Check API key
    api_key = settings.GROQ_API_KEY
    if not api_key:
        print("❌ Error: No Groq API Key configured")
        raise HTTPException(status_code=503, detail="AI Service not configured")

    # 4. Build the prompt
    context = f"The crop is {crop}." if crop else "Identify the crop first."
    if ml_id:
        context += f" Edge identification: '{ml_id['diseaseName']}'."

    prompt = f"""
    ROLES: Expert Agricultural Scientist & Plant Pathologist (India).
    CONTEXT: {context}

    TASK: Analyze the image for disease, pests, or deficiencies.
    OUTPUT FORMAT: Provide a detailed diagnosis and actionable advice in valid JSON format.

    STRICT JSON STRUCTURE:
    {{
        "diseaseName": "Final diagnosis or 'Healthy [Crop]'",
        "confidence": 0.95,
        "severity": "Low" | "Medium" | "High" | "Healthy",
        "description": "Short summary of symptoms found.",
        "treatment": ["Immediate chemical/physical action step 1", "step 2"],
        "organicAlternatives": ["Natural/Organic remedy step 1"],
        "prevention": ["Long-term prevention strategy"],
        "nextSteps": "The single most important next action for the farmer.",
        "products": []
    }}

    INSTRUCTIONS:
    - If healthy, set severity to 'Healthy'.
    - Treatments must be relevant to Indian agriculture.
    - Return ONLY the JSON object. No conversation. No markdown blocks.
    """

    # 5. Encode image to base64
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    # 6. Try each vision model
    last_error = ""

    for model_name in VISION_MODELS:
        print(f"✨ AI Pipeline — Model: {model_name}")

        payload = {
            "model": model_name,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_b64}"
                            },
                        },
                    ],
                }
            ],
            "temperature": 0.3,
            "max_tokens": 1024,
            "response_format": {"type": "json_object"},
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    GROQ_API_URL,
                    json=payload,
                    headers=headers,
                    timeout=GROQ_TIMEOUT,
                )

                if response.status_code == 200:
                    data = response.json()
                    ai_text = (
                        data.get("choices", [{}])[0]
                        .get("message", {})
                        .get("content", "")
                    )
                    if ai_text:
                        result = json.loads(ai_text.strip())
                        print(f"🎯 Success | Model: {model_name}")
                        return result

                elif response.status_code == 429:
                    last_error = "Rate limited — please wait a moment"
                    print(f"⚠️ Rate limited on {model_name}. Trying next...")
                    await asyncio.sleep(2)
                    continue
                else:
                    error_body = response.text
                    last_error = f"{response.status_code}: {error_body[:200]}"
                    print(f"⚠️ {model_name} error: {last_error}")
                    continue

        except httpx.TimeoutException:
            last_error = f"{model_name} timed out ({GROQ_TIMEOUT}s)"
            print(f"⏰ {last_error}")
            continue
        except Exception as e:
            last_error = str(e)
            print(f"❌ {model_name} error: {e}")
            continue

    # 7. Fall back to local ML if available
    if ml_id:
        print("🔄 All AI models failed. Falling back to Edge ML result.")
        safe_advice = get_safe_advice(ml_id)
        return {
            **ml_id,
            **safe_advice,
            "description": f"Cloud AI is currently unavailable. Providing expert fallback: {safe_advice['description']}",
        }

    # 8. Return error
    print(f"🚨 All AI models exhausted. Last error: {last_error}")
    raise HTTPException(
        status_code=502,
        detail=f"AI analysis failed. Last error: {last_error}",
    )
