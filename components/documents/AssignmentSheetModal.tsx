'use client';

import React, { useState } from 'react';
import { Employee } from '@/types/inventory';
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
  getCompanyLogo, 
  printSingleAssignmentSheet,
  downloadSingleAssignmentSheetPDF
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
  const [isDownloading, setIsDownloading] = useState(false);

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
    monitorObs: 'Conforme',
    keyboard: 'Clavier Dell Câble',
    keyboardDetails: 'Alpha-numérique',
    keyboardObs: 'Conforme',
    mouse: 'Dell',
    mouseDetails: 'Souris Bureau (Câble)',
    mouseObs: 'Conforme',
    generalState: 'Conforme',
    observations: 'Conforme'
  };

  const handlePrint = () => {
    printSingleAssignmentSheet(employee);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadSingleAssignmentSheetPDF(employee);
    } catch (err) {
      console.error('Erreur téléchargement PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const renderBadge = (obs?: string, defaultLabel = 'CONFORME') => {
    const val = (obs || defaultLabel).toUpperCase();
    const isDefect = val.includes('DEFFECT') || val.includes('DÉFAUT') || val.includes('PANNE');
    return (
      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider ${
        isDefect 
          ? 'bg-slate-900 text-white border border-slate-900' 
          : 'bg-white text-slate-900 border border-slate-800'
      }`}>
        {val}
      </span>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre de contrôle du Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-slate-300" />
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
            {/* Navigation Précédent / Suivant */}
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

            {/* Bouton Télécharger PDF Direct */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold border border-slate-300 shadow-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              title="Télécharger directement le fichier PDF (A4) sur votre ordinateur"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-800" />
              ) : (
                <Download className="w-3.5 h-3.5 text-slate-800" />
              )}
              <span>{isDownloading ? 'Génération...' : 'Télécharger PDF'}</span>
            </button>

            {/* Bouton Imprimer */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 shadow-xs transition-colors cursor-pointer active:scale-95"
              title="Lancer l'impression directe au format A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Aperçu fidèle Feuille A4 Monochrome */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-200/70">
          <div className="w-full max-w-[760px] bg-white shadow-xl border border-slate-400 rounded-sm p-6 sm:p-7 text-[10px] leading-snug space-y-3.5 text-black">
            
            {/* 1. En-tête officiel avec Logos N&B */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              {/* Logo Lebrun S.A. (Gauche) */}
              <div className="flex items-center justify-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={leftLogo} 
                  alt="Lebrun S.A." 
                  className="h-13 w-auto max-w-[170px] object-contain grayscale"
                />
              </div>

              {/* Titre Institutionnel Central */}
              <div className="text-center px-2">
                <div className="text-[11px] font-black tracking-wider text-black uppercase">
                  LEBRUN S.A.
                </div>
                <div className="text-[8px] text-slate-600 uppercase tracking-wide mt-0.5">
                  Direction des Systèmes d&apos;Information (DSI) • Service Parc & Matériel
                </div>
              </div>

              {/* Logo Filiale (Droite) */}
              <div className="flex items-center justify-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={rightLogo} 
                  alt={employee.company} 
                  className="h-13 w-auto max-w-[170px] object-contain grayscale"
                />
              </div>
            </div>

            {/* Bloc Titre du Document */}
            <div className="text-center pt-0.5 pb-0.5">
              <h1 className="text-sm font-black text-black tracking-tight uppercase">
                FICHE D&apos;AFFECTATION DE MATÉRIEL INFORMATIQUE
              </h1>
              <div className="text-[9px] text-slate-700 italic">
                Procès-Verbal Officiel de Remise de Matériel & Décharge de Responsabilité
              </div>
              <div className="inline-flex items-center gap-3 mt-1.5 text-[8.5px] text-black bg-slate-100 px-3 py-0.5 rounded border border-slate-400">
                <span><strong>RÉF :</strong> {docRef}</span>
                <span className="text-slate-400">|</span>
                <span><strong>DATE :</strong> {today}</span>
                <span className="text-slate-400">|</span>
                <span><strong>SITE :</strong> {employee.site || 'Delmas 52'}</span>
              </div>
            </div>

            {/* 2. Section 1 : Identification du Bénéficiaire */}
            <div>
              <div className="text-[9.5px] font-bold text-black uppercase tracking-wider border-l-3 border-black pl-1.5 mb-1">
                1. IDENTIFICATION DU COLLABORATEUR (BÉNÉFICIAIRE)
              </div>
              <div className="border border-slate-400 rounded-none overflow-hidden text-[9.5px]">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-400">
                      <td className="w-1/4 bg-slate-50 p-1.5 font-semibold text-slate-700 border-r border-slate-400">
                        Nom & Prénom :
                      </td>
                      <td className="w-1/4 p-1.5 font-bold text-black border-r border-slate-400">
                        {employee.fullName}
                      </td>
                      <td className="w-1/4 bg-slate-50 p-1.5 font-semibold text-slate-700 border-r border-slate-400">
                        Matricule Salarié :
                      </td>
                      <td className="w-1/4 p-1.5 font-mono font-bold text-black">
                        {employee.employeeId}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-700 border-r border-slate-400">
                        Entreprise / Entité :
                      </td>
                      <td className="p-1.5 font-bold text-black border-r border-slate-400">
                        {employee.company}
                      </td>
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-700 border-r border-slate-400">
                        Site / Localisation :
                      </td>
                      <td className="p-1.5 text-black">
                        {employee.site || employee.location || 'Delmas 52'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-700 border-r border-slate-400">
                        Fonction / Poste :
                      </td>
                      <td className="p-1.5 text-black border-r border-slate-400">
                        {employee.jobTitle || 'Collaborateur'}
                      </td>
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-700 border-r border-slate-400">
                        Département / Service :
                      </td>
                      <td className="p-1.5 text-black">
                        {employee.department || 'Opérations & Administration'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-700 border-r border-slate-400">
                        Email Professionnel :
                      </td>
                      <td className="p-1.5 text-black border-r border-slate-400">
                        {employee.email || 'N/A'}
                      </td>
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-700 border-r border-slate-400">
                        Téléphone :
                      </td>
                      <td className="p-1.5 text-black">
                        {employee.phone || 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-700 border-r border-slate-400">
                        Session Windows :
                      </td>
                      <td className="p-1.5 font-mono text-black border-r border-slate-400">
                        {employee.accounts?.windowsUsername || 'Admin'}
                      </td>
                      <td className="bg-slate-50 p-1.5 font-semibold text-slate-700 border-r border-slate-400">
                        Identifiant ERP (GP) :
                      </td>
                      <td className="p-1.5 font-mono text-black">
                        {employee.accounts?.appUsername || 'N/A'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Section 2 : Équipements Assignés */}
            <div>
              <div className="text-[9.5px] font-bold text-black uppercase tracking-wider border-l-3 border-black pl-1.5 mb-1">
                2. INVENTAIRE DU MATÉRIEL & ÉQUIPEMENTS ASSIGNÉS
              </div>
              <div className="border border-slate-400 rounded-none overflow-hidden text-[9.5px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[8.5px] uppercase tracking-wider">
                      <th className="p-1.5 text-left font-bold border-r border-slate-800" style={{ width: '22%' }}>Composant</th>
                      <th className="p-1.5 text-left font-bold border-r border-slate-800" style={{ width: '40%' }}>Désignation, Marque & Modèle</th>
                      <th className="p-1.5 text-left font-bold border-r border-slate-800" style={{ width: '23%' }}>N° de Série (S/N) / Hostname</th>
                      <th className="p-1.5 text-center font-bold" style={{ width: '15%' }}>État Constaté</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-400">
                    {/* Unité Centrale / PC */}
                    <tr>
                      <td className="p-1.5 border-r border-slate-400">
                        <div className="font-bold text-black">Ordinateur / UC</div>
                        <div className="text-[8px] text-slate-600">{ws.type || 'Poste Fixe'}</div>
                      </td>
                      <td className="p-1.5 border-r border-slate-400">
                        <div className="font-bold text-black">{ws.pcName || 'Workstation Dell'}</div>
                        <div className="text-[8px] text-slate-700">{ws.pcSpecs || 'Intel Core i5 - 16 GB RAM - SSD 500 GB - Windows 11 Pro'}</div>
                      </td>
                      <td className="p-1.5 font-mono text-[9px] border-r border-slate-400">
                        <strong>S/N :</strong> {ws.pcSerial || 'N/A'}
                      </td>
                      <td className="p-1.5 text-center">
                        {renderBadge(ws.generalState, 'CONFORME')}
                      </td>
                    </tr>

                    {/* Écran / Moniteur */}
                    <tr>
                      <td className="p-1.5 border-r border-slate-400">
                        <div className="font-bold text-black">Écran / Moniteur</div>
                        <div className="text-[8px] text-slate-600">Affichage principal</div>
                      </td>
                      <td className="p-1.5 border-r border-slate-400">
                        <div className="font-bold text-black">{ws.monitorModel || 'Écran Dell Professional 22"'}</div>
                        <div className="text-[8px] text-slate-700">Écran professionnel haute résolution avec pied réglable</div>
                      </td>
                      <td className="p-1.5 font-mono text-[9px] border-r border-slate-400">
                        <strong>S/N :</strong> {ws.monitorSerial || 'N/A'}
                      </td>
                      <td className="p-1.5 text-center">
                        {renderBadge(ws.monitorObs, 'CONFORME')}
                      </td>
                    </tr>

                    {/* Clavier */}
                    <tr>
                      <td className="p-1.5 border-r border-slate-400">
                        <div className="font-bold text-black">Clavier</div>
                        <div className="text-[8px] text-slate-600">Périphérique de saisie</div>
                      </td>
                      <td className="p-1.5 border-r border-slate-400">
                        <div className="font-bold text-black">{ws.keyboard || 'Clavier Dell Standard'}</div>
                        <div className="text-[8px] text-slate-700">Format : {ws.keyboardDetails || 'Alpha-numérique USB'}</div>
                      </td>
                      <td className="p-1.5 font-mono text-[8.5px] text-slate-600 border-r border-slate-400">
                        Rattaché au poste {ws.pcName}
                      </td>
                      <td className="p-1.5 text-center">
                        {renderBadge(ws.keyboardObs, 'CONFORME')}
                      </td>
                    </tr>

                    {/* Souris */}
                    <tr>
                      <td className="p-1.5 border-r border-slate-400">
                        <div className="font-bold text-black">Souris</div>
                        <div className="text-[8px] text-slate-600">Dispositif de pointage</div>
                      </td>
                      <td className="p-1.5 border-r border-slate-400">
                        <div className="font-bold text-black">{ws.mouse || 'Souris Dell'}</div>
                        <div className="text-[8px] text-slate-700">Format : {ws.mouseDetails || 'Souris optique filaire'}</div>
                      </td>
                      <td className="p-1.5 font-mono text-[8.5px] text-slate-600 border-r border-slate-400">
                        Rattachée au poste {ws.pcName}
                      </td>
                      <td className="p-1.5 text-center">
                        {renderBadge(ws.mouseObs, 'CONFORME')}
                      </td>
                    </tr>

                    {/* Câblage & Accessoires */}
                    <tr>
                      <td className="p-1.5 border-r border-slate-400">
                        <div className="font-bold text-black">Connectique</div>
                        <div className="text-[8px] text-slate-600">Alimentation & Vidéo</div>
                      </td>
                      <td className="p-1.5 border-r border-slate-400">
                        <div className="font-bold text-black">Lot Câble d&apos;Alimentation & Câble Vidéo</div>
                        <div className="text-[8px] text-slate-700">Cordon secteur tripolaire + Câble HDMI / DisplayPort</div>
                      </td>
                      <td className="p-1.5 font-mono text-[8.5px] text-slate-600 border-r border-slate-400">
                        Lot certifié standard
                      </td>
                      <td className="p-1.5 text-center">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold border border-slate-800 bg-white text-slate-900">
                          CONFORME
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Section 3 : Engagement Formel & Décharge */}
            <div className="bg-slate-50 border border-slate-400 rounded-none p-2 space-y-1">
              <div className="text-[8.5px] font-bold text-black uppercase border-b border-slate-300 pb-0.5">
                3. ENGAGEMENT FORMEL & DÉCHARGE DE RESPONSABILITÉ
              </div>
              <p className="text-[8px] text-slate-800 leading-relaxed text-justify">
                Le collaborateur soussigné certifie expressément avoir reçu en main propre ce jour la totalité des équipements, périphériques et accessoires mentionnés ci-dessus, configurés et reconnus en bon état de fonctionnement. Il s&apos;engage à en assurer la garde vigilante, à les utiliser exclusivement dans le cadre de ses missions professionnelles conformément à la charte informatique et à la Politique de Sécurité des Systèmes d&apos;Information (PSSI) de Lebrun S.A. En cas de départ de l&apos;entreprise, mutation, fin de contrat ou sur simple demande de la DSI ou de la Direction Générale, le matériel devra être immédiatement restitué dans son état d&apos;origine.
              </p>
            </div>

            {/* 5. Section 4 : Cadre des Signatures & Sceau Physique (Sans faux sceau) */}
            <div>
              <div className="text-[9.5px] font-bold text-black uppercase tracking-wider border-l-3 border-black pl-1.5 mb-1">
                4. VISAS, SIGNATURES & VALIDATION OFFICIELLE
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Cadre Salarié */}
                <div className="border border-slate-400 rounded-none p-2 bg-white">
                  <div className="text-[8.5px] font-bold text-black uppercase border-b border-slate-200 pb-0.5 mb-1">
                    LE COLLABORATEUR / BÉNÉFICIAIRE
                  </div>
                  <div className="text-[9.5px] font-bold text-black">{employee.fullName}</div>
                  <div className="text-[7.5px] text-slate-600 italic mt-0.5">
                    Mention manuscrite obligatoire : « Lu et approuvé, matériel reçu conforme »
                  </div>
                  <div className="text-[8px] text-slate-700 mt-1 font-medium">
                    Date : ______ / ______ / 2026
                  </div>
                  <div className="h-12 border-t border-dashed border-slate-400 mt-1 pt-1 text-[7.5px] text-slate-500 italic">
                    Signature manuscrite du collaborateur :
                  </div>
                </div>

                {/* Cadre DSI avec Espace réservé au vrai Sceau Physique */}
                <div className="border border-slate-400 rounded-none p-2 bg-white">
                  <div className="text-[8.5px] font-bold text-black uppercase border-b border-slate-200 pb-0.5 mb-1">
                    POUR LA DIRECTION DES SYSTÈMES D&apos;INFORMATION (DSI)
                  </div>
                  <div className="text-[9.5px] font-bold text-black">
                    Direction Informatique / Lebrun S.A.
                  </div>
                  <div className="text-[7.5px] text-slate-600 italic mt-0.5">
                    Mention : « Matériel audité, configuré et remis conforme »
                  </div>
                  <div className="text-[8px] text-slate-700 mt-1 font-medium">
                    Date : {today}
                  </div>
                  
                  {/* Signature DSI + Cadre Sceau Physique Réel */}
                  <div className="flex items-end justify-between gap-2 mt-1">
                    <div className="h-12 flex-1 border-t border-dashed border-slate-400 pt-1 text-[7.5px] text-slate-500 italic">
                      Signature & Visa DSI :
                    </div>
                    {/* Emplacement réservé au Sceau Officiel réel (Pas de faux sceau) */}
                    <div className="w-34 h-12 border border-dashed border-slate-500 rounded-none flex flex-col items-center justify-center text-center bg-slate-50 px-1 shrink-0">
                      <div className="text-[6.5px] font-extrabold text-black uppercase tracking-tight">
                        CADRE RÉSERVÉ AU SCEAU OFFICIEL
                      </div>
                      <div className="text-[5.5px] text-slate-500 mt-0.5">
                        (Apposition du tampon encreur physique)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Bas de page */}
            <div className="flex justify-between items-center text-[7px] text-slate-600 border-t border-slate-300 pt-1.5">
              <span>Lebrun S.A. • Delmas 52 / Pétion-Ville • Port-au-Prince, Haïti</span>
              <span>Fiche officielle d&apos;affectation individuelle IT • Exemplaire Original • Page 1 / 1</span>
              <span>Système Centralisé de Gestion IT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
