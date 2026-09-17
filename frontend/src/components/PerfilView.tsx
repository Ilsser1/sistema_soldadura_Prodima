import React, { useState } from 'react';
import { Usuario } from '../../../shared/types';
import { useTheme, ThemePreference } from '../context/ThemeContext';
import { Sun, Moon, Monitor, X, Check, Palette } from 'lucide-react';

interface PerfilViewProps {
  currentUser: Usuario;
  onUpdatePerfil: (data: Partial<Usuario>) => Promise<void>;
}

export const PerfilView: React.FC<PerfilViewProps> = ({
  currentUser,
  onUpdatePerfil
}) => {
  const { preference, activeTheme, setPreference } = useTheme();

  const [formData, setFormData] = useState({
    nombre: currentUser.nombre,
    apellido: currentUser.apellido,
    correo: currentUser.correo,
    password: ''
  });
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdatePerfil(formData);
      setMessage('Perfil actualizado correctamente.');
      setFormData({ ...formData, password: '' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const themeOptions: { id: ThemePreference; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'system',
      title: 'Automático (Sistema)',
      desc: `Sigue la preferencia del Sistema Operativo (${activeTheme === 'dark' ? 'Oscuro activo' : 'Claro activo'})`,
      icon: <Monitor className="w-4 h-4" />
    },
    {
      id: 'light',
      title: 'Modo Claro',
      desc: 'Interfaz limpia con fondo claro y alto contraste',
      icon: <Sun className="w-4 h-4" />
    },
    {
      id: 'dark',
      title: 'Modo Oscuro',
      desc: 'Tema industrial oscuro de alto rendimiento visual',
      icon: <Moon className="w-4 h-4" />
    }
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl font-bold">
            {currentUser.nombre[0]}{currentUser.apellido[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">{currentUser.nombre} {currentUser.apellido}</h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                {currentUser.rol}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentUser.correo}</p>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Nombre</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Apellido</label>
              <input
                type="text"
                required
                value={formData.apellido}
                onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Correo Electrónico</label>
            <input
              type="email"
              required
              value={formData.correo}
              onChange={e => setFormData({ ...formData, correo: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Nueva Contraseña (Opcional)</label>
            <input
              type="password"
              placeholder="Dejar en blanco si no desea cambiarla"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              Guardar Cambios de Perfil
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Palette className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">Apariencia y Tema del Sistema</h3>
            <p className="text-xs text-slate-400">Selecciona tu preferencia de interfaz visual para PRODIMA ERP</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {themeOptions.map((opt) => {
            const isSelected = preference === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPreference(opt.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-slate-100 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-700/60 text-slate-400'
                    }`}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      {opt.title}
                      {isSelected && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                          Seleccionado
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500 text-slate-950'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center justify-between">
          <span>Estado del Sistema Operativo detectado:</span>
          <span className="font-semibold text-amber-400">
            {activeTheme === 'dark' ? '🌙 Modo Oscuro (Dark)' : '☀️ Modo Claro (Light)'}
          </span>
        </div>
      </div>
    </div>
  );
};
