# Manual explicado del proyecto de soldadura PRODIMA

Guía de estudio para una persona sin conocimientos de programación.

Fecha de revisión: 8 de octubre de 2026. Basado en los archivos del proyecto. Los ejemplos de personas y equipos son ficticios.

## Cómo leer este documento

Lee primero la explicación general y después el recorrido de carpetas. No necesitas memorizar nombres de funciones para comprender la finalidad del sistema. Cuando encuentres un término técnico, piensa en la tarea administrativa que representa.

El documento tiene una explicación didáctica y cuatro anexos: descripción general, catálogo de funciones, guía de tesis y ejecución. Los anexos conservan los detalles para que puedas buscar un nombre concreto cuando lo necesites.

## 1. La idea principal: organizar el trabajo y su información

Tu proyecto es un sistema web de gestión de máquinas de soldar y personal técnico. Una aplicación web es un programa que se utiliza desde el navegador. Lo que ves son pantallas, formularios, tablas, botones y gráficos; detrás existen instrucciones que comprueban y guardan lo que haces.

Imagina que una empresa administra sus equipos con varias hojas: una con las máquinas, otra con los trabajadores, otra con las entregas y otra con los servicios. Encontrar quién tiene un equipo obliga a cruzar esas hojas. El proyecto reúne esas fichas y las relaciona por identificadores.

El aporte potencial está en centralizar información, relacionar responsabilidades y aplicar reglas. Para afirmar que ahorra tiempo o reduce errores, tu tesis debe medir esos efectos con usuarios y datos comparables.

Una máquina física no se conecta directamente a este programa. Las personas registran datos sobre ella. El sistema conoce lo que se registra, no necesariamente todo lo que ocurre en el taller.

## 2. Las tres grandes partes, con una comparación sencilla

### 2.1 Frontend: el mostrador de atención

El frontend es lo que ve la persona. Un formulario de máquina pide marca, modelo, ubicación y otros campos. Un botón permite guardar. Una tabla permite revisar lo registrado. En este proyecto esas piezas están en la carpeta `frontend`.

Puedes imaginarlo como el mostrador de una oficina: presenta opciones y recibe solicitudes. La pantalla puede indicar que falta un dato o mostrar un mensaje, pero guardar definitivamente y autorizar una acción corresponde al servidor.

### 2.2 Backend: la oficina que procesa solicitudes

El backend recibe lo que envía la pantalla. Comprueba la sesión, aplica reglas, busca registros y coordina su almacenamiento. Está en `backend`.

Ejemplo: aunque una persona logre enviar una solicitud sin usar el botón normal, el servidor debe impedir que un técnico haga una operación reservada. Por eso esconder botones y verificar permisos son tareas distintas.

### 2.3 Base de datos: el archivo organizado

MySQL guarda fichas en tablas. Una tabla se parece a una hoja con filas y columnas: una fila es una máquina; una columna puede ser su marca. La base persiste aunque cierres el navegador.

Actualmente la configuración conecta con MySQL alojado en Railway. Railway es el lugar donde se hospeda la base; MySQL es el motor que organiza y consulta sus datos. El programa se ejecutó localmente y se conectó a esa base remota. Tener la base en Railway no significa que la página web también esté publicada allí.

### 2.4 Qué comparten esas partes

La carpeta `shared` contiene la descripción común de las fichas. Así pantalla y servidor utilizan los mismos nombres esperados. Es como acordar un único formato de formulario para que dos departamentos no llamen de manera distinta al mismo dato.

## 3. Por qué se divide en carpetas y módulos

Una carpeta agrupa archivos. Un módulo agrupa una responsabilidad del negocio: máquinas, técnicos, contratos, etc. Dividir el proyecto facilita encontrar dónde se cambia algo y entender qué parte se está revisando.

Si todos los formularios, cálculos y consultas estuvieran mezclados en un archivo, sería más difícil ubicar una regla o corregir una pantalla. La división organiza el trabajo, aunque no elimina automáticamente errores.

En tu proyecto existe una división por áreas en ambos lados. `frontend/src/modulos/maquinas` contiene la pantalla de máquinas. `backend/modulos/maquinas` contiene las rutas que reciben sus solicitudes. La lógica más extensa de máquinas, y también la de otras áreas, está centralizada en `backend/database/operaciones.ts`.

Esto significa que un módulo no es una aplicación independiente. Comparte servidor, datos y funciones con los demás. Los módulos tampoco son microservicios: no se despliegan aquí como servidores separados.

## 4. La carpeta principal: archivos que preparan el proyecto

### 4.1 `package.json`: la lista de herramientas y acciones

Define las bibliotecas utilizadas y los comandos disponibles. Una biblioteca es código reutilizable que resuelve una tarea común. Por ejemplo, React ayuda a construir pantallas y jsPDF ayuda a producir PDF.

La sección de comandos permite pedir «ejecutar», «compilar», «revisar» o «probar». Es comparable a una hoja con las instrucciones de preparación de una máquina, pero para el programa.

El nombre `react-example` y la versión `0.0.0` son valores del paquete actual. No describen automáticamente la madurez del sistema ni una versión oficial para tesis.

### 4.2 `package-lock.json`: la lista exacta de versiones

Las bibliotecas también cambian. Este archivo conserva las versiones resueltas y sus dependencias para que una instalación sea reproducible. No duplica inútilmente a `package.json`: uno expresa las dependencias solicitadas y el otro registra su resolución.

### 4.3 `tsconfig.json`: las reglas de revisión del código

Configura TypeScript. TypeScript añade descripciones de datos a JavaScript para detectar ciertos errores antes de ejecutar. Por ejemplo, si una función espera un identificador numérico, una revisión puede señalar que se le entregó un texto incompatible.

La revisión de tipos no demuestra que una regla administrativa sea correcta. Puede existir código perfectamente válido que aplique una regla equivocada para la empresa.

### 4.4 `.env` y `.env.example`: los datos de configuración

`.env` contiene host, puerto, usuario, contraseña y nombre de la base, además del puerto de la aplicación. Permite cambiar la conexión sin reescribir las funciones del negocio.

`.env.example` es un modelo sin la configuración privada real. `.gitignore` indica qué archivos no se incorporan normalmente al control de versiones; entre ellos están `.env`, las bibliotecas instaladas y la compilación.

En este documento no se incluye la contraseña de conexión. Para explicar la arquitectura en tu tesis basta indicar que la conexión se configura por variables de entorno.

### 4.5 `README.md` y `docs`: la explicación del proyecto

README es la entrada rápida para entender propósito, estructura y ejecución. `docs` reúne documentos más extensos. Este manual complementa la explicación existente para estudiar desde cero.

### 4.6 `node_modules`: las herramientas instaladas

Contiene React, Express y otras bibliotecas con los archivos que necesitan para funcionar. No conviene modificar allí las reglas propias: una reinstalación puede reemplazar los cambios. Para estudiar tu aporte, enfócate en `frontend`, `backend` y `shared`.

### 4.7 `dist`: el programa preparado para producción

Compilar significa transformar y empaquetar el código fuente en archivos que se utilizarán al ejecutar la versión de producción. `dist/frontend` contiene la interfaz preparada y `dist/backend/server.cjs` contiene el servidor preparado.

Modificar el código fuente después de compilar no actualiza automáticamente esta versión. Para reflejar cambios en producción debes volver a compilar y reiniciar según corresponda.

### 4.8 `.git`: el registro de versiones

Git ayuda a conservar cambios del proyecto y comparar versiones del código. No es una copia de seguridad de la base MySQL. Un respaldo del código y un respaldo de los datos son cosas distintas.

## 5. Frontend: cómo se construyen las pantallas

### 5.1 `frontend/index.html`: el punto de entrada del navegador

Es la página base. Incluye el lugar donde React inserta la aplicación. No contiene por sí sola todas las tablas, formularios y reglas; las pantallas se construyen a partir de los archivos de `src`.

### 5.2 `frontend/vite.config.ts`: preparar y compilar la interfaz

Vite es una herramienta de desarrollo. Configura React y Tailwind y coloca el resultado compilado en `dist/frontend`. Durante desarrollo ayuda a trabajar con el código y actualizar la interfaz.

En este proyecto Express integra Vite para desarrollo. Por eso el comando normal inicia un servidor que atiende tanto API como interfaz.

### 5.3 `frontend/src/main.tsx`: encender la interfaz

Busca el espacio `root` en la página y monta React. Envuelve la aplicación con `ThemeProvider`, que ofrece la configuración visual, y `StrictMode`, que ayuda a detectar ciertos problemas durante desarrollo.

`main.tsx` no inicia MySQL. Su responsabilidad es montar la parte visual dentro del navegador.

### 5.4 `frontend/src/App.tsx`: el coordinador de la aplicación

Recuerda quién inició sesión, qué sección está abierta, qué listas se recibieron y qué máquina se seleccionó para historial. También conecta las acciones de los formularios con el servicio de la API.

La función `reloadData` consulta el resumen y las listas. Las funciones que empiezan por `handle` responden a acciones del usuario. Por ejemplo, `handleCrearMaquina` solicita crear una ficha y vuelve a consultar información para actualizar las pantallas.

React llama «estado» a los datos que la pantalla recuerda. No debes confundirlo con el estado administrativo de una máquina: «Disponible» es un dato del negocio; recordar la lista de máquinas es estado de la interfaz.

### 5.5 `frontend/src/components`: piezas reutilizables

`Sidebar` construye el menú lateral. `Navbar` construye el encabezado y acceso a avisos y tema. `MobileBottomNav` ofrece navegación inferior para pantallas pequeñas. `ProdimaLogo` presenta el logotipo.

Se separan porque aparecen alrededor de varias áreas y no pertenecen únicamente a un formulario. Si cambia el menú, no hace falta copiar esa modificación en cada pantalla.

### 5.6 `frontend/src/context`: una preferencia común

`ThemeContext` permite compartir tema claro, oscuro o del sistema. Sin ese mecanismo, cada componente tendría que recibir o gestionar por separado la preferencia. La selección se recuerda en el navegador.

El tema cambia presentación; no cambia permisos ni contenido almacenado en MySQL.

### 5.7 `frontend/src/services`: la comunicación

`http.ts` tiene la función que envía solicitudes y recibe JSON. Agrega el token de sesión y reconoce una respuesta de sesión no válida. `api.ts` ofrece nombres fáciles de usar para esas solicitudes: consultar máquinas, crear técnicos, finalizar asignaciones, etc.

Esto evita repetir en cada pantalla la preparación de encabezados y la lectura de errores. Una pantalla pide una tarea por su nombre y el servicio sabe cómo enviarla al servidor.

### 5.8 `frontend/src/modulos`: las áreas visibles

Contiene las vistas por responsabilidad. Una vista es la presentación de un área. Puede tener filtros, formularios, ventanas de confirmación, contadores y botones. Los permisos definitivos y el guardado siguen estando en el backend.

### 5.9 `frontend/src/index.css` y `frontend/public`

CSS define presentación: colores, espacios y otros estilos. Tailwind también permite expresar estilos con clases en los componentes. `public` guarda recursos estáticos como la imagen del logotipo.

Que un archivo sea visual no significa que sobre. La presentación influye en la facilidad de uso y en que una persona identifique avisos y acciones.

## 6. Área por área: finalidad y relación con el negocio

### 6.1 Autenticación: saber quién está usando el sistema

El ingreso recibe usuario o correo y contraseña. El servidor busca una cuenta activa y verifica la clave. Si coincide, crea un pase temporal llamado token; el navegador lo adjunta a las solicitudes siguientes.

Las pantallas son `LoginView` y `LoginModal`. En el servidor, `rutas.ts` recibe las solicitudes; `passwords.ts` transforma y comprueba claves; `sesiones.ts` administra tokens; `alcance.ts` decide qué información corresponde a un técnico.

Existe esta área porque una ficha administrativa no debe estar disponible para cualquier visitante. El token dura ocho horas y las sesiones se pierden al reiniciar el servidor. El nombre «admin» de respaldo en la interfaz no equivale a una cuenta válida en MySQL.

### 6.2 Usuarios: cuentas para acceder

Una cuenta contiene nombre, apellido, correo, username, rol, estado y contraseña almacenada como hash. Administrar cuentas permite definir quién puede entrar y con qué rol.

Un usuario no necesariamente representa una ficha técnica: un supervisor puede tener acceso sin ser la persona que recibe la máquina. La pantalla está en `usuarios/UsuariosView.tsx`; las rutas están en `backend/modulos/usuarios`.

Modificar o desactivar una cuenta puede sincronizar datos con su técnico vinculado. El endpoint de eliminación de usuarios alterna el estado, de modo que no debe describirse como un borrado físico definitivo.

### 6.3 Técnicos: la ficha del trabajador

Contiene DPI, teléfono, correo, especialidad, puesto, fecha de ingreso, estado y homologación. Permite identificar a quién se entrega equipo y quién se relaciona con un mantenimiento.

La cuenta responde «¿cómo entra esta persona?»; el técnico responde «¿quién es este trabajador y qué información laboral registramos?». `usuario_id` conecta ambas fichas.

Crear técnico puede generar automáticamente su cuenta. Esto reduce pasos, pero se deben revisar datos y contraseña. `homologado` es una marca de autorización; el sistema no almacena por ello una prueba completa de certificación.

### 6.4 Máquinas: el inventario central

Cada equipo tiene código interno, marca, modelo, serie, tipo, voltaje, amperaje, potencia, ubicación, fecha de adquisición, proveedor, estado y observaciones. Estas fichas permiten distinguir equipos similares.

El código interno es la identificación administrativa de la empresa. La serie es la identificación de fabricación cuando se conoce. No son intercambiables, aunque ambos ayudan a evitar confusiones.

Ejemplo: dos máquinas de la misma marca y modelo deben ser dos fichas si son dos equipos físicos diferentes. El identificador permite relacionar cada una con sus propias entregas y servicios.

Estados: Disponible, Asignada, En mantenimiento, Fuera de servicio, Reparación y Baja. Dar de baja conserva una ficha cambiando estado; eliminar permanentemente puede borrar sus registros relacionados. Esa diferencia es importante para trazabilidad.

### 6.5 Asignaciones: quién tiene el equipo y durante qué período

Una asignación une técnico y máquina, con fecha de entrega, motivo, responsable, observaciones y estado. La devolución registra cuándo terminó la entrega.

Guardar únicamente el nombre del técnico dentro de la máquina perdería la historia al cambiar de responsable. Una tabla de asignaciones conserva varios períodos de uso.

La creación normal comprueba técnico activo/homologado y evita doble asignación activa de la misma máquina. También modifica estado e historial. La interfaz ofrece máquinas disponibles; el backend bloquea estados fuera de servicio, reparación y baja, pero no utiliza exactamente el mismo filtro visual.

### 6.6 Mantenimientos: servicios y reparaciones registrados

Preventivo significa una intervención para prevenir problemas; correctivo significa atender una falla o problema existente. El sistema guarda esa clasificación, descripción, fechas, costo, proveedor, responsable y estado.

Un registro de servicio no prueba por sí solo su calidad ni que se ejecutaron todos los pasos técnicos. La empresa debe definir qué información necesita para respaldarlo.

La creación puede tomar el proveedor de un contrato vigente, seleccionar un técnico, reasignar el equipo y registrar eventos. Por eso es una operación que relaciona varios módulos. Los estados son Programado, En proceso, Finalizado y Cancelado.

Hay decisiones que revisar: una programación futura marca inmediatamente la máquina en mantenimiento; devolver un equipo puede finalizar el primer mantenimiento en proceso. Para una tesis, explica lo implementado y plantea si coincide con el procedimiento real.

### 6.7 Contratos: vigencia y proveedor del servicio

Los contratos de este módulo son de mantenimiento asociados a máquinas. Guardan número, proveedor, fechas, costo, servicio, condiciones y estado. No son los contratos laborales de los técnicos.

La consulta calcula días restantes y mensajes de vencimiento. Si quedan de 1 a 30 días se muestra próximo a vencer; con cero o menos, vencido. La validación de cobertura busca estado vigente o próximo a vencer; no constituye una evaluación jurídica de todas las condiciones del contrato.

Existe este módulo porque un servicio puede estar asociado a una cobertura y un proveedor previamente acordados. El costo registrado no equivale automáticamente a un asiento contable ni a un pago realizado.

### 6.8 Alertas: avisos para revisar situaciones

Una alerta tiene título, mensaje, prioridad, fecha y marca de lectura. La revisión examina contratos, mantenimientos programados cuya fecha llegó y equipos fuera de servicio o de baja.

Marcar un aviso como leído indica que se consultó, no que se solucionó la causa. Eliminar un aviso tampoco renueva el contrato ni repara una máquina.

Son avisos internos de la aplicación. No hay envío de correo ni proceso periódico de revisión en segundo plano en el código actual; existe una operación explícita de revisión y revisiones al crear/editar contratos.

### 6.9 Historial: el expediente de una máquina

Reúne la ficha del equipo, entregas, servicios, contratos y eventos. Permite seguir un caso concreto sin revisar por separado todas las listas.

Ejemplo: preguntar «¿qué pasó con M-001?» corresponde al historial. No todos los cambios de todos los módulos están garantizados como un único registro de auditoría inmutable; el expediente utiliza las relaciones y eventos disponibles.

### 6.10 Bitácora: las acciones dentro del sistema

Registra acciones, usuario, fecha, módulo, registro afectado, descripción e IP. Preguntar «¿qué acciones se registraron en el sistema?» corresponde a bitácora.

No es igual al historial. Un login es una acción del sistema, pero no un mantenimiento de una máquina. Además, numerosas operaciones guardan ID de usuario 1 junto al nombre del actor, lo que limita la identificación por ID.

La limpieza puede eliminar bitácora y una eliminación puede quitar historial. Por eso es correcto hablar de registros de trazabilidad disponibles y no de auditoría imposible de alterar.

### 6.11 Dashboard: la vista resumida

Presenta cantidades y gráficos para orientarse rápidamente. Resume datos registrados: máquinas por estado, servicios por tipo, asignaciones activas y contratos por estado.

El gráfico mensual cuenta servicios finalizados por fecha de fin en el año actual. Un mantenimiento programado no se cuenta como terminado. Los meses sin servicios aparecen en cero.

Existe esta área para evitar leer todas las filas antes de conocer la situación general. Los indicadores del sistema no sustituyen una evaluación de impacto de la tesis.

### 6.12 Reportes: llevar información fuera de la pantalla

Permite PDF con tablas y encabezados y exportaciones CSV. Un PDF sirve para presentar un informe; CSV permite trabajar con datos tabulares en una hoja de cálculo.

`ReportesView.tsx` ofrece opciones; `pdfExport.ts` prepara el PDF. La generación ocurre en el navegador con los datos recibidos. El servidor no tiene una ruta específica que emita ese PDF.

Los textos empresariales y de certificación incluidos en el diseño son contenido escrito en el código; no demuestran certificación, cumplimiento ni una versión oficial del producto.

### 6.13 Perfil: la información de la cuenta actual

Permite preparar cambios del usuario desde su pantalla de perfil. Utiliza la operación de actualización de usuarios, no una tabla independiente de perfiles.

La interfaz puede ofrecer una opción que el backend no permita para un determinado rol. En particular, el técnico tiene restringidas las escrituras generales; el comportamiento debe comprobarse con cada rol.

### 6.14 Sistema: comprobación de salud y limpieza

`/api/health` comprueba disponibilidad del acceso requerido a MySQL y devuelve una respuesta simple. Es útil para distinguir un servidor operativo de uno sin acceso a datos.

La limpieza total vacía las colecciones operativas y conserva administradores. Es una función destructiva sobre datos, distinta de `scripts/clean.cjs`, que sólo elimina archivos de compilación.

## 7. Backend: dónde se reciben y deciden las operaciones

### 7.1 `backend/server.ts`: iniciar el servicio

Comprueba la base, configura Express, admite datos JSON, registra rutas y sirve la interfaz. Escucha el puerto configurado, por defecto 3000. En desarrollo integra Vite; en producción utiliza `dist/frontend`.

Express es la biblioteca que permite recibir solicitudes web y enviar respuestas. Node.js permite ejecutar JavaScript/TypeScript preparado del lado servidor. Ni Express ni Node son la base de datos.

### 7.2 `backend/modulos/index.ts`: reunir las ventanillas

Importa las rutas de las áreas y las reúne. Es como una lista de departamentos del servidor para que las solicitudes lleguen al área correcta.

### 7.3 Los archivos `rutas.ts`: recibir una solicitud concreta

Una ruta relaciona dirección y acción. `GET /api/maquinas` consulta; `POST /api/maquinas` crea. Una ruta con `:id` utiliza el identificador del registro seleccionado.

El archivo toma datos, llama a una función y prepara respuesta. Los códigos HTTP indican resultado: 200 es éxito de una consulta/operación, 201 creación, 400 solicitud rechazada, 401 sesión no válida, 403 operación no permitida y 404 registro no encontrado, según la ruta.

### 7.4 `backend/database/operaciones.ts`: las reglas del negocio

Aquí está la clase `IndustrialDatabase`, que agrupa la mayor parte de operaciones. Clase significa una estructura que reúne datos y tareas relacionadas. No necesitas comprender toda su sintaxis para explicar que organiza cómo se crean, actualizan y consultan fichas.

La carpeta se llama `database`, pero este archivo no contiene sólo instrucciones SQL: contiene lógica administrativa sobre listas temporales. El anexo de funciones explica cada tarea por nombre.

### 7.5 `backend/database/conexion.ts`: conversar con MySQL

Lee configuración, crea el grupo de conexiones, traduce campos y organiza lectura y persistencia. «Persistir» significa guardar de forma duradera.

La función `readData` consulta las tablas. `persistData` compara antes/después y escribe diferencias. `transaction` coordina el paquete completo y hace reversión si falla.

### 7.6 `backend/database/transaccion-http.ts`: autorización y confirmación

`withDatabase` envuelve las operaciones. Antes de ejecutarlas identifica al usuario y filtra información cuando es técnico. También impide escrituras no permitidas.

Una respuesta exitosa espera la confirmación de MySQL. Esto evita decir «guardado» antes de saber si la base aceptó los cambios. La transacción revierte cambios si la operación responde con un error.

### 7.7 `backend/database/schema.sql`: la estructura del archivo de datos

Define tablas, columnas, tipos, campos únicos, índices y relaciones. Es el plano de la base. No es una lista de máquinas reales, sino la definición de cómo se guardarán.

Una clave foránea comprueba una relación con otra tabla. Un índice es una ayuda para localizar datos. No toda referencia del proyecto tiene clave foránea: alertas y bitácora usan también identificadores descriptivos.

### 7.8 `backend/database/cli.ts`: tareas de preparación

CLI significa interfaz de línea de comandos: tareas que se ejecutan en terminal en vez de mediante una pantalla. Permite comprobar conexión, crear tablas y validar/importar un respaldo JSON antiguo.

No debes ejecutar migración sólo porque aparezca el comando. Necesita un archivo original específico y una base vacía. `db:init` crea tablas faltantes; no crea una primera cuenta ni actualiza automáticamente cualquier esquema viejo.

### 7.9 `backend/compartido/http.ts`: información común

Extrae nombre del usuario e IP de la solicitud. Se separa para no repetirlo en cada ruta. La identificación por sesión se establece en el envoltorio de autorización.

## 8. Shared: el vocabulario común de los datos

`shared/types.ts` define las fichas esperadas de usuario, técnico, máquina, asignación, mantenimiento, contrato, alerta, historial, bitácora y resumen.

Por ejemplo, una ficha de máquina tiene `id`, `codigo_interno`, `marca`, `modelo` y `estado`. Un tipo enumera los valores esperados de un estado. Estas descripciones ayudan al programador y a la revisión de TypeScript, pero no sustituyen validaciones cuando llegan datos reales por una solicitud.

La base SQL puede permitir ausencia de un técnico en una asignación histórica después de eliminarlo. Algunas descripciones de TypeScript no representan perfectamente todos los valores nulos de SQL; es un aspecto técnico a revisar si se endurece el sistema.

## 9. Scripts y pruebas: por qué son necesarios

Un script automatiza una tarea. `start.cjs` coloca la ejecución en modo producción y carga el servidor compilado. Se utilizó para iniciar el sistema conectado a Railway.

`clean.cjs` elimina `dist`. Su utilidad es reconstruir los archivos preparados. No elimina equipos ni técnicos de MySQL.

Un test es una comprobación automatizada. Los archivos de pruebas existentes evalúan casos específicos: contraseñas, fechas, relación de mantenimiento/contrato/asignación, parámetros SQL, transacciones, sesiones, alcance por técnico y conteos mensuales.

Las 11 pruebas existentes pasaron en la revisión anterior. Algunas sustituyen conexiones por simulaciones para comprobar lógica sin depender de una base real. Una simulación que pasa no demuestra que la contraseña de MySQL sea correcta ni que todos los botones funcionen.

Tests, scripts y código de producción cumplen finalidades distintas. Que el usuario final no los vea no significa que sean archivos inútiles.

## 10. Un recorrido completo con un ejemplo

Ana es una técnica ficticia. M-001 es una máquina ficticia. Una persona administradora ingresa y registra a Ana, luego registra M-001. Al entregarla, la pantalla envía sus identificadores al servidor.

El servidor busca ambas fichas, comprueba que Ana esté activa y homologada, verifica que no exista otra asignación activa y revisa estados bloqueados. Crea la entrega, cambia la máquina a Asignada y agrega historial y bitácora. MySQL confirma el conjunto de cambios y recién entonces se responde al navegador.

Después se registra un mantenimiento. El sistema consulta cobertura de contratos y puede cambiar proveedor, estado y responsable. Si hace falta reasignar, finaliza la entrega anterior y crea la nueva. Esto muestra por qué los módulos se conectan: mantenimiento no es solamente una línea de texto aislada.

Al devolver M-001, se finaliza la entrega y se registra la fecha. La regla actual puede finalizar el primer mantenimiento en proceso. Luego el historial permite revisar entregas y servicios relacionados; el reporte permite presentar esos datos fuera de la aplicación.

Si algo falla durante el guardado, la transacción puede deshacer todos sus cambios. No significa que el programa deshaga una intervención física real en el taller; deshace los cambios de datos de esa solicitud.

## 11. Cómo separar funcionalidad, limitación y propuesta

Funcionalidad comprobada: algo que el código implementa y cuya verificación puedes describir. Ejemplo: calcular servicios finalizados por mes.

Limitación: algo que aún no se cubre o cuyo comportamiento puede ser insuficiente. Ejemplo: la homologación no tiene vencimiento ni documento adjunto.

Propuesta: una mejora que todavía no está implementada. Ejemplo: añadir registro de certificados y avisos de vencimiento. No la presentes como una función ya existente.

Esta distinción protege la claridad de tu tesis. Un prototipo puede ser útil y a la vez necesitar mejoras. Las pruebas y la compilación correctas son evidencia técnica; la facilidad de uso y el efecto administrativo requieren evaluación adicional.

## 12. Qué debes poder explicar con tus propias palabras

El proyecto se divide entre pantallas, servidor y almacenamiento. Las carpetas separan responsabilidades. Los módulos representan áreas del negocio. Los identificadores relacionan fichas. Las reglas evitan ciertas operaciones incoherentes. Las transacciones coordinan cambios. Los permisos controlan acceso. Los reportes comunican información registrada.

Para estudiar, practica una frase por carpeta y un ejemplo por área. Luego sigue el recorrido de una máquina desde inventario hasta devolución. Cuando entiendas ese recorrido, los nombres de archivos tendrán sentido.

## 13. Tecnología utilizada y por qué está presente

| Herramienta | Responsabilidad en este proyecto | Comparación sencilla |
| --- | --- | --- |
| JavaScript / TypeScript | Expresar instrucciones y describir tipos de datos. | Idioma del programa con ayudas de revisión. |
| React / React DOM | Construir y montar pantallas con componentes. | Piezas del mostrador. |
| Node.js | Ejecutar el servidor y herramientas. | Entorno donde trabajan las instrucciones del servidor. |
| Express | Recibir solicitudes HTTP y responder. | Ventanillas de atención. |
| MySQL / mysql2 | Almacenar registros y acceder a ellos desde Node. | Archivo y medio para consultarlo. |
| dotenv | Leer variables de `.env`. | Hoja privada de configuración. |
| Vite / esbuild | Preparar y empaquetar código para ejecución. | Preparación del producto final. |
| Tailwind CSS | Presentación y estilos de interfaz. | Diseño visual de formularios y pantallas. |
| lucide-react | Iconos. | Señales visuales de navegación. |
| react-hook-form | Gestión de formularios en áreas que lo utilizan. | Ayuda para recoger y revisar campos. |
| Recharts | Dibujar gráficos. | Presentación visual del resumen. |
| jsPDF / jspdf-autotable | Construir documentos PDF y sus tablas. | Preparación de informes descargables. |
| node:test / assert | Ejecutar comprobaciones y verificar resultados. | Lista automática de controles. |

Que una herramienta esté instalada no convierte al sistema en un producto certificado ni demuestra rendimiento. Su función es apoyar tareas concretas del código.

## 14. Mapa de lectura de los anexos

Anexo A: panorama del proyecto, estructura y relaciones de datos.

Anexo B: catálogo de funciones, rutas y componentes para buscar nombres técnicos.

Anexo C: propuesta de tesis, evaluación, limitaciones y preguntas de defensa.

Anexo D: configuración, comandos y resultados de ejecución observados. Son evidencias de la revisión, no una garantía de que el servidor permanezca encendido indefinidamente.
