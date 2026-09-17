import React, { useState } from 'react';
import { Alerta } from '../../../shared/types';
import {
  Bell,
  Trash2,
  Search,
  Check,
  ExternalLink
} from 'lucide-react';

interface AlertasViewProps {
  alertas: Alerta[];
  onMarkAsRead: (id: number) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onDeleteAll?: (soloLeidas?: boolean) => Promise<void>;
  onNavigate: (tab: any) => void;
}

export const AlertasView: React.FC<AlertasViewProps> = ({
  alertas,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('TODOS');
  const [typeFilter, setTypeFilter] = useState('TODOS');

  const filteredAlertas = (alertas || []).filter(a => {
    const matchesSearch =
      a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.mensaje.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'TODOS' || a.prioridad === priorityFilter;
    const matchesType = typeFilter === 'TODOS' || a.tipo === typeFilter;
    return matchesSearch && matchesPriority && matchesType;
  });

  const unreadCount = (alertas || []).filter(a => !a.leida).length;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Centro de Alertas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitoreo preventivo de vencimiento de contratos, mantenimientos urgentes y fallas mecánicas.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-4 h-4" /> Marcar Todo como Leído ({unreadCount})
            </button>
          )}
          {alertas && alertas.length > 0 && onDeleteAll && (
            <button
              onClick={() => onDeleteAll(false)}
              className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              title="Borrar todas las notificaciones"
            >
              <Trash2 className="w-4 h-4" /> Borrar Todas ({alertas.length})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar en el contenido de alertas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 shrink-0">Prioridad:</span>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todas las Prioridades</option>
            <option value="Crítica">Crítica</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 shrink-0">Tipo:</span>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todos los Tipos</option>
            <option value="Contrato por Vencer">Contrato por Vencer</option>
            <option value="Mantenimiento Próximo">Mantenimiento Próximo</option>
            <option value="Máquina Fuera de Servicio">Máquina Fuera de Servicio</option>
            <option value="Mantenimiento Prolongado">Mantenimiento Prolongado</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlertas.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
            No se encontraron alertas en la bandeja actual.
          </div>
        ) : (
          filteredAlertas.map(a => (
            <div
              key={a.id}
              className={`p-4 rounded-2xl border transition shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                !a.leida
                  ? 'bg-slate-900 border-amber-500/40 border-l-4 border-l-amber-500'
                  : 'bg-slate-900/60 border-slate-800 opacity-75'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    a.prioridad === 'Crítica' ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' :
                    a.prioridad === 'Alta' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {a.prioridad}
                  </span>
                  <span className="text-xs font-bold text-slate-200">{a.titulo}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(a.fecha_generacion).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{a.mensaje}</p>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto text-xs">
                {a.modulo_origen && (
                  <button
                    onClick={() => onNavigate(a.modulo_origen)}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 font-semibold text-xs flex items-center gap-1"
                  >
                    Ver en Módulo <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                {!a.leida && (
                  <button
                    onClick={() => onMarkAsRead(a.id)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                    title="Marcar como leída"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                  </button>
                )}

                <button
                  onClick={() => onDelete(a.id)}
                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30"
                  title="Eliminar alerta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
