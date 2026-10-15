'use client';

import React from 'react';
import { Globe, Mail, Phone, User } from 'lucide-react';
import { RiMapPin2Fill } from '@remixicon/react';
import { Employee } from '@/types/inventory';
import { BrandConfig } from '@/lib/badgeBrands';
import Barcode from '@/components/common/Barcode';
import { formatNif } from '@/lib/formatNif';

interface ObonprixBadgeProps {
  employee: Employee;
  brand: BrandConfig;
  refId?: string;
  qrCodeUrl?: string;
}

function ObonprixLogo({ brand, className }: { brand: BrandConfig; className: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brand.logo}
      alt="Obonprix Supermarket 83"
      className={`${className} w-auto object-contain`}
      onError={(e) => {
        if (e.currentTarget.src !== brand.fallbackLogo) e.currentTarget.src = brand.fallbackLogo;
      }}
    />
  );
}

function ObonprixIcon({ className }: { className: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logos/Obonprixicon.png" alt="" aria-hidden="true" className={`${className} object-contain`} />
  );
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] || 'Collaborateur', lastName: '' };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts.at(-1) || '' };
}

/** Face marque : l'icône Obonprix et le logo officiel occupent toute la carte. */
export const ObonprixBadgeRecto = React.memo(function ObonprixBadgeRecto({ employee, brand, refId, qrCodeUrl }: ObonprixBadgeProps) {
  return (
    <div id={refId} className="badge-front font-montserrat relative w-[288px] h-[456.5px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl print:border-none print:rounded-none print:shadow-none">
      <div className="absolute inset-x-0 top-0 h-[380px] overflow-hidden">
        <ObonprixIcon className="absolute -top-1 -left-1 h-[400px] w-[295px] max-w-none object-left-top" />
      </div>
      {qrCodeUrl && (
        <div className="absolute left-1/2 top-[119px] z-10 -translate-x-1/2 rounded-xl bg-white p-1.5 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCodeUrl} alt="QR Code Obonprix" className="h-24 w-24 object-contain" style={{ imageRendering: 'pixelated' }} />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex h-[76px] flex-col items-center bg-white pt-1">
        <ObonprixLogo brand={brand} className="h-[34px] max-w-[210px]" />
        <div className="mt-1 flex h-[24px] justify-center overflow-hidden">
          <Barcode value={employee.employeeId} width={0.82} height={24} fontSize={6} displayValue={false} background="#FFFFFF" lineColor="#171717" />
        </div>
      </div>
    </div>
  );
});

/** Face identité : logo, identité du collaborateur et coordonnées, sans QR code. */
export const ObonprixBadgeVerso = React.memo(function ObonprixBadgeVerso({ employee, brand, refId }: ObonprixBadgeProps) {
  const { firstName, lastName } = splitName(employee.fullName || '');
  const contactEmail = brand.email;

  return (
    <div id={refId} className="badge-back font-montserrat relative w-[288px] h-[456.5px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-[#574C46] shadow-xl print:border-none print:rounded-none print:shadow-none">
      <div className="relative z-10 px-7 pt-5">
        <div className="flex justify-center">
          <ObonprixLogo brand={brand} className="h-[47px] max-w-[212px]" />
        </div>

        <div className="mt-6 flex items-start gap-3">
          <div className="flex h-[100px] w-[78px] shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#DA2027] bg-[#fff8e6] shadow-sm">
            {employee.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={employee.photoUrl} alt={employee.fullName} className="h-full w-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <User className="h-10 w-10 text-[#DA2027]" strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0 pt-2">
            <p className="text-[14px] font-medium leading-none text-[#574C46]">{firstName}</p>
            {lastName && <p className="mt-1 text-[16px] font-extrabold uppercase leading-none text-[#574C46]">{lastName}</p>}
            <p className="mt-1.5 text-[7.5px] font-extrabold leading-tight text-[#574C46]">{employee.jobTitle || 'Collaborateur'}</p>
            {employee.nif?.trim() && <p className="mt-2 text-[7px] font-bold uppercase tracking-wide text-[#574C46]">NIF : {formatNif(employee.nif)}</p>}
          </div>
        </div>

        <div className="mt-4 space-y-2 text-[7px] font-medium text-[#574C46]">
          <div className="flex items-center gap-2 border-b border-[#DA2027] pb-1.5">
            <RiMapPin2Fill className="h-3.5 w-3.5 shrink-0 text-[#DA2027]" />
            <span>{brand.address}</span>
          </div>
          <div className="flex items-center gap-2 border-b border-[#DA2027] pb-1.5">
            <Mail className="h-3.5 w-3.5 shrink-0 text-[#DA2027]" strokeWidth={2.2} />
            <span>{contactEmail}</span>
          </div>
          <div className="flex items-center gap-2 border-b border-[#DA2027] pb-1.5">
            <Globe className="h-3.5 w-3.5 shrink-0 text-[#DA2027]" strokeWidth={2.2} />
            <span>{brand.website}</span>
          </div>
          <div className="flex items-center gap-2 border-b border-[#DA2027] pb-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0 text-[#DA2027]" strokeWidth={2.2} />
            <span>{brand.phoneFormatted}</span>
          </div>
        </div>
      </div>

      <ObonprixIcon className="absolute -bottom-[116px] -left-[42px] h-[245px] w-[245px]" />
    </div>
  );
});
