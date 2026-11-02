import { useState, useEffect, useRef, useTransition, useMemo } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  ShieldCheck, 
  Compass, 
  Hotel, 
  Headphones, 
  CheckCheck, 
  Sparkles, 
  Volume2, 
  VolumeX
} from 'lucide-react';
import './LiveTravelMessenger.css';

const CHANNELS = [
  {
    id: 'guide',
    name: 'Arjun Sen',
    role: 'Certified Tour Guide & Mountain Lead',
    sub: 'Kyoto & Alps Regional Coordinator',
    icon: Compass,
    avatarBg: '#0284c7',
    quickChips: [
      'Where is the morning meeting point?',
      'What gear should I pack for tomorrow?',
      'Can we adjust departure time by 30 mins?'
    ],
    initialMessages: [
      { id: 'm1', sender: 'provider', text: 'Hello! I am Arjun, your regional lead guide. I coordinate meeting locations, trail conditions, and schedule pacing. How can I assist your upcoming trip?', time: '10:04 AM' }
    ]
  },
  {
    id: 'hotel',
    name: 'Elena Rostova',
    role: 'Luxury Front Desk Manager',
    sub: 'Partner Stays & Guest Services',
    icon: Hotel,
    avatarBg: '#d97706',
    quickChips: [
      'Request early check-in at 11:00 AM',
      'Is complimentary baggage storage available?',
      'Confirm king-size bed and quiet floor'
    ],
    initialMessages: [
      { id: 'm1', sender: 'provider', text: 'Welcome! I am Elena from Guest Support. We handle early arrival check-in, baggage drop, room preferences, and dining reservations. How can we make your stay seamless?', time: '09:30 AM' }
    ]
  },
  {
    id: 'support',
    name: 'TravelSphere Global Desk',
    role: '24/7 Support & Help Desk',
    sub: 'Verified Platform Guarantee Hub',
    icon: Headphones,
    avatarBg: '#a3704c',
    quickChips: [
      'How do I split my package cost with friends?',
      'Where can I download my PDF booking voucher?',
      'What is the flexible cancellation policy?'
    ],
    initialMessages: [
      { id: 'm1', sender: 'provider', text: 'Hello! You are connected directly to TravelSphere Global Support. We manage real-time reservations, payment splits, and emergency rebooking. How can we help today?', time: 'Just now' }
    ]
  }
];

function getSimulatedReply(channelId, userText) {
  const t = userText.toLowerCase();

  if (channelId === 'guide') {
    if (t.includes('meeting') || t.includes('point') || t.includes('where')) {
      return "The morning meeting point is at the Central Hub Station North Plaza at 08:30 AM. I will have the TravelSphere badge and board ready for you!";
    }
    if (t.includes('pack') || t.includes('wear') || t.includes('gear')) {
      return "Light layers and comfortable walking shoes are recommended! We provide trekking poles and bottled refreshments on the coach.";
    }
    if (t.includes('time') || t.includes('adjust') || t.includes('schedule') || t.includes('late')) {
      return "Not a problem at all. We have built 45 minutes of flexible buffer into the morning schedule so your pace is never rushed.";
    }
    return "Thank you for the message! I've noted this in our excursion log for tomorrow's journey. Let me know if you need anything else!";
  }

  if (channelId === 'hotel') {
    if (t.includes('check-in') || t.includes('check in') || t.includes('early') || t.includes('arrival')) {
      return "Early check-in request logged! Your priority suite will be pre-allocated. If arriving before 11:00 AM, our luggage drop and welcome lounge are available immediately.";
    }
    if (t.includes('bag') || t.includes('luggage') || t.includes('store') || t.includes('storage')) {
      return "Yes, complimentary secure luggage lockers and porter service are available 24 hours a day for all TravelSphere guests.";
    }
    if (t.includes('bed') || t.includes('king') || t.includes('floor') || t.includes('room')) {
      return "Preference confirmed! We have marked your reservation for a quiet upper-floor wing with king bedding.";
    }
    return "Your request has been relayed directly to our front desk supervisor. We look forward to welcoming you upon arrival!";
  }

  // support
  if (t.includes('split') || t.includes('group') || t.includes('payment') || t.includes('friend')) {
    return "You can split your booking bill directly! Open the AI Itinerary Planner or Tour Packages modal to calculate per-person shares in any of our 6 supported currencies.";
  }
  if (t.includes('voucher') || t.includes('pdf') || t.includes('download') || t.includes('ticket')) {
    return "Your print-ready PDF Travel Voucher with QR Verification and passenger manifest is ready in your Customer Dashboard under Bookings!";
  }
  if (t.includes('cancel') || t.includes('refund') || t.includes('policy')) {
    return "All verified TravelSphere packages feature 100% free cancellation up to 48 hours prior to departure under our Protected Booking guarantee.";
  }
  return "Our 24/7 Operations team has received your ticket. Your reference is #TS-LIVE-SYNC. We're here anytime you need us!";
}

let globalMessageSeq = 1000;

export default function LiveTravelMessenger() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState('guide');
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ts_live_messenger_data');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return {
      guide: CHANNELS[0].initialMessages,
      hotel: CHANNELS[1].initialMessages,
      support: CHANNELS[2].initialMessages,
    };
  });

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [unreadCount, setUnreadCount] = useState(1);
  const [, startTransition] = useTransition();

  const chatBottomRef = useRef(null);
  const activeChannel = CHANNELS.find(c => c.id === activeChannelId) || CHANNELS[0];
  const channelMessages = useMemo(() => messages[activeChannelId] || [], [messages, activeChannelId]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem('ts_live_messenger_data', JSON.stringify(messages));
    } catch { /* ignore */ }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channelMessages, isTyping, isOpen]);

  // Handle open
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleSend = (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const timeStr = 'Just now';
    const msgId = `u-${++globalMessageSeq}`;
    const userMsg = {
      id: msgId,
      sender: 'user',
      text,
      time: timeStr
    };

    setMessages(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), userMsg]
    }));
    setInputVal('');

    // Trigger typing indicator
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const replyText = getSimulatedReply(activeChannelId, text);
      const replyMsg = {
        id: `p-${++globalMessageSeq}`,
        sender: 'provider',
        text: replyText,
        time: 'Just now'
      };

      setMessages(prev => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), replyMsg]
      }));

      // Audio notification if sound is on
      if (isSoundOn && typeof window !== 'undefined' && window.AudioContext) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        } catch { /* audio context blocked */ }
      }
    }, 1200);
  };

  return (
    <div className="ts-messenger-wrapper">
      {/* FLOATING ACTION LAUNCHER BUTTON */}
      {!isOpen && (
        <button
          type="button"
          className="ts-messenger-launcher"
          onClick={handleToggle}
          aria-label="Open Live Chat and Support"
        >
          <div className="launcher-pulse-dot" />
          <MessageSquare size={20} />
          <span className="launcher-label">Live Chat</span>
          {unreadCount > 0 && <span className="launcher-badge">{unreadCount}</span>}
        </button>
      )}

      {/* EXPANDED MESSENGER WINDOW */}
      {isOpen && (
        <div className="ts-messenger-window" role="dialog" aria-labelledby="messenger-title">
          {/* WINDOW HEADER */}
          <div className="ts-messenger-header">
            <div className="header-provider-info">
              <div className="header-avatar" style={{ background: activeChannel.avatarBg }}>
                <activeChannel.icon size={18} color="#ffffff" />
                <span className="avatar-online-dot" />
              </div>
              <div>
                <h3 id="messenger-title">{activeChannel.name}</h3>
                <span className="provider-sub">
                  {activeChannel.role}
                </span>
              </div>
            </div>

            <div className="header-actions">
              <button
                type="button"
                className="header-icon-btn"
                onClick={() => setIsSoundOn(!isSoundOn)}
                title={isSoundOn ? 'Mute notification sound' : 'Unmute sound'}
              >
                {isSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                type="button"
                className="header-icon-btn"
                onClick={handleToggle}
                title="Minimize messenger"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* REALTIME WEBSOCKET STATUS BAR */}
          <div className="ts-messenger-status-bar">
            <div className="status-live-indicator">
              <span className="status-live-dot" />
              <span>WSS: Connected (21ms)</span>
            </div>
            <span className="status-channel-tag">#{activeChannelId.toUpperCase()}-STREAM</span>
          </div>

          {/* CHANNEL SELECTOR TABS */}
          <div className="ts-messenger-tabs">
            {CHANNELS.map(ch => {
              const Icon = ch.icon;
              const isActive = ch.id === activeChannelId;
              return (
                <button
                  key={ch.id}
                  type="button"
                  className={`ts-channel-tab ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    startTransition(() => {
                      setActiveChannelId(ch.id);
                    });
                  }}
                >
                  <Icon size={14} />
                  <span>{ch.id === 'guide' ? 'Tour Guide' : ch.id === 'hotel' ? 'Hotel Desk' : '24/7 Support'}</span>
                </button>
              );
            })}
          </div>

          {/* MESSAGE FEED */}
          <div className="ts-messenger-feed">
            <div className="feed-security-notice">
              <ShieldCheck size={13} color="#16a34a" />
              <span>End-to-end encrypted provider channel · TravelSphere Guarantee active</span>
            </div>

            {channelMessages.map(msg => (
              <div key={msg.id} className={`ts-chat-bubble ${msg.sender === 'user' ? 'outgoing' : 'incoming'}`}>
                {msg.sender === 'provider' && (
                  <div className="bubble-sender-title">
                    {activeChannel.name}
                  </div>
                )}
                <div className="bubble-text">{msg.text}</div>
                <div className="bubble-meta">
                  <span>{msg.time}</span>
                  {msg.sender === 'user' && <CheckCheck size={13} className="sent-tick" />}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="ts-chat-bubble incoming typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '6px' }}>
                  {activeChannel.name.split(' ')[0]} is replying...
                </span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* QUICK PROMPT CHIPS */}
          <div className="ts-messenger-chips">
            {activeChannel.quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="ts-quick-chip"
                onClick={() => handleSend(chip)}
              >
                <Sparkles size={11} /> {chip}
              </button>
            ))}
          </div>

          {/* INPUT FORM */}
          <form
            className="ts-messenger-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              placeholder={`Message ${activeChannel.name.split(' ')[0]}...`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="ts-messenger-input"
            />
            <button
              type="submit"
              className="ts-messenger-send-btn"
              disabled={!inputVal.trim()}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
