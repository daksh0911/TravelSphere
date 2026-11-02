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

  const { password: _password, ...userProfile } = user;

  return {
    user: userProfile,
    bookings,
    wishlist,
    allPackages: packagesList,
    stats: {
      totalBookings: bookings.length,
      activeBookings: bookings.filter(b => b.status === 'confirmed').length,
      wishlistCount: wishlist.length
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

export default pool;
