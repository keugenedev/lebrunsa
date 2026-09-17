'use client';

import React, { useRef, useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import Barcode from './Barcode';
import { 
  Barcode as BarcodeIcon, 
  X, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  Tag, 
  Building, 
  MapPin 
} from 'lucide-react';

export default function BarcodeModal() {
  const { isQRModalOpen, qrTargetAsset, closeQRModal } = useInventory();
  const [copied, setCopied] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  if (!isQRModalOpen || !qrTargetAsset) return null;

  const barcodeValue = qrTargetAsset.assetTag || qrTargetAsset.id || 'LEBRUN-001';

  const handleCopyTag = () => {
    navigator.clipboard.writeText(barcodeValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-6 relative">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-black">
              <BarcodeIcon className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Étiquette Code-Barres</h3>
              <p className="text-[11px] text-slate-500">Traçabilité & identification matérielle certifiée</p>
            </div>
          </div>
          <button
            onClick={closeQRModal}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-black transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Printable Physical Barcode Badge */}
        <div 
          ref={badgeRef}
          className="mt-4 p-5 bg-white text-slate-900 rounded-xl shadow-xs border border-slate-300/80 flex flex-col items-center select-none"
        >
          {/* Header Badge */}
          <div className="w-full flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/lebrun.png" alt="Lebrun S.A." className="h-6 w-auto object-contain" />
              <span className="text-xs font-bold tracking-tight uppercase text-slate-900">
                {(qrTargetAsset as any).company || 'LEBRUN S.A.'}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-slate-900 select-all">
              {barcodeValue}
            </span>
          </div>

          {/* Genuine Code 128 Barcode for Laser / CCD Scanners */}
          <div className="my-3 p-3 bg-white rounded-lg border border-slate-200 shadow-2xs w-full flex flex-col items-center">
            <Barcode 
              value={barcodeValue} 
              width={1.6} 
              height={56} 
              fontSize={12} 
              displayValue={true} 
            />
          </div>

          {/* Asset Info Card */}
          <div className="w-full bg-slate-50/80 rounded-lg p-2.5 border border-slate-200/80 space-y-1 text-center">
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{qrTargetAsset.name}</h4>
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-600 font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {qrTargetAsset.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-400" />
                {(qrTargetAsset as any).company || 'Lebrun S.A.'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={handleCopyTag}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copier code</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-medium transition-all shadow-sm hover:shadow-md hover:shadow-red-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer étiquette</span>
          </button>
        </div>
      </div>
    </div>
  );
}
