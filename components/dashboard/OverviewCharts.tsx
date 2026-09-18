'use client';

import React, { useEffect, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Chart as ChartJS, registerables } from 'chart.js';
import { 
  Activity, 
  MapPin, 
  Building2, 
  PieChart, 
  ShieldCheck, 
  Layers,
  Printer,
  Cpu
} from 'lucide-react';

ChartJS.register(...registerables);

// Set global Chart.js defaults to Poppins, non-bold, professional slate colors
ChartJS.defaults.font.family = 'var(--font-poppins), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
ChartJS.defaults.font.size = 11;
ChartJS.defaults.font.weight = 'normal';
ChartJS.defaults.color = '#64748b';

export default function OverviewCharts() {
  const { 
    printers, 
    itAssets, 
    employees, 
    networkAssets, 
    upsAssets, 
    applicationAccounts 
  } = useInventory();

  // 6 Canvas refs
  const healthChartRef = useRef<HTMLCanvasElement | null>(null);
  const centersChartRef = useRef<HTMLCanvasElement | null>(null);
  const companyChartRef = useRef<HTMLCanvasElement | null>(null);
  const categoryChartRef = useRef<HTMLCanvasElement | null>(null);
  const printerTypesChartRef = useRef<HTMLCanvasElement | null>(null);
  const itSpecsChartRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Data: Material condition
  const itGood = itAssets.filter(a => a.status === 'in_use').length;
  const itReserve = itAssets.filter(a => a.status === 'available').length;
  const itMaint = itAssets.filter(a => a.status === 'maintenance').length;

  const prnGood = printers.filter(p => p.status === 'Fonctionnel').length;
  const prnMaint = printers.filter(p => p.status === 'Maintenance' || p.status === 'En panne').length;

  const netGood = (networkAssets || []).filter(n => n.status !== 'En panne' && n.status !== 'Maintenance').length;
  const netMaint = (networkAssets || []).filter(n => n.status === 'En panne' || n.status === 'Maintenance').length;

  const upsGood = (upsAssets || []).filter(u => u.status !== 'En panne' && u.status !== 'Maintenance').length;
  const upsMaint = (upsAssets || []).filter(u => u.status === 'En panne' || u.status === 'Maintenance').length;

  const totalGood = itGood + prnGood + netGood + upsGood;
  const totalReserve = itReserve;
  const totalMaint = itMaint + prnMaint + netMaint + upsMaint;
  const totalHardware = totalGood + totalReserve + totalMaint;
  const goodPct = totalHardware > 0 ? Math.round((totalGood / totalHardware) * 100) : 100;

  // 2. Data: Centers & Environments
  const delmasIT = itAssets.filter(a => a.location?.includes('Delmas') || a.location?.includes('52')).length;
  const delmasPrn = printers.filter(p => p.site?.includes('Delmas') || p.site?.includes('52')).length;
  const delmasNet = (networkAssets || []).filter(n => n.site?.includes('Delmas') || n.site?.includes('52')).length;
  const delmasUPS = (upsAssets || []).filter(u => u.site?.includes('Delmas') || u.site?.includes('52')).length;
  const delmasEmp = employees.filter(e => e.location?.includes('Delmas') || e.location?.includes('52')).length;

  const aeroIT = itAssets.filter(a => a.location?.includes('Aéroport') || a.location?.includes('Depot')).length;
  const aeroPrn = printers.filter(p => p.site?.includes('Aéroport') || p.site?.includes('Depot')).length;
  const aeroNet = (networkAssets || []).filter(n => n.site?.includes('Aéroport') || n.site?.includes('Depot')).length;
  const aeroUPS = (upsAssets || []).filter(u => u.site?.includes('Aéroport') || u.site?.includes('Depot')).length;
  const aeroEmp = employees.filter(e => e.location?.includes('Aéroport') || e.location?.includes('Depot')).length;

  // 3. Data: Company breakdown
  const companies = [
    { name: 'Lebrun S.A.', tag: 'LEB' },
    { name: 'Autobiz', tag: 'AUT' },
    { name: 'Caribe Motors', tag: 'CAR' },
    { name: 'Leader Foods', tag: 'LFD' },
    { name: 'Tirezone', tag: 'TRZ' }
  ];

  const companyData = companies.map(c => {
    const cPrinters = printers.filter(p => p.company?.toLowerCase().includes(c.name.toLowerCase()) || (c.name === 'Lebrun S.A.' && p.company?.toLowerCase().includes('lebrun'))).length;
    const cIT = itAssets.filter(i => (i as any).company?.toLowerCase().includes(c.name.toLowerCase()) || (c.name === 'Lebrun S.A.' && (i.assetTag?.includes('LEB') || i.assignedDepartment?.toLowerCase().includes('lebrun')))).length;
    const cEmp = employees.filter(e => e.company?.toLowerCase().includes(c.name.toLowerCase()) || (c.name === 'Lebrun S.A.' && e.company?.toLowerCase().includes('lebrun'))).length;
    return {
      name: c.name,
      printers: cPrinters,
      it: cIT,
      employees: cEmp,
      total: cPrinters + cIT + cEmp
    };
  });

  // 4. Data: Categories
  const totalIT = itAssets.length;
  const totalPrinters = printers.length;
  const totalNetwork = networkAssets?.length || 5;
  const totalUPS = upsAssets?.length || 7;
  const totalEmployees = employees.length;
  const totalAppAccounts = applicationAccounts?.length || 13;

  // 5. Data: Printer typology & connectivity
  const multiPrn = printers.filter(p => p.type.toLowerCase().includes('multi')).length;
  const laserPrn = printers.filter(p => p.type.toLowerCase().includes('laser') && !p.type.toLowerCase().includes('cheque')).length;
  const chequePrn = printers.filter(p => p.type.toLowerCase().includes('cheque')).length;
  const netConnectedPrn = printers.filter(p => p.ipAddress && p.ipAddress !== 'N/A').length;

  // 6. Data: IT CPU & Specs
  const i5Count = itAssets.filter(a => (a.cpu || '').toLowerCase().includes('i5')).length;
  const i3Count = itAssets.filter(a => (a.cpu || '').toLowerCase().includes('i3')).length;
  const i7Count = itAssets.filter(a => (a.cpu || '').toLowerCase().includes('i7') || (a.cpu || '').toLowerCase().includes('xeon')).length;
  const otherCpu = Math.max(0, totalIT - (i5Count + i3Count + i7Count));

  // --- CHART 1: Material Condition (Doughnut) ---
  useEffect(() => {
    if (!healthChartRef.current) return;
    const ctx = healthChartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: ['En bon état', 'En réserve', 'Maintenance'],
        datasets: [{
          data: [totalGood, totalReserve, totalMaint],
          backgroundColor: ['#334155', '#94a3b8', '#e2e8f0'],
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              padding: 12,
              font: { size: 11, weight: 'normal' },
              color: '#64748b'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw} équipements`
            }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [totalGood, totalReserve, totalMaint]);

  // --- CHART 2: Centers & Environments (Bar chart) ---
  useEffect(() => {
    if (!centersChartRef.current) return;
    const ctx = centersChartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: ['Delmas 52 (Siège)', 'Aéroport Depot'],
        datasets: [
          {
            label: 'Postes IT',
            data: [delmasIT, aeroIT],
            backgroundColor: '#1e293b',
            borderRadius: 4
          },
          {
            label: 'Imprimantes',
            data: [delmasPrn, aeroPrn],
            backgroundColor: '#475569',
            borderRadius: 4
          },
          {
            label: 'Réseau & UPS',
            data: [delmasNet + delmasUPS, aeroNet + aeroUPS],
            backgroundColor: '#94a3b8',
            borderRadius: 4
          },
          {
            label: 'Personnel',
            data: [delmasEmp, aeroEmp],
            backgroundColor: '#cbd5e1',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, weight: 'normal' }, color: '#64748b' }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f8fafc' },
            ticks: { precision: 0, font: { size: 11, weight: 'normal' }, color: '#94a3b8' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              padding: 10,
              font: { size: 11, weight: 'normal' },
              color: '#64748b'
            }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [delmasIT, aeroIT, delmasPrn, aeroPrn, delmasNet, delmasUPS, aeroNet, aeroUPS, delmasEmp, aeroEmp]);

  // --- CHART 3: Volume by Company (Stacked Bar) ---
  useEffect(() => {
    if (!companyChartRef.current) return;
    const ctx = companyChartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: companyData.map(c => c.name),
        datasets: [
          {
            label: 'Imprimantes',
            data: companyData.map(c => c.printers),
            backgroundColor: '#334155',
            borderRadius: 3
          },
          {
            label: 'Postes IT',
            data: companyData.map(c => c.it),
            backgroundColor: '#64748b',
            borderRadius: 3
          },
          {
            label: 'Collaborateurs',
            data: companyData.map(c => c.employees),
            backgroundColor: '#cbd5e1',
            borderRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { font: { size: 11, weight: 'normal' }, color: '#64748b' }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: '#f8fafc' },
            ticks: { precision: 0, font: { size: 11, weight: 'normal' }, color: '#94a3b8' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              padding: 10,
              font: { size: 11, weight: 'normal' },
              color: '#64748b'
            }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [companyData]);

  // --- CHART 4: Categories Breakdown (Doughnut) ---
  useEffect(() => {
    if (!categoryChartRef.current) return;
    const ctx = categoryChartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Postes IT', 'Imprimantes', 'Réseau', 'Onduleurs UPS', 'Personnel', 'Applications GP'],
        datasets: [{
          data: [totalIT, totalPrinters, totalNetwork, totalUPS, totalEmployees, totalAppAccounts],
          backgroundColor: [
            '#0f172a',
            '#334155',
            '#475569',
            '#64748b',
            '#94a3b8',
            '#cbd5e1'
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              padding: 8,
              font: { size: 11, weight: 'normal' },
              color: '#64748b'
            }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [totalIT, totalPrinters, totalNetwork, totalUPS, totalEmployees, totalAppAccounts]);

  // --- CHART 5: Printer Typology & Connectivity (Bar Chart) ---
  useEffect(() => {
    if (!printerTypesChartRef.current) return;
    const ctx = printerTypesChartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: ['Multifonction', 'Laser N&B', 'Laser Chèques', 'Réseau IP Actif'],
        datasets: [{
          label: 'Unités',
          data: [multiPrn, laserPrn, chequePrn, netConnectedPrn],
          backgroundColor: ['#334155', '#475569', '#64748b', '#94a3b8'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, weight: 'normal' }, color: '#64748b' }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f8fafc' },
            ticks: { precision: 0, font: { size: 11, weight: 'normal' }, color: '#94a3b8' }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.parsed.y} imprimantes`
            }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [multiPrn, laserPrn, chequePrn, netConnectedPrn]);

  // --- CHART 6: IT Workstations CPU Breakdown (Horizontal Bar) ---
  useEffect(() => {
    if (!itSpecsChartRef.current) return;
    const ctx = itSpecsChartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: ['Intel Core i5', 'Intel Core i3', 'Intel Core i7 / Xeon', 'Autres processeurs'],
        datasets: [{
          label: 'Postes Dell',
          data: [i5Count, i3Count, i7Count, otherCpu],
          backgroundColor: ['#1e293b', '#475569', '#64748b', '#94a3b8'],
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#f8fafc' },
            ticks: { precision: 0, font: { size: 11, weight: 'normal' }, color: '#94a3b8' }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 11, weight: 'normal' }, color: '#64748b' }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.parsed.x} postes équipés`
            }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [i5Count, i3Count, i7Count, otherCpu]);

  return (
    <div className="space-y-4 font-sans">
      {/* Title section without pill box */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <span>Indicateurs & Graphiques de Synthèse</span>
        </h2>
        <span className="text-xs text-slate-400 font-normal">
          {goodPct}% de matériel opérationnel
        </span>
      </div>

      {/* Grid of 6 Minimalist Professional Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GRAPH 1: État & Santé des Matériaux */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-800">État & Santé des Matériaux</h3>
                  <p className="text-[11px] text-slate-400 font-normal">Supervision de {totalHardware} équipements physiques</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-normal">{goodPct}%</span>
            </div>

            <div className="relative h-64 w-full pt-2 flex items-center justify-center">
              <canvas ref={healthChartRef} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-5">
                <span className="text-2xl font-semibold text-slate-900 tracking-tight leading-none">
                  {goodPct}%
                </span>
                <span className="text-[11px] text-slate-400 mt-1 font-normal tracking-wide">
                  Disponibilité
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-normal">
            <span>En bon état : <span className="text-slate-900 font-semibold">{totalGood}</span></span>
            <span>En réserve : <span className="text-slate-900 font-semibold">{totalReserve}</span></span>
            <span>Maintenance : <span className="text-slate-900 font-semibold">{totalMaint}</span></span>
          </div>
        </div>

        {/* GRAPH 2: Centres & Environnements d'Implantation */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-800">Centres & Environnements d&apos;Implantation</h3>
                  <p className="text-[11px] text-slate-400 font-normal">Volume d&apos;équipements par centre opérationnel</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-normal">Delmas 52 vs Aéroport</span>
            </div>

            <div className="relative h-64 w-full pt-2">
              <canvas ref={centersChartRef} />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-normal">
            <span>Siège : <span className="text-slate-600 font-medium">Delmas 52</span> ({delmasIT + delmasPrn + delmasNet + delmasUPS} équipements)</span>
            <span>Dépôt : <span className="text-slate-600 font-medium">Aéroport</span> ({aeroIT + aeroPrn + aeroNet + aeroUPS} équipements)</span>
          </div>
        </div>

        {/* GRAPH 3: Volume & Charge par Filiale */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-800">Volume & Charge par Filiale</h3>
                  <p className="text-[11px] text-slate-400 font-normal">Imprimantes, postes IT et collaborateurs</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-normal">5 sociétés</span>
            </div>

            <div className="relative h-64 w-full pt-2">
              <canvas ref={companyChartRef} />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-normal">
            <span>Dotation majeure : <span className="text-slate-600 font-medium">Lebrun S.A.</span></span>
            <span>Deuxième pôle : <span className="text-slate-600 font-medium">Autobiz</span></span>
          </div>
        </div>

        {/* GRAPH 4: Répartition Globale par Famille */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <PieChart className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-800">Répartition Globale par Famille</h3>
                  <p className="text-[11px] text-slate-400 font-normal">{totalIT + totalPrinters + totalNetwork + totalUPS + totalEmployees + totalAppAccounts} éléments suivis</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-normal">6 catégories</span>
            </div>

            <div className="relative h-64 w-full pt-2 flex items-center justify-center">
              <canvas ref={categoryChartRef} />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-normal">
            <span>Inventaire consolidé</span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Données synchronisées</span>
            </span>
          </div>
        </div>

        {/* GRAPH 5: Typologie & Connectivité des Imprimantes */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-800">Typologie & Connectivité des Imprimantes</h3>
                  <p className="text-[11px] text-slate-400 font-normal">{totalPrinters} imprimantes répertoriées</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-normal">{netConnectedPrn} connectées IP</span>
            </div>

            <div className="relative h-64 w-full pt-2">
              <canvas ref={printerTypesChartRef} />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-normal">
            <span>Flotte principale : <span className="text-slate-600 font-medium">Multifonction & Laser</span></span>
            <span>Réseau : <span className="text-slate-600 font-medium">{netConnectedPrn} adresses IP</span></span>
          </div>
        </div>

        {/* GRAPH 6: Architecture CPU & Puissance Postes IT */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-800">Architecture CPU & Puissance Postes IT</h3>
                  <p className="text-[11px] text-slate-400 font-normal">Distribution des processeurs Dell OptiPlex en service</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-normal">{totalIT} stations Dell</span>
            </div>

            <div className="relative h-64 w-full pt-2">
              <canvas ref={itSpecsChartRef} />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-normal">
            <span>Standard parc : <span className="text-slate-600 font-medium">Intel Core i5</span></span>
            <span>Stockage : <span className="text-slate-600 font-medium">SSD Haute vitesse</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
