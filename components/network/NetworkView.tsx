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
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  Eye
} from 'lucide-react';
import NetworkDetailsModal from './NetworkDetailsModal';
import WifiPosterView from './WifiPosterView';

import ConfirmModal from '@/components/common/ConfirmModal';
import { isGraciama } from '@/lib/permissions';

export default function NetworkView() {
  const { networkAssets, currentUser, openNetworkModal, deleteNetworkAsset, wifiNetworks, exportCSV } = useInventory();
  const isGraciamaUser = isGraciama(currentUser);

  const [activeSubTab, setActiveSubTab] = useState<'infrastructure' | 'wifi'>('infrastructure');
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState(isGraciamaUser ? 'Obonprix' : 'all');
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<NetworkAsset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<NetworkAsset | null>(null);

  const filteredNetwork = useMemo(() => {
    return networkAssets.filter(item => {
      if (isGraciamaUser) {
        const comp = (item.company || '').toLowerCase();
        const site = (item.site || '').toLowerCase();
        const tag = (item.assetTag || '').toUpperCase();
        const name = (item.hostname || item.model || '').toLowerCase();
        if (!comp.includes('obonprix') && !comp.includes('bonprix') && !site.includes('83') && !tag.includes('OBP') && !name.includes('obonprix')) {
          return false;
        }
      }
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
    }).sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [networkAssets, companyFilter, searchQuery, isGraciamaUser]);

  const stats = useMemo(() => {
    const list = isGraciamaUser ? filteredNetwork : networkAssets;
    const total = list.length;
    const switches = list.filter(n => n.deviceType.toLowerCase().includes('switch')).length;
    const wifi = list.filter(n => n.deviceType.toLowerCase().includes('wi‑fi') || n.deviceType.toLowerCase().includes('point')).length;
    return { total, switches, wifi };
  }, [networkAssets, filteredNetwork, isGraciamaUser]);

  const scopedWifiNetworks = useMemo(() => {
    if (isGraciamaUser) {
      return wifiNetworks.filter(net => 
        (net.company || '').toLowerCase().includes('obonprix') || 
        (net.establishment || '').toLowerCase().includes('83') ||
        (net.establishment || '').toLowerCase().includes('obonprix')
      );
    }
    return wifiNetworks;
  }, [wifiNetworks, isGraciamaUser]);

  const handleExportCSV = () => {
    exportCSV('network');
  };

  const columns: Column<NetworkAsset>[] = [
    {
      key: 'assetTag',
      label: 'Tag / Code',
      sortable: true,
      width: '100px',
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
              <Network className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
      width: '140px',
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
      width: '130px',
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
            onClick={() => openNetworkModal(item)}
            title="Modifier cet équipement"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingAsset(item)}
            title="Supprimer cet équipement"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
            Réseau
          </h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Infrastructure switches TP-Link PoE et bornes Wi-Fi de Lebrun S.A.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'infrastructure' && (
            <button
              onClick={() => openNetworkModal()}
              className={`h-8 flex items-center gap-1.5 px-3.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer active:scale-95 ${
                isGraciamaUser
                  ? 'bg-[#DA2027] hover:bg-[#B8191F] text-white shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Plus className={`w-3.5 h-3.5 ${isGraciamaUser ? 'text-[#FFCB06]' : ''}`} />
              <span>Ajouter Équipement</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold border shadow-2xs transition-colors cursor-pointer active:scale-95 ${
              isGraciamaUser
                ? 'bg-slate-100 hover:bg-[#FFCB06]/20 text-[#574C46] border-[#574C46]/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Exporter en fichier Excel / CSV"
          >
            <Download className={`w-3.5 h-3.5 ${isGraciamaUser ? 'text-[#DA2027]' : 'text-slate-600'}`} />
            <span>Exporter Excel</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Switcher: Infrastructure vs Affiches Wi-Fi */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('infrastructure')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'infrastructure'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Infrastructure Réseau & Switches ({stats.total})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('wifi')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'wifi'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>{isGraciamaUser ? 'Affiches & Fiches Wi-Fi Obonprix (Delmas 83)' : 'Affiches & Fiches Wi-Fi par Établissement'} ({scopedWifiNetworks.length})</span>
        </button>
      </div>

      {activeSubTab === 'wifi' ? (
        <WifiPosterView />
      ) : (
        <>
          {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-600">Total Équipements</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-slate-900 font-sans">{stats.total}</span>
            <span className="text-xs text-slate-500">unités actives</span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-600">Switches PoE</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-slate-900 font-sans">{stats.switches}</span>
            <span className="text-xs text-slate-500">TP-Link Gigabit</span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-600">Points d'accès Wi-Fi</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-slate-900 font-sans">{stats.wifi}</span>
            <span className="text-xs text-slate-500">Bornes actives</span>
          </div>
        </div>
      </div>

      {/* Data Table with Filters inside */}
      <DataTable
        items={filteredNetwork}
        columns={columns}
        defaultRowsPerPage={50}
        onRowClick={(item) => setSelectedAssetForDetails(item)}
        customFilters={
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un équipement réseau, modèle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isGraciamaUser ? (
                <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-semibold">
                  Obonprix
                </div>
              ) : (
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Toutes les entreprises</option>
                  <option value="Lebrun">Lebrun S.A.</option>
                  <option value="Autobiz">Autobiz S.A.</option>
                  <option value="Caribe">Caribe Motors</option>
                  <option value="Leader">Leader Foods</option>
                  <option value="Tirezone">Tirezone</option>
                  <option value="Obonprix">Obonprix</option>
                </select>
              )}
            </div>
          </div>
        }
      />
        </>
      )}

      {/* Modal de consultation des détails complets remplis */}
      {selectedAssetForDetails && (
        <NetworkDetailsModal
          asset={selectedAssetForDetails}
          onClose={() => setSelectedAssetForDetails(null)}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingAsset)}
        onClose={() => setDeletingAsset(null)}
        onConfirm={() => {
          if (deletingAsset) {
            deleteNetworkAsset(deletingAsset.id);
            setDeletingAsset(null);
          }
        }}
        title="Supprimer l'équipement réseau"
        message={`Êtes-vous certain de vouloir supprimer l'équipement réseau ${deletingAsset?.model} (${deletingAsset?.assetTag}) ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
