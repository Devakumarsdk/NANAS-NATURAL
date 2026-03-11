import React from 'react';
import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
      <div>
        <p style={{ fontSize: 96, fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#e5e7eb', lineHeight: 1 }}>404</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Page Not Found</h1>
        <p style={{ color: '#888', marginBottom: 24 }}>Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  );
}
