
import { GoogleGenAI, Type } from "@google/genai";
import { Fragment } from "../types";

// Initialize with process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const organizeFragments = async (fragments: Fragment[]) => {
  const context = fragments.map(f => `[${f.type}] ${f.content}`).join('\n---\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `请分析以下碎片化想法并提供综合整理。请务必使用中文回答。
    将它们分类为“核心主题”、“待办事项”和“潜在机遇”。
    
    记录内容：
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
          summary: { type: Type.STRING, description: "一段对所有记录的综合分析总结，使用中文。" }
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
    contents: `请针对以下创意进行头脑风暴，提供5个创新方向或改进建议。请务必使用中文回答。
    
    创意内容："${idea}"`,
    config: {
      temperature: 1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING, description: "建议的名称或核心概念" },
            reasoning: { type: Type.STRING, description: "该方向的理由和潜在价值" },
            complexity: { type: Type.STRING, description: "难度评估：Low, Medium, or High" }
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
    contents: `请根据这些记录写一份深度的复盘总结。专注于取得了哪些进展，以及接下来的工作重点。请务必使用中文字体，风格要专业且具有启发性。
    
    记录内容：
    ${context}`,
    config: {
      temperature: 0.5,
    }
  });
  return response.text;
};
