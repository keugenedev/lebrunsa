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
  Building 
} from 'lucide-react';

export default function ApplicationsView() {
  const { applicationAccounts } = useInventory();

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
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Applications
              </h1>
              <p className="text-xs text-slate-500">
                Identifiants, mots de passe et habilitations logicielles des collaborateurs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un identifiant, nom, application..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes les organisations</option>
            <option value="Lebrun">Lebrun S.A.</option>
            <option value="Autobiz">Autobiz S.A.</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        items={filteredAccounts}
        columns={columns}
        defaultRowsPerPage={15}
      />
    </div>
  );
}
