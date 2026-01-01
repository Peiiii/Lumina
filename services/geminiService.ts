
import { GoogleGenAI, Type } from "@google/genai";
import { Fragment } from "../types";

// Initialize with process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const organizeFragments = async (fragments: Fragment[]) => {
  const context = fragments.map(f => `[${f.type}] ${f.content}`).join('\n---\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these fragmented thoughts and provide a synthesis. 
    Categorize them into 'Themes', 'Action Items', and 'Potential Opportunities'.
    
    Notes:
    ${context}`,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          themes: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
          opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING }
        },
        required: ["themes", "actionItems", "opportunities", "summary"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const brainstormFromIdea = async (idea: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Brainstorm 5 innovative directions or enhancements for this idea: "${idea}"`,
    config: {
      temperature: 1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            complexity: { type: Type.STRING, description: "Low, Medium, or High" }
          },
          required: ["concept", "reasoning", "complexity"]
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateReview = async (fragments: Fragment[]) => {
  const context = fragments.map(f => f.content).join('\n');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a reflective weekly review based on these notes. Focus on what was achieved and what needs focus next week.
    
    Notes:
    ${context}`,
    config: {
      temperature: 0.5,
    }
  });
  return response.text;
};
