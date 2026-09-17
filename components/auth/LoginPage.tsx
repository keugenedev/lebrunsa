'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
  isStandalonePage?: boolean;
}

export default function LoginPage({ onSuccess, isStandalonePage = false }: LoginPageProps) {
  const { login } = useInventory();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logos officiels du groupe Lebrun (dossier logo)
  const groupLogos = [
    {
      name: 'Lebrun S.A.',
      src: '/logos/lebrun.png',
      alt: 'Logo Lebrun S.A.'
    },
    {
      name: 'Autobiz',
      src: '/logos/autobiz.png',
      alt: 'Logo Autobiz'
    },
    {
      name: 'Caribe',
      src: '/logos/caribe.png',
      alt: 'Logo Caribe'
    },
    {
      name: 'Leader',
      src: '/logos/leader.png',
      alt: 'Logo Leader'
    },
    {
      name: 'Tirezone',
      src: '/logos/tirezone.png',
      alt: 'Logo Tirezone'
    },
    {
      name: 'Groupe Partenaire',
      src: '/logos/partner.png',
      alt: 'Logo Partenaire Groupe'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Veuillez saisir votre adresse e-mail professionnelle.');
      return;
    }

    if (!password) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const ok = login(email, password);
      setIsLoading(false);
      if (ok) {
        if (onSuccess) onSuccess();
        if (isStandalonePage && typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }, 400);
  };

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden bg-[#f8fafc] flex flex-col justify-between items-center px-4 py-3 sm:py-5 select-none">
      
      {/* Spacer top for perfect vertical optical balance */}
      <div className="shrink-0 h-1 sm:h-2" />

      {/* Main Login Card - Centered, Compact & Professional */}
      <div className="w-full max-w-[390px] shrink-0 my-auto">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
          
          {/* Logo Lebrun Centered */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/lebrun.png"
                alt="Logo Lebrun S.A."
                className="h-16 sm:h-18 w-auto object-contain"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-[11px] font-medium text-slate-700 mb-1"
              >
                Adresse mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@lebrunsa.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-[11px] font-medium text-slate-700 mb-1"
              >
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-9 py-2 bg-slate-50/70 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-sm border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Mémoriser ma session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-medium shadow-sm hover:shadow-md hover:shadow-red-600/20 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-3.5"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Section: Clean Logos (No Boxes, No Borders) */}
      <div className="w-full max-w-5xl shrink-0 pb-2 text-center">
        {/* Logos container: pure logos, elegant alignment, no box cards */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8">
          {groupLogos.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-center h-8 sm:h-9"
              title={item.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt}
                className="max-h-6 sm:max-h-7.5 max-w-[95px] sm:max-w-[115px] w-auto object-contain opacity-85 hover:opacity-100 transition-all duration-200 hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-slate-400 mt-2">
          © 2026 Lebronsa S.A. • Tous droits réservés
        </p>
      </div>
    </div>
  );
}
