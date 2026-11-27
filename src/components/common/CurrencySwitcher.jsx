import { Globe } from 'lucide-react';
import { useCurrency } from '../../context/useCurrency';

/**
 * Compact currency selector for dashboard headers, synced with global CurrencyContext.
 */
export default function CurrencySwitcher({ variant = 'light' }) {
  const { currency, setCurrency, rates } = useCurrency();
  const isDark = variant === 'dark';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.32rem 0.6rem',
        borderRadius: '10px',
        background: isDark ? 'rgba(255, 255, 255, 0.12)' : '#f8fafc',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid #cbd5e1',
        color: isDark ? '#f8fafc' : '#1e293b',
        flexShrink: 0,
      }}
    >
      <Globe size={14} aria-hidden="true" style={{ opacity: 0.85, flexShrink: 0 }} />
      <select
        aria-label="Dashboard Display Currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          fontSize: '0.78rem',
          fontWeight: 700,
          cursor: 'pointer',
          outline: 'none',
          paddingRight: '0.15rem',
        }}
      >
        {Object.entries(rates).map(([code, info]) => (
          <option key={code} value={code} style={{ color: '#0f172a', background: '#ffffff' }}>
            {info.label}
          </option>
        ))}
      </select>
    </div>
  );
}
