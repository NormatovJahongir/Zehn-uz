import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as z from 'zod';
import bcrypt from 'bcryptjs'; // Parolni shifrlash uchun

const prisma = new PrismaClient();

// Ma'lumotlarni tekshirish sxemasi (Zod)
const registerSchema = z.object({
  telegramId: z.string().optional(),
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

    // 1. Login (username) band emasligini tekshirish
    const existingUser = await prisma.user.findUnique({
      where: { username: parsed.username }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu login allaqachon band. Boshqa login tanlang.' }, 
        { status: 400 }
      );
    }

    // 2. Parolni shifrlash
    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    // 3. Tranzaksiya orqali bazaga yozish
    const result = await prisma.$transaction(async (tx) => {
      // Markaz yaratish
      const newCenter = await tx.center.create({
        data: {
          name: parsed.centerName,
          adminName: parsed.adminName,
          phone: parsed.phone,
        }
      });

      // Adminni yaratish yoki yangilash
      const user = await tx.user.upsert({
        where: { username: parsed.username },
        update: {
          telegramId: parsed.telegramId,
          password: hashedPassword,
          firstName: parsed.adminName,
          phone: parsed.phone,
          role: 'ADMIN',
          centerId: newCenter.id,
        },
        create: {
          username: parsed.username,
          password: hashedPassword,
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
      centerId: result.centerId,
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!" 
    }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Register Error:", err);
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 });
  }
}
