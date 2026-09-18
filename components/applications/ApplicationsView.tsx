'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ApplicationAccount, Employee } from '@/types/inventory';
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
  Trash2,
  Monitor,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function ApplicationsView() {
  const { applicationAccounts, openApplicationModal, deleteApplicationAccount, employees, exportCSV } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState('all');
  const [appFilter, setAppFilter] = useState('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePassword = (key: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCopy = (id: string, text: string) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLinkedEmployee = (acc: ApplicationAccount): Employee | undefined => {
    return employees.find(e => 
      (acc.employeeId && (e.id === acc.employeeId || e.employeeId === acc.employeeId)) ||
      (e.accounts?.appUsername && e.accounts.appUsername.toLowerCase() === acc.username.toLowerCase()) ||
      (e.lastName.toLowerCase() === acc.lastName.toLowerCase())
    );
  };

  const filteredAccounts = useMemo(() => {
    return applicationAccounts.filter(acc => {
      if (orgFilter !== 'all' && !acc.organization.toLowerCase().includes(orgFilter.toLowerCase())) return false;
      if (appFilter !== 'all') {
        const qApp = appFilter.toLowerCase();
        if (qApp === 'gp' && !acc.applications.toLowerCase().includes('gp')) return false;
        if (qApp === 'dealerpro' && !acc.applications.toLowerCase().includes('dealer')) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const emp = getLinkedEmployee(acc);
        const fullName = `${acc.firstName} ${acc.lastName}`.toLowerCase();
        const empName = emp?.fullName.toLowerCase() || '';
        const empId = emp?.employeeId.toLowerCase() || '';
        const winUser = (acc.windowsUsername || emp?.accounts?.windowsUsername || '').toLowerCase();

        return (
          acc.username.toLowerCase().includes(q) ||
          fullName.includes(q) ||
          empName.includes(q) ||
          empId.includes(q) ||
          winUser.includes(q) ||
          acc.applications.toLowerCase().includes(q) ||
          acc.organization.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [applicationAccounts, orgFilter, appFilter, searchQuery, employees]);

  const handleExportCSV = () => {
    exportCSV('applications');
  };

  const columns: Column<ApplicationAccount>[] = [
    {
      key: 'lastName',
      label: 'Collaborateur (Personnel)',
      sortable: true,
      render: (acc) => {
        const emp = getLinkedEmployee(acc);
        const displayName = emp ? emp.fullName : `${acc.firstName} ${acc.lastName}`;
        const matricule = emp ? emp.employeeId : (acc.employeeId || 'PERSONNEL');

        return (
          <div className="flex items-center gap-2.5 py-1">
            <div className="h-8 w-8 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
              {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                {displayName}
              </p>
              <p className="text-xs font-semibold text-slate-600 mt-0.5 flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0"></span>
                <span className="font-mono">{matricule}</span>
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'windowsUsername',
      label: 'Connexion Session (Windows PC)',
      sortable: true,
      width: '230px',
      render: (acc) => {
        const emp = getLinkedEmployee(acc);
        const winUser = acc.windowsUsername || emp?.accounts?.windowsUsername || 'N/A';
        const winPass = acc.windowsPassword || emp?.accounts?.windowsPassword || 'N/A';
        const isPassVisible = visiblePasswords[`win-${acc.id}`];

        return (
          <div className="space-y-1 py-1">
            {/* Session Username */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider w-10">User:</span>
              <span className="font-mono text-xs font-bold text-slate-900 select-all">
                {winUser}
              </span>
              {winUser !== 'N/A' && (
                <button
                  onClick={() => handleCopy(`winuser-${acc.id}`, winUser)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                  title="Copier l'identifiant session"
                >
                  {copiedId === `winuser-${acc.id}` ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              )}
            </div>

            {/* Session Password */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider w-10">MDP:</span>
              <span className="font-mono text-xs font-semibold text-slate-800 min-w-[65px]">
                {winPass === 'N/A' ? (
                  <span className="text-slate-400 text-xs italic">N/A</span>
                ) : isPassVisible ? (
                  winPass
                ) : (
                  '••••••••'
                )}
              </span>
              {winPass !== 'N/A' && (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => togglePassword(`win-${acc.id}`)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                    title={isPassVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => handleCopy(`winpass-${acc.id}`, winPass)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                    title="Copier le mot de passe session"
                  >
                    {copiedId === `winpass-${acc.id}` ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'username',
      label: 'Identifiant & MDP (Logiciel)',
      sortable: true,
      width: '240px',
      render: (acc) => {
        const isAppPassVisible = visiblePasswords[`app-${acc.id}`];
        const pass = acc.password || 'N/A';
        const isDealerPro = acc.applications.toLowerCase().includes('dealer');
        const isGP = acc.applications.toLowerCase().includes('gp');

        return (
          <div className="space-y-1 py-1">
            {/* App Username */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider w-10">ID:</span>
              <span className="font-mono text-xs font-bold text-slate-900 select-all">
                @{acc.username}
              </span>
              <button
                onClick={() => handleCopy(`appuser-${acc.id}`, acc.username)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                title="Copier le nom d'utilisateur"
              >
                {copiedId === `appuser-${acc.id}` ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            </div>

            {/* App Password */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider w-10">MDP:</span>
              <span className="font-mono text-xs font-semibold text-slate-800 min-w-[65px]">
                {pass === 'N/A' ? (
                  <span className="text-slate-400 text-xs italic">N/A</span>
                ) : isAppPassVisible ? (
                  pass
                ) : (
                  '••••••••'
                )}
              </span>
              {pass !== 'N/A' && (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => togglePassword(`app-${acc.id}`)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                    title={isAppPassVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {isAppPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => handleCopy(`apppass-${acc.id}`, pass)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                    title="Copier le mot de passe"
                  >
                    {copiedId === `apppass-${acc.id}` ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'applications',
      label: 'Logiciels Autorisés',
      sortable: true,
      width: '160px',
      render: (acc) => {
        const isDealerPro = acc.applications.toLowerCase().includes('dealer');
        const isGP = acc.applications.toLowerCase().includes('gp');

        if (isDealerPro) {
          return (
            <div className="flex items-center py-0.5" title="DealerPro DMS - Caribe Motors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/dealerpro.png"
                alt="DealerPro DMS"
                className="h-6 w-auto max-w-[125px] object-contain"
                loading="lazy"
              />
            </div>
          );
        }

        if (isGP) {
          return (
            <div className="flex items-center py-0.5" title="Microsoft Dynamics GP">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/gp.png"
                alt="Microsoft Dynamics GP"
                className="h-6 w-auto max-w-[120px] object-contain"
                loading="lazy"
              />
            </div>
          );
        }

        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
            <ShieldCheck className="w-3 h-3 text-slate-600" />
            {acc.applications}
          </span>
        );
      }
    },
    {
      key: 'organization',
      label: 'Organisation / Entité',
      sortable: true,
      width: '150px',
      render: (acc) => {
        const isBoth = acc.organization.includes('|');
        return (
          <div className="whitespace-nowrap flex items-center gap-1.5">
            {isBoth ? (
              <div className="flex items-center gap-1.5">
                <CompanyLogo company="Lebrun S.A." className="h-4 max-w-[60px] w-auto object-contain" />
                <span className="text-slate-300 text-xs font-bold">|</span>
                <CompanyLogo company="Autobiz S.A." className="h-4 max-w-[60px] w-auto object-contain" />
              </div>
            ) : (
              <CompanyLogo company={acc.organization} className="h-4 max-w-[80px] w-auto object-contain" />
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      width: '80px',
      render: (acc) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openApplicationModal(acc)}
            title="Modifier cet accès et session"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const emp = getLinkedEmployee(acc);
              const label = emp ? emp.fullName : `${acc.firstName} ${acc.lastName}`;
              if (confirm(`Supprimer le compte applicatif et session pour ${label} (${acc.username}) ?`)) {
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
      {/* Clean Light Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 font-sans">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium text-slate-800 tracking-tight">
              Comptes Applicatifs & Sessions Windows
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Liaison directe au personnel : identifiants de session de travail Windows et accès logiciels métiers (Microsoft GP, DealerPro)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openApplicationModal()}
            className="h-8 flex items-center gap-1.5 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter Accès</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 border border-slate-300 shadow-2xs transition-colors cursor-pointer active:scale-95"
            title="Exporter en fichier Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
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
                placeholder="Rechercher collaborateur, session, GP, DealerPro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={appFilter}
                onChange={(e) => setAppFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Tous les logiciels</option>
                <option value="gp">Microsoft Dynamics GP</option>
                <option value="dealerpro">DealerPro DMS</option>
              </select>

              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes les organisations</option>
                <option value="Lebrun">Lebrun S.A.</option>
                <option value="Autobiz">Autobiz S.A.</option>
                <option value="Caribe">Caribe Motors</option>
                <option value="Leader">Leader Foods</option>
                <option value="Tirezone">Tirezone</option>
              </select>
            </div>
          </div>
        }
      />
    </div>
  );
}
