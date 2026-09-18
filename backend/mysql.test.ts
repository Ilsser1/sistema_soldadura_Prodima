import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from './passwords.js';
import { pool, emptyData, persistData, transaction, toSqlValue } from './mysql.js';
import { withDatabase } from './http-db.js';
import { db } from './db.js';

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
  })({} as any, response as any, () => {});
  assert.deepEqual(events, ['write','commit','response']);
  events.length = 0;
  await withDatabase((_req, res) => {
    db.registrarBitacora(1, 'admin', 'TEST', 'Sistema', null, '127.0.0.1', 'prueba');
    res.status(400).json({error:'rechazado'});
  })({} as any, response as any, () => {});
  assert.deepEqual(events, ['rollback','response']);
});
