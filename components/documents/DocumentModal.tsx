'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { DocumentItem, DocumentCategory } from '@/types/inventory';
import { 
  X, 
  FileText, 
  FolderPlus, 
  Save, 
  Building, 
  MapPin, 
  User, 
  Calendar,
  FileCode,
  Tag
} from 'lucide-react';

const CATEGORIES: DocumentCategory[] = [
  'Fiches d\'Affectation',
  'Procédures & Guides IT',
  'Contrats & Garanties',
  'Schémas Réseau & Infrastructure',
  'Politiques de Sécurité',
  'Factures & Bons de Commande',
  'Procès-Verbaux & Décharges'
];

const COMPANIES = [
  'Lebrun S.A.',
  'Caribe Motors',
  'Autobiz',
  'Leader Foods'
];

export default function DocumentModal() {
  const {
    isDocumentModalOpen,
    closeDocumentModal,
    editingDocument,
    addDocument,
    updateDocument,
    documents
  } = useInventory();

  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Fiches d\'Affectation');
  const [company, setCompany] = useState('Lebrun S.A.');
  const [site, setSite] = useState('Delmas 52');
  const [fileType, setFileType] = useState<'pdf' | 'xlsx' | 'docx' | 'png' | 'txt'>('pdf');
  const [fileSize, setFileSize] = useState('250 KB');
  const [author, setAuthor] = useState('Direction IT');
  const [status, setStatus] = useState<'valide' | 'en_revue' | 'archive'>('valide');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingDocument) {
      setTitle(editingDocument.title || '');
      setReference(editingDocument.reference || '');
      setCategory(editingDocument.category || 'Fiches d\'Affectation');
      setCompany(editingDocument.company || 'Lebrun S.A.');
      setSite(editingDocument.site || 'Delmas 52');
      setFileType(editingDocument.fileType || 'pdf');
      setFileSize(editingDocument.fileSize || '250 KB');
      setAuthor(editingDocument.author || 'Direction IT');
      setStatus(editingDocument.status || 'valide');
      setDescription(editingDocument.description || '');
      setErrors({});
    } else {
      const year = new Date().getFullYear();
      const num = String(documents.length + 1).padStart(3, '0');
      setTitle('');
      setReference(`DOC-LEB-${year}-${num}`);
      setCategory('Fiches d\'Affectation');
      setCompany('Lebrun S.A.');
      setSite('Delmas 52');
      setFileType('pdf');
      setFileSize('250 KB');
      setAuthor('Direction IT');
      setStatus('valide');
      setDescription('');
      setErrors({});
    }
  }, [editingDocument, documents.length, isDocumentModalOpen]);

  if (!isDocumentModalOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = 'Le titre du document est obligatoire.';
    }
    if (!reference.trim()) {
      newErrors.reference = 'La référence est requise.';
    }
    if (!author.trim()) {
      newErrors.author = 'L\'auteur ou le service est requis.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);

      let res;
      if (editingDocument) {
        res = await updateDocument(editingDocument.id, {
          title: title.trim(),
          reference: reference.trim().toUpperCase(),
          category,
          company,
          site: site.trim(),
          fileType,
          fileSize: fileSize.trim() || '250 KB',
          author: author.trim(),
          lastUpdated: today,
          status,
          description: description.trim()
        });
      } else {
        res = await addDocument({
          title: title.trim(),
          reference: reference.trim().toUpperCase(),
          category,
          company,
          site: site.trim(),
          fileType,
          fileSize: fileSize.trim() || '250 KB',
          author: author.trim(),
          lastUpdated: today,
          status,
          description: description.trim()
        });
      }

      if (res?.success !== false) {
        closeDocumentModal();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={closeDocumentModal}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileText className="w-5 h-5 text-slate-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {editingDocument ? 'Modifier le Document' : 'Ajouter un Document'}
              </h2>
              <p className="text-xs text-slate-500">
                {editingDocument 
                  ? `Mise à jour des métadonnées de "${editingDocument.title}"`
                  : 'Enregistrement d\'un nouveau document au registre officiel Lebrun S.A.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDocumentModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* General Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-slate-700" />
              <span>Désignation & Catégorie</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Title */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Titre officiel du document <span className="text-rose-500">*</span></span>
                  {errors.title && <span className="text-[11px] text-rose-500 font-normal">{errors.title}</span>}
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Fiche d'affectation Dell OptiPlex, Guide Procédure Sauvegarde..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all ${
                    errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
              </div>

              {/* Reference */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Référence / Numéro <span className="text-rose-500">*</span></span>
                  {errors.reference && <span className="text-[11px] text-rose-500 font-normal">{errors.reference}</span>}
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: DOC-LEB-2026-001"
                  value={reference}
                  onChange={(e) => setReference(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all uppercase"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Catégorie documentaire <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all cursor-pointer"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Company & Scope */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Building className="w-3.5 h-3.5 text-slate-700" />
              <span>Périmètre & Affectation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Company */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Société concernée</label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all cursor-pointer"
                >
                  {COMPANIES.map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>

              {/* Site */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Site / Localisation</label>
                <input
                  type="text"
                  placeholder="Delmas 52, Pétion-Ville, Tous les sites..."
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                />
              </div>

              {/* Author */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Auteur / Rédacteur <span className="text-rose-500">*</span></span>
                  {errors.author && <span className="text-[11px] text-rose-500 font-normal">{errors.author}</span>}
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Kensly Eugene, Direction IT..."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Statut du document</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'valide' | 'en_revue' | 'archive')}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all cursor-pointer"
                >
                  <option value="valide">Valide / En vigueur</option>
                  <option value="en_revue">En cours de revue</option>
                  <option value="archive">Archivé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <FileCode className="w-3.5 h-3.5 text-slate-700" />
              <span>Format & Propriétés du Fichier</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* File Type */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Format de fichier</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all cursor-pointer uppercase"
                >
                  <option value="pdf">PDF (Document standard)</option>
                  <option value="xlsx">XLSX (Tableau / Inventaire)</option>
                  <option value="docx">DOCX (Document texte)</option>
                  <option value="png">PNG (Schéma / Image)</option>
                  <option value="txt">TXT (Texte brut)</option>
                </select>
              </div>

              {/* File Size */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Taille estimée</label>
                <input
                  type="text"
                  placeholder="ex: 240 KB, 1.2 MB..."
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Description & Sommaire
                </label>
                <textarea
                  rows={3}
                  placeholder="Détails du contenu, procédure couverte, équipement concerné..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeDocumentModal}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-xl shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingDocument ? 'Enregistrer les modifications' : 'Créer le document'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
