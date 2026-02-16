
import tensorflow as tf
import numpy as np
from PIL import Image
import io
from typing import Dict

class MLService:
    def __init__(self):
        self.model = None
        self.model_loaded = False
        self.disease_classes = self._load_classes()

    def load_model(self, model_path: str):
        try:
            self.model = tf.keras.models.load_model(model_path)
            self.model_loaded = True
            print(f"✅ Model loaded: {model_path}")
        except Exception as e:
            print(f"❌ Model load failed: {e}")

    def _load_classes(self):
        return [
            "Apple___Apple_scab", "Apple___Black_rot", "Apple___healthy",
            "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
            "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___healthy"
        ]

    def preprocess(self, image_bytes: bytes) -> np.ndarray:
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image = image.resize((256, 256))
        img_array = np.array(image) / 255.0
        return np.expand_dims(img_array, axis=0)

    async def predict(self, image_bytes: bytes) -> Dict:
        if not self.model_loaded:
            return {"error": "Model not loaded"}
        
        processed = self.preprocess(image_bytes)
        predictions = self.model.predict(processed)
        top_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][top_idx])
        disease_raw = self.disease_classes[top_idx]
        
        return {
            "disease": disease_raw.split("___")[1].replace("_", " "),
            "crop": disease_raw.split("___")[0],
            "confidence": round(confidence, 4),
            "severity": "high" if confidence > 0.8 else "medium"
        }

ml_service = MLService()
