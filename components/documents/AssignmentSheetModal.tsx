'use client';

import React, { useMemo, useState } from 'react';
import { Employee } from '@/types/inventory';
import { useInventory } from '@/context/InventoryContext';
import {
  X,
  Printer,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileCheck
} from 'lucide-react';
import {
  buildAssignmentDocRef,
  generateAssignmentSheetHTML,
  getFullPrintHTML,
  printSingleAssignmentSheet
} from '@/lib/printAssignmentSheet';

interface AssignmentSheetModalProps {
  employee: Employee | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export default function AssignmentSheetModal({
  employee,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalCount
}: AssignmentSheetModalProps) {
  const { getAssignmentSheet, downloadAssignmentSheet } = useInventory();
  const [isDownloading, setIsDownloading] = useState(false);

  const sheet = useMemo(() => (employee ? getAssignmentSheet(employee) : null), [employee, getAssignmentSheet]);

  // L'aperçu utilise exactement la même feuille que l'impression.
  const previewHTML = useMemo(() => {
    if (!sheet) return '';
    return getFullPrintHTML(generateAssignmentSheetHTML(sheet.employee, window.location.origin, sheet.options), false);
  }, [sheet]);

  if (!employee || !sheet) return null;

  const docRef = buildAssignmentDocRef(sheet.employee, sheet.options);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadAssignmentSheet(employee);
    } catch (err) {
      console.error('Erreur téléchargement PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl h-[94vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre de contrôle */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileCheck className="w-5 h-5 text-slate-500 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold leading-tight truncate">
                Fiche d&apos;affectation · {employee.fullName}
              </h2>
              <p className="text-[11px] text-slate-500 font-mono truncate">{docRef}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {totalCount && totalCount > 1 && (
              <div className="hidden sm:flex items-center gap-1 mr-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                <button
                  onClick={onPrev}
                  className="p-1 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Collaborateur précédent"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 text-[11px] font-mono">
                  {(currentIndex ?? 0) + 1} / {totalCount}
                </span>
                <button
                  onClick={onNext}
                  className="p-1 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Collaborateur suivant"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              title="Télécharger la fiche au format PDF (A4)"
            >
              {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{isDownloading ? 'Génération...' : 'Télécharger PDF'}</span>
            </button>

            <button
              onClick={() => printSingleAssignmentSheet(sheet.employee, sheet.options)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer active:scale-95"
              title="Imprimer la fiche (A4)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Aperçu A4 */}
        <div className="flex-1 min-h-0 overflow-x-auto bg-slate-200">
          <iframe
            key={docRef + employee.id}
            title={`Aperçu de la fiche d'affectation ${docRef}`}
            srcDoc={previewHTML}
            className="block mx-auto h-full bg-transparent border-0"
            style={{ width: 'calc(210mm + 48px)', maxWidth: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
