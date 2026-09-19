'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ITAccount, ITRole } from '@/types/inventory';
import { 
  X, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Wrench, 
  Lock, 
  FileText, 
  Save, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const IT_ROLES: { value: ITRole; label: string; desc: string }[] = [
  { 
    value: 'Super Administrateur IT', 
    label: 'Super Administrateur IT', 
    desc: 'Accès complet systèmes, serveurs, bases de données et gestion des droits' 
  },
  { 
    value: 'Administrateur Systèmes & Réseaux', 
    label: 'Admin Systèmes & Réseaux', 
    desc: 'Gestion des réseaux Starlink/Cisco, serveurs Windows, sauvegardes et sécurité' 
  },
  { 
    value: 'Technicien Support & Maintenance', 
    label: 'Technicien Support & Maintenance', 
    desc: 'Assistance utilisateurs, dépannage hardware/software et maintenance préventive' 
  },
  { 
    value: 'Technicien Réseaux & Télécoms', 
    label: 'Technicien Réseaux & Télécoms', 
    desc: 'Câblage structuré, points d\'accès Wi-Fi, liaisons satellites et téléphonie' 
  },
  { 
    value: 'Gestionnaire Parc Informatique', 
    label: 'Gestionnaire Parc Informatique', 
    desc: 'Suivi des stocks, affectations de postes, licences et mouvements de matériel' 
  }
];

const COMPANIES = [
  'Lebrun S.A.',
  'Caribe Motors',
  'Autobiz',
  'Leader Foods'
];

export default function AccountModal() {
  const {
    isAccountModalOpen,
    closeAccountModal,
    editingAccount,
    addITAccount,
    updateITAccount,
    itAccounts
  } = useInventory();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ITRole>('Technicien Support & Maintenance');
  const [company, setCompany] = useState('Lebrun S.A.');
  const [site, setSite] = useState('Delmas 52');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [specialty, setSpecialty] = useState('');
  const [passwordHint, setPasswordHint] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingAccount) {
      setFullName(editingAccount.fullName || '');
      setUsername(editingAccount.username || '');
      setEmail(editingAccount.email || '');
      setRole(editingAccount.role || 'Technicien Support & Maintenance');
      setCompany(editingAccount.company || 'Lebrun S.A.');
      setSite(editingAccount.site || 'Delmas 52');
      setPhone(editingAccount.phone || '');
      setStatus(editingAccount.status || 'active');
      setSpecialty(editingAccount.specialty || '');
      setPasswordHint(editingAccount.passwordHint || '');
      setNotes(editingAccount.notes || '');
      setErrors({});
    } else {
      setFullName('');
      setUsername('');
      setEmail('');
      setRole('Technicien Support & Maintenance');
      setCompany('Lebrun S.A.');
      setSite('Delmas 52');
      setPhone('');
      setStatus('active');
      setSpecialty('');
      setPasswordHint('');
      setNotes('');
      setErrors({});
    }
  }, [editingAccount, isAccountModalOpen]);

  if (!isAccountModalOpen) return null;

  // Auto-generate username when typing full name (if adding new)
  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (!editingAccount) {
      const parts = val.trim().split(/\s+/);
      if (parts.length >= 2) {
        const firstLetter = parts[0].charAt(0).toLowerCase();
        const cleanLast = parts.slice(1).join('').toLowerCase().replace(/[^a-z0-9]/g, '');
        setUsername(`${firstLetter}${cleanLast}`);
        if (!email || email.includes('@lebrunsa.com')) {
          setEmail(`${firstLetter}${cleanLast}@lebrunsa.com`);
        }
      } else if (parts.length === 1 && parts[0]) {
        const clean = parts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        setUsername(clean);
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Le nom complet est obligatoire';
    if (!username.trim()) newErrors.username = 'L\'identifiant (@username) est obligatoire';
    if (!email.trim()) newErrors.email = 'L\'adresse email est obligatoire';
    
    // Check duplicate username if new or if changed
    const cleanUser = username.trim().toLowerCase();
    const duplicate = itAccounts.find(a => 
      a.username.toLowerCase() === cleanUser && 
      (!editingAccount || a.id !== editingAccount.id)
    );
    if (duplicate) {
      newErrors.username = `L'identifiant "@${cleanUser}" est déjà utilisé par ${duplicate.fullName}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const trimmedFullName = fullName.trim();
    const parts = trimmedFullName.split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || parts[0] || '';

    const accountData = {
      fullName: trimmedFullName,
      firstName,
      lastName,
      username: username.trim().toLowerCase().replace(/^@/, ''),
      email: email.trim().toLowerCase(),
      role,
      company,
      site: site.trim() || 'Delmas 52',
      phone: phone.trim() || undefined,
      status,
      specialty: specialty.trim() || undefined,
      passwordHint: passwordHint.trim() || undefined,
      notes: notes.trim() || undefined
    };

    if (editingAccount) {
      updateITAccount(editingAccount.id, accountData);
    } else {
      addITAccount(accountData);
    }

    closeAccountModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {editingAccount ? 'Modifier le Compte' : 'Ajouter un Compte'}
              </h2>
              <p className="text-xs text-slate-500">
                {editingAccount 
                  ? `Mise à jour du compte de ${editingAccount.fullName}` 
                  : 'Création d\'un compte pour Lebrun S.A.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAccountModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Identity Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-slate-700" />
              <span>Identité & Coordonnées</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Full Name */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Nom de la personne <span className="text-rose-500">*</span></span>
                  {errors.fullName && <span className="text-[11px] text-rose-500 font-normal">{errors.fullName}</span>}
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Kensly Eugene, Roody-Max Guerrier..."
                  value={fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all ${
                    errors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Identifiant IT (@username) <span className="text-rose-500">*</span></span>
                  {errors.username && <span className="text-[11px] text-rose-500 font-normal">{errors.username}</span>}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    required
                    placeholder="keugene, rguerrier..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                    className={`w-full pl-7 pr-3 py-2 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 font-mono transition-all ${
                      errors.username ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Email Professionnel <span className="text-rose-500">*</span></span>
                  {errors.email && <span className="text-[11px] text-rose-500 font-normal">{errors.email}</span>}
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="it@lebrunsa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all ${
                      errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Téléphone / Contact Direct</label>
                <div className="relative flex items-center">
                  <Phone className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="+509 3700-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Statut du Compte</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      status === 'active'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>Actif</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('inactive')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      status === 'inactive'
                        ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <AlertCircle className={`w-3.5 h-3.5 ${status === 'inactive' ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span>Inactif</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Role & Privileges */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
              <span>Rôle & Responsabilités IT</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Sélectionnez le Rôle IT</label>
              <div className="grid grid-cols-1 gap-2">
                {IT_ROLES.map((r) => {
                  const isSelected = role === r.value;
                  return (
                    <div
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                          : 'border-slate-200 bg-slate-50/40 hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setRole(r.value)}
                        className="mt-0.5 text-slate-900 focus:ring-slate-900"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold flex items-center gap-2">
                          <span>{r.label}</span>
                          {r.value === 'Super Administrateur IT' && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              isSelected ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'
                            }`}>
                              Full Root
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {r.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Company */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Entreprise / Entité</span>
                </label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                >
                  {COMPANIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Site */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Site / Implantation</span>
                </label>
                <input
                  type="text"
                  placeholder="Delmas 52"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                />
              </div>

              {/* Specialty */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  <span>Spécialité & Compétences Techniques</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: Sécurité & Active Directory, Starlink & Câblage Réseau, Microsoft GP..."
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Access / Security & Notes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-slate-700" />
              <span>Accès & Notes d&apos;Administration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Clé d&apos;accès / Mot de passe provisoire</label>
                <input
                  type="text"
                  placeholder="ex: Session admin sécurisée, badge #IT-01..."
                  value={passwordHint}
                  onChange={(e) => setPasswordHint(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Notes Internes IT</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Informations complémentaires sur l'informaticien, astreinte, matériels confiés..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeAccountModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {editingAccount ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer les modifications</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Créer le compte</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
