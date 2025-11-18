import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { uniqueId: string } }
) {
  try {
    const { uniqueId } = await params;

    // ✅ Find patient by their uniqueId
    const patient = await prisma.patient.findUnique({
      where: { uniqueId },
      select: {
        id: true,
        name: true,
        email: true,
        uniqueId: true,
        age: true,
        gender: true,
        dob: true,
        records: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            recordType: true,
            data: true,
            attachments: true,
            createdAt: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ patient }, { status: 200 });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * 🩺 POST /api/patient/[uniqueId]
 * Used by a doctor to add a new checkup record for a patient.
 */
export async function POST(
  req: Request,
  { params }: { params: { uniqueId: string } }
) {
  try {
    const { uniqueId } = await params;
    const body = await req.json();
    const { subject, images, doctorId } = body;

    if (!subject || !images || images.length === 0 || !doctorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Find patient by unique ID
    const patient = await prisma.patient.findUnique({
      where: { uniqueId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // ✅ Create a new medical record for the patient
    const newRecord = await prisma.record.create({
      data: {
        patientId: patient.id,
        doctorId,
        recordType: subject,
        data: { subject, images },
        attachments: JSON.stringify(images),
      },
    });

    // Optional: log this action in AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: doctorId,
        action: "ADD_PATIENT_RECORD",
        targetId: patient.id,
        details: {
          subject,
          attachmentsCount: images.length,
        },
      },
    });

    return NextResponse.json(
      { message: "Record added successfully", record: newRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding patient record:", error);
    return NextResponse.json(
      { error: "Failed to add patient record" },
      { status: 500 }
    );
  }
}
