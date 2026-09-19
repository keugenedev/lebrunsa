'use client';

import React from 'react';

interface CompanyLogoProps {
  company?: string;
  className?: string;
  showText?: boolean;
}

export default function CompanyLogo({ company = '', className = 'h-5 max-w-[85px] w-auto object-contain', showText = false }: CompanyLogoProps) {
  const norm = (company || '').toLowerCase();
  const [hasError, setHasError] = React.useState(false);

  let logoSrc = '/logos/lebrun.png';
  let altText = 'Lebrun S.A.';
  let badgeColor = 'bg-slate-900 text-white';

  if (norm.includes('auto')) {
    logoSrc = '/logos/Autobiz.png';
    altText = 'Autobiz S.A.';
    badgeColor = 'bg-blue-600 text-white';
  } else if (norm.includes('caribe')) {
    logoSrc = '/logos/Caribe.png';
    altText = 'Caribe Motors';
    badgeColor = 'bg-red-600 text-white';
  } else if (norm.includes('leader')) {
    logoSrc = '/logos/leader.png';
    altText = 'Leader Foods';
    badgeColor = 'bg-emerald-600 text-white';
  } else if (norm.includes('tire') || norm.includes('zone')) {
    logoSrc = '/logos/tirezone.png';
    altText = 'Tirezone';
    badgeColor = 'bg-amber-600 text-white';
  } else if (norm.includes('lebrun')) {
    logoSrc = '/logos/lebrun.png';
    altText = 'Lebrun S.A.';
    badgeColor = 'bg-slate-900 text-white';
  }

  const fallbackSrc = logoSrc.replace('/logos/', '/');

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0 select-none" title={altText}>
      {!hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoSrc}
          alt={altText}
          className={className}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== fallbackSrc && !target.dataset.triedFallback) {
              target.dataset.triedFallback = 'true';
              target.src = fallbackSrc;
            } else {
              setHasError(true);
            }
          }}
        />
      ) : (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor} tracking-tight`}>
          {altText}
        </span>
      )}
      {showText && (
        <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
          {altText}
        </span>
      )}
    </div>
  );
}
