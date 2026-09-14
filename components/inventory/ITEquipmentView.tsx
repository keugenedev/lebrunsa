'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ITAsset } from '@/types/inventory';
import DataTable, { Column } from '@/components/common/DataTable';
import { 
  Laptop, 
  Server, 
  Wifi, 
  Monitor, 
  Plus, 
  Download, 
  QrCode, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  User, 
  Cpu, 
  HardDrive 
} from 'lucide-react';

export default function ITEquipmentView() {
  const { 
    itAssets, 
    formatCurrency, 
    openQRModal, 
    openAddModal, 
    deleteITAsset, 
    exportCSV 
  } = useInventory();

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            En service
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            En réserve
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Maintenance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Déclassé
          </span>
        );
    }
  };

  const columns: Column<ITAsset>[] = [
    {
      key: 'assetTag',
      label: 'Tag / Code',
      sortable: true,
      width: '120px',
      render: (asset) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">{asset.name}</div>
              <div className="text-[11px] text-slate-500">{asset.brand} {asset.model}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'serialNumber',
      label: 'N° de Série (SN)',
      sortable: true,
      render: (asset) => (
        <span className="font-mono text-xs text-slate-700 select-all font-semibold">
          {asset.serialNumber}
        </span>
      )
    },
    {
      key: 'specs',
      label: 'Configuration Matérielle',
      render: (asset) => (
        <div className="text-[11px] text-slate-600 space-y-0.5">
          {asset.cpu && (
            <div className="flex items-center gap-1 truncate max-w-[170px]" title={asset.cpu}>
              <Cpu className="w-3 h-3 text-slate-400" />
              <span>{asset.cpu}</span>
            </div>
          )}
          {asset.ram && (
            <div className="flex items-center gap-1 text-slate-500">
              <HardDrive className="w-3 h-3 text-slate-400" />
              <span>{asset.ram} • {asset.storage || 'SSD'}</span>
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
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold flex items-center justify-center">
                {asset.assignedTo[0]}
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-xs">{asset.assignedTo}</div>
                <div className="text-[10px] text-slate-500">{asset.assignedDepartment || asset.location}</div>
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
      render: (asset) => getStatusBadge(asset.status)
    },
    {
      key: 'purchaseCost',
      label: 'Valeur Achat',
      sortable: true,
      align: 'right',
      render: (asset) => (
        <div className="font-bold text-slate-900 text-xs">
          {formatCurrency(asset.purchaseCost)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (asset) => (
        <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openQRModal(asset)}
            title="Générer étiquette QR Code"
            className="inline-flex items-center justify-center text-gray-500 transition hover:text-red-600 cursor-pointer"
          >
            <i className="ri-qr-code-line text-lg"></i>
          </button>
          <button
            type="button"
            onClick={() => openAddModal('it', asset)}
            title="Modifier"
            className="inline-flex items-center justify-center text-gray-500 transition hover:text-gray-800 cursor-pointer"
          >
            <i className="ri-pencil-line text-lg"></i>
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Supprimer l'équipement ${asset.name} (${asset.assetTag}) ?`)) {
                deleteITAsset(asset.id);
              }
            }}
            title="Supprimer"
            className="inline-flex items-center justify-center text-red-500 transition hover:text-red-700 cursor-pointer"
          >
            <i className="ri-delete-bin-line text-lg"></i>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Table Component with pagination & filters */}
      <DataTable
        title="Parc Équipements IT & Informatique"
        subtitle="Inventaire détaillé des ordinateurs portables, postes fixes, serveurs rack et commutateurs réseau"
        badge={
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-medium border border-red-200">
            {itAssets.length} actifs enregistrés
          </span>
        }
        items={itAssets}
        columns={columns}
        searchPlaceholder="Rechercher par désignation, SN, modèle, tag, collaborateur..."
        searchFields={['name', 'brand', 'model', 'serialNumber', 'assetTag', 'assignedTo', 'location']}
        filters={[
          {
            key: 'subCategory',
            label: 'Catégorie',
            options: [
              { label: 'Ordinateurs Portables', value: 'laptop' },
              { label: 'Serveurs Datacenter', value: 'server' },
              { label: 'Réseau & Switchs', value: 'networking' },
              { label: 'Écrans 4K/5K', value: 'monitor' }
            ]
          },
          {
            key: 'status',
            label: 'Statut',
            options: [
              { label: 'En service', value: 'in_use' },
              { label: 'En réserve', value: 'available' },
              { label: 'En maintenance', value: 'maintenance' }
            ]
          }
        ]}
        actionButtons={
          <>
            <button
              onClick={() => exportCSV('it')}
              className="h-10 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-xs font-medium text-gray-700 transition shadow-xs cursor-pointer"
            >
              <i className="ri-file-download-line text-base text-gray-500"></i>
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => openAddModal('it')}
              className="h-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-xs transition cursor-pointer"
            >
              <i className="ri-add-line text-base"></i>
              <span>Ajouter un Matériel IT</span>
            </button>
          </>
        }
      />
    </div>
  );
}
