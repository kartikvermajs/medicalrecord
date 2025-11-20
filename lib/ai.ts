export async function generateWithGemini(prompt: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const json = await response.json();

    const text =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a reply.";

    return text;
  } catch (error) {
    console.error("🔥 GEMINI ERROR:", error);
    return "The AI service failed. Please try again later.";
  }
}
