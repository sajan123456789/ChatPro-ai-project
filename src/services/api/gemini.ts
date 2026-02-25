import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing Gemini API key");
}

const ai = new GoogleGenAI({ apiKey });

export type Role = "user" | "model";

export interface Message {
  id: string;
  role: Role;
  text: string;
}

export type Persona =
  | "general"
  | "legal"
  | "tax"
  | "student"
  | "coder"
  | "image_creator";

export async function* streamChatResponse(messages: Message[]) {
  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  const result = await ai.models.generateContentStream({
    model: "gemini-1.5-flash",
    contents
  });

  for await (const chunk of result) {
    if (chunk.text) yield chunk.text;
  }
}
