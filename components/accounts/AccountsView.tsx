'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ITAccount } from '@/types/inventory';
import { 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  KeyRound
} from 'lucide-react';

import ConfirmModal from '@/components/common/ConfirmModal';

const DEFAULT_ROWS_PER_PAGE = 50;

export default function AccountsView() {
  const {
    itAccounts,
    openAccountModal,
    deleteITAccount,
    exportCSV,
    searchQuery: globalSearch
  } = useInventory();

  const [search, setSearch] = useState('');
  const [deletingAccount, setDeletingAccount] = useState<ITAccount | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  // Combined search: header search + view search
  const activeSearch = search || globalSearch || '';

  // KPI Calculations
  const stats = useMemo(() => {
    const total = itAccounts.length;
    const withPassword = itAccounts.filter(a => a.hasPassword).length;

    return {
      total,
      withPassword
    };
  }, [itAccounts]);

  // Filtering
  const filteredAccounts = useMemo(() => {
    return itAccounts.filter(account => {
      if (activeSearch.trim()) {
        const query = activeSearch.toLowerCase();
        const matchesName = account.fullName.toLowerCase().includes(query);
        const matchesCode = (account.userId || '').toLowerCase().includes(query) || account.username.toLowerCase().includes(query);
        const matchesEmail = account.email.toLowerCase().includes(query);
        const matchesPoste = (account.poste || account.specialty || account.role || '').toLowerCase().includes(query);

        return matchesName || matchesCode || matchesEmail || matchesPoste;
      }

      return true;
    }).sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [itAccounts, activeSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredAccounts.length);
  const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);

  const handleDelete = (account: ITAccount) => {
    setDeletingAccount(account);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Clean Light Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 font-sans">
        <div>
          <h1 className="text-sm font-medium text-slate-800 tracking-tight">
            Comptes & Accès Utilisateurs
          </h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Accès de connexion du personnel. Vous définissez le mot de passe de chaque personne : il n&apos;est jamais affiché ici.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openAccountModal()}
            className="h-8 flex items-center gap-1.5 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvel accès</span>
          </button>
          <button
            onClick={() => exportCSV('accounts')}
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 border border-slate-300 shadow-2xs transition-colors cursor-pointer active:scale-95"
            title="Exporter en fichier Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Exporter Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Comptes Utilisateurs</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Accès activés (mot de passe défini)</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{stats.withPassword}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par code, nom, email ou poste..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
          />
        </div>
      </div>

      {/* Table : Code | Nom | Email | Poste | Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5">Code</th>
                <th className="py-3 px-3.5">Nom</th>
                <th className="py-3 px-3.5">Email</th>
                <th className="py-3 px-3.5">Poste</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600">Aucun compte trouvé</p>
                    <p className="text-xs text-slate-400 mt-1">Créez l&apos;accès d&apos;un collaborateur en définissant son mot de passe.</p>
                    <button
                      onClick={() => openAccountModal()}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Créer un accès
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((account, idx) => (
                  <tr key={`${account.id || account.username || 'acc'}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                    {/* Code */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                        {account.userId || account.username || '-'}
                      </span>
                    </td>

                    {/* Nom */}
                    <td className="py-3 px-3.5 whitespace-nowrap font-semibold text-slate-900">
                      {account.fullName}
                    </td>

                    {/* Email */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <a
                        href={`mailto:${account.email}`}
                        className="text-slate-700 hover:text-slate-900 hover:underline font-medium"
                      >
                        {account.email}
                      </a>
                    </td>

                    {/* Poste */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {account.poste || account.specialty || account.role || '-'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openAccountModal(account)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                          title="Réinitialiser le mot de passe : vous définissez un nouveau mot de passe pour cette personne"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Réinitialiser
                        </button>
                        <button
                          onClick={() => handleDelete(account)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Supprimer ce compte"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-3.5 px-4 pb-4">
          <div className="text-xs text-slate-500">
            Affichage de <span className="font-semibold text-slate-800">{filteredAccounts.length === 0 ? 0 : startIndex + 1}</span> Ã {' '}
            <span className="font-semibold text-slate-800">{endIndex}</span> sur{' '}
            <span className="font-semibold text-slate-800">{filteredAccounts.length}</span> Ã©lÃ©ment(s)
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Lignes :</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 rounded-lg border border-slate-300 bg-slate-50/70 px-2 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-red-600 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                title="PremiÃ¨re page"
              >
                <i className="ri-arrow-left-double-line text-xs"></i>
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                title="PrÃ©cÃ©dent"
              >
                <i className="ri-arrow-left-s-line text-xs"></i>
              </button>

              <span className="px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg">
                Page {safeCurrentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages || filteredAccounts.length === 0}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                title="Suivant"
              >
                <i className="ri-arrow-right-s-line text-xs"></i>
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages || filteredAccounts.length === 0}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                title="DerniÃ¨re page"
              >
                <i className="ri-arrow-right-double-line text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deletingAccount)}
        onClose={() => setDeletingAccount(null)}
        onConfirm={() => {
          if (deletingAccount) {
            deleteITAccount(deletingAccount.id);
            setDeletingAccount(null);
          }
        }}
        title="Suppression de compte"
        message={`Êtes-vous certain de vouloir supprimer le compte de ${deletingAccount?.fullName} (@${deletingAccount?.username}) ? cette action est définitive.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
