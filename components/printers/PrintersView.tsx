'use client';

import CompanyLogo from '@/components/common/CompanyLogo';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { PrinterAsset } from '@/types/inventory';
import DataTable, { Column } from '@/components/common/DataTable';
import { 
  Printer, 
  Plus, 
  Download, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Edit2, 
  Trash2, 
  Barcode,
  Building2, 
  MapPin, 
  Network, 
  CheckCircle2, 
  X,
  Layers
} from 'lucide-react';

export default function PrintersView() {
  const { 
    printers, 
    addPrinter, 
    updatePrinter, 
    deletePrinter, 
    openQRModal 
  } = useInventory();

  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterAsset | null>(null);
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    company: 'Lebrun S.A.',
    site: 'Delmas 52',
    name: '',
    brand: 'Hp',
    model: '',
    serialNumber: '',
    ipAddress: '',
    type: 'Multifonction',
    status: 'Fonctionnel' as 'Fonctionnel' | 'Maintenance' | 'En panne',
    observations: 'Good'
  });

  const companies = ['Lebrun S.A.', 'Autobiz', 'Caribe Motors', 'Leader Foods', 'Tirezone'];
  const sites = ['Delmas 52', 'Aéroport Depot'];
  const types = ['Multifonction', 'Laser', 'Laser (Cheque)'];

  const filteredPrinters = useMemo(() => {
    return printers.filter(p => {
      if (companyFilter !== 'all' && p.company !== companyFilter) return false;
      if (siteFilter !== 'all' && p.site !== siteFilter) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          p.name.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.serialNumber.toLowerCase().includes(q) ||
          p.ipAddress.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q) ||
          p.assetTag.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [printers, companyFilter, siteFilter, typeFilter, searchQuery]);

  // KPIs
  const stats = useMemo(() => {
    const total = printers.length;
    const multi = printers.filter(p => p.type.toLowerCase().includes('multi')).length;
    const laser = printers.filter(p => p.type.toLowerCase().includes('laser')).length;
    const network = printers.filter(p => p.ipAddress && p.ipAddress !== 'N/A').length;
    return { total, multi, laser, network };
  }, [printers]);

  const handleCopySerial = (sn: string) => {
    navigator.clipboard.writeText(sn);
    setCopiedSerial(sn);
    setTimeout(() => setCopiedSerial(null), 2000);
  };

  const handleOpenAdd = () => {
    setEditingPrinter(null);
    setFormData({
      company: 'Lebrun S.A.',
      site: 'Delmas 52',
      name: '',
      brand: 'Hp',
      model: '',
      serialNumber: '',
      ipAddress: '',
      type: 'Multifonction',
      status: 'Fonctionnel',
      observations: 'Good'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PrinterAsset) => {
    setEditingPrinter(p);
    setFormData({
      company: p.company,
      site: p.site,
      name: p.name,
      brand: p.brand,
      model: p.model,
      serialNumber: p.serialNumber,
      ipAddress: p.ipAddress,
      type: p.type,
      status: p.status,
      observations: p.observations
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.model.trim()) return;

    if (editingPrinter) {
      updatePrinter(editingPrinter.id, formData);
    } else {
      const code = formData.company.startsWith('Lebrun') ? 'LEB' : formData.company.startsWith('Auto') ? 'AUT' : formData.company.startsWith('Caribe') ? 'CAR' : 'LFD';
      const count = printers.filter(p => p.company === formData.company).length + 1;
      const tag = `PRN-${code}-${count.toString().padStart(3, '0')}`;

      addPrinter({
        ...formData,
        assetTag: tag
      });
    }
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Entreprise', 'Adresse / Site', 'Nom de l\'imprimante', 'Marque', 'Modèle', 'N° de série', 'Adresse IP', 'Type', 'État', 'Observations'];
    const rows = filteredPrinters.map(p => [
      p.company,
      p.site,
      p.name,
      p.brand,
      p.model,
      p.serialNumber,
      p.ipAddress,
      p.type,
      p.status,
      p.observations
    ]);

    const csvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inventaire_Imprimantes_Lebronsa_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<PrinterAsset>[] = [
    {
      key: 'assetTag',
      label: 'Tag / Code',
      sortable: true,
      width: '110px',
      render: (p) => (
        <span className="font-mono text-xs font-bold text-slate-900 whitespace-nowrap select-all tracking-tight">
          {p.assetTag}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Nom & Modèle',
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{p.name}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {p.brand} • <strong className="text-slate-700">{p.model}</strong>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      label: 'Entreprise & Site',
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <CompanyLogo company={p.company} className="h-4 max-w-[80px] w-auto object-contain" />
          <span className="text-[11px] text-slate-500 whitespace-nowrap flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{p.site}</span>
          </span>
        </div>
      )
    },
    {
      key: 'serialNumber',
      label: 'N° de Série',
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700">
          <span>{p.serialNumber}</span>
          <button
            onClick={() => handleCopySerial(p.serialNumber)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="Copier le numéro de série"
          >
            {copiedSerial === p.serialNumber ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      )
    },
    {
      key: 'ipAddress',
      label: 'Adresse IP',
      sortable: true,
      render: (p) => {
        if (!p.ipAddress || p.ipAddress === 'N/A') {
          return <span className="text-slate-400 text-xs italic">Non connectée (N/A)</span>;
        }
        return (
          <a
            href={`http://${p.ipAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
            title="Ouvrir la page de gestion de l'imprimante"
          >
            <Network className="w-3 h-3 text-blue-500" />
            <span>{p.ipAddress}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
        );
      }
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (p) => (
        <span className="text-xs text-slate-700 font-medium">
          {p.type}
        </span>
      )
    },
    {
      key: 'status',
      label: 'État',
      sortable: true,
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {p.status}
        </span>
      )
    },
    {
      key: 'observations',
      label: 'Observations',
      render: (p) => (
        <span className="text-xs text-slate-600">
          {p.observations || 'Good'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openQRModal({
              id: p.id,
              name: `${p.name} (${p.model})`,
              assetTag: p.assetTag,
              category: 'it',
              subCategory: 'peripheral',
              brand: p.brand,
              model: p.model,
              serialNumber: p.serialNumber,
              purchaseDate: p.createdAt.slice(0, 10),
              warrantyExpiry: p.createdAt.slice(0, 10),
              purchaseCost: 0,
              status: 'in_use',
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
              location: `${p.company} • ${p.site}`,
              notes: `IP: ${p.ipAddress} • S/N: ${p.serialNumber}`
            })}
            title="Générer étiquette Code-barres (Code 128)"
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Barcode className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(p)}
            title="Modifier"
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Supprimer l'imprimante ${p.name} (${p.serialNumber}) ?`)) {
                deletePrinter(p.id);
              }
            }}
            title="Supprimer"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 2xl:p-8 rounded-2xl 2xl:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] 2xl:text-xs font-bold tracking-widest uppercase bg-red-600/30 text-red-400 px-2.5 py-0.5 rounded-md border border-red-500/30">
              PARC IMPRIMANTES & MULTIFONCTIONS
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs 2xl:text-sm text-slate-300">Delmas 52 & Aéroport Depot</span>
          </div>
          <h1 className="text-2xl 2xl:text-3xl font-extrabold tracking-tight text-white mt-2">
            Gestion du Parc Imprimantes HP & Copieurs
          </h1>
          <p className="text-xs 2xl:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Suivi centralisé des 16 imprimantes réseau HP, multifonctions laser, matricielles de chèques et adresses IP du groupe Lebrun S.A.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="h-11 2xl:h-13 flex items-center gap-2 px-4 2xl:px-5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs 2xl:text-sm font-semibold text-white transition-colors cursor-pointer"
            title="Exporter en fichier CSV / Excel"
          >
            <Download className="w-4 h-4 2xl:w-5 2xl:h-5" />
            <span>Exporter CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="h-11 2xl:h-13 flex items-center gap-2 px-4.5 2xl:px-6 rounded-xl bg-red-600 hover:bg-red-700 text-xs 2xl:text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 2xl:w-5 2xl:h-5" />
            <span>Ajouter Imprimante</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 2xl:gap-6">
        <div className="p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs 2xl:text-sm font-semibold text-slate-500">Total Imprimantes</span>
            <div className="w-9 h-9 2xl:w-11 2xl:h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Printer className="w-4 h-4 2xl:w-5 2xl:h-5" />
            </div>
          </div>
          <div className="text-2xl 2xl:text-3xl font-extrabold text-slate-900 mt-2">{stats.total}</div>
          <div className="text-[11px] 2xl:text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Fonctionnelles</span>
          </div>
        </div>

        <div className="p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs 2xl:text-sm font-semibold text-slate-500">Multifonctions</span>
            <div className="w-9 h-9 2xl:w-11 2xl:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4 2xl:w-5 2xl:h-5" />
            </div>
          </div>
          <div className="text-2xl 2xl:text-3xl font-extrabold text-slate-900 mt-2">{stats.multi}</div>
          <div className="text-[11px] 2xl:text-xs text-slate-500 mt-1">Scanner & Impression</div>
        </div>

        <div className="p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs 2xl:text-sm font-semibold text-slate-500">Lasers & Chèques</span>
            <div className="w-9 h-9 2xl:w-11 2xl:h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Printer className="w-4 h-4 2xl:w-5 2xl:h-5" />
            </div>
          </div>
          <div className="text-2xl 2xl:text-3xl font-extrabold text-slate-900 mt-2">{stats.laser}</div>
          <div className="text-[11px] 2xl:text-xs text-slate-500 mt-1">Impression N&B / Chèques</div>
        </div>

        <div className="p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs 2xl:text-sm font-semibold text-slate-500">Connectées Réseau</span>
            <div className="w-9 h-9 2xl:w-11 2xl:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Network className="w-4 h-4 2xl:w-5 2xl:h-5" />
            </div>
          </div>
          <div className="text-2xl 2xl:text-3xl font-extrabold text-slate-900 mt-2">{stats.network}</div>
          <div className="text-[11px] 2xl:text-xs text-slate-500 mt-1">Avec adresse IP active</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 2xl:p-5 rounded-2xl 2xl:rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 2xl:w-5 2xl:h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, modèle, IP, S/N..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Company */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">Toutes les entreprises</option>
            {companies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Site */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">Tous les sites</option>
            {sites.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">Tous les types</option>
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        items={filteredPrinters}
        searchPlaceholder="Rechercher par nom, modèle, IP, série..."
        defaultRowsPerPage={20}
      />

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingPrinter ? 'Modifier l\'Imprimante' : 'Nouvelle Imprimante'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Entreprise</label>
                  <select
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {companies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Site / Adresse</label>
                  <select
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {sites.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Nom de l&apos;imprimante</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Hp Laser jet pro, Hp Cheque..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Marque</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Modèle</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="ex: 4103dw, MFP M479dw..."
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">N° de Série</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="ex: THBTT5R0"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Adresse IP</label>
                  <input
                    type="text"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    placeholder="ex: 192.168.1.175 ou N/A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">État</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Fonctionnel">Fonctionnel</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="En panne">En panne</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Observations</label>
                <input
                  type="text"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-xs"
                >
                  {editingPrinter ? 'Enregistrer les modifications' : 'Ajouter l\'imprimante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
