import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Search, User, Menu, X, ChevronDown, Package, ShieldCheck } from 'lucide-react';
import { useAuthStore, useCartStore, useWishlistStore } from '../context/store';
import toast from 'react-hot-toast';
import BrandLogo from './BrandLogo';

const NAV_LINKS = [
  { label: 'Best Sellers', href: '/products?bestSeller=true' },
  { label: 'New Launches', href: '/products?newLaunch=true' },
  { label: 'Brands', href: '/products' },
  { label: 'Concerns', href: '/products' },
  { label: 'Hair Care', href: '/products?search=hair' },
  { label: 'Skin Care', href: '/products?search=skin' },
  { label: 'Sun Care', href: '/products?search=sun' },
  { label: 'About Us', href: '/about' },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { items: cartItems, setOpen: setCartOpen } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 992 : false);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 992);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname, location.search, isMobile]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const routeSearch = (params.get('search') || params.get('q') || '').trim();
    setSearchQuery(routeSearch);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedQuery = searchQuery.trim();
      const currentParams = new URLSearchParams(location.search);
      const currentSearch = (currentParams.get('search') || currentParams.get('q') || '').trim();

      if (trimmedQuery) {
        if (location.pathname !== '/products' || currentSearch !== trimmedQuery) {
          navigate(`/products?search=${encodeURIComponent(trimmedQuery)}`);
        }
        return;
      }

      if (location.pathname === '/products' && (currentParams.has('search') || currentParams.has('q'))) {
        navigate('/products');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, navigate, location.pathname, location.search]);

  const renderHeaderActions = ({ mobileLayout = false } = {}) => (
    <>
      <Link
        to={user ? '/wishlist' : '#'}
        onClick={(e) => {
          if (!user) {
            e.preventDefault();
            toast.error('New user? Please register to use wishlist.');
            navigate('/register');
          }
        }}
        className="header-icon-btn"
        aria-label="Wishlist"
      >
        <Heart size={20} />
        {wishlistItems.length > 0 && (
          <span className="header-badge">
            {wishlistItems.length}
          </span>
        )}
      </Link>

      <button
        onClick={() => {
          if (!user) {
            toast.error('New user? Please register to add and view cart items.');
            navigate('/register');
            return;
          }
          setCartOpen(true);
        }}
        className="header-icon-btn"
        aria-label="Cart"
      >
        <ShoppingCart size={20} />
        {cartCount > 0 && (
          <span className="header-badge header-badge-cart">
            {cartCount}
          </span>
        )}
      </button>

      {user ? (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="user-menu-trigger"
            aria-label="User menu"
          >
            <div className="user-initial">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {!mobileLayout && <ChevronDown size={14} />}
          </button>
          {userMenuOpen && (
            <div className="user-menu-dropdown">
              {[
                { label: 'My Profile', href: '/profile', icon: <User size={14} /> },
                { label: 'My Orders', href: '/orders', icon: <Package size={14} /> },
                { label: 'Wishlist', href: '/wishlist', icon: <Heart size={14} /> },
                ...(user.role === 'admin' ? [{ label: 'Admin Panel', href: '/admin', icon: <Package size={14} /> }] : []),
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setUserMenuOpen(false)}
                  className="user-menu-item"
                >
                  {item.icon} {item.label}
                </Link>
              ))}
              <div className="user-menu-separator" />
              <button
                onClick={() => {
                  logout();
                  setUserMenuOpen(false);
                }}
                className="user-menu-item user-menu-logout"
              >
                <X size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        mobileLayout ? (
          <Link to="/login" className="header-icon-btn header-account-btn" aria-label="Login">
            <User size={19} />
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm header-login-btn header-login">
            Login
          </Link>
        )
      )}

      {!mobileLayout && (
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="header-menu-btn"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
    </>
  );

  return (
    <>
      <div className="trust-announcement">
        <div className="container trust-announcement-inner">
          <span><ShieldCheck size={14} /> Derm Approved Formulations</span>
          <span>Free shipping above Rs 499</span>
          <span>Easy 7 day returns</span>
        </div>
      </div>

      <header className={`site-header ${isMobile ? 'site-header--mobile' : ''}`} style={{ boxShadow: scrolled ? '0 10px 20px rgba(16,24,40,0.06)' : 'none' }}>
        {isMobile ? (
          <>
            <div className="container header-mobile-top">
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="header-menu-btn header-menu-btn-mobile"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <BrandLogo className="header-brand header-brand-mobile" subtitle={null} />

              <div className="header-actions header-mobile-actions">
                {renderHeaderActions({ mobileLayout: true })}
              </div>
            </div>

            <div className="container header-mobile-search">
              <div className="search-shell">
                <Search size={16} className="search-icon" />
                <input
                  type="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="container header-main-row">
            <BrandLogo className="header-brand" subtitle="Science-backed botanical care" />

            <div className="header-search">
              <div className="search-shell">
                <Search size={16} className="search-icon" />
                <input
                  type="search"
                  placeholder="Search by concerns, ingredients, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="header-actions">
              {renderHeaderActions({ mobileLayout: false })}
            </div>
          </div>
        )}

        {!isMobile && (
          <nav className="header-nav">
            <div className="container header-nav-inner">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`header-nav-link ${location.pathname + location.search === link.href ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {isMobile && mobileMenuOpen && (
          <div className="mobile-nav-sheet">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} to={link.href} className="mobile-nav-link">
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link to="/login" className="btn btn-primary btn-sm" style={{ marginTop: 8, width: '100%' }}>
                Login
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
