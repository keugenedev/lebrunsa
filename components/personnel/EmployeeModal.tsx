'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Employee } from '@/types/inventory';
import { X, UserPlus, UserCheck, Building, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

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
  const [department, setDepartment] = useState('Direction IT & Cloud');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('Siège Social');
  const [status, setStatus] = useState<'active' | 'on_leave' | 'inactive'>('active');
  const [hireDate, setHireDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingEmployee) {
      setEmployeeId(editingEmployee.employeeId);
      setFullName(editingEmployee.fullName);
      setEmail(editingEmployee.email);
      setPhone(editingEmployee.phone);
      setDepartment(editingEmployee.department);
      setJobTitle(editingEmployee.jobTitle);
      setLocation(editingEmployee.location);
      setStatus(editingEmployee.status);
      setHireDate(editingEmployee.hireDate);
      setNotes(editingEmployee.notes || '');
    } else {
      const rand = Math.floor(Math.random() * 900 + 100);
      setEmployeeId(`LSA-${rand}`);
      setFullName('');
      setEmail('');
      setPhone('+33 6 ');
      setDepartment('Direction IT & Cloud');
      setJobTitle('');
      setLocation('Siège Social');
      setStatus('active');
      setHireDate(new Date().toISOString().slice(0, 10));
      setNotes('');
    }
  }, [editingEmployee, isEmployeeModalOpen]);

  if (!isEmployeeModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      employeeId,
      fullName,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@lebronsa.com`,
      phone,
      department,
      jobTitle,
      location,
      status,
      hireDate,
      notes
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, payload);
    } else {
      addEmployee(payload);
    }

    closeEmployeeModal();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="lebron-card w-full max-w-xl bg-white border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingEmployee ? 'Modifier la Fiche Collaborateur' : 'Nouveau Collaborateur Lebronsa S.A.'}
              </h3>
              <p className="text-xs text-slate-500">
                Gestion des matricules, départements et affectations
              </p>
            </div>
          </div>
          <button
            onClick={closeEmployeeModal}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Matricule (ID Salarié) *</label>
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="LSA-0105"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nom Complet *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Prénom Nom"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Professionnel</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@lebronsa.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Téléphone de Contact</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 6 00 00 00 00"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Département *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="Direction IT & Cloud">Direction IT & Cloud</option>
                <option value="Data & Intelligence Artificielle">Data & Intelligence Artificielle</option>
                <option value="DevOps & Télécoms">DevOps & Télécoms</option>
                <option value="Opérations Chantiers & Mines">Opérations Chantiers & Mines</option>
                <option value="Opérations Maritimes">Opérations Maritimes</option>
                <option value="Logistique & Approvisionnements">Logistique & Approvisionnements</option>
                <option value="Direction Générale & RH">Direction Générale & RH</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Poste / Fonction *</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="ex: Ingénieur Systèmes..."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Site d&apos;affectation</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Siège, Base Nord..."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-none"
              >
                <option value="active">Actif en poste</option>
                <option value="on_leave">En mission / Congé</option>
                <option value="inactive">Inactif / Départ</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Date d&apos;embauche</label>
              <input
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Notes / Commentaires</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations supplémentaires..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={closeEmployeeModal}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-all active:scale-95"
            >
              {editingEmployee ? 'Enregistrer les modifications' : 'Créer le Collaborateur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
