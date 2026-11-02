import { useContext } from 'react';
import CurrencyContext from './currencyContextObject';

const DEFAULT_RATES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', decimals: 0 },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)', decimals: 0 },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)', decimals: 0 },
  INR: { symbol: '₹', rate: 83.5, label: 'INR (₹)', decimals: 0 },
  JPY: { symbol: '¥', rate: 155.0, label: 'JPY (¥)', decimals: 0 },
  AED: { symbol: 'AED ', rate: 3.67, label: 'AED (د.إ)', decimals: 0 }
};

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currency: 'USD',
      setCurrency: () => {},
      rates: DEFAULT_RATES,
      convert: (num) => Number(num) || 0,
      formatPrice: (num) => `$${Number(num || 0).toLocaleString()}`,
      symbol: '$'
    };
  }
  return ctx;
}

export default useCurrency;
