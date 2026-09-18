'use client';

import React, { useState } from 'react';
import { NetworkAsset } from '@/types/inventory';
import CompanyLogo from '@/components/common/CompanyLogo';
import {
  X,
  Network,
  Wifi,
  MapPin,
  Check,
  Copy,
  Pencil,
  FileText,
  Radio,
  Globe
} from 'lucide-react';

interface NetworkDetailsModalProps {
  asset: NetworkAsset | null;
  onClose: () => void;
  onOpenEdit?: (asset: NetworkAsset) => void;
}

export default function NetworkDetailsModal({
  asset,
  onClose,
  onOpenEdit
}: NetworkDetailsModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!asset) return null;

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isSwitch = asset.deviceType.toLowerCase().includes('switch');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
              {isSwitch ? <Network className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {asset.model || asset.deviceType}
                </h3>
                <span className="font-mono text-xs font-bold text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {asset.assetTag}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Fiche détaillée • Infrastructure Réseau Lebrun S.A.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Section 1: Informations Générales */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Radio className="w-4 h-4 text-slate-500" />
                <span>Identification Matériel</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                {asset.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Type d'Équipement</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                  {asset.deviceType}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Marque & Modèle</span>
                <span className="font-semibold text-slate-900 text-xs mt-0.5 block">
                  {asset.brand} • <strong className="text-slate-900">{asset.model}</strong>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Numéro de Série (S/N)</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-bold text-slate-900 select-all">
                    {asset.serialNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('sn', asset.serialNumber)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    title="Copier le numéro de série"
                  >
                    {copiedKey === 'sn' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Nom d'hôte / Hostname</span>
                <span className="font-mono text-slate-800 text-xs mt-0.5 block">
                  {asset.hostname || <span className="text-slate-400 italic">Non configuré</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Localisation & Configuration Réseau */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Globe className="w-4 h-4 text-slate-500" />
                <span>Site & Paramètres Réseau</span>
              </div>
              <div className="flex items-center gap-2">
                <CompanyLogo company={asset.company} className="h-4 max-w-[75px] w-auto object-contain" />
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{asset.site}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Adresse IP</span>
                <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block select-all">
                  {asset.ipAddress && asset.ipAddress !== 'À compléter' ? asset.ipAddress : <span className="text-slate-400 italic">Non assignée</span>}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Adresse MAC</span>
                <span className="font-mono font-semibold text-slate-700 text-xs mt-0.5 block select-all">
                  {asset.macAddress && asset.macAddress !== 'À compléter' ? asset.macAddress : <span className="text-slate-400 italic">Non renseignée</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Spécifications & Observations complètes remplies */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Spécifications & Observations Remplies</span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-800 leading-relaxed font-medium">
              {asset.observations ? (
                <span>{asset.observations}</span>
              ) : (
                <span className="text-slate-400 italic">Aucune observation enregistrée.</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => handleCopy('tag', asset.assetTag)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedKey === 'tag' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedKey === 'tag' ? 'Copié !' : 'Copier Tag'}</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEdit(asset);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Modifier</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
