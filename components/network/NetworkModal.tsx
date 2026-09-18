'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { NetworkAsset } from '@/types/inventory';
import { X, Network, Wifi, Server, ShieldCheck, Tag, MapPin, Building, Plus } from 'lucide-react';

export default function NetworkModal() {
  const {
    isNetworkModalOpen,
    closeNetworkModal,
    editingNetworkAsset,
    addNetworkAsset,
    updateNetworkAsset,
    networkAssets
  } = useInventory();

  const [company, setCompany] = useState('Lebrun S.A.');
  const [site, setSite] = useState('');
  const [deviceType, setDeviceType] = useState('Switch Gigabit rackable');
  const [brand, setBrand] = useState('TP-Link');
  const [model, setModel] = useState('');
  const [hostname, setHostname] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [status, setStatus] = useState('En fonctionnement');
  const [observations, setObservations] = useState('');
  const [assetTag, setAssetTag] = useState('');

  useEffect(() => {
    if (editingNetworkAsset) {
      setCompany(editingNetworkAsset.company || 'Lebrun S.A.');
      setSite(editingNetworkAsset.site || '');
      setDeviceType(editingNetworkAsset.deviceType || 'Switch Gigabit rackable');
      setBrand(editingNetworkAsset.brand || 'TP-Link');
      setModel(editingNetworkAsset.model || '');
      setHostname(editingNetworkAsset.hostname || '');
      setSerialNumber(editingNetworkAsset.serialNumber || '');
      setIpAddress(editingNetworkAsset.ipAddress || '');
      setMacAddress(editingNetworkAsset.macAddress || '');
      setStatus(editingNetworkAsset.status || 'En fonctionnement');
      setObservations(editingNetworkAsset.observations || '');
      setAssetTag(editingNetworkAsset.assetTag || '');
    } else {
      const code = company.startsWith('Auto') ? 'AUT' : 'LEB';
      const count = networkAssets.length + 1;
      setAssetTag(`NET-${code}-${count.toString().padStart(3, '0')}`);
      setCompany('Lebrun S.A.');
      setSite('');
      setDeviceType('Switch Gigabit rackable');
      setBrand('TP-Link');
      setModel('');
      setHostname('');
      setSerialNumber('');
      setIpAddress('');
      setMacAddress('');
      setStatus('En fonctionnement');
      setObservations('');
    }
  }, [editingNetworkAsset, isNetworkModalOpen, networkAssets.length, company]);

  if (!isNetworkModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tag = assetTag.trim() || `NET-${company.startsWith('Auto') ? 'AUT' : 'LEB'}-${Date.now().toString().slice(-4)}`;

    const payload: Omit<NetworkAsset, 'id' | 'createdAt' | 'updatedAt'> = {
      assetTag: tag,
      company,
      site,
      deviceType,
      brand: brand.trim() || 'TP-Link',
      model: model.trim() || 'TL-Gigabit',
      hostname: hostname.trim() || 'NET-DEVICE',
      serialNumber: serialNumber.trim() || `SN-${Date.now().toString().slice(-6)}`,
      ipAddress: ipAddress.trim() || '192.168.1.1',
      macAddress: macAddress.trim() || 'N/A',
      status,
      observations: observations.trim() || 'Bon état de fonctionnement'
    };

    if (editingNetworkAsset) {
      updateNetworkAsset(editingNetworkAsset.id, payload);
    } else {
      addNetworkAsset(payload);
    }

    closeNetworkModal();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingNetworkAsset ? "Modifier l'Équipement Réseau" : "Nouvel Équipement Réseau"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Infrastructure switches TP-Link, PoE, routeurs et bornes réseau Lebrun S.A.
              </p>
            </div>
          </div>
          <button
            onClick={closeNetworkModal}
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
                  placeholder="NET-LEB-001"
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
          </div>

          {/* Section 2: Matériel & Configuration Réseau */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-700" />
              <span>Matériel & Configuration Réseau</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Type d'Équipement <span className="text-red-500">*</span>
                </label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400 cursor-pointer text-xs"
                >
                  <option value="Switch Gigabit rackable">Switch Gigabit rackable</option>
                  <option value="Routeur d'entreprise">Routeur d'entreprise</option>
                  <option value="Point d'Accès Wi-Fi (AP)">Point d'Accès Wi-Fi (AP)</option>
                  <option value="Injecteur PoE">Injecteur PoE</option>
                  <option value="Pare-feu / Firewall">Pare-feu / Firewall</option>
                  <option value="Baie de brassage">Baie de brassage</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Marque <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                  placeholder="TP-Link, Cisco, Ubiquiti..."
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 text-xs"
                />
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
                  placeholder="ex: TL-SG1218MP..."
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Nom d'hôte / Hostname
                </label>
                <input
                  type="text"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  placeholder="Switch-Rack-18P"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  N° de Série (S/N) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  required
                  placeholder="ex: TL-SG1218MP-SN01"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono select-all focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Adresse IP
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="ex: 192.168.1.250"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Adresse MAC
                </label>
                <input
                  type="text"
                  value={macAddress}
                  onChange={(e) => setMacAddress(e.target.value)}
                  placeholder="00:31:92:AB:CD:EF"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono uppercase focus:outline-none focus:border-slate-400 text-xs"
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
                  <option value="En fonctionnement">En fonctionnement (Actif)</option>
                  <option value="En réserve">En réserve (Disponible)</option>
                  <option value="En maintenance">En maintenance</option>
                  <option value="Défectueux">Défectueux</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Observations */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
              Spécifications & Observations
            </label>
            <input
              type="text"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="ex: 18 ports Gigabit, dont 16 ports PoE+, version 5.6..."
              className="w-full h-10 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 text-xs"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={closeNetworkModal}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs transition-all active:scale-95 cursor-pointer text-xs"
            >
              {editingNetworkAsset ? "Enregistrer les modifications" : "Ajouter au Parc Réseau"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
