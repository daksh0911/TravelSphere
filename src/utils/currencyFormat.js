export const EXCHANGE_RATES = {
  USD: { symbol: '$', pdfPrefix: '$', rate: 1.0, label: 'USD ($)', decimals: 0 },
  EUR: { symbol: '€', pdfPrefix: 'EUR ', rate: 0.92, label: 'EUR (€)', decimals: 0 },
  GBP: { symbol: '£', pdfPrefix: 'GBP ', rate: 0.79, label: 'GBP (£)', decimals: 0 },
  INR: { symbol: '₹', pdfPrefix: 'INR ', rate: 83.5, label: 'INR (₹)', decimals: 0 },
  JPY: { symbol: '¥', pdfPrefix: 'JPY ', rate: 155.0, label: 'JPY (¥)', decimals: 0 },
  AED: { symbol: 'AED ', pdfPrefix: 'AED ', rate: 3.67, label: 'AED (د.إ)', decimals: 0 },
};

export const CURRENCY_STORAGE_KEY = 'travelsphere_currency';

export function getStoredCurrency() {
  try {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved && EXCHANGE_RATES[saved]) return saved;
  } catch {
    // storage unavailable
  }
  return 'USD';
}
export function getRateInfo(currencyCode) {
  return EXCHANGE_RATES[currencyCode] || EXCHANGE_RATES.USD;
}

export function convertUsdAmount(amountInUSD, currencyCode, decimals = 0) {
  const num = Number(amountInUSD) || 0;
  const info = getRateInfo(currencyCode);
  const raw = num * info.rate;
  if (decimals > 0) {
    const factor = 10 ** decimals;
    return Math.round(raw * factor) / factor;
  }
  return Math.round(raw);
}

export function formatCurrencyPrice(amountInUSD, currencyCode = 'USD', options = {}) {
  const info = getRateInfo(currencyCode);
  const useDecimals = typeof options.decimals === 'number'
    ? options.decimals
    : 0;
  const converted = convertUsdAmount(amountInUSD, currencyCode, useDecimals);
  const formatted = converted.toLocaleString(undefined, {
    minimumFractionDigits: useDecimals,
    maximumFractionDigits: useDecimals,
  });
  return `${options.pdfSafe ? info.pdfPrefix : info.symbol}${formatted}`;
}

