'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { UPSAsset } from '@/types/inventory';
import { X, Zap, BatteryCharging, ShieldCheck, Tag, MapPin } from 'lucide-react';

export default function UPSModal() {
  const {
    isUPSModalOpen,
    closeUPSModal,
    editingUPSAsset,
    addUPSAsset,
    updateUPSAsset,
    upsAssets
  } = useInventory();

  const [company, setCompany] = useState('Lebrun S.A.');
  const [site, setSite] = useState('Delmas 52');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Forza');
  const [model, setModel] = useState('NT-1011D');
  const [capacity, setCapacity] = useState('1000 VA / 500 W');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState('En fonctionnement');
  const [observations, setObservations] = useState('');
  const [assetTag, setAssetTag] = useState('');

  useEffect(() => {
    if (editingUPSAsset) {
      setCompany(editingUPSAsset.company || 'Lebrun S.A.');
      setSite(editingUPSAsset.site || 'Delmas 52');
      setName(editingUPSAsset.name || '');
      setBrand(editingUPSAsset.brand || 'Forza');
      setModel(editingUPSAsset.model || '');
      setCapacity(editingUPSAsset.capacity || '1000 VA / 500 W');
      setReference(editingUPSAsset.reference || '');
      setStatus(editingUPSAsset.status || 'En fonctionnement');
      setObservations(editingUPSAsset.observations || '');
      setAssetTag(editingUPSAsset.assetTag || '');
    } else {
      const code = company.startsWith('Auto') ? 'AUT' : 'LEB';
      const count = upsAssets.length + 1;
      setAssetTag(`UPS-${code}-${count.toString().padStart(3, '0')}`);
      setCompany('Lebrun S.A.');
      setSite('Delmas 52');
      setName(`UPS ${count}`);
      setBrand('Forza');
      setModel('NT-1011D');
      setCapacity('1000 VA / 500 W');
      setReference('NT-1011D');
      setStatus('En fonctionnement');
      setObservations('Entrée 110–120 Vac, sortie 110–120 Vac');
    }
  }, [editingUPSAsset, isUPSModalOpen, upsAssets.length]);

  if (!isUPSModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tag = assetTag.trim() || `UPS-${company.startsWith('Auto') ? 'AUT' : 'LEB'}-${Date.now().toString().slice(-4)}`;

    const payload: Omit<UPSAsset, 'id' | 'createdAt' | 'updatedAt'> = {
      assetTag: tag,
      company,
      site,
      name: name.trim() || `Onduleur ${brand} ${model}`,
      brand: brand.trim() || 'Forza',
      model: model.trim() || 'NT-1011D',
      capacity: capacity.trim() || '1000 VA',
      reference: reference.trim() || model.trim() || 'REF-UPS',
      status,
      observations: observations.trim() || 'Bon état de fonctionnement'
    };

    if (editingUPSAsset) {
      updateUPSAsset(editingUPSAsset.id, payload);
    } else {
      addUPSAsset(payload);
    }

    closeUPSModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                {editingUPSAsset ? "Modifier l'Onduleur UPS" : "Nouvel Onduleur UPS"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Protection électrique, autonomie batterie Forza et APC Lebrun S.A.
              </p>
            </div>
          </div>
          <button
            onClick={closeUPSModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Tag / Code */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Tag / Code d'Inventaire</label>
              <input
                type="text"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 font-mono font-bold text-slate-900"
                placeholder="UPS-LEB-001"
              />
            </div>

            {/* Nom / Désignation */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Désignation de l'Onduleur</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 font-semibold text-slate-900"
                placeholder="Ex: UPS 1, Onduleur Direction..."
              />
            </div>

            {/* Marque */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Marque</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="Forza">Forza</option>
                <option value="APC">APC (Schneider)</option>
                <option value="CyberPower">CyberPower</option>
                <option value="Eaton">Eaton</option>
                <option value="Autre">Autre marque</option>
              </select>
            </div>

            {/* Modèle */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Modèle</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 font-semibold text-slate-900"
                placeholder="NT-1011D, Back-UPS 1000..."
              />
            </div>

            {/* Capacité */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Capacité Électrique (VA / W)</label>
              <input
                type="text"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 font-mono"
                placeholder="1000 VA / 500 W"
              />
            </div>

            {/* Référence */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Référence / N° Fabricant</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 font-mono"
                placeholder="NT-1011D"
              />
            </div>

            {/* Entreprise */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Entreprise</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="Lebrun S.A.">Lebrun S.A.</option>
                <option value="Autobiz">Autobiz</option>
                <option value="Caribe Motors">Caribe Motors</option>
                <option value="Leader Foods">Leader Foods</option>
                <option value="Tirezone">Tirezone</option>
              </select>
            </div>

            {/* Site */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Site / Emplacement</label>
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="Delmas 52">Delmas 52</option>
                <option value="Aéroport Depot">Aéroport Depot</option>
                <option value="Tabarre">Tabarre</option>
              </select>
            </div>

            {/* Statut */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">État / Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="En fonctionnement">En fonctionnement</option>
                <option value="En réserve">En réserve</option>
                <option value="En maintenance">En maintenance</option>
                <option value="Batterie à remplacer">Batterie à remplacer</option>
                <option value="Défectueux">Défectueux</option>
              </select>
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Caractéristiques & Spécifications</label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 resize-none text-slate-800"
              placeholder="Ex: Entrée 110–120 Vac, sortie 110–120 Vac. Écran LCD indiquant ON LINE..."
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeUPSModal}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors shadow-xs cursor-pointer"
            >
              {editingUPSAsset ? "Enregistrer les modifications" : "Ajouter au Parc Onduleurs"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
