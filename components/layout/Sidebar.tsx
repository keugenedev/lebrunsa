'use client';

import React from 'react';
import { useInventory, NavigationTab } from '@/context/InventoryContext';
import { 
  LayoutDashboard, 
  Laptop, 
  Users, 
  Settings, 
  Barcode, 
  LogOut, 
  Printer, 
  Network, 
  Zap, 
  KeyRound 
} from 'lucide-react';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    openBarcodeScanner,
    printers,
    employees,
    itAssets,
    networkAssets,
    upsAssets,
    applicationAccounts,
    logout,
    currentUser
  } = useInventory();

  const navItems: {
    id: NavigationTab | 'scanner';
    label: string;
    count?: number;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'printers', label: 'Imprimantes', count: printers.length, icon: Printer },
    { id: 'it', label: 'Postes IT & Matériel', count: itAssets.length, icon: Laptop },
    { id: 'network', label: 'Réseau', count: networkAssets?.length || 5, icon: Network },
    { id: 'ups', label: 'Onduleurs UPS', count: upsAssets?.length || 7, icon: Zap },
    { id: 'applications', label: 'Applications', count: applicationAccounts?.length || 13, icon: KeyRound },
    { id: 'personnel', label: 'Personnel & Badges', count: employees.length, icon: Users },
    { id: 'scanner', label: 'Scanner Code-barres', icon: Barcode },
    { id: 'settings', label: 'Configuration', icon: Settings }
  ];

  const handleNavClick = (id: NavigationTab | 'scanner') => {
    if (id === 'scanner') {
      openBarcodeScanner();
    } else {
      setActiveTab(id);
    }
  };

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between select-none shadow-2xs z-20 transition-all duration-200">
      {/* Top: Clean Logo */}
      <div className="py-3.5 px-5 border-b border-slate-100 flex items-center justify-center bg-white">
        <div
          onClick={() => setActiveTab('overview')}
          className="cursor-pointer flex items-center justify-center w-full group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Lebrunog.png"
            alt="Logo Lebrun S.A."
            className="h-14 w-auto max-w-[170px] object-contain transition-transform group-hover:scale-105"
          />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Menu Principal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors shrink-0 ${
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-800'
              }`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Session & Logout */}
      <div className="px-3 py-2.5 border-t border-slate-100 bg-slate-50/60">
        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer group"
          title="Se déconnecter"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[11px] shrink-0">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'A'}
            </div>
            <div className="truncate text-left">
              <p className="text-[11px] font-semibold text-slate-800 truncate leading-tight">
                {currentUser?.name || 'Administrateur'}
              </p>
              <p className="text-[10px] text-slate-400 truncate leading-tight">
                {currentUser?.email || 'admin@lebrunsa.com'}
              </p>
            </div>
          </div>
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 shrink-0" />
        </button>
      </div>
    </aside>
  );
}
