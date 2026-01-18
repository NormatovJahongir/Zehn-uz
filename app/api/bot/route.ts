import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Parolni hash qilish uchun

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
          // Default parol yaratish (telegramId asosida)
          const defaultPassword = await bcrypt.hash(userId, 10);
          
          dbUser = await prisma.user.create({
            data: {
              telegramId: userId,
              firstName: from.first_name || "Foydalanuvchi",
              lastName: from.last_name || "",
              role: 'STUDENT', // Default rol
              // MAJBURIY MAYDONLAR QO'SHILDI
              username: from.username || `user_${userId}`, 
              password: defaultPassword,
            }
          });
          console.log("Yangi foydalanuvchi yaratildi:", userId);
        } catch (dbErr) {
          console.error("Bazaga yozishda xato:", dbErr);
        }
      }

      // 3. Javob xabari va Web App tugmasi mantiqi
      let webAppUrl = `${WEB_APP_URL}/register`;
      let buttonText = "📝 Ro'yxatdan o'tish";

      // Agar foydalanuvchi admin bo'lsa va markazi bo'lsa, dashboardga yuboramiz
      if (dbUser?.role === 'ADMIN' && dbUser.centerId) {
        webAppUrl = `${WEB_APP_URL}/center/${dbUser.centerId}`;
        buttonText = "📊 Boshqaruv paneli";
      }

      const welcomeMessage = dbUser?.centerId 
        ? `Xush kelibsiz, ${dbUser.firstName}! Markazingiz boshqaruv paneliga kirishingiz mumkin.` 
        : `Assalomu alaykum! O'quv markazingizni ro'yxatdan o'tkazish uchun quyidagi tugmani bosing:`;

      await tg('sendMessage', {
        chat_id: chatId,
        text: welcomeMessage,
        reply_markup: {
          inline_keyboard: [[
            { 
              text: buttonText, 
              web_app: { url: webAppUrl } 
            }
          ]]
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bot API Error:", error);
    return NextResponse.json({ ok: true }); 
  }
}
