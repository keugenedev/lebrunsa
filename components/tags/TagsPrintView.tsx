'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import Barcode from '@/components/common/Barcode';
import CompanyLogo from '@/components/common/CompanyLogo';
import { 
  Tag as TagIcon, 
  Printer, 
  Search, 
  Filter, 
  Building, 
  MapPin, 
  CheckSquare, 
  Square, 
  Sparkles, 
  RefreshCw,
  Laptop,
  Printer as PrinterIcon,
  Network,
  Zap,
  Smartphone,
  Users,
  SlidersHorizontal,
  Grid,
  List
} from 'lucide-react';

import { isGraciama } from '@/lib/permissions';

export interface TagItem {
  id: string;
  tag: string;
  name: string;
  category: 'printers' | 'it' | 'network' | 'ups' | 'phones' | 'personnel';
  categoryLabel: string;
  company: string;
  site: string;
  serialOrDetail?: string;
  assignedTo?: string;
}

export default function TagsPrintView() {
  const {
    printers = [],
    itAssets = [],
    networkAssets = [],
    upsAssets = [],
    phones = [],
    employees = [],
    currentUser
  } = useInventory();

  const isGraciamaUser = isGraciama(currentUser);

  const [selectedCompany, setSelectedCompany] = useState<string>(isGraciamaUser ? 'Obonprix' : 'all');
  const [selectedSite, setSelectedSite] = useState<string>(isGraciamaUser ? 'Delmas 83' : 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [printCols, setPrintCols] = useState<3 | 4>(3);
  const [rowSpacing, setRowSpacing] = useState<'normal' | 'comfortable' | 'spacious'>('comfortable');
  const [fillSheet, setFillSheet] = useState<boolean>(false);

  // Espacements dynamiques pour l'affichage écran
  const screenRowGapClass = rowSpacing === 'spacious' ? 'gap-y-8' : rowSpacing === 'normal' ? 'gap-y-4' : 'gap-y-6';

  // Unified tags list
  const allTags: TagItem[] = useMemo(() => {
    const list: TagItem[] = [];

    // Printers
    printers.forEach((p) => {
      if (p.assetTag) {
        list.push({
          id: `prn-${p.id}`,
          tag: p.assetTag,
          name: p.name || `${p.brand || ''} ${p.model || ''}`.trim() || 'Imprimante',
          category: 'printers',
          categoryLabel: 'Imprimante',
          company: p.company || 'Lebrun S.A.',
          site: p.site || 'Delmas 52',
          serialOrDetail: p.serialNumber ? `S/N: ${p.serialNumber}` : p.ipAddress ? `IP: ${p.ipAddress}` : undefined
        });
      }
    });

    // IT Assets
    itAssets.forEach((it) => {
      if (it.assetTag) {
        list.push({
          id: `it-${it.id}`,
          tag: it.assetTag,
          name: it.name || `${it.brand || ''} ${it.model || ''}`.trim() || 'Poste IT',
          category: 'it',
          categoryLabel: 'Poste IT',
          company: it.company || 'Lebrun S.A.',
          site: it.location || 'Delmas 52',
          serialOrDetail: it.serialNumber ? `S/N: ${it.serialNumber}` : undefined,
          assignedTo: it.assignedTo
        });
      }
    });

    // Network Assets
    networkAssets.forEach((net) => {
      if (net.assetTag) {
        list.push({
          id: `net-${net.id}`,
          tag: net.assetTag,
          name: net.hostname || `${net.brand || ''} ${net.model || ''}`.trim() || 'Équipement Réseau',
          category: 'network',
          categoryLabel: 'Réseau',
          company: net.company || 'Lebrun S.A.',
          site: net.site || 'Delmas 52',
          serialOrDetail: net.serialNumber ? `S/N: ${net.serialNumber}` : net.ipAddress ? `IP: ${net.ipAddress}` : undefined
        });
      }
    });

    // UPS Assets
    upsAssets.forEach((ups) => {
      if (ups.assetTag) {
        list.push({
          id: `ups-${ups.id}`,
          tag: ups.assetTag,
          name: ups.name || `${ups.brand || ''} ${ups.model || ''}`.trim() || 'Onduleur UPS',
          category: 'ups',
          categoryLabel: 'Onduleur UPS',
          company: ups.company || 'Lebrun S.A.',
          site: ups.site || 'Delmas 52',
          serialOrDetail: ups.capacity ? `Capacité: ${ups.capacity}` : ups.reference ? `Réf: ${ups.reference}` : undefined
        });
      }
    });

    // Phones
    phones.forEach((ph) => {
      if (ph.assetTag) {
        list.push({
          id: `ph-${ph.id}`,
          tag: ph.assetTag,
          name: `${ph.brand || ''} ${ph.model || ''}`.trim() || 'Téléphone',
          category: 'phones',
          categoryLabel: 'Téléphone',
          company: ph.company || 'Lebrun S.A.',
          site: ph.site || 'Delmas 52',
          serialOrDetail: ph.imei1 ? `IMEI: ${ph.imei1}` : undefined,
          assignedTo: ph.assignedTo
        });
      }
    });

    // Personnel
    employees.forEach((emp) => {
      if (emp.employeeId) {
        list.push({
          id: `emp-${emp.id}`,
          tag: emp.employeeId,
          name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employé',
          category: 'personnel',
          categoryLabel: 'Personnel',
          company: emp.company || 'Lebrun S.A.',
          site: emp.site || emp.location || 'Delmas 52',
          serialOrDetail: emp.department ? `Dép: ${emp.department}` : emp.jobTitle ? `Poste: ${emp.jobTitle}` : undefined
        });
      }
    });

    if (isGraciamaUser) {
      return list.filter(item => {
        const c = (item.company || '').toLowerCase();
        const s = (item.site || '').toLowerCase();
        const t = (item.tag || '').toUpperCase();
        return c.includes('obonprix') || c.includes('bonprix') || s.includes('83') || t.includes('OBP');
      });
    }

    return list;
  }, [printers, itAssets, networkAssets, upsAssets, phones, employees, isGraciamaUser]);

  // Extract list of companies
  const companiesList = useMemo(() => {
    const set = new Set<string>();
    allTags.forEach((t) => {
      if (t.company) set.add(t.company);
    });
    return Array.from(set).sort();
  }, [allTags]);

  // Extract list of sites based on selected company
  const sitesList = useMemo(() => {
    const set = new Set<string>();
    allTags.forEach((t) => {
      if (selectedCompany === 'all' || t.company === selectedCompany) {
        if (t.site) set.add(t.site);
      }
    });
    return Array.from(set).sort();
  }, [allTags, selectedCompany]);

  // Filter tags
  const filteredTags = useMemo(() => {
    return allTags.filter((t) => {
      // Company Filter
      if (selectedCompany !== 'all' && t.company !== selectedCompany) {
        return false;
      }
      // Site Filter
      if (selectedSite !== 'all' && t.site !== selectedSite) {
        return false;
      }
      // Category Filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }
      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchTag = t.tag.toLowerCase().includes(q);
        const matchName = t.name.toLowerCase().includes(q);
        const matchCompany = t.company.toLowerCase().includes(q);
        const matchSite = t.site.toLowerCase().includes(q);
        const matchDetail = t.serialOrDetail ? t.serialOrDetail.toLowerCase().includes(q) : false;
        const matchAssigned = t.assignedTo ? t.assignedTo.toLowerCase().includes(q) : false;
        return matchTag || matchName || matchCompany || matchSite || matchDetail || matchAssigned;
      }
      return true;
    });
  }, [allTags, selectedCompany, selectedSite, selectedCategory, searchQuery]);

  // Handlers for Selection
  const toggleSelectTag = (id: string) => {
    const next = new Set(selectedTagIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTagIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedTagIds.size === filteredTags.length && filteredTags.length > 0) {
      setSelectedTagIds(new Set());
    } else {
      const next = new Set<string>();
      filteredTags.forEach((t) => next.add(t.id));
      setSelectedTagIds(next);
    }
  };

  const handleResetFilters = () => {
    setSelectedCompany('all');
    setSelectedSite('all');
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedTagIds(new Set());
  };

  // Determine tags to print
  const printableTags = useMemo(() => {
    const baseList = selectedTagIds.size > 0
      ? filteredTags.filter((t) => selectedTagIds.has(t.id))
      : filteredTags;

    if (!fillSheet || baseList.length === 0) {
      return baseList;
    }

    // Capacité d'une feuille complète Letter : 18 tags (3 cols x 6 lignes) ou 24 (4 cols x 6 lignes)
    const sheetCapacity = printCols * 6;
    if (baseList.length >= sheetCapacity) {
      return baseList;
    }

    const filledList: TagItem[] = [];
    let idx = 0;
    while (filledList.length < sheetCapacity) {
      const original = baseList[idx % baseList.length];
      filledList.push({
        ...original,
        id: `${original.id}-copy-${filledList.length}`
      });
      idx++;
    }
    return filledList;
  }, [filteredTags, selectedTagIds, fillSheet, printCols]);

  const handlePrint = (singleTagId?: string) => {
    const originalTitle = document.title;
    // Supprimer le titre temporairement pour éviter que le navigateur n'imprime "Lebrun S.A." en haut de feuille
    document.title = ' ';

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);

    if (singleTagId) {
      const singleSet = new Set<string>([singleTagId]);
      setSelectedTagIds(singleSet);
      setTimeout(() => {
        window.print();
        setTimeout(restoreTitle, 1500);
      }, 100);
    } else {
      window.print();
      setTimeout(restoreTitle, 1500);
    }
  };

  const getCategoryIcon = (category: TagItem['category']) => {
    switch (category) {
      case 'printers': return <PrinterIcon className="w-3.5 h-3.5 text-blue-600" />;
      case 'it': return <Laptop className="w-3.5 h-3.5 text-indigo-600" />;
      case 'network': return <Network className="w-3.5 h-3.5 text-purple-600" />;
      case 'ups': return <Zap className="w-3.5 h-3.5 text-amber-600" />;
      case 'phones': return <Smartphone className="w-3.5 h-3.5 text-emerald-600" />;
      case 'personnel': return <Users className="w-3.5 h-3.5 text-rose-600" />;
      default: return <TagIcon className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Styles d'impression personnalisés (@media print) */}
      <style jsx global>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 6mm 5mm !important;
          }
          /* Déblocage et réinitialisation pour imprimer toutes les pages proprement */
          html, body {
            overflow: visible !important;
            height: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          div, main, section {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Masquer les menus de navigation, la sidebar et le header */
          aside, header, nav, .no-print {
            display: none !important;
          }
          img {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Grille d'impression parfaitement calibrée pour 6 lignes (18 tags) par feuille Letter */
          .print-area {
            display: grid !important;
            grid-template-columns: repeat(${printCols}, minmax(0, 1fr)) !important;
            column-gap: 3.5mm !important;
            row-gap: ${rowSpacing === 'spacious' ? '5mm' : rowSpacing === 'normal' ? '2mm' : '3mm'} !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          /* Étiquettes individuelles calibrées pour 6 lignes par feuille Letter */
          .tag-print-badge {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            -webkit-column-break-inside: avoid !important;
            border: 1px solid #000000 !important;
            border-radius: 4px !important;
            padding: 4px 6px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      {/* Main Header Banner */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md">
            <TagIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Impression des Tags & Code-Barres</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {filteredTags.length} tag{filteredTags.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Générez et imprimez les étiquettes code-barres par entreprise, site ou catégorie d&apos;équipement
            </p>
          </div>
        </div>

        {/* Global Print & Batch Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            {selectedTagIds.size === filteredTags.length && filteredTags.length > 0 ? (
              <>
                <CheckSquare className="w-4 h-4 text-slate-900" />
                <span>Tout décocher</span>
              </>
            ) : (
              <>
                <Square className="w-4 h-4 text-slate-400" />
                <span>Tout sélectionner</span>
              </>
            )}
          </button>

          <button
            onClick={() => handlePrint()}
            disabled={filteredTags.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm ${
              filteredTags.length === 0
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 active:scale-95'
            }`}
          >
            <Printer className="w-4 h-4 text-white" />
            <span>
              {selectedTagIds.size > 0
                ? `Imprimer la sélection (${selectedTagIds.size})`
                : `Imprimer tout par filtres (${filteredTags.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Entreprise, Site, Catégorie, Recherche) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
        
        {/* Top Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Company Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Entreprise
            </label>
            {isGraciamaUser ? (
              <div className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center">
                Obonprix
              </div>
            ) : (
              <select
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(e.target.value);
                  setSelectedSite('all'); // Reset site selection when company changes
                }}
                className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all cursor-pointer"
              >
                <option value="all">Toutes les entreprises ({allTags.length})</option>
                {companiesList.map((company) => {
                  const count = allTags.filter((t) => t.company === company).length;
                  return (
                    <option key={company} value={company}>
                      {company} ({count})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Site Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Site / Emplacement
            </label>
            {isGraciamaUser ? (
              <div className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center">
                Delmas 83
              </div>
            ) : (
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all cursor-pointer"
              >
                <option value="all">Tous les sites</option>
                {sitesList.map((site) => {
                const count = allTags.filter(
                  (t) => (selectedCompany === 'all' || t.company === selectedCompany) && t.site === site
                ).length;
                return (
                  <option key={site} value={site}>
                    {site} ({count})
                  </option>
                );
              })}
            </select>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              Catégorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all cursor-pointer"
            >
              <option value="all">Toutes les catégories</option>
              <option value="printers">Imprimantes</option>
              <option value="it">Postes IT & Workstations</option>
              <option value="network">Équipements Réseau</option>
              <option value="ups">Onduleurs UPS</option>
              <option value="phones">Téléphones</option>
              <option value="personnel">Personnel & Collaborateurs</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              Recherche
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tag, nom, S/N, modèle..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

        </div>

        {/* Bottom Bar: Active Filter Badges & View Toggle */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs text-slate-600">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">Filtres actifs :</span>
            {selectedCompany !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px] border border-slate-200">
                Entreprise: <strong>{selectedCompany}</strong>
              </span>
            )}
            {selectedSite !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px] border border-slate-200">
                Site: <strong>{selectedSite}</strong>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px] border border-slate-200">
                Catégorie: <strong>{selectedCategory}</strong>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px] border border-slate-200">
                Recherche: &quot;{searchQuery}&quot;
              </span>
            )}
            {(selectedCompany !== 'all' || selectedSite !== 'all' || selectedCategory !== 'all' || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="text-red-600 hover:text-red-800 font-semibold text-[11px] flex items-center gap-1 hover:underline cursor-pointer ml-1"
              >
                <RefreshCw className="w-3 h-3" />
                Réinitialiser
              </button>
            )}
          </div>

          {/* Print Columns Selector, Row Spacing & View Mode Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* 3 or 4 Tags per Line Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 hidden sm:inline">Colonnes :</span>
              <button
                onClick={() => setPrintCols(3)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  printCols === 3
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
                title="Imprimer 3 tags par ligne"
              >
                3 / ligne
              </button>
              <button
                onClick={() => setPrintCols(4)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  printCols === 4
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
                title="Imprimer 4 tags par ligne"
              >
                4 / ligne
              </button>
            </div>

            {/* Espacement de découpe (Spécial papier adhésif Talbot) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 hidden sm:inline">Espace coupe :</span>
              <button
                onClick={() => setRowSpacing('normal')}
                className={`px-2 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  rowSpacing === 'normal'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
                title="Espacement compact (2 mm)"
              >
                2mm
              </button>
              <button
                onClick={() => setRowSpacing('comfortable')}
                className={`px-2 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  rowSpacing === 'comfortable'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
                title="Espacement optimal (3 mm - 6 rangées complètes / feuille)"
              >
                3mm (Optimal)
              </button>
              <button
                onClick={() => setRowSpacing('spacious')}
                className={`px-2 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  rowSpacing === 'spacious'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
                title="Espacement large (5 mm)"
              >
                5mm
              </button>
            </div>

            {/* Remplir la feuille Toggle pour ne laisser aucun vide */}
            <button
              onClick={() => setFillSheet(!fillSheet)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                fillSheet
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:text-slate-900'
              }`}
              title="Dupliquer les étiquettes pour remplir toute la feuille sans gaspiller de papier adhésif"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Remplir la feuille</span>
              {fillSheet && <span className="text-[10px] bg-black/20 px-1 py-0.2 rounded font-bold">Pleine</span>}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Vue Grille de Badges"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'compact'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Vue Liste Compacte"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Conseil impression propre sans en-tête / pied de page navigateur */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700 shrink-0">💡 Conseil impression :</span>
          <span>
            Si votre navigateur affiche encore l&apos;heure ou l&apos;URL, ouvrez <strong>Plus de paramètres</strong> dans la fenêtre d&apos;impression et décochez <strong>&quot;En-têtes et pieds de page&quot;</strong>.
          </span>
        </div>

      </div>

      {/* Empty State */}
      {filteredTags.length === 0 && (
        <div className="no-print bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <TagIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Aucun tag trouvé</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Aucune étiquette ne correspond à vos filtres par entreprise, site ou mot de recherche.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Printable Area / Tags Display Grid */}
      {filteredTags.length > 0 && (
        <div className={`print-area ${screenRowGapClass} ${
          viewMode === 'grid'
            ? printCols === 4
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3'
              : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4'
            : 'grid grid-cols-1 md:grid-cols-2 gap-x-3'
        }`}>
          {printableTags.map((item) => {
            const isSelected = selectedTagIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`tag-print-badge relative bg-white rounded-lg border transition-all select-none p-2.5 flex flex-col justify-between ${
                  isSelected
                    ? 'border-black ring-2 ring-black/10 shadow-sm'
                    : 'border-slate-300 hover:border-black shadow-2xs'
                }`}
              >
                {/* Header Badge: Company & Site (No Tag Number at Top) */}
                <div className="flex items-center justify-between border-b border-black/20 pb-0.5 mb-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <button
                      onClick={() => toggleSelectTag(item.id)}
                      className="no-print p-0.5 text-slate-400 hover:text-black cursor-pointer shrink-0"
                      title={isSelected ? 'Désélectionner' : 'Sélectionner pour impression'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-black" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </button>
                    <CompanyLogo 
                      company={item.company} 
                      className="h-4 max-w-[75px] w-auto object-contain shrink-0" 
                      showText={false} 
                    />
                  </div>
                  <span className="text-[9.5px] font-bold text-black shrink-0 ml-1">
                    {item.site}
                  </span>
                </div>

                {/* Main Content: Asset Name & Details */}
                <div className="space-y-0.5 mb-0.5 text-center min-w-0">
                  <h4 className="text-[10px] font-bold text-black leading-tight line-clamp-1 truncate">
                    {item.name}
                  </h4>
                  <div className="text-[9px] font-mono text-black/80 truncate">
                    {item.categoryLabel} {item.serialOrDetail ? `• ${item.serialOrDetail}` : ''}
                  </div>
                  {item.assignedTo && (
                    <p className="text-[8.5px] font-medium text-black/80 truncate">
                      Attribué: {item.assignedTo}
                    </p>
                  )}
                </div>

                {/* Code-barres direct sans aucune boîte, carré ni fond gris */}
                <div className="w-full flex flex-col items-center justify-center my-0.5 overflow-hidden">
                  <Barcode
                    value={item.tag}
                    width={printCols === 4 ? 1.05 : 1.18}
                    height={30}
                    fontSize={9}
                    displayValue={true}
                    lineColor="#000000"
                    background="transparent"
                    margin={2}
                  />
                </div>

                {/* Bottom Action Footer (no-print) */}
                <div className="no-print pt-1.5 mt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[9px] text-slate-400 font-mono">
                    Code 128
                  </span>
                  <button
                    onClick={() => handlePrint(item.id)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-black hover:text-white text-slate-800 font-medium transition-all text-[10px] cursor-pointer"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Imprimer</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
