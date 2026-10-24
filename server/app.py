import os
import sqlite3
import datetime
import hmac
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

try:
    import pymysql
    PYMYSQL_AVAILABLE = True
except ImportError:
    PYMYSQL_AVAILABLE = False

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024
allowed_origins = [item.strip() for item in os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://localhost:4173').split(',') if item.strip()]
CORS(app, origins=allowed_origins, methods=['GET', 'POST', 'PUT', 'OPTIONS'], allow_headers=['Content-Type', 'Authorization', 'X-Admin-Api-Key'])
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
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "travel_db.sqlite")

def get_db_connection():
    """Attempt MySQL connection first; fallback to SQLite3 if MySQL is unavailable."""
    if PYMYSQL_AVAILABLE:
        try:
            conn = pymysql.connect(
                host="localhost",
                port=3306,
                user="root",
                password="",
                database="travel_db",
                autocommit=True,
                cursorclass=pymysql.cursors.DictCursor
            )
            return conn, "mysql"
        except Exception:
            pass

    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn, "sqlite"

def init_sqlite_db(conn):
    """Initialize SQLite tables if using fallback database."""
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        country TEXT,
        role TEXT DEFAULT 'CUSTOMER',
        provider TEXT DEFAULT 'email',
        avatar_url TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS packages (
        package_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT DEFAULT 'International Getaways',
        location TEXT,
        description TEXT,
        days INTEGER,
        nights INTEGER,
        price REAL,
        image_url TEXT,
        rating REAL DEFAULT 4.5,
        inclusions TEXT,
        is_active INTEGER DEFAULT 1
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        package_id INTEGER,
        start_date TEXT,
        end_date TEXT,
        guests INTEGER,
        subtotal REAL,
        discount REAL DEFAULT 0,
        total_amount REAL,
        status TEXT DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wishlist (
        wishlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        target_type TEXT DEFAULT 'package',
        target_id INTEGER,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS support_tickets (
        ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        category TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'OPEN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Populate MakeMyTrip inspired packages if empty or outdated
    cursor.execute("SELECT COUNT(*) FROM packages")
    if cursor.fetchone()[0] < 10:
        cursor.execute("DELETE FROM packages")
        cursor.executemany("""
        INSERT INTO packages (title, category, location, description, days, nights, price, image_url, rating, inclusions, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, [
            ('Maldives Overwater Luxury Bungalow', 'Honeymoon Specials', 'Maldives', 'Romantic water villas, private infinity pool, sunset dolphin cruises, and candlelit beach dinners.', 5, 4, 1850.00, '/destination-images/maldives.webp', 4.9, '✈ Flights • 🏨 5★ Villa • ⛵ Speedboat • 🍽 All Meals'),
            ('Santorini Sunset Villa & Yacht Tour', 'Honeymoon Specials', 'Santorini, Greece', 'Luxurious caldera views, wine tasting tours, and Aegean sea sunset catamaran cruises.', 6, 5, 1980.00, '/destination-images/santorini.webp', 4.8, '✈ Flights • 🏨 Cliff Villa • 🍷 Wine Tasting • ⛵ Yacht Cruise'),
            ('Bali Beach Villa & Temple Discovery', 'Beach & Islands', 'Bali, Indonesia', 'Tropical beaches, Sacred Monkey Forest, Ubud rice terraces, and spiritual spa wellness.', 5, 4, 1120.00, '/destination-images/bali.webp', 4.7, '✈ Flights • 🏨 4★ Resort • 🚗 Transfers • 🎟 Sightseeing'),
            ('Phuket & Krabi Island Hopping Quest', 'Beach & Islands', 'Thailand', 'Coral island speedboat excursions, Maya Bay snorkeling, and vibrant night markets.', 6, 5, 980.00, '/destination-images/phuket.webp', 4.8, '✈ Flights • 🏨 Beachfront Hotel • 🚤 Speedboat • 🍽 Breakfast'),
            ('Swiss Alps Glacier & Scenic Express', 'Mountain Escapes', 'Interlaken, Switzerland', 'Majestic glacier peaks, first class panoramic trains, and Interlaken alpine lakes.', 8, 7, 2100.00, '/destination-images/swiss-alps.webp', 5.0, '✈ Flights • 🚆 Glacier Express • 🏨 Chalet Stay • 🥐 Daily Meals'),
            ('Manali & Solang Valley Snow Expedition', 'Mountain Escapes', 'Himachal Pradesh, India', 'Snow activities in Solang, Rohtang Pass excursions, and scenic pine valley retreats.', 5, 4, 750.00, '/destination-images/manali.webp', 4.6, '🚌 Luxury Bus • 🏨 Mountain Resort • 🎿 Snow Sports • 🍽 Meals'),
            ('Kyoto Temple & Cherry Blossom Tour', 'Culture & Heritage', 'Kyoto, Japan', 'Historic UNESCO temples, blooming sakura gardens, tea ceremonies, and bamboo groves.', 7, 6, 1450.00, '/destination-images/kyoto.webp', 4.9, '✈ Flights • 🚆 Bullet Train • 🏨 Traditional Ryokan • 🍵 Tea Ceremony'),
            ('Rajasthan Royal Forts & Heritage Safari', 'Culture & Heritage', 'Jaipur & Udaipur, India', 'Amber Fort VIP tour, Lake Pichola boating, Thar desert camel safari, and palace stays.', 6, 5, 1280.00, '/destination-images/rajasthan.webp', 4.8, '🚗 Private Cab • 🏰 Royal Palace • 🐫 Desert Safari • 🍽 All Meals'),
            ('Paris VIP Art & Seine Culinary Discovery', 'Luxury & Wellness', 'Paris, France', 'Louvre museum VIP entry, Montmartre walks, Eiffel Tower champagne lounge, and Seine dining.', 5, 4, 1650.00, '/destination-images/paris.webp', 4.8, '✈ Flights • 🏨 5★ Palace Hotel • 🎟 Louvre VIP • 🍷 Gourmet Cruise'),
            ('Dubai Desert Resort & Luxury Skyscraper', 'Luxury & Wellness', 'Dubai, UAE', 'Burj Al Arab dining, dune bashing safari, private yacht rental, and helicopter city flight.', 4, 3, 2450.00, '/destination-images/dubai.webp', 4.9, '✈ Flights • 🏨 7★ Resort • 🚁 Helicopter Tour • 🏎 Desert Safari'),
            ('Tokyo Bullet Train & Mt Fuji Quest', 'International Getaways', 'Tokyo, Japan', 'Shinkansen high-speed rail, Mt Fuji panoramas, Akihabara tech tour, and Michelin dining.', 6, 5, 1350.00, '/destination-images/tokyo.webp', 4.9, '✈ Flights • 🏨 City Center Hotel • 🚄 Bullet Train • 🗼 Skytree Pass'),
            ('Amsterdam Canals & Tulip Garden Escape', 'International Getaways', 'Netherlands', 'Keukenhof tulip park, historic canal cruise, Van Gogh museum, and windmill countryside.', 5, 4, 1550.00, '/destination-images/amsterdam.webp', 4.7, '✈ Flights • 🏨 Canal Hotel • 🚢 Boat Cruise • 🌷 Keukenhof Entry')
        ])
    conn.commit()

# Ensure local sqlite db is initialized
conn_init, db_type = get_db_connection()
if db_type == "sqlite":
    init_sqlite_db(conn_init)
conn_init.close()

# ----------------- ROUTES ----------------- #

@app.route('/api/health', methods=['GET'])
def health_check():
    conn, db_type = get_db_connection()
    conn.close()
    return jsonify({
        'status': 'ok',
        'message': f'TravelSphere Python (Flask) Backend Running — Database: {db_type.upper()}'
    })

@app.route('/api/packages', methods=['GET'])
def get_packages():
    conn, db_type = get_db_connection()
    try:
        if db_type == "mysql":
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM packages WHERE is_active = 1 ORDER BY package_id ASC")
                packages = cursor.fetchall()
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM packages WHERE is_active = 1 ORDER BY package_id ASC")
            packages = [dict(row) for row in cursor.fetchall()]
        
        return jsonify({'success': True, 'packages': packages})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

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
    except Exception as e:
        pass

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    name = str(data.get('fullName') or data.get('name') or '').strip()[:100]
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') if isinstance(data.get('password'), str) else ''
    phone = str(data.get('phone') or '').strip()[:40]
    country = str(data.get('country') or '').strip()[:80]

    if len(name) < 2 or '@' not in email or len(password) < 10 or len(password) > 128:
        return jsonify({'success': False, 'message': 'Use a valid name, email, and password of 10–128 characters.'}), 400

    conn, db_type = get_db_connection()
    try:
        pw_hash = generate_password_hash(password)
        if db_type == "mysql":
            ensure_mysql_user_columns(conn)
            with conn.cursor() as cursor:
                cursor.execute("SELECT user_id FROM users WHERE LOWER(TRIM(email)) = %s", (email,))
                if cursor.fetchone():
                    return jsonify({'success': False, 'message': 'An account with this email address already exists.'}), 400
                
                try:
                    cursor.execute(
                        "INSERT INTO users (name, email, password, phone, country, is_active) VALUES (%s, %s, %s, %s, %s, 1)",
                        (name, email, pw_hash, phone, country)
                    )
                except Exception:
                    cursor.execute(
                        "INSERT INTO users (name, email, password, phone, is_active) VALUES (%s, %s, %s, %s, 1)",
                        (name, email, pw_hash, phone)
                    )
                user_id = cursor.lastrowid
                cursor.execute("SELECT user_id, user_id AS id, name, email, phone, is_active, created_at FROM users WHERE user_id = %s", (user_id,))
                user = cursor.fetchone()
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT user_id FROM users WHERE LOWER(TRIM(email)) = ?", (email,))
            if cursor.fetchone():
                return jsonify({'success': False, 'message': 'An account with this email address already exists.'}), 400
            
            cursor.execute(
                "INSERT INTO users (name, email, password, phone, country, is_active) VALUES (?, ?, ?, ?, ?, 1)",
                (name, email, pw_hash, phone, country)
            )
            conn.commit()
            user_id = cursor.lastrowid
            cursor.execute("SELECT user_id, user_id AS id, name, email, phone, country, role, created_at FROM users WHERE user_id = ?", (user_id,))
            user = dict(cursor.fetchone())

        return jsonify({
            'success': True,
            'message': 'Account created successfully!',
            'user': user
        }), 201
    except Exception as e:
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

    conn, db_type = get_db_connection()
    try:
        if db_type == "mysql":
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE LOWER(TRIM(email)) = %s", (email,))
                user = cursor.fetchone()
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE LOWER(TRIM(email)) = ?", (email,))
            row = cursor.fetchone()
            user = dict(row) if row else None

        if not user:
            return jsonify({'success': False, 'message': 'Invalid email address or password.'}), 401

        # Only accept password hashes. Plaintext database values are intentionally rejected.
        stored_pw = user.get('password', '')
        is_match = False
        if stored_pw.startswith('pbkdf2:') or stored_pw.startswith('scrypt:') or stored_pw.startswith('$2b$') or stored_pw.startswith('$2a$'):
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
    except Exception as e:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

@app.route('/api/auth/social-login', methods=['POST'])
def social_login():
    data = request.json or {}
    provider = data.get('provider', 'Google').capitalize()
    email = (data.get('email') or f"user.{provider.lower()}@travelsphere.com").strip().lower()
    name = data.get('name') or f"{provider} Traveler"

    conn, db_type = get_db_connection()
    try:
        if db_type == "mysql":
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
                user = cursor.fetchone()
                if not user:
                    avatar = f"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                    cursor.execute(
                        "INSERT INTO users (name, email, password, phone, country, role, provider, avatar_url, is_active) VALUES (%s, %s, %s, %s, %s, 'CUSTOMER', %s, %s, 1)",
                        (name, email, 'social_login_pwd', '+1 (555) 019-2834', 'US', provider.lower(), avatar)
                    )
                    user_id = cursor.lastrowid
                    cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
                    user = cursor.fetchone()
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if row:
                user = dict(row)
            else:
                avatar = f"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                cursor.execute(
                    "INSERT INTO users (name, email, password, phone, country, role, provider, avatar_url, is_active) VALUES (?, ?, 'social_login_pwd', '+1 (555) 019-2834', 'US', 'CUSTOMER', ?, ?, 1)",
                    (name, email, provider.lower(), avatar)
                )
                conn.commit()
                user_id = cursor.lastrowid
                cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
                user = dict(cursor.fetchone())

        user.pop('password', None)
        user['id'] = user.get('user_id') or user.get('id')

        return jsonify({
            'success': True,
            'message': f'Logged in with {provider} via Python Backend!',
            'user': user,
            'token': generate_password_hash(f"{user['id']}:{int(datetime.datetime.now().timestamp())}:{app.config['SECRET_KEY']}")
        })
    except Exception as e:
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

    conn, db_type = get_db_connection()
    try:
        if db_type == "mysql":
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO bookings (user_id, package_id, start_date, end_date, guests, subtotal, total_amount, status) VALUES (%s, %s, %s, %s, %s, %s, %s, 'confirmed')",
                    (user_id, package_id, start_date, end_date, guests, total_amount, total_amount)
                )
                booking_id = cursor.lastrowid
        else:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO bookings (user_id, package_id, start_date, end_date, guests, subtotal, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')",
                (user_id, package_id, start_date, end_date, guests, total_amount, total_amount)
            )
            conn.commit()
            booking_id = cursor.lastrowid

        return jsonify({'success': True, 'message': 'Trip booked successfully via Python backend!', 'bookingId': booking_id})
    except Exception as e:
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

    conn, db_type = get_db_connection()
    try:
        if db_type == "mysql":
            with conn.cursor() as cursor:
                cursor.execute("SELECT wishlist_id FROM wishlist WHERE user_id = %s AND target_id = %s", (user_id, package_id))
                row = cursor.fetchone()
                if row:
                    return jsonify({'success': True, 'wishlistId': row['wishlist_id']})
                cursor.execute("INSERT INTO wishlist (user_id, target_type, target_id) VALUES (%s, 'package', %s)", (user_id, package_id))
                wishlist_id = cursor.lastrowid
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT wishlist_id FROM wishlist WHERE user_id = ? AND target_id = ?", (user_id, package_id))
            row = cursor.fetchone()
            if row:
                return jsonify({'success': True, 'wishlistId': row[0]})
            cursor.execute("INSERT INTO wishlist (user_id, target_type, target_id) VALUES (?, 'package', ?)", (user_id, package_id))
            conn.commit()
            wishlist_id = cursor.lastrowid

        return jsonify({'success': True, 'message': 'Saved to wishlist via Python backend!', 'wishlistId': wishlist_id})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

@app.route('/api/user-dashboard-data', methods=['GET'])
def get_user_dashboard_data():
    email = (request.args.get('email') or '').strip().lower()
    if not email:
        return jsonify({'success': False, 'message': 'Email query parameter is required.'}), 400

    conn, db_type = get_db_connection()
    try:
        if db_type == "mysql":
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
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if not row:
                return jsonify({'success': False, 'message': 'User not found.'}), 404
            user = dict(row)
            user_id = user['user_id']

            cursor.execute("SELECT * FROM packages WHERE is_active = 1")
            all_packages = [dict(r) for r in cursor.fetchall()]

            cursor.execute("""
                SELECT b.booking_id, ('BK-' || b.booking_id) AS display_id, b.start_date, b.end_date, b.guests, b.total_amount, b.status, b.created_at,
                       p.title AS package_title, p.image_url AS package_image, p.days, p.nights
                FROM bookings b
                LEFT JOIN packages p ON b.package_id = p.package_id
                WHERE b.user_id = ? ORDER BY b.booking_id DESC
            """, (user_id,))
            bookings = [dict(r) for r in cursor.fetchall()]

            cursor.execute("""
                SELECT w.wishlist_id, w.added_at, p.package_id, p.title, p.description, p.price, p.rating, p.image_url
                FROM wishlist w
                LEFT JOIN packages p ON w.target_id = p.package_id
                WHERE w.user_id = ? ORDER BY w.wishlist_id DESC
            """, (user_id,))
            wishlist = [dict(r) for r in cursor.fetchall()]

        user.pop('password', None)
        user['id'] = user.get('user_id') or user.get('id')

        return jsonify({
            'success': True,
            'user': user,
            'bookings': bookings,
            'wishlist': wishlist,
            'allPackages': all_packages,
            'stats': {
                'totalBookings': len(bookings),
                'activeBookings': len([b for b in bookings if b.get('status') == 'confirmed']),
                'wishlistCount': len(wishlist)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

@app.route('/api/users/profile', methods=['GET', 'PUT'])
def user_profile():
    conn, db_type = get_db_connection()
    try:
        if request.method == 'GET':
            email = (request.args.get('email') or '').strip().lower()
            if not email:
                return jsonify({'success': False, 'message': 'Email parameter is required.'}), 400

            if db_type == "mysql":
                with conn.cursor() as cursor:
                    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
                    user = cursor.fetchone()
            else:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
                row = cursor.fetchone()
                user = dict(row) if row else None

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

            if db_type == "mysql":
                with conn.cursor() as cursor:
                    cursor.execute("UPDATE users SET name = %s, phone = %s WHERE user_id = %s", (name, phone, user_id))
                    cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
                    user = cursor.fetchone()
            else:
                cursor = conn.cursor()
                cursor.execute("UPDATE users SET name = ?, phone = ? WHERE user_id = ?", (name, phone, user_id))
                conn.commit()
                cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
                user = dict(cursor.fetchone())

            if user:
                user.pop('password', None)
                user['id'] = user.get('user_id') or user.get('id')

            return jsonify({'success': True, 'message': 'Profile updated successfully!', 'user': user})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

@app.route('/api/users', methods=['GET'])
def get_all_users():
    conn, db_type = get_db_connection()
    try:
        if db_type == "mysql":
            with conn.cursor() as cursor:
                cursor.execute("SELECT user_id, user_id AS id, name, email, phone, country, role, created_at FROM users ORDER BY user_id DESC")
                users = cursor.fetchall()
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT user_id, user_id AS id, name, email, phone, country, role, created_at FROM users ORDER BY user_id DESC")
            users = [dict(row) for row in cursor.fetchall()]

        return jsonify({'success': True, 'users': users})
    except Exception as e:
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

    conn, db_type = get_db_connection()
    try:
        if db_type != 'sqlite':
            return jsonify({'success': False, 'message': 'Support storage is not configured for this database yet.'}), 503
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO support_tickets (email, category, message) VALUES (?, ?, ?)',
            (email, category, message)
        )
        conn.commit()
        return jsonify({'success': True, 'ticketId': cursor.lastrowid, 'message': 'Support request received.'}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': 'Request could not be processed.'}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    print(f"TravelSphere Python Flask Backend running on http://localhost:{PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=True)
