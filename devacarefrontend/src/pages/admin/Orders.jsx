import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  placed: { bg: '#fff7ed', text: '#d97706' },
  confirmed: { bg: '#eff6ff', text: '#2563eb' },
  processing: { bg: '#faf5ff', text: '#7c3aed' },
  shipped: { bg: '#ecfeff', text: '#0891b2' },
  delivered: { bg: '#f0fdf4', text: '#16a34a' },
  cancelled: { bg: '#fef2f2', text: '#dc2626' },
  returned: { bg: '#f9fafb', text: '#6b7280' },
};

const ORDER_STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 900 : false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await ordersAPI.getAll({ page, limit: 20, status: statusFilter, search });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (err) {
      setOrders([]);
      setTotal(0);
      toast.error(err.response?.data?.message || 'Failed to load admin orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleStatusUpdate = async (orderId) => {
    if (!newStatus) return;
    setStatusLoading(true);
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      toast.success('Order status updated');
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const ok = window.confirm('Delete this order permanently? This action cannot be undone.');
    if (!ok) return;

    try {
      await ordersAPI.deleteOrder(orderId);
      toast.success('Order deleted');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete order');
    }
  };

  const handleActionChange = (order, action, el) => {
    if (!action) return;

    if (action === 'update') {
      setSelectedOrder(order);
      setNewStatus(order.orderStatus);
    }

    if (action === 'delete') {
      handleDeleteOrder(order._id);
    }

    // Reset dropdown back to placeholder after action
    if (el) el.value = '';
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Orders ({total})</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search by order number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ width: 220, fontSize: 13 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input"
          style={{ fontSize: 13, padding: '9px 12px' }}
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s} style={{ textTransform: 'capitalize' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
          }}
        >
          <div style={{ background: 'white', borderRadius: 16, padding: 20, width: 'min(520px, 100%)', maxHeight: '92vh', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Update Order Status</h3>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>Order #{selectedOrder.orderNumber}</p>
            <select
              value={newStatus || selectedOrder.orderStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="form-input"
              style={{ marginBottom: 20 }}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedOrder(null)} className="btn btn-outline btn-sm">Cancel</button>
              <button onClick={() => handleStatusUpdate(selectedOrder._id)} disabled={statusLoading} className="btn btn-primary btn-sm">
                {statusLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ padding: 28, textAlign: 'center', color: '#999', background: 'white', borderRadius: 12 }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: '#999', background: 'white', borderRadius: 12 }}>No orders found</div>
          ) : (
            orders.map((order) => (
              <div key={order._id} style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: '#1a5c3a', fontSize: 14 }}>#{order.orderNumber}</p>
                    <p style={{ fontSize: 12, color: '#666' }}>{order.user?.name}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{order.user?.email}</p>
                  </div>
                  <p style={{ fontWeight: 700 }}>₹{order.pricing?.total?.toFixed(0)}</p>
                </div>

                <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 11,
                      background: STATUS_COLORS[order.orderStatus]?.bg,
                      color: STATUS_COLORS[order.orderStatus]?.text,
                      padding: '3px 8px',
                      borderRadius: 20,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {order.orderStatus}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      background: order.paymentStatus === 'paid' ? '#f0fdf4' : '#fff7ed',
                      color: order.paymentStatus === 'paid' ? '#16a34a' : '#d97706',
                      padding: '3px 8px',
                      borderRadius: 20,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {order.paymentStatus}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{order.items?.length} item(s)</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                </div>

                <div style={{ marginTop: 12 }}>
                  <select
                    defaultValue=""
                    className="form-input"
                    style={{ width: 160, fontSize: 12, padding: '7px 10px' }}
                    onChange={(e) => handleActionChange(order, e.target.value, e.target)}
                  >
                    <option value="" disabled>Action</option>
                    <option value="update">Update Status</option>
                    <option value="delete">Delete Order</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 980 }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#999' }}>Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#999' }}>No orders found</td></tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    style={{ borderTop: '1px solid #f5f5f5' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#fafafa'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'white'; }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1a5c3a' }}>#{order.orderNumber}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontWeight: 500, fontSize: 13 }}>{order.user?.name}</p>
                      <p style={{ fontSize: 11, color: '#888' }}>{order.user?.email}</p>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#666' }}>{order.items?.length} item(s)</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>₹{order.pricing?.total?.toFixed(0)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: 11,
                          background: order.paymentStatus === 'paid' ? '#f0fdf4' : '#fff7ed',
                          color: order.paymentStatus === 'paid' ? '#16a34a' : '#d97706',
                          padding: '3px 8px',
                          borderRadius: 20,
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: 11,
                          background: STATUS_COLORS[order.orderStatus]?.bg,
                          color: STATUS_COLORS[order.orderStatus]?.text,
                          padding: '3px 8px',
                          borderRadius: 20,
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#888', fontSize: 12 }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        defaultValue=""
                        className="form-input"
                        style={{ width: 160, fontSize: 12, padding: '7px 10px' }}
                        onChange={(e) => handleActionChange(order, e.target.value, e.target)}
                      >
                        <option value="" disabled>Action</option>
                        <option value="update">Update Status</option>
                        <option value="delete">Delete Order</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
