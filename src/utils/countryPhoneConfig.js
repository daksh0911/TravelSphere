// Country and Phone validation configuration for TPMS
export const COUNTRIES = [
  { code: 'IN', dialCode: '+91', name: 'India', digits: 10, flag: '🇮🇳' },
  { code: 'US', dialCode: '+1', name: 'United States', digits: 10, flag: '🇺🇸' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', digits: 10, flag: '🇬🇧' },
  { code: 'CA', dialCode: '+1', name: 'Canada', digits: 10, flag: '🇨🇦' },
  { code: 'AU', dialCode: '+61', name: 'Australia', digits: 9, flag: '🇦🇺' },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', digits: 9, flag: '🇦🇪' },
  { code: 'DE', dialCode: '+49', name: 'Germany', digits: 10, flag: '🇩🇪' },
  { code: 'FR', dialCode: '+33', name: 'France', digits: 9, flag: '🇫🇷' },
  { code: 'SG', dialCode: '+65', name: 'Singapore', digits: 8, flag: '🇸🇬' },
  { code: 'JP', dialCode: '+81', name: 'Japan', digits: 10, flag: '🇯🇵' }
];

export const getCountryByCode = (codeOrDial) => {
  if (!codeOrDial) return COUNTRIES[0];
  const found = COUNTRIES.find(c => c.code === codeOrDial || c.dialCode === codeOrDial);
  return found || COUNTRIES[0];
};

export const sanitizeFullName = (val) => {
  // Allow only alphabetic characters and spaces
  return val.replace(/[^A-Za-z\s]/g, '');
};

export const sanitizePhoneDigits = (val, maxDigits = 10) => {
  // Allow only digits up to maxDigits
  return val.replace(/\D/g, '').slice(0, maxDigits);
};
