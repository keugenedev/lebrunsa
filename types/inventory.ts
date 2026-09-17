export type AssetCategory = 'it' | 'plans' | 'starlink' | 'electronics' | 'printers';

export type NavigationTab = 
  | 'overview' 
  | 'it' 
  | 'printers'
  | 'network'
  | 'ups'
  | 'applications'
  | 'plans' 
  | 'starlink' 
  | 'electronics' 
  | 'personnel'
  | 'movements' 
  | 'alerts' 
  | 'settings';

export type AssetStatus = 
  | 'available' 
  | 'in_use' 
  | 'maintenance' 
  | 'retired' 
  | 'online' 
  | 'offline' 
  | 'degraded';

export interface BaseAsset {
  id: string;
  name: string;
  category: AssetCategory;
  assetTag: string; // e.g. AST-IT-001
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  location: string;
  assignedPersonnelId?: string; // Foreign key to Employee
}

export interface ITAsset extends BaseAsset {
  category: 'it';
  brand: string;
  model: string;
  serialNumber: string;
  subCategory: 'laptop' | 'desktop' | 'server' | 'networking' | 'monitor' | 'peripheral';
  cpu?: string;
  ram?: string;
  storage?: string;
  assignedTo?: string; // Employee name
  assignedDepartment?: string;
  assignedEmail?: string;
  purchaseDate: string;
  warrantyExpiry: string;
  purchaseCost: number;
  workstation?: WorkstationDetails;
  company?: string;
}

export interface PrinterAsset {
  id: string;
  assetTag: string;
  company: 'Lebrun S.A.' | 'Autobiz' | 'Caribe Motors' | 'Leader Foods' | string;
  site: 'Delmas 52' | 'Aéroport Depot' | string;
  name: string;
  brand: string; // 'Hp'
  model: string;
  serialNumber: string;
  ipAddress: string;
  type: 'Multifonction' | 'Laser' | 'Laser (Cheque)' | string;
  status: 'Fonctionnel' | 'Maintenance' | 'En panne';
  observations: string;
  createdAt: string;
  updatedAt: string;
}

export interface NetworkAsset {
  id: string;
  assetTag: string;
  company: string;
  site: string;
  deviceType: string; // 'Switch Gigabit rackable' | 'Switch Ethernet' | 'Point d\'accès / équipement Wi‑Fi'
  brand: string;
  model: string;
  hostname: string;
  serialNumber: string;
  ipAddress: string;
  macAddress: string;
  status: string;
  observations: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UPSAsset {
  id: string;
  assetTag: string;
  company: string;
  site: string;
  name: string;
  brand: string;
  model: string;
  capacity: string;
  reference: string;
  status: string;
  observations: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationAccount {
  id: string;
  username: string;
  lastName: string;
  firstName: string;
  password?: string;
  applications: string;
  organization: string;
}

export interface TelecomPlan extends BaseAsset {
  category: 'plans';
  operator: 'Orange Pro' | 'MTN Business' | 'Starlink Maritime' | 'Vodafone Global' | 'Free Pro' | 'AT&T Business';
  planName: string;
  phoneNumber?: string;
  simType: 'Physical SIM' | 'eSIM' | 'Data Only M2M' | 'Satellite Direct';
  iccid?: string;
  monthlyCost: number;
  dataLimitGb: number; // 0 for unlimited
  dataUsedGb: number;
  renewalDate: string;
  assignedTo?: string;
  assignedDevice?: string; // e.g. "MacBook Pro M3", "Routeur 4G Backup"
  contractLengthMonths: number;
}

export interface StarlinkKit extends BaseAsset {
  category: 'starlink';
  kitNumber: string; // e.g. KIT-3004812
  dishSerial: string; // e.g. UT-9924-X4A
  terminalId: string; // e.g. 0100000000000000-00049281
  tier: 'Flat High Performance' | 'Standard Actuated' | 'Mini' | 'Enterprise Maritime';
  servicePlan: 'Priority 1TB' | 'Priority 500GB' | 'Mobile Priority 50GB' | 'Standard Unlimited' | 'Global Roam';
  networkStatus: 'online' | 'degraded' | 'offline';
  downloadSpeedMbps: number;
  uploadSpeedMbps: number;
  latencyMs: number;
  publicIp: string;
  dataUsedGb: number;
  dataCapGb: number;
  coordinates: string;
  siteName: string;
  assignedTo?: string; // Responsible person or Site Manager
  monthlyCost: number;
  lastPing: string;
}

export interface ElectronicComponent extends BaseAsset {
  category: 'electronics';
  subCategory: 'ups' | 'sensor' | 'iot' | 'cabling' | 'test_tools' | 'power';
  partNumber: string;
  manufacturer: string;
  quantityInStock: number;
  minThreshold: number;
  unitCost: number;
  storageBin: string;
  supplier: string;
  voltageRating?: string;
}

export interface WorkstationDetails {
  type: string; // Desktop, Laptop
  pcName: string; // LEBHWP6KH2
  pcSerial: string; // HWP6KH2
  pcSpecs: string; // Windows 10 Pro Intel Core I5 @ 3.30 GHz 500 Gb SSD 8 Gb Ram
  monitorModel: string; // Dell 22"
  monitorSerial: string; // CN-0HN22V-FCC00-22SA48B-A16
  monitorObs: string; // Good ou Trace dans l'ecran (deffecteux)
  keyboard: string; // Clavier Dell cable
  keyboardDetails: string; // Clavier Alpha numerique
  keyboardObs: string; // Good
  mouse: string; // Dell
  mouseDetails: string; // Souris Bureau (Cable), Bleutooth (Wirless)
  mouseObs: string; // Good
  generalState: string; // Good
  observations: string; // Good
}

export interface UserAccountDetails {
  windowsUsername: string; // Admin, ALEXIS
  windowsPassword?: string; // 198936, N/A
  appUsername: string; // rmdguerrier, autobiz1
  appPassword?: string; // 1234, ET@1234
  applications: string; // Microsoft GP
  organization: string; // Lebrun s.a | Autobiz S.A
}

export interface Employee {
  id: string;
  employeeId: string; // Matricule / Tag (ex: EMP-LEB-001)
  company: 'Lebrun S.A.' | 'Autobiz' | 'Caribe Motors' | 'Leader Foods' | string;
  site: string; // Delmas 52
  lastName: string;
  firstName: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  jobTitle: string;
  location: string;
  status: 'active' | 'on_leave' | 'inactive';
  hireDate: string;
  notes?: string;
  workstation?: WorkstationDetails;
  accounts?: UserAccountDetails;
}

export type AnyAsset = ITAsset | TelecomPlan | StarlinkKit | ElectronicComponent;

export interface StockMovement {
  id: string;
  assetId: string;
  assetName: string;
  assetCategory: AssetCategory;
  actionType: 'check_out' | 'check_in' | 'maintenance_start' | 'maintenance_end' | 'restock' | 'decommission';
  targetUser?: string;
  employeeId?: string;
  department?: string;
  date: string;
  performedBy: string;
  notes: string;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  category: AssetCategory | 'system';
  relatedAssetId?: string;
  timestamp: string;
  read: boolean;
}
