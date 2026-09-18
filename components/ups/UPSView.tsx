'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { UPSAsset } from '@/types/inventory';
import DataTable, { Column } from '@/components/common/DataTable';
import CompanyLogo from '@/components/common/CompanyLogo';
import { 
  Zap, 
  Download, 
  Search, 
  MapPin, 
  ShieldCheck, 
  BatteryCharging,
  Plus,
  Pencil,
  Trash2,
  Eye
} from 'lucide-react';
import UPSDetailsModal from './UPSDetailsModal';

export default function UPSView() {
  const { upsAssets, openUPSModal, deleteUPSAsset } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<UPSAsset | null>(null);

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

  const stats = useMemo(() => {
    const total = upsAssets.length;
    const forza = upsAssets.filter(u => u.brand.toLowerCase().includes('forza')).length;
    const apc = upsAssets.filter(u => u.brand.toLowerCase().includes('apc')).length;
    return { total, forza, apc };
  }, [upsAssets]);

  const handleExportCSV = () => {
    const headers = ['Tag', 'Entreprise', 'Site', 'Nom UPS', 'Marque', 'Modèle', 'Capacité (VA/W)', 'Référence', 'État', 'Observations'];
    const rows = filteredUPS.map(u => [
      u.assetTag,
      u.company,
      u.site,
      u.name,
      u.brand,
      u.model,
      u.capacity,
      u.reference,
      u.status,
      u.observations
    ]);
    const csv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inventaire_UPS_Lebronsa_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<UPSAsset>[] = [
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
      key: 'name',
      label: 'Désignation UPS',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5 whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
        <span className="font-mono text-xs font-semibold text-slate-800 whitespace-nowrap">
          {item.capacity}
        </span>
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
      key: 'status',
      label: 'Statut',
      sortable: true,
      width: '120px',
      align: 'center',
      render: (item) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          {item.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      width: '95px',
      render: (item) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setSelectedAssetForDetails(item)}
            title="Consulter tous les détails remplis"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openUPSModal(item)}
            title="Modifier cet onduleur"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Supprimer l'onduleur ${item.name} (${item.assetTag}) ?`)) {
                deleteUPSAsset(item.id);
              }
            }}
            title="Supprimer cet onduleur"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      {/* Clean Light Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 font-sans">
        <div>
          <h1 className="text-sm font-medium text-slate-800 tracking-tight">
            Onduleurs UPS
          </h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Protection électrique Forza et APC de Lebrun S.A.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openUPSModal()}
            className="h-8 flex items-center gap-1.5 px-3.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter Onduleur</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
            title="Exporter en fichier Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-600">Total Onduleurs</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-slate-900 font-sans">{stats.total}</span>
            <span className="text-xs text-slate-500">unités actives</span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-600">Onduleurs Forza</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-slate-900 font-sans">{stats.forza}</span>
            <span className="text-xs text-slate-500">NT-1011D & NT-751D</span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-600">Onduleurs APC</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-slate-900 font-sans">{stats.apc}</span>
            <span className="text-xs text-slate-500">Back-UPS 1000</span>
          </div>
        </div>
      </div>

      {/* Data Table with Filters inside */}
      <DataTable
        items={filteredUPS}
        columns={columns}
        defaultRowsPerPage={10}
        onRowClick={(item) => setSelectedAssetForDetails(item)}
        customFilters={
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un UPS, marque, capacité..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes les entreprises</option>
                <option value="Lebrun">Lebrun S.A.</option>
                <option value="Autobiz">Autobiz S.A.</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Modal de consultation des détails complets remplis */}
      {selectedAssetForDetails && (
        <UPSDetailsModal
          asset={selectedAssetForDetails}
          onClose={() => setSelectedAssetForDetails(null)}
          onOpenEdit={(asset) => openUPSModal(asset)}
        />
      )}
    </div>
  );
}
