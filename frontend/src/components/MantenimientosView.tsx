import React, { useState } from 'react';
import {
  Mantenimiento,
  Maquina,
  Tecnico,
  Usuario,
  TipoMantenimiento,
  EstadoMantenimiento
} from '../../../shared/types';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Play,
  Pencil,
  Trash2,
  X,
  UserCheck,
  LayoutGrid,
  List,
  Calendar,
  DollarSign,
  Tag,
  ShieldAlert,
  Info
} from 'lucide-react';

interface MantenimientosViewProps {
  mantenimientos: Mantenimiento[];
  maquinas: Maquina[];
  tecnicos?: Tecnico[];
  currentUser?: Usuario;
  onCrear: (m: Partial<Mantenimiento>) => Promise<void>;
  onActualizar: (id: number, m: Partial<Mantenimiento>) => Promise<void>;
  onEliminar?: (id: number) => Promise<void>;
  isReadOnly?: boolean;
}

export const MantenimientosView: React.FC<MantenimientosViewProps> = ({
  mantenimientos,
  maquinas,
  tecnicos = [],
  currentUser,
  onCrear,
  onActualizar,
  onEliminar,
  isReadOnly = false
}) => {
  const isTechnician = currentUser?.rol === 'Técnico';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('TODOS');
  const [statusTab, setStatusTab] = useState<'TODOS' | 'En proceso' | 'Programado' | 'Finalizado'>('TODOS');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMantenimiento, setEditingMantenimiento] = useState<Mantenimiento | null>(null);
  const [completingMantenimiento, setCompletingMantenimiento] = useState<Mantenimiento | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [asignacionModo, setAsignacionModo] = useState<'cuenta' | 'externo'>('cuenta');

  const tecnicosActivos = (tecnicos || []).filter(t => t.estado === 'Activo');

  const myTecnicoProfile = tecnicosActivos.find(
    t => (currentUser && t.correo && t.correo.toLowerCase() === currentUser.correo.toLowerCase()) ||
         (currentUser && t.usuario_id === currentUser.id) ||
         (currentUser && t.nombre && t.nombre.toLowerCase() === currentUser.nombre.toLowerCase())
  );

  const defaultTecnicoName = myTecnicoProfile
    ? `${myTecnicoProfile.nombre} ${myTecnicoProfile.apellido}`
    : tecnicosActivos.length > 0
    ? `${tecnicosActivos[0].nombre} ${tecnicosActivos[0].apellido}`
    : currentUser
    ? `${currentUser.nombre} ${currentUser.apellido}`
    : 'Taller Interno PRODIMA';

  const defaultTecnicoId = myTecnicoProfile ? myTecnicoProfile.id : tecnicosActivos.length > 0 ? tecnicosActivos[0].id : undefined;

  const [formData, setFormData] = useState({
    maquina_id: maquinas.length > 0 ? maquinas[0].id : 1,
    tipo: 'Preventivo' as TipoMantenimiento,
    descripcion: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    costo: 850,
    proveedor: 'Taller Interno PRODIMA',
    tecnico_responsable: defaultTecnicoName,
    tecnico_id: defaultTecnicoId,
    estado: 'Programado' as EstadoMantenimiento,
    observaciones: ''
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const scopedMantenimientos = (mantenimientos || []).filter(m => {
    if (!isTechnician) return true;
    if (myTecnicoProfile && m.tecnico_id === myTecnicoProfile.id) return true;
    if (currentUser) {
      const resp = (m.tecnico_responsable || '').toLowerCase();
      const matchName = currentUser.nombre && resp.includes(currentUser.nombre.toLowerCase());
      const matchEmail = currentUser.correo && resp.includes(currentUser.correo.toLowerCase());
      return matchName || matchEmail;
    }
    return false;
  });

  const filteredMantenimientos = scopedMantenimientos.filter(m => {
    const text = searchTerm.toLowerCase();
    const matchesSearch =
      (m.descripcion || '').toLowerCase().includes(text) ||
      (m.maquina_codigo || '').toLowerCase().includes(text) ||
      (m.proveedor || '').toLowerCase().includes(text) ||
      (m.tecnico_responsable || '').toLowerCase().includes(text);

    const matchesType = typeFilter === 'TODOS' || m.tipo === typeFilter;
    const matchesStatus = statusTab === 'TODOS' || m.estado === statusTab;

    return matchesSearch && matchesType && matchesStatus;
  });

  const countProgramados = scopedMantenimientos.filter(m => m.estado === 'Programado').length;
  const countEnProceso = scopedMantenimientos.filter(m => m.estado === 'En proceso').length;
  const countFinalizados = scopedMantenimientos.filter(m => m.estado === 'Finalizado').length;
  const totalCosto = scopedMantenimientos.reduce((acc, curr) => acc + (Number(curr.costo) || 0), 0);

  const handleOpenModal = (m?: Mantenimiento) => {
    if (m) {
      setEditingMantenimiento(m);
      const matchedTec = tecnicos.find(
        t => `${t.nombre} ${t.apellido}`.toLowerCase() === (m.tecnico_responsable || '').toLowerCase() ||
             (m.tecnico_responsable || '').toLowerCase().includes(t.correo.toLowerCase()) ||
             (m.tecnico_id && t.id === m.tecnico_id)
      );

      setAsignacionModo(matchedTec ? 'cuenta' : m.proveedor === 'Taller Interno PRODIMA' ? 'cuenta' : 'externo');

      setFormData({
        maquina_id: m.maquina_id,
        tipo: m.tipo,
        descripcion: m.descripcion,
        fecha_inicio: m.fecha_inicio,
        fecha_fin: m.fecha_fin,
        costo: m.costo,
        proveedor: m.proveedor,
        tecnico_responsable: m.tecnico_responsable,
        tecnico_id: m.tecnico_id || (matchedTec ? matchedTec.id : undefined),
        estado: m.estado,
        observaciones: m.observaciones || ''
      });
    } else {
      setEditingMantenimiento(null);
      setAsignacionModo('cuenta');
      setFormData({
        maquina_id: maquinas.length > 0 ? maquinas[0].id : 1,
        tipo: 'Preventivo',
        descripcion: 'Inspección de circuitos de potencia y prueba de aislamiento.',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        costo: 850,
        proveedor: 'Taller Interno PRODIMA',
        tecnico_responsable: defaultTecnicoName,
        tecnico_id: defaultTecnicoId,
        estado: 'Programado',
        observaciones: 'Mantenimiento preventivo programado.'
      });
    }
    setIsModalOpen(true);
  };

  const handleSelectTecnicoAccount = (tecnicoIdStr: string) => {
    const tecId = Number(tecnicoIdStr);
    const tec = tecnicosActivos.find(t => t.id === tecId);
    if (tec) {
      setFormData(prev => ({
        ...prev,
        tecnico_id: tec.id,
        tecnico_responsable: `${tec.nombre} ${tec.apellido}`,
        proveedor: prev.proveedor === 'Taller Interno PRODIMA' || !prev.proveedor ? 'Taller Interno PRODIMA' : prev.proveedor
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descripcion.trim()) {
      showNotification('error', 'Por favor ingrese la descripción del mantenimiento.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMantenimiento) {
        await onActualizar(editingMantenimiento.id, formData);
        showNotification('success', `Mantenimiento #${editingMantenimiento.id} actualizado.`);
      } else {
        await onCrear(formData);
        showNotification('success', 'Mantenimiento registrado exitosamente.');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showNotification('error', `Error al procesar: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartMantenimiento = async (m: Mantenimiento) => {
    try {
      await onActualizar(m.id, { estado: 'En proceso' });
      showNotification('success', `Mantenimiento #${m.id} iniciado. La máquina ahora está 'En mantenimiento'.`);
    } catch (err: any) {
      showNotification('error', `Error al iniciar: ${err.message || err}`);
    }
  };

  const handleOpenCompletionModal = (m: Mantenimiento) => {
    setCompletingMantenimiento(m);
    setCompletionNotes(m.observaciones ? `${m.observaciones} - Servicio finalizado satisfactoriamente.` : 'Servicio técnico concluido y pruebas operativas superadas.');
  };

  const handleConfirmCompletion = async () => {
    if (!completingMantenimiento) return;
    try {
      await onActualizar(completingMantenimiento.id, {
        estado: 'Finalizado',
        observaciones: completionNotes
      });
      showNotification('success', `Mantenimiento #${completingMantenimiento.id} finalizado. La máquina ha quedado Disponible.`);
      setCompletingMantenimiento(null);
    } catch (err: any) {
      showNotification('error', `Error al finalizar: ${err.message || err}`);
    }
  };

  const handleDeleteMantenimiento = async (m: Mantenimiento) => {
    if (confirm(`¿Eliminar o cancelar la orden de mantenimiento #${m.id}?`)) {
      try {
        if (onEliminar) {
          await onEliminar(m.id);
        } else {
          await onActualizar(m.id, { estado: 'Cancelado' });
        }
        showNotification('success', `Mantenimiento #${m.id} retirado.`);
      } catch (err: any) {
        showNotification('error', `Error al eliminar: ${err.message || err}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              Gestión de Mantenimientos
            </h2>
            {isTechnician && (
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[11px] font-bold">
                Mis Asignaciones de Trabajo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isTechnician
              ? 'Panel personal: visualiza y actualiza el estado de las órdenes de servicio que te fueron asignadas.'
              : 'Control integral de órdenes de taller, servicios preventivos, correctivos y asignaciones a técnicos.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'cards' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista en Tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista en Tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {!isTechnician && !isReadOnly && (
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nueva Orden
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusTab('Programado')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusTab === 'Programado'
              ? 'bg-blue-500/15 border-blue-500/50 shadow-md shadow-blue-500/10'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Programadas</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-2">{countProgramados}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Listas para iniciar</span>
        </div>

        <div
          onClick={() => setStatusTab('En proceso')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusTab === 'En proceso'
              ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">En Proceso</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">{countEnProceso}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Máquina en taller</span>
        </div>

        <div
          onClick={() => setStatusTab('Finalizado')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusTab === 'Finalizado'
              ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Finalizadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{countFinalizados}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Máquinas liberadas</span>
        </div>

        <div
          onClick={() => setStatusTab('TODOS')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusTab === 'TODOS'
              ? 'bg-slate-800 border-slate-600'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Costo Total</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-2">
            Q{totalCosto.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Total invertido</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['TODOS', 'En proceso', 'Programado', 'Finalizado'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                statusTab === tab
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'TODOS' ? 'Ver Todos' : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar máquina, técnico o falla..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todos los Tipos</option>
            <option value="Preventivo">Preventivo</option>
            <option value="Correctivo">Correctivo</option>
          </select>
        </div>
      </div>

      {filteredMantenimientos.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
          <Wrench className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-200 text-sm">No se encontraron órdenes de mantenimiento</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isTechnician
              ? 'No tienes mantenimientos asignados con los filtros seleccionados.'
              : 'No hay registros de mantenimiento que coincidan con la búsqueda o el estado seleccionado.'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMantenimientos.map(m => {
            const isAssignedToMe = isTechnician || (
              currentUser && (
                (myTecnicoProfile && m.tecnico_id === myTecnicoProfile.id) ||
                (m.tecnico_responsable && m.tecnico_responsable.toLowerCase().includes(currentUser.nombre.toLowerCase()))
              )
            );

            return (
              <div
                key={m.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition p-5 flex flex-col justify-between shadow-xl space-y-4 relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    m.estado === 'Finalizado'
                      ? 'bg-emerald-500'
                      : m.estado === 'En proceso'
                      ? 'bg-amber-500'
                      : m.estado === 'Programado'
                      ? 'bg-blue-500'
                      : 'bg-red-500'
                  }`}
                />

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-extrabold text-amber-400">
                        {m.maquina_codigo || `M-${m.maquina_id}`}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Orden #{m.id}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          m.tipo === 'Preventivo'
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {m.tipo}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded inline-flex items-center gap-1 ${
                          m.estado === 'Finalizado'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : m.estado === 'En proceso'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : m.estado === 'Programado'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {m.estado === 'En proceso' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        )}
                        {m.estado}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-200 text-xs line-clamp-2">{m.descripcion}</h4>
                    {m.observaciones && (
                      <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-2 bg-slate-800/40 p-1.5 rounded-lg">
                        "{m.observaciones}"
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Responsable:
                      </span>
                      <span className="font-semibold text-slate-200 truncate max-w-[160px]">
                        {m.tecnico_responsable || 'Taller Interno'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Período:
                      </span>
                      <span className="font-mono text-slate-300 text-[10px]">
                        {m.fecha_inicio} &rarr; {m.fecha_fin}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                      <span className="text-slate-500 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Costo:
                      </span>
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        Q{Number(m.costo || 0).toFixed(2)} GTQ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {m.estado === 'Programado' && (
                      <button
                        onClick={() => handleStartMantenimiento(m)}
                        className="px-2.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[11px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
                        title="Iniciar trabajo"
                      >
                        <Play className="w-3 h-3" /> Iniciar Servicio
                      </button>
                    )}

                    {['Programado', 'En proceso'].includes(m.estado) && (
                      <button
                        onClick={() => handleOpenCompletionModal(m)}
                        className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
                        title="Finalizar mantenimiento y liberar máquina"
                      >
                        <FileCheck className="w-3.5 h-3.5" /> Finalizar
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => handleOpenModal(m)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition"
                      title="Editar observaciones / detalles"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {!isTechnician && onEliminar && (
                      <button
                        onClick={() => handleDeleteMantenimiento(m)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Código Máquina</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Descripción / Trabajo</th>
                  <th className="p-3">Fechas</th>
                  <th className="p-3">Responsable</th>
                  <th className="p-3">Costo</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredMantenimientos.map(m => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <span className="font-mono text-amber-400 font-bold block">
                        {m.maquina_codigo || `M-${m.maquina_id}`}
                      </span>
                      <span className="text-[10px] text-slate-500">Orden #{m.id}</span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          m.tipo === 'Preventivo'
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {m.tipo}
                      </span>
                    </td>

                    <td className="p-3 max-w-xs">
                      <div className="text-slate-200 font-medium line-clamp-2">{m.descripcion}</div>
                      {m.observaciones && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5">{m.observaciones}</div>
                      )}
                    </td>

                    <td className="p-3 text-slate-400">
                      <div>{m.fecha_inicio}</div>
                      <div className="text-[10px] text-slate-500">hasta {m.fecha_fin}</div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{m.tecnico_responsable || 'Sin asignar'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.proveedor}</div>
                    </td>

                    <td className="p-3 font-mono font-bold text-emerald-400">
                      Q{Number(m.costo || 0).toFixed(2)}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded inline-flex items-center gap-1 ${
                          m.estado === 'Finalizado'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : m.estado === 'En proceso'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : m.estado === 'Programado'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {m.estado === 'En proceso' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                        {m.estado}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {m.estado === 'Programado' && (
                          <button
                            onClick={() => handleStartMantenimiento(m)}
                            className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold rounded flex items-center gap-1 transition"
                            title="Iniciar servicio"
                          >
                            <Play className="w-3 h-3" /> Iniciar
                          </button>
                        )}

                        {['Programado', 'En proceso'].includes(m.estado) && (
                          <button
                            onClick={() => handleOpenCompletionModal(m)}
                            className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded flex items-center gap-1 transition"
                            title="Finalizar servicio y liberar máquina"
                          >
                            <FileCheck className="w-3 h-3" /> Finalizar
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenModal(m)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded transition"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {!isTechnician && onEliminar && (
                          <button
                            onClick={() => handleDeleteMantenimiento(m)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {completingMantenimiento && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" /> Finalizar y Liberar Máquina
              </h3>
              <button onClick={() => setCompletingMantenimiento(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Confirmas que el mantenimiento de la máquina{' '}
              <strong className="text-amber-400 font-mono">
                {completingMantenimiento.maquina_codigo || `M-${completingMantenimiento.maquina_id}`}
              </strong>{' '}
              ha concluido. La máquina cambiará inmediatamente a estado{' '}
              <span className="text-emerald-400 font-bold">Disponible</span> en inventario.
            </p>

            <div>
              <label className="block text-slate-400 text-xs mb-1 font-semibold">
                Informe técnico / Observaciones finales:
              </label>
              <textarea
                rows={3}
                value={completionNotes}
                onChange={e => setCompletionNotes(e.target.value)}
                placeholder="Detalla las reparaciones realizadas o repuestos instalados..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800 text-xs">
              <button
                onClick={() => setCompletingMantenimiento(null)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmCompletion}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition shadow-lg shadow-emerald-500/10 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirmar y Liberar
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  {editingMantenimiento ? `Editar Mantenimiento #${editingMantenimiento.id}` : 'Programar Mantenimiento'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isTechnician
                    ? 'Actualización de datos y observaciones de tu servicio asignado.'
                    : 'Selecciona la máquina y el técnico responsable del servicio.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Máquina de Soldar</label>
                <select
                  required
                  disabled={isTechnician && !!editingMantenimiento}
                  value={formData.maquina_id}
                  onChange={e => setFormData({ ...formData, maquina_id: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono disabled:opacity-60"
                >
                  {maquinas.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.codigo_interno || `M-${m.id}`}] {m.marca} {m.modelo} — {m.estado}
                    </option>
                  ))}
                </select>
              </div>

              {!isTechnician && (
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      Responsable del Servicio
                    </label>

                    <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
                      <button
                        type="button"
                        onClick={() => setAsignacionModo('cuenta')}
                        className={`px-2 py-1 text-[10px] rounded-md font-medium transition ${
                          asignacionModo === 'cuenta'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Técnicos Propios
                      </button>
                      <button
                        type="button"
                        onClick={() => setAsignacionModo('externo')}
                        className={`px-2 py-1 text-[10px] rounded-md font-medium transition ${
                          asignacionModo === 'externo'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Proveedor Externo
                      </button>
                    </div>
                  </div>

                  {asignacionModo === 'cuenta' ? (
                    <div className="space-y-2">
                      <label className="block text-[11px] text-slate-400">
                        Seleccionar técnico del sistema:
                      </label>
                      <select
                        value={formData.tecnico_id || ''}
                        onChange={e => handleSelectTecnicoAccount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="" disabled>-- Seleccione un Técnico --</option>
                        {tecnicosActivos.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.nombre} {t.apellido} — {t.especialidad}
                          </option>
                        ))}
                      </select>

                      <div className="text-[11px] text-amber-400/90 font-medium bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Responsable: <strong className="text-slate-100">{formData.tecnico_responsable}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Nombre del Técnico o Taller Externo</label>
                        <input
                          type="text"
                          required
                          value={formData.tecnico_responsable}
                          onChange={e => setFormData({ ...formData, tecnico_responsable: e.target.value })}
                          placeholder="Ej. Taller Certificado"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Empresa Proveedora</label>
                        <input
                          type="text"
                          required
                          value={formData.proveedor}
                          onChange={e => setFormData({ ...formData, proveedor: e.target.value })}
                          placeholder="Ej. Distribuidor Autorizado"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tipo de Mantenimiento</label>
                  <select
                    disabled={isTechnician && !!editingMantenimiento}
                    value={formData.tipo}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value as TipoMantenimiento })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 disabled:opacity-60"
                  >
                    <option value="Preventivo">Preventivo</option>
                    <option value="Correctivo">Correctivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Estado del Servicio</label>
                  <select
                    value={formData.estado}
                    onChange={e => setFormData({ ...formData, estado: e.target.value as EstadoMantenimiento })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Programado">Programado</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Descripción / Falla Reportada</label>
                <textarea
                  required
                  rows={2}
                  disabled={isTechnician && !!editingMantenimiento}
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles de la labor..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 disabled:opacity-60"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Fecha Inicio</label>
                  <input
                    type="date"
                    required
                    disabled={isTechnician && !!editingMantenimiento}
                    value={formData.fecha_inicio}
                    onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Fecha Estimada Fin</label>
                  <input
                    type="date"
                    required
                    disabled={isTechnician && !!editingMantenimiento}
                    value={formData.fecha_fin}
                    onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 disabled:opacity-60"
                  />
                </div>
              </div>

              {!isTechnician && (
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Costo Estimado / Real (GTQ)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.costo}
                    onChange={e => setFormData({ ...formData, costo: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Observaciones y Notas Técnicas</label>
                <input
                  type="text"
                  value={formData.observaciones}
                  onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Anotaciones, repuestos instalados o estado..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Guardando...' : editingMantenimiento ? 'Guardar Cambios' : 'Registrar Mantenimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
