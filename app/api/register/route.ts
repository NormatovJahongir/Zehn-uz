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

    // 1. Tranzaksiya ishlatamiz: Yo hamma amal bajariladi, yo hech biri.
    // Bu ma'lumotlar bazasida "yarimta" ma'lumot qolib ketmasligini ta'minlaydi.
    const result = await prisma.$transaction(async (tx) => {
      
      // 2. Markazni yaratish
      const newCenter = await tx.center.create({
        data: {
          name: parsed.centerName,
        }
      });

      // 3. Foydalanuvchini yangilash yoki yaratish (upsert)
      // Chunki foydalanuvchi botdan /start bosmagan bo'lsa ham, Web App'da ro'yxatdan o'ta olishi kerak
      const updatedUser = await tx.user.upsert({
        where: { telegramId: parsed.telegramId },
        update: {
          firstName: parsed.adminName,
          phone: parsed.phone, // Telefon raqamini saqlash qo'shildi
          role: 'ADMIN',
          centerId: newCenter.id,
        },
        create: {
          telegramId: parsed.telegramId,
          firstName: parsed.adminName,
          phone: parsed.phone,
          role: 'ADMIN',
          centerId: newCenter.id,
        }
      });

      return { centerId: newCenter.id };
    });

    return NextResponse.json({ 
      success: true,
      message: `Markaz muvaffaqiyatli ro'yxatdan o'tkazildi`, 
      centerId: result.centerId 
    }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Ma\'lumotlar xato kiritildi',
        details: err.errors 
      }, { status: 400 });
    }
    
    console.error("Registration Error:", err);
    return NextResponse.json({ 
      error: 'Serverda xatolik yuz berdi. Balki bu Telegram ID allaqachon banddir?' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
