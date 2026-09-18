import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import mysql from 'mysql2/promise';
import type { DatabaseData } from './operaciones.js';
import { connectionOptions, databaseName, pool, collectionNames, tables, emptyData, readData, persistData, toSqlValue } from './conexion.js';
import { verifyPassword } from '../modulos/autenticacion/passwords.js';

const sourcePath = path.resolve('backend/data/db.json');
const ignored: Record<string, string[]> = {
  tecnicos: ['usuario_username', 'maquinas_asignadas_count', 'mantenimientos_count'],
  maquinas: ['tecnico_actual'],
  asignaciones: ['tecnico_nombre', 'maquina_codigo', 'maquina_marca_modelo'],
  mantenimientos: ['maquina_codigo'],
  contratos: ['dias_restantes', 'mensaje_vencimiento', 'maquina_codigo'],
  bitacora: ['fecha_hora', 'ip_address', 'detalles'],
};
function normalize(source: unknown): DatabaseData {
  if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error('JSON inválido.');
  for (const key of Object.keys(source)) if (!collectionNames.includes(key as keyof DatabaseData)) throw new Error('Colección desconocida: ' + key);
  const result = emptyData();
  for (const name of collectionNames) {
    const rows = source[name];
    if (!Array.isArray(rows)) throw new Error('Falta la colección: ' + name);
    const ids = new Set<number>();
    result[name] = rows.map(original => {
      if (!original || typeof original !== 'object' || Array.isArray(original)) throw new Error('Registro inválido en ' + name);
      const row = { ...original };
      if (!Number.isSafeInteger(row.id) || row.id <= 0 || ids.has(row.id)) throw new Error('ID inválido o repetido en ' + name);
      ids.add(row.id);
      if (name === 'bitacora') {
        row.fecha ??= row.fecha_hora;
        row.direccion_ip ??= row.ip_address;
        row.descripcion ??= row.detalles;
      }
      for (const key of ignored[name] || []) delete row[key];
      if (name === 'tecnicos') row.homologado ??= true;
      const columns = tables[name].columns.split(' ');
      for (const key of Object.keys(row)) if (!columns.includes(key)) throw new Error('Campo sin columna: ' + name + '.' + key);
      for (const column of columns) toSqlValue(column, row[column]);
      return row;
    }) as any;
  }
  return result;
}
function verifyImported(source: DatabaseData, stored: DatabaseData) {
  for (const name of collectionNames) {
    if (source[name].length !== stored[name].length) throw new Error('Conteo incorrecto: ' + name);
    for (const expected of source[name]) {
      const actual: any = stored[name].find(row => row.id === expected.id);
      if (!actual) throw new Error('Registro ausente: ' + name);
      for (const column of tables[name].columns.split(' ')) {
        if (column === 'password') {
          if (!(String(expected[column]).startsWith('scrypt$') ? expected[column] === actual[column] : verifyPassword(expected[column], actual[column]))) throw new Error('Credencial no conservada.');
        } else if (JSON.stringify(toSqlValue(column, expected[column])) !== JSON.stringify(toSqlValue(column, actual[column]))) {
          throw new Error('Verificación fallida en ' + name + '.' + column + ', id ' + expected.id);
        }
      }
    }
  }
}
async function main() {
  const command = process.argv[2];
  if (command === 'check') {
    const [rows] = await pool.query('SELECT VERSION() AS version, DATABASE() AS base');
    console.log('Conexión MySQL correcta:', rows);
  } else if (command === 'init') {
    const connection = await mysql.createConnection({ ...connectionOptions, database: undefined });
    try {
      const schema = (await fs.readFile(path.resolve('backend/database/schema.sql'), 'utf8'))
        .replaceAll('gestion_tecnicos_soldadura', databaseName)
        .replace(/^--.*$/gm, '');
      for (const statement of schema.split(';').map(s => s.trim()).filter(Boolean)) await connection.query(statement);
      console.log('Base y tablas creadas. No se borraron tablas ni se cargaron ejemplos.');
    } finally { await connection.end(); }
  } else if (command === 'validate' || command === 'migrate') {
    const raw = await fs.readFile(sourcePath);
    const source = normalize(JSON.parse(raw.toString('utf8').replace(/^\uFEFF/, '')));
    console.log('Registros:', Object.fromEntries(collectionNames.map(name => [name, source[name].length])));
    if (command === 'validate') { console.log('Formato validado sin escribir en MySQL.'); return; }
    const connection = await pool.getConnection();
    let committed = false;
    try {
      await connection.beginTransaction();
      const [lock]: any = await connection.query('SELECT id FROM app_lock WHERE id = 1 FOR UPDATE');
      if (lock.length !== 1) throw new Error('Ejecute db:init primero.');
      const existing = await readData(connection);
      if (collectionNames.some(name => existing[name].length > 0)) throw new Error('La base de destino debe estar vacía. No se sobrescribió ningún registro.');
      await persistData(connection, emptyData(), source);
      verifyImported(source, await readData(connection));
      await connection.commit();
      committed = true;
      verifyImported(source, await readData(connection));
      console.log('Importación confirmada y verificada en MySQL.');
      if (process.argv.includes('--remove-source')) {
        const current = await fs.readFile(sourcePath);
        const digest = (value: Buffer) => createHash('sha256').update(value).digest('hex');
        if (digest(raw) !== digest(current)) throw new Error('El JSON cambió durante la migración; se conserva el archivo.');
        await fs.unlink(sourcePath);
        console.log('Eliminado backend/data/db.json tras verificar MySQL.');
      }
    } catch (error) {
      if (!committed) await connection.rollback();
      throw error;
    } finally { connection.release(); }
  } else {
    throw new Error('Use check, init, validate o migrate [--remove-source].');
  }
}
main().catch(error => {
  if (error.code) console.error('No se completó la operación:', error.code, 'Revise MySQL, .env y los permisos del usuario.');
  else console.error(error.message);
  process.exitCode = 1;
}).finally(() => pool.end());
