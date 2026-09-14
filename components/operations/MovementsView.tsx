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
  Calendar
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
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            {mov.assetCategory === 'it' ? (
              <Laptop className="w-4 h-4 text-red-600" />
            ) : mov.assetCategory === 'starlink' ? (
              <Satellite className="w-4 h-4 text-cyan-600" />
            ) : mov.assetCategory === 'plans' ? (
              <Smartphone className="w-4 h-4 text-orange-600" />
            ) : (
              <Cpu className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <span className="font-semibold text-slate-900">{mov.assetName}</span>
        </div>
      )
    },
    {
      key: 'actionType',
      label: 'Type d\'Opération',
      sortable: true,
      align: 'center',
      render: (mov) => {
        if (mov.actionType === 'check_out') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
              <ArrowUpRight className="w-3 h-3" />
              Prêt / Sortie
            </span>
          );
        } else if (mov.actionType === 'check_in') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ArrowDownLeft className="w-3 h-3" />
              Retour Réserve
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Wrench className="w-3 h-3" />
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
            className="h-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-xs transition cursor-pointer"
          >
            <i className="ri-add-line text-base"></i>
            <span>Enregistrer un Prêt / Sortie</span>
          </button>
        }
      />

      {/* New Movement Modal */}
      {isNewMoveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="lebron-card w-full max-w-md p-6 bg-white border border-slate-200 shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-red-600" />
              <span>Enregistrer un Mouvement</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Affectation nominative à un salarié ou retour en stock central Lebronsa S.A.
            </p>

            <form onSubmit={handleSaveMovement} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Équipement concerné *</label>
                <select
                  required
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
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
                <label className="block text-slate-700 font-semibold mb-1">Type d&apos;opération *</label>
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
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                        actionType === t.id
                          ? 'bg-red-50 text-red-700 border-red-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {actionType === 'check_out' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Salarié Bénéficiaire *</label>
                  <select
                    required
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
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

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Motif / Commentaires</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex: Affectation pour mission sur site..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewMoveModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-xs"
                >
                  Valider le mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
