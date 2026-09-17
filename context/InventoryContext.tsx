'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  ITAsset, 
  TelecomPlan, 
  StarlinkKit, 
  ElectronicComponent, 
  StockMovement, 
  AlertItem, 
  AssetCategory, 
  AnyAsset,
  Employee 
} from '@/types/inventory';
import { 
  INITIAL_IT_ASSETS, 
  INITIAL_PLANS, 
  INITIAL_STARLINK_KITS, 
  INITIAL_ELECTRONICS, 
  INITIAL_MOVEMENTS, 
  INITIAL_ALERTS,
  INITIAL_EMPLOYEES 
} from '@/data/initialData';

export type NavigationTab = 
  | 'overview' 
  | 'it' 
  | 'plans' 
  | 'starlink' 
  | 'electronics' 
  | 'personnel'
  | 'movements' 
  | 'alerts' 
  | 'settings';

interface InventoryContextType {
  // State
  itAssets: ITAsset[];
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
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_EMPLOYEES;
  });

  const [itAssets, setItAssets] = useState<ITAsset[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lebron_inv_it');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
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

  // Save to localStorage on change
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
  const addEmployee = (emp: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`
    };
    setEmployees(prev => [newEmp, ...prev]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
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
  const addITAsset = (asset: Omit<ITAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
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
  };

  const updateITAsset = (id: string, updates: Partial<ITAsset>) => {
    setItAssets(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));
  };

  const deleteITAsset = (id: string) => {
    setItAssets(prev => prev.filter(item => item.id !== id));
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
        rows.push([e.employeeId, e.fullName, e.email, e.phone, e.department, e.jobTitle, e.location, e.status, e.hireDate]);
      });
      filename = 'lebronsa_personnel_export.csv';
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
        addITAsset,
        updateITAsset,
        deleteITAsset,
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
