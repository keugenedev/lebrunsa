'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  Database, 
  Server, 
  FileSpreadsheet, 
  Users,
  Building
} from 'lucide-react';

export default function SettingsView() {
  const { 
    exportCSV, 
    resetToDefaultData, 
    stats 
  } = useInventory();

  const exportAllJSON = () => {
    const data = {
      company: 'Lebrun S.A.',
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
      stats,
      data: {
        employees: JSON.parse(localStorage.getItem('lebron_inv_employees') || '[]'),
        it: JSON.parse(localStorage.getItem('lebron_inv_it') || '[]'),
        printers: JSON.parse(localStorage.getItem('lebron_inv_printers') || '[]')
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lebrunsa_inventory_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="pt-1 font-sans">
        <h1 className="text-sm font-medium text-slate-800 tracking-tight">
          Configuration & Sauvegardes
        </h1>
        <p className="text-xs text-slate-400 font-normal mt-0.5">
          Gérez les exports de données, les sauvegardes certifiées et la persistance du système de Lebrun S.A.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 2xl:gap-8">
        {/* Enterprise Information Card */}
        <div className="lebron-card p-6 2xl:p-8 bg-white border border-slate-200 shadow-xs space-y-5 rounded-2xl 2xl:rounded-3xl">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Building className="w-5 h-5 2xl:w-6 2xl:h-6" />
            </div>
            <div>
              <h3 className="text-sm 2xl:text-base font-bold text-slate-900">Entité & Organisation</h3>
              <p className="text-[11px] 2xl:text-xs text-slate-500">Profil d&apos;entreprise et supervision des actifs</p>
            </div>
          </div>

          <div className="space-y-3 text-xs 2xl:text-sm text-slate-700">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-slate-500">Entreprises & Filiales :</span>
              <span className="font-bold text-slate-900">LEBRUN S.A. • Autobiz • Caribe • Leader Foods</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-slate-500">Sites Opérationnels :</span>
              <span className="font-semibold text-slate-900">Delmas 52 • Pétion-Ville • Delmas 60 • Canapé-Vert</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-slate-500">Réseau & Parc :</span>
              <span className="font-semibold text-slate-900">16 Imprimantes & 6 Stations Dell OptiPlex</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-slate-500">Gestion Technique :</span>
              <span className="font-semibold text-red-700">Administration & Systèmes d&apos;Information</span>
            </div>
          </div>
        </div>

        {/* Exports Section */}
        <div className="lebron-card p-6 2xl:p-8 bg-white border border-slate-200 shadow-xs space-y-5 rounded-2xl 2xl:rounded-3xl">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Database className="w-5 h-5 2xl:w-6 2xl:h-6" />
            </div>
            <div>
              <h3 className="text-sm 2xl:text-base font-bold text-slate-900">Exports Microsoft Excel (.xlsx)</h3>
              <p className="text-[11px] 2xl:text-xs text-slate-500">Extraction native classeur Excel haute définition avec colonnes ajustées</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => exportCSV('printers')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs 2xl:text-sm font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Excel Imprimantes</span>
              </button>

              <button
                onClick={() => exportCSV('it')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs 2xl:text-sm font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Excel Postes Dell</span>
              </button>

              <button
                onClick={() => exportCSV('personnel')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs 2xl:text-sm font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Excel Personnel</span>
              </button>

              <button
                onClick={() => exportCSV('accounts')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs 2xl:text-sm font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                <span>Excel Informaticiens</span>
              </button>

              <button
                onClick={() => exportCSV('applications')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs 2xl:text-sm font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <span>Excel Applications</span>
              </button>

              <button
                onClick={() => exportCSV('network')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs 2xl:text-sm font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
                <span>Excel Réseau & UPS</span>
              </button>
            </div>

            <button
              onClick={exportAllJSON}
              className="w-full flex items-center justify-center gap-2 mt-3 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs 2xl:text-sm font-semibold text-slate-800 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 2xl:w-5 2xl:h-5 text-slate-600" />
              <span>Sauvegarder l&apos;intégralité de la base de données (JSON)</span>
            </button>
          </div>
        </div>

        {/* System & Storage status */}
        <div className="lebron-card p-6 2xl:p-8 bg-white border border-slate-200 shadow-xs space-y-5 rounded-2xl 2xl:rounded-3xl">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Server className="w-5 h-5 2xl:w-6 2xl:h-6" />
            </div>
            <div>
              <h3 className="text-sm 2xl:text-base font-bold text-slate-900">État du Système Lebrun S.A.</h3>
              <p className="text-[11px] 2xl:text-xs text-slate-500">Moteur de stockage et persistance active</p>
            </div>
          </div>

          <div className="space-y-3 text-xs 2xl:text-sm text-slate-700">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-slate-500">Salariés enregistrés :</span>
              <span className="font-bold text-slate-900">{stats.employeesCount} collaborateurs certifiés</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-slate-500">Total équipements certifiés :</span>
              <span className="font-bold text-slate-900">{stats.itCount} postes Dell • {stats.itCount > 0 ? '16 imprimantes HP' : ''}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-slate-500">Base de Données Cloud :</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Supabase PostgreSQL
              </span>
            </div>
          </div>
        </div>

        {/* Reset Zone */}
        <div className="lebron-card p-6 2xl:p-8 bg-white border border-red-200 shadow-xs space-y-5 rounded-2xl 2xl:rounded-3xl">
          <div className="flex items-center gap-3 pb-3 border-b border-red-100">
            <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <RotateCcw className="w-5 h-5 2xl:w-6 2xl:h-6" />
            </div>
            <div>
              <h3 className="text-sm 2xl:text-base font-bold text-slate-900">Zone de Réinitialisation</h3>
              <p className="text-[11px] 2xl:text-xs text-slate-500">Restauration des données certifiées du parc</p>
            </div>
          </div>

          <p className="text-xs 2xl:text-sm text-slate-600 leading-relaxed">
            Permet de réinitialiser l&apos;ensemble de l&apos;inventaire aux données certifiées de Lebrun S.A., Autobiz, Caribe Motors et Leader Foods (16 imprimantes HP, 6 postes de travail Dell OptiPlex et collaborateurs).
          </p>

          <button
            onClick={resetToDefaultData}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-xs 2xl:text-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réinitialiser aux données certifiées Lebrun S.A.</span>
          </button>
        </div>
      </div>
    </div>
  );
}
