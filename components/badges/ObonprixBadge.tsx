'use client';

import React from 'react';
import { Employee } from '@/types/inventory';
import { BrandConfig } from '@/lib/badgeBrands';
import Barcode from '@/components/common/Barcode';
import { formatNif } from '@/lib/formatNif';
import {
  Phone,
  MapPin,
  User,
  Lock,
  Globe,
  Mail
} from 'lucide-react';

interface ObonprixBadgeProps {
  employee: Employee;
  brand: BrandConfig;
  refId?: string;
  qrCodeUrl?: string;
}

/**
 * RECTO : Badge Obonprix (Delmas 83)
 * - Couleurs officielles : Rouge #DA2027, Jaune #FFCB06, Gris Foncé #574C46, Blanc #FFFFFF
 * - Fond blanc pur en haut pour valoriser le logo officiel Obonprix
 * - Courbes dynamiques et vagues organiques aux couleurs Rouge & Jaune Obonprix
 * - Groupe sanguin vertical si renseigné
 * - Cadre photo arrondi posé avec élégance sur la courbe
 * - Bloc identité : Nom, NIF, filet Jaune #FFCB06, Poste
 * - Bas de carte épuré : ID Matricule en Rouge #DA2027 et Code 128
 */
export const ObonprixBadgeRecto = React.memo(function ObonprixBadgeRecto({ employee, brand, refId }: ObonprixBadgeProps) {
  const cleanId = (employee.id || employee.employeeId || 'obonprix').replace(/[^a-zA-Z0-9_-]/g, '_');
  const gradientRedId = `obpRed_${cleanId}`;
  const gradientYellowId = `obpYellow_${cleanId}`;
  const softGlowId = `obpGlow_${cleanId}`;

  return (
    <div
      id={refId}
      className="badge-front font-montserrat relative w-[288px] h-[456.5px] rounded-2xl overflow-hidden select-none shadow-xl bg-white flex flex-col justify-between print:border-none print:rounded-none print:shadow-none"
    >
      {/* ── COURBES ORGANIQUES OBONPRIX (Rouge #DA2027 & Jaune #FFCB06) ── */}
      <svg
        viewBox="0 0 288 456"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute pointer-events-none"
        style={{ zIndex: 1, left: '-4px', width: 'calc(100% + 8px)', top: 0, height: '100%' }}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Dégradé Rouge Obonprix */}
          <linearGradient id={gradientRedId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA262D" />
            <stop offset="50%" stopColor="#DA2027" />
            <stop offset="100%" stopColor="#B31218" />
          </linearGradient>

          {/* Dégradé Jaune Obonprix */}
          <linearGradient id={gradientYellowId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFDE43" />
            <stop offset="50%" stopColor="#FFCB06" />
            <stop offset="100%" stopColor="#E5B200" />
          </linearGradient>

          {/* Voile pastel doux chaleureux */}
          <linearGradient id={softGlowId} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF7D6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFE8E8" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Vague 1 : Voile doux pastel */}
        <path
          d="M -20,140 C 75,100 165,175 308,125 L 308,205 C 185,250 80,175 -20,225 Z"
          fill={`url(#${softGlowId})`}
        />

        {/* Vague 2 : Ruban dynamique Rouge Obonprix */}
        <path
          d="M -20,155 C 65,115 160,190 308,140 L 308,195 C 190,240 85,165 -20,215 Z"
          fill={`url(#${gradientRedId})`}
        />

        {/* Vague 3 : Vague d'accent Jaune Obonprix */}
        <path
          d="M -20,185 C 80,215 175,150 308,185 L 308,210 C 180,175 90,235 -20,205 Z"
          fill={`url(#${gradientYellowId})`}
          opacity="0.95"
        />

        {/* Filet lumineux Jaune supérieur */}
        <path
          d="M -20,153 C 65,113 160,188 308,138"
          stroke="#FFCB06"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.95"
          fill="none"
        />
      </svg>

      {/* ── MENTION VERTICALE : GROUPE SANGUIN (si renseigné) ── */}
      {employee.bloodGroup && (
        <div
          style={{
            position: 'absolute',
            left: '238px',
            top: '248px',
            transformOrigin: '0 0',
            transform: 'rotate(-90deg)',
            whiteSpace: 'nowrap',
            fontSize: '8.5px',
            fontWeight: '700',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#574C46',
            fontFamily: "'Montserrat', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 10
          }}
        >
          <span>GROUPE SANGUIN :</span>
          <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#DA2027' }}>
            {employee.bloodGroup}
          </span>
        </div>
      )}

      {/* ── 1. EN-TÊTE : FOND BLANC PUR POUR LE LOGO OFFICIEL OBONPRIX ── */}
      <div className="relative flex items-center justify-center bg-white pt-5 pb-2 px-6 shrink-0" style={{ zIndex: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.logo}
          alt="Obonprix"
          className="h-8.5 max-w-[190px] w-auto object-contain"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== brand.fallbackLogo) target.src = brand.fallbackLogo;
          }}
        />
      </div>

      {/* ── 2. CADRE PHOTO CENTRAL ── */}
      <div className="relative px-6 flex items-center justify-center" style={{ zIndex: 10, marginTop: '2px' }}>
        <div
          className="w-44 h-48 rounded-[28px] overflow-hidden flex items-center justify-center relative shadow-md border-[2.5px] border-white"
          style={{ backgroundColor: '#FFF9E6' }}
        >
          {employee.photoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={employee.photoUrl}
              alt={employee.fullName}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white border border-[#FFCB06]/40 shadow-xs">
              <User className="w-14 h-14 text-[#DA2027]" />
            </div>
          )}
        </div>
      </div>

      {/* ── 3. IDENTITÉ : NOM, NIF, FILET JAUNE, POSTE ── */}
      <div className="relative px-4 text-center my-auto" style={{ zIndex: 10 }}>
        <h2 className="text-[16px] font-extrabold uppercase tracking-wide text-[#574C46] leading-tight truncate px-1">
          {employee.fullName}
        </h2>

        {employee.nif && employee.nif.trim() ? (
          <p className="text-[10px] font-mono tracking-wider text-slate-700 uppercase font-medium mt-0.5">
            NIF : <span className="font-semibold text-black">{formatNif(employee.nif)}</span>
          </p>
        ) : null}

        {/* Filet horizontal Jaune Obonprix (#FFCB06) */}
        <div className="flex justify-center my-1.5">
          <div className="w-16 h-[2.5px] rounded-full bg-[#FFCB06]" />
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-[#574C46] truncate">
          {employee.jobTitle || 'COLLABORATEUR'}
        </p>
      </div>

      {/* ── 4. BAS ÉPURÉ : FOND BLANC, ID MATRICULE ET CODE-BARRES CODE 128 ── */}
      <div className="relative pt-1 pb-3 px-4 flex flex-col items-center justify-center shrink-0 bg-white border-t border-slate-100" style={{ zIndex: 10 }}>
        <span className="text-xs font-bold tracking-widest font-mono uppercase text-[#DA2027] mb-1">
          ID {employee.employeeId}
        </span>
        <div className="w-full flex items-center justify-center">
          <Barcode
            value={employee.employeeId}
            width={1.4}
            height={34}
            fontSize={9}
            displayValue={false}
            background="#FFFFFF"
            lineColor="#000000"
          />
        </div>
      </div>
    </div>
  );
});

/**
 * VERSO : Verso Obonprix Épuré & Haute Précision
 * - En-tête : Grand logo officiel Obonprix en haut sur fond blanc
 * - Centre : Code QR clair et scannable avec grandes traces nettes
 * - Coordonnées : Téléphone (+509) 2940-3006 + Adresse Delmas 83
 * - Écritures en Gris Foncé #574C46, icônes en Rouge #DA2027
 * - Clause légale de propriété et bandeau inférieur "Personnel Autorisé • Delmas 83"
 */
export const ObonprixBadgeVerso = React.memo(function ObonprixBadgeVerso({ employee, brand, refId, qrCodeUrl }: ObonprixBadgeProps) {
  const phoneNumbers = brand.phoneFormatted || '(+509) 2940-3006';
  const address = brand.address || 'Delmas 83, Port-au-Prince, Haïti';

  return (
    <div
      id={refId}
      className="badge-back font-montserrat relative w-[288px] h-[456.5px] rounded-2xl overflow-hidden select-none flex flex-col justify-between shadow-xl border border-slate-300 print:border-none print:rounded-none print:shadow-none text-black bg-white"
    >
      {/* 1. EN-TÊTE : GRAND LOGO OBONPRIX EN HAUT */}
      <div className="pt-4 pb-1 px-4 flex items-center justify-center shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.logo}
          alt="Obonprix"
          className="h-8.5 max-w-[190px] w-auto object-contain"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== brand.fallbackLogo) target.src = brand.fallbackLogo;
          }}
        />
      </div>

      {/* 2. CENTRE : CODE QR CLAIR & LISIBLE */}
      <div className="px-4 flex flex-col items-center justify-center text-center my-auto">
        <div className="bg-white p-2 rounded-2xl border border-slate-300 shadow-xs">
          {qrCodeUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qrCodeUrl}
              alt="QR Code Obonprix"
              className="w-24 h-24 object-contain block rounded-lg"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="w-24 h-24 bg-amber-50/50 rounded-lg flex items-center justify-center text-black text-xs font-mono">
              QR CODE...
            </div>
          )}
        </div>
      </div>

      {/* 3. COORDONNÉES OFFICIELLES OBONPRIX */}
      <div className="px-3 space-y-1.5 text-black">
        {/* Site Web */}
        <div className="flex items-center gap-1.5 text-black">
          <Globe className="w-3.5 h-3.5 shrink-0 text-[#DA2027]" />
          <span className="font-mono font-bold text-[#DA2027] text-[9.5px] tracking-tight whitespace-nowrap">
            {brand.website || 'www.obonprix.ht'}
          </span>
        </div>

        {/* Email */}
        <div className="flex items-center gap-1.5 text-black">
          <Mail className="w-3.5 h-3.5 shrink-0 text-[#DA2027]" />
          <span className="font-mono font-bold text-[#574C46] text-[9.5px] tracking-tight whitespace-nowrap">
            {brand.email || 'contact@obonprix.ht'}
          </span>
        </div>

        {/* Téléphone */}
        <div className="flex items-center gap-1.5 text-black">
          <Phone className="w-3.5 h-3.5 shrink-0 text-[#FFCB06]" />
          <span className="font-mono font-bold text-black text-[9.5px] whitespace-nowrap">
            {phoneNumbers}
          </span>
        </div>

        {/* Adresse Delmas 83 */}
        <div className="flex items-center gap-1.5 text-black">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#DA2027]" />
          <span className="font-bold text-[8.5px] text-[#574C46] tracking-tight leading-tight">
            {address}
          </span>
        </div>
      </div>

      {/* 4. MENTION DE PROPRIÉTÉ EN NOIR */}
      <div className="px-4 py-1.5 border-t border-slate-200 mt-1">
        <p className="text-[7.5px] text-[#574C46] font-semibold leading-tight text-justify">
          Ce badge est strictement personnel et demeure la propriété exclusive de{' '}
          <strong className="font-extrabold text-[#DA2027]">Obonprix</strong>. En cas de perte, merci de le rapporter à la Direction ou de contacter le service RH (Delmas 83).
        </p>
      </div>

      {/* 5. BANDEAU INFÉRIEUR ÉPURÉ (ROUGE & JAUNE) */}
      <div className="py-2 px-4 w-full flex items-center justify-between shrink-0 bg-[#574C46] text-white">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#FFCB06]" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-white">
            Personnel Autorisé
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold text-[#FFCB06]">
          Delmas 83
        </span>
      </div>
    </div>
  );
});
