import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/patient/update
 * Called by the doctor dashboard to add a new record for a patient.
 */
export async function POST(req: Request) {
  try {
    const { uniqueId, subject, images, doctorId } = await req.json();

    // ✅ Validate input
    if (!uniqueId || !subject || !images?.length || !doctorId) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // ✅ Find patient by uniqueId
    const patient = await prisma.patient.findUnique({
      where: { uniqueId },
      select: { id: true, name: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found." },
        { status: 404 }
      );
    }

    // ✅ Create a new medical record
    const record = await prisma.record.create({
      data: {
        patientId: patient.id,
        doctorId,
        recordType: subject,
        data: { subject, images },
        attachments: JSON.stringify(images),
      },
    });

    // ✅ Add an audit log entry for traceability
    await prisma.auditLog.create({
      data: {
        actorId: doctorId,
        action: "CREATE_PATIENT_RECORD",
        targetId: patient.id,
        details: {
          subject,
          imageCount: images.length,
          patientName: patient.name,
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Record added successfully.", record },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating patient record:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
