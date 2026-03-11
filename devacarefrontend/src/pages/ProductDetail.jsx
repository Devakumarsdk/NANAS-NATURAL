import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Shield, Truck, RotateCcw, Minus, Plus } from 'lucide-react';
import { productsAPI, reviewsAPI } from '../utils/api';
import { useCartStore, useWishlistStore, useAuthStore } from '../context/store';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { user } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await productsAPI.getBySlug(slug);
        setProduct(data.product);
        // Get reviews
        const revData = await reviewsAPI.getByProduct(data.product._id);
        setReviews(revData.data.reviews);
        // Get related
        const rel = await productsAPI.getAll({ category: data.product.category?._id, limit: 4 });
        setRelated(rel.data.products.filter(p => p._id !== data.product._id).slice(0, 4));
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [slug]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error('New user? Please register to add products to cart.');
      navigate('/register');
      return;
    }
    addToCart(product._id, quantity);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setReviewLoading(true);
    try {
      await reviewsAPI.create({ product: product._id, ...reviewForm });
      toast.success('Review submitted!');
      const revData = await reviewsAPI.getByProduct(product._id);
      setReviews(revData.data.reviews);
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error submitting review'); }
    finally { setReviewLoading(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner spinner-dark" style={{ width: 40, height: 40 }} /></div>;
  if (!product) return <div style={{ textAlign: 'center', padding: 80 }}><p>Product not found</p><Link to="/products">Browse Products</Link></div>;

  const inWishlist = isInWishlist(product._id);
  const images = product.images?.length > 0 ? product.images : [{ url: 'https://via.placeholder.com/500x500?text=NANA%27S+NATURAL' }];

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#888', marginBottom: 24, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#888' }}>Home</Link> /
          <Link to="/products" style={{ color: '#888' }}>Products</Link> /
          {product.category && <Link to={`/products?category=${product.category._id}`} style={{ color: '#888' }}>{product.category.name}</Link>}
          {product.category && '/'}<span style={{ color: '#333' }}>{product.name}</span>
        </div>

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start', marginBottom: 60 }}>
          {/* Images */}
          <div>
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#f5f5f5', marginBottom: 12, aspectRatio: '1' }}>
              <img src={images[selectedImage]?.url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {images.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              {product.discountPercent > 0 && (
                <span style={{ position: 'absolute', top: 16, left: 16, background: '#dc2626', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: `2px solid ${i === selectedImage ? '#1a5c3a' : '#e5e7eb'}`, background: 'none', cursor: 'pointer', padding: 0 }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1a5c3a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{product.brand}</p>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>{product.name}</h1>

            {product.ratings > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < Math.floor(product.ratings) ? '#f59e0b' : 'none'} color="#f59e0b" />)}
                </div>
                <span style={{ fontWeight: 700, color: '#f59e0b' }}>{product.ratings}</span>
                <span style={{ color: '#888', fontSize: 14 }}>({product.numReviews} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: '#1a5c3a' }}>₹{product.discountPrice || product.price}</span>
              {product.discountPrice && (
                <>
                  <span style={{ fontSize: 18, color: '#999', textDecoration: 'line-through' }}>₹{product.price}</span>
                  <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: 14 }}>{product.discountPercent}% off</span>
                </>
              )}
            </div>

            {product.shortDescription && <p style={{ color: '#555', lineHeight: 1.7, marginBottom: 20, fontSize: 15 }}>{product.shortDescription}</p>}

            {/* Stock */}
            <div style={{ marginBottom: 20 }}>
              {product.stock > 0 ? (
                <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 14 }}>✓ In Stock ({product.stock} units)</span>
              ) : (
                <span style={{ color: '#dc2626', fontWeight: 600 }}>✗ Out of Stock</span>
              )}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 36, height: 36, background: '#f8f9fa', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                  <span style={{ width: 40, textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} style={{ width: 36, height: 36, background: '#f8f9fa', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                <ShoppingCart size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button onClick={() => { if (!user) { toast.error('New user? Please register to continue.'); navigate('/register'); return; } toggleWishlist(product._id); }}
                style={{ width: 52, height: 52, borderRadius: 10, border: `2px solid ${inWishlist ? '#ef4444' : '#e5e7eb'}`, background: inWishlist ? '#fef2f2' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <Heart size={20} fill={inWishlist ? '#ef4444' : 'none'} color={inWishlist ? '#ef4444' : '#999'} />
              </button>
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[[Truck, 'Free Delivery', 'Above ₹499'], [RotateCcw, '7-Day Return', 'Hassle-free'], [Shield, 'Secure Pay', '100% safe']].map(([Icon, label, sub]) => (
                <div key={label} style={{ background: '#f8f9fa', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                  <Icon size={18} color="#1a5c3a" style={{ margin: '0 auto 4px' }} />
                  <p style={{ fontSize: 11, fontWeight: 700 }}>{label}</p>
                  <p style={{ fontSize: 10, color: '#888' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '2px solid #f0f0f0', display: 'flex', gap: 0, marginBottom: 32 }}>
          {['description', 'ingredients', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, borderBottom: `2px solid ${activeTab === tab ? '#1a5c3a' : 'transparent'}`, color: activeTab === tab ? '#1a5c3a' : '#888', marginBottom: '-2px', textTransform: 'capitalize', fontFamily: 'Sora, sans-serif' }}>
              {tab === 'reviews' ? `Reviews (${reviews.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div style={{ maxWidth: 800 }}>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: '#555' }}>{product.description}</p>
            {product.benefits?.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Benefits</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {product.benefits.map((b, i) => <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: '#555' }}><span style={{ color: '#1a5c3a', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>{b}</li>)}
                </ul>
              </div>
            )}
            {product.howToUse && (
              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>How to Use</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: '#555' }}>{product.howToUse}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ingredients' && (
          <div style={{ maxWidth: 800 }}>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: '#555' }}>{product.ingredients || 'Ingredient information not available.'}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ maxWidth: 800 }}>
            {/* Review Form */}
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Write a Review</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(r => (
                      <button key={r} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: r })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <Star size={28} fill={r <= reviewForm.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Review Title</label>
                  <input type="text" className="form-input" placeholder="Sum up your experience" value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Review *</label>
                  <textarea className="form-input" rows={4} placeholder="Share your experience with this product..." value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} required style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" disabled={reviewLoading} className="btn btn-primary">
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? <p style={{ color: '#888' }}>No reviews yet. Be the first to review!</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.map(review => (
                  <div key={review._id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a5c3a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>
                          {review.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 14 }}>{review.user?.name}</p>
                          {review.isVerifiedPurchase && <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>✓ Verified Purchase</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex' }}>
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? '#f59e0b' : 'none'} color="#f59e0b" />)}
                      </div>
                    </div>
                    {review.title && <p style={{ fontWeight: 600, marginBottom: 6 }}>{review.title}</p>}
                    <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>{review.comment}</p>
                    <p style={{ fontSize: 12, color: '#bbb', marginTop: 8 }}>{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <div style={{ marginTop: 60 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>You May Also Like</h2>
            <div className="products-grid">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
