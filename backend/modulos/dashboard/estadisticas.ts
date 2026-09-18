import type { Mantenimiento } from '../../../shared/types';

export function mantenimientosFinalizadosPorMes(mantenimientos: Mantenimiento[], year: number) {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const resultado = meses.map(mes => ({ mes, cantidad: 0 }));

  for (const mantenimiento of mantenimientos) {
    if (mantenimiento.estado !== 'Finalizado') continue;
    const fecha = mantenimiento.fecha_fin?.slice(0, 10);
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) continue;
    const date = new Date(`${fecha}T00:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== fecha) continue;
    if (date.getUTCFullYear() !== year) continue;
    resultado[date.getUTCMonth()].cantidad += 1;
  }

  return resultado;
}
