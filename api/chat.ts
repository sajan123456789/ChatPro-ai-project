import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    const ai = new GoogleGenAI({
      apiKey: process.env.VITE_GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: messages,
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    res.status(200).json({ text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "API failed" });
  }
}
