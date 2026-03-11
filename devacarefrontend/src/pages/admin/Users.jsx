import React, { useState, useEffect } from 'react';
import { adminAPI, categoriesAPI, couponsAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, X, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../context/store';

export function AdminUsers() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openActionFor, setOpenActionFor] = useState(null);

  useEffect(() => {
    setLoading(true);
    adminAPI.getUsers({ search }).then(({ data }) => setUsers(data.users)).catch(() => {}).finally(() => setLoading(false));
  }, [search]);

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${user.name} to ${newRole}?`)) return;
    try {
      await adminAPI.updateUserRole(user._id, newRole);
      setUsers(users.map(u => u._id === user._id ? { ...u, role: newRole } : u));
      setOpenActionFor(null);
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const handleDeleteUser = async (user) => {
    if (user._id === currentUser?._id) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (!window.confirm(`Delete user "${user.name}"? This action cannot be undone.`)) return;

    try {
      await adminAPI.deleteUser(user._id);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      setOpenActionFor(null);
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Users ({users.length})</h1>
      <div style={{ marginBottom: 16 }}>
        <input type="search" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ width: 280, fontSize: 13 }} />
      </div>
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              {['User', 'Email', 'Phone', 'Role', 'Joined', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} style={{ borderTop: '1px solid #f5f5f5' }}>
                <td style={{ padding: '12px 16px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#1a5c3a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#666', fontSize: 13 }}>{user.email}</td>
                <td style={{ padding: '12px 16px', color: '#666', fontSize: 13 }}>{user.phone || 'â€”'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, background: user.role === 'admin' ? '#faf5ff' : '#f0fdf4', color: user.role === 'admin' ? '#7c3aed' : '#16a34a', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#888', fontSize: 12 }}>
                  {new Date(user.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                      onClick={() => setOpenActionFor(openActionFor === user._id ? null : user._id)}
                      style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}
                    >
                      Action
                    </button>
                    {openActionFor === user._id && (
                      <div style={{ position: 'absolute', right: 0, top: '110%', minWidth: 170, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 10px 28px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
                        <button
                          onClick={() => toggleRole(user)}
                          style={{ width: '100%', textAlign: 'left', fontSize: 12, padding: '9px 10px', border: 'none', background: '#fff', cursor: 'pointer' }}
                        >
                          Make {user.role === 'admin' ? 'User' : 'Admin'}
                        </button>
                        {user.role === 'user' && user._id !== currentUser?._id && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            style={{ width: '100%', textAlign: 'left', fontSize: 12, padding: '9px 10px', border: 'none', background: '#fff', color: '#dc2626', cursor: 'pointer' }}
                          >
                            Remove User
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const fetchCats = () => categoriesAPI.getAll().then(({ data }) => setCategories(data.categories)).catch(() => {});
  useEffect(() => { fetchCats(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await categoriesAPI.create(form);
      toast.success('Category created');
      setForm({ name: '', description: '' });
      fetchCats();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await categoriesAPI.delete(id); toast.success('Deleted'); fetchCats(); }
    catch { toast.error('Cannot delete (has products)'); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Add Category</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </form>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 700 }}>All Categories ({categories.length})</div>
        {categories.map(cat => (
          <div key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f5f5f5' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{cat.name}</p>
              {cat.description && <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{cat.description}</p>}
            </div>
            <button onClick={() => handleDelete(cat._id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#dc2626' }}>
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrderValue: 0, maxDiscount: '', validFrom: '', validUntil: '', description: '' });
  const [loading, setLoading] = useState(false);
  const sampleCoupons = [
    { code: 'WELCOME10', type: 'percentage', value: 10, minOrderValue: 499, maxDiscount: 150, description: '10% off on first order' },
    { code: 'FLAT200', type: 'fixed', value: 200, minOrderValue: 999, maxDiscount: '', description: 'Flat Rs. 200 off on orders above Rs. 999' },
    { code: 'FIRST20', type: 'percentage', value: 20, minOrderValue: 799, maxDiscount: 250, description: '20% off for new users' },
  ];

  const fetchCoupons = () => {
    setCouponsLoading(true);
    couponsAPI.getAll()
      .then(({ data }) => setCoupons(data.coupons || []))
      .catch((err) => {
        setCoupons([]);
        toast.error(err.response?.data?.message || 'Failed to load coupons');
      })
      .finally(() => setCouponsLoading(false));
  };
  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valueNum = Number(form.value);
    const minOrderNum = Number(form.minOrderValue || 0);
    const maxDiscountNum = form.maxDiscount === '' ? null : Number(form.maxDiscount);

    if (!form.code.trim()) return toast.error('Coupon code is required');
    if (Number.isNaN(valueNum) || valueNum <= 0) return toast.error('Value must be a valid number greater than 0');
    if (form.type === 'percentage' && valueNum > 100) return toast.error('Percentage value cannot be more than 100');
    if (Number.isNaN(minOrderNum) || minOrderNum < 0) return toast.error('Min order must be a valid non-negative number');
    if (maxDiscountNum !== null && (Number.isNaN(maxDiscountNum) || maxDiscountNum < 0)) return toast.error('Max discount must be a valid non-negative number');
    if (!form.validFrom || !form.validUntil) return toast.error('Valid from/until dates are required');

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      value: valueNum,
      minOrderValue: minOrderNum,
      maxDiscount: maxDiscountNum,
    };

    setLoading(true);
    try {
      await couponsAPI.create(payload);
      toast.success('Coupon created');
      setShowForm(false);
      setForm({ code: '', type: 'percentage', value: '', minOrderValue: 0, maxDiscount: '', validFrom: '', validUntil: '', description: '' });
      fetchCoupons();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await couponsAPI.delete(id); toast.success('Deleted'); fetchCoupons(); }
    catch { toast.error('Failed'); }
  };

  const handleClearAllCoupons = async () => {
    if (!window.confirm('Delete all coupons? This action cannot be undone.')) return;
    try {
      const { data } = await couponsAPI.clearAll();
      setCoupons([]);
      toast.success(data?.message || 'All coupons deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete all coupons');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Coupons</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleClearAllCoupons} className="btn btn-outline btn-sm" style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fff' }}>
            Remove All
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm"><Plus size={14} /> Add Coupon</button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Create Coupon</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {sampleCoupons.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  const now = new Date();
                  const in30 = new Date();
                  in30.setDate(in30.getDate() + 30);
                  setForm({
                    code: c.code,
                    type: c.type,
                    value: c.value,
                    minOrderValue: c.minOrderValue,
                    maxDiscount: c.maxDiscount,
                    validFrom: now.toISOString().slice(0, 10),
                    validUntil: in30.toISOString().slice(0, 10),
                    description: c.description,
                  });
                }}
                style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Use {c.code}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[['Code *', 'code', 'text'], ['Value *', 'value', 'number'], ['Min Order (Rs.)', 'minOrderValue', 'number'], ['Max Discount (Rs.)', 'maxDiscount', 'number'], ['Valid From *', 'validFrom', 'date'], ['Valid Until *', 'validUntil', 'date']].map(([label, key, type]) => (
                <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{label}</label>
                  <input type={type} className="form-input" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={label.includes('*')} />
                </div>
              ))}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="percentage">Percentage %</option>
                  <option value="fixed">Fixed Amount Rs.</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <input type="text" className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. 20% off on first order" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Creating...' : 'Create Coupon'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              {['Code', 'Type', 'Value', 'Min Order', 'Used', 'Valid Until', 'Status', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {couponsLoading ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#999' }}>Loading coupons...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#999' }}>No coupons found</td></tr>
            ) : coupons.map(c => (
              <tr key={c._id} style={{ borderTop: '1px solid #f5f5f5' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'monospace', color: '#1a5c3a', fontSize: 15 }}>{c.code}</td>
                <td style={{ padding: '12px 16px', textTransform: 'capitalize', color: '#666' }}>{c.type}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.type === 'percentage' ? `${c.value}%` : `Rs. ${c.value}`}</td>
                <td style={{ padding: '12px 16px', color: '#666' }}>Rs. {c.minOrderValue}</td>
                <td style={{ padding: '12px 16px', color: '#666' }}>{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                <td style={{ padding: '12px 16px', color: '#666', fontSize: 12 }}>{new Date(c.validUntil).toLocaleDateString('en-IN')}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, background: c.isActive && new Date(c.validUntil) > new Date() ? '#f0fdf4' : '#fef2f2', color: c.isActive && new Date(c.validUntil) > new Date() ? '#16a34a' : '#dc2626', padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>
                    {c.isActive && new Date(c.validUntil) > new Date() ? 'Active' : 'Expired'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => handleDelete(c._id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#dc2626' }}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

