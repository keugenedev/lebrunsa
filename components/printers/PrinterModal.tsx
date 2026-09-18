'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { PrinterAsset } from '@/types/inventory';
import { X, Printer, ShieldCheck, Tag, MapPin } from 'lucide-react';

export default function PrinterModal() {
  const {
    isPrinterModalOpen,
    closePrinterModal,
    editingPrinter,
    addPrinter,
    updatePrinter,
    printers
  } = useInventory();

  const [formData, setFormData] = useState<{
    company: string;
    site: string;
    name: string;
    brand: string;
    model: string;
    serialNumber: string;
    ipAddress: string;
    type: string;
    status: 'Fonctionnel' | 'Maintenance' | 'En panne';
    observations: string;
  }>({
    company: 'Lebrun S.A.',
    site: 'Delmas 52',
    name: '',
    brand: 'Hp',
    model: '',
    serialNumber: '',
    ipAddress: '',
    type: 'Multifonction',
    status: 'Fonctionnel',
    observations: 'Good'
  });

  useEffect(() => {
    if (editingPrinter) {
      setFormData({
        company: editingPrinter.company,
        site: editingPrinter.site,
        name: editingPrinter.name,
        brand: editingPrinter.brand,
        model: editingPrinter.model,
        serialNumber: editingPrinter.serialNumber,
        ipAddress: editingPrinter.ipAddress,
        type: editingPrinter.type,
        status: editingPrinter.status,
        observations: editingPrinter.observations || 'Good'
      });
    } else {
      setFormData({
        company: 'Lebrun S.A.',
        site: 'Delmas 52',
        name: '',
        brand: 'Hp',
        model: '',
        serialNumber: '',
        ipAddress: '',
        type: 'Multifonction',
        status: 'Fonctionnel',
        observations: 'Good'
      });
    }
  }, [editingPrinter, isPrinterModalOpen]);

  if (!isPrinterModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.model.trim()) return;

    if (editingPrinter) {
      updatePrinter(editingPrinter.id, formData);
    } else {
      const code = formData.company.startsWith('Lebrun')
        ? 'LEB'
        : formData.company.startsWith('Auto')
        ? 'AUT'
        : formData.company.startsWith('Caribe')
        ? 'CAR'
        : 'LFD';
      const count = printers.filter(p => p.company === formData.company).length + 1;
      const tag = `PRN-${code}-${count.toString().padStart(3, '0')}`;

      addPrinter({
        ...formData,
        assetTag: tag
      });
    }
    closePrinterModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/30 border border-red-400/40 flex items-center justify-center text-red-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                {editingPrinter ? "Modifier l'Imprimante" : "Nouvelle Imprimante / Copieur"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Parc d'impression et réseau Lebrun S.A.
              </p>
            </div>
          </div>
          <button
            onClick={closePrinterModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Entreprise</label>
              <select
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="Lebrun S.A.">Lebrun S.A.</option>
                <option value="Autobiz">Autobiz</option>
                <option value="Caribe Motors">Caribe Motors</option>
                <option value="Leader Foods">Leader Foods</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Site / Emplacement</label>
              <select
                value={formData.site}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="Delmas 52">Delmas 52</option>
                <option value="Aéroport Depot">Aéroport Depot</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Nom de l'imprimante</label>
            <input
              type="text"
              required
              placeholder="ex: Hp Laser jet pro, Hp Ernst..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Marque</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="ex: HP, Canon, Epson, Brother..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Modèle</label>
              <input
                type="text"
                required
                placeholder="ex: 4103dw, M479dw..."
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Numéro de Série (S/N)</label>
              <input
                type="text"
                required
                placeholder="ex: THBTT5R0..."
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-mono uppercase text-slate-900 select-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Adresse IP Réseau</label>
              <input
                type="text"
                placeholder="ex: 192.168.1.175 (ou N/A)"
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-mono text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Type d'imprimante</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="Multifonction">Multifonction</option>
                <option value="Laser">Laser</option>
                <option value="Laser (Cheque)">Laser (Cheque)</option>
                <option value="Matricielle">Matricielle</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">État</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Fonctionnel' | 'Maintenance' | 'En panne' })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="Fonctionnel">Fonctionnel</option>
                <option value="Maintenance">Maintenance</option>
                <option value="En panne">En panne</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Observations / Notes</label>
            <input
              type="text"
              placeholder="Good, Toner à prévoir, etc."
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closePrinterModal}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors shadow-xs cursor-pointer"
            >
              {editingPrinter ? "Enregistrer les modifications" : "Ajouter l'Imprimante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
