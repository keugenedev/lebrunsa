'use client';

import React from 'react';
import { Employee } from '@/types/inventory';
import { 
  X, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { 
  getCompanyLogo, 
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
  if (!employee) return null;

  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const docRef = `FA-${(employee.company || 'LEB').slice(0, 3).toUpperCase()}-2026-${employee.employeeId || '001'}`;
  const leftLogo = '/Lebrunog.png';
  const rightLogo = getCompanyLogo(employee.company);

  const ws = employee.workstation || {
    type: 'Poste Fixe (Desktop)',
    pcName: 'Non renseigné',
    pcSerial: 'N/A',
    pcSpecs: 'Intel Core i5 - 16 GB RAM - SSD 500 GB - Windows 11 Pro',
    monitorModel: 'Dell 22"',
    monitorSerial: 'N/A',
    monitorObs: 'Good',
    keyboard: 'Clavier Dell Câble',
    keyboardDetails: 'Alpha-numérique',
    keyboardObs: 'Good',
    mouse: 'Dell',
    mouseDetails: 'Souris Bureau (Câble)',
    mouseObs: 'Good',
    generalState: 'Good',
    observations: 'Good'
  };

  const handlePrint = () => {
    printSingleAssignmentSheet(employee);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Controls Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold leading-tight flex items-center gap-2">
                <span>Fiche d&apos;Affectation Matériel IT</span>
                <span className="text-[11px] font-mono font-normal text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {docRef}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {employee.fullName} • {employee.company} • {employee.site || 'Delmas 52'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Prev / Next navigation */}
            {totalCount && totalCount > 1 && (
              <div className="hidden sm:flex items-center gap-1 mr-2 text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                <button 
                  onClick={onPrev}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                  title="Collaborateur précédent"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 text-[11px] font-mono">
                  {(currentIndex ?? 0) + 1} / {totalCount}
                </span>
                <button 
                  onClick={onNext}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                  title="Collaborateur suivant"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
              title="Lancer l'impression A4 ou enregistrer en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable A4 Preview Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-200/60">
          <div className="w-full max-w-[760px] bg-white shadow-xl border border-slate-300 rounded-lg p-6 sm:p-8 text-[11px] leading-snug space-y-4">
            
            {/* 1. Header with enlarged logos on Left and Right ONLY - NOTHING in between */}
            <div className="flex items-center justify-between pb-3.5 border-b-2 border-slate-900">
              {/* Lebrun S.A. Logo (Left) */}
              <div className="flex items-center justify-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={leftLogo} 
                  alt="Lebrun S.A." 
                  className="h-16 w-auto max-w-[180px] object-contain"
                />
              </div>

              {/* Subsidiary Logo (Right) */}
              <div className="flex items-center justify-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={rightLogo} 
                  alt={employee.company} 
                  className="h-16 w-auto max-w-[180px] object-contain"
                />
              </div>
            </div>

            {/* Document Title Block (Below Logos) */}
            <div className="text-center pt-1 pb-1">
              <div className="text-[10px] font-extrabold tracking-widest text-slate-600 uppercase">
                GROUPE LEBRUN S.A. • DIRECTION DES SYSTÈMES D&apos;INFORMATION (DSI)
              </div>
              <h1 className="text-base font-black text-slate-950 tracking-tight uppercase mt-0.5">
                FICHE D&apos;AFFECTATION DE MATÉRIEL INFORMATIQUE
              </h1>
              <div className="text-[9.5px] text-slate-500 italic">
                Procès-Verbal Officiel de Mise à Disposition & Décharge de Responsabilité
              </div>
              <div className="inline-flex items-center gap-2.5 mt-2 text-[9px] text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                <span><strong>RÉF :</strong> {docRef}</span>
                <span>•</span>
                <span><strong>DATE :</strong> {today}</span>
                <span>•</span>
                <span><strong>SITE :</strong> {employee.site || 'Delmas 52'}</span>
              </div>
            </div>

            {/* 2. Section 1: Identification du Collaborateur */}
            <div>
              <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-l-3 border-slate-900 pl-2 mb-1.5">
                1. IDENTIFICATION DU BÉNÉFICIAIRE (COLLABORATEUR)
              </div>
              <div className="border border-slate-200 rounded-md overflow-hidden text-[10px]">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/4 bg-slate-50 p-1.5 font-semibold text-slate-600 border-r border-slate-200">
                        Nom de la personne :
                      </td>
                      <td className="w-1/4 p-1.5 font-bold text-slate-900 border-r border-slate-200">
                        {employee.fullName}
                      </td>
                      <td className="w-1/4 bg-slate-50 p-1.5 font-semibold text-slate-600 border-r border-slate-200">
                        Matricule Salarié :
                      </td>
                      <td className="w-1/4 p-1.5 font-mono font-bold text-slate-900">
                        {employee.employeeId}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-600 border-r border-slate-200">
                        Entreprise / Filiale :
                      </td>
                      <td className="p-1.5 font-bold text-slate-800 border-r border-slate-200">
                        {employee.company}
                      </td>
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-600 border-r border-slate-200">
                        Site / Localisation :
                      </td>
                      <td className="p-1.5 text-slate-700">
                        {employee.site || employee.location || 'Delmas 52'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-600 border-r border-slate-200">
                        Fonction / Poste :
                      </td>
                      <td className="p-1.5 text-slate-800 border-r border-slate-200">
                        {employee.jobTitle || 'Collaborateur'}
                      </td>
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-600 border-r border-slate-200">
                        Département :
                      </td>
                      <td className="p-1.5 text-slate-700">
                        {employee.department || 'Administration & Opérations'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-600 border-r border-slate-200">
                        Email Professionnel :
                      </td>
                      <td className="p-1.5 text-slate-700 border-r border-slate-200">
                        {employee.email || 'N/A'}
                      </td>
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-600 border-r border-slate-200">
                        Téléphone :
                      </td>
                      <td className="p-1.5 text-slate-700">
                        {employee.phone || 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-600 border-r border-slate-200">
                        Session Windows :
                      </td>
                      <td className="p-1.5 font-mono text-slate-800 border-r border-slate-200">
                        {employee.accounts?.windowsUsername || 'Admin'}
                      </td>
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-600 border-r border-slate-200">
                        Identifiant ERP (GP) :
                      </td>
                      <td className="p-1.5 font-mono text-slate-800">
                        {employee.accounts?.appUsername || 'N/A'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Section 2: Équipements Assignés avec Détails Complets (PC, Écran, Clavier, Souris) */}
            <div>
              <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-l-3 border-slate-900 pl-2 mb-1.5">
                2. ÉQUIPEMENTS ASSIGNÉS & DÉTAILS COMPLETS DU MATÉRIEL
              </div>
              <div className="border border-slate-200 rounded-md overflow-hidden text-[10px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[9px] uppercase tracking-wider">
                      <th className="p-1.5 text-left font-bold border-r border-slate-800" style={{ width: '22%' }}>Composant</th>
                      <th className="p-1.5 text-left font-bold border-r border-slate-800" style={{ width: '36%' }}>Désignation, Marque & Modèle</th>
                      <th className="p-1.5 text-left font-bold border-r border-slate-800" style={{ width: '24%' }}>N° de Série (S/N) / Hostname</th>
                      <th className="p-1.5 text-center font-bold" style={{ width: '18%' }}>État & Observations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {/* Unité Centrale / PC */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-1.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">Ordinateur / UC</div>
                        <div className="text-[9px] text-slate-500">{ws.type || 'Desktop'}</div>
                      </td>
                      <td className="p-1.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{ws.pcName || 'Dell OptiPlex'}</div>
                        <div className="text-[9px] text-slate-600">{ws.pcSpecs || 'Windows 11 Pro - Core i5 - 16GB - SSD 500GB'}</div>
                      </td>
                      <td className="p-1.5 font-mono text-[9.5px] border-r border-slate-200">
                        <strong>S/N :</strong> {ws.pcSerial || 'N/A'}
                      </td>
                      <td className="p-1.5 text-center">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {ws.generalState || 'Good / Conforme'}
                        </span>
                      </td>
                    </tr>

                    {/* Écran / Moniteur */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-1.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">Écran / Moniteur</div>
                        <div className="text-[9px] text-slate-500">Affichage principal</div>
                      </td>
                      <td className="p-1.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{ws.monitorModel || 'Dell 22"'}</div>
                        <div className="text-[9px] text-slate-600">Écran professionnel Full HD avec pied réglable</div>
                      </td>
                      <td className="p-1.5 font-mono text-[9.5px] border-r border-slate-200">
                        <strong>S/N :</strong> {ws.monitorSerial || 'N/A'}
                      </td>
                      <td className="p-1.5 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                          ws.monitorObs?.toLowerCase().includes('deffect') 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {ws.monitorObs || 'Good'}
                        </span>
                      </td>
                    </tr>

                    {/* Clavier */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-1.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">Clavier</div>
                        <div className="text-[9px] text-slate-500">Périphérique de saisie</div>
                      </td>
                      <td className="p-1.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{ws.keyboard || 'Clavier Dell'}</div>
                        <div className="text-[9px] text-slate-600">Détails : {ws.keyboardDetails || 'Alpha-numérique'}</div>
                      </td>
                      <td className="p-1.5 font-mono text-[9px] text-slate-600 border-r border-slate-200">
                        Rattaché au poste {ws.pcName}
                      </td>
                      <td className="p-1.5 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                          ws.keyboardObs?.toLowerCase().includes('deffect') 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {ws.keyboardObs || 'Good / Fonctionnel'}
                        </span>
                      </td>
                    </tr>

                    {/* Souris */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-1.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">Souris</div>
                        <div className="text-[9px] text-slate-500">Dispositif de pointage</div>
                      </td>
                      <td className="p-1.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{ws.mouse || 'Souris Dell'}</div>
                        <div className="text-[9px] text-slate-600">Détails : {ws.mouseDetails || 'Souris Bureau Ergonomique'}</div>
                      </td>
                      <td className="p-1.5 font-mono text-[9px] text-slate-600 border-r border-slate-200">
                        Rattachée au poste {ws.pcName}
                      </td>
                      <td className="p-1.5 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                          ws.mouseObs?.toLowerCase().includes('deffect') 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {ws.mouseObs || 'Good / Fonctionnel'}
                        </span>
                      </td>
                    </tr>

                    {/* Accessoires & Câblage */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-1.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">Connectique</div>
                        <div className="text-[9px] text-slate-500">Alimentation & Vidéo</div>
                      </td>
                      <td className="p-1.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">Câble alimentation 110/220V + Câble vidéo HDMI/DP</div>
                        <div className="text-[9px] text-slate-600">Kit officiel vérifié et certifié conforme</div>
                      </td>
                      <td className="p-1.5 font-mono text-[9px] text-slate-600 border-r border-slate-200">
                        Kit standard
                      </td>
                      <td className="p-1.5 text-center">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Complet
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Section 3: Engagement Formel & Décharge (AUCUN PRIX) */}
            <div className="bg-slate-50 border border-slate-300 rounded-md p-2.5 space-y-1">
              <div className="text-[10px] font-bold text-slate-900 uppercase border-b border-slate-200 pb-1">
                3. ENGAGEMENT FORMEL & DÉCHARGE DE RESPONSABILITÉ
              </div>
              <p className="text-[8.5px] text-slate-600 leading-relaxed text-justify">
                Le collaborateur soussigné déclare expressément avoir reçu en main propre ce jour la totalité des équipements et accessoires informatiques mentionnés ci-dessus, configurés et reconnus en parfait état d&apos;usage et de fonctionnement. Il s&apos;engage à en assurer la garde vigilante, à les utiliser exclusivement dans l&apos;exercice strict de ses fonctions professionnelles et en conformité intégrale avec la Politique de Sécurité des Systèmes d&apos;Information (PSSI) du Groupe Lebrun S.A. En cas de départ, résiliation du contrat de travail, réaffectation ou sur simple demande de la Direction Générale ou de la DSI, l&apos;ensemble du matériel devra être restitué immédiatement dans son état d&apos;origine.
              </p>
            </div>

            {/* 5. Section 4: Cadre des Signatures */}
            <div>
              <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-l-3 border-slate-900 pl-2 mb-1.5">
                4. VISAS, ATTESTATIONS & SIGNATURES OBLIGATOIRES
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Cadre Salarié */}
                <div className="border border-slate-300 rounded-md p-2.5 bg-white relative">
                  <div className="text-[9px] font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-1">
                    LE BÉNÉFICIAIRE / SALARIÉ
                  </div>
                  <div className="text-[10px] font-semibold text-slate-900">{employee.fullName}</div>
                  <div className="text-[8.5px] text-slate-500 italic mt-0.5">
                    Mention manuscrite obligatoire : « Lu et approuvé, matériel reçu conforme »
                  </div>
                  <div className="text-[9px] text-slate-600 mt-1 font-medium">
                    Date : ______ / ______ / 2026
                  </div>
                  <div className="h-12 border-t border-dashed border-slate-300 mt-1 pt-1 text-[8.5px] text-slate-400 italic">
                    Signature du salarié :
                  </div>
                </div>

                {/* Cadre DSI */}
                <div className="border border-slate-300 rounded-md p-2.5 bg-white relative">
                  <div className="text-[9px] font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-1">
                    POUR LA DIRECTION INFORMATIQUE (DSI)
                  </div>
                  <div className="text-[10px] font-semibold text-slate-900">
                    M. Kensly Eugene / Direction IT Groupe Lebrun
                  </div>
                  <div className="text-[8.5px] text-slate-500 italic mt-0.5">
                    Mention : « Matériel vérifié, audité et remis conforme »
                  </div>
                  <div className="text-[9px] text-slate-600 mt-1 font-medium">
                    Date : {today}
                  </div>
                  <div className="h-12 border-t border-dashed border-slate-300 mt-1 pt-1 text-[8.5px] text-slate-400 italic">
                    Signature & Visa DSI :
                  </div>

                  {/* Stamp */}
                  <div className="absolute right-2 bottom-2 border border-emerald-600 rounded bg-emerald-50/85 px-2 py-1 text-center -rotate-3 pointer-events-none">
                    <div className="text-[7.5px] font-extrabold text-slate-900 tracking-wider">GROUPE LEBRUN S.A.</div>
                    <div className="text-[7px] text-slate-600">DIRECTION IT & SYSTÈMES</div>
                    <div className="text-[7.5px] font-bold text-emerald-700 tracking-wider">VISA CONFORME</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Footer */}
            <div className="flex justify-between items-center text-[8px] text-slate-500 border-t border-slate-200 pt-2">
              <span>Groupe Lebrun S.A. • Delmas 52 / Pétion-Ville • Port-au-Prince, Haïti</span>
              <span>Fiche officielle d&apos;affectation individuelle IT • Page 1 / 1</span>
              <span>Système Centralisé de Gestion IT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
