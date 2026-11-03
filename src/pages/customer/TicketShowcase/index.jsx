import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, ArrowLeft, CheckCircle2, Hand } from 'lucide-react';
import TearTicket from '../../../components/common/TearTicket';
import usePageTitle from '../../../hooks/usePageTitle';
import './TicketShowcase.css';

export default function TicketShowcase() {
  usePageTitle('Interactive VIP Passes & Tickets');

  const [tickets, setTickets] = useState({
    spectrum: { torn: false },
    swiss: { torn: false }
  });

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#a3704c', '#e2b17a', '#38bdf8', '#4ade80']
    });
  }, []);

  const handleTear = useCallback((ticketId) => {
    setTickets(prev => ({
      ...prev,
      [ticketId]: { torn: true }
    }));
    fireConfetti();
  }, [fireConfetti]);

  const resetTickets = useCallback(() => {
    setTickets({
      spectrum: { torn: false },
      swiss: { torn: false }
    });
  }, []);

  return (
    <div className="ticket-showcase-page">
      <div className="ticket-showcase-container">
        {/* Header Block */}
        <header className="ticket-header-block">
          <div className="ticket-tag">
            <Sparkles size={14} /> Interactive Experience
          </div>
          <h1>TearTicket Interactive Studio</h1>
          <p>
            Grab and pull the perforated stub to tear off your ticket. Features 3D tilt perspective,
            procedural paper bridge physics, and real-time tearing feedback.
          </p>

          <div className="ticket-actions-row">
            <button type="button" className="btn-ticket-reset" onClick={resetTickets}>
              <RotateCcw size={15} /> Reset Tickets
            </button>
            <Link to="/user-dashboard" className="btn-ticket-secondary">
              <ArrowLeft size={15} /> Back to Dashboard
            </Link>
          </div>
        </header>

        {/* Tickets Grid */}
        <div className="tickets-grid-stage">
          {/* TICKET 1: Spectrum Exhibition Pass */}
          <div className="ticket-card-wrapper">
            <div className="ticket-label-bar">
              <span>Rooftop Gallery Edition</span>
              <span className={`ticket-status-pill ${tickets.spectrum.torn ? 'torn' : 'intact'}`}>
                {tickets.spectrum.torn ? (
                  <>
                    <CheckCircle2 size={13} /> STUB TORN / USED
                  </>
                ) : (
                  <>
                    <Hand size={13} /> DRAG STUB TO TEAR
                  </>
                )}
              </span>
            </div>

            <TearTicket
              key={`spectrum-${tickets.spectrum.torn}`}
              image="/spectrum.jpg"
              imageAlt="Visitors in a walkway of coloured glass"
              stub={
                <div className="ticket-stub-content">
                  <span className="stub-badge">VIP PASS</span>
                  <h3>Admit one</h3>
                  <p>Rooftop gallery · Until 30 Nov</p>
                  <span className="stub-num">No. 284619</span>
                </div>
              }
              orientation="horizontal"
              scrim
              imageRadius={8}
              onTear={() => handleTear('spectrum')}
              torn={tickets.spectrum.torn}
              width={460}
              height={250}
              stubSize={150}
              radius={16}
              holes={12}
              holeSize={6}
              notch={3}
              roughness={0}
              tearAngle={30}
              stretch={30}
              resistance={0.45}
              rotate={4}
              tilt
              tiltMax={9}
              tiltReach={260}
              parallax={6}
              perspective={1000}
              background="#27272a"
              color="#f5f5f5"
              border
              borderWidth={1}
              recenter
            >
              <div className="ticket-body-content">
                <div className="ticket-brand">TS GALLERY</div>
                <span className="ticket-title">Spectrum</span>
                <p className="ticket-sub">Curated Immersive Experience</p>
              </div>
            </TearTicket>
          </div>

          {/* TICKET 2: TravelSphere Swiss Alps Glacier Pass */}
          <div className="ticket-card-wrapper">
            <div className="ticket-label-bar">
              <span>First Class Glacier Pass</span>
              <span className={`ticket-status-pill ${tickets.swiss.torn ? 'torn' : 'intact'}`}>
                {tickets.swiss.torn ? (
                  <>
                    <CheckCircle2 size={13} /> BOARDED / VERIFIED
                  </>
                ) : (
                  <>
                    <Hand size={13} /> DRAG STUB TO TEAR
                  </>
                )}
              </span>
            </div>

            <TearTicket
              key={`swiss-${tickets.swiss.torn}`}
              image="/destination-images/swiss-alps.webp"
              imageAlt="Swiss Alps Glacier Express"
              stub={
                <div className="ticket-stub-content travel-theme">
                  <span className="stub-badge">BOARDING PASS</span>
                  <h3>Gate A04</h3>
                  <p>Glacier Express · 08:30 AM</p>
                  <span className="stub-num">#TS-772918</span>
                </div>
              }
              orientation="horizontal"
              scrim
              imageRadius={8}
              onTear={() => handleTear('swiss')}
              torn={tickets.swiss.torn}
              width={460}
              height={250}
              stubSize={150}
              radius={16}
              holes={12}
              holeSize={6}
              notch={3}
              roughness={0}
              tearAngle={30}
              stretch={30}
              resistance={0.45}
              rotate={4}
              tilt
              tiltMax={9}
              tiltReach={260}
              parallax={6}
              perspective={1000}
              background="#18181b"
              color="#fbf9f5"
              border
              borderWidth={1}
              recenter
            >
              <div className="ticket-body-content">
                <div className="ticket-brand">FIRST CLASS PASS</div>
                <span className="ticket-title">Swiss Alps</span>
                <p className="ticket-sub">Zermatt to St. Moritz Express</p>
              </div>
            </TearTicket>
          </div>
        </div>
      </div>
    </div>
  );
}
