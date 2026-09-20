'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { DotLottieReact, setWasmUrl } from '@lottiefiles/dotlottie-react';
import { X } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';

// Le moteur WASM est servi depuis /public (pas de CDN externe).
setWasmUrl('/animations/dotlottie-player.wasm');

const ANIMATION_SRC = '/animations/success2.lottie';

export default function SuccessAnimation() {
  const { insertSuccess, dismissInsertSuccess } = useInventory();

  if (!insertSuccess || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center px-4 pointer-events-none">
      {/* Fond flouté cliquable pour fermer */}
      <div
        className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px] pointer-events-auto"
        onClick={dismissInsertSuccess}
      />

      {/* Card */}
      <div
        key={insertSuccess.id}
        role="status"
        aria-live="polite"
        aria-label="Opération réussie"
        className={[
          'relative z-10 pointer-events-auto',
          'w-full max-w-[320px]',
          'bg-white rounded-2xl shadow-2xl shadow-slate-900/15',
          'border border-slate-100',
          'px-6 pt-7 pb-6',
          'flex flex-col items-center gap-3',
          'animate-in fade-in zoom-in-90 duration-250 ease-out',
        ].join(' ')}
      >
        {/* Bouton fermer */}
        <button
          onClick={dismissInsertSuccess}
          aria-label="Fermer"
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animation Lottie */}
        <div className="w-64 h-64">
          <DotLottieReact
            src={ANIMATION_SRC}
            autoplay
            speed={0.6}
          />
        </div>

        {/* Textes */}
        <div className="text-center space-y-1">
          <p className="text-[15px] font-semibold text-slate-900 tracking-tight">
            Opération réussie !
          </p>
          <p className="text-[11px] text-slate-500">
            Les données ont été enregistrées avec succès.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
