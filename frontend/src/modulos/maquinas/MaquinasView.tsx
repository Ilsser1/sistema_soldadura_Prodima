import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Maquina, TipoMaquina, EstadoMaquina } from '../../../../shared/types';
import {
  Cpu,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Clock,
  History,
  AlertCircle,
  Lock,
  Sparkles
} from 'lucide-react';

interface MaquinaFormInputs {
  codigo_interno: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  tipo: TipoMaquina;
  voltaje: string;
  amperaje: string;
  potencia: string;
  ubicacion: string;
  fecha_adquisicion: string;
  proveedor: string;
  estado: EstadoMaquina;
  observaciones?: string;
}

export const generarCodigoMaquina = (marca: string, fechaCompra: string, correlativo = 1): string => {
  const cleanMarca = (marca || 'PRD').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'PRD';
  let datePart = '';
  if (fechaCompra) {
    const parts = fechaCompra.split('-');
    if (parts.length >= 2) {
      datePart = `${parts[0]}${parts[1]}`;
    } else {
      datePart = fechaCompra.replace(/[^0-9]/g, '').slice(0, 6);
    }
  }
  if (!datePart) {
    const now = new Date();
    datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  const corr = String(correlativo).padStart(3, '0');
  return `PRD-${cleanMarca}-${datePart}-${corr}`;
};

interface MaquinasViewProps {
  maquinas: Maquina[];
  onCrear: (m: Partial<Maquina>) => Promise<void>;
  onActualizar: (id: number, m: Partial<Maquina>) => Promise<void>;
  onDarDeBaja: (id: number) => Promise<void>;
  onEliminar?: (id: number, permanente?: boolean) => Promise<void>;
  onViewHistory: (maquinaId: number) => void;
  isReadOnly?: boolean;
}

export const MaquinasView: React.FC<MaquinasViewProps> = ({
  maquinas,
  onCrear,
  onActualizar,
  onDarDeBaja,
  onEliminar,
  onViewHistory,
  isReadOnly = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  const [selectedMaquina, setSelectedMaquina] = useState<Maquina | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaquina, setEditingMaquina] = useState<Maquina | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [maquinaToDelete, setMaquinaToDelete] = useState<Maquina | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusChangeModal, setStatusChangeModal] = useState<Maquina | null>(null);
  const [newStatus, setNewStatus] = useState<EstadoMaquina>('Disponible');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting }
  } = useForm<MaquinaFormInputs>({
    mode: 'onBlur',
    defaultValues: {
      codigo_interno: '',
      marca: 'ESAB',
      modelo: '',
      numero_serie: '',
      tipo: 'Inversora',
      voltaje: '220V Monofásica',
      amperaje: '160A',
      potencia: '6.5 kW',
      ubicacion: 'PRODIMA Sede Central - 19 Calle Zona 11 Mariscal',
      fecha_adquisicion: new Date().toISOString().split('T')[0],
      proveedor: 'PRODIMA Guatemala (Línea Oficial)',
      estado: 'Disponible',
      observaciones: ''
    }
  });

  const watchedMarca = useWatch({ control, name: 'marca' });
  const watchedFecha = useWatch({ control, name: 'fecha_adquisicion' });

  useEffect(() => {
    if (isModalOpen && !editingMaquina) {
      const proximoCorrelativo = (maquinas || []).length + 1;
      const nuevoCodigo = generarCodigoMaquina(watchedMarca, watchedFecha, proximoCorrelativo);
      setValue('codigo_interno', nuevoCodigo, { shouldValidate: true, shouldDirty: true });
    }
  }, [watchedMarca, watchedFecha, isModalOpen, editingMaquina, maquinas, setValue]);

  const filteredMaquinas = (maquinas || []).filter(m => {
    const matchesSearch =
      (m.codigo_interno || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.marca || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.modelo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.numero_serie || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.ubicacion || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'TODOS' || m.tipo === typeFilter;
    const matchesStatus = statusFilter === 'TODOS' || m.estado === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (estado: EstadoMaquina) => {
    switch (estado) {
      case 'Disponible':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Disponible</span>;
      case 'Asignada':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Asignada</span>;
      case 'En mantenimiento':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">En mantenimiento</span>;
      case 'Fuera de servicio':
      case 'Reparación':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-400 border border-red-500/30">{estado}</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-700 text-slate-300">Baja</span>;
    }
  };

  const handleOpenModal = (m?: Maquina) => {
    setSubmitError(null);
    if (m) {
      setEditingMaquina(m);
      reset({
        codigo_interno: m.codigo_interno,
        marca: m.marca,
        modelo: m.modelo,
        numero_serie: m.numero_serie,
        tipo: m.tipo,
        voltaje: m.voltaje,
        amperaje: m.amperaje,
        potencia: m.potencia,
        ubicacion: m.ubicacion,
        fecha_adquisicion: m.fecha_adquisicion,
        proveedor: m.proveedor,
        estado: m.estado,
        observaciones: m.observaciones || ''
      });
    } else {
      setEditingMaquina(null);
      const hoy = new Date().toISOString().split('T')[0];
      const inicialCodigo = generarCodigoMaquina('ESAB', hoy, (maquinas || []).length + 1);
      reset({
        codigo_interno: inicialCodigo,
        marca: 'ESAB',
        modelo: 'Handy Arc 162i',
        numero_serie: `SN-${Date.now().toString().slice(-6)}`,
        tipo: 'Inversora',
        voltaje: '220V Monofásica',
        amperaje: '160A',
        potencia: '6.2 kW',
        ubicacion: 'PRODIMA Sede Central - 19 Calle Zona 11 Mariscal',
        fecha_adquisicion: hoy,
        proveedor: 'PRODIMA Guatemala (Distribuidor Oficial)',
        estado: 'Disponible',
        observaciones: 'Equipo verificado y calibrado listo para operación.'
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: MaquinaFormInputs) => {
    setSubmitError(null);
    try {
      const payload = {
        ...data,
        codigo_interno: editingMaquina
          ? editingMaquina.codigo_interno
          : generarCodigoMaquina(data.marca, data.fecha_adquisicion, (maquinas || []).length + 1)
      };

      if (editingMaquina) {
        await onActualizar(editingMaquina.id, payload);
      } else {
        await onCrear(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setSubmitError(err.message || 'Error al guardar la máquina de soldar.');
    }
  };

  const handleStatusChangeSubmit = async () => {
    if (statusChangeModal) {
      await onActualizar(statusChangeModal.id, { estado: newStatus });
      setStatusChangeModal(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            Catálogo de Máquinas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Control de inventario, números de serie, marcas y estados operativos.
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" /> Registrar Máquina
          </button>
        )}
      </div>

      {isReadOnly && (
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
          Vista de Técnico: Visualizando únicamente las máquinas de soldar asignadas a tu custodia o a tus órdenes de mantenimiento.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código, serie, marca, modelo o ubicación..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 shrink-0">Tipo:</span>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todos los Tipos</option>
            <option value="Inversora">Inversora</option>
            <option value="Rectificadora">Rectificadora</option>
            <option value="Transformador">Transformador</option>
            <option value="Generador">Generador</option>
            <option value="Multi-proceso">Multi-proceso</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 shrink-0">Estado:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Asignada">Asignada</option>
            <option value="En mantenimiento">En mantenimiento</option>
            <option value="Fuera de servicio">Fuera de servicio</option>
            <option value="Reparación">Reparación</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      {filteredMaquinas.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto text-slate-500 border border-slate-700">
            <Cpu className="w-8 h-8 text-amber-400/60" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">No hay máquinas registradas</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              El inventario de maquinaria se encuentra limpio. Registra tus equipos para comenzar a gestionar el inventario.
            </p>
          </div>
          {!isReadOnly && (
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => handleOpenModal()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" /> Registrar Primera Máquina
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaquinas.map(m => (
            <div key={m.id} className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-amber-500/40 p-4 transition shadow-xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {m.codigo_interno}
                    </span>
                    <h3 className="font-bold text-sm text-slate-100 mt-1">{m.marca} {m.modelo}</h3>
                  </div>
                  {getStatusBadge(m.estado)}
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-300">
                  <p className="text-[11px] text-slate-400">
                    Serie: <span className="font-mono text-slate-200 font-semibold">{m.numero_serie}</span>
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-semibold border border-slate-700">
                      {m.tipo}
                    </span>
                    <span className="text-slate-400 text-[11px]">{m.voltaje} | {m.amperaje}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Ubicación: <span className="text-slate-200">{m.ubicacion}</span>
                  </p>
                  {m.tecnico_actual && (
                    <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60 mt-2 text-[11px]">
                      <span className="text-slate-400 block text-[10px]">Técnico Asignado:</span>
                      <span className="text-cyan-400 font-bold">{m.tecnico_actual}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => onViewHistory(m.id)}
                  className="text-amber-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
                >
                  <History className="w-3.5 h-3.5" /> Ver Trazabilidad
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSelectedMaquina(m)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                    title="Detalles Completos"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {!isReadOnly && (
                    <>
                      <button
                        onClick={() => {
                          setStatusChangeModal(m);
                          setNewStatus(m.estado);
                        }}
                        className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded border border-amber-500/30"
                        title="Cambiar Estado Operativo"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(m)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                        title="Editar Máquina"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setMaquinaToDelete(m)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30"
                        title="Eliminar o Dar de Baja"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMaquina && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-amber-400 font-bold">{selectedMaquina.codigo_interno || `M-${selectedMaquina.id}`}</span>
                <h3 className="font-bold text-slate-100 text-sm">{selectedMaquina.marca} {selectedMaquina.modelo}</h3>
              </div>
              <button onClick={() => setSelectedMaquina(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">Número de Serie</span>
                <span className="font-mono font-bold text-slate-200">{selectedMaquina.numero_serie}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Tipo de Equipo</span>
                <span className="font-bold text-amber-400">{selectedMaquina.tipo}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Voltaje Operativo</span>
                <span className="text-slate-200">{selectedMaquina.voltaje}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Amperaje Máximo</span>
                <span className="text-slate-200">{selectedMaquina.amperaje}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Potencia Nominal</span>
                <span className="text-slate-200">{selectedMaquina.potencia}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Fecha Adquisición</span>
                <span className="text-slate-200">{selectedMaquina.fecha_adquisicion}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px]">Proveedor / Distribuidor</span>
                <span className="text-slate-200 font-semibold">{selectedMaquina.proveedor}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px]">Ubicación Física Actual</span>
                <span className="text-slate-200 font-semibold">{selectedMaquina.ubicacion}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-700/50">
                <span className="text-slate-500 block text-[10px]">Observaciones del Estado:</span>
                <p className="text-slate-300 text-[11px] mt-0.5">{selectedMaquina.observaciones || 'Sin observaciones registradas.'}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  const id = selectedMaquina.id;
                  setSelectedMaquina(null);
                  onViewHistory(id);
                }}
                className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold"
              >
                Ver Historial Completo →
              </button>
              <button
                onClick={() => setSelectedMaquina(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {statusChangeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Cambiar Estado Operativo</h3>
            <p className="text-xs text-slate-400">
              Máquina: <span className="font-bold text-amber-400">{statusChangeModal.codigo_interno || `M-${statusChangeModal.id}`}</span> ({statusChangeModal.marca} {statusChangeModal.modelo})
            </p>

            <div>
              <label className="block text-slate-400 text-xs mb-1 font-semibold">Nuevo Estado:</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as EstadoMaquina)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="Disponible">Disponible</option>
                <option value="Asignada">Asignada</option>
                <option value="En mantenimiento">En mantenimiento</option>
                <option value="Fuera de servicio">Fuera de servicio</option>
                <option value="Reparación">Reparación</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800 text-xs">
              <button onClick={() => setStatusChangeModal(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded">
                Cancelar
              </button>
              <button onClick={handleStatusChangeSubmit} className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded">
                Actualizar Estado
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">
                {editingMaquina ? 'Editar Máquina de Soldar' : 'Registrar Nueva Máquina de Soldar'}
              </h3>
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold flex items-center gap-1">
                      Código Único <span className="text-amber-400">*</span>
                    </label>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Auto-Generado
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      {...register('codigo_interno')}
                      placeholder="PRD-ESAB-202608-001"
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg p-2 font-mono font-bold text-amber-400 focus:outline-none cursor-not-allowed select-all"
                    />
                    <div className="absolute right-2.5 top-2.5 text-slate-500">
                      <Sparkles className="w-4 h-4 text-amber-500/70 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Generado por: <span className="text-slate-400">Marca + Fecha de Compra</span>
                  </p>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Número de Serie <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('numero_serie', {
                      required: 'El número de serie es obligatorio',
                      minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                    })}
                    placeholder="SN-982142"
                    className={`w-full bg-slate-800 border rounded-lg p-2 font-mono text-slate-200 focus:outline-none transition ${
                      errors.numero_serie ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {errors.numero_serie && (
                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.numero_serie.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Marca de Fabricante <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('marca', {
                      required: 'La marca es obligatoria',
                      minLength: { value: 2, message: 'Mínimo 2 letras' }
                    })}
                    placeholder="ESAB / Miller / Lincoln / Fronius"
                    className={`w-full bg-slate-800 border rounded-lg p-2 text-slate-200 focus:outline-none transition ${
                      errors.marca ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {errors.marca && (
                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.marca.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Modelo del Equipo <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('modelo', {
                      required: 'El modelo es obligatorio',
                      minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                    })}
                    placeholder="Handy Arc 162i"
                    className={`w-full bg-slate-800 border rounded-lg p-2 text-slate-200 focus:outline-none transition ${
                      errors.modelo ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {errors.modelo && (
                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.modelo.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Tipo de Soldadora <span className="text-amber-400">*</span>
                  </label>
                  <select
                    {...register('tipo', { required: 'Seleccione un tipo de máquina' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Inversora">Inversora</option>
                    <option value="Rectificadora">Rectificadora</option>
                    <option value="Transformador">Transformador</option>
                    <option value="Generador">Generador</option>
                    <option value="Multi-proceso">Multi-proceso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Estado Operativo <span className="text-amber-400">*</span>
                  </label>
                  <select
                    {...register('estado', { required: 'Seleccione un estado' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Asignada">Asignada</option>
                    <option value="En mantenimiento">En mantenimiento</option>
                    <option value="Fuera de servicio">Fuera de servicio</option>
                    <option value="Reparación">Reparación</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Voltaje <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('voltaje', {
                      required: 'Obligatorio',
                      pattern: {
                        value: /\d+V/i,
                        message: 'Ej. 220V'
                      }
                    })}
                    placeholder="220V Monofásica"
                    className={`w-full bg-slate-800 border rounded-lg p-2 text-slate-200 focus:outline-none transition ${
                      errors.voltaje ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {errors.voltaje && (
                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.voltaje.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Amperaje <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('amperaje', {
                      required: 'Obligatorio',
                      pattern: {
                        value: /\d+A/i,
                        message: 'Ej. 160A o 250A'
                      }
                    })}
                    placeholder="160A"
                    className={`w-full bg-slate-800 border rounded-lg p-2 text-slate-200 focus:outline-none transition ${
                      errors.amperaje ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {errors.amperaje && (
                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.amperaje.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Potencia <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('potencia', {
                      required: 'Obligatorio',
                      minLength: { value: 2, message: 'Ej. 6.5 kW' }
                    })}
                    placeholder="6.2 kW"
                    className={`w-full bg-slate-800 border rounded-lg p-2 text-slate-200 focus:outline-none transition ${
                      errors.potencia ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {errors.potencia && (
                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.potencia.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Ubicación Física Asignada <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  {...register('ubicacion', {
                    required: 'La ubicación es obligatoria',
                    minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                  })}
                  placeholder="PRODIMA Sede Central - 19 Calle Zona 11 Mariscal"
                  className={`w-full bg-slate-800 border rounded-lg p-2 text-slate-200 focus:outline-none transition ${
                    errors.ubicacion ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'
                  }`}
                />
                {errors.ubicacion && (
                  <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.ubicacion.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Proveedor / Distribuidor <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('proveedor', {
                      required: 'El proveedor es obligatorio',
                      minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                    })}
                    placeholder="PRODIMA Guatemala"
                    className={`w-full bg-slate-800 border rounded-lg p-2 text-slate-200 focus:outline-none transition ${
                      errors.proveedor ? 'border-red-500 bg-red-500/5 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {errors.proveedor && (
                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.proveedor.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Fecha Adquisición <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('fecha_adquisicion', { required: 'La fecha es obligatoria' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Observaciones y Especificaciones Técnicas</label>
                <textarea
                  rows={2}
                  {...register('observaciones')}
                  placeholder="Detalles sobre accesorios, calibración o notas..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                ></textarea>
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
                  {isSubmitting ? 'Guardando...' : (editingMaquina ? 'Guardar Cambios' : 'Registrar Máquina')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {maquinaToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">¿Eliminar máquina del inventario?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  <span className="font-mono font-bold text-amber-400">{maquinaToDelete.codigo_interno}</span>: {maquinaToDelete.marca} {maquinaToDelete.modelo}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-800">
              Puedes eliminar definitivamente este equipo o darlo de baja en el sistema.
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setMaquinaToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await onDarDeBaja(maquinaToDelete.id);
                    setMaquinaToDelete(null);
                  } catch (err: any) {
                    alert(`Error: ${err.message}`);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold"
              >
                Dar de Baja
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    if (onEliminar) {
                      await onEliminar(maquinaToDelete.id, true);
                    } else {
                      await onDarDeBaja(maquinaToDelete.id);
                    }
                    setMaquinaToDelete(null);
                  } catch (err: any) {
                    alert(`Error: ${err.message}`);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-lg shadow-red-600/20"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar Definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
