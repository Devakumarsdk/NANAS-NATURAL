import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../context/store';
import ProductCard from '../components/ProductCard';
export default function Wishlist() {
  const { items, fetchWishlist } = useWishlistStore();
  useEffect(() => { fetchWishlist(); }, []);
  return (
    <div style={{ minHeight: '80vh', padding: '40px 0' }}>
      <div className="container">
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Wishlist ({items.length})</h1>
        {items.length === 0 ? <div style={{ textAlign: 'center', padding: '60px 20px' }}><p style={{ fontSize: 48 }}>❤️</p><p style={{ fontSize: 18, fontWeight: 600, marginTop: 12 }}>Your wishlist is empty</p><Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Discover Products</Link></div>
        : <div className="products-grid">{items.map(p => <ProductCard key={p._id} product={p} />)}</div>}
      </div>
    </div>
  );
}
