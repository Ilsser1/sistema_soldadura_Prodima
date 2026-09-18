# Organizaci?n del proyecto

El proyecto conserva frontend y backend, organizados internamente por m?dulos del negocio.

## Carpetas principales

- frontend/src/modulos/: pantallas y llamadas a la API de cada m?dulo.
- frontend/src/components/: navegaci?n y componentes visuales compartidos.
- frontend/src/services/: cliente HTTP y agrupaci?n de las API.
- frontend/src/context/: estado compartido, como el tema visual.
- backend/modulos/: rutas de la API por m?dulo.
- backend/database/: conexi?n MySQL, esquema, comandos y operaciones de datos.
- backend/compartido/: utilidades compartidas del servidor.
- shared/: tipos usados por frontend y backend.
- docs/: documentaci?n del proyecto.
- scripts/: comandos de inicio y limpieza de archivos generados.

## M?dulos

Autenticaci?n, dashboard, usuarios, t?cnicos, m?quinas, asignaciones, mantenimientos, contratos, alertas, historial, bit?cora y reportes tienen sus propias carpetas. Sistema agrupa las operaciones generales y la comprobaci?n de conexi?n. Perfil tiene su pantalla en el frontend y utiliza las operaciones de usuarios y autenticaci?n.

## Ejemplo: m?quinas

- Pantalla: frontend/src/modulos/maquinas/MaquinasView.tsx
- Llamadas HTTP: frontend/src/modulos/maquinas/api.ts
- Rutas del servidor: backend/modulos/maquinas/rutas.ts

Las reglas y operaciones que afectan varias entidades siguen centralizadas en backend/database/operaciones.ts para conservar las transacciones y la coherencia de los datos.

frontend/src/App.tsx compone las pantallas. backend/modulos/index.ts re?ne las rutas y backend/server.ts inicia el servidor.

## Ejecutar y verificar

Desde la ra?z del proyecto:

```powershell
npm.cmd run dev
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Para configurar la base de datos, consulta [la gu?a MySQL](MYSQL.md).

## Acceso de tecnicos

El servidor vincula el usuario autenticado con tecnicos.usuario_id. No utiliza coincidencias de nombre o correo. Los tecnicos consultan sus asignaciones y las maquinas con asignacion activa; las alertas se seleccionan por modulo y registro_id. Sin vinculo, las listas quedan vacias. Los reportes y el dashboard usan el mismo alcance. Las operaciones administrativas quedan reservadas a Administrador y Supervisor; el tecnico puede leer y limpiar sus alertas.

Las sesiones duran ocho horas y se guardan en memoria del servidor: reiniciar el servidor requiere iniciar sesion nuevamente. Esta modalidad requiere una sola instancia; antes de desplegar varias replicas se debe implementar almacenamiento compartido de sesiones.
