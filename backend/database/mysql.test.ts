import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../modulos/autenticacion/passwords.js';
import { pool, emptyData, persistData, transaction, toSqlValue } from './conexion.js';
import { withDatabase } from './transaccion-http.js';
import { db, IndustrialDatabase } from './operaciones.js';

test('las contraseñas se almacenan como hash y se comprueban', () => {
  const hash = hashPassword('ClaveDePrueba123!');
  assert.notEqual(hash, 'ClaveDePrueba123!');
  assert.ok(verifyPassword('ClaveDePrueba123!', hash));
  assert.equal(verifyPassword('incorrecta', hash), false);
  assert.equal(verifyPassword('', hash), false);
  assert.equal(verifyPassword('ClaveDePrueba123!', 'hash-invalido'), false);
});

test('fechas desconocidas y números de serie vacíos se guardan como NULL', () => {
  assert.equal(toSqlValue('fecha_adquisicion', ''), null);
  assert.equal(toSqlValue('numero_serie', ''), null);
  assert.equal(toSqlValue('fecha', '2026-09-17T18:30:00.123Z'), '2026-09-17 18:30:00.123');
  assert.throws(() => toSqlValue('fecha_inicio', '2026-02-30'));
});

test('crear mantenimiento resuelve contrato y reasignación sin operaciones adicionales del cliente', () => {
  const data = emptyData();
  data.tecnicos = [
    { id: 1, nombre: 'Ana', apellido: 'Uno', estado: 'Activo', homologado: true },
    { id: 2, nombre: 'Luis', apellido: 'Dos', estado: 'Activo', homologado: true },
  ] as any;
  data.maquinas = [{ id: 1, codigo_interno: 'M-1', estado: 'Asignada' }] as any;
  data.asignaciones = [{ id: 1, maquina_id: 1, tecnico_id: 1, estado: 'Activa' }] as any;
  data.contratos = [{ id: 1, maquina_id: 1, numero_contrato: 'C-1', proveedor: 'Proveedor contrato', estado: 'Vigente', fecha_fin: '2999-12-31' }] as any;
  const database = new IndustrialDatabase(data);
  const mantenimiento = database.crearMantenimiento({ maquina_id: 1, tecnico_id: 2, tecnico_responsable: 'Luis Dos', descripcion: 'Revisión', costo: 25 }, '127.0.0.1', 'admin');
  assert.equal(mantenimiento.proveedor, 'Proveedor contrato');
  assert.match(mantenimiento.observaciones!, /C-1/);
  assert.equal(data.asignaciones[0].estado, 'Finalizada');
  assert.equal(data.asignaciones.filter(a => a.estado === 'Activa').length, 1);
  assert.equal(data.asignaciones.find(a => a.estado === 'Activa')!.tecnico_id, 2);
  assert.equal(data.maquinas[0].estado, 'En mantenimiento');
  assert.equal(data.historial.filter(h => h.tipo_evento === 'Mantenimiento').length, 1);

  database.crearMantenimiento({ maquina_id: 1, tecnico_id: 2, tecnico_responsable: 'Luis Dos' }, '127.0.0.1', 'admin');
  assert.equal(data.asignaciones.length, 2);

  data.contratos[0].fecha_fin = '2000-01-01';
  const sinContrato = database.crearMantenimiento({ maquina_id: 1, tecnico_id: 2, proveedor: 'Taller' }, '127.0.0.1', 'admin');
  assert.equal(sinContrato.proveedor, 'Taller');
  assert.match(sinContrato.observaciones!, /Sin contrato activo/);
});

test('los cambios usan parámetros SQL y dejan intactas las filas sin cambios', async () => {
  const before = emptyData();
  before.maquinas = [{ id: 1, marca: 'Miller' }] as any;
  const after = structuredClone(before);
  const calls: any[] = [];
  const connection = { execute: async (...args: any[]) => { calls.push(args); return []; } } as any;
  await persistData(connection, before, after);
  assert.equal(calls.length, 0);
  after.maquinas[0].marca = "O'Reilly; DROP TABLE usuarios";
  await persistData(connection, before, after);
  assert.equal(calls.length, 1);
  assert.ok(calls[0][0].startsWith('UPDATE'));
  assert.ok(!calls[0][0].includes("O'Reilly"));
  assert.ok(calls[0][1].includes("O'Reilly; DROP TABLE usuarios"));
});

test('un error de operación revierte la transacción y libera la conexión', async t => {
  const events: string[] = [];
  const connection = {
    beginTransaction: async () => { events.push('begin'); },
    query: async (sql: string) => { events.push(sql); return [sql.includes('app_lock') ? [{id:1}] : []]; },
    execute: async () => { events.push('write'); return []; },
    commit: async () => { events.push('commit'); },
    rollback: async () => { events.push('rollback'); },
    release: () => { events.push('release'); },
  };
  t.mock.method(pool, 'getConnection', async () => connection as any);
  await assert.rejects(transaction(async () => { throw new Error('fallo'); }), /fallo/);
  assert.ok(events.some(event => event.includes('FOR UPDATE')));
  assert.ok(!events.includes('commit'));
  assert.ok(!events.includes('write'));
  assert.deepEqual(events.slice(-2), ['rollback','release']);
});

test('la API no responde éxito antes de que MySQL confirme; revierte respuestas 400', async t => {
  const events: string[] = [];
  const connection = {
    beginTransaction: async () => {},
    query: async (sql: string) => [sql.includes('app_lock') ? [{id:1}] : []],
    execute: async () => { events.push('write'); return []; },
    commit: async () => { events.push('commit'); },
    rollback: async () => { events.push('rollback'); },
    release: () => {},
  };
  t.mock.method(pool, 'getConnection', async () => connection as any);
  const response = { status: (_status: number) => response, json: (_body: unknown) => { events.push('response'); return response; } };
  await withDatabase((_req, res) => {
    db.registrarBitacora(1, 'admin', 'TEST', 'Sistema', null, '127.0.0.1', 'prueba');
    res.json({ok:true});
  })({ path: '/api/auth/login', headers: {} } as any, response as any, () => {});
  assert.deepEqual(events, ['write','commit','response']);
  events.length = 0;
  await withDatabase((_req, res) => {
    db.registrarBitacora(1, 'admin', 'TEST', 'Sistema', null, '127.0.0.1', 'prueba');
    res.status(400).json({error:'rechazado'});
  })({ path: '/api/auth/login', headers: {} } as any, response as any, () => {});
  assert.deepEqual(events, ['rollback','response']);
});
