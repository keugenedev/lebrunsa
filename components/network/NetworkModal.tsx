'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { NetworkAsset } from '@/types/inventory';
import { X, Network, Wifi, Server, ShieldCheck, Tag, MapPin } from 'lucide-react';

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
  const [site, setSite] = useState('Delmas 52');
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
      setSite(editingNetworkAsset.site || 'Delmas 52');
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
      setSite('Delmas 52');
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
  }, [editingNetworkAsset, isNetworkModalOpen, networkAssets.length]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                {editingNetworkAsset ? "Modifier l'Équipement Réseau" : "Nouvel Équipement Réseau"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Infrastructure switches TP-Link, PoE et bornes Wi-Fi Lebrun S.A.
              </p>
            </div>
          </div>
          <button
            onClick={closeNetworkModal}
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
                placeholder="NET-LEB-001"
              />
            </div>

            {/* Type d'équipement */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Type d'Équipement</label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="Switch Gigabit rackable">Switch Gigabit rackable</option>
                <option value="Switch Ethernet">Switch Ethernet</option>
                <option value="Point d'accès / équipement Wi‑Fi">Point d'accès / équipement Wi‑Fi</option>
                <option value="Routeur / Passerelle Réseau">Routeur / Passerelle Réseau</option>
                <option value="Injecteur / Splitter PoE">Injecteur / Splitter PoE</option>
              </select>
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

            {/* Marque */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Marque</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
                placeholder="TP-Link, Cisco..."
              />
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
                placeholder="TL-SG1218MP..."
              />
            </div>

            {/* Hostname */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Nom d'hôte / Hostname</label>
              <input
                type="text"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 font-mono"
                placeholder="Switch-Rack-18P"
              />
            </div>

            {/* N° de Série */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Numéro de Série (S/N)</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 font-mono select-all"
                placeholder="TL-SG1218MP-SN01"
              />
            </div>

            {/* Adresse IP */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Adresse IP</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 font-mono"
                placeholder="192.168.1.250"
              />
            </div>

            {/* Adresse MAC */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Adresse MAC</label>
              <input
                type="text"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 font-mono uppercase"
                placeholder="00:31:92:AB:CD:EF"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">État / Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="En fonctionnement">En fonctionnement</option>
                <option value="En réserve">En réserve</option>
                <option value="En maintenance">En maintenance</option>
                <option value="Défectueux">Défectueux</option>
              </select>
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Spécifications & Observations</label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 resize-none text-slate-800"
              placeholder="Ex: 18 ports Gigabit, dont 16 ports PoE+, version 5.6..."
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeNetworkModal}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors shadow-xs cursor-pointer"
            >
              {editingNetworkAsset ? "Enregistrer les modifications" : "Ajouter au Parc Réseau"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
