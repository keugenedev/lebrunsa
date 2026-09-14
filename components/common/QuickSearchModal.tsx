'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  Search, 
  X, 
  Laptop, 
  Satellite, 
  Smartphone, 
  Cpu, 
  Users, 
  QrCode, 
  ArrowRight, 
  Camera 
} from 'lucide-react';

export default function QuickSearchModal() {
  const { 
    isSpotlightOpen, 
    setIsSpotlightOpen, 
    itAssets, 
    starlinkKits, 
    plans, 
    electronics, 
    employees, 
    openQRModal, 
    setActiveTab 
  } = useInventory();

  const [query, setQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [scanSimulating, setScanSimulating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSpotlightOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSpotlightOpen]);

  if (!isSpotlightOpen) return null;

  // Aggregate results across all collections including Employees!
  const allResults = [
    ...employees.map(e => ({ 
      id: e.id,
      name: e.fullName,
      tag: e.employeeId,
      subtitle: `${e.jobTitle} • ${e.department}`,
      category: 'personnel' as const,
      typeLabel: 'Personnel Lebronsa',
      icon: Users,
      tab: 'personnel' as const,
      rawItem: e
    })),
    ...itAssets.map(i => ({ 
      id: i.id,
      name: i.name,
      tag: i.assetTag,
      subtitle: `${i.brand} ${i.model} • ${i.assignedTo || 'Non assigné'}`,
      category: 'it' as const,
      typeLabel: 'Matériel IT',
      icon: Laptop,
      tab: 'it' as const,
      rawItem: i
    })),
    ...starlinkKits.map(s => ({ 
      id: s.id,
      name: s.name,
      tag: s.kitNumber,
      subtitle: `${s.tier} • ${s.siteName} (${s.networkStatus})`,
      category: 'starlink' as const,
      typeLabel: 'Flotte Starlink',
      icon: Satellite,
      tab: 'starlink' as const,
      rawItem: s
    })),
    ...plans.map(p => ({ 
      id: p.id,
      name: p.name,
      tag: p.assetTag,
      subtitle: `${p.operator} • ${p.phoneNumber || 'Data SIM'} (${p.assignedTo || 'Stock'})`,
      category: 'plans' as const,
      typeLabel: 'Forfait & SIM',
      icon: Smartphone,
      tab: 'plans' as const,
      rawItem: p
    })),
    ...electronics.map(e => ({ 
      id: e.id,
      name: e.name,
      tag: e.partNumber,
      subtitle: `Stock: ${e.quantityInStock} • Casier: ${e.storageBin}`,
      category: 'electronics' as const,
      typeLabel: 'Composant Électronique',
      icon: Cpu,
      tab: 'electronics' as const,
      rawItem: e
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

  const handleSimulateScan = () => {
    setScanSimulating(true);
    setTimeout(() => {
      const itAndStarlink = allResults.filter(r => r.category === 'it' || r.category === 'starlink');
      const randomAsset = itAndStarlink[Math.floor(Math.random() * itAndStarlink.length)];
      setQuery(randomAsset.tag);
      setScanSimulating(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 z-50 animate-in fade-in duration-150">
      <div className="lebron-card w-full max-w-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden relative">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-red-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher salarié, ordinateur, Dish SN, forfait, composant..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />

          <button
            onClick={handleSimulateScan}
            disabled={scanSimulating}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-medium transition-colors"
            title="Simuler un scan de code-barres"
          >
            <Camera className={`w-3.5 h-3.5 ${scanSimulating ? 'animate-spin' : ''}`} />
            <span>{scanSimulating ? 'Lecture...' : 'Scan Douchette'}</span>
          </button>

          <button
            onClick={() => setIsSpotlightOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filter Pills */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Filtre :</span>
          {[
            { id: 'all', label: 'Tous' },
            { id: 'personnel', label: 'Personnel' },
            { id: 'it', label: 'IT' },
            { id: 'starlink', label: 'Starlink' },
            { id: 'plans', label: 'Forfaits' },
            { id: 'electronics', label: 'Électronique' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveCategoryFilter(f.id)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
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
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Aucun résultat pour « {query} »
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
                  className="p-3 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {item.tag}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.typeLabel}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-red-600 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.category !== 'personnel' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openQRModal(item.rawItem as any);
                        }}
                        title="Générer QR Code"
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600">
              ESC
            </kbd>
            <span>pour fermer</span>
          </div>
          <span>{filteredResults.length} résultats trouvés</span>
        </div>
      </div>
    </div>
  );
}
