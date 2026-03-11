// CartDrawer.jsx
import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../context/store';
import toast from 'react-hot-toast';

export function CartDrawer() {
  const { items, isOpen, setOpen, updateQuantity, removeFromCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 499 ? 0 : 50;

  const handleCheckout = () => {
    setOpen(false);
    if (!user) {
      toast.error('Please register to continue checkout.');
      navigate('/register');
    }
    else navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 998, backdropFilter: 'blur(2px)' }} />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 400, maxWidth: '100vw',
        background: 'white', zIndex: 999, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 48px rgba(0,0,0,0.12)', transform: 'translateX(0)',
        animation: 'slideIn 0.3s ease',
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={20} color="#1a5c3a" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>My Cart ({items.length})</span>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: '#666' }}>
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <ShoppingBag size={48} color="#ddd" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 500 }}>Your cart is empty</p>
              <Link to="/products" onClick={() => setOpen(false)} style={{ display: 'inline-block', marginTop: 12, color: '#1a5c3a', fontWeight: 600, fontSize: 14 }}>
                Start Shopping →
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item._id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
                <img src={item.product?.images?.[0]?.url || '/placeholder.png'} alt={item.name}
                  style={{ width: 68, height: 68, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: '#f5f5f5' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{item.product?.name || item.name}</p>
                  {item.variant && <p style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>{item.variant}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f5f5f5', borderRadius: 6, padding: '2px 4px' }}>
                      <button onClick={() => {
                        const productId = item.product?._id || item.product || item.productId;
                        if (!productId) return;
                        return item.quantity > 1
                          ? updateQuantity(productId, item.quantity - 1, item.variant || '')
                          : removeFromCart(productId);
                      }}
                        style={{ width: 24, height: 24, borderRadius: 4, background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => {
                        const productId = item.product?._id || item.product || item.productId;
                        if (!productId) return;
                        return updateQuantity(productId, item.quantity + 1, item.variant || '');
                      }}
                        style={{ width: 24, height: 24, borderRadius: 4, background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <span style={{ fontWeight: 700, color: '#1a5c3a' }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                </div>
                <button onClick={() => {
                  const productId = item.product?._id || item.product || item.productId;
                  if (!productId) return;
                  removeFromCart(productId);
                }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', alignSelf: 'flex-start', padding: 4 }}>
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px 20px', background: '#fafafa' }}>
            {subtotal < 499 && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#92400e' }}>
                Add ₹{(499 - subtotal).toFixed(0)} more for <strong>FREE delivery!</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
              <span style={{ color: '#666' }}>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
              <span style={{ color: '#666' }}>Shipping</span>
              <span style={{ color: shipping === 0 ? '#16a34a' : 'inherit' }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
              <span>Total</span><span style={{ color: '#1a5c3a' }}>₹{(subtotal + shipping).toFixed(0)}</span>
            </div>
            <button onClick={handleCheckout} className="btn btn-primary btn-full btn-lg">
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
