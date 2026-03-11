import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({ to = '/', light = false, subtitle = 'Rooted in nature', className = '' }) {
  const Wrapper = to ? Link : 'div';
  const wrapperProps = to ? { to, style: { textDecoration: 'none' }, 'aria-label': "NANA'S NATURAL Home" } : {};
  const logoSrc = light ? '/nanas-natural-logo-light.svg' : '/nanas-natural-logo.svg';

  return (
    <Wrapper {...wrapperProps} className={`brand-logo ${light ? 'brand-logo--light' : ''} ${className}`.trim()}>
      <img src={logoSrc} alt="NANA'S NATURAL" className="brand-logo-image" />
      {subtitle ? <p className="brand-tagline brand-logo-subtitle">{subtitle}</p> : null}
    </Wrapper>
  );
}
