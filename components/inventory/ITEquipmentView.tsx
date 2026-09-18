'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ITAsset } from '@/types/inventory';
import DataTable, { Column } from '@/components/common/DataTable';
import CompanyLogo from '@/components/common/CompanyLogo';
import WorkstationDetailsModal from './WorkstationDetailsModal';
import { 
  Laptop, 
  Server, 
  Wifi, 
  Monitor, 
  Plus, 
  Download, 
  Barcode, 
  Edit2, 
  Trash2, 
  Cpu, 
  HardDrive,
  Eye,
  Search,
  Building2,
  MapPin,
  CheckCircle2,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

export default function ITEquipmentView() {
  const { 
    itAssets, 
    employees,
    openQRModal, 
    openAddModal, 
    deleteITAsset, 
    exportCSV 
  } = useInventory();

  const [selectedAssetForView, setSelectedAssetForView] = useState<ITAsset | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getSubCategoryIcon = (sub: string) => {
    switch (sub) {
      case 'server': return Server;
      case 'networking': return Wifi;
      case 'monitor': return Monitor;
      default: return Laptop;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_use':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
            En service
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
            En réserve
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
            Maintenance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
            Déclassé
          </span>
        );
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const total = itAssets.length;
    const inUse = itAssets.filter(a => a.status === 'in_use').length;
    const assigned = itAssets.filter(a => a.assignedTo || a.assignedPersonnelId).length;
    const lebrun = itAssets.filter(a => 
      (a.company && a.company.toLowerCase().includes('lebrun')) ||
      (a.assetTag && a.assetTag.includes('LEB')) ||
      (a.location && a.location.toLowerCase().includes('lebrun'))
    ).length;
    const autobiz = itAssets.filter(a => 
      (a.company && a.company.toLowerCase().includes('auto')) ||
      (a.assetTag && a.assetTag.includes('AUT')) ||
      (a.location && a.location.toLowerCase().includes('auto'))
    ).length;
    return { total, inUse, assigned, lebrun, autobiz };
  }, [itAssets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return itAssets.filter(a => {
      const isLebrun = (a.company && a.company.toLowerCase().includes('lebrun')) || a.assetTag.includes('LEB');
      const isAutobiz = (a.company && a.company.toLowerCase().includes('auto')) || a.assetTag.includes('AUT');
      
      if (companyFilter === 'Lebrun' && !isLebrun) return false;
      if (companyFilter === 'Autobiz' && !isAutobiz) return false;
      
      if (siteFilter !== 'all' && a.location !== siteFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          a.name.toLowerCase().includes(q) ||
          a.brand.toLowerCase().includes(q) ||
          a.model.toLowerCase().includes(q) ||
          a.serialNumber.toLowerCase().includes(q) ||
          a.assetTag.toLowerCase().includes(q) ||
          (a.assignedTo && a.assignedTo.toLowerCase().includes(q)) ||
          (a.cpu && a.cpu.toLowerCase().includes(q)) ||
          (a.location && a.location.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [itAssets, companyFilter, siteFilter, statusFilter, searchQuery]);

  const columns: Column<ITAsset>[] = [
    {
      key: 'assetTag',
      label: 'Tag / Code',
      sortable: true,
      width: '120px',
      render: (asset) => (
        <span className="font-mono text-xs font-bold text-slate-900 whitespace-nowrap select-all tracking-tight">
          {asset.assetTag}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Équipement & Marque',
      sortable: true,
      render: (asset) => {
        const Icon = getSubCategoryIcon(asset.subCategory);
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">{asset.name}</div>
              <div className="text-[11px] text-slate-500">{asset.brand} • <strong className="text-slate-700">{asset.model}</strong></div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'company',
      label: 'Entreprise & Site',
      sortable: true,
      render: (asset) => {
        const companyName = asset.company || (asset.assetTag.includes('LEB') ? 'Lebrun S.A.' : 'Autobiz');
        return (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <CompanyLogo company={companyName} className="h-4 max-w-[75px] w-auto object-contain" />
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{asset.location}</span>
            </span>
          </div>
        );
      }
    },
    {
      key: 'serialNumber',
      label: 'N° de Série (SN)',
      sortable: true,
      render: (asset) => (
        <span className="font-mono text-xs text-slate-800 select-all font-bold whitespace-nowrap">
          {asset.serialNumber}
        </span>
      )
    },
    {
      key: 'specs',
      label: 'Configuration Matérielle',
      render: (asset) => (
        <div className="text-xs text-slate-600 space-y-0.5">
          {asset.cpu && (
            <div className="flex items-center gap-1.5 truncate max-w-[220px]" title={asset.cpu}>
              <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-800 text-[11px]">{asset.cpu}</span>
            </div>
          )}
          {asset.ram && (
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{asset.ram} • {asset.storage || '500 GB SSD'}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'assignedTo',
      label: 'Collaborateur Assigné',
      sortable: true,
      render: (asset) => (
        <div>
          {asset.assignedTo ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center shrink-0">
                {asset.assignedTo[0]}
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-xs">{asset.assignedTo}</div>
                <div className="text-[11px] text-slate-500">{asset.assignedDepartment || asset.location}</div>
              </div>
            </div>
          ) : (
            <span className="text-slate-400 italic text-xs">Non assigné (En réserve)</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      align: 'center',
      width: '120px',
      render: (asset) => getStatusBadge(asset.status)
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (asset) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setSelectedAssetForView(asset)}
            title="Consulter tous les détails (Souris, Clavier, Écran, Utilisateur...)"
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600 transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => openQRModal(asset)}
            title="Générer étiquette Code-barres (Code 128)"
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600 transition cursor-pointer"
          >
            <Barcode className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => openAddModal('it', asset)}
            title="Modifier le poste"
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-gray-900 transition cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Supprimer l'équipement ${asset.name} (${asset.assetTag}) ?`)) {
                deleteITAsset(asset.id);
              }
            }}
            title="Supprimer"
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Clean Light Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 font-sans">
        <div>
          <h1 className="text-sm font-medium text-slate-800 tracking-tight">
            Postes Informatiques & Stations de Travail
          </h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Inventaire des postes Dell OptiPlex, accessoires et affectations de Lebrun S.A.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openAddModal('it')}
            className="h-8 flex items-center gap-1.5 px-3.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Poste IT</span>
          </button>
          <button
            onClick={() => exportCSV('it')}
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
            title="Exporter en fichier Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 2xl:gap-6">
        <div className="p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Total Postes IT</span>
            <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-2 font-sans">{stats.total}</div>
          <div className="text-[11px] text-slate-400 font-normal mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{stats.inUse} en service</span>
          </div>
        </div>

        <div className="p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Postes Affectés</span>
            <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-2 font-sans">{stats.assigned}</div>
          <div className="text-[11px] 2xl:text-xs text-slate-500 mt-1">Salariés identifiés</div>
        </div>

        <div className="p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Parc Lebrun S.A.</span>
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-2 font-sans">{stats.lebrun}</div>
          <div className="text-[11px] 2xl:text-xs text-slate-500 mt-1">Siège Delmas 52</div>
        </div>

        <div className="p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Parc Autobiz</span>
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-2 font-sans">{stats.autobiz}</div>
          <div className="text-[11px] 2xl:text-xs text-slate-500 mt-1">Filiale Autobiz S.A.</div>
        </div>
      </div>

      {/* Main DataTable with Filters inside */}
      <DataTable
        items={filteredAssets}
        columns={columns}
        onRowClick={(asset) => setSelectedAssetForView(asset)}
        defaultRowsPerPage={20}
        customFilters={
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par désignation, SN, modèle, tag, collaborateur..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Entreprise */}
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-700 cursor-pointer"
              >
                <option value="all">Toutes les entreprises</option>
                <option value="Lebrun">Lebrun S.A.</option>
                <option value="Autobiz">Autobiz S.A.</option>
              </select>

              {/* Site */}
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-700 cursor-pointer"
              >
                <option value="all">Tous les sites</option>
                <option value="Delmas 52">Delmas 52</option>
                <option value="Aéroport Depot">Aéroport Depot</option>
              </select>

              {/* Statut */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-700 cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="in_use">En service</option>
                <option value="available">En réserve</option>
                <option value="maintenance">En maintenance</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Workstation Details Modal (Mouse, Keyboard, Screen, PC, User) */}
      {selectedAssetForView && (
        <WorkstationDetailsModal
          asset={selectedAssetForView}
          employee={employees.find(e => 
            (selectedAssetForView.assignedPersonnelId && e.id === selectedAssetForView.assignedPersonnelId) || 
            (selectedAssetForView.assignedTo && e.fullName.toLowerCase() === selectedAssetForView.assignedTo.toLowerCase()) ||
            (selectedAssetForView.serialNumber && e.workstation?.pcSerial === selectedAssetForView.serialNumber)
          )}
          onClose={() => setSelectedAssetForView(null)}
          onOpenEdit={(asset) => openAddModal('it', asset)}
        />
      )}
    </div>
  );
}
