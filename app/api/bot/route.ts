import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = "https://edu-market.onrender.com";

async function tg(method: string, body: object) {
  return fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!payload.message) return NextResponse.json({ ok: true });

    const chatId = payload.message.chat.id;
    const text = payload.message.text;
    const from = payload.message.from;
    const userId = from.id.toString();

    // 1. Foydalanuvchini bazadan qidirish
    let dbUser = await prisma.user.findUnique({
      where: { telegramId: userId }
    });

    // 2. Start buyrug'i kelganda
    if (text === '/start') {
      if (!dbUser) {
        // AGAR FOYDALANUVCHI BO'LMASA -> BAZAGA QO'SHISH
        try {
          dbUser = await prisma.user.create({
            data: {
              telegramId: userId,
              firstName: from.first_name || "Foydalanuvchi",
              lastName: from.last_name || "",
              role: 'STUDENT', // Default rol
            }
          });
          console.log("Yangi foydalanuvchi yaratildi:", userId);
        } catch (dbErr) {
          console.error("Bazaga yozishda xato:", dbErr);
          // Agar bazaga yozishda xato bo'lsa ham xabar yuboramiz
        }
      }

      // 3. Javob xabari
      const welcomeMessage = dbUser 
        ? `Xush kelibsiz, ${dbUser.firstName}! Siz tizimda ro'yxatdan o'tgansiz.` 
        : `Assalomu alaykum! Markazingizni ro'yxatdan o'tkazish uchun quyidagi tugmani bosing:`;

      await tg('sendMessage', {
        chat_id: chatId,
        text: welcomeMessage,
        reply_markup: {
          inline_keyboard: [[
            { 
              text: dbUser?.role === 'ADMIN' ? "🌐 Boshqaruv paneli" : "📝 Ro'yxatdan o'tish", 
              web_app: { url: dbUser?.role === 'ADMIN' ? WEB_APP_URL : `${WEB_APP_URL}/register` } 
            }
          ]]
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Render Logs bo'limida ko'rinadi
    console.error("Bot API Error:", error);
    return NextResponse.json({ ok: true }); // Telegramga har doim 200 qaytargan ma'qul, aks holda qayta-qayta yuboraveradi
  }
}
