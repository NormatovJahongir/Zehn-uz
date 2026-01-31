import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { lat, lng, centerId } = await req.json();

    const updatedCenter = await prisma.center.update({
      where: { id: centerId }, // Qaysi markaz ekanligini bildirish shart
      data: {
        latitude: lat,
        longitude: lng,
      },
    });

    return NextResponse.json({ success: true, updatedCenter });
  } catch (error) {
    return NextResponse.json({ error: "Saqlashda xatolik" }, { status: 500 });
  }
}