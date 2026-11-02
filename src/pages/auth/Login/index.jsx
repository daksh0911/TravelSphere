import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Globe2, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound, AlertCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import './Login.css';

import usePageTitle from '../../../hooks/usePageTitle';
const DEMOS = [
  { label: 'Admin', email: 'admin@travel.com', role: 'ADMIN', color: '#334e67' },
  { label: 'Travel agent', email: 'agent@travel.com', role: 'TRAVEL_AGENT', color: '#8865d7' },
  { label: 'Hotel manager', email: 'hotel@travel.com', role: 'HOTEL_MANAGER', color: '#d58b32' },
  { label: 'Transport', email: 'transport@travel.com', role: 'TRANSPORT_PROVIDER', color: '#d46378' },
  { label: 'Tour guide', email: 'guide@travel.com', role: 'TOUR_GUIDE', color: '#3e89bd' },
  { label: 'Customer', email: 'customer@travel.com', role: 'CUSTOMER', color: 'var(--color-primary)' }
];

const SIMPLE_ROLE_MAP = {
  admin: 'admin@travel.com',
  administrator: 'admin@travel.com',
  agent: 'agent@travel.com',
  travelagent: 'agent@travel.com',
  'travel agent': 'agent@travel.com',
  hotel: 'hotel@travel.com',
  hotelmanager: 'hotel@travel.com',
  'hotel manager': 'hotel@travel.com',
  transport: 'transport@travel.com',
  guide: 'guide@travel.com',
  tourguide: 'guide@travel.com',
  'tour guide': 'guide@travel.com',
  customer: 'customer@travel.com',
  user: 'customer@travel.com'
};

export default function LoginPage() {
  usePageTitle('Sign in');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const target = role => {
    switch ((role || '').toUpperCase()) {
      case 'ADMIN': case 'ADMINISTRATOR': case 'SUPER_ADMIN': return '/admin-dashboard';
      case 'TRAVEL_AGENT': return '/agent-dashboard';
      case 'HOTEL_MANAGER': return '/hotel-dashboard';
      case 'TRANSPORT_PROVIDER': return '/transport-dashboard';
      case 'TOUR_GUIDE': return '/guide-dashboard';
      default: return '/user-dashboard';
    }
  };

  const resolveEmail = (input) => {
    const raw = (input || '').trim().toLowerCase();
    if (SIMPLE_ROLE_MAP[raw]) return SIMPLE_ROLE_MAP[raw];
    if (raw.endsWith('.com') && !raw.includes('@')) {
      const prefix = raw.replace('.com', '');
      if (SIMPLE_ROLE_MAP[prefix]) return SIMPLE_ROLE_MAP[prefix];
    }
    return raw;
  };

  const validateEmail = (val) => {
    const normalized = resolveEmail(val);
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(normalized);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const submit = async e => {
    e.preventDefault();
    setErrorMessage('');
    let valid = true;
    const finalEmail = resolveEmail(email);

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid role name or email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) return;

    setLoading(true);
    try {
      const res = await login({ email: finalEmail, password });
      navigate(target(res.user?.role || 'CUSTOMER'));
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quick = async demo => {
    setEmail(demo.email);
    setPassword('password123');
    setLoading(true);
    setErrorMessage('');
    setEmailError('');
    setPasswordError('');
    try {
      const res = await login({ email: demo.email, password: 'password123' }).catch(() => null);
      if (res?.user) navigate(target(res.user.role));
      else {
        const demoUser = { id: demo.email, name: demo.email.split('@')[0].toUpperCase(), email: demo.email, role: demo.role };
        localStorage.setItem('travelsphere_active_user', JSON.stringify(demoUser));
        window.location.assign(target(demo.role));
      }
    } catch {
      navigate(target(demo.role));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page-new">
      <header className="login-topbar">
        <Link to="/" className="login-brand"><span>TS</span> TravelSphere</Link>
        <div className="login-topbar-right">
          <span>New to TravelSphere?</span>
          <Link to="/register">Create an account <ArrowRight size={14} /></Link>
        </div>
      </header>
      <div className="login-shell">
        <section className="login-story">
          <div className="login-story-glow glow-one" />
          <div className="login-story-glow glow-two" />
          <div className="login-story-grid" />
          <div className="login-story-content">
            <span className="login-eyebrow"><Sparkles size={14} /> Welcome back to your world</span>
            <h1>Pick up<br />where your<br /><em>story left off.</em></h1>
            <p>Your itineraries, saved places, trusted partners, and a real human when you need one.</p>
            <div className="login-story-proof">
              <span><ShieldCheck size={15} /> Secure workspace</span>
              <span><Globe2 size={15} /> 42 countries</span>
              <span><UserRound size={15} /> One account, every route</span>
            </div>
          </div>
          <div className="login-story-stamp">
            <span>TRAVEL<br />SPHERE</span>
            <strong>24<br /><small>/ 7</small></strong>
            <em>care</em>
          </div>
        </section>
        <section className="login-form-side">
          <div className="login-card-new">
            <span className="login-eyebrow dark">SIGN IN</span>
            <h2>Welcome<br /><em>back.</em></h2>
            <p className="login-subtitle">Use your account to continue planning, hosting, or guiding the journey.</p>
            
            {errorMessage && <div className="login-error"><span>!</span>{errorMessage}</div>}
            
            <form onSubmit={submit} className="login-form-new" noValidate>
              <label>
                <span>Email address</span>
                <div className={`login-input ${emailError ? 'error-input' : ''}`}>
                  <Mail size={16} />
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <AnimatePresence>
                  {emailError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5, height: 0 }} 
                      animate={{ opacity: 1, y: 0, height: 'auto' }} 
                      exit={{ opacity: 0, y: -5, height: 0 }} 
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="form-validation-error"
                      style={{ color: '#e74c3c', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <AlertCircle size={14} /> <span>{emailError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </label>
              
              <label>
                <span>Password</span>
                <div className={`login-input ${passwordError ? 'error-input' : ''}`}>
                  <LockKeyhole size={16} />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <AnimatePresence>
                  {passwordError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5, height: 0 }} 
                      animate={{ opacity: 1, y: 0, height: 'auto' }} 
                      exit={{ opacity: 0, y: -5, height: 0 }} 
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="form-validation-error"
                      style={{ color: '#e74c3c', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <AlertCircle size={14} /> <span>{passwordError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </label>

              <div className="login-options">
                <label>
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                  <span>Remember me</span>
                </label>
                <button type="button" onClick={() => setErrorMessage('Password reset is available through your account administrator.')}>Forgot password?</button>
              </div>
              
              <button className="login-submit-new" type="submit" disabled={loading}>
                {loading ? 'Opening your workspace' : <>Continue to TravelSphere <ArrowRight size={17} /></>}
              </button>
            </form>
            
            <div className="demo-divider"><span>or explore a demo workspace</span></div>
            <div className="demo-grid">
              {DEMOS.map(demo => (
                <button key={demo.role} type="button" onClick={() => quick(demo)} style={{ '--demo-color': demo.color }}>
                  <i /><span>{demo.label}</span>
                </button>
              ))}
            </div>
            
            <div className="login-security">
              <ShieldCheck size={14} />
              <span>Protected account access · <Link to="/privacy">Privacy first</Link></span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
