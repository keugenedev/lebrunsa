export type AssetCategory = 'it' | 'plans' | 'starlink' | 'electronics' | 'printers';

export type NavigationTab = 
  | 'overview' 
  | 'it' 
  | 'printers'
  | 'network'
  | 'ups'
  | 'phones'
  | 'applications'
  | 'personnel'
  | 'accounts'
  | 'documents'
  | 'tags'
  | 'plans' 
  | 'starlink' 
  | 'electronics' 
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
  os?: string; // 'Windows 11 Pro' | 'Windows 10 Pro' | 'Windows 11 Home'
  keyboard?: string;
  clavier?: string;
  keyboardObs?: string;
  mouse?: string;
  souris?: string;
  mouseObs?: string;
  screen?: string;
  ecran?: string;
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
  type: 'Multifonction' | 'Laser' | 'Laser (Cheque)' | 'Étiquette' | 'Matricielle' | 'Jet d\'encre' | string;
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

/** Téléphone / portable, avec la personne à qui il est associé. IMEI 1 et IMEI 2 sont facultatifs. */
export interface PhoneAsset {
  id: string;
  assetTag: string; // ex: TEL-LEB-001
  company: string;
  site: string;
  brand: string; // Marque
  model: string; // Modèle
  imei1?: string;
  imei2?: string;
  assignedPersonnelId?: string; // matricule du collaborateur (Employee.employeeId)
  assignedTo?: string; // nom complet du collaborateur
  observations?: string;
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
  username: string; // Identifiant applicatif (ex: rmdguerrier, autobiz1, keugene)
  lastName: string;
  firstName: string;
  password?: string; // Mot de passe applicatif GP
  applications: string; // Applications autorisées (ex: Microsoft GP)
  organization: string; // Organisation / Entité (ex: Lebrun S.A., Autobiz S.A.)
  employeeId?: string; // ID du collaborateur dans le Personnel (ex: emp-1)
  windowsUsername?: string; // Identifiant de connexion session Windows (ex: ALEXIS, Admin)
  windowsPassword?: string; // Mot de passe de connexion session Windows (ex: 198936)
  createdAt?: string;
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
  mouseObs?: string; // Good
  generalState?: string; // Good
  observations?: string; // Good
  obs?: string;
  notes?: string;
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
  position?: string;
  username?: string;
  location: string;
  status: 'active' | 'on_leave' | 'inactive';
  hireDate: string;
  notes?: string;
  createdAt?: string;
  workstation?: WorkstationDetails;
  accounts?: UserAccountDetails;
}

export type ITRole = 
  | 'Super Administrateur IT'
  | 'Administrateur Systèmes & Réseaux'
  | 'Technicien Support & Maintenance'
  | 'Technicien Réseaux & Télécoms'
  | 'Gestionnaire Parc Informatique';

export interface ITAccount {
  id: string;
  userId?: string; // ID unique du collaborateur dans la table users (ex: EMP-LEB-014)
  username: string; // e.g. keugene
  fullName: string; // Kensly Eugene
  firstName: string;
  lastName: string;
  email: string;
  role: ITRole;
  company: string; // Lebrun S.A., Autobiz, Caribe Motors, Leader Foods
  site: string; // Delmas 52, etc.
  phone?: string;
  status: 'active' | 'inactive';
  specialty?: string; // Infrastructure, Windows Server, Réseau, Helpdesk, GP
  poste?: string; // Poste réel du collaborateur conservé (ex: Administrateur, Informaticien, etc.)
  hasPassword?: boolean; // Un mot de passe est défini (jamais le mot de passe lui-même : il est haché en base)
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

export interface WifiNetwork {
  id: string;
  establishment: string; // 'Delmas 52' | 'Aéroport Depot' | 'Autobiz' | 'Leader Foods' | 'Caribe Motors' | 'Tirezone'
  company: string;
  ssid: string;
  password: string;
  providerType: 'Starlink' | 'Fibre Dédiée' | 'Fibre Backup' | '4G/LTE';
  starlinkDetails?: {
    dishSerial?: string;
    terminalId?: string;
    speedEstimated?: string;
    latency?: string;
    servicePlan?: string;
  };
  frequencyBand: 'Dual-Band (2.4 / 5 GHz)' | '5 GHz Haute Vitesse' | '2.4 GHz Longue Portée';
  security: 'WPA2-Personal' | 'WPA3-Personal' | 'WPA2/WPA3';
  locationDetail: string;
  isGuestNetwork?: boolean;
  notes?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  timestamp?: number;
}

export type DocumentCategory = 
  | 'Fiches d\'Affectation'
  | 'Procédures & Guides IT'
  | 'Contrats & Garanties'
  | 'Schémas Réseau & Infrastructure'
  | 'Politiques de Sécurité'
  | 'Factures & Bons de Commande'
  | 'Procès-Verbaux & Décharges';

export interface DocumentItem {
  id: string;
  title: string;
  reference: string;
  category: DocumentCategory;
  company: string;
  site?: string;
  fileType: 'pdf' | 'xlsx' | 'docx' | 'png' | 'txt';
  fileSize?: string;
  author: string;
  lastUpdated: string;
  description?: string;
  url?: string;
  status: 'valide' | 'en_revue' | 'archive';
  createdAt?: string;
  updatedAt?: string;
}

