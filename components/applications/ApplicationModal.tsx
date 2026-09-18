'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ApplicationAccount } from '@/types/inventory';
import { X, KeyRound, User, Lock, Eye, EyeOff, ShieldCheck, Building } from 'lucide-react';

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
      setPassword('1234');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                {editingApplicationAccount ? "Modifier l'Accès Applicatif" : "Nouvel Accès & Identifiant"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Comptes utilisateurs, habilitations logicielles et mots de passe GP
              </p>
            </div>
          </div>
          <button
            onClick={closeApplicationModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Username */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Identifiant / Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-mono font-bold text-slate-900"
                  placeholder="ex: rmdguerrier, autobiz1..."
                />
              </div>
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Prénom du Collaborateur</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                placeholder="Roody-Max-Dominique"
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Nom de Famille</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                placeholder="Guerrier"
              />
            </div>

            {/* Mot de Passe */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Mot de Passe Applicatif</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-mono font-semibold text-slate-900"
                  placeholder="Mot de passe"
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

            {/* Applications */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Applications Autorisées</label>
              <input
                type="text"
                value={applications}
                onChange={(e) => setApplications(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-slate-800"
                placeholder="Microsoft GP, Outlook, Sage..."
              />
            </div>

            {/* Organisation */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Organisation / Entité</label>
              <select
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="Lebrun S.A.">Lebrun S.A.</option>
                <option value="Autobiz S.A.">Autobiz S.A.</option>
                <option value="Lebrun S.A. | Autobiz S.A.">Lebrun S.A. | Autobiz S.A.</option>
                <option value="Caribe Motors">Caribe Motors</option>
                <option value="Leader Foods">Leader Foods</option>
              </select>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeApplicationModal}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors shadow-xs cursor-pointer"
            >
              {editingApplicationAccount ? "Enregistrer les modifications" : "Ajouter l'Accès"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
