import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useAuthStore, useCartStore } from '../context/store';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, updateQuantity, removeFromCart, setOpen } = useCartStore();

  useEffect(() => {
    if (!user) {
      toast.error('Please register to view your cart and orders.');
      navigate('/register');
    }
  }, [user, navigate]);

  if (!user) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 499 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please register to continue checkout.');
      navigate('/register');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <ShoppingBag size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Your cart is empty</h1>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Add products to your cart to continue checkout.</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '32px 0' }}>
      <div className="container">
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 24 }}>Shopping Cart</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          <div className="card" style={{ padding: 20 }}>
            {items.map((item) => (
              <div
                key={`${item.product?._id || item.product}-${item.variant || 'default'}`}
                style={{ display: 'grid', gridTemplateColumns: '92px 1fr auto', gap: 16, padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}
              >
                <img
                  src={item.product?.images?.[0]?.url || '/placeholder.png'}
                  alt={item.product?.name || item.name}
                  style={{ width: 92, height: 92, borderRadius: 10, objectFit: 'cover', background: '#f3f4f6' }}
                />
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 6 }}>{item.product?.name || item.name}</p>
                  {item.variant ? <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 10 }}>{item.variant}</p> : null}
                  <p style={{ fontWeight: 700, color: '#1a5c3a', marginBottom: 10 }}>Rs.{item.price.toFixed(0)}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f3f4f6', borderRadius: 8, padding: '4px 6px' }}>
                    <button
                      onClick={() => {
                        const productId = item.product?._id || item.product || item.productId;
                        if (!productId) return;
                        return item.quantity > 1
                          ? updateQuantity(productId, item.quantity - 1, item.variant || '')
                          : removeFromCart(productId);
                      }}
                      style={{ border: 'none', background: 'transparent', width: 24, height: 24, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button
                      onClick={() => {
                        const productId = item.product?._id || item.product || item.productId;
                        if (!productId) return;
                        return updateQuantity(productId, item.quantity + 1, item.variant || '');
                      }}
                      style={{ border: 'none', background: 'transparent', width: 24, height: 24, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => {
                      const productId = item.product?._id || item.product || item.productId;
                      if (!productId) return;
                      removeFromCart(productId);
                    }}
                    style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', alignSelf: 'flex-end' }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <p style={{ fontWeight: 700 }}>Rs.{(item.price * item.quantity).toFixed(0)}</p>
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 18 }}>
              <button className="btn btn-outline" onClick={() => setOpen(true)}>
                Open Quick Cart
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 22, position: 'sticky', top: 112 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Order Summary</h2>
            <div style={{ display: 'grid', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span>Rs.{subtotal.toFixed(0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `Rs.${shipping}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Tax (GST 18%)</span>
                <span>Rs.{tax.toFixed(0)}</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 14, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: '#1a5c3a' }}>Rs.{total.toFixed(0)}</span>
            </div>
            <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 18 }} onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            <Link to="/products" style={{ display: 'inline-block', marginTop: 12, fontWeight: 600, color: '#1a5c3a' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

