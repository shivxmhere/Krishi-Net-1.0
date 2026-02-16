import { WeatherData } from '../types';

// Map WMO Weather Codes to string conditions
const getWeatherCondition = (code: number): string => {
  if (code === 0) return 'Clear Sky';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Cloudy';
};

export const getCoordinates = async (locationName: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    // Uses Open-Meteo Geocoding API which is more stable for browser-based requests than Nominatim
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`);
    const data = await response.json();
    
    if (data && data.results && data.results.length > 0) {
      return { lat: data.results[0].latitude, lon: data.results[0].longitude };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

export const getRealWeather = async (location: string): Promise<WeatherData | null> => {
  try {
    // 1. Get Coordinates
    const coords = await getCoordinates(location);
    if (!coords) return null;

    // 2. Fetch Weather from Open-Meteo (No API Key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,precipitation_probability_max&timezone=auto&forecast_days=5`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.current || !data.daily) return null;

    // 3. Transform Data
    const weather: WeatherData = {
      temp: Math.round(data.current.temperature_2m),
      condition: getWeatherCondition(data.current.weather_code),
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      forecast: data.daily.time.slice(1).map((dateStr: string, index: number) => ({
        day: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round(data.daily.temperature_2m_max[index + 1]),
        rainChance: data.daily.precipitation_probability_max[index + 1]
      }))
    };

    return weather;
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
};