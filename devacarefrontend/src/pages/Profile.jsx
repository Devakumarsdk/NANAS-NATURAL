import React, { useMemo, useState } from 'react';
import { useAuthStore } from '../context/store';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const STATES = ['Andhra Pradesh','Delhi','Gujarat','Karnataka','Kerala','Maharashtra','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal','Other'];

const emptyAddress = {
  name: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: 'Maharashtra',
  pincode: '',
  country: 'India',
  isDefault: false,
};

export default function Profile() {
  const { user, fetchUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);

  const addresses = useMemo(() => user?.addresses || [], [user?.addresses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(form);
      await fetchUser();
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm(emptyAddress);
    setEditingAddressId('');
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.pincode) {
      toast.error('Please fill all required address fields');
      return;
    }

    setAddressLoading(true);
    try {
      if (editingAddressId) {
        await authAPI.updateAddress(editingAddressId, addressForm);
        toast.success('Address updated');
      } else {
        await authAPI.addAddress(addressForm);
        toast.success('Address saved');
      }
      await fetchUser();
      resetAddressForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      name: address.name || '',
      phone: address.phone || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || 'Maharashtra',
      pincode: address.pincode || '',
      country: address.country || 'India',
      isDefault: !!address.isDefault,
    });
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await authAPI.deleteAddress(id);
      await fetchUser();
      toast.success('Address deleted');
      if (editingAddressId === id) resetAddressForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await authAPI.setDefaultAddress(id);
      await fetchUser();
      toast.success('Default address updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set default address');
    }
  };

  return (
    <div style={{ minHeight: '80vh', padding: '40px 0', background: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Profile</h1>

        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#1a5c3a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</p>
              <p style={{ color: '#888', fontSize: 14 }}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone</label>
                <input type="tel" className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving...' : 'Save Profile'}</button>
          </form>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Address Book</h2>

          {addresses.length === 0 ? (
            <p style={{ color: '#64748b', marginBottom: 16 }}>No saved addresses yet. Add your first address below.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
              {addresses.map((addr) => (
                <div key={addr._id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: addr.isDefault ? '#f0fdf4' : '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700 }}>{addr.name} {addr.isDefault && <span style={{ color: '#15803d', fontSize: 12 }}>(Default)</span>}</p>
                      <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Phone: {addr.phone}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {!addr.isDefault && (
                        <button type="button" onClick={() => handleSetDefaultAddress(addr._id)} className="btn btn-outline btn-sm">Set Default</button>
                      )}
                      <button type="button" onClick={() => handleEditAddress(addr)} className="btn btn-outline btn-sm">Edit</button>
                      <button type="button" onClick={() => handleDeleteAddress(addr._id)} className="btn btn-outline btn-sm" style={{ color: '#dc2626', borderColor: '#fecaca' }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
          <form onSubmit={handleSaveAddress}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone *</label>
                <input className="form-input" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Address Line 1 *</label>
                <input className="form-input" value={addressForm.addressLine1} onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Address Line 2</label>
                <input className="form-input" value={addressForm.addressLine2} onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">City *</label>
                <input className="form-input" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pincode *</label>
                <input className="form-input" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">State *</label>
                <select className="form-input" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Country</label>
                <input className="form-input" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} />
              </div>
            </div>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 14, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
              Set as default address
            </label>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" disabled={addressLoading}>{addressLoading ? 'Saving...' : (editingAddressId ? 'Update Address' : 'Save Address')}</button>
              {editingAddressId && (
                <button type="button" className="btn btn-outline" onClick={resetAddressForm}>Cancel Edit</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
