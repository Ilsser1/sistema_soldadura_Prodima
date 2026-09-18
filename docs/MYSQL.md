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

El login ahora comprueba la contraseña, pero la autenticación y autorización del resto de las rutas siguen siendo las de la aplicación anterior. Esta migración de persistencia no implementa sesiones seguras ni permisos completos del servidor.
