'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ITAsset,
  TelecomPlan,
  StarlinkKit,
  ElectronicComponent,
  StockMovement,
  AlertItem,
  Employee,
  PrinterAsset,
  NetworkAsset,
  UPSAsset,
  PhoneAsset,
  ApplicationAccount,
  AssetCategory,
  AnyAsset,
  NavigationTab,
  WifiNetwork,
  ToastMessage,
  ITAccount,
  ITRole,
  DocumentItem
} from '@/types/inventory';
export type { NavigationTab, WifiNetwork, ToastMessage, DocumentItem };
import { 
  INITIAL_PRINTERS, 
  INITIAL_IT_ASSETS, 
  INITIAL_EMPLOYEES, 
  INITIAL_PLANS, 
  INITIAL_STARLINK_KITS, 
  INITIAL_ELECTRONICS, 
  INITIAL_MOVEMENTS, 
  INITIAL_ALERTS, 
  INITIAL_NETWORK_ASSETS, 
  INITIAL_UPS_ASSETS, 
  INITIAL_APPLICATIONS,
  INITIAL_WIFI_NETWORKS,
  INITIAL_IT_ACCOUNTS,
  INITIAL_DOCUMENTS
} from '@/data/initialData';
import { supabase } from '@/lib/supabase';
import { downloadExcel, downloadExcelCSV } from '@/lib/exportExcel';
import {
  AssignmentSheetOptions,
  buildAssignmentDocRef,
  downloadSingleAssignmentSheetPDF
} from '@/lib/printAssignmentSheet';
import { buildPhoneDocRef, downloadPhoneSheetPDF, PhoneSheetOptions } from '@/lib/printPhoneSheet';
import { generatePhoneCode } from '@/lib/phones';

// Documents : colonnes ajoutées après coup (site, type, taille, date). Tant que le SQL correspondant
// n'a pas été exécuté dans Supabase, on retente sans elles pour ne jamais bloquer l'enregistrement.
const DOC_EXTRA_COLUMNS = ['site', 'file_type', 'file_size', 'last_updated'];
const isMissingColumnError = (error: { message: string; code?: string } | null) =>
  Boolean(error) && (error!.code === 'PGRST204' || /column/i.test(error!.message));
const withoutDocExtras = (row: Record<string, any>) => {
  const copy = { ...row };
  DOC_EXTRA_COLUMNS.forEach(k => delete copy[k]);
  return copy;
};
const documentToRow = (d: DocumentItem) => ({
  document_id: d.id,
  title: d.title,
  category: d.category,
  reference: d.reference || 'N/A',
  author: d.author || 'Direction IT',
  company: d.company || 'Lebrun S.A.',
  status: d.status || 'valide',
  file_url: d.url || null,
  description: d.description || null,
  site: d.site || null,
  file_type: d.fileType || 'pdf',
  file_size: d.fileSize || null,
  last_updated: d.lastUpdated || null
});
const insertDocumentRows = async (rows: Record<string, any>[]) => {
  let res = await supabase.from('documents').insert(rows);
  if (isMissingColumnError(res.error)) {
    res = await supabase.from('documents').insert(rows.map(withoutDocExtras));
  }
  return res;
};

// Téléphones : conversion ligne Supabase <-> objet applicatif
const mapPhoneRow = (row: any, idx: number): PhoneAsset => ({
  id: row.phone_id ? String(row.phone_id) : `phone-${row.id ?? idx + 1}`,
  assetTag: row.phone_id || `TEL-${String(row.id ?? idx + 1).padStart(3, '0')}`,
  company: row.entreprise || 'Lebrun S.A.',
  site: row.site || '',
  brand: row.marque || '',
  model: row.modele || '',
  imei1: row.imei1 || undefined,
  imei2: row.imei2 || undefined,
  assignedPersonnelId: row.user_id || undefined,
  assignedTo: row.personne || undefined,
  observations: row.observations || '',
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.created_at || new Date().toISOString()
});

const phoneToRow = (p: PhoneAsset) => ({
  phone_id: p.assetTag,
  entreprise: p.company || null,
  site: p.site || null,
  marque: p.brand,
  modele: p.model,
  imei1: p.imei1 || null,
  imei2: p.imei2 || null,
  user_id: p.assignedPersonnelId || null,
  personne: p.assignedTo || null,
  observations: p.observations || null
});

const describePhoneDbError = (error: { message: string; code?: string }) =>
  error.code === 'PGRST205' || /schema cache|does not exist/i.test(error.message)
    ? "La table « phones » n'existe pas encore dans Supabase. Exécutez la section TÉLÉPHONES de supabase_setup.sql dans le SQL Editor."
    : error.message;

// Clé qui relie une fiche du registre documentaire à un téléphone
const phoneSheetUrl = (phone: PhoneAsset) => `phone://${encodeURIComponent(phone.id)}`;

// Clé qui relie une fiche du registre documentaire à un collaborateur et à son poste
const assignmentSheetUrl = (emp: Employee, asset?: ITAsset) =>
  `assignment://${encodeURIComponent(emp.id)}/${asset ? encodeURIComponent(asset.id) : '-'}`;

interface InventoryContextType {
  // State
  itAssets: ITAsset[];
  printers: PrinterAsset[];
  plans: TelecomPlan[];
  starlinkKits: StarlinkKit[];
  electronics: ElectronicComponent[];
  employees: Employee[];
  movements: StockMovement[];
  alerts: AlertItem[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currency: 'EUR' | 'USD';
  setCurrency: (c: 'EUR' | 'USD') => void;
  formatCurrency: (amount: number) => string;

  // Modals
  isQRModalOpen: boolean;
  qrTargetAsset: AnyAsset | null;
  openQRModal: (asset: AnyAsset) => void;
  closeQRModal: () => void;
  isBarcodeModalOpen: boolean;
  openBarcodeModal: (asset: AnyAsset) => void;
  closeBarcodeModal: () => void;
  isBarcodeScannerOpen: boolean;
  openBarcodeScanner: () => void;
  closeBarcodeScanner: () => void;

  // Authentication
  isAuthenticated: boolean;
  currentUser: { name: string; email: string; role: string } | null;
  login: (email: string, password?: string) => boolean;
  logout: () => void;

  isAddModalOpen: boolean;
  editingAsset: AnyAsset | null;
  initialCategoryForModal: AssetCategory;
  openAddModal: (category?: AssetCategory, editItem?: AnyAsset) => void;
  closeAddModal: () => void;

  isEmployeeModalOpen: boolean;
  editingEmployee: Employee | null;
  openEmployeeModal: (emp?: Employee) => void;
  closeEmployeeModal: () => void;

  isSpotlightOpen: boolean;
  setIsSpotlightOpen: (open: boolean) => void;

  // Wi-Fi Posters & Networks
  wifiNetworks: WifiNetwork[];
  addWifiNetwork: (net: Omit<WifiNetwork, 'id'>) => Promise<any>;
  updateWifiNetwork: (id: string, updates: Partial<WifiNetwork>) => Promise<any>;
  deleteWifiNetwork: (id: string) => Promise<any>;
  isWifiPosterModalOpen: boolean;
  openWifiPosterModal: (establishment?: string) => void;
  closeWifiPosterModal: () => void;
  selectedWifiEstablishment: string;
  setSelectedWifiEstablishment: (est: string) => void;

  // Toast Notifications
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  insertSuccess: { id: number } | null;
  showInsertSuccess: (info?: unknown) => void;
  dismissInsertSuccess: () => void;

  // Actions IT
  addITAsset: (asset: Omit<ITAsset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updateITAsset: (id: string, updates: Partial<ITAsset>) => Promise<any>;
  deleteITAsset: (id: string) => Promise<any>;

  // Network, UPS & Applications
  networkAssets: NetworkAsset[];
  upsAssets: UPSAsset[];
  applicationAccounts: ApplicationAccount[];

  // Téléphones / portables (enregistrés dans la table Supabase "phones")
  phones: PhoneAsset[];
  isPhoneModalOpen: boolean;
  editingPhone: PhoneAsset | null;
  openPhoneModal: (phone?: PhoneAsset) => void;
  closePhoneModal: () => void;
  addPhone: (phone: Omit<PhoneAsset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updatePhone: (id: string, updates: Partial<PhoneAsset>) => Promise<any>;
  deletePhone: (id: string) => Promise<any>;
  downloadPhoneSheet: (phone: PhoneAsset) => Promise<void>;

  // Modals & Actions Network
  isNetworkModalOpen: boolean;
  editingNetworkAsset: NetworkAsset | null;
  openNetworkModal: (asset?: NetworkAsset) => void;
  closeNetworkModal: () => void;
  addNetworkAsset: (asset: Omit<NetworkAsset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updateNetworkAsset: (id: string, updates: Partial<NetworkAsset>) => Promise<any>;
  deleteNetworkAsset: (id: string) => Promise<any>;

  // Modals & Actions UPS
  isUPSModalOpen: boolean;
  editingUPSAsset: UPSAsset | null;
  openUPSModal: (asset?: UPSAsset) => void;
  closeUPSModal: () => void;
  addUPSAsset: (asset: Omit<UPSAsset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updateUPSAsset: (id: string, updates: Partial<UPSAsset>) => Promise<any>;
  deleteUPSAsset: (id: string) => Promise<any>;

  // Modals & Actions Applications
  isApplicationModalOpen: boolean;
  editingApplicationAccount: ApplicationAccount | null;
  openApplicationModal: (account?: ApplicationAccount) => void;
  closeApplicationModal: () => void;
  addApplicationAccount: (account: Omit<ApplicationAccount, 'id'>) => Promise<any>;
  updateApplicationAccount: (id: string, updates: Partial<ApplicationAccount>) => Promise<any>;
  deleteApplicationAccount: (id: string) => Promise<any>;

  // Modals & Actions Printers
  isPrinterModalOpen: boolean;
  editingPrinter: PrinterAsset | null;
  openPrinterModal: (printer?: PrinterAsset) => void;
  closePrinterModal: () => void;

  // Actions Printers
  addPrinter: (printer: Omit<PrinterAsset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updatePrinter: (id: string, updates: Partial<PrinterAsset>) => Promise<any>;
  deletePrinter: (id: string) => Promise<any>;

  // Actions Plans
  addPlan: (plan: Omit<TelecomPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlan: (id: string, updates: Partial<TelecomPlan>) => void;
  deletePlan: (id: string) => void;

  // Actions Starlink
  addStarlinkKit: (kit: Omit<StarlinkKit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStarlinkKit: (id: string, updates: Partial<StarlinkKit>) => void;
  deleteStarlinkKit: (id: string) => void;

  // Actions Electronics
  addElectronic: (item: Omit<ElectronicComponent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateElectronic: (id: string, updates: Partial<ElectronicComponent>) => void;
  adjustElectronicStock: (id: string, delta: number) => void;
  deleteElectronic: (id: string) => void;

  // Actions Personnel
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<any>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<any>;
  deleteEmployee: (id: string) => Promise<any>;
  getEmployeeAssignedAssets: (empIdOrName: string) => {
    it: ITAsset[];
    plans: TelecomPlan[];
    starlink: StarlinkKit[];
    totalValue: number;
  };

  // Modals & Actions IT Accounts (Informaticiens)
  itAccounts: ITAccount[];
  isAccountModalOpen: boolean;
  editingAccount: ITAccount | null;
  openAccountModal: (account?: ITAccount) => void;
  closeAccountModal: () => void;
  addITAccount: (account: Omit<ITAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updateITAccount: (id: string, updates: Partial<ITAccount>) => Promise<any>;
  deleteITAccount: (id: string) => Promise<any>;

  // Modals & Actions Documents
  documents: DocumentItem[];
  isDocumentModalOpen: boolean;
  editingDocument: DocumentItem | null;
  openDocumentModal: (doc?: DocumentItem) => void;
  closeDocumentModal: () => void;
  addDocument: (doc: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => Promise<any>;
  deleteDocument: (id: string) => Promise<any>;
  getAssignmentSheet: (emp: Employee, asset?: ITAsset) => {
    employee: Employee;
    options: AssignmentSheetOptions;
    asset?: ITAsset;
    url: string;
    existing?: DocumentItem;
  };
  registerAssignmentSheets: (targets: { emp: Employee; asset?: ITAsset; force?: boolean }[]) => Promise<DocumentItem[]>;
  downloadAssignmentSheet: (emp: Employee) => Promise<void>;

  // Operations
  recordMovement: (mov: Omit<StockMovement, 'id' | 'date'>) => void;
  markAlertRead: (id: string) => void;
  dismissAlert: (id: string) => void;
  exportCSV: (category?: AssetCategory | 'personnel' | 'accounts' | 'documents' | 'applications' | 'network' | 'ups' | 'phones') => void;
  resetToDefaultData: () => void;

  // Aggregated Stats
  stats: {
    totalValue: number;
    totalAssetsCount: number;
    itCount: number;
    plansCount: number;
    starlinkCount: number;
    starlinkOnlineCount: number;
    electronicsCount: number;
    employeesCount: number;
    lowStockCount: number;
    unassignedITCount: number;
    monthlyPlansCost: number;
  };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'USD'>('EUR');
  
  // Modals state
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrTargetAsset, setQrTargetAsset] = useState<AnyAsset | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AnyAsset | null>(null);
  const [initialCategoryForModal, setInitialCategoryForModal] = useState<AssetCategory>('it');

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);

  // Network Modal
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [editingNetworkAsset, setEditingNetworkAsset] = useState<NetworkAsset | null>(null);
  const openNetworkModal = (asset?: NetworkAsset) => {
    setEditingNetworkAsset(asset || null);
    setIsNetworkModalOpen(true);
  };
  const closeNetworkModal = () => {
    setIsNetworkModalOpen(false);
    setEditingNetworkAsset(null);
  };

  // Phone Modal
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<PhoneAsset | null>(null);
  const openPhoneModal = (phone?: PhoneAsset) => {
    setEditingPhone(phone || null);
    setIsPhoneModalOpen(true);
  };
  const closePhoneModal = () => {
    setIsPhoneModalOpen(false);
    setEditingPhone(null);
  };

  // UPS Modal
  const [isUPSModalOpen, setIsUPSModalOpen] = useState(false);
  const [editingUPSAsset, setEditingUPSAsset] = useState<UPSAsset | null>(null);
  const openUPSModal = (asset?: UPSAsset) => {
    setEditingUPSAsset(asset || null);
    setIsUPSModalOpen(true);
  };
  const closeUPSModal = () => {
    setIsUPSModalOpen(false);
    setEditingUPSAsset(null);
  };

  // Application Modal
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [editingApplicationAccount, setEditingApplicationAccount] = useState<ApplicationAccount | null>(null);
  const openApplicationModal = (account?: ApplicationAccount) => {
    setEditingApplicationAccount(account || null);
    setIsApplicationModalOpen(true);
  };
  const closeApplicationModal = () => {
    setIsApplicationModalOpen(false);
    setEditingApplicationAccount(null);
  };

  // Printer Modal
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterAsset | null>(null);
  const openPrinterModal = (printer?: PrinterAsset) => {
    setEditingPrinter(printer || null);
    setIsPrinterModalOpen(true);
  };
  const closePrinterModal = () => {
    setIsPrinterModalOpen(false);
    setEditingPrinter(null);
  };

  // IT Account Modal (Informaticiens)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ITAccount | null>(null);
  const openAccountModal = (account?: ITAccount) => {
    setEditingAccount(account || null);
    setIsAccountModalOpen(true);
  };
  const closeAccountModal = () => {
    setIsAccountModalOpen(false);
    setEditingAccount(null);
  };

  // Documents Modal
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(null);
  const openDocumentModal = (doc?: DocumentItem) => {
    setEditingDocument(doc || null);
    setIsDocumentModalOpen(true);
  };
  const closeDocumentModal = () => {
    setIsDocumentModalOpen(false);
    setEditingDocument(null);
  };

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lebron_auth') === 'true';
    }
    return false;
  });

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_user');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return null;
  });

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lebron_auth');
      localStorage.removeItem('lebron_user');
    }
  };

  // Master data versioning - keeps cache synchronized with Supabase
  const CURRENT_DATA_VERSION = '2026-09-19-v18-supabase-realtime-sync';

  // Tri prioritaire : Tous les comptes Caribe Motors en premier dans la table, puis logique antéchronologique (nouveaux ajouts en tête)
  const sortApplicationAccounts = (items: ApplicationAccount[]): ApplicationAccount[] => {
    return [...items].sort((a, b) => {
      // 1. Tous les comptes Caribe Motors doivent être en premier dans la table
      const isCaribeA = (a.organization || '').toLowerCase().includes('caribe') ||
                        (a.username || '').toLowerCase().includes('caribe') ||
                        (a.applications || '').toLowerCase().includes('dealer');
      const isCaribeB = (b.organization || '').toLowerCase().includes('caribe') ||
                        (b.username || '').toLowerCase().includes('caribe') ||
                        (b.applications || '').toLowerCase().includes('dealer');
      if (isCaribeA && !isCaribeB) return -1;
      if (!isCaribeA && isCaribeB) return 1;

      // 2. Ensuite la logique : nouvel ajout en 1ère position, puis descente
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) return timeB - timeA;

      // 3. Ordre naturel des identifiants (app-1, app-2, ...)
      const idA = String(a.id || '');
      const idB = String(b.id || '');
      return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
    });
  };

  if (typeof window !== 'undefined') {
    const version = localStorage.getItem('lebron_inv_data_version');
    if (version !== CURRENT_DATA_VERSION) {
      localStorage.setItem('lebron_inv_data_version', CURRENT_DATA_VERSION);
    }
  }

  // Entities state with lazy localStorage initialization
  const [employees, setEmployees] = useState<Employee[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_employees');
      if (saved) {
        try { 
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const seen = new Set<string>();
            return parsed
              .map((e: any) => ({
                ...e,
                id: (e.employeeId && String(e.employeeId).startsWith('EMP-')) ? String(e.employeeId) : (e.id || e.employeeId)
              }))
              .filter((e: any) => {
                const k = e.employeeId || e.id;
                if (!k || seen.has(k) || seen.has(e.id)) return false;
                seen.add(k);
                seen.add(e.id);
                return true;
              });
          }
        } catch (e) { console.error(e); }
      }
    }
    return INITIAL_EMPLOYEES;
  });

  const [itAssets, setItAssets] = useState<ITAsset[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_it');
      if (saved) {
        try { 
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) { console.error(e); }
      }
    }
    return INITIAL_IT_ASSETS;
  });

  const [plans, setPlans] = useState<TelecomPlan[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_plans');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_PLANS;
  });

  const [starlinkKits, setStarlinkKits] = useState<StarlinkKit[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_starlink');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_STARLINK_KITS;
  });

  const [electronics, setElectronics] = useState<ElectronicComponent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_electronics');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_ELECTRONICS;
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_movements');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_MOVEMENTS;
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_alerts');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_ALERTS;
  });

  const [networkAssets, setNetworkAssets] = useState<NetworkAsset[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_network');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_NETWORK_ASSETS;
  });

  const [upsAssets, setUpsAssets] = useState<UPSAsset[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_ups');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_UPS_ASSETS;
  });

  const [phones, setPhones] = useState<PhoneAsset[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_phones');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return [];
  });

  const [applicationAccounts, setApplicationAccounts] = useState<ApplicationAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_applications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return sortApplicationAccounts(parsed);
          }
        } catch (e) { console.error(e); }
      }
    }
    return INITIAL_APPLICATIONS;
  });

  const [printers, setPrinters] = useState<PrinterAsset[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_printers');
      if (saved) {
        try { 
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) { console.error(e); }
      }
    }
    return INITIAL_PRINTERS;
  });

  // Wi-Fi Networks state (Real Delmas 52 networks: Tirezone & Autobiz Starlink)
  const [wifiNetworks, setWifiNetworks] = useState<WifiNetwork[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_wifi');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const hasOldMock = parsed.some((p: any) => p.id === 'wifi-1' || p.id === 'wifi-3');
          if (Array.isArray(parsed) && parsed.length > 0 && !hasOldMock) {
            // Auto migrate any Delmas 53 to Delmas 52
            const migrated = parsed.map((p: any) => {
              if (p.establishment === 'Delmas 53' || (p.id && p.id.includes('delmas53')) || (p.establishment && p.establishment.includes('53'))) {
                return {
                  ...p,
                  id: p.id ? p.id.replace(/delmas53/g, 'delmas52') : p.id,
                  establishment: 'Delmas 52',
                  locationDetail: p.locationDetail ? p.locationDetail.replace(/Delmas 53/g, 'Delmas 52') : p.locationDetail,
                  notes: p.notes ? p.notes.replace(/Delmas 53/g, 'Delmas 52') : p.notes,
                  starlinkDetails: p.starlinkDetails ? {
                    ...p.starlinkDetails,
                    dishSerial: p.starlinkDetails.dishSerial ? p.starlinkDetails.dishSerial.replace(/Delmas 53/g, 'Delmas 52') : p.starlinkDetails.dishSerial,
                    terminalId: p.starlinkDetails.terminalId ? p.starlinkDetails.terminalId.replace(/D53/g, 'D52') : p.starlinkDetails.terminalId,
                  } : p.starlinkDetails
                };
              }
              return p;
            });
            localStorage.setItem('lebron_inv_wifi', JSON.stringify(migrated));
            return migrated;
          } else {
            localStorage.setItem('lebron_inv_wifi', JSON.stringify(INITIAL_WIFI_NETWORKS));
          }
        } catch (e) { console.error(e); }
      }
    }
    return INITIAL_WIFI_NETWORKS;
  });

  // IT Accounts state — Supabase est la seule source de vérité
  const [itAccounts, setItAccounts] = useState<ITAccount[]>([]);

  // Chargement depuis Supabase au montage — on efface le cache local périmé
  useEffect(() => {
    // Vider le cache localStorage pour éviter l'affichage des anciennes données codées en dur
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lebron_inv_it_accounts');
      localStorage.removeItem('lebron_deleted_it_accounts');
    }

    supabase
      .from('accounts_view')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('accounts_view load error:', error); return; }
        // Même si 0 résultats : on affiche 0 — jamais de données locales fantômes
        const mapped: ITAccount[] = (data || []).map((r: any) => ({
          id:        r.id,
          userId:    r.user_id,
          username:  r.username   || '',
          fullName:  [r.first_name, r.last_name].filter(Boolean).join(' ') || '',
          firstName: r.first_name || '',
          lastName:  r.last_name  || '',
          email:     r.email      || '',
          role:      'Technicien Support & Maintenance' as const,
          company:   r.company    || 'Lebrun S.A.',
          site:      r.site       || 'Delmas 52',
          poste:     r.poste      || r.department || '',
          status:    r.status === 'Actif' ? 'active' : 'inactive',
          password:  undefined,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
        setItAccounts(mapped);
      });
  }, []);


  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_documents');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (e) { console.error(e); }
      }
    }
    return INITIAL_DOCUMENTS;
  });

  // Toast Notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Wi-Fi Poster Modal state
  const [isWifiPosterModalOpen, setIsWifiPosterModalOpen] = useState(false);
  const [selectedWifiEstablishment, setSelectedWifiEstablishment] = useState('all');

  const openWifiPosterModal = (establishment: string = 'all') => {
    setSelectedWifiEstablishment(establishment);
    setIsWifiPosterModalOpen(true);
  };

  const closeWifiPosterModal = () => {
    setIsWifiPosterModalOpen(false);
  };

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    // Réussite (ajout, modification, suppression, téléchargement, export...) : animation seule,
    // au centre de l'écran, sans texte. Les erreurs, avertissements et infos gardent leur message.
    const isSuccess = toast.type === 'success' && !/^connexion/i.test(toast.title);
    const isEditOrDelete =
      toast.type !== 'error' &&
      !/^erreur/i.test(toast.title) &&
      /(modifi|mis à jour|supprim|retiré)/i.test(toast.title);
    if (isSuccess || isEditOrDelete) {
      showInsertSuccess();
      return;
    }
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastMessage = {
      ...toast,
      id,
      timestamp: Date.now()
    };
    setToasts(prev => [newToast, ...prev]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Confirmation animée après une insertion réussie (voir SuccessAnimation)
  const [insertSuccess, setInsertSuccess] = useState<{ id: number } | null>(null);
  const insertSuccessTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissInsertSuccess = () => {
    if (insertSuccessTimer.current) clearTimeout(insertSuccessTimer.current);
    setInsertSuccess(null);
  };
  // Le texte éventuellement passé n'est pas affiché : l'animation s'affiche seule.
  const showInsertSuccess = (info?: unknown) => {
    void info;
    if (insertSuccessTimer.current) clearTimeout(insertSuccessTimer.current);
    setInsertSuccess({ id: Date.now() });
    insertSuccessTimer.current = setTimeout(() => setInsertSuccess(null), 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addWifiNetwork = async (net: Omit<WifiNetwork, 'id'>) => {
    const newId = `wifi-${Date.now()}`;
    const newNet: WifiNetwork = {
      ...net,
      id: newId
    };

    try {
      const { error } = await supabase.from('wifi_networks').insert({
        wifi_id: newId,
        establishment: net.establishment,
        company: net.company,
        ssid: net.ssid,
        password: net.password || '',
        provider_type: net.providerType,
        frequency_band: net.frequencyBand,
        security: net.security,
        location_detail: net.locationDetail || '',
        is_guest_network: net.isGuestNetwork || false,
        notes: net.notes || '',
        starlink_details: net.starlinkDetails || null
      });

      if (error) {
        showToast({
          title: 'Erreur Base de Données',
          message: `Échec de l'enregistrement du réseau Wi-Fi dans Supabase : ${error.message}`,
          type: 'error'
        });
        return { success: false, error: error.message };
      }

      setWifiNetworks(prev => {
        const next = [newNet, ...prev.filter(w => w.id !== newId)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_wifi', JSON.stringify(next));
        }
        return next;
      });

      showInsertSuccess({
        title: 'Réseau Wi-Fi ajouté avec succès',
        message: `Le réseau ${newNet.ssid} pour ${newNet.establishment} a été créé dans Supabase.`,
        type: 'success'
      });
      return { success: true };
    } catch (err: any) {
      showToast({
        title: 'Erreur Base de Données',
        message: `Erreur lors de l'ajout du réseau Wi-Fi : ${err.message || 'Connexion Supabase impossible'}`,
        type: 'error'
      });
      return { success: false, error: err?.message };
    }
  };

  const updateWifiNetwork = async (id: string, updates: Partial<WifiNetwork>) => {
    try {
      const payload: Record<string, any> = {};
      if (updates.establishment !== undefined) payload.establishment = updates.establishment;
      if (updates.company !== undefined) payload.company = updates.company;
      if (updates.ssid !== undefined) payload.ssid = updates.ssid;
      if (updates.password !== undefined) payload.password = updates.password;
      if (updates.providerType !== undefined) payload.provider_type = updates.providerType;
      if (updates.frequencyBand !== undefined) payload.frequency_band = updates.frequencyBand;
      if (updates.security !== undefined) payload.security = updates.security;
      if (updates.locationDetail !== undefined) payload.location_detail = updates.locationDetail;
      if (updates.isGuestNetwork !== undefined) payload.is_guest_network = updates.isGuestNetwork;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.starlinkDetails !== undefined) payload.starlink_details = updates.starlinkDetails;

      const { error } = await supabase.from('wifi_networks').update(payload).eq('wifi_id', id);

      if (error) {
        showToast({
          title: 'Erreur Base de Données',
          message: `Échec de la mise à jour du réseau Wi-Fi dans Supabase : ${error.message}`,
          type: 'error'
        });
        return { success: false, error: error.message };
      }

      setWifiNetworks(prev => {
        const next = prev.map(item => item.id === id ? { ...item, ...updates } : item);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_wifi', JSON.stringify(next));
        }
        return next;
      });

      showToast({
        title: 'Réseau Wi-Fi Mis à Jour',
        message: 'La configuration Wi-Fi a été enregistrée avec succès dans Supabase.',
        type: 'success'
      });
      return { success: true };
    } catch (err: any) {
      showToast({
        title: 'Erreur Base de Données',
        message: `Erreur lors de la modification du réseau Wi-Fi : ${err.message || 'Connexion Supabase impossible'}`,
        type: 'error'
      });
      return { success: false, error: err?.message };
    }
  };

  const deleteWifiNetwork = async (id: string) => {
    try {
      const { error } = await supabase.from('wifi_networks').delete().eq('wifi_id', id);

      if (error) {
        showToast({
          title: 'Erreur Base de Données',
          message: `Échec de la suppression du réseau Wi-Fi dans Supabase : ${error.message}`,
          type: 'error'
        });
        return { success: false, error: error.message };
      }

      setWifiNetworks(prev => {
        const next = prev.filter(item => item.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_wifi', JSON.stringify(next));
        }
        return next;
      });

      showToast({
        title: 'Réseau Wi-Fi Supprimé',
        message: "Le réseau a été retiré de la base de données Supabase.",
        type: 'warning'
      });
      return { success: true };
    } catch (err: any) {
      showToast({
        title: 'Erreur Base de Données',
        message: `Erreur lors de la suppression du réseau Wi-Fi : ${err.message || 'Connexion Supabase impossible'}`,
        type: 'error'
      });
      return { success: false, error: err?.message };
    }
  };

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_printers', JSON.stringify(printers));
    }
  }, [printers]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_wifi', JSON.stringify(wifiNetworks));
    }
  }, [wifiNetworks]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_employees', JSON.stringify(employees));
    }
  }, [employees]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_it_accounts', JSON.stringify(itAccounts));
    }
  }, [itAccounts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_documents', JSON.stringify(documents));
    }
  }, [documents]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_it', JSON.stringify(itAssets));
    }
  }, [itAssets]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_plans', JSON.stringify(plans));
    }
  }, [plans]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_starlink', JSON.stringify(starlinkKits));
    }
  }, [starlinkKits]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_electronics', JSON.stringify(electronics));
    }
  }, [electronics]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_movements', JSON.stringify(movements));
    }
  }, [movements]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_alerts', JSON.stringify(alerts));
    }
  }, [alerts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_network', JSON.stringify(networkAssets));
    }
  }, [networkAssets]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_ups', JSON.stringify(upsAssets));
    }
  }, [upsAssets]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_applications', JSON.stringify(applicationAccounts));
    }
  }, [applicationAccounts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_phones', JSON.stringify(phones));
    }
  }, [phones]);

  // Authentification — connexion uniquement via email + mot de passe (itAccounts)
  const login = (email: string, password?: string): boolean => {
    const emailQuery = (email || '').trim().toLowerCase();
    if (!emailQuery) return false;

    if (!password || !password.trim()) {
      showToast({
        title: "Mot de passe requis",
        message: "Veuillez saisir votre mot de passe.",
        type: "error"
      });
      return false;
    }

    // Chercher uniquement dans les comptes avec un mot de passe défini (section Comptes)
    const itAcc = itAccounts.find(a =>
      a.email && a.email.toLowerCase() === emailQuery
    );

    if (!itAcc) {
      showToast({
        title: "Accès refusé",
        message: "Aucun compte trouvé pour cette adresse email. Contactez l'administrateur.",
        type: "error"
      });
      return false;
    }

    const expectedPassword = itAcc.password || itAcc.passwordHint;
    if (!expectedPassword) {
      showToast({
        title: "Accès refusé",
        message: "Aucun mot de passe configuré pour ce compte. Contactez l'administrateur.",
        type: "error"
      });
      return false;
    }

    if (password.trim() !== expectedPassword.trim()) {
      showToast({
        title: "Mot de passe incorrect",
        message: "Le mot de passe saisi ne correspond pas. Veuillez réessayer.",
        type: "error"
      });
      return false;
    }

    const user = {
      name: itAcc.fullName,
      email: itAcc.email,
      role: itAcc.poste || itAcc.specialty || itAcc.role
    };
    setIsAuthenticated(true);
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_auth', 'true');
      localStorage.setItem('lebron_user', JSON.stringify(user));
    }
    showToast({
      title: "Connexion réussie",
      message: `Bienvenue, ${itAcc.fullName} !`,
      type: "success"
    });
    return true;
  };


  // Chargement et synchronisation avec Supabase
  const sortByNewest = <T extends { createdAt?: string; id?: string }>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) return timeB - timeA;
      const idA = String(a.id || '');
      const idB = String(b.id || '');
      return idB.localeCompare(idA, undefined, { numeric: true, sensitivity: 'base' });
    });
  };

  // Chargement et synchronisation avec Supabase
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        // 1. Load Printers from Supabase (Newest first)
        const { data: dbPrinters, error: prnErr } = await supabase.from('printers').select('*');
        if (!prnErr && dbPrinters && dbPrinters.length > 0) {
          setPrinters(prev => {
            const mappedFromDb: PrinterAsset[] = dbPrinters.map((r: any, idx: number) => {
              const tag = r.printer_id ? String(r.printer_id) : `PRN-HP-${(r.id || idx + 1).toString().padStart(3, '0')}`;
              const existingLocal = prev.find(p => p.assetTag === tag || p.id === tag);

              return {
                id: tag,
                assetTag: tag,
                company: r.entreprise || existingLocal?.company || 'Lebrun S.A.',
                site: r.site || existingLocal?.site || 'Delmas 52',
                name: r.nom_imprimante || r.nom || existingLocal?.name || 'Hp LaserJet Pro',
                brand: r.marque || existingLocal?.brand || 'HP',
                model: r.modele || existingLocal?.model || '',
                serialNumber: r.numero_serie || existingLocal?.serialNumber || 'N/A',
                ipAddress: r.adresse_ip || existingLocal?.ipAddress || 'N/A',
                type: r.type || existingLocal?.type || 'Multifonction',
                status: r.etat || existingLocal?.status || 'Fonctionnel',
                observations: r.observations || existingLocal?.observations || 'Good',
                createdAt: r.created_at || existingLocal?.createdAt || new Date().toISOString(),
                updatedAt: r.created_at || existingLocal?.updatedAt || new Date().toISOString()
              };
            });

            const localOnly = prev.filter(p => !mappedFromDb.some(dbP => dbP.assetTag === p.assetTag || dbP.id === p.id));
            const seenPrn = new Set<string>();
            const deduplicated = [...localOnly, ...mappedFromDb].filter(p => {
              const k = p.assetTag || p.id;
              if (!k || seenPrn.has(k)) return false;
              seenPrn.add(k);
              return true;
            });
            const merged = sortByNewest(deduplicated);
            if (typeof window !== 'undefined') {
              localStorage.setItem('lebron_inv_printers', JSON.stringify(merged));
            }
            return merged;
          });
        }

        // 2. Load Users / Employees from Supabase (Newest first)
        const { data: dbUsers, error: usrErr } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false, nullsFirst: false });

        if (!usrErr && dbUsers && dbUsers.length > 0) {
          const mappedFromDb: Employee[] = dbUsers.map((r: any, idx: number) => {
            const firstName = r.prenom || '';
            const lastName = r.nom || '';
            const fullName = r.nom_complet || (firstName && lastName ? `${firstName} ${lastName}` : (lastName || firstName || r.username || ''));
            const empId = r.user_id ? String(r.user_id) : (r.username ? `EMP-${r.username.toUpperCase()}` : `EMP-DB-${idx + 1}`);

            return {
              id: empId,
              employeeId: empId,
              fullName: fullName || 'Collaborateur',
              firstName,
              lastName,
              email: (r.email && r.email !== 'NOT' ? r.email : '') || '',
              phone: r.telephone || '',
              company: (r.entreprise as Employee['company']) || 'Lebrun S.A.',
              site: r.site || 'Delmas 52',
              location: r.site || 'Delmas 52',
              department: r.departement || '',
              jobTitle: r.poste || '',
              hireDate: r.created_at ? r.created_at.slice(0, 10) : '2024-01-15',
              status: (r.statut === 'Actif' ? 'active' : r.statut === 'En mission' ? 'on_leave' : r.statut === 'Inactif' ? 'inactive' : 'active') as Employee['status'],
              createdAt: r.created_at || new Date().toISOString(),
              accounts: {
                windowsUsername: r.username || fullName,
                windowsPassword: '1234',
                appUsername: r.username || '',
                appPassword: '',
                applications: 'Microsoft GP',
                organization: r.entreprise || 'Lebrun S.A.'
              }
            };
          });

          // Supabase est la source de vérité — ordre created_at DESC garanti par la requête
          if (typeof window !== 'undefined') {
            localStorage.setItem('lebron_inv_employees', JSON.stringify(mappedFromDb));
          }
          setEmployees(mappedFromDb);
        }


        // 3. Load Network Equipment from Supabase — Supabase fait foi, pas de merge avec le local
        const { data: dbNet, error: netErr } = await supabase.from('network_equipment').select('*');
        if (!netErr && dbNet && dbNet.length > 0) {
          const mappedNet: NetworkAsset[] = dbNet.map((row: any, idx: number) => ({
            id: row.network_equipment_id ? String(row.network_equipment_id) : (row.id ? row.id.toString() : `net-${idx + 1}`),
            assetTag: row.network_equipment_id || `NET-${row.entreprise?.startsWith('Auto') ? 'AUT' : 'LEB'}-${(row.id || idx + 1).toString().padStart(3, '0')}`,
            company: row.entreprise || 'Lebrun S.A.',
            site: row.site || 'Delmas 52',
            deviceType: row.type_equipement_reseau || row.type_equipement || 'Switch Gigabit',
            brand: row.marque || 'TP-Link',
            model: row.modele || '',
            hostname: row.hostname || '',
            serialNumber: row.numero_serie || 'N/A',
            ipAddress: row.adresse_ip || 'N/A',
            macAddress: row.adresse_mac || 'N/A',
            status: row.etat || 'En fonctionnement',
            observations: row.observations || '',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.created_at || new Date().toISOString()
          }));
          // Supabase est la source de vérité — on remplace tout
          if (typeof window !== 'undefined') {
            localStorage.setItem('lebron_inv_network', JSON.stringify(mappedNet));
          }
          setNetworkAssets(mappedNet);
        }


        // 4. Load UPS from Supabase — Supabase fait foi, pas de merge avec le local
        const { data: dbUps, error: upsErr } = await supabase.from('ups').select('*');
        if (!upsErr && dbUps && dbUps.length > 0) {
          const mappedUps: UPSAsset[] = dbUps.map((row: any, idx: number) => ({
            id: row.ups_id ? String(row.ups_id) : (row.id ? row.id.toString() : `ups-${idx + 1}`),
            assetTag: row.ups_id || `UPS-${row.entreprise?.startsWith('Auto') ? 'AUT' : 'LEB'}-${(row.id || idx + 1).toString().padStart(3, '0')}`,
            company: row.entreprise || 'Lebrun S.A.',
            site: row.site || 'Delmas 52',
            name: row.ups || row.nom || `UPS ${idx + 1}`,
            brand: row.marque || 'Forza',
            model: row.modele || '',
            capacity: row.capacite_va || row.capacite || '',
            reference: row.nom_reference || row.reference || row.modele || '',
            status: row.etat || 'En fonctionnement',
            observations: row.observations || '',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.created_at || new Date().toISOString()
          }));
          // Supabase est la source de vérité — on remplace tout
          if (typeof window !== 'undefined') {
            localStorage.setItem('lebron_inv_ups', JSON.stringify(mappedUps));
          }
          setUpsAssets(mappedUps);
        }


        // 4b. Load Phones from Supabase (la base fait foi ; si la table est absente, on garde le cache local)
        const { data: dbPhones, error: phonesErr } = await supabase.from('phones').select('*');
        if (!phonesErr && dbPhones) {
          const mappedPhones: PhoneAsset[] = dbPhones.map((row: any, idx: number) => mapPhoneRow(row, idx));
          setPhones(sortByNewest(mappedPhones));
        } else if (phonesErr) {
          console.warn('Table phones indisponible:', phonesErr.message);
        }

        // 5. Load User Applications from Supabase (Newest first)
        const { data: dbApps, error: appsErr } = await supabase.from('user_applications').select('*').order('app_account_id', { ascending: false });
        if (!appsErr && dbApps && dbApps.length > 0) {
          setApplicationAccounts(prev => {
            const syncedFromDb = dbApps.map((row: any) => {
              const strId = String(row.app_account_id || '');
              const existingAcc = prev.find(initApp => 
                (strId && initApp.id.replace('app-', '') === strId) ||
                (row.username && initApp.username && row.username.toLowerCase() === initApp.username.toLowerCase()) ||
                (row.user_id && initApp.employeeId && row.user_id === initApp.employeeId)
              );

              const matchedEmp = INITIAL_EMPLOYEES.find(e => 
                (row.user_id && (e.employeeId === row.user_id || e.id === row.user_id)) ||
                (row.username && e.accounts?.appUsername && e.accounts.appUsername.toLowerCase() === row.username.toLowerCase())
              );

              const appId = existingAcc?.id || (strId ? `app-${strId}` : `app-${row.username}`);

              const numId = Number(strId);
              let deducedCreated = existingAcc?.createdAt;
              if (!deducedCreated && !isNaN(numId) && numId > 23) {
                deducedCreated = new Date(Date.now() - (1000000 - Math.min(numId, 999999)) * 1000).toISOString();
              }

              return {
                id: appId,
                username: row.username || existingAcc?.username || '',
                lastName: existingAcc?.lastName || matchedEmp?.lastName || '',
                firstName: existingAcc?.firstName || matchedEmp?.firstName || '',
                password: row.password_source || row.password || existingAcc?.password || 'CP@2026',
                applications: row.application || existingAcc?.applications || 'Microsoft GP',
                organization: row.organisation || existingAcc?.organization || (matchedEmp?.company || 'Lebrun S.A.'),
                employeeId: matchedEmp ? matchedEmp.id : (existingAcc?.employeeId || row.user_id),
                windowsUsername: existingAcc?.windowsUsername || matchedEmp?.accounts?.windowsUsername || (matchedEmp ? matchedEmp.fullName : ''),
                windowsPassword: existingAcc?.windowsPassword || matchedEmp?.accounts?.windowsPassword || '1234',
                createdAt: deducedCreated
              };
            });

            const localOnly = prev.filter(localAcc => 
              !dbApps.some((r: any) => 
                String(r.app_account_id) === localAcc.id.replace('app-', '') ||
                (r.username && localAcc.username && r.username.toLowerCase() === localAcc.username.toLowerCase())
              )
            );

            const seenApps = new Set<string>();
            const deduplicated = [...localOnly, ...syncedFromDb].filter(a => {
              const k = a.id || a.username;
              if (!k || seenApps.has(k)) return false;
              seenApps.add(k);
              return true;
            });
            const merged = sortApplicationAccounts(deduplicated);
            if (typeof window !== 'undefined') {
              localStorage.setItem('lebron_inv_applications', JSON.stringify(merged));
            }
            return merged;
          });

          setEmployees(prevEmp => {
            return prevEmp.map(emp => {
              const appRow = dbApps.find((r: any) => 
                (r.user_id && (r.user_id === emp.employeeId || r.user_id === emp.id)) ||
                (r.username && emp.accounts?.appUsername && r.username.toLowerCase() === emp.accounts.appUsername.toLowerCase())
              );
              if (!appRow) return emp;
              return {
                ...emp,
                accounts: {
                  windowsUsername: emp.accounts?.windowsUsername || emp.fullName || emp.firstName,
                  windowsPassword: emp.accounts?.windowsPassword || '1234',
                  appUsername: appRow.username || emp.accounts?.appUsername || '',
                  appPassword: appRow.password_source || emp.accounts?.appPassword || '',
                  applications: appRow.application || emp.accounts?.applications || 'Microsoft GP',
                  organization: appRow.organisation || emp.accounts?.organization || emp.company
                }
              };
            });
          });
        }

        // 6. Load IT Equipment from Supabase (Newest first)
        const { data: dbIT, error: itErr } = await supabase.from('it_equipment').select('*');
        if (!itErr && dbIT && dbIT.length > 0) {
          setItAssets(prev => {
            const mappedFromDb: ITAsset[] = dbIT.map((r: any, idx: number) => {
              const tag = r.equipment_id ? String(r.equipment_id) : `AST-PC-${(r.id || idx + 1).toString().padStart(3, '0')}`;
              const existingLocal = prev.find(a => a.assetTag === tag || a.id === tag);

              const rowPerson = (r.prenom && r.nom) ? `${r.prenom} ${r.nom}` : (r.nom || r.prenom || r.assigne_a);
              const pcSerial = r.numero_serie_pc || r.numero_serie || existingLocal?.serialNumber || 'N/A';
              const pcName = r.nom_pc || r.nom || existingLocal?.name || `Poste ${tag}`;

              return {
                id: tag,
                assetTag: tag,
                name: pcName,
                brand: r.marque || existingLocal?.brand || 'Dell',
                model: r.modele || existingLocal?.model || 'OptiPlex Workstation',
                serialNumber: pcSerial,
                category: 'it' as const,
                subCategory: (r.type_poste?.toLowerCase().includes('laptop') ? 'laptop' : existingLocal?.subCategory || 'desktop') as ITAsset['subCategory'],
                cpu: r.cpu || existingLocal?.cpu || 'Intel Core i5',
                ram: r.ram || existingLocal?.ram || '8 GB RAM',
                storage: r.stockage || existingLocal?.storage || '500 GB SSD',
                assignedTo: rowPerson || existingLocal?.assignedTo,
                assignedPersonnelId: r.user_id || existingLocal?.assignedPersonnelId,
                assignedDepartment: r.departement || existingLocal?.assignedDepartment,
                company: r.entreprise || existingLocal?.company || 'Lebrun S.A.',
                location: r.site || existingLocal?.location || 'Delmas 52',
                status: (r.etat_general === 'En service' || r.statut === 'in_use' ? 'in_use' : r.etat_general === 'Maintenance' || r.statut === 'maintenance' ? 'maintenance' : existingLocal?.status || 'available') as ITAsset['status'],
                notes: r.observations || r.notes || existingLocal?.notes || '',
                purchaseDate: r.created_at ? r.created_at.slice(0, 10) : (existingLocal?.purchaseDate || '2024-01-15'),
                warrantyExpiry: existingLocal?.warrantyExpiry || '2027-01-15',
                purchaseCost: existingLocal?.purchaseCost || 850,
                workstation: {
                  type: r.type_poste?.toLowerCase().includes('laptop') ? 'Laptop' : (existingLocal?.workstation?.type || 'Desktop'),
                  pcName: pcName,
                  pcSerial: pcSerial,
                  pcSpecs: r.details_pc || existingLocal?.workstation?.pcSpecs || '',
                  monitorModel: r.ecran || existingLocal?.workstation?.monitorModel || '',
                  monitorSerial: r.numero_serie_ecran || existingLocal?.workstation?.monitorSerial || '',
                  monitorObs: r.observation_ecran || existingLocal?.workstation?.monitorObs || 'Good',
                  keyboard: r.clavier || existingLocal?.workstation?.keyboard || '',
                  keyboardDetails: r.details_clavier || existingLocal?.workstation?.keyboardDetails || '',
                  keyboardObs: r.observation_clavier || existingLocal?.workstation?.keyboardObs || 'Good',
                  mouse: r.souris || existingLocal?.workstation?.mouse || '',
                  mouseDetails: r.details_souris || existingLocal?.workstation?.mouseDetails || '',
                  mouseObs: r.observation_souris || existingLocal?.workstation?.mouseObs || 'Good',
                  generalState: r.etat_general || existingLocal?.workstation?.generalState || 'Good',
                  observations: r.observations || existingLocal?.workstation?.observations || ''
                },
                createdAt: r.created_at || existingLocal?.createdAt || new Date().toISOString(),
                updatedAt: r.created_at || existingLocal?.updatedAt || new Date().toISOString()
              };
            });

            const localOnly = prev.filter(a => !mappedFromDb.some(dbA => dbA.assetTag === a.assetTag || dbA.id === a.id));
            const seenIT = new Set<string>();
            const deduplicated = [...localOnly, ...mappedFromDb].filter(a => {
              const k = a.assetTag || a.id;
              if (!k || seenIT.has(k)) return false;
              seenIT.add(k);
              return true;
            });
            const merged = sortByNewest(deduplicated);
            if (typeof window !== 'undefined') {
              localStorage.setItem('lebron_inv_it', JSON.stringify(merged));
            }
            return merged;
          });
        }

        // 7. Load Wi-Fi Networks from Supabase (Newest first)
        const { data: dbWifi, error: wifiErr } = await supabase.from('wifi_networks').select('*').order('created_at', { ascending: false });
        if (!wifiErr && dbWifi && dbWifi.length > 0) {
          const mappedWifi: WifiNetwork[] = dbWifi.map((row: any, idx: number) => ({
            id: row.wifi_id || `wifi-${idx + 1}`,
            establishment: row.establishment || 'Delmas 52',
            company: row.company || 'Lebrun S.A.',
            ssid: row.ssid || '',
            password: row.password || '',
            providerType: row.provider_type || 'Fibre Dédiée',
            frequencyBand: row.frequency_band || 'Dual-Band (2.4 / 5 GHz)',
            security: row.security || 'WPA2-Personal',
            locationDetail: row.location_detail || '',
            isGuestNetwork: Boolean(row.is_guest_network),
            notes: row.notes || '',
            starlinkDetails: row.starlink_details || undefined
          }));
          setWifiNetworks(sortByNewest(mappedWifi));
        }

        // 8. Load Documents from Supabase (Newest first)
        const { data: dbDocs, error: docErr } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
        if (!docErr && dbDocs && dbDocs.length > 0) {
          const mappedDocs: DocumentItem[] = dbDocs.map((row: any, idx: number) => ({
            id: row.document_id || `doc-${idx + 1}`,
            title: row.title || '',
            category: row.category || 'Procédures & Guides IT',
            reference: row.reference || '',
            fileType: row.file_type || 'pdf',
            author: row.author || 'Direction IT',
            company: row.company || 'Lebrun S.A.',
            status: row.status || 'valide',
            lastUpdated: row.last_updated || row.created_at || new Date().toISOString().slice(0, 10),
            fileUrl: row.file_url || '',
            url: row.file_url || undefined,
            site: row.site || undefined,
            fileSize: row.file_size || undefined,
            description: row.description || '',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.created_at || new Date().toISOString()
          }));
          setDocuments(prev => {
            const localOnly = prev.filter(d => !mappedDocs.some(dbD => dbD.id === d.id || dbD.reference === d.reference));
            const merged = sortByNewest([...localOnly, ...mappedDocs]);
            if (typeof window !== 'undefined') {
              localStorage.setItem('lebron_inv_documents', JSON.stringify(merged));
            }
            return merged;
          });
        }



      } catch (err) {
        console.error('Erreur synchronisation Supabase:', err);
      }
    }
    loadFromSupabase();
  }, []);

  // Global keybinding for Spotlight Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e && (e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatCurrency = (amount: number) => {
    const rate = currency === 'USD' ? 1.08 : 1.0;
    const converted = amount * rate;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(converted);
  };

  // Modal handlers
  const openQRModal = (asset: AnyAsset) => {
    setQrTargetAsset(asset);
    setIsQRModalOpen(true);
  };

  const closeQRModal = () => {
    setIsQRModalOpen(false);
    setQrTargetAsset(null);
  };

  const openBarcodeScanner = () => setIsBarcodeScannerOpen(true);
  const closeBarcodeScanner = () => setIsBarcodeScannerOpen(false);

  const openAddModal = (category: AssetCategory = 'it', editItem?: AnyAsset) => {
    setInitialCategoryForModal(category);
    setEditingAsset(editItem || null);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingAsset(null);
  };

  const openEmployeeModal = (emp?: Employee) => {
    setEditingEmployee(emp || null);
    setIsEmployeeModalOpen(true);
  };

  const closeEmployeeModal = () => {
    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  // Employee Actions
  const addEmployee = async (emp: Omit<Employee, 'id'>) => {
    const cleanUserId = emp.employeeId || `EMP-LEB-${Math.floor(Math.random() * 900 + 100)}`;
    const cleanUsername = emp.accounts?.appUsername || cleanUserId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanEmail = emp.email || `${cleanUsername}@lebrunsa.com`;

    const parts = (emp.fullName || '').trim().split(/\s+/);
    const prenom = emp.firstName || parts[0] || cleanUsername;
    const nom = emp.lastName || parts.slice(1).join(' ') || prenom;

    const newEmp: Employee = {
      ...emp,
      id: cleanUserId,
      employeeId: cleanUserId,
      firstName: prenom,
      lastName: nom,
      email: cleanEmail,
      createdAt: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase.from('users').insert({
        user_id: cleanUserId,
        username: cleanUsername,
        email: cleanEmail,
        nom: nom,
        prenom: prenom,
        entreprise: emp.company || 'Lebrun S.A.',
        site: emp.site || 'Delmas 52',
        telephone: emp.phone || null,
        departement: emp.department || null,
        poste: emp.jobTitle || null,
        statut: emp.status === 'active' ? 'Actif' : emp.status === 'on_leave' ? 'En mission' : 'Inactif'
      }).select();

      if (error) {
        console.error('Supabase addEmployee insert error:', error);
        showToast({
          title: "Erreur d'enregistrement",
          message: `Collaborateur non enregistré: ${error.message}`,
          type: 'error'
        });
        return { success: false, error: error.message };
      }

      setEmployees(prev => {
        const next = [newEmp, ...prev.filter(e => e.employeeId !== cleanUserId && e.id !== cleanUserId)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_employees', JSON.stringify(next));
        }
        return next;
      });

      showInsertSuccess({
        title: 'Collaborateur ajouté avec succès',
        message: `${newEmp.fullName} (${newEmp.company}) a été ajouté dans la base de données.`,
        type: 'success'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase addEmployee error:', err);
      showToast({
        title: "Erreur d'enregistrement",
        message: err?.message || 'Erreur réseau',
        type: 'error'
      });
      return { success: false, error: err?.message };
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    const targetEmp = employees.find(e => e.id === id || e.employeeId === id);
    const oldFullName = targetEmp?.fullName;
    const oldEmployeeId = targetEmp?.employeeId;

    setEmployees(prev => prev.map(e => (e.id === id || e.employeeId === id) ? { ...e, ...updates } : e));

    showToast({
      title: 'Fiche Collaborateur Modifiée',
      message: `Les informations de ${updates.fullName || targetEmp?.fullName || 'l\'employé'} ont été enregistrées avec succès.`,
      type: 'success'
    });

    // Connect and synchronize in real-time with Poste IT (itAssets), plans, and Starlink
    if (updates.fullName || updates.department !== undefined || updates.site !== undefined || updates.company !== undefined) {
      setItAssets(prev => prev.map(asset => {
        const isAssigned = (asset.assignedPersonnelId && (asset.assignedPersonnelId === id || asset.assignedPersonnelId === oldEmployeeId)) ||
                           (oldFullName && asset.assignedTo?.toLowerCase() === oldFullName.toLowerCase());
        if (isAssigned) {
          return {
            ...asset,
            assignedTo: updates.fullName !== undefined ? updates.fullName : asset.assignedTo,
            assignedDepartment: updates.department !== undefined ? updates.department : asset.assignedDepartment,
            location: updates.site || updates.location || asset.location || '',
            company: updates.company !== undefined ? updates.company : asset.company,
            updatedAt: new Date().toISOString()
          };
        }
        return asset;
      }));

      setPlans(prev => prev.map(plan => {
        const isAssigned = (plan.assignedPersonnelId && (plan.assignedPersonnelId === id || plan.assignedPersonnelId === oldEmployeeId)) ||
                           (oldFullName && plan.assignedTo?.toLowerCase() === oldFullName.toLowerCase());
        if (isAssigned) {
          return {
            ...plan,
            assignedTo: updates.fullName !== undefined ? updates.fullName : plan.assignedTo
          };
        }
        return plan;
      }));

      setStarlinkKits(prev => prev.map(kit => {
        const isAssigned = (kit.assignedPersonnelId && (kit.assignedPersonnelId === id || kit.assignedPersonnelId === oldEmployeeId)) ||
                           (oldFullName && kit.assignedTo?.toLowerCase() === oldFullName.toLowerCase());
        if (isAssigned) {
          return {
            ...kit,
            assignedTo: updates.fullName !== undefined ? updates.fullName : kit.assignedTo
          };
        }
        return kit;
      }));

      // Synchronise le nom, la société et le site sur les téléphones associés
      setPhones(prev => prev.map(ph => {
        const isOwner = (ph.assignedPersonnelId && (ph.assignedPersonnelId === id || ph.assignedPersonnelId === oldEmployeeId)) ||
                        (oldFullName && ph.assignedTo?.toLowerCase() === oldFullName.toLowerCase());
        if (!isOwner) return ph;
        return {
          ...ph,
          assignedTo: updates.fullName !== undefined ? updates.fullName : ph.assignedTo,
          assignedPersonnelId: updates.employeeId !== undefined ? updates.employeeId : ph.assignedPersonnelId,
          company: updates.company !== undefined ? updates.company : ph.company,
          site: updates.site || updates.location || ph.site,
          updatedAt: new Date().toISOString()
        };
      }));
      if (oldEmployeeId) {
        const phonePayload: Record<string, any> = {};
        if (updates.fullName !== undefined) phonePayload.personne = updates.fullName;
        if (updates.employeeId !== undefined) phonePayload.user_id = updates.employeeId;
        if (updates.company !== undefined) phonePayload.entreprise = updates.company;
        if (updates.site !== undefined) phonePayload.site = updates.site;
        if (Object.keys(phonePayload).length > 0) {
          await supabase.from('phones').update(phonePayload).eq('user_id', oldEmployeeId);
        }
      }

      // Synchronize in real-time with application accounts
      setApplicationAccounts(prev => prev.map(acc => {
        const isLinked = (acc.employeeId && (acc.employeeId === id || acc.employeeId === oldEmployeeId)) ||
                         (oldFullName && `${acc.firstName} ${acc.lastName}`.toLowerCase() === oldFullName.toLowerCase());
        if (isLinked) {
          const nameParts = updates.fullName ? updates.fullName.trim().split(' ') : [];
          const newFirstName = updates.firstName !== undefined ? updates.firstName : (nameParts.length > 1 ? nameParts[0] : undefined);
          const newLastName = updates.lastName !== undefined ? updates.lastName : (nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined);

          return {
            ...acc,
            employeeId: id,
            firstName: newFirstName !== undefined ? newFirstName : acc.firstName,
            lastName: newLastName !== undefined ? newLastName : acc.lastName,
            organization: updates.company !== undefined ? updates.company : acc.organization,
            windowsUsername: updates.accounts?.windowsUsername !== undefined ? updates.accounts.windowsUsername : acc.windowsUsername,
            windowsPassword: updates.accounts?.windowsPassword !== undefined ? updates.accounts.windowsPassword : acc.windowsPassword,
            username: updates.accounts?.appUsername !== undefined ? updates.accounts.appUsername : acc.username,
            password: updates.accounts?.appPassword !== undefined ? updates.accounts.appPassword : acc.password,
            applications: updates.accounts?.applications !== undefined ? updates.accounts.applications : acc.applications
          };
        }
        return acc;
      }));
    }

    try {
      const payload: Record<string, any> = {};
      if (updates.lastName !== undefined) payload.nom = updates.lastName;
      if (updates.firstName !== undefined) payload.prenom = updates.firstName;
      if (updates.fullName !== undefined && updates.firstName === undefined && updates.lastName === undefined) {
        const parts = updates.fullName.trim().split(/\s+/);
        payload.prenom = parts[0] || '';
        payload.nom = parts.slice(1).join(' ') || parts[0] || '';
      }
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.phone !== undefined) payload.telephone = updates.phone;
      if (updates.company !== undefined) payload.entreprise = updates.company;
      if (updates.site !== undefined) payload.site = updates.site;
      if (updates.department !== undefined) payload.departement = updates.department;
      if (updates.jobTitle !== undefined) payload.poste = updates.jobTitle;
      if (updates.status !== undefined) {
        payload.statut = updates.status === 'active' ? 'Actif' : updates.status === 'on_leave' ? 'En mission' : 'Inactif';
      }

      const targetEmpId = updates.employeeId || targetEmp?.employeeId || id;
      let updatedInDb = false;

      if (targetEmpId) {
        const { data, error } = await supabase.from('users').update(payload).eq('user_id', targetEmpId).select();
        if (!error && data && data.length > 0) {
          updatedInDb = true;
        }
      }

      if (!updatedInDb && (updates.email || targetEmp?.email)) {
        const targetEmail = updates.email || targetEmp?.email;
        if (targetEmail) {
          const { data, error } = await supabase.from('users').update(payload).eq('email', targetEmail).select();
          if (!error && data && data.length > 0) {
            updatedInDb = true;
          }
        }
      }

      if (!updatedInDb && (updates.fullName || targetEmp?.fullName)) {
        const targetName = updates.fullName || targetEmp?.fullName;
        if (targetName) {
          await supabase.from('users').update(payload).eq('nom_complet', targetName);
        }
      }
    } catch (err) {
      console.warn('Sync Supabase updateEmployee error:', err);
    }
  };

  const deleteEmployee = async (id: string) => {
    const target = employees.find(e => e.id === id || e.employeeId === id);
    const oldFullName = target?.fullName;
    const empMatricule = target?.employeeId || id;

    try {
      if (empMatricule) {
        // 1. Unlink foreign key in it_equipment so foreign key constraint does not block user deletion
        await supabase.from('it_equipment').update({
          user_id: null,
          nom: null,
          prenom: null,
          username: null,
          email: null,
          telephone: null
        }).eq('user_id', empMatricule);

        // 1b. Les téléphones associés restent dans l'inventaire, sans personne
        await supabase.from('phones').update({ user_id: null, personne: null }).eq('user_id', empMatricule);

        // 2. Unlink / delete linked application account
        await supabase.from('user_applications').delete().eq('user_id', empMatricule);

        // 3. Delete user row in users table
        const { error } = await supabase.from('users').delete().eq('user_id', empMatricule);
        if (error) {
          console.error('Supabase deleteEmployee error:', error);
          showToast({
            title: "Erreur de suppression",
            message: `Impossible de supprimer de la base de données: ${error.message}`,
            type: 'error'
          });
          return { success: false, error: error.message };
        }
      }

      setEmployees(prev => {
        const next = prev.filter(e => e.id !== id && e.employeeId !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_employees', JSON.stringify(next));
        }
        return next;
      });

      // Automatically unassign Poste IT assets when employee is removed
      setItAssets(prev => {
        const next = prev.map(asset => {
          const isAssigned = (asset.assignedPersonnelId && (asset.assignedPersonnelId === id || asset.assignedPersonnelId === empMatricule)) ||
                             (oldFullName && asset.assignedTo?.toLowerCase() === oldFullName.toLowerCase());
          if (isAssigned) {
            return {
              ...asset,
              assignedTo: undefined,
              assignedPersonnelId: undefined,
              status: 'available' as const,
              updatedAt: new Date().toISOString()
            };
          }
          return asset;
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_it', JSON.stringify(next));
        }
        return next;
      });

      setPlans(prev => prev.map(plan => {
        const isAssigned = (plan.assignedPersonnelId && (plan.assignedPersonnelId === id || plan.assignedPersonnelId === empMatricule)) ||
                           (oldFullName && plan.assignedTo?.toLowerCase() === oldFullName.toLowerCase());
        if (isAssigned) {
          return { ...plan, assignedTo: undefined, assignedPersonnelId: undefined };
        }
        return plan;
      }));

      setStarlinkKits(prev => prev.map(kit => {
        const isAssigned = (kit.assignedPersonnelId && (kit.assignedPersonnelId === id || kit.assignedPersonnelId === empMatricule)) ||
                           (oldFullName && kit.assignedTo?.toLowerCase() === oldFullName.toLowerCase());
        if (isAssigned) {
          return { ...kit, assignedTo: undefined, assignedPersonnelId: undefined };
        }
        return kit;
      }));

      setPhones(prev => prev.map(ph => {
        const isOwner = (ph.assignedPersonnelId && (ph.assignedPersonnelId === id || ph.assignedPersonnelId === empMatricule)) ||
                        (oldFullName && ph.assignedTo?.toLowerCase() === oldFullName.toLowerCase());
        return isOwner ? { ...ph, assignedTo: undefined, assignedPersonnelId: undefined } : ph;
      }));

      showToast({
        title: 'Collaborateur Supprimé',
        message: `${oldFullName || 'Le collaborateur'} a été retiré de la base de données.`,
        type: 'warning'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase deleteEmployee error:', err);
      return { success: false, error: err?.message };
    }
  };

  const getEmployeeAssignedAssets = (empIdOrName: string) => {
    const emp = employees.find(e => 
      e.id === empIdOrName || 
      e.employeeId === empIdOrName || 
      e.fullName.toLowerCase() === empIdOrName.toLowerCase() ||
      `${e.lastName} ${e.firstName}`.toLowerCase() === empIdOrName.toLowerCase()
    );

    const validIds = new Set<string>([empIdOrName]);
    const validNames = new Set<string>();

    if (emp) {
      validIds.add(emp.id);
      validIds.add(emp.employeeId);
      validNames.add(emp.fullName.toLowerCase());
      if (emp.firstName && emp.lastName) {
        validNames.add(`${emp.lastName} ${emp.firstName}`.toLowerCase());
        validNames.add(`${emp.firstName} ${emp.lastName}`.toLowerCase());
      }
    } else {
      validNames.add(empIdOrName.toLowerCase());
    }

    const it = itAssets.filter(i => 
      (i.assignedPersonnelId && validIds.has(i.assignedPersonnelId)) ||
      (i.assignedTo && (validIds.has(i.assignedTo) || validNames.has(i.assignedTo.toLowerCase()))) ||
      (emp?.workstation?.pcSerial && (i.serialNumber === emp.workstation.pcSerial || i.workstation?.pcSerial === emp.workstation.pcSerial))
    );
    const pl = plans.filter(p => 
      (p.assignedPersonnelId && validIds.has(p.assignedPersonnelId)) ||
      (p.assignedTo && (validIds.has(p.assignedTo) || validNames.has(p.assignedTo.toLowerCase())))
    );
    const sl = starlinkKits.filter(s => 
      (s.assignedPersonnelId && validIds.has(s.assignedPersonnelId)) ||
      (s.assignedTo && (validIds.has(s.assignedTo) || validNames.has(s.assignedTo.toLowerCase())))
    );
    const totalVal = it.reduce((acc, curr) => acc + (curr.purchaseCost || 0), 0);
    return {
      it,
      plans: pl,
      starlink: sl,
      totalValue: totalVal
    };
  };

  // IT Accounts Actions
  const addITAccount = async (account: Omit<ITAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const userId = account.userId;
    if (!userId) {
      showToast({ title: 'Erreur', message: 'Collaborateur introuvable.', type: 'error' });
      return { success: false };
    }
    try {
      const { data, error } = await supabase.rpc('upsert_account', {
        p_user_id:  userId,
        p_password: account.password || '',
      });
      if (error) throw error;

      // La vue renvoie toutes les infos du collaborateur depuis users
      const row = Array.isArray(data) ? data[0] : data;
      const newAcc: ITAccount = {
        id:        row.id,
        userId:    row.user_id,
        username:  row.username   || account.username,
        fullName:  [row.first_name, row.last_name].filter(Boolean).join(' ') || account.fullName,
        firstName: row.first_name || account.firstName,
        lastName:  row.last_name  || account.lastName,
        email:     row.email      || account.email,
        role:      'Technicien Support & Maintenance' as const,
        company:   row.company    || account.company,
        site:      row.site       || account.site,
        poste:     row.poste      || account.poste || '',
        status:    row.status === 'Actif' ? 'active' : 'inactive',
        password:  undefined,   // hash non renvoyé
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      setItAccounts(prev => {
        const next = [newAcc, ...prev.filter(a => a.userId !== userId)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_it_accounts', JSON.stringify(next));
        }
        return next;
      });

      showInsertSuccess();
      return { success: true };
    } catch (err: any) {
      console.error('addITAccount error:', err);
      showToast({ title: "Erreur d'enregistrement", message: err?.message || 'Erreur réseau', type: 'error' });
      return { success: false, error: err?.message };
    }
  };

  const updateITAccount = async (id: string, updates: Partial<ITAccount>) => {
    const target = itAccounts.find(a => a.id === id);
    const userId = updates.userId || target?.userId;
    if (!userId) {
      showToast({ title: 'Erreur', message: 'Compte introuvable.', type: 'error' });
      return { success: false };
    }
    try {
      const { data, error } = await supabase.rpc('upsert_account', {
        p_user_id:  userId,
        p_password: updates.password || '',
      });
      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      const updated: ITAccount = {
        ...target!,
        ...updates,
        id:        row?.id        || id,
        username:  row?.username  || target?.username || '',
        fullName:  row ? [row.first_name, row.last_name].filter(Boolean).join(' ') : (target?.fullName || ''),
        firstName: row?.first_name || target?.firstName || '',
        lastName:  row?.last_name  || target?.lastName  || '',
        email:     row?.email      || target?.email     || '',
        company:   row?.company    || target?.company   || 'Lebrun S.A.',
        site:      row?.site       || target?.site      || 'Delmas 52',
        poste:     row?.poste      || target?.poste     || '',
        status:    row?.status === 'Actif' ? 'active' : 'inactive',
        password:  undefined,
        updatedAt: row?.updated_at || new Date().toISOString(),
      };

      setItAccounts(prev => {
        const next = prev.map(a => a.id === id ? updated : a);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_it_accounts', JSON.stringify(next));
        }
        return next;
      });

      showInsertSuccess();
      return { success: true };
    } catch (err: any) {
      console.error('updateITAccount error:', err);
      showToast({ title: 'Erreur de modification', message: err?.message || 'Erreur réseau', type: 'error' });
      return { success: false, error: err?.message };
    }
  };

  const deleteITAccount = async (id: string) => {
    const target = itAccounts.find(a => a.id === id);
    const userId = target?.userId;
    try {
      if (userId) {
        const { error } = await supabase.rpc('delete_account', { p_user_id: userId });
        if (error) throw error;
      }

      setItAccounts(prev => {
        const next = prev.filter(a => a.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_it_accounts', JSON.stringify(next));
        }
        return next;
      });

      showToast({
        title: 'Compte supprimé',
        message: target ? `${target.fullName} a été retiré des comptes d'accès.` : 'Compte retiré.',
        type: 'info'
      });
      return { success: true };
    } catch (err: any) {
      console.error('deleteITAccount error:', err);
      showToast({ title: 'Erreur de suppression', message: err?.message || 'Erreur réseau', type: 'error' });
      return { success: false, error: err?.message };
    }
  };


  // Documents Actions

  const addDocument = async (doc: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const docId = doc.reference ? `DOC-${doc.reference.replace(/[^a-zA-Z0-9]/g, '')}` : `doc-${Date.now()}`;
    const newDoc: DocumentItem = {
      ...doc,
      id: docId,
      createdAt: now,
      updatedAt: now
    };

    try {
      const { error } = await insertDocumentRows([documentToRow(newDoc)]);

      if (error) {
        console.error('Supabase addDocument error:', error);
        showToast({
          title: "Erreur d'enregistrement",
          message: error.message,
          type: 'error'
        });
        return { success: false, error: error.message };
      }

      setDocuments(prev => {
        const next = [newDoc, ...prev.filter(d => d.id !== docId && d.reference !== newDoc.reference)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_documents', JSON.stringify(next));
        }
        return next;
      });

      showInsertSuccess({
        title: 'Document ajouté avec succès',
        message: `"${newDoc.title}" a été ajouté dans la base de données.`,
        type: 'success'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase addDocument error:', err);
      showToast({
        title: "Erreur d'enregistrement",
        message: err?.message || 'Erreur réseau',
        type: 'error'
      });
      return { success: false, error: err?.message };
    }
  };

  const updateDocument = async (id: string, updates: Partial<DocumentItem>) => {
    try {
      const payload: Record<string, any> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.reference !== undefined) payload.reference = updates.reference;
      if (updates.author !== undefined) payload.author = updates.author;
      if (updates.company !== undefined) payload.company = updates.company;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.url !== undefined) payload.file_url = updates.url;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.site !== undefined) payload.site = updates.site;
      if (updates.fileType !== undefined) payload.file_type = updates.fileType;
      if (updates.fileSize !== undefined) payload.file_size = updates.fileSize;
      if (updates.lastUpdated !== undefined) payload.last_updated = updates.lastUpdated;

      if (Object.keys(payload).length > 0) {
        const { error: updErr } = await supabase.from('documents').update(payload).eq('document_id', id);
        if (isMissingColumnError(updErr)) {
          const slim = withoutDocExtras(payload);
          if (Object.keys(slim).length > 0) await supabase.from('documents').update(slim).eq('document_id', id);
        }
      }

      setDocuments(prev => {
        const updated = prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_documents', JSON.stringify(updated));
        }
        return updated;
      });

      showToast({
        title: 'Document Mis à Jour',
        message: 'Les modifications ont été enregistrées.',
        type: 'info'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase updateDocument error:', err);
      showToast({
        title: "Erreur de modification",
        message: err?.message || 'Erreur réseau',
        type: 'error'
      });
      return { success: false, error: err?.message };
    }
  };

  const deleteDocument = async (id: string) => {
    const target = documents.find(d => d.id === id);

    try {
      await supabase.from('documents').delete().eq('document_id', id);

      setDocuments(prev => {
        const updated = prev.filter(d => d.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_documents', JSON.stringify(updated));
        }
        return updated;
      });

      showToast({
        title: 'Document Supprimé',
        message: target ? `"${target.title}" a été retiré.` : 'Document supprimé.',
        type: 'info'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase deleteDocument error:', err);
      showToast({
        title: "Erreur de suppression",
        message: err?.message || 'Erreur réseau',
        type: 'error'
      });
      return { success: false, error: err?.message };
    }
  };

  // Retrouve un collaborateur à partir de son id, de son matricule ou de son nom complet
  const findEmployee = (personnelId?: string, fullName?: string) =>
    employees.find(e =>
      (personnelId && (e.id === personnelId || e.employeeId === personnelId)) ||
      (fullName && e.fullName.toLowerCase() === fullName.toLowerCase())
    );

  // ---- Fiches d'affectation : chaque référence est enregistrée dans la table `documents` ----
  const pendingSheetRefs = useRef<Set<string>>(new Set());

  // Fiche (collaborateur + poste + options d'émission) ; réutilise la référence déjà enregistrée
  const getAssignmentSheet = useCallback((emp: Employee, assetOverride?: ITAsset) => {
    const asset = assetOverride || itAssets.find(a =>
      (a.assignedPersonnelId && (a.assignedPersonnelId === emp.id || a.assignedPersonnelId === emp.employeeId)) ||
      (a.assignedTo && a.assignedTo.toLowerCase() === emp.fullName.toLowerCase())
    );
    const url = assignmentSheetUrl(emp, asset);
    const existing = documents.find(d => d.url === url);
    const createdAt = existing?.createdAt ? new Date(existing.createdAt) : undefined;
    const options: AssignmentSheetOptions = {
      assetTag: asset?.assetTag,
      date: createdAt && !isNaN(createdAt.getTime()) ? createdAt : undefined,
      reference: existing?.reference || undefined
    };
    return {
      employee: { ...emp, workstation: asset?.workstation || emp.workstation } as Employee,
      options,
      asset,
      url,
      existing
    };
  }, [itAssets, documents]);

  // Enregistre en une seule requête les références manquantes (ou force une nouvelle émission)
  const registerAssignmentSheets = async (
    targets: { emp: Employee; asset?: ITAsset; force?: boolean }[]
  ): Promise<DocumentItem[]> => {
    const now = new Date();
    const fresh: DocumentItem[] = [];

    for (const t of targets) {
      const sheet = getAssignmentSheet(t.emp, t.asset);
      if (sheet.existing && !t.force) continue;

      const reference = buildAssignmentDocRef(sheet.employee, { assetTag: sheet.options.assetTag, date: now });
      if (
        fresh.some(f => f.reference === reference) ||
        documents.some(d => d.reference === reference) ||
        pendingSheetRefs.current.has(reference)
      ) continue;

      const what = sheet.asset ? `poste ${sheet.asset.name} (${sheet.asset.assetTag})` : 'matériel informatique';
      fresh.push({
        id: `DOC-${reference.replace(/[^a-zA-Z0-9]/g, '')}`,
        title: `Fiche d'affectation - ${t.emp.fullName}${sheet.asset ? ` - ${sheet.asset.name}` : ''}`,
        reference,
        category: "Fiches d'Affectation",
        company: t.emp.company || 'Lebrun S.A.',
        site: t.emp.site || t.emp.location,
        fileType: 'pdf',
        author: 'Direction IT',
        lastUpdated: now.toISOString().slice(0, 10),
        description: `Fiche d'affectation du ${what} - ${t.emp.fullName} (${t.emp.employeeId}).`,
        url: sheet.url,
        status: 'valide',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      });
    }

    if (fresh.length === 0) return [];
    fresh.forEach(d => pendingSheetRefs.current.add(d.reference));

    try {
      const { error } = await insertDocumentRows(fresh.map(documentToRow));

      if (error) {
        console.error('Supabase registerAssignmentSheets error:', error);
        showToast({
          title: 'Références non enregistrées',
          message: error.message,
          type: 'error'
        });
        return [];
      }

      setDocuments(prev => {
        const next = [...fresh, ...prev.filter(d => !fresh.some(f => f.id === d.id || f.reference === d.reference))];
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_documents', JSON.stringify(next));
        }
        return next;
      });
      return fresh;
    } catch (err: any) {
      console.error('Sync Supabase registerAssignmentSheets error:', err);
      showToast({
        title: 'Références non enregistrées',
        message: err?.message || 'Erreur réseau',
        type: 'error'
      });
      return [];
    } finally {
      fresh.forEach(d => pendingSheetRefs.current.delete(d.reference));
    }
  };

  // Télécharge la fiche PDF d'un collaborateur (sa référence est enregistrée au préalable)
  const downloadAssignmentSheet = async (emp: Employee) => {
    await registerAssignmentSheets([{ emp }]);
    const sheet = getAssignmentSheet(emp);
    await downloadSingleAssignmentSheetPDF(sheet.employee, sheet.options);
  };

  // Affectation d'un poste IT à un collaborateur : nouvelle fiche enregistrée dans la base
  // (référence recherchable). Le PDF se télécharge à la demande.
  const createAssignmentDocument = async (emp: Employee, asset: ITAsset) => {
    try {
      // La fiche est enregistrée dans Documents ; le PDF se télécharge à la demande
      await registerAssignmentSheets([{ emp, asset, force: true }]);
    } catch (err) {
      console.warn("Création de la fiche d'affectation impossible:", err);
      showToast({
        title: "Fiche d'affectation non générée",
        message: "Le poste est bien affecté, mais la fiche n'a pas pu être créée. Vous pouvez la générer depuis Documents.",
        type: 'warning'
      });
    }
  };

  // IT Actions
  const addITAsset = async (asset: Omit<ITAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAsset: ITAsset = {
      ...asset,
      id: asset.assetTag || `it-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    try {
      const kbStr = newAsset.workstation?.keyboard || newAsset.keyboard || '';
      const kbObsStr = newAsset.workstation?.keyboardObs || newAsset.keyboardObs || 'Good';
      const mStr = newAsset.workstation?.mouse || newAsset.mouse || '';
      const mObsStr = newAsset.workstation?.mouseObs || newAsset.mouseObs || 'Good';
      const monStr = newAsset.workstation?.monitorModel || '';
      const monObsStr = newAsset.workstation?.monitorObs || 'Good';

      const obsCombined = [
        kbObsStr !== 'Good' ? `Clavier: ${kbObsStr}` : '',
        mObsStr !== 'Good' ? `Souris: ${mObsStr}` : '',
        monObsStr !== 'Good' ? `Écran: ${monObsStr}` : '',
        newAsset.notes
      ].filter(Boolean).join(' • ');

      const assignedEmp = employees.find(e => 
        (newAsset.assignedPersonnelId && (e.id === newAsset.assignedPersonnelId || e.employeeId === newAsset.assignedPersonnelId)) ||
        (newAsset.assignedTo && e.fullName.toLowerCase() === newAsset.assignedTo.toLowerCase())
      );

      // Verify that user_id exists in users table to prevent foreign key violation
      const validUserId = assignedEmp?.employeeId && assignedEmp.employeeId.startsWith('EMP-') 
        ? assignedEmp.employeeId 
        : null;

      const specsStr = [newAsset.os, newAsset.cpu, newAsset.ram, newAsset.storage].filter(Boolean).join(' ') || newAsset.workstation?.pcSpecs || '';

      const { data, error } = await supabase.from('it_equipment').insert({
        equipment_id: newAsset.assetTag,
        entreprise: newAsset.company || 'Lebrun S.A.',
        site: newAsset.location || 'Delmas 52',
        type_poste: newAsset.subCategory === 'laptop' ? 'Poste Laptop' : 'Poste Desktop',
        nom_pc: newAsset.name,
        numero_serie_pc: newAsset.serialNumber || 'N/A',
        details_pc: specsStr || 'Windows 11 Pro',
        clavier: newAsset.workstation?.keyboard || newAsset.keyboard || 'N/A',
        details_clavier: newAsset.workstation?.keyboardDetails || 'N/A',
        observation_clavier: kbObsStr,
        souris: newAsset.workstation?.mouse || newAsset.mouse || 'N/A',
        details_souris: newAsset.workstation?.mouseDetails || 'N/A',
        observation_souris: mObsStr,
        ecran: monStr || 'N/A',
        numero_serie_ecran: newAsset.workstation?.monitorSerial || 'N/A',
        observation_ecran: monObsStr,
        etat_general: newAsset.status === 'in_use' ? 'Good' : 'En réserve',
        observations: obsCombined || 'Good',
        user_id: validUserId,
        nom: assignedEmp?.lastName || null,
        prenom: assignedEmp?.firstName || null,
        username: assignedEmp?.accounts?.appUsername || assignedEmp?.fullName || null,
        email: assignedEmp?.email || null,
        telephone: assignedEmp?.phone || null
      }).select();

      if (error) {
        console.error('Supabase addITAsset insert error:', error);
        showToast({
          title: "Erreur d'enregistrement",
          message: `Équipement IT non enregistré: ${error.message}`,
          type: 'error'
        });
        return { success: false, error: error.message };
      }

      setItAssets(prev => {
        const next = [newAsset, ...prev.filter(a => a.assetTag !== newAsset.assetTag && a.id !== newAsset.id)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_it', JSON.stringify(next));
        }
        return next;
      });

      // Connect and synchronize in real-time with employee workstation
      if (newAsset.assignedPersonnelId || newAsset.assignedTo) {
        setEmployees(prev => prev.map(emp => {
          const isTarget = (newAsset.assignedPersonnelId && (emp.id === newAsset.assignedPersonnelId || emp.employeeId === newAsset.assignedPersonnelId)) ||
                           (newAsset.assignedTo && emp.fullName.toLowerCase() === newAsset.assignedTo.toLowerCase());
          if (isTarget) {
            return {
              ...emp,
              workstation: newAsset.workstation || emp.workstation
            };
          }
          return emp;
        }));
      }

      // Record movement
      recordMovement({
        assetId: newAsset.id,
        assetName: newAsset.name,
        assetCategory: 'it',
        actionType: newAsset.status === 'in_use' ? 'check_out' : 'restock',
        targetUser: newAsset.assignedTo,
        employeeId: newAsset.assignedPersonnelId,
        department: newAsset.assignedDepartment,
        performedBy: 'Gestionnaire Matériel Lebronsa',
        notes: `Ajout au catalogue : ${newAsset.assetTag}`
      });

      showInsertSuccess({
        title: 'Poste IT ajouté avec succès',
        message: `${newAsset.name} (${newAsset.assetTag}) a été enregistré avec succès.`,
        type: 'success'
      });

      // Poste remis à un collaborateur : la fiche d'affectation est créée automatiquement
      if (assignedEmp) {
        void createAssignmentDocument(assignedEmp, newAsset);
      }
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase addITAsset error:', err);
      showToast({
        title: "Erreur d'enregistrement",
        message: err?.message || 'Erreur réseau',
        type: 'error'
      });
      return { success: false, error: err?.message };
    }
  };

  const updateITAsset = async (id: string, updates: Partial<ITAsset>) => {
    const targetAsset = itAssets.find(item => item.id === id);
    const oldTag = targetAsset?.assetTag;
    const oldSerial = targetAsset?.serialNumber;

    setItAssets(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));

    showToast({
      title: 'Poste IT Mis à Jour',
      message: 'Les informations du poste ont été enregistrées.',
      type: 'info'
    });

    // Nouvelle affectation à un collaborateur (différent du précédent) : fiche d'affectation automatique
    if (targetAsset && (updates.assignedPersonnelId || updates.assignedTo)) {
      const newAssignee = findEmployee(updates.assignedPersonnelId, updates.assignedTo);
      const previousAssignee = findEmployee(targetAsset.assignedPersonnelId, targetAsset.assignedTo);
      if (newAssignee && newAssignee.id !== previousAssignee?.id) {
        void createAssignmentDocument(newAssignee, { ...targetAsset, ...updates });
      }
    }

    if (updates.workstation || updates.assignedPersonnelId || updates.assignedTo) {
      setEmployees(prev => prev.map(emp => {
        const isTarget = (updates.assignedPersonnelId && (emp.id === updates.assignedPersonnelId || emp.employeeId === updates.assignedPersonnelId)) ||
                         (updates.assignedTo && emp.fullName.toLowerCase() === updates.assignedTo.toLowerCase());
        if (isTarget && updates.workstation) {
          return {
            ...emp,
            workstation: updates.workstation
          };
        }
        return emp;
      }));
    }

    try {
      const payload: Record<string, any> = {};
      if (updates.name !== undefined) payload.nom_pc = updates.name;
      if (updates.serialNumber !== undefined) payload.numero_serie_pc = updates.serialNumber;
      if (updates.company !== undefined) payload.entreprise = updates.company;
      if (updates.location !== undefined) payload.site = updates.location;
      if (updates.subCategory !== undefined) payload.type_poste = updates.subCategory === 'laptop' ? 'Poste Laptop' : 'Poste Desktop';

      const specsStr = [updates.os, updates.cpu, updates.ram, updates.storage].filter(Boolean).join(' ');
      if (specsStr) payload.details_pc = specsStr;

      const kb = updates.workstation?.keyboard || updates.keyboard;
      const kbObs = updates.workstation?.keyboardObs || updates.keyboardObs;
      if (kb) payload.clavier = kb;
      if (kbObs) payload.observation_clavier = kbObs;

      const m = updates.workstation?.mouse || updates.mouse;
      const mObs = updates.workstation?.mouseObs || updates.mouseObs;
      if (m) payload.souris = m;
      if (mObs) payload.observation_souris = mObs;

      if (updates.workstation?.monitorModel) payload.ecran = updates.workstation.monitorModel;
      if (updates.workstation?.monitorSerial) payload.numero_serie_ecran = updates.workstation.monitorSerial;
      if (updates.workstation?.monitorObs) payload.observation_ecran = updates.workstation.monitorObs;

      if (updates.status !== undefined) {
        payload.etat_general = updates.status === 'in_use' ? 'En service' : updates.status === 'maintenance' ? 'Maintenance' : 'En réserve';
      }

      if (updates.notes !== undefined) payload.observations = updates.notes;

      // Assignee sync with it_equipment columns
      if (updates.assignedPersonnelId !== undefined || updates.assignedTo !== undefined) {
        const assignedEmp = employees.find(e => 
          (updates.assignedPersonnelId && (e.id === updates.assignedPersonnelId || e.employeeId === updates.assignedPersonnelId)) ||
          (updates.assignedTo && e.fullName.toLowerCase() === updates.assignedTo.toLowerCase())
        );
        if (assignedEmp) {
          payload.user_id = assignedEmp.employeeId;
          payload.nom = assignedEmp.lastName;
          payload.prenom = assignedEmp.firstName;
          payload.email = assignedEmp.email;
          payload.telephone = assignedEmp.phone;
        } else if (updates.assignedTo === '' || updates.assignedTo === null) {
          payload.user_id = null;
          payload.nom = null;
          payload.prenom = null;
          payload.email = null;
          payload.telephone = null;
        }
      }

      const targetEquipmentId = targetAsset?.assetTag || updates.assetTag || oldTag;
      const targetSerial = targetAsset?.serialNumber || updates.serialNumber || oldSerial;

      if (targetEquipmentId) {
        const { error } = await supabase.from('it_equipment').update(payload).eq('equipment_id', targetEquipmentId);
        if (error && targetSerial) {
          await supabase.from('it_equipment').update(payload).eq('numero_serie_pc', targetSerial);
        }
      } else if (targetSerial) {
        await supabase.from('it_equipment').update(payload).eq('numero_serie_pc', targetSerial);
      }
    } catch (err) {
      console.warn('Sync Supabase updateITAsset error:', err);
    }
  };

  const deleteITAsset = async (id: string) => {
    const target = itAssets.find(item => item.id === id);
    setItAssets(prev => prev.filter(item => item.id !== id));

    showToast({
      title: 'Matériel IT Supprimé',
      message: `L'équipement ${target?.name || ''} (${target?.serialNumber || ''}) a été supprimé de l'inventaire.`,
      type: 'warning'
    });

    try {
      if (target?.assetTag) {
        await supabase.from('it_equipment').delete().eq('equipment_id', target.assetTag);
      } else if (target?.serialNumber) {
        await supabase.from('it_equipment').delete().eq('numero_serie_pc', target.serialNumber);
      }
    } catch (err) {
      console.warn('Sync Supabase deleteITAsset error:', err);
    }
  };

  // Network Actions
  const addNetworkAsset = async (asset: Omit<NetworkAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNet: NetworkAsset = {
      ...asset,
      id: asset.assetTag || `net-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    try {
      const { data, error } = await supabase.from('network_equipment').insert({
        network_equipment_id: asset.assetTag,
        entreprise: asset.company,
        site: asset.site,
        type_equipement_reseau: asset.deviceType,
        marque: asset.brand,
        modele: asset.model,
        hostname: asset.hostname,
        numero_serie: asset.serialNumber,
        adresse_ip: asset.ipAddress,
        adresse_mac: asset.macAddress,
        etat: asset.status,
        observations: asset.observations
      }).select();

      if (error) {
        console.error('Supabase addNetworkAsset insert error:', error);
        showToast({
          title: "Erreur d'enregistrement",
          message: `Équipement réseau non enregistré: ${error.message}`,
          type: 'error'
        });
        return { success: false, error: error.message };
      }

      setNetworkAssets(prev => {
        const next = [newNet, ...prev.filter(n => n.assetTag !== newNet.assetTag && n.id !== newNet.id)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_network', JSON.stringify(next));
        }
        return next;
      });

      showInsertSuccess({
        title: 'Équipement réseau ajouté avec succès',
        message: `${newNet.deviceType} (${newNet.assetTag}) a été enregistré dans la base de données.`,
        type: 'success'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase addNetworkAsset error:', err);
      showToast({
        title: "Erreur d'enregistrement",
        message: err?.message || 'Erreur réseau',
        type: 'error'
      });
      return { success: false, error: err?.message };
    }
  };

  const updateNetworkAsset = async (id: string, updates: Partial<NetworkAsset>) => {
    const target = networkAssets.find(n => n.id === id || n.assetTag === id);
    const targetTag = updates.assetTag || target?.assetTag || id;
    const targetSerial = updates.serialNumber || target?.serialNumber;

    try {
      const payload: Record<string, any> = {};
      if (updates.company !== undefined) payload.entreprise = updates.company;
      if (updates.site !== undefined) payload.site = updates.site;
      if (updates.deviceType !== undefined) payload.type_equipement_reseau = updates.deviceType;
      if (updates.brand !== undefined) payload.marque = updates.brand;
      if (updates.model !== undefined) payload.modele = updates.model;
      if (updates.hostname !== undefined) payload.hostname = updates.hostname;
      if (updates.serialNumber !== undefined) payload.numero_serie = updates.serialNumber;
      if (updates.ipAddress !== undefined) payload.adresse_ip = updates.ipAddress;
      if (updates.macAddress !== undefined) payload.adresse_mac = updates.macAddress;
      if (updates.status !== undefined) payload.etat = updates.status;
      if (updates.observations !== undefined) payload.observations = updates.observations;

      let updated = false;
      if (targetTag) {
        const { data, error } = await supabase.from('network_equipment').update(payload).eq('network_equipment_id', targetTag).select();
        if (!error && data && data.length > 0) updated = true;
      }
      if (!updated && targetSerial && targetSerial !== 'À compléter') {
        await supabase.from('network_equipment').update(payload).eq('numero_serie', targetSerial);
      }

      setNetworkAssets(prev => {
        const next = prev.map(item => (item.id === id || item.assetTag === id) ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_network', JSON.stringify(next));
        }
        return next;
      });

      showToast({
        title: 'Équipement Réseau Modifié',
        message: `${updates.deviceType || target?.deviceType || 'L\'équipement'} a été mis à jour.`,
        type: 'info'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase updateNetworkAsset error:', err);
      return { success: false, error: err?.message };
    }
  };

  const deleteNetworkAsset = async (id: string) => {
    const target = networkAssets.find(n => n.id === id || n.assetTag === id);
    const targetTag = target?.assetTag || id;
    const targetSerial = target?.serialNumber;

    try {
      if (targetTag) {
        const { error } = await supabase.from('network_equipment').delete().eq('network_equipment_id', targetTag);
        if (error && targetSerial && targetSerial !== 'À compléter') {
          await supabase.from('network_equipment').delete().eq('numero_serie', targetSerial);
        }
      } else if (targetSerial && targetSerial !== 'À compléter') {
        await supabase.from('network_equipment').delete().eq('numero_serie', targetSerial);
      }

      setNetworkAssets(prev => {
        const next = prev.filter(item => item.id !== id && item.assetTag !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_network', JSON.stringify(next));
        }
        return next;
      });

      showToast({
        title: 'Équipement Réseau Supprimé',
        message: `${target?.deviceType || 'L\'équipement'} a été retiré de la base de données.`,
        type: 'warning'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase deleteNetworkAsset error:', err);
      return { success: false, error: err?.message };
    }
  };

  // UPS Actions
  const addUPSAsset = async (asset: Omit<UPSAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newUPS: UPSAsset = {
      ...asset,
      id: asset.assetTag || `ups-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    try {
      const { data, error } = await supabase.from('ups').insert({
        ups_id: asset.assetTag,
        entreprise: asset.company,
        site: asset.site,
        ups: asset.name,
        marque: asset.brand,
        modele: asset.model,
        capacite_va: asset.capacity,
        nom_reference: asset.reference,
        etat: asset.status,
        observations: asset.observations
      }).select();

      if (error) {
        console.error('Supabase addUPSAsset insert error:', error);
        showToast({
          title: "Erreur d'enregistrement",
          message: `Onduleur UPS non enregistré: ${error.message}`,
          type: 'error'
        });
        return { success: false, error: error.message };
      }

      setUpsAssets(prev => {
        const next = [newUPS, ...prev.filter(u => u.assetTag !== newUPS.assetTag && u.id !== newUPS.id)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_ups', JSON.stringify(next));
        }
        return next;
      });

      showInsertSuccess({
        title: 'Onduleur ajouté avec succès',
        message: `${newUPS.name} (${newUPS.assetTag}) a été enregistré dans la base de données.`,
        type: 'success'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase addUPSAsset error:', err);
      showToast({
        title: "Erreur d'enregistrement",
        message: err?.message || 'Erreur réseau',
        type: 'error'
      });
      return { success: false, error: err?.message };
    }
  };

  const updateUPSAsset = async (id: string, updates: Partial<UPSAsset>) => {
    const target = upsAssets.find(u => u.id === id || u.assetTag === id);
    const targetTag = updates.assetTag || target?.assetTag || id;
    const targetName = updates.name || target?.name;

    try {
      const payload: Record<string, any> = {};
      if (updates.company !== undefined) payload.entreprise = updates.company;
      if (updates.site !== undefined) payload.site = updates.site;
      if (updates.name !== undefined) payload.ups = updates.name;
      if (updates.brand !== undefined) payload.marque = updates.brand;
      if (updates.model !== undefined) payload.modele = updates.model;
      if (updates.capacity !== undefined) payload.capacite_va = updates.capacity;
      if (updates.reference !== undefined) payload.nom_reference = updates.reference;
      if (updates.status !== undefined) payload.etat = updates.status;
      if (updates.observations !== undefined) payload.observations = updates.observations;

      let updated = false;
      if (targetTag) {
        const { data, error } = await supabase.from('ups').update(payload).eq('ups_id', targetTag).select();
        if (!error && data && data.length > 0) updated = true;
      }
      if (!updated && targetName) {
        await supabase.from('ups').update(payload).eq('ups', targetName);
      }

      setUpsAssets(prev => {
        const next = prev.map(item => (item.id === id || item.assetTag === id) ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_ups', JSON.stringify(next));
        }
        return next;
      });

      showToast({
        title: 'Onduleur UPS Modifié',
        message: `${updates.name || target?.name || 'L\'onduleur'} a été mis à jour.`,
        type: 'info'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase updateUPSAsset error:', err);
      return { success: false, error: err?.message };
    }
  };

  const deleteUPSAsset = async (id: string) => {
    const target = upsAssets.find(u => u.id === id || u.assetTag === id);
    const targetTag = target?.assetTag || id;
    const targetName = target?.name;

    try {
      if (targetTag) {
        const { error } = await supabase.from('ups').delete().eq('ups_id', targetTag);
        if (error && targetName) {
          await supabase.from('ups').delete().eq('ups', targetName);
        }
      } else if (targetName) {
        await supabase.from('ups').delete().eq('ups', targetName);
      }

      setUpsAssets(prev => {
        const next = prev.filter(item => item.id !== id && item.assetTag !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_ups', JSON.stringify(next));
        }
        return next;
      });

      showToast({
        title: 'Onduleur UPS Supprimé',
        message: `${target?.name || 'L\'onduleur'} a été retiré de la base de données.`,
        type: 'warning'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase deleteUPSAsset error:', err);
      return { success: false, error: err?.message };
    }
  };

  // ---- Fiches d'affectation de téléphone : enregistrées dans la table documents ----
  const getPhoneSheet = useCallback((phone: PhoneAsset) => {
    const employee = employees.find(e =>
      (phone.assignedPersonnelId && (e.employeeId === phone.assignedPersonnelId || e.id === phone.assignedPersonnelId)) ||
      (phone.assignedTo && e.fullName.toLowerCase() === phone.assignedTo.toLowerCase())
    );
    const url = phoneSheetUrl(phone);
    const existing = documents.find(d => d.url === url);
    const createdAt = existing?.createdAt ? new Date(existing.createdAt) : undefined;
    const options: PhoneSheetOptions = {
      date: createdAt && !isNaN(createdAt.getTime()) ? createdAt : undefined,
      reference: existing?.reference || undefined
    };
    return { employee, options, url, existing };
  }, [employees, documents]);

  // Enregistre la fiche dans documents (nouvelle émission si force, sinon seulement si elle n'existe pas)
  const registerPhoneSheet = async (phone: PhoneAsset, force = false) => {
    const sheet = getPhoneSheet(phone);
    if (sheet.existing && !force) return;

    const now = new Date();
    const reference = buildPhoneDocRef(phone, { date: now });
    if (documents.some(d => d.reference === reference) || pendingSheetRefs.current.has(reference)) return;

    const owner = sheet.employee;
    const name = owner?.fullName || phone.assignedTo || 'Non attribué';
    const doc: DocumentItem = {
      id: `DOC-${reference.replace(/[^a-zA-Z0-9]/g, '')}`,
      title: `Fiche d'affectation téléphone - ${name} - ${phone.brand} ${phone.model}`,
      reference,
      category: "Fiches d'Affectation",
      company: owner?.company || phone.company || 'Lebrun S.A.',
      site: owner?.site || owner?.location || phone.site,
      fileType: 'pdf',
      author: 'Direction IT',
      lastUpdated: now.toISOString().slice(0, 10),
      description: `Fiche d'affectation du téléphone ${phone.brand} ${phone.model} (${phone.assetTag}) - ${name}${owner ? ` (${owner.employeeId})` : ''}.`,
      url: sheet.url,
      status: 'valide',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    pendingSheetRefs.current.add(reference);
    try {
      const { error } = await insertDocumentRows([documentToRow(doc)]);
      if (error) {
        console.error('Supabase registerPhoneSheet error:', error);
        showToast({ title: 'Référence non enregistrée', message: error.message, type: 'error' });
        return;
      }
      setDocuments(prev => {
        const next = [doc, ...prev.filter(d => d.id !== doc.id && d.reference !== doc.reference)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_documents', JSON.stringify(next));
        }
        return next;
      });
    } finally {
      pendingSheetRefs.current.delete(reference);
    }
  };

  // Télécharge la fiche PDF d'un téléphone attribué (sa référence est enregistrée au préalable)
  const downloadPhoneSheet = async (phone: PhoneAsset) => {
    if (!phone.assignedTo && !phone.assignedPersonnelId) {
      showToast({
        title: 'Aucune personne associée',
        message: "Associez d'abord ce téléphone à un collaborateur pour générer sa fiche d'affectation.",
        type: 'info'
      });
      return;
    }
    await registerPhoneSheet(phone);
    const sheet = getPhoneSheet(phone);
    await downloadPhoneSheetPDF(phone, sheet.employee, sheet.options);
  };

  // Téléphone remis à une personne : nouvelle fiche enregistrée dans documents (PDF à la demande)
  const createPhoneDocument = async (phone: PhoneAsset) => {
    try {
      // La fiche est enregistrée dans Documents ; le PDF se télécharge à la demande
      await registerPhoneSheet(phone, true);
    } catch (err) {
      console.warn("Création de la fiche téléphone impossible:", err);
      showToast({
        title: "Fiche d'affectation non générée",
        message: "Le téléphone est bien enregistré, mais sa fiche n'a pas pu être créée.",
        type: 'warning'
      });
    }
  };

  // Phone Actions (table Supabase "phones")
  const addPhone = async (phone: Omit<PhoneAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    let newPhone: PhoneAsset = {
      ...phone,
      id: phone.assetTag || `phone-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    try {
      let { error } = await supabase.from('phones').insert(phoneToRow(newPhone));

      // Code déjà pris (très improbable) : on en tire un autre automatiquement
      for (let i = 0; i < 3 && error && (error.code === '23505' || /duplicate key/i.test(error.message)); i++) {
        const code = generatePhoneCode(newPhone.company, phones.map(p => p.assetTag));
        newPhone = { ...newPhone, assetTag: code, id: code };
        ({ error } = await supabase.from('phones').insert(phoneToRow(newPhone)));
      }

      if (error) {
        console.error('Supabase addPhone insert error:', error);
        const message = describePhoneDbError(error);
        showToast({
          title: "Erreur d'enregistrement",
          message,
          type: 'error'
        });
        return { success: false, error: message };
      }

      setPhones(prev => {
        const next = [newPhone, ...prev.filter(p => p.id !== newPhone.id && p.assetTag !== newPhone.assetTag)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_phones', JSON.stringify(next));
        }
        return next;
      });

      showInsertSuccess({
        title: 'Téléphone ajouté avec succès',
        message: `${newPhone.brand} ${newPhone.model} (${newPhone.assetTag}) a été enregistré dans la base de données.`,
        type: 'success'
      });

      // Téléphone remis à une personne : sa fiche d'affectation est créée automatiquement
      if (newPhone.assignedPersonnelId || newPhone.assignedTo) {
        void createPhoneDocument(newPhone);
      }
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase addPhone error:', err);
      showToast({
        title: "Erreur d'enregistrement",
        message: err?.message || 'Erreur réseau',
        type: 'error'
      });
      return { success: false, error: err?.message };
    }
  };

  const updatePhone = async (id: string, updates: Partial<PhoneAsset>) => {
    const target = phones.find(p => p.id === id || p.assetTag === id);
    if (!target) return { success: false, error: 'Téléphone introuvable' };
    // Le code est attribué une fois pour toutes : il ne peut pas être modifié
    const merged: PhoneAsset = { ...target, ...updates, assetTag: target.assetTag, id: target.id, updatedAt: new Date().toISOString() };

    try {
      // upsert sur phone_id : met à jour la ligne, ou la crée si elle n'existait que dans le cache local
      const { error } = await supabase.from('phones').upsert(phoneToRow(merged), { onConflict: 'phone_id' });

      if (error) {
        console.error('Supabase updatePhone error:', error);
        const message = describePhoneDbError(error);
        showToast({
          title: 'Erreur de modification',
          message,
          type: 'error'
        });
        return { success: false, error: message };
      }

      setPhones(prev => {
        const next = prev.map(p => (p.id === target.id ? merged : p));
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_phones', JSON.stringify(next));
        }
        return next;
      });

      showToast({
        title: 'Téléphone Modifié',
        message: `${merged.brand} ${merged.model} a été mis à jour.`,
        type: 'info'
      });

      // Nouvelle personne associée : nouvelle fiche d'affectation automatique
      if (merged.assignedPersonnelId && merged.assignedPersonnelId !== target.assignedPersonnelId) {
        void createPhoneDocument(merged);
      }
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase updatePhone error:', err);
      showToast({ title: 'Erreur de modification', message: err?.message || 'Erreur réseau', type: 'error' });
      return { success: false, error: err?.message };
    }
  };

  const deletePhone = async (id: string) => {
    const target = phones.find(p => p.id === id || p.assetTag === id);
    if (!target) return { success: false, error: 'Téléphone introuvable' };

    try {
      const { error } = await supabase.from('phones').delete().eq('phone_id', target.assetTag);
      if (error) {
        console.error('Supabase deletePhone error:', error);
        showToast({
          title: 'Erreur de suppression',
          message: describePhoneDbError(error),
          type: 'error'
        });
        return { success: false, error: error.message };
      }

      setPhones(prev => {
        const next = prev.filter(p => p.id !== target.id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_phones', JSON.stringify(next));
        }
        return next;
      });

      showToast({
        title: 'Téléphone Supprimé',
        message: `${target.brand} ${target.model} a été retiré de la base de données.`,
        type: 'warning'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase deletePhone error:', err);
      showToast({ title: 'Erreur de suppression', message: err?.message || 'Erreur réseau', type: 'error' });
      return { success: false, error: err?.message };
    }
  };

  // Application Accounts Actions
  const addApplicationAccount = async (account: Omit<ApplicationAccount, 'id'>) => {
    const linkedEmp = employees.find(e => 
      (account.employeeId && (e.id === account.employeeId || e.employeeId === account.employeeId)) ||
      (account.username && e.accounts?.appUsername && e.accounts.appUsername.toLowerCase() === account.username.toLowerCase())
    );

    const empMatricule = linkedEmp?.employeeId && linkedEmp.employeeId.startsWith('EMP-') 
      ? linkedEmp.employeeId 
      : (account.employeeId?.startsWith('EMP-') ? account.employeeId : null);

    const nextAppId = String(Date.now().toString().slice(-6));
    const nowIso = new Date().toISOString();
    const newAcc: ApplicationAccount = {
      ...account,
      id: `app-${nextAppId}`,
      createdAt: nowIso
    };

    try {
      const { data, error } = await supabase.from('user_applications').insert({
        app_account_id: nextAppId,
        user_id: empMatricule,
        username: account.username,
        password_source: account.password || '1234',
        application: account.applications || 'Microsoft GP',
        organisation: account.organization || 'Lebrun S.A.'
      }).select();

      if (error) {
        console.error('Supabase addApplicationAccount insert error:', error);
        showToast({
          title: "Erreur d'enregistrement",
          message: `Compte applicatif non enregistré: ${error.message}`,
          type: 'error'
        });
        return { success: false, error: error.message };
      }

      setApplicationAccounts(prev => {
        const next = sortApplicationAccounts([newAcc, ...prev.filter(a => a.id !== newAcc.id && a.username !== newAcc.username)]);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_applications', JSON.stringify(next));
        }
        return next;
      });

      if (linkedEmp) {
        setEmployees(prev => prev.map(emp => {
          if (emp.id === linkedEmp.id || emp.employeeId === linkedEmp.employeeId) {
            return {
              ...emp,
              accounts: {
                ...(emp.accounts || {}),
                windowsUsername: account.windowsUsername || emp.accounts?.windowsUsername || '',
                windowsPassword: account.windowsPassword || emp.accounts?.windowsPassword || '',
                appUsername: account.username,
                appPassword: account.password || '',
                applications: account.applications || emp.accounts?.applications || 'Microsoft GP',
                organization: account.organization || emp.accounts?.organization || emp.company
              }
            };
          }
          return emp;
        }));
      }

      showInsertSuccess({
        title: 'Accès ajouté avec succès',
        message: `Compte ${newAcc.username} rattaché au personnel avec succès.`,
        type: 'success'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase addApplicationAccount error:', err);
      showToast({
        title: "Erreur d'enregistrement",
        message: err?.message || 'Erreur réseau',
        type: 'error'
      });
      return { success: false, error: err?.message };
    }
  };

  const updateApplicationAccount = async (id: string, updates: Partial<ApplicationAccount>) => {
    const target = applicationAccounts.find(item => item.id === id);
    const empId = updates.employeeId || target?.employeeId;

    setApplicationAccounts(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));

    const linkedEmp = employees.find(emp => 
      (empId && (emp.id === empId || emp.employeeId === empId)) ||
      (target?.username && emp.accounts?.appUsername && emp.accounts.appUsername.toLowerCase() === target.username.toLowerCase())
    );

    if (linkedEmp) {
      setEmployees(prev => prev.map(emp => {
        if (emp.id === linkedEmp.id || emp.employeeId === linkedEmp.employeeId) {
          return {
            ...emp,
            accounts: {
              ...(emp.accounts || {}),
              windowsUsername: updates.windowsUsername !== undefined ? updates.windowsUsername : (emp.accounts?.windowsUsername || ''),
              windowsPassword: updates.windowsPassword !== undefined ? updates.windowsPassword : (emp.accounts?.windowsPassword || ''),
              appUsername: updates.username !== undefined ? updates.username : (emp.accounts?.appUsername || ''),
              appPassword: updates.password !== undefined ? updates.password : (emp.accounts?.appPassword || ''),
              applications: updates.applications !== undefined ? updates.applications : (emp.accounts?.applications || 'Microsoft GP'),
              organization: updates.organization !== undefined ? updates.organization : (emp.accounts?.organization || emp.company)
            }
          };
        }
        return emp;
      }));
    }

    showToast({
      title: 'Logiciel & Accès Modifiés',
      message: `Compte ${updates.username || target?.username || ''} : logiciel (${updates.applications || target?.applications || ''}) et accès enregistrés avec succès.`,
      type: 'success'
    });

    try {
      const payload: Record<string, any> = {};
      if (updates.username !== undefined) payload.username = updates.username;
      if (updates.password !== undefined) payload.password_source = updates.password;
      if (updates.applications !== undefined) payload.application = updates.applications;
      if (updates.organization !== undefined) payload.organisation = updates.organization;

      const empMatricule = linkedEmp?.employeeId || (empId?.startsWith('EMP-') ? empId : undefined);
      if (empMatricule) {
        payload.user_id = empMatricule;
      }

      const dbId = id.replace('app-', '');
      let updated = false;

      // Strategy 1: Update by primary key app_account_id
      if (dbId && !isNaN(Number(dbId))) {
        const { data, error } = await supabase
          .from('user_applications')
          .update(payload)
          .eq('app_account_id', dbId)
          .select();
        if (!error && data && data.length > 0) {
          updated = true;
        }
      }

      // Strategy 2: Update by original / previous username
      if (!updated && target?.username) {
        const { data, error } = await supabase
          .from('user_applications')
          .update(payload)
          .ilike('username', target.username)
          .select();
        if (!error && data && data.length > 0) {
          updated = true;
        }
      }

      // Strategy 3: Update by employee matricule
      if (!updated && empMatricule) {
        const { data, error } = await supabase
          .from('user_applications')
          .update(payload)
          .eq('user_id', empMatricule)
          .select();
        if (!error && data && data.length > 0) {
          updated = true;
        }
      }

      // Strategy 4: If not yet in Supabase, insert it
      if (!updated) {
        await supabase.from('user_applications').insert({
          ...payload,
          app_account_id: dbId && !isNaN(Number(dbId)) ? dbId : String(Date.now().toString().slice(-6))
        });
      }

      // Also update username in users table if username was changed
      if (updates.username && empMatricule) {
        await supabase.from('users').update({ username: updates.username }).eq('user_id', empMatricule);
      }
    } catch (err) {
      console.warn('Sync Supabase updateApplicationAccount error:', err);
    }
  };

  const deleteApplicationAccount = async (id: string) => {
    const target = applicationAccounts.find(a => a.id === id);
    const dbId = id.replace('app-', '');

    try {
      if (dbId && !isNaN(Number(dbId))) {
        await supabase.from('user_applications').delete().eq('app_account_id', dbId);
      }
      if (target?.username) {
        await supabase.from('user_applications').delete().ilike('username', target.username);
      }
      if (target?.employeeId && target.employeeId.startsWith('EMP-')) {
        await supabase.from('user_applications').delete().eq('user_id', target.employeeId);
      }

      setApplicationAccounts(prev => {
        const next = prev.filter(item => item.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_applications', JSON.stringify(next));
        }
        return next;
      });

      const linkedEmp = employees.find(e => 
        (target?.employeeId && (e.id === target.employeeId || e.employeeId === target.employeeId)) ||
        (target?.username && e.accounts?.appUsername && e.accounts.appUsername.toLowerCase() === target.username.toLowerCase())
      );

      if (linkedEmp) {
        setEmployees(prev => prev.map(emp => {
          if (emp.id === linkedEmp.id || emp.employeeId === linkedEmp.employeeId) {
            return {
              ...emp,
              accounts: emp.accounts ? {
                ...emp.accounts,
                applications: 'Aucun'
              } : undefined
            };
          }
          return emp;
        }));
      }

      showToast({
        title: 'Compte Applicatif Supprimé',
        message: `L'accès applicatif ${target?.username || ''} a été retiré de la base de données.`,
        type: 'warning'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase deleteApplicationAccount error:', err);
      return { success: false, error: err?.message };
    }
  };

  // Actions Printers
  const addPrinter = async (printer: Omit<PrinterAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPrinter: PrinterAsset = {
      ...printer,
      id: printer.assetTag || `prn-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    try {
      const { data, error } = await supabase.from('printers').insert({
        printer_id: printer.assetTag,
        entreprise: printer.company,
        site: printer.site,
        nom_imprimante: printer.name,
        marque: printer.brand,
        modele: printer.model,
        numero_serie: printer.serialNumber || 'N/A',
        adresse_ip: printer.ipAddress || 'N/A',
        type: printer.type || 'Multifonction',
        etat: printer.status || 'Fonctionnel',
        observations: printer.observations || 'Good'
      }).select();

      if (error) {
        console.error('Supabase addPrinter insert error:', error);
        showToast({
          title: "Erreur d'enregistrement",
          message: `Imprimante non enregistrée: ${error.message}`,
          type: 'error'
        });
        return { success: false, error: error.message };
      }

      setPrinters(prev => {
        const next = [newPrinter, ...prev.filter(p => p.assetTag !== newPrinter.assetTag && p.id !== newPrinter.id)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_printers', JSON.stringify(next));
        }
        return next;
      });

      showInsertSuccess({
        title: 'Imprimante ajoutée avec succès',
        message: `${newPrinter.name} (${newPrinter.assetTag}) a été enregistrée dans la base de données.`,
        type: 'success'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase addPrinter error:', err);
      showToast({
        title: "Erreur d'enregistrement",
        message: err?.message || 'Erreur réseau',
        type: 'error'
      });
      return { success: false, error: err?.message };
    }
  };

  const updatePrinter = async (id: string, updates: Partial<PrinterAsset>) => {
    const target = printers.find(p => p.id === id);
    const targetTag = updates.assetTag || target?.assetTag;
    const targetSerial = updates.serialNumber || target?.serialNumber;

    try {
      const payload: Record<string, any> = {};
      if (updates.company !== undefined) payload.entreprise = updates.company;
      if (updates.site !== undefined) payload.site = updates.site;
      if (updates.name !== undefined) payload.nom_imprimante = updates.name;
      if (updates.brand !== undefined) payload.marque = updates.brand;
      if (updates.model !== undefined) payload.modele = updates.model;
      if (updates.serialNumber !== undefined) payload.numero_serie = updates.serialNumber;
      if (updates.ipAddress !== undefined) payload.adresse_ip = updates.ipAddress;
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.status !== undefined) payload.etat = updates.status;
      if (updates.observations !== undefined) payload.observations = updates.observations;

      if (targetTag) {
        const { error } = await supabase.from('printers').update(payload).eq('printer_id', targetTag);
        if (error && targetSerial) {
          await supabase.from('printers').update(payload).eq('numero_serie', targetSerial);
        }
      } else if (targetSerial) {
        await supabase.from('printers').update(payload).eq('numero_serie', targetSerial);
      }

      setPrinters(prev => {
        const next = prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_printers', JSON.stringify(next));
        }
        return next;
      });

      showToast({
        title: 'Imprimante Modifiée',
        message: `${updates.name || target?.name || 'L\'imprimante'} a été mise à jour avec succès.`,
        type: 'success'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase updatePrinter error:', err);
      return { success: false, error: err?.message };
    }
  };

  const deletePrinter = async (id: string) => {
    const target = printers.find(p => p.id === id);
    const targetTag = target?.assetTag;
    const targetSerial = target?.serialNumber;

    try {
      if (targetTag) {
        const { error } = await supabase.from('printers').delete().eq('printer_id', targetTag);
        if (error && targetSerial) {
          await supabase.from('printers').delete().eq('numero_serie', targetSerial);
        }
      } else if (targetSerial) {
        await supabase.from('printers').delete().eq('numero_serie', targetSerial);
      }

      setPrinters(prev => {
        const next = prev.filter(item => item.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lebron_inv_printers', JSON.stringify(next));
        }
        return next;
      });

      showToast({
        title: 'Imprimante Supprimée',
        message: `${target?.name || 'L\'imprimante'} a été retirée de la base de données.`,
        type: 'warning'
      });
      return { success: true };
    } catch (err: any) {
      console.error('Sync Supabase deletePrinter error:', err);
      return { success: false, error: err?.message };
    }
  };

  // Plans Actions
  const addPlan = (plan: Omit<TelecomPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPlan: TelecomPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setPlans(prev => [newPlan, ...prev]);
  };

  const updatePlan = (id: string, updates: Partial<TelecomPlan>) => {
    setPlans(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(item => item.id !== id));
  };

  // Starlink Actions
  const addStarlinkKit = (kit: Omit<StarlinkKit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newKit: StarlinkKit = {
      ...kit,
      id: `slk-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setStarlinkKits(prev => [newKit, ...prev]);
  };

  const updateStarlinkKit = (id: string, updates: Partial<StarlinkKit>) => {
    setStarlinkKits(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));
  };

  const deleteStarlinkKit = (id: string) => {
    setStarlinkKits(prev => prev.filter(item => item.id !== id));
  };

  // Electronics Actions
  const addElectronic = (item: Omit<ElectronicComponent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newItem: ElectronicComponent = {
      ...item,
      id: `elec-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setElectronics(prev => [newItem, ...prev]);
  };

  const updateElectronic = (id: string, updates: Partial<ElectronicComponent>) => {
    setElectronics(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));
  };

  const adjustElectronicStock = (id: string, delta: number) => {
    setElectronics(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = Math.max(0, item.quantityInStock + delta);
        return {
          ...item,
          quantityInStock: nextQty,
          status: nextQty > 0 ? 'available' : 'retired',
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));
  };

  const deleteElectronic = (id: string) => {
    setElectronics(prev => prev.filter(item => item.id !== id));
  };

  // Operations
  const recordMovement = (mov: Omit<StockMovement, 'id' | 'date'>) => {
    const newMovement: StockMovement = {
      ...mov,
      id: `mov-${Date.now()}`,
      date: new Date().toISOString()
    };
    setMovements(prev => [newMovement, ...prev]);
  };

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const resetToDefaultData = () => {
    setEmployees(INITIAL_EMPLOYEES);
    setItAssets(INITIAL_IT_ASSETS);
    setPrinters(INITIAL_PRINTERS);
    setPlans(INITIAL_PLANS);
    setStarlinkKits(INITIAL_STARLINK_KITS);
    setElectronics(INITIAL_ELECTRONICS);
    setMovements(INITIAL_MOVEMENTS);
    setAlerts(INITIAL_ALERTS);
    localStorage.clear();
  };

  // Export Excel Haute Définition (.xlsx)
  const exportCSV = (cat?: AssetCategory | 'personnel' | 'accounts' | 'documents' | 'applications' | 'network' | 'ups' | 'phones') => {
    const today = new Date().toISOString().slice(0, 10);
    let headers: string[] = [];
    let rows: (string | number | undefined | null)[][] = [];
    let filename = `LebrunSA_Inventaire_${today}.xlsx`;
    let sheetTitle = 'Inventaire';

    if (cat === 'personnel') {
      filename = `LebrunSA_Personnel_${today}.xlsx`;
      sheetTitle = 'Personnel';
      headers = [
        'Matricule',
        'Nom & Prénom',
        'Entreprise',
        'Site / Affectation',
        'Département',
        'Fonction / Poste',
        'Email Professionnel',
        'Téléphone',
        'Statut Collaborateur',
        'Date d\'Embauche',
        'Session Windows',
        'Identifiant Applicatif',
        'Application Métier',
        'Notes & Observations'
      ];
      rows = employees.map(e => [
        e.employeeId,
        e.fullName,
        e.company || 'Lebrun S.A.',
        e.site || e.location || 'Delmas 52',
        e.department || 'Non renseigné',
        e.jobTitle || 'Non renseigné',
        e.email || 'N/A',
        e.phone || 'N/A',
        e.status === 'active' ? 'Actif' : e.status === 'on_leave' ? 'En congé' : 'Inactif',
        e.hireDate || 'N/A',
        e.accounts?.windowsUsername || 'N/A',
        e.accounts?.appUsername || 'N/A',
        e.accounts?.applications || 'N/A',
        e.notes || ''
      ]);
    } else if (cat === 'accounts') {
      filename = `LebrunSA_Comptes_Informaticiens_${today}.xlsx`;
      sheetTitle = 'Informaticiens IT';
      headers = [
        'Nom & Prénom',
        'Identifiant (@username)',
        'Email Professionnel',
        'Rôle & Privilèges IT',
        'Société Rattachée',
        'Site Principal',
        'Téléphone',
        'Spécialité & Compétences IT',
        'Statut du Compte',
        'Date de Création',
        'Notes'
      ];
      rows = itAccounts.map(a => [
        a.fullName,
        `@${a.username}`,
        a.email,
        a.role,
        a.company,
        a.site,
        a.phone || 'N/A',
        a.specialty || 'Général IT',
        a.status === 'active' ? 'Actif' : 'Inactif',
        a.createdAt ? a.createdAt.slice(0, 10) : 'N/A',
        a.notes || ''
      ]);
    } else if (cat === 'documents') {
      filename = `LebrunSA_Registre_Documents_${today}.xlsx`;
      sheetTitle = 'Documents IT';
      headers = [
        'Titre du Document',
        'Référence',
        'Catégorie',
        'Entreprise',
        'Site / Localisation',
        'Format',
        'Taille',
        'Statut',
        'Auteur',
        'Date de Mise à Jour',
        'Description'
      ];
      rows = documents.map(d => [
        d.title,
        d.reference || 'N/A',
        d.category,
        d.company,
        d.site || 'Delmas 52',
        (d.fileType || 'pdf').toUpperCase(),
        d.fileSize || 'N/A',
        d.status === 'valide' ? 'Valide / En vigueur' : d.status === 'en_revue' ? 'En revue' : 'Archivé',
        d.author,
        d.lastUpdated || 'N/A',
        d.description || ''
      ]);
    } else if (cat === 'applications') {
      filename = `LebrunSA_Comptes_Applications_Sessions_${today}.xlsx`;
      sheetTitle = 'Applications';
      headers = [
        'Collaborateur',
        'Matricule',
        'Organisation / Société',
        'Logiciel Métier Autorisé',
        'Session Windows (Username)',
        'Session Windows (Mot de Passe)',
        'Identifiant Logiciel (@username)',
        'Mot de Passe Logiciel',
        'Email Collaborateur'
      ];
      rows = applicationAccounts.map(a => {
        const emp = employees.find(e => e.id === a.employeeId || e.accounts?.appUsername === a.username || e.fullName.toLowerCase() === `${a.firstName} ${a.lastName}`.toLowerCase());
        return [
          emp ? emp.fullName : `${a.firstName} ${a.lastName}`,
          emp?.employeeId || 'N/A',
          a.organization || emp?.company || 'Lebrun S.A.',
          a.applications,
          a.windowsUsername || emp?.accounts?.windowsUsername || 'N/A',
          a.windowsPassword || emp?.accounts?.windowsPassword || 'N/A',
          a.username,
          a.password || 'N/A',
          emp?.email || 'N/A'
        ];
      });
    } else if (cat === 'printers') {
      filename = `LebrunSA_Inventaire_Imprimantes_${today}.xlsx`;
      sheetTitle = 'Imprimantes';
      headers = [
        'Tag Matériel',
        'Nom de l\'Imprimante',
        'Entreprise',
        'Site / Localisation',
        'Marque',
        'Modèle',
        'N° de Série (SN)',
        'Adresse IP',
        'Type d\'Impression',
        'État de Fonctionnement',
        'Observations'
      ];
      rows = printers.map(p => [
        p.assetTag,
        p.name,
        p.company,
        p.site,
        p.brand,
        p.model,
        p.serialNumber,
        p.ipAddress || 'Non assignée',
        p.type,
        p.status,
        p.observations || 'Good'
      ]);
    } else if (cat === 'network') {
      filename = `LebrunSA_Equipements_Reseau_${today}.xlsx`;
      sheetTitle = 'Réseau';
      headers = [
        'Tag Matériel',
        'Entreprise',
        'Site',
        'Type d\'Équipement',
        'Marque',
        'Modèle',
        'N° de Série',
        'Nom d\'Hôte (Hostname)',
        'Adresse IP',
        'Adresse MAC',
        'Statut',
        'Observations'
      ];
      rows = networkAssets.map(n => [
        n.assetTag,
        n.company,
        n.site,
        n.deviceType,
        n.brand,
        n.model,
        n.serialNumber,
        n.hostname || 'N/A',
        n.ipAddress || 'N/A',
        n.macAddress || 'N/A',
        n.status,
        n.observations || 'Opérationnel'
      ]);
    } else if (cat === 'ups') {
      filename = `LebrunSA_Inventaire_Onduleurs_UPS_${today}.xlsx`;
      sheetTitle = 'Onduleurs UPS';
      headers = [
        'Tag Matériel',
        'Entreprise',
        'Site',
        'Désignation',
        'Marque',
        'Modèle',
        'Capacité (VA/W)',
        'Référence / SN',
        'Statut',
        'Observations'
      ];
      rows = upsAssets.map(u => [
        u.assetTag,
        u.company,
        u.site,
        u.name,
        u.brand,
        u.model,
        u.capacity,
        u.reference,
        u.status,
        u.observations || 'Good'
      ]);
    } else if (cat === 'phones') {
      filename = `LebrunSA_Telephones_Portables_${today}.xlsx`;
      sheetTitle = 'Téléphones';
      headers = ['Code', 'Marque', 'Modèle', 'IMEI 1', 'IMEI 2', 'Personne associée', 'Matricule', 'Entreprise', 'Site', 'Observations'];
      rows = phones.map(p => [
        p.assetTag,
        p.brand,
        p.model,
        p.imei1 || '',
        p.imei2 || '',
        p.assignedTo || 'Non attribué',
        p.assignedPersonnelId || '',
        p.company,
        p.site,
        p.observations || ''
      ]);
    } else if (!cat || cat === 'it') {
      filename = `LebrunSA_Postes_IT_Materiel_${today}.xlsx`;
      sheetTitle = 'Postes IT';
      headers = [
        'Tag Matériel',
        'Désignation Poste',
        'Entreprise',
        'Site / Affectation',
        'Format',
        'Marque',
        'Modèle',
        'N° Série (Service Tag)',
        'Système d\'Exploitation (OS)',
        'Processeur (CPU)',
        'Mémoire RAM',
        'Stockage SSD/Disque',
        'Collaborateur Assigné',
        'Département',
        'Écran / Moniteur',
        'État Écran',
        'Clavier Associé',
        'État Clavier',
        'Souris Associée',
        'État Souris',
        'Statut Poste',
        'Valeur d\'Achat (€)',
        'Date Acquisition',
        'Garantie',
        'Notes & Observations'
      ];
      rows = itAssets.map(i => {
        const ws = i.workstation;
        return [
          i.assetTag,
          i.name,
          i.company || 'Lebrun S.A.',
          i.location || 'Delmas 52',
          i.subCategory === 'laptop' ? 'PC Portable' : 'Poste Desktop',
          i.brand || 'Dell',
          i.model || 'OptiPlex Workstation',
          i.serialNumber,
          i.os || 'Windows 11 Pro',
          i.cpu || 'Intel Core i5',
          i.ram || '8 GB RAM',
          i.storage || '500 GB SSD',
          i.assignedTo || 'Non assigné (Réserve)',
          i.assignedDepartment || 'N/A',
          ws?.monitorModel || 'Écran standard',
          ws?.monitorObs || 'Good',
          ws?.keyboard || i.keyboard || 'Clavier Dell câble',
          ws?.keyboardObs || (i as any).keyboardObs || 'Good',
          ws?.mouse || i.mouse || 'Souris Dell',
          ws?.mouseObs || (i as any).mouseObs || 'Good',
          i.status === 'in_use' ? 'En service' : i.status === 'maintenance' ? 'Maintenance' : i.status === 'available' ? 'En réserve' : 'Déclassé',
          i.purchaseCost ? i.purchaseCost.toString() : '0',
          i.purchaseDate || 'N/A',
          i.warrantyExpiry || 'N/A',
          i.notes || ''
        ];
      });
    } else if (cat === 'starlink') {
      filename = `LebrunSA_Flotte_Starlink_${today}.xlsx`;
      sheetTitle = 'Starlink';
      headers = [
        'Tag Matériel',
        'Nom du Kit',
        'N° Série Kit',
        'N° Série Antenne (Dish)',
        'Terminal ID',
        'Modèle',
        'Forfait Satellite',
        'Statut Réseau',
        'Vitesse Down (Mbps)',
        'Vitesse Up (Mbps)',
        'Latence (ms)',
        'Site / Coordonnées',
        'Responsable'
      ];
      rows = starlinkKits.map(s => [
        s.assetTag,
        s.name,
        s.kitNumber,
        s.dishSerial,
        s.terminalId,
        s.tier,
        s.servicePlan,
        s.networkStatus,
        s.downloadSpeedMbps.toString(),
        s.uploadSpeedMbps.toString(),
        s.latencyMs.toString(),
        s.siteName,
        s.assignedTo || 'N/A'
      ]);
    } else if (cat === 'plans') {
      filename = `LebrunSA_Lignes_Telecom_${today}.xlsx`;
      sheetTitle = 'Forfaits Télécom';
      headers = [
        'Tag Matériel',
        'Nom Forfait',
        'Opérateur',
        'Numéro Ligne',
        'Format SIM',
        'Data Limite (Go)',
        'Data Consommée (Go)',
        'Coût Mensuel (€)',
        'Renouvellement',
        'Collaborateur Assigné'
      ];
      rows = plans.map(p => [
        p.assetTag,
        p.name,
        p.operator,
        p.phoneNumber || 'N/A',
        p.simType,
        p.dataLimitGb.toString(),
        p.dataUsedGb.toString(),
        p.monthlyCost.toString(),
        p.renewalDate,
        p.assignedTo || 'N/A'
      ]);
    } else if (cat === 'electronics') {
      filename = `LebrunSA_Composants_Electronique_${today}.xlsx`;
      sheetTitle = 'Électronique';
      headers = [
        'Tag Matériel',
        'Désignation Pièce',
        'Sous-catégorie',
        'Part Number',
        'Fabricant',
        'Quantité en Stock',
        'Seuil Minimum Alerte',
        'Prix Unitaire (€)',
        'Emplacement / Casier'
      ];
      rows = electronics.map(e => [
        e.assetTag,
        e.name,
        e.subCategory,
        e.partNumber,
        e.manufacturer,
        e.quantityInStock.toString(),
        e.minThreshold.toString(),
        e.unitCost.toString(),
        e.storageBin
      ]);
    }

    downloadExcel(filename, headers, rows, sheetTitle);
    showToast({
      title: 'Extraction Excel (.xlsx) Réussie',
      message: `Le classeur ${filename} a été généré avec succès.`,
      type: 'success'
    });
  };

  // Calculated stats
  const stats = useMemo(() => {
    const itValue = itAssets.reduce((acc, curr) => acc + (curr.purchaseCost || 0), 0);
    const elecValue = electronics.reduce((acc, curr) => acc + (curr.unitCost * curr.quantityInStock || 0), 0);
    const starlinkEquipmentEstimatedValue = starlinkKits.length * 2500;
    const totalVal = itValue + elecValue + starlinkEquipmentEstimatedValue;

    const totalCount = itAssets.length + plans.length + starlinkKits.length + electronics.length;
    const onlineStarlinks = starlinkKits.filter(s => s.networkStatus === 'online').length;
    const lowStock = electronics.filter(e => e.quantityInStock <= e.minThreshold).length;
    const unassigned = itAssets.filter(i => i.status === 'available').length;
    const monthlyCost = plans.reduce((acc, p) => acc + (p.monthlyCost || 0), 0) + starlinkKits.reduce((acc, s) => acc + (s.monthlyCost || 0), 0);

    return {
      totalValue: totalVal,
      totalAssetsCount: totalCount,
      itCount: itAssets.length,
      plansCount: plans.length,
      starlinkCount: starlinkKits.length,
      starlinkOnlineCount: onlineStarlinks,
      electronicsCount: electronics.length,
      employeesCount: employees.length,
      lowStockCount: lowStock,
      unassignedITCount: unassigned,
      monthlyPlansCost: monthlyCost
    };
  }, [itAssets, plans, starlinkKits, electronics, employees]);

  return (
    <InventoryContext.Provider
      value={{
        itAssets,
        printers,
        networkAssets,
        upsAssets,
        applicationAccounts,
        plans,
        starlinkKits,
        electronics,
        employees,
        movements,
        alerts,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        currency,
        setCurrency,
        formatCurrency,
        isQRModalOpen,
        qrTargetAsset,
        openQRModal,
        closeQRModal,
        isBarcodeModalOpen: isQRModalOpen,
        openBarcodeModal: openQRModal,
        closeBarcodeModal: closeQRModal,
        isBarcodeScannerOpen,
        openBarcodeScanner,
        closeBarcodeScanner,
        isAuthenticated,
        currentUser,
        login,
        logout,
        isAddModalOpen,
        editingAsset,
        initialCategoryForModal,
        openAddModal,
        closeAddModal,
        isEmployeeModalOpen,
        editingEmployee,
        openEmployeeModal,
        closeEmployeeModal,
        isSpotlightOpen,
        setIsSpotlightOpen,
        isNetworkModalOpen,
        editingNetworkAsset,
        openNetworkModal,
        closeNetworkModal,
        addNetworkAsset,
        updateNetworkAsset,
        deleteNetworkAsset,
        isUPSModalOpen,
        editingUPSAsset,
        openUPSModal,
        closeUPSModal,
        addUPSAsset,
        updateUPSAsset,
        deleteUPSAsset,
        phones,
        isPhoneModalOpen,
        editingPhone,
        openPhoneModal,
        closePhoneModal,
        addPhone,
        updatePhone,
        deletePhone,
        downloadPhoneSheet,
        isApplicationModalOpen,
        editingApplicationAccount,
        openApplicationModal,
        closeApplicationModal,
        addApplicationAccount,
        updateApplicationAccount,
        deleteApplicationAccount,
        isPrinterModalOpen,
        editingPrinter,
        openPrinterModal,
        closePrinterModal,
        addITAsset,
        updateITAsset,
        deleteITAsset,
        addPrinter,
        updatePrinter,
        deletePrinter,
        addPlan,
        updatePlan,
        deletePlan,
        addStarlinkKit,
        updateStarlinkKit,
        deleteStarlinkKit,
        addElectronic,
        updateElectronic,
        adjustElectronicStock,
        deleteElectronic,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployeeAssignedAssets,
        recordMovement,
        markAlertRead,
        dismissAlert,
        exportCSV,
        resetToDefaultData,
        wifiNetworks,
        addWifiNetwork,
        updateWifiNetwork,
        deleteWifiNetwork,
        isWifiPosterModalOpen,
        openWifiPosterModal,
        closeWifiPosterModal,
        selectedWifiEstablishment,
        setSelectedWifiEstablishment,
        toasts,
        showToast,
        dismissToast,
        insertSuccess,
        showInsertSuccess,
        dismissInsertSuccess,
        itAccounts,
        isAccountModalOpen,
        editingAccount,
        openAccountModal,
        closeAccountModal,
        addITAccount,
        updateITAccount,
        deleteITAccount,
        documents,
        isDocumentModalOpen,
        editingDocument,
        openDocumentModal,
        closeDocumentModal,
        addDocument,
        getAssignmentSheet,
        registerAssignmentSheets,
        downloadAssignmentSheet,
        updateDocument,
        deleteDocument,
        stats
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
