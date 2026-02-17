
def get_safe_advice(ml_result):
    """
    Provides reliable agricultural advice when the AI service is unavailable.
    Maps ML identification classes to standard recommended practices.
    """
    disease = ml_result.get("diseaseName", "Unknown").lower()
    crop = ml_result.get("crop", "Plant").lower()
    
    # Standard fallback advice
    advice = {
        "description": f"Initial screening suggests localized symptoms of {disease} on {crop}. Local ML identification complete.",
        "treatment": [
            "Prune and destroy infected plant parts immediately.",
            "Avoid overhead irrigation to reduce humidity on leaves.",
            "Consult a local Mandi specialist for specific fungicides/pesticides."
        ],
        "organicAlternatives": [
            "Apply Neem Oil spray (5ml per liter of water) for general pest/fungal control.",
            "Use wood ash around the base to manage soil acidity."
        ],
        "prevention": [
            "Ensure proper spacing between plants for ventilation.",
            "Maintain balanced soil nutrient levels (NPK).",
            "Rotate crops annually to break the disease cycle."
        ],
        "nextSteps": "Monitor the field daily for further spread and check soil moisture.",
        "products": []
    }

    # Specific tweaks for common issues
    if "healthy" in disease:
        advice["description"] = f"Your {crop} appears healthy! No immediate disease symptoms detected."
        advice["treatment"] = ["No chemical treatment required.", "Continue regular watering and fertilization."]
        advice["nextSteps"] = "Maintain your current care routine."
        advice["severity"] = "Healthy"
    elif "blight" in disease:
        advice["treatment"].insert(0, "Apply copper-based fungicides if humidity is high.")
    elif "rot" in disease:
        advice["treatment"].insert(0, "Drastically reduce watering and improve soil drainage.")
    
    return advice
