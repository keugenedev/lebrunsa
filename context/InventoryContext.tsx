'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  ApplicationAccount,
  AssetCategory,
  AnyAsset,
  NavigationTab,
  WifiNetwork,
  ToastMessage,
  ITAccount,
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
  addWifiNetwork: (net: Omit<WifiNetwork, 'id'>) => void;
  updateWifiNetwork: (id: string, updates: Partial<WifiNetwork>) => void;
  deleteWifiNetwork: (id: string) => void;
  isWifiPosterModalOpen: boolean;
  openWifiPosterModal: (establishment?: string) => void;
  closeWifiPosterModal: () => void;
  selectedWifiEstablishment: string;
  setSelectedWifiEstablishment: (est: string) => void;

  // Toast Notifications
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Actions IT
  addITAsset: (asset: Omit<ITAsset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateITAsset: (id: string, updates: Partial<ITAsset>) => void;
  deleteITAsset: (id: string) => void;

  // Network, UPS & Applications
  networkAssets: NetworkAsset[];
  upsAssets: UPSAsset[];
  applicationAccounts: ApplicationAccount[];

  // Modals & Actions Network
  isNetworkModalOpen: boolean;
  editingNetworkAsset: NetworkAsset | null;
  openNetworkModal: (asset?: NetworkAsset) => void;
  closeNetworkModal: () => void;
  addNetworkAsset: (asset: Omit<NetworkAsset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNetworkAsset: (id: string, updates: Partial<NetworkAsset>) => void;
  deleteNetworkAsset: (id: string) => void;

  // Modals & Actions UPS
  isUPSModalOpen: boolean;
  editingUPSAsset: UPSAsset | null;
  openUPSModal: (asset?: UPSAsset) => void;
  closeUPSModal: () => void;
  addUPSAsset: (asset: Omit<UPSAsset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUPSAsset: (id: string, updates: Partial<UPSAsset>) => void;
  deleteUPSAsset: (id: string) => void;

  // Modals & Actions Applications
  isApplicationModalOpen: boolean;
  editingApplicationAccount: ApplicationAccount | null;
  openApplicationModal: (account?: ApplicationAccount) => void;
  closeApplicationModal: () => void;
  addApplicationAccount: (account: Omit<ApplicationAccount, 'id'>) => void;
  updateApplicationAccount: (id: string, updates: Partial<ApplicationAccount>) => void;
  deleteApplicationAccount: (id: string) => void;

  // Modals & Actions Printers
  isPrinterModalOpen: boolean;
  editingPrinter: PrinterAsset | null;
  openPrinterModal: (printer?: PrinterAsset) => void;
  closePrinterModal: () => void;

  // Actions Printers
  addPrinter: (printer: Omit<PrinterAsset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePrinter: (id: string, updates: Partial<PrinterAsset>) => void;
  deletePrinter: (id: string) => void;

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
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
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
  addITAccount: (account: Omit<ITAccount, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateITAccount: (id: string, updates: Partial<ITAccount>) => void;
  deleteITAccount: (id: string) => void;

  // Modals & Actions Documents
  documents: DocumentItem[];
  isDocumentModalOpen: boolean;
  editingDocument: DocumentItem | null;
  openDocumentModal: (doc?: DocumentItem) => void;
  closeDocumentModal: () => void;
  addDocument: (doc: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;

  // Operations
  recordMovement: (mov: Omit<StockMovement, 'id' | 'date'>) => void;
  markAlertRead: (id: string) => void;
  dismissAlert: (id: string) => void;
  exportCSV: (category?: AssetCategory | 'personnel' | 'accounts' | 'documents' | 'applications' | 'network' | 'ups') => void;
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

  const login = (email: string, _password?: string): boolean => {
    const user = {
      name: email.split('@')[0] || 'Utilisateur',
      email: email,
      role: 'Administrateur Inventaire'
    };
    setIsAuthenticated(true);
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_auth', 'true');
      localStorage.setItem('lebron_user', JSON.stringify(user));
    }
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lebron_auth');
      localStorage.removeItem('lebron_user');
    }
  };

  // Entities state with lazy localStorage initialization
  const [employees, setEmployees] = useState<Employee[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_employees');
      if (saved) {
        try { 
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Respect and preserve all user-entered job positions (jobTitle), departments, workstations, etc.
            const missing = INITIAL_EMPLOYEES.filter(initEmp => !parsed.some((p: any) => p.id === initEmp.id || p.employeeId === initEmp.employeeId));
            return [...parsed, ...missing];
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
          if (Array.isArray(parsed) && parsed.length >= INITIAL_IT_ASSETS.length) {
            return parsed.map((item: any) => {
              const initMatch = INITIAL_IT_ASSETS.find(i => i.id === item.id || i.assetTag === item.assetTag);
              const company = item.company || initMatch?.company || (item.assetTag?.includes('AUT') ? 'Autobiz' : 'Lebrun S.A.');
              const os = item.os || initMatch?.os || (item.notes?.includes('10') ? 'Windows 10 Pro' : 'Windows 11 Pro');
              const workstation = item.workstation || initMatch?.workstation;
              const isUserAsset = item.assignedPersonnelId === 'emp-14' || item.assignedTo?.toLowerCase().includes('kensly');
              const assignedDepartment = isUserAsset 
                ? (item.assignedDepartment || 'Informatique & Systèmes (IT)') 
                : '';
              const keyboard = item.keyboard || item.clavier || workstation?.keyboard;
              const keyboardObs = item.keyboardObs || workstation?.keyboardObs || 'Good';
              const mouse = item.mouse || item.souris || workstation?.mouse;
              const mouseObs = item.mouseObs || workstation?.mouseObs || 'Good';

              return {
                ...item,
                company,
                os,
                workstation: workstation ? {
                  ...workstation,
                  keyboard: keyboard || workstation.keyboard,
                  keyboardObs: keyboardObs || workstation.keyboardObs,
                  mouse: mouse || workstation.mouse,
                  mouseObs: mouseObs || workstation.mouseObs
                } : workstation,
                keyboard,
                clavier: keyboard,
                keyboardObs,
                mouse,
                souris: mouse,
                mouseObs,
                assignedDepartment
              };
            });
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

  const [applicationAccounts, setApplicationAccounts] = useState<ApplicationAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_applications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Enrich with employee link & windows session data if missing
            const enriched = parsed.map((app: ApplicationAccount) => {
              const initMatch = INITIAL_APPLICATIONS.find(i => i.id === app.id || i.username === app.username);
              const empMatch = INITIAL_EMPLOYEES.find(e => 
                (app.employeeId && (e.id === app.employeeId || e.employeeId === app.employeeId)) ||
                (e.accounts?.appUsername && e.accounts.appUsername.toLowerCase() === app.username.toLowerCase()) ||
                (e.lastName.toLowerCase() === app.lastName.toLowerCase())
              );
              return {
                ...app,
                employeeId: app.employeeId || initMatch?.employeeId || empMatch?.id,
                windowsUsername: app.windowsUsername !== undefined ? app.windowsUsername : (initMatch?.windowsUsername || empMatch?.accounts?.windowsUsername || ''),
                windowsPassword: app.windowsPassword !== undefined ? app.windowsPassword : (initMatch?.windowsPassword || empMatch?.accounts?.windowsPassword || '')
              };
            });
            const missing = INITIAL_APPLICATIONS.filter(initApp => !enriched.some(e => e.id === initApp.id || e.username.toLowerCase() === initApp.username.toLowerCase()));
            const merged = [...enriched, ...missing];
            localStorage.setItem('lebron_inv_applications', JSON.stringify(merged));
            return merged;
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
          if (Array.isArray(parsed) && parsed.length >= INITIAL_PRINTERS.length) {
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

  // IT Accounts state (Informaticiens & Administrateurs)
  const [itAccounts, setItAccounts] = useState<ITAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_it_accounts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const missing = INITIAL_IT_ACCOUNTS.filter(initAcc => !parsed.some((p: any) => p.id === initAcc.id || p.username === initAcc.username));
            return [...parsed, ...missing];
          }
        } catch (e) { console.error(e); }
      }
    }
    return INITIAL_IT_ACCOUNTS;
  });

  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_documents');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const missing = INITIAL_DOCUMENTS.filter(initDoc => !parsed.some((p: any) => p.id === initDoc.id || p.title === initDoc.title));
            return [...parsed, ...missing];
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

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addWifiNetwork = (net: Omit<WifiNetwork, 'id'>) => {
    const newNet: WifiNetwork = {
      ...net,
      id: `wifi-${Date.now()}`
    };
    setWifiNetworks(prev => [newNet, ...prev]);
    showToast({
      title: 'Réseau Wi-Fi Ajouté',
      message: `Le réseau ${newNet.ssid} pour ${newNet.establishment} a été créé.`,
      type: 'success'
    });
  };

  const updateWifiNetwork = (id: string, updates: Partial<WifiNetwork>) => {
    setWifiNetworks(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    showToast({
      title: 'Réseau Wi-Fi Mis à Jour',
      message: 'La configuration Wi-Fi a été enregistrée avec succès.',
      type: 'info'
    });
  };

  const deleteWifiNetwork = (id: string) => {
    setWifiNetworks(prev => prev.filter(item => item.id !== id));
    showToast({
      title: 'Réseau Wi-Fi Supprimé',
      message: "Le réseau a été retiré de l'affiche.",
      type: 'warning'
    });
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

  // Chargement et synchronisation avec Supabase
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const { data: dbPrinters, error: prnErr } = await supabase.from('printers').select('*');
        if (!prnErr && dbPrinters && dbPrinters.length > 0) {
          const mapped: PrinterAsset[] = dbPrinters.map((row: any) => ({
            id: row.printer_id ? row.printer_id.toString() : `prn-${row.numero_serie || Date.now()}`,
            assetTag: `PRN-${row.entreprise?.startsWith('Auto') ? 'AUT' : row.entreprise?.startsWith('Caribe') ? 'CAR' : row.entreprise?.startsWith('Leader') ? 'LFD' : 'LEB'}-${(row.printer_id || 1).toString().padStart(3, '0')}`,
            company: row.entreprise || 'Lebrun S.A.',
            site: row.site || 'Delmas 52',
            name: row.nom_imprimante || 'Imprimante',
            brand: row.marque || 'Hp',
            model: row.modele || '',
            serialNumber: row.numero_serie || 'N/A',
            ipAddress: row.adresse_ip || 'N/A',
            type: row.type || 'Multifonction',
            status: row.etat || 'Fonctionnel',
            observations: row.observations || 'Good',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          setPrinters(mapped);
        }

        const { data: dbUsers, error: usrErr } = await supabase.from('users').select('*');
        if (!usrErr && dbUsers && dbUsers.length > 0) {
          setEmployees(prev => {
            const list = [...prev];
            dbUsers.forEach((u: any, idx: number) => {
              const fullName = `${u.prenom || ''} ${u.nom || ''}`.trim() || u.username;
              const exists = list.some(e => e.email === u.email || e.accounts?.appUsername === u.username);
              if (!exists) {
                list.push({
                  id: `emp-db-${u.user_id || idx + 1}`,
                  employeeId: `EMP-${u.entreprise?.startsWith('Auto') ? 'AUT' : 'LEB'}-${(idx + 1).toString().padStart(3, '0')}`,
                  company: u.entreprise || 'Lebrun S.A.',
                  site: u.site || 'Delmas 52',
                  lastName: u.nom || '',
                  firstName: u.prenom || '',
                  fullName: fullName,
                  email: u.email || `${u.username}@lebrunsa.com`,
                  department: 'Opérations',
                  jobTitle: 'Collaborateur',
                  location: u.site || 'Delmas 52',
                  status: 'active',
                  hireDate: new Date().toISOString().slice(0, 10),
                  accounts: {
                    windowsUsername: fullName,
                    appUsername: u.username,
                    applications: 'Microsoft GP',
                    organization: u.entreprise || 'Lebrun s.a'
                  }
                });
              }
            });
            return list;
          });
        }

        // Load Network Equipment from Supabase
        const { data: dbNet, error: netErr } = await supabase.from('network_equipment').select('*');
        if (!netErr && dbNet && dbNet.length > 0) {
          const mappedNet: NetworkAsset[] = dbNet.map((row: any, idx: number) => ({
            id: row.id ? row.id.toString() : `net-${idx + 1}`,
            assetTag: `NET-${row.entreprise?.startsWith('Auto') ? 'AUT' : 'LEB'}-${(row.id || idx + 1).toString().padStart(3, '0')}`,
            company: row.entreprise || 'Lebrun S.A.',
            site: row.site || 'Delmas 52',
            deviceType: row.type_equipement || 'Switch Gigabit',
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
          setNetworkAssets(mappedNet);
        }

        // Load UPS from Supabase
        const { data: dbUps, error: upsErr } = await supabase.from('ups').select('*');
        if (!upsErr && dbUps && dbUps.length > 0) {
          const mappedUps: UPSAsset[] = dbUps.map((row: any, idx: number) => ({
            id: row.id ? row.id.toString() : `ups-${idx + 1}`,
            assetTag: `UPS-${row.entreprise?.startsWith('Auto') ? 'AUT' : 'LEB'}-${(row.id || idx + 1).toString().padStart(3, '0')}`,
            company: row.entreprise || 'Lebrun S.A.',
            site: row.site || 'Delmas 52',
            name: row.nom || `UPS ${idx + 1}`,
            brand: row.marque || 'Forza',
            model: row.modele || '',
            capacity: row.capacite || '',
            reference: row.reference || row.modele || '',
            status: row.etat || 'En fonctionnement',
            observations: row.observations || '',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.created_at || new Date().toISOString()
          }));
          setUpsAssets(mappedUps);
        }

        // Load User Applications from Supabase
        const { data: dbApps, error: appsErr } = await supabase.from('user_applications').select('*');
        if (!appsErr && dbApps && dbApps.length > 0) {
          const mappedApps: ApplicationAccount[] = dbApps.map((row: any, idx: number) => ({
            id: row.id ? row.id.toString() : `app-${idx + 1}`,
            username: row.username || `user${idx + 1}`,
            lastName: row.nom || '',
            firstName: row.prenom || '',
            password: row.password || 'N/A',
            applications: row.applications || 'Microsoft GP',
            organization: row.organisation || 'Lebrun S.A.'
          }));
          setApplicationAccounts(mappedApps);
        }

        // Load IT Equipment from Supabase
        const { data: dbIT, error: itErr } = await supabase.from('it_equipment').select('*');
        if (!itErr && dbIT && dbIT.length > 0) {
          const mappedIT: ITAsset[] = dbIT.map((row: any, idx: number) => {
            const kbRaw = row.clavier || '';
            const isKbDefect = kbRaw.toLowerCase().includes('defect') || kbRaw.toLowerCase().includes('défect') || (row.observations && (row.observations.toLowerCase().includes('clavier: défect') || row.observations.toLowerCase().includes('clavier: defect')));
            const isKbNeed = kbRaw.toLowerCase().includes('need') || (row.observations && row.observations.toLowerCase().includes('clavier: need'));
            const kbClean = kbRaw.replace(/\[.*?\]/g, '').trim() || 'Clavier Dell cable';
            const kbObs = isKbDefect ? 'Défectueux' : isKbNeed ? 'Need' : 'Good';

            const mouseRaw = row.souris || '';
            const isMouseDefect = mouseRaw.toLowerCase().includes('defect') || mouseRaw.toLowerCase().includes('défect') || (row.observations && (row.observations.toLowerCase().includes('souris: défect') || row.observations.toLowerCase().includes('souris: defect')));
            const isMouseNeed = mouseRaw.toLowerCase().includes('need') || (row.observations && row.observations.toLowerCase().includes('souris: need'));
            const mouseClean = mouseRaw.replace(/\[.*?\]/g, '').trim() || 'Dell';
            const mObs = isMouseDefect ? 'Défectueux' : isMouseNeed ? 'Need' : 'Good';

            return {
              id: row.equipment_id ? row.equipment_id.toString() : (row.id ? row.id.toString() : `it-${idx + 1}`),
              category: 'it' as const,
              company: row.entreprise || row.company || (row.asset_tag?.includes('AUT') ? 'Autobiz' : 'Lebrun S.A.'),
              subCategory: 'desktop' as const,
              assetTag: row.asset_tag || `AST-PC-LEB${(idx + 1).toString().padStart(2, '0')}`,
              name: row.nom || `Poste Desktop ${row.modele || ''}`,
              brand: row.marque || 'Dell',
              model: row.modele || 'OptiPlex Workstation',
              serialNumber: row.numero_serie || 'N/A',
              cpu: row.cpu || 'Intel Core i5',
              ram: row.ram || '8 GB RAM',
              storage: row.stockage || '500 GB SSD',
              assignedTo: row.assigne_a || undefined,
              assignedDepartment: row.departement || undefined,
              location: row.site || 'Delmas 52',
              status: row.statut || (isKbDefect || isMouseDefect ? 'maintenance' : 'in_use'),
              notes: row.observations || row.notes || '',
              keyboard: kbClean,
              clavier: kbClean,
              keyboardObs: kbObs,
              mouse: mouseClean,
              souris: mouseClean,
              mouseObs: mObs,
              workstation: {
                type: 'Desktop',
                pcName: row.nom || 'Poste Desktop',
                pcSerial: row.numero_serie || 'N/A',
                pcSpecs: `${row.cpu || 'Intel Core i5'} ${row.ram || '8 GB RAM'}`,
                monitorModel: row.ecran || 'Dell standard',
                monitorSerial: 'N/A',
                monitorObs: 'Good',
                keyboard: kbClean,
                keyboardDetails: 'Clavier Alpha numerique',
                keyboardObs: kbObs,
                mouse: mouseClean,
                mouseDetails: 'Souris Bureau (Cable)',
                mouseObs: mObs,
                generalState: (isKbDefect || isMouseDefect) ? 'Maintenance' : 'Good',
                observations: row.observations || 'Good'
              },
              purchaseDate: new Date().toISOString().slice(0, 10),
              warrantyExpiry: new Date(Date.now() + 365*24*3600*1000*3).toISOString().slice(0, 10),
              purchaseCost: 900,
              createdAt: row.created_at || new Date().toISOString(),
              updatedAt: row.created_at || new Date().toISOString()
            };
          });
          setItAssets(mappedIT);
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
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`
    };
    setEmployees(prev => [newEmp, ...prev]);

    showToast({
      title: 'Collaborateur Enregistré',
      message: `${newEmp.fullName} (${newEmp.company}) a été ajouté.`,
      type: 'success'
    });

    try {
      await supabase.from('users').insert({
        username: emp.accounts?.appUsername || emp.employeeId.toLowerCase().replace(/[^a-z0-9]/g, ''),
        email: emp.email,
        nom: emp.lastName,
        prenom: emp.firstName,
        entreprise: emp.company,
        site: emp.site
      });
    } catch (err) {
      console.warn('Sync Supabase addEmployee error:', err);
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    const targetEmp = employees.find(e => e.id === id);
    const oldFullName = targetEmp?.fullName;
    const oldEmployeeId = targetEmp?.employeeId;

    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));

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
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.company !== undefined) payload.entreprise = updates.company;
      if (updates.site !== undefined) payload.site = updates.site;
      if (updates.email) {
        await supabase.from('users').update(payload).eq('email', updates.email);
      }
    } catch (err) {
      console.warn('Sync Supabase updateEmployee error:', err);
    }
  };

  const deleteEmployee = async (id: string) => {
    const target = employees.find(e => e.id === id);
    const oldFullName = target?.fullName;
    const oldEmployeeId = target?.employeeId;

    setEmployees(prev => prev.filter(e => e.id !== id));

    // Automatically unassign Poste IT assets when employee is removed
    setItAssets(prev => prev.map(asset => {
      const isAssigned = (asset.assignedPersonnelId && (asset.assignedPersonnelId === id || asset.assignedPersonnelId === oldEmployeeId)) ||
                         (oldFullName && asset.assignedTo?.toLowerCase() === oldFullName.toLowerCase());
      if (isAssigned) {
        return {
          ...asset,
          assignedTo: undefined,
          assignedPersonnelId: undefined,
          status: 'available',
          updatedAt: new Date().toISOString()
        };
      }
      return asset;
    }));

    setPlans(prev => prev.map(plan => {
      const isAssigned = (plan.assignedPersonnelId && (plan.assignedPersonnelId === id || plan.assignedPersonnelId === oldEmployeeId)) ||
                         (oldFullName && plan.assignedTo?.toLowerCase() === oldFullName.toLowerCase());
      if (isAssigned) {
        return { ...plan, assignedTo: undefined, assignedPersonnelId: undefined };
      }
      return plan;
    }));

    setStarlinkKits(prev => prev.map(kit => {
      const isAssigned = (kit.assignedPersonnelId && (kit.assignedPersonnelId === id || kit.assignedPersonnelId === oldEmployeeId)) ||
                         (oldFullName && kit.assignedTo?.toLowerCase() === oldFullName.toLowerCase());
      if (isAssigned) {
        return { ...kit, assignedTo: undefined, assignedPersonnelId: undefined };
      }
      return kit;
    }));

    try {
      if (target?.email) {
        await supabase.from('users').delete().eq('email', target.email);
      }
    } catch (err) {
      console.warn('Sync Supabase deleteEmployee error:', err);
    }
  };

  const getEmployeeAssignedAssets = (empIdOrName: string) => {
    const it = itAssets.filter(i => i.assignedPersonnelId === empIdOrName || i.assignedTo === empIdOrName);
    const pl = plans.filter(p => p.assignedPersonnelId === empIdOrName || p.assignedTo === empIdOrName);
    const sl = starlinkKits.filter(s => s.assignedPersonnelId === empIdOrName || s.assignedTo === empIdOrName);
    const totalVal = it.reduce((acc, curr) => acc + (curr.purchaseCost || 0), 0);
    return {
      it,
      plans: pl,
      starlink: sl,
      totalValue: totalVal
    };
  };

  // IT Accounts Actions (Informaticiens)
  const addITAccount = async (account: Omit<ITAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAcc: ITAccount = {
      ...account,
      id: `it-acc-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setItAccounts(prev => [newAcc, ...prev]);

    showToast({
      title: 'Compte Informaticien Créé',
      message: `${newAcc.fullName} (@${newAcc.username}) a été enregistré.`,
      type: 'success'
    });

    try {
      await supabase.from('users').insert({
        username: newAcc.username,
        email: newAcc.email,
        nom: newAcc.lastName,
        prenom: newAcc.firstName,
        entreprise: newAcc.company,
        site: newAcc.site
      });
    } catch (err) {
      console.warn('Sync Supabase addITAccount error:', err);
    }
  };

  const updateITAccount = async (id: string, updates: Partial<ITAccount>) => {
    setItAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...updates, updatedAt: new Date().toISOString() } : acc));

    showToast({
      title: 'Compte Informaticien Modifié',
      message: 'Les informations du compte ont été mises à jour.',
      type: 'info'
    });

    try {
      if (updates.username || updates.email || updates.lastName || updates.firstName || updates.company || updates.site) {
        const payload: Record<string, any> = {};
        if (updates.email) payload.email = updates.email;
        if (updates.lastName) payload.nom = updates.lastName;
        if (updates.firstName) payload.prenom = updates.firstName;
        if (updates.company) payload.entreprise = updates.company;
        if (updates.site) payload.site = updates.site;
        if (updates.username) {
          await supabase.from('users').update(payload).eq('username', updates.username);
        }
      }
    } catch (err) {
      console.warn('Sync Supabase updateITAccount error:', err);
    }
  };

  const deleteITAccount = async (id: string) => {
    const target = itAccounts.find(a => a.id === id);
    setItAccounts(prev => prev.filter(a => a.id !== id));

    showToast({
      title: 'Compte Informaticien Retiré',
      message: target ? `${target.fullName} a été supprimé.` : 'Compte supprimé.',
      type: 'info'
    });

    try {
      if (target?.username) {
        await supabase.from('users').delete().eq('username', target.username);
      }
    } catch (err) {
      console.warn('Sync Supabase deleteITAccount error:', err);
    }
  };

  // Documents Actions
  const addDocument = async (doc: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setDocuments(prev => [newDoc, ...prev]);

    showToast({
      title: 'Document Ajouté',
      message: `"${newDoc.title}" a été ajouté avec succès.`,
      type: 'success'
    });
  };

  const updateDocument = async (id: string, updates: Partial<DocumentItem>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d));

    showToast({
      title: 'Document Mis à Jour',
      message: 'Les modifications ont été enregistrées.',
      type: 'info'
    });
  };

  const deleteDocument = async (id: string) => {
    const target = documents.find(d => d.id === id);
    setDocuments(prev => prev.filter(d => d.id !== id));

    showToast({
      title: 'Document Supprimé',
      message: target ? `"${target.title}" a été retiré.` : 'Document supprimé.',
      type: 'info'
    });
  };

  // IT Actions
  const addITAsset = async (asset: Omit<ITAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAsset: ITAsset = {
      ...asset,
      id: `it-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setItAssets(prev => [newAsset, ...prev]);

    showToast({
      title: 'Poste de Travail IT Ajouté',
      message: `${newAsset.name} (${newAsset.assetTag}) a été enregistré avec succès.`,
      type: 'success'
    });

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

    try {
      const kbStr = newAsset.workstation?.keyboard || newAsset.keyboard || '';
      const kbObsStr = newAsset.workstation?.keyboardObs || newAsset.keyboardObs || 'Good';
      const kbCombined = kbObsStr !== 'Good' ? `${kbStr} [${kbObsStr}]` : kbStr;

      const mStr = newAsset.workstation?.mouse || newAsset.mouse || '';
      const mObsStr = newAsset.workstation?.mouseObs || newAsset.mouseObs || 'Good';
      const mCombined = mObsStr !== 'Good' ? `${mStr} [${mObsStr}]` : mStr;

      const monStr = newAsset.workstation?.monitorModel || '';
      const monObsStr = newAsset.workstation?.monitorObs || 'Good';
      const monCombined = monObsStr !== 'Good' ? `${monStr} [${monObsStr}]` : monStr;

      const obsCombined = [
        kbObsStr !== 'Good' ? `Clavier: ${kbObsStr}` : '',
        mObsStr !== 'Good' ? `Souris: ${mObsStr}` : '',
        monObsStr !== 'Good' ? `Écran: ${monObsStr}` : '',
        newAsset.notes
      ].filter(Boolean).join(' • ');

      await supabase.from('it_equipment').insert({
        entreprise: newAsset.company || 'Lebrun S.A.',
        site: newAsset.location || 'Delmas 52',
        nom: newAsset.name,
        clavier: kbCombined,
        souris: mCombined,
        ecran: monCombined,
        observations: obsCombined || 'Good'
      });
    } catch (err) {
      console.warn('Sync Supabase addITAsset error:', err);
    }
  };

  const updateITAsset = async (id: string, updates: Partial<ITAsset>) => {
    setItAssets(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));

    showToast({
      title: 'Poste IT Mis à Jour',
      message: 'Les informations du poste ont été enregistrées.',
      type: 'info'
    });

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
      if (updates.name !== undefined) payload.nom = updates.name;
      if (updates.company !== undefined) payload.entreprise = updates.company;
      if (updates.location !== undefined) payload.site = updates.location;
      
      const kb = updates.workstation?.keyboard || updates.keyboard;
      const kbObs = updates.workstation?.keyboardObs || updates.keyboardObs;
      if (kb) {
        payload.clavier = kbObs && kbObs !== 'Good' ? `${kb} [${kbObs}]` : kb;
      }

      const m = updates.workstation?.mouse || updates.mouse;
      const mObs = updates.workstation?.mouseObs || updates.mouseObs;
      if (m) {
        payload.souris = mObs && mObs !== 'Good' ? `${m} [${mObs}]` : m;
      }

      if (updates.workstation?.monitorModel) {
        payload.ecran = updates.workstation.monitorModel;
      }

      if (updates.notes !== undefined || kbObs || mObs) {
        payload.observations = [
          kbObs && kbObs !== 'Good' ? `Clavier: ${kbObs}` : '',
          mObs && mObs !== 'Good' ? `Souris: ${mObs}` : '',
          updates.notes
        ].filter(Boolean).join(' • ');
      }

      if (updates.name) {
        await supabase.from('it_equipment').update(payload).eq('nom', updates.name);
      }
    } catch (err) {
      console.warn('Sync Supabase updateITAsset error:', err);
    }
  };

  const deleteITAsset = async (id: string) => {
    const target = itAssets.find(item => item.id === id);
    setItAssets(prev => prev.filter(item => item.id !== id));

    try {
      if (target?.serialNumber) {
        await supabase.from('it_equipment').delete().eq('numero_serie', target.serialNumber);
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
      id: `net-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setNetworkAssets(prev => [newNet, ...prev]);

    showToast({
      title: 'Équipement Réseau Ajouté',
      message: `${newNet.deviceType} (${newNet.assetTag}) a été enregistré.`,
      type: 'success'
    });

    try {
      await supabase.from('network_equipment').insert({
        entreprise: asset.company,
        site: asset.site,
        type_equipement: asset.deviceType,
        marque: asset.brand,
        modele: asset.model,
        hostname: asset.hostname,
        numero_serie: asset.serialNumber,
        adresse_ip: asset.ipAddress,
        adresse_mac: asset.macAddress,
        etat: asset.status,
        observations: asset.observations
      });
    } catch (err) {
      console.warn('Sync Supabase addNetworkAsset error:', err);
    }
  };

  const updateNetworkAsset = async (id: string, updates: Partial<NetworkAsset>) => {
    setNetworkAssets(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));

    try {
      const payload: Record<string, any> = {};
      if (updates.company !== undefined) payload.entreprise = updates.company;
      if (updates.site !== undefined) payload.site = updates.site;
      if (updates.deviceType !== undefined) payload.type_equipement = updates.deviceType;
      if (updates.brand !== undefined) payload.marque = updates.brand;
      if (updates.model !== undefined) payload.modele = updates.model;
      if (updates.hostname !== undefined) payload.hostname = updates.hostname;
      if (updates.serialNumber !== undefined) payload.numero_serie = updates.serialNumber;
      if (updates.ipAddress !== undefined) payload.adresse_ip = updates.ipAddress;
      if (updates.macAddress !== undefined) payload.adresse_mac = updates.macAddress;
      if (updates.status !== undefined) payload.etat = updates.status;
      if (updates.observations !== undefined) payload.observations = updates.observations;

      if (updates.serialNumber) {
        await supabase.from('network_equipment').update(payload).eq('numero_serie', updates.serialNumber);
      }
    } catch (err) {
      console.warn('Sync Supabase updateNetworkAsset error:', err);
    }
  };

  const deleteNetworkAsset = async (id: string) => {
    const target = networkAssets.find(n => n.id === id);
    setNetworkAssets(prev => prev.filter(item => item.id !== id));

    try {
      if (target?.serialNumber) {
        await supabase.from('network_equipment').delete().eq('numero_serie', target.serialNumber);
      }
    } catch (err) {
      console.warn('Sync Supabase deleteNetworkAsset error:', err);
    }
  };

  // UPS Actions
  const addUPSAsset = async (asset: Omit<UPSAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newUPS: UPSAsset = {
      ...asset,
      id: `ups-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setUpsAssets(prev => [newUPS, ...prev]);

    showToast({
      title: 'Onduleur UPS Ajouté',
      message: `${newUPS.name} (${newUPS.assetTag}) a été enregistré.`,
      type: 'success'
    });

    try {
      await supabase.from('ups').insert({
        entreprise: asset.company,
        site: asset.site,
        nom: asset.name,
        marque: asset.brand,
        modele: asset.model,
        capacite: asset.capacity,
        reference: asset.reference,
        etat: asset.status,
        observations: asset.observations
      });
    } catch (err) {
      console.warn('Sync Supabase addUPSAsset error:', err);
    }
  };

  const updateUPSAsset = async (id: string, updates: Partial<UPSAsset>) => {
    setUpsAssets(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));

    try {
      const payload: Record<string, any> = {};
      if (updates.company !== undefined) payload.entreprise = updates.company;
      if (updates.site !== undefined) payload.site = updates.site;
      if (updates.name !== undefined) payload.nom = updates.name;
      if (updates.brand !== undefined) payload.marque = updates.brand;
      if (updates.model !== undefined) payload.modele = updates.model;
      if (updates.capacity !== undefined) payload.capacite = updates.capacity;
      if (updates.reference !== undefined) payload.reference = updates.reference;
      if (updates.status !== undefined) payload.etat = updates.status;
      if (updates.observations !== undefined) payload.observations = updates.observations;

      if (updates.name) {
        await supabase.from('ups').update(payload).eq('nom', updates.name);
      }
    } catch (err) {
      console.warn('Sync Supabase updateUPSAsset error:', err);
    }
  };

  const deleteUPSAsset = async (id: string) => {
    const target = upsAssets.find(u => u.id === id);
    setUpsAssets(prev => prev.filter(item => item.id !== id));

    try {
      if (target?.name) {
        await supabase.from('ups').delete().eq('nom', target.name);
      }
    } catch (err) {
      console.warn('Sync Supabase deleteUPSAsset error:', err);
    }
  };

  // Application Accounts Actions
  const addApplicationAccount = async (account: Omit<ApplicationAccount, 'id'>) => {
    const newAcc: ApplicationAccount = {
      ...account,
      id: `app-${Date.now()}`
    };
    setApplicationAccounts(prev => [newAcc, ...prev]);

    // Sync to employee accounts in real time
    if (account.employeeId) {
      setEmployees(prev => prev.map(emp => {
        if (emp.id === account.employeeId || emp.employeeId === account.employeeId) {
          return {
            ...emp,
            accounts: {
              ...(emp.accounts || {}),
              windowsUsername: account.windowsUsername !== undefined ? account.windowsUsername : (emp.accounts?.windowsUsername || ''),
              windowsPassword: account.windowsPassword !== undefined ? account.windowsPassword : (emp.accounts?.windowsPassword || ''),
              appUsername: account.username || emp.accounts?.appUsername || '',
              appPassword: account.password !== undefined ? account.password : (emp.accounts?.appPassword || ''),
              applications: account.applications || emp.accounts?.applications || 'Microsoft GP',
              organization: account.organization || emp.accounts?.organization || emp.company
            }
          };
        }
        return emp;
      }));
    }

    showToast({
      title: 'Accès & Session Enregistrés',
      message: `Compte ${newAcc.username} rattaché au personnel avec succès.`,
      type: 'success'
    });

    try {
      await supabase.from('user_applications').insert({
        username: account.username,
        nom: account.lastName,
        prenom: account.firstName,
        password: account.password,
        applications: account.applications,
        organisation: account.organization
      });
    } catch (err) {
      console.warn('Sync Supabase addApplicationAccount error:', err);
    }
  };

  const updateApplicationAccount = async (id: string, updates: Partial<ApplicationAccount>) => {
    setApplicationAccounts(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));

    const target = applicationAccounts.find(item => item.id === id);
    const empId = updates.employeeId || target?.employeeId;

    if (empId) {
      setEmployees(prev => prev.map(emp => {
        if (emp.id === empId || emp.employeeId === empId) {
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
      title: 'Accès & Session Mis à Jour',
      message: 'Les modifications de session et logiciel ont été enregistrées.',
      type: 'info'
    });

    try {
      const payload: Record<string, any> = {};
      if (updates.username !== undefined) payload.username = updates.username;
      if (updates.lastName !== undefined) payload.nom = updates.lastName;
      if (updates.firstName !== undefined) payload.prenom = updates.firstName;
      if (updates.password !== undefined) payload.password = updates.password;
      if (updates.applications !== undefined) payload.applications = updates.applications;
      if (updates.organization !== undefined) payload.organisation = updates.organization;

      if (updates.username) {
        await supabase.from('user_applications').update(payload).eq('username', updates.username);
      }
    } catch (err) {
      console.warn('Sync Supabase updateApplicationAccount error:', err);
    }
  };

  const deleteApplicationAccount = async (id: string) => {
    const target = applicationAccounts.find(a => a.id === id);
    setApplicationAccounts(prev => prev.filter(item => item.id !== id));

    showToast({
      title: 'Accès Supprimé',
      message: 'Le compte a été retiré de la liste.',
      type: 'warning'
    });

    try {
      if (target?.username) {
        await supabase.from('user_applications').delete().eq('username', target.username);
      }
    } catch (err) {
      console.warn('Sync Supabase deleteApplicationAccount error:', err);
    }
  };

  // Actions Printers
  const addPrinter = async (printer: Omit<PrinterAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPrinter: PrinterAsset = {
      ...printer,
      id: `prn-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setPrinters(prev => [newPrinter, ...prev]);

    showToast({
      title: 'Imprimante Ajoutée',
      message: `${newPrinter.name} (${newPrinter.assetTag}) a été enregistrée.`,
      type: 'success'
    });

    try {
      await supabase.from('printers').insert({
        entreprise: printer.company,
        site: printer.site,
        nom_imprimante: printer.name,
        marque: printer.brand,
        modele: printer.model,
        numero_serie: printer.serialNumber,
        adresse_ip: printer.ipAddress,
        type: printer.type,
        etat: printer.status,
        observations: printer.observations
      });
    } catch (err) {
      console.warn('Sync Supabase addPrinter error:', err);
    }
  };

  const updatePrinter = async (id: string, updates: Partial<PrinterAsset>) => {
    setPrinters(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));

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

      const numId = parseInt(id, 10);
      if (!isNaN(numId)) {
        await supabase.from('printers').update(payload).eq('printer_id', numId);
      } else if (updates.serialNumber) {
        await supabase.from('printers').update(payload).eq('numero_serie', updates.serialNumber);
      }
    } catch (err) {
      console.warn('Sync Supabase updatePrinter error:', err);
    }
  };

  const deletePrinter = async (id: string) => {
    const target = printers.find(p => p.id === id);
    setPrinters(prev => prev.filter(item => item.id !== id));

    try {
      const numId = parseInt(id, 10);
      if (!isNaN(numId)) {
        await supabase.from('printers').delete().eq('printer_id', numId);
      } else if (target?.serialNumber) {
        await supabase.from('printers').delete().eq('numero_serie', target.serialNumber);
      }
    } catch (err) {
      console.warn('Sync Supabase deletePrinter error:', err);
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
    if (confirm('Voulez-vous réinitialiser toutes les données aux valeurs de démonstration de Lebronsa S.A. ?')) {
      setEmployees(INITIAL_EMPLOYEES);
      setItAssets(INITIAL_IT_ASSETS);
      setPrinters(INITIAL_PRINTERS);
      setPlans(INITIAL_PLANS);
      setStarlinkKits(INITIAL_STARLINK_KITS);
      setElectronics(INITIAL_ELECTRONICS);
      setMovements(INITIAL_MOVEMENTS);
      setAlerts(INITIAL_ALERTS);
      localStorage.clear();
    }
  };

  // Export Excel Haute Définition (.xlsx)
  const exportCSV = (cat?: AssetCategory | 'personnel' | 'accounts' | 'documents' | 'applications' | 'network' | 'ups') => {
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
