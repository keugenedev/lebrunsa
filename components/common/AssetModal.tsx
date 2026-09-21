'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { AssetStatus, ITAsset, WorkstationDetails } from '@/types/inventory';
import { 
  X, 
  Plus, 
  Laptop, 
  HardDrive, 
  Cpu, 
  User, 
  Building,
  Monitor,
  Mouse,
  Keyboard,
  Radio,
  Sparkles
} from 'lucide-react';

export default function AssetModal() {
  const { 
    isAddModalOpen, 
    closeAddModal, 
    editingAsset,
    employees,
    addITAsset,
    updateITAsset
  } = useInventory();

  // IT Specific fields
  const [name, setName] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [location, setLocation] = useState('');
  const [company, setCompany] = useState('Lebrun S.A.');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<AssetStatus>('in_use');
  const [assignedPersonnelId, setAssignedPersonnelId] = useState('');

  // Machine specs
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [subCategory, setSubCategory] = useState<'desktop' | 'laptop' | 'monitor'>('desktop');
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState('');

  // OS / Windows Edition
  const [os, setOs] = useState('');

  // Peripherals: Screen / Monitor
  const [monitorModel, setMonitorModel] = useState('');
  const [monitorSerial, setMonitorSerial] = useState('');
  const [monitorObs, setMonitorObs] = useState('Good');

  // Peripherals: Mouse & Keyboard
  const [mouseBrand, setMouseBrand] = useState('Dell');
  const [mouseDetails, setMouseDetails] = useState('Souris Bureau (Cable)');
  const [mouseObs, setMouseObs] = useState('Good');
  const [keyboardModel, setKeyboardModel] = useState('Clavier Dell cable');
  const [keyboardDetails, setKeyboardDetails] = useState('Clavier Alpha numerique');
  const [keyboardObs, setKeyboardObs] = useState('Good');
  const [generalObs, setGeneralObs] = useState('Good');

  useEffect(() => {
    if (editingAsset && editingAsset.category === 'it') {
      const it = editingAsset as ITAsset;
      setName(it.name);
      setAssetTag(it.assetTag);
      setLocation(it.location || '');
      setCompany((it as any).company || (it.assetTag.includes('AUT') ? 'Autobiz' : 'Lebrun S.A.'));
      setStatus(it.status);
      setNotes(it.notes || '');
      setAssignedPersonnelId(it.assignedPersonnelId || '');

      setBrand(it.brand || '');
      setModel(it.model || '');
      setSerialNumber(it.serialNumber || '');
      setSubCategory((it.subCategory as any) || 'desktop');
      setCpu(it.cpu || '');
      setRam(it.ram || '');
      setStorage(it.storage || '');
      setPurchaseCost(it.purchaseCost ? it.purchaseCost.toString() : '');
      setWarrantyExpiry(it.warrantyExpiry || '');

      // OS resolution
      setOs(it.os || '');

      // Workstation details resolution
      const ws = it.workstation;
      if (ws) {
        setMonitorModel(ws.monitorModel || '');
        setMonitorSerial(ws.monitorSerial || '');
        setMonitorObs(ws.monitorObs || 'Good');
        setMouseBrand(ws.mouse || (it as any).mouse || (it as any).souris || 'Dell');
        setMouseDetails(ws.mouseDetails || 'Souris Bureau (Cable)');
        setMouseObs(ws.mouseObs || (it as any).mouseObs || 'Good');
        setKeyboardModel(ws.keyboard || (it as any).keyboard || (it as any).clavier || 'Clavier Dell cable');
        setKeyboardDetails(ws.keyboardDetails || 'Clavier Alpha numerique');
        setKeyboardObs(ws.keyboardObs || (it as any).keyboardObs || 'Good');
        setGeneralObs(ws.observations || it.notes || '');
      } else {
        // Fallback from notes if notes has screen info
        const snMatch = it.notes?.match(/\(SN:\s*([^\)]+)\)/i);
        const monMatch = it.notes?.match(/Écran\s+([^\(•]+)/i);
        setMonitorModel(monMatch ? monMatch[1].trim() : '');
        setMonitorSerial(snMatch ? snMatch[1].trim() : '');
        setMonitorObs('Good');
        setMouseBrand((it as any).mouse || (it as any).souris || 'Dell');
        setMouseDetails('Souris Bureau (Cable)');
        setMouseObs((it as any).mouseObs || 'Good');
        setKeyboardModel((it as any).keyboard || (it as any).clavier || 'Clavier Dell cable');
        setKeyboardDetails('Clavier Alpha numerique');
        setKeyboardObs((it as any).keyboardObs || 'Good');
        setGeneralObs(it.notes || '');
      }
    } else {
      const rand = Math.floor(Math.random() * 900 + 100);
      setAssetTag(`AST-PC-LEB${rand}`);
      setName('');
      setLocation('');
      setCompany('Lebrun S.A.');
      setStatus('in_use');
      setNotes('');
      setAssignedPersonnelId('');
      setBrand('');
      setModel('');
      setSerialNumber('');
      setSubCategory('desktop');
      setCpu('');
      setRam('');
      setStorage('');
      setPurchaseCost('');
      setWarrantyExpiry('');
      setOs('');
      setMonitorModel('');
      setMonitorSerial('');
      setMonitorObs('Good');
      setMouseBrand('Dell');
      setMouseDetails('Souris Bureau (Cable)');
      setMouseObs('Good');
      setKeyboardModel('Clavier Dell cable');
      setKeyboardDetails('Clavier Alpha numerique');
      setKeyboardObs('Good');
      setGeneralObs('');
    }
  }, [editingAsset, isAddModalOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAddModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const assignedEmp = employees.find(emp => emp.id === assignedPersonnelId || emp.employeeId === assignedPersonnelId);
      const resolvedCompany = company || assignedEmp?.company || (assetTag.includes('AUT') ? 'Autobiz' : 'Lebrun S.A.');

      const hasDefectivePeripheral = keyboardObs === 'Défectueux' || mouseObs === 'Défectueux' || monitorObs === 'Défectueux';

      // Workstation details object
      const workstationObj: WorkstationDetails = {
        type: subCategory === 'laptop' ? 'Laptop' : 'Desktop',
        pcName: name,
        pcSerial: serialNumber,
        pcSpecs: `${os} ${cpu} ${storage} ${ram}`.trim(),
        monitorModel: monitorModel || 'Dell standard',
        monitorSerial: monitorSerial || 'N/A',
        monitorObs: monitorObs || 'Good',
        keyboard: keyboardModel || 'Clavier Dell cable',
        keyboardDetails: keyboardDetails || 'Clavier Alpha numerique',
        keyboardObs: keyboardObs || 'Good',
        mouse: mouseBrand || 'Dell',
        mouseDetails: mouseDetails || 'Souris Bureau (Cable)',
        mouseObs: mouseObs || 'Good',
        generalState: hasDefectivePeripheral ? 'Maintenance' : (status === 'in_use' ? 'Good' : 'Maintenance'),
        observations: generalObs || ''
      };

      const notesSummary = generalObs || '';

      const payload: Omit<ITAsset, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        category: 'it' as const,
        company: resolvedCompany,
        assetTag,
        status: (hasDefectivePeripheral && status === 'maintenance') ? 'maintenance' : (assignedEmp ? 'in_use' : status),
        location,
        notes: notesSummary,
        os,
        brand: brand || 'Dell',
        model: model || 'OptiPlex Workstation',
        serialNumber: serialNumber || `SN-${Date.now().toString().slice(-6)}`,
        subCategory,
        cpu,
        ram,
        storage,
        workstation: workstationObj,
        keyboard: keyboardModel,
        clavier: keyboardModel,
        keyboardObs: keyboardObs,
        mouse: mouseBrand,
        souris: mouseBrand,
        mouseObs: mouseObs,
        assignedPersonnelId: assignedEmp ? assignedEmp.employeeId || assignedEmp.id : undefined,
        assignedTo: assignedEmp ? assignedEmp.fullName : undefined,
        assignedDepartment: assignedEmp ? assignedEmp.department : undefined,
        assignedEmail: assignedEmp ? assignedEmp.email : undefined,
        purchaseDate: new Date().toISOString().slice(0, 10),
        warrantyExpiry,
        purchaseCost: parseFloat(purchaseCost) || 0
      };

      let res;
      if (editingAsset) {
        res = await updateITAsset(editingAsset.id, payload);
      } else {
        res = await addITAsset(payload);
      }

      if (res?.success !== false) {
        closeAddModal();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl lg:max-w-4xl bg-white border border-slate-200 shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingAsset ? 'Modifier le Poste / Matériel IT' : 'Ajouter un Poste de Travail IT'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Stations Dell OptiPlex, configuration CPU/RAM/SSD, Windows OS et périphériques associés
              </p>
            </div>
          </div>
          <button
            onClick={closeAddModal}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Section 1: Identification */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-slate-700" />
              <span>Identification & Société</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Désignation du Poste <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Poste Desktop Dell"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Code Asset Tag <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  placeholder="AST-PC-LEB01"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Société Titulaire <span className="text-red-500">*</span>
                </label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  <option value="Lebrun S.A.">Lebrun S.A.</option>
                  <option value="Autobiz">Autobiz</option>
                  <option value="Caribe Motors">Caribe Motors</option>
                  <option value="Leader Foods">Leader Foods</option>
                  <option value="Tirezone">Tirezone</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Emplacement / Site <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="location-list"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Choisir ou saisir site (Delmas 52, Pétion-Ville...)"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-slate-400"
                />
                <datalist id="location-list">
                  <option value="Delmas 52" />
                  <option value="Pétion-Ville" />
                  <option value="Delmas 60" />
                  <option value="Canapé-Vert" />
                </datalist>
              </div>
            </div>
          </div>

          {/* Section 2: Machine & Windows OS */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-700" />
              <span>Matériel, Processeur & Système d'Exploitation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Marque</label>
                <input
                  type="text"
                  list="brand-options"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Choisir ou saisir (Dell, Apple...)"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                />
                <datalist id="brand-options">
                  <option value="Dell" />
                  <option value="Apple" />
                  <option value="HP" />
                  <option value="Lenovo" />
                  <option value="Asus" />
                  <option value="Acer" />
                </datalist>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Modèle</label>
                <input
                  type="text"
                  list="model-options"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Choisir ou saisir modèle"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                />
                <datalist id="model-options">
                  <option value="OptiPlex 3080" />
                  <option value="OptiPlex 7070" />
                  <option value="OptiPlex 5060" />
                  <option value="Latitude 5420" />
                  <option value="MacBook Pro 14" />
                  <option value="MacBook Air M2" />
                  <option value="Mac mini M2" />
                  <option value="HP ProDesk 400" />
                  <option value="ThinkCentre M70" />
                </datalist>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  N° Série (SN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="ex: HWP6KH2"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* Version / OS Selector (Label on one line, Windows + macOS + Linux + custom) */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Version / OS <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="os-options"
                  value={os}
                  onChange={(e) => setOs(e.target.value)}
                  placeholder="Choisir ou saisir OS (Windows 11, macOS...)"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-slate-400"
                />
                <datalist id="os-options">
                  <option value="Windows 11 Pro" />
                  <option value="Windows 10 Pro" />
                  <option value="Windows 11 Home" />
                  <option value="Windows 10 Home" />
                  <option value="Windows 11 Enterprise" />
                  <option value="Windows Server 2022" />
                  <option value="macOS Sequoia" />
                  <option value="macOS Sonoma" />
                  <option value="macOS Ventura" />
                  <option value="macOS Monterey" />
                  <option value="Ubuntu Linux" />
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Processeur (CPU)</label>
                <input
                  type="text"
                  list="cpu-options"
                  value={cpu}
                  onChange={(e) => setCpu(e.target.value)}
                  placeholder="Choisir ou saisir CPU"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                />
                <datalist id="cpu-options">
                  <option value="Intel Core i7 @ 3.60 GHz" />
                  <option value="Intel Core i5 @ 3.30 GHz" />
                  <option value="Intel Core i5 @ 2.40 GHz" />
                  <option value="Intel Core i3 @ 3.10 GHz" />
                  <option value="Intel Core i9" />
                  <option value="Intel Xeon" />
                  <option value="Apple M3 Max" />
                  <option value="Apple M3" />
                  <option value="Apple M2" />
                  <option value="Apple M1" />
                  <option value="AMD Ryzen 7" />
                  <option value="AMD Ryzen 5" />
                </datalist>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Mémoire RAM</label>
                <input
                  type="text"
                  list="ram-options"
                  value={ram}
                  onChange={(e) => setRam(e.target.value)}
                  placeholder="Choisir ou saisir RAM"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                />
                <datalist id="ram-options">
                  <option value="4 GB RAM" />
                  <option value="8 GB RAM" />
                  <option value="16 GB RAM" />
                  <option value="32 GB RAM" />
                  <option value="64 GB RAM" />
                  <option value="128 GB RAM" />
                </datalist>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Stockage SSD / Disque</label>
                <input
                  type="text"
                  list="storage-options"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  placeholder="Choisir ou saisir Stockage"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                />
                <datalist id="storage-options">
                  <option value="128 GB SSD" />
                  <option value="256 GB SSD" />
                  <option value="500 GB SSD" />
                  <option value="512 GB SSD" />
                  <option value="1 TB SSD" />
                  <option value="2 TB SSD" />
                  <option value="500 GB HDD" />
                  <option value="1 TB HDD" />
                </datalist>
              </div>
            </div>
          </div>

          {/* Section 3: Périphériques Associés (Écran, Souris, Clavier) */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-slate-700" />
              <span>Écran & Moniteur Associé</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Modèle / Taille Écran</label>
                <input
                  type="text"
                  list="monitor-options"
                  value={monitorModel}
                  onChange={(e) => setMonitorModel(e.target.value)}
                  placeholder="Choisir ou saisir écran"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                />
                <datalist id="monitor-options">
                  <option value='Dell 20"' />
                  <option value='Dell 22"' />
                  <option value='Dell 24"' />
                  <option value='Dell 27"' />
                  <option value='HP 24"' />
                  <option value='Lenovo 24"' />
                  <option value="Écran Intégré (Laptop)" />
                  <option value="Sans écran" />
                </datalist>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">N° de Série Écran (SN)</label>
                <input
                  type="text"
                  value={monitorSerial}
                  onChange={(e) => setMonitorSerial(e.target.value)}
                  placeholder="CN-0HN22V-..."
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">État de l'Écran</label>
                <select
                  value={monitorObs}
                  onChange={(e) => setMonitorObs(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  <option value="Good">Good (Opérationnel)</option>
                  <option value="Trace dans l'écran">Trace dans l'écran (Défaut léger)</option>
                  <option value="Défectueux">Défectueux</option>
                  <option value="Need">Need (Écran manquant)</option>
                </select>
              </div>
            </div>

            {/* Clavier Associé */}
            <div className="pt-3 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-slate-700" />
                  <span>Clavier Associé</span>
                </div>
                {keyboardObs === 'Défectueux' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                    Clavier Défectueux
                  </span>
                )}
                {keyboardObs === 'Need' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Clavier Manquant (Need)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Modèle / Marque Clavier</label>
                  <input
                    type="text"
                    list="keyboard-options"
                    value={keyboardModel}
                    onChange={(e) => setKeyboardModel(e.target.value)}
                    placeholder="Choisir ou saisir clavier"
                    className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                  <datalist id="keyboard-options">
                    <option value="Clavier Dell câble" />
                    <option value="Clavier Dell USB" />
                    <option value="Clavier HP USB" />
                    <option value="Clavier Logitech Sans-Fil" />
                    <option value="Clavier Logitech K120" />
                    <option value="Clavier Intégré (Laptop)" />
                    <option value="Sans clavier" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Format & Connectique</label>
                  <select
                    value={keyboardDetails}
                    onChange={(e) => setKeyboardDetails(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                  >
                    <option value="Clavier Alpha numerique">Alpha-numérique standard (USB)</option>
                    <option value="Clavier Sans-Fil / Bluetooth">Sans-Fil (Bluetooth / Wireless)</option>
                    <option value="Clavier Intégré Laptop">Intégré (PC Portable)</option>
                    <option value="N/A">Pas de clavier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                    État du Clavier <span className="text-slate-400 font-normal">(Défectueux / Opérationnel)</span>
                  </label>
                  <select
                    value={keyboardObs}
                    onChange={(e) => setKeyboardObs(e.target.value)}
                    className={`w-full h-10 px-3 py-2 rounded-xl border font-semibold focus:outline-none cursor-pointer transition-colors ${
                      keyboardObs === 'Défectueux'
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : keyboardObs === 'Need'
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Good">Good (Opérationnel)</option>
                    <option value="Défectueux">Défectueux (Touche(s) HS / Problème)</option>
                    <option value="À remplacer">À remplacer prochainement</option>
                    <option value="Need">Need (Clavier manquant)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Souris & Pointage */}
            <div className="pt-3 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Mouse className="w-3.5 h-3.5 text-slate-700" />
                  <span>Souris & Dispositif de Pointage</span>
                </div>
                {mouseObs === 'Défectueux' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                    Souris Défectueuse
                  </span>
                )}
                {mouseObs === 'Need' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Souris Manquante (Need)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Modèle / Marque Souris</label>
                  <input
                    type="text"
                    list="mouse-options"
                    value={mouseBrand}
                    onChange={(e) => setMouseBrand(e.target.value)}
                    placeholder="Choisir ou saisir souris"
                    className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                  <datalist id="mouse-options">
                    <option value="Dell" />
                    <option value="Souris Dell optique USB" />
                    <option value="HP USB" />
                    <option value="Logitech Sans-Fil" />
                    <option value="Logitech M185" />
                    <option value="Touchpad Intégré" />
                    <option value="Sans souris" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Connectique & Type</label>
                  <select
                    value={mouseDetails}
                    onChange={(e) => setMouseDetails(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                  >
                    <option value="Souris Bureau (Cable)">Souris Bureau (Câble USB)</option>
                    <option value="Bleutooth (Wirless)">Souris Sans-Fil (Bluetooth / Wireless)</option>
                    <option value="Touchpad (Laptop)">Pavé tactile (Laptop Touchpad)</option>
                    <option value="N/A">Pas de souris</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                    État de la Souris <span className="text-slate-400 font-normal">(Défectueuse / Opérationnelle)</span>
                  </label>
                  <select
                    value={mouseObs}
                    onChange={(e) => setMouseObs(e.target.value)}
                    className={`w-full h-10 px-3 py-2 rounded-xl border font-semibold focus:outline-none cursor-pointer transition-colors ${
                      mouseObs === 'Défectueux'
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : mouseObs === 'Need'
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Good">Good (Opérationnelle)</option>
                    <option value="Défectueux">Défectueux (Clic / Molette HS)</option>
                    <option value="À remplacer">À remplacer prochainement</option>
                    <option value="Need">Need (Souris manquante)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Affectation & Statut */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Collaborateur Assigné</label>
              <select
                value={assignedPersonnelId}
                onChange={(e) => setAssignedPersonnelId(e.target.value)}
                className="w-full h-10 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="">Non assigné (En réserve)</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.company || 'Lebrun S.A.'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Site d'affectation</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-10 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="">Sélectionner un site...</option>
                <option value="Delmas 52">Delmas 52</option>
                <option value="Pétion-Ville">Pétion-Ville</option>
                <option value="Delmas 60">Delmas 60</option>
                <option value="Canapé-Vert">Canapé-Vert</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Statut du Matériel</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="in_use">En service</option>
                <option value="available">En réserve</option>
                <option value="maintenance">En maintenance</option>
              </select>
            </div>
          </div>

          {/* Section 5: Observations & Remarques Générales */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Observations & Remarques Générales</label>
            <input
              type="text"
              value={generalObs}
              onChange={(e) => setGeneralObs(e.target.value)}
              placeholder="ex: Windows lent, Double écran 27+22, Tout est opérationnel..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={closeAddModal}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {editingAsset ? 'Enregistrer les modifications' : 'Créer le Poste IT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
