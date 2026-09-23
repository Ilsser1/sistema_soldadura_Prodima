import React, { useState } from 'react';
import { Maquina, HistorialCompletoMaquina } from '../../../../shared/types';
import {
  History,
  Search,
  Wrench,
  FileText,
  Link2,
  Activity
} from 'lucide-react';

interface HistorialViewProps {
  maquinas: Maquina[];
  selectedMaquinaId: number | null;
  onSelectMaquina: (id: number) => void;
  historialData: HistorialCompletoMaquina | null;
  loading: boolean;
}

export const HistorialView: React.FC<HistorialViewProps> = ({
  maquinas,
  selectedMaquinaId,
  onSelectMaquina,
  historialData,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMaquinas = (maquinas || []).filter(m =>
    (m.codigo_interno || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.marca || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.modelo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.numero_serie || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMaquinaObj = (maquinas || []).find(m => m.id === selectedMaquinaId);
  const activeMachine = historialData?.maquina || selectedMaquinaObj;

  const asignaciones = historialData?.asignaciones || [];
  const mantenimientos = historialData?.mantenimientos || [];
  const contratos = historialData?.contratos || [];
  const bitacora = historialData?.bitacora || [];
  const eventos = historialData?.eventos || [];

  return (
    <div className="space-y-6">
      
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          Historial y Trazabilidad de Máquinas
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Línea de tiempo unificada: registro de adquisiciones, cambios de estado, asignaciones a técnicos, mantenimientos y contratos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            1. Seleccionar Máquina
          </h3>

          <div className="relative text-xs">
            <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar por código o serie..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredMaquinas.map(m => {
              const isSelected = m.id === selectedMaquinaId;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMaquina(m.id)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-slate-100 font-bold'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-amber-400">{m.codigo_interno || `M-${m.id}`}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {m.estado}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">
                    {m.marca} {m.modelo}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Serie: {m.numero_serie}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          {!selectedMaquinaId ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Seleccione una máquina de la lista de la izquierda para ver su historial unificado de vida útil.
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Cargando historial de trazabilidad de la máquina...
            </div>
          ) : (
            <div className="space-y-6">
              
              {activeMachine ? (
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-mono text-amber-400 font-extrabold text-sm block">
                      {activeMachine.codigo_interno || `M-${activeMachine.id}`}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      {activeMachine.marca} {activeMachine.modelo}
                    </h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Serie: {activeMachine.numero_serie} | Tipo: {activeMachine.tipo}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Estado: {activeMachine.estado}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Ubicación: {activeMachine.ubicacion}</p>
                  </div>
                </div>
              ) : null}

              <div className="relative border-l-2 border-slate-800 pl-6 space-y-6 ml-3">
                
                {asignaciones.map(a => (
                  <div key={`asig-${a.id}`} className="relative group">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-cyan-500 border-4 border-slate-900"></div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5" /> Asignación a Técnico: {a.tecnico_nombre}
                        </span>
                        <span className="text-[10px] text-slate-500">{new Date(a.fecha_asignacion).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-300">Motivo: {a.motivo}</p>
                      {a.fecha_devolucion ? (
                        <p className="text-[11px] text-emerald-400 font-semibold pt-1">
                          Devuelta el: {new Date(a.fecha_devolucion).toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-[11px] text-amber-400 font-bold pt-1">Actualmente en uso activo por el técnico</p>
                      )}
                    </div>
                  </div>
                ))}

                {mantenimientos.map(m => (
                  <div key={`maint-${m.id}`} className="relative group">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-slate-900"></div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5" /> Mantenimiento {m.tipo}: {m.descripcion}
                        </span>
                        <span className="text-[10px] text-slate-500">{m.fecha_inicio} al {m.fecha_fin}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Proveedor/Taller: {m.proveedor} ({m.tecnico_responsable})</span>
                        <span className="font-mono text-emerald-400 font-bold">Q{Number(m.costo || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {contratos.map(c => (
                  <div key={`ctr-${c.id}`} className="relative group">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-900"></div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Contrato Mantenimiento: {c.numero_contrato}
                        </span>
                        <span className="text-[10px] text-slate-500">{c.fecha_inicio} a {c.fecha_fin}</span>
                      </div>
                      <p className="text-xs text-slate-300">Proveedor: {c.proveedor} — {c.tipo_servicio}</p>
                    </div>
                  </div>
                ))}

                {bitacora.map(b => (
                  <div key={`bit-${b.id}`} className="relative group">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-purple-500 border-4 border-slate-900"></div>
                    <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800 text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-400">{b.accion}: {b.modulo}</span>
                        <span className="text-[10px] text-slate-500">{b.fecha ? new Date(b.fecha).toLocaleString() : (b.fecha || '')}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{b.descripcion}</p>
                      <span className="text-[10px] text-slate-500 block">Por usuario: {b.usuario_nombre}</span>
                    </div>
                  </div>
                ))}

                {eventos.map(e => (
                  <div key={`ev-${e.id}`} className="relative group">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-900"></div>
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-400 flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5" /> {e.tipo_evento}
                        </span>
                        <span className="text-[10px] text-slate-500">{e.fecha}</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{e.descripcion}</p>
                      <span className="text-[10px] text-slate-500 block">Responsable: {e.usuario_responsable}</span>
                    </div>
                  </div>
                ))}

                {asignaciones.length === 0 && mantenimientos.length === 0 && contratos.length === 0 && bitacora.length === 0 && eventos.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No hay registros de trazabilidad u operaciones registradas para esta máquina de soldar.
                  </div>
                )}

              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
