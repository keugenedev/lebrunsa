const fs = require('fs');

const content = 'use client';

import React, { useState } from 'react';
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
  KeyRound,
  UserCheck,
  FileText,
  Smartphone,
  ChevronLeft,
  ChevronRight
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
    itAccounts,
    documents,
    phones,
    logout,
    currentUser
  } = useInventory();

  const [isCollapsed, setIsCollapsed] = useState(false);

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
    { id: 'personnel', label: 'Personnel', count: employees.length, icon: Users },
    { id: 'accounts', label: 'Comptes', count: itAccounts?.length || 0, icon: UserCheck },
    { id: 'documents', label: 'Documents', count: documents?.length || 0, icon: FileText },
    { id: 'phones', label: 'Téléphones', count: phones.length, icon: Smartphone },
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
    <aside 
      className={\\ shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between select-none shadow-2xs z-20 transition-all duration-300 ease-in-out relative\}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border border-slate-200 text-slate-500 rounded-full p-1 hover:text-slate-900 shadow-sm z-30 transition-transform cursor-pointer"
        title={isCollapsed ? 'Agrandir le menu' : 'Réduire le menu'}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Top: Clean Logo */}
      <div className={\py-3.5 \ border-b border-slate-100 flex items-center justify-center bg-white transition-all\}>
        <div
          onClick={() => setActiveTab('overview')}
          className="cursor-pointer flex items-center justify-center w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Lebrunog.png"
            alt="Logo Lebrun S.A."
            className={\\ object-contain transition-all duration-300\}
          />
        </div>
      </div>

      {/* Navigation Links */}
      <div className={\lex-1 overflow-y-auto py-3 \\}>
        {!isCollapsed && (
          <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider transition-opacity">
            Menu Principal
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={\w-full flex items-center \ rounded-xl text-xs font-medium transition-all duration-150 group cursor-pointer \\}
            >
              <Icon className={\\ transition-colors shrink-0 \\} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* User Session & Logout */}
      <div className={\px-2 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center \\}>
        {isCollapsed ? (
          <button
            onClick={logout}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-300 transition-colors cursor-pointer group shadow-sm"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4 text-slate-600 group-hover:text-slate-900 transition-colors" />
          </button>
        ) : (
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
        )}
      </div>
    </aside>
  );
}
;

fs.writeFileSync('c:/Users/kensl/lebrunsa/components/layout/Sidebar.tsx', content, 'utf8');
