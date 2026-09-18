'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { UPSAsset } from '@/types/inventory';
import { X, Zap, BatteryCharging, ShieldCheck, Tag, MapPin, Building, Plus } from 'lucide-react';

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
  const [site, setSite] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Forza');
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState('En fonctionnement');
  const [observations, setObservations] = useState('');
  const [assetTag, setAssetTag] = useState('');

  useEffect(() => {
    if (editingUPSAsset) {
      setCompany(editingUPSAsset.company || 'Lebrun S.A.');
      setSite(editingUPSAsset.site || '');
      setName(editingUPSAsset.name || '');
      setBrand(editingUPSAsset.brand || 'Forza');
      setModel(editingUPSAsset.model || '');
      setCapacity(editingUPSAsset.capacity || '');
      setReference(editingUPSAsset.reference || '');
      setStatus(editingUPSAsset.status || 'En fonctionnement');
      setObservations(editingUPSAsset.observations || '');
      setAssetTag(editingUPSAsset.assetTag || '');
    } else {
      const code = company.startsWith('Auto') ? 'AUT' : 'LEB';
      const count = upsAssets.length + 1;
      setAssetTag(`UPS-${code}-${count.toString().padStart(3, '0')}`);
      setCompany('Lebrun S.A.');
      setSite('');
      setName('');
      setBrand('Forza');
      setModel('');
      setCapacity('');
      setReference('');
      setStatus('En fonctionnement');
      setObservations('');
    }
  }, [editingUPSAsset, isUPSModalOpen, upsAssets.length, company]);

  if (!isUPSModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tag = assetTag.trim() || `UPS-${company.startsWith('Auto') ? 'AUT' : 'LEB'}-${Date.now().toString().slice(-4)}`;

    const payload: Omit<UPSAsset, 'id' | 'createdAt' | 'updatedAt'> = {
      assetTag: tag,
      company,
      site,
      name: name.trim() || `Onduleur ${brand} ${model}`.trim(),
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingUPSAsset ? "Modifier l'Onduleur UPS" : "Nouvel Onduleur UPS"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Protection électrique, régulation de tension et autonomie batterie Lebrun S.A.
              </p>
            </div>
          </div>
          <button
            onClick={closeUPSModal}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Section 1: Identification & Société */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-700" />
              <span>Identification & Société</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Code Asset Tag <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  required
                  placeholder="UPS-LEB-001"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Société Titulaire <span className="text-red-500">*</span>
                </label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 cursor-pointer text-xs"
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
                <select
                  value={site}
                  required
                  onChange={(e) => setSite(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 cursor-pointer text-xs"
                >
                  <option value="">Sélectionner un site...</option>
                  <option value="Delmas 52">Delmas 52</option>
                  <option value="Pétion-Ville">Pétion-Ville</option>
                  <option value="Delmas 60">Delmas 60</option>
                  <option value="Canapé-Vert">Canapé-Vert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                Désignation de l'Onduleur <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="ex: Onduleur Serveur / Direction (Forza 1000VA)"
                className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400 text-xs"
              />
            </div>
          </div>

          {/* Section 2: Spécifications Électriques & Matériel */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-slate-700" />
              <span>Spécifications Électriques & Matériel</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Marque <span className="text-red-500">*</span>
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400 cursor-pointer text-xs"
                >
                  <option value="Forza">Forza</option>
                  <option value="APC">APC (Schneider Electric)</option>
                  <option value="CyberPower">CyberPower</option>
                  <option value="Eaton">Eaton</option>
                  <option value="Tripp Lite">Tripp Lite</option>
                  <option value="Autre">Autre marque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Modèle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                  placeholder="ex: NT-1011D, Back-UPS 1000..."
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Capacité Électrique (VA / W) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  placeholder="ex: 1000 VA / 500 W"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Référence / N° Fabricant
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="ex: NT-1011D"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  État / Statut
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400 cursor-pointer text-xs"
                >
                  <option value="En fonctionnement">En fonctionnement (Opérationnel)</option>
                  <option value="En réserve">En réserve (Disponible)</option>
                  <option value="En maintenance">En maintenance</option>
                  <option value="Batterie à remplacer">Batterie à remplacer</option>
                  <option value="Défectueux">Défectueux</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Observations */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
              Caractéristiques & Spécifications
            </label>
            <input
              type="text"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="ex: Entrée 110–120 Vac, sortie 110–120 Vac, autonomie estimée 25 min..."
              className="w-full h-10 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 text-xs"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={closeUPSModal}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs transition-all active:scale-95 cursor-pointer text-xs"
            >
              {editingUPSAsset ? "Enregistrer les modifications" : "Ajouter au Parc Onduleurs"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
