'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle2, 
  X, 
  Check 
} from 'lucide-react';

export default function AlertsView() {
  const { 
    alerts, 
    markAlertRead, 
    dismissAlert, 
    setActiveTab 
  } = useInventory();

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <span>Centre d&apos;Alertes & Diagnostics</span>
            {criticalCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                {criticalCount} critiques
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Surveillance proactive des liaisons satellites Starlink, dépassements de forfaits et alertes de stock Lebronsa S.A.
          </p>
        </div>

        {alerts.length > 0 && (
          <button
            onClick={() => alerts.forEach(a => markAlertRead(a.id))}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tout marquer comme lu</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="lebron-card p-5 bg-white border-l-4 border-l-red-500 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Alertes Critiques</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600 mt-2">{criticalCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Action immédiate recommandée</p>
        </div>

        <div className="lebron-card p-5 bg-white border-l-4 border-l-slate-400 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Avertissements & Quotas</span>
            <AlertTriangle className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{warningCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Seuils proches d&apos;épuisement</p>
        </div>

        <div className="lebron-card p-5 bg-white border-l-4 border-l-slate-400 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Informations & Maintenance</span>
            <Info className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-3xl font-bold text-slate-800 mt-2">
            {alerts.filter(a => a.severity === 'info').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Opérations techniques enregistrées</p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="lebron-card p-12 text-center bg-white border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 mt-3">Tous les systèmes sont nominaux</h3>
            <p className="text-xs text-slate-500 mt-1">Aucune alerte active dans l&apos;inventaire Lebrun S.A.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`lebron-card p-4 bg-white border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs ${
                alert.read ? 'opacity-70 border-slate-200' : 'border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  alert.severity === 'critical'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {alert.severity === 'critical' ? (
                    <AlertOctagon className="w-4 h-4" />
                  ) : alert.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {alert.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                    {!alert.read && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-900 text-white">
                        NOUVEAU
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">{alert.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">{alert.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                {alert.category === 'starlink' && (
                  <button
                    onClick={() => setActiveTab('starlink')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold"
                  >
                    Voir Starlink
                  </button>
                )}
                {alert.category === 'electronics' && (
                  <button
                    onClick={() => setActiveTab('electronics')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold"
                  >
                    Réapprovisionner
                  </button>
                )}
                {alert.category === 'plans' && (
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold"
                  >
                    Gérer Forfait
                  </button>
                )}

                <button
                  onClick={() => markAlertRead(alert.id)}
                  title="Marquer comme lu"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                >
                  <Check className="w-4 h-4" />
                </button>

                <button
                  onClick={() => dismissAlert(alert.id)}
                  title="Supprimer cette alerte"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
