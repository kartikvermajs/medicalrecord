import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    console.log("📥 OCR REQUEST RECEIVED:", { imageUrl });

    if (!imageUrl || typeof imageUrl !== "string") {
      console.log("❌ Missing imageUrl");
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    // ---------------------------------------------
    // Build OCR Space FormData
    // ---------------------------------------------
    const formData = new FormData();
    formData.append("url", imageUrl);
    formData.append("OCREngine", "2"); // Better accuracy
    formData.append("isTable", "true");

    console.log("🔍 Sending OCR request to ocr.space...");

    const ocrRes = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: process.env.OCR_SPACE_API_KEY || "",
      },
      body: formData,
    });

    const json = await ocrRes.json();

    console.log("🧠 RAW OCR RESPONSE:", json);

    // ---------------------------------------------
    // Extract text or error
    // ---------------------------------------------
    const text =
      json?.ParsedResults?.[0]?.ParsedText ||
      json?.ErrorMessage ||
      json?.ErrorDetails ||
      "";

    if (!text) {
      console.log("⚠️ OCR returned empty text");
    }

    console.log("📄 OCR EXTRACTED TEXT:", text);

    return NextResponse.json({ text }, { status: 200 });
  } catch (err) {
    console.error("❌ OCR API ERROR:", err);
    return NextResponse.json(
      {
        error: "OCR failed",
        details: String(err),
      },
      { status: 500 }
    );
  }
}
