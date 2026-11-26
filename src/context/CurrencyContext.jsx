import { useState, useMemo, useCallback } from 'react';
import CurrencyContext from './currencyContextObject';

const EXCHANGE_RATES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', decimals: 0 },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)', decimals: 0 },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)', decimals: 0 },
  INR: { symbol: '₹', rate: 83.5, label: 'INR (₹)', decimals: 0 },
  JPY: { symbol: '¥', rate: 155.0, label: 'JPY (¥)', decimals: 0 },
  AED: { symbol: 'AED ', rate: 3.67, label: 'AED (د.إ)', decimals: 0 }
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try {
      return localStorage.getItem('travelsphere_currency') || 'USD';
    } catch {
      return 'USD';
    }
  });

  const setCurrency = useCallback((curr) => {
    if (EXCHANGE_RATES[curr]) {
      setCurrencyState(curr);
      try {
        localStorage.setItem('travelsphere_currency', curr);
      } catch {
        // local storage fallback
      }
    }
  }, []);

  const rateInfo = useMemo(() => EXCHANGE_RATES[currency] || EXCHANGE_RATES.USD, [currency]);

  const convert = useCallback((amountInUSD) => {
    const num = Number(amountInUSD) || 0;
    return Math.round(num * rateInfo.rate);
  }, [rateInfo]);

  const formatPrice = useCallback((amountInUSD) => {
    const converted = convert(amountInUSD);
    return `${rateInfo.symbol}${converted.toLocaleString()}`;
  }, [convert, rateInfo]);

  const value = useMemo(() => ({
    currency,
    setCurrency,
    rates: EXCHANGE_RATES,
    convert,
    formatPrice,
    symbol: rateInfo.symbol
  }), [currency, setCurrency, convert, formatPrice, rateInfo.symbol]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export default CurrencyProvider;
