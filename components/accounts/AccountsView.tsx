'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ITAccount, ITRole } from '@/types/inventory';
import { 
  Plus, 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  Filter
} from 'lucide-react';

export default function AccountsView() {
  const {
    itAccounts,
    openAccountModal,
    deleteITAccount,
    exportCSV,
    searchQuery: globalSearch
  } = useInventory();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Combined search: header search + view search
  const activeSearch = search || globalSearch || '';

  // KPI Calculations
  const stats = useMemo(() => {
    const total = itAccounts.length;
    const superAdmins = itAccounts.filter(a => a.role === 'Super Administrateur IT').length;
    const sysAdmins = itAccounts.filter(a => a.role === 'Administrateur Systèmes & Réseaux').length;
    const activeCount = itAccounts.filter(a => a.status === 'active').length;

    return {
      total,
      superAdmins,
      sysAdmins,
      activeCount
    };
  }, [itAccounts]);

  // Filtering
  const filteredAccounts = useMemo(() => {
    return itAccounts.filter(account => {
      // Role filter
      if (selectedRole !== 'all' && account.role !== selectedRole) {
        return false;
      }
      // Company filter
      if (selectedCompany !== 'all' && account.company !== selectedCompany) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && account.status !== selectedStatus) {
        return false;
      }
      // Text search
      if (activeSearch.trim()) {
        const query = activeSearch.toLowerCase();
        const matchesName = account.fullName.toLowerCase().includes(query);
        const matchesUsername = account.username.toLowerCase().includes(query);
        const matchesEmail = account.email.toLowerCase().includes(query);
        const matchesRole = account.role.toLowerCase().includes(query);
        const matchesCompany = account.company.toLowerCase().includes(query);
        const matchesSpecialty = account.specialty?.toLowerCase().includes(query) || false;
        const matchesPhone = account.phone?.toLowerCase().includes(query) || false;

        return matchesName || matchesUsername || matchesEmail || matchesRole || matchesCompany || matchesSpecialty || matchesPhone;
      }

      return true;
    });
  }, [itAccounts, selectedRole, selectedCompany, selectedStatus, activeSearch]);

  const handleDelete = (account: ITAccount) => {
    if (confirm(`Êtes-vous certain de vouloir supprimer le compte de ${account.fullName} (@${account.username}) ?`)) {
      deleteITAccount(account.id);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Clean Light Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 font-sans">
        <div>
          <h1 className="text-sm font-medium text-slate-800 tracking-tight">
            Comptes Utilisateurs & Administrateurs
          </h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Gestion nominative des comptes d&apos;accès, informaticiens et administrateurs de Lebrun S.A.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openAccountModal()}
            className="h-8 flex items-center gap-1.5 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Compte</span>
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

      {/* KPI Stats - Clean monochrome slate */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Comptes</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Super Admins</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.superAdmins}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Admins Systèmes</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.sysAdmins}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Comptes Actifs</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.activeCount}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher nom, @user, email, rôle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
            />
          </div>

          {/* Role Filter */}
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
            >
              <option value="all">Tous les Rôles</option>
              <option value="Super Administrateur IT">Super Administrateur IT</option>
              <option value="Administrateur Systèmes & Réseaux">Admin Systèmes & Réseaux</option>
              <option value="Technicien Support & Maintenance">Technicien Support</option>
              <option value="Technicien Réseaux & Télécoms">Technicien Réseaux</option>
              <option value="Gestionnaire Parc Informatique">Gestionnaire Parc IT</option>
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
            >
              <option value="all">Toutes les Entreprises</option>
              <option value="Lebrun S.A.">Lebrun S.A.</option>
              <option value="Caribe Motors">Caribe Motors</option>
              <option value="Autobiz">Autobiz</option>
              <option value="Leader Foods">Leader Foods</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
            >
              <option value="all">Tous les Statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clean Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5">Nom de la personne</th>
                <th className="py-3 px-3.5">Rôle</th>
                <th className="py-3 px-3.5">Entreprise</th>
                <th className="py-3 px-3.5">Site</th>
                <th className="py-3 px-3.5">Email</th>
                <th className="py-3 px-3.5">Téléphone</th>
                <th className="py-3 px-3.5">Statut</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600">Aucun compte trouvé</p>
                    <p className="text-xs text-slate-400 mt-1">Modifiez vos filtres ou ajoutez un nouveau compte.</p>
                    <button
                      onClick={() => openAccountModal()}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter un compte
                    </button>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Person Name - Plain, clean text */}
                    <td className="py-3 px-3.5 font-semibold text-slate-900 whitespace-nowrap">
                      {account.fullName}
                    </td>

                    {/* Role - Sober slate badge */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {account.role}
                      </span>
                    </td>

                    {/* Company - Plain text */}
                    <td className="py-3 px-3.5 font-medium text-slate-800 whitespace-nowrap">
                      {account.company}
                    </td>

                    {/* Site - Plain text */}
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      {account.site}
                    </td>

                    {/* Email - Plain text / link */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <a
                        href={`mailto:${account.email}`}
                        className="text-slate-700 hover:text-slate-900 hover:underline"
                      >
                        {account.email}
                      </a>
                    </td>

                    {/* Phone - Plain text */}
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      {account.phone || '-'}
                    </td>

                    {/* Status - Clean subtle badge */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <span className={`w-1.5 h-1.5 rounded-full ${account.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {account.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>

                    {/* Actions - Matching standard Edit2 & Trash2 */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openAccountModal(account)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Modifier ce compte"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
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
      </div>
    </div>
  );
}
