import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { uniqueId, message } = await req.json();

    if (!uniqueId || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { uniqueId },
      select: {
        name: true,
        age: true,
        gender: true,
        records: {
          orderBy: { createdAt: "desc" },
          take: 15,
          select: {
            recordType: true,
            data: true,
            createdAt: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const history = patient.records
      .map(
        (r) => `• ${r.recordType} on ${new Date(r.createdAt).toDateString()}`
      )
      .join("\n");

    const prompt = `
You are a friendly AI health assistant for patients.
You MUST NOT diagnose or prescribe medicines.
You CAN explain symptoms, checkups, and give general health guidance.

Patient Info:
Name: ${patient.name}
Age: ${patient.age}
Gender: ${patient.gender}

Medical History:
${history}

Now answer the patient's question:
"${message}"
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    return NextResponse.json({ reply: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: "Chat service error" }, { status: 500 });
  }
}
