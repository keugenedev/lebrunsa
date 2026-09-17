'use client';

import React, { useState } from 'react';
import { ITAsset, Employee } from '@/types/inventory';
import Barcode from '@/components/common/Barcode';
import CompanyLogo from '@/components/common/CompanyLogo';
import {
  X,
  Monitor,
  Cpu,
  HardDrive,
  Keyboard,
  Mouse,
  User,
  ShieldCheck,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  Building,
  MapPin,
  Laptop,
  KeyRound,
  Barcode as BarcodeIcon,
  Eye,
  EyeOff
} from 'lucide-react';

interface WorkstationDetailsModalProps {
  asset: ITAsset | null;
  employee?: Employee | null;
  onClose: () => void;
  onOpenEdit?: (asset: ITAsset) => void;
}

export default function WorkstationDetailsModal({
  asset,
  employee,
  onClose,
  onOpenEdit
}: WorkstationDetailsModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  if (!asset) return null;

  // Resolve workstation info from asset or linked employee
  const ws = asset.workstation || employee?.workstation;
  const accounts = employee?.accounts;
  const companyName = (asset as any).company || employee?.company || 'Lebrun S.A.';

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isScreenDefective = ws?.monitorObs?.toLowerCase().includes('trace') || 
                            ws?.monitorObs?.toLowerCase().includes('defect') ||
                            ws?.monitorObs?.toLowerCase().includes('deffect');

  const isKeyboardMissing = ws?.keyboard?.toLowerCase() === 'need';
  const isMouseMissing = ws?.mouse?.toLowerCase() === 'need';

  const defaultSpecs = [asset.cpu || 'Intel Core', asset.ram || '8 GB RAM', asset.storage || '500 GB SSD'].join(' • ');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto relative max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <CompanyLogo company={companyName} className="h-6 max-w-[90px] w-auto object-contain" />
            <div className="h-4 w-px bg-slate-300"></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {ws?.pcName || asset.name}
                </h3>
                <span className="font-mono text-xs font-bold text-red-600 select-all whitespace-nowrap">
                  {asset.assetTag}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Fiche d\'inventaire certifiée • Poste de travail & Périphériques
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Imprimer la fiche matériel"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Section 1: Unité Centrale Dell */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Laptop className="w-4 h-4 text-red-600 shrink-0" />
                <span>Unité Centrale / Station de Travail</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                {asset.status === 'in_use' ? 'En service' : asset.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Nom Machine (PC)</span>
                <span className="font-mono font-bold text-slate-900 text-xs select-all">
                  {ws?.pcName || asset.model}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Service Tag / N° Série</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-bold text-slate-900 text-xs select-all">
                    {ws?.pcSerial || asset.serialNumber}
                  </span>
                  <button
                    onClick={() => handleCopy('sn', ws?.pcSerial || asset.serialNumber)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Copier le numéro de série"
                  >
                    {copiedKey === 'sn' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Format & Marque</span>
                <span className="text-slate-800 font-semibold">
                  {ws?.type || 'Desktop'} • Dell
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Spécifications Matérielles & OS</span>
              <p className="font-medium text-slate-800 mt-0.5 text-xs">
                {ws?.pcSpecs || defaultSpecs}
              </p>
            </div>
          </div>

          {/* Section 2: Écran & Moniteur */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Monitor className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Écran & Moniteur de Bureau</span>
              </div>
              {isScreenDefective ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Défectueux (Trace dans l\'écran)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                  {ws?.monitorObs || 'Opérationnel'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Modèle de l\'Écran</span>
                <span className="font-bold text-slate-900 text-xs">
                  {ws?.monitorModel || 'Écran Dell standard'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">N° de Série Écran</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-slate-800 text-xs select-all truncate max-w-[220px]" title={ws?.monitorSerial}>
                    {ws?.monitorSerial || 'N/A'}
                  </span>
                  {ws?.monitorSerial && ws.monitorSerial !== 'N/A' && (
                    <button
                      onClick={() => handleCopy('mon_sn', ws.monitorSerial)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0 cursor-pointer"
                      title="Copier le numéro de série de l\'écran"
                    >
                      {copiedKey === 'mon_sn' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {ws?.monitorObs && ws.monitorObs !== 'Good' && (
              <div className="p-2 rounded-lg bg-amber-50 text-amber-800 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span><strong>Observation Écran :</strong> {ws.monitorObs}</span>
              </div>
            )}
          </div>

          {/* Section 3: Périphériques de Saisie (Clavier & Souris) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Clavier */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                  <Keyboard className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Clavier</span>
                </div>
                {isKeyboardMissing ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700">
                    Manquant (Need)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                    {ws?.keyboardObs || 'Good'}
                  </span>
                )}
              </div>

              <div className="space-y-1 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Modèle</span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {ws?.keyboard || 'Clavier Dell'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Type / Disposition</span>
                  <span className="text-slate-600 text-xs">
                    {ws?.keyboardDetails || 'Clavier Alpha-numérique'}
                  </span>
                </div>
              </div>
            </div>

            {/* Souris */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                  <Mouse className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Souris</span>
                </div>
                {isMouseMissing ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700">
                    Manquant (Need)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                    {ws?.mouseObs || 'Good'}
                  </span>
                )}
              </div>

              <div className="space-y-1 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Marque & Type</span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {ws?.mouse || 'Dell'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Connectique</span>
                  <span className="text-slate-600 text-xs">
                    {ws?.mouseDetails || 'Souris Bureau (Cable)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Collaborateur & Comptes d\'accès */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <User className="w-4 h-4 text-red-600 shrink-0" />
                <span>Collaborateur Assigné & Sessions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CompanyLogo company={companyName} className="h-4 max-w-[70px] w-auto object-contain" />
                <span className="text-[11px] text-slate-500 font-medium">
                  {asset.location}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Nom du Collaborateur</span>
                <span className="font-bold text-slate-900 text-xs">
                  {asset.assignedTo || 'Non assigné'}
                </span>
                <span className="text-slate-500 block text-[11px]">
                  {asset.assignedDepartment || employee?.department || 'Poste de travail'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Email Professionnel</span>
                <span className="text-slate-700 font-mono text-xs">
                  {asset.assignedEmail || employee?.email || 'N/A'}
                </span>
              </div>
            </div>

            {/* Comptes Sessions Windows & GP */}
            {accounts && (
              <div className="pt-2 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-slate-400" />
                    Identifiants de Connexion
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="text-[11px] text-red-600 hover:text-red-800 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {showPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPasswords ? 'Masquer MDP' : 'Afficher MDP'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium">Session Windows</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {accounts.windowsUsername}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      MDP: {showPasswords ? (accounts.windowsPassword || 'N/A') : '••••••••'}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium">Microsoft GP</div>
                    <div className="font-mono font-bold text-blue-700 mt-0.5">
                      {accounts.appUsername}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      MDP: {showPasswords ? (accounts.appPassword || 'N/A') : '••••••••'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Code-barres 1D (Code 128) */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col items-center select-none">
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <BarcodeIcon className="w-4 h-4 text-red-600" />
                <span>Code-barres 1D Code 128</span>
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 select-all">
                {asset.assetTag}
              </span>
            </div>

            <div className="my-2.5 p-2 bg-white rounded-lg flex flex-col items-center">
              <Barcode
                value={asset.assetTag}
                width={1.5}
                height={46}
                fontSize={11}
                displayValue={true}
              />
              <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Compatible douchette et lecteur optique USB</span>
              </div>
            </div>

            <div className="w-full flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleCopy('tag', asset.assetTag)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'tag' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedKey === 'tag' ? 'Copié !' : 'Copier Tag'}</span>
              </button>
              {onOpenEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEdit(asset);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Modifier Fiche
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Dernière mise à jour: {asset.updatedAt ? asset.updatedAt.slice(0, 10) : '2026-09-17'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
