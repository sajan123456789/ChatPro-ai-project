import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const message = body.message;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(message);
    const response = await result.response;

    return res.status(200).json({
      reply: response.text(),
    });

  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({
      error: "AI not working",
    });
  }
}
