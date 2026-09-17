'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  Search, 
  X, 
  Laptop, 
  Users, 
  Barcode, 
  ArrowRight, 
  Printer
} from 'lucide-react';

export default function QuickSearchModal() {
  const { 
    isSpotlightOpen, 
    setIsSpotlightOpen, 
    printers,
    itAssets, 
    employees, 
    setActiveTab 
  } = useInventory();

  const [query, setQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSpotlightOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSpotlightOpen]);

  if (!isSpotlightOpen) return null;

  // Unifier les imprimantes HP réelles, postes Dell et collaborateurs
  const allResults = [
    // 16 Imprimantes HP réelles
    ...printers.map(p => ({
      id: p.id,
      name: `${p.name} (${p.model})`,
      subtitle: `${p.company} • ${p.site} • IP: ${p.ipAddress}`,
      tag: p.serialNumber,
      category: 'printers',
      typeLabel: 'Imprimante HP Réseau',
      icon: Printer,
      tab: 'printers' as const,
      data: p
    })),
    // Postes IT Dell
    ...itAssets.map(a => ({
      id: a.id,
      name: a.name,
      subtitle: `${(a as any).company || 'Lebrun S.A.'} • ${a.location} • S/N: ${a.serialNumber || a.assetTag}`,
      tag: a.assetTag,
      category: 'it',
      typeLabel: 'Poste Dell OptiPlex',
      icon: Laptop,
      tab: 'it' as const,
      data: a
    })),
    // 6 Collaborateurs réels
    ...employees.map(e => ({
      id: e.id,
      name: `${e.fullName} (${e.jobTitle})`,
      subtitle: `${e.company || 'Lebrun S.A.'} • ${e.department} • Poste: ${e.workstation?.pcName || 'Dell'}`,
      tag: e.employeeId,
      category: 'personnel',
      typeLabel: 'Collaborateur & Poste',
      icon: Users,
      tab: 'personnel' as const,
      data: e
    }))
  ];

  const filteredResults = allResults.filter(item => {
    const matchesFilter = activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
    const q = query.toLowerCase();

    const matchesSearch = 
      item.name.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 z-50 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden relative">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
          <Search className="w-4 h-4 text-red-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher imprimante HP, IP, poste Dell, numéro de série, collaborateur..."
            className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden font-medium"
          />

          <button
            onClick={() => setIsSpotlightOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filter Pills */}
        <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold mr-1">Filtrer par :</span>
          {[
            { id: 'all', label: 'Tous les actifs' },
            { id: 'printers', label: 'Imprimantes HP' },
            { id: 'it', label: 'Postes Dell' },
            { id: 'personnel', label: 'Personnel' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveCategoryFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeCategoryFilter === f.id
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Aucun résultat certifié pour « {query} »
            </div>
          ) : (
            filteredResults.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.tab);
                    setIsSpotlightOpen(false);
                  }}
                  className="p-3 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {item.tag}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.typeLabel}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors mt-0.5">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600">
              ESC
            </kbd>
            <span className="text-[11px]">pour fermer</span>
          </div>
          <span className="font-medium text-slate-700 text-[11px]">{filteredResults.length} résultats certifiés Lebrun S.A.</span>
        </div>
      </div>
    </div>
  );
}
