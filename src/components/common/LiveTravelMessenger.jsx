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
  Headphones,
  Maximize2,
  Minimize2,
  Minus,
  ChevronUp,
  Trash2,
  Compass,
  ArrowRight,
  Plane,
  Building
} from 'lucide-react';
import './LiveTravelMessenger.css';

const CONCIERGE_CARDS = [
  {
    icon: Compass,
    title: 'Curated Tour Packages',
    desc: 'Bespoke itineraries, cultural tours & private beach escapes',
    query: 'How to book a travel package',
    tag: 'Tours'
  },
  {
    icon: Plane,
    title: 'Flights, Trains & Transit',
    desc: 'Scheduled flights, high-speed rail, bus routes & car rentals',
    query: 'How do I book flights or trains?',
    tag: 'Transport'
  },
  {
    icon: Building,
    title: 'Luxury Hotel Pavilions',
    desc: 'Aman Kyoto, Grace Santorini, Ubud villas & partner stays',
    query: 'How to book a luxury hotel',
    tag: 'Hotels'
  },
  {
    icon: CalendarCheck,
    title: 'My Bookings & QR Passes',
    desc: 'Inspect confirmed reservations, PDF vouchers & refund steps',
    query: 'How to check booking status',
    tag: 'Account'
  }
];

const FAQ_CHIPS = [
  { icon: BookmarkCheck, label: 'How to book a package?', query: 'How to book a travel package' },
  { icon: Search, label: 'Search destinations', query: 'How to search for destinations' },
  { icon: CalendarCheck, label: 'Check booking status', query: 'How to check booking status' },
  { icon: RotateCcw, label: 'How to cancel a booking?', query: 'How to cancel a booking' },
  { icon: CreditCard, label: 'How to make payments?', query: 'How to make payments' },
  { icon: HelpCircle, label: 'How to use wishlist?', query: 'How to use the wishlist' },
  { icon: Headphones, label: 'Contact support', query: 'How to contact customer support' }
];

const SUGGESTED_QUESTIONS = [
  'How do I book flights or trains?',
  'Where can I find my booking status?',
  'How to reserve a car rental?',
  'Can I cancel and get a 100% refund?',
  'What payment methods are supported?'
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

  // Flight booking
  if (t.includes('flight') || t.includes('plane') || t.includes('airline')) {
    return "✈️ How to Book Flights on TravelSphere:\n1. Open your Customer Dashboard and click the 'Flights' tab or '+ Book Flight' button.\n2. You can also visit our Vehicles & Transport portal to browse scheduled international jets.\n3. Enter your departure airport, arrival destination, and dates.\n4. Confirm your booking — your flight details, seat assignment, and PDF Boarding Pass will appear immediately in your dashboard!";
  }

  // Train and Bus booking
  if (t.includes('train') || t.includes('rail') || t.includes('bus') || t.includes('coach')) {
    return "🚆 & 🚌 Train and Bus Bookings:\n1. In your Customer Dashboard or Transport page, select either 'Trains' or 'Buses'.\n2. Pick your departure hub, route, and travel dates.\n3. Upon confirmation, your electronic ticket and seat number will be saved to your dashboard.\n4. You can download the official PDF travel voucher at any time with one click!";
  }

  // Car rental booking
  if (t.includes('car') || t.includes('rental') || t.includes('vehicle') || t.includes('drive')) {
    return "🚗 Separate Car Rental Booking:\n1. Navigate to 'Vehicles' from the top menu or select '+ Book Car' in your dashboard.\n2. Browse luxury sedans, SUVs, and convertible options.\n3. Choose self-drive or add a private chauffeur.\n4. Your car reservation details, pickup location, and return dates are tracked separately under your dashboard's 'Cars' section!";
  }

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
    return "To search for destinations:\n1. Click 'Destinations' in the top navbar or use the search bar on our homepage.\n2. Type any country, city, or experience (e.g., 'Kyoto', 'Swiss Alps', 'Santorini', 'Maldives').\n3. Switch between Card Grid view and 'Interactive World Map' mode to click on interactive 3D pins across the globe!\n4. Click any destination card to see curated seasonal weather guides, top sights, and local secrets.";
  }

  // 4. How to check booking status
  if (t.includes('status') || t.includes('check booking') || t.includes('my booking') || t.includes('reservation')) {
    return "To check your booking status:\n1. Log into your account and open your 'Customer Dashboard'.\n2. Navigate to the 'My Bookings' tab.\n3. Every booking displays an explicit status badge:\n   • 'Confirmed' for upcoming trips.\n   • 'Finished' for completed journeys.\n4. Click 'PDF Voucher' to download your official travel confirmation and QR boarding pass!";
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
    return "How to contact Customer Support:\n1. Visit the 'Support' or 'Contact' page from the top menu.\n2. Submit an instant support ticket or general inquiry form.\n3. Emergency Hotline: +1 (800) 555-0199 (Available 24/7).\n4. Email Support: care@travelsphere.com.\nOur global concierge team responds within 15 minutes!";
  }

  // General greeting / fallback
  if (t.includes('hi') || t.includes('hello') || t.includes('hey') || t.includes('namaste')) {
    return "Hello! I am TravelMate AI, your full-screen 24/7 TravelSphere assistant. I can help you search destinations, book flights, trains, buses, cars, check reservations, understand payments, or contact customer support. How can I assist you today?";
  }

  return "I'm TravelMate AI, your dedicated assistant! You can ask me how to book flights, trains, buses, cars, explore tour packages, check your booking status ('Confirmed' or 'Finished'), or process cancellations. You can also click any of the suggested topics on the left!";
}

const INITIAL_MESSAGES = [
  {
    id: 'm1',
    sender: 'assistant',
    text: "Hello! I am TravelMate AI, your 24/7 intelligent travel companion. How can I assist your explorations, flight/train/bus/car bookings, or account reservations today?",
    time: 'Just now'
  }
];

export default function LiveTravelMessenger() {
  // Modes: 'closed' | 'minimized' | 'standard' | 'maximized'
  const [viewMode, setViewMode] = useState('closed');
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

  // Derived convenience states
  const isOpen = viewMode === 'standard' || viewMode === 'maximized';
  const isFullScreen = viewMode === 'maximized';
  const isMinimized = viewMode === 'minimized';

  useEffect(() => {
    try {
      localStorage.setItem('ts_travelmate_chat_history', JSON.stringify(messages));
    } catch { /* ignore */ }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length > 1) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  // Keyboard navigation: Escape key handles window hierarchy
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (viewMode === 'maximized') {
          setViewMode('standard');
        } else if (viewMode === 'standard') {
          setViewMode('minimized');
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [viewMode]);

  const handleOpen = () => {
    setViewMode('standard');
    setUnreadCount(0);
  };

  const handleMinimize = () => {
    setViewMode('minimized');
  };

  const handleMaximize = () => {
    setViewMode('maximized');
  };

  const handleRestore = () => {
    setViewMode('standard');
  };

  const handleClose = () => {
    setViewMode('closed');
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear conversation history with TravelMate AI?')) {
      setMessages(INITIAL_MESSAGES);
      localStorage.removeItem('ts_travelmate_chat_history');
    }
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
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* 1. CLOSED MODE: FLOATING LAUNCHER BUTTON */}
      {viewMode === 'closed' && (
        <div className="ts-messenger-wrapper">
          <button 
            type="button"
            className="ts-messenger-launcher" 
            onClick={handleOpen}
            aria-label="Open TravelMate AI Assistant"
            title="Open TravelMate AI Assistant"
          >
            <span className="launcher-pulse-dot" />
            <Sparkles size={17} color="#f59e0b" />
            <span>TravelMate AI</span>
            {unreadCount > 0 && <span className="launcher-badge">{unreadCount}</span>}
          </button>
        </div>
      )}

      {/* 2. MINIMUM MODE: SLEEK DOCKED BOTTOM BAR */}
      {isMinimized && (
        <div 
          className="ts-ai-minimized-dock"
          onClick={handleRestore}
          role="button"
          tabIndex={0}
          aria-label="TravelMate AI Minimized - Click to open"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRestore(); }}
        >
          <div className="minimized-dock-info">
            <div className="minimized-dock-avatar">
              <Sparkles size={15} color="#ffffff" />
              <span className="minimized-online-dot" />
            </div>
            <div className="minimized-dock-text">
              <div className="minimized-dock-title">
                <span>TravelMate AI</span>
                <span className="minimized-status-pill">Active</span>
              </div>
              <span className="minimized-dock-sub">Click to resume conversation</span>
            </div>
          </div>

          <div className="minimized-dock-actions" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="minimized-action-btn"
              onClick={handleRestore}
              title="Standard Window View"
              aria-label="Standard Window View"
            >
              <ChevronUp size={15} />
            </button>
            <button
              type="button"
              className="minimized-action-btn"
              onClick={handleMaximize}
              title="Maximize to Full Screen"
              aria-label="Maximize to Full Screen"
            >
              <Maximize2 size={14} />
            </button>
            <button
              type="button"
              className="minimized-action-btn close-btn"
              onClick={handleClose}
              title="Close TravelMate AI"
              aria-label="Close TravelMate AI"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 3 & 4. STANDARD & MAXIMUM MODES: FULLY CAPABLE INTERACTION WINDOW */}
      {isOpen && (
        <div 
          className={`ts-ai-modal-overlay ${isFullScreen ? 'fullscreen' : 'windowed'}`}
          role="dialog" 
          aria-label="TravelMate AI Assistant"
          onClick={(e) => {
            // Mobile bottom sheet / overlay backdrop click dismisses to minimized
            if (e.target === e.currentTarget) {
              handleMinimize();
            }
          }}
        >
          <div 
            className={`ts-ai-container ${isFullScreen ? 'fullscreen-container' : 'windowed-container'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MOBILE SHEET DRAG HANDLE */}
            <div className="ts-mobile-sheet-handle" aria-hidden="true">
              <span className="ts-sheet-pill" />
            </div>

            {/* TOP HEADER */}
            <header className="ts-ai-header">
              <div className="ts-ai-header-left">
                <div className="ts-ai-avatar">
                  <Sparkles size={18} color="#ffffff" />
                  <span className="ts-ai-online-pulse" />
                </div>
                <div className="ts-ai-header-titles">
                  <div className="ts-ai-title-row">
                    <h3>TravelMate AI</h3>
                    {isFullScreen && (
                      <span className="ts-ai-badge">Full Immersion</span>
                    )}
                  </div>
                  <span className="ts-ai-subtitle">
                    {isFullScreen 
                      ? '24/7 AI Concierge · Full Screen Workspace' 
                      : '24/7 AI Travel Concierge · Online'}
                  </span>
                </div>
              </div>

              {/* WINDOW CONTROLS: CLEAR, MINIMIZE (MINIMUM), MAXIMIZE/RESTORE (MAXIMUM), CLOSE */}
              <div className="ts-ai-header-actions">
                <button 
                  type="button" 
                  className="ts-ai-btn-action ts-ai-btn-clear" 
                  onClick={handleClearHistory} 
                  title="Clear Conversation History"
                  aria-label="Clear Conversation History"
                >
                  <Trash2 size={15} />
                  <span className="btn-label-desktop">Clear</span>
                </button>

                {/* Minimum / Minimize Button */}
                <button 
                  type="button" 
                  className="ts-ai-btn-action ts-ai-btn-minimize" 
                  onClick={handleMinimize} 
                  title="Minimize to Bottom Dock (Minimum)"
                  aria-label="Minimize to Bottom Dock"
                >
                  <Minus size={16} />
                  <span className="btn-label-desktop">Minimize</span>
                </button>

                {/* Maximize / Restore Button */}
                {isFullScreen ? (
                  <button 
                    type="button" 
                    className="ts-ai-btn-action ts-ai-btn-size ts-ai-btn-restore" 
                    onClick={handleRestore} 
                    title="Restore to Standard Window"
                    aria-label="Restore to Standard Window"
                  >
                    <Minimize2 size={15} />
                    <span className="btn-label-desktop">Restore</span>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="ts-ai-btn-action ts-ai-btn-size ts-ai-btn-maximize" 
                    onClick={handleMaximize} 
                    title="Maximize to Full Screen (Maximum)"
                    aria-label="Maximize to Full Screen"
                  >
                    <Maximize2 size={15} />
                    <span className="btn-label-desktop">Maximize</span>
                  </button>
                )}

                {/* Close Button */}
                <button 
                  type="button" 
                  className="ts-ai-btn-action close-action" 
                  onClick={handleClose}
                  aria-label="Close TravelMate AI"
                  title="Close TravelMate AI"
                >
                  <X size={17} />
                </button>
              </div>
            </header>

            {/* MAIN WORKSPACE BODY */}
            <div className="ts-ai-body">
              
              {/* DESKTOP SIDEBAR WITH FAQ TOPICS (Active in Maximum view) */}
              <aside className="ts-ai-sidebar">
                <div className="ts-sidebar-section-title">
                  <Compass size={14} /> EXPLORE AI ASSISTANCE
                </div>
                <div className="ts-ai-faq-list">
                  {FAQ_CHIPS.map((chip, idx) => {
                    const Icon = chip.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className="ts-ai-sidebar-btn"
                        onClick={() => handleSendMessage(chip.query)}
                      >
                        <div className="ts-ai-btn-icon-wrap">
                          <Icon size={14} />
                        </div>
                        <span className="ts-ai-btn-text">{chip.label}</span>
                        <ArrowRight size={12} className="btn-chevron" />
                      </button>
                    );
                  })}
                </div>

                <div className="ts-sidebar-section-title" style={{ marginTop: '1.25rem' }}>
                  💡 FREQUENT QUESTIONS
                </div>
                <div className="ts-quick-prompts-list">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="ts-quick-prompt-pill"
                      onClick={() => handleSendMessage(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className="ts-ai-support-banner">
                  <div className="support-banner-title">Need Human Concierge?</div>
                  <div className="support-banner-phone">📞 +1 (800) 555-0199</div>
                  <div className="support-banner-sub">care@travelsphere.com · 24/7 Global Support</div>
                </div>
              </aside>

              {/* CHAT MESSAGES & INPUT AREA */}
              <main className="ts-ai-chat-column">
                
                {/* QUICK CHIP BAR FOR ACTIVE CONVERSATIONS (WHEN MESSAGES > 1) */}
                {messages.length > 1 && (
                  <div className="ts-ai-mobile-chips">
                    {FAQ_CHIPS.map((chip, idx) => {
                      const Icon = chip.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          className="ts-mobile-chip"
                          onClick={() => handleSendMessage(chip.query)}
                        >
                          <Icon size={12} />
                          <span>{chip.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* MESSAGES THREAD */}
                <div className="ts-ai-messages-scroller">
                  <div className="ts-messages-inner-wrap">

                    {/* CONCIERGE WELCOME HERO: Rendered when chat is in initial state */}
                    {messages.length <= 1 ? (
                      <div className="ts-ai-welcome-hero">
                        <div className="ts-welcome-hero-card">
                          <div className="ts-welcome-header">
                            <div className="ts-welcome-icon-orbit">
                              <Sparkles size={22} />
                            </div>
                            <div className="ts-welcome-badge">
                              <span className="ts-welcome-live-dot" />
                              <span>Concierge AI Online</span>
                            </div>
                            <h2 className="ts-welcome-headline">How can I assist your journey?</h2>
                            <p className="ts-welcome-sub">
                              Instant booking assistance, flight & rail routes, luxury hotel suites, and 24/7 reservation care.
                            </p>
                          </div>

                          <div className="ts-quick-cards-grid">
                            {CONCIERGE_CARDS.map((card, idx) => {
                              const Icon = card.icon;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  className="ts-quick-card"
                                  onClick={() => handleSendMessage(card.query)}
                                >
                                  <div className="ts-card-top-row">
                                    <div className="ts-card-icon-bubble">
                                      <Icon size={17} />
                                    </div>
                                    <span className="ts-card-category-tag">{card.tag}</span>
                                  </div>
                                  <div className="ts-card-info">
                                    <h4 className="ts-card-title">{card.title}</h4>
                                    <p className="ts-card-desc">{card.desc}</p>
                                  </div>
                                  <div className="ts-card-action">
                                    <span>Ask AI</span>
                                    <ArrowRight size={13} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          <div className="ts-welcome-inquiries-box">
                            <div className="ts-inquiries-label">Popular Travel Inquiries:</div>
                            <div className="ts-inquiries-chips">
                              {SUGGESTED_QUESTIONS.map((q, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="ts-inquiry-pill"
                                  onClick={() => handleSendMessage(q)}
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((m) => (
                          <div 
                            key={m.id} 
                            className={`ts-ai-message-row ${m.sender === 'user' ? 'user-side' : 'assistant-side'}`}
                          >
                            {m.sender === 'assistant' && (
                              <div className="ts-msg-bot-avatar">
                                <Sparkles size={16} color="#ffffff" />
                              </div>
                            )}
                            <div className="ts-ai-bubble-box">
                              <div className="ts-bubble-text">{m.text}</div>
                              <div className="ts-bubble-time">{m.time}</div>
                            </div>
                          </div>
                        ))}

                        {isTyping && (
                          <div className="ts-ai-message-row assistant-side">
                            <div className="ts-msg-bot-avatar">
                              <Sparkles size={16} color="#ffffff" />
                            </div>
                            <div className="ts-ai-bubble-box typing-box">
                              <span className="typing-text">TravelMate is replying...</span>
                              <div className="ts-typing-dots">
                                <span /><span /><span />
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={chatBottomRef} />
                      </>
                    )}
                  </div>
                </div>

                {/* BOTTOM CHAT INPUT BAR */}
                <div className="ts-ai-input-dock">
                  <div className="ts-ai-input-wrapper">
                    <input 
                      type="text" 
                      className="ts-ai-input-field"
                      placeholder="Ask TravelMate about flights, hotels, trains, buses, car rentals, cancellation..." 
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      onKeyDown={handleKeyDown}
                      maxLength={500}
                    />
                    <button 
                      type="button" 
                      className="ts-ai-send-btn"
                      onClick={() => handleSendMessage()}
                      disabled={!inputVal.trim() || isTyping}
                      aria-label="Send message"
                      title="Send message (Enter)"
                    >
                      <Send size={16} />
                    </button>
                  </div>

                  <div className="ts-ai-input-footer">
                    <span className="guarantee-tag">
                      <ShieldCheck size={13} color="#16a34a" /> 100% Protected Reservations · Official TravelSphere AI Concierge
                    </span>
                    <span className="char-count">{inputVal.length} / 500</span>
                  </div>
                </div>

              </main>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
