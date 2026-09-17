'use client';

import React, { useState } from 'react';
import { useInventory, NavigationTab } from '@/context/InventoryContext';
import { 
  Search, 
  Plus, 
  Download, 
  Bell, 
  QrCode, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  X,
  ExternalLink,
  LogOut
} from 'lucide-react';

export default function Header() {
  const { 
    activeTab, 
    alerts, 
    markAlertRead, 
    dismissAlert, 
    openAddModal, 
    exportCSV, 
    setIsSpotlightOpen, 
    setActiveTab,
    logout 
  } = useInventory();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const getTabLabel = (tab: NavigationTab) => {
    switch (tab) {
      case 'overview': return 'Vue d\'ensemble';
      case 'it': return 'Équipements Informatiques';
      case 'starlink': return 'Flotte Satellite Starlink';
      case 'plans': return 'Forfaits & Télécoms';
      case 'electronics': return 'Électronique & Composants IoT';
      case 'personnel': return 'Personnel & Salariés';
      case 'movements': return 'Mouvements & Prêts';
      case 'alerts': return 'Centre d\'Alertes';
      case 'settings': return 'Configuration & Sauvegardes';
      default: return 'Inventaire';
    }
  };

  const unreadAlerts = alerts.filter(a => !a.read);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span 
          className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer transition-colors" 
          onClick={() => setActiveTab('overview')}
        >
          Lebronsa S.A.
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-red-600 font-medium">
          {getTabLabel(activeTab)}
        </span>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div 
          onClick={() => setIsSpotlightOpen(true)}
          className="relative flex items-center w-full px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs text-slate-500 hover:text-slate-800 transition-all cursor-pointer group shadow-2xs"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-red-600 mr-2.5 transition-colors" />
          <span className="flex-1 text-slate-500 group-hover:text-slate-700">
            Rechercher modèle, SN, collaborateur, Starlink ID...
          </span>
          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
            <span>Ctrl</span>
            <span>+</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-600 hover:text-slate-900 relative transition-colors shadow-2xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] font-medium text-white flex items-center justify-center shadow-xs">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-96 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">Alertes & Notifications</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium border border-red-200">
                    {alerts.length} au total
                  </span>
                </div>
                <button 
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Aucune alerte active</p>
                ) : (
                  alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      onClick={() => markAlertRead(alert.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        alert.read 
                          ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                          : 'bg-white border-red-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {alert.severity === 'critical' ? (
                            <AlertOctagon className="w-4 h-4 text-red-500 shrink-0" />
                          ) : alert.severity === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : (
                            <Info className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                          <h5 className="text-xs font-semibold text-slate-900">{alert.title}</h5>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissAlert(alert.id);
                          }}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{alert.message}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{alert.timestamp}</span>
                        {!alert.read && <span className="text-red-600 font-medium">Nouveau</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    setActiveTab('alerts');
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-1.5 mx-auto"
                >
                  <span>Consulter le centre d&apos;alertes</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Export CSV Button */}
        <button
          onClick={() => {
            const cat = activeTab === 'it' ? 'it' : activeTab === 'plans' ? 'plans' : activeTab === 'starlink' ? 'starlink' : activeTab === 'electronics' ? 'electronics' : activeTab === 'personnel' ? 'personnel' : undefined;
            exportCSV(cat);
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
          title="Exporter la liste active en CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={() => {
            const defaultCategory = activeTab === 'plans' ? 'plans' : activeTab === 'starlink' ? 'starlink' : activeTab === 'electronics' ? 'electronics' : 'it';
            openAddModal(defaultCategory);
          }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nouvel Élément</span>
        </button>

        {/* Déconnexion */}
        <button
          onClick={logout}
          title="Se déconnecter"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200/90 text-xs font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
