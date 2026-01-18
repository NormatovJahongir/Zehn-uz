import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, price, phone, centerId, specialization, subjectId } = body;

    let result;

    switch (type) {
      case 'subjects':
        result = await prisma.subject.create({
          data: { name, price: parseFloat(price), centerId }
        });
        break;
      
      case 'teachers':
        result = await prisma.user.create({
          data: { 
            firstName: name, 
            role: 'TEACHER', 
            centerId,
            // phone va specialization uchun Prisma schemada maydonlar bo'lishi kerak
          }
        });
        break;

      case 'students':
        result = await prisma.user.create({
          data: { 
            firstName: name, 
            role: 'STUDENT', 
            centerId,
            // subjectId (qaysi kursga yozilgani)
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Noto\'g\'ri tur' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Serverda xatolik' }, { status: 500 });
  }
}