'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { StockMovement } from '@/types/inventory';
import DataTable, { Column } from '@/components/common/DataTable';
import { 
  ArrowLeftRight, 
  Laptop, 
  Satellite, 
  Smartphone, 
  Cpu, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wrench,
  User,
  Building,
  Calendar,
  X
} from 'lucide-react';

export default function MovementsView() {
  const { 
    movements, 
    itAssets, 
    starlinkKits, 
    employees, 
    recordMovement, 
    updateITAsset 
  } = useInventory();

  const [isNewMoveModalOpen, setIsNewMoveModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [actionType, setActionType] = useState<'check_out' | 'check_in' | 'maintenance_start'>('check_out');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [notes, setNotes] = useState('');

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = itAssets.find(a => a.id === selectedAssetId) || starlinkKits.find(s => s.id === selectedAssetId);
    if (!asset) return;

    const emp = employees.find(e => e.id === selectedEmployeeId);

    recordMovement({
      assetId: asset.id,
      assetName: asset.name,
      assetCategory: asset.category,
      actionType,
      targetUser: actionType === 'check_in' ? undefined : (emp ? emp.fullName : undefined),
      employeeId: actionType === 'check_in' ? undefined : (emp ? emp.id : undefined),
      department: actionType === 'check_in' ? undefined : (emp ? emp.department : undefined),
      performedBy: 'Gestionnaire Matériel Lebronsa S.A.',
      notes: notes || (actionType === 'check_out' ? `Prêt accordé à ${emp?.fullName}` : 'Retour en stock')
    });

    // Update asset state if it's an IT asset
    if (asset.category === 'it') {
      if (actionType === 'check_out' && emp) {
        updateITAsset(asset.id, {
          status: 'in_use',
          assignedTo: emp.fullName,
          assignedPersonnelId: emp.id,
          assignedDepartment: emp.department
        });
      } else if (actionType === 'check_in') {
        updateITAsset(asset.id, {
          status: 'available',
          assignedTo: undefined,
          assignedPersonnelId: undefined,
          assignedDepartment: undefined
        });
      } else if (actionType === 'maintenance_start') {
        updateITAsset(asset.id, {
          status: 'maintenance'
        });
      }
    }

    setIsNewMoveModalOpen(false);
    setSelectedAssetId('');
    setSelectedEmployeeId('');
    setNotes('');
  };

  const columns: Column<StockMovement>[] = [
    {
      key: 'assetName',
      label: 'Équipement / Matériel',
      sortable: true,
      render: (mov) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            {mov.assetCategory === 'it' ? (
              <Laptop className="w-4 h-4 text-slate-600" />
            ) : mov.assetCategory === 'starlink' ? (
              <Satellite className="w-4 h-4 text-slate-600" />
            ) : mov.assetCategory === 'plans' ? (
              <Smartphone className="w-4 h-4 text-slate-600" />
            ) : (
              <Cpu className="w-4 h-4 text-slate-600" />
            )}
          </div>
          <span className="font-semibold text-slate-900">{mov.assetName}</span>
        </div>
      )
    },
    {
      key: 'actionType',
      label: "Type d'Opération",
      sortable: true,
      align: 'center',
      width: '140px',
      render: (mov) => {
        if (mov.actionType === 'check_out') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
              <ArrowUpRight className="w-3 h-3 shrink-0 text-slate-500" />
              Prêt / Sortie
            </span>
          );
        } else if (mov.actionType === 'check_in') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
              <ArrowDownLeft className="w-3 h-3 shrink-0 text-slate-500" />
              Retour Réserve
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <Wrench className="w-3 h-3 shrink-0 text-slate-500" />
            Maintenance
          </span>
        );
      }
    },
    {
      key: 'targetUser',
      label: 'Bénéficiaire / Collaborateur',
      sortable: true,
      render: (mov) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs">
            {mov.targetUser || <span className="text-slate-400 italic">—</span>}
          </div>
          <div className="text-[10px] text-slate-500">{mov.department || 'Non spécifié'}</div>
        </div>
      )
    },
    {
      key: 'performedBy',
      label: 'Opérateur IT',
      render: (mov) => (
        <span className="text-slate-600 text-xs">{mov.performedBy}</span>
      )
    },
    {
      key: 'date',
      label: 'Date & Heure',
      sortable: true,
      render: (mov) => (
        <span className="font-mono text-slate-600 text-xs whitespace-nowrap">
          {new Date(mov.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    },
    {
      key: 'notes',
      label: 'Commentaires / Motif',
      render: (mov) => (
        <span className="text-slate-600 text-xs truncate max-w-xs block" title={mov.notes}>
          {mov.notes}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <DataTable
        title="Mouvements de Stock & Prêts Collaborateurs"
        subtitle="Traçabilité nominative des sorties de matériel, affectations d'antennes Starlink et retours en réserve"
        badge={
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200">
            {movements.length} transactions tracées
          </span>
        }
        items={movements}
        columns={columns}
        searchPlaceholder="Rechercher par équipement, collaborateur, département, notes..."
        searchFields={['assetName', 'targetUser', 'department', 'notes', 'performedBy']}
        filters={[
          {
            key: 'actionType',
            label: 'Opération',
            options: [
              { label: 'Prêt / Sortie', value: 'check_out' },
              { label: 'Retour Réserve', value: 'check_in' },
              { label: 'Maintenance', value: 'maintenance_start' }
            ]
          }
        ]}
        actionButtons={
          <button
            onClick={() => setIsNewMoveModalOpen(true)}
            className="h-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <i className="ri-add-line text-base"></i>
            <span>Enregistrer un Prêt / Sortie</span>
          </button>
        }
      />

      {/* New Movement Modal */}
      {isNewMoveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-2xl relative max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Enregistrer un Mouvement</h3>
                  <p className="text-[11px] text-slate-500">
                    Affectation nominative à un salarié ou retour en stock central Lebrun S.A.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewMoveModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Section 1: Opération & Matériel */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Opération & Matériel</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                    Équipement concerné <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                  >
                    <option value="">Sélectionnez un équipement...</option>
                    <optgroup label="Équipements IT">
                      {itAssets.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.assetTag}) - Statut: {a.status}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Flotte Starlink">
                      {starlinkKits.map(k => (
                        <option key={k.id} value={k.id}>
                          {k.name} ({k.kitNumber})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                    Type d&apos;opération <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'check_out', label: 'Prêt / Sortie' },
                      { id: 'check_in', label: 'Retour Stock' },
                      { id: 'maintenance_start', label: 'Maintenance' }
                    ].map(t => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setActionType(t.id as any)}
                        className={`h-10 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          actionType === t.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {actionType === 'check_out' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                      Salarié Bénéficiaire <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      <option value="">Sélectionnez un collaborateur...</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>
                          {e.fullName} ({e.employeeId}) • {e.department}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Section 2: Motif & Remarques */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Motif & Commentaires</span>
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ex: Affectation pour mission sur site..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 resize-none"
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 p-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
              <button
                type="button"
                onClick={() => setIsNewMoveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={(e) => {
                  const form = (e.currentTarget.closest('.bg-white') as HTMLElement)?.querySelector('form');
                  if (form) form.requestSubmit();
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Valider le mouvement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
