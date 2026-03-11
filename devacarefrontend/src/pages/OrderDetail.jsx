import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ordersAPI } from '../utils/api';
export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => { ordersAPI.getById(id).then(({ data }) => setOrder(data.order)).catch(() => {}); }, [id]);
  if (!order) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;
  return (
    <div style={{ padding: '40px 0', background: '#f8f9fa', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Order #{order.orderNumber}</h1>
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Items Ordered</h2>
          {order.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
              <img src={item.image} alt={item.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', background: '#f5f5f5' }} />
              <div style={{ flex: 1 }}><p style={{ fontWeight: 600 }}>{item.name}</p><p style={{ fontSize: 12, color: '#888' }}>Qty: {item.quantity} × ₹{item.price}</p></div>
              <span style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
