'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  Cpu,
  RotateCcw,
  Sparkles
} from 'lucide-react';

ChartJS.register(...registerables);

// Set global Chart.js defaults to Poppins, non-bold, professional slate colors
ChartJS.defaults.font.family = 'var(--font-poppins), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
ChartJS.defaults.font.size = 11;
ChartJS.defaults.font.weight = 'normal';
ChartJS.defaults.color = '#64748b';

// Isolated sub-component for the availability counter to prevent parent re-renders on animation frames
function AvailabilityCounter({ 
  target, 
  inView, 
  animationKey 
}: { 
  target: number; 
  inView: boolean; 
  animationKey: number; 
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) {
      setCount(0);
      return;
    }

    setCount(0);
    let startTimestamp: number | null = null;
    const duration = 2500;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, inView, animationKey]);

  return <>{count}%</>;
}

export default function OverviewCharts() {
  const { 
    printers, 
    itAssets, 
    employees, 
    networkAssets, 
    upsAssets, 
    applicationAccounts 
  } = useInventory();

  // Animation replay key & state for dynamic presentation
  const [animationKey, setAnimationKey] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);

  // Scroll reveal visibility state for each chart card
  const [inView, setInView] = useState({
    chart1: false,
    chart2: false,
    chart3: false,
    chart4: false,
    chart5: false,
    chart6: false,
  });

  // 6 Card Container refs for scroll-detection
  const card1Ref = useRef<HTMLDivElement | null>(null);
  const card2Ref = useRef<HTMLDivElement | null>(null);
  const card3Ref = useRef<HTMLDivElement | null>(null);
  const card4Ref = useRef<HTMLDivElement | null>(null);
  const card5Ref = useRef<HTMLDivElement | null>(null);
  const card6Ref = useRef<HTMLDivElement | null>(null);

  // 6 Canvas refs
  const healthChartRef = useRef<HTMLCanvasElement | null>(null);
  const centersChartRef = useRef<HTMLCanvasElement | null>(null);
  const companyChartRef = useRef<HTMLCanvasElement | null>(null);
  const categoryChartRef = useRef<HTMLCanvasElement | null>(null);
  const printerTypesChartRef = useRef<HTMLCanvasElement | null>(null);
  const itSpecsChartRef = useRef<HTMLCanvasElement | null>(null);

  // Scroll-triggered intersection observer: animates graphs as they scroll into view
  useEffect(() => {
    const cards = [
      { key: 'chart1' as const, ref: card1Ref },
      { key: 'chart2' as const, ref: card2Ref },
      { key: 'chart3' as const, ref: card3Ref },
      { key: 'chart4' as const, ref: card4Ref },
      { key: 'chart5' as const, ref: card5Ref },
      { key: 'chart6' as const, ref: card6Ref },
    ];

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setInView({
        chart1: true,
        chart2: true,
        chart3: true,
        chart4: true,
        chart5: true,
        chart6: true,
      });
      return;
    }

    // Identify the scrollable main container in the layout
    const scrollContainer = card1Ref.current?.closest('main') || null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targetKey = entry.target.getAttribute('data-chart-key') as keyof typeof inView;
            if (targetKey) {
              setInView((prev) => (prev[targetKey] ? prev : { ...prev, [targetKey]: true }));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        root: scrollContainer,
        rootMargin: '0px 0px -10px 0px',
        threshold: 0.08,
      }
    );

    cards.forEach(({ ref }) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, [animationKey]);

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

  const handleReplay = () => {
    setIsReplaying(true);
    setInView({
      chart1: false,
      chart2: false,
      chart3: false,
      chart4: false,
      chart5: false,
      chart6: false,
    });
    setAnimationKey(prev => prev + 1);
    setTimeout(() => setIsReplaying(false), 2600);
  };

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

  // 3. Data: Company breakdown (memoized to keep reference stable and prevent chart redraws)
  const companies = useMemo(() => [
    { name: 'Lebrun S.A.', tag: 'LEB' },
    { name: 'Autobiz', tag: 'AUT' },
    { name: 'Caribe Motors', tag: 'CAR' },
    { name: 'Leader Foods', tag: 'LFD' },
    { name: 'Tirezone', tag: 'TRZ' }
  ], []);

  const companyData = useMemo(() => {
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

    return companies.map(c => {
      const cPrinters = printers.filter(p => matchCompany(p.company, c.name)).length;
      const cIT = itAssets.filter(i => {
        const emp = employees.find(e => e.id === i.assignedPersonnelId || e.fullName === i.assignedTo);
        return matchCompany(i.company || emp?.company, c.name, i.assetTag, i.assignedEmail);
      }).length;
      const cEmp = employees.filter(e => matchCompany(e.company, c.name)).length;
      return {
        name: c.name,
        printers: cPrinters,
        it: cIT,
        employees: cEmp,
        total: cPrinters + cIT + cEmp
      };
    });
  }, [companies, printers, itAssets, employees]);

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
    if (!inView.chart1 || !healthChartRef.current) return;
    const ctx = healthChartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: ['En bon état', 'En réserve', 'Maintenance'],
        datasets: [{
          data: [totalGood, totalReserve, totalMaint],
          backgroundColor: ['#1e293b', '#64748b', '#cbd5e1'],
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2500,
          easing: 'easeInOutQuart'
        },
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
  }, [totalGood, totalReserve, totalMaint, inView.chart1, animationKey]);

  // --- CHART 2: Centers & Environments (Bar chart) ---
  useEffect(() => {
    if (!inView.chart2 || !centersChartRef.current) return;
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
            backgroundColor: '#0f172a',
            borderRadius: 4
          },
          {
            label: 'Imprimantes',
            data: [delmasPrn, aeroPrn],
            backgroundColor: '#334155',
            borderRadius: 4
          },
          {
            label: 'Réseau & UPS',
            data: [delmasNet + delmasUPS, aeroNet + aeroUPS],
            backgroundColor: '#64748b',
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
        animation: {
          duration: 2200,
          easing: 'easeOutQuart',
          delay: (context: any) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 260 + (context.datasetIndex || 0) * 160;
            }
            return delay;
          }
        },
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
  }, [delmasIT, aeroIT, delmasPrn, aeroPrn, delmasNet, delmasUPS, aeroNet, aeroUPS, delmasEmp, aeroEmp, inView.chart2, animationKey]);

  // --- CHART 3: Volume by Company (Stacked Bar) ---
  useEffect(() => {
    if (!inView.chart3 || !companyChartRef.current) return;
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
            backgroundColor: '#1e293b',
            borderRadius: 3
          },
          {
            label: 'Postes IT',
            data: companyData.map(c => c.it),
            backgroundColor: '#475569',
            borderRadius: 3
          },
          {
            label: 'Collaborateurs',
            data: companyData.map(c => c.employees),
            backgroundColor: '#94a3b8',
            borderRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 2300,
          easing: 'easeOutQuart',
          delay: (context: any) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              // Grouped by company column so stacked layers rise smoothly together without jumping
              delay = context.dataIndex * 180;
            }
            return delay;
          }
        },
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
  }, [companyData, inView.chart3, animationKey]);

  // --- CHART 4: Categories Breakdown (Doughnut) ---
  useEffect(() => {
    if (!inView.chart4 || !categoryChartRef.current) return;
    const ctx = categoryChartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Applications GP', 'Postes IT', 'Imprimantes', 'Réseau', 'Onduleurs UPS', 'Personnel'],
        datasets: [{
          data: [totalAppAccounts, totalIT, totalPrinters, totalNetwork, totalUPS, totalEmployees],
          backgroundColor: [
            '#0f172a',
            '#1e293b',
            '#334155',
            '#475569',
            '#64748b',
            '#94a3b8'
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2600,
          easing: 'easeInOutQuart'
        },
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
  }, [totalIT, totalPrinters, totalNetwork, totalUPS, totalEmployees, totalAppAccounts, inView.chart4, animationKey]);

  // --- CHART 5: Printer Typology & Connectivity (Bar Chart) ---
  useEffect(() => {
    if (!inView.chart5 || !printerTypesChartRef.current) return;
    const ctx = printerTypesChartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: ['Multifonction', 'Laser N&B', 'Laser Chèques', 'Réseau IP Actif'],
        datasets: [{
          label: 'Unités',
          data: [multiPrn, laserPrn, chequePrn, netConnectedPrn],
          backgroundColor: ['#1e293b', '#334155', '#64748b', '#94a3b8'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 2300,
          easing: 'easeOutQuart',
          delay: (context: any) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 220;
            }
            return delay;
          }
        },
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
  }, [multiPrn, laserPrn, chequePrn, netConnectedPrn, inView.chart5, animationKey]);

  // --- CHART 6: IT Workstations CPU Breakdown (Horizontal Bar) ---
  useEffect(() => {
    if (!inView.chart6 || !itSpecsChartRef.current) return;
    const ctx = itSpecsChartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: ['Intel Core i5', 'Intel Core i3', 'Intel Core i7 / Xeon', 'Autres processeurs'],
        datasets: [{
          label: 'Postes Dell',
          data: [i5Count, i3Count, i7Count, otherCpu],
          backgroundColor: ['#0f172a', '#334155', '#64748b', '#94a3b8'],
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 2300,
          easing: 'easeOutQuart',
          delay: (context: any) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 220;
            }
            return delay;
          }
        },
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
  }, [i5Count, i3Count, i7Count, otherCpu, inView.chart6, animationKey]);

  return (
    <div className="space-y-4 font-sans">
      {/* Title section with replay button for executive presentation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">
            Indicateurs & Graphiques de Synthèse
          </h2>
          <span className="text-[11px] text-slate-500 font-normal">
            • {goodPct}% opérationnel • Défilement dynamique
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReplay}
            disabled={isReplaying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-60"
            title="Relancer l'animation dynamique des graphiques pour la présentation"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-600 ${isReplaying ? 'animate-spin' : ''}`} />
            <span>{isReplaying ? 'Animation en cours...' : 'Relancer l\'animation'}</span>
          </button>
        </div>
      </div>

      {/* Grid of 6 Minimalist Professional Chart Cards with Scroll-Reveal Motion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GRAPH 1: État & Santé des Matériaux */}
        <div 
          ref={card1Ref}
          data-chart-key="chart1"
          className={`p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between transition-all duration-700 ease-out hover:border-slate-300 ${
            inView.chart1 ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-800">État & Santé des Matériaux</h3>
                  <p className="text-[11px] text-slate-400 font-normal">Supervision de {totalHardware} équipements physiques</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-semibold font-mono">
                <AvailabilityCounter target={goodPct} inView={inView.chart1} animationKey={animationKey} />
              </span>
            </div>

            <div className="relative h-64 w-full pt-2 flex items-center justify-center">
              <canvas ref={healthChartRef} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-5">
                <span className="text-2xl font-semibold text-slate-900 tracking-tight leading-none font-mono">
                  <AvailabilityCounter target={goodPct} inView={inView.chart1} animationKey={animationKey} />
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
        <div 
          ref={card2Ref}
          data-chart-key="chart2"
          className={`p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between transition-all duration-700 ease-out hover:border-slate-300 ${
            inView.chart2 ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'
          }`}
        >
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
        <div 
          ref={card3Ref}
          data-chart-key="chart3"
          className={`p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between transition-all duration-700 ease-out hover:border-slate-300 ${
            inView.chart3 ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'
          }`}
        >
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
        <div 
          ref={card4Ref}
          data-chart-key="chart4"
          className={`p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between transition-all duration-700 ease-out hover:border-slate-300 ${
            inView.chart4 ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'
          }`}
        >
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
        <div 
          ref={card5Ref}
          data-chart-key="chart5"
          className={`p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between transition-all duration-700 ease-out hover:border-slate-300 ${
            inView.chart5 ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'
          }`}
        >
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
        <div 
          ref={card6Ref}
          data-chart-key="chart6"
          className={`p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between transition-all duration-700 ease-out hover:border-slate-300 ${
            inView.chart6 ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'
          }`}
        >
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
