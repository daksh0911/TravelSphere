/**
 * Form Validation Utilities for TravelSphere
 */

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Email address is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Please enter a valid email address (e.g. name@example.com).';
  return '';
};

export const validatePassword = (password, minLength = 6) => {
  if (!password) return 'Password is required.';
  if (password.length < minLength) return `Password must be at least ${minLength} characters.`;
  return '';
};

export const validateName = (name, fieldName = 'Full name') => {
  if (!name || !name.trim()) return `${fieldName} is required.`;
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters long.`;
  return '';
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return 'Phone number is required.';
  const cleaned = phone.replace(/[\s()+-]/g, '');
  if (!/^\d{7,15}$/.test(cleaned)) return 'Please enter a valid phone number (7-15 digits).';
  return '';
};

export const validateDate = (dateStr, fieldName = 'Departure date') => {
  if (!dateStr) return `${fieldName} is required.`;
  const selectedDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(selectedDate.getTime())) return 'Please select a valid date.';
  if (selectedDate < today) return `${fieldName} cannot be in the past.`;
  return '';
};

export const validateDateRange = (startDateStr, endDateStr) => {
  const startErr = validateDate(startDateStr, 'Check-in date');
  if (startErr) return startErr;
  if (!endDateStr) return 'Check-out date is required.';
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (end <= start) return 'Check-out date must be after check-in date.';
  return '';
};

export const validateRequired = (val, fieldName = 'This field') => {
  if (!val || (typeof val === 'string' && !val.trim())) return `${fieldName} is required.`;
  return '';
};
