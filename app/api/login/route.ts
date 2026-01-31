import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1. Foydalanuvchini topamiz va unga bog'langan markazni ham qo'shib olamiz (include)
    const user = await prisma.user.findUnique({ 
      where: { username },
      include: { 
        center: true // Markaz nomi va koordinatalarini olish uchun shart
      }
    });

    // 2. Foydalanuvchi mavjudligi va parolni tekshiramiz
    if (user && await bcrypt.compare(password, user.password)) {
      
      // 3. Frontendga kerakli barcha ma'lumotlarni qaytaramiz
      return NextResponse.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          role: user.role,
          centerId: user.centerId,
          centerName: user.center?.name || "Noma'lum markaz"
        }
      });
    }

    return NextResponse.json(
      { error: "Login yoki parol xato" }, 
      { status: 401 }
    );

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Serverda xatolik yuz berdi" }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
