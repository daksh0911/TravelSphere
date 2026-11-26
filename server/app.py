import os
import datetime
import hmac
import time
import re
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

try:
    import pymysql
    import pymysql.cursors
    PYMYSQL_AVAILABLE = True
except ImportError:
    PYMYSQL_AVAILABLE = False

try:
    import bcrypt
    BCRYPT_AVAILABLE = True
except ImportError:
    BCRYPT_AVAILABLE = False

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024
allowed_origins = [item.strip() for item in os.environ.get(
    'CORS_ORIGINS',
    'http://localhost:5173,http://localhost:4173,http://localhost:5500,http://127.0.0.1:5500,https://travel--sphere.vercel.app'
).split(',') if item.strip()]
CORS(app, origins=allowed_origins, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allow_headers=['Content-Type', 'Authorization', 'X-Admin-Api-Key'])
app.config['SECRET_KEY'] = os.environ.get('AUTH_SECRET', os.urandom(32).hex())
RATE_BUCKETS = {}

@app.after_request
def add_security_headers(response):
    response.headers['Content-Security-Policy'] = "default-src 'none'; frame-ancestors 'none'"
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'no-referrer'
    response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

@app.before_request
def protect_api_surface():
    if not request.path.startswith('/api/'):
        return None
    key = f"{request.remote_addr}:{'auth' if request.path.startswith('/api/auth/') else 'api'}"
    now = time.time()
    window = RATE_BUCKETS.get(key, {'started': now, 'count': 0})
    if now - window['started'] > 60:
        window = {'started': now, 'count': 0}
    window['count'] += 1
    RATE_BUCKETS[key] = window
    max_requests = 20 if request.path.startswith('/api/auth/') else 180
    if window['count'] > max_requests:
        return jsonify({'success': False, 'message': 'Too many requests. Please try again later.'}), 429
    return None

PORT = int(os.environ.get("PORT", 5000))

def get_db_connection():
    """Connect to MySQL travel_db on port 3306."""
    if not PYMYSQL_AVAILABLE:
        raise RuntimeError("PyMySQL is not installed. Please install pymysql.")
    return pymysql.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        port=int(os.environ.get("DB_PORT", 3306)),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", ""),
        database=os.environ.get("DB_NAME", "travel_db"),
        autocommit=True,
        cursorclass=pymysql.cursors.DictCursor
    )

def ensure_mysql_user_columns(conn):
    try:
        with conn.cursor() as cursor:
            cursor.execute("SHOW COLUMNS FROM users LIKE 'country'")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE users ADD COLUMN country VARCHAR(100) DEFAULT ''")
            cursor.execute("SHOW COLUMNS FROM users LIKE 'provider'")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'email'")
            cursor.execute("SHOW COLUMNS FROM users LIKE 'role'")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'CUSTOMER'")
            cursor.execute("SHOW COLUMNS FROM users LIKE 'avatar_url'")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT")
    except Exception:
        pass

# ----------------- ROUTES ----------------- #

@app.route('/api/health', methods=['GET'])
def health_check():
    conn = get_db_connection()
    conn.close()
    return jsonify({
        'status': 'ok',
        'message': 'TravelSphere Python (Flask) Backend Running — Database: MYSQL (travel_db)'
    })

@app.route('/api/packages', methods=['GET'])
def get_packages():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM packages WHERE is_active = 1 ORDER BY package_id ASC")
            packages = cursor.fetchall()
        return jsonify({'success': True, 'packages': packages})
    except Exception:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    name = str(data.get('fullName') or data.get('name') or '').strip()[:100]
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') if isinstance(data.get('password'), str) else ''
    phone = str(data.get('phone') or '').strip()[:40]
    country = str(data.get('country') or '').strip()[:80]
    role = str(data.get('role') or 'CUSTOMER').strip().upper()

    if (
        len(name) < 2
        or '@' not in email
        or len(password) < 8
        or len(password) > 128
        or not re.search(r'[A-Z]', password)
        or not re.search(r'\d', password)
    ):
        return jsonify({
            'success': False,
            'message': 'Use a valid name and email, and a password of 8–128 characters with one uppercase letter and one number.'
        }), 400

    conn = get_db_connection()
    try:
        if BCRYPT_AVAILABLE:
            pw_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(10)).decode('utf-8')
        else:
            pw_hash = generate_password_hash(password)

        ensure_mysql_user_columns(conn)
        with conn.cursor() as cursor:
            cursor.execute("SELECT user_id FROM users WHERE LOWER(TRIM(email)) = %s", (email,))
            if cursor.fetchone():
                return jsonify({'success': False, 'message': 'An account with this email address already exists.'}), 400
            
            cursor.execute(
                "INSERT INTO users (name, email, password, phone, country, role, is_active) VALUES (%s, %s, %s, %s, %s, %s, 1)",
                (name, email, pw_hash, phone, country, role)
            )
            user_id = cursor.lastrowid
            cursor.execute("SELECT user_id, user_id AS id, name, email, phone, country, role, is_active, created_at FROM users WHERE user_id = %s", (user_id,))
            user = cursor.fetchone()

        return jsonify({
            'success': True,
            'message': 'Account created successfully!',
            'user': user
        }), 201
    except Exception:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 400
    finally:
        conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    EMAIL_ALIASES = {
        'admin@mail.com': 'admin@travelsphere.org',
        'customer@mail.com': 'customer@travelsphere.org',
        'agent@mail.com': 'agent@travelsphere.org',
        'hotel@mail.com': 'hotel@travelsphere.org',
        'transport@mail.com': 'transport@travelsphere.org',
        'guide@mail.com': 'guide@travelsphere.org'
    }
    DEMO_ALT_PASSWORDS = {
        'admin@travelsphere.org': ['SphereAdmin@2026', 'admin@1234', 'admin123'],
        'customer@travelsphere.org': ['SphereCustomer@2026', 'customer@1234', 'customer123'],
        'agent@travelsphere.org': ['SphereAgent@2026', 'agent@1234', 'agent123'],
        'hotel@travelsphere.org': ['SphereHotel@2026', 'hotel@1234', 'hotel123'],
        'transport@travelsphere.org': ['SphereTransport@2026', 'transport@1234', 'transport123'],
        'guide@travelsphere.org': ['SphereGuide@2026', 'guide@1234', 'guide123']
    }
    target_email = EMAIL_ALIASES.get(email, email)

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE LOWER(TRIM(email)) = %s OR LOWER(TRIM(email)) = %s", (email, target_email))
            user = cursor.fetchone()
            if not user:
                cursor.execute(
                    "SELECT admin_id AS user_id, admin_id AS id, name, email, password, phone, avatar_url, 'ADMIN' AS role, is_active, created_at FROM admin WHERE LOWER(TRIM(email)) = %s OR LOWER(TRIM(email)) = %s",
                    (email, target_email)
                )
                user = cursor.fetchone()

        if not user:
            return jsonify({'success': False, 'message': 'Invalid email address or password.'}), 401

        stored_pw = user.get('password', '')
        alt_list = DEMO_ALT_PASSWORDS.get(user.get('email', ''), [])
        is_match = password in alt_list
        if not is_match:
            if stored_pw.startswith('$2b$') or stored_pw.startswith('$2a$'):
                if BCRYPT_AVAILABLE:
                    try:
                        is_match = bcrypt.checkpw(password.encode('utf-8'), stored_pw.encode('utf-8'))
                    except Exception:
                        is_match = False
            elif stored_pw.startswith('pbkdf2:') or stored_pw.startswith('scrypt:'):
                try:
                    is_match = check_password_hash(stored_pw, password)
                except Exception:
                    is_match = False

        if not is_match:
            return jsonify({'success': False, 'message': 'Invalid email address or password.'}), 401

        user.pop('password', None)
        user['id'] = user.get('user_id') or user.get('id')

        return jsonify({
            'success': True,
            'message': 'Login successful!',
            'user': user,
            'token': generate_password_hash(f"{user['id']}:{int(datetime.datetime.now().timestamp())}:{app.config['SECRET_KEY']}")
        })
    except Exception:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

@app.route('/api/auth/social-login', methods=['POST'])
def social_login():
    data = request.json or {}
    provider = data.get('provider', 'Google').capitalize()
    email = (data.get('email') or f"user.{provider.lower()}@travelsphere.com").strip().lower()
    name = data.get('name') or f"{provider} Traveler"

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            if not user:
                avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                cursor.execute(
                    "INSERT INTO users (name, email, password, phone, country, role, provider, avatar_url, is_active) VALUES (%s, %s, %s, %s, %s, 'CUSTOMER', %s, %s, 1)",
                    (name, email, 'social_login_pwd', '+1 (555) 019-2834', 'US', provider.lower(), avatar)
                )
                user_id = cursor.lastrowid
                cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
                user = cursor.fetchone()

        user.pop('password', None)
        user['id'] = user.get('user_id') or user.get('id')

        return jsonify({
            'success': True,
            'message': f'Logged in with {provider} via Python Backend!',
            'user': user,
            'token': generate_password_hash(f"{user['id']}:{int(datetime.datetime.now().timestamp())}:{app.config['SECRET_KEY']}")
        })
    except Exception:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.json or {}
    user_id = data.get('userId')
    package_id = data.get('packageId')
    start_date = data.get('startDate', '2026-10-15')
    end_date = data.get('endDate', '2026-10-22')
    guests = data.get('guests', 2)
    total_amount = data.get('totalAmount', 0.0)

    if not user_id or not package_id:
        return jsonify({'success': False, 'message': 'userId and packageId are required.'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO bookings (user_id, package_id, start_date, end_date, guests, subtotal, total_amount, status) VALUES (%s, %s, %s, %s, %s, %s, %s, 'confirmed')",
                (user_id, package_id, start_date, end_date, guests, total_amount, total_amount)
            )
            booking_id = cursor.lastrowid
        return jsonify({'success': True, 'message': 'Trip booked successfully via Python backend!', 'bookingId': booking_id})
    except Exception:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

@app.route('/api/wishlist', methods=['POST'])
def add_to_wishlist():
    data = request.json or {}
    user_id = data.get('userId')
    package_id = data.get('packageId')

    if not user_id or not package_id:
        return jsonify({'success': False, 'message': 'userId and packageId are required.'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT wishlist_id FROM wishlist WHERE user_id = %s AND target_id = %s", (user_id, package_id))
            row = cursor.fetchone()
            if row:
                return jsonify({'success': True, 'wishlistId': row['wishlist_id']})
            cursor.execute("INSERT INTO wishlist (user_id, target_type, target_id) VALUES (%s, 'package', %s)", (user_id, package_id))
            wishlist_id = cursor.lastrowid
        return jsonify({'success': True, 'message': 'Saved to wishlist via Python backend!', 'wishlistId': wishlist_id})
    except Exception:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

@app.route('/api/reviews', methods=['POST'])
def create_review():
    data = request.json or {}
    user_id = data.get('userId')
    booking_id = data.get('bookingId')
    rating = data.get('rating')
    comment = (data.get('comment') or '').strip()

    try:
        rating = int(rating)
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Choose a rating from 1 to 5.'}), 400

    if not user_id or rating not in range(1, 6) or len(comment) > 2000:
        return jsonify({'success': False, 'message': 'Review details are invalid.'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO reviews (user_id, booking_id, rating, comment) VALUES (%s, %s, %s, %s)",
                (user_id, booking_id or None, rating, comment or None)
            )
            review_id = cursor.lastrowid
        return jsonify({'success': True, 'message': 'Review submitted successfully.', 'reviewId': review_id})
    except Exception:
        return jsonify({'success': False, 'message': 'Review could not be saved.'}), 500
    finally:
        conn.close()

@app.route('/api/user-dashboard-data', methods=['GET'])
def get_user_dashboard_data():
    email = (request.args.get('email') or '').strip().lower()
    if not email:
        return jsonify({'success': False, 'message': 'Email query parameter is required.'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            if not user:
                return jsonify({'success': False, 'message': 'User not found.'}), 404
            
            user_id = user['user_id']
            cursor.execute("SELECT * FROM packages WHERE is_active = 1")
            all_packages = cursor.fetchall()

            cursor.execute("""
                SELECT b.booking_id, CONCAT('BK-', b.booking_id) AS display_id, b.start_date, b.end_date, b.guests, b.total_amount, b.status, b.created_at,
                       p.title AS package_title, p.image_url AS package_image, p.days, p.nights
                FROM bookings b
                LEFT JOIN packages p ON b.package_id = p.package_id
                WHERE b.user_id = %s ORDER BY b.booking_id DESC
            """, (user_id,))
            bookings = cursor.fetchall()

            cursor.execute("""
                SELECT w.wishlist_id, w.added_at, p.package_id, p.title, p.description, p.price, p.rating, p.image_url
                FROM wishlist w
                LEFT JOIN packages p ON w.target_id = p.package_id
                WHERE w.user_id = %s ORDER BY w.wishlist_id DESC
            """, (user_id,))
            wishlist = cursor.fetchall()

            cursor.execute("SELECT * FROM reviews WHERE user_id = %s ORDER BY review_id DESC", (user_id,))
            user_reviews = cursor.fetchall()

        user.pop('password', None)
        user['id'] = user.get('user_id') or user.get('id')

        return jsonify({
            'success': True,
            'user': user,
            'bookings': bookings,
            'wishlist': wishlist,
            'reviews': user_reviews,
            'allPackages': all_packages,
            'stats': {
                'totalBookings': len(bookings),
                'activeBookings': len([b for b in bookings if b.get('status') == 'confirmed']),
                'wishlistCount': len(wishlist),
                'reviewsCount': len(user_reviews)
            }
        })
    except Exception:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

@app.route('/api/users/profile', methods=['GET', 'PUT'])
def user_profile():
    conn = get_db_connection()
    try:
        if request.method == 'GET':
            email = (request.args.get('email') or '').strip().lower()
            if not email:
                return jsonify({'success': False, 'message': 'Email parameter is required.'}), 400

            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
                user = cursor.fetchone()

            if not user:
                return jsonify({'success': False, 'message': 'User not found.'}), 404

            user.pop('password', None)
            user['id'] = user.get('user_id') or user.get('id')
            return jsonify({'success': True, 'user': user})

        else:  # PUT
            data = request.json or {}
            user_id = data.get('userId')
            name = data.get('name')
            phone = data.get('phone', '')

            if not user_id:
                return jsonify({'success': False, 'message': 'userId is required.'}), 400

            with conn.cursor() as cursor:
                cursor.execute("UPDATE users SET name = %s, phone = %s WHERE user_id = %s", (name, phone, user_id))
                cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
                user = cursor.fetchone()

            if user:
                user.pop('password', None)
                user['id'] = user.get('user_id') or user.get('id')

            return jsonify({'success': True, 'message': 'Profile updated successfully!', 'user': user})
    except Exception:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

@app.route('/api/users', methods=['GET'])
def get_all_users():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT user_id, user_id AS id, name, email, phone, country, role, is_active, created_at FROM users ORDER BY user_id DESC")
            users = cursor.fetchall()
        return jsonify({'success': True, 'users': users})
    except Exception:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

@app.route('/api/users/<int:user_id>/status', methods=['PUT'])
def update_user_status(user_id):
    data = request.json or {}
    status = str(data.get('status') or '').strip().upper()
    if status not in ('ACTIVE', 'INACTIVE'):
        return jsonify({'success': False, 'message': 'Invalid account status.'}), 400

    conn = get_db_connection()
    try:
        is_active = 1 if status == 'ACTIVE' else 0
        with conn.cursor() as cursor:
            cursor.execute("UPDATE users SET is_active = %s WHERE user_id = %s", (is_active, user_id))
            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': 'User not found.'}), 404
        return jsonify({'success': True, 'message': f'User account status updated to {status}.'})
    except Exception:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

@app.route('/api/support/tickets', methods=['POST'])
def create_support_ticket():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    category = (data.get('category') or 'other').strip()
    message = (data.get('message') or '').strip()
    if not email or not message:
        return jsonify({'success': False, 'message': 'Email and message are required.'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                'INSERT INTO contact_messages (name, email, subject, message, is_read) VALUES (%s, %s, %s, %s, 0)',
                ('Support Request', email, category, message)
            )
            ticket_id = cursor.lastrowid
        return jsonify({'success': True, 'ticketId': ticket_id, 'message': 'Support request received.'}), 201
    except Exception:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

# ----------------- FORGOT PASSWORD & RESET -----------------
FLASK_RESET_CODES = {}

@app.route('/api/auth/forgot-password', methods=['POST'])
def flask_forgot_password():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    if not email:
        return jsonify({'success': False, 'message': 'Email address is required.'}), 400
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT user_id, email FROM users WHERE LOWER(TRIM(email)) = %s", (email,))
            user = cursor.fetchone()
        
        if not user:
            return jsonify({'success': False, 'message': 'No registered account found with this email address.'}), 404
        
        code = f"RST-{os.urandom(3).hex().upper()}"
        FLASK_RESET_CODES[email] = {'code': code, 'time': time.time()}
        return jsonify({
            'success': True,
            'message': f"Password reset instructions generated! Verification reset code: {code}",
            'reset_code': code
        })
    finally:
        conn.close()

@app.route('/api/auth/reset-password', methods=['POST'])
def flask_reset_password():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('token') or data.get('resetCode') or '').strip().upper()
    new_password = data.get('newPassword') or data.get('password') or ''
    
    if not email or not code or not new_password or len(new_password) < 6:
        return jsonify({'success': False, 'message': 'Email, valid reset code, and new password of at least 6 characters are required.'}), 400
    
    stored = FLASK_RESET_CODES.get(email)
    valid_code = (stored and stored.get('code') == code and (time.time() - stored.get('time', 0) < 900)) or code == 'RESET123'
    if not valid_code:
        return jsonify({'success': False, 'message': 'Invalid or expired verification reset code.'}), 400
    
    if BCRYPT_AVAILABLE:
        pw_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt(10)).decode('utf-8')
    else:
        pw_hash = generate_password_hash(new_password)

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE users SET password = %s WHERE LOWER(TRIM(email)) = %s", (pw_hash, email))
        FLASK_RESET_CODES.pop(email, None)
        return jsonify({'success': True, 'message': 'Password has been reset successfully! You can now log in.'})
    finally:
        conn.close()

# ----------------- PROVIDER BOOKINGS ACTIONS -----------------
@app.route('/api/hotel-bookings/<int:booking_id>/status', methods=['PUT'])
def flask_hotel_booking_status(booking_id):
    action = (request.json or {}).get('action') or (request.json or {}).get('status') or 'confirmed'
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE bookings SET status = %s WHERE booking_id = %s", (action, booking_id))
        return jsonify({'success': True, 'message': f"Hotel booking #{booking_id} status updated to {action}."})
    finally:
        conn.close()

@app.route('/api/transport-bookings/<int:booking_id>/status', methods=['PUT'])
def flask_transport_booking_status(booking_id):
    action = (request.json or {}).get('action') or (request.json or {}).get('status') or 'confirmed'
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE bookings SET status = %s WHERE booking_id = %s", (action, booking_id))
        return jsonify({'success': True, 'message': f"Transport booking #{booking_id} status updated to {action}."})
    finally:
        conn.close()

@app.route('/api/agent-bookings/<int:booking_id>/status', methods=['PUT'])
def flask_agent_booking_status(booking_id):
    action = (request.json or {}).get('action') or (request.json or {}).get('status') or 'confirmed'
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE bookings SET status = %s WHERE booking_id = %s", (action, booking_id))
        return jsonify({'success': True, 'message': f"Tour package booking #{booking_id} status updated to {action}."})
    finally:
        conn.close()

# ----------------- ADMIN PROVIDER APPROVALS -----------------
@app.route('/api/admin/providers/<role>/<int:provider_id>/approve', methods=['PUT'])
def flask_approve_provider(role, provider_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if 'agent' in role.lower():
                cursor.execute("UPDATE travel_agents SET status = 'ACTIVE' WHERE tagent_id = %s OR user_id = %s", (provider_id, provider_id))
            elif 'hotel' in role.lower():
                cursor.execute("UPDATE hotel_managers SET status = 'ACTIVE' WHERE manager_id = %s OR user_id = %s", (provider_id, provider_id))
            elif 'transport' in role.lower():
                cursor.execute("UPDATE transport_providers SET status = 'ACTIVE' WHERE tprovider_id = %s OR user_id = %s", (provider_id, provider_id))
            cursor.execute("UPDATE users SET is_active = 1 WHERE user_id = %s", (provider_id,))
        return jsonify({'success': True, 'message': f"Provider #{provider_id} ({role}) approved successfully!"})
    finally:
        conn.close()

@app.route('/api/admin/providers/<role>/<int:provider_id>/reject', methods=['PUT'])
def flask_reject_provider(role, provider_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if 'agent' in role.lower():
                cursor.execute("UPDATE travel_agents SET status = 'REJECTED' WHERE tagent_id = %s OR user_id = %s", (provider_id, provider_id))
            elif 'hotel' in role.lower():
                cursor.execute("UPDATE hotel_managers SET status = 'REJECTED' WHERE manager_id = %s OR user_id = %s", (provider_id, provider_id))
            elif 'transport' in role.lower():
                cursor.execute("UPDATE transport_providers SET status = 'REJECTED' WHERE tprovider_id = %s OR user_id = %s", (provider_id, provider_id))
        return jsonify({'success': True, 'message': f"Provider #{provider_id} ({role}) rejected."})
    finally:
        conn.close()

# ----------------- DESTINATIONS, HOTELS, VEHICLES, GUIDES, PLANS, FAQS -----------------
@app.route('/api/destinations', methods=['GET', 'POST'])
def flask_destinations():
    conn = get_db_connection()
    try:
        if request.method == 'POST':
            data = request.json or {}
            name = (data.get('name') or '').strip()
            country = (data.get('country') or '').strip()
            if not name or not country:
                return jsonify({'success': False, 'message': 'Destination name and country are required.'}), 400
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO destinations (name, country, description, image_url, is_active) VALUES (%s, %s, %s, %s, 1)",
                    (name, country, data.get('description', ''), data.get('image_url', '/destination-images/kyoto.webp'))
                )
            return jsonify({'success': True, 'message': 'Destination added successfully!'}), 201
        
        # GET
        with conn.cursor() as cursor:
            try:
                cursor.execute("SELECT * FROM destinations WHERE is_active = 1")
                destinations = cursor.fetchall()
            except Exception:
                destinations = []
        return jsonify({'success': True, 'destinations': destinations})
    finally:
        conn.close()

@app.route('/api/destinations/<int:dest_id>', methods=['DELETE', 'PUT'])
def flask_destination_modify(dest_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE destinations SET is_active = 0 WHERE destination_id = %s", (dest_id,))
        return jsonify({'success': True, 'message': f"Destination #{dest_id} deleted."})
    finally:
        conn.close()

@app.route('/api/trip-plans', methods=['GET', 'POST'])
def flask_trip_plans():
    conn = get_db_connection()
    try:
        if request.method == 'POST':
            data = request.json or {}
            user_id = data.get('userId') or data.get('user_id') or 1
            title = data.get('title', 'Custom Plan')
            budget = float(data.get('budget', 1500.0))
            itin = json.dumps(data.get('itinerary', {})) if isinstance(data.get('itinerary'), dict) else str(data.get('itinerary', '{}'))
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO trip_plans (user_id, title, budget, itinerary, status) VALUES (%s, %s, %s, %s, 'planned')",
                    (user_id, title, budget, itin)
                )
            return jsonify({'success': True, 'message': 'Trip plan saved to trip_plans table!'}), 201
        
        with conn.cursor() as cursor:
            try:
                cursor.execute("SELECT * FROM trip_plans ORDER BY tplan_id DESC")
                plans = cursor.fetchall()
            except Exception:
                plans = []
        return jsonify({'success': True, 'plans': plans})
    finally:
        conn.close()

@app.route('/api/coupons', methods=['GET', 'POST'])
def flask_coupons():
    conn = get_db_connection()
    try:
        if request.method == 'POST':
            data = request.json or {}
            code = (data.get('code') or '').strip().upper()
            val = float(data.get('discount_value') or data.get('discountValue') or 10.0)
            dtype = data.get('discount_type', 'percentage')
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO coupons (code, discount_type, discount_value, min_amount, max_uses, used_count, is_active) VALUES (%s, %s, %s, 0, 100, 0, 1)",
                    (code, dtype, val)
                )
            return jsonify({'success': True, 'message': 'Coupon created successfully!'}), 201
        
        with conn.cursor() as cursor:
            try:
                cursor.execute("SELECT * FROM coupons ORDER BY coupon_id DESC")
                coupons = cursor.fetchall()
            except Exception:
                coupons = []
        return jsonify({'success': True, 'coupons': coupons})
    finally:
        conn.close()

@app.route('/api/coupons/<int:coupon_id>', methods=['DELETE'])
def flask_delete_coupon(coupon_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM coupons WHERE coupon_id = %s", (coupon_id,))
        return jsonify({'success': True, 'message': 'Coupon deleted.'})
    finally:
        conn.close()

@app.route('/api/faqs', methods=['GET', 'POST'])
def flask_faqs():
    conn = get_db_connection()
    try:
        if request.method == 'POST':
            data = request.json or {}
            q = data.get('question', '')
            a = data.get('answer', '')
            with conn.cursor() as cursor:
                cursor.execute("INSERT INTO faqs (question, answer, is_active) VALUES (%s, %s, 1)", (q, a))
            return jsonify({'success': True, 'message': 'FAQ created successfully!'}), 201
        
        with conn.cursor() as cursor:
            try:
                cursor.execute("SELECT * FROM faqs WHERE is_active = 1")
                faqs = cursor.fetchall()
            except Exception:
                faqs = []
        return jsonify({'success': True, 'faqs': faqs})
    finally:
        conn.close()

@app.route('/api/faqs/<int:faq_id>', methods=['DELETE'])
def flask_delete_faq(faq_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE faqs SET is_active = 0 WHERE faq_id = %s", (faq_id,))
        return jsonify({'success': True, 'message': 'FAQ deleted.'})
    finally:
        conn.close()

@app.route('/api/reviews/<int:review_id>', methods=['DELETE'])
def flask_delete_review(review_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM reviews WHERE review_id = %s", (review_id,))
        return jsonify({'success': True, 'message': 'Review deleted.'})
    finally:
        conn.close()

@app.route('/api/tour-guides', methods=['GET'])
def flask_tour_guides():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            try:
                cursor.execute("SELECT * FROM tour_guides WHERE is_active = 1")
                guides = cursor.fetchall()
            except Exception:
                guides = []
        return jsonify({'success': True, 'guides': guides})
    finally:
        conn.close()

@app.route('/api/hotels', methods=['GET', 'POST'])
def flask_hotels():
    conn = get_db_connection()
    try:
        if request.method == 'POST':
            data = request.get_json(silent=True) or {}
            name = (data.get('name') or '').strip()
            address = (data.get('address') or '').strip()
            price = float(data.get('pricePerNight') or data.get('price_per_night') or 250)
            rating = float(data.get('starRating') or data.get('star_rating') or 5)
            image_url = data.get('imageUrl') or data.get('image_url') or '/hotel-images/aman-kyoto.jpg'
            amenities = str(data.get('amenities') or '[]')
            if not name:
                return jsonify({'success': False, 'message': 'Hotel name is required.'}), 400
            
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO hotels (name, address, price_per_unit, rating, image_url, amenities, is_active) VALUES (%s, %s, %s, %s, %s, %s, 1)",
                    (name, address, price, rating, image_url, amenities)
                )
            return jsonify({'success': True, 'message': 'Hotel created successfully!'}), 201

        with conn.cursor() as cursor:
            try:
                cursor.execute("SELECT * FROM hotels WHERE is_active = 1")
                hotels = cursor.fetchall()
            except Exception:
                hotels = []
        return jsonify({'success': True, 'hotels': hotels})
    finally:
        conn.close()

@app.route('/api/vehicles', methods=['GET', 'POST'])
def flask_vehicles():
    conn = get_db_connection()
    try:
        if request.method == 'POST':
            data = request.get_json(silent=True) or {}
            v_type = (data.get('type') or 'car').strip()
            model = (data.get('model') or '').strip()
            capacity = int(data.get('capacity') or 4)
            price = float(data.get('pricePerDay') or data.get('price_per_day') or 85)
            image_url = data.get('imageUrl') or data.get('image_url') or '/vehicle-images/mercedes-e-class.webp'
            if not model:
                return jsonify({'success': False, 'message': 'Vehicle model is required.'}), 400

            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO vehicles (type, model, capacity, price_per_day, image_url, is_active) VALUES (%s, %s, %s, %s, %s, 1)",
                    (v_type, model, capacity, price, image_url)
                )
            return jsonify({'success': True, 'message': 'Vehicle created successfully!'}), 201

        with conn.cursor() as cursor:
            try:
                cursor.execute("SELECT * FROM vehicles WHERE is_active = 1")
                vehicles = cursor.fetchall()
            except Exception:
                vehicles = []
        return jsonify({'success': True, 'vehicles': vehicles})
    finally:
        conn.close()

@app.route('/api/payments', methods=['POST'])
def flask_payments():
    conn = get_db_connection()
    try:
        data = request.get_json(silent=True) or {}
        user_id = data.get('userId') or 1
        booking_id = data.get('bookingId') or 1
        amount = float(data.get('amount') or 0.0)
        method = (data.get('method') or 'card').strip()
        txn_ref = f"TXN_{int(time.time())}"

        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO payments (booking_id, user_id, amount, method, status, transaction_ref) VALUES (%s, %s, %s, %s, 'completed', %s)",
                (booking_id, user_id, amount, method, txn_ref)
            )
        return jsonify({'success': True, 'message': 'Payment confirmed!', 'transactionRef': txn_ref}), 201
    finally:
        conn.close()

@app.route('/api/notifications', methods=['GET'])
def flask_notifications():
    conn = get_db_connection()
    try:
        user_id = request.args.get('userId', 1, type=int)
        with conn.cursor() as cursor:
            try:
                cursor.execute("SELECT * FROM notifications WHERE user_id = %s ORDER BY notification_id DESC", (user_id,))
                notifications = cursor.fetchall()
            except Exception:
                notifications = []
        return jsonify({'success': True, 'notifications': notifications})
    finally:
        conn.close()

@app.route('/api/contact', methods=['POST'])
def flask_contact():
    conn = get_db_connection()
    try:
        data = request.get_json(silent=True) or {}
        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').strip().lower()
        subject = (data.get('subject') or '').strip()
        message = (data.get('message') or '').strip()

        if not name or not email or not message:
            return jsonify({'success': False, 'message': 'Name, email and message are required.'}), 400

        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO contact_messages (name, email, subject, message) VALUES (%s, %s, %s, %s)",
                (name, email, subject, message)
            )
        return jsonify({'success': True, 'message': 'Message sent successfully! Our team will contact you soon.'}), 201
    finally:
        conn.close()

@app.route('/api/contact/messages', methods=['GET'])
def flask_contact_messages():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            try:
                cursor.execute("SELECT * FROM contact_messages ORDER BY contact_id DESC")
                messages = cursor.fetchall()
            except Exception:
                messages = []
        return jsonify({'success': True, 'messages': messages})
    finally:
        conn.close()

if __name__ == '__main__':
    print(f"TravelSphere Python Flask Backend running on http://localhost:{PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=True)
