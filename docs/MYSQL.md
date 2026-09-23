# Conexión MySQL

El backend Express utiliza MySQL mediante mysql2. Cada entidad tiene su propia tabla; las operaciones se confirman en una transacción antes de responder a la interfaz. Los datos se leen de MySQL para cada petición. No se usa JSON como almacenamiento ni se cargan datos de ejemplo al iniciar.

## Preparación

Desde la carpeta principal del proyecto:

```powershell
npm.cmd install
npm.cmd run db:check
```

La conexión se configura en `.env`: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`. Las credenciales son exclusivas del backend y este archivo está excluido de Git.

El servidor MySQL debe estar encendido. El usuario de configuración necesita permisos para crear la base y sus tablas. El puerto de MySQL es 3306; el sitio web utiliza 3000.

## Crear la base y migrar los datos actuales

Detén cualquier instancia anterior del servidor que todavía utilice JSON.

```powershell
npm.cmd run db:init
npm.cmd run db:validate
npm.cmd run db:migrate -- --remove-source
npm.cmd run dev
```

`db:init` ejecuta `backend/database/schema.sql`, sin borrar tablas ni cargar ejemplos. El esquema está destinado a una base nueva; no modifica automáticamente tablas de versiones anteriores.

`db:validate` revisa el archivo de origen sin conectarse a MySQL. `db:migrate` requiere las tablas de negocio vacías, importa en una transacción y verifica los valores guardados. Si falla la importación, se revierte la transacción y se conserva el archivo.

La opción `--remove-source` elimina únicamente `backend/data/db.json`, después de comprobar la importación y que el archivo no cambió durante ella. Si se interrumpe después de confirmar los datos, verifica la base antes de volver a importar: el comando rechaza destinos con registros.

Los números de serie y fechas de adquisición desconocidos se guardan como NULL. Las contraseñas heredadas se convierten a hashes scrypt. La contraseña del usuario MySQL no es la del login de la aplicación.

La bitácora utiliza `fecha`, `direccion_ip` y `descripcion`. La migración sigue aceptando los nombres antiguos del JSON, pero la API entrega únicamente los campos actuales.

Abre http://localhost:3000. `/api/health` comprueba la disponibilidad de MySQL.

## Comprobaciones

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Las pruebas unitarias cubren conversión, contraseñas y transacciones simuladas. La conexión, el esquema y la persistencia deben verificarse también contra MySQL real.

## Límites actuales

Para conservar las reglas de negocio existentes, cada petición carga los registros dentro de una transacción y bloquea una fila de coordinación. Es adecuado para este sistema pequeño; antes de escalar se deben sustituir estas lecturas por consultas específicas.

La autenticación utiliza sesiones en memoria y las rutas aplican permisos por rol y alcance del técnico. Consulta las condiciones de despliegue en el [README](../README.md).

## Esquema mínimo

El esquema contiene las nueve tablas usadas por la aplicación y `app_lock`, necesaria para coordinar las transacciones. Los roles se guardan en `usuarios.rol`; los permisos se resuelven en el servidor y los reportes se generan desde los datos existentes. No se necesitan tablas independientes de roles, permisos ni reportes.

Se eliminaron del esquema los índices duplicados de campos `UNIQUE` y las columnas `fecha_registro` que la aplicación no consulta. Estos cambios se aplican a bases nuevas: `db:init` no elimina tablas, columnas ni registros de bases existentes.
