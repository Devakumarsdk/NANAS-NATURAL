import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../context/store';
import { authAPI, ordersAPI, paymentsAPI, couponsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import BrandLoader from '../components/BrandLoader';

const STATES = ['Andhra Pradesh','Delhi','Gujarat','Karnataka','Kerala','Maharashtra','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal','Other'];

const loadRazorpaySDK = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

export default function Checkout() {
  const { user, fetchUser } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const navigate = useNavigate();

  const addresses = useMemo(() => user?.addresses || [], [user?.addresses]);
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;

  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?._id || '');
  const [useNewAddress, setUseNewAddress] = useState(!defaultAddress);
  const [saveForFuture, setSaveForFuture] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine1: defaultAddress?.addressLine1 || '',
    addressLine2: defaultAddress?.addressLine2 || '',
    city: defaultAddress?.city || '',
    state: defaultAddress?.state || 'Maharashtra',
    pincode: defaultAddress?.pincode || '',
    country: defaultAddress?.country || 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal - couponDiscount >= 499 ? 0 : 50;
  const tax = Math.round((subtotal - couponDiscount) * 0.18);
  const total = subtotal - couponDiscount + shipping + tax;

  useEffect(() => {
    const timer = window.setTimeout(() => setPageLoading(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const freshDefault = addresses.find((a) => a.isDefault) || addresses[0] || null;
    if (!freshDefault) {
      setUseNewAddress(true);
      setSelectedAddressId('');
      return;
    }

    if (!useNewAddress) {
      const addressId = selectedAddressId || freshDefault._id;
      setSelectedAddressId(addressId);
      const selected = addresses.find((a) => a._id === addressId) || freshDefault;
      setAddress({
        name: selected.name || user?.name || '',
        phone: selected.phone || user?.phone || '',
        addressLine1: selected.addressLine1 || '',
        addressLine2: selected.addressLine2 || '',
        city: selected.city || '',
        state: selected.state || 'Maharashtra',
        pincode: selected.pincode || '',
        country: selected.country || 'India',
      });
    }
  }, [addresses, selectedAddressId, useNewAddress, user?.name, user?.phone]);

  const applyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    try {
      const { data } = await couponsAPI.validate(couponCode, subtotal);
      setCouponDiscount(data.coupon.discount);
      toast.success(`Coupon applied! You save Rs. ${data.coupon.discount.toFixed(0)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const resolveShippingAddress = () => {
    if (useNewAddress) return address;
    const selected = addresses.find((a) => a._id === selectedAddressId);
    return selected || address;
  };

  const saveAddressIfNeeded = async (resolvedAddress) => {
    if (!useNewAddress || !saveForFuture) return;

    await authAPI.addAddress({
      ...resolvedAddress,
      isDefault: saveAsDefault,
    });
    await fetchUser();
  };

  const handleOrder = async () => {
    const shippingAddress = resolveShippingAddress();
    if (!shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.pincode || !shippingAddress.name || !shippingAddress.phone) {
      toast.error('Please fill in your complete address');
      return;
    }

    setLoading(true);
    try {
      await saveAddressIfNeeded(shippingAddress);

      const orderData = {
        items: items.map((i) => ({ product: i.product._id || i.product, quantity: i.quantity, variant: i.variant })),
        shippingAddress,
        paymentMethod,
        couponCode: couponCode || undefined,
      };

      const { data: orderRes } = await ordersAPI.create(orderData);
      const order = orderRes.order;

      if (paymentMethod === 'cod') {
        await paymentsAPI.confirmCOD(order._id);
        await wait(3000);
        await clearCart();
        navigate(`/order-success/${order._id}`);
        return;
      }

      if (paymentMethod === 'razorpay') {
        const sdkLoaded = await loadRazorpaySDK();
        if (!sdkLoaded) {
          toast.error('Unable to load Razorpay checkout');
          setLoading(false);
          return;
        }

        const { data: razorpayData } = await paymentsAPI.createRazorpayOrder(order._id);
        if (!razorpayData?.razorpayOrderId || !razorpayData?.keyId) {
          toast.error('Unable to initialize Razorpay checkout');
          setLoading(false);
          return;
        }

        const razorpay = new window.Razorpay({
          key: razorpayData.keyId,
          amount: razorpayData.amount,
          currency: razorpayData.currency || 'INR',
          order_id: razorpayData.razorpayOrderId,
          name: "NANA'S NATURAL",
          description: `Order ${razorpayData.orderNumber}`,
          prefill: razorpayData.customer || {},
          theme: { color: '#1a5c3a' },
          handler: async (response) => {
            try {
              await paymentsAPI.verifyRazorpay({
                orderId: order._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              await clearCart();
              toast.success('Payment successful');
              navigate(`/order-success/${order._id}`);
            } catch (verifyErr) {
              toast.error(verifyErr.response?.data?.message || 'Unable to verify payment');
              navigate(`/orders/${order._id}`);
            }
          },
          modal: {
            ondismiss: () => {
              toast.success('Payment not completed. Please retry from checkout.');
              navigate('/checkout');
            },
          },
        });

        razorpay.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (pageLoading) {
    return <BrandLoader show message="Loading your checkout..." />;
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '32px 0' }}>
      <BrandLoader show={loading} message="Preparing your secure checkout..." />
      <div className="container">
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Checkout</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Delivery Address</h2>

              {addresses.length > 0 && (
                <>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                    <button type="button" className={`btn btn-sm ${!useNewAddress ? 'btn-primary' : 'btn-outline'}`} onClick={() => setUseNewAddress(false)}>
                      Use Saved Address
                    </button>
                    <button type="button" className={`btn btn-sm ${useNewAddress ? 'btn-primary' : 'btn-outline'}`} onClick={() => setUseNewAddress(true)}>
                      Add New Address
                    </button>
                  </div>

                  {!useNewAddress && (
                    <div style={{ marginBottom: 14 }}>
                      <select
                        className="form-input"
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                      >
                        {addresses.map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.name} - {a.addressLine1}, {a.city} {a.isDefault ? '(Default)' : ''}
                          </option>
                        ))}
                      </select>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                        Manage addresses from <Link to="/profile" style={{ color: '#1a5c3a', fontWeight: 700 }}>My Profile</Link>
                      </p>
                    </div>
                  )}
                </>
              )}

              {(useNewAddress || addresses.length === 0) && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[
                      ['Full Name', 'name', 'text', 'John Doe'],
                      ['Phone', 'phone', 'tel', '+91 98765 43210'],
                    ].map(([label, key, type, placeholder]) => (
                      <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">{label} *</label>
                        <input type={type} className="form-input" placeholder={placeholder} value={address[key]} onChange={(e) => setAddress({ ...address, [key]: e.target.value })} required />
                      </div>
                    ))}
                    <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                      <label className="form-label">Address Line 1 *</label>
                      <input type="text" className="form-input" placeholder="Flat/House no, Street, Area" value={address.addressLine1} onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                      <label className="form-label">Address Line 2</label>
                      <input type="text" className="form-input" placeholder="Landmark, Building (optional)" value={address.addressLine2} onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })} />
                    </div>
                    {[
                      ['City *', 'city', 'Mumbai'],
                      ['Pincode *', 'pincode', '400001'],
                    ].map(([label, key, placeholder]) => (
                      <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">{label}</label>
                        <input type="text" className="form-input" placeholder={placeholder} value={address[key]} onChange={(e) => setAddress({ ...address, [key]: e.target.value })} required />
                      </div>
                    ))}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">State *</label>
                      <select className="form-input" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <label style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={saveForFuture} onChange={(e) => setSaveForFuture(e.target.checked)} />
                    Save this address for next time
                  </label>
                  {saveForFuture && (
                    <label style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input type="checkbox" checked={saveAsDefault} onChange={(e) => setSaveAsDefault(e.target.checked)} />
                      Set as default address
                    </label>
                  )}
                </>
              )}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Payment Method</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { value: 'razorpay', label: 'Razorpay', desc: 'Cards, UPI, net banking and wallets via Razorpay' },
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                ].map((opt) => (
                  <label key={opt.value} onClick={() => setPaymentMethod(opt.value)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10, border: `2px solid ${paymentMethod === opt.value ? '#1a5c3a' : '#e5e7eb'}`, cursor: 'pointer', background: paymentMethod === opt.value ? '#f0f9f4' : 'white', transition: 'all 0.2s' }}>
                    <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} readOnly style={{ accentColor: '#1a5c3a' }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</p>
                      <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24, position: 'sticky', top: 120 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Order Summary</h2>

            <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 16 }}>
              {items.map((item) => (
                <div key={item._id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <img src={item.product?.images?.[0]?.url || '/placeholder.png'} alt={item.name} style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', background: '#f5f5f5' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{item.product?.name || item.name}</p>
                    <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Qty: {item.quantity}</p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, flexShrink: 0 }}>Rs. {(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input type="text" className="form-input" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} style={{ flex: 1 }} />
              <button onClick={applyCoupon} disabled={couponLoading} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                {couponLoading ? '...' : 'Apply'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Subtotal', `Rs. ${subtotal.toFixed(0)}`],
                ...(couponDiscount > 0 ? [['Coupon Discount', `-Rs. ${couponDiscount.toFixed(0)}`]] : []),
                ['Shipping', shipping === 0 ? 'FREE' : `Rs. ${shipping}`],
                ['Tax (GST 18%)', `Rs. ${tax.toFixed(0)}`],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#666' }}>{label}</span>
                  <span style={{ fontWeight: label === 'Shipping' && shipping === 0 ? 700 : 500, color: label.includes('Discount') ? '#16a34a' : 'inherit' }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
                <span>Total</span>
                <span style={{ color: '#1a5c3a' }}>Rs. {total.toFixed(0)}</span>
              </div>
            </div>

            <button onClick={handleOrder} disabled={loading} className="btn btn-primary btn-full btn-lg" style={{ marginTop: 20 }}>
              {loading ? <><span className="spinner" /> Processing...</> : `Place Order - Rs. ${total.toFixed(0)}`}
            </button>

            <p style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 12 }}>
              Secured by SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
