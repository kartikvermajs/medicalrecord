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
  gender?: string;
  dob?: string;
  age?: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegisterRequest;

    console.log("🔍 Register Request:", {
      email: body.email,
      role: body.role,
      dob: body.dob,
    });

    const {
      name,
      email,
      password,
      role,
      qualification,
      hospital,
      field,
      gender,
      dob,
      age,
    } = body;

    if (!email || !password || !role || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Doctor registration
    if (role === "doctor") {
      const existing = await prisma.doctor.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "Doctor already registered" },
          { status: 400 }
        );
      }

      const doctor = await prisma.doctor.create({
        data: {
          name,
          email,
          password: hashedPassword,
          qualification,
          hospital,
          field,
          gender,
          age,
          dob: dob ? new Date(dob) : null,
        },
      });

      console.log("✔️ Doctor registered:", email);
      return NextResponse.json(
        { message: "Doctor registered successfully", doctor },
        { status: 201 }
      );
    }

    // Patient registration
    const existing = await prisma.patient.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Patient already registered" },
        { status: 400 }
      );
    }

    const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase();

    const patient = await prisma.patient.create({
      data: {
        name,
        email,
        password: hashedPassword,
        uniqueId,
        gender,
        age,
        dob: dob ? new Date(dob) : null,
      },
    });

    console.log("✔️ Patient registered:", email);
    return NextResponse.json(
      { message: "Patient registered successfully", patient },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Registration Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
