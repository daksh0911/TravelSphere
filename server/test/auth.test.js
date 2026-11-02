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
