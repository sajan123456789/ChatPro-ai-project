import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req: Request) {
  try {
    const body = await req.json();

    const ai = new GoogleGenAI({
      apiKey: process.env.VITE_GEMINI_API_KEY!,
    });

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: body.messages,
    });

    return new Response(
      JSON.stringify({ text: result.text }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Gemini failed" }),
      { status: 500 }
    );
  }
}
