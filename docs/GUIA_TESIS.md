# Guía para definir una tesis con este sistema

## Tema sugerido

**Sistema web para la gestión y trazabilidad de máquinas de soldar, asignaciones y mantenimientos en PRODIMA.**

Es un título ajustado a lo que existe. Si todavía no se ha usado en la empresa, presenta el trabajo como diseño, desarrollo y evaluación de un prototipo. Usa «implementación» si puedes demostrar instalación y uso real.

## Problema que debes investigar

Una posible pregunta es: **¿Cómo puede un sistema web centralizado mejorar la consulta y trazabilidad de las máquinas de soldar, sus responsables y sus mantenimientos en PRODIMA?**

El problema no se demuestra solamente mostrando el programa. Debes averiguar cómo se controla actualmente el inventario, cómo se entregan equipos, dónde se anotan servicios y cuánto cuesta encontrar esa información. Entrevista al personal y revisa documentos autorizados. No afirmes que existen pérdidas, retrasos o errores sin evidencia.

## Objetivos propuestos

Objetivo general: desarrollar y evaluar un sistema web que centralice el registro de máquinas de soldar, técnicos, asignaciones, mantenimientos y contratos, para facilitar la trazabilidad y consulta de información operativa en PRODIMA.

Objetivos específicos:

1. Identificar el proceso actual y los requisitos de inventario, entrega, mantenimiento y acceso a información.
2. Diseñar una estructura de datos que relacione equipos, responsables, servicios y contratos.
3. Integrar los módulos de registro, consulta, alertas, historial y reportes del sistema.
4. Verificar las reglas de asignación, la persistencia y la separación de información por técnico.
5. Evaluar tiempo de consulta, completitud de registros y facilidad de uso con tareas comparables.

Adapta estos objetivos a tu participación real. Si recibiste un sistema existente y tu trabajo es analizarlo o mejorarlo, no atribuyas como propio todo el desarrollo anterior.

## Alcance defendible

El alcance actual comprende inventario, técnicos, cuentas, asignaciones, devolución, servicios preventivos/correctivos, contratos, avisos internos, consultas históricas y exportaciones PDF/CSV.

Quedan fuera del alcance actual control de equipos físicos, sensores, predicción de fallas, evaluación automática de soldaduras, certificación de soldadores, contabilidad completa, inventario de repuestos y notificaciones por correo o mensajería. `homologado` es un campo lógico de autorización; no demuestra por sí mismo una certificación técnica vigente.

## Método de evaluación posible

Puedes realizar una investigación aplicada y una evaluación de caso, según los requisitos de tu universidad. Documenta diagnóstico, requisitos, diseño, desarrollo o adaptación, pruebas y evaluación con usuarios. Una comparación antes/después ayuda, siempre que uses tareas y condiciones comparables.

| Indicador | Cómo medirlo | Qué información necesitas |
| --- | --- | --- |
| Tiempo de consulta | Cronometrar encontrar ubicación, responsable e historial de un equipo. | Tiempos individuales con el proceso anterior y con el sistema. |
| Tiempo de reporte | Cronometrar generar un inventario o resumen de servicios. | Mismo alcance y volumen de datos. |
| Completitud | Registros con todos los campos requeridos / registros revisados × 100. | Lista de campos realmente obligatorios para la empresa. |
| Trazabilidad | Casos en que se identifica equipo, responsable, fechas y servicios / casos revisados × 100. | Muestra definida y evidencia de cada caso. |
| Asignaciones inconsistentes | Contar equipos con más de una entrega activa. | Datos anteriores y pruebas del sistema. |
| Facilidad de uso | Tareas completadas, errores observados y encuesta breve. | Usuarios, tareas y criterios definidos previamente. |

Si el tiempo promedio baja de 10 a 4 minutos, la reducción sería `(10 - 4) / 10 × 100 = 60 %`. Es un ejemplo matemático, no un resultado de este proyecto. No inventes porcentajes para la tesis.

El sistema no registra horas de operación ni todos los momentos de falla y reparación necesarios para calcular confiablemente MTBF o MTTR. Si deseas usar esos indicadores, primero define y añade los datos faltantes.

## Evidencias que conviene reunir

Conserva entrevistas autorizadas, descripción del proceso actual, requisitos, diagramas, capturas de cada módulo, ejemplos de reportes sin datos personales innecesarios, resultados de pruebas y mediciones. Diferencia datos de prueba de registros reales. El DPI, correo y teléfono son datos personales que deben tratarse según las reglas de la empresa y de la universidad.

## Guion para una demostración

1. Ingresar como administrador y mostrar el inventario.
2. Registrar un técnico con datos ficticios completos y una cuenta de prueba.
3. Registrar una máquina y explicar código interno, número de serie y estado.
4. Asignarla al técnico y mostrar el cambio de estado y el historial.
5. Intentar repetir la asignación para demostrar el rechazo.
6. Crear un contrato y luego un mantenimiento para explicar cómo se toma el proveedor.
7. Explicar que la creación de mantenimiento puede reasignar el equipo al responsable.
8. Finalizar el servicio y registrar la devolución según el proceso acordado.
9. Consultar el historial y descargar un reporte.
10. Ingresar como técnico y comprobar que solamente aparecen sus datos permitidos.

Haz la demostración en una base de prueba. No uses la limpieza total como parte habitual de una presentación con datos reales.

## Aspectos interesantes que puedes explicar

**Trazabilidad:** relacionar registros permite reconstruir eventos de un equipo. El historial se centra en una máquina; la bitácora se centra en acciones del sistema.

**Reglas del negocio:** impedir la doble entrega y restringir técnicos inactivos convierte criterios administrativos en comprobaciones del servidor.

**Transacciones:** al crear un mantenimiento pueden cambiar servicio, asignación, estado e historial. La confirmación conjunta evita guardar sólo una parte del proceso si ocurre un error.

**Separación de información:** el servidor filtra por identificadores del técnico vinculado a la cuenta. Esto evita depender exclusivamente de nombres que pueden repetirse.

**Reportes en el navegador:** el PDF se construye a partir de los datos ya consultados. La biblioteca de PDF se carga cuando se solicita la exportación.

**Indicadores sin actividad ficticia:** el cálculo mensual devuelve cero si no existen servicios finalizados, en lugar de inventar datos para llenar los gráficos.

**Concurrencia:** `app_lock` usa un bloqueo de MySQL para ordenar operaciones. Es sencillo de explicar y mantiene consistencia, pero puede convertirse en un límite cuando muchos usuarios consulten simultáneamente.

## Limitaciones comprobables y mejoras propuestas

| Hallazgo del código actual | Implicación | Mejora posible |
| --- | --- | --- |
| No hay alta automática del primer administrador. | Una base vacía permite arrancar con tablas, pero no iniciar sesión. | Comando seguro para crear la primera cuenta. |
| Administrador y Supervisor reciben permisos generales similares en el backend. | La limpieza y gestión de cuentas no tienen una separación fina por operación. | Matriz de permisos en el servidor para cada módulo. |
| Numerosas llamadas a bitácora guardan `usuario_id=1`. | El nombre puede identificar al actor, pero el ID no siempre lo hace. | Pasar el ID real obtenido de la sesión. |
| La limpieza total elimina también la bitácora y el historial; eliminar una máquina borra su historial asociado. | No es una auditoría inmutable. | Baja lógica, archivo y restricciones de eliminación. |
| El PDF utiliza textos como «inalterable», «ERP V2.6» y «Certificación ISO 9001:2015». | Son textos incorporados; no prueban inmutabilidad, versión formal ni certificación. | Revisar etiquetas y justificar afirmaciones con evidencia externa. |
| Hay contraseñas predeterminadas en creación de cuentas (`password123`, `Tec2026!`). | La cuenta puede recibir una clave previsible si no se especifica otra. | Exigir contraseña propia y cambio inicial. |
| La creación automática de técnico desde usuario usa DPI «Pendiente», que es único en SQL. | Crear un segundo técnico por esa vía puede producir un conflicto. | Completar DPI antes de crear o manejar ausencia de forma compatible. |
| Homologación se guarda como verdadero/falso y suele iniciar en verdadero. | No hay documento, entidad certificadora ni vencimiento. | Registrar evidencia, especialidad y fechas de homologación. |
| La devolución finaliza el primer mantenimiento en proceso y marca el equipo disponible. | Podría no reflejar otros servicios pendientes o una inspección real. | Separar devolución, aprobación técnica y disponibilidad. |
| Programar un mantenimiento futuro marca inmediatamente el equipo en mantenimiento. | Puede reducir artificialmente el inventario disponible. | Cambiar estado al inicio efectivo del servicio. |
| Actualizar un mantenimiento no sincroniza todos los estados como su creación. | Pasar de programado a otro estado merece revisión completa. | Definir transiciones y verificar otros servicios activos. |
| La prohibición de eliminar el último mantenimiento no exige uno al crear la máquina. | La regla no garantiza cobertura permanente. | Revisar el requisito con la empresa y aplicarlo coherentemente. |
| Las alertas se generan al crear/editar contratos o mediante revisión explícita. | No hay un programador periódico en segundo plano. | Añadir revisión programada y reglas de actualización de avisos. |
| Una alerta no leída existente evita generar otra del mismo origen. | El aviso anterior puede conservar una prioridad vieja. | Actualizarlo cuando cambie la urgencia. |
| Cálculos de contratos mezclan fechas de calendario con hora local; otras operaciones usan UTC. | Se debe comprobar el día de vencimiento en Guatemala. | Unificar zona y regla de vencimiento. |
| Cada transacción carga todas las colecciones y bloquea una fila común, también en lecturas. | El volumen y la simultaneidad pueden afectar respuesta. | Consultas específicas, paginación y bloqueos por operación. |
| El conteo de servicios por técnico puede usar coincidencia del nombre. | Nombres similares pueden producir conteos ambiguos. | Usar siempre `tecnico_id`. |
| El backend permite asignar equipos en mantenimiento; la pantalla ofrece disponibles. | No todas las vías aplican el mismo criterio. | Acordar y aplicar la misma regla en servidor e interfaz. |
| `DELETE /api/usuarios/:id` alterna estado. | Repetirlo puede reactivar al usuario. | Hacer explícita e idempotente la desactivación. |
| No hay pruebas de navegador ni de integración con MySQL real en la suite actual. | Pasar las pruebas no valida todo el recorrido operativo. | Añadir pruebas de integración y evaluación con usuarios. |

Estas son oportunidades de mejora, no resultados de correcciones realizadas en esta tarea.

## Preguntas de defensa y respuestas breves

**¿Cuál es el aporte?** Centralizar fichas y relaciones operativas, aplicar reglas de asignación y facilitar consultas y reportes. El impacto real se demuestra con evaluación.

**¿Por qué una aplicación web?** El usuario trabaja desde un navegador y los datos se centralizan en el servidor. Acceso desde otras computadoras requiere configurar red y despliegue.

**¿Qué diferencia hay entre usuario y técnico?** Usuario es la cuenta de acceso; técnico es la ficha del trabajador. Pueden vincularse, pero cumplen funciones distintas.

**¿Es mantenimiento predictivo?** No. Registra preventivos y correctivos y produce avisos basados en fechas/estados.

**¿Cómo evita información incompleta por un fallo?** Usa transacciones: confirma todos los cambios de la operación o los revierte.

**¿Cómo demuestra que funciona?** Con pruebas de reglas, integración, recorridos de usuario y mediciones. En esta revisión pasaron 11 pruebas automatizadas, pero usan conexiones simuladas donde corresponde.

**¿Está certificado por ISO?** El código incluye esa frase en un reporte; el programa no demuestra certificación ni cumplimiento. Cualquier afirmación de certificación necesita evidencia válida de la organización.

## Índice académico sugerido

1. Introducción y contexto de la empresa.
2. Problema, justificación, objetivos y alcance.
3. Marco conceptual: gestión de activos, mantenimiento, trazabilidad y sistemas web.
4. Metodología y levantamiento de requisitos.
5. Diseño: arquitectura, datos, procesos y permisos.
6. Desarrollo o adaptación de módulos y reglas.
7. Pruebas, evaluación y discusión de resultados.
8. Conclusiones vinculadas a objetivos y recomendaciones.
9. Anexos: instrumentos, diagramas, capturas y manual.

Esta guía no sustituye el formato de tu universidad ni una revisión bibliográfica. No incorpora citas académicas o normativas verificadas; reúne evidencia del código y propuestas para tu investigación.
