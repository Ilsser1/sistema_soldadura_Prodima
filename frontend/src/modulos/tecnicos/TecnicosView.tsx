import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Tecnico, EspecialidadTecnico, Usuario } from '../../../../shared/types';
import {
  HardHat,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Phone,
  Mail,
  Award,
  Cpu,
  Wrench,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw
} from 'lucide-react';

interface TecnicoFormInputs {
  nombre: string;
  apellido: string;
  DPI: string;
  telefono: string;
  correo: string;
  especialidad: EspecialidadTecnico;
  puesto: string;
  fecha_ingreso: string;
  estado: 'Activo' | 'Inactivo';
  usuario_id?: string | number;
  crear_usuario: boolean;
  username: string;
  password?: string;
}

interface TecnicosViewProps {
  tecnicos: Tecnico[];
  usuarios: Usuario[];
  onCrear: (t: Partial<Tecnico> & { crear_usuario?: boolean; username?: string; password?: string }) => Promise<void>;
  onActualizar: (id: number, t: Partial<Tecnico> & { username?: string; password?: string; crear_usuario?: boolean }) => Promise<void>;
  onDesactivar: (id: number) => Promise<void>;
  onEliminar?: (id: number, permanente?: boolean) => Promise<void>;
  onLimpiarTodo?: () => Promise<void>;
  isReadOnly?: boolean;
}

export const TecnicosView: React.FC<TecnicosViewProps> = ({
  tecnicos,
  usuarios,
  onCrear,
  onActualizar,
  onEliminar,
  onLimpiarTodo,
  isReadOnly = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('TODOS');
  const [selectedTecnico, setSelectedTecnico] = useState<Tecnico | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTecnico, setEditingTecnico] = useState<Tecnico | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [tecnicoToDelete, setTecnicoToDelete] = useState<Tecnico | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TecnicoFormInputs>({
    mode: 'onSubmit',
    defaultValues: {
      nombre: '',
      apellido: '',
      DPI: '',
      telefono: '',
      correo: '',
      especialidad: 'Soldadura TIG (GTAW)',
      puesto: 'Técnico Especialista en Soldadura',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      estado: 'Activo',
      usuario_id: '',
      crear_usuario: true,
      username: '',
      password: 'Tec2026!'
    }
  });

  const watchNombre = watch('nombre');
  const watchApellido = watch('apellido');
  const watchCorreo = watch('correo');

  const handleAutoSuggestUsername = () => {
    if (!editingTecnico) {
      if (watchCorreo && watchCorreo.includes('@')) {
        setValue('username', watchCorreo.split('@')[0].toLowerCase());
      } else if (watchNombre) {
        const cleanName = watchNombre.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanLast = (watchApellido || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        setValue('username', `${cleanName}${cleanLast}`.slice(0, 15) || 'tecnico');
      }
    }
  };

  const filteredTecnicos = (tecnicos || []).filter(t => {
    const matchesSearch =
      (t.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.DPI || '').includes(searchTerm) ||
      (t.correo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = specialtyFilter === 'TODOS' || t.especialidad === specialtyFilter;
    return matchesSearch && matchesSpec;
  });

  const handleOpenModal = (t?: Tecnico) => {
    setSubmitError(null);
    setShowPassword(false);
    if (t) {
      setEditingTecnico(t);
      const linkedUser = usuarios.find(u => u.id === t.usuario_id);
      reset({
        nombre: t.nombre,
        apellido: t.apellido,
        DPI: t.DPI,
        telefono: t.telefono,
        correo: t.correo,
        especialidad: t.especialidad,
        puesto: t.puesto,
        fecha_ingreso: t.fecha_ingreso,
        estado: t.estado,
        usuario_id: t.usuario_id || '',
        crear_usuario: true,
        username: linkedUser ? linkedUser.username : (t.usuario_username || t.correo.split('@')[0] || ''),
        password: ''
      });
    } else {
      setEditingTecnico(null);
      reset({
        nombre: '',
        apellido: '',
        DPI: '',
        telefono: '',
        correo: '',
        especialidad: 'Soldadura TIG (GTAW)',
        puesto: 'Técnico Especialista en Soldadura',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        estado: 'Activo',
        usuario_id: '',
        crear_usuario: true,
        username: '',
        password: 'Tec2026!'
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: TecnicoFormInputs) => {
    setSubmitError(null);
    try {
      const payload: any = {
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        DPI: data.DPI.trim(),
        telefono: data.telefono.trim(),
        correo: data.correo.trim(),
        especialidad: data.especialidad,
        puesto: data.puesto.trim(),
        fecha_ingreso: data.fecha_ingreso,
        estado: data.estado,
        usuario_id: data.usuario_id ? Number(data.usuario_id) : null,
        crear_usuario: data.crear_usuario,
        username: data.username.trim() || undefined,
        password: data.password?.trim() || undefined
      };

      if (editingTecnico) {
        await onActualizar(editingTecnico.id, payload);
        setStatusMessage(`Técnico ${payload.nombre} ${payload.apellido} modificado con éxito.`);
      } else {
        await onCrear(payload);
        setStatusMessage(`Técnico ${payload.nombre} ${payload.apellido} registrado exitosamente.`);
      }
      setIsModalOpen(false);
      reset();
    } catch (err: any) {
      setSubmitError(err.message || 'Error al guardar el técnico.');
    }
  };

  const handleConfirmDelete = async (permanente: boolean) => {
    if (!tecnicoToDelete || !onEliminar) return;
    try {
      setIsDeleting(true);
      await onEliminar(tecnicoToDelete.id, permanente);
      setStatusMessage(
        permanente
          ? `Técnico ${tecnicoToDelete.nombre} ${tecnicoToDelete.apellido} eliminado definitivamente.`
          : `Técnico ${tecnicoToDelete.nombre} ${tecnicoToDelete.apellido} desactivado.`
      );
      setTecnicoToDelete(null);
    } catch (err: any) {
      alert(`Error al procesar eliminación: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetData = async () => {
    if (!onLimpiarTodo) return;
    try {
      setIsResetting(true);
      await onLimpiarTodo();
      setIsResetConfirmOpen(false);
      setStatusMessage('Catálogo vaciado y restablecido con éxito.');
    } catch (err: any) {
      alert(`Error al limpiar: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-400" />
            Gestión de Técnicos y Accesos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Administración del personal técnico y asignación de cuentas de acceso.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isReadOnly && onLimpiarTodo && (
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Limpiar Todo
            </button>
          )}

          {!isReadOnly && (
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" /> Registrar Técnico
            </button>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
          Vista de Técnico: Visualizando tu expediente técnico asignado.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, DPI o correo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 shrink-0">Especialidad:</span>
          <select
            value={specialtyFilter}
            onChange={e => setSpecialtyFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todas las Especialidades ({tecnicos.length})</option>
            <option value="Soldadura TIG (GTAW)">Soldadura TIG (GTAW)</option>
            <option value="Soldadura MIG/MAG (GMAW)">Soldadura MIG/MAG (GMAW)</option>
            <option value="Soldadura Arco Eléctrico (SMAW)">Soldadura Arco Eléctrico (SMAW)</option>
            <option value="Soldadura Tubular (FCAW)">Soldadura Tubular (FCAW)</option>
            <option value="Soldadura Arco Sumergido (SAW)">Soldadura Arco Sumergido (SAW)</option>
            <option value="Soldadura Oxigas / Corte">Soldadura Oxigas / Corte</option>
          </select>
        </div>
      </div>

      {filteredTecnicos.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto text-slate-500 border border-slate-700">
            <HardHat className="w-8 h-8 text-amber-400/60" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">No hay técnicos registrados</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Puedes registrar a tus técnicos ahora.
            </p>
          </div>
          {!isReadOnly && (
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => handleOpenModal()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" /> Registrar Primer Técnico
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTecnicos.map(t => {
          const linkedUser = usuarios.find(u => u.id === t.usuario_id);
          const hasLogin = !!(linkedUser || t.usuario_username);
          const usernameDisplay = linkedUser ? linkedUser.username : (t.usuario_username || 'tec');

          return (
            <div key={t.id} className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-amber-500/40 p-4 transition shadow-xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{t.nombre} {t.apellido}</h3>
                    <p className="text-[11px] text-amber-400 font-semibold">{t.puesto}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded shrink-0 ${
                    t.estado === 'Activo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {t.estado}
                  </span>
                </div>

                <div className="mt-2.5 p-2 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <KeyRound className={`w-3.5 h-3.5 ${hasLogin ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-slate-400">Usuario:</span>
                    <span className="font-mono font-bold text-slate-200">
                      @{usernameDisplay}
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-700/60 text-amber-400 px-1.5 py-0.5 rounded font-semibold">
                    Rol: Técnico
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-semibold text-slate-200">{t.especialidad}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                      DPI: {t.DPI || 'No especificado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 pt-0.5">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <span>{t.telefono || 'Sin teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <span className="truncate">{t.correo}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 text-slate-400">
                  <span className="flex items-center gap-1" title="Máquinas Asignadas Activas">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" /> {t.maquinas_asignadas_count || 0}
                  </span>
                  <span className="flex items-center gap-1" title="Mantenimientos Realizados">
                    <Wrench className="w-3.5 h-3.5 text-amber-400" /> {t.mantenimientos_count || 0}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setSelectedTecnico(t)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                    title="Ver Ficha Completa"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {!isReadOnly && (
                    <>
                      <button
                        onClick={() => handleOpenModal(t)}
                        className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-700 hover:border-amber-500/30 transition"
                        title="Editar Técnico"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTecnicoToDelete(t)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition"
                        title="Eliminar Técnico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedTecnico && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{selectedTecnico.nombre} {selectedTecnico.apellido}</h3>
                <p className="text-xs text-amber-400">{selectedTecnico.puesto}</p>
              </div>
              <button onClick={() => setSelectedTecnico(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Especialidad Principal</span>
                  <span className="font-bold text-slate-200">{selectedTecnico.especialidad}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Documento DPI</span>
                  <span className="font-mono font-bold text-slate-200">{selectedTecnico.DPI}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Teléfono de Contacto</span>
                  <span className="text-slate-200">{selectedTecnico.telefono}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Correo Electrónico</span>
                  <span className="text-slate-200 break-all">{selectedTecnico.correo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Fecha de Ingreso</span>
                  <span className="text-slate-200">{selectedTecnico.fecha_ingreso}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Estado Operativo</span>
                  <span className="font-bold text-emerald-400">{selectedTecnico.estado}</span>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 font-bold block text-[11px] mb-1">Acceso al Sistema:</span>
                <p className="text-slate-300">
                  Usuario: <strong className="text-amber-400 font-mono">@{selectedTecnico.usuario_username || selectedTecnico.correo.split('@')[0]}</strong> | Rol: <strong className="text-cyan-400">Técnico</strong>
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTecnico(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">
                  {editingTecnico ? 'Editar Técnico y Acceso' : 'Registrar Nuevo Técnico'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Completa los datos del técnico y sus credenciales de ingreso al sistema.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  1. Información Personal y Operativa
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Nombre <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('nombre', {
                        required: 'El nombre es obligatorio',
                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                      })}
                      onBlur={handleAutoSuggestUsername}
                      placeholder="Ej. Juan"
                      className={`w-full bg-slate-800 border rounded-lg p-2 text-slate-200 focus:outline-none transition ${
                        errors.nombre ? 'border-red-500 bg-red-500/5' : 'border-slate-700 focus:border-amber-500'
                      }`}
                    />
                    {errors.nombre && (
                      <p className="text-[10px] text-red-400 mt-1">{errors.nombre.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Apellido <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('apellido', {
                        required: 'El apellido es obligatorio',
                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                      })}
                      onBlur={handleAutoSuggestUsername}
                      placeholder="Ej. Pérez"
                      className={`w-full bg-slate-800 border rounded-lg p-2 text-slate-200 focus:outline-none transition ${
                        errors.apellido ? 'border-red-500 bg-red-500/5' : 'border-slate-700 focus:border-amber-500'
                      }`}
                    />
                    {errors.apellido && (
                      <p className="text-[10px] text-red-400 mt-1">{errors.apellido.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Documento DPI <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('DPI', {
                        required: 'El DPI es obligatorio'
                      })}
                      placeholder="2489 12345 0101"
                      className={`w-full bg-slate-800 border rounded-lg p-2 font-mono text-slate-200 focus:outline-none transition ${
                        errors.DPI ? 'border-red-500 bg-red-500/5' : 'border-slate-700 focus:border-amber-500'
                      }`}
                    />
                    {errors.DPI && (
                      <p className="text-[10px] text-red-400 mt-1">{errors.DPI.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Teléfono <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('telefono', {
                        required: 'El teléfono es obligatorio'
                      })}
                      placeholder="+502 5544-1122"
                      className={`w-full bg-slate-800 border rounded-lg p-2 text-slate-200 focus:outline-none transition ${
                        errors.telefono ? 'border-red-500 bg-red-500/5' : 'border-slate-700 focus:border-amber-500'
                      }`}
                    />
                    {errors.telefono && (
                      <p className="text-[10px] text-red-400 mt-1">{errors.telefono.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Correo Electrónico <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('correo', {
                      required: 'El correo electrónico es obligatorio'
                    })}
                    onBlur={handleAutoSuggestUsername}
                    placeholder="jperez@prodima.gt"
                    className={`w-full bg-slate-800 border rounded-lg p-2 text-slate-200 focus:outline-none transition ${
                      errors.correo ? 'border-red-500 bg-red-500/5' : 'border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {errors.correo && (
                    <p className="text-[10px] text-red-400 mt-1">{errors.correo.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Especialidad <span className="text-amber-400">*</span>
                    </label>
                    <select
                      {...register('especialidad', { required: 'Seleccione una especialidad' })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Soldadura TIG (GTAW)">Soldadura TIG (GTAW)</option>
                      <option value="Soldadura MIG/MAG (GMAW)">Soldadura MIG/MAG (GMAW)</option>
                      <option value="Soldadura Arco Eléctrico (SMAW)">Soldadura Arco Eléctrico (SMAW)</option>
                      <option value="Soldadura Tubular (FCAW)">Soldadura Tubular (FCAW)</option>
                      <option value="Soldadura Arco Sumergido (SAW)">Soldadura Arco Sumergido (SAW)</option>
                      <option value="Soldadura Oxigas / Corte">Soldadura Oxigas / Corte</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Puesto Operativo <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('puesto', { required: 'El puesto es obligatorio' })}
                      placeholder="Especialista TIG"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Fecha de Ingreso <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('fecha_ingreso', { required: 'La fecha es obligatoria' })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Estado <span className="text-amber-400">*</span>
                    </label>
                    <select
                      {...register('estado', { required: 'Seleccione un estado' })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-slate-100 text-xs">
                      2. Cuenta de Acceso al Sistema
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded">
                    Rol: Técnico
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Nombre de Usuario <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register('username', {
                          required: 'El nombre de usuario es obligatorio',
                          minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                        })}
                        placeholder="ej. jperez"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-[10px] text-red-400 mt-1">{errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Contraseña {editingTecnico ? '(Opcional)' : <span className="text-amber-400">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', {
                          required: editingTecnico ? false : 'La contraseña es requerida',
                          minLength: editingTecnico ? undefined : { value: 6, message: 'Mínimo 6 caracteres' }
                        })}
                        placeholder={editingTecnico ? 'Nueva contraseña (opcional)' : 'Tec2026!'}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 pr-9 focus:outline-none focus:border-amber-500 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                        title={showPassword ? 'Ocultar' : 'Ver contraseña'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[10px] text-red-400 mt-1">{errors.password.message}</p>
                    )}
                  </div>
                </div>
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
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition shadow-md shadow-amber-500/10 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Guardando...' : (editingTecnico ? 'Guardar Cambios' : 'Registrar Técnico')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tecnicoToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">¿Eliminar técnico?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Técnico: <strong className="text-slate-200">{tecnicoToDelete.nombre} {tecnicoToDelete.apellido}</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-800">
              Puedes eliminar definitivamente al técnico o únicamente desactivarlo en el sistema.
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTecnicoToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold"
              >
                Solo Desactivar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(true)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-lg shadow-red-600/20"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar Definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">¿Limpiar todo el catálogo?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Restablecer base de datos a estado limpio
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-800">
              Esta acción borrará los registros para comenzar de cero. Tu usuario Administrador se mantendrá intacto.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                disabled={isResetting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetData}
                disabled={isResetting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-lg shadow-red-600/20"
              >
                {isResetting ? 'Limpiando...' : 'Sí, Limpiar Todo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
