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
  NavigationTab
} from '@/types/inventory';
export type { NavigationTab };
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
  INITIAL_APPLICATIONS 
} from '@/data/initialData';
import { supabase } from '@/lib/supabase';

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

  // Operations
  recordMovement: (mov: Omit<StockMovement, 'id' | 'date'>) => void;
  markAlertRead: (id: string) => void;
  dismissAlert: (id: string) => void;
  exportCSV: (category?: AssetCategory | 'personnel') => void;
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

  // One-time purge of legacy fake mock data from browser localStorage
  if (typeof window !== 'undefined') {
    const isCleaned = localStorage.getItem('lebron_purged_fake_v9');
    if (!isCleaned) {
      localStorage.removeItem('lebron_inv_plans');
      localStorage.removeItem('lebron_inv_starlink');
      localStorage.removeItem('lebron_inv_electronics');
      localStorage.removeItem('lebron_inv_movements');
      localStorage.removeItem('lebron_inv_alerts');
      localStorage.removeItem('lebron_inv_employees');
      localStorage.removeItem('lebron_inv_it');
      localStorage.removeItem('lebron_inv_printers');
      localStorage.removeItem('lebron_inv_network');
      localStorage.removeItem('lebron_inv_ups');
      localStorage.removeItem('lebron_inv_applications');
      localStorage.setItem('lebron_purged_fake_v9', 'true');
    }
  }

  // Entities state with lazy localStorage initialization
  const [employees, setEmployees] = useState<Employee[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_employees');
      if (saved) {
        try { 
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length >= INITIAL_EMPLOYEES.length) {
            return parsed;
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

  const [applicationAccounts, setApplicationAccounts] = useState<ApplicationAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_applications');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
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

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_printers', JSON.stringify(printers));
    }
  }, [printers]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lebron_inv_employees', JSON.stringify(employees));
    }
  }, [employees]);

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
          const mappedIT: ITAsset[] = dbIT.map((row: any, idx: number) => ({
            id: row.id ? row.id.toString() : `it-${idx + 1}`,
            category: 'it' as const,
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
            status: row.statut || 'in_use',
            notes: row.notes || '',
            purchaseDate: new Date().toISOString().slice(0, 10),
            warrantyExpiry: new Date(Date.now() + 365*24*3600*1000*3).toISOString().slice(0, 10),
            purchaseCost: 900,
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.created_at || new Date().toISOString()
          }));
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
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
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
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));

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
    setEmployees(prev => prev.filter(e => e.id !== id));

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

    try {
      await supabase.from('it_equipment').insert({
        asset_tag: newAsset.assetTag,
        nom: newAsset.name,
        marque: newAsset.brand,
        modele: newAsset.model,
        numero_serie: newAsset.serialNumber,
        cpu: newAsset.cpu,
        ram: newAsset.ram,
        stockage: newAsset.storage,
        assigne_a: newAsset.assignedTo,
        departement: newAsset.assignedDepartment,
        site: newAsset.location,
        statut: newAsset.status,
        notes: newAsset.notes
      });
    } catch (err) {
      console.warn('Sync Supabase addITAsset error:', err);
    }
  };

  const updateITAsset = async (id: string, updates: Partial<ITAsset>) => {
    setItAssets(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));

    try {
      const payload: Record<string, any> = {};
      if (updates.assetTag !== undefined) payload.asset_tag = updates.assetTag;
      if (updates.name !== undefined) payload.nom = updates.name;
      if (updates.brand !== undefined) payload.marque = updates.brand;
      if (updates.model !== undefined) payload.modele = updates.model;
      if (updates.serialNumber !== undefined) payload.numero_serie = updates.serialNumber;
      if (updates.cpu !== undefined) payload.cpu = updates.cpu;
      if (updates.ram !== undefined) payload.ram = updates.ram;
      if (updates.storage !== undefined) payload.stockage = updates.storage;
      if (updates.assignedTo !== undefined) payload.assigne_a = updates.assignedTo;
      if (updates.assignedDepartment !== undefined) payload.departement = updates.assignedDepartment;
      if (updates.location !== undefined) payload.site = updates.location;
      if (updates.status !== undefined) payload.statut = updates.status;
      if (updates.notes !== undefined) payload.notes = updates.notes;

      if (updates.serialNumber) {
        await supabase.from('it_equipment').update(payload).eq('numero_serie', updates.serialNumber);
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

  // Export CSV
  const exportCSV = (cat?: AssetCategory | 'personnel') => {
    let rows: string[][] = [];
    let filename = 'lebronsa_inventaire_export.csv';

    if (cat === 'personnel') {
      rows.push(['Matricule', 'Nom & Prénom', 'Email', 'Téléphone', 'Département', 'Fonction', 'Site / Localisation', 'Statut', 'Date Embauche']);
      employees.forEach(e => {
        rows.push([e.employeeId, e.fullName, e.email, e.phone || '', e.department, e.jobTitle, e.location, e.status, e.hireDate]);
      });
      filename = 'lebronsa_personnel_export.csv';
    } else if (cat === 'printers') {
      rows.push(['Entreprise', 'Site', 'Nom', 'Marque', 'Modèle', 'SN', 'Adresse IP', 'Type', 'Statut', 'Observations']);
      printers.forEach(p => {
        rows.push([p.company, p.site, p.name, p.brand, p.model, p.serialNumber, p.ipAddress, p.type, p.status, p.observations]);
      });
      filename = 'lebronsa_printers_export.csv';
    } else if (!cat || cat === 'it') {
      rows.push(['ID Tag', 'Nom', 'Marque', 'Modèle', 'SN', 'Catégorie', 'Statut', 'Collaborateur Assigné', 'Département', 'Prix (€)', 'Localisation']);
      itAssets.forEach(i => {
        rows.push([i.assetTag, i.name, i.brand, i.model, i.serialNumber, i.subCategory, i.status, i.assignedTo || 'Libre', i.assignedDepartment || 'N/A', i.purchaseCost.toString(), i.location]);
      });
      filename = 'lebronsa_it_equipment_export.csv';
    } else if (cat === 'starlink') {
      rows.push(['Asset Tag', 'Nom Kit', 'Kit SN', 'Dish SN', 'Terminal ID', 'Modèle', 'Forfait', 'Statut Réseau', 'Vitesse Down (Mbps)', 'Vitesse Up (Mbps)', 'Latence (ms)', 'Site / Coordonnées', 'Responsable']);
      starlinkKits.forEach(s => {
        rows.push([s.assetTag, s.name, s.kitNumber, s.dishSerial, s.terminalId, s.tier, s.servicePlan, s.networkStatus, s.downloadSpeedMbps.toString(), s.uploadSpeedMbps.toString(), s.latencyMs.toString(), s.siteName, s.assignedTo || 'N/A']);
      });
      filename = 'lebronsa_starlink_flotte_export.csv';
    } else if (cat === 'plans') {
      rows.push(['Asset Tag', 'Nom Forfait', 'Opérateur', 'Numéro Ligne', 'Type SIM', 'Data Limite (Go)', 'Data Consommée (Go)', 'Coût Mensuel (€)', 'Renouvellement', 'Collaborateur Assigné']);
      plans.forEach(p => {
        rows.push([p.assetTag, p.name, p.operator, p.phoneNumber || 'N/A', p.simType, p.dataLimitGb.toString(), p.dataUsedGb.toString(), p.monthlyCost.toString(), p.renewalDate, p.assignedTo || 'N/A']);
      });
      filename = 'lebronsa_telecom_plans_export.csv';
    } else if (cat === 'electronics') {
      rows.push(['Asset Tag', 'Désignation', 'Sous-catégorie', 'Part Number', 'Fabricant', 'Quantité en Stock', 'Seuil Min', 'Prix Unitaire (€)', 'Emplacement']);
      electronics.forEach(e => {
        rows.push([e.assetTag, e.name, e.subCategory, e.partNumber, e.manufacturer, e.quantityInStock.toString(), e.minThreshold.toString(), e.unitCost.toString(), e.storageBin]);
      });
      filename = 'lebronsa_electronics_export.csv';
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
