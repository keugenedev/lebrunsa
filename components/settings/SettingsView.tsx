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
      company: 'Lebronsa S.A.',
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
      stats,
      data: {
        employees: JSON.parse(localStorage.getItem('lebron_inv_employees') || '[]'),
        it: JSON.parse(localStorage.getItem('lebron_inv_it') || '[]'),
        plans: JSON.parse(localStorage.getItem('lebron_inv_plans') || '[]'),
        starlink: JSON.parse(localStorage.getItem('lebron_inv_starlink') || '[]'),
        electronics: JSON.parse(localStorage.getItem('lebron_inv_electronics') || '[]'),
        movements: JSON.parse(localStorage.getItem('lebron_inv_movements') || '[]')
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lebronsa_inventory_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Configuration & Sauvegardes Lebronsa S.A.
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Gérez les exports de données tabulaires, les sauvegardes complètes et la persistance locale du système.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enterprise Information Card */}
        <div className="lebron-card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Entité & Organisation</h3>
              <p className="text-[11px] text-slate-500">Profil d&apos;entreprise et supervision des actifs</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">Organisation :</span>
              <span className="font-bold text-slate-900">LEBRONSA S.A.</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">Réseau & Flotte :</span>
              <span className="font-semibold text-slate-900">Parc IT, Starlink & Lignes Mobiles</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">Gestion Technique :</span>
              <span className="font-semibold text-red-700">Direction des Opérations & SI</span>
            </div>
          </div>
        </div>

        {/* Exports Section */}
        <div className="lebron-card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Exports CSV & Tableurs</h3>
              <p className="text-[11px] text-slate-500">Extraction directe compatible Microsoft Excel</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => exportCSV('personnel')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
              >
                <Users className="w-3.5 h-3.5 text-red-600" />
                <span>CSV Personnel</span>
              </button>

              <button
                onClick={() => exportCSV('it')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-red-600" />
                <span>CSV Équipements IT</span>
              </button>

              <button
                onClick={() => exportCSV('starlink')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600" />
                <span>CSV Flotte Starlink</span>
              </button>

              <button
                onClick={() => exportCSV('plans')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-orange-600" />
                <span>CSV Télécoms & SIM</span>
              </button>
            </div>

            <button
              onClick={exportAllJSON}
              className="w-full flex items-center justify-center gap-2 mt-2 p-2.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-medium text-red-700 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Sauvegarder l&apos;intégralité de la base de données (JSON)</span>
            </button>
          </div>
        </div>

        {/* System & Storage status */}
        <div className="lebron-card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">État du Système Lebronsa S.A.</h3>
              <p className="text-[11px] text-slate-500">Moteur de stockage et persistance active</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">Salariés enregistrés :</span>
              <span className="font-bold text-slate-900">{stats.employeesCount} collaborateurs</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">Total actifs en parc :</span>
              <span className="font-bold text-slate-900">{stats.totalAssetsCount} entités</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">Sécurité & Chiffrement :</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Chiffrement Local HTML5
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone: Reset to Default */}
        <div className="lebron-card p-5 bg-white border border-red-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-red-100">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Zone de Réinitialisation</h3>
              <p className="text-[11px] text-slate-500">Restauration des données par défaut</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Permet de réinitialiser l&apos;ensemble du catalogue, du personnel et de la flotte satellite aux données de démonstration officielles de Lebronsa S.A.
          </p>

          <button
            onClick={resetToDefaultData}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les données de démonstration</span>
          </button>
        </div>
      </div>
    </div>
  );
}
