import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, Package, TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, title, value, sub, color = '#1a5c3a', trend }) => (
  <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </div>
      {trend !== undefined && (
        <span style={{ fontSize: 12, fontWeight: 600, color: trend >= 0 ? '#16a34a' : '#dc2626', background: trend >= 0 ? '#f0fdf4' : '#fef2f2', padding: '3px 8px', borderRadius: 20 }}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>{value}</p>
    <p style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{title}</p>
    {sub && <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{sub}</p>}
  </div>
);

const STATUS_COLORS = { placed: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6', shipped: '#06b6d4', delivered: '#16a34a', cancelled: '#ef4444' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
    </div>
  );

  const { stats, recentOrders, topProducts } = data || {};

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Dashboard</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Welcome back! Here's what's happening with NANA'S NATURAL.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon={ShoppingBag} title="Total Orders" value={stats?.totalOrders || 0} sub={`${stats?.monthOrders || 0} this month`} color="#1a5c3a" />
        <StatCard icon={TrendingUp} title="Revenue" value={`₹${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`} sub={`₹${((stats?.monthRevenue || 0) / 1000).toFixed(1)}K this month`} color="#7c3aed" />
        <StatCard icon={Users} title="Total Users" value={stats?.totalUsers || 0} sub={`${stats?.monthUsers || 0} new this month`} color="#2563eb" />
        <StatCard icon={Package} title="Products" value={stats?.totalProducts || 0} sub={`${stats?.lowStockProducts || 0} low stock`} color="#d97706" />
      </div>

      {/* Alerts */}
      {(stats?.pendingOrders > 0 || stats?.lowStockProducts > 0) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {stats?.pendingOrders > 0 && (
            <div style={{ flex: 1, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={18} color="#d97706" />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>{stats.pendingOrders} Pending Orders</p>
                <p style={{ fontSize: 12, color: '#b45309' }}>Require attention</p>
              </div>
            </div>
          )}
          {stats?.lowStockProducts > 0 && (
            <div style={{ flex: 1, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={18} color="#dc2626" />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#991b1b' }}>{stats.lowStockProducts} Low Stock Products</p>
                <p style={{ fontSize: 12, color: '#b91c1c' }}>Restock required</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Orders */}
        <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Orders</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(recentOrders || []).map(order => (
              <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>#{order.orderNumber}</p>
                  <p style={{ fontSize: 12, color: '#888' }}>{order.user?.name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1a5c3a' }}>₹{order.pricing?.total?.toFixed(0)}</p>
                  <span style={{ fontSize: 11, background: `${STATUS_COLORS[order.orderStatus]}20`, color: STATUS_COLORS[order.orderStatus], padding: '2px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'capitalize' }}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Top Selling Products</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(topProducts || []).map((product, i) => (
              <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? '#f4c542' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </span>
                <img src={product.images?.[0]?.url} alt={product.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', background: '#f5f5f5' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                  <p style={{ fontSize: 12, color: '#888' }}>{product.soldCount} sold</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1a5c3a', flexShrink: 0 }}>₹{product.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
