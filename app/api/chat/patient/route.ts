import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import client from "@/lib/ai";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export const runtime = "nodejs";

// Define expected structure of record.data JSON
interface CheckupData {
  subject?: string;
  images?: string[];
  analysis?: string;
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // Fetch patient's records
    const records = await prisma.record.findMany({
      where: { patientId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        recordType: true,
        createdAt: true,
        data: true,
      },
    });

    // Safely cast JSON → CheckupData
    const medicalContext = records.map((r) => {
      const d = r.data as CheckupData;
      return {
        recordType: r.recordType,
        createdAt: r.createdAt,
        subject: d.subject ?? null,
        analysis: d.analysis ?? null,
      };
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are CuraVault AI — a medical assistant for patients.

You must answer based ONLY on:
• patient's checkup records
• doctor-entered notes
• AI analysis from uploaded checkup slips

Rules:
• Do NOT diagnose any condition.
• You CAN summarize, explain trends, symptoms, insights.
• You CAN recommend general health steps.
• If unsure → tell user to visit a doctor.
`,
        },
        {
          role: "user",
          content: `
Patient query:
${message}

Patient medical context:
${JSON.stringify(medicalContext, null, 2)}
`,
        },
      ],
      max_tokens: 600,
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("CHAT ERROR:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
