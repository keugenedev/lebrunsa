'use client';

import React, { useState, useRef } from 'react';
import { Employee } from '@/types/inventory';
import Barcode from '@/components/common/Barcode';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Laptop, 
  Monitor, 
  Building, 
  MapPin, 
  User, 
  AlertTriangle, 
  Barcode as BarcodeIcon, 
  ShieldCheck 
} from 'lucide-react';

interface EmployeeBarcodeModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmployeeBarcodeModal({ employee, isOpen, onClose }: EmployeeBarcodeModalProps) {
  const [showPasswords, setShowPasswords] = useState(false);
  const [copied, setCopied] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !employee) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const ws = employee.workstation;
  const acc = employee.accounts;
  const barcodeValue = ws?.pcSerial || ws?.pcName || employee.employeeId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200/90 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {employee.company || 'Lebrun S.A.'} • {employee.site || employee.location}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Fiche Matériel & Code-Barres : {employee.fullName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Printable Asset Badge with Genuine Code 128 Barcode */}
          <div 
            ref={badgeRef}
            className="p-5 rounded-xl bg-white border border-slate-300 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5 select-none"
          >
            {/* Left: Identité & Entreprise */}
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/lebrun.png" alt="Lebrun" className="h-6 w-auto object-contain" />
                <span className="font-bold text-slate-800 text-xs tracking-wide uppercase">
                  {employee.company || 'LEBRUN S.A.'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{employee.fullName}</h3>
                <p className="text-slate-500 font-medium text-xs">{employee.jobTitle} • {employee.department}</p>
                <p className="text-slate-400 text-[11px] font-mono mt-0.5">Matricule : {employee.employeeId}</p>
              </div>
            </div>

            {/* Right: Authentic Code 128 Barcode */}
            <div className="flex flex-col items-center shrink-0 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
              <Barcode 
                value={barcodeValue} 
                width={1.5} 
                height={52} 
                fontSize={11} 
                displayValue={true} 
              />
              <span className="text-[10px] font-mono text-slate-500 mt-1">
                Poste : {ws?.pcName || 'N/A'}
              </span>
            </div>
          </div>

          {/* Section 1: Workstation Equipment */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Laptop className="w-4 h-4 text-red-600" />
              <span>Poste de Travail & Périphériques Assignés</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PC / Machine */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-xs">
                    <Laptop className="w-3.5 h-3.5 text-slate-500" />
                    <span>Unité Centrale Dell</span>
                  </span>
                  <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded text-[11px]">
                    {ws?.pcName || 'N/A'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  S/N : <strong className="text-slate-800">{ws?.pcSerial || 'N/A'}</strong>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  {ws?.pcSpecs || 'Spécifications non renseignées'}
                </p>
              </div>

              {/* Écran */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-xs">
                    <Monitor className="w-3.5 h-3.5 text-slate-500" />
                    <span>Moniteur / Écran</span>
                  </span>
                  {ws?.monitorObs && ws.monitorObs.includes('deffecteux') ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-800 border border-slate-300">
                      <AlertTriangle className="w-3 h-3 text-slate-600" />
                      <span>Trace défectueuse</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {ws?.monitorObs || 'Opérationnel'}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-700 font-medium">
                  {ws?.monitorModel || 'Écran Dell'}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  S/N : {ws?.monitorSerial || 'Non renseigné'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: ERP & Session Accounts */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-red-600" />
                <span>Comptes Applicatifs & Microsoft GP</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-medium transition-colors cursor-pointer"
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPasswords ? 'Masquer mots de passe' : 'Afficher mots de passe'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Session Windows / PC */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800 flex items-center justify-between text-xs">
                  <span>Session Windows Locale</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                    Windows
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Username :</span>
                  <span className="font-mono font-bold text-slate-900">{acc?.windowsUsername || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Mot de passe :</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-slate-900">
                      {showPasswords ? (acc?.windowsPassword || 'N/A') : '••••••••'}
                    </span>
                    {acc?.windowsPassword && acc.windowsPassword !== 'N/A' && (
                      <button
                        onClick={() => handleCopy(acc.windowsPassword!)}
                        className="text-slate-400 hover:text-slate-600"
                        title="Copier le mot de passe"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Microsoft GP Application */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800 flex items-center justify-between text-xs">
                  <span>{acc?.applications || 'Microsoft GP'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-700 font-semibold font-mono">
                    ERP Métier
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Compte GP :</span>
                  <span className="font-mono font-bold text-slate-900">{acc?.appUsername || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Mot de passe GP :</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-slate-900">
                      {showPasswords ? (acc?.appPassword || '1234') : '••••••••'}
                    </span>
                    {acc?.appPassword && (
                      <button
                        onClick={() => handleCopy(acc.appPassword!)}
                        className="text-slate-400 hover:text-slate-600"
                        title="Copier le mot de passe"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                  Société : <strong>{acc?.organization || employee.company}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {copied && (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Copié dans le presse-papiers
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimer l&apos;étiquette Code-Barres</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
