import React, { useState } from 'react';
import { ContratoMantenimiento, Maquina, EstadoContrato, RolUsuario } from '../../../shared/types';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  X,
  FileWarning,
  FileX,
  Shield
} from 'lucide-react';

interface ContratosViewProps {
  contratos: ContratoMantenimiento[];
  maquinas: Maquina[];
  onCrear: (c: Partial<ContratoMantenimiento>) => Promise<void>;
  onActualizar: (id: number, c: Partial<ContratoMantenimiento>) => Promise<void>;
  isReadOnly?: boolean;
  currentRole?: RolUsuario;
}

export const ContratosView: React.FC<ContratosViewProps> = ({
  contratos,
  maquinas,
  onCrear,
  onActualizar,
  isReadOnly = false,
  currentRole = 'Administrador'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<ContratoMantenimiento | null>(null);

  const [formData, setFormData] = useState({
    maquina_id: maquinas.length > 0 ? maquinas[0].id : 1,
    proveedor: 'Miller Latin America Services',
    numero_contrato: `CTR-2026-${String(contratos.length + 1).padStart(3, '0')}`,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    costo: 12500,
    tipo_servicio: 'Mantenimiento Preventivo Semestral con Repuestos Originales',
    condiciones: 'Garantía extendida por 12 meses. Visitas bimensuales de revisión.',
    estado: 'Vigente' as EstadoContrato,
    observaciones: 'Contrato firmado con cláusula de atención prioritaria.'
  });

  const effectiveReadOnly = isReadOnly || currentRole === 'Técnico';

  const filteredContratos = (contratos || []).filter(c => {
    const matchesSearch =
      (c.numero_contrato || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.proveedor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.maquina_codigo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || c.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (contrato: ContratoMantenimiento) => {
    if (contrato.estado === 'Vencido') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1">
          <FileX className="w-3.5 h-3.5" /> Contrato VENCIDO
        </span>
      );
    }
    if (contrato.estado === 'Próximo a vencer') {
      const isUrgent = (contrato.dias_restantes || 30) <= 7;
      return (
        <span className={`px-2.5 py-1 text-xs font-bold rounded border flex items-center gap-1 ${
          isUrgent ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
        }`}>
          <FileWarning className="w-3.5 h-3.5" /> {contrato.mensaje_vencimiento}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5" /> Vigente ({contrato.dias_restantes} días)
      </span>
    );
  };

  const handleOpenModal = (c?: ContratoMantenimiento) => {
    if (c) {
      setEditingContrato(c);
      setFormData({
        maquina_id: c.maquina_id,
        proveedor: c.proveedor,
        numero_contrato: c.numero_contrato,
        fecha_inicio: c.fecha_inicio,
        fecha_fin: c.fecha_fin,
        costo: c.costo,
        tipo_servicio: c.tipo_servicio,
        condiciones: c.condiciones,
        estado: c.estado,
        observaciones: c.observaciones || ''
      });
    } else {
      setEditingContrato(null);
      setFormData({
        maquina_id: maquinas.length > 0 ? maquinas[0].id : 1,
        proveedor: 'Lincoln Electric Guatemala',
        numero_contrato: `CTR-LE-2026-${String(contratos.length + 1).padStart(3, '0')}`,
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0],
        costo: 14500,
        tipo_servicio: 'Garantía Extendida Anual y Calibración Certificada ISO',
        condiciones: 'Visitas técnicas bimestrales e insumos libres de costo.',
        estado: 'Vigente',
        observaciones: 'Registro de nuevo contrato.'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContrato) {
        await onActualizar(editingContrato.id, formData);
      } else {
        await onCrear(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Contratos de Mantenimiento
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Control de vigencias, proveedores de servicio y alertas preventivas de vencimiento.
          </p>
        </div>
        {!effectiveReadOnly && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" /> Registrar Contrato
          </button>
        )}
      </div>

      {effectiveReadOnly && (
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
          Vista restringida: Se muestran las garantías y contratos vigentes de las máquinas asignadas.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por número de contrato, proveedor o máquina..."
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
            <option value="Vigente">Vigente</option>
            <option value="Próximo a vencer">Próximo a vencer</option>
            <option value="Vencido">Vencido</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContratos.map(c => (
          <div key={c.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="font-mono text-xs font-extrabold text-amber-400">{c.numero_contrato}</span>
                  <h3 className="font-bold text-sm text-slate-100 mt-0.5">{c.proveedor}</h3>
                </div>
                {getStatusBadge(c)}
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <p className="text-slate-400">
                  Máquina Asociada: <span className="text-slate-200 font-bold font-mono">{c.maquina_codigo}</span>
                </p>
                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-800 text-[11px]">
                  <span className="text-slate-400 font-semibold block">Tipo de Servicio:</span>
                  <span className="text-slate-200">{c.tipo_servicio}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block">Vigencia Desde:</span>
                    <span className="text-slate-300">{c.fecha_inicio}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Vence El:</span>
                    <span className="text-slate-300 font-bold">{c.fecha_fin}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-emerald-400 font-extrabold text-sm">
                Q{c.costo.toFixed(2)} GTQ
              </span>

              {!effectiveReadOnly && (
                <button
                  onClick={() => handleOpenModal(c)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-semibold text-xs"
                >
                  Editar Contrato
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">
                {editingContrato ? 'Editar Contrato de Mantenimiento' : 'Registrar Nuevo Contrato'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Máquina de Soldar Asociada</label>
                <select
                  required
                  value={formData.maquina_id}
                  onChange={e => setFormData({ ...formData, maquina_id: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                >
                  {maquinas.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.codigo_interno || `M-${m.id}`}] {m.marca} {m.modelo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Número de Contrato</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_contrato}
                    onChange={e => setFormData({ ...formData, numero_contrato: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Proveedor / Empresa</label>
                  <input
                    type="text"
                    required
                    value={formData.proveedor}
                    onChange={e => setFormData({ ...formData, proveedor: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Fecha Inicio</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_inicio}
                    onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Fecha Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_fin}
                    onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tipo de Servicio Ofrecido</label>
                <input
                  type="text"
                  required
                  value={formData.tipo_servicio}
                  onChange={e => setFormData({ ...formData, tipo_servicio: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Costo Anual / Total (Quetzales GTQ)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.costo}
                  onChange={e => setFormData({ ...formData, costo: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Condiciones del Contrato</label>
                <textarea
                  rows={2}
                  value={formData.condiciones}
                  onChange={e => setFormData({ ...formData, condiciones: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                >
                  {editingContrato ? 'Guardar Cambios' : 'Registrar Contrato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
