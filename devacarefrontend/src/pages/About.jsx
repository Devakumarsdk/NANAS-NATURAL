import React from 'react';

export default function About() {
  const leafIcon = '\u{1F33F}';

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #e8f5e9, #f1f8f4)', padding: '80px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#1a5c3a', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Our Story</p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 700, marginBottom: 16 }}>About NANA'S NATURAL</h1>
        <p style={{ fontSize: 18, color: '#555', maxWidth: 600, margin: '0 auto' }}>
          We believe in harnessing nature's power to create effective, safe personal care products.
        </p>
      </div>

      <div className="container section" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="about-mission-layout">
          <div className="about-mission-copy">
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Our Mission</h2>

            <div className="about-mission-visual about-mission-visual--mobile" aria-hidden="true">
              {leafIcon}
            </div>

            <p style={{ color: '#555', lineHeight: 1.8, marginBottom: 16 }}>
              At NANA'S NATURAL, we're committed to developing hair and skin care products using the finest natural ingredients backed by scientific research. Every product is dermatologist-tested and free from harmful chemicals.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
              {[
                [leafIcon, 'Natural Ingredients'],
                ['\u{1F52C}', 'Science-Backed'],
                ['\u267B\uFE0F', 'Sustainable'],
                ['\u{1F49A}', 'Cruelty-Free'],
              ].map(([icon, label]) => (
                <div key={label} style={{ background: '#f0f9f4', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="about-mission-visual about-mission-visual--desktop" aria-hidden="true">
            {leafIcon}
          </div>
        </div>
      </div>
    </div>
  );
}
