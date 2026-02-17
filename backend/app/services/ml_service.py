"""
ML Service for plant disease detection using TensorFlow CNN.
Gracefully handles missing TensorFlow — logs warning and continues.
"""

import numpy as np
from typing import Dict


class MLService:
    def __init__(self):
        self.model = None
        self.model_loaded = False
        self.disease_classes = self._load_classes()

    def load_model(self, model_path: str):
        """Load a saved TensorFlow/Keras model."""
        try:
            import tensorflow as tf
            self.model = tf.keras.models.load_model(model_path)
            self.model_loaded = True
            print(f"✅ ML Model loaded: {model_path}")
        except ImportError:
            print("⚠️  TensorFlow not installed — CNN model unavailable (Gemini fallback will be used)")
        except Exception as e:
            print(f"⚠️  ML model load failed: {e}")

    def _load_classes(self):
        return [
            "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
            "Blueberry___healthy",
            "Cherry___Powdery_mildew", "Cherry___healthy",
            "Corn___Cercospora_leaf_spot", "Corn___Common_rust", "Corn___Northern_Leaf_Blight", "Corn___healthy",
            "Grape___Black_rot", "Grape___Esca", "Grape___Leaf_blight", "Grape___healthy",
            "Orange___Haunglongbing",
            "Peach___Bacterial_spot", "Peach___healthy",
            "Pepper___Bacterial_spot", "Pepper___healthy",
            "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
            "Raspberry___healthy",
            "Soybean___healthy",
            "Squash___Powdery_mildew",
            "Strawberry___Leaf_scorch", "Strawberry___healthy",
            "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight",
            "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
            "Tomato___Spider_mites", "Tomato___Target_Spot",
            "Tomato___Yellow_Leaf_Curl_Virus", "Tomato___Mosaic_virus", "Tomato___healthy",
        ]

    def preprocess(self, image_bytes: bytes) -> np.ndarray:
        """Preprocess image bytes to model input tensor."""
        from PIL import Image
        import io

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize((256, 256))
        img_array = np.array(image) / 255.0
        return np.expand_dims(img_array, axis=0)

    async def predict(self, image_bytes: bytes) -> Dict:
        """Run prediction on image bytes using the loaded CNN model."""
        if not self.model_loaded:
            return {"error": "Model not loaded"}

        processed = self.preprocess(image_bytes)
        predictions = self.model.predict(processed)
        top_idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][top_idx])
        
        if top_idx < len(self.disease_classes):
            disease_raw = self.disease_classes[top_idx]
        else:
            disease_raw = "Unknown___Unknown"

        return {
            "diseaseName": disease_raw.split("___")[1].replace("_", " "),
            "crop": disease_raw.split("___")[0],
            "confidence": round(confidence, 4),
            "severity": "High" if confidence > 0.8 else "Medium" if confidence > 0.5 else "Low",
        }


ml_service = MLService()
