import { autenticacionApi } from '../modulos/autenticacion/api';
import { dashboardApi } from '../modulos/dashboard/api';
import { usuariosApi } from '../modulos/usuarios/api';
import { tecnicosApi } from '../modulos/tecnicos/api';
import { maquinasApi } from '../modulos/maquinas/api';
import { asignacionesApi } from '../modulos/asignaciones/api';
import { mantenimientosApi } from '../modulos/mantenimientos/api';
import { contratosApi } from '../modulos/contratos/api';
import { alertasApi } from '../modulos/alertas/api';
import { historialApi } from '../modulos/historial/api';
import { bitacoraApi } from '../modulos/bitacora/api';
import { reportesApi } from '../modulos/reportes/api';
import { sistemaApi } from '../modulos/sistema/api';

export const api = {
  ...autenticacionApi,
  ...dashboardApi,
  ...usuariosApi,
  ...tecnicosApi,
  ...maquinasApi,
  ...asignacionesApi,
  ...mantenimientosApi,
  ...contratosApi,
  ...alertasApi,
  ...historialApi,
  ...bitacoraApi,
  ...reportesApi,
  ...sistemaApi,
};
