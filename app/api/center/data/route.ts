import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, price, phone, centerId } = body;

    // centerId majburiyligini tekshirish
    if (!centerId) {
      return NextResponse.json({ error: 'Center ID topilmadi' }, { status: 400 });
    }

    let result;
    // Tasodifiy son username takrorlanmasligi uchun
    const randomId = Math.floor(Math.random() * 1000);

    switch (type) {
      case 'subjects':
        result = await prisma.subject.create({
          data: { 
            name, 
            price: parseFloat(price) || 0, 
            centerId 
          }
        });
        break;
      
      case 'teachers':
        result = await prisma.user.create({
          data: { 
            firstName: name, 
            role: 'TEACHER', 
            phone: phone || null,
            // User modelidagi majburiy maydonlar:
            username: `teacher_${randomId}_${Date.now()}`,
            password: await bcrypt.hash('teacher123', 10),
            center: {
              connect: { id: centerId } // centerId ni bog'lashning xavfsiz usuli
            }
          }
        });
        break;

      case 'students':
        result = await prisma.user.create({
          data: { 
            firstName: name, 
            role: 'STUDENT', 
            phone: phone || null,
            // User modelidagi majburiy maydonlar:
            username: `student_${randomId}_${Date.now()}`,
            password: await bcrypt.hash('student123', 10),
            center: {
              connect: { id: centerId }
            }
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Noto\'g\'ri tur' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    console.error("Data API Error:", err);
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 });
  }
}
