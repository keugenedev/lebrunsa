'use client';

import React from 'react';
import { useInventory, NavigationTab } from '@/context/InventoryContext';
import { 
  Search, 
  ChevronRight, 
  Download,
  Building2, 
  Barcode 
} from 'lucide-react';

export default function Header() {
  const { 
    activeTab, 
    exportCSV, 
    setIsSpotlightOpen, 
    setActiveTab, 
    openBarcodeScanner
  } = useInventory();

  const getTabLabel = (tab: NavigationTab) => {
    switch (tab) {
      case 'overview': return 'Dashboard';
      case 'printers': return 'Imprimantes';
      case 'it': return 'Postes IT & Workstations';
      case 'network': return 'Équipements Réseau';
      case 'ups': return 'Onduleurs & Alimentation';
      case 'applications': return 'Comptes & Applications';
      case 'personnel': return 'Personnel & Collaborateurs';
      case 'accounts': return 'Comptes';
      case 'documents': return 'Documents & Procédures';
      case 'phones': return 'Téléphones & Portables';
      case 'tags': return 'Tags & Code-Barres';
      case 'badges': return 'Badges & Cartes d\'Accès';
      case 'settings': return 'Paramètres & Configuration';
      default: return 'Gestion de Parc';
    }
  };

  const getSearchPlaceholder = (tab: NavigationTab) => {
    switch (tab) {
      case 'it': return 'Rechercher poste IT, Dell, S/N, processeur, collaborateur...';
      case 'printers': return 'Rechercher imprimante, marque, modèle, adresse IP, S/N...';
      case 'network': return 'Rechercher équipement réseau, switch, IP, MAC...';
      case 'ups': return 'Rechercher onduleur APC, puissance VA, modèle, S/N...';
      case 'applications': return 'Rechercher compte utilisateur, application GP, identifiant...';
      case 'personnel': return 'Rechercher collaborateur, nom, matricule, département...';
      case 'accounts': return 'Rechercher compte, nom, rôle, email...';
      case 'documents': return 'Rechercher document, procédure, contrat, référence...';
      case 'phones': return 'Rechercher téléphone, marque, modèle, IMEI, personne...';
      case 'tags': return 'Rechercher tag, code-barres, entreprise, site, équipement...';
      case 'badges': return 'Rechercher badge, collaborateur, matricule, poste, Caribe Motors...';
      default: return 'Rechercher équipement, numéro de série, collaborateur...';
    }
  };

  return (
    <header className="h-14 border-b border-slate-200/90 bg-white px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95 shrink-0 overflow-hidden select-none">
      {/* Breadcrumbs & Organization */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0 min-w-0">
        <div 
          className="flex items-center gap-1.5 text-slate-700 font-semibold cursor-pointer hover:text-slate-900 transition-colors shrink-0" 
          onClick={() => setActiveTab('overview')}
        >
          <Building2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
          <span className="whitespace-nowrap">Lebrun S.A.</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span className="text-slate-900 font-bold tracking-tight whitespace-nowrap truncate max-w-[180px] sm:max-w-[260px] md:max-w-none">
          {getTabLabel(activeTab)}
        </span>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-2 sm:mx-3 md:mx-4 min-w-[120px]">
        <div 
          onClick={() => setIsSpotlightOpen(true)}
          className="relative flex items-center w-full px-3 py-1.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-300 text-xs text-slate-500 hover:text-slate-800 transition-all cursor-pointer group shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 mr-2 transition-colors shrink-0" />
          <span className="flex-1 text-slate-400 group-hover:text-slate-600 truncate text-xs">
            {getSearchPlaceholder(activeTab)}
          </span>
          <div className="hidden md:flex items-center gap-0.5 font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs shrink-0 ml-1.5">
            <span>Ctrl</span>
            <span>+</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Controls - Identical to Main Page, robust on 15.6" PCs */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Scanner Code-barres Trigger Button */}
        <button
          onClick={() => openBarcodeScanner()}
          className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 text-xs font-semibold transition-all cursor-pointer shrink-0"
          title="Ouvrir la station de lecture code-barres"
        >
          <Barcode className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">Scanner Code-barres</span>
        </button>

        {/* Quick Export Excel */}
        <button
          onClick={() => {
            const validTabs: Record<string, any> = {
              printers: 'printers',
              personnel: 'personnel',
              accounts: 'accounts',
              documents: 'documents',
              applications: 'applications',
              network: 'network',
              ups: 'ups',
              phones: 'phones',
              it: 'it'
            };
            exportCSV(validTabs[activeTab] || 'it');
          }}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 text-xs font-semibold transition-all cursor-pointer shrink-0"
          title="Exporter la liste en Excel"
        >
          <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="hidden md:inline whitespace-nowrap">Export Excel</span>
        </button>
      </div>
    </header>
  );
}
