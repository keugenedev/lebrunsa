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

interface CaribeBadgeProps {
  employee: Employee;
  brand: BrandConfig;
  refId?: string;
  qrCodeUrl?: string;
}

/**
 * RECTO : Badge Caribe Motors
 * - Fond blanc pur en haut pour valoriser le logo officiel Caribe Motors
 * - Courbes dynamiques organiques en dégradé Bleu Royal Caribe (#0A2540) & Vert Lime (#52BA23)
 * - Groupe sanguin vertical avancé (left: 238px, top: 248px)
 * - Cadre photo arrondi posé avec élégance sur la vague
 * - Bloc identité : Nom, NIF, filet vert lime, Poste
 * - Bas de carte épuré : ID Matricule et Code 128
 */
export const CaribeBadgeRecto = React.memo(function CaribeBadgeRecto({ employee, brand, refId }: CaribeBadgeProps) {
  const cleanId = (employee.id || employee.employeeId || 'caribe').replace(/[^a-zA-Z0-9_-]/g, '_');
  const gradientNavyId = `caribeNavy_${cleanId}`;
  const gradientLimeId = `caribeLime_${cleanId}`;
  const softGlowId = `caribeGlow_${cleanId}`;

  return (
    <div
      id={refId}
      className="badge-front font-montserrat relative w-[288px] h-[456.5px] rounded-2xl overflow-hidden select-none shadow-xl bg-white flex flex-col justify-between print:border-none print:rounded-none print:shadow-none"
    >
      {/* ── COURBES ORGANIQUES CARIBE EN ARRIÈRE-PLAN (Bleu Royal & Vert Lime) ── */}
      <svg
        viewBox="0 0 288 456"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute pointer-events-none"
        style={{ zIndex: 1, left: '-4px', width: 'calc(100% + 8px)', top: 0, height: '100%' }}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Dégradé Bleu Royal Caribe Motors */}
          <linearGradient id={gradientNavyId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A2540" />
            <stop offset="50%" stopColor="#0F355C" />
            <stop offset="100%" stopColor="#071B30" />
          </linearGradient>

          {/* Dégradé Vert Lime Caribe Motors */}
          <linearGradient id={gradientLimeId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64CE30" />
            <stop offset="50%" stopColor="#52BA23" />
            <stop offset="100%" stopColor="#3C9115" />
          </linearGradient>

          {/* Voile pastel doux */}
          <linearGradient id={softGlowId} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DDF6CE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#C6EDB0" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Vague 1 : Voile doux pastel */}
        <path
          d="M -20,140 C 75,100 165,175 308,125 L 308,205 C 185,250 80,175 -20,225 Z"
          fill={`url(#${softGlowId})`}
        />

        {/* Vague 2 : Ruban dynamique Bleu Royal Caribe */}
        <path
          d="M -20,155 C 65,115 160,190 308,140 L 308,195 C 190,240 85,165 -20,215 Z"
          fill={`url(#${gradientNavyId})`}
        />

        {/* Vague 3 : Vague d'accent Vert Lime */}
        <path
          d="M -20,185 C 80,215 175,150 308,185 L 308,210 C 180,175 90,235 -20,205 Z"
          fill={`url(#${gradientLimeId})`}
          opacity="0.9"
        />

        {/* Filet lumineux Vert Lime supérieur */}
        <path
          d="M -20,153 C 65,113 160,188 308,138"
          stroke="#7CE845"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.95"
          fill="none"
        />
      </svg>

      {/* ── 1. EN-TÊTE : FOND BLANC PUR POUR LE LOGO CARIBE MOTORS ── */}
      <div
        className="relative flex items-center justify-center bg-white pt-5 pb-2 px-6 shrink-0"
        style={{ zIndex: 10 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.logo}
          alt="Caribe Motors"
          className="h-8 max-w-[170px] w-auto object-contain"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== brand.fallbackLogo) target.src = brand.fallbackLogo;
          }}
        />
      </div>

      {/* ── 2. CADRE PHOTO POSÉ SUR LA COURBE ── */}
      <div
        className="relative px-6 flex items-center justify-center"
        style={{ zIndex: 10, marginTop: '2px' }}
      >
        <div
          className="w-44 h-48 rounded-[28px] overflow-hidden flex items-center justify-center relative shadow-md border-[2.5px] border-white"
          style={{ backgroundColor: '#EAF5E6' }}
        >
          {employee.photoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={employee.photoUrl}
              alt={employee.fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white border border-[#52BA23]/50 shadow-xs">
              <User className="w-14 h-14 text-[#0A2540]" />
            </div>
          )}
        </div>
      </div>

      {/* ── 3. IDENTITÉ : NOM, NIF, GROUPE SANGUIN (APRÈS NIF), FILET VERT LIME, TITRE DU POSTE ── */}
      <div
        className="relative px-4 text-center my-auto"
        style={{ zIndex: 10 }}
      >
        <h2 className="text-[16px] font-extrabold uppercase tracking-wide text-[#0A2540] leading-tight truncate px-1">
          {employee.fullName}
        </h2>

        {/* NIF & GROUPE SANGUIN PLACÉ DIRECTEMENT APRÈS LE NIF */}
        <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
          {employee.nif && employee.nif.trim() ? (
            <span className="text-[10px] font-mono tracking-wider text-slate-600 uppercase">
              NIF : <span className="font-semibold text-slate-900">{formatNif(employee.nif)}</span>
            </span>
          ) : null}

          {employee.nif && employee.nif.trim() && employee.bloodGroup && employee.bloodGroup.trim() ? (
            <span className="text-slate-300">•</span>
          ) : null}

          {employee.bloodGroup && employee.bloodGroup.trim() ? (
            <span className="text-[10px] font-mono tracking-wider text-slate-700 uppercase">
              GS : <span className="font-extrabold text-red-600">{employee.bloodGroup.toUpperCase()}</span>
            </span>
          ) : null}
        </div>

        <div className="flex justify-center my-1.5">
          <div className="w-16 h-[2.5px] rounded-full bg-[#52BA23]" />
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-[#0A2540] truncate">
          {employee.jobTitle || 'COLLABORATEUR'}
        </p>
      </div>

      {/* ── 4. BAS ÉPURÉ : FOND BLANC, ID MATRICULE ET CODE-BARRES ── */}
      <div
        className="relative pt-1 pb-3 px-4 flex flex-col items-center justify-center shrink-0 bg-white border-t border-slate-100"
        style={{ zIndex: 10 }}
      >
        <span className="text-xs font-bold tracking-widest font-mono uppercase mb-1 text-[#0A2540]">
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
 * VERSO : Verso Caribe Motors Épuré & Haute Précision
 * - En-tête : Grand logo officiel Caribe Motors en haut sur fond blanc
 * - Centre : Code QR clair et scannable avec grandes traces nettes
 * - Coordonnées : Téléphones (509) 2940-3001 à 3005 + 2 Adresses exactes sur lignes dédiées
 * - Écritures en noir net, icônes en vert lime Caribe (#52BA23)
 * - Clause légale de propriété et bandeau inférieur "Personnel Autorisé"
 */
export const CaribeBadgeVerso = React.memo(function CaribeBadgeVerso({ employee, brand, refId, qrCodeUrl }: CaribeBadgeProps) {
  const phoneNumbers = brand.phoneFormatted || '(509) 2940-3001 à (509) 2940-3005';
  const address1 = brand.address || '33, Blvd Toussaint Louverture, Port-au-Prince, Haïti';
  const address2 = brand.address2 || '27B, Rue Rigaud, Pétion-Ville, Haïti';

  return (
    <div
      id={refId}
      className="badge-back font-montserrat relative w-[288px] h-[456.5px] rounded-2xl overflow-hidden select-none flex flex-col justify-between shadow-xl border border-slate-300 print:border-none print:rounded-none print:shadow-none text-black bg-white"
    >
      {/* 1. EN-TÊTE : GRAND LOGO CARIBE MOTORS EN HAUT */}
      <div className="pt-4 pb-1 px-4 flex items-center justify-center shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.logo}
          alt="Caribe Motors"
          className="h-8 max-w-[180px] w-auto object-contain"
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
              alt="QR Code Caribe Motors"
              className="w-24 h-24 object-contain block rounded-lg"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="w-24 h-24 bg-emerald-50/50 rounded-lg flex items-center justify-center text-black text-xs font-mono">
              QR CODE...
            </div>
          )}
        </div>
      </div>

      {/* 3. COORDONNÉES OFFICIELLES CARIBE MOTORS (WEB & EMAIL L'UN EN BAS DE L'AUTRE EN BLEU) */}
      <div className="px-3 space-y-1 text-black">
        {/* Site Web en Bleu sur sa propre ligne */}
        <div className="flex items-center gap-1.5 text-black">
          <Globe className="w-3.5 h-3.5 shrink-0 text-[#0066CC]" />
          <span className="font-mono font-bold text-[#0066CC] text-[9.5px] tracking-tight whitespace-nowrap">
            {brand.website || 'www.caribe-motors.com'}
          </span>
        </div>

        {/* Email en Bleu sur sa propre ligne (en bas du site web) */}
        <div className="flex items-center gap-1.5 text-black">
          <Mail className="w-3.5 h-3.5 shrink-0 text-[#0066CC]" />
          <span className="font-mono font-bold text-[#0066CC] text-[9.5px] tracking-tight whitespace-nowrap">
            {brand.email || 'info@caribe-motors.com'}
          </span>
        </div>

        {/* Téléphone */}
        <div className="flex items-center gap-1.5 text-black">
          <Phone className="w-3.5 h-3.5 shrink-0 text-[#52BA23]" />
          <span className="font-mono font-bold text-black text-[9.5px] whitespace-nowrap">
            {phoneNumbers}
          </span>
        </div>

        {/* Adresse 1 */}
        <div className="flex items-center gap-1.5 text-black">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#52BA23]" />
          <span className="font-bold text-[7.8px] text-black tracking-tight leading-tight">
            {address1}
          </span>
        </div>

        {/* Adresse 2 */}
        <div className="flex items-center gap-1.5 text-black">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#52BA23]" />
          <span className="font-bold text-[7.8px] text-black tracking-tight leading-tight">
            {address2}
          </span>
        </div>
      </div>

      {/* 4. MENTION DE PROPRIÉTÉ EN NOIR */}
      <div className="px-4 py-1.5 border-t border-slate-200 mt-1">
        <p className="text-[7.5px] text-black font-semibold leading-tight text-justify">
          Ce badge est strictement personnel et demeure la propriété exclusive de{' '}
          <strong className="font-extrabold text-black">Caribe Motors</strong>. En cas de perte, merci de le rapporter à la Direction ou
          d&apos;appeler le (509) 2940-3001 à 3005.
        </p>
      </div>

      {/* 5. BANDEAU INFÉRIEUR ÉPURÉ (ICÔNE EN VERT LIME) */}
      <div className="py-2 px-4 w-full flex items-center justify-between shrink-0 bg-slate-50 border-t border-slate-200 text-black">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#52BA23]" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-black">
            Personnel Autorisé
          </span>
        </div>
        <span className="text-[9.5px] font-mono font-extrabold text-black">{employee.employeeId}</span>
      </div>
    </div>
  );
});
