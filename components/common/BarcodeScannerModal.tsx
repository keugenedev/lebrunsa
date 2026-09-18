'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  Barcode as BarcodeIcon, 
  X, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Eye, 
  Building, 
  MapPin, 
  Check, 
  Volume2 
} from 'lucide-react';
import Barcode from './Barcode';

interface ScannedItem {
  type: 'printer' | 'employee' | 'it';
  id: string;
  title: string;
  subtitle: string;
  serialNumber: string;
  company: string;
  location: string;
  status: string;
  raw: any;
}

// Son de bip scanner authentique via Web Audio API
function playScanBeep(success = true) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (success) {
      osc.frequency.setValueAtTime(1760, ctx.currentTime); // High pitch crisp POS beep
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // AudioContext blocked or not supported
  }
}

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BarcodeScannerModal({ isOpen, onClose }: BarcodeScannerModalProps) {
  const { itAssets, printers, employees, openQRModal } = useInventory();
  const [scanInput, setScanInput] = useState('');
  const [lastScanned, setLastScanned] = useState<ScannedItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScannedItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const processBarcode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    // 1. Chercher dans les 16 imprimantes HP
    const foundPrinter = printers.find(p => 
      (p.serialNumber && p.serialNumber.toUpperCase() === cleanCode) ||
      (p.assetTag && p.assetTag.toUpperCase() === cleanCode) ||
      p.id.toUpperCase() === cleanCode ||
      p.name.toUpperCase().includes(cleanCode) ||
      (p.ipAddress && p.ipAddress === cleanCode)
    );

    if (foundPrinter) {
      playScanBeep(true);
      const match: ScannedItem = {
        type: 'printer',
        id: foundPrinter.id,
        title: foundPrinter.name,
        subtitle: `${foundPrinter.brand} ${foundPrinter.model} • IP: ${foundPrinter.ipAddress}`,
        serialNumber: foundPrinter.serialNumber || foundPrinter.assetTag,
        company: foundPrinter.company || 'Lebrun S.A.',
        location: foundPrinter.site || 'Delmas 52',
        status: foundPrinter.status || 'Fonctionnel',
        raw: foundPrinter
      };
      setLastScanned(match);
      setErrorMessage(null);
      setScanHistory(prev => [match, ...prev.filter(x => x.id !== match.id)].slice(0, 5));
      setScanInput('');
      return;
    }

    // 2. Chercher dans les postes IT Dell
    const foundIT = itAssets.find((item: any) => 
      (item.serialNumber && item.serialNumber.toUpperCase() === cleanCode) ||
      (item.assetTag && item.assetTag.toUpperCase() === cleanCode) ||
      item.id.toUpperCase() === cleanCode ||
      item.name.toUpperCase().includes(cleanCode)
    );

    if (foundIT) {
      playScanBeep(true);
      const match: ScannedItem = {
        type: 'it',
        id: foundIT.id,
        title: foundIT.name,
        subtitle: foundIT.model || foundIT.brand || 'Poste Dell OptiPlex',
        serialNumber: foundIT.serialNumber || foundIT.assetTag,
        company: (foundIT as any).company || 'Lebrun S.A.',
        location: foundIT.location || 'Delmas 52',
        status: foundIT.status || 'in_use',
        raw: foundIT
      };
      setLastScanned(match);
      setErrorMessage(null);
      setScanHistory(prev => [match, ...prev.filter(x => x.id !== match.id)].slice(0, 5));
      setScanInput('');
      return;
    }

    // 2. Chercher dans le personnel / postes Dell
    const foundEmp = employees.find(emp => 
      (emp.employeeId && emp.employeeId.toUpperCase() === cleanCode) ||
      (emp.workstation?.pcSerial && emp.workstation.pcSerial.toUpperCase() === cleanCode) ||
      (emp.workstation?.pcName && emp.workstation.pcName.toUpperCase() === cleanCode) ||
      emp.fullName.toUpperCase().includes(cleanCode)
    );

    if (foundEmp) {
      playScanBeep(true);
      const match: ScannedItem = {
        type: 'employee',
        id: foundEmp.id,
        title: `${foundEmp.fullName} (${foundEmp.workstation?.pcName || 'Poste Dell'})`,
        subtitle: `${foundEmp.jobTitle} • ${foundEmp.department}`,
        serialNumber: foundEmp.workstation?.pcSerial || foundEmp.employeeId,
        company: foundEmp.company || 'Lebrun S.A.',
        location: foundEmp.site || foundEmp.location || 'Delmas 52',
        status: 'in_use',
        raw: foundEmp
      };
      setLastScanned(match);
      setErrorMessage(null);
      setScanHistory(prev => [match, ...prev.filter(x => x.id !== match.id)].slice(0, 5));
      setScanInput('');
      return;
    }

    // Non trouvé
    playScanBeep(false);
    setErrorMessage(`Aucun matériel trouvé pour le code-barres "${code}". Vérifiez la base Supabase ou enregistrez ce matériel.`);
    setScanInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processBarcode(scanInput);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <BarcodeIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Station de Lecture Code-Barres</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Prêt pour scan
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Scannez une étiquette avec votre douchette ou saisissez un numéro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Barcode Scanner Field */}
        <div className="mt-5 space-y-2">
          <label className="block text-[11px] font-medium text-slate-700">
            Champ de saisie / Réception automatique douchette
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <BarcodeIcon className="w-4 h-4 text-red-600" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Visez avec le scanner ou tapez un S/N (ex: CNB1K29971, DELL-7090-01) puis Entrée..."
              className="w-full pl-9 pr-24 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono transition-colors"
            />
            <button
              type="button"
              onClick={() => processBarcode(scanInput)}
              className="absolute inset-y-1 right-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Valider</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-0.5">
            <Volume2 className="w-3 h-3 text-slate-400" />
            <span>Le scanner émet un signal sonore positif lors d&apos;une lecture reconnue.</span>
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-slate-100 border border-slate-300 flex items-start gap-2.5 text-xs text-slate-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-slate-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Code non reconnu</p>
              <p className="text-[11px] text-slate-600">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Last Scanned Result Card */}
        {lastScanned && (
          <div className="mt-5 p-4 rounded-xl bg-white border border-slate-300 shadow-sm space-y-3 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    Matériel Identifié avec Succès
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{lastScanned.title}</h4>
                </div>
              </div>
              <span className="font-mono text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                {lastScanned.serialNumber}
              </span>
            </div>

            {/* Barcode representation */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80">
              <div className="space-y-1 text-[11px] text-slate-600 font-mono">
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  <strong>Société :</strong> {lastScanned.company}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <strong>Site :</strong> {lastScanned.location}
                </div>
              </div>
              <Barcode 
                value={lastScanned.serialNumber} 
                width={1.2} 
                height={38} 
                fontSize={10} 
                displayValue={true} 
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                onClick={() => {
                  onClose();
                  openQRModal({
                    id: lastScanned.id,
                    assetTag: lastScanned.serialNumber,
                    name: lastScanned.title,
                    category: 'it',
                    location: lastScanned.location,
                    company: lastScanned.company,
                    status: 'in_use' as any
                  } as any);
                }}
                className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer Étiquette Code-Barres</span>
              </button>
            </div>
          </div>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <div className="mt-5 pt-3 border-t border-slate-100">
            <h5 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Historique récent des scans
            </h5>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {scanHistory.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-2 rounded-lg bg-slate-50/70 border border-slate-200/70 flex items-center justify-between text-xs hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BarcodeIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-800 text-[11px]">{item.title}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-600">{item.serialNumber}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
