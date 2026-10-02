'use client';

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
  Tag,
  IdCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { isCarlHens, isGraciama } from '@/lib/permissions';

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
  const isRestrictedCarl = isCarlHens(currentUser);
  const isGraciamaUser = isGraciama(currentUser);

  const caribeCount = employees.filter(e => (e.company || '').toLowerCase().includes('caribe')).length;
  const obpPrintersCount = printers.filter(p => (p.company || '').toLowerCase().includes('obonprix')).length;
  const obpITCount = itAssets.filter(i => (i.company || '').toLowerCase().includes('obonprix')).length;
  const obpEmpCount = employees.filter(e => (e.company || '').toLowerCase().includes('obonprix')).length;
  const obpNetCount = (networkAssets || []).filter(n => (n.company || '').toLowerCase().includes('obonprix')).length;
  const obpUpsCount = (upsAssets || []).filter(u => (u.company || '').toLowerCase().includes('obonprix')).length;

  const navItems: {
    id: NavigationTab | 'scanner';
    label: string;
    count?: number;
    icon: React.ComponentType<{ className?: string }>;
  }[] = isRestrictedCarl
    ? [
        { id: 'personnel', label: 'Personnel Caribe', count: caribeCount, icon: Users }
      ]
    : [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'printers', label: 'Imprimantes', count: isGraciamaUser ? obpPrintersCount : printers.length, icon: Printer },
        { id: 'it', label: 'Postes IT & Matériel', count: isGraciamaUser ? obpITCount : itAssets.length, icon: Laptop },
        { id: 'network', label: 'Réseau', count: isGraciamaUser ? obpNetCount : (networkAssets?.length || 5), icon: Network },
        { id: 'ups', label: 'Onduleurs UPS', count: isGraciamaUser ? obpUpsCount : (upsAssets?.length || 7), icon: Zap },
        { id: 'applications', label: 'Applications', count: isGraciamaUser ? 0 : (applicationAccounts?.length || 13), icon: KeyRound },
        { id: 'personnel', label: 'Personnel', count: isGraciamaUser ? obpEmpCount : employees.length, icon: Users },
        ...(!isGraciamaUser ? [{ id: 'accounts' as const, label: 'Comptes', count: itAccounts?.length || 0, icon: UserCheck }] : []),
        { id: 'documents', label: 'Documents', count: isGraciamaUser ? 0 : (documents?.length || 0), icon: FileText },
        { id: 'phones', label: 'Téléphones', count: isGraciamaUser ? 0 : phones.length, icon: Smartphone },
        { id: 'tags', label: 'Tag', icon: Tag },
        { id: 'badges', label: 'Badges', count: isGraciamaUser ? obpEmpCount : employees.length, icon: IdCard },
        { id: 'scanner', label: 'Scanner Code-barres', icon: Barcode },
        { id: 'settings', label: 'Configuration', icon: Settings }
      ];

  const [isPending, startTransition] = React.useTransition();

  const handleNavClick = (id: NavigationTab | 'scanner') => {
    if (id === 'scanner') {
      openBarcodeScanner();
    } else {
      startTransition(() => {
        setActiveTab(id);
      });
    }
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-[72px]' : 'w-60'
      } shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between select-none shadow-2xs z-50 transition-all duration-300 ease-in-out relative overflow-visible`}
    >
      {/* Top: Logo + Toggle Button */}
      <div
        className={`border-b border-slate-100 flex items-center bg-white transition-all duration-300 ${
          isCollapsed ? 'flex-col gap-2 py-3 px-2' : 'justify-between py-3.5 px-3'
        }`}
      >
        {!isCollapsed && <div className="w-6 shrink-0" aria-hidden="true" />}

        <div
          onClick={() => setActiveTab(isRestrictedCarl ? 'personnel' : 'overview')}
          className={`cursor-pointer flex items-center justify-center ${!isCollapsed ? 'flex-1 min-w-0' : ''}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              isGraciamaUser
                ? (isCollapsed ? "/logos/Obonprixicon.png" : "/logos/obonprixlogo.png")
                : (isCollapsed ? "/logos/lebrun.png" : "/Lebrunog.png")
            }
            alt={isGraciamaUser ? "Logo Obonprix" : "Logo Lebrun S.A."}
            className={`object-contain transition-all duration-300 mx-auto ${
              isCollapsed
                ? 'h-8 w-8'
                : isGraciamaUser
                  ? 'h-9 max-w-[155px]'
                  : 'h-11 max-w-[145px]'
            }`}
          />
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all cursor-pointer shrink-0"
          title={isCollapsed ? 'Agrandir le menu' : 'Réduire le menu'}
        >
          {isCollapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* Navigation Links */}
      <div
        className={`flex-1 overflow-y-auto py-3 transition-all duration-300 ${
          isCollapsed ? 'px-2 space-y-1' : 'px-3 space-y-1'
        }`}
      >
        {!isCollapsed && (
          <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {isRestrictedCarl ? 'Caribe Motors' : 'Menu Principal'}
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
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all duration-150 group cursor-pointer ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
              } ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon
                className={`shrink-0 transition-colors ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-800'
                }`}
              />
              {!isCollapsed && (
                <span className="truncate leading-tight">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Session & Logout */}
      <div
        className={`border-t border-slate-100 bg-slate-50/60 transition-all duration-300 ${
          isCollapsed ? 'px-2 py-3 flex items-center justify-center' : 'px-3 py-2.5'
        }`}
      >
        {isCollapsed ? (
          <button
            onClick={logout}
            title="Se déconnecter"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer group"
          >
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors" />
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
