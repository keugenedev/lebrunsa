'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { NetworkAsset } from '@/types/inventory';
import DataTable, { Column } from '@/components/common/DataTable';
import CompanyLogo from '@/components/common/CompanyLogo';
import { 
  Network, 
  Download, 
  Search, 
  Wifi, 
  MapPin, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';

export default function NetworkView() {
  const { networkAssets } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');

  const filteredNetwork = useMemo(() => {
    return networkAssets.filter(item => {
      if (companyFilter !== 'all' && !item.company?.toLowerCase().includes(companyFilter.toLowerCase())) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.assetTag.toLowerCase().includes(q) ||
          item.deviceType.toLowerCase().includes(q) ||
          item.model.toLowerCase().includes(q) ||
          item.serialNumber.toLowerCase().includes(q) ||
          item.company.toLowerCase().includes(q) ||
          item.observations.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [networkAssets, companyFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = networkAssets.length;
    const switches = networkAssets.filter(n => n.deviceType.toLowerCase().includes('switch')).length;
    const wifi = networkAssets.filter(n => n.deviceType.toLowerCase().includes('wi‑fi') || n.deviceType.toLowerCase().includes('point')).length;
    return { total, switches, wifi };
  }, [networkAssets]);

  const handleExportCSV = () => {
    const headers = ['Tag', 'Entreprise', 'Site', 'Type d\'équipement', 'Marque', 'Modèle', 'N° Série', 'Adresse IP', 'État', 'Observations'];
    const rows = filteredNetwork.map(n => [
      n.assetTag,
      n.company,
      n.site,
      n.deviceType,
      n.brand,
      n.model,
      n.serialNumber,
      n.ipAddress,
      n.status,
      n.observations
    ]);
    const csv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Equipements_Reseau_Lebronsa_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<NetworkAsset>[] = [
    {
      key: 'assetTag',
      label: 'Tag / Code',
      sortable: true,
      width: '110px',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-slate-900 whitespace-nowrap select-all tracking-tight">
          {item.assetTag}
        </span>
      )
    },
    {
      key: 'deviceType',
      label: 'Équipement & Type',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5 whitespace-nowrap">
            {item.deviceType.includes('Switch') ? (
              <Network className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
            <span>{item.deviceType}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">
            {item.brand} • <strong className="text-slate-700">{item.model}</strong>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      label: 'Entreprise & Site',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <CompanyLogo company={item.company} className="h-4 max-w-[80px] w-auto object-contain" />
          <span className="text-[11px] text-slate-500 whitespace-nowrap flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{item.site}</span>
          </span>
        </div>
      )
    },
    {
      key: 'serialNumber',
      label: 'N° de Série',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-slate-700 select-all whitespace-nowrap">
          {item.serialNumber}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      width: '120px',
      align: 'center',
      render: (item) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {item.status}
        </span>
      )
    },
    {
      key: 'observations',
      label: 'Spécifications / Observations',
      render: (item) => (
        <span className="text-xs text-slate-600 truncate max-w-sm block" title={item.observations}>
          {item.observations}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Réseau
              </h1>
              <p className="text-xs text-slate-500">
                Infrastructure switches TP-Link PoE et points d'accès Wi-Fi du site Delmas 52
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Équipements</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-500">unités actives</span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Switches PoE</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-blue-600">{stats.switches}</span>
            <span className="text-xs text-slate-500">TP-Link Gigabit</span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Points d'accès Wi-Fi</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-600">{stats.wifi}</span>
            <span className="text-xs text-slate-500">Bornes actives</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un équipement réseau, modèle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes les entreprises</option>
            <option value="Lebrun">Lebrun S.A.</option>
            <option value="Autobiz">Autobiz S.A.</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        items={filteredNetwork}
        columns={columns}
        defaultRowsPerPage={10}
      />
    </div>
  );
}
