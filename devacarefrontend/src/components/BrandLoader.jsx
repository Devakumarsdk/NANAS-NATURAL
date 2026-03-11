import React from 'react';
import BrandLogo from './BrandLogo';

export default function BrandLoader({ show, message = 'Please wait...' }) {
  if (!show) return null;

  return (
    <div className="brand-loader-overlay" role="status" aria-live="polite">
      <div className="brand-loader-card">
        <BrandLogo to={null} subtitle="Premium care" className="brand-loader-logo" />
        <div className="brand-loader-spinner" />
        <p className="brand-loader-message">{message}</p>
      </div>
    </div>
  );
}
