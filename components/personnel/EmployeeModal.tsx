'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Employee } from '@/types/inventory';
import { X, UserPlus, UserCheck, Building, Mail, Phone, MapPin, Briefcase, FileText } from 'lucide-react';

export default function EmployeeModal() {
  const { 
    isEmployeeModalOpen, 
    closeEmployeeModal, 
    editingEmployee, 
    addEmployee, 
    updateEmployee 
  } = useInventory();

  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('Lebrun S.A.');
  const [site, setSite] = useState('');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'active' | 'on_leave' | 'inactive'>('active');
  const [hireDate, setHireDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingEmployee) {
      setEmployeeId(editingEmployee.employeeId);
      setCompany(editingEmployee.company || 'Lebrun S.A.');
      setSite(editingEmployee.site || '');
      setFullName(editingEmployee.fullName);
      setEmail(editingEmployee.email);
      setPhone(editingEmployee.phone || '');
      setDepartment(editingEmployee.department || '');
      setJobTitle(editingEmployee.jobTitle || '');
      setLocation(editingEmployee.location || '');
      setStatus(editingEmployee.status);
      setHireDate(editingEmployee.hireDate);
      setNotes(editingEmployee.notes || '');
    } else {
      const rand = Math.floor(Math.random() * 900 + 100);
      setEmployeeId(`EMP-LEB-${rand}`);
      setCompany('Lebrun S.A.');
      setSite('');
      setFullName('');
      setEmail('');
      setPhone('');
      setDepartment('');
      setJobTitle('');
      setLocation('');
      setStatus('active');
      setHireDate(new Date().toISOString().slice(0, 10));
      setNotes('');
    }
  }, [editingEmployee, isEmployeeModalOpen]);

  if (!isEmployeeModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts.length > 1 ? nameParts[0] : fullName;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const payload = {
      employeeId,
      company,
      site,
      lastName: editingEmployee?.lastName || lastName,
      firstName: editingEmployee?.firstName || firstName,
      fullName,
      email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@lebrunsa.com`,
      phone,
      department,
      jobTitle,
      location: site,
      status,
      hireDate,
      notes,
      workstation: editingEmployee?.workstation,
      accounts: editingEmployee?.accounts
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, payload);
    } else {
      addEmployee(payload);
    }

    closeEmployeeModal();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl bg-white border border-slate-200 shadow-2xl rounded-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingEmployee ? 'Modifier la Fiche Collaborateur' : 'Nouveau Collaborateur Lebrun S.A.'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Gestion des matricules, coordonnées et affectations professionnelles
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeEmployeeModal}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Section 1: Identification Salarié */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Identification Salarié</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                  Matricule (ID Salarié) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="EMP-LEB-001"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                  Nom Complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ex: Jean Pierre"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">Email Professionnel</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@lebrunsa.com"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">Téléphone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="509-3701-2001"
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">Statut Collaborateur</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  <option value="active">Actif en poste</option>
                  <option value="on_leave">En mission / Congé</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Affectation & Entreprise */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Affectation & Entreprise</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                  Entreprise <span className="text-red-500">*</span>
                </label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  <option value="Lebrun S.A.">Lebrun S.A.</option>
                  <option value="Autobiz">Autobiz</option>
                  <option value="Caribe Motors">Caribe Motors</option>
                  <option value="Leader Foods">Leader Foods</option>
                  <option value="Tirezone">Tirezone</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                  Site d&apos;affectation <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  <option value="">Sélectionner un site...</option>
                  <option value="Delmas 52">Delmas 52</option>
                  <option value="Pétion-Ville">Pétion-Ville</option>
                  <option value="Delmas 60">Delmas 60</option>
                  <option value="Canapé-Vert">Canapé-Vert</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                  Département
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  <option value="">Non renseigné / En attente...</option>
                  <option value="Informatique & Systèmes (IT)">Informatique & Systèmes (IT)</option>
                  <option value="Administration & Direction">Administration & Direction</option>
                  <option value="Opérations Commerciales">Opérations Commerciales</option>
                  <option value="Recouvrement & Finances">Recouvrement & Finances</option>
                  <option value="Ventes & Commercial">Ventes & Commercial</option>
                  <option value="Logistique & Stocks">Logistique & Stocks</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                  Poste / Fonction
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="ex: Poste à renseigner..."
                  className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Notes & Commentaires */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Notes & Commentaires</span>
            </div>

            <div>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations générales, matériel complémentaire ou remarques..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            {/* Empty space, actions moved to fixed modal footer */}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 p-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={closeEmployeeModal}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={(e) => {
              const form = (e.currentTarget.closest('.bg-white') as HTMLElement)?.querySelector('form');
              if (form) form.requestSubmit();
            }}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            {editingEmployee ? 'Enregistrer les modifications' : 'Créer le Collaborateur'}
          </button>
        </div>
      </div>
    </div>
  );
}
