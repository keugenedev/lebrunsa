'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { TelecomPlan } from '@/types/inventory';
import DataTable, { Column } from '@/components/common/DataTable';
import { 
  Smartphone, 
  Wifi, 
  QrCode, 
  Edit2, 
  Trash2, 
  Plus, 
  Download, 
  User, 
  Calendar 
} from 'lucide-react';

export default function TelecomPlansView() {
  const { 
    plans, 
    formatCurrency, 
    openQRModal, 
    openAddModal, 
    deletePlan, 
    exportCSV 
  } = useInventory();

  const columns: Column<TelecomPlan>[] = [
    {
      key: 'assetTag',
      label: 'Tag / Réf',
      sortable: true,
      width: '120px',
      render: (plan) => (
        <span className="font-mono text-xs font-bold text-slate-900 whitespace-nowrap select-all tracking-tight">
          {plan.assetTag}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Forfait Commercial',
      sortable: true,
      render: (plan) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">{plan.name}</div>
            <div className="text-[11px] text-slate-500">{plan.operator} • {plan.planName}</div>
          </div>
        </div>
      )
    },
    {
      key: 'phoneNumber',
      label: 'N° de Ligne & SIM',
      sortable: true,
      render: (plan) => (
        <div>
          <div className="font-mono font-bold text-slate-800 text-xs">{plan.phoneNumber || 'Ligne Data M2M'}</div>
          <span className="inline-block mt-0.5 text-[10px] px-2 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            {plan.simType}
          </span>
        </div>
      )
    },
    {
      key: 'dataUsage',
      label: 'Quota & Consommation',
      render: (plan) => {
        const isUnlimited = plan.dataLimitGb === 0;
        const usagePercent = isUnlimited ? 40 : Math.min(100, Math.round((plan.dataUsedGb / plan.dataLimitGb) * 100));

        return (
          <div className="w-32">
            <div className="flex items-center justify-between text-[10px] text-slate-600 mb-1">
              <span>{plan.dataUsedGb} Go</span>
              <span className="font-semibold">{isUnlimited ? 'Illimité' : `${plan.dataLimitGb} Go`}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className={`h-full rounded-full ${
                  usagePercent > 90 ? 'bg-red-600' : 'bg-slate-700'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'assignedTo',
      label: 'Bénéficiaire / Appareil',
      sortable: true,
      render: (plan) => (
        <div>
          {plan.assignedTo ? (
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold flex items-center justify-center">
                {plan.assignedTo[0]}
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-xs">{plan.assignedTo}</div>
                <div className="text-[10px] text-slate-500">{plan.assignedDevice || 'Mobile Pro'}</div>
              </div>
            </div>
          ) : (
            <span className="text-slate-400 italic text-xs">Stock réserve</span>
          )}
        </div>
      )
    },
    {
      key: 'renewalDate',
      label: 'Renouvellement',
      sortable: true,
      render: (plan) => (
        <span className="text-slate-600 text-xs font-mono">
          {plan.renewalDate}
        </span>
      )
    },
    {
      key: 'monthlyCost',
      label: 'Coût Mensuel',
      sortable: true,
      align: 'right',
      render: (plan) => (
        <div className="font-bold text-slate-900 text-xs">
          {formatCurrency(plan.monthlyCost)}/m
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (plan) => (
        <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openQRModal(plan)}
            title="Générer QR code eSIM / Activation"
            className="inline-flex items-center justify-center text-slate-400 transition hover:text-slate-900 cursor-pointer"
          >
            <i className="ri-qr-code-line text-lg"></i>
          </button>
          <button
            type="button"
            onClick={() => openAddModal('plans', plan)}
            title="Modifier"
            className="inline-flex items-center justify-center text-slate-400 transition hover:text-slate-900 cursor-pointer"
          >
            <i className="ri-pencil-line text-lg"></i>
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Supprimer le forfait ${plan.name} ?`)) {
                deletePlan(plan.id);
              }
            }}
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
      <DataTable
        title="Forfaits Télécoms & Flotte Mobile"
        subtitle="Suivi des abonnements mobiles 5G, cartes SIM physiques, eSIMs et puces data M2M IoT"
        badge={
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
            {plans.length} abonnements actifs
          </span>
        }
        items={plans}
        columns={columns}
        searchPlaceholder="Rechercher par forfait, numéro, collaborateur, opérateur, tag..."
        searchFields={['name', 'planName', 'operator', 'phoneNumber', 'assignedTo', 'assetTag', 'iccid']}
        filters={[
          {
            key: 'operator',
            label: 'Opérateur',
            options: [
              { label: 'Orange Pro', value: 'Orange Pro' },
              { label: 'MTN Business', value: 'MTN Business' },
              { label: 'Vodafone Global', value: 'Vodafone Global' },
              { label: 'Free Pro', value: 'Free Pro' }
            ]
          },
          {
            key: 'simType',
            label: 'Type SIM',
            options: [
              { label: 'SIM Physique', value: 'Physical SIM' },
              { label: 'eSIM Virtuelle', value: 'eSIM' },
              { label: 'Data M2M IoT', value: 'Data Only M2M' }
            ]
          }
        ]}
        actionButtons={
          <>
            <button
              onClick={() => exportCSV('plans')}
              className="h-10 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-800 transition shadow-2xs cursor-pointer"
            >
              <i className="ri-file-download-line text-base text-slate-600"></i>
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => openAddModal('plans')}
              className="h-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <i className="ri-add-line text-base"></i>
              <span>Ajouter un Forfait / SIM</span>
            </button>
          </>
        }
      />
    </div>
  );
}
