import test from 'node:test';
import assert from 'node:assert/strict';

process.env.AUTH_SECRET = 'test-secret-test-secret-test-secret-123';
const { app, verifyToken, signedToken } = await import('../server.js');

const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
test.after(() => server.close());

const call = (path, { token, ...opts } = {}) => fetch(base + path, {
  ...opts,
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
});

test('valid token round-trips', () => {
  assert.equal(verifyToken(signedToken({ sub: 7, role: 'CUSTOMER' })).sub, 7);
});

test('tampered or malformed tokens are rejected', () => {
  const t = signedToken({ sub: 7, role: 'CUSTOMER' });
  const [body, sig] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ sub: 1, role: 'ADMIN', exp: Date.now() + 1e6 })).toString('base64url');
  assert.equal(verifyToken(`${forged}.${sig}`), null);
  assert.equal(verifyToken(`${body}.x`), null);
  assert.equal(verifyToken('garbage'), null);
  assert.equal(verifyToken(undefined), null);
});

test('protected routes require a token', async () => {
  for (const [method, path] of [['POST', '/api/bookings'], ['POST', '/api/wishlist'], ['PUT', '/api/users/profile'],
    ['GET', '/api/user-dashboard-data?email=a@b.co'], ['GET', '/api/users/profile?email=a@b.co']]) {
    const res = await call(path, { method, body: method === 'GET' ? undefined : '{}' });
    assert.equal(res.status, 401, `${method} ${path}`);
  }
});

test("a user cannot act on someone else's account", async () => {
  const token = signedToken({ sub: 7, role: 'CUSTOMER' });
  const body = JSON.stringify({ userId: 8, packageId: 1, guests: 2, totalAmount: 100 });
  assert.equal((await call('/api/bookings', { method: 'POST', token, body })).status, 403);
  assert.equal((await call('/api/wishlist', { method: 'POST', token, body })).status, 403);
  assert.equal((await call('/api/users/profile', { method: 'PUT', token, body: JSON.stringify({ userId: 8, name: 'Eve' }) })).status, 403);
});

test('admin list rejects missing and wrong keys', async () => {
  assert.equal((await call('/api/users')).status, 401);
  assert.equal((await fetch(base + '/api/users', { headers: { 'x-admin-api-key': 'nope' } })).status, 401);
});

test('admin list: customer token is forbidden, admin token passes the guard', async () => {
  const customer = signedToken({ sub: 7, role: 'CUSTOMER' });
  assert.equal((await call('/api/users', { token: customer })).status, 403);
  const admin = signedToken({ sub: 1, role: 'ADMIN' });
  assert.notEqual((await call('/api/users', { token: admin })).status, 403);
  assert.notEqual((await call('/api/users', { token: admin })).status, 401);
});

test('support tickets validate input', async () => {
  const bad = await call('/api/support/tickets', { method: 'POST', body: JSON.stringify({ email: 'nope', message: 'hi' }) });
  assert.equal(bad.status, 400);
});

test('ticket admin routes are protected and validated', async () => {
  assert.equal((await call('/api/support/tickets')).status, 401);
  assert.equal((await call('/api/support/tickets', { token: signedToken({ sub: 7, role: 'CUSTOMER' }) })).status, 403);
  const admin = signedToken({ sub: 1, role: 'ADMIN' });
  assert.equal((await call('/api/support/tickets/abc', { method: 'PUT', token: admin, body: JSON.stringify({ status: 'resolved' }) })).status, 400);
  assert.equal((await call('/api/support/tickets/3', { method: 'PUT', token: admin, body: JSON.stringify({ status: 'bogus' }) })).status, 400);
});

test('registration validates full name letters only and country phone digits', async () => {
  const badName = await call('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName: 'John123', email: 'valid@example.com', password: 'Password123!', phone: '9876543210' })
  });
  assert.equal(badName.status, 400);

  const badSpecialName = await call('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName: 'Rahul@Sharma', email: 'valid@example.com', password: 'Password123!', phone: '9876543210' })
  });
  assert.equal(badSpecialName.status, 400);

  const badPhoneIndiaShort = await call('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'John Doe',
      email: 'valid2@example.com',
      password: 'Password123!',
      countryCode: '+91',
      phone: '987654321' // 9 digits
    })
  });
  assert.equal(badPhoneIndiaShort.status, 400);

  const badPhoneIndiaLong = await call('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'John Doe',
      email: 'valid2@example.com',
      password: 'Password123!',
      countryCode: '+91',
      phone: '98765432100' // 11 digits
    })
  });
  assert.equal(badPhoneIndiaLong.status, 400);

  const missingPhone = await call('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'John Doe',
      email: 'valid2@example.com',
      password: 'Password123!',
      countryCode: '+91',
      phone: ''
    })
  });
  assert.equal(missingPhone.status, 400);
});

test('packages endpoint returns complete package details with itinerary and hotel', async () => {
  const res = await call('/api/packages/1');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.package);
  assert.ok(data.package.hotel);
  assert.ok(data.package.itinerary);
  assert.ok(Array.isArray(data.package.itinerary));
});

test('notification and review endpoints are protected with authentication', async () => {
  assert.equal((await call('/api/notifications')).status, 401);
  assert.equal((await call('/api/notifications/read-all', { method: 'PUT' })).status, 401);
  assert.equal((await call('/api/reviews/1', { method: 'PUT', body: JSON.stringify({ rating: 5 }) })).status, 401);
});
