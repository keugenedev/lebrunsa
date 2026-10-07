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
 * - Fond blanc pur et professionnel
 * - Grand cadre photo rehaussé et agrandi (w-[176px] h-[208px]) pour afficher confortablement la personne
 * - Cadrage photo avec 'object-top' pour préserver l'intégralité des cheveux et de la tête
 * - Section Identité : Nom du collaborateur en grand gras navy (#0A2540), NIF, GS, Poste
 * - Pied de carte épuré : Fond blanc pur (sans couleur verte ni vagues), ID centré et Code-barres 128 agrandi haute lisibilité
 */
export const CaribeBadgeRecto = React.memo(function CaribeBadgeRecto({ employee, brand, refId }: CaribeBadgeProps) {
  return (
    <div
      id={refId}
      className="badge-front font-montserrat relative w-[288px] h-[456.5px] rounded-2xl overflow-hidden select-none shadow-xl bg-white flex flex-col justify-between print:border-none print:rounded-none print:shadow-none"
    >
      {/* ── 1. EN-TÊTE : FOND BLANC PUR POUR LE LOGO CARIBE MOTORS ── */}
      <div
        className="relative flex items-center justify-center bg-white pt-4 pb-1 px-6 shrink-0"
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

      {/* ── 2. CADRE PHOTO AGRANDI & REHAUSSÉ (VISAGE & CHEVEUX 100% VISIBLES SANS COUPURE) ── */}
      <div
        className="relative px-6 flex items-center justify-center shrink-0 my-auto"
        style={{ zIndex: 10 }}
      >
        <div
          className="w-[176px] h-[208px] rounded-2xl overflow-hidden flex items-center justify-center relative shadow-sm border-2 border-slate-100 bg-white"
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
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-slate-50 border border-slate-200/80 shadow-2xs">
              <User className="w-14 h-14 text-[#0A2540]/75" />
            </div>
          )}
        </div>
      </div>

      {/* ── 3. IDENTITÉ : NOM DU COLLABORATEUR, NIF / GS & TITRE DU POSTE ── */}
      <div
        className="relative px-4 text-center my-auto"
        style={{ zIndex: 10 }}
      >
        {/* Nom du Collaborateur */}
        <h2 className="text-[16px] font-extrabold uppercase tracking-wide text-[#0A2540] leading-tight truncate px-1">
          {employee.fullName}
        </h2>

        {/* NIF & GS (Sans vert, neutre et haute lisibilité) */}
        {(employee.nif || employee.bloodGroup) && (
          <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
            {employee.nif && employee.nif.trim() ? (
              <span className="text-[10px] font-mono tracking-wider text-slate-700 uppercase font-medium">
                NIF : <span className="font-semibold text-slate-900">{formatNif(employee.nif)}</span>
              </span>
            ) : null}

            {employee.nif && employee.nif.trim() && employee.bloodGroup && employee.bloodGroup.trim() ? (
              <span className="text-slate-300">•</span>
            ) : null}

            {employee.bloodGroup && employee.bloodGroup.trim() ? (
              <span className="text-[10px] font-mono tracking-wider text-red-600 uppercase font-semibold">
                GS : <span className="font-black text-red-600">{employee.bloodGroup.toUpperCase()}</span>
              </span>
            ) : null}
          </div>
        )}

        {/* Titre du Poste (comme TECHNICIEN placé juste au-dessus de la ligne séparatrice) */}
        <p className="text-[11.5px] font-bold uppercase tracking-wider text-[#0A2540] truncate mt-1">
          {employee.jobTitle || 'COLLABORATEUR'}
        </p>
      </div>

      {/* ── 4. PIED DE CARTE ÉPURÉ : FOND BLANC PUR, ID & CODE-BARRES AGRANDI CONFORME AU MODÈLE ── */}
      <div
        className="relative pt-2 pb-3 px-4 flex flex-col items-center justify-center shrink-0 bg-white border-t border-slate-200/90"
        style={{ zIndex: 10 }}
      >
        <span className="text-[11.5px] font-bold tracking-wider font-mono uppercase mb-1.5 text-[#0A2540]">
          ID {employee.employeeId}
        </span>
        <div className="w-full flex items-center justify-center">
          <Barcode
            value={employee.employeeId}
            width={1.5}
            height={42}
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
 * VERSO : Verso Caribe Motors 100% Sobre & Épuré
 * - En-tête : Grand logo officiel Caribe Motors en haut sur fond blanc
 * - Centre : Code QR clair et scannable
 * - Coordonnées : Téléphones + Adresses + Contact web/email (100% monochrome, écritures et icônes en noir/slate, sans couleur verte)
 * - Clause légale de propriété et bandeau inférieur "Personnel Autorisé" en noir/slate
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
            <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-black text-xs font-mono">
              QR CODE...
            </div>
          )}
        </div>
      </div>

      {/* 3. COORDONNÉES OFFICIELLES CARIBE MOTORS (EXACTEMENT COMME SUR LE MODÈLE) */}
      <div className="px-3 space-y-1 text-black">
        {/* Site Web en Bleu */}
        <div className="flex items-center gap-1.5 text-black">
          <Globe className="w-3.5 h-3.5 shrink-0 text-[#0066CC]" />
          <span className="font-mono font-bold text-[#0066CC] text-[9.5px] tracking-tight whitespace-nowrap">
            {brand.website || 'www.caribe-motors.com'}
          </span>
        </div>

        {/* Email en Bleu */}
        <div className="flex items-center gap-1.5 text-black">
          <Mail className="w-3.5 h-3.5 shrink-0 text-[#0066CC]" />
          <span className="font-mono font-bold text-[#0066CC] text-[9.5px] tracking-tight whitespace-nowrap">
            {brand.email || 'info@caribe-motors.com'}
          </span>
        </div>

        {/* Téléphone (Icône verte, texte noir gras) */}
        <div className="flex items-center gap-1.5 text-black">
          <Phone className="w-3.5 h-3.5 shrink-0 text-[#52BA23]" />
          <span className="font-mono font-bold text-black text-[9.5px] whitespace-nowrap">
            {phoneNumbers}
          </span>
        </div>

        {/* Adresse 1 (Icône verte, texte noir gras) */}
        <div className="flex items-center gap-1.5 text-black">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#52BA23]" />
          <span className="font-bold text-[7.8px] text-black tracking-tight leading-tight">
            {address1}
          </span>
        </div>

        {/* Adresse 2 (Icône verte, texte noir gras) */}
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

      {/* 5. BANDEAU INFÉRIEUR CONFORME AU MODÈLE (ICÔNE EN VERT LIME, TEXTES EN NOIR) */}
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
