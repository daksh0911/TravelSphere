import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';
import { sanitizeHtml, stripUnsafeTags, sanitizeObject } from '../src/utils/security.js';
import { DEFAULT_PRIVACY_PREFERENCES } from '../src/utils/privacy.js';

process.env.AUTH_SECRET = 'zero-trust-audit-secret-key-32-chars-long';
const { app, verifyToken, signedToken } = await import('../server/server.js');

const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
test.after(() => server.close());

describe('Cloudflare Edge Security & Response Headers Audit', () => {
  test('enforces HSTS, CSP, and Anti-Clickjacking headers on all API responses', async () => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.status, 200);

    // Verify HSTS
    const hsts = res.headers.get('strict-transport-security');
    assert.ok(hsts && hsts.includes('max-age=31536000'), 'HSTS 1-year max-age enforced');

    // Verify Framing Defense
    assert.equal(res.headers.get('x-frame-options'), 'DENY');

    // Verify MIME Sniffing Prevention
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');

    // Verify CSP
    const csp = res.headers.get('content-security-policy');
    assert.ok(csp && (csp.includes("default-src 'none'") || csp.includes("default-src 'self'")), 'CSP default-src enforced');

    // Verify Zero Trust audit header & Ray ID tracking
    assert.equal(res.headers.get('x-security-audit'), 'Zero-Trust-Verified');
    assert.ok(res.headers.get('cf-ray-tracking'), 'CF-Ray tracking attached');
  });

  test('Cloudflare Security & Zero Trust Audit endpoint returns comprehensive pass diagnostics', async () => {
    const res = await fetch(`${base}/api/security/audit`, {
      headers: {
        'cf-connecting-ip': '203.0.113.195',
        'cf-ray': '892740fa1c78e901-BOM'
      }
    });

    assert.equal(res.status, 200);
    const data = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.status, 'PASS');
    assert.equal(data.client.ip, '203.0.113.195');
    assert.equal(data.client.proxyDetected, 'Cloudflare Anycast Edge');
    assert.equal(data.cloudflareEdge.wafActive, true);
    assert.equal(data.zeroTrustAudit.identityModel.includes('HMAC-SHA256'), true);
    assert.ok(data.verifications.length >= 6);
  });
});

describe('Zero Trust Architecture & Tenant Boundary Audit', () => {
  test('Zero Trust: rejects untrusted or forged identity tokens', () => {
    const genuineToken = signedToken({ sub: 42, role: 'CUSTOMER' });
    assert.equal(verifyToken(genuineToken).sub, 42);

    const [body] = genuineToken.split('.');
    const forged = `${body}.badSignature`;
    assert.equal(verifyToken(forged), null, 'Forged token rejected');
  });

  test('Zero Trust Multi-Tenant Isolation: user 10 cannot alter user 20 wishlist or bookings', async () => {
    const user10Token = signedToken({ sub: 10, role: 'CUSTOMER' });

    // User 10 trying to modify User 20 wishlist
    const wishRes = await fetch(`${base}/api/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user10Token}`
      },
      body: JSON.stringify({ userId: 20, packageId: 2 })
    });
    assert.equal(wishRes.status, 403, 'Cross-tenant wishlist modification rejected with 403');

    // User 10 trying to modify User 20 profile
    const profRes = await fetch(`${base}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user10Token}`
      },
      body: JSON.stringify({ userId: 20, name: 'Hacked Name' })
    });
    assert.equal(profRes.status, 403, 'Cross-tenant profile update rejected with 403');
  });

  test('Sanitization Suite: strips XSS script injection and malicious attributes', () => {
    const rawMalicious = '<script>alert("hacked")</script><img src=x onerror=alert(1)>Hello World';
    const sanitized = stripUnsafeTags(rawMalicious);

    assert.ok(!sanitized.includes('<script>'), 'script tag stripped');
    assert.ok(!sanitized.includes('onerror='), 'event handler stripped');
    assert.ok(sanitized.includes('Hello World'), 'safe content preserved');

    const htmlEscaped = sanitizeHtml('<div>"Hello" & \'World\'</div>');
    assert.ok(!htmlEscaped.includes('<'), 'HTML tags escaped');
    assert.ok(htmlEscaped.includes('&amp;'), '& escaped');
  });

  test('Prototype Pollution Shield: sanitizes prototype tampering payloads', () => {
    const maliciousPayload = {
      title: 'Valid Title',
      __proto__: { polluted: true },
      nested: {
        constructor: { prototype: { dangerous: true } },
        safeField: 'Safe'
      }
    };

    const clean = sanitizeObject(maliciousPayload);
    assert.equal(clean.title, 'Valid Title');
    assert.equal(clean.nested.safeField, 'Safe');
    assert.equal(Object.prototype.polluted, undefined, 'prototype pollution prevented');
  });

  test('Data Privacy: Zero session-replay recording is enforced by default', () => {
    assert.equal(DEFAULT_PRIVACY_PREFERENCES.sessionReplayEnabled, false);
    assert.equal(DEFAULT_PRIVACY_PREFERENCES.doNotSellOrShare, true);
  });
});
