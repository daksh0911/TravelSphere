import { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import './Register.css';

import usePageTitle from '../../../hooks/usePageTitle';
export default function RegisterPage() {
  usePageTitle('Create account');
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', country: '', phone: '', password: '', confirmPassword: '', agreeTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  const change = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
  };

  const submit = async e => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    const newErrors = {};
    if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address.';
    if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 8 characters, with 1 uppercase and 1 number.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});

    if (!formData.agreeTerms) {
      setErrorMessage('Please agree to the Terms & Conditions to create an account.');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        country: formData.country,
        phone: formData.phone,
        password: formData.password
      });
      
      setSuccessMessage(result.message || 'Traveller account created successfully! Redirecting...');
      setTimeout(() => navigate('/login', { state: { registeredEmail: formData.email } }), 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page-new">
      <header className="register-topbar">
        <Link to="/" className="register-brand"><span>TS</span> TravelSphere</Link>
        <div className="register-topbar-right">
          <span>Already travelling with us?</span>
          <Link to="/login">Log in <ArrowRight size={14} /></Link>
        </div>
      </header>
      <div className="register-shell">
        <section className="register-story">
          <div className="register-story-noise" />
          <div className="register-story-content">
            <span className="register-eyebrow"><Sparkles size={14} /> Join a better way to travel</span>
            <h1>Your next<br /><em>somewhere</em><br />starts here.</h1>
            <p>One account for trips with a point of view, people who know the way, and the details that make a journey feel like yours.</p>
            <div className="register-story-metrics">
              <div><strong>42</strong><span>countries<br />in the collection</span></div>
              <div><strong>4.9</strong><span>average<br />experience rating</span></div>
              <div><strong>24/7</strong><span>human<br />travel care</span></div>
            </div>
          </div>
          <div className="register-story-orbit">
            <div className="story-orbit-ring ring-a" />
            <div className="story-orbit-ring ring-b" />
            <div className="story-orbit-card">
              <MapPinIcon />
              <span>made around</span>
              <strong>your<br />rhythm</strong>
            </div>
          </div>
        </section>
        
        <section className="register-form-side">
          <div className="register-form-head">
            <div>
              <span className="register-eyebrow dark">CREATE YOUR ACCOUNT</span>
              <h2>Start your<br /><em>next journey.</em></h2>
            </div>
            <span className="form-step">01 <i /> 02</span>
          </div>
          
          {errorMessage && (
            <div className="register-message error">
              <AlertCircle size={17} /><span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="register-message success">
              <CheckCircle2 size={17} /><span>{successMessage}</span>
            </div>
          )}
          
          <form className="register-form-new" onSubmit={submit} noValidate>
            <div className="form-section-label">
              <span>02</span>
              <div>
                <strong>Your details</strong>
                <small>Traveller account · plan and manage your journeys</small>
              </div>
            </div>
            
            <label className="register-field">
              <span>Full name</span>
              <input type="text" name="fullName" placeholder="What should we call you?" value={formData.fullName} onChange={change} required />
            </label>
            
            <label className={`register-field ${errors.email ? 'error-field' : ''}`}>
              <span>Email address</span>
              <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={change} required />
              <AnimatePresence>
                {errors.email && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5, height: 0 }} 
                    animate={{ opacity: 1, y: 0, height: 'auto' }} 
                    exit={{ opacity: 0, y: -5, height: 0 }} 
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="form-validation-error"
                    style={{ color: '#e74c3c', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <AlertCircle size={14} /> <span>{errors.email}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </label>
            
            <div className="register-field-row">
              <label className="register-field">
                <span>Country</span>
                <select name="country" value={formData.country} onChange={change} required>
                  <option value="">Choose</option>
                  <option value="US">United States</option>
                  <option value="IN">India</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="AE">UAE</option>
                </select>
              </label>
              
              <label className="register-field">
                <span>Phone <small>optional</small></span>
                <input type="tel" name="phone" placeholder="+1 555 000" value={formData.phone} onChange={change} />
              </label>
            </div>
            
            <div className="register-field-row">
              <label className={`register-field password-field ${errors.password ? 'error-field' : ''}`}>
                <span>Password</span>
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="8+ characters" value={formData.password} onChange={change} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <AnimatePresence>
                  {errors.password && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5, height: 0 }} 
                      animate={{ opacity: 1, y: 0, height: 'auto' }} 
                      exit={{ opacity: 0, y: -5, height: 0 }} 
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="form-validation-error"
                      style={{ color: '#e74c3c', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <AlertCircle size={14} /> <span>{errors.password}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </label>
              
              <label className={`register-field password-field ${errors.confirmPassword ? 'error-field' : ''}`}>
                <span>Confirm password</span>
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Repeat password" value={formData.confirmPassword} onChange={change} required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label="Toggle confirm password visibility">
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5, height: 0 }} 
                      animate={{ opacity: 1, y: 0, height: 'auto' }} 
                      exit={{ opacity: 0, y: -5, height: 0 }} 
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="form-validation-error"
                      style={{ color: '#e74c3c', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <AlertCircle size={14} /> <span>{errors.confirmPassword}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </label>
            </div>
            
            <label className="agreement-row">
              <input type="checkbox" checked={formData.agreeTerms} onChange={e => setFormData(prev => ({ ...prev, agreeTerms: e.target.checked }))} />
              <span>I agree to the <Link to="/terms">Terms & Conditions</Link> and understand how TravelSphere uses my information.</span>
            </label>
            
            <button className="register-submit-new" type="submit" disabled={loading}>
              {loading ? 'Creating your account' : <>Create my traveller account <ArrowRight size={17} /></>}
            </button>
          </form>
          
          <div className="register-form-foot">
            <ShieldCheck size={15} />
            <span>Your information is protected and never sold.</span>
          </div>
        </section>
      </div>
    </main>
  );
}

function MapPinIcon() { return <div className="story-pin"><MapPin size={22} /></div> }
