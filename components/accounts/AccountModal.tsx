'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  X,
  ShieldCheck,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  UserPlus,
  CheckCircle2
} from 'lucide-react';

export default function AccountModal() {
  const {
    isAccountModalOpen,
    closeAccountModal,
    editingAccount,
    addITAccount,
    updateITAccount,
    employees,
    applicationAccounts
  } = useInventory();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [poste, setPoste] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAccount) {
      setSelectedUserId(editingAccount.userId || '');
      setCode(editingAccount.userId || editingAccount.username || '');
      setFullName(editingAccount.fullName || '');
      setEmail(editingAccount.email || '');
      setPoste(editingAccount.poste || editingAccount.specialty || editingAccount.role || '');
      setPassword(editingAccount.password || editingAccount.passwordHint || '');
      setShowPassword(false);
      setErrorMsg('');
    } else {
      setSelectedUserId('');
      setCode('');
      setFullName('');
      setEmail('');
      setPoste('');
      setPassword('');
      setShowPassword(false);
      setErrorMsg('');
    }
  }, [editingAccount, isAccountModalOpen]);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setErrorMsg('');

    if (!userId) {
      setCode(''); setFullName(''); setEmail(''); setPoste(''); setPassword('');
      return;
    }

    const emp = employees.find(e => e.employeeId === userId);
    if (emp) {
      setCode(emp.employeeId);
      setFullName(emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim());
      setEmail(emp.email || '');
      setPoste(emp.jobTitle || emp.position || emp.department || '');

      const appAcc = applicationAccounts.find(a =>
        (a.employeeId && a.employeeId === emp.employeeId) ||
        (a.username && emp.email && a.username.toLowerCase() === emp.email.split('@')[0].toLowerCase())
      );
      setPassword(appAcc?.password || '');
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 10; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    setPassword(res);
    setShowPassword(true);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!selectedUserId && !editingAccount) { setErrorMsg('Veuillez selectionner un collaborateur.'); return; }
    if (!password.trim()) { setErrorMsg('Le mot de passe est obligatoire.'); return; }

    setIsSubmitting(true);
    try {
      const emp = employees.find(e => e.employeeId === (selectedUserId || editingAccount?.userId));
      const username = email ? email.split('@')[0].toLowerCase() : (code || '').toLowerCase();
      const accountData = {
        userId: selectedUserId || editingAccount?.userId || undefined,
        fullName: fullName.trim(),
        firstName: fullName.trim().split(/\s+/)[0] || '',
        lastName: fullName.trim().split(/\s+/).slice(1).join(' ') || '',
        username,
        email: email.trim().toLowerCase(),
        role: 'Technicien Support & Maintenance' as const,
        company: emp?.company || 'Lebrun S.A.',
        site: emp?.site || 'Delmas 52',
        status: 'active' as const,
        poste: poste.trim() || undefined,
        specialty: poste.trim() || undefined,
        password: password.trim(),
        passwordHint: password.trim()
      };

      const res = editingAccount
        ? await updateITAccount(editingAccount.id, accountData)
        : await addITAccount(accountData);

      if (res?.success !== false) closeAccountModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAccountModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tete */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                {editingAccount ? 'Modifier le Compte' : 'Attribuer un Mot de Passe'}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {editingAccount
                  ? `Mise a jour — ${editingAccount.fullName}`
                  : 'Selectionnez un collaborateur et definissez son acces'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAccountModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Selecteur */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              Choisir le collaborateur
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => handleUserSelect(e.target.value)}
              disabled={!!editingAccount}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">— Selectionner un collaborateur —</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  [{emp.employeeId}] {emp.fullName} — {emp.company || 'Lebrun S.A.'}
                </option>
              ))}
            </select>
            {selectedUserId && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Matricule : <span className="font-mono font-bold text-emerald-900 ml-1">{selectedUserId}</span>
                <span className="ml-1">— Informations chargees.</span>
              </div>
            )}
          </div>

          {/* Carte informations */}
          {(selectedUserId || editingAccount) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Code</p>
                <p className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1.5 rounded-lg">
                  {code || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Poste</p>
                <p className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-2 py-1.5 rounded-lg truncate" title={poste}>
                  {poste || '—'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nom complet</p>
                <p className="text-xs font-semibold text-slate-900 bg-white border border-slate-200 px-2 py-1.5 rounded-lg">
                  {fullName || '—'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-xs text-slate-700 bg-white border border-slate-200 px-2 py-1.5 rounded-lg">
                  {email || '—'}
                </p>
              </div>
            </div>
          )}

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Mot de passe <span className="text-rose-500 ml-0.5">*</span>
              </span>
              {errorMsg && <span className="text-[11px] text-rose-500 font-normal">{errorMsg}</span>}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Saisissez ou generez un mot de passe..."
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  className={`w-full pr-10 pl-3 py-2 text-xs rounded-xl border font-mono bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all ${
                    errorMsg && !password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={generatePassword}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Generer
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Connexion via <span className="font-medium text-slate-500">email + mot de passe</span> uniquement.
            </p>
          </div>

          {/* Boutons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeAccountModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-xl shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : editingAccount ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Enregistrer
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  Attribuer le Mot de Passe
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
