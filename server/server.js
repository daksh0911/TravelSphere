import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, getAllUsers, getUserDashboardData, updateUserProfile, createBooking, addToWishlist, getAllPackages, createSupportTicket, listSupportTickets, updateSupportTicketStatus } from './db.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const AUTH_SECRET = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.AUTH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('AUTH_SECRET must be set in production.');
}
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173').split(',').map(value => value.trim()).filter(Boolean);
const attempts = new Map();

const cleanText = (value, max = 160) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validId = value => Number.isInteger(Number(value)) && Number(value) > 0;
const safeError = (res, status, message) => res.status(status).json({ success: false, message });
const signedToken = payload => {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
};
const verifyToken = token => {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url');
  const a = Buffer.from(signature || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload.exp > Date.now() ? payload : null;
  } catch { return null; }
};
const requireAuth = (req, res, next) => {
  const header = req.get('authorization') || '';
  const payload = header.startsWith('Bearer ') ? verifyToken(header.slice(7)) : null;
  if (!payload) return safeError(res, 401, 'Please sign in to continue.');
  req.auth = payload;
  next();
};
const requireRole = (...roles) => (req, res, next) => (
  roles.includes(String(req.auth?.role || '').toUpperCase()) ? next() : safeError(res, 403, 'You do not have permission to do that.')
);
const isSelf = (req, userId) => String(req.auth.sub) === String(userId);
const rateLimit = (windowMs, max, keyPrefix) => (req, res, next) => {
  const key = `${keyPrefix}:${req.ip}`;
  const now = Date.now();
  const current = attempts.get(key) || { count: 0, reset: now + windowMs };
  if (now > current.reset) { current.count = 0; current.reset = now + windowMs; }
  current.count += 1;
  attempts.set(key, current);
  if (current.count > max) return safeError(res, 429, 'Too many requests. Please try again later.');
  next();
};

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attempts) if (now > entry.reset) attempts.delete(key);
}, 60_000).unref();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  });
  next();
});
app.use(cors({ origin: (origin, callback) => !origin || allowedOrigins.includes(origin) ? callback(null, true) : callback(new Error('Origin not allowed')), methods: ['GET', 'POST', 'PUT', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Api-Key'], credentials: false }));
app.use(express.json({ limit: '32kb', strict: true }));
app.use(rateLimit(60_000, 180, 'api'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'TravelSphere Backend Server Running' }));

app.get('/api/packages', async (req, res) => {
  try { return res.json({ success: true, packages: await getAllPackages() }); }
  catch (error) { console.error('Package query failed:', error.message); return safeError(res, 500, 'Failed to fetch packages.'); }
});

app.post('/api/auth/register', rateLimit(15 * 60_000, 8, 'register'), async (req, res) => {
  try {
    const fullName = cleanText(req.body?.fullName, 100);
    const email = cleanText(req.body?.email, 254).toLowerCase();
    const phone = cleanText(req.body?.phone, 40);
    const country = cleanText(req.body?.country, 80);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (fullName.length < 2 || !validEmail(email) || password.length < 10 || password.length > 128) return safeError(res, 400, 'Use a valid name, email, and password of 10–128 characters.');
    if (await findUserByEmail(email)) return safeError(res, 409, 'An account with this email address already exists.');
    const newUser = await createUser({ name: fullName, email, password, phone, country });
    return res.status(201).json({ success: true, message: 'Account created successfully! You can now log in.', user: newUser });
  } catch (error) { console.error('Registration failed:', error.message); return safeError(res, 400, 'Registration failed. Please check your details and try again.'); }
});

app.post('/api/auth/login', rateLimit(15 * 60_000, 12, 'login'), async (req, res) => {
  try {
    const email = cleanText(req.body?.email, 254).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!validEmail(email) || !password) return safeError(res, 400, 'Email and password are required.');
    const user = await findUserByEmail(email);
    const isMatch = user && user.is_active !== 0 && await bcrypt.compare(password, user.password);
    if (!isMatch) return safeError(res, 401, 'Invalid email address or password.');
    const { password: _password, ...userProfile } = user;
    return res.json({ success: true, message: 'Login successful!', user: userProfile, token: signedToken({ sub: user.user_id || user.id, role: user.role || 'CUSTOMER' }) });
  } catch (error) { console.error('Login failed:', error.message); return safeError(res, 500, 'Unable to sign in right now.'); }
});

app.post('/api/support/tickets', rateLimit(60 * 60_000, 10, 'support'), async (req, res) => {
  try {
    const name = cleanText(req.body?.name, 100) || 'Guest';
    const email = cleanText(req.body?.email, 254).toLowerCase();
    const topic = cleanText(req.body?.topic, 80) || 'general';
    const message = cleanText(req.body?.message, 2000);
    if (name.length < 2 || !validEmail(email) || message.length < 10) return safeError(res, 400, 'Please provide your name, a valid email, and a message of at least 10 characters.');
    const ticketId = await createSupportTicket({ name, email, topic, message });
    return res.status(201).json({ success: true, message: 'Thanks! Our team will reply by email.', ticketId });
  } catch (error) { console.error('Support ticket failed:', error.message); return safeError(res, 500, 'Could not submit your request right now.'); }
});

app.post('/api/auth/social-login', rateLimit(15 * 60_000, 8, 'social-login'), (req, res) => safeError(res, 501, 'Social sign-in must be connected to a verified OAuth provider before it is enabled.'));

app.post('/api/bookings', requireAuth, async (req, res) => {
  try {
    const { userId, packageId, startDate, endDate, guests, totalAmount } = req.body || {};
    if (!validId(userId) || !validId(packageId) || !Number.isInteger(Number(guests)) || Number(guests) < 1 || Number(guests) > 30 || !Number.isFinite(Number(totalAmount)) || Number(totalAmount) < 0) return safeError(res, 400, 'Booking details are invalid.');
    if (!isSelf(req, userId)) return safeError(res, 403, 'You can only book for your own account.');
    const bookingId = await createBooking({ userId: Number(userId), packageId: Number(packageId), startDate: cleanText(startDate, 10), endDate: cleanText(endDate, 10), guests: Number(guests), totalAmount: Number(totalAmount) });
    return res.json({ success: true, message: 'Trip booked successfully!', bookingId });
  } catch (error) { console.error('Booking creation failed:', error.message); return safeError(res, 500, 'Failed to create booking.'); }
});

app.post('/api/wishlist', requireAuth, async (req, res) => {
  try {
    const { userId, packageId } = req.body || {};
    if (!validId(userId) || !validId(packageId)) return safeError(res, 400, 'userId and packageId are required.');
    if (!isSelf(req, userId)) return safeError(res, 403, 'You can only edit your own wishlist.');
    return res.json({ success: true, message: 'Saved to wishlist!', wishlistId: await addToWishlist({ userId: Number(userId), packageId: Number(packageId) }) });
  } catch (error) { console.error('Wishlist failed:', error.message); return safeError(res, 500, 'Failed to add to wishlist.'); }
});

app.get('/api/user-dashboard-data', requireAuth, async (req, res) => {
  try {
    const email = cleanText(req.query.email, 254).toLowerCase();
    if (!validEmail(email)) return safeError(res, 400, 'A valid email is required.');
    const dashboardData = await getUserDashboardData(email);
    if (!dashboardData) return safeError(res, 404, 'User not found.');
    if (!isSelf(req, dashboardData.user.user_id ?? dashboardData.user.id)) return safeError(res, 403, 'Access denied.');
    return res.json({ success: true, ...dashboardData });
  } catch (error) { console.error('Dashboard query failed:', error.message); return safeError(res, 500, 'Database error fetching dashboard data.'); }
});

app.get('/api/users/profile', requireAuth, async (req, res) => {
  try {
    const email = cleanText(req.query.email, 254).toLowerCase();
    if (!validEmail(email)) return safeError(res, 400, 'A valid email is required.');
    const user = await findUserByEmail(email);
    if (!user) return safeError(res, 404, 'User not found.');
    if (!isSelf(req, user.user_id ?? user.id)) return safeError(res, 403, 'Access denied.');
    const { password: _password, ...profile } = user;
    return res.json({ success: true, user: profile });
  } catch (error) { console.error('Profile query failed:', error.message); return safeError(res, 500, 'Database error.'); }
});

app.put('/api/users/profile', requireAuth, async (req, res) => {
  try {
    const { userId, name, phone } = req.body || {};
    if (!validId(userId) || cleanText(name, 100).length < 2) return safeError(res, 400, 'A valid user ID and name are required.');
    if (!isSelf(req, userId)) return safeError(res, 403, 'You can only edit your own profile.');
    return res.json({ success: true, message: 'Profile updated successfully!', user: await updateUserProfile(Number(userId), { name: cleanText(name, 100), phone: cleanText(phone, 40) }) });
  } catch (error) { console.error('Profile update failed:', error.message); return safeError(res, 500, 'Failed to update profile.'); }
});

const adminKeyMatches = req => {
  const configuredKey = process.env.ADMIN_API_KEY;
  const given = Buffer.from(req.get('x-admin-api-key') || '');
  const want = Buffer.from(configuredKey || '');
  return Boolean(configuredKey) && given.length === want.length && crypto.timingSafeEqual(given, want);
};
const adminOnly = (req, res, next) => {
  if (adminKeyMatches(req)) return next();
  return requireAuth(req, res, () => requireRole('ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN')(req, res, next));
};

app.get('/api/users', adminOnly, (req, res) => getAllUsers()
  .then(users => res.json({ success: true, users }))
  .catch(error => { console.error('User list failed:', error.message); return safeError(res, 500, 'Failed to fetch users.'); }));

app.get('/api/support/tickets', adminOnly, async (req, res) => {
  try { return res.json({ success: true, tickets: await listSupportTickets(100) }); }
  catch (error) { console.error('Ticket list failed:', error.message); return safeError(res, 500, 'Failed to fetch tickets.'); }
});

app.put('/api/support/tickets/:id', adminOnly, async (req, res) => {
  try {
    const status = cleanText(req.body?.status, 20).toLowerCase();
    if (!validId(req.params.id) || !['open', 'in_progress', 'resolved'].includes(status)) return safeError(res, 400, 'Invalid ticket or status.');
    return (await updateSupportTicketStatus(Number(req.params.id), status)) ? res.json({ success: true }) : safeError(res, 404, 'Ticket not found.');
  } catch (error) { console.error('Ticket update failed:', error.message); return safeError(res, 500, 'Failed to update ticket.'); }
});

app.use((req, res) => safeError(res, 404, 'Endpoint not found.'));
app.use((error, req, res, _next) => { console.error('Unhandled API error:', error.message); return safeError(res, 500, 'Request could not be processed.'); });

export { app, verifyToken, signedToken };

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  app.listen(PORT, () => console.log(`TravelSphere Backend API running on port ${PORT}`));
}
