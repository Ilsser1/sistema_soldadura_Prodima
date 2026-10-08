# Cómo ejecutar y comprobar el sistema

## Estado verificado el 8 de octubre de 2026

| Comprobación | Resultado |
| --- | --- |
| Node.js | Instalado en `C:\Program Files\nodejs`, versión observada 24.21.0; no estaba en el PATH de esta terminal. |
| Dependencias | Existía `node_modules`; no fue necesario reinstalar. |
| MySQL | Servicio `MySQL97` encendido. |
| `npm run lint` | Correcto: revisión TypeScript sin errores. |
| `npm test` | 11 pruebas aprobadas, cero fallos. |
| `npm run build` | Correcto: frontend y backend compilados en `dist`. |
| Advertencia de compilación | Un archivo principal supera 500 kB minimizados; no impidió compilar. |
| Conexión real | Conexión a Railway confirmada; base `gestion_tecnicos_soldadura` y sus diez tablas presentes. |
| Arranque | `npm.cmd start` inició correctamente en `http://localhost:3000`. |

Las pruebas comprueban hashes, fechas, reglas de mantenimiento, separación de datos, sesiones, parámetros SQL, reversión y cálculo mensual. Utilizan conexiones simuladas donde corresponde; no prueban conexión a MySQL real ni interacción completa en navegador.

El entorno restringido causó inicialmente errores de acceso de herramientas; pruebas y compilación funcionaron fuera de ese entorno. El intento inicial con MySQL local falló; posteriormente se configuró y verificó la conexión proporcionada a Railway.

## 1. Requisitos

Necesitas Node.js y npm, MySQL con un usuario autorizado y un navegador. Conserva `package-lock.json` para usar las versiones resueltas del proyecto. La ejecución validada de herramientas utilizó Node 24.21.0; el proyecto no declara una versión mínima en `package.json`.

Abre PowerShell en la carpeta del proyecto. Si no reconoce Node/npm, puedes configurar sólo esa terminal:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
node --version
npm.cmd --version
```

En PowerShell uso `npm.cmd` para evitar restricciones sobre el script `npm.ps1`.

## 2. Configuración local

Si `.env` no existe, copia el ejemplo:

```powershell
Copy-Item -LiteralPath .env.example -Destination .env
```

Si ya existe, edítalo sin sobrescribir su configuración. La configuración local utiliza Railway; el ejemplo omite la contraseña:

```dotenv
DB_HOST=iriguchi.proxy.rlwy.net
DB_PORT=22999
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_DE_MYSQL
DB_NAME=gestion_tecnicos_soldadura
PORT=3000
```

La contraseña de MySQL conecta el programa con la base. La contraseña de una cuenta de la aplicación sirve para iniciar sesión en las pantallas; son credenciales distintas. Guarda la contraseña de MySQL directamente en `.env`. Este archivo está excluido por `.gitignore`.

## 3. Instalar dependencias si faltan

```powershell
npm.cmd ci
```

Necesita acceso a internet si las bibliotecas no están disponibles localmente.

## 4. Verificar o preparar MySQL

Si la base ya existe:

```powershell
npm.cmd run db:check
```

Si la base aún no existe, crea primero las tablas:

```powershell
npm.cmd run db:init
npm.cmd run db:check
```

`db:init` crea base y tablas con `IF NOT EXISTS`; no borra registros ni carga ejemplos. Tampoco actualiza columnas de una tabla antigua cuyo esquema sea distinto. El usuario de MySQL necesita permisos adecuados.

`db:check` comprueba la conexión. El arranque también comprueba la fila de `app_lock`, por lo que no basta crear solamente una base vacía.

## 5. Resolver la primera cuenta

**Una base recién creada no contiene un administrador.** No hay un registro inicial ni una contraseña administradora predeterminada que permita entrar. La ficha `admin` de respaldo en `App.tsx` no crea una cuenta en MySQL ni autoriza acceso.

Si ya existen usuarios en MySQL, ingresa con una cuenta activa existente. Si tienes un respaldo JSON antiguo autorizado, consulta la migración del apartado siguiente. Si no existe ninguna cuenta, hace falta un procedimiento para crear el primer administrador con hash scrypt; el proyecto actual no incluye ese comando. No insertes una contraseña legible directamente en `password_hash`, porque la comprobación de login exige el formato de hash.

## 6. Migración de respaldo antiguo, sólo si existe

El archivo esperado es `backend/data/db.json`; no forma parte de los archivos de código presentes en esta revisión. La aplicación funciona con MySQL y no usa ese JSON como almacenamiento actual.

```powershell
npm.cmd run db:validate
npm.cmd run db:migrate
```

La validación revisa formato sin escribir. La migración exige que las nueve colecciones de destino estén vacías, conserva/verifica registros y transforma contraseñas cuando corresponde. No la ejecutes sobre una base utilizada como si fuera una actualización ordinaria. La opción `--remove-source` elimina el JSON tras verificar; no es necesaria para poner en marcha el sistema.

## 7. Ejecutar en desarrollo

```powershell
npm.cmd run dev
```

Mantén esa terminal abierta. Cuando indique `Server running on http://localhost:3000`, abre esa dirección. El frontend pasa por Express y Vite; no necesitas abrir un segundo servidor frontend.

Para detenerlo, presiona `Ctrl+C` en la terminal donde corre.

## 8. Ejecutar la versión compilada

```powershell
npm.cmd run build
npm.cmd start
```

`build` prepara archivos; `start` inicia el servidor de producción. Compilar correctamente no significa que MySQL esté configurado. No ejecutes desarrollo y producción al mismo tiempo en el mismo puerto.

Puedes comprobar salud en otra terminal:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/health
```

Con servicio y base disponibles devuelve `status: ok` y `database: mysql`. Después verifica login y una consulta de datos en el navegador.

## 9. Comandos disponibles

| Comando | Uso |
| --- | --- |
| `npm.cmd run dev` | Desarrollo. |
| `npm.cmd run lint` | Revisa tipos; no es una evaluación completa de estilo. |
| `npm.cmd test` | Ejecuta las pruebas existentes. |
| `npm.cmd run build` | Compila interfaz y servidor. |
| `npm.cmd start` | Ejecuta la compilación en producción. |
| `npm.cmd run clean` | Elimina `dist`, después hará falta compilar de nuevo. |
| `npm.cmd run db:check` | Comprueba conexión MySQL. |
| `npm.cmd run db:init` | Crea base y tablas si faltan. |
| `npm.cmd run db:validate` | Valida el JSON antiguo, si existe. |
| `npm.cmd run db:migrate` | Importa ese JSON a una base vacía. |

## 10. Problemas frecuentes

| Mensaje o síntoma | Qué revisar |
| --- | --- |
| `node` o `npm` no reconocido | PATH de Node o ruta de instalación. |
| `ER_ACCESS_DENIED_ERROR` | Usuario, contraseña y autorización de MySQL. |
| `ECONNREFUSED` o `ETIMEDOUT` | Servicio, host, puerto y acceso permitido a MySQL. |
| Base desconocida | `DB_NAME` y ejecución de `db:init`. |
| Tabla inexistente o petición de `db:init` | Esquema y fila de `app_lock`. |
| Puerto ocupado / `EADDRINUSE` | Otro proceso ya utiliza 3000; cambia `PORT` o detén el servidor anterior. |
| Credenciales inválidas en pantalla | Cuenta de aplicación activa, hash válido y contraseña correcta. |
| Sesión expirada tras reinicio | Los tokens se guardan en memoria; inicia sesión otra vez. |
| `ENOENT` al migrar | No existe `backend/data/db.json`; no es requisito para el funcionamiento normal. |
| El técnico no ve un equipo | Cuenta vinculada, asignación activa y técnico correcto. |

## 11. Qué no se modificó en esta revisión

Se escribió documentación, se configuró `.env` para Railway y se generó `dist` al compilar. No se corrigieron reglas del programa, no se inicializaron tablas, no se migraron registros y no se ejecutó la limpieza de datos. El servidor inició conectado a la base existente. No se verificó el inicio de sesión de una cuenta de la aplicación.
