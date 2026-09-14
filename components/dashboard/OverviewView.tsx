'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  TrendingUp, 
  Laptop, 
  Satellite, 
  Smartphone, 
  Cpu, 
  Bell, 
  Sparkles, 
  Calendar, 
  Download, 
  ArrowUpRight, 
  Wifi, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Radio,
  HardDrive,
  Users,
  Building
} from 'lucide-react';

export default function OverviewView() {
  const { 
    stats, 
    formatCurrency, 
    itAssets, 
    starlinkKits, 
    plans, 
    electronics, 
    employees, 
    movements, 
    alerts, 
    setActiveTab, 
    openAddModal, 
    exportCSV 
  } = useInventory();

  const warrantyComplianceRate = Math.round(
    (itAssets.filter(i => new Date(i.warrantyExpiry).getTime() > Date.now()).length / (itAssets.length || 1)) * 100
  );

  const starlinkHealthRate = Math.round(
    ((stats.starlinkOnlineCount) / (stats.starlinkCount || 1)) * 100
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="lebron-card p-5 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-400/30">
              LEBRONSA S.A. • HUB OPÉRATIONNEL
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping-slow"></span>
              Synchronisé en direct
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Tableau de Bord & Supervision Générale
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Supervisez les actifs informatiques, liaisons satellites Starlink, abonnements télécoms et dotations salariés.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportCSV()}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-white transition-colors shadow-2xs backdrop-blur-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Rapport d&apos;Inventaire</span>
          </button>

          <button
            onClick={() => openAddModal('it')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium shadow-sm transition-all active:scale-95"
          >
            <span>+ Nouvel Actif</span>
          </button>
        </div>
      </div>

      {/* Row 1: Key Metric Cards in crisp white */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Asset Value */}
        <div className="lebron-card p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Valeur Globale du Parc</span>
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <HardDrive className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold tracking-tight text-slate-900 mt-1.5">
              {formatCurrency(stats.totalValue)}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              <strong className="text-slate-800 font-semibold">{stats.totalAssetsCount} actifs</strong> répertoriés
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12.4% valeur
            </span>
            <span className="text-slate-400">Annuel</span>
          </div>
        </div>

        {/* Card 2: Starlink Fleet Status */}
        <div className="lebron-card p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Flotte Satellite Starlink</span>
              <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Satellite className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold tracking-tight text-slate-900 mt-1.5 flex items-center gap-2">
              <span>{stats.starlinkOnlineCount} / {stats.starlinkCount}</span>
              <span className="text-xs font-normal text-slate-500">en ligne</span>
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              Débit moyen : <strong className="text-slate-800 font-semibold">198 Mbps</strong> • 32ms
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 99.8% Uptime
            </span>
            <span className="text-red-600 font-medium cursor-pointer hover:underline" onClick={() => setActiveTab('starlink')}>
              Voir flotte →
            </span>
          </div>
        </div>

        {/* Card 3: Employees with Assets */}
        <div className="lebron-card p-5 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Personnel & Collaborateurs</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              {stats.employeesCount} salariés
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {stats.itCount - stats.unassignedITCount} dotations IT actives
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">
              {employees.filter(e => e.status === 'on_leave').length} en mission site
            </span>
            <span className="text-red-600 font-medium cursor-pointer hover:underline" onClick={() => setActiveTab('personnel')}>
              Annuaire →
            </span>
          </div>
        </div>

        {/* Card 4: Telecom Budget */}
        <div className="lebron-card p-5 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Budget Forfaits & Télécoms</span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              {formatCurrency(stats.monthlyPlansCost)} <span className="text-xs font-normal text-slate-500">/m</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {stats.plansCount} forfaits mobiles & Starlink inclus
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Orange, MTN, Vodafone</span>
            <span className="text-red-600 font-medium cursor-pointer hover:underline" onClick={() => setActiveTab('plans')}>
              Détails →
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Circular KPIs & Stock health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Gauge 1: IT Warranty Compliance */}
        <div className="lebron-card p-5 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Conformité Garanties Matérielles</span>
            <ShieldCheck className="w-4 h-4 text-red-600" />
          </div>

          <div className="my-3 flex items-center justify-around">
            <div className="relative w-22 h-22 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-red-600 transition-all duration-1000"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * warrantyComplianceRate) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-slate-900">{warrantyComplianceRate}%</span>
                <span className="text-[9px] text-slate-400 uppercase">Valide</span>
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-900 text-sm">
                {itAssets.filter(i => new Date(i.warrantyExpiry).getTime() > Date.now()).length} sur {itAssets.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Sous garantie constructeur en cours.</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-right">
            Audit régulier Lebronsa
          </div>
        </div>

        {/* Gauge 2: Starlink Fleet Health */}
        <div className="lebron-card p-5 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Disponibilité Flotte Starlink</span>
            <Radio className="w-4 h-4 text-cyan-600" />
          </div>

          <div className="my-3 flex items-center justify-around">
            <div className="relative w-22 h-22 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-cyan-600 transition-all duration-1000"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * starlinkHealthRate) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-slate-900">{starlinkHealthRate}%</span>
                <span className="text-[9px] text-slate-400 uppercase">Signal</span>
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-900 text-sm">
                {stats.starlinkOnlineCount} terminaux actifs
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Liaisons maritimes et chantiers opérationnelles.</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-right">
            1 kit en quota prioritaire limite
          </div>
        </div>

        {/* Card 3: Electronics Low Stock Alert */}
        <div className="lebron-card p-5 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Stocks Pièces & Électronique</span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="my-2">
            <div className="text-2xl font-bold text-slate-900">
              {stats.electronicsCount} <span className="text-xs font-normal text-slate-500">références en magasin</span>
            </div>
            {stats.lowStockCount > 0 ? (
              <div className="mt-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{stats.lowStockCount} article(s) sous seuil de réserve minimal !</span>
              </div>
            ) : (
              <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tous les stocks sont à niveau nominal.</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Emplacement : Entrepôt Central</span>
            <span className="text-red-600 font-medium cursor-pointer hover:underline" onClick={() => setActiveTab('electronics')}>
              Gérer stock →
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Movements Table & Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Recent Activity */}
        <div className="lg:col-span-2 lebron-card p-5 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dernières Sorties & Affectations de Matériel</h3>
              <p className="text-[11px] text-slate-500">Traçabilité nominative des prêts aux salariés</p>
            </div>
            <button
              onClick={() => setActiveTab('movements')}
              className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100 text-xs">
            {movements.slice(0, 4).map((mov) => (
              <div key={mov.id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {mov.assetCategory === 'it' ? (
                      <Laptop className="w-4 h-4 text-red-600" />
                    ) : mov.assetCategory === 'starlink' ? (
                      <Satellite className="w-4 h-4 text-cyan-600" />
                    ) : mov.assetCategory === 'plans' ? (
                      <Smartphone className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Cpu className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{mov.assetName}</div>
                    <div className="text-[11px] text-slate-500">
                      Attribué à <strong className="text-slate-700">{mov.targetUser || 'Stock général'}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    mov.actionType === 'check_out'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {mov.actionType === 'check_out' ? 'Prêt / Sortie' : 'Retour Réserve'}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(mov.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Urgent Alerts */}
        <div className="lebron-card p-5 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <h3 className="text-sm font-bold text-slate-900">Points d&apos;Attention</h3>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                {alerts.filter(a => !a.read).length} non lus
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setActiveTab('alerts')}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {alert.severity === 'critical' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    )}
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{alert.title}</h5>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              Consulter toutes les alertes →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
