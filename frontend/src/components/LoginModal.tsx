import React, { useState } from 'react';
import { KeyRound, Mail, X, AlertCircle } from 'lucide-react';
import { ProdimaLogo } from './ProdimaLogo';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (usr: string, pass: string) => Promise<void>;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUser.trim()) {
      setError('Por favor ingrese su correo o usuario corporativo.');
      return;
    }
    if (!password) {
      setError('Ingrese su contraseña.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onLogin(emailOrUser.trim(), password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con las credenciales ingresadas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <ProdimaLogo size="sm" className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-slate-900 dark:text-white text-base">PRODIMA Guatemala</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">30 Años</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Autenticación de Usuario</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-2 border-red-500/40 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-800 dark:text-slate-200 mb-1.5 font-bold">
              Correo Electrónico o Usuario
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Ingrese su correo o usuario"
                autoComplete="username"
                value={emailOrUser}
                onChange={e => {
                  setEmailOrUser(e.target.value);
                  setError(null);
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl pl-10 pr-3 py-2.5 font-mono focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-400 transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 dark:text-slate-200 mb-1.5 font-bold">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-400 transition font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t-2 border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md shadow-amber-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Accediendo...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
