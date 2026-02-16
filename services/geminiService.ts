import { GoogleGenAI, Type } from "@google/genai";
import { DiseaseAnalysis, WeatherData, MarketPrice, Crop, NearbyMarket } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

export const analyzePlantImage = async (base64Image: string, cropContext?: string, locale: string = 'en'): Promise<DiseaseAnalysis> => {
  try {
    const contextPrompt = cropContext && cropContext !== 'Other' 
      ? `The crop is identified by the farmer as: ${cropContext}. Focus analysis on diseases common to ${cropContext} in India.` 
      : `Identify the crop type from the image first.`;

    const prompt = `
      ACT AS A PRODUCTION-GRADE AGRICULTURAL AI FOR INDIA (KRISHI-NET).
      
      TASK: Analyze this plant image for disease, pests, or nutrient deficiency.
      CONTEXT: ${contextPrompt}
      LOCATION CONTEXT: India (Assume Indian agricultural conditions).
      
      REQUIREMENTS:
      1. Detect the specific disease or issue.
      2. Estimate Severity (Low/Medium/High) based on lesion spread and leaf damage.
      3. Provide a Confidence Score (0.0 to 1.0). If image is unclear, confidence should be low.
      4. Suggest treatments relevant to Indian farmers (available fungicides/pesticides).
      5. Provide organic/home remedies common in Indian villages.
      
      OUTPUT: Return strictly valid JSON matching the schema.
      LANGUAGE: The content inside the JSON (names, treatments) should be in ${locale === 'hi' ? 'Hindi' : locale === 'ur' ? 'Urdu' : 'English'}.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diseaseName: { type: Type.STRING },
            confidence: { type: Type.NUMBER, description: "Score between 0.0 and 1.0" },
            severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Healthy", "Unknown"] },
            description: { type: Type.STRING, description: "Short description of visual symptoms" },
            treatment: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            organicAlternatives: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            prevention: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            nextSteps: { type: Type.STRING, description: "Immediate action for the farmer" }
          },
          required: ["diseaseName", "confidence", "severity", "description", "treatment", "organicAlternatives", "prevention", "nextSteps"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DiseaseAnalysis;
    }
    throw new Error("No response text");
  } catch (error) {
    // console.error("Error analyzing plant:", error);
    throw error;
  }
};

export const getAdvisoryResponse = async (
  message: string, 
  history: { role: 'user' | 'model', text: string }[],
  context?: string,
  language: string = 'en'
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      config: {
        systemInstruction: `You are Krishi-Net's AI Agricultural Advisor. 
        Your goal is to help farmers with practical, scientific, and sustainable farming advice.
        Keep answers concise, actionable, and easy to understand.
        ALWAYS Reply in the following language code: ${language}.
        If the language is 'hi' (Hindi) or 'ur' (Urdu), use the respective script.
        If context is provided about local weather or crops, use it.
        ${context ? `Current Context: ${context}` : ''}`
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I am currently unable to provide advice. Please try again later.";
  } catch (error) {
    // Silently fail to fallback
    return "Sorry, I encountered an error connecting to the agricultural database.";
  }
};

export const getWeatherInsight = async (weatherSummary: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Given this weather forecast: ${weatherSummary}. Provide a 1-sentence farming tip for farmers in this region.`,
    });
    return response.text || "Monitor field moisture levels.";
  } catch (e) {
    return "Check local weather advisories.";
  }
};

export const getSellOrHoldAdvisory = async (
  crop: string,
  price: number,
  trend: string,
  location: string
): Promise<{ recommendation: 'SELL' | 'HOLD', reason: string }> => {
  try {
    const prompt = `
      I am a farmer in ${location}.
      Crop: ${crop}
      Current Price: ₹${price}/Quintal
      Market Trend: ${trend}
      
      Should I SELL now or HOLD for better prices? 
      Provide a JSON response with "recommendation" (SELL or HOLD) and "reason" (max 20 words).
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendation: { type: Type.STRING, enum: ['SELL', 'HOLD'] },
            reason: { type: Type.STRING }
          },
          required: ['recommendation', 'reason']
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return { recommendation: 'HOLD', reason: 'Market analysis unavailable, proceed with caution.' };
  } catch (error) {
    return { recommendation: 'HOLD', reason: 'Could not fetch AI analysis.' };
  }
};

interface LocationData {
  marketPrices: MarketPrice[];
  activeCrops: { name: string; status: string }[];
  nearbyMarkets: NearbyMarket[];
  weather: WeatherData;
}

// New function to generate localized data
export const getLocationBasedData = async (location: string): Promise<LocationData | null> => {
  try {
    const prompt = `
      Act as a real-time agricultural data engine for India.
      Location: ${location}.
      Date: ${new Date().toLocaleDateString()}.
      
      Task:
      1. Identify the 5 most relevant crops actually grown in ${location}.
      2. Estimate CURRENT market prices in the nearest real Mandis (Markets) for this location.
      3. Identify 3 ACTUAL nearby towns/Mandis relative to ${location} with their approximate distance.
      4. Suggest 2 crops farmers are likely growing right now in this season in this district.
      5. Generate a weather forecast summary for this location.
      
      Output strictly valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketPrices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  crop: { type: Type.STRING },
                  mandi: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  change: { type: Type.NUMBER },
                  trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] }
                }
              }
            },
            activeCrops: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  status: { type: Type.STRING }
                }
              }
            },
            nearbyMarkets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  distance: { type: Type.STRING },
                  priceDiff: { type: Type.NUMBER, description: "Difference from avg price" }
                }
              }
            },
            weather: {
              type: Type.OBJECT,
              properties: {
                temp: { type: Type.NUMBER },
                condition: { type: Type.STRING },
                humidity: { type: Type.NUMBER },
                windSpeed: { type: Type.NUMBER },
                forecast: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.STRING },
                      temp: { type: Type.NUMBER },
                      rainChance: { type: Type.NUMBER }
                    }
                  }
                }
              }
            }
          },
          required: ["marketPrices", "activeCrops", "nearbyMarkets", "weather"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No data generated");
  } catch (error) {
    // Removing the error log to prevent console noise
    // console.error("Location data error:", error); 
    return null; // The UI will handle fallback
  }
};