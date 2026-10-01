'use client';

import React from 'react';
import { Employee } from '@/types/inventory';
import { BrandConfig } from '@/lib/badgeBrands';
import Barcode from '@/components/common/Barcode';
import { formatNif } from '@/lib/formatNif';
import {
  Globe,
  Mail,
  Phone,
  MapPin,
  User,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface LeaderBadgeProps {
  employee: Employee;
  brand: BrandConfig;
  refId?: string;
  qrCodeUrl?: string;
}

/**
 * RECTO : Badge Leader Foods
 * - Fond blanc pur en haut pour que le logo soit 100% visible
 * - Courbe SVG organique et fluide derrière la photo (non plate, non carrée, courbes fluides haut et bas)
 * - Groupe sanguin avancé à sa position naturelle (left: 238px, top: 248px, sans box, haute lisibilité)
 * - Photo avec bordure blanche et ombre douce posée sur la courbe
 * - Bloc identité conforme Image 1 : Nom, NIF, filet vert horizontal, Poste
 * - Bas blanc épuré : ID matricule et Code-barres
 */
export function LeaderBadgeRecto({ employee, brand, refId }: LeaderBadgeProps) {
  return (
    <div
      id={refId}
      className="badge-front font-montserrat relative w-[288px] h-[456.5px] rounded-2xl overflow-hidden select-none shadow-xl border border-slate-200/90 bg-white flex flex-col justify-between"
    >
      {/* ── COURBES ORGANIQUES EN ARRIÈRE-PLAN DERRIÈRE LA PHOTO (Plein cadre, fluides, sans ligne plate) ── */}
      <svg
        viewBox="0 0 288 456"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Dégradé vert corporate Leader Foods vibrant */}
          <linearGradient id="lfCurvePrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78C620" />
            <stop offset="50%" stopColor="#70BD1B" />
            <stop offset="100%" stopColor="#4D8F10" />
          </linearGradient>

          {/* Dégradé vert clair lumineux */}
          <linearGradient id="lfCurveLight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A4EA48" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#D4F5A2" stopOpacity="0.25" />
          </linearGradient>

          {/* Dégradé vert pastel doux */}
          <linearGradient id="lfCurveSoft" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#EAF8DA" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D8F3BA" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Vague 1 : Voile doux pastel en arrière-plan (affiné et élégant) */}
        <path
          d="M -10,145 C 75,105 165,175 298,130 L 298,205 C 185,250 80,180 -10,225 Z"
          fill="url(#lfCurveSoft)"
        />

        {/* Vague 2 : Courbe principale verte affinée (ruban dynamique ~45px d'épaisseur) */}
        <path
          d="M -10,160 C 65,120 160,190 298,145 L 298,195 C 190,240 85,165 -10,210 Z"
          fill="url(#lfCurvePrimary)"
        />

        {/* Vague 3 : Onde lumineuse translucide croisée pour le relief */}
        <path
          d="M -10,175 C 80,210 175,145 298,180 L 298,215 C 180,175 90,240 -10,205 Z"
          fill="url(#lfCurveLight)"
        />

        {/* Ligne d'accent dynamique lumineuse */}
        <path
          d="M -10,158 C 65,118 160,188 298,143"
          stroke="#BAF75E"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
          fill="none"
        />
      </svg>

      {/* ── MENTION VERTICALE DROITE : GROUPE SANGUIN (Avancé près du cadre, à left: 238px, top: 248px) ── */}
      {employee.bloodGroup && employee.bloodGroup.trim() ? (
        <div
          className="absolute pointer-events-none select-none flex items-center gap-1 text-[8.5px] font-bold tracking-wider uppercase whitespace-nowrap"
          style={{
            left: '238px',
            top: '248px',
            transformOrigin: '0 0',
            transform: 'rotate(-90deg)',
            zIndex: 30,
          }}
        >
          <span className="text-slate-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
            GROUPE SANGUIN :
          </span>
          <span className="font-mono text-red-600 font-extrabold tracking-normal drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
            {employee.bloodGroup.toUpperCase()}
          </span>
        </div>
      ) : null}

      {/* ── 1. EN-TÊTE : FOND BLANC PUR POUR LE LOGO LEADER FOODS ── */}
      <div
        className="relative flex items-center justify-center bg-white pt-5 pb-2 px-6 shrink-0"
        style={{ zIndex: 10 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.logo}
          alt="Leader Foods"
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
          style={{ backgroundColor: '#EAF7DE' }}
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
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white border border-[#70BD1B]/40 shadow-xs">
              <User className="w-14 h-14 text-[#4D8B10]" />
            </div>
          )}
        </div>
      </div>

      {/* ── 3. IDENTITÉ : NOM, NIF, FILET VERT, TITRE DU POSTE ── */}
      <div
        className="relative px-4 text-center my-auto"
        style={{ zIndex: 10 }}
      >
        <h2 className="text-[16px] font-extrabold uppercase tracking-wide text-slate-900 leading-tight truncate px-1">
          {employee.fullName}
        </h2>

        {employee.nif && employee.nif.trim() ? (
          <p className="text-[10px] font-mono tracking-wider text-slate-600 mt-0.5 uppercase truncate">
            NIF : <span className="font-semibold text-slate-800">{formatNif(employee.nif)}</span>
          </p>
        ) : null}

        <div className="flex justify-center my-1.5">
          <div className="w-16 h-[2.5px] rounded-full bg-[#70BD1B]" />
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-[#3D740C] truncate">
          {employee.jobTitle || 'COLLABORATEUR'}
        </p>
      </div>

      {/* ── 4. BAS ÉPURÉ : FOND BLANC, ID MATRICULE ET CODE-BARRES ── */}
      <div
        className="relative pt-1 pb-3 px-4 flex flex-col items-center justify-center shrink-0 bg-white border-t border-slate-100"
        style={{ zIndex: 10 }}
      >
        <span className="text-xs font-bold tracking-widest font-mono uppercase mb-1 text-slate-900">
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
}

/**
 * VERSO : Verso Leader Foods Épuré & Professionnel
 * - En-tête : Grand logo Leader Foods en haut sur fond blanc
 * - Centre : Code QR clair avec grandes traces bien lisibles (sans mention scan/vcard)
 * - Coordonnées épurées : Téléphones et Adresse uniquement (sans website ni email)
 * - Clause légale de propriété et bandeau inférieur sobre
 */
export function LeaderBadgeVerso({ employee, brand, refId, qrCodeUrl }: LeaderBadgeProps) {
  const siteAddress = brand.address || '5, Rue Tertulien Guilbaud, Port-au-Prince, Haïti';
  const phoneNumbers = brand.phoneFormatted || '(509) 3160-6001 / (509) 3160-6002';

  return (
    <div
      id={refId}
      className="badge-back font-montserrat relative w-[288px] h-[456.5px] rounded-2xl overflow-hidden select-none flex flex-col justify-between shadow-xl border border-slate-200/90 text-slate-800 bg-white"
    >
      {/* 1. EN-TÊTE : GRAND LOGO LEADER FOODS EN HAUT */}
      <div className="pt-8 pb-2 px-6 flex items-center justify-center shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.logo}
          alt="Leader Foods"
          className="h-10 max-w-[200px] w-auto object-contain"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== brand.fallbackLogo) target.src = brand.fallbackLogo;
          }}
        />
      </div>

      {/* 2. CENTRE : CODE QR CLAIR & LISIBLE AVEC GRANDES TRACES */}
      <div className="px-6 flex flex-col items-center justify-center text-center my-auto">
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-sm">
          {qrCodeUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qrCodeUrl}
              alt="QR Code Leader Foods"
              className="w-32 h-32 object-contain block rounded-lg"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="w-32 h-32 bg-emerald-50/50 rounded-lg flex items-center justify-center text-slate-400 text-xs font-mono">
              QR CODE...
            </div>
          )}
        </div>
      </div>

      {/* 3. COORDONNÉES OFFICIELLES (TÉLÉPHONES ET ADRESSE UNIQUEMENT) */}
      <div className="px-6 space-y-2 text-[10.5px]">
        <div className="flex items-center gap-2 text-slate-800">
          <Phone className="w-4 h-4 shrink-0 text-[#70BD1B]" />
          <span className="font-mono font-bold text-slate-900 text-[11px]">{phoneNumbers}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-700 text-[10px]">
          <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
          <span className="font-medium leading-snug">{siteAddress}</span>
        </div>
      </div>

      {/* 4. MENTION DE PROPRIÉTÉ SOBRE */}
      <div className="px-6 py-2 border-t border-slate-100 mt-2">
        <p className="text-[8px] text-slate-500 leading-normal text-justify">
          Ce badge est strictement personnel et demeure la propriété exclusive de{' '}
          <strong>Leader Foods</strong>. En cas de perte, merci de le rapporter à la Direction ou
          d&apos;appeler le {phoneNumbers}.
        </p>
      </div>

      {/* 5. BANDEAU INFÉRIEUR ÉPURÉ */}
      <div className="py-2.5 px-6 w-full flex items-center justify-between shrink-0 bg-slate-50 border-t border-slate-100 text-slate-700">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#70BD1B]" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-800">
            Personnel Autorisé
          </span>
        </div>
        <span className="text-[9.5px] font-mono font-bold text-slate-800">{employee.employeeId}</span>
      </div>
    </div>
  );
}
