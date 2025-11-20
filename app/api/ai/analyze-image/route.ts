import { NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/ai";

export const runtime = "nodejs";

// Strict structure expected from Gemini
interface AnalysisOutput {
  diagnosis: string | null;
  symptoms: string[] | null;
  medicines: string[] | null;
  testsRecommended: string[] | null;
  followUpAdvice: string | null;
  doctorNotes: string | null;
  importantKeywords: string[] | null;
  unclearParts: string[] | null;
}

export async function POST(req: Request) {
  try {
    const { extractedText, subject } = await req.json();

    console.log("📥 AI ANALYSIS REQUEST (Gemini):", {
      subject,
      extractedTextLength: extractedText?.length,
    });

    // Images are NOT used in Gemini (they are paid)
    if (!extractedText || typeof extractedText !== "string") {
      console.log("❌ Missing extractedText");
      return NextResponse.json(
        { error: "Missing extractedText (OCR must run first)" },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // Build Gemini prompt
    // ---------------------------------------------
    const prompt = `
You are a medical AI assistant. Extract structured fields ONLY from the OCR text of a checkup slip.

Return JSON ONLY, with this exact structure:

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

If something is missing, return null or [].
Do NOT hallucinate any medicines or diagnosis not present in OCR.

SUBJECT:
${subject ?? "N/A"}

OCR TEXT:
${extractedText}

Return ONLY JSON. No markdown, no explanation.
`;

    console.log("🧠 Sending prompt to Gemini...");

    // DIRECT GEMINI CALL (TEXT ONLY)
    const rawOutput = await generateWithGemini(prompt);

    console.log("🧠 RAW GEMINI OUTPUT:", rawOutput);

    // ---------------------------------------------
    // Clean accidental ```json blocks
    // ---------------------------------------------
    const cleaned = rawOutput
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let analysis: AnalysisOutput | null = null;

    // ---------------------------------------------
    // JSON parse attempt
    // ---------------------------------------------
    try {
      analysis = JSON.parse(cleaned) as AnalysisOutput;
    } catch (err) {
      console.error("❌ JSON PARSE FAILED:", err);

      return NextResponse.json(
        {
          analysis: null,
          raw: cleaned,
          warning: "Gemini returned invalid JSON",
        },
        { status: 200 }
      );
    }

    console.log("✅ PARSED ANALYSIS:", analysis);

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    console.error("❌ GLOBAL GEMINI AI ERROR:", error);
    return NextResponse.json(
      {
        error: "Gemini processing failed",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
