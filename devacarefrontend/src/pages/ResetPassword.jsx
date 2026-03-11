import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
export default function ResetPassword() {
  const [password, setPassword] = useState(''); const [done, setDone] = useState(false);
  const { token } = useParams(); const navigate = useNavigate();
  const handleSubmit = async (e) => { e.preventDefault(); try { await authAPI.resetPassword(token, password); setDone(true); setTimeout(() => navigate('/login'), 2000); } catch { toast.error('Reset failed or link expired'); }};
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 20 }}>
      <div className="card" style={{ padding: 40, width: '100%', maxWidth: 440 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Reset Password</h1>
        {done ? <p style={{ color: '#16a34a', fontWeight: 600 }}>✅ Password reset! Redirecting...</p> : <form onSubmit={handleSubmit}><div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /></div><button type="submit" className="btn btn-primary btn-full">Reset Password</button></form>}
      </div>
    </div>
  );
}
