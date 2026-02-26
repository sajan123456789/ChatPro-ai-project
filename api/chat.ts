import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: "nodejs"
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    const ai = new GoogleGenAI({
      apiKey: process.env.VITE_GEMINI_API_KEY!,
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: messages,
    });

    // ✅ Proper Gemini text extraction
    const text = response.candidates?.[0]?.content?.parts
      ?.map((part: any) => part.text || "")
      .join("") || "No response";

    res.status(200).json({ text });

  } catch (error: any) {
    console.error("FULL ERROR:", error);
    res.status(500).json({
      error: error?.message || "API failed"
    });
  }
}
