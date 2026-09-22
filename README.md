# Sistema de soldadura Prodima

Gestión de técnicos, máquinas, asignaciones y mantenimiento con React, Express y MySQL.

Configuración y comandos: [Guía MySQL](docs/MYSQL.md).

## Estructura

- frontend/src/modulos/: pantallas y llamadas a la API por módulo.
- frontend/src/components/, context/ y services/: componentes, tema y cliente HTTP.
- backend/modulos/: rutas, autenticación y permisos.
- backend/database/: conexión, esquema y operaciones transaccionales.
- shared/: tipos compartidos.
- scripts/: inicio en producción y limpieza de compilaciones.

Los técnicos acceden a sus registros mediante tecnicos.usuario_id. Administrador y Supervisor gestionan las operaciones administrativas. Las sesiones duran ocho horas y se almacenan en memoria: reiniciar el servidor requiere iniciar sesión nuevamente y el despliegue debe usar una sola instancia.
