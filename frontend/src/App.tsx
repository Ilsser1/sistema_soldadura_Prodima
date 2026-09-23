import React, { useState, useEffect } from 'react';
import {
  Usuario,
  Maquina,
  Tecnico,
  Asignacion,
  Mantenimiento,
  ContratoMantenimiento,
  Alerta,
  Bitacora,
  DashboardStats,
  HistorialCompletoMaquina
} from '../../shared/types';
import { api } from './services/api';

import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';

import { DashboardView } from './modulos/dashboard/DashboardView';
import { UsuariosView } from './modulos/usuarios/UsuariosView';
import { TecnicosView } from './modulos/tecnicos/TecnicosView';
import { MaquinasView } from './modulos/maquinas/MaquinasView';
import { AsignacionesView } from './modulos/asignaciones/AsignacionesView';
import { MantenimientosView } from './modulos/mantenimientos/MantenimientosView';
import { ContratosView } from './modulos/contratos/ContratosView';
import { AlertasView } from './modulos/alertas/AlertasView';
import { HistorialView } from './modulos/historial/HistorialView';
import { BitacoraView } from './modulos/bitacora/BitacoraView';
import { ReportesView } from './modulos/reportes/ReportesView';
import { PerfilView } from './modulos/perfil/PerfilView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LoginView } from './modulos/autenticacion/LoginView';
import { LoginModal } from './modulos/autenticacion/LoginModal';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('prodima_auth_user');
    return !!saved && !!localStorage.getItem('prodima_auth_token');
  });

  const [currentUser, setCurrentUser] = useState<Usuario>(() => {
    try {
      const saved = localStorage.getItem('prodima_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 1,
      nombre: 'Admin',
      apellido: 'PRODIMA',
      correo: 'admin@prodima.gt',
      username: 'admin',
      rol: 'Administrador',
      estado: 'Activo',
      fecha_creacion: '2025-01-10'
    };
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [contratos, setContratos] = useState<ContratoMantenimiento[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [bitacora, setBitacora] = useState<Bitacora[]>([]);

  const [selectedHistoryMachineId, setSelectedHistoryMachineId] = useState<number | null>(null);
  const [historialData, setHistorialData] = useState<HistorialCompletoMaquina | null>(null);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const reloadData = async () => {
    const requestToken = localStorage.getItem('prodima_auth_token');
    try {
      setLoading(true);
      const [
        st,
        uList,
        tList,
        mList,
        aList,
        maintList,
        cList,
        alList,
        bList
      ] = await Promise.all([
        api.getDashboardStats(),
        api.getUsuarios(),
        api.getTecnicos(),
        api.getMaquinas(),
        api.getAsignaciones(),
        api.getMantenimientos(),
        api.getContratos(),
        api.getAlertas(),
        api.getBitacora()
      ]);

      if (requestToken !== localStorage.getItem('prodima_auth_token')) return;
      setStats(st);
      setUsuarios(uList);
      setTecnicos(tList);
      setMaquinas(mList);
      setAsignaciones(aList);
      setMantenimientos(maintList);
      setContratos(cList);
      setAlertas(alList);
      setBitacora(bList);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const expire = () => { setIsAuthenticated(false); setHistorialData(null); };
    window.addEventListener('session-expired', expire);
    if (localStorage.getItem('prodima_auth_token')) reloadData();
    else setLoading(false);
    return () => window.removeEventListener('session-expired', expire);
  }, []);

  useEffect(() => {
    if (selectedHistoryMachineId) {
      setLoadingHistorial(true);
      api.getHistorialMaquina(selectedHistoryMachineId)
        .then(data => setHistorialData(data))
        .catch(err => console.error(err))
        .finally(() => setLoadingHistorial(false));
    }
  }, [selectedHistoryMachineId]);

  const handleLogin = async (usr: string, pass: string) => {
    const { token, user } = await api.login(usr, pass);
    localStorage.setItem('prodima_auth_token', token);
    localStorage.setItem('prodima_auth_user', JSON.stringify(user));
    setStats(null); setUsuarios([]); setTecnicos([]); setMaquinas([]);
    setAsignaciones([]); setMantenimientos([]); setContratos([]); setAlertas([]); setBitacora([]);
    setSelectedHistoryMachineId(null);
    setHistorialData(null);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    await reloadData();
  };

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    localStorage.removeItem('prodima_auth_token');
    setSelectedHistoryMachineId(null);
    setHistorialData(null);
    localStorage.removeItem('prodima_auth_user');
    localStorage.removeItem('active_role');
    localStorage.removeItem('active_username');
    setIsAuthenticated(false);
  };

  const handleCrearUsuario = async (u: Partial<Usuario>) => {
    await api.crearUsuario(u);
    await reloadData();
  };

  const handleActualizarUsuario = async (id: number, u: Partial<Usuario>) => {
    await api.actualizarUsuario(id, u);
    await reloadData();
  };

  const handleToggleEstadoUsuario = async (id: number) => {
    const target = usuarios.find(u => u.id === id);
    if (target) {
      const next = target.estado === 'Activo' ? 'Inactivo' : 'Activo';
      await api.actualizarUsuario(id, { estado: next });
      await reloadData();
    }
  };


  const handleCrearTecnico = async (t: Partial<Tecnico> & { crear_usuario?: boolean; username?: string; password?: string }) => {
    await api.crearTecnico(t);
    await reloadData();
  };

  const handleActualizarTecnico = async (id: number, t: Partial<Tecnico> & { username?: string; password?: string; crear_usuario?: boolean }) => {
    await api.actualizarTecnico(id, t);
    await reloadData();
  };

  const handleEliminarTecnico = async (id: number, permanente: boolean = true) => {
    await api.eliminarTecnico(id, permanente);
    await reloadData();
  };

  const handleLimpiarTodo = async () => {
    await api.limpiarTodoSistema();
    await reloadData();
  };


  const handleCrearMaquina = async (m: Partial<Maquina>) => {
    await api.crearMaquina(m);
    await reloadData();
  };

  const handleActualizarMaquina = async (id: number, m: Partial<Maquina>) => {
    await api.actualizarMaquina(id, m);
    await reloadData();
  };

  const handleDarDeBajaMaquina = async (id: number) => {
    await api.darDeBajaMaquina(id);
    await reloadData();
  };

  const handleEliminarMaquina = async (id: number, permanente: boolean = true) => {
    await api.eliminarMaquina(id, permanente);
    await reloadData();
  };

  const handleNavigateHistory = (maquinaId: number) => {
    setSelectedHistoryMachineId(maquinaId);
    setActiveTab('historial');
  };

  const handleCrearAsignacion = async (data: { tecnico_id: number; maquina_id: number; motivo: string; observaciones?: string }) => {
    await api.crearAsignacion(data);
    await reloadData();
  };

  const handleFinalizarAsignacion = async (id: number, observaciones?: string) => {
    await api.finalizarAsignacion(id, observaciones);
    await reloadData();
  };

  const handleCrearMantenimiento = async (m: Partial<Mantenimiento>) => {
    await api.crearMantenimiento(m);

    if (m.maquina_id) {
      try {
        const histData = await api.getHistorialMaquina(m.maquina_id);
        if (selectedHistoryMachineId === m.maquina_id) {
          setHistorialData(histData);
        }
      } catch (err) {
        console.warn('Historial refrescado:', err);
      }
    }

    await reloadData();
  };

  const handleActualizarMantenimiento = async (id: number, m: Partial<Mantenimiento>) => {
    await api.actualizarMantenimiento(id, m);
    await reloadData();
  };

  const handleEliminarMantenimiento = async (id: number) => {
    await api.eliminarMantenimiento(id);
    await reloadData();
  };

  const handleCrearContrato = async (c: Partial<ContratoMantenimiento>) => {
    await api.crearContrato(c);
    await reloadData();
  };

  const handleActualizarContrato = async (id: number, c: Partial<ContratoMantenimiento>) => {
    await api.actualizarContrato(id, c);
    await reloadData();
  };

  const handleMarkAlertRead = async (id: number) => {
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a));
    try {
      await api.marcarAlertaLeida(id);
    } finally {
      await reloadData();
    }
  };

  const handleMarkAllAlertsRead = async () => {
    setAlertas(prev => prev.map(a => ({ ...a, leida: true })));
    try {
      await api.marcarTodasAlertasLeidas();
    } finally {
      await reloadData();
    }
  };

  const handleDeleteAlert = async (id: number) => {
    setAlertas(prev => prev.filter(a => a.id !== id));
    try {
      await api.eliminarAlerta(id);
    } finally {
      await reloadData();
    }
  };

  const handleClearAllAlerts = async (soloLeidas: boolean = false) => {
    if (soloLeidas) {
      setAlertas(prev => prev.filter(a => !a.leida));
    } else {
      setAlertas([]);
    }
    try {
      await api.limpiarTodasAlertas(soloLeidas);
    } finally {
      await reloadData();
    }
  };

  const handleUpdatePerfil = async (data: Partial<Usuario>) => {
    await api.actualizarUsuario(currentUser.id, data);
    setCurrentUser(prev => ({ ...prev, ...data }));
    await reloadData();
  };

  const isTechnician = currentUser.rol === 'Técnico';

  const unreadAlertsCount = (alertas || []).filter(a => !a.leida).length;

  useEffect(() => {
    if (isTechnician) {
      const allowedTechnicianTabs: TabType[] = [
        'dashboard',
        'maquinas',
        'asignaciones',
        'mantenimientos',
        'contratos',
        'alertas',
        'historial'
      ];
      if (!allowedTechnicianTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [isTechnician, activeTab]);

  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={handleLogin}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      <Navbar
        currentUser={currentUser}
        alertas={alertas}
        unreadAlertsCount={unreadAlertsCount}
        onMarkAlertRead={handleMarkAlertRead}
        onMarkAllAlertsRead={handleMarkAllAlertsRead}
        onDeleteAlert={handleDeleteAlert}
        onClearAllAlerts={handleClearAllAlerts}
        onNavigateToAlerts={() => setActiveTab('alertas')}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={currentUser.rol}
          unreadAlertsCount={unreadAlertsCount}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-3 sm:p-5 md:p-6 pb-24 md:pb-8 overflow-y-auto min-w-0 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="p-16 text-center text-slate-400">
              <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-sm font-bold text-slate-200">Cargando datos del sistema...</h3>
              <p className="text-xs text-slate-500 mt-1">Sincronizando información...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  alertas={alertas}
                  currentUser={currentUser}
                  asignaciones={asignaciones}
                  mantenimientos={mantenimientos}
                  onNavigate={setActiveTab}
                  onRefresh={reloadData}
                />
              )}

              {activeTab === 'usuarios' && (
                <UsuariosView
                  usuarios={usuarios}
                  onCrear={handleCrearUsuario}
                  onActualizar={handleActualizarUsuario}
                  onToggleEstado={handleToggleEstadoUsuario}
                  currentRole={currentUser.rol}
                />
              )}

              {activeTab === 'tecnicos' && !isTechnician && (
                <TecnicosView
                  tecnicos={tecnicos}
                  usuarios={usuarios}
                  onCrear={handleCrearTecnico}
                  onActualizar={handleActualizarTecnico}
                  onEliminar={handleEliminarTecnico}
                  onLimpiarTodo={handleLimpiarTodo}
                  isReadOnly={false}
                />
              )}

              {activeTab === 'maquinas' && (
                <MaquinasView
                  maquinas={maquinas}
                  onCrear={handleCrearMaquina}
                  onActualizar={handleActualizarMaquina}
                  onDarDeBaja={handleDarDeBajaMaquina}
                  onEliminar={handleEliminarMaquina}
                  onViewHistory={handleNavigateHistory}
                  isReadOnly={isTechnician}
                />
              )}

              {activeTab === 'asignaciones' && (
                <AsignacionesView
                  asignaciones={asignaciones}
                  tecnicos={tecnicos}
                  maquinas={maquinas}
                  onCrear={handleCrearAsignacion}
                  onFinalizar={handleFinalizarAsignacion}
                  isReadOnly={isTechnician}
                />
              )}

              {activeTab === 'mantenimientos' && (
                <MantenimientosView
                  mantenimientos={mantenimientos}
                  maquinas={maquinas}
                  tecnicos={tecnicos}
                  currentUser={currentUser}
                  onCrear={handleCrearMantenimiento}
                  onActualizar={handleActualizarMantenimiento}
                  onEliminar={handleEliminarMantenimiento}
                  isReadOnly={isTechnician}
                />
              )}

              {activeTab === 'contratos' && (
                <ContratosView
                  contratos={contratos}
                  maquinas={maquinas}
                  onCrear={handleCrearContrato}
                  onActualizar={handleActualizarContrato}
                  isReadOnly={isTechnician}
                  currentRole={currentUser.rol}
                />
              )}

              {activeTab === 'alertas' && (
                <AlertasView
                  alertas={alertas}
                  onMarkAsRead={handleMarkAlertRead}
                  onMarkAllAsRead={handleMarkAllAlertsRead}
                  onDelete={handleDeleteAlert}
                  onDeleteAll={handleClearAllAlerts}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'historial' && (
                <HistorialView
                  maquinas={maquinas}
                  selectedMaquinaId={selectedHistoryMachineId || (maquinas.length > 0 ? maquinas[0].id : null)}
                  onSelectMaquina={setSelectedHistoryMachineId}
                  historialData={historialData}
                  loading={loadingHistorial}
                />
              )}

              {activeTab === 'bitacora' && (
                <BitacoraView
                  bitacora={bitacora}
                  currentRole={currentUser.rol}
                />
              )}

              {activeTab === 'reportes' && (
                <ReportesView
                  maquinas={maquinas}
                  tecnicos={tecnicos}
                  asignaciones={asignaciones}
                  mantenimientos={mantenimientos}
                  contratos={contratos}
                  bitacora={bitacora}
                  currentRole={currentUser.rol}
                  usuarioNombre={currentUser.username}
                />
              )}

              {activeTab === 'perfil' && (
                <PerfilView
                  currentUser={currentUser}
                  onUpdatePerfil={handleUpdatePerfil}
                />
              )}
            </>
          )}
        </main>
      </div>

      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadAlertsCount={unreadAlertsCount}
        onOpenMobileDrawer={() => setIsMobileMenuOpen(true)}
      />

      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}

export default App;
