'use client';

import React from 'react';
import { Globe, Lock, MapPin, Phone, User } from 'lucide-react';
import { Employee } from '@/types/inventory';
import { BrandConfig } from '@/lib/badgeBrands';
import Barcode from '@/components/common/Barcode';
import { formatNif } from '@/lib/formatNif';

interface AutobizBadgeProps {
  employee: Employee;
  brand: BrandConfig;
  refId?: string;
}

const PARTNERS = [
  { name: 'Automotive Art', src: '/logos/partners/art.png', className: 'h-11 w-11' },
  { name: 'Alomoto', src: '/logos/partners/alomoto.png', className: 'h-8 w-[62px]' },
  { name: 'Titan', src: '/logos/partners/titan.png', className: 'h-7 w-[58px]' },
  { name: 'Toro', src: '/logos/partners/toro.png', className: 'h-7 w-[58px]' },
  { name: 'Shell', src: '/logos/partners/shell.png', className: 'h-9 w-[48px]' },
] as const;

function AutobizLogo({ className = 'h-14 max-w-[220px]' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logos/Autobiz.png" alt="Autobiz" className={`${className} w-auto object-contain`} />
  );
}

function CornerArtwork({ id }: { id: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 288 456" className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`autobizGrey-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2e8f0" stopOpacity="0.8" />
          <stop offset="1" stopColor="#f8fafc" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 0H94L0 92Z" fill="#15181c" />
      <path d="M0 0H69L0 69Z" fill="#ed1c24" />
      <path d="M0 91 91 0h14L0 105Z" fill="#cbd5e1" />
      <path d="M0 109 109 0h10L0 119Z" fill={`url(#autobizGrey-${id})`} />
      <path d="M288 456H194l94-92Z" fill="#15181c" />
      <path d="M288 456h-69l69-69Z" fill="#ed1c24" />
      <path d="m288 365-91 91h-14l105-105Z" fill="#cbd5e1" />
      <path d="m288 347-109 109h-10l119-119Z" fill={`url(#autobizGrey-${id})`} />
      <path d="M-10 337 132 195" stroke="#e2e8f0" strokeWidth="16" opacity="0.42" />
      <path d="M159 456 298 317" stroke="#f1f5f9" strokeWidth="20" opacity="0.82" />
    </svg>
  );
}

/** Badge Autobiz : blanc, gris pâle et rouge avec partenaires au verso. */
export const AutobizBadgeRecto = React.memo(function AutobizBadgeRecto({ employee, brand, refId }: AutobizBadgeProps) {
  const fullNameLength = (employee.fullName || '').length;
  const artId = (employee.id || employee.employeeId || 'autobiz').replace(/[^a-zA-Z0-9_-]/g, '_');

  return (
    <div id={refId} className="badge-front font-montserrat relative w-[288px] h-[456.5px] rounded-2xl overflow-hidden select-none shadow-xl border border-slate-200 print:border-none print:rounded-none print:shadow-none bg-white">
      <CornerArtwork id={`front-${artId}`} />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex justify-center px-7 pt-7 pb-3"><AutobizLogo className="h-[58px] max-w-[224px]" /></div>
        <div className="mx-auto h-1 w-20 rounded-full" style={{ backgroundColor: brand.accentColor }} />
        <div className="mt-4 flex justify-center px-6">
          <div className="relative h-[181px] w-[163px] overflow-hidden rounded-[22px] border-[3px] border-white bg-slate-100 shadow-lg ring-1 ring-slate-300">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[#ed1c24]" />
            {employee.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={employee.photoUrl} alt={employee.fullName} className="h-full w-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"><User className="h-16 w-16 text-slate-400" strokeWidth={1.4} /></div>
            )}
          </div>
        </div>
        <div className="mt-3 px-5 text-center">
          <h2 className={`font-extrabold uppercase text-[#171a1e] line-clamp-2 ${fullNameLength > 25 ? 'text-[12px] leading-snug tracking-tight' : fullNameLength > 18 ? 'text-[13.5px] leading-snug' : 'text-[15.5px] leading-tight tracking-wide'}`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{employee.fullName}</h2>
          <div className="mt-1 flex flex-wrap justify-center gap-x-2 text-[9px] font-mono font-semibold uppercase tracking-wide text-slate-600">
            {employee.nif?.trim() && <span>NIF : {formatNif(employee.nif)}</span>}
            {employee.nif?.trim() && employee.bloodGroup?.trim() && <span className="text-slate-300">•</span>}
            {employee.bloodGroup?.trim() && <span className="text-[#ed1c24]">GS : {employee.bloodGroup.toUpperCase()}</span>}
          </div>
          <div className="mx-auto my-2 h-[2px] w-14 rounded-full bg-[#ed1c24]" />
          <p className="truncate text-[10.5px] font-bold uppercase tracking-[0.11em] text-slate-700">{employee.jobTitle || 'COLLABORATEUR'}</p>
        </div>
        <div className="relative mt-auto border-t border-slate-200/80 bg-white/95 px-4 pt-2 pb-3 text-center">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#ed1c24]">ID {employee.employeeId}</p>
          <div className="flex justify-center"><Barcode value={employee.employeeId} width={1.25} height={31} fontSize={8} displayValue={false} background="#FFFFFF" lineColor="#15181c" /></div>
        </div>
      </div>
    </div>
  );
});

export const AutobizBadgeVerso = React.memo(function AutobizBadgeVerso({ employee, brand, refId }: AutobizBadgeProps) {
  const artId = (employee.id || employee.employeeId || 'autobiz').replace(/[^a-zA-Z0-9_-]/g, '_');
  return (
    <div id={refId} className="badge-back font-montserrat relative w-[288px] h-[456.5px] rounded-2xl overflow-hidden select-none shadow-xl border border-slate-200 print:border-none print:rounded-none print:shadow-none bg-white text-[#171a1e]">
      <CornerArtwork id={`back-${artId}`} />
      <div className="relative z-10 flex h-full flex-col px-5">
        <div className="flex justify-center pt-8"><AutobizLogo className="h-[64px] max-w-[232px]" /></div>
        <div className="mx-auto mt-1 h-1 w-24 rounded-full bg-[#ed1c24]" />
        <p className="mt-5 text-center text-[8.5px] font-bold uppercase tracking-[0.2em] text-slate-500">Marques distribuées</p>
        <div className="mt-3 grid grid-cols-3 items-center gap-x-2 gap-y-3 rounded-2xl border border-slate-200 bg-white/95 px-2 py-4 shadow-sm">
          {PARTNERS.map((partner, index) => (
            <div key={partner.name} className={`flex h-12 items-center justify-center ${index === 3 ? 'col-start-1 col-end-3 translate-x-5' : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={partner.src} alt={partner.name} className={`${partner.className} object-contain`} />
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 border-t border-slate-200 pt-3 text-[8.5px] font-semibold text-slate-600">
          <div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-[#ed1c24]" /><span>{brand.website}</span></div>
          <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-[#ed1c24]" /><span>{brand.phoneFormatted}</span></div>
          <div className="flex items-start gap-2"><MapPin className="mt-px h-3.5 w-3.5 shrink-0 text-[#ed1c24]" /><span>{brand.address}</span></div>
        </div>
        <p className="mt-auto border-t border-slate-200 py-2 text-center text-[7px] font-medium leading-snug text-slate-500">Ce badge est strictement personnel et demeure la propriété d&apos;Autobiz S.A. En cas de perte, merci de le rapporter à la Direction.</p>
        <div className="-mx-5 flex items-center justify-between bg-[#171a1e] px-5 py-2.5 text-white">
          <span className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-wide"><Lock className="h-3.5 w-3.5 text-[#ed1c24]" />Personnel autorisé</span>
          <span className="font-mono text-[9px] font-bold text-slate-200">{employee.employeeId}</span>
        </div>
      </div>
    </div>
  );
});
