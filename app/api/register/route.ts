import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as z from 'zod';

const prisma = new PrismaClient();

const registerSchema = z.object({
  telegramId: z.string().min(1, 'Telegram ID is required'),
  centerName: z.string().min(2, 'Markaz nomi kamida 2 ta harf bo\'lishi kerak'),
  adminName: z.string().min(2, 'Admin ismi kamida 2 ta harf bo\'lishi kerak'),
  phone: z.string().min(7, 'Telefon raqami noto\'g\'ri'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);

    // 1. Markazni yaratish
    const newCenter = await prisma.center.create({
      data: {
        name: parsed.centerName,
      }
    });

    // 2. Foydalanuvchini ADMIN darajasiga ko'tarish va markazga bog'lash
    await prisma.user.update({
      where: { telegramId: parsed.telegramId },
      data: {
        firstName: parsed.adminName,
        role: 'ADMIN',
        centerId: newCenter.id,
      }
    });

    return NextResponse.json({ 
      success: true,
      message: `Markaz muvaffaqiyatli ro'yxatdan o'tkazildi`, 
      centerId: newCenter.id 
    }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ma\'lumotlar xato kiritildi' }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 });
  }
}
