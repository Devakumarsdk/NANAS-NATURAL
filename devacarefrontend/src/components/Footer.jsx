import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone } from 'lucide-react';
import BrandLogo from './BrandLogo';

function XLogo(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M18.9 2h2.9l-6.3 7.2L23 22h-5.9l-4.7-6.1L7 22H4.1l6.8-7.8L1 2h6.1l4.2 5.6L18.9 2Zm-1 18h1.6L6.2 3.9H4.5L17.9 20Z"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-col footer-col--brand">
          <BrandLogo to="/" light subtitle="Premium botanical skin and hair care" />
          <p className="footer-copy">
            Ingredient-first personal care for modern Indian routines. Clean layouts, strong formulas, clear outcomes.
          </p>
          <div className="footer-socials">
            {[
              { Icon: Instagram, label: 'Instagram' },
              { Icon: XLogo, label: 'X' },
              { Icon: Facebook, label: 'Facebook' },
            ].map(({ Icon, label }) => (
              <a key={label} href="#" aria-label={label} className={`social-${label.toLowerCase()}`}>
                <Icon size={18} strokeWidth={2.3} />
              </a>
            ))}
          </div>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/products?bestSeller=true">Best Sellers</Link>
          <Link to="/products?newLaunch=true">New Launches</Link>
          <Link to="/products?search=skin">Skin Care</Link>
          <Link to="/products?search=hair">Hair Care</Link>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <Link to="/about">About</Link>
          <Link to="/orders">Track Orders</Link>
          <Link to="/profile">My Account</Link>
          <Link to="/cart">Cart</Link>
        </div>
        <div className="footer-col footer-col--contact">
          <h4>Contact</h4>
          <p><Mail size={14} /> support@nanasnatural.com</p>
          <p><Phone size={14} /> +91 73971 37599</p>
          <p>Mon-Sat, 10:00 AM - 7:00 PM</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>Copyright {new Date().getFullYear()} NANA'S NATURAL. All rights reserved.</span>
        <span>Privacy Policy | Terms</span>
      </div>
    </footer>
  );
}
