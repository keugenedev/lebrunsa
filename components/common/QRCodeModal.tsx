'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';
import QRCode from 'qrcode';
import { 
  QrCode, 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck 
} from 'lucide-react';

export default function QRCodeModal() {
  const { isQRModalOpen, qrTargetAsset, closeQRModal } = useInventory();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qrTargetAsset) {
      const payload = JSON.stringify({
        company: 'LEBRONSA S.A.',
        tag: qrTargetAsset.assetTag,
        name: qrTargetAsset.name,
        category: qrTargetAsset.category,
        location: qrTargetAsset.location,
        url: `https://inventory.lebronsa.com/asset/${qrTargetAsset.assetTag}`
      });

      QRCode.toDataURL(payload, {
        width: 240,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [qrTargetAsset]);

  if (!isQRModalOpen || !qrTargetAsset) return null;

  const handleCopyTag = () => {
    navigator.clipboard.writeText(qrTargetAsset.assetTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `LEBRONSA_QR_${qrTargetAsset.assetTag}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="lebron-card w-full max-w-md bg-white border border-slate-200 shadow-2xl p-6 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Étiquette & QR Code Lebronsa S.A.</h3>
              <p className="text-[10px] text-slate-500">Identification physique et traçabilité industrielle</p>
            </div>
          </div>
          <button
            onClick={closeQRModal}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Physical Asset Badge */}
        <div 
          ref={badgeRef}
          className="mt-5 p-5 bg-white text-slate-900 rounded-2xl shadow-md border-2 border-slate-300 flex flex-col items-center select-none"
        >
          <div className="w-full flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Lebrunog.png" alt="Lebronsa" className="h-6 w-auto object-contain" />
              <span className="text-[11px] font-extrabold tracking-tight uppercase text-red-600">
                LEBRONSA S.A.
              </span>
            </div>
            <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300 text-slate-900">
              {qrTargetAsset.assetTag}
            </span>
          </div>

          {/* QR Code image */}
          <div className="my-3 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={qrDataUrl} 
                alt="Asset QR Code" 
                className="w-44 h-44 object-contain"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                Génération...
              </div>
            )}
          </div>

          {/* Asset Name & Details */}
          <div className="text-center w-full">
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{qrTargetAsset.name}</h4>
            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-center gap-2 font-mono">
              <span>{qrTargetAsset.location}</span>
              <span>•</span>
              <span className="capitalize">{qrTargetAsset.category}</span>
            </div>
          </div>

          {/* Industrial barcode lines */}
          <div className="w-full mt-3 pt-2.5 border-t border-dashed border-slate-300 flex flex-col items-center">
            <div className="h-6 w-48 flex items-stretch justify-between gap-[2px]">
              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 3, 2].map((w, i) => (
                <span 
                  key={i} 
                  className="bg-slate-900" 
                  style={{ width: `${w * 1.5}px` }} 
                />
              ))}
            </div>
            <span className="text-[9px] font-mono tracking-widest text-slate-600 mt-1 font-semibold">
              *{qrTargetAsset.assetTag}*
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <button
            onClick={handleCopyTag}
            className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié !' : 'Copier Tag'}</span>
          </button>

          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-medium text-white shadow-xs transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
