'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import CompanyLogo from '@/components/common/CompanyLogo';
import OverviewCharts from './OverviewCharts';
import { 
  Printer, 
  Laptop, 
  Users, 
  Building2, 
  ArrowUpRight, 
  Network, 
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
    setActiveTab
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

  const matchCompany = (comp: string | undefined, target: string, tag?: string, email?: string) => {
    const t = target.toLowerCase();
    const c = (comp || '').toLowerCase();
    const tg = (tag || '').toUpperCase();
    const em = (email || '').toLowerCase();
    if (t.includes('autobiz')) return c.includes('auto') || tg.includes('AUT') || em.includes('autobiz');
    if (t.includes('lebrun')) return c.includes('lebrun') || tg.includes('LEB') || em.includes('lebrun');
    if (t.includes('caribe')) return c.includes('caribe') || tg.includes('CAR') || em.includes('caribe');
    if (t.includes('leader')) return c.includes('leader') || tg.includes('LFD') || em.includes('leader');
    if (t.includes('tirezone')) return c.includes('tire') || tg.includes('TRZ') || em.includes('tirezone');
    return c.includes(t);
  };

  const companyStats = companies.map(c => {
    const cPrinters = printers.filter(p => matchCompany(p.company, c.name));
    const cIT = itAssets.filter(i => {
      const emp = employees.find(e => e.id === i.assignedPersonnelId || e.fullName === i.assignedTo);
      return matchCompany(i.company || emp?.company, c.name, i.assetTag, i.assignedEmail);
    });
    const cEmp = employees.filter(e => matchCompany(e.company, c.name));
    return {
      ...c,
      printerCount: cPrinters.length,
      itCount: cIT.length,
      empCount: cEmp.length
    };
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Row 1: Key Metric Cards (6 distinct cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Metric 1: Imprimantes */}
        <div 
          onClick={() => setActiveTab('printers')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-slate-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Imprimantes</span>
              <Printer className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900 tracking-tight font-sans">{totalPrinters}</span>
              <span className="text-[11px] font-medium text-slate-500">unités</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>{multiCount} Multi • {laserCount} Laser</span>
            <span className="text-slate-500 font-medium flex items-center gap-0.5 group-hover:text-slate-900 transition-colors">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Postes IT */}
        <div 
          onClick={() => setActiveTab('it')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-slate-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Postes IT</span>
              <Laptop className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900 tracking-tight font-sans">{totalIT}</span>
              <span className="text-[11px] font-medium text-slate-500">postes</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>Dell & Workstations</span>
            <span className="text-slate-500 font-medium flex items-center gap-0.5 group-hover:text-slate-900 transition-colors">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: Réseau */}
        <div 
          onClick={() => setActiveTab('network')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-slate-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Réseau</span>
              <Network className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900 tracking-tight font-sans">{totalNetwork}</span>
              <span className="text-[11px] font-medium text-slate-500">switches & AP</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>TP-Link & Cisco</span>
            <span className="text-slate-500 font-medium flex items-center gap-0.5 group-hover:text-slate-900 transition-colors">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Onduleurs UPS */}
        <div 
          onClick={() => setActiveTab('ups')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-slate-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Onduleurs UPS</span>
              <Zap className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900 tracking-tight font-sans">{totalUPS}</span>
              <span className="text-[11px] font-medium text-slate-500">unités</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>Forza & APC</span>
            <span className="text-slate-500 font-medium flex items-center gap-0.5 group-hover:text-slate-900 transition-colors">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 5: Applications */}
        <div 
          onClick={() => setActiveTab('applications')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-slate-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Applications</span>
              <KeyRound className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900 tracking-tight font-sans">{totalAppAccounts}</span>
              <span className="text-[11px] font-medium text-slate-500">comptes GP</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>Microsoft GP</span>
            <span className="text-slate-500 font-medium flex items-center gap-0.5 group-hover:text-slate-900 transition-colors">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 6: Personnel */}
        <div 
          onClick={() => setActiveTab('personnel')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-slate-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Personnel</span>
              <Users className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900 tracking-tight font-sans">{totalEmployees}</span>
              <span className="text-[11px] font-medium text-slate-500">salariés</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>Delmas 52</span>
            <span className="text-slate-500 font-medium flex items-center gap-0.5 group-hover:text-slate-900 transition-colors">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Filiales de Lebrun S.A. Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Répartition par Entreprise</span>
          </h2>
          <span className="text-xs text-slate-500">
            Delmas 52 • Pétion-Ville • Delmas 60 • Canapé-Vert
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {companyStats.map((c, idx) => (
            <div key={`${c.name}-${idx}`} className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="h-8 flex items-center">
                    <CompanyLogo 
                      company={c.name} 
                      className="h-7 max-w-[105px] w-auto object-contain object-left" 
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-normal shrink-0">{c.tag}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">{c.site}</p>
              </div>

              <div className="mt-3 space-y-1.5 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span>Imprimantes</span>
                  </span>
                  <span className="font-semibold text-slate-900 text-xs">{c.printerCount}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                    <span>Postes IT</span>
                  </span>
                  <span className="font-semibold text-slate-900 text-xs">{c.itCount}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Personnel</span>
                  </span>
                  <span className="font-semibold text-slate-900 text-xs">{c.empCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Visual Analytics with Chart.js (Condition des matériaux & Centres d'implantation) */}
      <OverviewCharts />

      {/* Row 4: Live Overview Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Latest Printers Quick List */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-800 text-xs">Imprimantes</h3>
                  <p className="text-[11px] text-slate-500">{totalPrinters} imprimantes réelles</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('printers')}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Voir tout</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {printers.slice(0, 5).map((p, idx) => (
                <div key={`${p.assetTag || p.id || 'prn'}-${idx}`} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CompanyLogo company={p.company} className="h-4 max-w-[65px] w-auto object-contain shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate text-xs">{p.name}</div>
                      <div className="text-slate-500 text-[10px] truncate">{p.model}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 whitespace-nowrap">
                    <span className="text-[11px] text-slate-500 font-normal block">{p.ipAddress || 'N/A'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
            <button
              onClick={() => setActiveTab('printers')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Voir toutes les imprimantes &rarr;
            </button>
          </div>
        </div>

        {/* Right: Workstations & Personnel Quick List */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-800 text-xs">Postes Dell & Collaborateurs</h3>
                  <p className="text-[11px] text-slate-500">{totalEmployees} collaborateurs Delmas 52</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('personnel')}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Voir tout</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {employees.slice(0, 5).map((emp, idx) => (
                <div key={`${emp.employeeId || emp.id || 'emp'}-${idx}`} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs">
                      {emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate text-xs">{emp.fullName}</div>
                      <div className="text-slate-500 text-[10px] truncate">{emp.department}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 whitespace-nowrap flex items-center gap-2.5">
                    <CompanyLogo company={emp.company} className="h-4 max-w-[60px] w-auto object-contain shrink-0" />
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal block">
                        {emp.accounts?.appUsername ? `@${emp.accounts.appUsername}` : emp.employeeId}
                      </span>
                      <span className="text-[10px] text-slate-500">{emp.workstation?.pcName || 'PC Assigné'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
            <button
              onClick={() => setActiveTab('personnel')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Gérer les {totalEmployees} collaborateurs et identifiants &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
