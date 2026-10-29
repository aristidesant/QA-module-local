# US-reportes-de-auditoria: Resumen exportable con fecha y hora para evidencias de auditoría

**Prioridad:** Debería · **Estimación:** M — intuición inicial, el equipo la refina

## Historia

Como QA Manager,
quiero generar un resumen exportable por equipo, por supervisor, por agente y por rango de fechas, con la fecha y hora en que se generó y los filtros que usé,
para presentarlo como evidencia en una auditoría y poder volver a descargar exactamente lo que se entregó.

Como supervisor,
quiero generar ese resumen para mi propio equipo,
para respaldar mis revisiones con un documento fechado sin pedir apoyo a otro rol.

## Contexto

Una auditoría necesita un documento que muestre qué se midió, a quién, en qué periodo y cuándo se produjo. Esta funcionalidad lo resuelve con el generador de reportes: se elige el alcance por equipo, supervisor o agentes, se fija el periodo y se exporta el resumen en PDF, CSV o Excel. Cada exportación queda registrada con su fecha, hora y tipo de disparo, y los reportes pueden guardarse y programarse para repetirse. La portada del PDF indica cuándo se generó y qué alcance tiene. La pantalla vive en Reports, con las pestañas Builder, Saved, Generated y Schedules.

**La sección Reports.** Es una pantalla con un encabezado, una franja de indicadores del módulo y cuatro pestañas, cada una con su contador:

- **Builder:** el generador. A la izquierda se arma el reporte en cuatro pasos y a la derecha se ve el documento tal como lo recibirá quien lo lea.
- **Saved:** los reportes guardados, incluidos algunos de plantilla. Se pueden cargar en el generador, duplicar y borrar, salvo las plantillas, que no se borran.
- **Generated:** el historial de cada exportación, manual o programada.
- **Schedules:** los reportes programados, con su próxima ejecución, un interruptor para activarlos o pausarlos y una acción para generarlos al momento.

**Perfiles con acceso.**

| Perfil            | Acceso                                                  | Alcance de los datos                                                               |
| ----------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| QA Manager        | Menú Reports                                            | Todos los equipos                                                                  |
| Operation Manager | Menú Reports, que abre la misma pantalla del QA Manager | Todos los equipos                                                                  |
| Supervisor        | Menú Reports                                            | Solo su equipo, con el filtro de equipo bloqueado y solo los reportes de su equipo |
| Agente            | Sin acceso                                              | No aplica                                                                          |

## Referencias de diseño

- Figma: Pendiente (referencia: captura del ticket de Monday "QA Auto - Reportes de Auditoría").
- Componentes clave: acordeón de pasos, selectores múltiples, vista previa paginada en tamaño carta, tablas del historial y etiquetas de estado. Todos existen en el producto.

## Alcance

**Incluye:**

- Elegir el alcance del resumen: por equipo, por supervisor, por agente o por una combinación, con filtros de campaña y línea de negocio. Un supervisor queda limitado a su propio equipo.
- Elegir el rango de fechas con rangos predefinidos de 7 días, 30 días, 90 días y 12 meses, o un rango personalizado.
- Agrupar las filas por equipo, supervisor, agente, campaña, línea de negocio o sin agrupar.
- Elegir qué secciones y qué KPI entran en el resumen. Cada sección es una tabla con una columna por KPI.
- Portada del PDF con el nombre del reporte, el periodo, el alcance y la fecha y hora de generación.
- Exportar a PDF, CSV y Excel. El nombre del CSV incluye el nombre del reporte y el rango de fechas.
- Historial de lo generado con fecha, hora, formato, si fue manual o programado, tamaño y estado, y descargar de nuevo un CSV ya generado.
- Guardar el reporte con un nombre para reutilizarlo, y programar su generación semanal, quincenal o mensual con destinatarios.
- Textos en español e inglés.

**No incluye:**

- Extracción de datos crudos: una fila por llamada con sus puntajes. Hoy el resumen agrega los valores por equipo, supervisor o agente.
- Fecha y hora de generación dentro del archivo CSV y del Excel. Hoy solo la portada del PDF y el historial la llevan.
- Una constancia de evidencia en cada exportación con quién la generó y los filtros usados.
- Firma, sello de tiempo verificable o garantía de que el archivo no fue modificado.
- Datos reales: el prototipo calcula todo sobre datos de ejemplo.

## Estados de UI y casos límite

| Estado              | Disparador                                             | Comportamiento de UI                                                                                   |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Reporte nuevo       | Se abre Builder sin reporte cargado                    | Pasos abiertos, con un resumen de una línea en la cabecera de cada paso y la vista previa a la derecha |
| Alcance sin agentes | Los filtros no dejan ningún agente                     | Mensaje "The scope has no agents" y bloqueo de Guardar y Generar                                       |
| Rango inválido      | La fecha final es anterior a la inicial                | Error en el campo de fecha y la cabecera del paso se marca en rojo                                     |
| Rango muy largo     | El periodo anterior no cabe en el historial disponible | La comparación con el periodo anterior queda sin datos                                                 |
| Sin datos           | Ninguna llamada en el alcance y rango                  | La sección muestra "No data for this section in the selected period"                                   |
| Generando PDF       | Se pulsa Generate con PDF                              | Se abre la impresión del documento y se registra la exportación en Generated                           |
| Generando CSV       | Se pulsa Generate con CSV                              | Se descarga el archivo, aparece un aviso y la exportación queda en Generated                           |
| Descargar de nuevo  | Se pulsa descargar sobre un CSV del historial          | Se descarga el mismo contenido que se generó entonces                                                  |
| Reporte programado  | La programación está activa                            | Aparece en Schedules con su próxima ejecución; "Run now" lo genera en el momento                       |
| Rol supervisor      | Un supervisor abre Reports                             | Solo ve y genera reportes de su equipo, con el filtro de equipo bloqueado                              |
| Cambios sin guardar | Se pulsa "Start a new report" con edición pendiente    | Confirmación para descartar o seguir editando                                                          |

Interacción: el generador y la vista previa se ven lado a lado en pantallas anchas; la vista previa se recorre por páginas con los botones o las flechas; todo debe verse bien en modo claro y oscuro.

## Notas de datos y lógica

- El alcance se resuelve sobre el listado de agentes del rol: un agente elegido a mano cuenta aunque no cumpla los filtros de equipo, campaña o línea de negocio.
- El historial de generados guarda el momento exacto de la exportación y si fue manual o programada.
- Un CSV generado se conserva en el historial para poder descargarse de nuevo con el mismo contenido.
- La portada del PDF toma el nombre, el periodo, el alcance y la fecha y hora de generación del reporte al momento de exportar.
- Permisos: el QA Manager y el Operation Manager ven todos los equipos; el supervisor solo su equipo; el agente no tiene acceso a Reports.

## Criterios de aceptación

```gherkin
Escenario: Resumen por equipo y rango de fechas
  Dado que soy QA Manager y abro Reports, Builder
  Cuando elijo el equipo "Team 2", el rango de 30 días y la sección Quality Assurance
  Entonces la vista previa muestra una tabla con los agentes de Team 2 y la portada indica el periodo y el alcance

Escenario: Resumen por agente
  Dado que agrego a dos agentes concretos al alcance
  Cuando genero el reporte en PDF
  Entonces el documento solo incluye a esos dos agentes y la portada muestra la fecha y hora de generación

Escenario: Quedar registrado como evidencia
  Dado que genero un reporte en CSV
  Cuando abro la pestaña Generated
  Entonces veo la exportación con su fecha, hora, formato y que fue manual

Escenario: Descargar de nuevo lo entregado
  Dado que existe un CSV en Generated
  Cuando pulso descargar
  Entonces recibo un archivo con el mismo contenido que se generó entonces

Escenario: Supervisor limitado a su equipo
  Dado que entro como supervisor
  Cuando abro el generador
  Entonces el filtro de equipo está bloqueado en mi equipo y no puedo agregar agentes de otros equipos
```

- [ ] El nombre del CSV incluye el nombre del reporte y el rango de fechas.
- [ ] La portada del PDF muestra el periodo, el alcance y la fecha y hora de generación.
- [ ] Cada exportación aparece en Generated con su fecha, hora, formato y tipo de disparo.
- [ ] Todos los textos existen en español e inglés y el contraste es correcto en modo claro y oscuro.

## Accesibilidad

- El orden de foco recorre los pasos del generador de arriba abajo, y cada paso con error lo comunica con texto además del icono.
- El historial es una tabla con encabezados, y las acciones de descarga tienen etiqueta con el nombre del reporte.
- La vista previa se puede recorrer con teclado.

## Preguntas abiertas

- ¿Qué significa TM en el ticket? Se asumió supervisor o gerente de equipo, porque el agente se lista aparte.
- ¿La extracción de datos crudos debe traer una fila por llamada con todos sus puntajes? De ser así, ¿qué campos y en qué formato?
- ¿Qué debe llevar la constancia de evidencia: fecha y hora, quién lo generó, filtros usados y una huella del archivo?
- ¿Cuánto tiempo se conservan los archivos generados en el historial?
