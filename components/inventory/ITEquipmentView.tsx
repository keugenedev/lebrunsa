'use client';

import React, { useState } from 'react';
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
  Eye
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
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            En service
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            En réserve
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Maintenance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
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
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
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
      key: 'serialNumber',
      label: 'N° de Série (SN)',
      sortable: true,
      render: (asset) => (
        <span className="font-mono text-xs text-slate-800 select-all font-semibold whitespace-nowrap">
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
              <span className="font-medium text-slate-800">{asset.cpu}</span>
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
              <div className="w-6 h-6 rounded-full bg-red-50 text-red-700 text-xs font-bold flex items-center justify-center shrink-0">
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
      key: 'location',
      label: 'Site',
      sortable: true,
      render: (asset) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {asset.location}
        </span>
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
      {/* Table Component with pagination & filters */}
      <DataTable
        title="Parc Postes Informatiques & Workstations Dell"
        subtitle="Inventaire nominatif des stations de travail Dell OptiPlex, configurations matérielles et écrans de bureau"
        badge={
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold">
            {itAssets.length} postes certifiés
          </span>
        }
        items={itAssets}
        columns={columns}
        onRowClick={(asset) => setSelectedAssetForView(asset)}
        searchPlaceholder="Rechercher par désignation, SN, modèle, tag, collaborateur..."
        searchFields={['name', 'brand', 'model', 'serialNumber', 'assetTag', 'assignedTo', 'location', 'cpu']}
        filters={[
          {
            key: 'location',
            label: 'Site / Emplacement',
            options: [
              { label: 'Delmas 52', value: 'Delmas 52' },
              { label: 'Aéroport Depot', value: 'Aéroport Depot' }
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
              className="h-9.5 flex items-center gap-2 px-3.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-xs font-semibold text-gray-700 transition shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => openAddModal('it')}
              className="h-9.5 flex items-center gap-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Poste IT</span>
            </button>
          </>
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
