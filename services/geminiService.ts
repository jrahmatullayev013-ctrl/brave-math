import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

export const geminiService = {
  async generateQuestion(excludeIds: string[]): Promise<Question | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Menga o'zbek tilida qiziqarli va mantiqiy MATEMATIK masala tayyorla. JSON formatda bo'lsin. Avval berilgan masalalar IDlari: ${excludeIds.join(',')}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Random UUID yoki qisqa ID" },
              category: { type: Type.STRING, description: "Mantiq, Arifmetika, Geometriya" },
              text: { type: Type.STRING, description: "Masala matni" },
              answer: { type: Type.STRING, description: "Qisqa va aniq javob (raqam yoki bitta so'z)" },
              explanation: { type: Type.STRING, description: "Yechim tushuntirishi" },
              difficulty: { type: Type.STRING, description: "oson, o'rta, qiyin" }
            },
            required: ["id", "category", "text", "answer", "explanation", "difficulty"]
          }
        }
      });
      
      const text = response.text;
      if (!text) return null;
      return JSON.parse(text) as Question;
    } catch (e) {
      console.error("Masala yaratishda xatolik:", e);
      return null;
    }
  },

  async getHint(question: string, answer: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Masala: "${question}". Javob: "${answer}". Ushbu masalani yechish uchun o'zbek tilida qisqa (bir jumla) maslahat ber. Javobni aslo aytma.`,
      });
      return response.text || "Hozircha yordam bera olmayman.";
    } catch (e) {
      console.error("Hint olishda xatolik:", e);
      return "Xatolik yuz berdi.";
    }
  }
};
