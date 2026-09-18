'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useInventory, WifiNetwork } from '@/context/InventoryContext';
import CompanyLogo from '@/components/common/CompanyLogo';
import { 
  Wifi, 
  Satellite, 
  Printer, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Plus, 
  Edit2, 
  Trash2, 
  QrCode, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Radio, 
  Activity,
  X,
  Share2,
  Lock,
  Building2
} from 'lucide-react';

interface WifiQRCodeProps {
  ssid: string;
  password: string;
  security?: string;
  className?: string;
}

function WifiQRCode({ ssid, password, security = 'WPA', className = '' }: WifiQRCodeProps) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    // Universal Wi-Fi QR Code string standard supported by iOS and Android:
    // WIFI:T:WPA;S:SSID;P:PASSWORD;;
    const wifiString = `WIFI:T:${security};S:${ssid};P:${password};;`;
    QRCode.toDataURL(wifiString, {
      width: 260,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => setQrUrl(url))
      .catch(err => console.error('QR Code error:', err));
  }, [ssid, password, security]);

  if (!qrUrl) {
    return (
      <div className="w-36 h-36 rounded-xl bg-slate-100 animate-pulse flex items-center justify-center">
        <QrCode className="w-8 h-8 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="relative group">
      <img 
        src={qrUrl} 
        alt={`QR Code Wi-Fi pour ${ssid}`}
        className={`w-36 h-36 rounded-xl border border-slate-200 shadow-xs bg-white p-1.5 object-contain ${className}`}
      />
    </div>
  );
}

export default function WifiPosterView() {
  const { 
    wifiNetworks, 
    addWifiNetwork, 
    updateWifiNetwork, 
    deleteWifiNetwork, 
    selectedWifiEstablishment, 
    setSelectedWifiEstablishment 
  } = useInventory();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNet, setEditingNet] = useState<WifiNetwork | null>(null);
  const [printableNetwork, setPrintableNetwork] = useState<WifiNetwork | null>(null);

  // Form states for add/edit modal
  const [formEst, setFormEst] = useState('');
  const [formComp, setFormComp] = useState('Lebrun S.A.');
  const [formSsid, setFormSsid] = useState('');
  const [formPass, setFormPass] = useState('');
  const [formType, setFormType] = useState<'Starlink' | 'Fibre Dédiée' | 'Fibre Backup' | '4G/LTE'>('Starlink');
  const [formDish, setFormDish] = useState('');
  const [formSpeed, setFormSpeed] = useState('');
  const [formBand, setFormBand] = useState<'Dual-Band (2.4 / 5 GHz)' | '5 GHz Haute Vitesse' | '2.4 GHz Longue Portée'>('Dual-Band (2.4 / 5 GHz)');
  const [formLocation, setFormLocation] = useState('');
  const [formIsGuest, setFormIsGuest] = useState(false);

  const establishments = [
    { id: 'all', label: 'Tous les Réseaux Wi-Fi' },
    { id: 'Delmas 52', label: 'Delmas 52 (Tirezone & Autobiz)' },
    { id: 'Pétion-Ville', label: 'Pétion-Ville' },
    { id: 'Delmas 60', label: 'Delmas 60' },
    { id: 'Canapé-Vert', label: 'Canapé-Vert' }
  ];

  const filteredNetworks = wifiNetworks.filter(net => {
    if (selectedWifiEstablishment === 'all') return true;
    return net.establishment.toLowerCase().includes(selectedWifiEstablishment.toLowerCase());
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openAddNetModal = () => {
    setEditingNet(null);
    setFormEst('');
    setFormComp('Lebrun S.A.');
    setFormSsid('');
    setFormPass('');
    setFormType('Starlink');
    setFormDish('');
    setFormSpeed('');
    setFormBand('Dual-Band (2.4 / 5 GHz)');
    setFormLocation('');
    setFormIsGuest(false);
    setIsModalOpen(true);
  };

  const openEditNetModal = (net: WifiNetwork) => {
    setEditingNet(net);
    setFormEst(net.establishment);
    setFormComp(net.company);
    setFormSsid(net.ssid);
    setFormPass(net.password);
    setFormType(net.providerType);
    setFormDish(net.starlinkDetails?.dishSerial || '');
    setFormSpeed(net.starlinkDetails?.speedEstimated || '220 Mbps');
    setFormBand(net.frequencyBand);
    setFormLocation(net.locationDetail);
    setFormIsGuest(!!net.isGuestNetwork);
    setIsModalOpen(true);
  };

  const handleSaveNetwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSsid || !formPass) return;

    const payload: Omit<WifiNetwork, 'id'> = {
      establishment: formEst,
      company: formComp,
      ssid: formSsid,
      password: formPass,
      providerType: formType,
      starlinkDetails: formType === 'Starlink' ? {
        dishSerial: formDish || 'UT-STARLINK-V2',
        speedEstimated: formSpeed || '240 Mbps',
        latency: '25 ms',
        servicePlan: 'Priority 1TB'
      } : undefined,
      frequencyBand: formBand,
      security: 'WPA2/WPA3',
      locationDetail: formLocation,
      isGuestNetwork: formIsGuest
    };

    if (editingNet) {
      updateWifiNetwork(editingNet.id, payload);
    } else {
      addWifiNetwork(payload);
    }
    setIsModalOpen(false);
  };

  const handlePrintSingle = (net: WifiNetwork) => {
    setPrintableNetwork(net);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Affiches & Fiches Wi-Fi par Établissement</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {wifiNetworks.length} réseaux certifiés
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifiants sans-fil, liaisons Starlink & Fibre, mots de passe et QR codes scannables prêts à imprimer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setPrintableNetwork(null);
              window.print();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-xs transition cursor-pointer shadow-2xs"
            title="Imprimer toutes les affiches Wi-Fi"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer les Affiches</span>
          </button>
          <button
            onClick={openAddNetModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Réseau Wi-Fi</span>
          </button>
        </div>
      </div>

      {/* Establishment Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {establishments.map((est) => {
          const isActive = selectedWifiEstablishment === est.id;
          const count = est.id === 'all' 
            ? wifiNetworks.length 
            : wifiNetworks.filter(n => n.establishment.toLowerCase().includes(est.id.toLowerCase())).length;

          return (
            <button
              key={est.id}
              onClick={() => setSelectedWifiEstablishment(est.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-2xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span>{est.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Posters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredNetworks.map((net) => {
          const isStarlink = net.providerType === 'Starlink';
          const isPassVisible = !!visiblePasswords[net.id];

          return (
            <div
              key={net.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CompanyLogo company={net.company} className="h-6 max-w-[85px] w-auto object-contain" />
                    <div className="h-4 w-px bg-slate-300"></div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
                        {net.establishment}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 block truncate">
                        {net.locationDetail}
                      </span>
                    </div>
                  </div>

                  {/* Starlink vs Fibre Badge */}
                  {isStarlink ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-white shadow-2xs shrink-0">
                      <Satellite className="w-3 h-3 text-slate-300 animate-pulse" />
                      <span>STARLINK</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300 shrink-0">
                      <Radio className="w-3 h-3 text-slate-700" />
                      <span>FIBRE OPTIQUE</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body with QR Code & Credentials */}
              <div className="p-5 space-y-4">
                {/* QR Code & Fast Scan Callout */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="shrink-0 bg-white p-1 rounded-xl shadow-2xs">
                    <WifiQRCode ssid={net.ssid} password={net.password} />
                  </div>
                  <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900">
                      <Sparkles className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      <span>Connexion Instantanée</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Ouvrez l'appareil photo de votre smartphone (iPhone / Android) et visez le QR Code pour vous connecter immédiatement sans mot de passe.
                    </p>
                    <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-[10px] text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium">
                        {net.frequencyBand}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium">
                        {net.security}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Network SSID (Nom du réseau) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Nom du Réseau Wi-Fi (SSID)
                  </span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="font-mono text-sm font-bold text-slate-900 select-all tracking-tight truncate mr-2">
                      {net.ssid}
                    </span>
                    <button
                      onClick={() => handleCopy(`ssid-${net.id}`, net.ssid)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer shrink-0"
                      title="Copier le nom du réseau"
                    >
                      {copiedId === `ssid-${net.id}` ? (
                        <Check className="w-3.5 h-3.5 text-slate-900" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mot de passe Wi-Fi */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Mot de Passe de Sécurité
                    </span>
                    <button
                      onClick={() => togglePasswordVisibility(net.id)}
                      className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition cursor-pointer"
                    >
                      {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-slate-600" />}
                      <span>{isPassVisible ? 'Masquer' : 'Afficher'}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className={`font-mono text-sm font-bold tracking-tight truncate mr-2 ${!net.password ? 'text-slate-400 italic text-xs' : 'text-slate-900 select-all'}`}>
                      {!net.password ? '[Mot de passe à renseigner - Cliquez sur Modifier]' : isPassVisible ? net.password : '••••••••••••••••'}
                    </span>
                    {net.password ? (
                      <button
                        onClick={() => handleCopy(`pass-${net.id}`, net.password)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer shrink-0"
                        title="Copier le mot de passe"
                      >
                        {copiedId === `pass-${net.id}` ? (
                          <Check className="w-3.5 h-3.5 text-slate-900" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => openEditNetModal(net)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                      >
                        Définir
                      </button>
                    )}
                  </div>
                </div>

                {/* Starlink Specs if applicable */}
                {isStarlink && net.starlinkDetails && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-medium flex items-center gap-1">
                        <Activity className="w-3 h-3 text-slate-500" />
                        <span>Débit Satellite Estimé</span>
                      </span>
                      <span className="font-bold text-slate-900">{net.starlinkDetails.speedEstimated || '240 Mbps'}</span>
                    </div>
                    {net.starlinkDetails.dishSerial && (
                      <div className="flex items-center justify-between text-slate-500 text-[10px]">
                        <span>Antenne Starlink (Dish SN)</span>
                        <span className="font-mono font-medium">{net.starlinkDetails.dishSerial}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handlePrintSingle(net)}
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-semibold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer cette Affiche</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditNetModal(net)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                    title="Modifier ce réseau"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer le réseau Wi-Fi ${net.ssid} ?`)) {
                        deleteWifiNetwork(net.id);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-900 transition cursor-pointer"
                    title="Supprimer ce réseau"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Wi-Fi Network Modal (matching user modal design) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="w-full max-w-lg sm:max-w-xl bg-white border border-slate-200 shadow-2xl rounded-2xl relative max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingNet ? 'Modifier le Réseau Wi-Fi' : 'Ajouter un Réseau Wi-Fi Établissement'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configuration des identifiants sans-fil, liaison Starlink et QR code
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNetwork} className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Section 1: Établissement & Entreprise */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Établissement & Entreprise</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                      Établissement / Site <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formEst}
                      onChange={(e) => setFormEst(e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      <option value="">Sélectionner un site...</option>
                      <option value="Delmas 52">Delmas 52</option>
                      <option value="Pétion-Ville">Pétion-Ville</option>
                      <option value="Delmas 60">Delmas 60</option>
                      <option value="Canapé-Vert">Canapé-Vert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                      Entreprise Titulaire <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formComp}
                      onChange={(e) => setFormComp(e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      <option value="Lebrun S.A.">Lebrun S.A.</option>
                      <option value="Autobiz">Autobiz</option>
                      <option value="Caribe Motors">Caribe Motors</option>
                      <option value="Leader Foods">Leader Foods</option>
                      <option value="Tirezone">Tirezone</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Identifiants Wi-Fi & Sécurité */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-slate-500" />
                  <span>Identifiants Wi-Fi & Sécurité</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                      Nom du Réseau (SSID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formSsid}
                      onChange={(e) => setFormSsid(e.target.value)}
                      placeholder="ex: LEBRUN_CORP_5G"
                      className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                      Mot de Passe de Sécurité <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formPass}
                      onChange={(e) => setFormPass(e.target.value)}
                      placeholder="Mot de passe sécurisé"
                      className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Liaison & Fréquence */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-slate-500" />
                  <span>Liaison & Technologie</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                      Type de Fournisseur / Liaison <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      <option value="Starlink">Starlink Satellite Haute Performance</option>
                      <option value="Fibre Dédiée">Fibre Optique Dédiée</option>
                      <option value="Fibre Backup">Ligne de Secours (Fibre)</option>
                      <option value="4G/LTE">Routeur 4G / LTE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 whitespace-nowrap">
                      Fréquence / Bande
                    </label>
                    <select
                      value={formBand}
                      onChange={(e) => setFormBand(e.target.value as any)}
                      className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      <option value="Dual-Band (2.4 / 5 GHz)">Dual-Band (2.4 / 5 GHz)</option>
                      <option value="5 GHz Haute Vitesse">5 GHz Haute Vitesse</option>
                      <option value="2.4 GHz Longue Portée">2.4 GHz Longue Portée</option>
                    </select>
                  </div>
                </div>

                {/* Starlink Details if applicable */}
                {formType === 'Starlink' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                        N° Série Antenne Starlink (Dish SN)
                      </label>
                      <input
                        type="text"
                        value={formDish}
                        onChange={(e) => setFormDish(e.target.value)}
                        placeholder="UT-7821-X9B"
                        className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                        Débit Estimé (Mbps)
                      </label>
                      <input
                        type="text"
                        value={formSpeed}
                        onChange={(e) => setFormSpeed(e.target.value)}
                        placeholder="240 Mbps"
                        className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Emplacement Précis */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Emplacement Précis dans le Bâtiment</span>
                </div>

                <div>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="ex: Bâtiment Administratif, Showroom Vente, Entrepôt..."
                    className="w-full h-10 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 p-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={(e) => {
                  const form = (e.currentTarget.closest('.bg-white') as HTMLElement)?.querySelector('form');
                  if (form) form.requestSubmit();
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                {editingNet ? 'Enregistrer les Modifications' : 'Créer le Réseau Wi-Fi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Poster Sheet (hidden on screen, visible on print) */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 z-9999 font-sans text-slate-900">
        {(printableNetwork ? [printableNetwork] : filteredNetworks).map((net, idx) => (
          <div key={net.id} className="p-8 border-4 border-slate-900 rounded-3xl max-w-xl mx-auto my-6 text-center space-y-6 page-break-after">
            <div className="flex items-center justify-center gap-3">
              <CompanyLogo company={net.company} className="h-10 max-w-[140px] w-auto object-contain" />
            </div>

            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                ACCÈS WI-FI OFFICIEL
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-1">
                {net.establishment} • {net.locationDetail}
              </p>
            </div>

            {/* Provider Pill */}
            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900 text-white font-bold text-xs">
              {net.providerType === 'Starlink' ? '📡 CONNEXION SATELLITE STARLINK HAUTE VITESSE' : '⚡ LIAISON FIBRE OPTIQUE DÉDIÉE'}
            </div>

            {/* Large QR Code */}
            <div className="flex justify-center my-4">
              <div className="p-4 border-2 border-slate-900 rounded-2xl bg-white shadow-md inline-block">
                <WifiQRCode ssid={net.ssid} password={net.password} className="w-52 h-52" />
              </div>
            </div>

            <p className="text-xs font-bold text-slate-700">
              Visez ce QR Code avec l'appareil photo de votre smartphone pour vous connecter directement.
            </p>

            {/* Credentials box */}
            <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50 space-y-3 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Nom du Réseau (SSID)</span>
                <span className="font-mono text-xl font-black text-slate-900">{net.ssid}</span>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Mot de Passe (Password)</span>
                <span className="font-mono text-xl font-black text-slate-900">{net.password}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400">
              Réseau sécurisé • Usage professionnel interne & visiteurs autorisés • Lebrun S.A.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
