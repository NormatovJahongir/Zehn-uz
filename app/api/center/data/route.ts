import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// --- GET METODI QO'SHILDI ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const centerId = searchParams.get('centerId');

    if (!centerId) {
      return NextResponse.json({ error: 'Center ID topilmadi' }, { status: 400 });
    }

    // Markazga tegishli barcha ma'lumotlarni parallel ravishda yig'ib olish
    const [subjects, teachers, students] = await Promise.all([
      prisma.subject.findMany({ where: { centerId } }),
      prisma.user.findMany({ where: { centerId, role: 'TEACHER' } }),
      prisma.user.findMany({ where: { centerId, role: 'STUDENT' } }),
    ]);

    return NextResponse.json({
      subjects,
      teachers,
      students
    }, { status: 200 });

  } catch (err) {
    console.error("GET Data Error:", err);
    return NextResponse.json({ error: 'Maʼlumotlarni yuklashda xatolik' }, { status: 500 });
  }
}

// --- SIZNING MAVJUD POST METODINGIZ ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, price, phone, centerId } = body;

    if (!centerId) {
      return NextResponse.json({ error: 'Center ID topilmadi' }, { status: 400 });
    }

    let result;
    const randomId = Math.floor(Math.random() * 1000);

    switch (type) {
      case 'subjects':
        result = await prisma.subject.create({
          data: { name, price: parseFloat(price) || 0, centerId }
        });
        break;
      
      case 'teachers':
        result = await prisma.user.create({
          data: { 
            firstName: name, 
            role: 'TEACHER', 
            phone: phone || null,
            username: `teacher_${randomId}_${Date.now()}`,
            password: await bcrypt.hash('teacher123', 10),
            center: { connect: { id: centerId } }
          }
        });
        break;

      case 'students':
        result = await prisma.user.create({
          data: { 
            firstName: name, 
            role: 'STUDENT', 
            phone: phone || null,
            username: `student_${randomId}_${Date.now()}`,
            password: await bcrypt.hash('student123', 10),
            center: { connect: { id: centerId } }
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
