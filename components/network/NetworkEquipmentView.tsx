'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { NetworkAsset, UPSAsset } from '@/types/inventory';
import DataTable, { Column } from '@/components/common/DataTable';
import CompanyLogo from '@/components/common/CompanyLogo';
import { 
  Network, 
  Zap, 
  Download, 
  Search, 
  Wifi, 
  Layers, 
  CheckCircle2, 
  Activity, 
  Server,
  MapPin,
  Barcode
} from 'lucide-react';

export default function NetworkEquipmentView() {
  const { networkAssets, upsAssets, openQRModal, exportCSV } = useInventory();

  const [activeSubTab, setActiveSubTab] = useState<'network' | 'ups'>('network');
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');

  // Filtered Network Assets
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

  // Filtered UPS Assets
  const filteredUPS = useMemo(() => {
    return upsAssets.filter(item => {
      if (companyFilter !== 'all' && !item.company?.toLowerCase().includes(companyFilter.toLowerCase())) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.assetTag.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.model.toLowerCase().includes(q) ||
          item.capacity.toLowerCase().includes(q) ||
          item.company.toLowerCase().includes(q) ||
          item.observations.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [upsAssets, companyFilter, searchQuery]);

  const handleExportCSV = () => {
    if (activeSubTab === 'network') {
      exportCSV('network');
    } else {
      exportCSV('ups');
    }
  };

  const networkColumns: Column<NetworkAsset>[] = [
    {
      key: 'assetTag',
      label: 'Tag / Code',
      sortable: true,
      width: '110px',
      render: (item) => (
        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-50 text-slate-800 border border-slate-200 whitespace-nowrap inline-flex items-center">
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
              <Network className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-slate-600 shrink-0" />
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
      label: 'Entreprise',
      sortable: true,
      width: '110px',
      render: (item) => (
        <div className="whitespace-nowrap flex items-center gap-1">
          <CompanyLogo company={item.company} className="h-4 max-w-[80px] w-auto object-contain" />
        </div>
      )
    },
    {
      key: 'site',
      label: 'Site',
      sortable: true,
      width: '100px',
      render: (item) => (
        <div className="text-xs text-slate-600 flex items-center gap-1 whitespace-nowrap">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{item.site}</span>
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.status?.toLowerCase().includes('actif') || item.status?.toLowerCase().includes('en service') || item.status?.toLowerCase().includes('opér') ? 'bg-emerald-500' : item.status?.toLowerCase().includes('panne') || item.status?.toLowerCase().includes('maint') ? 'bg-red-500' : 'bg-slate-400'}`}></span>
          {item.status}
        </span>
      )
    }
  ];

  const upsColumns: Column<UPSAsset>[] = [
    {
      key: 'assetTag',
      label: 'Tag / Code',
      sortable: true,
      width: '110px',
      render: (item) => (
        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-50 text-slate-800 border border-slate-200 whitespace-nowrap inline-flex items-center">
          {item.assetTag}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Désignation UPS',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5 whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>{item.name}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">
            {item.brand} • <strong className="text-slate-700">{item.model}</strong>
          </div>
        </div>
      )
    },
    {
      key: 'capacity',
      label: 'Capacité Électrique',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
          {item.capacity}
        </span>
      )
    },
    {
      key: 'company',
      label: 'Entreprise',
      sortable: true,
      width: '110px',
      render: (item) => (
        <div className="whitespace-nowrap flex items-center gap-1">
          <CompanyLogo company={item.company} className="h-4 max-w-[80px] w-auto object-contain" />
        </div>
      )
    },
    {
      key: 'site',
      label: 'Site',
      sortable: true,
      width: '100px',
      render: (item) => (
        <span className="text-xs text-slate-600 whitespace-nowrap">{item.site}</span>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      width: '120px',
      align: 'center',
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.status?.toLowerCase().includes('actif') || item.status?.toLowerCase().includes('en service') || item.status?.toLowerCase().includes('opér') ? 'bg-emerald-500' : item.status?.toLowerCase().includes('panne') || item.status?.toLowerCase().includes('maint') ? 'bg-red-500' : 'bg-slate-400'}`}></span>
          {item.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Équipements Réseau & Onduleurs UPS
              </h1>
              <p className="text-xs text-slate-500">
                Switches TP-Link PoE, bornes Wi-Fi et protection électrique Forza & APC
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

      {/* Sub-tabs toggle */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-2">
        <button
          onClick={() => setActiveSubTab('network')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'network'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Équipements Réseau ({networkAssets.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ups')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'ups'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Onduleurs & UPS ({upsAssets.length})</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={activeSubTab === 'network' ? 'Rechercher un switch, borne Wi-Fi, modèle...' : 'Rechercher un UPS, marque, capacité...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-500 transition-all"
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
      {activeSubTab === 'network' ? (
        <DataTable
          items={filteredNetwork}
          columns={networkColumns}
          defaultRowsPerPage={50}
        />
      ) : (
        <DataTable
          items={filteredUPS}
          columns={upsColumns}
          defaultRowsPerPage={50}
        />
      )}
    </div>
  );
}
