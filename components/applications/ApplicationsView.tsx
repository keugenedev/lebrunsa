'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ApplicationAccount } from '@/types/inventory';
import DataTable, { Column } from '@/components/common/DataTable';
import CompanyLogo from '@/components/common/CompanyLogo';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Download, 
  Search, 
  ShieldCheck, 
  User, 
  Building,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';

export default function ApplicationsView() {
  const { applicationAccounts, openApplicationModal, deleteApplicationAccount } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAccounts = useMemo(() => {
    return applicationAccounts.filter(acc => {
      if (orgFilter !== 'all' && !acc.organization.toLowerCase().includes(orgFilter.toLowerCase())) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${acc.firstName} ${acc.lastName}`.toLowerCase();
        return (
          acc.username.toLowerCase().includes(q) ||
          fullName.includes(q) ||
          acc.applications.toLowerCase().includes(q) ||
          acc.organization.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [applicationAccounts, orgFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Username', 'Nom', 'Prénom', 'Applications', 'Organisation'];
    const rows = filteredAccounts.map(a => [
      a.username,
      a.lastName,
      a.firstName,
      a.applications,
      a.organization
    ]);
    const csv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Applications_GP_Lebronsa_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<ApplicationAccount>[] = [
    {
      key: 'username',
      label: 'Identifiant / Username',
      sortable: true,
      width: '160px',
      render: (acc) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-mono text-xs font-bold text-slate-900 select-all">
            {acc.username}
          </span>
          <button
            onClick={() => handleCopy(`user-${acc.id}`, acc.username)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
            title="Copier le nom d'utilisateur"
          >
            {copiedId === `user-${acc.id}` ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400" />
            )}
          </button>
        </div>
      )
    },
    {
      key: 'lastName',
      label: 'Collaborateur (Nom & Prénom)',
      sortable: true,
      render: (acc) => (
        <div className="whitespace-nowrap">
          <span className="font-semibold text-slate-900 text-xs">
            {acc.firstName} {acc.lastName}
          </span>
        </div>
      )
    },
    {
      key: 'password',
      label: 'Mot de Passe',
      width: '180px',
      render: (acc) => {
        if (!acc.password || acc.password === 'N/A') {
          return <span className="text-slate-400 text-xs italic">N/A</span>;
        }

        const isVisible = visiblePasswords[acc.id];

        return (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-mono text-xs font-semibold text-slate-800 min-w-[70px]">
              {isVisible ? acc.password : '••••••••'}
            </span>
            <button
              onClick={() => togglePassword(acc.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              title={isVisible ? 'Masquer' : 'Afficher'}
            >
              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => handleCopy(`pass-${acc.id}`, acc.password!)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              title="Copier le mot de passe"
            >
              {copiedId === `pass-${acc.id}` ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>
        );
      }
    },
    {
      key: 'applications',
      label: 'Applications Autorisées',
      sortable: true,
      render: (acc) => (
        <span className="text-xs text-slate-800 font-medium">
          {acc.applications}
        </span>
      )
    },
    {
      key: 'organization',
      label: 'Organisation / Entité',
      sortable: true,
      width: '160px',
      render: (acc) => {
        const isBoth = acc.organization.includes('|');
        return (
          <div className="whitespace-nowrap flex items-center gap-1.5">
            {isBoth ? (
              <div className="flex items-center gap-1.5">
                <CompanyLogo company="Lebrun S.A." className="h-4 max-w-[65px] w-auto object-contain" />
                <span className="text-slate-300 text-xs font-bold">|</span>
                <CompanyLogo company="Autobiz S.A." className="h-4 max-w-[65px] w-auto object-contain" />
              </div>
            ) : (
              <CompanyLogo company={acc.organization} className="h-4 max-w-[85px] w-auto object-contain" />
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      width: '90px',
      render: (acc) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openApplicationModal(acc)}
            title="Modifier cet accès"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Supprimer le compte applicatif pour ${acc.firstName} ${acc.lastName} (${acc.username}) ?`)) {
                deleteApplicationAccount(acc.id);
              }
            }}
            title="Supprimer cet accès"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      {/* Clean Light Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 font-sans">
        <div>
          <h1 className="text-sm font-medium text-slate-800 tracking-tight">
            Applications
          </h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Identifiants, accès et habilitations logicielles des collaborateurs de Lebrun S.A.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openApplicationModal()}
            className="h-8 flex items-center gap-1.5 px-3.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter Accès</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
            title="Exporter en fichier Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter Excel</span>
          </button>
        </div>
      </div>

      {/* Table with Filters inside */}
      <DataTable
        items={filteredAccounts}
        columns={columns}
        defaultRowsPerPage={15}
        customFilters={
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un identifiant, nom, application..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes les organisations</option>
                <option value="Lebrun">Lebrun S.A.</option>
                <option value="Autobiz">Autobiz S.A.</option>
              </select>
            </div>
          </div>
        }
      />
    </div>
  );
}
