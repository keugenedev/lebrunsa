'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { DocumentItem, DocumentCategory, Employee } from '@/types/inventory';
import { 
  Plus, 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  Filter,
  FileText,
  Eye,
  CheckCircle2,
  Printer,
  FileCheck,
  Laptop,
  Monitor,
  Keyboard,
  Mouse,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import AssignmentSheetModal from './AssignmentSheetModal';
import IncidentReportForm from './IncidentReportForm';
import { 
  printSingleAssignmentSheet, 
  printAllAssignmentSheets,
  downloadSingleAssignmentSheetPDF,
  downloadAllAssignmentSheetsPDF,
  buildAssignmentDocRef
} from '@/lib/printAssignmentSheet';
import { downloadPhoneSheetPDF } from '@/lib/printPhoneSheet';
import ConfirmModal from '@/components/common/ConfirmModal';

const CATEGORIES: DocumentCategory[] = [
  'Fiches d\'Affectation',
  'Procédures & Guides IT',
  'Contrats & Garanties',
  'Schémas Réseau & Infrastructure',
  'Politiques de Sécurité',
  'Factures & Bons de Commande',
  'Procès-Verbaux & Décharges'
];

const DEFAULT_ROWS_PER_PAGE = 50;

export default function DocumentsView() {
  const {
    documents,
    employees,
    itAssets,
    phones,
    getAssignmentSheet,
    registerAssignmentSheets,
    downloadAssignmentSheet,
    openDocumentModal,
    deleteDocument,
    exportCSV,
    getEmployeeAssignedAssets,
    searchQuery: globalSearch,
    showToast
  } = useInventory();

  const [deletingDoc, setDeletingDoc] = useState<DocumentItem | null>(null);

  // Sub-tab selection: 'assignment_sheets' by default
  const [activeSubTab, setActiveSubTab] = useState<'assignment_sheets' | 'repository' | 'incident'>('assignment_sheets');

  // Sheet Modal State
  const [selectedEmpForSheet, setSelectedEmpForSheet] = useState<Employee | null>(null);

  // PDF Download States
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // Search & Filters for Fiches
  const [sheetSearch, setSheetSearch] = useState('');
  const [sheetCompanyFilter, setSheetCompanyFilter] = useState('all');
  const [sheetPage, setSheetPage] = useState(1);
  const [sheetRowsPerPage, setSheetRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  // Search & Filters for Repository
  const [repoSearch, setRepoSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [repoPage, setRepoPage] = useState(1);
  const [repoRowsPerPage, setRepoRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  // Active search query
  const effectiveSheetSearch = sheetSearch || globalSearch || '';
  const effectiveRepoSearch = repoSearch || globalSearch || '';

  // Référence de la fiche de chaque collaborateur (celle enregistrée dans la base, sinon celle qui sera émise)
  const sheetRefs = useMemo(() => {
    const refs = new Map<string, string>();
    employees.forEach(emp => {
      const sheet = getAssignmentSheet(emp);
      refs.set(emp.id, buildAssignmentDocRef(sheet.employee, sheet.options));
    });
    return refs;
  }, [employees, getAssignmentSheet]);

  const assignmentSheets = useMemo(() => {
    const sheets = new Map<string, ReturnType<typeof getAssignmentSheet>>();
    employees.forEach(emp => {
      sheets.set(emp.id, getAssignmentSheet(emp));
    });
    return sheets;
  }, [employees, getAssignmentSheet]);

  // Filtered Employees with Assigned Equipment
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Company filter
      if (sheetCompanyFilter !== 'all' && emp.company !== sheetCompanyFilter) {
        return false;
      }
      // Search
      if (effectiveSheetSearch.trim()) {
        const query = effectiveSheetSearch.toLowerCase();
        const matchesName = emp.fullName?.toLowerCase().includes(query) || false;
        const matchesId = emp.employeeId?.toLowerCase().includes(query) || false;
        const matchesCompany = emp.company?.toLowerCase().includes(query) || false;
        const matchesSite = emp.site?.toLowerCase().includes(query) || false;
        const matchesJob = emp.jobTitle?.toLowerCase().includes(query) || false;
        const sheet = assignmentSheets.get(emp.id);
        const ws = sheet?.employee.workstation || emp.workstation;
        const matchesPC = ws?.pcName?.toLowerCase().includes(query) || false;
        const matchesSerial = ws?.pcSerial?.toLowerCase().includes(query) || false;
        const matchesMonitor = ws?.monitorSerial?.toLowerCase().includes(query) || false;
        const matchesRef = sheetRefs.get(emp.id)?.toLowerCase().includes(query) || false;

        return matchesName || matchesId || matchesCompany || matchesSite || matchesJob || matchesPC || matchesSerial || matchesMonitor || matchesRef;
      }
      return true;
    }).sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [employees, sheetCompanyFilter, effectiveSheetSearch, sheetRefs, assignmentSheets]);

  // Overall calculations for assignment sheets (NO PRICE)
  const sheetStats = useMemo(() => {
    const total = filteredEmployees.length;
    const laptops = filteredEmployees.filter(e => {
      const ws = assignmentSheets.get(e.id)?.employee.workstation || e.workstation;
      return ws?.type?.toLowerCase().includes('laptop') || ws?.pcName?.toLowerCase().includes('lap');
    }).length;
    const desktops = total - laptops;

    return {
      total,
      laptops,
      desktops
    };
  }, [filteredEmployees, assignmentSheets]);

  // Filtered Documents in Repository
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
        return false;
      }
      if (selectedCompany !== 'all' && doc.company !== selectedCompany) {
        return false;
      }
      if (selectedStatus !== 'all' && doc.status !== selectedStatus) {
        return false;
      }
      if (effectiveRepoSearch.trim()) {
        const query = effectiveRepoSearch.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesRef = doc.reference?.toLowerCase().includes(query) || false;
        const matchesAuthor = doc.author.toLowerCase().includes(query);
        const matchesDesc = doc.description?.toLowerCase().includes(query) || false;
        const matchesCategory = doc.category.toLowerCase().includes(query);
        const matchesCompany = doc.company.toLowerCase().includes(query);

        return matchesTitle || matchesRef || matchesAuthor || matchesDesc || matchesCategory || matchesCompany;
      }
      return true;
    }).sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [documents, selectedCategory, selectedCompany, selectedStatus, effectiveRepoSearch]);

  const sheetTotalPages = Math.max(1, Math.ceil(filteredEmployees.length / sheetRowsPerPage));
  const safeSheetPage = Math.min(sheetPage, sheetTotalPages);
  const paginatedEmployees = useMemo(() => {
    const start = (safeSheetPage - 1) * sheetRowsPerPage;
    return filteredEmployees.slice(start, start + sheetRowsPerPage);
  }, [filteredEmployees, safeSheetPage, sheetRowsPerPage]);

  const repoTotalPages = Math.max(1, Math.ceil(filteredDocuments.length / repoRowsPerPage));
  const safeRepoPage = Math.min(repoPage, repoTotalPages);
  const paginatedDocuments = useMemo(() => {
    const start = (safeRepoPage - 1) * repoRowsPerPage;
    return filteredDocuments.slice(start, start + repoRowsPerPage);
  }, [filteredDocuments, safeRepoPage, repoRowsPerPage]);

  const renderPagination = (
    totalItems: number,
    currentPage: number,
    totalPages: number,
    rowsPerPage: number,
    onPageChange: (page: number) => void,
    onRowsPerPageChange: (rows: number) => void
  ) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

    return (
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-3.5 px-4 pb-4">
        <div className="text-xs text-slate-500">
          Affichage de <span className="font-semibold text-slate-800">{totalItems === 0 ? 0 : startIndex + 1}</span> à{' '}
          <span className="font-semibold text-slate-800">{endIndex}</span> sur{' '}
          <span className="font-semibold text-slate-800">{totalItems}</span> élément(s)
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Lignes :</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                onRowsPerPageChange(Number(e.target.value));
                onPageChange(1);
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
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Première page"
            >
              <i className="ri-arrow-left-double-line text-xs"></i>
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Précédent"
            >
              <i className="ri-arrow-left-s-line text-xs"></i>
            </button>

            <span className="px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg">
              Page {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalItems === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Suivant"
            >
              <i className="ri-arrow-right-s-line text-xs"></i>
            </button>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || totalItems === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Dernière page"
            >
              <i className="ri-arrow-right-double-line text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Navigation inside sheet preview modal
  const handleNextEmployee = () => {
    if (!selectedEmpForSheet) return;
    const idx = filteredEmployees.findIndex(e => e.id === selectedEmpForSheet.id);
    if (idx < filteredEmployees.length - 1) {
      setSelectedEmpForSheet(filteredEmployees[idx + 1]);
    } else {
      setSelectedEmpForSheet(filteredEmployees[0]);
    }
  };

  const handlePrevEmployee = () => {
    if (!selectedEmpForSheet) return;
    const idx = filteredEmployees.findIndex(e => e.id === selectedEmpForSheet.id);
    if (idx > 0) {
      setSelectedEmpForSheet(filteredEmployees[idx - 1]);
    } else {
      setSelectedEmpForSheet(filteredEmployees[filteredEmployees.length - 1]);
    }
  };

  const handleDownloadSingle = async (emp: Employee) => {
    try {
      setDownloadingId(emp.id);
      await downloadAssignmentSheet(emp);
      showToast?.({
        title: 'Téléchargement terminé',
        message: `Fiche d'affectation téléchargée pour ${emp.fullName}`,
        type: 'success'
      });
    } catch (err) {
      console.error('Erreur téléchargement PDF:', err);
      showToast?.({
        title: 'Erreur',
        message: 'Erreur lors du téléchargement du PDF',
        type: 'error'
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    if (filteredEmployees.length === 0) return;
    try {
      setIsDownloadingAll(true);
      setBatchProgress({ current: 0, total: filteredEmployees.length });
      await registerAssignmentSheets(filteredEmployees.map(emp => ({ emp })));
      const sheets = filteredEmployees.map(emp => {
        const s = getAssignmentSheet(emp);
        return { employee: s.employee, options: s.options };
      });
      await downloadAllAssignmentSheetsPDF(sheets, (current, total) => {
        setBatchProgress({ current, total });
      });
      showToast?.({
        title: 'Téléchargement groupé terminé',
        message: `${filteredEmployees.length} fiches d'affectation téléchargées en PDF`,
        type: 'success'
      });
    } catch (err) {
      console.error('Erreur téléchargement groupé PDF:', err);
      showToast?.({
        title: 'Erreur',
        message: 'Erreur lors du téléchargement groupé des fiches',
        type: 'error'
      });
    } finally {
      setIsDownloadingAll(false);
      setBatchProgress(null);
    }
  };

  const handleDelete = (doc: DocumentItem) => {
    setDeletingDoc(doc);
  };

  const handleDownloadDoc = (doc: DocumentItem) => {
    // Fiche d'affectation créée automatiquement : on régénère le vrai PDF
    const assignment = doc.url?.match(/^assignment:\/\/([^/]+)\/(.+)$/);
    if (assignment) {
      const emp = employees.find(e => e.id === decodeURIComponent(assignment[1]));
      const asset = itAssets.find(a => a.id === decodeURIComponent(assignment[2]));
      if (emp) {
        const date = doc.createdAt ? new Date(doc.createdAt) : undefined;
        downloadSingleAssignmentSheetPDF(
          { ...emp, workstation: asset?.workstation || emp.workstation },
          { assetTag: asset?.assetTag, date, reference: doc.reference }
        ).catch(err => {
          console.error('Erreur téléchargement PDF:', err);
          showToast({ title: 'Erreur', message: 'Erreur lors du téléchargement du PDF', type: 'error' });
        });
        return;
      }
    }

    // Fiche d'affectation de téléphone créée automatiquement : on régénère le vrai PDF
    const phoneRef = doc.url?.match(/^phone:\/\/(.+)$/);
    if (phoneRef) {
      const phone = phones.find(p => p.id === decodeURIComponent(phoneRef[1]));
      if (phone) {
        const owner = employees.find(e =>
          e.employeeId === phone.assignedPersonnelId ||
          e.id === phone.assignedPersonnelId ||
          (phone.assignedTo && e.fullName.toLowerCase() === phone.assignedTo.toLowerCase())
        );
        const date = doc.createdAt ? new Date(doc.createdAt) : undefined;
        downloadPhoneSheetPDF(phone, owner, { date, reference: doc.reference }).catch(err => {
          console.error('Erreur téléchargement PDF:', err);
          showToast({ title: 'Erreur', message: 'Erreur lors du téléchargement du PDF', type: 'error' });
        });
        return;
      }
    }

    const content = `========================================================
LEBRUN S.A. - DOCUMENT OFFICIEL IT
========================================================
Titre       : ${doc.title}
Référence   : ${doc.reference || 'N/A'}
Catégorie   : ${doc.category}
Entreprise  : ${doc.company}
Site        : ${doc.site || 'Delmas 52'}
Auteur      : ${doc.author}
Date        : ${doc.lastUpdated}
Statut      : ${doc.status === 'valide' ? 'Valide / En vigueur' : doc.status === 'en_revue' ? 'En cours de revue' : 'Archivé'}
Format      : ${doc.fileType.toUpperCase()} (${doc.fileSize || 'Standard'})
========================================================
DESCRIPTION & OBJET :
${doc.description || 'Document interne du parc informatique Lebrun S.A.'}
========================================================
Certifié conforme par le Système Central de Gestion Informatique Lebrun S.A.
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.reference || 'DOC'}_${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: 'Téléchargement initié',
      message: `Fiche ${doc.reference || doc.title} téléchargée avec succès.`,
      type: 'success'
    });
  };

  const getFormatBadge = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            PDF
          </span>
        );
      case 'xlsx':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            XLSX
          </span>
        );
      case 'docx':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            DOCX
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            TXT
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-sm font-medium text-slate-800 tracking-tight">
            Documents & Procédures IT
          </h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Fiches individuelles d&apos;affectation matériel (PDF), décharges de responsabilité et registre documentaire officiel
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'assignment_sheets' ? (
            <>
              <button
                onClick={handleDownloadAll}
                disabled={isDownloadingAll || filteredEmployees.length === 0}
                className="h-8 flex items-center gap-1.5 px-3.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-semibold text-slate-900 border border-slate-300 shadow-2xs transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                title="Télécharger un PDF unique contenant les fiches de tous les collaborateurs filtrés"
              >
                {isDownloadingAll ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-800" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-slate-800" />
                )}
                <span>
                  {isDownloadingAll && batchProgress 
                    ? `Génération (${batchProgress.current}/${batchProgress.total})...` 
                    : 'Télécharger Tout (PDF)'}
                </span>
              </button>
              <button
                onClick={() => {
                  void registerAssignmentSheets(filteredEmployees.map(emp => ({ emp })));
                  printAllAssignmentSheets(
                    filteredEmployees.map(emp => {
                      const s = getAssignmentSheet(emp);
                      return { employee: s.employee, options: s.options };
                    })
                  );
                }}
                className="h-8 flex items-center gap-1.5 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
                title="Imprimer directement toutes les fiches d'affectation"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer Tout</span>
              </button>
              <button
                onClick={() => exportCSV('personnel')}
                className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 border border-slate-300 shadow-2xs transition-colors cursor-pointer active:scale-95"
                title="Exporter l'inventaire en Excel (.xlsx)"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Excel</span>
              </button>
            </>
          ) : activeSubTab === 'repository' ? (
            <>
              <button
                onClick={() => openDocumentModal()}
                className="h-8 flex items-center gap-1.5 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Document</span>
              </button>
              <button
                onClick={() => exportCSV('documents')}
                className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 border border-slate-300 shadow-2xs transition-colors cursor-pointer active:scale-95"
                title="Exporter le registre en Excel (.xlsx)"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Excel</span>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveSubTab('assignment_sheets')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
            activeSubTab === 'assignment_sheets'
              ? 'bg-slate-900 text-white font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Fiches d&apos;Affectation Matériel (PDF)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            activeSubTab === 'assignment_sheets' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
          }`}>
            {employees.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('repository')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
            activeSubTab === 'repository'
              ? 'bg-slate-900 text-white font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Registre & Procédures IT</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            activeSubTab === 'repository' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
          }`}>
            {documents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('incident')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
            activeSubTab === 'incident'
              ? 'bg-slate-900 text-white font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Rapport d&apos;incident</span>
        </button>
      </div>

      {activeSubTab === 'incident' && <IncidentReportForm />}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: FICHES D'AFFECTATION MATÉRIEL (PDF)                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'assignment_sheets' && (
        <div className="space-y-6">
          {/* KPI Stats (Clean & Professional - NO PRICE) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-medium text-slate-500">Collaborateurs Équipés</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{sheetStats.total}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-medium text-slate-500">Postes Fixes (Desktops)</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{sheetStats.desktops}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-medium text-slate-500">Claviers & Souris Conformes</p>
              <p className="text-xl font-bold text-slate-900 mt-1">100% (13/13)</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-medium text-slate-500">Fiches Prêtes à Imprimer</p>
              <p className="text-xl font-bold text-slate-900 mt-1">100% ({sheetStats.total}/{sheetStats.total})</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="sm:col-span-2 relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, matricule, référence de fiche, PC, numéro de série, écran..."
                  value={sheetSearch}
                  onChange={(e) => {
                    setSheetSearch(e.target.value);
                    setSheetPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                />
              </div>

              {/* Company Filter */}
              <div>
                <select
                  value={sheetCompanyFilter}
                  onChange={(e) => {
                    setSheetCompanyFilter(e.target.value);
                    setSheetPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all cursor-pointer"
                >
                  <option value="all">Toutes les Entreprises</option>
                  <option value="Lebrun S.A.">Lebrun S.A.</option>
                  <option value="Caribe Motors">Caribe Motors</option>
                  <option value="Autobiz">Autobiz</option>
                  <option value="Leader Foods">Leader Foods</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Table: Exact columns as requested (NO PRICE) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    {/* Première colonne: Nom de la personne & Coordonnées */}
                    <th className="py-3 px-3.5" style={{ width: '26%' }}>
                      Nom de la personne & Coordonnées
                    </th>
                    {/* Équipements assignés avec détails complets (clavier, souris, écran, PC) */}
                    <th className="py-3 px-3.5" style={{ width: '44%' }}>
                      Équipements Assignés (Détails Complets)
                    </th>
                    {/* Statut Fiche & Visas */}
                    <th className="py-3 px-3.5 text-center" style={{ width: '18%' }}>
                      Statut Fiche
                    </th>
                    {/* Actions / Téléchargement & Impression PDF */}
                    <th className="py-3 px-3.5 text-right" style={{ width: '15%' }}>
                      Fiches PDF & Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400">
                        <p className="text-sm font-semibold text-slate-600">Aucun collaborateur trouvé</p>
                        <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou de filtre.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedEmployees.map((emp, idx) => {
                      const sheet = assignmentSheets.get(emp.id) || getAssignmentSheet(emp);
                      const ws = sheet.employee.workstation;

                      return (
                        <tr key={`${emp.employeeId || emp.id || 'emp'}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                          {/* 1. Nom de la personne dans la première colonne */}
                          <td className="py-3.5 px-3.5 align-top">
                            <div>
                              <div className="font-bold text-slate-900 text-[13px] tracking-tight">
                                {emp.fullName}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] text-slate-600">
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                                  {emp.employeeId}
                                </span>
                                <span>•</span>
                                <span className="font-sans font-medium text-slate-800">{emp.company}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                {emp.site || emp.location || 'Delmas 52'}
                                {emp.department ? ` • ${emp.department}` : ''}
                              </div>
                              {emp.accounts?.windowsUsername && (
                                <div className="mt-1.5 text-[10.5px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
                                  <span className="text-slate-400">Session :</span> <span className="font-mono font-semibold text-slate-800">{emp.accounts.windowsUsername}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 2. Équipement assigné avec détails complets (clavier, souris, écran, PC) */}
                          <td className="py-3.5 px-3.5 align-top">
                            {ws ? (
                              <div className="space-y-2 text-[11.5px]">
                                {/* Ordinateur */}
                                <div className="flex items-start gap-2">
                                  <Laptop className="w-3.5 h-3.5 text-slate-600 mt-0.5 shrink-0" />
                                  <div>
                                    <span className="font-bold text-slate-900">{ws.pcName}</span>
                                    <span className="text-slate-400 mx-1">•</span>
                                    <span className="font-mono text-slate-600">S/N: {ws.pcSerial}</span>
                                    <div className="text-[10.5px] text-slate-500 line-clamp-1">{ws.pcSpecs}</div>
                                  </div>
                                </div>

                                {/* Écran */}
                                <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                                  <Monitor className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                                  <div className="text-[11px]">
                                    <span className="font-medium text-slate-800">{ws.monitorModel}</span>
                                    <span className="text-slate-400 mx-1">•</span>
                                    <span className="font-mono text-slate-500">S/N: {ws.monitorSerial}</span>
                                    {ws.monitorObs && ws.monitorObs !== 'Good' && ws.monitorObs !== 'Conforme' && (
                                      <span className="ml-1.5 text-[10px] text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-300 font-semibold">
                                        {ws.monitorObs}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Clavier & Souris avec détails complets */}
                                <div className="flex items-center gap-3 pt-1 border-t border-slate-100 text-[11px]">
                                  {/* Clavier */}
                                  <div className="flex items-center gap-1.5">
                                    <Keyboard className="w-3 h-3 text-slate-500 shrink-0" />
                                    <span className="text-slate-700">
                                      {ws.keyboard} ({ws.keyboardDetails || 'Alpha-numérique'})
                                    </span>
                                    <span className={`text-[9.5px] font-semibold px-1 rounded ${
                                      ws.keyboardObs?.toLowerCase().includes('deffect')
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}>
                                      {ws.keyboardObs || 'Good'}
                                    </span>
                                  </div>

                                  <span className="text-slate-300">•</span>

                                  {/* Souris */}
                                  <div className="flex items-center gap-1.5">
                                    <Mouse className="w-3 h-3 text-slate-500 shrink-0" />
                                    <span className="text-slate-700">{ws.mouse} ({ws.mouseDetails})</span>
                                    <span className={`text-[9.5px] font-semibold px-1 rounded ${
                                      ws.mouseObs?.toLowerCase().includes('deffect')
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}>
                                      {ws.mouseObs || 'Good'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Aucun équipement principal assigné</span>
                            )}
                          </td>

                          {/* 3. Statut & Visas de signatures (Monochrome & Sobre) */}
                          <td className="py-3.5 px-3.5 align-middle text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border border-slate-700 bg-white text-slate-900 uppercase tracking-wide">
                              Conforme
                            </span>
                            <div className="text-[9px] font-mono text-slate-500 mt-1 break-all leading-tight" title="Référence de la fiche (enregistrée dans la base)">
                              {sheetRefs.get(emp.id)}
                            </div>
                          </td>

                          {/* 4. Actions / Télécharger PDF, Imprimer, Aperçu */}
                          <td className="py-3.5 px-3.5 align-middle text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Direct Download PDF */}
                              <button
                                onClick={() => handleDownloadSingle(emp)}
                                disabled={downloadingId === emp.id}
                                className="h-7 flex items-center gap-1 px-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-[11px] font-bold shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                title="Télécharger directement la fiche PDF"
                              >
                                {downloadingId === emp.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-slate-800" />
                                ) : (
                                  <Download className="w-3 h-3 text-slate-800" />
                                )}
                                <span>PDF</span>
                              </button>

                              {/* Direct Print */}
                              <button
                                onClick={() => {
                                  const s = getAssignmentSheet(emp);
                                  void registerAssignmentSheets([{ emp }]);
                                  printSingleAssignmentSheet(s.employee, s.options);
                                }}
                                className="h-7 flex items-center gap-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                                title="Imprimer la fiche individuelle"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Imprimer</span>
                              </button>

                              {/* Preview Sheet Modal */}
                              <button
                                onClick={() => setSelectedEmpForSheet(emp)}
                                className="h-7 flex items-center gap-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 text-[11px] font-semibold transition-all cursor-pointer"
                                title="Aperçu A4 haute fidélité"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Aperçu</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {renderPagination(
              filteredEmployees.length,
              safeSheetPage,
              sheetTotalPages,
              sheetRowsPerPage,
              setSheetPage,
              setSheetRowsPerPage
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: REGISTRE DES DOCUMENTS & PROCÉDURES                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'repository' && (
        <div className="space-y-6">
          {/* KPI Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-medium text-slate-500">Total Documents</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{documents.length}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-medium text-slate-500">Procédures & Guides</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {documents.filter(d => d.category === 'Procédures & Guides IT').length}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-medium text-slate-500">Fiches d&apos;Affectation</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {documents.filter(d => d.category === 'Fiches d\'Affectation').length}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-medium text-slate-500">Documents Validés</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {documents.filter(d => d.status === 'valide').length}
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher titre, référence, auteur..."
                  value={repoSearch}
                  onChange={(e) => {
                    setRepoSearch(e.target.value);
                    setRepoPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                />
              </div>

              {/* Category Filter */}
              <div className="relative flex items-center">
                <Filter className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setRepoPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                >
                  <option value="all">Toutes les Catégories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Company Filter */}
              <div>
                <select
                  value={selectedCompany}
                  onChange={(e) => {
                    setSelectedCompany(e.target.value);
                    setRepoPage(1);
                  }}
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
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setRepoPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                >
                  <option value="all">Tous les Statuts</option>
                  <option value="valide">Valides / En vigueur</option>
                  <option value="en_revue">En cours de revue</option>
                  <option value="archive">Archivés</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clean Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3.5">Document & Référence</th>
                    <th className="py-3 px-3.5">Catégorie</th>
                    <th className="py-3 px-3.5">Entreprise</th>
                    <th className="py-3 px-3.5">Format & Taille</th>
                    <th className="py-3 px-3.5">Auteur</th>
                    <th className="py-3 px-3.5">Date MAJ</th>
                    <th className="py-3 px-3.5">Statut</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        <p className="text-sm font-semibold text-slate-600">Aucun document trouvé</p>
                        <p className="text-xs text-slate-400 mt-1">Modifiez vos filtres ou ajoutez un nouveau document.</p>
                        <button
                          onClick={() => openDocumentModal()}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Ajouter un document
                        </button>
                      </td>
                    </tr>
                  ) : (
                    paginatedDocuments.map((doc, idx) => (
                      <tr key={`${doc.id || doc.reference || 'doc'}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                        {/* Title & Ref */}
                        <td className="py-3 px-3.5">
                          <div className="max-w-xs">
                            <p className="font-semibold text-slate-900 truncate">
                              {doc.title}
                            </p>
                            <p className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <span>{doc.reference || 'REF-N/A'}</span>
                              {doc.site && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-500">{doc.site}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {doc.category}
                          </span>
                        </td>

                        {/* Company */}
                        <td className="py-3 px-3.5 font-medium text-slate-800 whitespace-nowrap">
                          {doc.company}
                        </td>

                        {/* Format */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {getFormatBadge(doc.fileType)}
                            <span className="text-slate-500 text-[11px] font-mono">
                              {doc.fileSize || '250 KB'}
                            </span>
                          </div>
                        </td>

                        {/* Author */}
                        <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">
                          {doc.author}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {doc.lastUpdated}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              doc.status === 'valide' 
                                ? 'bg-emerald-500' 
                                : doc.status === 'en_revue' 
                                  ? 'bg-amber-500' 
                                  : 'bg-slate-400'
                            }`} />
                            {doc.status === 'valide' 
                              ? 'Valide' 
                              : doc.status === 'en_revue' 
                                ? 'En revue' 
                                : 'Archivé'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDownloadDoc(doc)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Télécharger / Exporter ce document"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openDocumentModal(doc)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Modifier ce document"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(doc)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Supprimer ce document"
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
            {renderPagination(
              filteredDocuments.length,
              safeRepoPage,
              repoTotalPages,
              repoRowsPerPage,
              setRepoPage,
              setRepoRowsPerPage
            )}
          </div>
        </div>
      )}

      {/* Assignment Sheet Preview Modal */}
      {selectedEmpForSheet && (
        <AssignmentSheetModal
          employee={selectedEmpForSheet}
          onClose={() => setSelectedEmpForSheet(null)}
          onNext={handleNextEmployee}
          onPrev={handlePrevEmployee}
          currentIndex={filteredEmployees.findIndex(e => e.id === selectedEmpForSheet.id)}
          totalCount={filteredEmployees.length}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingDoc)}
        onClose={() => setDeletingDoc(null)}
        onConfirm={() => {
          if (deletingDoc) {
            deleteDocument(deletingDoc.id);
            setDeletingDoc(null);
          }
        }}
        title="Supprimer le document"
        message={`Êtes-vous certain de vouloir supprimer le document "${deletingDoc?.title}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
