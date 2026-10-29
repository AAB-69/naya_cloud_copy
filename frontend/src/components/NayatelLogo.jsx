import React from 'react';
import ogLogo from '../assets/nayatel_logo_transparent.png';

export default function NayatelLogo({ size = 'medium', className = '' }) {
  return (
    <div className={`nayatel-logo-container ${className}`}>
      <img
        src={ogLogo}
        alt="Nayatel Cloud Logo"
        className="nayatel-brand-logo"
      />
    </div>
  );
}
