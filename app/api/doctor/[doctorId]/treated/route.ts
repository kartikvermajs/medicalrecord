import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ doctorId: string }> }
) {
  const { doctorId } = await ctx.params;

  const records = await prisma.record.findMany({
    where: { doctorId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      recordType: true,
      createdAt: true,
      data: true, // THIS RETURNS subject + images
      patient: {
        select: {
          name: true,
          uniqueId: true,
        },
      },
    },
  });

  return NextResponse.json({ records });
}
