import type { DatabaseData } from '../../database/operaciones.js';
export function technicianScope(data: DatabaseData, userId: number): DatabaseData {
  const tecnicos = data.tecnicos.filter(t => t.usuario_id === userId);
  const technicianIds = new Set(tecnicos.map(t => t.id));
  const asignaciones = data.asignaciones.filter(a => technicianIds.has(a.tecnico_id));
  const machineIds = new Set(asignaciones.filter(a => a.estado === 'Activa').map(a => a.maquina_id));
  const mantenimientos = data.mantenimientos.filter(m => m.tecnico_id != null && technicianIds.has(m.tecnico_id));
  const contratos = data.contratos.filter(c => machineIds.has(c.maquina_id));
  const ids = (items: { id: number }[]) => new Set(items.map(item => item.id));
  const records: Record<string, Set<number>> = {
    maquinas: machineIds, asignaciones: ids(asignaciones), mantenimientos: ids(mantenimientos), contratos: ids(contratos), tecnicos: technicianIds
  };
  const alertas = data.alertas.filter(a => {
    const module = (a.modulo || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return a.registro_id != null && records[module]?.has(a.registro_id);
  });
  return { usuarios: data.usuarios.filter(u => u.id === userId), tecnicos, asignaciones,
    maquinas: data.maquinas.filter(m => machineIds.has(m.id)), mantenimientos, contratos, alertas,
    historial: [], bitacora: [] };
}
