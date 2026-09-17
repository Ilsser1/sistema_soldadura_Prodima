import assert from 'node:assert/strict';
import test from 'node:test';
import type { Mantenimiento } from '../shared/types';
import { mantenimientosFinalizadosPorMes } from './dashboard.ts';

const mantenimiento = (estado: Mantenimiento['estado'], fecha_fin: string): Mantenimiento => ({
  id: 1, maquina_id: 1, tipo: 'Preventivo', descripcion: '',
  fecha_inicio: '2025-12-01', fecha_fin, costo: 0, proveedor: '', tecnico_responsable: '', estado,
});

test('un catálogo vacío no produce actividad ficticia', () => {
  const meses = mantenimientosFinalizadosPorMes([], 2026);
  assert.equal(meses.length, 12);
  assert.ok(meses.every(mes => mes.cantidad === 0));
});

test('cuenta únicamente finalizados del año por fecha de fin, sin desplazar el mes', () => {
  const meses = mantenimientosFinalizadosPorMes([
    mantenimiento('Finalizado', '2026-01-01'),
    mantenimiento('Finalizado', '2026-01-31'),
    mantenimiento('Finalizado', '2026-12-31'),
    mantenimiento('Finalizado', '2025-12-31'),
    mantenimiento('Finalizado', '2027-01-01'),
    mantenimiento('Programado', '2026-01-01'),
    mantenimiento('En proceso', '2026-01-01'),
    mantenimiento('Finalizado', ''),
    mantenimiento('Finalizado', '2026-02-30'),
    mantenimiento('Finalizado', 'fecha inválida'),
  ], 2026);
  assert.equal(meses[0].cantidad, 2);
  assert.equal(meses[11].cantidad, 1);
  assert.equal(meses.reduce((total, mes) => total + mes.cantidad, 0), 3);
});
