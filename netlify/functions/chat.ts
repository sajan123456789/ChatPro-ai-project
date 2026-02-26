import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const ai = new GoogleGenAI({
      apiKey: process.env.VITE_GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: messages,
    });

    const text = response.candidates?.[0]?.content?.parts
      ?.map((part: any) => part.text || "")
      .join("") || "No response";

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
    };

  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error?.message || "API failed" }),
    };
  }
};
