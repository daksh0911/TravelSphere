import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle,
  BookmarkCheck,
  CreditCard,
  Search,
  CalendarCheck,
  RotateCcw,
  Headphones
} from 'lucide-react';
import './LiveTravelMessenger.css';

const FAQ_CHIPS = [
  { icon: BookmarkCheck, label: 'How to book a package?', query: 'How to book a travel package' },
  { icon: Search, label: 'Search destinations', query: 'How to search for destinations' },
  { icon: CalendarCheck, label: 'Check booking status', query: 'How to check booking status' },
  { icon: RotateCcw, label: 'How to cancel a booking?', query: 'How to cancel a booking' },
  { icon: CreditCard, label: 'How to make payments?', query: 'How to make payments' },
  { icon: HelpCircle, label: 'How to use wishlist?', query: 'How to use the wishlist' },
  { icon: Headphones, label: 'Contact support', query: 'How to contact customer support' }
];

let messageIdCounter = 1;
const createMessage = (sender, text) => ({
  id: `msg-${sender}-${Date.now()}-${messageIdCounter++}`,
  sender,
  text,
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
});

function getTravelMateReply(userText) {
  const t = userText.toLowerCase().trim();

  // 1. How to book a travel package
  if (t.includes('book') && (t.includes('package') || t.includes('trip') || t.includes('tour'))) {
    return "To book a travel package on TravelSphere:\n1. Click 'Tour Packages' from the top navigation bar.\n2. Filter by category (Culture, Adventure, Beach, Luxury) or search your desired location.\n3. Click 'View trip' on your chosen package to inspect the day-wise itinerary, luxury hotel, and tour guide.\n4. Select your travel dates and number of guests.\n5. Click 'Reserve Package' to confirm your booking and generate your instant boarding pass!";
  }

  // 2. How to book a hotel
  if (t.includes('hotel') && (t.includes('book') || t.includes('reserve') || t.includes('stay'))) {
    return "To book a luxury hotel or partner stay:\n1. Open 'More' > 'Hotels' from the navigation menu.\n2. Browse luxury properties like Aman Kyoto, Grace Santorini, or Mandapa Ubud.\n3. Filter by amenities such as private pools, wellness spas, or caldera views.\n4. Click 'View Property' and select your check-in dates and suite type to secure your reservation.";
  }

  // 3. How to search for destinations
  if (t.includes('destination') || t.includes('search') || t.includes('explore') || t.includes('find')) {
    return "To search for destinations:\n1. Click 'Destinations' in the top navbar.\n2. Use the live search bar to type any country, city, or experience (e.g., 'Kyoto', 'Swiss Alps', 'Santorini').\n3. Switch to 'Interactive World Map' mode to click on interactive 3D pins across the globe!\n4. Click any destination card to see curated seasonal weather guides, top sights, and local secrets.";
  }

  // 4. How to check booking status
  if (t.includes('status') || t.includes('check booking') || t.includes('my booking') || t.includes('reservation')) {
    return "To check your booking status:\n1. Log into your account and open your 'Customer Dashboard'.\n2. Navigate to the 'My Bookings' tab.\n3. Here you will see your active, confirmed, and upcoming trips along with your reference ID (#TS-BK-XXXX).\n4. Click 'PDF Voucher' to download your official travel confirmation and QR pass!";
  }

  // 5. How to cancel a booking
  if (t.includes('cancel') || t.includes('refund')) {
    return "Cancellation Policy & Steps:\n1. Under TravelSphere's Protected Booking Guarantee, all verified packages include 100% free cancellation up to 48 hours before departure.\n2. To request cancellation, go to your 'Customer Dashboard' > 'Bookings' and select 'Manage' > 'Request Cancellation'.\n3. Refunds are automatically credited back to your original payment method within 3-5 business days.";
  }

  // 6. How to make payments
  if (t.includes('pay') || t.includes('split') || t.includes('card') || t.includes('currency') || t.includes('money')) {
    return "Payment & Split Options:\n1. TravelSphere supports all major Credit/Debit Cards, Net Banking, and UPI.\n2. Use our 'Split Group Bill' feature inside the booking modal to divide trip costs equally between travel companions.\n3. You can toggle between 6 live currencies (USD $, INR ₹, EUR €, GBP £, JPY ¥, AED د.إ) directly from the currency selector in the top navbar!";
  }

  // 7. How to use wishlist
  if (t.includes('wishlist') || t.includes('save') || t.includes('heart') || t.includes('favorite')) {
    return "How to use the Wishlist:\n1. Click the Heart (❤️) icon on any travel package card or package details page.\n2. The package will be instantly saved to your saved trips.\n3. To view all your saved trips, visit 'My Dashboard' and switch to the 'Dream Escapes (Wishlist)' tab.\n4. You can book directly or remove items anytime with one click!";
  }

  // 8. How to contact customer support
  if (t.includes('support') || t.includes('contact') || t.includes('help') || t.includes('agent') || t.includes('human') || t.includes('phone') || t.includes('email')) {
    return "How to contact Customer Support:\n1. Visit the 'Support' or 'Contact' page from the top menu.\n2. Submit an instant support ticket or general inquiry form.\n3. Emergency Hotline: +1 (800) 555-0199 (Available 24/7).\n4. Email Support: care@travelsphere.com.\nOur global response team responds within 15 minutes!";
  }

  // General greeting / fallback
  if (t.includes('hi') || t.includes('hello') || t.includes('hey') || t.includes('namaste')) {
    return "Hello! I am TravelMate AI, your 24/7 TravelSphere assistant. I can help you search destinations, book packages, check reservations, understand payments, or contact human support. How can I assist you today?";
  }

  return "I'm TravelMate AI, your dedicated assistant! You can ask me how to book a package, check your reservations, explore destinations, use the wishlist, or process cancellations. You can also pick one of the quick guide buttons below!";
}

const INITIAL_MESSAGES = [
  {
    id: 'm1',
    sender: 'assistant',
    text: "Hello! I am TravelMate AI, your 24/7 customer support and travel companion. How can I help you explore, book, or manage your journeys today?",
    time: 'Just now'
  }
];

export default function LiveTravelMessenger() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ts_travelmate_chat_history');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return INITIAL_MESSAGES;
  });

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('ts_travelmate_chat_history', JSON.stringify(messages));
    } catch { /* ignore */ }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const userMsg = createMessage('user', text);

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = getTravelMateReply(text);
      const botMsg = createMessage('assistant', replyText);
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 650);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="ts-messenger-wrapper">
      {!isOpen && (
        <button 
          className="ts-messenger-launcher" 
          onClick={handleOpen}
          aria-label="Open TravelMate AI Assistant"
        >
          <span className="launcher-pulse-dot" />
          <Sparkles size={17} color="#f59e0b" />
          <span>TravelMate AI</span>
          {unreadCount > 0 && <span className="launcher-badge">{unreadCount}</span>}
        </button>
      )}

      {isOpen && (
        <div className="ts-messenger-window" role="dialog" aria-label="TravelMate AI Chat">
          {/* Header */}
          <div className="ts-messenger-header">
            <div className="header-provider-info">
              <div className="header-avatar" style={{ backgroundColor: '#a3704c' }}>
                <Sparkles size={20} color="#ffffff" />
                <span className="avatar-online-dot" />
              </div>
              <div>
                <h3>TravelMate AI</h3>
                <span className="provider-sub">Customer Support & FAQs</span>
              </div>
            </div>
            <div className="header-actions">
              <button 
                type="button" 
                className="btn-icon-header" 
                onClick={() => setIsOpen(false)}
                aria-label="Close TravelMate Assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick FAQ Chips */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {FAQ_CHIPS.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.query)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    color: '#334155',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#a3704c'; e.currentTarget.style.color = '#a3704c'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155'; }}
                >
                  <Icon size={12} color="#a3704c" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Area */}
          <div className="ts-messages-area">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`ts-msg-row ${m.sender === 'user' ? 'msg-user' : 'msg-provider'}`}
              >
                <div className="ts-msg-bubble">
                  <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                  <span className="ts-msg-time">{m.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="ts-msg-row msg-provider">
                <div className="ts-msg-bubble typing-indicator">
                  <span>TravelMate is typing</span>
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Footer Input */}
          <div className="ts-messenger-footer">
            <div className="ts-input-wrap">
              <input 
                type="text" 
                placeholder="Ask about booking, hotels, cancellation..." 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={400}
              />
              <button 
                type="button" 
                className="ts-btn-send"
                onClick={() => handleSendMessage()}
                disabled={!inputVal.trim() || isTyping}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.675rem', color: '#94a3b8', marginTop: '6px' }}>
              <ShieldCheck size={11} color="#16a34a" /> 24/7 Verified Customer Support & Travel Guide
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
