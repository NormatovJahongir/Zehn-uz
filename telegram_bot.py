import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ContextTypes, ConversationHandler
import requests
import json
import sqlite3

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Bot Configuration
BOT_TOKEN = "8383832866:AAHr35OWeBfuKdbnSLRq_rqAmKXytns2Z2s"  # Replace with your bot token
WEB_APP_URL = "http://edu-market.onrender.com"  # Replace with your web app URL

# Conversation states
LANGUAGE, REGISTER_NAME, REGISTER_PHONE, MAIN_MENU = range(4)

# Multilingual texts
TEXTS = {
    'uz': {
        'welcome': '🎓 EduMarket & Management System ga xush kelibsiz!\n\nTilni tanlang:',
        'select_language': 'Tilni tanlang:',
        'language_selected': '✅ Til o\'zbekcha qilib o\'rnatildi',
        'enter_name': 'Iltimos, to\'liq ismingizni kiriting:',
        'enter_phone': 'Iltimos, telefon raqamingizni kiriting yoki "Telefon yuborish" tugmasini bosing:',
        'registration_complete': '✅ Ro\'yxatdan o\'tish muvaffaqiyatli tugallandi!\n\n👋 Xush kelibsiz, {name}!',
        'main_menu': '📱 Asosiy menyu:\n\nKerakli bo\'limni tanlang:',
        'search_centers': '🔍 O\'quv markazlarini qidirish',
        'my_courses': '📚 Mening kurslarim',
        'my_payments': '💳 To\'lovlarim',
        'my_results': '📊 Natijalarim',
        'settings': '⚙️ Sozlamalar',
        'marketplace': '🏪 Bozorga o\'tish',
        'find_on_map': '🗺 Xaritada topish',
        'back': '◀️ Orqaga',
        'centers_list': '📋 O\'quv markazlari ro\'yxati:',
        'no_centers': 'Hozircha markazlar topilmadi',
        'center_info': '''
🏢 <b>{name}</b>

⭐️ Reyting: {rating}/100
👥 O'quvchilar: {students} ta
📍 Manzil: {address}
📞 Telefon: {phone}

📝 {description}
        ''',
        'view_subjects': '📚 Fanlar',
        'view_teachers': '👨‍🏫 O\'qituvchilar',
        'enroll_now': '✅ Ro\'yxatdan o\'tish',
        'share_location': '📍 Joylashuvni yuborish',
    },
    'ru': {
        'welcome': '🎓 Добро пожаловать в EduMarket & Management System!\n\nВыберите язык:',
        'select_language': 'Выберите язык:',
        'language_selected': '✅ Язык установлен на русский',
        'enter_name': 'Пожалуйста, введите ваше полное имя:',
        'enter_phone': 'Пожалуйста, введите ваш номер телефона или нажмите "Отправить телефон":',
        'registration_complete': '✅ Регистрация успешно завершена!\n\n👋 Добро пожаловать, {name}!',
        'main_menu': '📱 Главное меню:\n\nВыберите раздел:',
        'search_centers': '🔍 Поиск учебных центров',
        'my_courses': '📚 Мои курсы',
        'my_payments': '💳 Мои платежи',
        'my_results': '📊 Мои результаты',
        'settings': '⚙️ Настройки',
        'marketplace': '🏪 Перейти в маркетплейс',
        'find_on_map': '🗺 Найти на карте',
        'back': '◀️ Назад',
        'centers_list': '📋 Список учебных центров:',
        'no_centers': 'Центры пока не найдены',
        'center_info': '''
🏢 <b>{name}</b>

⭐️ Рейтинг: {rating}/100
👥 Студентов: {students}
📍 Адрес: {address}
📞 Телефон: {phone}

📝 {description}
        ''',
        'view_subjects': '📚 Предметы',
        'view_teachers': '👨‍🏫 Учителя',
        'enroll_now': '✅ Записаться',
        'share_location': '📍 Отправить местоположение',
    },
    'en': {
        'welcome': '🎓 Welcome to EduMarket & Management System!\n\nSelect language:',
        'select_language': 'Select language:',
        'language_selected': '✅ Language set to English',
        'enter_name': 'Please enter your full name:',
        'enter_phone': 'Please enter your phone number or tap "Send Phone":',
        'registration_complete': '✅ Registration completed successfully!\n\n👋 Welcome, {name}!',
        'main_menu': '📱 Main Menu:\n\nSelect an option:',
        'search_centers': '🔍 Search Centers',
        'my_courses': '📚 My Courses',
        'my_payments': '💳 My Payments',
        'my_results': '📊 My Results',
        'settings': '⚙️ Settings',
        'marketplace': '🏪 Go to Marketplace',
        'find_on_map': '🗺 Find on Map',
        'back': '◀️ Back',
        'centers_list': '📋 Centers List:',
        'no_centers': 'No centers found yet',
        'center_info': '''
🏢 <b>{name}</b>

⭐️ Rating: {rating}/100
👥 Students: {students}
📍 Address: {address}
📞 Phone: {phone}

📝 {description}
        ''',
        'view_subjects': '📚 Subjects',
        'view_teachers': '👨‍🏫 Teachers',
        'enroll_now': '✅ Enroll Now',
        'share_location': '📍 Share Location',
    }
}

def get_db():
    """Get database connection"""
    conn = sqlite3.connect('../edumarket.db')
    conn.row_factory = sqlite3.Row
    return conn

def get_user_language(user_id):
    """Get user's preferred language"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT language FROM users WHERE telegram_id = ?', (str(user_id),))
    result = cursor.fetchone()
    conn.close()
    return result['language'] if result else 'uz'

def t(user_id, key):
    """Get translation for user"""
    lang = get_user_language(user_id)
    return TEXTS.get(lang, TEXTS['uz']).get(key, key)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Start command handler"""
    user = update.effective_user
    
    # Check if user exists
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE telegram_id = ?', (str(user.id),))
    existing_user = cursor.fetchone()
    conn.close()
    
    if existing_user:
        # User exists, show main menu
        await show_main_menu(update, context)
        return ConversationHandler.END
    else:
        # New user, start registration
        keyboard = [
            [
                InlineKeyboardButton("🇺🇿 O'zbek", callback_data='lang_uz'),
                InlineKeyboardButton("🇷🇺 Русский", callback_data='lang_ru'),
                InlineKeyboardButton("🇬🇧 English", callback_data='lang_en')
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            TEXTS['uz']['welcome'],
            reply_markup=reply_markup
        )
        return LANGUAGE

async def language_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle language selection"""
    query = update.callback_query
    await query.answer()
    
    lang = query.data.split('_')[1]
    context.user_data['language'] = lang
    
    await query.edit_message_text(
        text=TEXTS[lang]['language_selected']
    )
    
    await query.message.reply_text(
        TEXTS[lang]['enter_name']
    )
    
    return REGISTER_NAME

async def register_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle name registration"""
    context.user_data['full_name'] = update.message.text
    lang = context.user_data.get('language', 'uz')
    
    # Request phone number
    keyboard = [
        [KeyboardButton(text="📱 Telefon yuborish", request_contact=True)]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True, one_time_keyboard=True)
    
    await update.message.reply_text(
        TEXTS[lang]['enter_phone'],
        reply_markup=reply_markup
    )
    
    return REGISTER_PHONE

async def register_phone(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle phone registration"""
    user = update.effective_user
    lang = context.user_data.get('language', 'uz')
    
    if update.message.contact:
        phone = update.message.contact.phone_number
    else:
        phone = update.message.text
    
    # Save user to database
    data = {
        'telegram_id': str(user.id),
        'full_name': context.user_data['full_name'],
        'phone': phone,
        'language': lang
    }
    
    try:
        response = requests.post(f'{WEB_APP_URL}/api/user/register', json=data)
        
        if response.status_code == 200:
            await update.message.reply_text(
                TEXTS[lang]['registration_complete'].format(name=data['full_name'])
            )
            await show_main_menu(update, context)
            return ConversationHandler.END
        else:
            await update.message.reply_text("❌ Xatolik yuz berdi. Qayta urinib ko'ring.")
            return REGISTER_PHONE
    except Exception as e:
        logger.error(f"Registration error: {e}")
        await update.message.reply_text("❌ Xatolik yuz berdi. Qayta urinib ko'ring.")
        return REGISTER_PHONE

async def show_main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show main menu"""
    user_id = update.effective_user.id
    
    keyboard = [
        [
            InlineKeyboardButton(t(user_id, 'search_centers'), callback_data='search_centers'),
        ],
        [
            InlineKeyboardButton(t(user_id, 'my_courses'), callback_data='my_courses'),
            InlineKeyboardButton(t(user_id, 'my_payments'), callback_data='my_payments'),
        ],
        [
            InlineKeyboardButton(t(user_id, 'my_results'), callback_data='my_results'),
            InlineKeyboardButton(t(user_id, 'settings'), callback_data='settings'),
        ],
        [
            InlineKeyboardButton(
                t(user_id, 'marketplace'), 
                web_app=WebAppInfo(url=WEB_APP_URL)
            ),
        ],
        [
            InlineKeyboardButton(
                t(user_id, 'find_on_map'), 
                web_app=WebAppInfo(url=f"{WEB_APP_URL}/map")
            ),
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    text = t(user_id, 'main_menu')
    
    if update.callback_query:
        await update.callback_query.message.reply_text(text, reply_markup=reply_markup)
    else:
        await update.message.reply_text(text, reply_markup=reply_markup)

async def search_centers(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Search and display centers"""
    query = update.callback_query
    await query.answer()
    
    user_id = update.effective_user.id
    
    try:
        response = requests.get(f'{WEB_APP_URL}/api/centers')
        centers = response.json()
        
        if not centers:
            await query.message.reply_text(t(user_id, 'no_centers'))
            return
        
        text = t(user_id, 'centers_list') + '\n\n'
        keyboard = []
        
        for center in centers[:10]:  # Show top 10
            keyboard.append([
                InlineKeyboardButton(
                    f"⭐️ {center['rating']:.1f} - {center['name']}", 
                    callback_data=f"center_{center['id']}"
                )
            ])
        
        keyboard.append([InlineKeyboardButton(t(user_id, 'back'), callback_data='main_menu')])
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.message.reply_text(text, reply_markup=reply_markup)
        
    except Exception as e:
        logger.error(f"Error fetching centers: {e}")
        await query.message.reply_text("❌ Xatolik yuz berdi.")

async def show_center_detail(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show center details"""
    query = update.callback_query
    await query.answer()
    
    user_id = update.effective_user.id
    center_id = query.data.split('_')[1]
    
    try:
        response = requests.get(f'{WEB_APP_URL}/api/center/{center_id}')
        data = response.json()
        
        center = data['center']
        
        text = t(user_id, 'center_info').format(
            name=center['name'],
            rating=center['rating'],
            students=center['student_count'],
            address=center['address'] or 'N/A',
            phone=center['phone'] or 'N/A',
            description=center['description'] or ''
        )
        
        keyboard = [
            [
                InlineKeyboardButton(t(user_id, 'view_subjects'), callback_data=f'subjects_{center_id}'),
                InlineKeyboardButton(t(user_id, 'view_teachers'), callback_data=f'teachers_{center_id}'),
            ],
            [
                InlineKeyboardButton(t(user_id, 'enroll_now'), callback_data=f'enroll_{center_id}'),
            ],
            [
                InlineKeyboardButton(t(user_id, 'back'), callback_data='search_centers'),
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.message.reply_text(text, reply_markup=reply_markup, parse_mode='HTML')
        
    except Exception as e:
        logger.error(f"Error fetching center details: {e}")
        await query.message.reply_text("❌ Xatolik yuz berdi.")

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle all button callbacks"""
    query = update.callback_query
    await query.answer()
    
    data = query.data
    
    if data == 'main_menu':
        await show_main_menu(update, context)
    elif data == 'search_centers':
        await search_centers(update, context)
    elif data.startswith('center_'):
        await show_center_detail(update, context)
    elif data == 'my_courses':
        await query.message.reply_text("📚 Sizning kurslaringiz: (Coming soon...)")
    elif data == 'my_payments':
        await query.message.reply_text("💳 Sizning to'lovlaringiz: (Coming soon...)")
    elif data == 'my_results':
        await query.message.reply_text("📊 Sizning natijalaringiz: (Coming soon...)")
    elif data == 'settings':
        await query.message.reply_text("⚙️ Sozlamalar: (Coming soon...)")

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Cancel conversation"""
    await update.message.reply_text('❌ Bekor qilindi.')
    return ConversationHandler.END
    
from database import init_db

def main():
    """Start the bot"""
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Conversation handler for registration
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler('start', start)],
        states={
            LANGUAGE: [CallbackQueryHandler(language_callback, pattern='^lang_')],
            REGISTER_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_name)],
            REGISTER_PHONE: [MessageHandler((filters.TEXT | filters.CONTACT) & ~filters.COMMAND, register_phone)],
        },
        fallbacks=[CommandHandler('cancel', cancel)],
    )
    
    application.add_handler(conv_handler)
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Start the bot
    logger.info("Bot started...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
