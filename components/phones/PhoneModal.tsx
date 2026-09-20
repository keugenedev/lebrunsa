'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { PhoneAsset } from '@/types/inventory';
import { buildPhoneCode, generatePhoneSuffix } from '@/lib/phones';
import { X, Smartphone, User, Lock } from 'lucide-react';

const COMPANIES = ['Lebrun S.A.', 'Autobiz', 'Caribe Motors', 'Leader Foods', 'Tirezone'];
const BRANDS = ['Samsung', 'Apple iPhone', 'Xiaomi', 'Tecno', 'Infinix', 'Huawei', 'Oppo', 'Motorola', 'Nokia', 'Google Pixel'];

/** Retire espaces et tirets d'un IMEI saisi à la main. */
const cleanImei = (v: string) => v.replace(/[\s-]/g, '');

const labelCls = 'block text-slate-700 font-semibold mb-1';
const inputCls =
  'w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400';

/** Le formulaire n'existe que lorsque la fenêtre est ouverte : l'état repart de zéro à chaque ouverture. */
export default function PhoneModal() {
  const { isPhoneModalOpen, editingPhone } = useInventory();
  if (!isPhoneModalOpen) return null;
  return <PhoneForm key={editingPhone?.id ?? 'new'} />;
}

function PhoneForm() {
  const { closePhoneModal, editingPhone, addPhone, updatePhone, phones, employees } = useInventory();

  const initialOwner = editingPhone
    ? employees.find(e => e.employeeId === editingPhone.assignedPersonnelId || e.id === editingPhone.assignedPersonnelId)
    : undefined;

  const [brand, setBrand] = useState(editingPhone?.brand ?? '');
  const [model, setModel] = useState(editingPhone?.model ?? '');
  const [imei1, setImei1] = useState(editingPhone?.imei1 ?? '');
  const [imei2, setImei2] = useState(editingPhone?.imei2 ?? '');
  const [personId, setPersonId] = useState(initialOwner?.id ?? '');
  const [company, setCompany] = useState(editingPhone?.company || 'Lebrun S.A.');
  const [site, setSite] = useState(editingPhone?.site ?? '');
  const [observations, setObservations] = useState(editingPhone?.observations ?? '');
  // Code <ENTREPRISE>-TEL-<aléatoire> : la partie aléatoire est tirée une seule fois à l'ouverture,
  // le préfixe suit l'entreprise (LEB, CAR, AUT...). Jamais saisi à la main ; figé une fois enregistré.
  const [suffix] = useState(() => generatePhoneSuffix(phones.map(p => p.assetTag)));
  const assetTag = editingPhone?.assetTag ?? buildPhoneCode(company, suffix);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [touched, setTouched] = useState(false);
  const brandRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const imei1Ref = useRef<HTMLInputElement>(null);
  const imei2Ref = useRef<HTMLInputElement>(null);

  const sortedEmployees = useMemo(
    () => [...employees].sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'fr')),
    [employees]
  );

  const owner = employees.find(e => e.id === personId);

  // Validation : IMEI facultatifs, mais s'ils sont saisis ils doivent avoir 15 chiffres et être uniques
  const validateImei = (raw: string, other: string): string => {
    const v = cleanImei(raw);
    if (!v) return '';
    if (!/^\d{15}$/.test(v)) return 'Un IMEI comporte exactement 15 chiffres.';
    if (v === cleanImei(other)) return 'IMEI 1 et IMEI 2 doivent être différents.';
    const dup = phones.find(
      p => p.id !== editingPhone?.id && (cleanImei(p.imei1 || '') === v || cleanImei(p.imei2 || '') === v)
    );
    if (dup) return `Déjà utilisé par ${dup.brand} ${dup.model} (${dup.assetTag}).`;
    return '';
  };
  const imei1Error = validateImei(imei1, imei2);
  const imei2Error = validateImei(imei2, imei1);
  const canSave = brand.trim() !== '' && model.trim() !== '' && !imei1Error && !imei2Error;

  const handlePerson = (id: string) => {
    setPersonId(id);
    const emp = employees.find(e => e.id === id);
    if (emp) {
      setCompany(emp.company || company);
      setSite(emp.site || emp.location || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setSubmitError('');
    if (isSubmitting) return;

    if (!canSave) {
      // Le formulaire est parfois plus haut que l'écran : on dit clairement ce qui bloque
      // et on amène le champ concerné à l'écran.
      const problems: [string, React.RefObject<HTMLInputElement | null>][] = [];
      if (!brand.trim()) problems.push(['la marque', brandRef]);
      if (!model.trim()) problems.push(['le modèle', modelRef]);
      if (imei1Error) problems.push(['l\'IMEI 1', imei1Ref]);
      if (imei2Error) problems.push(['l\'IMEI 2', imei2Ref]);
      setSubmitError(`Enregistrement impossible : vérifiez ${problems.map(p => p[0]).join(', ')} (champs en rouge).`);
      const first = problems[0]?.[1].current;
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      first?.focus({ preventScroll: true });
      return;
    }
    setIsSubmitting(true);

    try {
      const payload: Omit<PhoneAsset, 'id' | 'createdAt' | 'updatedAt'> = {
        assetTag,
        company,
        site: site.trim(),
        brand: brand.trim(),
        model: model.trim(),
        imei1: cleanImei(imei1) || undefined,
        imei2: cleanImei(imei2) || undefined,
        assignedPersonnelId: owner ? owner.employeeId || owner.id : undefined,
        assignedTo: owner ? owner.fullName : undefined,
        observations: observations.trim()
      };

      const res = editingPhone ? await updatePhone(editingPhone.id, payload) : await addPhone(payload);
      if (res?.success !== false) closePhoneModal();
      else setSubmitError(res?.error || "L'enregistrement a échoué. Réessayez.");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "L'enregistrement a échoué. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white border border-slate-200 shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto rounded-2xl">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingPhone ? 'Modifier le téléphone' : 'Nouveau téléphone / portable'}
              </h3>
              <p className="text-[11px] text-slate-500">Appareil et personne à qui il est associé</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closePhoneModal}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Appareil */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-700" />
              <span>Appareil</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  Marque <span className="text-red-500">*</span>
                </label>
                <input
                  ref={brandRef}
                  list="phone-brands"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Samsung"
                  className={inputCls}
                  autoFocus
                />
                <datalist id="phone-brands">
                  {BRANDS.map(b => <option key={b} value={b} />)}
                </datalist>
                {touched && !brand.trim() && <p className="mt-1 text-[11px] text-red-600">La marque est obligatoire.</p>}
              </div>
              <div>
                <label className={labelCls}>
                  Modèle <span className="text-red-500">*</span>
                </label>
                <input
                  ref={modelRef}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Galaxy A54"
                  className={inputCls}
                />
                {touched && !model.trim() && <p className="mt-1 text-[11px] text-red-600">Le modèle est obligatoire.</p>}
              </div>
              <div>
                <label className={labelCls}>
                  IMEI 1 <span className="text-slate-400 font-normal">(facultatif)</span>
                </label>
                <input
                  ref={imei1Ref}
                  value={imei1}
                  onChange={(e) => setImei1(e.target.value)}
                  inputMode="numeric"
                  maxLength={20}
                  placeholder="15 chiffres"
                  className={`${inputCls} font-mono`}
                />
                {imei1Error && <p className="mt-1 text-[11px] text-red-600">{imei1Error}</p>}
              </div>
              <div>
                <label className={labelCls}>
                  IMEI 2 <span className="text-slate-400 font-normal">(facultatif)</span>
                </label>
                <input
                  ref={imei2Ref}
                  value={imei2}
                  onChange={(e) => setImei2(e.target.value)}
                  inputMode="numeric"
                  maxLength={20}
                  placeholder="Si double SIM"
                  className={`${inputCls} font-mono`}
                />
                {imei2Error && <p className="mt-1 text-[11px] text-red-600">{imei2Error}</p>}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Astuce : composez <span className="font-mono font-semibold text-slate-700">*#06#</span> sur le téléphone pour afficher son ou ses IMEI.
            </p>
          </div>

          {/* Personne associée */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-700" />
              <span>Personne associée</span>
            </div>

            <div>
              <label className={labelCls}>Collaborateur</label>
              <select value={personId} onChange={(e) => handlePerson(e.target.value)} className={inputCls}>
                <option value="">Non attribué (en réserve)</option>
                {sortedEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} — {emp.company}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Entreprise</label>
                <select value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls}>
                  {COMPANIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Site</label>
                <input value={site} onChange={(e) => setSite(e.target.value)} placeholder="Delmas 52" className={inputCls} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className={labelCls}>Code</label>
              <div className="relative">
                <input
                  value={assetTag}
                  readOnly
                  tabIndex={-1}
                  aria-readonly="true"
                  title="Code généré automatiquement, non modifiable"
                  className={`${inputCls} pr-8 font-mono font-bold bg-slate-50 text-slate-700 cursor-not-allowed select-all`}
                />
                <Lock className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">Généré automatiquement</p>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Observations</label>
              <input
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Coque, chargeur fourni, écran fissuré..."
                className={inputCls}
              />
            </div>
          </div>

          {/* Pied collant : le message et le bouton restent visibles même si le formulaire défile */}
          <div className="sticky -bottom-6 -mx-6 -mb-6 px-6 py-3 bg-white border-t border-slate-100 space-y-2">
            {submitError && (
              <div role="alert" className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-700">
                {submitError}
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closePhoneModal}
                className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-9 px-5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? 'Enregistrement...' : editingPhone ? 'Enregistrer' : 'Ajouter le téléphone'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
