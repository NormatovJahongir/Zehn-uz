from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from functools import wraps
import hashlib
import json
from datetime import datetime, timedelta
from database import get_db, calculate_center_rating
import os

app = Flask(__name__)
app.secret_key = 'edumarket_secret_key_2025'
app.config['UPLOAD_FOLDER'] = 'uploads/centers'

# Multilingual support
TRANSLATIONS = {
    'uz': {
        'welcome': 'Xush kelibsiz',
        'login': 'Kirish',
        'logout': 'Chiqish',
        'dashboard': 'Boshqaruv paneli',
        'centers': 'O\'quv markazlari',
        'students': 'O\'quvchilar',
        'teachers': 'O\'qituvchilar',
        'payments': 'To\'lovlar',
        'attendance': 'Davomat',
        'results': 'Natijalar',
        'search_centers': 'Markazlarni qidirish',
        'rating': 'Reyting',
        'location': 'Joylashuv',
        'contact': 'Aloqa',
        'enroll': 'Ro\'yxatdan o\'tish',
        'marketplace': 'Bozor',
        'map': 'Xarita',
    },
    'ru': {
        'welcome': 'Добро пожаловать',
        'login': 'Войти',
        'logout': 'Выйти',
        'dashboard': 'Панель управления',
        'centers': 'Учебные центры',
        'students': 'Студенты',
        'teachers': 'Учителя',
        'payments': 'Платежи',
        'attendance': 'Посещаемость',
        'results': 'Результаты',
        'search_centers': 'Поиск центров',
        'rating': 'Рейтинг',
        'location': 'Местоположение',
        'contact': 'Контакт',
        'enroll': 'Записаться',
        'marketplace': 'Маркетплейс',
        'map': 'Карта',
    },
    'en': {
        'welcome': 'Welcome',
        'login': 'Login',
        'logout': 'Logout',
        'dashboard': 'Dashboard',
        'centers': 'Centers',
        'students': 'Students',
        'teachers': 'Teachers',
        'payments': 'Payments',
        'attendance': 'Attendance',
        'results': 'Results',
        'search_centers': 'Search Centers',
        'rating': 'Rating',
        'location': 'Location',
        'contact': 'Contact',
        'enroll': 'Enroll',
        'marketplace': 'Marketplace',
        'map': 'Map',
    }
}

def get_translation(lang='uz'):
    return TRANSLATIONS.get(lang, TRANSLATIONS['uz'])
    
# app.py ichiga qo'shing (masalan, login_required funksiyasidan keyin)

@app.context_processor
def inject_translations():
    # 1. Avval URL'dan lang parametrini tekshiradi (?lang=ru kabi)
    # 2. Agar u bo'lmasa, sessiyadagi tilni oladi
    # 3. Agar u ham bo'lmasa, default 'uz' tilini tanlaydi
    lang = request.args.get('lang') or session.get('language') or 'uz'
    
    # Tanlangan tilni sessiyada saqlab qo'yamiz, 
    # shunda keyingi sahifalarda ham shu tilda qoladi
    session['language'] = lang
    
    return dict(t=get_translation(lang), current_lang=lang)
    
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

# ============ PUBLIC ROUTES ============

@app.route('/')
def index():
    """Marketplace - public view for all users"""
    lang = request.args.get('lang', 'uz')
    conn = get_db()
    cursor = conn.cursor()
    
    # Get all active centers with ratings
    cursor.execute('''
        SELECT c.*, 
               COUNT(DISTINCT e.id) as total_students,
               COUNT(DISTINCT s.id) as total_subjects
        FROM centers c
        LEFT JOIN enrollments e ON c.id = e.center_id AND e.status = 'active'
        LEFT JOIN subjects s ON c.id = s.center_id AND s.status = 'active'
        WHERE c.status = 'active'
        GROUP BY c.id
        ORDER BY c.rating DESC
    ''')
    centers = cursor.fetchall()
    conn.close()
    
    return render_template('marketplace.html', 
                         centers=centers, 
                         lang=lang, 
                         t=get_translation(lang))

@app.route('/center/<int:center_id>')
def center_detail(center_id):
    """Center detail page"""
    lang = request.args.get('lang', 'uz')
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM centers WHERE id = ?', (center_id,))
    center = cursor.fetchone()
    
    if not center:
        flash('Markaz topilmadi!', 'error')
        return redirect(url_for('index'))
    
    # Get subjects
    cursor.execute('SELECT * FROM subjects WHERE center_id = ? AND status = "active"', (center_id,))
    subjects = cursor.fetchall()
    
    # Get teachers
    cursor.execute('''
        SELECT t.*, u.full_name, s.name as subject_name
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE t.center_id = ? AND t.status = 'active'
    ''', (center_id,))
    teachers = cursor.fetchall()
    
    # Get reviews
    cursor.execute('''
        SELECT r.*, u.full_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.center_id = ? AND r.status = 'approved'
        ORDER BY r.created_at DESC
        LIMIT 10
    ''', (center_id,))
    reviews = cursor.fetchall()
    
    conn.close()
    
    return render_template('center_detail.html',
                         center=center,
                         subjects=subjects,
                         teachers=teachers,
                         reviews=reviews,
                         lang=lang,
                         t=get_translation(lang))

@app.route('/map')
def map_view():
    """Interactive map view of all centers"""
    lang = request.args.get('lang', 'uz')
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, address, latitude, longitude, rating, student_count
        FROM centers
        WHERE status = 'active' AND latitude IS NOT NULL AND longitude IS NOT NULL
    ''')
    centers = cursor.fetchall()
    conn.close()
    
    centers_json = json.dumps([dict(c) for c in centers])
    
    return render_template('map.html',
                         centers_json=centers_json,
                         lang=lang,
                         t=get_translation(lang))

# ============ AUTH ROUTES ============

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM users 
            WHERE username = ? AND password = ? AND status = 'active'
        ''', (username, password_hash))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['full_name'] = user['full_name']
            session['role'] = user['role']
            session['language'] = user['language']
            
            flash(f'Xush kelibsiz, {user["full_name"]}!', 'success')
            
            if user['role'] in ['super_admin', 'center_admin']:
                return redirect(url_for('admin_dashboard'))
            else:
                return redirect(url_for('student_dashboard'))
        else:
            flash('Login yoki parol noto\'g\'ri!', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Tizimdan chiqdingiz!', 'info')
    return redirect(url_for('index'))

# ============ ADMIN DASHBOARD ============

@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    """Admin dashboard with analytics"""
    conn = get_db()
    cursor = conn.cursor()
    
    role = session.get('role')
    user_id = session.get('user_id')
    
    if role == 'super_admin':
        # Super admin sees all data
        cursor.execute('SELECT COUNT(*) as count FROM centers WHERE status = "active"')
        total_centers = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM users WHERE role = "student" AND status = "active"')
        total_students = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM users WHERE role = "teacher" AND status = "active"')
        total_teachers = cursor.fetchone()['count']
        
        cursor.execute('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = "paid"')
        total_revenue = cursor.fetchone()['total']
        
        cursor.execute('''
            SELECT c.*, COUNT(e.id) as students
            FROM centers c
            LEFT JOIN enrollments e ON c.id = e.center_id AND e.status = 'active'
            GROUP BY c.id
            ORDER BY c.rating DESC
            LIMIT 10
        ''')
        top_centers = cursor.fetchall()
        
    else:
        # Center admin sees only their center data
        cursor.execute('SELECT * FROM centers WHERE admin_id = ?', (user_id,))
        center = cursor.fetchone()
        
        if not center:
            flash('Sizga biriktirilgan markaz topilmadi!', 'warning')
            return redirect(url_for('index'))
        
        center_id = center['id']
        
        cursor.execute('SELECT COUNT(*) as count FROM enrollments WHERE center_id = ? AND status = "active"', (center_id,))
        total_students = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM teachers WHERE center_id = ? AND status = "active"', (center_id,))
        total_teachers = cursor.fetchone()['count']
        
        cursor.execute('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE center_id = ? AND status = "paid"', (center_id,))
        total_revenue = cursor.fetchone()['total']
        
        total_centers = 1
        top_centers = [center]
    
    # Recent payments
    if role == 'super_admin':
        cursor.execute('''
            SELECT p.*, u.full_name, c.name as center_name
            FROM payments p
            JOIN users u ON p.student_id = u.id
            JOIN centers c ON p.center_id = c.id
            ORDER BY p.created_at DESC
            LIMIT 10
        ''')
    else:
        cursor.execute('''
            SELECT p.*, u.full_name
            FROM payments p
            JOIN users u ON p.student_id = u.id
            WHERE p.center_id = ?
            ORDER BY p.created_at DESC
            LIMIT 10
        ''', (center_id,))
    
    recent_payments = cursor.fetchall()
    
    conn.close()
    
    return render_template('admin_dashboard.html',
                         total_centers=total_centers,
                         total_students=total_students,
                         total_teachers=total_teachers,
                         total_revenue=total_revenue,
                         top_centers=top_centers,
                         recent_payments=recent_payments,
                         role=role)

@app.route('/admin/add_admin', methods=['GET', 'POST'])
@admin_required
def add_admin():
    if session.get('role') != 'super_admin':
        flash('Sizda bu amal uchun ruxsat yo\'q!', 'danger')
        return redirect(url_for('admin_dashboard'))

    if request.method == 'POST':
        full_name = request.form.get('full_name')
        username = request.form.get('username')
        password = request.form.get('password')
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            # 1. Adminni 'users' jadvaliga yaratish
            cursor.execute('''
                INSERT INTO users (full_name, username, password, role, status, language)
                VALUES (?, ?, ?, 'center_admin', 'active', 'uz')
            ''', (full_name, username, password_hash))
            
            # Yangi yaratilgan foydalanuvchining ID raqamini olamiz
            new_admin_id = cursor.lastrowid 
            
            # 2. Ushbu admin uchun 'centers' jadvalida avtomatik markaz yaratish
            # Bu qadam "Markaz topilmadi" xatosini oldini oladi
            cursor.execute('''
                INSERT INTO centers (name, admin_id, status, rating)
                VALUES (?, ?, 'active', 0)
            ''', (f"{full_name} markazi", new_admin_id))
            
            conn.commit()
            flash(f"Admin va u uchun yangi markaz muvaffaqiyatli yaratildi!", 'success')
            return redirect(url_for('admin_dashboard'))
            
        except Exception as e:
            conn.rollback() # Xatolik bo'lsa, o'zgarishlarni bekor qilish
            flash(f"Xatolik yuz berdi: Username band bo'lishi mumkin.", 'danger')
        finally:
            conn.close()

    lang = session.get('language', 'uz')
    return render_template('add_admin.html', t=get_translation(lang))
    
# ============ STUDENT DASHBOARD ============

@app.route('/student/dashboard')
@login_required
def student_dashboard():
    """Student personal dashboard"""
    user_id = session.get('user_id')
    conn = get_db()
    cursor = conn.cursor()
    
    # Get student enrollments
    cursor.execute('''
        SELECT e.*, c.name as center_name, s.name as subject_name, 
               u.full_name as teacher_name
        FROM enrollments e
        JOIN centers c ON e.center_id = c.id
        JOIN subjects s ON e.subject_id = s.id
        LEFT JOIN teachers t ON e.teacher_id = t.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE e.student_id = ?
        ORDER BY e.created_at DESC
    ''', (user_id,))
    enrollments = cursor.fetchall()
    
    # Get payments
    cursor.execute('''
        SELECT p.*, c.name as center_name
        FROM payments p
        JOIN centers c ON p.center_id = c.id
        WHERE p.student_id = ?
        ORDER BY p.created_at DESC
        LIMIT 10
    ''', (user_id,))
    payments = cursor.fetchall()
    
    # Get attendance
    cursor.execute('''
        SELECT a.*, s.name as subject_name
        FROM attendance a
        JOIN subjects s ON a.subject_id = s.id
        WHERE a.student_id = ?
        ORDER BY a.date DESC
        LIMIT 30
    ''', (user_id,))
    attendance = cursor.fetchall()
    
    # Get results
    cursor.execute('''
        SELECT r.*, s.name as subject_name
        FROM results r
        JOIN subjects s ON r.subject_id = s.id
        WHERE r.student_id = ?
        ORDER BY r.test_date DESC
        LIMIT 10
    ''', (user_id,))
    results = cursor.fetchall()
    
    conn.close()
    
    return render_template('student_dashboard.html',
                         enrollments=enrollments,
                         payments=payments,
                         attendance=attendance,
                         results=results)

# ============ API ROUTES FOR TELEGRAM BOT ============

@app.route('/api/centers', methods=['GET'])
def api_get_centers():
    """API endpoint for getting centers list"""
    conn = get_db()
    cursor = conn.cursor()
    
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    subject = request.args.get('subject')
    
    query = 'SELECT * FROM centers WHERE status = "active"'
    params = []
    
    if subject:
        query += ' AND id IN (SELECT center_id FROM subjects WHERE name LIKE ? AND status = "active")'
        params.append(f'%{subject}%')
    
    query += ' ORDER BY rating DESC'
    
    cursor.execute(query, params)
    centers = cursor.fetchall()
    conn.close()
    
    return jsonify([dict(c) for c in centers])

@app.route('/api/center/<int:center_id>', methods=['GET'])
def api_get_center(center_id):
    """API endpoint for getting center details"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM centers WHERE id = ?', (center_id,))
    center = cursor.fetchone()
    
    if not center:
        return jsonify({'error': 'Center not found'}), 404
    
    cursor.execute('SELECT * FROM subjects WHERE center_id = ? AND status = "active"', (center_id,))
    subjects = cursor.fetchall()
    
    cursor.execute('''
        SELECT t.*, u.full_name
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        WHERE t.center_id = ? AND t.status = 'active'
    ''', (center_id,))
    teachers = cursor.fetchall()
    
    conn.close()
    
    return jsonify({
        'center': dict(center),
        'subjects': [dict(s) for s in subjects],
        'teachers': [dict(t) for t in teachers]
    })

@app.route('/api/enroll', methods=['POST'])
def api_enroll():
    """API endpoint for student enrollment via bot"""
    data = request.json
    telegram_id = data.get('telegram_id')
    center_id = data.get('center_id')
    subject_id = data.get('subject_id')
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Get or create user
    cursor.execute('SELECT id FROM users WHERE telegram_id = ?', (telegram_id,))
    user = cursor.fetchone()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_id = user['id']
    
    # Create enrollment
    cursor.execute('''
        INSERT INTO enrollments (student_id, center_id, subject_id, status)
        VALUES (?, ?, ?, 'active')
    ''', (user_id, center_id, subject_id))
    
    conn.commit()
    enrollment_id = cursor.lastrowid
    conn.close()
    
    return jsonify({
        'success': True,
        'enrollment_id': enrollment_id,
        'message': 'Enrollment successful'
    })

@app.route('/api/user/register', methods=['POST'])
def api_register_user():
    """Register user from Telegram bot"""
    data = request.json
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO users (telegram_id, full_name, phone, role, language, status)
            VALUES (?, ?, ?, 'student', ?, 'active')
        ''', (data['telegram_id'], data['full_name'], data.get('phone'), data.get('language', 'uz')))
        
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'success': True,
            'user_id': user_id
        })
    except Exception as e:
        conn.close()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    from database import init_db
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
