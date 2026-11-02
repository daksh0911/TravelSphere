import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// MySQL connection pool to travel_db (phpMyAdmin)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'travel_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ Connected to MySQL travel_db database (phpMyAdmin)');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('Make sure XAMPP/WAMP MySQL is running and travel_db exists in phpMyAdmin.');
  });

// Create a new user in the users table
export const createUser = async ({ name, email, password, phone, avatar_url = '' }) => {
  const passwordHash = bcrypt.hashSync(password, 10);
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      `INSERT INTO users (name, email, password, phone, avatar_url, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [name, email.toLowerCase().trim(), passwordHash, phone || '', avatar_url || '']
    );

    const [rows] = await conn.execute(
      `SELECT user_id, user_id AS id, name, email, phone, avatar_url, is_active, created_at FROM users WHERE user_id = ?`,
      [result.insertId]
    );
    return rows[0];
  } finally {
    conn.release();
  }
};

// Find a user by email in the users table
export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT user_id, user_id AS id, name, email, password, phone, avatar_url, is_active, created_at FROM users WHERE email = ?`,
    [email.toLowerCase().trim()]
  );
  return rows[0] || null;
};

// Get all users from the users table
export const getAllUsers = async () => {
  const [rows] = await pool.execute(
    `SELECT user_id, user_id AS id, name, email, phone, avatar_url, is_active, created_at FROM users ORDER BY user_id DESC`
  );
  return rows;
};

// Ensure sample tour packages exist in database for browsing
export const ensurePackagesExist = async () => {
  const conn = await pool.getConnection();
  try {
    const [packages] = await conn.execute(`SELECT package_id FROM packages LIMIT 1`);
    if (packages.length === 0) {
      await conn.execute(
        `INSERT INTO packages (title, description, days, nights, price, image_url, rating, is_active)
         VALUES ('Kyoto Cherry Blossom Tour', 'Explore historic temples and blooming sakura gardens in Kyoto.', 7, 6, 1450.00, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80', 4.9, 1)`
      );
      await conn.execute(
        `INSERT INTO packages (title, description, days, nights, price, image_url, rating, is_active)
         VALUES ('Santorini Sunset Cruise & Villa', 'Luxurious caldera views and Aegean sea cruises in Greece.', 6, 5, 1780.00, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80', 4.8, 1)`
      );
      await conn.execute(
        `INSERT INTO packages (title, description, days, nights, price, image_url, rating, is_active)
         VALUES ('Bali Beach Villa & Temple Tour', 'Tropical beaches, rice terraces, and spiritual wellness in Bali.', 5, 4, 1120.00, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80', 4.7, 1)`
      );
      await conn.execute(
        `INSERT INTO packages (title, description, days, nights, price, image_url, rating, is_active)
         VALUES ('Swiss Alps Glacier & Scenic Express', 'Majestic glacier peaks and first class panoramic trains in Interlaken.', 8, 7, 2100.00, 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80', 5.0, 1)`
      );
      await conn.execute(
        `INSERT INTO packages (title, description, days, nights, price, image_url, rating, is_active)
         VALUES ('Paris Art & Seine Culinary Discovery', 'Louvre museum VIP access, Montmartre walks, and gourmet dining.', 5, 4, 1650.00, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80', 4.8, 1)`
      );
      await conn.execute(
        `INSERT INTO packages (title, description, days, nights, price, image_url, rating, is_active)
         VALUES ('Tokyo Bullet Train & Mt Fuji Quest', 'Shinkansen high-speed rail, Mt Fuji panoramas, and Michelin dining.', 6, 5, 1350.00, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80', 4.9, 1)`
      );
    }
  } catch (err) {
    console.error('Packages setup warning:', err.message);
  } finally {
    conn.release();
  }
};

// Fetch all available packages from MySQL
export const getAllPackages = async () => {
  await ensurePackagesExist();
  const [rows] = await pool.execute(`SELECT * FROM packages WHERE is_active = 1 ORDER BY package_id ASC`);
  return rows;
};

// Fetch complete live dashboard data for a user from MySQL
export const getUserDashboardData = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const userId = user.user_id;

  // Ensure packages table has explore items
  await ensurePackagesExist();

  // Fetch all available packages for exploration
  const packagesList = await getAllPackages();

  // Fetch live bookings with package details
  const [bookings] = await pool.execute(
    `SELECT 
        b.booking_id,
        CONCAT('BK-', b.booking_id) AS display_id,
        b.start_date,
        b.end_date,
        b.guests,
        b.total_amount,
        b.status,
        b.created_at,
        p.title AS package_title,
        p.image_url AS package_image,
        p.days,
        p.nights
     FROM bookings b
     LEFT JOIN packages p ON b.package_id = p.package_id
     WHERE b.user_id = ?
     ORDER BY b.booking_id DESC`,
    [userId]
  );

  // Fetch live wishlist with package details
  const [wishlist] = await pool.execute(
    `SELECT 
        w.wishlist_id,
        w.added_at,
        p.package_id,
        p.title,
        p.description,
        p.price,
        p.rating,
        p.image_url
     FROM wishlist w
     LEFT JOIN packages p ON w.target_id = p.package_id AND w.target_type = 'package'
     WHERE w.user_id = ?
     ORDER BY w.wishlist_id DESC`,
    [userId]
  );

  // Fetch live reviews submitted by user
  let reviews = [];
  try {
    await ensureReviewsTable();
    const [revRows] = await pool.execute(
      `SELECT review_id, user_id, booking_id, rating, comment, created_at FROM reviews WHERE user_id = ? ORDER BY review_id DESC`,
      [userId]
    );
    reviews = revRows;
  } catch (err) {
    console.warn('Reviews fetch warning:', err.message);
  }

  const { password: _password, ...userProfile } = user;

  return {
    user: userProfile,
    bookings,
    wishlist,
    reviews,
    allPackages: packagesList,
    stats: {
      totalBookings: bookings.length,
      activeBookings: bookings.filter(b => b.status === 'confirmed').length,
      wishlistCount: wishlist.length,
      reviewsCount: reviews.length
    }
  };
};

// Create a new booking in MySQL bookings table
export const createBooking = async ({ userId, packageId, startDate, endDate, guests, totalAmount }) => {
  const [result] = await pool.execute(
    `INSERT INTO bookings (user_id, package_id, start_date, end_date, guests, subtotal, discount, total_amount, status)
     VALUES (?, ?, ?, ?, ?, ?, 0.00, ?, 'confirmed')`,
    [userId, packageId, startDate || '2026-10-15', endDate || '2026-10-22', guests || 2, totalAmount, totalAmount]
  );
  return result.insertId;
};

// Add item to wishlist in MySQL wishlist table
export const addToWishlist = async ({ userId, packageId }) => {
  const [existing] = await pool.execute(
    `SELECT wishlist_id FROM wishlist WHERE user_id = ? AND target_id = ? AND target_type = 'package'`,
    [userId, packageId]
  );
  if (existing.length > 0) return existing[0].wishlist_id;

  const [result] = await pool.execute(
    `INSERT INTO wishlist (user_id, target_type, target_id) VALUES (?, 'package', ?)`,
    [userId, packageId]
  );
  return result.insertId;
};

// Update user profile in MySQL
export const updateUserProfile = async (userId, { name, phone }) => {
  await pool.execute(
    `UPDATE users SET name = ?, phone = ? WHERE user_id = ?`,
    [name, phone || '', userId]
  );
  const [rows] = await pool.execute(
    `SELECT user_id, user_id AS id, name, email, phone, avatar_url, is_active, created_at FROM users WHERE user_id = ?`,
    [userId]
  );
  return rows[0];
};

// Support tickets (table is created on first use so existing databases need no manual migration)
let ticketsReady;
const ensureTicketsTable = () => (ticketsReady ??= pool.execute(
  `CREATE TABLE IF NOT EXISTS support_tickets (
     ticket_id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(254) NOT NULL,
     topic VARCHAR(80) NOT NULL DEFAULT 'general',
     message TEXT NOT NULL,
     status VARCHAR(20) NOT NULL DEFAULT 'open',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`
).catch(err => { ticketsReady = undefined; throw err; }));

export const createSupportTicket = async ({ name, email, topic, message }) => {
  await ensureTicketsTable();
  const [result] = await pool.execute(
    `INSERT INTO support_tickets (name, email, topic, message) VALUES (?, ?, ?, ?)`,
    [name, email, topic, message]
  );
  return result.insertId;
};

export const listSupportTickets = async (limit = 100) => {
  await ensureTicketsTable();
  const [rows] = await pool.execute(
    `SELECT ticket_id, name, email, topic, message, status, created_at FROM support_tickets ORDER BY ticket_id DESC LIMIT ${Number(limit) | 0}`
  );
  return rows;
};

export const updateSupportTicketStatus = async (ticketId, status) => {
  await ensureTicketsTable();
  const [result] = await pool.execute(`UPDATE support_tickets SET status = ? WHERE ticket_id = ?`, [status, ticketId]);
  return result.affectedRows > 0;
};

// ----------------- REVIEWS (PDF Table 22 / Table 19) -----------------
let reviewsReady;
const ensureReviewsTable = () => (reviewsReady ??= pool.execute(
  `CREATE TABLE IF NOT EXISTS reviews (
     review_id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     booking_id INT NULL,
     rating TINYINT NOT NULL,
     comment TEXT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`
).catch(err => { reviewsReady = undefined; throw err; }));

export const createReview = async ({ userId, bookingId, rating, comment }) => {
  await ensureReviewsTable();
  const [result] = await pool.execute(
    `INSERT INTO reviews (user_id, booking_id, rating, comment) VALUES (?, ?, ?, ?)`,
    [userId, bookingId || null, rating, comment || null]
  );
  return result.insertId;
};

export const getReviewsByUser = async (userId) => {
  await ensureReviewsTable();
  const [rows] = await pool.execute(
    `SELECT review_id, user_id, booking_id, rating, comment, created_at FROM reviews WHERE user_id = ? ORDER BY review_id DESC`,
    [userId]
  );
  return rows;
};

export const getAllReviews = async () => {
  await ensureReviewsTable();
  const [rows] = await pool.execute(
    `SELECT r.review_id, r.user_id, r.booking_id, r.rating, r.comment, r.created_at, u.name AS user_name, u.email AS user_email
     FROM reviews r
     LEFT JOIN users u ON r.user_id = u.user_id
     ORDER BY r.review_id DESC`
  );
  return rows;
};

// ------------- CONTACT MESSAGES (PDF Table 17 / Table 14) -------------
let contactReady;
const ensureContactTable = () => (contactReady ??= pool.execute(
  `CREATE TABLE IF NOT EXISTS contact_messages (
     contact_id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(150) NOT NULL,
     subject VARCHAR(200) NULL,
     message TEXT NOT NULL,
     is_read TINYINT(1) DEFAULT 0,
     replied_at TIMESTAMP NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`
).catch(err => { contactReady = undefined; throw err; }));

export const createContactMessage = async ({ name, email, subject, message }) => {
  await ensureContactTable();
  const [result] = await pool.execute(
    `INSERT INTO contact_messages (name, email, subject, message, is_read) VALUES (?, ?, ?, ?, 0)`,
    [name, email, subject || '', message]
  );
  return result.insertId;
};

export const listContactMessages = async (limit = 100) => {
  await ensureContactTable();
  const [rows] = await pool.execute(
    `SELECT contact_id, name, email, subject, message, is_read, replied_at, created_at FROM contact_messages ORDER BY contact_id DESC LIMIT ${Number(limit) | 0}`
  );
  return rows;
};

// ----------------- PAYMENTS (PDF Table 21 / Table 18) -----------------
let paymentsReady;
const ensurePaymentsTable = () => (paymentsReady ??= pool.execute(
  `CREATE TABLE IF NOT EXISTS payments (
     payment_id INT AUTO_INCREMENT PRIMARY KEY,
     booking_id INT NOT NULL,
     user_id INT NOT NULL,
     amount DECIMAL(10,2) NOT NULL,
     method VARCHAR(50) NOT NULL,
     status VARCHAR(50) DEFAULT 'completed',
     transaction_ref VARCHAR(200) NULL,
     paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`
).catch(err => { paymentsReady = undefined; throw err; }));

export const recordPayment = async ({ bookingId, userId, amount, method = 'card', transactionRef }) => {
  await ensurePaymentsTable();
  const ref = transactionRef || `TXN-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const [result] = await pool.execute(
    `INSERT INTO payments (booking_id, user_id, amount, method, status, transaction_ref, paid_at)
     VALUES (?, ?, ?, ?, 'completed', ?, CURRENT_TIMESTAMP)`,
    [bookingId, userId, amount, method, ref]
  );
  return { paymentId: result.insertId, transactionRef: ref };
};

// ------------------ COUPONS (PDF Table 18 / Table 15) -----------------
let couponsReady;
const ensureCouponsTable = async () => {
  if (couponsReady) return couponsReady;
  couponsReady = (async () => {
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS coupons (
         coupon_id INT AUTO_INCREMENT PRIMARY KEY,
         code VARCHAR(50) UNIQUE NOT NULL,
         discount_type VARCHAR(20) NOT NULL,
         discount_value DECIMAL(10,2) NOT NULL,
         min_amount DECIMAL(10,2) DEFAULT 0.00,
         max_uses INT DEFAULT 100,
         used_count INT DEFAULT 0,
         expires_at DATE NULL,
         is_active TINYINT(1) DEFAULT 1,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       )`
    );
    // Seed initial coupon code if empty
    const [existing] = await pool.execute(`SELECT coupon_id FROM coupons LIMIT 1`);
    if (existing.length === 0) {
      await pool.execute(
        `INSERT INTO coupons (code, discount_type, discount_value, min_amount, max_uses, used_count, expires_at, is_active)
         VALUES ('TRAVEL20', 'percentage', 20.00, 100.00, 500, 0, '2027-12-31', 1),
                ('EXPLORE50', 'fixed', 50.00, 200.00, 200, 0, '2027-12-31', 1)`
      );
    }
  })().catch(err => { couponsReady = undefined; throw err; });
  return couponsReady;
};

export const validateCoupon = async (code, amount = 0) => {
  await ensureCouponsTable();
  const [rows] = await pool.execute(
    `SELECT coupon_id, code, discount_type, discount_value, min_amount, max_uses, used_count, expires_at, is_active
     FROM coupons
     WHERE UPPER(code) = UPPER(?) AND is_active = 1`,
    [code.trim()]
  );
  const coupon = rows[0];
  if (!coupon) return { valid: false, message: 'Invalid or expired coupon code.' };
  if (coupon.min_amount && Number(amount) < Number(coupon.min_amount)) {
    return { valid: false, message: `Minimum booking amount of $${coupon.min_amount} required.` };
  }
  const discount = coupon.discount_type === 'percentage'
    ? (Number(amount) * Number(coupon.discount_value)) / 100
    : Number(coupon.discount_value);
  return { valid: true, couponId: coupon.coupon_id, discount: Math.min(discount, Number(amount)), code: coupon.code };
};

// -------------- NOTIFICATIONS (PDF Table 20 / Table 17) --------------
let notificationsReady;
const ensureNotificationsTable = () => (notificationsReady ??= pool.execute(
  `CREATE TABLE IF NOT EXISTS notifications (
     notification_id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     title VARCHAR(200) NOT NULL,
     message TEXT NULL,
     is_read TINYINT(1) DEFAULT 0,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`
).catch(err => { notificationsReady = undefined; throw err; }));

export const createNotification = async ({ userId, title, message }) => {
  await ensureNotificationsTable();
  const [result] = await pool.execute(
    `INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, 0)`,
    [userId, title, message]
  );
  return result.insertId;
};

export const getNotificationsByUser = async (userId) => {
  await ensureNotificationsTable();
  const [rows] = await pool.execute(
    `SELECT notification_id, user_id, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY notification_id DESC`,
    [userId]
  );
  return rows;
};

export const markNotificationRead = async (notificationId) => {
  await ensureNotificationsTable();
  await pool.execute(`UPDATE notifications SET is_read = 1 WHERE notification_id = ?`, [notificationId]);
  return true;
};

export default pool;
