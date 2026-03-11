import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../utils/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { ordersAPI.getMyOrders().then(({ data }) => setOrders(data.orders)).catch(() => {}).finally(() => setLoading(false)); }, []);
  const STATUS_COLORS = { placed: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6', shipped: '#06b6d4', delivered: '#16a34a', cancelled: '#ef4444' };
  return (
    <div style={{ minHeight: '80vh', padding: '40px 0', background: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Orders</h1>
        {loading ? <p>Loading...</p> : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>📦</p>
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
                    <p style={{ fontWeight: 700, fontSize: 16, marginTop: 6, color: '#1a5c3a' }}>₹{order.pricing?.total?.toFixed(0)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {order.items?.slice(0, 4).map((item, i) => <img key={i} src={item.image || '/placeholder.png'} alt={item.name} style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', background: '#f5f5f5' }} />)}
                </div>
                <div style={{ textAlign: 'right', marginTop: 12 }}>
                  <Link to={`/orders/${order._id}`} style={{ fontSize: 13, color: '#1a5c3a', fontWeight: 600 }}>View Details →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
