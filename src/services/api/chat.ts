import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  try {
    const { messages } = req.body;

    const ai = new GoogleGenAI({
      apiKey: process.env.VITE_GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: messages,
    });

    res.status(200).json({ text: response.text });
  } catch (error) {
    res.status(500).json({ error: "API failed" });
  }
}
