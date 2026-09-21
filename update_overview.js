const fs = require('fs');
const path = 'c:/Users/kensl/lebrunsa/components/dashboard/OverviewView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add variables to useInventory
content = content.replace(/applicationAccounts,\s*setActiveTab/, 'applicationAccounts, phones, itAccounts, setActiveTab');

// Add imports
content = content.replace(/KeyRound\s*\} from 'lucide-react';/, 'KeyRound, Smartphone, Shield } from \'lucide-react\';');

// Add totals
content = content.replace(/const totalAppAccounts = (.*?);/, 'const totalAppAccounts = ;\n  const totalPhones = phones?.length || 0;\n  const totalItAccounts = itAccounts?.length || 0;');

// Update grid columns
content = content.replace(/xl:grid-cols-6/, 'xl:grid-cols-4');

// Add Metric 7 and Metric 8
const metricHtml = 
        {/* Metric 7: Téléphones */}
        <div 
          onClick={() => setActiveTab('phones')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-slate-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Téléphones</span>
              <Smartphone className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900 tracking-tight font-sans">{totalPhones}</span>
              <span className="text-[11px] font-medium text-slate-500">lignes</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>Digicel & Natcom</span>
            <span className="text-slate-500 font-medium flex items-center gap-0.5 group-hover:text-slate-900 transition-colors">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 8: Comptes IT */}
        <div 
          onClick={() => setActiveTab('accounts')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer group hover:border-slate-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Comptes IT</span>
              <Shield className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900 tracking-tight font-sans">{totalItAccounts}</span>
              <span className="text-[11px] font-medium text-slate-500">comptes</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>Microsoft & Email</span>
            <span className="text-slate-500 font-medium flex items-center gap-0.5 group-hover:text-slate-900 transition-colors">
              Voir <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>;

content = content.replace(/<\/div>\s*\{\/\* Row 2:/, metricHtml + '\n\n      {/* Row 2:');

fs.writeFileSync(path, content, 'utf8');
