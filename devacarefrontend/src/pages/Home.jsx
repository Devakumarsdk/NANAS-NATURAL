import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FlaskConical, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';

const BRAND_BLOCKS = [
  { name: "NANA'S NATURAL Derma", tone: 'rose', desc: 'Active-led skin solutions' },
  { name: "NANA'S NATURAL Hair", tone: 'mint', desc: 'Scalp-first hair routines' },
  { name: "NANA'S NATURAL Sun", tone: 'sand', desc: 'Daily UV protection' },
  { name: "NANA'S NATURAL Body", tone: 'sky', desc: 'Hydration and barrier care' },
];

const HERO_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=700&q=80',
    alt: 'Cosmetic serum bottles on a neutral background',
  },
  {
    src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=80',
    alt: 'Skincare jars and bottles arranged for a beauty routine',
  },
  {
    src: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=80',
    alt: 'Face cream and beauty products in a flat lay composition',
  },
  {
    src: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=700&q=80',
    alt: 'Skincare treatment and facial routine setup',
  },
  {
    src: 'https://images.unsplash.com/photo-1629198735660-e39ea93f5c18?auto=format&fit=crop&w=700&q=80',
    alt: 'Natural skincare bottles and cream jars',
  },
];

const HERO_BANNERS = [
  {
    key: 'hair',
    chip: "NANA'S NATURAL",
    title: 'Hair Care Savings',
    cta: 'Shop Hair Care',
    link: '/products?search=hair',
    note: '*Includes extra 5% off on prepaid orders',
    visual: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    offers: [
      { pct: '35%', min: 'Rs.849' },
      { pct: '25%', min: 'Rs.545' },
      { pct: '20%', min: 'Rs.249' },
    ],
  },
  {
    key: 'face',
    chip: "NANA'S NATURAL",
    title: 'Face Care Savings',
    cta: 'Shop Face Care',
    link: '/products?search=skin',
    note: '*Glow essentials and daily hydration offers',
    visual: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    offers: [
      { pct: '32%', min: 'Rs.799' },
      { pct: '24%', min: 'Rs.499' },
      { pct: '18%', min: 'Rs.299' },
    ],
  },
  {
    key: 'sun',
    chip: "NANA'S NATURAL",
    title: 'Sun Care Savings',
    cta: 'Shop Sun Care',
    link: '/products?search=sun',
    note: '*Protect + hydrate combos available',
    visual: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    offers: [
      { pct: '30%', min: 'Rs.699' },
      { pct: '22%', min: 'Rs.449' },
      { pct: '15%', min: 'Rs.249' },
    ],
  },
];

function AnimatedChipText({ text }) {
  return (
    <span className="home-banner-chip home-banner-chip--animated" aria-label={text}>
      {[...text].map((char, index) => (
        <span
          key={`${char}-${index}`}
          className={`home-banner-chip-char ${char === ' ' ? 'is-space' : ''}`}
          style={{ animationDelay: `${index * 0.07}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newLaunches, setNewLaunches] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feat, fresh, best, cats] = await Promise.all([
          productsAPI.getAll({ featured: true, limit: 8 }),
          productsAPI.getAll({ newLaunch: true, limit: 8 }),
          productsAPI.getAll({ bestSeller: true, limit: 8 }),
          categoriesAPI.getAll(),
        ]);
        setFeaturedProducts(feat.data.products || []);
        setNewLaunches(fresh.data.products || []);
        setBestSellers(best.data.products || []);
        setCategories((cats.data.categories || []).slice(0, 8));
      } catch {
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div>
      <section className="home-banner-section">
        <div className="home-banner-track">
          {HERO_BANNERS.map((banner, idx) => (
            <article
              key={banner.title}
              className={`home-banner-slide home-banner-slide--${banner.key} ${idx === activeBanner ? 'active' : ''}`}
            >
              <div className="container home-banner-content">
                <div className="home-banner-copy">
                  <AnimatedChipText text={banner.chip} />
                  <h2 className="home-banner-title">{banner.title}</h2>
                  <div className="home-banner-offers">
                    {banner.offers.map((offer) => (
                      <div key={`${banner.key}-${offer.pct}-${offer.min}`} className="home-banner-offer-card">
                        <p className="home-banner-offer-pct">{offer.pct}</p>
                        <p className="home-banner-offer-min">Orders above {offer.min}</p>
                      </div>
                    ))}
                  </div>
                  <Link to={banner.link} className="btn btn-primary btn-lg">{banner.cta} <ArrowRight size={16} /></Link>
                  <p className="home-banner-note">{banner.note}</p>
                </div>
                <div className="home-banner-visual" aria-hidden="true">
                  <div className="home-banner-arch">
                    <img
                      src={banner.visual}
                      alt=""
                      className={`home-banner-arch-image home-banner-arch-image--${banner.key}`}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="home-banner-dots">
          {HERO_BANNERS.map((banner, idx) => (
            <button
              key={banner.title}
              type="button"
              onClick={() => setActiveBanner(idx)}
              className={`home-banner-dot ${idx === activeBanner ? 'active' : ''}`}
              aria-label={`Go to ${banner.title}`}
            />
          ))}
        </div>
      </section>

      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <p className="hero-kicker">Clinical formulations. Everyday routines.</p>
            <h1 className="hero-title">Build A Smarter Skin And Hair Routine</h1>
            <p className="hero-subtitle">
              Targeted products designed around ingredients, concerns, and consistency. Inspired by the modern
              Indian beauty retail experience.
            </p>
            <div className="hero-cta">
              <Link to="/products" className="btn btn-primary btn-lg">Shop All <ArrowRight size={16} /></Link>
              <Link to="/products?newLaunch=true" className="btn btn-outline btn-lg">New Launches</Link>
            </div>
            <div className="hero-meta">
              <span>5L+ orders delivered</span>
              <span>Dermatologist reviewed formulas</span>
              <span>COD + Razorpay supported</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-gallery">
              {HERO_IMAGES.map((image, index) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  className={`hero-gallery__img hero-gallery__img--${index + 1}`}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="brand-strip">
        <div className="container brand-grid">
          {BRAND_BLOCKS.map((b) => (
            <Link key={b.name} to="/products" className={`brand-tile ${b.tone}`}>
              <p className="brand-tile-name">{b.name}</p>
              <p className="brand-tile-desc">{b.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="trust-row">
        <div className="container trust-grid">
          {[
            [FlaskConical, 'Ingredient-first', 'Evidence-backed actives'],
            [ShieldCheck, 'Safety tested', 'Dermat approved routines'],
            [Truck, 'Fast dispatch', 'Ships in 24-48 hours'],
            [Sparkles, 'Visible results', 'Loved by repeat buyers'],
          ].map(([Icon, title, text]) => (
            <div key={title} className="trust-item">
              <Icon size={18} />
              <div>
                <p>{title}</p>
                <span>{text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <p className="section-label">Shop By Category</p>
              <h2 className="section-title">Popular Categories</h2>
            </div>
            <div className="category-chip-grid">
              {categories.map((cat) => (
                <Link key={cat._id} to={`/products?category=${cat._id}`} className="category-chip">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {bestSellers.length > 0 && (
        <section className="section rail-section">
          <div className="container">
            <div className="section-header home-section-header">
              <div>
                <p className="section-label">Trending</p>
                <h2 className="section-title">Best Sellers</h2>
              </div>
              <Link to="/products?bestSeller=true" className="btn btn-outline btn-sm">View All</Link>
            </div>
            <div className={`products-grid ${bestSellers.length > 2 ? 'products-grid--swipe' : ''}`.trim()}>
              {bestSellers.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {newLaunches.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header home-section-header">
              <div>
                <p className="section-label">New In</p>
                <h2 className="section-title">Latest Launches</h2>
              </div>
              <Link to="/products?newLaunch=true" className="btn btn-outline btn-sm">Explore</Link>
            </div>
            <div className={`products-grid ${newLaunches.length > 2 ? 'products-grid--swipe' : ''}`.trim()}>
              {newLaunches.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="section rail-section">
          <div className="container">
            <div className="section-header home-section-header">
              <div>
                <p className="section-label">Editor Picks</p>
                <h2 className="section-title">Featured Products</h2>
              </div>
            </div>
            <div className={`products-grid ${featuredProducts.length > 2 ? 'products-grid--swipe' : ''}`.trim()}>
              {featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

