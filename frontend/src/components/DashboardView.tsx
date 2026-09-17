import React from 'react';
import {
  DashboardStats,
  Alerta,
  Usuario,
  Maquina,
  Asignacion,
  Mantenimiento
} from '../../../shared/types';
import { useTheme } from '../context/ThemeContext';
import {
  HardHat,
  Cpu,
  CheckCircle2,
  Link2,
  Wrench,
  AlertOctagon,
  Clock,
  FileCheck,
  FileWarning,
  FileX,
  Bell,
  TrendingUp,
  Layers,
  Play,
  ArrowRight,
  ShieldCheck,
  Calendar,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  alertas: Alerta[];
  currentUser?: Usuario;
  maquinas?: Maquina[];
  asignaciones?: Asignacion[];
  mantenimientos?: Mantenimiento[];
  onNavigate: (tab: any) => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  alertas,
  currentUser,
  maquinas = [],
  asignaciones = [],
  mantenimientos = [],
  onNavigate,
  onRefresh
}) => {
  const { activeTheme } = useTheme();

  const isTechnician = currentUser?.rol === 'Técnico';

  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        Cargando indicadores y métricas del sistema industrial...
      </div>
    );
  }

  const estadoColorMap: Record<string, string> = {
    'Disponible': '#10b981',
    'Asignada': '#06b6d4',
    'En mantenimiento': '#f59e0b',
    'Fuera de servicio': '#ef4444',
    'Reparación': '#f43f5e',
    'Baja': '#64748b'
  };

  const isDark = activeTheme === 'dark';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#cbd5e1';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';

  const CustomMesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: tooltipBg,
            borderColor: tooltipBorder,
            color: tooltipText
          }}
          className="p-3 rounded-xl border shadow-xl text-xs space-y-1 z-50"
        >
          <div className="font-bold text-amber-500">Mes: {label}</div>
          <div className="font-semibold text-slate-200">
            Mantenimientos: <span className="font-bold text-amber-400">{payload[0].value}</span>
          </div>
          <p className="text-[10px] text-slate-400">Finalizados en {stats.anioMantenimientos}, por fecha de fin</p>
        </div>
      );
    }
    return null;
  };

  const CustomEstadoTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = estadoColorMap[data.estado] || '#f59e0b';
      return (
        <div
          style={{
            backgroundColor: tooltipBg,
            borderColor: tooltipBorder,
            color: tooltipText
          }}
          className="p-3 rounded-xl border shadow-xl text-xs space-y-1 z-50"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-bold">{data.estado}</span>
          </div>
          <div className="font-semibold text-slate-200">
            Total equipos: <span className="font-bold" style={{ color }}>{data.cantidad}</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {Math.round((data.cantidad / (stats.totalMaquinas || 1)) * 100)}% del parque de soldadoras
          </p>
        </div>
      );
    }
    return null;
  };

  if (isTechnician) {
    const myActiveAsignaciones = asignaciones.filter(a => a.estado === 'Activa');
    const myPendingMantenimientos = mantenimientos.filter(m => m.estado === 'En proceso' || m.estado === 'Programado');
    const myCompletedMantenimientos = mantenimientos.filter(m => m.estado === 'Finalizado');

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5 text-amber-400" />
                Panel Técnico Autorizado
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Bienvenido, {currentUser?.nombre} {currentUser?.apellido}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Vista restringida y personalizada: estás visualizando exclusivamente los equipos bajo tu custodia y las órdenes de mantenimiento asignadas a tu cuenta.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('mantenimientos')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Wrench className="w-4 h-4" /> Mis Mantenimientos
            </button>
            <button
              onClick={() => onNavigate('asignaciones')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Link2 className="w-4 h-4 text-cyan-400" /> Mis Máquinas
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => onNavigate('asignaciones')}
            className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition shadow"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Máquinas en Custodia</span>
              <Link2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-cyan-400">{myActiveAsignaciones.length}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Asignaciones activas en obra</span>
          </div>

          <div
            onClick={() => onNavigate('mantenimientos')}
            className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition shadow"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Mantenimientos En Proceso</span>
              <Wrench className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-400">
              {mantenimientos.filter(m => m.estado === 'En proceso').length}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">En taller de reparación</span>
          </div>

          <div
            onClick={() => onNavigate('mantenimientos')}
            className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 cursor-pointer transition shadow"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Mantenimientos Programados</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {mantenimientos.filter(m => m.estado === 'Programado').length}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Pendientes de iniciar</span>
          </div>

          <div
            onClick={() => onNavigate('mantenimientos')}
            className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition shadow"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Servicios Completados</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400">{myCompletedMantenimientos.length}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Equipos liberados con éxito</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-cyan-400" /> Mis Máquinas en Asignación Activa
              </h3>
              <button
                onClick={() => onNavigate('asignaciones')}
                className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
              >
                Ver Asignaciones <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {myActiveAsignaciones.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No tienes máquinas en custodia o proyectos actualmente.
              </div>
            ) : (
              <div className="space-y-2.5">
                {myActiveAsignaciones.map(a => (
                  <div
                    key={a.id}
                    className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 hover:border-slate-700 transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">{a.maquina_codigo}</span>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                          Activa
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Proyecto: <strong className="text-slate-100">{a.proyecto || 'Sin registrar'}</strong>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Desde: {a.fecha_asignacion} &bull; Ubicación: {a.ubicacion || 'Sin registrar'}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('asignaciones')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium border border-slate-700 transition"
                    >
                      Devolver
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" /> Mis Tareas de Mantenimiento
              </h3>
              <button
                onClick={() => onNavigate('mantenimientos')}
                className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
              >
                Ir a Mantenimientos <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {myPendingMantenimientos.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No tienes mantenimientos pendientes asignados en este momento.
              </div>
            ) : (
              <div className="space-y-2.5">
                {myPendingMantenimientos.map(m => (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 hover:border-slate-700 transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">
                          {m.maquina_codigo || `M-${m.maquina_id}`}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            m.estado === 'En proceso'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {m.estado}
                        </span>
                        <span className="text-[10px] text-slate-500">{m.tipo}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-1 line-clamp-1">{m.descripcion}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Plazo: {m.fecha_inicio} &rarr; {m.fecha_fin}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('mantenimientos')}
                      className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg text-[11px] font-semibold border border-amber-500/30 transition"
                    >
                      Gestionar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {alertas.length > 0 && (
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-400" /> Mis Alertas y Avisos
              </h3>
              <button
                onClick={() => onNavigate('alertas')}
                className="text-xs font-semibold text-amber-400 hover:underline"
              >
                Ver Todas ({alertas.length})
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {alertas.slice(0, 3).map(a => (
                <div
                  key={a.id}
                  onClick={() => onNavigate('alertas')}
                  className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer text-xs space-y-1 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{a.titulo}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                        a.prioridad === 'Alta'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {a.prioridad}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{a.mensaje}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Resumen del sistema</h2>
          <p className="text-sm text-slate-400">Indicadores calculados a partir de los registros guardados.</p>
        </div>
        <button type="button" onClick={onRefresh} className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div onClick={() => onNavigate('tecnicos')} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-amber-500/40 cursor-pointer transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Técnicos</span>
            <HardHat className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.totalTecnicos}</div>
          <div className="text-[10px] text-slate-500 mt-1">Técnicos registrados</div>
        </div>

        <div onClick={() => onNavigate('maquinas')} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-amber-500/40 cursor-pointer transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Total Máquinas</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.totalMaquinas}</div>
          <div className="text-[10px] text-slate-500 mt-1">Equipos en catálogo</div>
        </div>

        <div onClick={() => onNavigate('maquinas')} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Disponibles</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.maquinasDisponibles}</div>
          <div className="text-[10px] text-slate-500 mt-1">Listas para asignación</div>
        </div>

        <div onClick={() => onNavigate('asignaciones')} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Asignadas</span>
            <Link2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{stats.maquinasAsignadas}</div>
          <div className="text-[10px] text-slate-500 mt-1">En trabajo operativo</div>
        </div>

        <div onClick={() => onNavigate('mantenimientos')} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-amber-500/40 cursor-pointer transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Mantenimiento</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.maquinasEnMantenimiento}</div>
          <div className="text-[10px] text-slate-500 mt-1">Preventivo/Correctivo</div>
        </div>

        <div onClick={() => onNavigate('maquinas')} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-red-500/40 cursor-pointer transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Fuera Servicio</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.maquinasFueraDeServicio}</div>
          <div className="text-[10px] text-slate-500 mt-1">Fuera de servicio, reparación o baja</div>
        </div>

        <div onClick={() => onNavigate('mantenimientos')} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Mantenimientos pendientes</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{stats.mantenimientosPendientes}</div>
          <div className="text-[10px] text-slate-500 mt-1">Programados o en proceso</div>
        </div>

        <div onClick={() => onNavigate('contratos')} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Contratos vigentes</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.contratosVigentes}</div>
          <div className="text-[10px] text-slate-500 mt-1">Estado vigente registrado</div>
        </div>

        <div onClick={() => onNavigate('contratos')} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-amber-500/40 cursor-pointer transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Contratos por vencer</span>
            <FileWarning className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.contratosProximosVencer}</div>
          <div className="text-[10px] text-slate-500 mt-1">Expiración cercana</div>
        </div>

        <div onClick={() => onNavigate('contratos')} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-red-500/40 cursor-pointer transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Contratos vencidos</span>
            <FileX className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.contratosVencidos}</div>
          <div className="text-[10px] text-slate-500 mt-1">Requieren renovación</div>
        </div>

        <div onClick={() => onNavigate('alertas')} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-red-500/40 cursor-pointer transition shadow col-span-2">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Alertas de Sistema Sin Leer</span>
            <Bell className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-red-400">{stats.alertasPendientes}</span>
            <span className="text-xs text-slate-400">notificaciones sin leer</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-1 font-medium">
            Ver Centro de Alertas &rarr;
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Mantenimientos finalizados por mes</h3>
                <p className="text-[11px] text-slate-400">Año {stats.anioMantenimientos} · Según la fecha de finalización</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('mantenimientos')}
              className="text-xs font-semibold text-amber-400 hover:underline"
            >
              Ver Taller &rarr;
            </button>
          </div>

          {stats.mantenimientosPorMes.every(item => item.cantidad === 0) ? (
            <div className="flex h-64 items-center justify-center text-center text-sm text-slate-400">
              No hay mantenimientos finalizados con fecha de fin válida en {stats.anioMantenimientos}.
            </div>
          ) : <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.mantenimientosPorMes}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="mes"
                  stroke={axisColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke={axisColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <Tooltip content={<CustomMesTooltip />} />
                <Bar
                  dataKey="cantidad"
                  name="Mantenimientos"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>}

          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total finalizados en el año:</span>
            <span className="font-bold text-amber-400">
              {stats.mantenimientosPorMes.reduce((acc, curr) => acc + curr.cantidad, 0)} intervenciones
            </span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Distribución de Estados de Máquinas</h3>
                <p className="text-[11px] text-slate-400">Estado operativo actual del parque de soldadoras</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('maquinas')}
              className="text-xs font-semibold text-blue-400 hover:underline"
            >
              Ver Catálogo &rarr;
            </button>
          </div>

          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.maquinasPorEstado}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="estado"
                  stroke={axisColor}
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke={axisColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <Tooltip content={<CustomEstadoTooltip />} />
                <Bar
                  dataKey="cantidad"
                  name="Máquinas"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                >
                  {stats.maquinasPorEstado.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={estadoColorMap[entry.estado] || '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total equipos monitoreados:</span>
            <span className="font-bold text-slate-200">
              {stats.totalMaquinas} máquinas ({stats.maquinasDisponibles} disp. / {stats.maquinasAsignadas} asig.)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
          <span>Máquinas Asignadas por Técnico</span>
          <span className="text-xs text-slate-500 font-normal">Carga operativa activa en planta y taller</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.maquinasPorTecnico.length === 0 ? (
            <p className="text-xs text-slate-500 col-span-full">No hay máquinas asignadas actualmente.</p>
          ) : (
            stats.maquinasPorTecnico.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                <span className="text-xs font-semibold text-slate-200">{item.tecnico}</span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  {item.cantidad} equipo(s)
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
