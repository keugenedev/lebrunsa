'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  X,
  ShieldCheck,
  UserCheck,
  UserPlus,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  Info
} from 'lucide-react';

const MIN_LENGTH = 8;
// Sans caractères ambigus (ni 0/O, ni 1/l/I)
const PASSWORD_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%';

function generatePassword(length = 12): string {
  const bytes = new Uint32Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else bytes.forEach((_, i) => (bytes[i] = Math.floor(Math.random() * 0xffffffff)));
  return Array.from(bytes, b => PASSWORD_ALPHABET[b % PASSWORD_ALPHABET.length]).join('');
}

/** La fenêtre n'existe que lorsqu'elle est ouverte : le formulaire repart de zéro à chaque ouverture. */
export default function AccountModal() {
  const { isAccountModalOpen, editingAccount } = useInventory();
  if (!isAccountModalOpen) return null;
  return <AccountForm key={editingAccount?.id ?? 'new'} />;
}

function AccountForm() {
  const { closeAccountModal, editingAccount, addITAccount, setAccountPassword, employees, itAccounts } = useInventory();

  // Avec un compte sélectionné dans la liste : on réinitialise son mot de passe. Sinon : création d'un accès.
  const isReset = Boolean(editingAccount);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emp = employees.find(e => e.employeeId === selectedUserId);
  const fullName = isReset
    ? editingAccount!.fullName
    : emp ? emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : '';
  const email = isReset ? editingAccount!.email : emp?.email || '';
  const poste = isReset
    ? editingAccount!.poste || editingAccount!.specialty || ''
    : emp ? emp.jobTitle || emp.position || emp.department || '' : '';

  // Les collaborateurs qui ont déjà un accès ne sont plus proposés
  const withAccess = new Set(itAccounts.map(a => a.userId).filter(Boolean));
  const available = employees.filter(e => !withAccess.has(e.employeeId));

  const handleGenerate = () => {
    setPassword(generatePassword());
    setShowPassword(true);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!isReset && !emp) { setErrorMsg('Veuillez sélectionner un collaborateur.'); return; }
    if (!isReset && !email.trim()) { setErrorMsg("Ce collaborateur n'a pas d'adresse email : ajoutez-la dans Personnel."); return; }
    if (password.length < MIN_LENGTH) { setErrorMsg(`Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`); return; }

    setIsSubmitting(true);
    try {
      let res;
      if (isReset) {
        res = await setAccountPassword(editingAccount!, password);
      } else {
        res = await addITAccount(
          {
            userId: emp!.employeeId,
            fullName: fullName.trim(),
            firstName: fullName.trim().split(/\s+/)[0] || '',
            lastName: fullName.trim().split(/\s+/).slice(1).join(' ') || '',
            username: email.split('@')[0].toLowerCase(),
            email: email.trim().toLowerCase(),
            role: 'Technicien Support & Maintenance' as const,
            company: emp!.company || 'Lebrun S.A.',
            site: emp!.site || 'Delmas 52',
            status: 'active' as const,
            poste: poste.trim() || undefined,
            specialty: poste.trim() || undefined
          },
          password
        );
      }

      if (res?.success !== false) closeAccountModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
              {isReset ? <KeyRound className="w-5 h-5 text-emerald-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                {isReset ? 'Réinitialiser le mot de passe' : 'Créer un accès'}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isReset ? `Nouveau mot de passe pour ${editingAccount!.fullName}` : 'Choisissez la personne et définissez son mot de passe'}
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
          {/* Sélecteur (création seulement) */}
          {!isReset && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                Choisir le collaborateur
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => { setSelectedUserId(e.target.value); setErrorMsg(''); }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
              >
                <option value="">— Sélectionner un collaborateur —</option>
                {available.map((c) => (
                  <option key={c.employeeId} value={c.employeeId}>
                    [{c.employeeId}] {c.fullName} — {c.company || 'Lebrun S.A.'}
                  </option>
                ))}
              </select>
              {selectedUserId && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Matricule : <span className="font-mono font-bold text-emerald-900 ml-1">{selectedUserId}</span>
                </div>
              )}
            </div>
          )}

          {/* Informations de la personne */}
          {(emp || isReset) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nom complet</p>
                <p className="text-xs font-semibold text-slate-900 bg-white border border-slate-200 px-2 py-1.5 rounded-lg">
                  {fullName || '—'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email de connexion</p>
                <p className="text-xs text-slate-700 bg-white border border-slate-200 px-2 py-1.5 rounded-lg">
                  {email || '—'}
                </p>
              </div>
              {poste && (
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Poste</p>
                  <p className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-2 py-1.5 rounded-lg truncate" title={poste}>
                    {poste}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                {isReset ? 'Nouveau mot de passe' : 'Mot de passe'} <span className="text-rose-500 ml-0.5">*</span>
              </span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={`${MIN_LENGTH} caractères minimum`}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  autoComplete="new-password"
                  className={`w-full pr-10 pl-3 py-2 text-xs rounded-xl border font-mono bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all ${
                    errorMsg ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showPassword ? 'Masquer' : 'Afficher pendant la saisie'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Générer
              </button>
            </div>
            {errorMsg && <p className="text-[11px] text-rose-500">{errorMsg}</p>}
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-slate-600 leading-relaxed">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Le mot de passe est enregistré de façon sécurisée : il ne sera plus jamais affiché, ni dans la liste ni ailleurs.
              Communiquez-le à la personne maintenant.
            </span>
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
              ) : isReset ? (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  Enregistrer le nouveau mot de passe
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  Créer l&apos;accès
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
