'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ElectronicComponent } from '@/types/inventory';
import DataTable, { Column } from '@/components/common/DataTable';
import { 
  Cpu, 
  BatteryCharging, 
  Radio, 
  Plus, 
  Minus, 
  AlertTriangle, 
  QrCode, 
  Edit2, 
  Trash2, 
  Download, 
  Package 
} from 'lucide-react';

import { useState } from 'react';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function ElectronicsView() {
  const { 
    electronics, 
    formatCurrency, 
    adjustElectronicStock, 
    openQRModal, 
    openAddModal, 
    deleteElectronic, 
    exportCSV 
  } = useInventory();

  const [deletingItem, setDeletingItem] = useState<ElectronicComponent | null>(null);

  const lowStockItems = electronics.filter(e => e.quantityInStock <= e.minThreshold);

  const getSubcategoryIcon = (sub: string) => {
    switch (sub) {
      case 'ups': return BatteryCharging;
      case 'sensor': return Radio;
      case 'power': return BatteryCharging;
      default: return Cpu;
    }
  };

  const columns: Column<ElectronicComponent>[] = [
    {
      key: 'assetTag',
      label: 'Tag / Réf',
      sortable: true,
      width: '120px',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-slate-900 whitespace-nowrap select-all tracking-tight">
          {item.assetTag}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Composant & Fabricant',
      sortable: true,
      render: (item) => {
        const Icon = getSubcategoryIcon(item.subCategory);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">{item.name}</div>
              <div className="text-[11px] text-slate-500">{item.manufacturer}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'partNumber',
      label: 'Part Number (P/N)',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs text-slate-700 select-all font-semibold">
          {item.partNumber}
        </span>
      )
    },
    {
      key: 'storageBin',
      label: 'Emplacement Casier',
      sortable: true,
      render: (item) => (
        <span className="font-medium text-slate-800 text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
          {item.storageBin}
        </span>
      )
    },
    {
      key: 'quantityInStock',
      label: 'Stock en Réserve',
      sortable: true,
      align: 'center',
      render: (item) => {
        const isLow = item.quantityInStock <= item.minThreshold;
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => adjustElectronicStock(item.id, -1)}
              title="Diminuer stock (-1)"
              className="w-6 h-6 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center text-xs transition-colors shadow-2xs"
            >
              <Minus className="w-3 h-3" />
            </button>

            <span className={`font-mono font-bold text-sm w-8 text-center ${
              isLow ? 'text-red-600' : 'text-slate-900'
            }`}>
              {item.quantityInStock}
            </span>

            <button
              onClick={() => adjustElectronicStock(item.id, 1)}
              title="Ajouter stock (+1)"
              className="w-6 h-6 rounded border border-slate-200 bg-white hover:bg-slate-100 text-red-600 flex items-center justify-center text-xs transition-colors shadow-2xs"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'État Réserve',
      sortable: true,
      align: 'center',
      width: '130px',
      render: (item) => {
        const isLow = item.quantityInStock <= item.minThreshold;
        if (isLow) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              Critique (≤ {item.minThreshold})
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            Normal
          </span>
        );
      }
    },
    {
      key: 'unitCost',
      label: 'Prix Unitaire',
      sortable: true,
      align: 'right',
      render: (item) => (
        <div className="font-bold text-slate-900 text-xs">
          {formatCurrency(item.unitCost)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openQRModal(item)}
            title="Imprimer étiquette casier"
            className="inline-flex items-center justify-center text-slate-400 transition hover:text-slate-900 cursor-pointer"
          >
            <i className="ri-qr-code-line text-lg"></i>
          </button>
          <button
            type="button"
            onClick={() => openAddModal('electronics', item)}
            title="Modifier"
            className="inline-flex items-center justify-center text-slate-400 transition hover:text-slate-900 cursor-pointer"
          >
            <i className="ri-pencil-line text-lg"></i>
          </button>
          <button
            type="button"
            onClick={() => setDeletingItem(item)}
            title="Supprimer"
            className="inline-flex items-center justify-center text-slate-400 transition hover:text-slate-900 cursor-pointer"
          >
            <i className="ri-delete-bin-line text-lg"></i>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Critical Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="lebron-card p-4 bg-red-50 border border-red-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-900">Alerte Réapprovisionnement Requis</h4>
              <p className="text-[11px] text-red-700 mt-0.5">
                {lowStockItems.length} article(s) ont atteint leur seuil de sécurité ({lowStockItems.map(i => i.name).join(', ')}).
              </p>
            </div>
          </div>
        </div>
      )}

      <DataTable
        title="Électronique, Capteurs & Matériel IoT"
        subtitle="Gestion des pièces détachées, onduleurs, batteries 48V, bobines de câblage et instrumentation"
        badge={
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
            {electronics.length} références en stock
          </span>
        }
        items={electronics}
        columns={columns}
        searchPlaceholder="Rechercher par référence, part number, fabriquant, casier..."
        searchFields={['name', 'partNumber', 'manufacturer', 'storageBin', 'assetTag', 'supplier']}
        filters={[
          {
            key: 'subCategory',
            label: 'Sous-catégorie',
            options: [
              { label: 'Onduleurs & UPS', value: 'ups' },
              { label: 'Modules & IoT', value: 'iot' },
              { label: 'Capteurs & Sondes', value: 'sensor' },
              { label: 'Câblage Blindé', value: 'cabling' },
              { label: 'Batteries Solaires', value: 'power' },
              { label: 'Outillage de Mesure', value: 'test_tools' }
            ]
          }
        ]}
        actionButtons={
          <>
            <button
              onClick={() => exportCSV('electronics')}
              className="h-10 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-800 transition shadow-2xs cursor-pointer"
            >
              <i className="ri-file-download-line text-base text-slate-600"></i>
              <span>Export Stock</span>
            </button>

            <button
              onClick={() => openAddModal('electronics')}
              className="h-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <i className="ri-add-line text-base"></i>
              <span>Ajouter un Composant</span>
            </button>
          </>
        }
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => {
          if (deletingItem) {
            deleteElectronic(deletingItem.id);
            setDeletingItem(null);
          }
        }}
        title="Supprimer le composant"
        message={`Êtes-vous certain de vouloir supprimer le composant ${deletingItem?.name} ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
