import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  async generateQuestion(excludeIds: string[]): Promise<Question | null> {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Menga o'zbek tilida qiziqarli MATEMATIK masala tayyorla. JSON formatda bo'lsin.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING },
              text: { type: Type.STRING },
              answer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ["id", "category", "text", "answer", "explanation", "difficulty"]
          }
        }
      });
      return JSON.parse(response.text || '{}') as Question;
    } catch (e) { return null; }
  },

  async getHint(question: string, answer: string): Promise<string> {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Masala: "${question}". Javob: "${answer}". Kichik yordam (hint) ber o'zbek tilida.`,
      });
      return response.text || "Yordam mavjud emas.";
    } catch (e) { return "Xatolik."; }
  }
};
