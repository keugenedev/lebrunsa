'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { StarlinkKit } from '@/types/inventory';
import DataTable, { Column } from '@/components/common/DataTable';
import { 
  Satellite, 
  Wifi, 
  RefreshCw, 
  QrCode, 
  Edit2, 
  Trash2, 
  Plus, 
  Download, 
  Activity, 
  MapPin, 
  User, 
  AlertTriangle 
} from 'lucide-react';

export default function StarlinkView() {
  const { 
    starlinkKits, 
    formatCurrency, 
    openQRModal, 
    openAddModal, 
    updateStarlinkKit, 
    deleteStarlinkKit, 
    exportCSV 
  } = useInventory();

  const [testingKitId, setTestingKitId] = useState<string | null>(null);

  const runSpeedtest = (kit: StarlinkKit) => {
    setTestingKitId(kit.id);
    setTimeout(() => {
      const simulatedDown = Math.round((Math.random() * 80 + 170) * 10) / 10;
      const simulatedUp = Math.round((Math.random() * 15 + 20) * 10) / 10;
      const simulatedLatency = Math.round(Math.random() * 12 + 24);

      updateStarlinkKit(kit.id, {
        downloadSpeedMbps: simulatedDown,
        uploadSpeedMbps: simulatedUp,
        latencyMs: simulatedLatency,
        lastPing: "À l'instant",
        networkStatus: 'online'
      });
      setTestingKitId(null);
    }, 1200);
  };

  const columns: Column<StarlinkKit>[] = [
    {
      key: 'assetTag',
      label: 'Tag / Kit',
      sortable: true,
      width: '120px',
      render: (kit) => (
        <span className="font-mono text-xs font-bold text-slate-900 whitespace-nowrap select-all tracking-tight">
          {kit.assetTag}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Terminal & Modèle',
      sortable: true,
      render: (kit) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
            <Satellite className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{kit.name}</div>
            <div className="text-[11px] text-slate-500">{kit.tier} • {kit.kitNumber}</div>
          </div>
        </div>
      )
    },
    {
      key: 'dishSerial',
      label: 'Dish Serial (SN)',
      sortable: true,
      render: (kit) => (
        <span className="font-mono text-xs text-slate-700 select-all font-medium">
          {kit.dishSerial}
        </span>
      )
    },
    {
      key: 'networkStatus',
      label: 'Statut Réseau',
      sortable: true,
      align: 'center',
      render: (kit) => {
        if (kit.networkStatus === 'online') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping-slow"></span>
              En ligne
            </span>
          );
        } else if (kit.networkStatus === 'degraded') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3 h-3" />
              Dégradé
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Hors-ligne
          </span>
        );
      }
    },
    {
      key: 'telemetry',
      label: 'Télémétrie Débit / Ping',
      align: 'center',
      render: (kit) => {
        const isTesting = testingKitId === kit.id;
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="text-center">
              <div className="font-semibold text-slate-900 text-xs">
                {isTesting ? '...' : `${kit.downloadSpeedMbps} Mbps`}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {isTesting ? 'Ping...' : `${kit.latencyMs} ms • ${kit.uploadSpeedMbps}M up`}
              </div>
            </div>
            <button
              onClick={() => runSpeedtest(kit)}
              disabled={isTesting}
              title="Lancer un test de ping et débit en direct"
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-red-600 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-red-600' : ''}`} />
            </button>
          </div>
        );
      }
    },
    {
      key: 'dataUsage',
      label: 'Consommation Quota',
      render: (kit) => {
        const usagePercent = Math.min(100, Math.round((kit.dataUsedGb / (kit.dataCapGb || 1000)) * 100));
        return (
          <div className="w-32">
            <div className="flex items-center justify-between text-[10px] text-slate-600 mb-1">
              <span>{kit.dataUsedGb} Go</span>
              <span className="font-semibold">{usagePercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className={`h-full rounded-full ${
                  usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'siteName',
      label: 'Site / Responsable',
      render: (kit) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[130px]">{kit.siteName}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span>{kit.assignedTo || 'Non assigné'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'monthlyCost',
      label: 'Coût / Mois',
      sortable: true,
      align: 'right',
      render: (kit) => (
        <div className="font-bold text-slate-900 text-xs">
          {formatCurrency(kit.monthlyCost)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (kit) => (
        <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openQRModal(kit)}
            title="Générer QR Code kit"
            className="inline-flex items-center justify-center text-gray-500 transition hover:text-red-600 cursor-pointer"
          >
            <i className="ri-qr-code-line text-lg"></i>
          </button>
          <button
            type="button"
            onClick={() => openAddModal('starlink', kit)}
            title="Modifier terminal"
            className="inline-flex items-center justify-center text-gray-500 transition hover:text-gray-800 cursor-pointer"
          >
            <i className="ri-pencil-line text-lg"></i>
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Supprimer le kit Starlink ${kit.name} ?`)) {
                deleteStarlinkKit(kit.id);
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
      <DataTable
        title="Flotte Satellite Starlink"
        subtitle="Supervision télémétrique, forfaits prioritaires chantiers distants et liaisons maritimes"
        badge={
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 font-medium border border-cyan-200">
            {starlinkKits.length} terminaux déployés
          </span>
        }
        items={starlinkKits}
        columns={columns}
        searchPlaceholder="Rechercher par kit, dish serial, terminal ID, site, responsable..."
        searchFields={['name', 'kitNumber', 'dishSerial', 'terminalId', 'siteName', 'assignedTo', 'tier', 'assetTag']}
        filters={[
          {
            key: 'networkStatus',
            label: 'Statut',
            options: [
              { label: 'En ligne', value: 'online' },
              { label: 'Dégradé / Attention', value: 'degraded' },
              { label: 'Hors-ligne', value: 'offline' }
            ]
          },
          {
            key: 'tier',
            label: 'Modèle',
            options: [
              { label: 'Flat High Performance', value: 'Flat High Performance' },
              { label: 'Standard Actuated', value: 'Standard Actuated' },
              { label: 'Starlink Mini', value: 'Mini' },
              { label: 'Enterprise Maritime', value: 'Enterprise Maritime' }
            ]
          }
        ]}
        actionButtons={
          <>
            <button
              onClick={() => exportCSV('starlink')}
              className="h-10 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-xs font-medium text-gray-700 transition shadow-xs cursor-pointer"
            >
              <i className="ri-file-download-line text-base text-gray-500"></i>
              <span>Export Flotte</span>
            </button>

            <button
              onClick={() => openAddModal('starlink')}
              className="h-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-xs transition cursor-pointer"
            >
              <i className="ri-add-line text-base"></i>
              <span>Ajouter un Kit Starlink</span>
            </button>
          </>
        }
      />
    </div>
  );
}
