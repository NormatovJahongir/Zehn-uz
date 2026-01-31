import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as z from 'zod';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Validatsiya sxemasi
const registerSchema = z.object({
  telegramId: z.string().optional().nullable(),
  centerName: z.string().min(2, "Markaz nomi juda qisqa"),
  adminName: z.string().min(2, "Ism juda qisqa"),
  username: z.string().min(4, "Login kamida 4 ta harf bo'lsin"),
  password: z.string().min(6, "Parol kamida 6 ta belgi bo'lsin"),
  phone: z.string().min(7, "Telefon raqami noto'g'ri"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);

    // 1. Username bandligini tekshirish
    const existingUser = await prisma.user.findUnique({
      where: { username: parsed.username }
    });

    if (existingUser && existingUser.telegramId !== parsed.telegramId) {
      return NextResponse.json(
        { error: 'Bu login allaqachon band. Boshqa login tanlang.' }, 
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    // 2. Tranzaksiya - Markaz va Userni birga yaratamiz
    const result = await prisma.$transaction(async (tx) => {
      // Markaz yaratish - MUHIM: Default koordinatalar qo'shildi (Xarita uchun)
      const newCenter = await tx.center.create({
        data: {
          name: parsed.centerName,
          // Agar bazangizda adminName/phone maydonlari Center modelida bo'lsa qolsin, 
          // bo'lmasa pastdagi User modelida saqlanadi
          latitude: 41.311081, // Toshkent default
          longitude: 69.240562,
        }
      });

      let user;
      const userData = {
        username: parsed.username,
        password: hashedPassword,
        firstName: parsed.adminName,
        phone: parsed.phone,
        role: 'ADMIN', // yoki 'OWNER' loyihangizga qarab
        centerId: newCenter.id,
      };

      if (parsed.telegramId) {
        user = await tx.user.upsert({
          where: { telegramId: parsed.telegramId },
          update: userData,
          create: { ...userData, telegramId: parsed.telegramId }
        });
      } else {
        user = await tx.user.create({
          data: userData
        });
      }

      return { centerId: newCenter.id, userId: user.id };
    });

    // 3. Muvaffaqiyatli javob
    return NextResponse.json({ 
      success: true, 
      centerId: result.centerId,
      userId: result.userId,
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!" 
    }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Register Error:", err);
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
