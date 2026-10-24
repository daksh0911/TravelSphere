/**
 * TravelSphere Client-Side Security & Input Sanitization Suite
 * Protects against XSS, script injection, HTML injection, prototype pollution, and malformed inputs.
 */

// HTML Character Entity Map for Escaping
const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;'
};

const HTML_ESCAPE_REGEX = /[&<>"'`/]/g;

/**
 * Escapes unsafe HTML characters to prevent XSS.
 * @param {string} input 
 * @returns {string} Safe escaped string
 */
export const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(HTML_ESCAPE_REGEX, (match) => HTML_ESCAPES[match]);
};

/**
 * Strips script tags, iframe tags, and javascript: URIs entirely.
 * @param {string} input 
 * @returns {string} Sanitized string
 */
export const stripUnsafeTags = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:[^"']*/gi, '')
    .replace(/data:\s*text\/html[^"']*/gi, '')
    .replace(/on\w+\s*=/gi, ''); // Removes inline event handlers (onclick=, onload=, onerror=)
};

/**
 * Cleans user text inputs: trims whitespace, strips tags, limits max length.
 * @param {string} value 
 * @param {number} maxLength 
 * @returns {string}
 */
export const sanitizeText = (value, maxLength = 250) => {
  if (typeof value !== 'string') return '';
  const stripped = stripUnsafeTags(value.trim());
  return stripped.slice(0, maxLength);
};

/**
 * Validates strictly formatted email addresses against RFC 5322 regex.
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
};

/**
 * Enforces strong password requirements.
 * Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number.
 * @param {string} password 
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateStrongPassword = (password) => {
  if (typeof password !== 'string' || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must include at least one numeric digit.' };
  }
  return { valid: true };
};

/**
 * Validates URLs against open redirect / SSRF vulnerability by enforcing permitted protocols.
 * Only allows relative paths or http/https.
 * @param {string} url 
 * @returns {boolean}
 */
export const isValidSafeUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) return false;
  const trimmed = url.trim();
  // Safe relative URLs (e.g. /destination-images/bali.webp)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  try {
    const parsed = new URL(trimmed);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Deep-sanitizes JavaScript objects to avoid Prototype Pollution (__proto__, constructor, prototype).
 * @param {object} obj 
 * @returns {object} Safe cloned object
 */
export const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const clean = Object.create(null);
  for (const [key, value] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue; // Block Prototype Pollution vectors
    }
    clean[key] = sanitizeObject(value);
  }
  return clean;
};

export default {
  sanitizeHtml,
  stripUnsafeTags,
  sanitizeText,
  isValidEmail,
  validateStrongPassword,
  isValidSafeUrl,
  sanitizeObject
};
