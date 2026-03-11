// Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../context/store';
import BrandLogo from '../components/BrandLogo';
import BrandLoader from '../components/BrandLoader';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) navigate('/');
  };

  return (
    <div className="auth-page">
      <BrandLoader show={isLoading} message="Signing you in..." />
      <div className="auth-shell">
        <div className="auth-showcase">
          <div className="auth-chip"><Leaf size={14} /> Plant-powered formulas</div>
          <h2>Clean beauty with clinical confidence</h2>
          <p>Track orders, save favorites, and build routines tailored to your skin and hair goals.</p>
          <div className="auth-metrics">
            <div><strong>4.9/5</strong><span>Average rating</span></div>
            <div><strong>50K+</strong><span>Happy customers</span></div>
            <div><strong>24h</strong><span>Quick dispatch</span></div>
          </div>
        </div>

        <div className="card auth-card">
          <div className="auth-card-head">
            <BrandLogo subtitle="Premium botanical care" />
            <h1>Welcome back</h1>
            <p>Sign in to your NANA'S NATURAL account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 13, color: '#1a5c3a', fontWeight: 500 }}>Forgot Password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} className="form-input" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isLoading} style={{ marginTop: 8 }}>
              {isLoading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="auth-create-account-wrap">
            <p className="auth-create-account-text">
              Don't have an account?{' '}
              <Link to="/register" className="auth-create-account-link">Create Account</Link>
            </p>
            <div className="auth-create-account-leaves" aria-hidden="true">
              <span className="leaf-fall leaf-fall-1"><Leaf size={12} /></span>
              <span className="leaf-fall leaf-fall-2"><Leaf size={10} /></span>
              <span className="leaf-fall leaf-fall-3"><Leaf size={14} /></span>
              <span className="leaf-fall leaf-fall-4"><Leaf size={11} /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPwd, setShowPwd] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form.name, form.email, form.password, form.phone);
    if (result.success) navigate('/');
  };

  return (
    <div className="auth-page">
      <BrandLoader show={isLoading} message="Creating your account..." />
      <div className="auth-shell auth-shell--register">
        <div className="auth-showcase">
          <div className="auth-chip"><Sparkles size={14} /> Premium skin and hair essentials</div>
          <h2>Start your wellness routine today</h2>
          <p>Personalized care, trusted ingredients, and modern science made simple.</p>
          <div className="auth-points">
            <p><ShieldCheck size={14} /> Dermat reviewed formulations</p>
            <p><Leaf size={14} /> Naturally inspired ingredients</p>
            <p><Sparkles size={14} /> Consistent visible results</p>
          </div>
        </div>

        <div className="card auth-card">
          <div className="auth-card-head">
            <BrandLogo subtitle="Premium botanical care" />
            <h1>Create Account</h1>
            <p>Join the NANA'S NATURAL family today</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-input" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} className="form-input" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isLoading}>
              {isLoading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#666' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1a5c3a', fontWeight: 600 }}>Sign In</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#aaa' }}>
            By creating an account, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
