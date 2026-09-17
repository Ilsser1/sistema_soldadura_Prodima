import React, { useState } from 'react';
import { Bitacora, RolUsuario } from '../../../shared/types';
import {
  ShieldCheck,
  Search,
  Shield
} from 'lucide-react';

interface BitacoraViewProps {
  bitacora: Bitacora[];
  currentRole: RolUsuario;
}

export const BitacoraView: React.FC<BitacoraViewProps> = ({
  bitacora,
  currentRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('TODOS');
  const [actionFilter, setActionFilter] = useState('TODOS');

  if (currentRole !== 'Administrador') {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">Acceso Restringido</h3>
        <p className="text-xs mt-1 text-slate-400">
          La consulta de la bitácora de auditoría y seguridad del sistema es exclusiva del rol <span className="text-amber-400 font-bold">Administrador</span>.
        </p>
      </div>
    );
  }

  const filteredBitacora = (bitacora || []).filter(b => {
    const detallesText = b.detalles || b.descripcion || '';
    const ipText = b.ip_address || b.direccion_ip || '';
    const matchesSearch =
      detallesText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.usuario_nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ipText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'TODOS' || b.modulo === moduleFilter;
    const matchesAction = actionFilter === 'TODOS' || b.accion === actionFilter;
    return matchesSearch && matchesModule && matchesAction;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Bitácora de Auditoría y Eventos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro cronológico inalterable de modificaciones, accesos de usuarios, asignaciones y mantenimientos.
          </p>
        </div>
        <div className="px-3.5 py-1.5 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-300 font-mono">
          Total Eventos: <span className="text-amber-400 font-bold">{bitacora.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por detalle, usuario o IP..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 shrink-0">Módulo:</span>
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todos los Módulos</option>
            <option value="Autenticación">Autenticación</option>
            <option value="Usuarios">Usuarios</option>
            <option value="Técnicos">Técnicos</option>
            <option value="Máquinas">Máquinas</option>
            <option value="Asignaciones">Asignaciones</option>
            <option value="Mantenimientos">Mantenimientos</option>
            <option value="Contratos">Contratos</option>
            <option value="Alertas">Alertas</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 shrink-0">Acción:</span>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todas las Acciones</option>
            <option value="Inicio de Sesión">Inicio de Sesión</option>
            <option value="Creación">Creación</option>
            <option value="Actualización">Actualización</option>
            <option value="Asignación">Asignación</option>
            <option value="Devolución">Devolución</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Desactivación">Desactivación</option>
            <option value="Eliminación">Eliminación</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-3">ID / Fecha Hora</th>
                <th className="p-3">Usuario Responsable</th>
                <th className="p-3">Módulo</th>
                <th className="p-3">Acción</th>
                <th className="p-3">Detalle del Evento</th>
                <th className="p-3 font-mono">Dirección IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredBitacora.map(b => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3">
                    <span className="font-mono text-amber-400 font-bold block">#{b.id}</span>
                    <span className="text-[10px] text-slate-500">{new Date(b.fecha_hora || b.fecha || Date.now()).toLocaleString()}</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-200">
                    {b.usuario_nombre}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {b.modulo}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      b.accion.includes('Creación') ? 'bg-emerald-500/20 text-emerald-400' :
                      b.accion.includes('Asignación') ? 'bg-cyan-500/20 text-cyan-400' :
                      b.accion.includes('Devolución') ? 'bg-indigo-500/20 text-indigo-400' :
                      b.accion.includes('Mantenimiento') ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {b.accion}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 max-w-md">
                    {b.detalles || b.descripcion}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    {b.ip_address || b.direccion_ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
