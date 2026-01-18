import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Ma'lumotlarni olish (Dashboard yuklanganda ishlaydi)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const centerId = searchParams.get('centerId');

    if (!centerId) {
      return NextResponse.json({ error: 'Center ID topilmadi' }, { status: 400 });
    }

    // Markazga tegishli barcha ma'lumotlarni parallel ravishดา tortish
    const [subjects, teachers, students] = await Promise.all([
      prisma.subject.findMany({ where: { centerId } }),
      prisma.user.findMany({ where: { centerId, role: 'TEACHER' } }),
      prisma.user.findMany({ where: { centerId, role: 'STUDENT' } }),
    ]);

    return NextResponse.json({
      success: true,
      subjects,
      teachers,
      students
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Ma\'lumotlarni yuklashda xatolik' }, { status: 500 });
  }
}

// 2. Yangi ma'lumot qo'shish (Forma yuborilganda ishlaydi)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, price, phone, centerId } = body;

    if (!centerId || !type || !name) {
      return NextResponse.json({ error: 'Majburiy maydonlar to\'ldirilmagan' }, { status: 400 });
    }

    let result;

    // Turiga qarab tegishli jadvalga saqlash
    switch (type) {
      case 'subjects':
        result = await prisma.subject.create({
          data: {
            name: name,
            price: parseFloat(price) || 0,
            centerId: centerId
          }
        });
        break;

      case 'teachers':
        result = await prisma.user.create({
          data: {
            firstName: name,
            role: 'TEACHER',
            centerId: centerId,
            // lastName yoki phone kabi maydonlarni ham schemaga qarab qo'shish mumkin
          }
        });
        break;

      case 'students':
        result = await prisma.user.create({
          data: {
            firstName: name,
            role: 'STUDENT',
            centerId: centerId
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Noto\'g\'ri ma\'lumot turi' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });

  } catch (error) {
    console.error('Create error:', error);
    return NextResponse.json({ error: 'Saqlashda ichki xatolik yuz berdi' }, { status: 500 });
  }
}
