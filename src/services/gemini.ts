
const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY missing in environment");
}

const ai = new GoogleGenAI({
  apiKey
});

export type Role = 'user' | 'model';

export interface Message {
  id: string;
  role: Role;
  text: string;
  attachment?: {
    data: string;
    mimeType: string;
    name: string;
  };
  generatedImage?: string;
}

export type Persona = 'general' | 'legal' | 'tax' | 'student' | 'coder' | 'image_creator';

const PERSONA_INSTRUCTIONS: Record<Persona, string> = {
  general: "You are ChatPro AI, an advanced AI assistant developed in India. You are helpful, respectful, and knowledgeable about Indian culture, history, and current affairs,etc, as well as global topics. You communicate clearly and concisely. You are proud to be a 'Made in India' platform.",
  legal: "You are ChatPro AI Legal Guru, an expert in Indian Law, the Constitution of India, and the new Bharatiya Nyaya Sanhita,other etc.Provide accurate, professional legal information, but always include a disclaimer that you are an AI and not a substitute for professional legal counsel.",
  tax: "You are ChatPro AI Tax Expert, specializing in Indian taxation, GST, Income Tax slabs, and financial planning for Indian citizens. Provide clear, step-by-step financial explanations.",
  student: "You are ChatPro AI Student Guide, an expert tutor aligned with the CBSE, ICSE, and State Board curricula in India. Explain concepts simply, use analogies, and encourage critical thinking. Do not just give answers; help the student learn.",
  coder: "You are ChatPro AI Code Master, an elite software engineer. Provide clean, efficient, and well-documented code. Always explain your code snippets clearly. Use best practices and modern frameworks.",
  image_creator: "You are ChatPro AI Image Creator. You generate images based on user prompts."
};

export async function* streamChatResponse(messages: Message[], persona: Persona = 'general', useWebSearch: boolean = false) {
  const contents = messages.map(msg => {
    const parts: any[] = [];
    if (msg.text) {
      parts.push({ text: msg.text });
    }
    if (msg.attachment) {
      parts.push({
        inlineData: {
          data: msg.attachment.data,
          mimeType: msg.attachment.mimeType
        }
      });
    }
    return {
      role: msg.role,
      parts: parts
    };
  });

  const config: any = {
    systemInstruction: PERSONA_INSTRUCTIONS[persona],
  };

  if (useWebSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: contents,
    config: config,
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

export async function generateImage(prompt: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  throw new Error("No image generated");
}

