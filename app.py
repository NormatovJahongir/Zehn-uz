import os
import sqlite3
import hashlib
import json
import threading
from functools import wraps
from datetime import datetime, timedelta
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash

# Ma'lumotlar bazasi funksiyalari
from database import get_db, init_db

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'edumarket_secret_key_2025')
app.config['UPLOAD_FOLDER'] = 'uploads/centers'

# --- 1. KO'P TILLI TIZIM (TRANSLATIONS) ---
TRANSLATIONS = {
    'uz': {
        'welcome': 'Xush kelibsiz', 'login': 'Kirish', 'logout': 'Chiqish',
        'dashboard': 'Boshqaruv paneli', 'centers': 'O\'quv markazlari',
        'students': 'O\'quvchilar', 'teachers': 'O\'qituvchilar',
        'payments': 'To\'lovlar', 'attendance': 'Davomat',
        'results': 'Natijalar', 'search_centers': 'Markazlarni qidirish',
        'rating': 'Reyting', 'location': 'Joylashuv', 'contact': 'Aloqa',
        'enroll': 'Ro\'yxatdan o\'tish', 'marketplace': 'Bozor', 'map': 'Xarita',
    },
    'ru': {
        'welcome': 'Добро пожаловать', 'login': 'Войти', 'logout': 'Выйти',
        'dashboard': 'Панель управления', 'centers': 'Учебные центры',
        'students': 'Студенты', 'teachers': 'Учителя',
        'payments': 'Платежи', 'attendance': 'Посещаемость',
        'results': 'Результаты', 'search_centers': 'Поиск центров',
        'rating': 'Рейтинг', 'location': 'Местоположение', 'contact': 'Контакт',
        'enroll': 'Записаться', 'marketplace': 'Маркетплейс', 'map': 'Карта',
    }
}

@app.context_processor
def inject_translations():
    lang = request.args.get('lang') or session.get('language') or 'uz'
    session['language'] = lang
    return dict(t=TRANSLATIONS.get(lang, TRANSLATIONS['uz']), current_lang=lang)

# --- 2. DEKORATORLAR (XAVFSIZLIK) ---
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Iltimos avval tizimga kiring!', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        if session.get('role') not in ['super_admin', 'center_admin']:
            flash('Sizda ruxsat yo\'q!', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

# --- 3. PUBLIC ROUTES ---
@app.route('/')
def index():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c.*, 
               (SELECT COUNT(id) FROM enrollments WHERE center_id = c.id AND status = 'active') as total_students,
               (SELECT COUNT(id) FROM subjects WHERE center_id = c.id AND status = 'active') as total_subjects
        FROM centers c
        WHERE c.status = 'active'
        ORDER BY c.rating DESC
    ''')
    centers = cursor.fetchall()
    conn.close()
    return render_template('marketplace.html', centers=centers)

@app.route('/center/<int:center_id>')
def center_detail(center_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM centers WHERE id = ?', (center_id,))
    center = cursor.fetchone()
    
    if not center:
        conn.close()
        flash('Markaz topilmadi!', 'error')
        return redirect(url_for('index'))
    
    subjects = conn.execute('SELECT * FROM subjects WHERE center_id = ? AND status = "active"', (center_id,)).fetchall()
    teachers = conn.execute('''
        SELECT t.*, u.full_name, s.name as subject_name FROM teachers t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE t.center_id = ? AND t.status = 'active'
    ''', (center_id,)).fetchall()
    
    conn.close()
    return render_template('center_detail.html', center=center, subjects=subjects, teachers=teachers)

# --- 4. AUTH ROUTES ---
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        conn = get_db()
        user = conn.execute('SELECT * FROM users WHERE username = ? AND password = ? AND status = "active"',
                           (username, password_hash)).fetchone()
        conn.close()
        
        if user:
            session.update({'user_id': user['id'], 'username': user['username'], 
                            'role': user['role'], 'full_name': user['full_name']})
            return redirect(url_for('admin_dashboard' if user['role'] in ['super_admin', 'center_admin'] else 'student_dashboard'))
        flash('Login yoki parol noto\'g\'ri!', 'danger')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

# --- 5. ADMIN DASHBOARD ---
@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    conn = get_db()
    cursor = conn.cursor()
    role = session.get('role')
    user_id = session.get('user_id')

    # Muhim: avg_results xatosini oldini olish uchun SQLda hisoblaymiz
    if role == 'super_admin':
        centers = conn.execute('''
            SELECT c.*, 
            (SELECT COUNT(*) FROM enrollments WHERE center_id = c.id) as student_count,
            (SELECT AVG(score) FROM results r JOIN subjects s ON r.subject_id = s.id WHERE s.center_id = c.id) as avg_results
            FROM centers c
        ''').fetchall()
        
        stats = {
            'total_centers': conn.execute('SELECT COUNT(*) FROM centers').fetchone()[0],
            'total_students': conn.execute('SELECT COUNT(*) FROM users WHERE role="student"').fetchone()[0],
            'total_teachers': conn.execute('SELECT COUNT(*) FROM users WHERE role="teacher"').fetchone()[0],
            'total_revenue': conn.execute('SELECT SUM(amount) FROM payments WHERE status="paid"').fetchone()[0] or 0
        }
    else:
        # Center Admin mantiqi
        center = conn.execute('SELECT * FROM centers WHERE admin_id = ?', (user_id,)).fetchone()
        centers = [center] if center else []
        stats = {} # O'z markazi statistikasi

    conn.close()
    return render_template('admin_dashboard.html', centers=centers, stats=stats, role=role)

# --- 6. API ROUTES (TELEGRAM BOT UCHUN) ---
@app.route('/api/user/register', methods=['POST'])
def api_register_user():
    data = request.json
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (telegram_id, full_name, phone, role, language, status)
            VALUES (?, ?, ?, 'student', ?, 'active')
        ''', (data['telegram_id'], data['full_name'], data.get('phone'), data.get('language', 'uz')))
        conn.commit()
        return jsonify({'success': True, 'user_id': cursor.lastrowid})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    finally:
        conn.close()

# --- 7. BOTNI ISHGA TUSHIRISH (MULTITHREADING) ---
def start_bot():
    try:
        from telegram_bot import main as run_bot
        run_bot()
    except Exception as e:
        print(f"Botni ishga tushirishda xatolik: {e}")

# Renderda bot va sayt birga ishlashi uchun oqimga olamiz
bot_thread = threading.Thread(target=start_bot, daemon=True)
bot_thread.start()

# --- 8. START APP ---
if __name__ == '__main__':
    init_db() # Jadvallarni yaratish
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
