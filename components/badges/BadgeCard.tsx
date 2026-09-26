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
  User
} from 'lucide-react';
import { downloadSingleBadgeCR80PDF } from '@/lib/printBadgePDF';
import { formatNif } from '@/lib/formatNif';

interface BadgeCardProps {
  employee: Employee;
  brandOverride?: BrandConfig;
  showBothSides?: boolean;
  className?: string;
}

export default function BadgeCard({
  employee,
  brandOverride,
  showBothSides = false,
  className = ''
}: BadgeCardProps) {
  const brand = brandOverride || getBrandConfig(employee.company);
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // QR Code vCard au verso
  useEffect(() => {
    let isMounted = true;
    const vCardData = buildVCardString(employee, brand);

    QRCode.toDataURL(vCardData, {
      width: 240,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then((url) => {
        if (isMounted) setQrCodeUrl(url);
      })
      .catch((err) => {
        console.error('Erreur QR Code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [employee, brand]);

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
  const renderRecto = (refId?: string) => (
    <div
      id={refId}
      className="badge-front font-montserrat relative w-[288px] h-[456.5px] rounded-2xl overflow-hidden select-none flex flex-col justify-between shadow-lg"
      style={{
        backgroundColor: brand.bgPrimary,
        color: '#ffffff'
      }}
    >
      {/* MENTION VERTICALE DROITE : GROUPE SANGUIN (Avancé près du cadre, descendu, sans trace - Uniquement si renseigné) */}
      {employee.bloodGroup ? (
        <div 
          className="absolute pointer-events-none select-none z-10 flex items-center gap-1.5 text-[8.5px] font-bold tracking-wider uppercase text-white/75 whitespace-nowrap"
          style={{
            left: '238px',
            top: '248px',
            transformOrigin: '0 0',
            transform: 'rotate(-90deg)'
          }}
        >
          <span>GROUPE SANGUIN :</span>
          <span className="font-mono text-white font-bold tracking-normal">
            {employee.bloodGroup}
          </span>
        </div>
      ) : null}

      {/* 1. EN-TÊTE : Logo seul dans un rectangle blanc contrasté */}
      <div className="pt-5 px-5 flex items-center justify-center shrink-0">
        <div className="bg-white px-4 py-1.5 rounded-xl shadow-xs flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.logo}
            alt={brand.displayName}
            className="h-8 max-w-[160px] w-auto object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== brand.fallbackLogo) target.src = brand.fallbackLogo;
            }}
          />
        </div>
      </div>

      {/* 2. CADRE PHOTO CENTRAL (Photo réelle si disponible, sinon silhouette sobre) */}
      <div className="px-6 my-auto flex flex-col items-center justify-center">
        <div
          className="w-44 h-48 rounded-[28px] overflow-hidden flex items-center justify-center relative shadow-sm"
          style={{ backgroundColor: brand.accentColor }}
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
            /* Silhouette humaine épurée sobre */
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: brand.bgPrimary }}
            >
              <User className="w-14 h-14" style={{ color: brand.accentColor }} />
            </div>
          )}
        </div>
      </div>

      {/* 3. NOM, NIF, FILET & TITRE DU POSTE */}
      <div className="px-4 text-center mb-3">
        {/* Nom en majuscules grasses blanches */}
        <h2 className="text-lg font-extrabold uppercase tracking-wide text-white leading-tight truncate">
          {employee.fullName}
        </h2>

        {/* NIF directement après le nom (uniquement si présent dans la table, formaté en 000-000-000-0) */}
        {employee.nif && employee.nif.trim() ? (
          <p className="text-[10px] font-mono tracking-wider text-white/85 mt-0.5 uppercase truncate">
            NIF : <span className="font-semibold text-white">{formatNif(employee.nif)}</span>
          </p>
        ) : null}

        {/* Ligne horizontale sous le nom (couleur du brand) */}
        <div className="flex justify-center my-1.5">
          <div 
            className="w-16 h-[2.5px] rounded-full"
            style={{ backgroundColor: brand.lineColor }}
          />
        </div>

        {/* Poste / Rôle en majuscules épurées */}
        <p className="text-xs font-semibold uppercase tracking-wider text-white/90 truncate">
          {employee.jobTitle || 'COLLABORATEUR'}
        </p>
      </div>

      {/* 4. BANDEAU INFÉRIEUR : Fond couleur brand, ID & Code-barres direct */}
      <div 
        className="pt-2 pb-2 px-4 w-full flex flex-col items-center justify-center shrink-0"
        style={{
          backgroundColor: brand.footerBg,
          color: brand.footerText
        }}
      >
        <span 
          className="text-xs font-bold tracking-widest font-mono uppercase mb-1"
          style={{ color: brand.footerText }}
        >
          ID {employee.employeeId}
        </span>

        {/* Code-barres direct sur le fond de couleur (comme le modèle) */}
        <div className="w-full flex items-center justify-center">
          <Barcode
            value={employee.employeeId}
            width={1.4}
            height={38}
            fontSize={9}
            displayValue={false}
            background={brand.footerBg}
            lineColor="#000000"
          />
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // VERSO : Simple, sobre, officiel (Caribe Motors & Coordonnées)
  // -------------------------------------------------------------
  const renderVerso = (refId?: string) => (
    <div
      id={refId}
      className="badge-back font-montserrat relative w-[288px] h-[456.5px] rounded-2xl overflow-hidden select-none flex flex-col justify-between shadow-lg"
      style={{
        backgroundColor: brand.bgPrimary,
        color: '#ffffff'
      }}
    >
      {/* 1. EN-TÊTE VERSO : Logo seul dans un rectangle blanc */}
      <div className="pt-5 px-5 flex items-center justify-center shrink-0">
        <div className="bg-white px-3.5 py-1.5 rounded-lg shadow-xs flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.logo}
            alt={brand.displayName}
            className="h-6 max-w-[140px] w-auto object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== brand.fallbackLogo) target.src = brand.fallbackLogo;
            }}
          />
        </div>
      </div>

      {/* 2. CENTRE : QR CODE SYSTÈME SCANNABLE */}
      <div className="px-6 my-auto flex flex-col items-center justify-center text-center">
        <div className="bg-white p-2.5 rounded-xl shadow-sm mb-2">
          {qrCodeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={qrCodeUrl} 
              alt="QR Code Système" 
              className="w-28 h-28 object-contain block"
            />
          ) : (
            <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
              Chargement...
            </div>
          )}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wider text-white">
          Scan Système & Fiche Collaborateur
        </p>
      </div>

      {/* 3. COORDONNÉES OFFICIELLES EXIGÉES POUR CARIBE MOTORS */}
      <div className="px-6 space-y-1.5 text-[10.5px]">
        <div className="flex items-center gap-2 text-white">
          <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: brand.accentColor }} />
          <span className="font-medium">{brand.website}</span>
        </div>

        <div className="flex items-center gap-2 text-white">
          <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: brand.accentColor }} />
          <span className="font-medium">{brand.email}</span>
        </div>

        <div className="flex items-center gap-2 text-white">
          <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: brand.accentColor }} />
          <span className="font-bold font-mono">{brand.phoneFormatted}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300 text-[9.5px]">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{brand.address}</span>
        </div>
      </div>

      {/* 4. MENTION DE PROPRIÉTÉ SOBRE */}
      <div className="px-6 py-2">
        <p className="text-[8px] text-slate-400 leading-tight text-justify">
          {brand.terms}
        </p>
      </div>

      {/* 5. BANDEAU INFÉRIEUR VERSO */}
      <div 
        className="py-2 px-4 w-full flex items-center justify-between shrink-0"
        style={{
          backgroundColor: brand.footerBg,
          color: brand.footerText
        }}
      >
        <span 
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: brand.footerText }}
        >
          Personnel Autorisé
        </span>
        <span 
          className="text-[10px] font-mono font-bold"
          style={{ color: brand.footerText }}
        >
          {employee.employeeId}
        </span>
      </div>
    </div>
  );

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
}
