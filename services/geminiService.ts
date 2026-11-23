import { DiseaseAnalysis, WeatherData, MarketPrice, Crop, NearbyMarket } from "../types";

// API Configuration — all AI calls now go through the backend (Groq-powered)
const getEnvVar = (name: string) => (import.meta as any).env[name] || "";
const API_URL = getEnvVar('VITE_API_URL') || 'http://localhost:8000';
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('krishi_net_token') || ''}` });

// Generic AI text generation via backend
const callAI = async (prompt: string, jsonMode: boolean = false): Promise<string> => {
  const response = await fetch(`${API_URL}/api/v1/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ prompt, json_mode: jsonMode, max_tokens: 1024 }),
  });
  if (!response.ok) throw new Error(`AI error: ${response.statusText}`);
  const data = await response.json();
  return data.response;
};

export const analyzePlantImage = async (imageFile: File | Blob, cropContext?: string, locale: string = 'en'): Promise<DiseaseAnalysis> => {
  const formData = new FormData();
  formData.append('file', imageFile, 'image.jpg');
  formData.append('crop', cropContext || 'Other');

  // 60-second timeout to prevent infinite hang
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`${API_URL}/api/v1/predict/`, {
      method: 'POST',
      body: formData,
      headers: authHeaders(),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Analysis failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Analysis timed out. Please try again with a clearer image.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getAdvisoryResponse = async (
  message: string,
  history: { role: 'user' | 'model', text: string }[],
  context?: string,
  language: string = 'en'
): Promise<string> => {
  const response = await fetch(`${API_URL}/api/v1/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, context, language }),
  });

  if (!response.ok) throw new Error(`Chat API error: ${response.statusText}`);
  const data = await response.json();
  return data.response;
};

interface LocationData {
  marketPrices: MarketPrice[];
  activeCrops: { name: string; status: string }[];
  nearbyMarkets: NearbyMarket[];
  weather: WeatherData;
}

export const getWeatherInsight = async (weatherSummary: string): Promise<string> => {
  try {
    const result = await callAI(
      `Given this weather forecast: ${weatherSummary}. Provide a 1-sentence farming tip for farmers in this region.`
    );
    return result || "Monitor field moisture levels.";
  } catch (e) {
    return "Check local weather advisories.";
  }
};

/** Disabled until observable, dated mandi data is available. */
export const getSellOrHoldAdvisory = async (
  _crop: string, _price: number, _trend: string, _location: string
): Promise<{ recommendation: 'SELL' | 'HOLD', reason: string }> => {
  throw new Error('Market forecasts are unavailable until a verified data feed is connected.');
};

/** Do not ask an LLM to fabricate live prices, mandis, or weather observations. */
export const getLocationBasedData = async (_location: string): Promise<LocationData | null> => null;
