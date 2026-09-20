'use client';

import React, { useMemo, useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Employee } from '@/types/inventory';
import {
  AlertTriangle,
  Download,
  Eye,
  Loader2,
  Printer,
  RotateCcw,
  X
} from 'lucide-react';
import {
  INCIDENT_CAUSES,
  INCIDENT_DAMAGES,
  INCIDENT_EQUIPMENT_TYPES,
  INCIDENT_FREQUENCIES,
  INCIDENT_IMPACTS,
  INCIDENT_LIMITS,
  INCIDENT_PRIORITIES,
  IncidentReportData,
  buildIncidentReference,
  downloadIncidentReportPDF,
  generateIncidentReportHTML,
  getIncidentPrintHTML,
  printIncidentReport
} from '@/lib/printIncidentReport';

const pad = (n: number) => String(n).padStart(2, '0');
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const nowHHmm = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const inputCls =
  'w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-600 focus:ring-2 focus:ring-slate-900/10';
const textareaCls =
  'w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-600 focus:ring-2 focus:ring-slate-900/10 resize-none';

function Field({
  label,
  hint,
  required,
  counter,
  children
}: {
  label: string;
  hint?: string;
  required?: boolean;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <label className="text-xs font-semibold text-slate-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {counter && <span className="text-[10px] font-mono text-slate-400">{counter}</span>}
      </div>
      {children}
      {hint && <p className="mt-1 text-[11px] leading-snug text-slate-500">{hint}</p>}
    </div>
  );
}

function Card({ step, title, subtitle, children }: { step: number; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
      <div className="flex items-start gap-3 pb-3 mb-4 border-b border-slate-100">
        <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
          {step}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function IncidentReportForm() {
  const { employees, getAssignmentSheet, showToast } = useInventory();

  const [employeeId, setEmployeeId] = useState('');
  const [equipmentType, setEquipmentType] = useState(INCIDENT_EQUIPMENT_TYPES[0]);
  const [equipmentName, setEquipmentName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [incidentDate, setIncidentDate] = useState(todayISO);
  const [incidentTime, setIncidentTime] = useState(nowHHmm);
  const [frequency, setFrequency] = useState(INCIDENT_FREQUENCIES[0]);
  const [impact, setImpact] = useState(INCIDENT_IMPACTS[1]);
  const [priority, setPriority] = useState('Normale');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionsTried, setActionsTried] = useState('');
  const [suspectedCause, setSuspectedCause] = useState(INCIDENT_CAUSES[0]);
  const [physicalDamage, setPhysicalDamage] = useState(INCIDENT_DAMAGES[0]);

  const [preview, setPreview] = useState<IncidentReportData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const sortedEmployees = useMemo(
    () => [...employees].sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'fr')),
    [employees]
  );
  const employee: Employee | undefined = employees.find(e => e.id === employeeId);

  // Pré-remplit le matériel à partir de ce qui est affecté à la personne
  const suggestEquipment = (emp: Employee | undefined, type: string) => {
    if (!emp) return;
    const sheet = getAssignmentSheet(emp);
    const ws = sheet.employee.workstation;
    const t = type.toLowerCase();
    let name = '';
    let serial = '';
    if (ws) {
      if (t.startsWith('écran')) {
        name = ws.monitorModel || '';
        serial = ws.monitorSerial || '';
      } else if (t.startsWith('clavier')) {
        name = [ws.keyboard, ws.keyboardDetails].filter(Boolean).join(' - ');
      } else if (t.startsWith('souris')) {
        name = [ws.mouse, ws.mouseDetails].filter(Boolean).join(' - ');
      } else if (t.startsWith('ordinateur')) {
        name = ws.pcName || '';
        serial = ws.pcSerial || '';
      }
    }
    setEquipmentName(name);
    setSerialNumber(serial === 'N/A' ? '' : serial);
    setAssetTag(t.startsWith('ordinateur') ? sheet.asset?.assetTag || '' : '');
  };

  const handleEmployee = (id: string) => {
    setEmployeeId(id);
    suggestEquipment(employees.find(e => e.id === id), equipmentType);
  };

  const handleType = (type: string) => {
    setEquipmentType(type);
    suggestEquipment(employee, type);
  };

  // Un impact plus fort suggère une priorité plus haute (modifiable ensuite)
  const handleImpact = (value: string) => {
    setImpact(value);
    setPriority(value === INCIDENT_IMPACTS[0] ? 'Faible' : value === INCIDENT_IMPACTS[1] ? 'Normale' : 'Élevée');
  };

  const canSubmit = Boolean(employee) && description.trim().length > 0;

  const buildData = (): IncidentReportData | null => {
    if (!employee) return null;
    return {
      reportDate: new Date(),
      fullName: employee.fullName,
      employeeId: employee.employeeId,
      company: employee.company,
      site: employee.site || employee.location,
      jobTitle: employee.jobTitle,
      department: employee.department,
      equipmentType,
      equipmentName: equipmentName.trim(),
      serialNumber: serialNumber.trim(),
      assetTag: assetTag.trim(),
      incidentDate,
      incidentTime,
      frequency,
      impact,
      priority,
      description: description.trim(),
      errorMessage: errorMessage.trim(),
      actionsTried: actionsTried.trim(),
      suspectedCause,
      physicalDamage
    };
  };

  const download = async (data: IncidentReportData) => {
    try {
      setIsDownloading(true);
      await downloadIncidentReportPDF(data);
      showToast({
        title: "Rapport d'incident généré",
        message: `Référence ${buildIncidentReference(data)}`,
        type: 'success'
      });
    } catch (err) {
      console.error('Erreur génération rapport:', err);
      showToast({ title: 'Erreur', message: 'Le PDF n\'a pas pu être généré.', type: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  const reset = () => {
    setEmployeeId('');
    setEquipmentType(INCIDENT_EQUIPMENT_TYPES[0]);
    setEquipmentName('');
    setSerialNumber('');
    setAssetTag('');
    setIncidentDate(todayISO());
    setIncidentTime(nowHHmm());
    setFrequency(INCIDENT_FREQUENCIES[0]);
    setImpact(INCIDENT_IMPACTS[1]);
    setPriority('Normale');
    setDescription('');
    setErrorMessage('');
    setActionsTried('');
    setSuspectedCause(INCIDENT_CAUSES[0]);
    setPhysicalDamage(INCIDENT_DAMAGES[0]);
  };

  const previewHTML = useMemo(
    () => (preview ? getIncidentPrintHTML(generateIncidentReportHTML(preview, window.location.origin), false) : ''),
    [preview]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
        <AlertTriangle className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-600 leading-relaxed">
          Un ordinateur, un écran, une imprimante ou un logiciel ne fonctionne pas correctement ? Répondez aux questions
          ci-dessous : le rapport d&apos;incident est généré en PDF (A4, une page), avec un cadre réservé au technicien
          de la DSI pour le diagnostic et la résolution. Les réponses ne sont pas enregistrées.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* 1. Qui */}
        <Card step={1} title="Qui est concerné ?" subtitle="La personne qui utilise le matériel en panne">
          <div className="space-y-4">
            <Field
              label="Collaborateur"
              required
              hint="Sa fonction, son service et son site sont repris automatiquement dans le rapport."
            >
              <select value={employeeId} onChange={(e) => handleEmployee(e.target.value)} className={inputCls}>
                <option value="">Choisir une personne...</option>
                {sortedEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} — {emp.company}
                  </option>
                ))}
              </select>
            </Field>

            {employee && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                {[
                  ['Matricule', employee.employeeId],
                  ['Société', employee.company],
                  ['Fonction', employee.jobTitle],
                  ['Site', employee.site || employee.location]
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-slate-400 uppercase tracking-wide text-[9px]">{k}</dt>
                    <dd className="text-slate-800 font-medium">{v || '—'}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </Card>

        {/* 2. Quel matériel */}
        <Card step={2} title="Quel matériel est en cause ?" subtitle="Le matériel affecté à la personne est proposé automatiquement">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Type d'équipement" required>
                <select value={equipmentType} onChange={(e) => handleType(e.target.value)} className={inputCls}>
                  {INCIDENT_EQUIPMENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Désignation / nom" hint="Ex : nom de l'ordinateur, modèle de l'écran ou de l'imprimante.">
              <input
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
                maxLength={INCIDENT_LIMITS.name}
                placeholder="LEBHWP6KH2"
                className={inputCls}
              />
            </Field>
            <Field label="N° de série" hint="Inscrit sur l'étiquette du matériel.">
              <input
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                maxLength={INCIDENT_LIMITS.name}
                placeholder="HWP6KH2"
                className={`${inputCls} font-mono`}
              />
            </Field>
            <Field label="Code inventaire" hint="Code AST-... collé sur le poste, s'il existe.">
              <input
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                maxLength={30}
                placeholder="AST-PC-LEB123"
                className={`${inputCls} font-mono`}
              />
            </Field>
          </div>
        </Card>

        {/* 3. Quel problème */}
        <div className="xl:col-span-2">
          <Card step={3} title="Que s'est-il passé ?" subtitle="Plus les réponses sont précises, plus le technicien réparera vite">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date de l'incident" required hint="Quand le problème est-il apparu ?">
                  <input type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Heure" hint="Approximative si besoin.">
                  <input type="time" value={incidentTime} onChange={(e) => setIncidentTime(e.target.value)} className={inputCls} />
                </Field>
              </div>

              <Field label="À quelle fréquence ?" hint="Le problème se répète-t-il ?">
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={inputCls}>
                  {INCIDENT_FREQUENCIES.map(v => <option key={v}>{v}</option>)}
                </select>
              </Field>

              <Field label="Quel impact sur votre travail ?" hint="Pouvez-vous continuer à travailler malgré le problème ?">
                <select value={impact} onChange={(e) => handleImpact(e.target.value)} className={inputCls}>
                  {INCIDENT_IMPACTS.map(v => <option key={v}>{v}</option>)}
                </select>
              </Field>

              <Field label="Priorité" hint="Proposée selon l'impact. Critique : un service entier est bloqué.">
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputCls}>
                  {INCIDENT_PRIORITIES.map(v => <option key={v}>{v}</option>)}
                </select>
              </Field>

              <div className="lg:col-span-2">
                <Field
                  label="Décrivez le problème"
                  required
                  counter={`${description.length}/${INCIDENT_LIMITS.description}`}
                  hint="Que faisiez-vous ? Que voyez-vous ou entendez-vous (écran noir, bruit, lenteur, redémarrage...) ?"
                >
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={INCIDENT_LIMITS.description}
                    placeholder="L'ordinateur redémarre tout seul plusieurs fois par jour..."
                    className={textareaCls}
                  />
                </Field>
              </div>

              <Field
                label="Message d'erreur affiché"
                counter={`${errorMessage.length}/${INCIDENT_LIMITS.errorMessage}`}
                hint="Recopiez le texte exact, ou laissez vide s'il n'y en a pas."
              >
                <input
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  maxLength={INCIDENT_LIMITS.errorMessage}
                  placeholder="Écran bleu : CRITICAL_PROCESS_DIED"
                  className={inputCls}
                />
              </Field>

              <Field
                label="Qu'avez-vous déjà essayé ?"
                counter={`${actionsTried.length}/${INCIDENT_LIMITS.actionsTried}`}
                hint="Redémarrage, autre prise électrique, autre câble..."
              >
                <input
                  value={actionsTried}
                  onChange={(e) => setActionsTried(e.target.value)}
                  maxLength={INCIDENT_LIMITS.actionsTried}
                  placeholder="Redémarrage complet, câbles rebranchés"
                  className={inputCls}
                />
              </Field>

              <Field label="Cause supposée" hint="Un événement récent peut expliquer la panne (coupure de courant, chute...).">
                <select value={suspectedCause} onChange={(e) => setSuspectedCause(e.target.value)} className={inputCls}>
                  {INCIDENT_CAUSES.map(v => <option key={v}>{v}</option>)}
                </select>
              </Field>

              <Field label="Dommage visible sur le matériel ?" hint="Écran fissuré, câble abîmé, trace de liquide...">
                <select value={physicalDamage} onChange={(e) => setPhysicalDamage(e.target.value)} className={inputCls}>
                  {INCIDENT_DAMAGES.map(v => <option key={v}>{v}</option>)}
                </select>
              </Field>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Nouveau rapport
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {!canSubmit && (
            <span className="text-[11px] text-slate-400">Choisissez une personne et décrivez le problème.</span>
          )}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => setPreview(buildData())}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Eye className="w-3.5 h-3.5" />
            Aperçu
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              const d = buildData();
              if (d) printIncidentReport(d);
            }}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer
          </button>
          <button
            type="button"
            disabled={!canSubmit || isDownloading}
            onClick={() => {
              const d = buildData();
              if (d) void download(d);
            }}
            className="h-9 inline-flex items-center gap-1.5 px-4 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Télécharger le PDF
          </button>
        </div>
      </div>

      {/* Aperçu A4 */}
      {preview && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl h-[94vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 shrink-0">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-900 truncate">Rapport d&apos;incident · {preview.fullName}</h2>
                <p className="text-[11px] text-slate-500 font-mono">{buildIncidentReference(preview)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => void download(preview)}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Télécharger PDF
                </button>
                <button
                  onClick={() => printIncidentReport(preview)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-x-auto bg-slate-200">
              <iframe
                title="Aperçu du rapport d'incident"
                srcDoc={previewHTML}
                className="block mx-auto h-full bg-transparent border-0"
                style={{ width: 'calc(210mm + 48px)', maxWidth: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
