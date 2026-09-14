'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { AssetCategory, AssetStatus, ITAsset, TelecomPlan, StarlinkKit, ElectronicComponent } from '@/types/inventory';
import { 
  X, 
  Plus, 
  Laptop, 
  Satellite, 
  Smartphone, 
  Cpu, 
  Check, 
  User 
} from 'lucide-react';

export default function AssetModal() {
  const { 
    isAddModalOpen, 
    closeAddModal, 
    initialCategoryForModal, 
    editingAsset,
    employees,
    addITAsset,
    updateITAsset,
    addPlan,
    updatePlan,
    addStarlinkKit,
    updateStarlinkKit,
    addElectronic,
    updateElectronic
  } = useInventory();

  const [category, setCategory] = useState<AssetCategory>('it');

  // Common fields
  const [name, setName] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [location, setLocation] = useState('Siège Social');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<AssetStatus>('available');
  const [assignedPersonnelId, setAssignedPersonnelId] = useState('');

  // IT Specific
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [itSubCategory, setItSubCategory] = useState<'laptop' | 'desktop' | 'server' | 'networking' | 'monitor' | 'peripheral'>('laptop');
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('1500');
  const [warrantyExpiry, setWarrantyExpiry] = useState('2027-01-01');

  // Plan Specific
  const [operator, setOperator] = useState<any>('Orange Pro');
  const [planName, setPlanName] = useState('Performance 5G');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [simType, setSimType] = useState<any>('Physical SIM');
  const [monthlyCost, setMonthlyCost] = useState('45');
  const [dataLimitGb, setDataLimitGb] = useState('100');
  const [renewalDate, setRenewalDate] = useState('2025-06-01');

  // Starlink Specific
  const [kitNumber, setKitNumber] = useState('');
  const [dishSerial, setDishSerial] = useState('');
  const [terminalId, setTerminalId] = useState('');
  const [tier, setTier] = useState<any>('Flat High Performance');
  const [servicePlan, setServicePlan] = useState<any>('Priority 1TB');
  const [siteName, setSiteName] = useState('Site Minier Nord');
  const [coordinates, setCoordinates] = useState('49.1245° N, 2.1892° E');
  const [downloadSpeedMbps, setDownloadSpeedMbps] = useState('220');

  // Electronics Specific
  const [elecSubCategory, setElecSubCategory] = useState<any>('iot');
  const [partNumber, setPartNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [storageBin, setStorageBin] = useState('Casier Zone A');
  const [unitCost, setUnitCost] = useState('25');
  const [quantityInStock, setQuantityInStock] = useState('10');
  const [minThreshold, setMinThreshold] = useState('3');

  useEffect(() => {
    if (editingAsset) {
      setCategory(editingAsset.category);
      setName(editingAsset.name);
      setAssetTag(editingAsset.assetTag);
      setLocation(editingAsset.location);
      setStatus(editingAsset.status);
      setNotes(editingAsset.notes || '');
      setAssignedPersonnelId(editingAsset.assignedPersonnelId || '');

      if (editingAsset.category === 'it') {
        const it = editingAsset as ITAsset;
        setBrand(it.brand);
        setModel(it.model);
        setSerialNumber(it.serialNumber);
        setItSubCategory(it.subCategory);
        setCpu(it.cpu || '');
        setRam(it.ram || '');
        setStorage(it.storage || '');
        setPurchaseCost(it.purchaseCost.toString());
        setWarrantyExpiry(it.warrantyExpiry);
      } else if (editingAsset.category === 'plans') {
        const pl = editingAsset as TelecomPlan;
        setOperator(pl.operator);
        setPlanName(pl.planName);
        setPhoneNumber(pl.phoneNumber || '');
        setSimType(pl.simType);
        setMonthlyCost(pl.monthlyCost.toString());
        setDataLimitGb(pl.dataLimitGb.toString());
        setRenewalDate(pl.renewalDate);
      } else if (editingAsset.category === 'starlink') {
        const sl = editingAsset as StarlinkKit;
        setKitNumber(sl.kitNumber);
        setDishSerial(sl.dishSerial);
        setTerminalId(sl.terminalId);
        setTier(sl.tier);
        setServicePlan(sl.servicePlan);
        setSiteName(sl.siteName);
        setCoordinates(sl.coordinates);
        setMonthlyCost(sl.monthlyCost.toString());
      } else if (editingAsset.category === 'electronics') {
        const el = editingAsset as ElectronicComponent;
        setElecSubCategory(el.subCategory);
        setPartNumber(el.partNumber);
        setManufacturer(el.manufacturer);
        setStorageBin(el.storageBin);
        setUnitCost(el.unitCost.toString());
        setQuantityInStock(el.quantityInStock.toString());
        setMinThreshold(el.minThreshold.toString());
      }
    } else {
      setCategory(initialCategoryForModal);
      const rand = Math.floor(Math.random() * 9000 + 1000);
      const prefix = initialCategoryForModal === 'it' ? 'AST-IT' : initialCategoryForModal === 'starlink' ? 'AST-SLK' : initialCategoryForModal === 'plans' ? 'AST-PLN' : 'AST-ELC';
      setAssetTag(`${prefix}-${rand}`);
      setName('');
      setLocation('Siège Social');
      setStatus('available');
      setNotes('');
      setAssignedPersonnelId('');
      setBrand('');
      setModel('');
      setSerialNumber(`SN-${Date.now().toString().slice(-8)}`);
      setKitNumber(`KIT-${Math.floor(Math.random() * 9000000 + 1000000)}`);
      setDishSerial(`UT-${Math.floor(Math.random() * 9000 + 1000)}-X`);
      setTerminalId(`0100000000000000-${Math.floor(Math.random() * 90000 + 10000)}`);
      setPartNumber(`PN-${rand}`);
      setManufacturer('');
      setStorageBin('Casier Zone A');
      setPlanName('Forfait Professionnel');
      setPhoneNumber('');
      setSiteName('Site Central');
      setCoordinates('48.8566° N, 2.3522° E');
    }
  }, [editingAsset, initialCategoryForModal, isAddModalOpen]);

  if (!isAddModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedEmp = employees.find(emp => emp.id === assignedPersonnelId);

    if (category === 'it') {
      const payload: Omit<ITAsset, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        category: 'it' as const,
        assetTag,
        status: assignedEmp ? 'in_use' : status,
        location,
        notes,
        brand: brand || 'Générique',
        model: model || 'Modèle Pro',
        serialNumber: serialNumber || `SN-${Date.now()}`,
        subCategory: itSubCategory,
        cpu,
        ram,
        storage,
        assignedPersonnelId: assignedEmp ? assignedEmp.id : undefined,
        assignedTo: assignedEmp ? assignedEmp.fullName : undefined,
        assignedDepartment: assignedEmp ? assignedEmp.department : undefined,
        assignedEmail: assignedEmp ? assignedEmp.email : undefined,
        purchaseDate: new Date().toISOString().slice(0, 10),
        warrantyExpiry,
        purchaseCost: parseFloat(purchaseCost) || 0
      };
      if (editingAsset) {
        updateITAsset(editingAsset.id, payload);
      } else {
        addITAsset(payload);
      }
    } else if (category === 'plans') {
      const payload: Omit<TelecomPlan, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        category: 'plans' as const,
        assetTag,
        status: (assignedEmp ? 'in_use' : status) as AssetStatus,
        location,
        notes,
        operator,
        planName,
        phoneNumber,
        simType,
        monthlyCost: parseFloat(monthlyCost) || 0,
        dataLimitGb: parseFloat(dataLimitGb) || 0,
        dataUsedGb: 0,
        renewalDate,
        assignedPersonnelId: assignedEmp ? assignedEmp.id : undefined,
        assignedTo: assignedEmp ? assignedEmp.fullName : undefined,
        contractLengthMonths: 12
      };
      if (editingAsset) {
        updatePlan(editingAsset.id, payload);
      } else {
        addPlan(payload);
      }
    } else if (category === 'starlink') {
      const payload: Omit<StarlinkKit, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        category: 'starlink' as const,
        assetTag,
        status: 'online' as const,
        location,
        notes,
        kitNumber,
        dishSerial,
        terminalId,
        tier,
        servicePlan,
        networkStatus: 'online' as const,
        downloadSpeedMbps: parseFloat(downloadSpeedMbps) || 180,
        uploadSpeedMbps: 25,
        latencyMs: 32,
        publicIp: '198.51.100.25',
        dataUsedGb: 12.5,
        dataCapGb: 1000,
        coordinates,
        siteName,
        assignedPersonnelId: assignedEmp ? assignedEmp.id : undefined,
        assignedTo: assignedEmp ? assignedEmp.fullName : undefined,
        monthlyCost: parseFloat(monthlyCost) || 350,
        lastPing: 'À l\'instant'
      };
      if (editingAsset) {
        updateStarlinkKit(editingAsset.id, payload);
      } else {
        addStarlinkKit(payload);
      }
    } else if (category === 'electronics') {
      const payload: Omit<ElectronicComponent, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        category: 'electronics' as const,
        assetTag,
        status: parseInt(quantityInStock) > 0 ? 'available' as const : 'retired' as const,
        location,
        notes,
        subCategory: elecSubCategory,
        partNumber,
        manufacturer: manufacturer || 'Standard',
        quantityInStock: parseInt(quantityInStock) || 0,
        minThreshold: parseInt(minThreshold) || 2,
        unitCost: parseFloat(unitCost) || 0,
        storageBin,
        supplier: 'Fournisseur Agréé Lebronsa'
      };
      if (editingAsset) {
        updateElectronic(editingAsset.id, payload);
      } else {
        addElectronic(payload);
      }
    }

    closeAddModal();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="lebron-card w-full max-w-2xl bg-white border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingAsset ? 'Modifier l\'élément' : 'Ajouter un Actif au Catalogue Lebronsa S.A.'}
              </h3>
              <p className="text-xs text-slate-500">
                Caractéristiques, tarification et affectation nominative au personnel
              </p>
            </div>
          </div>
          <button
            onClick={closeAddModal}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs (if creating) */}
        {!editingAsset && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              { id: 'it', label: 'Matériel IT', icon: Laptop },
              { id: 'starlink', label: 'Kit Starlink', icon: Satellite },
              { id: 'plans', label: 'Forfait / SIM', icon: Smartphone },
              { id: 'electronics', label: 'Électronique', icon: Cpu }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setCategory(tab.id as any)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium transition-all ${
                    category === tab.id
                      ? 'bg-red-50 text-red-700 border-red-300 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Common row: Name & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Désignation / Nom *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: MacBook Pro 16, Kit Starlink Flat HP..."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Asset Tag (Code-barres) *</label>
              <input
                type="text"
                required
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-red-700 font-mono font-bold focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Personnel Assignment Dropdown */}
          {category !== 'electronics' && (
            <div className="p-3 rounded-xl bg-red-50/50 border border-red-100">
              <label className="block text-slate-800 font-semibold mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-600" />
                <span>Salarié / Collaborateur Lebronsa Assigné</span>
              </label>
              <select
                value={assignedPersonnelId}
                onChange={(e) => setAssignedPersonnelId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="">Non assigné (En stock / Réserve)</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeId}) • {emp.department}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* IT Specific */}
          {category === 'it' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Marque *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Apple, Dell, Lenovo, Cisco..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Modèle</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="XPS 15, ThinkPad..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">N° de Série (SN) *</label>
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Catégorie</label>
                  <select
                    value={itSubCategory}
                    onChange={(e) => setItSubCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  >
                    <option value="laptop">Ordinateur Portable</option>
                    <option value="desktop">Poste Fixe / Tour</option>
                    <option value="server">Serveur Rack Datacenter</option>
                    <option value="networking">Réseau / Switch</option>
                    <option value="monitor">Écran Affichage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">CPU & RAM</label>
                  <input
                    type="text"
                    value={cpu}
                    onChange={(e) => setCpu(e.target.value)}
                    placeholder="Apple M3 Max, 64GB..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Prix d&apos;Achat (€)</label>
                  <input
                    type="number"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Starlink Specific */}
          {category === 'starlink' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">N° Kit (Kit ID) *</label>
                  <input
                    type="text"
                    required
                    value={kitNumber}
                    onChange={(e) => setKitNumber(e.target.value)}
                    placeholder="KIT-3004812"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Dish Serial (Antenne) *</label>
                  <input
                    type="text"
                    required
                    value={dishSerial}
                    onChange={(e) => setDishSerial(e.target.value)}
                    placeholder="UT-9924-X4A"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Modèle Terminal</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  >
                    <option value="Flat High Performance">Flat High Performance</option>
                    <option value="Standard Actuated">Standard Actuated</option>
                    <option value="Mini">Starlink Mini</option>
                    <option value="Enterprise Maritime">Enterprise Maritime</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Site / Emplacement</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Base Vie Mine Nord, Navire Stella..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Abonnement & Coût (€/m)</label>
                  <input
                    type="number"
                    value={monthlyCost}
                    onChange={(e) => setMonthlyCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Telecom Plans Specific */}
          {category === 'plans' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Opérateur</label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  >
                    <option value="Orange Pro">Orange Pro</option>
                    <option value="MTN Business">MTN Business</option>
                    <option value="Vodafone Global">Vodafone Global</option>
                    <option value="Free Pro">Free Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Numéro de Téléphone</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+33 6 00 00 00 00"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Type de SIM</label>
                  <select
                    value={simType}
                    onChange={(e) => setSimType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  >
                    <option value="Physical SIM">SIM Physique</option>
                    <option value="eSIM">eSIM Virtuelle</option>
                    <option value="Data Only M2M">Data M2M IoT</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Electronics Specific */}
          {category === 'electronics' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Part Number (P/N) *</label>
                  <input
                    type="text"
                    required
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fabricant</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="Schneider, Espressif..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Casier Stockage *</label>
                  <input
                    type="text"
                    required
                    value={storageBin}
                    onChange={(e) => setStorageBin(e.target.value)}
                    placeholder="Casier B - Tiroir 3"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantité en Stock</label>
                  <input
                    type="number"
                    value={quantityInStock}
                    onChange={(e) => setQuantityInStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Seuil Réserve Min</label>
                  <input
                    type="number"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={closeAddModal}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-xs transition-all active:scale-95"
            >
              {editingAsset ? 'Enregistrer les modifications' : 'Créer l\'actif'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
