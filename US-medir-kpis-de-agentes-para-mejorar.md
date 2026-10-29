# US-medir-kpis-de-agentes-para-mejorar: Reportes de estadísticas y tendencias de agentes por KPI

**Prioridad:** Debería · **Estimación:** M — intuición inicial, el equipo la refina

## Historia

Como QA Manager,
quiero armar un reporte con un grupo de agentes y ver su desempeño y su progreso en cada KPI de calidad, cumplimiento, sentimiento y negocio,
para identificar quién mejora y quién necesita apoyo, y llevar lo aprendido de vuelta al piso del contact center.

Como supervisor,
quiero generar el mismo reporte para mi propio equipo y programarlo para que llegue de forma periódica,
para seguir la evolución de mis agentes sin armar el análisis cada vez.

## Contexto

Un reporte reúne en un documento las estadísticas de un grupo de agentes durante un periodo. Cada sección de evaluación se divide en subsecciones que son los KPI, por ejemplo ECN, ENC, ECC y ECUF dentro de Quality Assurance. La sección se muestra como una tabla con una fila por agente y una columna por KPI. El progreso se ve contra el periodo anterior, con la dirección del cambio por agente, y las tendencias en el tiempo pueden añadirse como gráficas. El documento se genera con una vista previa en páginas tamaño carta, se exporta y puede guardarse y programarse. La pantalla vive en Reports, con las pestañas Builder, Saved, Generated y Schedules.

## Referencias de diseño

- Figma: Pendiente (referencia: captura del ticket de Monday "QA Auto - Measure Agents KPI to Improve", tabla "Agent Performance").
- Componentes clave: tarjetas de sección, acordeón de pasos, tabla del documento, gráficas de barras y líneas, selectores múltiples y etiquetas de estado. Todos existen en el producto.

## Alcance

**Incluye:**

- Constructor de reportes en cuatro pasos: Audience & basics, Sections & metrics, Scope & period y Output & delivery, con una vista previa en vivo a la derecha.
- Elegir el grupo de agentes: selector de agentes con conteo de cuántos entran, atajos para agregar a todos los agentes de un equipo, supervisor o campaña, y filtros de equipo, campaña y línea de negocio que acotan la lista.
- Elegir secciones y subsecciones. QA: puntaje general, ECN, ENC, ECC, ECUF y fallas automáticas. Compliance: puntaje general, seguridad, regulatorio, legal y violaciones. Sentimiento y emoción: sentimiento del cliente y del agente, emociones del cliente y del agente, recuperación y caídas. Negocio: conversión, objeciones, competidor más precio y ofertas mal dirigidas. También las secciones de resumen, campañas, agentes, coaching y aprendizaje, disputas, burnout y rankings.
- Una tabla por sección con una fila por agente, todos los agentes del alcance sin fila "Otros", y una columna por cada subsección marcada.
- Periodo: 7 días, 30 días, 90 días, 12 meses o un rango personalizado, con comparación contra el periodo anterior y una columna de cambio con flecha.
- Vista por subsección: valores, barras o líneas. Las barras y líneas se agregan sobre la tabla. Con más de cuatro agentes, las líneas pasan a un panel pequeño por agente con su valor actual y su cambio.
- Agrupar las filas por equipo, supervisor, agente, campaña, línea de negocio o sin agrupar.
- Vista previa paginada en tamaño carta con navegación entre páginas.
- Exportar a PDF, CSV y Excel. Guardar reportes, ver el historial de lo generado y programar el envío semanal, quincenal o mensual a una lista de destinatarios.
- Reportes para cliente con agentes seudonimizados y solo las secciones externas.
- Textos en español e inglés.

**No incluye:**

- Tasa de aprobación y número de llamadas aprobadas y reprobadas por agente.
- Columna de ranking ordenada por el KPI elegido y ordenar la tabla desde el documento.
- Barra de progreso dentro de la celda de cada fila.
- Crear una sesión de coaching o una asignación directamente desde un agente del reporte.
- Datos reales: el prototipo calcula todo sobre datos de ejemplo.

## Estados de UI y casos límite

| Estado                  | Disparador                                          | Comportamiento de UI                                                                                                                                                                                   |
| ----------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Reporte nuevo           | Se abre Builder sin reporte cargado                 | Todos los pasos abiertos, sin gráficas, con un resumen de una línea en la cabecera de cada paso                                                                                                        |
| Paso con error          | Se guarda o genera con datos faltantes              | La cabecera del paso se marca en rojo con el primer error: nombre obligatorio, nombre de cliente, al menos una sección, al menos un formato, fecha final posterior a la inicial, o alcance sin agentes |
| Alcance sin agentes     | Los filtros no dejan ningún agente                  | Mensaje "The scope has no agents" bajo el selector y bloqueo de Guardar y Generar                                                                                                                      |
| Sección sin datos       | Ningún agente tuvo llamadas en el periodo           | La sección muestra "No data for this section in the selected period"                                                                                                                                   |
| Sin periodo anterior    | La comparación está apagada                         | Se oculta la columna de cambio y las flechas                                                                                                                                                           |
| Subsecciones colapsadas | Una sección está marcada                            | Resume "6 de 6 subsecciones" y su vista; un botón las despliega                                                                                                                                        |
| Vistas distintas        | Las subsecciones tienen vistas diferentes           | El selector de la sección muestra "Mixed"                                                                                                                                                              |
| Última subsección       | Solo queda una marcada                              | La casilla se bloquea con un aviso de que debe quedar al menos una                                                                                                                                     |
| Audiencia cliente       | Se cambia a cliente                                 | Se quitan las secciones internas con un aviso de cuántas, y los agentes se muestran como Agent 01, 02…                                                                                                 |
| Cambios sin guardar     | Se pulsa "Start a new report" con edición pendiente | Confirmación para descartar o seguir editando                                                                                                                                                          |
| Muchos agentes          | Más agentes de los que caben en una página          | Las barras y la tabla se parten entre páginas con el encabezado repetido                                                                                                                               |
| Rol supervisor          | Un supervisor abre Reports                          | Solo su equipo, con el filtro de equipo bloqueado                                                                                                                                                      |

Interacción: el selector de agentes admite búsqueda; las páginas del documento se recorren con los botones o las flechas del teclado; todo debe verse bien en modo claro y oscuro. En pantallas estrechas el constructor y la vista previa se apilan.

## Notas de datos y lógica

- Cada fila combina las llamadas del agente en el periodo. Los puntajes de calidad y cumplimiento son porcentajes, el sentimiento va de 1 a 5, y ECN, ENC, ECC y ECUF son conteos de errores.
- La columna de cambio compara la primera subsección marcada contra el periodo anterior de la misma duración. La flecha va en verde si el cambio mejora el KPI y en rojo si lo empeora, según el sentido de cada métrica.
- Las gráficas usan la primera métrica de cada subsección. La tabla conserva siempre los valores exactos.
- Un supervisor ve solo su equipo; el QA Manager ve todos. Un reporte para cliente nunca incluye secciones internas ni nombres reales cuando se ocultan.
- La exportación CSV lleva un bloque por sección con las mismas columnas que la tabla.
- Los reportes programados se envían con la hora, frecuencia y destinatarios definidos, y cada ejecución queda en el historial de generados.

## Criterios de aceptación

```gherkin
Escenario: Medir un grupo de agentes en un KPI
  Dado que soy QA Manager y abro Reports, Builder
  Cuando agrego a todos los agentes de un equipo, marco Quality Assurance con ECN y ECC, y elijo 30 días
  Entonces la vista previa muestra una tabla con una fila por agente y columnas Overall, ECN y ECC

Escenario: Ver el progreso contra el periodo anterior
  Dado que la comparación con el periodo anterior está activa
  Cuando reviso la tabla
  Entonces veo para cada agente el cambio del primer KPI con una flecha verde si mejoró y roja si empeoró

Escenario: Añadir la tendencia de un KPI
  Dado que ECN está en vista de valores
  Cuando cambio ECN a líneas
  Entonces aparece el subtítulo "ECN" y, sobre la tabla, una gráfica de su tendencia
  Y con más de cuatro agentes veo un panel pequeño por agente con su valor actual

Escenario: Alcance sin agentes
  Dado que los filtros no dejan ningún agente
  Cuando pulso Generate
  Entonces veo "The scope has no agents" y no se genera el reporte

Escenario: Programar el reporte
  Dado que el reporte es válido
  Cuando activo la programación mensual con destinatarios
  Entonces el reporte aparece en Schedules y cada ejecución queda en Generated
```

- [ ] Todos los agentes del alcance aparecen en la tabla, sin fila "Otros".
- [ ] Cada subsección marcada es una columna; las desmarcadas no aparecen.
- [ ] El valor por defecto de todas las subsecciones es valores, sin gráficas.
- [ ] El CSV tiene un bloque por sección con las mismas columnas que la tabla.
- [ ] Un reporte para cliente no muestra secciones internas ni nombres de agentes cuando se ocultan.
- [ ] Todos los textos existen en español e inglés y el contraste es correcto en modo claro y oscuro.

## Accesibilidad

- El orden de foco recorre los pasos del constructor de arriba abajo; cada selector de vista tiene una etiqueta que nombra la subsección.
- El estado de un paso con error se comunica con texto y con el icono, no solo con color.
- La dirección del cambio se comunica con la flecha y con el número, no solo con el color verde o rojo.
- Las gráficas tienen la tabla de valores como alternativa de texto.

## Preguntas abiertas

- ¿Qué cuenta como llamada aprobada? Se propone un puntaje mínimo de QA configurable en Settings, para calcular la tasa de aprobación y las llamadas aprobadas y reprobadas.
- ¿La tabla debe ordenarse por el KPI elegido y llevar una columna de posición?
- ¿Se agrega una acción "dar coaching a este agente" que cree una sesión desde el reporte?
- ¿El XLSX debe traer una hoja por sección además de la tabla consolidada?
