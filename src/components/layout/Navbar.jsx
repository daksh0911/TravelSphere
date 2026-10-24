import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Search, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { openCommandPalette, openTripStudio } from '../common/siteCommandCenterActions';
import './Navbar.css';

const PRIMARY_LINKS = [
  { name: 'Destinations', path: '/destinations' },
  { name: 'Tour Packages', path: '/packages' },
  { name: 'Hotels', path: '/hotels' },
  { name: 'Vehicles', path: '/vehicles' },
];
const SECONDARY_LINKS = [
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];
const FOOTER_LINKS = [
  { name: 'Support & FAQs', path: '/support' },
  { name: 'Privacy', path: '/privacy' },
  { name: 'Terms', path: '/terms' },
];

const getDashboardPath = (role) => {
  switch (role) {
    case 'ADMIN': case 'ADMINISTRATOR': return '/admin-dashboard';
    case 'TRAVEL_AGENT': return '/agent-dashboard';
    case 'HOTEL_MANAGER': return '/hotel-dashboard';
    case 'TRANSPORT_PROVIDER': return '/transport-dashboard';
    case 'TOUR_GUIDE': return '/guide-dashboard';
    default: return '/user-dashboard';
  }
};

const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

const Navbar = () => {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  // A menu counts as open only on the page where it was opened, so it closes
  // automatically on navigation without needing an effect.
  const [more, setMore] = useState({ open: false, path: '' });
  const [mobile, setMobile] = useState({ open: false, path: '' });
  const moreOpen = more.open && more.path === pathname;
  const mobileOpen = mobile.open && mobile.path === pathname;
  const moreRef = useRef(null);
  const moreButtonRef = useRef(null);

  const accountPath = isAuthenticated ? getDashboardPath(user?.role) : '/login';
  const firstName = (user?.name || 'Account').split(' ')[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // More menu: close on outside click or Escape.
  useEffect(() => {
    if (!moreOpen) return undefined;
    const onPointer = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) setMore({ open: false, path: '' });
    };
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setMore({ open: false, path: '' });
        moreButtonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  // Mobile panel: lock page scroll and close on Escape.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') setMobile({ open: false, path: '' });
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobile({ open: false, path: '' });
  const closeMore = () => setMore({ open: false, path: '' });

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} aria-label="Primary">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo" aria-label="TravelSphere home">
          <span className="logo-icon">TS</span>
          <span className="logo-text">TravelSphere</span>
        </Link>

        <ul className="navbar-links">
          {PRIMARY_LINKS.map((link) => (
            <li key={link.path}><NavLink to={link.path} className={linkClass}>{link.name}</NavLink></li>
          ))}
        </ul>

        <div className="navbar-right">
          <div className="nav-menu-wrap" ref={moreRef}>
            <button
              ref={moreButtonRef}
              type="button"
              className="nav-menu-button"
              aria-expanded={moreOpen}
              aria-controls="nav-more-menu"
              onClick={() => setMore(moreOpen ? { open: false, path: '' } : { open: true, path: pathname })}
            >
              <span>More</span>
              <ChevronDown size={15} className={moreOpen ? 'chevron open' : 'chevron'} aria-hidden="true" />
            </button>
            {moreOpen && (
              <div className="nav-menu-popover" id="nav-more-menu">
                {SECONDARY_LINKS.map((link) => <NavLink key={link.path} to={link.path} onClick={closeMore}>{link.name}</NavLink>)}
                <div className="nav-menu-divider" role="separator" />
                <button type="button" onClick={() => { closeMore(); openTripStudio(); }}><Sparkles size={14} aria-hidden="true" /> Trip Studio</button>
                <button type="button" onClick={() => { closeMore(); openCommandPalette(); }}><Search size={14} aria-hidden="true" /> Search the site</button>
                <div className="nav-menu-divider" role="separator" />
                {FOOTER_LINKS.map((link) => <NavLink key={link.path} to={link.path} onClick={closeMore}>{link.name}</NavLink>)}
              </div>
            )}
          </div>

          <Link to={accountPath} className="nav-account-button">
            {isAuthenticated ? (
              <>
                <span className="avatar-circle" aria-hidden="true">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                <span className="nav-account-name">{firstName}</span>
              </>
            ) : 'Sign In'}
          </Link>
          {isAuthenticated && (
            <button type="button" className="nav-logout-btn" onClick={logout} aria-label="Sign out" title="Sign out">
              <LogOut size={15} aria-hidden="true" />
            </button>
          )}

          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMobile(mobileOpen ? { open: false, path: '' } : { open: true, path: pathname })}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div className="mobile-nav-scrim" onClick={closeMobile} aria-hidden="true" />
          <div className="mobile-nav-panel" id="mobile-nav-panel">
            <ul className="mobile-nav-links">
              <li><NavLink to="/" end onClick={closeMobile} className={linkClass}>Home</NavLink></li>
              {[...PRIMARY_LINKS, ...SECONDARY_LINKS].map((link) => (
                <li key={link.path}><NavLink to={link.path} onClick={closeMobile} className={linkClass}>{link.name}</NavLink></li>
              ))}
            </ul>
            <div className="mobile-nav-secondary">
              <button type="button" onClick={() => { closeMobile(); openTripStudio(); }}><Sparkles size={15} aria-hidden="true" /> Open Trip Studio</button>
              <button type="button" onClick={() => { closeMobile(); openCommandPalette(); }}><Search size={15} aria-hidden="true" /> Search the site</button>
              {FOOTER_LINKS.map((link) => <NavLink key={link.path} to={link.path} onClick={closeMobile}>{link.name}</NavLink>)}
            </div>
            <div className="mobile-nav-account">
              <Link to={accountPath} onClick={closeMobile} className="mobile-account-primary">{isAuthenticated ? 'My account' : 'Sign In'}</Link>
              {isAuthenticated
                ? <button type="button" className="mobile-account-secondary" onClick={() => { closeMobile(); logout(); }}>Sign out</button>
                : <Link to="/register" onClick={closeMobile} className="mobile-account-secondary">Create account</Link>}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
