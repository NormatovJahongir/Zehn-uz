# 📂 LOYIHA STRUKTURASI

...
zehn-uz/
├── app/                        # Next.js App Router (Sahifalar va API)
│   ├── (auth)/                 # Login, Register, Password Recovery
│   ├── (dashboard)/            # Dashboard qismlari (Role-based)
│   │   ├── admin/              # Super Admin paneli
│   │   ├── center/             # O'quv markazi admin paneli
│   │   ├── teacher/            # O'qituvchi paneli
│   │   └── student/            # Talaba shaxsiy kabineti
│   ├── api/                    # Backend API Route-lar
│   │   ├── auth/               # NextAuth/JWT konfiguratsiyasi
│   │   ├── attendance/         # QR-kod va davomat API
│   │   └── payments/           # To'lov tizimlari integratsiyasi
│   ├── centers/                # Markazlar ro'yxati va qidiruv (Public)
│   └── layout.tsx              # Global Layout
├── components/                 # Qayta ishlatiladigan UI komponentlar
│   ├── common/                 # Button, Input, Modal kabi kichik UI
│   ├── dashboard/              # Panel uchun maxsus komponentlar
│   ├── maps/                   # Google/Yandex Maps (Centers location)
│   └── shared/                 # Navbar, Footer
├── lib/                        # Yordamchi funksiyalar (Utils)
│   ├── prisma.ts               # Prisma Client instance
│   ├── utils.ts                # Formatlash va umumiy funksiyalar
│   └── telegram-bot.ts         # Bot bilan aloqa qilish logikasi
├── prisma/                     # Database Schema va Migrations
│   └── schema.prisma           # Asosiy DB sxemasi
├── public/                     # Static fayllar (Logolar, Rasmlar)
├── store/                      # State Management (Zustand yoki Redux)
├── types/                      # TypeScript interfeyslari
└── .env                        # Maxfiy kalitlar (DB_URL, BOT_TOKEN)
...

## 🗃 Ma'lumotlar Bazasi Strukturasi

### Asosiy Jadvallar:

1. **users** - Barcha foydalanuvchilar
   - Rollari: super_admin, center_admin, teacher, student, guest
   - Fields: id, telegram_id, username, full_name, email, password, role, language, status

2. **centers** - O'quv markazlari
   - Fields: id, name, description, address, latitude, longitude, phone, email, website, logo, admin_id, rating, student_count, review_count, avg_results, status

3. **subjects** - Fanlar/Kurslar
   - Fields: id, center_id, name, description, price, duration_months, status

4. **teachers** - O'qituvchilar
   - Fields: id, user_id, center_id, subject_id, experience_years, bio, kpi_successful_students, kpi_dropout_students, kpi_rating, status

5. **enrollments** - O'quvchilar ro'yxati
   - Fields: id, student_id, center_id, subject_id, teacher_id, enrollment_date, end_date, status

6. **payments** - To'lovlar
   - Fields: id, enrollment_id, student_id, center_id, amount, payment_type, payment_method, payment_date, due_date, status

7. **attendance** - Davomat
   - Fields: id, enrollment_id, student_id, subject_id, date, status, qr_code, marked_by

8. **results** - Test natijalari
   - Fields: id, student_id, subject_id, test_name, score, max_score, percentage, test_date

9. **reviews** - Sharhlar va reytinglar
   - Fields: id, center_id, user_id, rating, comment, status

10. **notifications** - Bildirishnomalar
    - Fields: id, user_id, type, title, message, send_via, status, scheduled_at, sent_at

11. **bot_states** - Bot holatlari
    - Fields: telegram_id, state, data, updated_at
