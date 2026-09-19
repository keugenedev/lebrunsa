'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Employee, ITAsset, TelecomPlan, StarlinkKit } from '@/types/inventory';
import DataTable, { Column } from '@/components/common/DataTable';
import { 
  Users, 
  UserPlus, 
  Plus,
  Download, 
  Mail, 
  Phone, 
  Building, 
  Laptop, 
  Smartphone, 
  Satellite, 
  Monitor,
  Keyboard,
  Mouse,
  Edit2, 
  Trash2, 
  Eye, 
  X, 
  ShieldCheck, 
  Briefcase,
  Layers,
  KeyRound
} from 'lucide-react';
import { downloadSingleAssignmentSheetPDF } from '@/lib/printAssignmentSheet';

export default function PersonnelView() {
  const { 
    employees, 
    openEmployeeModal, 
    deleteEmployee, 
    getEmployeeAssignedAssets, 
    exportCSV,
    applicationAccounts
  } = useInventory();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const columns: Column<Employee>[] = [
    {
      key: 'fullName',
      label: 'Photo + Nom',
      sortable: true,
      render: (emp) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-slate-200 bg-slate-100 p-0.5 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 shadow-2xs">
            {emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {emp.fullName}
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5 flex items-center gap-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-slate-400"></span>
              <span className="font-mono">{emp.employeeId}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-normal">{emp.company}</span>
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Département & Poste',
      sortable: true,
      render: (emp) => (
        <div>
          {emp.jobTitle ? (
            <div className="font-medium text-slate-800">{emp.jobTitle}</div>
          ) : (
            <div className="text-slate-400 italic text-xs font-normal">Non renseigné</div>
          )}
          {emp.department && (
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Building className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{emp.department}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'location',
      label: "Site d'affectation",
      sortable: true,
      render: (emp) => (
        <span className="text-slate-600 text-xs">{emp.location}</span>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      align: 'center',
      width: '120px',
      render: (emp) => {
        if (emp.status === 'active') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              Actif
            </span>
          );
        } else if (emp.status === 'on_leave') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
              En mission
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
            Inactif
          </span>
        );
      }
    },
    {
      key: 'assignedAssets',
      label: 'Matériels Assignés',
      align: 'center',
      render: (emp) => {
        const assets = getEmployeeAssignedAssets(emp.id);
        const totalCount = assets.it.length + assets.plans.length + assets.starlink.length;
        const isLaptop = emp.workstation?.type?.toLowerCase().includes('laptop') || assets.it.some(i => i.subCategory === 'laptop');
        return (
          <div className="flex items-center justify-center gap-1.5">
            {totalCount === 0 ? (
              <span className="text-slate-400 text-xs italic">Aucun</span>
            ) : (
              <div className="flex items-center gap-1">
                {assets.it.length > 0 && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium" title={`${assets.it.length} ${isLaptop ? 'ordinateur(s) portable(s)' : 'poste(s) fixe(s) / PC'}`}>
                    {isLaptop ? (
                      <Laptop className="w-3 h-3 text-slate-500" />
                    ) : (
                      <Monitor className="w-3 h-3 text-slate-500" />
                    )}
                    <span>{assets.it.length}</span>
                  </span>
                )}
                {assets.plans.length > 0 && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium" title={`${assets.plans.length} forfait(s) / SIM`}>
                    <Smartphone className="w-3 h-3 text-slate-500" />
                    <span>{assets.plans.length}</span>
                  </span>
                )}
                {assets.starlink.length > 0 && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium" title={`${assets.starlink.length} kit(s) Starlink`}>
                    <Satellite className="w-3 h-3 text-slate-500" />
                    <span>{assets.starlink.length}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (emp) => (
        <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setSelectedEmployee(emp)}
            title="Consulter les équipements"
            className="inline-flex items-center justify-center text-slate-400 transition hover:text-slate-900 cursor-pointer"
          >
            <i className="ri-eye-line text-lg"></i>
          </button>
          <button
            type="button"
            onClick={() => downloadSingleAssignmentSheetPDF(emp)}
            title="Télécharger la Fiche d'Affectation (PDF)"
            className="inline-flex items-center justify-center text-slate-400 transition hover:text-slate-900 cursor-pointer"
          >
            <i className="ri-file-pdf-2-line text-lg"></i>
          </button>
          <button
            type="button"
            onClick={() => openEmployeeModal(emp)}
            title="Modifier collaborateur"
            className="inline-flex items-center justify-center text-slate-400 transition hover:text-slate-700 cursor-pointer"
          >
            <i className="ri-pencil-line text-lg"></i>
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Supprimer la fiche de ${emp.fullName} (${emp.employeeId}) ?`)) {
                deleteEmployee(emp.id);
              }
            }}
            title="Supprimer"
            className="inline-flex items-center justify-center text-slate-400 transition hover:text-slate-900 cursor-pointer"
          >
            <i className="ri-delete-bin-line text-lg"></i>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Clean Light Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 font-sans">
        <div>
          <h1 className="text-sm font-medium text-slate-800 tracking-tight">
            Personnel & Collaborateurs
          </h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Suivi nominatif des équipements IT, flottes mobiles et affectations des salariés de Lebrun S.A.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openEmployeeModal()}
            className="h-8 flex items-center gap-1.5 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Collaborateur</span>
          </button>
          <button
            onClick={() => exportCSV('personnel')}
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 border border-slate-300 shadow-2xs transition-colors cursor-pointer active:scale-95"
            title="Exporter en fichier Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Exporter Excel</span>
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        items={employees}
        columns={columns}
        searchPlaceholder="Rechercher collaborateur par nom, matricule, département, email..."
        searchFields={['fullName', 'employeeId', 'department', 'email', 'jobTitle', 'location']}
        filters={[
          {
            key: 'department',
            label: 'Département',
            options: [
              { label: 'Direction IT & Cloud', value: 'Direction IT & Cloud' },
              { label: 'Data & IA', value: 'Data & Intelligence Artificielle' },
              { label: 'DevOps & Télécoms', value: 'DevOps & Télécoms' },
              { label: 'Opérations Chantiers', value: 'Opérations Chantiers & Mines' },
              { label: 'Opérations Maritimes', value: 'Opérations Maritimes' },
              { label: 'Logistique & Stocks', value: 'Logistique & Approvisionnements' },
              { label: 'Direction Générale', value: 'Direction Générale & RH' }
            ]
          },
          {
            key: 'company',
            label: 'Entreprise',
            options: [
              { label: 'Lebrun S.A.', value: 'Lebrun S.A.' },
              { label: 'Autobiz', value: 'Autobiz' },
              { label: 'Caribe Motors', value: 'Caribe Motors' },
              { label: 'Leader Foods', value: 'Leader Foods' }
            ]
          },
          {
            key: 'status',
            label: 'Statut',
            options: [
              { label: 'Actif en poste', value: 'active' },
              { label: 'En mission', value: 'on_leave' },
              { label: 'Inactif', value: 'inactive' }
            ]
          }
        ]}
        onRowClick={(emp) => setSelectedEmployee(emp)}
      />

      {/* Detailed Side Panel / Modal for Selected Employee */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="lebron-card w-full max-w-2xl bg-white border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-medium text-base flex items-center justify-center shadow-sm">
                  {selectedEmployee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{selectedEmployee.fullName}</h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
                      {selectedEmployee.employeeId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedEmployee.jobTitle || 'Poste non renseigné'}
                    {selectedEmployee.department ? ` • ${selectedEmployee.department}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Employee Contact & Info Cards */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-400 font-medium">Email Professionnel</span>
                <div className="text-slate-800 font-semibold mt-0.5 truncate">{selectedEmployee.email}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-400 font-medium">Téléphone</span>
                <div className="text-slate-800 font-semibold mt-0.5">{selectedEmployee.phone}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-400 font-medium">Site d&apos;affectation</span>
                <div className="text-slate-800 font-semibold mt-0.5">{selectedEmployee.location}</div>
              </div>
            </div>

            {/* Workstation & Peripherals Details */}
            {selectedEmployee.workstation && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-200 gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {selectedEmployee.workstation.type === 'Laptop' ? (
                      <Laptop className="w-4 h-4 text-slate-700" />
                    ) : (
                      <Monitor className="w-4 h-4 text-slate-700" />
                    )}
                    <span>
                      {selectedEmployee.workstation.type === 'Laptop' ? 'Ordinateur Portable (Laptop)' : 'Poste Fixe (Desktop)'} & Accessoires
                    </span>
                  </span>
                  {selectedEmployee.workstation.pcSpecs && (
                    <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedEmployee.workstation.pcSpecs}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Unité Centrale / PC */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Machine / Station</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{selectedEmployee.workstation.pcName}</div>
                    <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                      N° Série : <span className="font-bold text-slate-900 select-all">{selectedEmployee.workstation.pcSerial || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Écran */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Écran / Moniteur</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{selectedEmployee.workstation.monitorModel || 'Écran standard'}</div>
                    <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                      N° Série : <span className="font-bold text-slate-900 select-all">{selectedEmployee.workstation.monitorSerial || 'N/A'}</span>
                    </div>
                    {selectedEmployee.workstation.monitorObs && (
                      <span className="inline-block mt-1 text-[10px] text-slate-700 font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        État: {selectedEmployee.workstation.monitorObs}
                      </span>
                    )}
                  </div>

                  {/* Clavier */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Clavier</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{selectedEmployee.workstation.keyboard || 'Clavier Dell'}</div>
                    <div className="text-[11px] text-slate-500">{selectedEmployee.workstation.keyboardDetails || 'Câble USB'}</div>
                    {selectedEmployee.workstation.keyboardObs && (
                      <span className="inline-block mt-1 text-[10px] text-slate-700 font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        État: {selectedEmployee.workstation.keyboardObs}
                      </span>
                    )}
                  </div>

                  {/* Souris */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Souris</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{selectedEmployee.workstation.mouse || 'Dell'}</div>
                    <div className="text-[11px] text-slate-500">{selectedEmployee.workstation.mouseDetails || 'Câble USB'}</div>
                    {selectedEmployee.workstation.mouseObs && (
                      <span className="inline-block mt-1 text-[10px] text-slate-700 font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        État: {selectedEmployee.workstation.mouseObs}
                      </span>
                    )}
                  </div>
                </div>

                {(selectedEmployee.workstation.observations || selectedEmployee.workstation.obs || selectedEmployee.workstation.notes) && (
                  <div className="mt-2.5 p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700">
                    <span className="font-bold text-slate-900">Observations Poste : </span>
                    {selectedEmployee.workstation.observations || selectedEmployee.workstation.obs || selectedEmployee.workstation.notes}
                  </div>
                )}
              </div>
            )}

            {/* Comptes, Sessions Windows & Accès Applicatifs */}
            {(() => {
              const appAcc = selectedEmployee ? applicationAccounts.find(a => 
                (a.employeeId && (a.employeeId === selectedEmployee.id || a.employeeId === selectedEmployee.employeeId)) ||
                (a.username && selectedEmployee.accounts?.appUsername && a.username.toLowerCase() === selectedEmployee.accounts.appUsername.toLowerCase()) ||
                (a.lastName.toLowerCase() === selectedEmployee.lastName.toLowerCase())
              ) : undefined;
              const winUser = selectedEmployee.accounts?.windowsUsername || appAcc?.windowsUsername || selectedEmployee.fullName;
              const winPass = selectedEmployee.accounts?.windowsPassword && selectedEmployee.accounts.windowsPassword !== 'N/A' 
                ? selectedEmployee.accounts.windowsPassword 
                : (appAcc?.windowsPassword || '1234');
              const appUser = selectedEmployee.accounts?.appUsername || appAcc?.username || 'N/A';
              const appPass = selectedEmployee.accounts?.appPassword && selectedEmployee.accounts.appPassword !== 'N/A'
                ? selectedEmployee.accounts.appPassword
                : (appAcc?.password || 'CP@2026');
              const appName = selectedEmployee.accounts?.applications || appAcc?.applications || (selectedEmployee.company === 'Caribe Motors' ? 'DealerPro DMS' : 'Microsoft GP');
              const isDealer = appName.toLowerCase().includes('dealer');

              return (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-slate-700" />
                      <span>Session Windows & Accès Applicatif ({appName})</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedEmployee.accounts?.organization || selectedEmployee.company}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Session Windows */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-medium uppercase flex items-center gap-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logos/Windows.png" alt="Windows" className="w-3 h-3 object-contain" />
                        <span>Session Windows (Poste PC)</span>
                      </div>
                      <div className="font-semibold text-slate-900 mt-1 font-mono">
                        User : <span className="select-all">{winUser}</span>
                      </div>
                      <div className="text-[11px] text-slate-700 font-mono mt-0.5">
                        MDP : <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 select-all">{winPass}</span>
                      </div>
                    </div>

                    {/* Accès Applicatif */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-medium uppercase flex items-center gap-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {isDealer ? (
                          <img src="/logos/dealerpro.png" alt="DealerPro" className="h-3.5 w-auto object-contain max-w-[65px]" />
                        ) : (
                          <img src="/logos/gp.png" alt="Microsoft GP" className="h-3.5 w-auto object-contain max-w-[60px]" />
                        )}
                        <span>Accès Logiciel ({appName})</span>
                      </div>
                      <div className="font-semibold text-slate-900 mt-1 font-mono">
                        ID : <span className="select-all">@{appUser}</span>
                      </div>
                      <div className="text-[11px] text-slate-700 font-mono mt-0.5">
                        MDP : <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 select-all">{appPass}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Assigned Assets Section */}
            {(() => {
              const assets = getEmployeeAssignedAssets(selectedEmployee.id);
              // Filter out the primary workstation already presented in the section above
              const additionalIt = assets.it.filter(item => 
                item.serialNumber !== selectedEmployee.workstation?.pcSerial &&
                item.name !== selectedEmployee.workstation?.pcName
              );
              const totalCount = (selectedEmployee.workstation ? 1 : 0) + additionalIt.length + assets.plans.length + assets.starlink.length;

              return (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Équipements Additionnels & Forfaits
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Lignes mobiles, forfaits ou matériels IT secondaires sous la garde de ce collaborateur
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                        {totalCount} équipement(s) au total
                      </span>
                    </div>
                  </div>

                  {additionalIt.length === 0 && assets.plans.length === 0 && assets.starlink.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Ce collaborateur dispose de son poste de travail principal décrit ci-dessus. Aucun équipement secondaire ou forfait mobile supplémentaire n&apos;est actuellement assigné.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Additional IT Assets */}
                      {additionalIt.map(item => (
                        <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
                              {item.subCategory === 'laptop' ? <Laptop className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-xs">{item.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                Tag: {item.assetTag} • SN: {item.serialNumber}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-slate-700 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                              En service
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Telecom Plans */}
                      {assets.plans.map(plan => (
                        <div key={plan.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-xs">{plan.name} ({plan.operator})</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                N°: {plan.phoneNumber || 'Data SIM'} • {plan.simType}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {plan.dataUsedGb} Go consommés
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Starlink Kits */}
                      {assets.starlink.map(kit => (
                        <div key={kit.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
                              <Satellite className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-xs">{kit.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                Kit: {kit.kitNumber} • Dish: {kit.dishSerial}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-slate-700 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                              {kit.tier}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  if (selectedEmployee) {
                    downloadSingleAssignmentSheetPDF(selectedEmployee);
                  }
                }}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Télécharger la fiche d'affectation officielle en PDF"
              >
                <i className="ri-file-pdf-2-line text-sm text-slate-700"></i>
                <span>Fiche d&apos;Affectation (PDF)</span>
              </button>
              <button
                onClick={() => {
                  const emp = selectedEmployee;
                  setSelectedEmployee(null);
                  openEmployeeModal(emp);
                }}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
              >
                Modifier la fiche
              </button>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
