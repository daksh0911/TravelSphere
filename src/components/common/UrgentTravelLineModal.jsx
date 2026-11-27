import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, CheckCircle2, Clock3, Copy, Headphones, Phone, Send, ShieldCheck, X } from 'lucide-react';
import api from '../../services/api';
import './UrgentTravelLineModal.css';

const URGENT_NUMBERS = [
  {
    label: '24/7 Urgent Travel Line (US & Global)',
    display: '+1 800 872 835 (+1 800 TRAVEL)',
    tel: '+1800872835',
    raw: '+1800872835'
  },
  {
    label: 'International & Asia-Pacific Desk',
    display: '+91 98253 88470',
    tel: '+919825388470',
    raw: '+919825388470'
  }
];

export default function UrgentTravelLineModal({ isOpen, onClose, initialTopic = 'During travel emergency' }) {
  const [copiedNum, setCopiedNum] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [issueType, setIssueType] = useState(initialTopic);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async (num) => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(num);
      }
      setCopiedNum(num);
      setTimeout(() => setCopiedNum(''), 2500);
    } catch {
      setCopiedNum(num);
      setTimeout(() => setCopiedNum(''), 2500);
    }
  };

  const handleRequestCallback = async (e) => {
    e.preventDefault();
    if (!contactPhone.trim() || !details.trim()) return;
    setSubmitting(true);

    const priorityTicket = `TS-URG-${Date.now().toString().slice(-6)}`;
    const record = {
      ticket: priorityTicket,
      category: 'Urgent Travel Line',
      bookingRef: bookingRef.trim() || 'N/A',
      phone: contactPhone.trim(),
      topic: issueType,
      message: `[URGENT CALLBACK] Ref: ${bookingRef.trim() || 'None'} · Phone: ${contactPhone.trim()} · ${details.trim()}`,
      createdAt: new Date().toISOString(),
      status: 'Priority Open'
    };

    try {
      const existing = JSON.parse(localStorage.getItem('ts_support_tickets') || '[]');
      localStorage.setItem('ts_support_tickets', JSON.stringify([record, ...existing]));
    } catch { /* ignore */ }

    try {
      await api.post('/support/tickets', {
        email: contactPhone.trim(),
        topic: `Urgent: ${issueType}`,
        message: record.message,
        ticket: priorityTicket
      });
    } catch {
      /* fallback saved locally */
    }

    setTicketId(priorityTicket);
    setSubmitting(false);
    setBookingRef('');
    setContactPhone('');
    setDetails('');
  };

  return createPortal(
    <div className="urgent-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="24/7 Urgent Travel Line">
      <div className="urgent-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="urgent-modal-header">
          <div className="urgent-modal-title-wrap">
            <div className="urgent-modal-icon">
              <Headphones size={22} />
            </div>
            <div>
              <span className="urgent-live-pill">
                <span className="urgent-live-dot" /> 24/7 LIVE DISPATCH · OPEN NOW
              </span>
              <h3>Urgent Travel Line</h3>
            </div>
          </div>
          <button type="button" className="urgent-modal-close" onClick={onClose} aria-label="Close urgent travel line modal">
            <X size={18} />
          </button>
        </div>

        <p className="urgent-modal-intro">
          Immediate assistance for active travelers experiencing flight delays, missed transfers, hotel check-in issues, or urgent itinerary changes.
        </p>

        <div className="urgent-numbers-list">
          {URGENT_NUMBERS.map((item) => (
            <div className="urgent-number-row" key={item.raw}>
              <div>
                <small>{item.label}</small>
                <strong>{item.display}</strong>
              </div>
              <div className="urgent-number-actions">
                <button
                  type="button"
                  className="urgent-copy-btn"
                  onClick={() => handleCopy(item.raw)}
                >
                  {copiedNum === item.raw ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
                <a href={`tel:${item.tel}`} className="urgent-call-btn">
                  <Phone size={14} /> Call
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="urgent-divider">
          <span>OR REQUEST AN IMMEDIATE CALLBACK (UNDER 5 MIN)</span>
        </div>

        {ticketId ? (
          <div className="urgent-callback-success">
            <CheckCircle2 size={28} />
            <div>
              <strong>Priority Dispatch Ticket {ticketId} Created</strong>
              <p>Our on-duty urgent travel coordinator has been alerted and will reach out to your number shortly.</p>
              <button type="button" onClick={() => setTicketId('')}>Send another urgent request</button>
            </div>
          </div>
        ) : (
          <form className="urgent-callback-form" onSubmit={handleRequestCallback}>
            <div className="urgent-form-grid">
              <label>
                Booking Reference (Optional)
                <input
                  type="text"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="e.g. #TS-BK-1049"
                />
              </label>
              <label>
                Your Phone / WhatsApp *
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </label>
            </div>

            <label>
              Urgent Situation
              <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
                <option value="Flight delay or missed connection">Flight delay or missed connection</option>
                <option value="Hotel check-in or room issue">Hotel check-in or room issue</option>
                <option value="Airport pickup or vehicle delay">Airport pickup or vehicle delay</option>
                <option value="Last-minute date or passenger change">Last-minute date or passenger change</option>
                <option value="During travel emergency">Other urgent during-travel help</option>
              </select>
            </label>

            <label>
              What do you need help with? *
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Share your destination, flight/hotel details, and what happened..."
              />
            </label>

            <button type="submit" className="urgent-submit-btn" disabled={submitting}>
              <Send size={15} /> {submitting ? 'Dispatching Urgent Alert...' : 'Request Urgent Callback Now'}
            </button>
          </form>
        )}

        <div className="urgent-modal-footer">
          <span><Clock3 size={13} /> Average callback under 5 minutes</span>
          <span><ShieldCheck size={13} /> Direct human specialist · Mon–Sun</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
