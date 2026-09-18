import React, { useState } from 'react';
import { ProdimaLogo } from './ProdimaLogo';
import { useTheme } from '../context/ThemeContext';
import {
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (usr: string, pass: string) => Promise<void>;
  loading?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, loading = false }) => {
  const { activeTheme, setPreference } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Por favor ingrese su usuario o correo corporativo.');
      return;
    }

    if (!password) {
      setErrorMessage('Ingrese su contraseña.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onLogin(cleanEmail, password);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Credenciales inválidas. Verifique sus datos e intente nuevamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans transition-colors duration-200">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/15 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <header className="max-w-md sm:max-w-lg w-full mx-auto flex items-center justify-between py-2 border-b border-slate-300 dark:border-slate-800 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <ProdimaLogo size="sm" className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 tracking-wider">
                PRODIMA <span className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">GUATEMALA</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                30 Años
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Control de Maquinaria & Soldadura Industrial</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPreference(activeTheme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition shadow-sm cursor-pointer"
          title={activeTheme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          {activeTheme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">Modo Oscuro</span>
            </>
          )}
        </button>
      </header>

      <main className="max-w-md sm:max-w-lg w-full mx-auto my-auto py-6 relative z-10">
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-colors">
          
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-amber-500/40 inline-flex items-center justify-center">
              <ProdimaLogo size="lg" className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Acceso a PRODIMA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Iniciar Sesión
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-sm font-medium">
              Ingrese sus credenciales para acceder a la plataforma industrial.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-100 dark:bg-red-950/60 border-2 border-red-500/50 rounded-xl text-red-700 dark:text-red-300 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Correo Electrónico o Usuario
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ingrese su correo o usuario"
                  autoComplete="username"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-400 transition font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Contraseña de Acceso
                </label>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Ingrese su contraseña"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl pl-10 pr-12 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-400 transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/30 text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 tracking-wide"
            >
              {submitting || loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Validando permisos en servidor...</span>
                </>
               ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      <footer className="max-w-md sm:max-w-lg w-full mx-auto pt-4 border-t border-slate-300 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400 relative z-10 font-medium">
        <p>© {new Date().getFullYear()} PRODIMA Guatemala • Sistema de Trazabilidad y Control Industrial</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">Soporte Técnico PBX: (502) 2472-7019</p>
      </footer>
    </div>
  );
};
