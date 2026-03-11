import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
export default function ForgotPassword() {
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); try { await authAPI.forgotPassword(email); setSent(true); } catch { toast.error('Email not found'); }};
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 20 }}>
      <div className="card" style={{ padding: 40, width: '100%', maxWidth: 440 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Forgot Password</h1>
        {sent ? <p style={{ color: '#16a34a', fontWeight: 600 }}>✅ Reset link sent to {email}</p> : (
          <form onSubmit={handleSubmit}><div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required /></div><button type="submit" className="btn btn-primary btn-full">Send Reset Link</button></form>
        )}
        <div style={{ textAlign: 'center', marginTop: 16 }}><Link to="/login" style={{ color: '#1a5c3a', fontSize: 13 }}>← Back to Login</Link></div>
      </div>
    </div>
  );
}
