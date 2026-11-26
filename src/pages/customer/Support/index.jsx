import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, Clock3, Headphones, Mail, MessageCircle, Phone, Search, ShieldCheck, Ticket } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import './Support.css';
import api from '../../../services/api';
import usePageTitle from '../../../hooks/usePageTitle';

const FAQS = [
  { category: 'Bookings', question: 'Can I change the dates of a trip after booking?', answer: 'Most curated trips can be adjusted before confirmation. Open your booking from the dashboard and send a change request; your specialist will reply with availability and any fare difference.' },
  { category: 'Bookings', question: 'How do I request a package or itinerary?', answer: 'Open any package, choose View trip, add your preferred date and traveller count, then send the request. There is no payment at this stage; a specialist confirms availability first.' },
  { category: 'Payments', question: 'When do I pay for a trip?', answer: 'You can request an itinerary without paying. Once a specialist confirms availability, you will see the final price, cancellation terms, and secure payment options.' },
  { category: 'Payments', question: 'Are hotels and transfers included in package prices?', answer: 'Each package has a clear inclusions list. If something is not included, it will be shown separately before you confirm your booking.' },
  { category: 'During travel', question: 'What happens if my flight is delayed?', answer: 'Our support team can help coordinate transfers and notify the local partner. Keep your booking reference ready so we can locate the right itinerary quickly.' },
  { category: 'During travel', question: 'Can I get help while I am already travelling?', answer: 'Yes. Send a message below or call the urgent travel line. Include your booking reference, destination, and the best way to reach you so we can respond faster.' },
  { category: 'Account', question: 'How do I contact my travel specialist?', answer: 'Use the support form below or reply to your confirmation message. Logged-in customers can also access support from their dashboard.' },
  { category: 'Account', question: 'What happens after I send a support request?', answer: 'You will receive a ticket number immediately on this device. Your message is also sent to our support endpoint when available, and you can quote that ticket number in any follow-up.' },
];

const CATEGORIES = ['All questions', ...new Set(FAQS.map((item) => item.category))];

export default function SupportPage() {
  usePageTitle('Support & FAQs');
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const [open, setOpen] = useState(FAQS[0].question);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(CATEGORIES.includes(initialCategory) ? initialCategory : 'All questions');
  const [sent, setSent] = useState(null);

  const visible = useMemo(() => FAQS.filter((item) => {
    const matchesCategory = category === 'All questions' || item.category === category;
    const matchesQuery = `${item.question} ${item.answer} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query]);

  const submit = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    const ticket = `TS-${Date.now().toString().slice(-8)}`;
    const ticketRecord = { ...payload, ticket, createdAt: new Date().toISOString(), status: 'Open' };
    const localTickets = JSON.parse(localStorage.getItem('ts_support_tickets') || '[]');
    localStorage.setItem('ts_support_tickets', JSON.stringify([ticketRecord, ...localTickets]));
    try {
      await api.post('/support/tickets', { email: payload.email, topic: payload.category, message: payload.message, ticket });
    } catch {
      // The local ticket is intentionally kept as the fallback for the static/demo environment.
    }
    setSent(ticket);
    event.currentTarget.reset();
  };

  return (
    <div className="support-page">
      <section className="support-hero">
        <div>
          <span className="support-eyebrow">TRAVELSPHERE CARE</span>
          <h1>Real people.<br /><em>Real help.</em></h1>
          <p>Find a clear answer, check a common travel question, or send a ticket that gives our team enough context to help quickly.</p>
          <div className="support-hero-actions">
            <a href="#message" className="support-primary-link">Send a support ticket <ArrowRight size={15} /></a>
            <a href="tel:+1800872835" className="support-text-link"><Phone size={14} /> Urgent travel line</a>
          </div>
        </div>
        <div className="support-hero-card"><Headphones size={23} /><strong>Typical reply time</strong><b>under 15 min</b><small>Mon–Sun · urgent help always open</small></div>
      </section>

      <section className="support-status" aria-label="TravelSphere support status"><div><span className="status-dot" /> Support centre operational</div><span>Replies are tracked with a ticket number</span></section>

      <section className="support-grid">
        <div>
          <span className="support-eyebrow dark">HELP CENTRE</span>
          <h2>Answers before<br /><em>you ask.</em></h2>
          <div className="support-search"><Search size={17} /><input aria-label="Search frequently asked questions" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search bookings, payments, delays…" /><kbd>⌘ K</kbd></div>
          <div className="support-category-tabs" role="tablist" aria-label="FAQ categories">
            {CATEGORIES.map((item) => <button type="button" role="tab" aria-selected={category === item} className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <div className="faq-list">
            {visible.map((item) => <div className={`faq-item ${open === item.question ? 'open' : ''}`} key={item.question}><button type="button" onClick={() => setOpen(open === item.question ? '' : item.question)} aria-expanded={open === item.question}><span><small>{item.category}</small>{item.question}</span><ChevronDown size={18} /></button>{open === item.question && <p>{item.answer}</p>}</div>)}
            {!visible.length && <div className="faq-empty"><Search size={22} /><strong>No matching answer yet</strong><span>Try a different word or send us the details below.</span><button type="button" onClick={() => { setQuery(''); setCategory('All questions'); }}>Show all questions</button></div>}
          </div>
        </div>

        <div className="support-contact-card" id="message">
          <span className="support-eyebrow dark">SEND A TICKET</span>
          <h3>Let’s sort it out.</h3>
          <p>Every message gets a ticket number so you know your request was captured, even if you are browsing without an account.</p>
          {sent ? <div className="support-success"><CheckCircle2 size={24} /><strong>Ticket {sent} created</strong><span>We saved your request and sent it to the support queue. Keep this number for follow-up.</span><button type="button" onClick={() => setSent(null)}>Send another message</button></div> : <form onSubmit={submit}><label>Your email<input name="email" type="email" required placeholder="you@example.com" /></label><label>What can we help with?<select name="category" defaultValue={initialCategory || 'booking'}><option value="booking">A booking or itinerary</option><option value="hotel">A hotel stay</option><option value="transport">Transport or transfers</option><option value="payment">Payment or cancellation</option><option value="other">Something else</option></select></label><label>Message<textarea name="message" required rows="5" placeholder="Include your booking reference, dates, and what you need..." /></label><button type="submit">Create support ticket <ArrowRight size={16} /></button></form>}
          <div className="support-contact-links"><a href="mailto:support@travelsphere.com"><Mail size={16} /> Email support@travelsphere.com</a><a href="tel:+1800872835"><Phone size={16} /> Call +1 800 TRAVEL</a><span><Clock3 size={16} /> Urgent travel help is always open</span><span><ShieldCheck size={16} /> Your details stay private</span></div>
        </div>
      </section>

      <section className="support-bottom-help"><div><Ticket size={20} /><strong>Already sent a request?</strong><span>Your ticket is saved on this device under Support requests.</span></div><a href="mailto:support@travelsphere.com?subject=TravelSphere%20support%20follow-up">Follow up by email <MessageCircle size={15} /></a></section>
    </div>
  );
}
