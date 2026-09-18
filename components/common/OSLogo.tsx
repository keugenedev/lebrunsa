'use client';

import React from 'react';

interface OSLogoProps {
  os?: string;
  className?: string;
}

export default function OSLogo({ os = '', className = 'w-3.5 h-3.5' }: OSLogoProps) {
  const osLower = os.toLowerCase();

  // Apple / macOS
  if (osLower.includes('mac') || osLower.includes('apple') || osLower.includes('osx') || osLower.includes('darwin')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-label="macOS">
        <path d="M11.6734 7.22198C10.7974 7.22198 9.44138 6.22598 8.01338 6.26198C6.12938 6.28598 4.40138 7.35397 3.42938 9.04597C1.47338 12.442 2.92538 17.458 4.83338 20.218C5.76938 21.562 6.87338 23.074 8.33738 23.026C9.74138 22.966 10.2694 22.114 11.9734 22.114C13.6654 22.114 14.1454 23.026 15.6334 22.99C17.1454 22.966 18.1054 21.622 19.0294 20.266C20.0974 18.706 20.5414 17.194 20.5654 17.11C20.5294 17.098 17.6254 15.982 17.5894 12.622C17.5654 9.81397 19.8814 8.46998 19.9894 8.40998C18.6694 6.47798 16.6414 6.26198 15.9334 6.21398C14.0854 6.06998 12.5374 7.22198 11.6734 7.22198ZM14.7934 4.38998C15.5734 3.45398 16.0894 2.14598 15.9454 0.849976C14.8294 0.897976 13.4854 1.59398 12.6814 2.52998C11.9614 3.35798 11.3374 4.68998 11.5054 5.96198C12.7414 6.05798 14.0134 5.32598 14.7934 4.38998Z"/>
      </svg>
    );
  }

  // Linux / Ubuntu
  if (osLower.includes('linux') || osLower.includes('ubuntu') || osLower.includes('debian')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-label="Linux">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3 0 .4-.08.78-.22 1.12C15.45 9.4 16 10.13 16 11c0 1.1-.9 2-2 2-.24 0-.47-.04-.68-.12C12.87 13.54 12 14.5 12 15.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-1 .87-1.96 1.32-2.62-.21.08-.44.12-.68.12-1.1 0-2-.9-2-2 0-.87.55-1.6 1.22-1.88C10.08 8.78 10 8.4 10 8c0-1.66 1.34-3 3-3z"/>
      </svg>
    );
  }

  // Windows Official Logo (RemixIcon Logos / windows-fill)
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-label="Windows">
      <path d="M3.00098 5.47902L10.3778 4.4625V11.5902H3.00098V5.47902ZM3.00098 18.521L10.3778 19.5375V12.4982H3.00098V18.521ZM11.1894 19.646L21.001 21V12.4982H11.1894V19.646ZM11.1894 4.35402V11.5902H21.001V3L11.1894 4.35402Z"/>
    </svg>
  );
}
