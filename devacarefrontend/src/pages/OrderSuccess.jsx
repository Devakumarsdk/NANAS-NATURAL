import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import { ordersAPI } from '../utils/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => { ordersAPI.getById(id).then(({ data }) => setOrder(data.order)).catch(() => {}); }, [id]);
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#f8f9fa' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f0fdf4', border: '3px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={40} color="#16a34a" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Order Placed! 🎉</h1>
        <p style={{ color: '#666', marginBottom: 4 }}>Thank you for shopping with NANA'S NATURAL</p>
        {order && <p style={{ fontWeight: 700, color: '#1a5c3a', fontSize: 18, marginBottom: 24 }}>#{order.orderNumber}</p>}
        <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>You'll receive an email confirmation shortly. Your order will be delivered within 3-5 business days.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/orders" className="btn btn-primary"><Package size={16} /> Track Order</Link>
          <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
