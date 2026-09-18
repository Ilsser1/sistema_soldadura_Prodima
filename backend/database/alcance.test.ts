import test from 'node:test';
import assert from 'node:assert/strict';
import { technicianScope } from '../modulos/autenticacion/alcance.js';
import { createSession, sessionUserId, revokeSession } from '../modulos/autenticacion/sesiones.js';
import { emptyData, pool, tables } from './conexion.js';
import { withDatabase } from './transaccion-http.js';
import { db } from './operaciones.js';

function fixture() {
 const data = emptyData();
 data.usuarios = [{id: 10, estado: 'Activo', rol: 'T?cnico', username: 'uno'}, {id: 20, estado: 'Activo', rol: 'Administrador', username:'admin'}] as any;
 data.tecnicos = [{id: 1, usuario_id: 10, nombre: 'Juan'}, {id: 2, usuario_id: 11, nombre: 'Juan'}] as any;
 data.maquinas = [{id: 1}, {id: 2}, {id: 3}] as any;
 data.asignaciones = [{id: 1, tecnico_id: 1, maquina_id: 1, estado: 'Activa'}, {id: 2, tecnico_id: 2, maquina_id: 2, estado:'Activa'}, {id: 3, tecnico_id: 1, maquina_id: 3, estado:'Finalizada'}] as any;
 data.alertas = [{id: 1, modulo: 'Maquinas', registro_id: 1, leida:false}, {id: 2, modulo:'Maquinas', registro_id: 2, leida:false}, {id: 3, titulo: 'Juan', mensaje:'maquina 1', leida:false}] as any;
 return data;
}
test('aisla IDs aunque los nombres coincidan; excluye maquinas devueltas y alertas sin relacion', () => {
 const scope = technicianScope(fixture(), 10);
 assert.deepEqual(scope.maquinas.map(x=>x.id), [1]);
 assert.deepEqual(scope.asignaciones.map(x=>x.id), [1,3]);
 assert.deepEqual(scope.alertas.map(x=>x.id), [1]);
 assert.equal(technicianScope(fixture(), 999).maquinas.length, 0);
});
test('sesiones no aceptan tokens simulados y se revocan al salir', () => {
 const token = createSession(10);
 const req = {headers:{authorization:'Bearer '+token}} as any;
 assert.equal(sessionUserId(req), 10);
 revokeSession(req);
 assert.equal(sessionUserId(req), undefined);
 assert.equal(sessionUserId({headers:{authorization:'Bearer jwt_token_simulado_20'}} as any), undefined);
});
test('API protege lectura y borrado masivo sin modificar registros ajenos', async t => {
 const data=fixture(); const writes: any[]=[];
 t.mock.method(pool, 'getConnection', async()=> ({
  beginTransaction:async()=>{}, commit:async()=>{}, rollback:async()=>{}, release:()=>{},
  query:async(sql:string)=> {
   if(sql.includes('app_lock')) return [[{id:1}]];
   const key = Object.keys(tables).find(k=>sql.includes('FROM '+String.fromCharCode(96)+(tables as any)[k].table+String.fromCharCode(96)));
   return [structuredClone(key ? (data as any)[key] : [])];
  },
  execute:async(...args:any[])=>{writes.push(args);return [];}
 }) as any);
 const token=createSession(10);
 async function call(method:string,path:string,handler:any, auth=token) {
  let status=200,body:any;
  const res={status:(s:number)=>{status=s;return res;},json:(b:any)=>{body=b;return res;}};
  await withDatabase(handler)({method,path,headers:{authorization:'Bearer '+auth,'x-user-role':'Administrador'}} as any,res as any,()=>{});
  return {status,body};
 }
 const own=await call('GET','/api/maquinas',(_q:any,r:any)=>r.json(db.getMaquinas()));
 assert.deepEqual(own.body.map((x:any)=>x.id),[1]);
 assert.equal((await call('GET','/api/maquinas',()=>assert.fail('unauthenticated handler'), 'fake')).status,401);
 assert.equal((await call('POST','/api/asignaciones',()=>assert.fail('write handler'))).status,403);
 assert.equal((await call('DELETE','/api/alertas',(_q:any,r:any)=>r.json(db.eliminarTodasAlertas(false)))).status,200);
 assert.equal(writes.length,1);
 assert.match(writes[0][0],/^DELETE FROM .alertas./);
 assert.deepEqual(writes[0][1],[1]);
 const admin=await call('GET','/api/maquinas',(_q:any,r:any)=>r.json(db.getMaquinas()),createSession(20));
 assert.equal(admin.body.length,3);
});
