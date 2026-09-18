import { config } from 'dotenv';
import mysql, { type PoolConnection, type RowDataPacket } from 'mysql2/promise';
import path from 'node:path';
import { hashPassword } from './passwords.js';
import type { DatabaseData } from './db.js';

config({ path: path.resolve(process.cwd(), '.env'), quiet: true });
export const databaseName = process.env.DB_NAME || 'gestion_tecnicos_soldadura';
if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) throw new Error('DB_NAME inválido.');
export const connectionOptions = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: databaseName,
  charset: 'utf8mb4', timezone: 'Z', dateStrings: true, decimalNumbers: true,
  connectTimeout: 5000,
};
export const pool = mysql.createPool({ ...connectionOptions, connectionLimit: 5 });

export const tables = {
  usuarios: { table: 'usuarios', columns: 'id nombre apellido correo username password rol estado fecha_creacion ultimo_acceso' },
  tecnicos: { table: 'tecnicos', columns: 'id nombre apellido DPI telefono correo especialidad puesto fecha_ingreso estado usuario_id homologado' },
  maquinas: { table: 'maquinas', columns: 'id codigo_interno marca modelo numero_serie tipo voltaje amperaje potencia ubicacion fecha_adquisicion proveedor estado observaciones' },
  asignaciones: { table: 'asignaciones', columns: 'id tecnico_id maquina_id fecha_asignacion fecha_devolucion motivo estado usuario_responsable observaciones proyecto ubicacion' },
  mantenimientos: { table: 'mantenimientos', columns: 'id maquina_id tipo descripcion fecha_inicio fecha_fin costo proveedor tecnico_responsable tecnico_id usuario_id estado observaciones' },
  contratos: { table: 'contratos_mantenimiento', columns: 'id maquina_id proveedor numero_contrato fecha_inicio fecha_fin costo tipo_servicio condiciones estado observaciones' },
  alertas: { table: 'alertas', columns: 'id tipo titulo mensaje prioridad fecha_generacion leida registro_id modulo' },
  historial: { table: 'historial_maquinas', columns: 'id maquina_id tipo_evento descripcion usuario_responsable fecha observaciones titulo metadata' },
  bitacora: { table: 'bitacora', columns: 'id usuario_id usuario_nombre accion modulo registro_id fecha direccion_ip descripcion' },
} as const;
export const collectionNames = Object.keys(tables) as (keyof DatabaseData)[];
export const emptyData = (): DatabaseData => Object.fromEntries(collectionNames.map(name => [name, []])) as unknown as DatabaseData;
const dates = new Set(['fecha_ingreso','fecha_adquisicion','fecha_inicio','fecha_fin']);
const timestamps = new Set(['fecha_creacion','ultimo_acceso','fecha_asignacion','fecha_devolucion','fecha_generacion','fecha']);
const sqlColumn = (column: string) => column === 'password' ? 'password_hash' : column === 'metadata' ? 'metadata_json' : column;

export function toSqlValue(column: string, value: unknown): any {
  if (value === undefined || value === null || ((dates.has(column) || timestamps.has(column) || column === 'numero_serie') && value === '')) return null;
  if (dates.has(column) || timestamps.has(column)) {
    const input = String(value);
    const parsed = new Date(dates.has(column) ? input.slice(0, 10) + 'T00:00:00Z' : input.replace(' ', 'T') + (/Z$|[+-]\d\d:\d\d$/.test(input) ? '' : 'Z'));
    if (Number.isNaN(parsed.getTime())) throw new Error('Fecha inválida: ' + column);
    if (dates.has(column) && parsed.toISOString().slice(0, 10) !== input.slice(0, 10)) throw new Error('Fecha inválida: ' + column);
    return dates.has(column) ? parsed.toISOString().slice(0, 10) : parsed.toISOString().slice(0, 23).replace('T', ' ');
  }
  if (column === 'password') return /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(String(value)) ? value : hashPassword(String(value));
  if (column === 'metadata') return JSON.stringify(value);
  return value;
}

export async function readData(connection: PoolConnection): Promise<DatabaseData> {
  const data = emptyData();
  for (const name of collectionNames) {
    const definition = tables[name];
    const columns = definition.columns.split(' ');
    const [rows] = await connection.query<RowDataPacket[]>('SELECT ' + columns.map(c => '`' + sqlColumn(c) + '` AS `' + c + '`').join(',') + ' FROM `' + definition.table + '` ORDER BY id');
    const normalized = rows.map(row => {
      const result = { ...row };
      for (const column of timestamps) if (result[column]) result[column] = String(result[column]).replace(' ', 'T') + 'Z';
      for (const column of dates) if (column in result && result[column] === null) result[column] = '';
      if ('numero_serie' in result && result.numero_serie === null) result.numero_serie = '';
      if ('homologado' in result) result.homologado = Boolean(result.homologado);
      if ('leida' in result) result.leida = Boolean(result.leida);
      if (name === 'bitacora') Object.assign(result, { fecha_hora: result.fecha, ip_address: result.direccion_ip, detalles: result.descripcion });
      return result;
    });
    if (['bitacora','historial','alertas'].includes(name)) normalized.reverse();
    (data[name] as unknown[]) = normalized;
  }
  return data;
}

export async function persistData(connection: PoolConnection, before: DatabaseData, after: DatabaseData) {
  // Deletes run child-first; inserts run parent-first. Each request commits as a unit.
  for (const name of [...collectionNames].reverse()) {
    const kept = new Set(after[name].map(row => row.id));
    for (const row of before[name]) if (!kept.has(row.id)) await connection.execute('DELETE FROM `' + tables[name].table + '` WHERE id = ?', [row.id]);
  }
  for (const name of collectionNames) {
    const definition = tables[name];
    const columns = definition.columns.split(' ');
    const oldRows = new Map<number, any>(before[name].map(row => [row.id, row] as [number, any]));
    for (const row of after[name]) {
      const previous = oldRows.get(row.id);
      if (previous && columns.every(c => JSON.stringify(previous[c]) === JSON.stringify(row[c]))) continue;
      const values = columns.map(c => toSqlValue(c, row[c]));
      const fields = columns.map(c => '`' + sqlColumn(c) + '`');
      if (previous) {
        await connection.execute('UPDATE `' + definition.table + '` SET ' + fields.slice(1).map(c => c + ' = ?').join(',') + ' WHERE id = ?', [...values.slice(1), row.id]);
      } else {
        await connection.execute('INSERT INTO `' + definition.table + '` (' + fields.join(',') + ') VALUES (' + fields.map(() => '?').join(',') + ')', values);
      }
    }
  }
}

export async function transaction<T>(operation: (data: DatabaseData) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [lock] = await connection.query<RowDataPacket[]>('SELECT id FROM app_lock WHERE id = 1 FOR UPDATE');
    if (lock.length !== 1) throw new Error('Ejecute npm run db:init.');
    const data = await readData(connection);
    const before = structuredClone(data);
    const result = await operation(data);
    await persistData(connection, before, data);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function checkDatabase() {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM app_lock WHERE id = 1');
  if (rows.length !== 1) throw new Error('Ejecute npm run db:init.');
}

