import React, { useState } from 'react';
import { Usuario, Alerta } from '../../../shared/types';
import { useTheme } from '../context/ThemeContext';
import { ProdimaLogo } from './ProdimaLogo';
import {
  Bell,
  LogOut,
  Menu,
  Sun,
  Moon,
  Monitor,
  Trash2,
  Check,
  KeyRound
} from 'lucide-react';

interface NavbarProps {
  currentUser: Usuario;
  alertas?: Alerta[];
  unreadAlertsCount?: number;
  onMarkAlertRead?: (id: number) => void;
  onMarkAllAlertsRead?: () => void;
  onDeleteAlert?: (id: number) => void;
  onClearAllAlerts?: (soloLeidas?: boolean) => void;
  onNavigateToAlerts?: () => void;
  onOpenLoginModal?: () => void;
  onToggleMobileMenu?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  alertas = [],
  unreadAlertsCount,
  onMarkAlertRead,
  onMarkAllAlertsRead,
  onDeleteAlert,
  onClearAllAlerts,
  onNavigateToAlerts,
  onOpenLoginModal,
  onToggleMobileMenu,
  onLogout
}) => {
  const { preference, activeTheme, setPreference } = useTheme();
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const toggleTheme = () => {
    if (preference === 'system') {
      setPreference(activeTheme === 'dark' ? 'light' : 'dark');
    } else if (preference === 'light') {
      setPreference('dark');
    } else {
      setPreference('system');
    }
  };

  const handleNavigateAlerts = () => {
    if (onNavigateToAlerts) onNavigateToAlerts();
  };

  const unreadAlerts = (alertas || []).filter(a => !a.leida);
  const displayUnreadCount = unreadAlertsCount !== undefined ? unreadAlertsCount : unreadAlerts.length;

  const getPriorityBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'Crítica':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800 border border-red-200">Crítica</span>;
      case 'Alta':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 border border-amber-200">Alta</span>;
      case 'Advertencia':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-yellow-100 text-yellow-800 border border-yellow-200">Advertencia</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800 border border-blue-200">Info</span>;
    }
  };

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5 text-amber-400" />
            </button>
          )}

          <div className="p-1 sm:p-1.5 bg-white/95 dark:bg-slate-800/90 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0">
            <ProdimaLogo size="sm" className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-sm sm:text-base md:text-lg tracking-wide text-amber-500 dark:text-amber-400 leading-tight">
                PRODIMA <span className="text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm">GUATEMALA</span>
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider">
                30 Años
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold">
                ISO 9001
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              ERP de Soldadura Industrial <span className="text-slate-400 dark:text-slate-500">| prodimagt.com</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
            title={`Tema: ${preference === 'system' ? 'Sistema Automático' : preference === 'light' ? 'Claro' : 'Oscuro'} (Clic para alternar)`}
          >
            {preference === 'system' ? (
              <Monitor className="w-5 h-5 text-cyan-400" />
            ) : activeTheme === 'dark' ? (
              <Moon className="w-5 h-5 text-amber-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="relative p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
              title="Notificaciones"
              aria-label="Notificaciones"
              aria-expanded={showAlertsDropdown}
              aria-controls="notifications-panel"
            >
              <Bell className="w-5 h-5" />
              {displayUnreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {displayUnreadCount}
                </span>
              )}
            </button>

            {showAlertsDropdown && (
              <div id="notifications-panel" role="region" aria-label="Notificaciones" className="notifications-panel">
                <div className="notifications-header">
                  <span className="notifications-title">
                    Notificaciones
                  </span>
                  <div className="flex items-center gap-2">
                    {displayUnreadCount > 0 && onMarkAllAlertsRead && (
                      <button
                        onClick={onMarkAllAlertsRead}
                        className="notification-button"
                        title="Marcar todas como leídas"
                      >
                        Leídas
                      </button>
                    )}
                    {alertas.length > 0 && onClearAllAlerts && (
                      <button
                        onClick={() => onClearAllAlerts()}
                        className="notification-button notification-danger flex items-center gap-1"
                        title="Borrar todas las notificaciones"
                      >
                        <Trash2 className="w-3 h-3" /> Limpiar
                      </button>
                    )}
                    <span className="notification-count">
                      {displayUnreadCount} pendientes
                    </span>
                  </div>
                </div>

                <div className="notifications-list">
                  {alertas.length === 0 ? (
                    <div className="notifications-empty">
                      No hay alertas en la bandeja.
                    </div>
                  ) : (
                    (unreadAlerts.length > 0 ? unreadAlerts : alertas).slice(0, 6).map(alerta => (
                      <div key={alerta.id} className="notification-item">
                        <div className="flex items-start justify-between gap-3">
                          <span className="notification-item-title">{alerta.titulo}</span>
                          {getPriorityBadge(alerta.prioridad)}
                        </div>
                        <p className="notification-message">{alerta.mensaje}</p>
                        <div className="notification-meta">
                          <span>{new Date(alerta.fecha_generacion).toLocaleString('es-GT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          <div className="flex items-center gap-2">
                            {!alerta.leida && onMarkAlertRead && (
                              <button
                                onClick={() => onMarkAlertRead(alerta.id)}
                                className="notification-button flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Marcar leída
                              </button>
                            )}
                            {onDeleteAlert && (
                              <button
                                onClick={() => onDeleteAlert(alerta.id)}
                                className="notification-button notification-danger flex items-center gap-1"
                                title="Borrar notificación"
                              >
                                <Trash2 className="w-3 h-3" /> Borrar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="notifications-footer">
                  <button
                    onClick={() => {
                      handleNavigateAlerts();
                      setShowAlertsDropdown(false);
                    }}
                    className="notification-button"
                  >
                    Ver todas las alertas →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/40">
                {currentUser.nombre ? currentUser.nombre.charAt(0) : 'U'}{currentUser.apellido ? currentUser.apellido.charAt(0) : ''}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-slate-200 leading-none">{currentUser.nombre}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{currentUser.rol}</div>
              </div>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-1 text-xs z-50">
                <div className="px-3.5 py-2.5 border-b border-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-200 truncate">{currentUser.nombre} {currentUser.apellido}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                      {currentUser.rol}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5 truncate">{currentUser.correo}</p>
                </div>

                {onOpenLoginModal && (
                  <div className="p-1.5 border-b border-slate-700/60">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenLoginModal();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-xs text-amber-400 hover:bg-amber-500/10 transition font-semibold"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cambiar de Cuenta</span>
                    </button>
                  </div>
                )}

                {onLogout && (
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-xs text-red-400 hover:bg-red-500/10 transition font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
