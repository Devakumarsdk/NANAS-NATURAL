import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useCartStore, useWishlistStore, useAuthStore } from '../context/store';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, isLoading } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  const mainImage = product.images?.find(i => i.isMain) || product.images?.[0];
  const inWishlist = isInWishlist(product._id);
  const ratingValue = Number(product.ratings) || 0;
  const reviewCount = Number(product.numReviews) || 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('New user? Please register to add products to cart.');
      navigate('/register');
      return;
    }
    addToCart(product._id, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('New user? Please register to continue.');
      navigate('/register');
      return;
    }
    toggleWishlist(product._id);
  };

  return (
    <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
      <div className="product-card">
        <div className="product-card__img">
          <img src={mainImage?.url || 'https://via.placeholder.com/300x300?text=NANA%27S+NATURAL'} alt={product.name} loading="lazy" />
          {product.discountPercent > 0 && (
            <span className="product-card__badge badge-sale">{product.discountPercent}% OFF</span>
          )}
          {product.isNewLaunch && !product.discountPercent && (
            <span className="product-card__badge badge-new">NEW</span>
          )}
          {product.isBestSeller && !product.isNewLaunch && !product.discountPercent && (
            <span className="product-card__badge badge-bestseller">Best Seller</span>
          )}
          <button onClick={handleWishlist} className={`product-card__wishlist ${inWishlist ? 'active' : ''}`}>
            <Heart size={14} fill={inWishlist ? '#ef4444' : 'none'} color={inWishlist ? '#ef4444' : '#999'} />
          </button>
        </div>

        <div className="product-card__body">
          <p className="product-card__brand">{product.brand}</p>
          <p className="product-card__name">{product.name}</p>
          <div className="product-card__price">
            <span className="price-current">₹{product.discountPrice || product.price}</span>
            {product.discountPrice && (
              <>
                <span className="price-original">₹{product.price}</span>
                <span className="price-discount">{product.discountPercent}% off</span>
              </>
            )}
          </div>
          <div className="product-card__rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={11}
                fill={star <= Math.round(ratingValue) ? '#f59e0b' : 'none'}
                color="#f59e0b"
              />
            ))}
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{ratingValue.toFixed(1)}</span>
            <span>({reviewCount})</span>
          </div>
          {product.stock === 0 && (
            <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>Out of Stock</span>
          )}
          <button onClick={handleAddToCart} disabled={isLoading || product.stock === 0} className="product-card__cta">
            <ShoppingCart size={14} />
            {product.stock === 0 ? 'Out of Stock' : 'Add To Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
