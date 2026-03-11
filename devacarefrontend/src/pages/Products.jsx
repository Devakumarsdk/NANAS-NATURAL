import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: '-soldCount', label: 'Best Selling' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-ratings', label: 'Top Rated' },
  { value: '-discountPercent', label: 'Highest Discount' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const sort = searchParams.get('sort') || '-createdAt';
  const category = searchParams.get('category') || '';
  const search = (searchParams.get('search') || searchParams.get('q') || '').trim();
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const bestSeller = searchParams.get('bestSeller') || '';
  const newLaunch = searchParams.get('newLaunch') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const params = { page, limit: 12, sort };
        if (category) params.category = category;
        if (search) params.search = search;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (bestSeller) params.bestSeller = bestSeller;
        if (newLaunch) params.newLaunch = newLaunch;

        const { data } = await productsAPI.getAll(params);
        const fetchedPages = Math.max(1, Number(data.pages) || 1);

        if (page > fetchedPages) {
          setPage(fetchedPages);
          return;
        }

        setProducts(data.products);
        setTotal(data.total);
        setPages(fetchedPages);
      } catch {
        setProducts([]);
        setTotal(0);
        setPages(1);
        setFetchError('Unable to load products. Please ensure backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, sort, category, search, minPrice, maxPrice, bestSeller, newLaunch]);

  const updateParam = (key, val, { resetPage = true } = {}) => {
    const params = new URLSearchParams(searchParams);
    if (val === '' || val === null || val === undefined) params.delete(key);
    else params.set(key, String(val));

    if (resetPage) params.delete('page');
    setSearchParams(params);
  };

  const setPage = (nextPage) => {
    updateParam('page', nextPage, { resetPage: false });
  };

  const pageTitle = bestSeller === 'true'
    ? 'Best Sellers'
    : newLaunch === 'true'
      ? 'New Launches'
      : search
        ? `Search: "${search}"`
        : 'All Products';

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div style={{ minWidth: 0 }}>
          <div className="products-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>{pageTitle}</h1>
              <p style={{ fontSize: 14, color: '#888', marginTop: 2 }}>{total} products found</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#666' }}>Sort by:</span>
              <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="form-input" style={{ padding: '7px 12px', fontSize: 13 }}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: 'hidden', background: '#f5f5f5', animation: 'pulse 1.5s infinite' }}>
                  <div style={{ aspectRatio: '1', background: '#e5e5e5' }} />
                  <div style={{ padding: 14 }}>
                    <div style={{ height: 10, background: '#e5e5e5', borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 12, background: '#e5e5e5', borderRadius: 4, marginBottom: 8, width: '70%' }} />
                    <div style={{ height: 16, background: '#e5e5e5', borderRadius: 4, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#666' }}>
              <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Products unavailable</p>
              <p style={{ fontSize: 14, marginBottom: 20 }}>{fetchError}</p>
              <button onClick={() => window.location.reload()} className="btn btn-primary">Retry</button>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>No Results</p>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No products found</p>
              <p style={{ fontSize: 14, marginBottom: 20 }}>Try adjusting your search term</p>
              <button onClick={() => setSearchParams(new URLSearchParams())} className="btn btn-primary">Reset View</button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {pages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="page-btn">Prev</button>
              {[...Array(pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`page-btn ${page === i + 1 ? 'active' : ''}`}>{i + 1}</button>
              ))}
              <button onClick={() => setPage(page + 1)} disabled={page === pages} className="page-btn">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
