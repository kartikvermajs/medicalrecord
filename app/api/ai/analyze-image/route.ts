import { NextResponse } from "next/server";
import client from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { imageUrl, subject } = await req.json();

    if (!imageUrl) {
      console.log("❌ Missing imageUrl");
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    console.log("📥 AI ANALYSIS REQUEST:", { imageUrl, subject });

    const prompt = `
You are a medical AI assistant. Extract structured fields from the checkup slip image:

{
  "diagnosis": string | null,
  "symptoms": string[] | null,
  "medicines": string[] | null,
  "testsRecommended": string[] | null,
  "followUpAdvice": string | null,
  "doctorNotes": string | null,
  "importantKeywords": string[] | null,
  "unclearParts": string[] | null
}

The subject is: ${subject || "N/A"}

Return ONLY JSON. No explanation. No markdown.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You extract structured medical data from images.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 800,
    });

    let raw = response.choices[0]?.message?.content || "{}";
    console.log("🧠 RAW AI OUTPUT:", raw);

    // Clean codeblock formatting
    raw = raw.replace(/```json/g, "").replace(/```/g, "");

    // Attempt JSON parse
    let analysis = {};
    try {
      analysis = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON PARSE FAILED:", err);
      return NextResponse.json(
        { analysis: null, warning: "Model did not return valid JSON" },
        { status: 200 }
      );
    }

    console.log("✅ PARSED ANALYSIS:", analysis);

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    console.error("❌ GLOBAL AI ERROR:", error);
    return NextResponse.json(
      {
        error: "AI analysis failed",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
