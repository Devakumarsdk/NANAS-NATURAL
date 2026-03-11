// Admin/Products.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Star } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../../utils/api';
import toast from 'react-hot-toast';

function ProductModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name || '', brand: product?.brand || '',
    price: product?.price || '', discountPrice: product?.discountPrice || '',
    stock: product?.stock || 0, description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    ratings: product?.ratings ?? 0,
    numReviews: product?.numReviews ?? 0,
    category: product?.category?._id || product?.category || '',
    isFeatured: product?.isFeatured || false,
    isNewLaunch: product?.isNewLaunch || false,
    isBestSeller: product?.isBestSeller || false,
    isActive: product?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const safeRatings = Math.max(0, Math.min(5, Number(form.ratings || 0)));
      const safeNumReviews = Math.max(0, Math.floor(Number(form.numReviews || 0)));
      const payload = {
        ...form,
        ratings: Number.isFinite(safeRatings) ? safeRatings : 0,
        numReviews: Number.isFinite(safeNumReviews) ? safeNumReviews : 0,
      };

      if (product?._id) {
        if (images.length > 0) {
          const formData = new FormData();
          Object.entries(payload).forEach(([k, v]) => formData.append(k, v));
          images.forEach(img => formData.append('images', img));
          await productsAPI.update(product._id, formData);
        } else {
          await productsAPI.update(product._id, payload);
        }
        toast.success('Product updated');
      } else {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => formData.append(k, v));
        images.forEach(img => formData.append('images', img));
        await productsAPI.create(formData);
        toast.success('Product created');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['Product Name *', 'name', 'text'], ['Brand *', 'brand', 'text'], ['Price (₹) *', 'price', 'number'], ['Discount Price (₹)', 'discountPrice', 'number'], ['Stock *', 'stock', 'number']].map(([label, key, type]) => (
              <div key={key} className="form-group" style={{ marginBottom: 0, gridColumn: key === 'name' ? '1 / -1' : 'auto' }}>
                <label className="form-label">{label}</label>
                <input type={type} className="form-input" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={label.includes('*')} />
              </div>
            ))}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Admin Rating</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 42, border: '1px solid #e2e8f0', borderRadius: 10, padding: '0 10px', background: '#fff' }}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, ratings: value })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'grid', placeItems: 'center' }}
                    aria-label={`Set ${value} star rating`}
                  >
                    <Star size={16} color="#f59e0b" fill={value <= Number(form.ratings || 0) ? '#f59e0b' : 'none'} />
                  </button>
                ))}
                <span style={{ marginLeft: 4, fontSize: 13, fontWeight: 700, color: '#475569' }}>{Number(form.ratings || 0).toFixed(1)}</span>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Number of Reviews</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.numReviews}
                onChange={e => setForm({ ...form, numReviews: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category *</label>
              <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Images</label>
              <input type="file" multiple accept="image/*" onChange={e => setImages([...e.target.files])} className="form-input" style={{ padding: '6px 12px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Short Description</label>
              <input type="text" className="form-input" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Description *</label>
              <textarea className="form-input" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
            {[['isFeatured', 'Featured'], ['isNewLaunch', 'New Launch'], ['isBestSeller', 'Best Seller'], ['isActive', 'Active']].map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} style={{ accentColor: '#1a5c3a' }} />
                {label}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <><span className="spinner" /> Saving...</> : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalProduct, setModalProduct] = useState(undefined);
  const [showModal, setShowModal] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prod, cats] = await Promise.all([productsAPI.getAll({ limit: 50, search }), categoriesAPI.getAll()]);
      setProducts(prod.data.products);
      setCategories(cats.data.categories);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div>
      {showModal && <ProductModal product={modalProduct} categories={categories} onClose={() => { setShowModal(false); setModalProduct(undefined); }} onSave={() => { setShowModal(false); setModalProduct(undefined); fetchProducts(); }} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Products ({products.length})</h1>
        <button onClick={() => { setModalProduct(null); setShowModal(true); }} className="btn btn-primary btn-sm">
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ position: 'relative', maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input type="search" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: 32, fontSize: 13 }} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Product', 'Brand', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} style={{ borderTop: '1px solid #f5f5f5' }} onMouseOver={e => e.currentTarget.style.background = '#fafafa'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={p.images?.[0]?.url} alt={p.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', background: '#f5f5f5' }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</p>
                        <p style={{ fontSize: 11, color: '#888' }}>SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#666' }}>{p.brand}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 700 }}>₹{p.discountPrice || p.price}</span>
                    {p.discountPrice && <span style={{ fontSize: 11, color: '#999', textDecoration: 'line-through', marginLeft: 4 }}>₹{p.price}</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: p.stock < 10 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{p.stock}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, background: p.isActive ? '#f0fdf4' : '#fef2f2', color: p.isActive ? '#16a34a' : '#dc2626', padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setModalProduct(p); setShowModal(true); }} style={{ background: '#eff6ff', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#2563eb' }}>
                        <Edit size={13} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#dc2626' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;
