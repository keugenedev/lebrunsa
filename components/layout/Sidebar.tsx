'use client';

import React from 'react';
import { useInventory, NavigationTab } from '@/context/InventoryContext';
import { 
  LayoutDashboard, 
  Laptop, 
  Satellite, 
  Smartphone, 
  Cpu, 
  Users, 
  ArrowLeftRight, 
  Bell, 
  Settings, 
  QrCode, 
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    setIsSpotlightOpen 
  } = useInventory();

  const navItems: {
    section: string;
    items: {
      id: NavigationTab | 'scanner';
      label: string;
      icon: React.ComponentType<{ className?: string }>;
    }[];
  }[] = [
    {
      section: 'ACCUEIL',
      items: [
        { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
        { id: 'scanner', label: 'Recherche & Scanner', icon: QrCode }
      ]
    },
    {
      section: 'CATALOGUE & PARC',
      items: [
        { id: 'it', label: 'Équipements IT', icon: Laptop },
        { id: 'starlink', label: 'Flotte Starlink', icon: Satellite },
        { id: 'plans', label: 'Forfaits & SIMs', icon: Smartphone },
        { id: 'electronics', label: 'Électronique & IoT', icon: Cpu }
      ]
    },
    {
      section: 'RESSOURCES HUMAINES',
      items: [
        { id: 'personnel', label: 'Personnel & Salariés', icon: Users }
      ]
    },
    {
      section: 'OPÉRATIONS',
      items: [
        { id: 'movements', label: 'Mouvements & Prêts', icon: ArrowLeftRight },
        { id: 'alerts', label: 'Centre d\'Alertes', icon: Bell }
      ]
    },
    {
      section: 'ADMINISTRATION',
      items: [
        { id: 'settings', label: 'Configuration & Export', icon: Settings }
      ]
    }
  ];

  const handleNavClick = (id: NavigationTab | 'scanner') => {
    if (id === 'scanner') {
      setIsSpotlightOpen(true);
    } else {
      setActiveTab(id);
    }
  };

  return (
    <aside className="w-68 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between select-none shadow-xs z-20">
      {/* Top: Generously sized Logo - compact padding, pure and static without tooltip */}
      <div className="py-3 px-4 border-b border-slate-100 flex flex-col items-center justify-center">
        <div 
          onClick={() => setActiveTab('overview')}
          className="cursor-pointer flex items-center justify-center w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/Lebrunog.png" 
            alt="Logo Lebrun S.A." 
            className="h-18 w-auto max-w-[210px] object-contain"
          />
        </div>
      </div>

      {/* Navigation Links - clean, compact spacing */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-3">
        {navItems.map((group) => (
          <div key={group.section} className="space-y-1">
            <h4 className="px-3 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              {group.section}
            </h4>
            <div className="space-y-0.5 pt-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors duration-150 group ${
                      isActive
                        ? 'bg-red-600 text-white font-medium shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/90" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: Company Name in Small, Elegant Format */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 text-center">
        <div className="text-[11px] font-semibold text-slate-700 tracking-wider uppercase">
          LEBRONSA S.A.
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5 font-normal">
          Système de Gestion d&apos;Inventaire & Flotte
        </p>
        <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[9px] text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Portail Sécurisé Entreprise</span>
        </div>
      </div>
    </aside>
  );
}
