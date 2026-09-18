'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ApplicationAccount } from '@/types/inventory';
import { X, KeyRound, User, Lock, Eye, EyeOff, ShieldCheck, Building, Plus } from 'lucide-react';

export default function ApplicationModal() {
  const {
    isApplicationModalOpen,
    closeApplicationModal,
    editingApplicationAccount,
    addApplicationAccount,
    updateApplicationAccount
  } = useInventory();

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [applications, setApplications] = useState('Microsoft GP');
  const [organization, setOrganization] = useState('Lebrun S.A.');

  useEffect(() => {
    if (editingApplicationAccount) {
      setUsername(editingApplicationAccount.username || '');
      setFirstName(editingApplicationAccount.firstName || '');
      setLastName(editingApplicationAccount.lastName || '');
      setPassword(editingApplicationAccount.password || '');
      setApplications(editingApplicationAccount.applications || 'Microsoft GP');
      setOrganization(editingApplicationAccount.organization || 'Lebrun S.A.');
    } else {
      setUsername('');
      setFirstName('');
      setLastName('');
      setPassword('');
      setApplications('Microsoft GP');
      setOrganization('Lebrun S.A.');
      setShowPassword(false);
    }
  }, [editingApplicationAccount, isApplicationModalOpen]);

  if (!isApplicationModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Omit<ApplicationAccount, 'id'> = {
      username: username.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password: password.trim() || '1234',
      applications: applications.trim() || 'Microsoft GP',
      organization: organization.trim() || 'Lebrun S.A.'
    };

    if (editingApplicationAccount) {
      updateApplicationAccount(editingApplicationAccount.id, payload);
    } else {
      addApplicationAccount(payload);
    }

    closeApplicationModal();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white border border-slate-200 shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingApplicationAccount ? "Modifier l'Accès Applicatif" : "Nouvel Accès & Identifiant"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Comptes utilisateurs, habilitations logicielles et mots de passe Microsoft GP
              </p>
            </div>
          </div>
          <button
            onClick={closeApplicationModal}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Section 1: Identifiant & Collaborateur */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-700" />
              <span>Identifiant & Collaborateur</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                Identifiant / Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full h-10 pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-mono font-bold text-slate-900 text-xs"
                  placeholder="ex: rmdguerrier, autobiz1..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Prénom du Collaborateur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="ex: Roody-Max-Dominique"
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Nom de Famille <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="ex: Guerrier"
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sécurité & Organisation */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
              <span>Sécurité, Habilitations & Organisation</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                Mot de Passe Applicatif <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-10 pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-mono font-semibold text-slate-900 text-xs"
                  placeholder="Saisir mot de passe..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Applications Autorisées <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={applications}
                  onChange={(e) => setApplications(e.target.value)}
                  required
                  placeholder="Microsoft GP, Outlook, Sage..."
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Organisation / Entité <span className="text-red-500">*</span>
                </label>
                <select
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-900 cursor-pointer text-xs"
                >
                  <option value="Lebrun S.A.">Lebrun S.A.</option>
                  <option value="Autobiz S.A.">Autobiz S.A.</option>
                  <option value="Lebrun S.A. | Autobiz S.A.">Lebrun S.A. | Autobiz S.A.</option>
                  <option value="Caribe Motors">Caribe Motors</option>
                  <option value="Leader Foods">Leader Foods</option>
                  <option value="Tirezone">Tirezone</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={closeApplicationModal}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs transition-all active:scale-95 cursor-pointer text-xs"
            >
              {editingApplicationAccount ? "Enregistrer les modifications" : "Ajouter l'Accès"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
