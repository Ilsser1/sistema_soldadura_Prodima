import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Asignacion, Tecnico, Maquina } from '../../../shared/types';
import {
  Link2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  X,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface AsignacionFormInputs {
  tecnico_id: number | '';
  maquina_id: number | '';
  motivo: string;
  observaciones?: string;
}

interface AsignacionesViewProps {
  asignaciones: Asignacion[];
  tecnicos: Tecnico[];
  maquinas: Maquina[];
  onCrear: (data: { tecnico_id: number; maquina_id: number; motivo: string; observaciones?: string }) => Promise<void>;
  onFinalizar: (id: number, observaciones?: string) => Promise<void>;
  isReadOnly?: boolean;
}

export const AsignacionesView: React.FC<AsignacionesViewProps> = ({
  asignaciones,
  tecnicos,
  maquinas,
  onCrear,
  onFinalizar,
  isReadOnly = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finishModalId, setFinishModalId] = useState<number | null>(null);
  const [finishObservaciones, setFinishObservaciones] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const maquinasElegibles = (maquinas || []).filter(m => m.estado === 'Disponible');
  const tecnicosActivos = (tecnicos || []).filter(t => t.estado === 'Activo');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AsignacionFormInputs>({
    mode: 'onBlur',
    defaultValues: {
      tecnico_id: '',
      maquina_id: '',
      motivo: 'Asignación de equipo para labores de soldadura',
      observaciones: 'Equipo revisado con kit de conectores y tierra de seguridad.'
    }
  });

  const filteredAsignaciones = (asignaciones || []).filter(a => {
    const matchesSearch =
      (a.tecnico_nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.maquina_codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.motivo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || a.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreateModal = () => {
    setErrorMessage(null);
    reset({
      tecnico_id: tecnicosActivos.length > 0 ? tecnicosActivos[0].id : '',
      maquina_id: maquinasElegibles.length > 0 ? maquinasElegibles[0].id : '',
      motivo: 'Asignación de equipo para labores de soldadura',
      observaciones: 'Equipo revisado con kit de cables, pinza de masa y antorcha.'
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: AsignacionFormInputs) => {
    if (!data.tecnico_id || !data.maquina_id) {
      setErrorMessage('Debe seleccionar un técnico y una máquina disponible.');
      return;
    }

    const tecValid = tecnicosActivos.find(t => t.id === Number(data.tecnico_id));
    if (!tecValid) {
      setErrorMessage('El técnico seleccionado debe estar activo.');
      return;
    }

    setErrorMessage(null);
    try {
      await onCrear({
        tecnico_id: Number(data.tecnico_id),
        maquina_id: Number(data.maquina_id),
        motivo: data.motivo,
        observaciones: data.observaciones
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar la asignación.');
    }
  };

  const handleFinishSubmit = async () => {
    if (finishModalId) {
      await onFinalizar(finishModalId, finishObservaciones);
      setFinishModalId(null);
      setFinishObservaciones('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-amber-400" />
            Asignación de Máquinas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Control de equipos en custodia de técnicos, fechas de entrega y devoluciones.
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" /> Nueva Asignación
          </button>
        )}
      </div>

      {isReadOnly && (
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
          Vista de Técnico: Visualizando tus máquinas asignadas. Puedes registrar su devolución al concluir tus labores.
        </div>
      )}

      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200">Asignación Única</span>
            <p className="text-[11px] text-slate-400">Una máquina no puede tener dos asignaciones activas simultáneas.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200">Bloqueo por Mantenimiento</span>
            <p className="text-[11px] text-slate-400">Máquinas en Mantenimiento no se pueden asignar a proyectos.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200">Sincronización Automática</span>
            <p className="text-[11px] text-slate-400">Asignar cambia estado a Asignada; Devolver regresa a Disponible.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por técnico, código de máquina o motivo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 shrink-0">Filtrar Estado:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="Activa">Asignación Activa</option>
            <option value="Finalizada">Finalizada (Devuelta)</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-3">Código Máquina</th>
                <th className="p-3">Técnico Responsable</th>
                <th className="p-3">Motivo / Proyecto</th>
                <th className="p-3">Fecha Asignación</th>
                <th className="p-3">Fecha Devolución</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAsignaciones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No hay asignaciones registradas.
                  </td>
                </tr>
              ) : (
                filteredAsignaciones.map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <span className="font-mono text-amber-400 font-bold block">{a.maquina_codigo}</span>
                      <span className="text-[10px] text-slate-500">{a.maquina_marca_modelo}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-200">{a.tecnico_nombre}</td>
                    <td className="p-3 max-w-xs truncate text-slate-300" title={a.motivo}>
                      {a.motivo}
                    </td>
                    <td className="p-3 text-slate-400">{new Date(a.fecha_asignacion).toLocaleString()}</td>
                    <td className="p-3 text-slate-400">
                      {a.fecha_devolucion ? new Date(a.fecha_devolucion).toLocaleString() : <span className="text-amber-400 font-semibold">En uso</span>}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        a.estado === 'Activa' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        a.estado === 'Finalizada' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {a.estado}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {a.estado === 'Activa' && (
                        <button
                          onClick={() => {
                            setFinishModalId(a.id);
                            setFinishObservaciones('Devolución de equipo sin novedades.');
                          }}
                          className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold text-[11px] rounded transition flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5" /> Registrar Devolución
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Link2 className="w-4 h-4 text-amber-400" /> Nueva Asignación de Máquina de Soldar
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Técnico Responsable <span className="text-amber-400">*</span>
                </label>
                <select
                  {...register('tecnico_id', {
                    required: 'Debe seleccionar un técnico',
                    validate: v => Number(v) > 0 || 'Seleccione un técnico válido'
                  })}
                  className={`w-full bg-slate-800 border rounded-lg p-2.5 text-slate-200 focus:outline-none transition ${
                    errors.tecnico_id ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'
                  }`}
                >
                  <option value="">-- Seleccionar Técnico --</option>
                  {tecnicosActivos.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} {t.apellido} — {t.especialidad}
                    </option>
                  ))}
                </select>
                {errors.tecnico_id && (
                  <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.tecnico_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Seleccionar Máquina (Disponibles) <span className="text-amber-400">*</span>
                </label>
                {maquinasElegibles.length === 0 ? (
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>No hay máquinas en estado 'Disponible' para asignar.</span>
                  </div>
                ) : (
                  <>
                    <select
                      {...register('maquina_id', {
                        required: 'Debe seleccionar una máquina',
                        validate: v => Number(v) > 0 || 'Seleccione una máquina disponible'
                      })}
                      className={`w-full bg-slate-800 border rounded-lg p-2.5 text-slate-200 focus:outline-none font-mono transition ${
                        errors.maquina_id ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'
                      }`}
                    >
                      <option value="">-- Seleccionar Máquina Disponible --</option>
                      {maquinasElegibles.map(m => (
                        <option key={m.id} value={m.id}>
                          [{m.codigo_interno || `M-${m.id}`}] {m.marca} {m.modelo} - {m.tipo} ({m.ubicacion})
                        </option>
                      ))}
                    </select>
                    {errors.maquina_id && (
                      <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {errors.maquina_id.message}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Motivo / Proyecto / Trabajo a Realizar <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={2}
                  {...register('motivo', {
                    required: 'El motivo o proyecto es obligatorio',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                  })}
                  placeholder="Descripción de la labor o proyecto asignado..."
                  className={`w-full bg-slate-800 border rounded-lg p-2 text-slate-200 focus:outline-none transition ${
                    errors.motivo ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'
                  }`}
                ></textarea>
                {errors.motivo && (
                  <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.motivo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Observaciones y Accesorios Entregados</label>
                <input
                  type="text"
                  {...register('observaciones')}
                  placeholder="Accesorios entregados (antorcha, cables, careta)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500 transition"
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
                  disabled={isSubmitting || maquinasElegibles.length === 0}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg transition shadow-md shadow-amber-500/10 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Asignando...' : 'Confirmar Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {finishModalId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" /> Registrar Devolución de Equipo
            </h3>
            <p className="text-xs text-slate-400">
              Al confirmar la devolución, la máquina volverá inmediatamente a estado <span className="text-emerald-400 font-bold">Disponible</span>.
            </p>

            <div>
              <label className="block text-slate-400 text-xs mb-1 font-semibold">Observaciones de Devolución:</label>
              <textarea
                rows={3}
                value={finishObservaciones}
                onChange={e => setFinishObservaciones(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800 text-xs">
              <button onClick={() => setFinishModalId(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded">
                Cancelar
              </button>
              <button onClick={handleFinishSubmit} className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded">
                Finalizar Asignación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
