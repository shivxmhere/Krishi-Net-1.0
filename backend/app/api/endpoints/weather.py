"""
Weather proxy endpoint — forwards to Open-Meteo API.
Keeps the API key-free Open-Meteo flow on the backend for future expansion.
"""

from fastapi import APIRouter, Query
import httpx

router = APIRouter(prefix="/weather", tags=["Weather"])


def _get_condition(code: int) -> str:
    if code == 0:
        return "Clear Sky"
    if 1 <= code <= 3:
        return "Partly Cloudy"
    if 45 <= code <= 48:
        return "Foggy"
    if 51 <= code <= 55:
        return "Drizzle"
    if 61 <= code <= 67:
        return "Rain"
    if 71 <= code <= 77:
        return "Snow"
    if 80 <= code <= 82:
        return "Showers"
    if 95 <= code <= 99:
        return "Thunderstorm"
    return "Cloudy"


@router.get("/")
async def get_weather(location: str = Query(..., description="Location name (city/district)")):
    """Get weather for a location using Open-Meteo (no API key needed)."""

    async with httpx.AsyncClient() as client:
        # 1. Geocode
        geo_resp = await client.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": location, "count": 1, "language": "en", "format": "json"},
        )
        geo_data = geo_resp.json()

        if not geo_data.get("results"):
            return {"error": "Location not found"}

        lat = geo_data["results"][0]["latitude"]
        lon = geo_data["results"][0]["longitude"]

        # 2. Weather
        weather_resp = await client.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
                "daily": "weather_code,temperature_2m_max,precipitation_probability_max",
                "timezone": "auto",
                "forecast_days": 5,
            },
        )
        data = weather_resp.json()

        if "current" not in data:
            return {"error": "Weather data unavailable"}

        forecast = []
        for i in range(1, len(data["daily"]["time"])):
            forecast.append({
                "day": data["daily"]["time"][i],
                "temp": round(data["daily"]["temperature_2m_max"][i]),
                "rainChance": data["daily"]["precipitation_probability_max"][i],
            })

        return {
            "temp": round(data["current"]["temperature_2m"]),
            "condition": _get_condition(data["current"]["weather_code"]),
            "humidity": data["current"]["relative_humidity_2m"],
            "windSpeed": data["current"]["wind_speed_10m"],
            "forecast": forecast,
        }
