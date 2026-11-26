import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Globe2, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound, AlertCircle, CheckCircle2, KeyRound, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/useAuth';
import { forgotPassword, resetPassword } from '../../../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../../hooks/usePageTitle';
import './Login.css';

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
  const [successBanner, setSuccessBanner] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [demoCodeGiven, setDemoCodeGiven] = useState('');

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
    return (input || '').trim().toLowerCase();
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
      setEmailError('Please enter a valid email address.');
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
      const userRole = res?.user?.role || (finalEmail === 'admin@travelsphere.org' || finalEmail === 'admin@mail.com' ? 'ADMIN' : 'CUSTOMER');
      navigate(target(userRole), { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForgot = () => {
    setForgotEmail(email || '');
    setForgotStep(1);
    setForgotError('');
    setForgotSuccess('');
    setForgotCode('');
    setNewResetPassword('');
    setShowForgotModal(true);
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) {
      setForgotError('Please enter a valid registered email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await forgotPassword(forgotEmail);
      setForgotSuccess(res.message || 'Verification reset code sent!');
      if (res.reset_code) {
        setDemoCodeGiven(res.reset_code);
        setForgotCode(res.reset_code);
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || 'Failed to send reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handlePerformReset = async (e) => {
    e.preventDefault();
    if (!forgotCode.trim()) {
      setForgotError('Please enter the verification reset code.');
      return;
    }
    if (!newResetPassword || newResetPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await resetPassword({ email: forgotEmail, resetCode: forgotCode.trim(), newPassword: newResetPassword });
      setSuccessBanner(res.message || 'Password reset successfully! Please sign in with your new password.');
      setEmail(forgotEmail);
      setPassword(newResetPassword);
      setShowForgotModal(false);
      setTimeout(() => setSuccessBanner(''), 8000);
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password. Please check your verification code.');
    } finally {
      setForgotLoading(false);
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
            
            {successBanner && (
              <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span>{successBanner}</span>
              </div>
            )}

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
                <button type="button" onClick={handleOpenForgot}>Forgot password?</button>
              </div>
              
              <button className="login-submit-new" type="submit" disabled={loading}>
                {loading ? 'Opening your workspace' : <>Continue to TravelSphere <ArrowRight size={17} /></>}
              </button>
            </form>
            
            <div className="login-security">
              <ShieldCheck size={14} />
              <span>Protected account access · <Link to="/privacy">Privacy first</Link></span>
            </div>
          </div>
        </section>
      </div>

      {/* Real Interactive Forgot Password & Reset Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '16px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafaf9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef3c7', display: 'grid', placeItems: 'center', color: '#b45309' }}>
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                      {forgotStep === 1 ? 'Reset Your Password' : 'Enter Verification Code'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      {forgotStep === 1 ? 'Step 1 of 2: Confirm Account' : 'Step 2 of 2: Set New Password'}
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowForgotModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '24px 28px' }}>
                {forgotError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={15} /> <span>{forgotError}</span>
                  </div>
                )}

                {forgotSuccess && forgotStep === 2 && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
                      <CheckCircle2 size={16} /> <span>Verification Code Ready</span>
                    </div>
                    <div>{forgotSuccess}</div>
                    {demoCodeGiven && (
                      <div style={{ marginTop: '6px', padding: '6px 10px', background: '#dbeafe', borderRadius: '6px', fontFamily: 'monospace', fontWeight: 800, fontSize: '14px', letterSpacing: '0.08em', display: 'inline-block' }}>
                        Code: {demoCodeGiven}
                      </div>
                    )}
                  </div>
                )}

                {forgotStep === 1 ? (
                  <form onSubmit={handleSendResetCode}>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginTop: 0, marginBottom: '16px' }}>
                      Enter your account email address. We will verify your identity and generate a secure verification reset code.
                    </p>
                    <label style={{ display: 'block', marginBottom: '18px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Registered Email</span>
                      <div className="login-input" style={{ width: '100%' }}>
                        <Mail size={16} />
                        <input 
                          type="email" 
                          required 
                          placeholder="you@example.com" 
                          value={forgotEmail} 
                          onChange={e => setForgotEmail(e.target.value)} 
                          style={{ width: '100%' }}
                        />
                      </div>
                    </label>

                    <button 
                      type="submit" 
                      className="login-submit-new" 
                      disabled={forgotLoading}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      {forgotLoading ? 'Verifying Account...' : <>Send Verification Code <ArrowRight size={16} /></>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handlePerformReset}>
                    <label style={{ display: 'block', marginBottom: '14px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Verification Reset Code</span>
                      <div className="login-input" style={{ width: '100%' }}>
                        <KeyRound size={16} />
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. RST-ABC123" 
                          value={forgotCode} 
                          onChange={e => setForgotCode(e.target.value)} 
                          style={{ width: '100%', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        />
                      </div>
                    </label>

                    <label style={{ display: 'block', marginBottom: '18px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Choose New Password</span>
                      <div className="login-input" style={{ width: '100%' }}>
                        <LockKeyhole size={16} />
                        <input 
                          type={showResetPassword ? 'text' : 'password'} 
                          required 
                          minLength={6}
                          placeholder="At least 6 characters" 
                          value={newResetPassword} 
                          onChange={e => setNewResetPassword(e.target.value)} 
                          style={{ width: '100%' }}
                        />
                        <button type="button" onClick={() => setShowResetPassword(!showResetPassword)}>
                          {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </label>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="button" 
                        onClick={() => setForgotStep(1)} 
                        style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', color: '#475569' }}
                      >
                        Back
                      </button>
                      <button 
                        type="submit" 
                        className="login-submit-new" 
                        disabled={forgotLoading}
                        style={{ flex: 2, justifyContent: 'center' }}
                      >
                        {forgotLoading ? 'Updating Password...' : 'Save New Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
