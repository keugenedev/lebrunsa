'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { AssetStatus, ITAsset } from '@/types/inventory';
import { 
  X, 
  Plus, 
  Laptop, 
  HardDrive, 
  Cpu, 
  User, 
  Building 
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
  const [location, setLocation] = useState('Delmas 52');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<AssetStatus>('in_use');
  const [assignedPersonnelId, setAssignedPersonnelId] = useState('');

  const [brand, setBrand] = useState('Dell');
  const [model, setModel] = useState('OptiPlex Workstation');
  const [serialNumber, setSerialNumber] = useState('');
  const [subCategory, setSubCategory] = useState<'desktop' | 'laptop' | 'monitor'>('desktop');
  const [cpu, setCpu] = useState('Intel Core i5 @ 3.30 GHz');
  const [ram, setRam] = useState('8 GB RAM');
  const [storage, setStorage] = useState('500 GB SSD');
  const [purchaseCost, setPurchaseCost] = useState('900');
  const [warrantyExpiry, setWarrantyExpiry] = useState('2026-12-31');

  useEffect(() => {
    if (editingAsset && editingAsset.category === 'it') {
      const it = editingAsset as ITAsset;
      setName(it.name);
      setAssetTag(it.assetTag);
      setLocation(it.location || 'Delmas 52');
      setStatus(it.status);
      setNotes(it.notes || '');
      setAssignedPersonnelId(it.assignedPersonnelId || '');

      setBrand(it.brand || 'Dell');
      setModel(it.model || 'OptiPlex Workstation');
      setSerialNumber(it.serialNumber || '');
      setSubCategory((it.subCategory as any) || 'desktop');
      setCpu(it.cpu || '');
      setRam(it.ram || '');
      setStorage(it.storage || '');
      setPurchaseCost(it.purchaseCost ? it.purchaseCost.toString() : '900');
      setWarrantyExpiry(it.warrantyExpiry || '2026-12-31');
    } else {
      const rand = Math.floor(Math.random() * 900 + 100);
      setAssetTag(`AST-PC-LEB${rand}`);
      setName('Poste Desktop Dell');
      setLocation('Delmas 52');
      setStatus('in_use');
      setNotes('Windows 11 Pro • Écran Dell');
      setAssignedPersonnelId('');
      setBrand('Dell');
      setModel('OptiPlex Workstation');
      setSerialNumber('');
      setSubCategory('desktop');
      setCpu('Intel Core i5 @ 3.30 GHz');
      setRam('8 GB RAM');
      setStorage('500 GB SSD');
      setPurchaseCost('900');
      setWarrantyExpiry('2026-12-31');
    }
  }, [editingAsset, isAddModalOpen]);

  if (!isAddModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedEmp = employees.find(emp => emp.id === assignedPersonnelId);

    const payload: Omit<ITAsset, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      category: 'it' as const,
      assetTag,
      status: assignedEmp ? 'in_use' : status,
      location,
      notes,
      brand: brand || 'Dell',
      model: model || 'OptiPlex Workstation',
      serialNumber: serialNumber || `SN-${Date.now().toString().slice(-6)}`,
      subCategory,
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

    closeAddModal();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white border border-slate-200/90 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingAsset ? 'Modifier le Poste / Matériel IT' : 'Ajouter un Poste de Travail IT'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Stations Dell OptiPlex, configuration CPU/RAM/SSD et affectation collaborateur
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Row 1: Name & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Désignation du Poste *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Poste Desktop LEBHWP6KH2"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Code Asset Tag *</label>
              <input
                type="text"
                required
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                placeholder="AST-PC-LEB01"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-red-700 font-mono font-bold focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Brand, Model, Serial */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Marque</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Dell"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Modèle</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="OptiPlex Workstation"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">N° de Série (SN) *</label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="HWP6KH2"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold"
              />
            </div>
          </div>

          {/* Row 3: CPU, RAM, Storage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Processeur (CPU)</label>
              <input
                type="text"
                value={cpu}
                onChange={(e) => setCpu(e.target.value)}
                placeholder="Intel Core i5 @ 3.30 GHz"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mémoire RAM</label>
              <input
                type="text"
                value={ram}
                onChange={(e) => setRam(e.target.value)}
                placeholder="8 GB RAM / 16 GB RAM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Stockage SSD</label>
              <input
                type="text"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                placeholder="500 GB SSD"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          {/* Row 4: Assignment, Site & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Collaborateur Assigné</label>
              <select
                value={assignedPersonnelId}
                onChange={(e) => setAssignedPersonnelId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
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
              <label className="block text-slate-700 font-semibold mb-1">Site d&apos;affectation</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
              >
                <option value="Delmas 52">Delmas 52</option>
                <option value="Aéroport Depot">Aéroport Depot</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Statut du Matériel</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
              >
                <option value="in_use">En service</option>
                <option value="available">En réserve</option>
                <option value="maintenance">En maintenance</option>
              </select>
            </div>
          </div>

          {/* Row 5: Notes & Screen */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Observations & Écran Associé</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Windows 10 Pro • Écran Dell 22 pouces..."
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
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {editingAsset ? 'Enregistrer les modifications' : 'Créer le Poste IT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
