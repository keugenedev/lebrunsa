'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DotLottieReact, setWasmUrl } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-react';
import { CheckCircle2 } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';

// Le moteur d'animation est servi depuis /public : rien n'est téléchargé depuis un CDN externe.
// (Si le paquet @lottiefiles/dotlottie-react est mis à jour, recopier son fichier dotlottie-player.wasm.)
setWasmUrl('/animations/dotlottie-player.wasm');

const ANIMATION_SRC = '/animations/success.json';

/**
 * Coche animée (Lottie). Tant que l'animation n'est pas prête, une coche fixe est affichée
 * à la même place : l'icône est donc toujours visible.
 */
function AnimatedCheck() {
  const [ready, setReady] = useState(false);

  const attach = useCallback((dl: DotLottie | null) => {
    if (!dl) return;
    if (dl.isLoaded) setReady(true);
    dl.addEventListener('load', () => setReady(true));
  }, []);

  return (
    <div className="relative w-28 h-28 mx-auto">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckCircle2 className="w-20 h-20 text-emerald-500" strokeWidth={1.75} />
        </div>
      )}
      <div className={`w-full h-full ${ready ? 'opacity-100' : 'opacity-0'}`}>
        <DotLottieReact src={ANIMATION_SRC} autoplay loop={false} dotLottieRefCallback={attach} />
      </div>
    </div>
  );
}

/**
 * Confirmation affichée seule (sans texte) au centre de l'écran après chaque ajout,
 * modification ou suppression réussi. Elle disparaît toute seule ; un clic la ferme
 * et elle ne bloque jamais la page.
 */
export default function SuccessAnimation() {
  const { insertSuccess, dismissInsertSuccess } = useInventory();

  // Préchargement : l'animation démarre sans attente au moment du premier ajout
  useEffect(() => {
    void fetch('/animations/dotlottie-player.wasm').catch(() => {});
    void fetch(ANIMATION_SRC).catch(() => {});
  }, []);

  if (!insertSuccess || typeof document === 'undefined') return null;

  // Affichée dans <body> : au-dessus de tout, exactement au centre de la fenêtre
  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-900/20 pointer-events-none px-4">
      <div
        key={insertSuccess.id}
        role="status"
        aria-live="polite"
        onClick={dismissInsertSuccess}
        aria-label="Opération réussie"
        className="pointer-events-auto cursor-pointer bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200"
      >
        <AnimatedCheck />
      </div>
    </div>,
    document.body
  );
}
