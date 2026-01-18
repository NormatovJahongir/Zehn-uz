import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const user = await prisma.user.findUnique({ where: { username } });

  if (user && await bcrypt.compare(password, user.password)) {
    // Bu yerda xavfsizlik uchun JWT token yoki Session ishlatish kerak
    return NextResponse.json({ 
      success: true, 
      centerId: user.centerId, 
      role: user.role 
    });
  }

  return NextResponse.json({ error: "Login yoki parol xato" }, { status: 401 });
}