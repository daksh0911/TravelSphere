import { useMemo } from 'react';
import { 
  Plane, 
  Train, 
  Ship, 
  Sparkles, 
  CheckCircle2, 
  QrCode, 
  Compass, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import './TicketBoardingPass.css';

/**
 * Procedural SVG Barcode with authentic variable bar patterns
 */
export function TicketBarcode({ code = 'TS-772918', height = 34, light = false }) {
  const bars = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = (hash << 5) - hash + code.charCodeAt(i);
      hash |= 0;
    }
    const list = [];
    let seed = Math.abs(hash) || 829104;
    for (let i = 0; i < 34; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const width = (seed % 3) + 1;
      const isBlack = (i % 2 === 0) || (seed % 5 === 0);
      list.push({ width, isBlack });
    }
    return list;
  }, [code]);

  return (
    <div className={`ticket-barcode-container ${light ? 'light-mode' : ''}`}>
      <svg height={height} className="ticket-barcode-svg" preserveAspectRatio="none" viewBox="0 0 100 32">
        {bars.map((bar, idx) => {
          const x = (idx / bars.length) * 100;
          return bar.isBlack ? (
            <rect 
              key={idx} 
              x={`${x}%`} 
              y="0" 
              width={`${(bar.width / bars.length) * 100}%`} 
              height="100%" 
              fill="currentColor" 
            />
          ) : null;
        })}
      </svg>
      <span className="ticket-barcode-num">*{code}*</span>
    </div>
  );
}

/**
 * Scannable QR Code Vector Badge
 */
export function TicketQRCodeBadge({ code = 'TS-VERIFY-2026', size = 32 }) {
  return (
    <div className="ticket-qr-seal" title={`Encrypted Verification Hash: ${code}`}>
      <QrCode size={size} className="ticket-qr-icon" />
      <span className="ticket-qr-tag">SCAN</span>
    </div>
  );
}

/**
 * Rich Main Body Content for the Ticket
 */
export function TicketBoardingPassBody({
  ticket,
  passengerName = 'Alexander Wright',
  isTorn = false
}) {
  const IconComponent = ticket.transportType === 'train' 
    ? Train 
    : ticket.transportType === 'boat' 
      ? Ship 
      : ticket.transportType === 'art' 
        ? Sparkles 
        : Plane;

  return (
    <div className="ticket-full-body">
      {/* TOP BRAND & CLASS BAR */}
      <div className="ticket-body-topbar">
        <div className="ticket-carrier-badge">
          <IconComponent size={14} className="carrier-icon" />
          <span>{ticket.carrier || 'TRAVELSPHERE VIP'}</span>
        </div>
        <div className="ticket-class-pill" style={{ borderColor: ticket.accentColor || '#a3704c' }}>
          {ticket.classType || 'FIRST CLASS'}
        </div>
      </div>

      {/* HERO ROUTE & TITLE */}
      <div className="ticket-hero-route">
        {ticket.fromCode ? (
          <div className="route-codes-row">
            <div className="route-station">
              <span className="station-code">{ticket.fromCode}</span>
              <span className="station-city">{ticket.fromCity}</span>
            </div>
            <div className="route-connector">
              <div className="connector-line" />
              <div className="connector-icon-wrap" style={{ color: ticket.accentColor || '#e2b17a' }}>
                <IconComponent size={16} />
              </div>
              <div className="connector-line" />
            </div>
            <div className="route-station">
              <span className="station-code">{ticket.toCode}</span>
              <span className="station-city">{ticket.toCity}</span>
            </div>
          </div>
        ) : (
          <div className="gallery-title-wrap">
            <span className="gallery-pretitle">{ticket.carrier || 'EXHIBITION PASS'}</span>
            <h2 className="gallery-main-title">{ticket.title}</h2>
            <p className="gallery-subtitle">{ticket.subtitle || ticket.carrier}</p>
          </div>
        )}
      </div>

      {/* PASSENGER & 4-COLUMN DATA GRID */}
      <div className="ticket-data-grid">
        <div className="ticket-data-col passenger-col">
          <span className="data-label">PASSENGER</span>
          <span className="data-value passenger-name" title={passengerName}>
            {passengerName}
          </span>
        </div>

        <div className="ticket-data-col">
          <span className="data-label">DATE</span>
          <span className="data-value">{ticket.date || '18 Nov 2026'}</span>
        </div>

        <div className="ticket-data-col">
          <span className="data-label">{ticket.transportType === 'art' ? 'ACCESS' : 'GATE'}</span>
          <span className="data-value highlight-gold">{ticket.gate || 'Gate A04'}</span>
        </div>

        <div className="ticket-data-col">
          <span className="data-label">{ticket.transportType === 'art' ? 'FAST-TRACK' : 'SEAT'}</span>
          <span className="data-value highlight-seat">{ticket.seat || '04A'}</span>
        </div>
      </div>

      {/* SECURITY STRIP */}
      <div className="ticket-security-strip">
        <div className="strip-item">
          <ShieldCheck size={11} color="#22c55e" />
          <span>TS Guarantee · Verified PNR: {ticket.pnr || 'TS-772918'}</span>
        </div>
        <div className="strip-item">
          <Compass size={11} />
          <span>Priority Boarding Zone 1</span>
        </div>
      </div>

      {/* RUBBER STAMP OVERLAY WHEN TORN */}
      {isTorn && (
        <div className="ticket-torn-stamp-overlay">
          <div className="rubber-stamp-seal">
            <div className="stamp-inner-border">
              <span className="stamp-star">★ ★ ★</span>
              <span className="stamp-main-text">BOARDING VERIFIED</span>
              <span className="stamp-sub-text">SCANNED · SEAT {ticket.seat || '04A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Rich Perforated Stub Content
 */
export function TicketBoardingPassStub({
  ticket,
  passengerName = 'Alexander Wright',
  isTorn = false
}) {
  return (
    <div className="ticket-full-stub">
      {/* STUB HEADER */}
      <div className="stub-header-row">
        <span className="stub-class-tag" style={{ background: ticket.accentColor || '#a3704c' }}>
          {ticket.transportType === 'art' ? 'ADMIT ONE' : 'BOARDING PASS'}
        </span>
        <span className="stub-pnr-micro">{ticket.pnr ? `#${ticket.pnr.slice(-6)}` : '#284619'}</span>
      </div>

      {/* MINI ROUTE OR EVENT */}
      <div className="stub-route-mini">
        {ticket.fromCode ? (
          <div className="mini-route-badges">
            <span className="mini-code">{ticket.fromCode}</span>
            <ArrowRight size={11} className="mini-arrow" />
            <span className="mini-code">{ticket.toCode}</span>
          </div>
        ) : (
          <div className="mini-event-title">{ticket.title}</div>
        )}
        <div className="stub-passenger-initials">
          {passengerName.toUpperCase()}
        </div>
      </div>

      {/* GATE & SEAT BLOCK */}
      <div className="stub-seat-gate-box">
        <div className="seat-gate-cell">
          <span className="cell-lbl">{ticket.transportType === 'art' ? 'PASS' : 'GATE'}</span>
          <span className="cell-val">{ticket.gate || 'A04'}</span>
        </div>
        <div className="cell-divider" />
        <div className="seat-gate-cell">
          <span className="cell-lbl">{ticket.transportType === 'art' ? 'ENTRY' : 'SEAT'}</span>
          <span className="cell-val highlight">{ticket.seat || '04A'}</span>
        </div>
      </div>

      {/* AUTHENTIC BARCODE */}
      <div className="stub-barcode-section">
        <TicketBarcode code={ticket.pnr || 'TS-772918'} height={32} />
      </div>

      {/* DETACHMENT PULL HINT */}
      <div className="stub-detach-hint">
        {isTorn ? (
          <span className="hint-torn">
            <CheckCircle2 size={12} color="#22c55e" /> STUB DETACHED
          </span>
        ) : (
          <span className="hint-pull">
            <span>PULL TO TEAR</span>
            <ChevronRight size={13} className="pull-arrow-anim" />
          </span>
        )}
      </div>
    </div>
  );
}

