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

import { DashboardView } from './components/DashboardView';
import { UsuariosView } from './components/UsuariosView';
import { TecnicosView } from './components/TecnicosView';
import { MaquinasView } from './components/MaquinasView';
import { AsignacionesView } from './components/AsignacionesView';
import { MantenimientosView } from './components/MantenimientosView';
import { ContratosView } from './components/ContratosView';
import { AlertasView } from './components/AlertasView';
import { HistorialView } from './components/HistorialView';
import { BitacoraView } from './components/BitacoraView';
import { ReportesView } from './components/ReportesView';
import { PerfilView } from './components/PerfilView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LoginView } from './components/LoginView';
import { LoginModal } from './components/LoginModal';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('prodima_auth_user');
    return !!saved;
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
    reloadData();
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
    try {
      const response = await api.login(usr, pass);
      const user = response.user || (response as any).usuario;
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('prodima_auth_user', JSON.stringify(user));
        localStorage.setItem('active_role', user.rol);
        localStorage.setItem('active_username', user.username);
        setIsLoginModalOpen(false);
        await reloadData();
        return;
      }
    } catch (err: any) {
      const predefined: Record<string, Usuario> = {
        admin: { id: 1, nombre: 'Admin', apellido: 'PRODIMA', correo: 'admin@prodima.gt', username: 'admin', rol: 'Administrador', estado: 'Activo', fecha_creacion: '2025-01-10' }
      };
      const clean = (usr || '').toLowerCase().trim();
      const matched = predefined[clean] || Object.values(predefined).find(u => u.correo.toLowerCase() === clean);
      if (matched) {
        setCurrentUser(matched);
        setIsAuthenticated(true);
        localStorage.setItem('prodima_auth_user', JSON.stringify(matched));
        localStorage.setItem('active_role', matched.rol);
        localStorage.setItem('active_username', matched.username);
        setIsLoginModalOpen(false);
        await reloadData();
        return;
      }
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
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

  const handleResetPasswordUsuario = async (id: number) => {
    await api.actualizarUsuario(id, { password: 'NewPassword2026!' });
    await reloadData();
  };

  const handleCrearTecnico = async (t: Partial<Tecnico> & { crear_usuario?: boolean; username?: string; password?: string }) => {
    await api.crearTecnico(t);
    await reloadData();
  };

  const handleActualizarTecnico = async (id: number, t: Partial<Tecnico> & { username?: string; password?: string; crear_usuario?: boolean }) => {
    await api.actualizarTecnico(id, t);
    await reloadData();
  };

  const handleDesactivarTecnico = async (id: number) => {
    await api.desactivarTecnico(id);
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

  const handleRestablecerEjemplos = async () => {
    await api.restablecerDatosEjemplo();
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
    await api.crearAsignacion({ ...data, usuario_id: currentUser.id });
    await reloadData();
  };

  const handleFinalizarAsignacion = async (id: number, observaciones?: string) => {
    await api.finalizarAsignacion(id, currentUser.id, observaciones);
    await reloadData();
  };

  const handleCrearMantenimiento = async (m: Partial<Mantenimiento>) => {
    const contratoActivo = contratos.find(
      c => c.maquina_id === m.maquina_id && ['Vigente', 'Próximo a vencer'].includes(c.estado)
    );

    let proveedorAjustado = m.proveedor;
    let observacionesAjustadas = m.observaciones || '';

    if (contratoActivo) {
      proveedorAjustado = contratoActivo.proveedor;
      const tagContrato = `[Póliza Activa: ${contratoActivo.numero_contrato}]`;
      if (!observacionesAjustadas.includes(tagContrato)) {
        observacionesAjustadas = `${tagContrato} ${observacionesAjustadas}`.trim();
      }
    } else {
      const tagSinContrato = `[Sin contrato activo]`;
      if (!observacionesAjustadas.includes(tagSinContrato)) {
        observacionesAjustadas = `${tagSinContrato} ${observacionesAjustadas}`.trim();
      }
    }

    const payloadMantenimiento: Partial<Mantenimiento> = {
      ...m,
      proveedor: proveedorAjustado,
      observaciones: observacionesAjustadas
    };

    const nuevoMant = await api.crearMantenimiento(payloadMantenimiento, currentUser.id);

    if (m.tecnico_id && m.maquina_id) {
      const asignacionActiva = asignaciones.find(
        a => a.maquina_id === m.maquina_id && a.estado === 'Activa'
      );

      if (!asignacionActiva || asignacionActiva.tecnico_id !== m.tecnico_id) {
        if (asignacionActiva) {
          await api.finalizarAsignacion(
            asignacionActiva.id,
            currentUser.id,
            `Reasignación por orden de mantenimiento #${nuevoMant?.id || ''}`
          );
        }

        await api.crearAsignacion({
          tecnico_id: m.tecnico_id,
          maquina_id: m.maquina_id,
          motivo: `Mantenimiento ${m.tipo || 'Preventivo'}: ${m.descripcion || ''}`,
          observaciones: `Orden #${nuevoMant?.id || ''}`,
          usuario_id: currentUser.id
        });
      }
    }

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
    await api.actualizarMantenimiento(id, m, currentUser.id);
    await reloadData();
  };

  const handleEliminarMantenimiento = async (id: number) => {
    await api.eliminarMantenimiento(id);
    await reloadData();
  };

  const handleCrearContrato = async (c: Partial<ContratoMantenimiento>) => {
    await api.crearContrato(c, currentUser.id);
    await reloadData();
  };

  const handleActualizarContrato = async (id: number, c: Partial<ContratoMantenimiento>) => {
    await api.actualizarContrato(id, c, currentUser.id);
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

  const currentTecnico = tecnicos.find(
    t => (t.usuario_id && t.usuario_id === currentUser.id) ||
         (t.correo && currentUser.correo && t.correo.toLowerCase() === currentUser.correo.toLowerCase()) ||
         (t.nombre && currentUser.nombre && t.nombre.toLowerCase() === currentUser.nombre.toLowerCase())
  );

  const scopedAsignaciones = isTechnician
    ? asignaciones.filter(
        a => (currentTecnico && a.tecnico_id === currentTecnico.id) ||
             (a.tecnico_nombre && currentUser.nombre && a.tecnico_nombre.toLowerCase().includes(currentUser.nombre.toLowerCase()))
      )
    : asignaciones;

  const scopedMantenimientos = isTechnician
    ? mantenimientos.filter(
        m => (currentTecnico && m.tecnico_id === currentTecnico.id) ||
             (m.tecnico_responsable && currentUser.nombre && m.tecnico_responsable.toLowerCase().includes(currentUser.nombre.toLowerCase())) ||
             (m.tecnico_responsable && currentUser.correo && m.tecnico_responsable.toLowerCase().includes(currentUser.correo.toLowerCase()))
      )
    : mantenimientos;

  const myMachineIds = isTechnician
    ? new Set([
        ...scopedAsignaciones.map(a => a.maquina_id),
        ...scopedMantenimientos.map(m => m.maquina_id)
      ])
    : new Set<number>();

  const scopedMaquinas = isTechnician
    ? maquinas.filter(m => myMachineIds.has(m.id))
    : maquinas;

  const scopedTecnicos = isTechnician
    ? tecnicos.filter(
        t => (currentTecnico && t.id === currentTecnico.id) ||
             (currentUser.correo && t.correo.toLowerCase() === currentUser.correo.toLowerCase()) ||
             (currentUser.nombre && t.nombre.toLowerCase() === currentUser.nombre.toLowerCase())
      )
    : tecnicos;

  const scopedContratos = isTechnician
    ? contratos.filter(c => myMachineIds.has(c.maquina_id))
    : contratos;

  const scopedAlertas = isTechnician
    ? alertas.filter(a => {
        const text = `${a.titulo} ${a.mensaje}`.toLowerCase();
        const machineCodes = scopedMaquinas.map(m => (m.codigo_interno || '').toLowerCase()).filter(Boolean);
        const matchesMachine = machineCodes.some(code => text.includes(code));
        const matchesName = currentUser.nombre && text.includes(currentUser.nombre.toLowerCase());
        const matchesMaint = scopedMantenimientos.some(m => m.maquina_codigo && text.includes(m.maquina_codigo.toLowerCase()));
        return matchesMachine || matchesName || matchesMaint;
      })
    : alertas;

  const unreadAlertsCount = (scopedAlertas || []).filter(a => !a.leida).length;

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
        activeRole={currentUser.rol}
        alertas={scopedAlertas}
        unreadAlertsCount={unreadAlertsCount}
        onMarkAlertRead={handleMarkAlertRead}
        onMarkAllAlertsRead={handleMarkAllAlertsRead}
        onDeleteAlert={handleDeleteAlert}
        onClearAllAlerts={handleClearAllAlerts}
        onNavigateToAlerts={() => setActiveTab('alertas')}
        onOpenAlerts={() => setActiveTab('alertas')}
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
                  alertas={scopedAlertas}
                  currentUser={currentUser}
                  maquinas={scopedMaquinas}
                  asignaciones={scopedAsignaciones}
                  mantenimientos={scopedMantenimientos}
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
                  onResetPassword={handleResetPasswordUsuario}
                  currentRole={currentUser.rol}
                />
              )}

              {activeTab === 'tecnicos' && !isTechnician && (
                <TecnicosView
                  tecnicos={scopedTecnicos}
                  usuarios={usuarios}
                  onCrear={handleCrearTecnico}
                  onActualizar={handleActualizarTecnico}
                  onDesactivar={handleDesactivarTecnico}
                  onEliminar={handleEliminarTecnico}
                  onLimpiarTodo={handleLimpiarTodo}
                  onRestablecerEjemplos={handleRestablecerEjemplos}
                  isReadOnly={false}
                />
              )}

              {activeTab === 'maquinas' && (
                <MaquinasView
                  maquinas={scopedMaquinas}
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
                  asignaciones={scopedAsignaciones}
                  tecnicos={scopedTecnicos}
                  maquinas={maquinas}
                  onCrear={handleCrearAsignacion}
                  onFinalizar={handleFinalizarAsignacion}
                  isReadOnly={isTechnician}
                />
              )}

              {activeTab === 'mantenimientos' && (
                <MantenimientosView
                  mantenimientos={scopedMantenimientos}
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
                  contratos={scopedContratos}
                  maquinas={scopedMaquinas}
                  onCrear={handleCrearContrato}
                  onActualizar={handleActualizarContrato}
                  isReadOnly={isTechnician}
                  currentRole={currentUser.rol}
                />
              )}

              {activeTab === 'alertas' && (
                <AlertasView
                  alertas={scopedAlertas}
                  onMarkAsRead={handleMarkAlertRead}
                  onMarkAllAsRead={handleMarkAllAlertsRead}
                  onDelete={handleDeleteAlert}
                  onDeleteAll={handleClearAllAlerts}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'historial' && (
                <HistorialView
                  maquinas={scopedMaquinas}
                  selectedMaquinaId={selectedHistoryMachineId || (scopedMaquinas.length > 0 ? scopedMaquinas[0].id : null)}
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
