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
  Droplets
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

    // 1. Chercher dans les imprimantes HP
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
      setScanInput('');
      return;
    }

    // 3. Chercher dans le personnel / postes Dell
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
              placeholder="Visez avec le scanner ou tapez un S/N (ex: GMMSWR1, EMP-LEB-005) puis Entrée..."
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

        {/* Last Scanned Result Card - Layout Rectangulaire Spacieux & Professionnel */}
        {lastScanned && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50/60 border border-slate-200/90 shadow-2xs animate-in fade-in overflow-y-auto flex-1">
            {lastScanned.type === 'employee' ? (
              // VUE RECTANGULAIRE 2 COLONNES : COLLABORATEUR • POSTE IT • APPLICATIONS MICROSOFT GP
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                {/* COLONNE GAUCHE : IDENTIFICATION SALARIÉ & COORDONNÉES */}
                <div className="space-y-3.5 flex flex-col justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div>
                    {/* En-tête Collaborateur (Sans badge "Collaborateur Identifié") */}
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
                          {/* Poste du collaborateur en ROUGE PÂLE */}
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

                    {/* Toutes les informations complètes du collaborateur : Nom complet, Email, Téléphone, NIF, Groupe sanguin, etc. */}
                    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                      {/* Email */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>Email Professionnel</span>
                        </div>
                        <div className="font-medium text-slate-900 text-xs mt-1 truncate select-all" title={lastScanned.raw.email}>
                          {lastScanned.raw.email || 'Non renseigné'}
                        </div>
                      </div>

                      {/* Téléphone */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>Numéro Téléphone</span>
                        </div>
                        <div className="font-semibold text-slate-900 text-xs mt-1 select-all">
                          {lastScanned.raw.phone || 'Non renseigné'}
                        </div>
                      </div>

                      {/* NIF */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3 text-slate-400" />
                          <span>NIF (Fiscal)</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 text-xs mt-1 select-all">
                          {lastScanned.raw.nif || 'Non renseigné'}
                        </div>
                      </div>

                      {/* Groupe Sanguin */}
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

                {/* COLONNE DROITE : POSTE IT RELIÉ & APPLICATIONS MICROSOFT GP */}
                <div className="space-y-3.5 flex flex-col justify-between">
                  {/* POSTE IT RELIÉ (Matériel Dell / HP) */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <Laptop className="w-3.5 h-3.5 text-slate-700" />
                        <span>Poste IT Relié ({lastScanned.raw.workstation?.type || 'Machine'})</span>
                      </span>
                      <span className="font-mono font-bold text-xs text-black select-all">
                        {lastScanned.raw.workstation?.pcName || 'N/A'}
                      </span>
                    </div>

                    {lastScanned.raw.workstation ? (
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Numéro de série S/N PC</span>
                            <span className="font-mono font-bold text-slate-900 select-all block mt-0.5">
                              {lastScanned.raw.workstation.pcSerial || 'N/A'}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Écran assigné</span>
                            <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                              {lastScanned.raw.workstation.monitorModel || 'Écran standard'}
                            </span>
                            {lastScanned.raw.workstation.monitorSerial && (
                              <span className="text-[10px] text-slate-500 font-mono block">
                                SN: {lastScanned.raw.workstation.monitorSerial}
                              </span>
                            )}
                          </div>
                        </div>

                        {lastScanned.raw.workstation.pcSpecs && (
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Configuration & Spécifications</span>
                            <span className="font-mono text-[11px] text-slate-800 block mt-0.5">
                              {lastScanned.raw.workstation.pcSpecs}
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase block">Clavier</span>
                            <span className="text-slate-700 font-medium">{lastScanned.raw.workstation.keyboard || 'Logitech standard'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase block">Souris</span>
                            <span className="text-slate-700 font-medium">{lastScanned.raw.workstation.mouse || 'Logitech standard'}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic py-2">
                        Aucun poste informatique assigné directement.
                      </div>
                    )}
                  </div>

                  {/* APPLICATIONS & ACCÈS AVEC LOGO MICROSOFT GP ET IDENTIFIANT AUTOMATIQUE */}
                  {(() => {
                    const appAcc = applicationAccounts?.find(a => 
                      (a.employeeId && (a.employeeId === lastScanned.raw.id || a.employeeId === lastScanned.raw.employeeId)) ||
                      (a.username && lastScanned.raw.accounts?.appUsername && a.username.toLowerCase() === lastScanned.raw.accounts.appUsername.toLowerCase()) ||
                      (lastScanned.raw.lastName && a.lastName && a.lastName.toLowerCase() === lastScanned.raw.lastName.toLowerCase())
                    );
                    const autoIdentifiant = lastScanned.raw.accounts?.appUsername || appAcc?.username || lastScanned.raw.username || (lastScanned.raw.fullName ? lastScanned.raw.fullName.toLowerCase().replace(/\s+/g, '.') : lastScanned.raw.employeeId);
                    const appName = lastScanned.raw.accounts?.applications || appAcc?.applications || (lastScanned.raw.company === 'Caribe Motors' ? 'DealerPro DMS' : 'Microsoft GP');
                    const isDealer = appName.toLowerCase().includes('dealer');

                    return (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                            <KeyRound className="w-3.5 h-3.5 text-slate-700" />
                            <span>Accès Applicatif ERP</span>
                          </span>
                          {isDealer ? (
                            /* Logo officiel DealerPro affiché uniquement, sans boîte ni texte */
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img 
                              src="/logos/dealerpro.png" 
                              alt="DealerPRO" 
                              className="h-6 w-auto object-contain" 
                              onError={(e) => { e.currentTarget.src = '/dealerpro.png'; }} 
                            />
                          ) : (
                            /* Logo officiel Microsoft GP */
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img 
                              src="/logos/gp.png" 
                              alt="Microsoft GP" 
                              className="h-5 w-auto object-contain" 
                              onError={(e) => { e.currentTarget.src = '/gp.png'; }} 
                            />
                          )}
                        </div>

                        {/* Identifiant automatique affiché de manière élégante et mise en avant */}
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                            Identifiant Automatique Collaborateur
                          </span>
                          <span className="font-mono font-bold text-sm text-slate-900 block mt-0.5 select-all">
                            {autoIdentifiant}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Session Windows</span>
                            <div className="font-mono text-slate-700 mt-0.5 truncate">
                              {lastScanned.raw.accounts?.windowsUsername || lastScanned.raw.fullName}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Organisation ERP</span>
                            <div className="font-semibold text-slate-800 mt-0.5 truncate">
                              {lastScanned.raw.accounts?.organization || lastScanned.raw.company}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Mot de Passe App</span>
                            <div className="font-mono text-slate-700 mt-0.5">
                              ••••••••
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Type Accès</span>
                            <div className="font-semibold text-slate-800 mt-0.5">
                              Standard ERP
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              // MATÉRIEL IT OU IMPRIMANTE CLASSIQUE
              <div className="space-y-3 p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Matériel Identifié avec Succès
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{lastScanned.title}</h4>
                      <p className="text-xs text-slate-500">{lastScanned.subtitle}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-800">
                    {lastScanned.serialNumber}
                  </span>
                </div>

                {/* Barcode representation */}
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

                {/* Quick Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
                    className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimer Étiquette Code-Barres</span>
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
