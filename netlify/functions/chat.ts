export const handler = async (event: any) => {
  try {
    const { messages } = JSON.parse(event.body);

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API key missing" }),
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: messages,
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini raw response:", JSON.stringify(data));

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data }),
      };
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return {
      statusCode: 200,
      body: JSON.stringify({ text: text || "EMPTY_RESPONSE" }),
    };

  } catch (error) {
    console.error("Function crash:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Function crashed" }),
    };
  }
};
