import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "doctor" | "patient";
  qualification?: string;
  hospital?: string;
  field?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegisterRequest;
    const { name, email, password, role, qualification, hospital, field } =
      body;

    if (!email || !password || !role || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "doctor") {
      const existing = await prisma.doctor.findUnique({ where: { email } });
      if (existing)
        return NextResponse.json(
          { error: "Doctor already registered" },
          { status: 400 }
        );

      const doctor = await prisma.doctor.create({
        data: {
          name,
          email,
          password: hashedPassword,
          qualification,
          hospital,
          field,
        },
      });

      return NextResponse.json({
        message: "Doctor registered successfully",
        doctor,
      });
    } else {
      const existing = await prisma.patient.findUnique({ where: { email } });
      if (existing)
        return NextResponse.json(
          { error: "Patient already registered" },
          { status: 400 }
        );

      const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase();

      const patient = await prisma.patient.create({
        data: { name, email, password: hashedPassword, uniqueId },
      });

      return NextResponse.json({
        message: "Patient registered successfully",
        patient,
      });
    }
  } catch (err: unknown) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
