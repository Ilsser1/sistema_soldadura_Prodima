import React from 'react';
import { RolUsuario } from '../../../shared/types';
import { ProdimaLogo } from './ProdimaLogo';
import {
  LayoutDashboard,
  Users,
  HardHat,
  Cpu,
  Link2,
  Wrench,
  FileText,
  Bell,
  History,
  ShieldCheck,
  BarChart3,
  UserCheck,
  LogOut,
  X
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'usuarios'
  | 'tecnicos'
  | 'maquinas'
  | 'asignaciones'
  | 'mantenimientos'
  | 'contratos'
  | 'alertas'
  | 'historial'
  | 'bitacora'
  | 'reportes'
  | 'perfil';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  userRole: RolUsuario;
  unreadAlertsCount: number;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onLogout?: () => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  allowedRoles: RolUsuario[];
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  unreadAlertsCount,
  isMobileOpen = false,
  onMobileClose,
  onLogout
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      allowedRoles: ['Administrador', 'Supervisor', 'Técnico']
    },
    {
      id: 'maquinas',
      label: 'Máquinas de Soldar',
      icon: <Cpu className="w-5 h-5" />,
      allowedRoles: ['Administrador', 'Supervisor', 'Técnico']
    },
    {
      id: 'tecnicos',
      label: 'Técnicos de Soldadura',
      icon: <HardHat className="w-5 h-5" />,
      allowedRoles: ['Administrador', 'Supervisor']
    },
    {
      id: 'asignaciones',
      label: 'Asignación de Máquinas',
      icon: <Link2 className="w-5 h-5" />,
      allowedRoles: ['Administrador', 'Supervisor', 'Técnico']
    },
    {
      id: 'mantenimientos',
      label: 'Mantenimientos',
      icon: <Wrench className="w-5 h-5" />,
      allowedRoles: ['Administrador', 'Supervisor', 'Técnico']
    },
    {
      id: 'contratos',
      label: 'Contratos de Maint.',
      icon: <FileText className="w-5 h-5" />,
      allowedRoles: ['Administrador', 'Supervisor', 'Técnico']
    },
    {
      id: 'alertas',
      label: 'Centro de Alertas',
      icon: <Bell className="w-5 h-5" />,
      allowedRoles: ['Administrador', 'Supervisor', 'Técnico'],
      badge: unreadAlertsCount
    },
    {
      id: 'historial',
      label: 'Historial de Máquina',
      icon: <History className="w-5 h-5" />,
      allowedRoles: ['Administrador', 'Supervisor', 'Técnico']
    },
    {
      id: 'usuarios',
      label: 'Gestión de Usuarios',
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['Administrador']
    },
    {
      id: 'bitacora',
      label: 'Bitácora del Sistema',
      icon: <ShieldCheck className="w-5 h-5" />,
      allowedRoles: ['Administrador']
    },
    {
      id: 'reportes',
      label: 'Reportes y PDF/Excel',
      icon: <BarChart3 className="w-5 h-5" />,
      allowedRoles: ['Administrador', 'Supervisor']
    },
    {
      id: 'perfil',
      label: 'Mi Perfil',
      icon: <UserCheck className="w-5 h-5" />,
      allowedRoles: ['Administrador', 'Supervisor']
    }
  ];

  const filteredItems = navItems.filter(item => item.allowedRoles.includes(userRole));

  const content = (
    <div className="flex flex-col justify-between h-full p-3 space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-2 md:border-0 md:text-slate-500">
          <div className="flex items-center gap-2">
            <ProdimaLogo size="sm" className="w-6 h-6" />
            <span className="text-amber-500 dark:text-amber-400 font-bold">PRODIMA 30 AÑOS</span>
          </div>
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {filteredItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (onMobileClose) onMobileClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition min-h-[44px] ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 font-bold border-l-4 border-amber-500 bg-slate-800/80'
                  : 'hover:bg-slate-800/60 hover:text-white text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-2 mt-auto">
        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-2.5">
          <div className="p-1 bg-white/95 dark:bg-slate-800/90 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700/80 shrink-0">
            <ProdimaLogo size="sm" className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="font-bold text-slate-300">PRODIMA 30 Años</div>
            <div className="text-[9px]">19 Calle 5-87 Z.11 Col. Mariscal</div>
            <div className="text-amber-500/90 font-medium">PBX: (502) 2472-7019</div>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={() => {
              if (onMobileClose) onMobileClose();
              onLogout();
            }}
            className="w-full p-2 bg-slate-950/40 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl border border-slate-800/80 hover:border-red-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-4rem)] flex-col justify-between shrink-0">
        {content}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-slate-800 shadow-2xl z-10 overflow-y-auto">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
