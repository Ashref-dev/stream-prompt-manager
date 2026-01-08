import { GoogleGenAI } from "@google/genai";
import { GeminiResponse } from "../types";

export const testPromptWithGemini = async (prompt: string): Promise<GeminiResponse> => {
  if (!process.env.API_KEY) {
    return { text: '', error: "API Key not found in environment." };
  }

  try {
    // Initialize Gemini Client
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Using gemini-3-flash-preview for speed in testing prompts
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for quick feedback
      }
    });

    return { text: response.text || "No response generated." };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return { text: '', error: error.message || "Failed to generate response." };
  }
};