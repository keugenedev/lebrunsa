'use client';

import React, { useState } from 'react';
import { PrinterAsset } from '@/types/inventory';
import CompanyLogo from '@/components/common/CompanyLogo';
import {
  X,
  Printer,
  MapPin,
  Check,
  Copy,
  Pencil,
  FileText,
  Network,
  ExternalLink,
  Radio
} from 'lucide-react';

interface PrinterDetailsModalProps {
  printer: PrinterAsset | null;
  onClose: () => void;
  onOpenEdit?: (printer: PrinterAsset) => void;
}

export default function PrinterDetailsModal({
  printer,
  onClose,
  onOpenEdit
}: PrinterDetailsModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!printer) return null;

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {printer.name}
                </h3>
                <span className="font-mono text-xs font-bold text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {printer.assetTag}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {"Fiche détaillée • Parc d'Imprimantes Réseau Lebrun S.A."}
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
          {/* Section 1: Identification Matériel */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Radio className="w-4 h-4 text-slate-500" />
                <span>Identification Imprimante</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                {printer.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Nom & Marque</span>
                <span className="font-semibold text-slate-900 text-xs mt-0.5 block">
                  {printer.brand} • {printer.name}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Modèle Exact</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                  {printer.model}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Type d'impression</span>
                <span className="font-medium text-slate-700 text-xs mt-0.5 block">
                  {printer.type}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Numéro de Série (S/N)</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-bold text-slate-900 select-all">
                    {printer.serialNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('sn', printer.serialNumber)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    title="Copier le numéro de série"
                  >
                    {copiedKey === 'sn' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Réseau & Site */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Network className="w-4 h-4 text-slate-500" />
                <span>Connexion Réseau & Emplacement</span>
              </div>
              <div className="flex items-center gap-2">
                <CompanyLogo company={printer.company} className="h-4 max-w-[70px] w-auto object-contain" />
                <span className="text-[11px] text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{printer.site}</span>
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Adresse IP Réseau</span>
                <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block select-all">
                  {printer.ipAddress && printer.ipAddress !== 'N/A' ? printer.ipAddress : <span className="text-slate-400 italic">Non connectée au réseau (USB/Local)</span>}
                </span>
              </div>
              {printer.ipAddress && printer.ipAddress !== 'N/A' && (
                <a
                  href={`http://${printer.ipAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>Interface Web</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Section 3: Observations / Remarques remplies */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Observations & Notes Remplies</span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-800 leading-relaxed font-medium">
              {printer.observations ? (
                <span>{printer.observations}</span>
              ) : (
                <span className="text-slate-400 italic">Aucune observation particulière enregistrée.</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => handleCopy('tag', printer.assetTag)}
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
                  onOpenEdit(printer);
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
