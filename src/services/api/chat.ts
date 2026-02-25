import { GoogleGenAI } from "@google/genai";

export default async function handler(req:any, res:any) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.VITE_GEMINI_API_KEY,
    });

    const { messages } = req.body;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: messages,
    });

    res.status(200).json({ text: result.text });
  } catch (e) {
    res.status(500).json({ error: "Gemini failed" });
  }
}
