'use client';

import React, { useMemo, useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { PhoneAsset } from '@/types/inventory';
import DataTable, { Column } from '@/components/common/DataTable';
import CompanyLogo from '@/components/common/CompanyLogo';
import ConfirmModal from '@/components/common/ConfirmModal';
import { Download, FileText, MapPin, Pencil, Plus, Search, Smartphone, Trash2, User } from 'lucide-react';

export default function PhonesView() {
  const { phones, employees, openPhoneModal, deletePhone, exportCSV, downloadPhoneSheet } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [assignFilter, setAssignFilter] = useState<'all' | 'assigned' | 'free'>('all');
  const [deleting, setDeleting] = useState<PhoneAsset | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return phones
      .filter(p => {
        if (companyFilter !== 'all' && !p.company?.toLowerCase().includes(companyFilter.toLowerCase())) return false;
        if (assignFilter === 'assigned' && !p.assignedTo) return false;
        if (assignFilter === 'free' && p.assignedTo) return false;
        if (!q) return true;
        return [p.assetTag, p.brand, p.model, p.imei1, p.imei2, p.assignedTo, p.assignedPersonnelId, p.company, p.site, p.observations]
          .some(v => (v || '').toLowerCase().includes(q));
      })
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  }, [phones, companyFilter, assignFilter, searchQuery]);

  const stats = useMemo(() => {
    const assigned = phones.filter(p => p.assignedTo).length;
    return { total: phones.length, assigned, free: phones.length - assigned };
  }, [phones]);

  const columns: Column<PhoneAsset>[] = [
    {
      key: 'assetTag',
      label: 'Code',
      sortable: true,
      width: '120px',
      render: (p) => (
        <span className="font-mono text-xs font-bold text-slate-900 whitespace-nowrap select-all tracking-tight">{p.assetTag}</span>
      )
    },
    {
      key: 'model',
      label: 'Téléphone',
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5 whitespace-nowrap">
            <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{p.brand}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">
            <strong className="text-slate-700">{p.model}</strong>
          </div>
        </div>
      )
    },
    {
      key: 'imei1',
      label: 'IMEI 1 / IMEI 2',
      render: (p) => (
        <div className="font-mono text-[11px] leading-snug whitespace-nowrap">
          <div className={p.imei1 ? 'text-slate-800 select-all' : 'text-slate-300'}>{p.imei1 || '—'}</div>
          <div className={p.imei2 ? 'text-slate-600 select-all' : 'text-slate-300'}>{p.imei2 || '—'}</div>
        </div>
      )
    },
    {
      key: 'assignedTo',
      label: 'Personne associée',
      sortable: true,
      render: (p) => {
        if (!p.assignedTo) {
          return <span className="text-[11px] text-slate-400 italic">Non attribué</span>;
        }
        const emp = employees.find(e => e.employeeId === p.assignedPersonnelId || e.fullName === p.assignedTo);
        return (
          <div>
            <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{p.assignedTo}</span>
            </div>
            {emp?.jobTitle && <div className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">{emp.jobTitle}</div>}
          </div>
        );
      }
    },
    {
      key: 'company',
      label: 'Entreprise & Site',
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <CompanyLogo company={p.company} className="h-4 max-w-[80px] w-auto object-contain" />
          {p.site && (
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{p.site}</span>
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      width: '110px',
      render: (p) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => void downloadPhoneSheet(p)}
            disabled={!p.assignedTo}
            title={p.assignedTo ? "Télécharger la fiche d'affectation (PDF)" : "Associez d'abord une personne pour générer la fiche"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openPhoneModal(p)}
            title="Modifier ce téléphone"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleting(p)}
            title="Supprimer ce téléphone"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 font-sans">
        <div>
          <h1 className="text-sm font-medium text-slate-800 tracking-tight">Téléphones & Portables</h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Marque, modèle, IMEI et personne associée à chaque téléphone
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openPhoneModal()}
            className="h-8 flex items-center gap-1.5 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un téléphone</span>
          </button>
          <button
            onClick={() => exportCSV('phones')}
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 border border-slate-300 shadow-2xs transition-colors cursor-pointer active:scale-95"
            title="Exporter en fichier Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Exporter Excel</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[
          { label: 'Total téléphones', value: stats.total, sub: 'appareils enregistrés' },
          { label: 'Attribués', value: stats.assigned, sub: 'avec une personne associée' },
          { label: 'En réserve', value: stats.free, sub: 'non attribués' }
        ].map(k => (
          <div key={k.label} className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-medium text-slate-600">{k.label}</div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900 font-sans">{k.value}</span>
              <span className="text-xs text-slate-500">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <DataTable
        items={filtered}
        columns={columns}
        defaultRowsPerPage={10}
        emptyMessage="Aucun téléphone enregistré. Cliquez sur « Ajouter un téléphone »."
        onRowClick={(p) => openPhoneModal(p)}
        customFilters={
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher marque, modèle, IMEI, personne..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={assignFilter}
                onChange={(e) => setAssignFilter(e.target.value as 'all' | 'assigned' | 'free')}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Tous</option>
                <option value="assigned">Attribués</option>
                <option value="free">En réserve</option>
              </select>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes les entreprises</option>
                <option value="Lebrun">Lebrun S.A.</option>
                <option value="Autobiz">Autobiz</option>
                <option value="Caribe">Caribe Motors</option>
                <option value="Leader">Leader Foods</option>
                <option value="Tirezone">Tirezone</option>
              </select>
            </div>
          </div>
        }
      />

      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            void deletePhone(deleting.id);
            setDeleting(null);
          }
        }}
        title="Supprimer le téléphone"
        message={`Êtes-vous certain de vouloir supprimer ${deleting?.brand} ${deleting?.model} (${deleting?.assetTag}) ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
