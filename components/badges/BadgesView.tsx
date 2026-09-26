'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Employee } from '@/types/inventory';
import BadgeCard from './BadgeCard';
import { getBrandConfig } from '@/lib/badgeBrands';
import { 
  downloadSingleBadgeCR80PDF, 
  downloadBadgePlancheA4PDF, 
  downloadBatchBadgesPDF 
} from '@/lib/printBadgePDF';
import { 
  IdCard, 
  Search, 
  Printer, 
  CheckSquare, 
  Square, 
  Layers, 
  MapPin, 
  FileDown
} from 'lucide-react';

export default function BadgesView() {
  const { employees = [] } = useInventory();

  // Filtres
  const [selectedBrandKey, setSelectedBrandKey] = useState<string>('caribe');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'both' | 'single'>('both');
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // Sites disponibles
  const availableSites = useMemo(() => {
    const sites = new Set<string>();
    employees.forEach(emp => {
      if (emp.site) sites.add(emp.site);
      else if (emp.location) sites.add(emp.location);
    });
    return Array.from(sites).sort();
  }, [employees]);

  // Filtrage des collaborateurs
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Filtre marque
      if (selectedBrandKey !== 'all') {
        const brand = getBrandConfig(emp.company);
        if (brand.id !== selectedBrandKey) return false;
      }

      // Filtre site
      if (selectedSite !== 'all') {
        const site = emp.site || emp.location;
        if (site !== selectedSite) return false;
      }

      // Recherche textuelle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (emp.fullName || '').toLowerCase().includes(q);
        const matchesId = (emp.employeeId || '').toLowerCase().includes(q);
        const matchesTitle = (emp.jobTitle || '').toLowerCase().includes(q);
        const matchesDept = (emp.department || '').toLowerCase().includes(q);
        const matchesPhone = (emp.phone || '').toLowerCase().includes(q);
        const matchesCompany = (emp.company || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesTitle && !matchesDept && !matchesPhone && !matchesCompany) {
          return false;
        }
      }

      return true;
    });
  }, [employees, selectedBrandKey, selectedSite, searchQuery]);

  // Gestion sélection multiple
  const toggleSelectAll = () => {
    if (selectedEmployeeIds.size === filteredEmployees.length) {
      setSelectedEmployeeIds(new Set());
    } else {
      setSelectedEmployeeIds(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedEmployeeIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEmployeeIds(next);
  };

  // Téléchargement groupé
  const handleBatchDownloadPDF = async () => {
    const targetEmployees = selectedEmployeeIds.size > 0
      ? filteredEmployees.filter(e => selectedEmployeeIds.has(e.id))
      : filteredEmployees;

    if (targetEmployees.length === 0) return;

    setBatchProgress({ current: 0, total: targetEmployees.length * 2 });
    try {
      await downloadBatchBadgesPDF(targetEmployees, (current, total) => {
        setBatchProgress({ current, total });
      });
    } catch (err) {
      console.error('Erreur téléchargement groupé:', err);
    } finally {
      setBatchProgress(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const caribeCount = useMemo(() => {
    return employees.filter(e => getBrandConfig(e.company).id === 'caribe').length;
  }, [employees]);

  return (
    <div className="space-y-5 pb-12 font-sans">
      {/* Styles d'impression dédiée */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          header, aside, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .badge-print-area {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 15mm !important;
            justify-content: center !important;
            page-break-after: always !important;
          }
          .badge-front, .badge-back {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* HEADER SECTION BADGES */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-slate-100 text-slate-800">
                <IdCard className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Badges d&apos;Identification
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Format CR80 vertical (5.40 cm × 8.56 cm) • Recto-Verso • Montserrat
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handleBatchDownloadPDF}
              disabled={Boolean(batchProgress)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Télécharger les badges en PDF"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>
                {batchProgress 
                  ? `Génération (${batchProgress.current}/${batchProgress.total})...`
                  : selectedEmployeeIds.size > 0 
                    ? `Télécharger PDF (${selectedEmployeeIds.size})` 
                    : `Télécharger Tout (${filteredEmployees.length})`}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs shadow-2xs transition-all cursor-pointer"
              title="Imprimer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>

        {/* ONGLETS MARQUES : Respect des vraies couleurs */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Caribe Motors (Bleu et Vert Lime) */}
            <button
              onClick={() => setSelectedBrandKey('caribe')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedBrandKey === 'caribe'
                  ? 'bg-[#0A2540] text-white shadow-xs ring-2 ring-[#52BA23]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#52BA23]" />
              <span>Caribe Motors</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                selectedBrandKey === 'caribe' ? 'bg-[#52BA23] text-black font-bold' : 'bg-slate-200 text-slate-600'
              }`}>
                {caribeCount}
              </span>
            </button>

            {/* Lebrun S.A. (Rouge) */}
            <button
              onClick={() => setSelectedBrandKey('lebrun')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedBrandKey === 'lebrun'
                  ? 'bg-[#E11D24] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Lebrun S.A.</span>
            </button>

            {/* Autobiz */}
            <button
              onClick={() => setSelectedBrandKey('autobiz')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedBrandKey === 'autobiz'
                  ? 'bg-[#14171A] text-white ring-2 ring-[#E11D24]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Autobiz</span>
            </button>

            {/* Leader Foods */}
            <button
              onClick={() => setSelectedBrandKey('leader')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedBrandKey === 'leader'
                  ? 'bg-[#26292B] text-white ring-2 ring-[#78BE20]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Leader Foods</span>
            </button>

            {/* Tirezone */}
            <button
              onClick={() => setSelectedBrandKey('tirezone')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedBrandKey === 'tirezone'
                  ? 'bg-[#1A1D20] text-white ring-2 ring-[#E11D24]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Tirezone</span>
            </button>

            {/* Toutes les marques */}
            <button
              onClick={() => setSelectedBrandKey('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedBrandKey === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Toutes ({employees.length})</span>
            </button>
          </div>

          {/* Bascule Mode d'Affichage */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl no-print">
            <button
              onClick={() => setViewMode('both')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'both' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Recto & Verso
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'single' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Carte Simple
            </button>
          </div>
        </div>
      </div>

      {/* BARRE DE RECHERCHE ET CONTRÔLES */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 no-print">
        {/* Recherche */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher collaborateur, matricule, poste..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
          />
        </div>

        {/* Filtre Site & Sélection */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Tous les sites</option>
              {availableSites.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
          >
            {selectedEmployeeIds.size === filteredEmployees.length && filteredEmployees.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-slate-900" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>
              {selectedEmployeeIds.size === filteredEmployees.length && filteredEmployees.length > 0
                ? 'Tout désélectionner'
                : `Tout sélectionner (${filteredEmployees.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* GRILLE DES BADGES */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <IdCard className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Aucun collaborateur trouvé</h3>
          <p className="text-xs text-slate-500">Modifiez la marque ou le critère de recherche.</p>
        </div>
      ) : (
        <div className="badge-print-area grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => {
            const isSelected = selectedEmployeeIds.has(emp.id);
            const brand = getBrandConfig(emp.company);

            return (
              <div
                key={emp.id}
                className={`bg-white rounded-2xl border transition-all p-4 flex flex-col items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* En-tête : Case à cocher & Nom */}
                <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2.5 no-print">
                  <button
                    onClick={() => toggleSelect(emp.id)}
                    className="flex items-center gap-2 cursor-pointer text-left"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-slate-900 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0 hover:text-slate-500" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                        {emp.fullName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {emp.employeeId} • {brand.displayName}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => downloadBadgePlancheA4PDF(emp, brand)}
                      className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Planche A4"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => downloadSingleBadgeCR80PDF(emp, brand)}
                      className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Télécharger PDF (54mm × 85.6mm)"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Le Badge Rendu */}
                <div className="w-full flex justify-center py-1">
                  <BadgeCard
                    employee={emp}
                    brandOverride={brand}
                    showBothSides={viewMode === 'both'}
                  />
                </div>

                {/* Actions au bas de la carte */}
                <div className="w-full pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs no-print">
                  <span className="text-[10px] font-mono text-slate-400">
                    5.4 × 8.56 cm
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadBadgePlancheA4PDF(emp, brand)}
                      className="text-[11px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Planche A4
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={() => downloadSingleBadgeCR80PDF(emp, brand)}
                      className="text-[11px] font-bold text-slate-900 hover:text-slate-700 cursor-pointer"
                    >
                      Télécharger PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
