import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Sozlamalar sahifasi ochilganda ma'lumotlarni bazadan olib kelish uchun
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const centerId = searchParams.get('centerId');

    if (!centerId) {
      return NextResponse.json({ error: "Center ID talab qilinadi" }, { status: 400 });
    }

    const center = await prisma.center.findUnique({
      where: { id: centerId }
    });

    return NextResponse.json(center);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Ma'lumotlarni yangilash uchun
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, lat, lng } = body;

    // 1. ID borligini tekshiramiz (Hamma o'z markazini tahrirlashi uchun)
    if (!id) {
      return NextResponse.json(
        { error: "Markaz identifikatori (ID) topilmadi" }, 
        { status: 400 }
      );
    }

    // 2. Ma'lumotlarni bazada aynan shu ID orqali yangilash
    const updatedCenter = await prisma.center.update({
      where: { id: id },
      data: {
        name: name,
        description: description,
        latitude: parseFloat(lat),  // Son ekanligiga ishonch hosil qilamiz
        longitude: parseFloat(lng), // Son ekanligiga ishonch hosil qilamiz
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ma'lumotlar muvaffaqiyatli saqlandi",
      data: updatedCenter
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Saqlashda xatolik yuz berdi", details: error.message }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
