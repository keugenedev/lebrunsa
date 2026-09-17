'use client';

import React from 'react';

interface CompanyLogoProps {
  company?: string;
  className?: string;
  showText?: boolean;
}

export default function CompanyLogo({ company = '', className = 'h-5 max-w-[85px] w-auto object-contain', showText = false }: CompanyLogoProps) {
  const norm = (company || '').toLowerCase();

  let logoSrc = '/logos/lebrun.png';
  let altText = 'Lebrun S.A.';

  if (norm.includes('auto')) {
    logoSrc = '/logos/Autobiz.png';
    altText = 'Autobiz S.A.';
  } else if (norm.includes('caribe')) {
    logoSrc = '/logos/Caribe.png';
    altText = 'Caribe Motors';
  } else if (norm.includes('leader')) {
    logoSrc = '/logos/leader.png';
    altText = 'Leader Foods';
  } else if (norm.includes('tire') || norm.includes('zone')) {
    logoSrc = '/logos/tirezone.png';
    altText = 'Tirezone';
  } else if (norm.includes('lebrun')) {
    logoSrc = '/logos/lebrun.png';
    altText = 'Lebrun S.A.';
  }

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0 select-none" title={altText}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt={altText}
        className={className}
        loading="lazy"
      />
      {showText && (
        <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
          {altText}
        </span>
      )}
    </div>
  );
}
