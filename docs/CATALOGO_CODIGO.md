# Catálogo del código explicado

Consulta primero [el README](../README.md). Este catálogo conecta los nombres técnicos con las tareas que realizan.

## Funciones principales de `IndustrialDatabase`

Todas están en [backend/database/operaciones.ts](../backend/database/operaciones.ts). La clase recibe un conjunto de listas de datos. `get` significa consultar; `crear`, `actualizar` y `eliminar` indican operaciones sobre fichas. Los parámetros `usuario_ip` y `req_user` sirven para registrar el contexto de la acción.

| Función | Qué hace |
| --- | --- |
| `constructor` | Recibe las colecciones utilizadas durante una transacción. |
| `autenticar` | Busca usuario/correo activo y comprueba contraseña; devuelve ficha sin contraseña. |
| `registrarBitacora` | Agrega acción, actor, fecha, módulo, registro, IP y descripción. |
| `registrarHistorialMaquina` | Agrega un evento al expediente de una máquina. |
| `getUsuarios` | Lista cuentas sin sus contraseñas. |
| `getUsuarioById` | Busca una cuenta y omite su contraseña. |
| `crearUsuario` | Crea cuenta, evita username repetido y puede crear ficha técnica vinculada. |
| `actualizarUsuario` | Modifica cuenta y sincroniza ciertos datos del técnico vinculado. |
| `toggleEstadoUsuario` | Alterna activo/inactivo y sincroniza al técnico. |
| `getTecnicos` | Lista técnicos con username y conteos de equipos/servicios. |
| `getTecnicoById` | Busca un técnico con esos datos complementarios. |
| `crearTecnico` | Crea ficha y, salvo indicación contraria, cuenta de acceso. |
| `actualizarTecnico` | Modifica ficha y sincroniza o crea su cuenta. |
| `eliminarTecnico` | Elimina técnico y cuenta vinculada; finaliza entregas y desvincula referencias. |
| `getMaquinas` | Lista equipos y agrega el nombre del técnico actualmente asignado. |
| `getMaquinaById` | Busca una máquina. |
| `crearMaquina` | Crea equipo, genera código si falta y registra evento inicial. |
| `actualizarMaquina` | Cambia ficha; si cambia estado, agrega un evento de historial. |
| `eliminarMaquina` | Elimina equipo y sus asignaciones, servicios, contratos e historial. |
| `borrarTodo` | Vacía catálogos, alertas e historial/bitácora; conserva cuentas administradoras. |
| `getAsignaciones` | Agrega nombres de técnico y máquina a las entregas. |
| `crearAsignacion` | Valida técnico/equipo, impide doble asignación, cambia estado y registra trazabilidad. |
| `finalizarAsignacion` | Registra devolución, libera equipo y puede finalizar un mantenimiento en proceso. |
| `getMantenimientos` | Lista servicios y agrega identificación legible del equipo. |
| `crearMantenimiento` | Resuelve contrato/proveedor, estado, responsable, posible reasignación y registros. |
| `actualizarMantenimiento` | Modifica servicio; al finalizar, ajusta disponibilidad según asignación activa. |
| `eliminarMantenimiento` | Impide borrar el único servicio del equipo; revisa estado si no quedan pendientes. |
| `getContratos` | Calcula días restantes, estado, mensaje e identificación de máquina. |
| `crearContrato` | Registra contrato, revisa alertas y agrega bitácora. |
| `actualizarContrato` | Modifica contrato, revisa alertas y agrega bitácora. |
| `ejecutarRevisionAlertas` | Examina contratos, servicios programados y equipos fuera de servicio/baja. |
| `getAlertas` | Lista todos los avisos o sólo los no leídos. |
| `marcarAlertaLeida` | Marca un aviso como leído. |
| `marcarTodasAlertasLeidas` | Marca avisos y devuelve cuántos cambiaron. |
| `eliminarAlerta` | Elimina un aviso por ID. |
| `eliminarTodasAlertas` | Elimina todos o solamente los leídos. |
| `getHistorialPorMaquina` | Reúne ficha, asignaciones, servicios, contratos, eventos y bitácora del módulo Máquinas. |
| `getBitacora` | Devuelve las acciones registradas. |
| `getDashboardStats` | Calcula cantidades y agrupaciones usadas por el resumen. |

`dbContext` mantiene la instancia asociada a la operación en curso. `db` es un intermediario (`Proxy`) que dirige las llamadas a esa instancia. Así dos solicitudes no comparten accidentalmente la misma representación temporal de datos.

## Conexión, transacciones y comandos

| Archivo / función | Explicación |
| --- | --- |
| `server.ts` / `startServer` | Verifica MySQL, configura Express, conecta rutas y sirve interfaz de desarrollo o producción. |
| `conexion.ts` / `emptyData` | Construye nueve colecciones vacías. |
| `conexion.ts` / `sqlColumn` | Traduce `password` a `password_hash` y `metadata` a `metadata_json`. |
| `conexion.ts` / `toSqlValue` | Normaliza fechas, vacíos, metadatos y hashes antes de guardar. |
| `conexion.ts` / `readData` | Lee tablas, transforma fechas/booleanos y ordena ciertas listas. |
| `conexion.ts` / `persistData` | Compara antes/después; elimina, inserta o actualiza sólo lo necesario con parámetros SQL. |
| `conexion.ts` / `transaction` | Abre transacción, bloquea `app_lock`, lee, ejecuta, guarda y confirma; revierte si falla. |
| `conexion.ts` / `checkDatabase` | Comprueba que exista la fila auxiliar requerida. No revisa exhaustivamente cada tabla. |
| `transaccion-http.ts` / `withDatabase` | Verifica sesión/rol, filtra datos del técnico y retiene respuesta hasta confirmar. |
| `RejectedResponse` | Representa una respuesta rechazada que debe provocar reversión. |
| `cli.ts` / `normalize` | Revisa las colecciones del JSON antiguo, IDs y campos admitidos. |
| `cli.ts` / `verifyImported` | Compara los datos originales con lo importado, incluyendo credenciales. |
| `cli.ts` / `main` | Ejecuta conexión, creación de tablas, validación o migración. |
| `scripts/start.cjs` | Fija producción y carga `dist/backend/server.cjs`. |
| `scripts/clean.cjs` | Borra `dist`; no borra los datos de MySQL. |

`pool` administra hasta cinco conexiones. `tables` relaciona colecciones y columnas. En la persistencia se eliminan registros dependientes antes que sus padres y se insertan padres antes que dependientes.

## Autenticación y utilidades

| Archivo / función | Qué hace |
| --- | --- |
| `passwords.ts` / `hashPassword` | Genera hash scrypt con sal aleatoria. |
| `passwords.ts` / `verifyPassword` | Comprueba tipo, formato y coincidencia de contraseña. |
| `sesiones.ts` / `createSession` | Crea token aleatorio con vencimiento de ocho horas. |
| `sesiones.ts` / `tokenOf` | Extrae token de `Authorization: Bearer ...`. |
| `sesiones.ts` / `sessionUserId` | Devuelve ID del usuario si la sesión existe y está vigente. |
| `sesiones.ts` / `revokeSession` | Elimina la sesión. |
| `alcance.ts` / `technicianScope` | Filtra colecciones según el técnico vinculado al usuario. |
| `compartido/http.ts` / `getClientIp` | Obtiene IP desde encabezado o conexión; el encabezado requiere confianza controlada en despliegue. |
| `compartido/http.ts` / `getReqUser` | Obtiene nombre que el servidor coloca para el usuario autenticado. |
| `dashboard/estadisticas.ts` / `mantenimientosFinalizadosPorMes` | Cuenta servicios terminados por mes/año y descarta fechas inválidas. |

## Rutas disponibles de la API

`GET` consulta; `POST` crea o ejecuta una acción; `PUT` modifica; `DELETE` elimina o realiza la acción definida por la ruta. `:id` se reemplaza por un número de registro. Salvo login y salud, se requiere sesión.

| Área | Rutas |
| --- | --- |
| Salud | `GET /api/health` |
| Autenticación | `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Usuarios | `GET/POST /api/usuarios`, `GET/PUT/DELETE /api/usuarios/:id`, `PUT /api/usuarios/:id/toggle-estado` |
| Técnicos | `GET/POST /api/tecnicos`, `GET/PUT/DELETE /api/tecnicos/:id`, `PUT /api/tecnicos/:id/toggle-estado` |
| Máquinas | `GET/POST /api/maquinas`, `GET/PUT/DELETE /api/maquinas/:id` |
| Asignaciones | `GET/POST /api/asignaciones`, `PUT /api/asignaciones/:id/finalizar` |
| Mantenimientos | `GET/POST /api/mantenimientos`, `PUT/DELETE /api/mantenimientos/:id` |
| Contratos | `GET/POST /api/contratos`, `PUT /api/contratos/:id` |
| Alertas | `GET /api/alertas`, `GET /api/alertas/no-leidas`, `PUT /api/alertas/:id/leer`, `PUT /api/alertas/leer-todas`, `DELETE /api/alertas/:id`, `DELETE /api/alertas`, `POST /api/alertas/ejecutar-revision` |
| Historial | `GET /api/historial/maquina/:id` |
| Bitácora | `GET /api/bitacora` |
| Resumen | `GET /api/dashboard` |
| Limpieza | `POST /api/sistema/limpiar-todo` |

No hay ruta propia para generar PDF: se genera en el navegador. No hay eliminación de contratos en las rutas actuales. El borrado de usuario alterna su estado; el borrado de técnicos y máquinas tiene efectos diferentes y debe revisarse antes de usarlo.

## Coordinación de las pantallas

[App.tsx](../frontend/src/App.tsx) guarda usuario, pantalla activa y listas consultadas. Sus funciones conectan los formularios con la API:

| Funciones | Propósito |
| --- | --- |
| `reloadData` | Consulta en paralelo dashboard y ocho listas; reemplaza datos visibles. |
| `handleLogin`, `handleLogout` | Guardan o eliminan sesión y limpian información de la pantalla. |
| `handleCrearUsuario`, `handleActualizarUsuario`, `handleToggleEstadoUsuario` | Administran cuentas y vuelven a cargar información. |
| `handleCrearTecnico`, `handleActualizarTecnico`, `handleEliminarTecnico` | Administran personal. |
| `handleLimpiarTodo` | Solicita limpieza global. |
| `handleCrearMaquina`, `handleActualizarMaquina`, `handleDarDeBajaMaquina`, `handleEliminarMaquina` | Administran equipo y su estado. |
| `handleNavigateHistory` | Selecciona una máquina y abre su historial. |
| `handleCrearAsignacion`, `handleFinalizarAsignacion` | Registran entrega y devolución. |
| `handleCrearMantenimiento`, `handleActualizarMantenimiento`, `handleEliminarMantenimiento` | Administran servicios; el servidor resuelve automatizaciones. |
| `handleCrearContrato`, `handleActualizarContrato` | Administran contratos. |
| `handleMarkAlertRead`, `handleMarkAllAlertsRead`, `handleDeleteAlert`, `handleClearAllAlerts` | Gestionan avisos. |
| `handleUpdatePerfil` | Solicita modificar datos de cuenta. |
| Efectos `useEffect` | Cargan datos con sesión, escuchan expiración y consultan historial al seleccionar un equipo. |

`services/api.ts` ofrece métodos correspondientes a las rutas, como `getMaquinas`, `crearMaquina` y `login`. `services/http.ts` contiene `fetchJson`: agrega `/api`, envía token, lee respuesta y notifica expiración cuando recibe 401.

## Funciones locales y componentes visuales

Las funciones siguientes preparan formularios o presentan datos; la validación definitiva debe realizarse en el servidor.

| Archivo | Piezas y responsabilidades |
| --- | --- |
| `main.tsx` | Renderiza la aplicación con el proveedor de tema. |
| `Sidebar.tsx` | `Sidebar` y `TabType`: secciones y menú según rol. |
| `Navbar.tsx` | `Navbar`, `toggleTheme`, `handleNavigateAlerts`, `getPriorityBadge`: encabezado, tema y avisos. |
| `MobileBottomNav.tsx` | Navegación inferior para móvil. |
| `ProdimaLogo.tsx` | Presenta identidad visual. |
| `ThemeContext.tsx` | `ThemeProvider`, `setPreference`, `useTheme`: recuerda tema y responde a preferencia del sistema. |
| `LoginView.tsx`, `LoginModal.tsx` | `handleSubmit`: envían usuario y contraseña desde pantalla o ventana. |
| `UsuariosView.tsx` | Filtra cuentas; `handleOpenModal`, `handleSubmit`, `handleResetPass` preparan edición y cambio de contraseña. |
| `TecnicosView.tsx` | Filtra técnicos; `handleAutoSuggestUsername`, `handleOpenModal`, `onSubmit`, `handleConfirmDelete`, `handleResetData` gestionan formularios y confirmaciones. |
| `MaquinasView.tsx` | `generarCodigoMaquina` prepara código en interfaz; `getStatusBadge` presenta estado; `handleOpenModal`, `onSubmit`, `handleStatusChangeSubmit` editan ficha/estado. |
| `AsignacionesView.tsx` | Filtra entregas; `handleOpenCreateModal`, `onSubmit`, `handleFinishSubmit` preparan entrega y devolución. |
| `MantenimientosView.tsx` | Filtros/conteos; `showNotification`, `handleOpenModal`, `handleSelectTecnicoAccount`, `handleSubmit`, `handleStartMantenimiento`, `handleOpenCompletionModal`, `handleConfirmCompletion`, `handleDeleteMantenimiento`. |
| `ContratosView.tsx` | Filtros; `getStatusBadge`, `handleOpenModal`, `handleSubmit` presentan vigencia y gestionan ficha. |
| `AlertasView.tsx` | Filtra avisos y cuenta no leídos; ejecuta acciones recibidas de App. |
| `HistorialView.tsx` | Filtra catálogo, selecciona equipo y presenta su expediente. |
| `BitacoraView.tsx` | Filtra y muestra acciones del sistema. |
| `DashboardView.tsx` | Presenta indicadores; `CustomMesTooltip` y `CustomEstadoTooltip` explican valores al señalar gráficos. |
| `ReportesView.tsx` | `handleExportPDF` carga generador; `exportToCSV` escapa comillas, prepara archivo y descarga. |
| `pdfExport.ts` | `exportReportToPDF` selecciona tipo, orientación, encabezados, tablas y descarga PDF. |
| `PerfilView.tsx` | `handleSubmit` envía cambios de perfil. |

Los filtros de pantalla seleccionan lo que ya recibió el navegador; no reemplazan los permisos del backend. Las funciones anónimas de botones, listas y efectos son pasos internos de estas mismas tareas.

## Ejemplo de recorrido técnico

Al guardar una máquina: `MaquinasView.onSubmit` reúne datos → `App.handleCrearMaquina` llama a `api.crearMaquina` → `fetchJson` envía `POST /api/maquinas` → `withDatabase` comprueba sesión → `crearMaquina` agrega ficha, bitácora e historial → `persistData` guarda las diferencias → MySQL confirma → el servidor responde → `reloadData` actualiza las pantallas.

Éste es un ejemplo concreto para explicar en la defensa cómo un botón termina produciendo registros persistentes.
