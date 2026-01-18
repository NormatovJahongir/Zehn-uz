import { NextResponse } from 'next/server';
import * as z from 'zod';
// Bu yerda o'z ma'lumotlar bazangiz ulanishini chaqirasiz
// import { db } from '@/lib/db'; 

// Telegram orqali ro'yxatdan o'tish sxemasi
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

    /* TODO: Ma'lumotlar bazasiga saqlash logikasi.
      Masalan, MongoDB (Mongoose) yoki Prisma bilan:
      
      const newCenter = await db.center.create({
        data: {
          telegramId: parsed.telegramId,
          name: parsed.centerName,
          adminName: parsed.adminName,
          phone: parsed.phone,
        }
      });
    */

    // Demo javob (Hozircha bazaga ulanmagan bo'lsangiz)
    const mockCenterId = "center_" + Math.random().toString(36).substr(2, 9);

    return NextResponse.json({ 
      message: 'Markaz muvaffaqiyatli ro\'yxatdan o'tkazildi', 
      centerId: mockCenterId // Bu ID UI-da /center/[id] ga o'tish uchun ishlatiladi
    }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Ma\'lumotlar xato kiritildi', 
        details: err.errors 
      }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 });
  }
}
