'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ApplicationAccount, Employee } from '@/types/inventory';
import { 
  X, 
  KeyRound, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Building, 
  Plus, 
  Monitor, 
  Mail, 
  Laptop, 
  CheckCircle2 
} from 'lucide-react';

export default function ApplicationModal() {
  const {
    isApplicationModalOpen,
    closeApplicationModal,
    editingApplicationAccount,
    addApplicationAccount,
    updateApplicationAccount,
    employees,
    applicationAccounts
  } = useInventory();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [softwareType, setSoftwareType] = useState<'Microsoft GP' | 'DealerPro' | 'custom'>('Microsoft GP');
  const [customSoftware, setCustomSoftware] = useState('');
  const [windowsUsername, setWindowsUsername] = useState('');
  const [windowsPassword, setWindowsPassword] = useState('');
  const [showWindowsPassword, setShowWindowsPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [applications, setApplications] = useState('Microsoft GP');
  const [organization, setOrganization] = useState('Lebrun S.A.');

  useEffect(() => {
    if (editingApplicationAccount) {
      // Find matching employee by employeeId or appUsername or name
      const matchedEmp = employees.find(e => 
        (editingApplicationAccount.employeeId && e.id === editingApplicationAccount.employeeId) ||
        (editingApplicationAccount.employeeId && e.employeeId === editingApplicationAccount.employeeId) ||
        (e.accounts?.appUsername && e.accounts.appUsername.toLowerCase() === editingApplicationAccount.username.toLowerCase()) ||
        (e.lastName.toLowerCase() === editingApplicationAccount.lastName.toLowerCase())
      );

      setSelectedEmployeeId(matchedEmp ? matchedEmp.id : (editingApplicationAccount.employeeId || ''));
      setWindowsUsername(editingApplicationAccount.windowsUsername || matchedEmp?.accounts?.windowsUsername || '');
      setWindowsPassword(editingApplicationAccount.windowsPassword || matchedEmp?.accounts?.windowsPassword || '');
      setUsername(editingApplicationAccount.username || '');
      setPassword(editingApplicationAccount.password || '');
      
      const appName = editingApplicationAccount.applications || 'Microsoft GP';
      if (appName.toLowerCase().includes('dealer')) {
        setSoftwareType('DealerPro');
        setApplications('DealerPro');
      } else if (appName.toLowerCase().includes('gp')) {
        setSoftwareType('Microsoft GP');
        setApplications('Microsoft GP');
      } else {
        setSoftwareType('custom');
        setCustomSoftware(appName);
        setApplications(appName);
      }

      setOrganization(editingApplicationAccount.organization || matchedEmp?.company || 'Lebrun S.A.');
    } else {
      setSelectedEmployeeId('');
      setSoftwareType('Microsoft GP');
      setCustomSoftware('');
      setWindowsUsername('');
      setWindowsPassword('');
      setUsername('');
      setPassword('');
      setApplications('Microsoft GP');
      setOrganization('Lebrun S.A.');
      setShowPassword(false);
      setShowWindowsPassword(false);
    }
  }, [editingApplicationAccount, isApplicationModalOpen, employees]);

  if (!isApplicationModalOpen) return null;

  const handleSelectSoftware = (type: 'Microsoft GP' | 'DealerPro' | 'custom') => {
    setSoftwareType(type);
    if (type === 'DealerPro') {
      setApplications('DealerPro DMS');
      if (organization === 'Lebrun S.A.' || !organization) {
        setOrganization('Caribe Motors');
      }
    } else if (type === 'Microsoft GP') {
      setApplications('Microsoft GP');
      if (organization === 'Caribe Motors') {
        const emp = employees.find(e => e.id === selectedEmployeeId);
        setOrganization(emp?.company || 'Lebrun S.A.');
      }
    } else {
      setApplications(customSoftware || 'Autre Logiciel');
    }
  };

  const handleEmployeeChange = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    // Check if this employee already has an account in applicationAccounts (1 person = 1 account)
    const existingAcc = applicationAccounts.find(a => 
      a.employeeId === empId || 
      (emp.employeeId && a.employeeId === emp.employeeId) ||
      (emp.accounts?.appUsername && a.username.toLowerCase() === emp.accounts.appUsername.toLowerCase()) ||
      a.lastName.toLowerCase() === emp.lastName.toLowerCase()
    );

    if (existingAcc) {
      // Load existing account configuration
      const appName = existingAcc.applications || 'Microsoft GP';
      if (appName.toLowerCase().includes('dealer')) {
        setSoftwareType('DealerPro');
        setApplications('DealerPro');
      } else if (appName.toLowerCase().includes('gp')) {
        setSoftwareType('Microsoft GP');
        setApplications('Microsoft GP');
      } else {
        setSoftwareType('custom');
        setCustomSoftware(appName);
        setApplications(appName);
      }
      setUsername(existingAcc.username);
      setPassword(existingAcc.password || '1234');
      setOrganization(existingAcc.organization || emp.company || 'Lebrun S.A.');
      setWindowsUsername(existingAcc.windowsUsername || emp.accounts?.windowsUsername || emp.firstName);
      setWindowsPassword(existingAcc.windowsPassword || emp.accounts?.windowsPassword || '');
    } else {
      // Auto-determine software based on employee company:
      // Caribe Motors -> DealerPro
      // Lebrun S.A. / Autobiz S.A. -> Microsoft GP
      const isCaribe = emp.company?.toLowerCase().includes('caribe');
      if (isCaribe) {
        setSoftwareType('DealerPro');
        setApplications('DealerPro');
        setOrganization('Caribe Motors');
      } else {
        setSoftwareType('Microsoft GP');
        setApplications('Microsoft GP');
        setOrganization(emp.company || 'Lebrun S.A.');
      }

      if (emp.accounts) {
        if (emp.accounts.windowsUsername) setWindowsUsername(emp.accounts.windowsUsername);
        if (emp.accounts.windowsPassword) setWindowsPassword(emp.accounts.windowsPassword);
        if (emp.accounts.appUsername) setUsername(emp.accounts.appUsername);
        if (emp.accounts.appPassword) setPassword(emp.accounts.appPassword);
        if (emp.accounts.applications) {
          const appStr = emp.accounts.applications;
          if (appStr.toLowerCase().includes('dealer')) {
            setSoftwareType('DealerPro');
            setApplications('DealerPro');
          } else if (appStr.toLowerCase().includes('gp')) {
            setSoftwareType('Microsoft GP');
            setApplications('Microsoft GP');
          }
        }
      } else {
        // Fallback defaults
        if (!windowsUsername) setWindowsUsername(emp.firstName);
        if (!username) setUsername(`${emp.firstName[0]?.toLowerCase() || ''}${emp.lastName.toLowerCase().replace(/\s+/g, '')}`);
      }
    }
  };

  const selectedEmployee: Employee | undefined = employees.find(e => e.id === selectedEmployeeId);

  // Check if selected employee already has an account registered
  const existingAccountForSelected = selectedEmployeeId 
    ? applicationAccounts.find(a => 
        a.employeeId === selectedEmployeeId || 
        (selectedEmployee && a.employeeId === selectedEmployee.employeeId) ||
        (selectedEmployee && a.lastName.toLowerCase() === selectedEmployee.lastName.toLowerCase())
      )
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployeeId) {
      alert('Veuillez sélectionner un collaborateur du personnel.');
      return;
    }

    const finalApp = softwareType === 'custom' 
      ? (customSoftware.trim() || 'Autre Logiciel') 
      : (softwareType === 'DealerPro' ? 'DealerPro DMS' : 'Microsoft GP');

    const payload: Omit<ApplicationAccount, 'id'> = {
      employeeId: selectedEmployeeId,
      username: username.trim().toLowerCase(),
      firstName: selectedEmployee ? selectedEmployee.firstName : '',
      lastName: selectedEmployee ? selectedEmployee.lastName : '',
      password: password.trim() || '1234',
      applications: finalApp,
      organization: organization.trim() || selectedEmployee?.company || 'Lebrun S.A.',
      windowsUsername: windowsUsername.trim(),
      windowsPassword: windowsPassword.trim()
    };

    if (editingApplicationAccount) {
      updateApplicationAccount(editingApplicationAccount.id, payload);
    } else if (existingAccountForSelected) {
      // 1 person = 1 application account rule: update existing account instead of duplicating
      updateApplicationAccount(existingAccountForSelected.id, payload);
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
                {editingApplicationAccount ? "Modifier l'Accès & Session" : "Nouvel Accès Applicatif & Session"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Liaison directe au personnel : Session Windows et habilitation logicielle (Microsoft GP, DealerPro)
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
          {/* Section 1: Sélection du Collaborateur (Personnel) */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-700" />
              <span>Collaborateur Associé (Personnel)</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                Sélectionner le Collaborateur <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                required
                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-medium text-slate-900 cursor-pointer text-xs"
              >
                <option value="">-- Choisir un collaborateur dans le Personnel --</option>
                {employees.map((emp) => {
                  const hasApp = applicationAccounts.find(a => 
                    a.employeeId === emp.id || 
                    a.employeeId === emp.employeeId || 
                    a.lastName.toLowerCase() === emp.lastName.toLowerCase()
                  );
                  return (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeId} - {emp.company}){hasApp ? ` [${hasApp.applications}]` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Read-only Employee Summary Card */}
            {selectedEmployee && (
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {selectedEmployee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{selectedEmployee.fullName}</p>
                      <p className="text-[11px] font-semibold text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                        {selectedEmployee.employeeId}
                      </p>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          {selectedEmployee.company} • {selectedEmployee.site || 'Delmas 52'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {existingAccountForSelected && !editingApplicationAccount && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                      Compte configuré ({existingAccountForSelected.applications})
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 truncate max-w-[260px]">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedEmployee.email}</span>
                  </div>
                  {selectedEmployee.workstation && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Laptop className="w-3 h-3 text-slate-400" />
                      <span>Poste: <strong className="text-slate-700">{selectedEmployee.workstation.pcName}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Sélection du Logiciel Métier (Microsoft GP ou DealerPro) */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                <span>Choix du Logiciel Métier</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">1 application par collaborateur</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option Microsoft GP */}
              <button
                type="button"
                onClick={() => handleSelectSoftware('Microsoft GP')}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-left bg-white ${
                  softwareType === 'Microsoft GP'
                    ? 'border-emerald-500 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logos/gp.png" alt="Microsoft GP" className="h-6 w-auto object-contain max-w-[85px]" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">
                      Microsoft GP
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Lebrun S.A. & Autobiz
                    </p>
                  </div>
                </div>
                {softwareType === 'Microsoft GP' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-5 h-5 shrink-0" />
                )}
              </button>

              {/* Option DealerPro */}
              <button
                type="button"
                onClick={() => handleSelectSoftware('DealerPro')}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-left bg-white ${
                  softwareType === 'DealerPro'
                    ? 'border-emerald-500 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logos/dealerpro.png" alt="DealerPro" className="h-6 w-auto object-contain max-w-[90px]" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">
                      DealerPro DMS
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Caribe Motors & Atelier
                    </p>
                  </div>
                </div>
                {softwareType === 'DealerPro' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-5 h-5 shrink-0" />
                )}
              </button>
            </div>

            {/* Custom software alternative */}
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => handleSelectSoftware(softwareType === 'custom' ? 'Microsoft GP' : 'custom')}
                className="text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors cursor-pointer"
              >
                {softwareType === 'custom' ? "Revenir aux logiciels standards (GP / DealerPro)" : "Autre logiciel métier (personnalisé)..."}
              </button>
            </div>

            {softwareType === 'custom' && (
              <div className="animate-in fade-in duration-150 pt-1">
                <label className="block text-slate-700 font-semibold mb-1">
                  Nom du logiciel personnalisé <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customSoftware}
                  onChange={(e) => {
                    setCustomSoftware(e.target.value);
                    setApplications(e.target.value);
                  }}
                  placeholder="ex: Sage 50, QuickBooks, Outlook..."
                  required
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-900 text-xs"
                />
              </div>
            )}
          </div>

          {/* Section 3: Connexion Session Windows (Poste PC) */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/Windows.png" alt="Windows" className="w-3.5 h-3.5 object-contain" />
                <span>Connexion Session Windows (Poste PC)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal normal-case">Identifiants d&apos;ouverture de session</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Nom d&apos;utilisateur Session Windows <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={windowsUsername}
                    onChange={(e) => setWindowsUsername(e.target.value)}
                    required
                    placeholder="ex: ALEXIS, CARIBE-PC01, Eugene Kensly..."
                    className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-mono font-semibold text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Mot de Passe Session Windows
                </label>
                <div className="relative">
                  <input
                    type={showWindowsPassword ? "text" : "password"}
                    value={windowsPassword}
                    onChange={(e) => setWindowsPassword(e.target.value)}
                    placeholder="ex: 198936, 1234, N/A..."
                    className="w-full h-10 pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-mono font-semibold text-slate-900 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWindowsPassword(!showWindowsPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showWindowsPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Accès & Habilitation Applicative */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                {softwareType === 'DealerPro' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src="/logos/dealerpro.png" alt="DealerPro" className="h-4.5 w-auto max-w-[90px] object-contain" />
                ) : softwareType === 'Microsoft GP' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src="/logos/gp.png" alt="Microsoft GP" className="h-4.5 w-auto max-w-[85px] object-contain" />
                ) : (
                  <KeyRound className="w-4 h-4 text-slate-600" />
                )}
                <span>
                  Accès Applicatif {softwareType === 'DealerPro' ? 'DealerPro DMS' : softwareType === 'Microsoft GP' ? 'Microsoft GP' : customSoftware || 'Logiciel'}
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal normal-case">Identifiant & mot de passe</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Identifiant / Username {softwareType === 'DealerPro' ? 'DealerPro' : softwareType === 'Microsoft GP' ? 'GP' : 'Logiciel'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full h-10 pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-mono font-bold text-slate-900 text-xs"
                    placeholder={softwareType === 'DealerPro' ? "ex: jcpierre, mcelestin..." : "ex: autobiz1, rmdguerrier..."}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Mot de Passe {softwareType === 'DealerPro' ? 'DealerPro' : softwareType === 'Microsoft GP' ? 'GP' : 'Logiciel'} <span className="text-red-500">*</span>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Application Enregistrée
                </label>
                <input
                  type="text"
                  value={softwareType === 'custom' ? customSoftware : applications}
                  readOnly={softwareType !== 'custom'}
                  onChange={(e) => {
                    if (softwareType === 'custom') {
                      setCustomSoftware(e.target.value);
                      setApplications(e.target.value);
                    }
                  }}
                  className={`w-full h-10 px-3 py-2 border rounded-xl text-slate-900 text-xs ${
                    softwareType !== 'custom' 
                      ? 'bg-slate-100 border-slate-200 font-semibold cursor-not-allowed text-slate-700' 
                      : 'bg-white border-slate-200 focus:outline-none focus:border-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">
                  Organisation / Entité <span className="text-red-500">*</span>
                </label>
                <select
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-900 cursor-pointer text-xs font-medium"
                >
                  <option value="Caribe Motors">Caribe Motors</option>
                  <option value="Lebrun S.A.">Lebrun S.A.</option>
                  <option value="Autobiz S.A.">Autobiz S.A.</option>
                  <option value="Lebrun S.A. | Autobiz S.A.">Lebrun S.A. | Autobiz S.A.</option>
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
              {editingApplicationAccount 
                ? "Enregistrer les modifications" 
                : existingAccountForSelected 
                  ? "Mettre à jour l'accès du collaborateur" 
                  : "Ajouter l'Accès"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
