import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. Frontend'dan kelayotgan ma'lumotlarni o'qiymiz
    const body = await req.json();
    const { name, description, lat, lng } = body;

    /** * 2. MUHIM: Haqiqiy loyihada centerId ni sessiyadan (Auth) olish kerak.
     * Hozircha biz test rejimida birinchi markazni yangilaymiz 
     * yoki centerId ni ham body'dan olishingiz mumkin.
     */
    
    // Auth qo'shilmaguncha vaqtinchalik mantiq:
    const center = await prisma.center.findFirst();

    if (!center) {
      return NextResponse.json(
        { error: "Markaz topilmadi" }, 
        { status: 404 }
      );
    }

    // 3. Ma'lumotlarni bazada yangilash
    const updatedCenter = await prisma.center.update({
      where: { id: center.id },
      data: {
        name: name,
        description: description,
        latitude: lat,  // Prisma'dagi maydon nomi latitude
        longitude: lng, // Prisma'dagi maydon nomi longitude
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ma'lumotlar saqlandi",
      data: updatedCenter
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Ichki server xatosi", details: error.message }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}