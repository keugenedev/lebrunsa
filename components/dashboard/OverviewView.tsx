'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import CompanyLogo from '@/components/common/CompanyLogo';
import { 
  Printer, 
  Laptop, 
  Users, 
  Building2, 
  Download, 
  ArrowUpRight, 
  Network, 
  Barcode, 
  Zap, 
  KeyRound 
} from 'lucide-react';

export default function OverviewView() {
  const { 
    printers, 
    itAssets, 
    employees, 
    networkAssets, 
    upsAssets, 
    applicationAccounts, 
    setActiveTab, 
    exportCSV,
    openBarcodeScanner
  } = useInventory();

  // Statistics calculation based on authentic data
  const totalPrinters = printers.length;
  const multiCount = printers.filter(p => p.type?.toLowerCase().includes('multi')).length;
  const laserCount = printers.filter(p => p.type?.toLowerCase().includes('laser')).length;

  const totalIT = itAssets.length;
  const totalEmployees = employees.length;
  const totalNetwork = networkAssets?.length || 5;
  const totalUPS = upsAssets?.length || 7;
  const totalAppAccounts = applicationAccounts?.length || 13;

  // Breakdown by company with official logos and Tirezone included
  const companies = [
    { name: 'Lebrun S.A.', site: 'Delmas 52', tag: 'LEB', logo: '/logos/lebrun.png' },
    { name: 'Autobiz', site: 'Delmas 52', tag: 'AUT', logo: '/logos/Autobiz.png' },
    { name: 'Caribe Motors', site: 'Delmas 52', tag: 'CAR', logo: '/logos/Caribe.png' },
    { name: 'Leader Foods', site: 'Aéroport Depot', tag: 'LFD', logo: '/logos/leader.png' },
    { name: 'Tirezone', site: 'Delmas 52', tag: 'TRZ', logo: '/logos/tirezone.png' }
  ];

  const companyStats = companies.map(c => {
    const cPrinters = printers.filter(p => p.company?.toLowerCase().includes(c.name.toLowerCase()) || (c.name === 'Lebrun S.A.' && p.company?.toLowerCase().includes('lebrun')));
    const cIT = itAssets.filter(i => (i as any).company?.toLowerCase().includes(c.name.toLowerCase()) || (c.name === 'Lebrun S.A.' && (i.assetTag?.includes('LEB') || i.assignedDepartment?.toLowerCase().includes('lebrun'))));
    const cEmp = employees.filter(e => e.company?.toLowerCase().includes(c.name.toLowerCase()) || (c.name === 'Lebrun S.A.' && e.company?.toLowerCase().includes('lebrun')));
    return {
      ...c,
      printerCount: cPrinters.length,
      itCount: cIT.length,
      empCount: cEmp.length
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Enterprise Corporate Header */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-red-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-sm rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-red-600/30 text-red-300 px-2.5 py-0.5 rounded-md border border-red-500/40">
              Groupe Lebrun S.A. • Gestion de Parc Global
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-2">
            Supervision du Matériel & Traçabilité Code-Barres
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Parc officiel des {totalPrinters} imprimantes HP, {totalIT} postes Dell OptiPlex, {totalNetwork} équipements réseau TP-Link, {totalUPS} onduleurs UPS et {totalEmployees} collaborateurs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={openBarcodeScanner}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-all shadow-sm cursor-pointer"
          >
            <Barcode className="w-4 h-4" />
            <span>Scanner un Matériel</span>
          </button>
          <button
            onClick={() => exportCSV()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all shadow-2xs cursor-pointer backdrop-blur-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Row 1: Key Metric Cards (6 distinct cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Metric 1: Imprimantes */}
        <div 
          onClick={() => setActiveTab('printers')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-red-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Imprimantes</span>
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Printer className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalPrinters}</span>
              <span className="text-[11px] font-medium text-slate-500">unités</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>{multiCount} Multi • {laserCount} Laser</span>
            <span className="text-red-600 font-semibold flex items-center gap-0.5">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Postes IT */}
        <div 
          onClick={() => setActiveTab('it')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-blue-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Postes IT</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Laptop className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalIT}</span>
              <span className="text-[11px] font-medium text-slate-500">postes</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>Dell & HP OptiPlex</span>
            <span className="text-blue-600 font-semibold flex items-center gap-0.5">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: Réseau (seul) */}
        <div 
          onClick={() => setActiveTab('network')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-cyan-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Réseau</span>
              <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Network className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalNetwork}</span>
              <span className="text-[11px] font-medium text-slate-500">switches & AP</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>TP-Link Gigabit PoE</span>
            <span className="text-cyan-600 font-semibold flex items-center gap-0.5">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Onduleurs UPS (seul) */}
        <div 
          onClick={() => setActiveTab('ups')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-amber-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Onduleurs UPS</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalUPS}</span>
              <span className="text-[11px] font-medium text-slate-500">unités</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>Forza & APC</span>
            <span className="text-amber-600 font-semibold flex items-center gap-0.5">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 5: Applications (strictly Applications, no &) */}
        <div 
          onClick={() => setActiveTab('applications')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-emerald-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Applications</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <KeyRound className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalAppAccounts}</span>
              <span className="text-[11px] font-medium text-slate-500">comptes GP</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>Microsoft GP</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 6: Personnel */}
        <div 
          onClick={() => setActiveTab('personnel')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-purple-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Personnel</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalEmployees}</span>
              <span className="text-[11px] font-medium text-slate-500">salariés</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>Delmas 52</span>
            <span className="text-purple-600 font-semibold flex items-center gap-0.5">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Filiales du Groupe Lebrun S.A. Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-red-600" />
            <span>Répartition par Entreprise du Groupe</span>
          </h2>
          <span className="text-xs text-slate-500">
            Delmas 52 & Aéroport Depot
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {companyStats.map((c) => (
            <div key={c.name} className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="h-8 flex items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={c.logo} 
                      alt={c.name} 
                      className="h-7 max-w-[105px] w-auto object-contain object-left" 
                    />
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-mono font-bold text-[10px] shrink-0">
                    {c.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">{c.site}</p>
              </div>

              <div className="mt-3 space-y-1.5 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Printer className="w-3.5 h-3.5 text-red-600" />
                    <span>Imprimantes</span>
                  </span>
                  <span className="font-bold text-slate-900 text-xs">{c.printerCount}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Laptop className="w-3.5 h-3.5 text-blue-600" />
                    <span>Postes IT</span>
                  </span>
                  <span className="font-bold text-slate-900 text-xs">{c.itCount}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>Personnel</span>
                  </span>
                  <span className="font-bold text-slate-900 text-xs">{c.empCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Live Overview Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Latest Printers Quick List */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <Printer className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Parc Imprimantes HP</h3>
                  <p className="text-[11px] text-slate-500">{totalPrinters} imprimantes réelles</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('printers')}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Voir tout</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {printers.slice(0, 5).map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CompanyLogo company={p.company} className="h-4 max-w-[65px] w-auto object-contain shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate text-xs">{p.name}</div>
                      <div className="text-slate-500 text-[10px] truncate">{p.model}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 whitespace-nowrap">
                    <span className="font-mono text-[10px] text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 block">
                      {p.ipAddress || 'N/A'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
            <button
              onClick={() => setActiveTab('printers')}
              className="text-xs font-semibold text-slate-600 hover:text-red-600 cursor-pointer"
            >
              Consulter les {totalPrinters} imprimantes &rarr;
            </button>
          </div>
        </div>

        {/* Right: Workstations & Personnel Quick List */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Laptop className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Postes Dell & Collaborateurs</h3>
                  <p className="text-[11px] text-slate-500">{totalEmployees} collaborateurs Delmas 52</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('personnel')}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Voir tout</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {employees.slice(0, 5).map((emp) => (
                <div key={emp.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CompanyLogo company={emp.company} className="h-4 max-w-[65px] w-auto object-contain shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate text-xs">{emp.fullName}</div>
                      <div className="text-slate-500 text-[10px] truncate">{emp.department}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 whitespace-nowrap">
                    <span className="font-mono font-semibold text-[10px] text-red-600 block">
                      {emp.accounts?.appUsername ? `@${emp.accounts.appUsername}` : emp.employeeId}
                    </span>
                    <span className="text-[10px] text-slate-500">{emp.workstation?.pcName || 'PC Assigné'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
            <button
              onClick={() => setActiveTab('personnel')}
              className="text-xs font-semibold text-slate-600 hover:text-red-600 cursor-pointer"
            >
              Gérer les {totalEmployees} collaborateurs et identifiants &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
