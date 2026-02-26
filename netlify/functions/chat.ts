import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  try {
    const { messages } = JSON.parse(event.body);

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: messages,
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API failed" }),
    };
  }
};
