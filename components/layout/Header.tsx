'use client';

import React from 'react';
import { useInventory, NavigationTab } from '@/context/InventoryContext';
import { 
  Search, 
  ChevronRight, 
  Download,
  Building2, 
  Barcode, 
  Plus 
} from 'lucide-react';

export default function Header() {
  const { 
    activeTab, 
    exportCSV, 
    setIsSpotlightOpen, 
    setActiveTab, 
    openAddModal, 
    openBarcodeScanner 
  } = useInventory();

  const getTabLabel = (tab: NavigationTab) => {
    switch (tab) {
      case 'overview': return 'Tableau de Bord Consolidé';
      case 'printers': return 'Parc Imprimantes HP';
      case 'it': return 'Postes Informatiques & Postes de Travail';
      case 'personnel': return 'Personnel & Badges Scannables';
      case 'settings': return 'Paramètres & Synchronisation';
      default: return 'Gestion de Parc';
    }
  };

  return (
    <header className="h-14 border-b border-slate-200/90 bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
      {/* Breadcrumbs & Organization */}
      <div className="flex items-center gap-2 text-xs">
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold cursor-pointer hover:bg-slate-200 transition-colors" 
          onClick={() => setActiveTab('overview')}
        >
          <Building2 className="w-3.5 h-3.5 text-red-600" />
          <span>Lebrun S.A. Groupe</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-red-600 font-bold tracking-tight">
          {getTabLabel(activeTab)}
        </span>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-lg mx-6">
        <div 
          onClick={() => setIsSpotlightOpen(true)}
          className="relative flex items-center w-full px-3 py-1.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-300 text-xs text-slate-500 hover:text-slate-800 transition-all cursor-pointer group shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 mr-2.5 transition-colors shrink-0" />
          <span className="flex-1 text-slate-400 group-hover:text-slate-600 truncate text-xs">
            Rechercher imprimante, modèle, numéro de série, adresse IP, collaborateur...
          </span>
          <div className="flex items-center gap-0.5 font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs shrink-0">
            <span>Ctrl</span>
            <span>+</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Scanner Code-barres Trigger Button */}
        <button
          onClick={openBarcodeScanner}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          title="Ouvrir la station de lecture code-barres"
        >
          <Barcode className="w-4 h-4 text-red-600" />
          <span className="hidden sm:inline">Scanner Code-barres</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline" />
        </button>


        {/* Quick Export CSV */}
        <button
          onClick={() => exportCSV(activeTab === 'printers' ? 'printers' : activeTab === 'personnel' ? 'personnel' : 'it')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all cursor-pointer"
          title="Exporter la liste en CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden xl:inline">Export CSV</span>
        </button>

        {/* Primary Action Button */}
        {activeTab === 'it' && (
          <button
            onClick={() => openAddModal('it')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Matériel</span>
          </button>
        )}
      </div>
    </header>
  );
}
