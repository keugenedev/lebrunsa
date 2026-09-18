'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { PrinterAsset } from '@/types/inventory';
import { X, Printer, ShieldCheck, Tag, MapPin, Building, Plus } from 'lucide-react';

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
    site: '',
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    ipAddress: '',
    type: 'Multifonction',
    status: 'Fonctionnel',
    observations: ''
  });

  useEffect(() => {
    if (editingPrinter) {
      setFormData({
        company: editingPrinter.company || 'Lebrun S.A.',
        site: editingPrinter.site || '',
        name: editingPrinter.name || '',
        brand: editingPrinter.brand || '',
        model: editingPrinter.model || '',
        serialNumber: editingPrinter.serialNumber || '',
        ipAddress: editingPrinter.ipAddress || '',
        type: editingPrinter.type || 'Multifonction',
        status: editingPrinter.status || 'Fonctionnel',
        observations: editingPrinter.observations || ''
      });
    } else {
      setFormData({
        company: 'Lebrun S.A.',
        site: '',
        name: '',
        brand: '',
        model: '',
        serialNumber: '',
        ipAddress: '',
        type: 'Multifonction',
        status: 'Fonctionnel',
        observations: ''
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingPrinter ? "Modifier l'Imprimante / Copieur" : "Ajouter une Imprimante / Copieur"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Parc d'impression réseau, multifonctions laser et imprimantes de chèques
              </p>
            </div>
          </div>
          <button
            onClick={closePrinterModal}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Société Titulaire <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
                  value={formData.site}
                  required
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
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
                Désignation de l'Imprimante <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ex: HP LaserJet Pro M404dn (Comptabilité)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400 text-xs"
              />
            </div>
          </div>

          {/* Section 2: Matériel & Réseau */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5 text-slate-700" />
              <span>Matériel & Spécifications Réseau</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Marque <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="printer-brands"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Choisir ou saisir (HP, Canon...)"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 text-xs"
                />
                <datalist id="printer-brands">
                  <option value="HP" />
                  <option value="Canon" />
                  <option value="Epson" />
                  <option value="Brother" />
                  <option value="Kyocera" />
                  <option value="Ricoh" />
                  <option value="Xerox" />
                </datalist>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Modèle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: LaserJet Pro MFP 4103dw"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  N° de Série (SN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: THBTT5R0..."
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold uppercase focus:outline-none focus:border-slate-400 text-xs select-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Adresse IP Réseau
                </label>
                <input
                  type="text"
                  placeholder="ex: 192.168.1.175 (ou N/A)"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-slate-400 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Type & État Opérationnel */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
              <span>Type d'Équipement & État</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Type d'équipement
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400 cursor-pointer text-xs"
                >
                  <option value="Multifonction">Multifonction</option>
                  <option value="Laser">Laser</option>
                  <option value="Laser (Cheque)">Laser (Cheque)</option>
                  <option value="Étiquette">Étiquette</option>
                  <option value="Matricielle">Matricielle</option>
                  <option value="Jet d'encre">Jet d'encre</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  État de l'Imprimante
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Fonctionnel' | 'Maintenance' | 'En panne' })}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400 cursor-pointer text-xs"
                >
                  <option value="Fonctionnel">Fonctionnel (Opérationnel)</option>
                  <option value="Maintenance">Maintenance (Toner / Révision)</option>
                  <option value="En panne">En panne (Défectueux)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Observations & Remarques */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
              Observations & Remarques
            </label>
            <input
              type="text"
              placeholder="ex: Toner neuf installé, réservé au département comptabilité..."
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="w-full h-10 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={closePrinterModal}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs transition-all active:scale-95 cursor-pointer text-xs"
            >
              {editingPrinter ? 'Enregistrer les modifications' : "Créer l'Imprimante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
