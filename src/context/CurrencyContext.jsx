import { useState, useMemo, useCallback, useEffect } from 'react';
import CurrencyContext from './currencyContextObject';
import {
  EXCHANGE_RATES,
  CURRENCY_STORAGE_KEY,
  getStoredCurrency,
  getRateInfo,
  convertUsdAmount,
  formatCurrencyPrice,
} from '../utils/currencyFormat';

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(getStoredCurrency);

  const setCurrency = useCallback((curr) => {
    if (EXCHANGE_RATES[curr]) {
      setCurrencyState(curr);
      try {
        localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
      } catch {
        // local storage fallback
      }
    }
  }, []);

  // Keep open dashboard/homepage tabs synchronized when currency changes elsewhere
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CURRENCY_STORAGE_KEY && e.newValue && EXCHANGE_RATES[e.newValue]) {
        setCurrencyState(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const rateInfo = useMemo(() => getRateInfo(currency), [currency]);

  const convert = useCallback(
    (amountInUSD, decimals = 0) => convertUsdAmount(amountInUSD, currency, decimals),
    [currency]
  );

  const formatPrice = useCallback(
    (amountInUSD, options) => formatCurrencyPrice(amountInUSD, currency, options),
    [currency]
  );

  const value = useMemo(() => ({
    currency,
    setCurrency,
    rates: EXCHANGE_RATES,
    convert,
    formatPrice,
    symbol: rateInfo.symbol,
  }), [currency, setCurrency, convert, formatPrice, rateInfo.symbol]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export default CurrencyProvider;
