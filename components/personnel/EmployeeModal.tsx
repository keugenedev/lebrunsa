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
  const [company, setCompany] = useState('Lebrun S.A.');
  const [site, setSite] = useState('Delmas 52');
  const [department, setDepartment] = useState('Administration / IT');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('Delmas 52');
  const [status, setStatus] = useState<'active' | 'on_leave' | 'inactive'>('active');
  const [hireDate, setHireDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  // Workstation specs
  const [pcName, setPcName] = useState('');
  const [pcSerial, setPcSerial] = useState('');
  const [pcSpecs, setPcSpecs] = useState('');
  const [monitorModel, setMonitorModel] = useState('Dell 22"');
  const [monitorSerial, setMonitorSerial] = useState('');
  const [appUsername, setAppUsername] = useState('');

  useEffect(() => {
    if (editingEmployee) {
      setEmployeeId(editingEmployee.employeeId);
      setCompany(editingEmployee.company || 'Lebrun S.A.');
      setSite(editingEmployee.site || 'Delmas 52');
      setFullName(editingEmployee.fullName);
      setEmail(editingEmployee.email);
      setPhone(editingEmployee.phone || '');
      setDepartment(editingEmployee.department);
      setJobTitle(editingEmployee.jobTitle);
      setLocation(editingEmployee.location || 'Delmas 52');
      setStatus(editingEmployee.status);
      setHireDate(editingEmployee.hireDate);
      setNotes(editingEmployee.notes || '');

      setPcName(editingEmployee.workstation?.pcName || '');
      setPcSerial(editingEmployee.workstation?.pcSerial || '');
      setPcSpecs(editingEmployee.workstation?.pcSpecs || '');
      setMonitorModel(editingEmployee.workstation?.monitorModel || 'Dell 22"');
      setMonitorSerial(editingEmployee.workstation?.monitorSerial || '');
      setAppUsername(editingEmployee.accounts?.appUsername || '');
    } else {
      const rand = Math.floor(Math.random() * 900 + 100);
      setEmployeeId(`EMP-LEB-${rand}`);
      setCompany('Lebrun S.A.');
      setSite('Delmas 52');
      setFullName('');
      setEmail('');
      setPhone('509-3');
      setDepartment('Administration / IT');
      setJobTitle('');
      setLocation('Delmas 52');
      setStatus('active');
      setHireDate(new Date().toISOString().slice(0, 10));
      setNotes('');
      setPcName('');
      setPcSerial('');
      setPcSpecs('Windows 11 Pro • Intel Core i5 • 8 GB RAM • 500 GB SSD');
      setMonitorModel('Dell 22"');
      setMonitorSerial('');
      setAppUsername('');
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
      workstation: pcName ? {
        type: 'Desktop',
        pcName,
        pcSerial,
        pcSpecs: pcSpecs || 'Windows 11 Pro Intel Core i5 8GB RAM 500GB SSD',
        monitorModel,
        monitorSerial,
        monitorObs: 'Good',
        keyboard: 'Clavier Dell',
        keyboardDetails: 'Alpha-numérique',
        keyboardObs: 'Good',
        mouse: 'Souris Dell',
        mouseDetails: 'Optique',
        mouseObs: 'Good',
        generalState: 'Good',
        observations: 'Good'
      } : editingEmployee?.workstation,
      accounts: appUsername ? {
        windowsUsername: fullName,
        appUsername,
        applications: 'Microsoft GP',
        organization: company
      } : editingEmployee?.accounts
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
      <div className="lebron-card w-full max-w-2xl 2xl:max-w-3xl bg-white border border-slate-200 shadow-2xl p-6 2xl:p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 2xl:pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <UserPlus className="w-5 h-5 2xl:w-6 2xl:h-6" />
            </div>
            <div>
              <h3 className="text-base 2xl:text-xl font-bold text-slate-900">
                {editingEmployee ? 'Modifier la Fiche Collaborateur' : 'Nouveau Collaborateur Lebrun S.A.'}
              </h3>
              <p className="text-xs 2xl:text-sm text-slate-500">
                Gestion des matricules, affectations et postes de travail Dell
              </p>
            </div>
          </div>
          <button
            onClick={closeEmployeeModal}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs 2xl:text-sm">
          {/* Entreprise & Site */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Entreprise *</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="Lebrun S.A.">Lebrun S.A.</option>
                <option value="Autobiz">Autobiz</option>
                <option value="Caribe Motors">Caribe Motors</option>
                <option value="Leader Foods">Leader Foods</option>
                <option value="Tirezone">Tirezone</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Site d&apos;affectation *</label>
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="Delmas 52">Delmas 52</option>
                <option value="Aéroport Depot">Aéroport Depot</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Matricule (ID Salarié) *</label>
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="EMP-LEB-001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Professionnel</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@lebrunsa.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Téléphone de Contact</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="509-3701-2001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Département *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="Administration / IT">Administration / IT</option>
                <option value="Opérations Commerciales">Opérations Commerciales</option>
                <option value="Recouvrement & Finances">Recouvrement & Finances</option>
                <option value="Ventes & Commercial">Ventes & Commercial</option>
                <option value="Direction & Opérations">Direction & Opérations</option>
                <option value="Administration Générale">Administration Générale</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Poste / Fonction *</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="ex: Responsable Administratif & IT"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          {/* Section Matériel & Station Dell */}
          <div className="pt-3 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">Station de Travail Dell & Écran</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 text-[11px] 2xl:text-xs">Nom du Poste (PC)</label>
                <input
                  type="text"
                  value={pcName}
                  onChange={(e) => setPcName(e.target.value)}
                  placeholder="LEBHWP6KH2"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 text-[11px] 2xl:text-xs">N° de Série (SN) PC</label>
                <input
                  type="text"
                  value={pcSerial}
                  onChange={(e) => setPcSerial(e.target.value)}
                  placeholder="HWP6KH2"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 text-[11px] 2xl:text-xs">Modèle Écran</label>
                <input
                  type="text"
                  value={monitorModel}
                  onChange={(e) => setMonitorModel(e.target.value)}
                  placeholder="Dell 22 pouces"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 text-[11px] 2xl:text-xs">Compte Microsoft GP</label>
              <input
                type="text"
                value={appUsername}
                onChange={(e) => setAppUsername(e.target.value)}
                placeholder="rmdguerrier"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 text-[11px] 2xl:text-xs">Statut Collaborateur</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-medium"
              >
                <option value="active">Actif en poste</option>
                <option value="on_leave">En mission / Congé</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Notes / Commentaires</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Poste principal Lebrun S.A. & Autobiz S.A..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={closeEmployeeModal}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              {editingEmployee ? 'Enregistrer les modifications' : 'Créer le Collaborateur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
