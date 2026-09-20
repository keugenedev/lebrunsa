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
  Layers,
  Eye
} from 'lucide-react';
import PrinterDetailsModal from './PrinterDetailsModal';

import ConfirmModal from '@/components/common/ConfirmModal';

export default function PrintersView() {
  const { 
    printers, 
    deletePrinter, 
    openQRModal,
    openPrinterModal,
    exportCSV
  } = useInventory();

  const [selectedPrinterForDetails, setSelectedPrinterForDetails] = useState<PrinterAsset | null>(null);
  const [deletingPrinter, setDeletingPrinter] = useState<PrinterAsset | null>(null);

  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);
  const companies = ['Lebrun S.A.', 'Autobiz', 'Caribe Motors', 'Leader Foods', 'Tirezone'];
  const sites = ['Delmas 52', 'Pétion-Ville', 'Delmas 60', 'Canapé-Vert'];
  const types = ['Multifonction', 'Laser', 'Laser (Cheque)', 'Étiquette', 'Matricielle', 'Jet d\'encre'];

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
    }).sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
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
    openPrinterModal();
  };

  const handleOpenEdit = (p: PrinterAsset) => {
    openPrinterModal(p);
  };

  const handleExportCSV = () => {
    exportCSV('printers');
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
            <Printer className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
              <Check className="w-3 h-3 text-slate-500" />
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
            className="inline-flex items-center gap-1 font-mono text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2 py-0.5 rounded border border-slate-200 transition-colors"
            title="Ouvrir la page de gestion de l'imprimante"
          >
            <Network className="w-3 h-3 text-slate-400" />
            <span>{p.ipAddress}</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400 opacity-60" />
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
      width: '120px',
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.status?.toLowerCase().includes('opér') || p.status?.toLowerCase().includes('en service') ? 'bg-emerald-500' : p.status?.toLowerCase().includes('maint') || p.status?.toLowerCase().includes('panne') || p.status?.toLowerCase().includes('hors') ? 'bg-red-500' : 'bg-slate-400'}`}></span>
          {p.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setSelectedPrinterForDetails(p)}
            title="Consulter tous les détails"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
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
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Barcode className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(p)}
            title="Modifier"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingPrinter(p)}
            title="Supprimer"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
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
          <h1 className="text-sm font-medium text-slate-800 tracking-tight">
            Imprimantes
          </h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Suivi centralisé du parc d'imprimantes et multifonctions réseau
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="h-8 flex items-center gap-1.5 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter Imprimante</span>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 2xl:gap-6">
        <div className="p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Total Imprimantes</span>
            <Printer className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-2 font-sans">{stats.total}</div>
          <div className="text-[11px] text-slate-400 font-normal mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Fonctionnelles</span>
          </div>
        </div>

        <div className="p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Multifonctions</span>
            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-2 font-sans">{stats.multi}</div>
          <div className="text-[11px] 2xl:text-xs text-slate-500 mt-1">Scanner & Impression</div>
        </div>

        <div className="p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Lasers & Chèques</span>
            <Printer className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-2 font-sans">{stats.laser}</div>
          <div className="text-[11px] 2xl:text-xs text-slate-500 mt-1">Impression N&B / Chèques</div>
        </div>

        <div className="p-5 2xl:p-6 rounded-2xl 2xl:rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Connectées Réseau</span>
            <Network className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-2 font-sans">{stats.network}</div>
          <div className="text-[11px] 2xl:text-xs text-slate-500 mt-1">Avec adresse IP active</div>
        </div>
      </div>

      {/* Main DataTable with Filters inside */}
      <DataTable
        columns={columns}
        items={filteredPrinters}
        defaultRowsPerPage={20}
        onRowClick={(p) => setSelectedPrinterForDetails(p)}
        customFilters={
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, modèle, IP, S/N..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
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
        }
      />

      {/* Modal de consultation des détails complets remplis */}
      {selectedPrinterForDetails && (
        <PrinterDetailsModal
          printer={selectedPrinterForDetails}
          onClose={() => setSelectedPrinterForDetails(null)}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingPrinter)}
        onClose={() => setDeletingPrinter(null)}
        onConfirm={() => {
          if (deletingPrinter) {
            deletePrinter(deletingPrinter.id);
            setDeletingPrinter(null);
          }
        }}
        title="Supprimer l'imprimante"
        message={`Êtes-vous certain de vouloir supprimer l'imprimante ${deletingPrinter?.name} (${deletingPrinter?.serialNumber}) ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
