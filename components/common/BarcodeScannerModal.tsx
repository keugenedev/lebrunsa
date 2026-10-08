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
  Building, 
  MapPin, 
  Volume2,
  Laptop,
  KeyRound,
  IdCard,
  Layers,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Droplets,
  Eye,
  EyeOff,
  Cpu,
  Monitor
} from 'lucide-react';
import Barcode from './Barcode';
import { downloadSingleBadgeCR80PDF, downloadBadgePlancheA4PDF } from '@/lib/printBadgePDF';

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
  linkedEmployee?: any;
  linkedITAsset?: any;
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
      osc.frequency.setValueAtTime(1760, ctx.currentTime);
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
  const { itAssets, printers, employees, openQRModal, applicationAccounts, scannerInitialCode } = useInventory();
  const [scanInput, setScanInput] = useState('');
  const [lastScanned, setLastScanned] = useState<ScannedItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens ou auto-scan initial code
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (scannerInitialCode) {
        processBarcode(scannerInitialCode);
      } else {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen, scannerInitialCode]);

  if (!isOpen) return null;

  const processBarcode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    const matchStr = (val?: string) => Boolean(val && val.trim().toUpperCase() === cleanCode);

    // 1. Chercher dans les imprimantes HP
    const foundPrinter = printers.find(p => 
      matchStr(p.assetTag) ||
      matchStr(p.serialNumber) ||
      matchStr(p.id) ||
      matchStr(p.ipAddress) ||
      (cleanCode.length >= 6 && p.name && p.name.toUpperCase() === cleanCode)
    );

    if (foundPrinter) {
      playScanBeep(true);
      const match: ScannedItem = {
        type: 'printer',
        id: foundPrinter.id,
        title: foundPrinter.name,
        subtitle: `${foundPrinter.brand} ${foundPrinter.model} • IP: ${foundPrinter.ipAddress || 'Non assignée'}`,
        serialNumber: foundPrinter.assetTag || foundPrinter.serialNumber,
        company: foundPrinter.company || 'Lebrun S.A.',
        location: foundPrinter.site || 'Delmas 52',
        status: foundPrinter.status || 'Fonctionnel',
        raw: foundPrinter
      };
      setLastScanned(match);
      setErrorMessage(null);
      setScanInput('');
      return;
    }

    // 2. Chercher dans les postes IT
    const foundIT = itAssets.find((item: any) => 
      matchStr(item.assetTag) ||
      matchStr(item.serialNumber) ||
      matchStr(item.id) ||
      matchStr(item.raw?.equipment_id) ||
      matchStr(item.workstation?.pcSerial) ||
      matchStr(item.workstation?.pcName) ||
      (cleanCode.length >= 4 && item.serialNumber && item.serialNumber.toUpperCase() === cleanCode) ||
      (cleanCode.length >= 6 && item.name && item.name.toUpperCase() === cleanCode)
    );

    if (foundIT) {
      playScanBeep(true);
      // Trouver le collaborateur lié de manière exhaustive
      const linkedEmp = employees.find(emp => 
        (foundIT.assignedPersonnelId && (
          emp.id === foundIT.assignedPersonnelId || 
          emp.employeeId === foundIT.assignedPersonnelId ||
          (emp.employeeId && emp.employeeId.toUpperCase() === String(foundIT.assignedPersonnelId).toUpperCase()) ||
          (emp.id && emp.id.toUpperCase() === String(foundIT.assignedPersonnelId).toUpperCase())
        )) ||
        (foundIT.assignedTo && emp.fullName && emp.fullName.trim().toLowerCase() === foundIT.assignedTo.trim().toLowerCase()) ||
        (foundIT.assignedTo && emp.firstName && emp.lastName && foundIT.assignedTo.toLowerCase().includes(emp.firstName.toLowerCase()) && foundIT.assignedTo.toLowerCase().includes(emp.lastName.toLowerCase())) ||
        (emp.workstation?.pcSerial && foundIT.serialNumber && emp.workstation.pcSerial.toUpperCase() === foundIT.serialNumber.toUpperCase()) ||
        (emp.workstation?.pcName && foundIT.name && emp.workstation.pcName.toUpperCase() === foundIT.name.toUpperCase())
      );

      const match: ScannedItem = {
        type: 'it',
        id: foundIT.id,
        title: foundIT.name || `Poste ${foundIT.brand} ${foundIT.model}`,
        subtitle: `${foundIT.brand || 'Dell'} ${foundIT.model || 'OptiPlex'} • ${foundIT.os || foundIT.workstation?.pcSpecs || ''}`,
        serialNumber: foundIT.assetTag || foundIT.serialNumber,
        company: foundIT.company || linkedEmp?.company || 'Lebrun S.A.',
        location: foundIT.location || linkedEmp?.site || linkedEmp?.location || 'Delmas 52',
        status: foundIT.status || 'in_use',
        raw: foundIT,
        linkedEmployee: linkedEmp
      };
      setLastScanned(match);
      setErrorMessage(null);
      setScanInput('');
      return;
    }

    // 3. Chercher dans les collaborateurs
    const foundEmp = employees.find(emp => 
      matchStr(emp.employeeId) ||
      matchStr(emp.id) ||
      matchStr(emp.workstation?.pcSerial) ||
      matchStr(emp.workstation?.pcName) ||
      (cleanCode.length >= 4 && emp.fullName && emp.fullName.trim().toUpperCase() === cleanCode) ||
      (emp.email && emp.email.trim().toUpperCase() === cleanCode)
    );

    if (foundEmp) {
      playScanBeep(true);
      // Trouver le poste IT lié dans le parc itAssets
      const linkedIT = itAssets.find((it: any) => 
        (it.assignedPersonnelId && (
          it.assignedPersonnelId === foundEmp.id || 
          it.assignedPersonnelId === foundEmp.employeeId ||
          (foundEmp.employeeId && String(it.assignedPersonnelId).toUpperCase() === foundEmp.employeeId.toUpperCase()) ||
          (foundEmp.id && String(it.assignedPersonnelId).toUpperCase() === foundEmp.id.toUpperCase())
        )) ||
        (it.assignedTo && foundEmp.fullName && it.assignedTo.trim().toLowerCase() === foundEmp.fullName.trim().toLowerCase()) ||
        (it.assignedTo && foundEmp.firstName && foundEmp.lastName && it.assignedTo.toLowerCase().includes(foundEmp.firstName.toLowerCase()) && it.assignedTo.toLowerCase().includes(foundEmp.lastName.toLowerCase())) ||
        (foundEmp.workstation?.pcSerial && it.serialNumber && it.serialNumber.toUpperCase() === foundEmp.workstation.pcSerial.toUpperCase()) ||
        (foundEmp.workstation?.pcName && it.name && it.name.toUpperCase() === foundEmp.workstation.pcName.toUpperCase())
      );

      const match: ScannedItem = {
        type: 'employee',
        id: foundEmp.id,
        title: foundEmp.fullName,
        subtitle: `${foundEmp.jobTitle || ''}${foundEmp.department ? ` • ${foundEmp.department}` : ''}`,
        serialNumber: foundEmp.employeeId,
        company: foundEmp.company || 'Lebrun S.A.',
        location: foundEmp.site || foundEmp.location || 'Delmas 52',
        status: foundEmp.status || 'active',
        raw: foundEmp,
        linkedITAsset: linkedIT
      };
      setLastScanned(match);
      setErrorMessage(null);
      setScanInput('');
      return;
    }

    // 4. Recherche partielle sécurisée (longueur >= 4)
    if (cleanCode.length >= 4) {
      const partialEmp = employees.find(emp => 
        emp.fullName.toUpperCase().includes(cleanCode) ||
        (emp.email && emp.email.toUpperCase().includes(cleanCode))
      );
      if (partialEmp) {
        processBarcode(partialEmp.employeeId);
        return;
      }

      const partialIT = itAssets.find((it: any) => 
        (it.name && it.name.toUpperCase().includes(cleanCode)) ||
        (it.serialNumber && it.serialNumber.toUpperCase().includes(cleanCode)) ||
        (it.assetTag && it.assetTag.toUpperCase().includes(cleanCode))
      );
      if (partialIT) {
        processBarcode(partialIT.assetTag || partialIT.serialNumber);
        return;
      }
    }

    // Non trouvé
    playScanBeep(false);
    setErrorMessage(`Aucun matériel ou collaborateur trouvé pour le code "${code}". Vérifiez le code-barres ou l'identifiant.`);
    setScanInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processBarcode(scanInput);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl lg:max-w-5xl bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-5 sm:p-6 relative max-h-[92vh] flex flex-col">
        
        {/* Header Rectangulaire Moderne */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BarcodeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Station de Lecture Code-Barres</h3>
                <span className="text-xs text-emerald-600 font-semibold">• Prêt pour scan</span>
              </div>
              <p className="text-[11px] text-slate-500">Scannez une étiquette de poste (AST-...), un badge collaborateur (EMP-...) ou un S/N</p>
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
        <div className="mt-4 space-y-1.5 shrink-0">
          <label className="block text-[11px] font-medium text-slate-700">
            Champ de saisie / Réception automatique douchette
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <BarcodeIcon className="w-4 h-4 text-slate-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Visez avec le scanner ou tapez un tag (ex: AST-CRB-001, EMP-CRB-445, 5CD2124TSG)..."
              className="w-full pl-9 pr-24 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-slate-700 focus:ring-1 focus:ring-slate-700 font-mono transition-colors"
            />
            <button
              type="button"
              onClick={() => processBarcode(scanInput)}
              className="absolute inset-y-1 right-1 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
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
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-900 animate-in fade-in shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-red-900">Code non reconnu</p>
              <p className="text-[11px] text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Last Scanned Result Card */}
        {lastScanned && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50/60 border border-slate-200/90 shadow-2xs animate-in fade-in overflow-y-auto flex-1">
            
            {/* ========================================================================= */}
            {/* CAS 1 : SCAN D'UN COLLABORATEUR (BADGE EMP-...) */}
            {/* ========================================================================= */}
            {lastScanned.type === 'employee' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                
                {/* COLONNE GAUCHE : IDENTIFICATION SALARIÉ & COORDONNÉES */}
                <div className="space-y-3.5 flex flex-col justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div>
                    {/* En-tête Collaborateur */}
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 shadow-2xs">
                          {lastScanned.raw.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={lastScanned.raw.photoUrl} alt={lastScanned.raw.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {lastScanned.raw.employeeId}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">• {lastScanned.raw.company}</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 mt-1 truncate">{lastScanned.raw.fullName}</h4>
                          <p className="text-xs font-semibold text-red-400 mt-0.5">
                            {lastScanned.raw.jobTitle || 'Poste non renseigné'}
                            {lastScanned.raw.department && (
                              <span className="text-slate-400 font-normal"> • {lastScanned.raw.department}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-[11px] space-y-0.5 shrink-0">
                        <div className="font-bold text-slate-800">{lastScanned.raw.site || lastScanned.raw.location || 'Delmas 52'}</div>
                        <div className="text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                          {lastScanned.raw.status === 'active' ? 'Actif' : lastScanned.raw.status === 'on_leave' ? 'En mission' : 'Inactif'}
                        </div>
                      </div>
                    </div>

                    {/* Informations du collaborateur */}
                    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>Email Professionnel</span>
                        </div>
                        <div className="font-medium text-slate-900 text-xs mt-1 truncate select-all" title={lastScanned.raw.email}>
                          {lastScanned.raw.email || 'Non renseigné'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>Téléphone</span>
                        </div>
                        <div className="font-semibold text-slate-900 text-xs mt-1 select-all">
                          {lastScanned.raw.phone || 'Non renseigné'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3 text-slate-400" />
                          <span>NIF (Fiscal)</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 text-xs mt-1 select-all">
                          {lastScanned.raw.nif || 'Non renseigné'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          <Droplets className="w-3 h-3 text-red-500" />
                          <span>Groupe Sanguin</span>
                        </div>
                        <div className="font-mono font-bold text-red-600 text-xs mt-1">
                          {lastScanned.raw.bloodGroup || 'Non renseigné'}
                        </div>
                      </div>
                    </div>

                    {/* Code-barres officiel du salarié */}
                    <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-200 mt-3">
                      <div className="space-y-0.5 text-xs text-slate-600 font-mono">
                        <div className="font-bold text-slate-900">Code 128 Salarié</div>
                        <div className="text-[11px] text-slate-500">Matricule : {lastScanned.raw.employeeId}</div>
                      </div>
                      <Barcode 
                        value={lastScanned.raw.employeeId} 
                        width={1.2} 
                        height={36} 
                        fontSize={10} 
                        displayValue={false} 
                      />
                    </div>
                  </div>

                  {/* Actions collaborateurs */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => downloadSingleBadgeCR80PDF(lastScanned.raw)}
                      className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <IdCard className="w-3.5 h-3.5" />
                      <span>Badge d&apos;Accès (PDF)</span>
                    </button>
                    <button
                      onClick={() => downloadBadgePlancheA4PDF(lastScanned.raw)}
                      className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Planche A4</span>
                    </button>
                  </div>
                </div>

                {/* COLONNE DROITE : POSTE IT RELIÉ & ACCÈS APPLICATIF RÉEL */}
                <div className="space-y-3.5 flex flex-col justify-between">
                  {/* POSTE IT RELIÉ (Matériel Dell / HP) */}
                  {(() => {
                    const linkedIT = lastScanned.linkedITAsset || itAssets.find((it: any) => 
                      (it.assignedPersonnelId && (
                        it.assignedPersonnelId === lastScanned.raw.id || 
                        it.assignedPersonnelId === lastScanned.raw.employeeId ||
                        (lastScanned.raw.employeeId && String(it.assignedPersonnelId).toUpperCase() === lastScanned.raw.employeeId.toUpperCase()) ||
                        (lastScanned.raw.id && String(it.assignedPersonnelId).toUpperCase() === lastScanned.raw.id.toUpperCase())
                      )) ||
                      (it.assignedTo && lastScanned.raw.fullName && it.assignedTo.trim().toLowerCase() === lastScanned.raw.fullName.trim().toLowerCase()) ||
                      (it.assignedTo && lastScanned.raw.firstName && lastScanned.raw.lastName && it.assignedTo.toLowerCase().includes(lastScanned.raw.firstName.toLowerCase()) && it.assignedTo.toLowerCase().includes(lastScanned.raw.lastName.toLowerCase())) ||
                      (lastScanned.raw.workstation?.pcSerial && it.serialNumber && it.serialNumber.trim().toUpperCase() === lastScanned.raw.workstation.pcSerial.trim().toUpperCase())
                    );
                    const ws = linkedIT?.workstation || lastScanned.raw.workstation;
                    const hasWorkstation = Boolean(linkedIT && linkedIT.serialNumber && linkedIT.serialNumber !== 'N/A' && linkedIT.serialNumber.trim() !== '');
                    const itTag = linkedIT?.assetTag || 'Poste IT';
                    const pcName = linkedIT?.name || ws?.pcName || 'Poste de travail';
                    const pcSerial = linkedIT?.serialNumber || ws?.pcSerial || 'N/A';
                    const specs = ws?.pcSpecs || [linkedIT?.cpu, linkedIT?.ram, linkedIT?.storage, linkedIT?.os].filter(Boolean).join(' • ') || 'Spécifications standard';
                    const monitorModel = ws?.monitorModel || linkedIT?.screen || 'Écran standard';
                    const monitorSerial = ws?.monitorSerial;
                    const keyboard = ws?.keyboard || linkedIT?.keyboard || 'Logitech / Dell standard';
                    const mouse = ws?.mouse || linkedIT?.mouse || 'Logitech / Dell standard';

                    return (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                            <Laptop className="w-3.5 h-3.5 text-slate-700" />
                            <span>Poste IT Relié</span>
                          </span>
                          {hasWorkstation ? (
                            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded select-all">
                              {itTag}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Aucun poste assigné
                            </span>
                          )}
                        </div>

                        {hasWorkstation ? (
                          <div className="space-y-2.5 text-xs text-slate-600">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900 text-xs truncate">{pcName}</span>
                              <span className="text-[11px] text-emerald-600 font-semibold">• Affecté</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Numéro de série S/N PC</span>
                                <span className="font-mono font-bold text-slate-900 select-all block mt-0.5">
                                  {pcSerial}
                                </span>
                              </div>
                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Écran assigné</span>
                                <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                                  {monitorModel}
                                </span>
                                {monitorSerial && (
                                  <span className="text-[10px] text-slate-500 font-mono block">
                                    SN: {monitorSerial}
                                  </span>
                                )}
                              </div>
                            </div>

                            {specs && (
                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Configuration & Spécifications</span>
                                <span className="font-mono text-[11px] text-slate-800 block mt-0.5">
                                  {specs}
                                </span>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                              <div>
                                <span className="text-slate-400 text-[10px] uppercase block">Clavier</span>
                                <span className="text-slate-700 font-medium truncate block">{keyboard}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] uppercase block">Souris</span>
                                <span className="text-slate-700 font-medium truncate block">{mouse}</span>
                              </div>
                            </div>

                            {/* Code-barres du poste IT */}
                            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-2">
                              <div className="space-y-0.5 font-mono text-[11px]">
                                <div className="font-bold text-slate-900">Tag Poste IT</div>
                                <div className="text-[10px] text-slate-500">{itTag}</div>
                              </div>
                              <Barcode 
                                value={itTag.startsWith('AST-') ? itTag : pcSerial} 
                                width={1.1} 
                                height={32} 
                                fontSize={10} 
                                displayValue={true} 
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic py-2">
                            Aucun poste informatique assigné directement à ce collaborateur.
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* ACCÈS APPLICATIF ERP ET SESSION (VÉRIFICATION STRICTE DE LA PRÉSENCE DANS LA LISTE DES APPLICATIONS) */}
                  {(() => {
                    const rawEmp = lastScanned.raw;
                    // Le système vérifie formellement si la personne figure dans la liste officielle applicationAccounts
                    const appAcc = applicationAccounts?.find(a => 
                      (a.employeeId && (
                        a.employeeId === rawEmp.id || 
                        a.employeeId === rawEmp.employeeId ||
                        (rawEmp.employeeId && a.employeeId.toUpperCase() === rawEmp.employeeId.toUpperCase()) ||
                        (rawEmp.id && a.employeeId.toUpperCase() === rawEmp.id.toUpperCase())
                      )) ||
                      (a.username && rawEmp.email && a.username.trim().toLowerCase() === rawEmp.email.trim().toLowerCase()) ||
                      (a.username && (rawEmp as any).username && a.username.trim().toLowerCase() === (rawEmp as any).username.trim().toLowerCase()) ||
                      (a.username && rawEmp.accounts?.appUsername && a.username.trim().toLowerCase() === rawEmp.accounts.appUsername.trim().toLowerCase()) ||
                      (a.firstName && a.lastName && rawEmp.firstName && rawEmp.lastName &&
                       a.firstName.trim().toLowerCase() === rawEmp.firstName.trim().toLowerCase() &&
                       a.lastName.trim().toLowerCase() === rawEmp.lastName.trim().toLowerCase()) ||
                      (a.lastName && rawEmp.lastName && a.lastName.trim().toLowerCase() === rawEmp.lastName.trim().toLowerCase() &&
                       (a.organization || '').toLowerCase() === (rawEmp.company || '').toLowerCase())
                    );

                    const hasRealAccount = Boolean(
                      (appAcc && appAcc.username && appAcc.username.trim() !== '' && !appAcc.username.toLowerCase().startsWith('emp-')) ||
                      (rawEmp.accounts?.applications && rawEmp.accounts.applications !== 'Aucun' && rawEmp.accounts.appUsername)
                    );

                    if (!hasRealAccount) {
                      return (
                        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                              <KeyRound className="w-3.5 h-3.5 text-slate-700" />
                              <span>Accès Applicatif ERP</span>
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Aucun accès applicatif
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 italic py-2">
                            Ce collaborateur ne figure pas dans la liste des applications. Aucun accès ERP ni session Windows locale n&apos;est assigné.
                          </p>
                        </div>
                      );
                    }

                    const realAppUsername = appAcc?.username || rawEmp.accounts?.appUsername;
                    const realWinUsername = appAcc?.windowsUsername || rawEmp.accounts?.windowsUsername;
                    const realAppPassword = appAcc?.password || rawEmp.accounts?.appPassword;
                    const realAppName = appAcc?.applications || rawEmp.accounts?.applications || 'Microsoft GP';
                    const realOrg = appAcc?.organization || rawEmp.accounts?.organization || rawEmp.company;
                    const isDealer = realAppName.toLowerCase().includes('dealer');

                    return (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                            <KeyRound className="w-3.5 h-3.5 text-slate-700" />
                            <span>Accès Applicatif ERP</span>
                          </span>
                          <div className="flex items-center gap-2">
                            {isDealer ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src="/logos/dealerpro.png" 
                                alt="DealerPRO" 
                                className="h-6 w-auto object-contain" 
                                onError={(e) => { e.currentTarget.src = '/dealerpro.png'; }} 
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src="/logos/gp.png" 
                                alt="Microsoft GP" 
                                className="h-5 w-auto object-contain" 
                                onError={(e) => { e.currentTarget.src = '/gp.png'; }} 
                              />
                            )}
                            <button
                              onClick={() => setShowPasswords(!showPasswords)}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded"
                              title={showPasswords ? "Masquer les mots de passe" : "Afficher les mots de passe"}
                            >
                              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                            Identifiant Collaborateur {realAppName}
                          </span>
                          <span className="font-mono font-bold text-sm text-slate-900 block mt-0.5 select-all">
                            @{realAppUsername}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Session Windows</span>
                            <div className="font-mono text-slate-700 mt-0.5 truncate font-semibold">
                              {realWinUsername || 'Non renseigné'}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Organisation ERP</span>
                            <div className="font-semibold text-slate-800 mt-0.5 truncate">
                              {realOrg}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Mot de Passe App</span>
                            <div className="font-mono text-slate-700 mt-0.5">
                              {realAppPassword ? (showPasswords ? realAppPassword : '••••••••') : 'Non configuré'}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Application</span>
                            <div className="font-semibold text-slate-800 mt-0.5">
                              {realAppName}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : lastScanned.type === 'it' ? (
              // =========================================================================
              // CAS 2 : SCAN D'UN POSTE IT (TAG AST-... OU S/N SERVICE TAG)
              // VUE RECTANGULAIRE 2 COLONNES : FICHE POSTE IT • COLLABORATEUR ASSIGNÉ
              // =========================================================================
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                
                {/* COLONNE GAUCHE : MATÉRIEL IT & SPÉCIFICATIONS TECHNIQUES */}
                <div className="space-y-3.5 flex flex-col justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div>
                    {/* En-tête Poste IT */}
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          <Laptop className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {lastScanned.raw.assetTag || lastScanned.serialNumber}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">• {lastScanned.company}</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 mt-1 truncate">
                            {lastScanned.raw.name || lastScanned.raw.workstation?.pcName || 'Poste de travail'}
                          </h4>
                          <p className="text-xs font-semibold text-slate-600 mt-0.5">
                            {lastScanned.raw.brand} {lastScanned.raw.model}
                            {lastScanned.raw.subCategory && (
                              <span className="text-slate-400 font-normal"> • {lastScanned.raw.subCategory}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-[11px] space-y-0.5 shrink-0">
                        <div className="font-bold text-slate-800">{lastScanned.location}</div>
                        <div className="text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                          {lastScanned.status === 'in_use' ? 'En service' : 'Disponible'}
                        </div>
                      </div>
                    </div>

                    {/* Grille des Spécifications Techniques */}
                    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-slate-400 text-[10px] uppercase font-semibold block">Numéro de Série (S/N)</div>
                        <div className="font-mono font-bold text-slate-900 text-xs mt-1 select-all">
                          {lastScanned.raw.serialNumber || 'N/A'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-slate-400 text-[10px] uppercase font-semibold block">Système d&apos;Exploitation</div>
                        <div className="font-semibold text-slate-900 text-xs mt-1 truncate">
                          {lastScanned.raw.os || 'Windows 11 Pro'}
                        </div>
                      </div>

                      <div className="col-span-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          <Cpu className="w-3 h-3 text-slate-500" />
                          <span>Configuration Matérielle (CPU • RAM • SSD)</span>
                        </div>
                        <div className="font-mono font-medium text-slate-900 text-xs mt-1">
                          {lastScanned.raw.workstation?.pcSpecs || 
                           [lastScanned.raw.cpu, lastScanned.raw.ram, lastScanned.raw.storage].filter(Boolean).join(' • ') || 
                           'Spécifications standard'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          <Monitor className="w-3 h-3 text-slate-500" />
                          <span>Écran Assigné</span>
                        </div>
                        <div className="font-semibold text-slate-900 text-xs mt-1 truncate">
                          {lastScanned.raw.workstation?.monitorModel || lastScanned.raw.screen || 'Écran standard'}
                        </div>
                        {lastScanned.raw.workstation?.monitorSerial && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                            SN: {lastScanned.raw.workstation.monitorSerial}
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-slate-400 text-[10px] uppercase font-semibold block">Périphériques Clavier & Souris</div>
                        <div className="text-[11px] text-slate-800 mt-1 space-y-0.5">
                          <div className="truncate">Clavier: {lastScanned.raw.workstation?.keyboard || lastScanned.raw.keyboard || 'Standard'}</div>
                          <div className="truncate">Souris: {lastScanned.raw.workstation?.mouse || lastScanned.raw.mouse || 'Standard'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Code-barres officiel du Poste IT */}
                    <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-200 mt-3">
                      <div className="space-y-0.5 text-xs text-slate-600 font-mono">
                        <div className="font-bold text-slate-900">Tag Poste IT</div>
                        <div className="text-[11px] text-slate-500">{lastScanned.raw.assetTag || lastScanned.serialNumber}</div>
                      </div>
                      <Barcode 
                        value={lastScanned.raw.assetTag || lastScanned.serialNumber} 
                        width={1.2} 
                        height={36} 
                        fontSize={10} 
                        displayValue={true} 
                      />
                    </div>
                  </div>

                  {/* Actions Poste IT */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onClose();
                        openQRModal({
                          id: lastScanned.id,
                          assetTag: lastScanned.raw.assetTag || lastScanned.serialNumber,
                          name: lastScanned.title,
                          category: 'it',
                          location: lastScanned.location,
                          company: lastScanned.company,
                          status: 'in_use' as any
                        } as any);
                      }}
                      className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimer Étiquette Poste</span>
                    </button>
                  </div>
                </div>

                {/* COLONNE DROITE : COLLABORATEUR ASSIGNÉ À CE POSTE */}
                <div className="space-y-3.5 flex flex-col justify-between">
                  {lastScanned.linkedEmployee ? (
                    (() => {
                      const emp = lastScanned.linkedEmployee;
                      const appAcc = applicationAccounts?.find(a => 
                        (a.employeeId && (
                          a.employeeId === emp.id || 
                          a.employeeId === emp.employeeId ||
                          (emp.employeeId && a.employeeId.toUpperCase() === emp.employeeId.toUpperCase()) ||
                          (emp.id && a.employeeId.toUpperCase() === emp.id.toUpperCase())
                        )) ||
                        (a.username && emp.email && a.username.trim().toLowerCase() === emp.email.trim().toLowerCase()) ||
                        (a.username && (emp as any).username && a.username.trim().toLowerCase() === (emp as any).username.trim().toLowerCase()) ||
                        (a.username && emp.accounts?.appUsername && a.username.trim().toLowerCase() === emp.accounts.appUsername.trim().toLowerCase()) ||
                        (a.firstName && a.lastName && emp.firstName && emp.lastName &&
                         a.firstName.trim().toLowerCase() === emp.firstName.trim().toLowerCase() &&
                         a.lastName.trim().toLowerCase() === emp.lastName.trim().toLowerCase()) ||
                        (a.lastName && emp.lastName && a.lastName.trim().toLowerCase() === emp.lastName.trim().toLowerCase() &&
                         (a.organization || '').toLowerCase() === (emp.company || '').toLowerCase())
                      );
                      const hasRealAccount = Boolean(
                        (appAcc && appAcc.username && appAcc.username.trim() !== '' && !appAcc.username.toLowerCase().startsWith('emp-')) ||
                        (emp.accounts?.applications && emp.accounts.applications !== 'Aucun' && emp.accounts.appUsername)
                      );
                      const realAppUsername = appAcc?.username || emp.accounts?.appUsername;
                      const realWinUsername = appAcc?.windowsUsername || emp.accounts?.windowsUsername;
                      const realAppName = appAcc?.applications || emp.accounts?.applications || 'Microsoft GP';

                      return (
                        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between h-full">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 shadow-2xs">
                                  {emp.photoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={emp.photoUrl} alt={emp.fullName} className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-6 h-6 text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                      {emp.employeeId}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-500">• Collaborateur Assigné</span>
                                  </div>
                                  <h4 className="text-base font-bold text-slate-900 mt-1 truncate">{emp.fullName}</h4>
                                  <p className="text-xs font-semibold text-red-400 mt-0.5">
                                    {emp.jobTitle || 'Poste non renseigné'}
                                    {emp.department && (
                                      <span className="text-slate-400 font-normal"> • {emp.department}</span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right text-[11px] space-y-0.5 shrink-0">
                                <div className="font-bold text-slate-800">{emp.site || emp.location || 'Delmas 52'}</div>
                                <div className="text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                                  {emp.status === 'active' ? 'Actif' : 'Inactif'}
                                </div>
                              </div>
                            </div>

                            {/* Coordonnées & Informations */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>Email</span>
                                </div>
                                <div className="font-medium text-slate-900 text-xs mt-0.5 truncate select-all">
                                  {emp.email || 'Non renseigné'}
                                </div>
                              </div>

                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>Téléphone</span>
                                </div>
                                <div className="font-semibold text-slate-900 text-xs mt-0.5 select-all">
                                  {emp.phone || 'Non renseigné'}
                                </div>
                              </div>
                            </div>

                            {/* Code-barres Salarié */}
                            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="space-y-0.5 font-mono text-[11px]">
                                <div className="font-bold text-slate-900">Code 128 Salarié</div>
                                <div className="text-[10px] text-slate-500">Matricule : {emp.employeeId}</div>
                              </div>
                              <Barcode 
                                value={emp.employeeId} 
                                width={1.1} 
                                height={32} 
                                fontSize={10} 
                                displayValue={false} 
                              />
                            </div>

                            {/* Section Compte ERP (Uniquement Authentique) */}
                            {hasRealAccount && appAcc ? (
                              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                                    <KeyRound className="w-3 h-3 text-slate-500" />
                                    <span>Compte ERP : {realAppName}</span>
                                  </span>
                                  <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                    @{realAppUsername}
                                  </span>
                                </div>
                                {realWinUsername && (
                                  <div className="text-[11px] text-slate-600 font-mono">
                                    Session Windows : <span className="font-semibold text-slate-800">{realWinUsername}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                                Ce collaborateur ne figure pas dans la liste des applications.
                              </div>
                            )}
                          </div>

                          {/* Actions badge salarié */}
                          <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => downloadSingleBadgeCR80PDF(emp)}
                              className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                            >
                              <IdCard className="w-3.5 h-3.5" />
                              <span>Badge d&apos;Accès (PDF)</span>
                            </button>
                            <button
                              onClick={() => downloadBadgePlancheA4PDF(emp)}
                              className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              <span>Planche A4</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    // POSTE EN RÉSERVE / NON ATTRIBUÉ
                    <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center space-y-3 h-full">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <Laptop className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Poste informatique en réserve</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">
                          Ce matériel est actuellement en stock dans le parc informatique et n&apos;est affecté à aucun collaborateur.
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Disponible pour affectation
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // =========================================================================
              // CAS 3 : SCAN D'UNE IMPRIMANTE HP
              // =========================================================================
              <div className="space-y-3 p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <Printer className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Imprimante Réseau Identifiée
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{lastScanned.title}</h4>
                      <p className="text-xs text-slate-500">{lastScanned.subtitle}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-800">
                    {lastScanned.serialNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                  <div className="space-y-1 text-xs text-slate-600 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Société :</strong> {lastScanned.company}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
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

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onClose();
                      openQRModal({
                        id: lastScanned.id,
                        assetTag: lastScanned.serialNumber,
                        name: lastScanned.title,
                        category: 'printers',
                        location: lastScanned.location,
                        company: lastScanned.company,
                        status: 'Fonctionnel' as any
                      } as any);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimer Étiquette Imprimante</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
