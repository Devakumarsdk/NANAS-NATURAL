// OrderSuccess.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { ordersAPI } from '../utils/api';

export function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    ordersAPI.getById(id).then(({ data }) => setOrder(data.order)).catch(() => {});
  }, [id]);

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#f8f9fa' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f0fdf4', border: '3px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={40} color="#16a34a" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#1a1a1a' }}>Order Placed!</h1>
        <p style={{ color: '#666', marginBottom: 4 }}>Thank you for shopping with NANA'S NATURAL</p>
        {order && <p style={{ fontWeight: 700, color: '#1a5c3a', fontSize: 18, marginBottom: 24 }}>#{order.orderNumber}</p>}
        <div style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 14, color: '#666' }}>Your order will be delivered within 3-5 business days</p>
          {order?.shippingAddress && <p style={{ fontSize: 14, marginTop: 8, fontWeight: 500 }}>ðŸ“ {order.shippingAddress.city}, {order.shippingAddress.state}</p>}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/orders" className="btn btn-primary"><Package size={16} /> Track Order</Link>
          <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

// Orders.jsx
export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getMyOrders().then(({ data }) => setOrders(data.orders)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const STATUS_COLORS = { placed: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6', shipped: '#06b6d4', delivered: '#16a34a', cancelled: '#ef4444' };

  return (
    <div style={{ minHeight: '80vh', padding: '40px 0', background: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Orders</h1>
        {loading ? <p style={{ color: '#888' }}>Loading...</p> : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>ðŸ“¦</p>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No orders yet</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 12 }}>Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div key={order._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 16 }}>#{order.orderNumber}</p>
                    <p style={{ fontSize: 12, color: '#888' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 12, background: `${STATUS_COLORS[order.orderStatus]}20`, color: STATUS_COLORS[order.orderStatus], padding: '4px 12px', borderRadius: 20, fontWeight: 700, textTransform: 'capitalize' }}>{order.orderStatus}</span>
                    <p style={{ fontWeight: 700, fontSize: 16, marginTop: 6, color: '#1a5c3a' }}>â‚¹{order.pricing?.total?.toFixed(0)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {order.items?.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image || '/placeholder.png'} alt={item.name} style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0, background: '#f5f5f5' }} />
                  ))}
                  {order.items?.length > 3 && <div style={{ width: 48, height: 48, borderRadius: 6, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#888', flexShrink: 0 }}>+{order.items.length - 3}</div>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <Link to={`/orders/${order._id}`} style={{ fontSize: 13, color: '#1a5c3a', fontWeight: 600 }}>View Details â†’</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Profile.jsx
export function Profile() {
  const [tab, setTab] = useState('profile');
  const { user } = require('../context/store').useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const { authAPI } = require('../utils/api');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(form);
      require('react-hot-toast').default.success('Profile updated');
    } catch { require('react-hot-toast').default.error('Failed to update'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '80vh', padding: '40px 0', background: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Profile</h1>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#1a5c3a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</p>
              <p style={{ color: '#888', fontSize: 14 }}>{user?.email}</p>
            </div>
          </div>
          <form onSubmit={handleProfileUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone</label>
                <input type="tel" className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// NotFound.jsx
export function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
      <div>
        <p style={{ fontSize: 80, fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#e5e7eb', lineHeight: 1 }}>404</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Page Not Found</h1>
        <p style={{ color: '#888', marginBottom: 24 }}>Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  );
}

// ForgotPassword.jsx
export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { authAPI } = require('../utils/api');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch { require('react-hot-toast').default.error('Email not found'); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 20 }}>
      <div className="card" style={{ padding: 40, width: '100%', maxWidth: 440 }}>
        <Link to="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700 }}>NANA'S NATURAL</span>
        </Link>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>ðŸ“§</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Check your email</h2>
            <p style={{ color: '#666', fontSize: 14 }}>We sent a password reset link to {email}</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Forgot Password?</h1>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Enter your email to reset your password</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary btn-full">Send Reset Link</button>
            </form>
          </>
        )}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: '#1a5c3a', fontSize: 13, fontWeight: 600 }}>â† Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

// ResetPassword.jsx
export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const { token } = require('react-router-dom').useParams();
  const navigate = require('react-router-dom').useNavigate();
  const { authAPI } = require('../utils/api');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch { require('react-hot-toast').default.error('Reset failed or link expired'); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 20 }}>
      <div className="card" style={{ padding: 40, width: '100%', maxWidth: 440 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Reset Password</h1>
        {done ? <p style={{ color: '#16a34a', fontWeight: 600 }}>âœ… Password reset! Redirecting to login...</p> : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Reset Password</button>
          </form>
        )}
      </div>
    </div>
  );
}

// Wishlist.jsx
export function Wishlist() {
  const { items, fetchWishlist } = require('../context/store').useWishlistStore();
  useEffect(() => { fetchWishlist(); }, []);
  const ProductCard = require('../components/ProductCard').default;
  return (
    <div style={{ minHeight: '80vh', padding: '40px 0' }}>
      <div className="container">
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Wishlist ({items.length})</h1>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 40 }}>â¤ï¸</p>
            <p style={{ fontSize: 18, fontWeight: 600, marginTop: 12 }}>Your wishlist is empty</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Discover Products</Link>
          </div>
        ) : <div className="products-grid">{items.map(p => <ProductCard key={p._id} product={p} />)}</div>}
      </div>
    </div>
  );
}

// Search.jsx
export function Search() {
  const [searchParams] = require('react-router-dom').useSearchParams();
  const q = searchParams.get('q') || '';
  const Products = require('./Products').default;
  return <Products />;
}

// About.jsx
export function About() {
  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #e8f5e9, #f1f8f4)', padding: '80px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#1a5c3a', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Our Story</p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 700, marginBottom: 16 }}>About NANA'S NATURAL</h1>
        <p style={{ fontSize: 18, color: '#555', maxWidth: 600, margin: '0 auto' }}>
          We believe in harnessing nature's power to create effective, safe personal care products.
        </p>
      </div>
      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Our Mission</h2>
            <p style={{ color: '#555', lineHeight: 1.8, marginBottom: 16 }}>
              At NANA'S NATURAL, we're committed to developing hair and skin care products that use the finest natural ingredients backed by scientific research. Every product is dermatologist-tested and free from harmful chemicals.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
              {[['ðŸŒ¿', 'Natural Ingredients'], ['ðŸ”¬', 'Science-Backed'], ['â™»ï¸', 'Sustainable'], ['ðŸ’š', 'Cruelty-Free']].map(([icon, label]) => (
                <div key={label} style={{ background: '#f0f9f4', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #1a5c3a, #2d7a52)', borderRadius: 20, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>
            ðŸŒ¿
          </div>
        </div>
      </div>
    </div>
  );
}

// OrderDetail.jsx
export function OrderDetail() {
  const { id } = require('react-router-dom').useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => {
    ordersAPI.getById(id).then(({ data }) => setOrder(data.order)).catch(() => {});
  }, [id]);
  if (!order) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;
  return (
    <div style={{ padding: '40px 0', background: '#f8f9fa', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Order #{order.orderNumber}</h1>
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Items</h2>
          {order.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
              <img src={item.image || '/placeholder.png'} alt={item.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', background: '#f5f5f5' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                <p style={{ fontSize: 12, color: '#888' }}>Qty: {item.quantity} Ã— â‚¹{item.price}</p>
              </div>
              <span style={{ fontWeight: 700 }}>â‚¹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Shipping Address</h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#555' }}>
              {order.shippingAddress?.name}<br />
              {order.shippingAddress?.addressLine1}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
            </p>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Order Summary</h3>
            {[['Subtotal', `â‚¹${order.pricing?.subtotal?.toFixed(0)}`], ['Shipping', order.pricing?.shipping === 0 ? 'FREE' : `â‚¹${order.pricing?.shipping}`], ['Tax', `â‚¹${order.pricing?.tax?.toFixed(0)}`], ['Total', `â‚¹${order.pricing?.total?.toFixed(0)}`]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: l === 'Total' ? 700 : 400 }}>
                <span style={{ color: '#666' }}>{l}</span><span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Fix imports using standard React imports
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ordersAPI, authAPI } from '../utils/api';
import { useAuthStore, useWishlistStore } from '../context/store';

