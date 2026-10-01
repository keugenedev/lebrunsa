'use client';

import React, { useState, useEffect } from 'react';
import { Employee } from '@/types/inventory';
import { BrandConfig, getBrandConfig, buildVCardString } from '@/lib/badgeBrands';
import Barcode from '@/components/common/Barcode';
import QRCode from 'qrcode';
import { 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  RotateCw, 
  Download, 
  Printer, 
  Check, 
  Copy,
  User,
  Lock
} from 'lucide-react';
import { downloadSingleBadgeCR80PDF } from '@/lib/printBadgePDF';
import { formatNif } from '@/lib/formatNif';
import { LeaderBadgeRecto, LeaderBadgeVerso } from './LeaderBadge';
import { CaribeBadgeRecto, CaribeBadgeVerso } from './CaribeBadge';
import { ObonprixBadgeRecto, ObonprixBadgeVerso } from './ObonprixBadge';

interface BadgeCardProps {
  employee: Employee;
  brandOverride?: BrandConfig;
  showBothSides?: boolean;
  className?: string;
}

// Cache global en mémoire pour les QR Codes (évite tout recalcul ou freeze au changement d'onglet)
const qrCodeCache = new Map<string, string>();

export default React.memo(function BadgeCard({
  employee,
  brandOverride,
  showBothSides = false,
  className = ''
}: BadgeCardProps) {
  const brand = brandOverride || getBrandConfig(employee.company);
  const [isFlipped, setIsFlipped] = useState(false);
  const cacheKey = `v3-${employee.id}-${employee.employeeId}-${brand.id}-${employee.phone || ''}`;
  const [qrCodeUrl, setQrCodeUrl] = useState<string>(() => qrCodeCache.get(cacheKey) || '');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // QR Code vCard au verso (instantané grâce au cache)
  useEffect(() => {
    if (qrCodeCache.has(cacheKey)) {
      setQrCodeUrl(qrCodeCache.get(cacheKey)!);
      return;
    }

    let isMounted = true;
    const vCardData = buildVCardString(employee, brand);

    QRCode.toDataURL(vCardData, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: 'L',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then((url) => {
        qrCodeCache.set(cacheKey, url);
        if (isMounted) setQrCodeUrl(url);
      })
      .catch((err) => {
        console.error('Erreur QR Code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [employee, brand, cacheKey]);

  const handleDownloadPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      await downloadSingleBadgeCR80PDF(employee, brand);
    } catch (err) {
      console.error('Erreur téléchargement badge PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(employee.employeeId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -------------------------------------------------------------
  // RECTO : Reproduction exacte et sobre du modèle
  // -------------------------------------------------------------
  const renderRecto = (refId?: string) => {
    if (brand.id === 'leader') {
      return <LeaderBadgeRecto employee={employee} brand={brand} refId={refId} />;
    }
    if (brand.id === 'caribe') {
      return <CaribeBadgeRecto employee={employee} brand={brand} refId={refId} />;
    }
    if (brand.id === 'obonprix') {
      return <ObonprixBadgeRecto employee={employee} brand={brand} refId={refId} />;
    }

    return (
      <div
        id={refId}
        className="badge-front font-montserrat relative w-[288px] h-[456.5px] rounded-2xl overflow-hidden select-none flex flex-col justify-between shadow-xl border border-slate-200/90 print:border-none print:rounded-none print:shadow-none bg-white"
      >
        {/* 1. EN-TÊTE : Logo sur fond blanc */}
        <div className="relative flex items-center justify-center bg-white pt-5 pb-2 px-6 shrink-0" style={{ zIndex: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.logo}
            alt={brand.displayName}
            className="h-8 max-w-[170px] w-auto object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== brand.fallbackLogo) target.src = brand.fallbackLogo;
            }}
          />
        </div>

        {/* 2. CADRE PHOTO CENTRAL */}
        <div className="relative px-6 flex items-center justify-center" style={{ zIndex: 10, marginTop: '2px' }}>
          <div
            className="w-44 h-48 rounded-[28px] overflow-hidden flex items-center justify-center relative shadow-md border-[2.5px] border-white"
            style={{ backgroundColor: `${brand.accentColor}15` }}
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
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center bg-white border shadow-xs"
                style={{ borderColor: `${brand.accentColor}50` }}
              >
                <User className="w-14 h-14" style={{ color: brand.accentColor }} />
              </div>
            )}
          </div>
        </div>

        {/* 3. IDENTITÉ : NOM, NIF, GROUPE SANGUIN, FILET, TITRE DU POSTE */}
        <div className="relative px-4 text-center my-auto" style={{ zIndex: 10 }}>
          <h2 className="text-[16px] font-extrabold uppercase tracking-wide text-slate-900 leading-tight truncate px-1">
            {employee.fullName}
          </h2>

          <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
            {employee.nif && employee.nif.trim() ? (
              <span className="text-[10px] font-mono tracking-wider text-black uppercase font-medium">
                NIF : <span className="font-semibold text-black">{formatNif(employee.nif)}</span>
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

          <div className="flex justify-center my-1.5">
            <div 
              className="w-16 h-[2.5px] rounded-full"
              style={{ backgroundColor: brand.accentColor }}
            />
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-slate-800 truncate">
            {employee.jobTitle || 'COLLABORATEUR'}
          </p>
        </div>

        {/* 4. BAS ÉPURÉ : FOND BLANC, ID MATRICULE ET CODE-BARRES */}
        <div className="relative pt-1 pb-3 px-4 flex flex-col items-center justify-center shrink-0 bg-white border-t border-slate-100" style={{ zIndex: 10 }}>
          <span 
            className="text-xs font-bold tracking-widest font-mono uppercase mb-1"
            style={{ color: brand.accentColor }}
          >
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
  };

  // -------------------------------------------------------------
  // VERSO : Simple, sobre, officiel (Caribe Motors, Leader Foods & Fallback)
  // -------------------------------------------------------------
  const renderVerso = (refId?: string) => {
    if (brand.id === 'leader') {
      return (
        <LeaderBadgeVerso
          employee={employee}
          brand={brand}
          refId={refId}
          qrCodeUrl={qrCodeUrl}
        />
      );
    }
    if (brand.id === 'caribe') {
      return (
        <CaribeBadgeVerso
          employee={employee}
          brand={brand}
          refId={refId}
          qrCodeUrl={qrCodeUrl}
        />
      );
    }
    if (brand.id === 'obonprix') {
      return (
        <ObonprixBadgeVerso
          employee={employee}
          brand={brand}
          refId={refId}
          qrCodeUrl={qrCodeUrl}
        />
      );
    }

    return (
      <div
        id={refId}
        className="badge-back font-montserrat relative w-[288px] h-[456.5px] rounded-2xl overflow-hidden select-none flex flex-col justify-between shadow-xl border border-slate-300 print:border-none print:rounded-none print:shadow-none text-black bg-white"
      >
        {/* 1. EN-TÊTE VERSO : Logo sur fond blanc */}
        <div className="pt-4 pb-1 px-4 flex items-center justify-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.logo}
            alt={brand.displayName}
            className="h-8 max-w-[180px] w-auto object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== brand.fallbackLogo) target.src = brand.fallbackLogo;
            }}
          />
        </div>

        {/* 2. CENTRE : QR CODE SYSTÈME SCANNABLE */}
        <div className="px-4 flex flex-col items-center justify-center text-center my-auto">
          <div className="bg-white p-2 rounded-2xl border border-slate-300 shadow-xs">
            {qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={qrCodeUrl} 
                alt="QR Code Système" 
                className="w-24 h-24 object-contain block rounded-lg"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs font-mono">
                QR CODE...
              </div>
            )}
          </div>
        </div>

        {/* 3. COORDONNÉES OFFICIELLES DE L'ENTREPRISE */}
        <div className="px-4 space-y-1 text-black">
          {brand.website && (
            <div className="flex items-center gap-1.5 text-black">
              <Globe className="w-3.5 h-3.5 shrink-0 text-[#0066CC]" />
              <span className="font-mono font-bold text-[#0066CC] text-[9.5px] tracking-tight whitespace-nowrap">
                {brand.website}
              </span>
            </div>
          )}

          {brand.email && (
            <div className="flex items-center gap-1.5 text-black">
              <Mail className="w-3.5 h-3.5 shrink-0 text-[#0066CC]" />
              <span className="font-mono font-bold text-[#0066CC] text-[9.5px] tracking-tight whitespace-nowrap">
                {brand.email}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-black">
            <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: brand.accentColor }} />
            <span className="font-mono font-bold text-black text-[9.5px] whitespace-nowrap">
              {brand.phoneFormatted}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-black">
            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: brand.accentColor }} />
            <span className="font-bold text-[7.8px] text-black tracking-tight leading-tight">
              {brand.address}
            </span>
          </div>
        </div>

        {/* 4. MENTION DE PROPRIÉTÉ SOBRE */}
        <div className="px-4 py-1.5 border-t border-slate-200 mt-1">
          <p className="text-[7.5px] text-black font-semibold leading-tight text-justify">
            {brand.terms}
          </p>
        </div>

        {/* 5. BANDEAU INFÉRIEUR VERSO */}
        <div className="py-2 px-4 w-full flex items-center justify-between shrink-0 bg-slate-50 border-t border-slate-200 text-black">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" style={{ color: brand.accentColor }} />
            <span className="text-[9px] font-bold uppercase tracking-wider text-black">
              Personnel Autorisé
            </span>
          </div>
          <span className="text-[9.5px] font-mono font-extrabold text-black">
            {employee.employeeId}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`badge-container flex flex-col items-center gap-3 ${className}`}>
      {/* Contrôles rapides au-dessus de la carte */}
      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs no-print">
        {!showBothSides && (
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Bascule Recto / Verso"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'Recto' : 'Verso'}</span>
          </button>
        )}

        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          title="Télécharger badge PDF (54mm × 85.6mm)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isDownloading ? '...' : 'PDF'}</span>
        </button>

        <button
          onClick={handleCopyId}
          className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Copier ID"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Rendu des Cartes */}
      {showBothSides ? (
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recto</span>
            {renderRecto(`badge-recto-${employee.id}`)}
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verso</span>
            {renderVerso(`badge-verso-${employee.id}`)}
          </div>
        </div>
      ) : (
        <div>
          {isFlipped ? renderVerso(`badge-verso-${employee.id}`) : renderRecto(`badge-recto-${employee.id}`)}
        </div>
      )}

      <span className="text-[10px] font-mono text-slate-400">
        5.40 cm × 8.56 cm
      </span>
    </div>
  );
});
