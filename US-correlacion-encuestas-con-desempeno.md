# US-correlacion-encuestas-con-desempeno: Correlación entre encuestas de clientes y desempeño del agente

**Prioridad:** Debería · **Estimación:** M — intuición inicial, el equipo la refina

## Historia

Como QA Manager,
quiero ver el NPS, el CSAT y los comentarios de las encuestas de clientes junto al puntaje de QA de cada agente,
para saber si lo que mide la calidad coincide con lo que perciben los clientes y detectar a los agentes donde no coincide.

Como supervisor,
quiero ver las encuestas de mi equipo agrupadas por agente y su cambio frente al periodo anterior,
para identificar quién necesita apoyo según la opinión de sus clientes y no solo según su puntaje.

Como Operation Manager,
quiero ver las encuestas por equipo, campaña y línea de negocio, y llevarlas a un reporte,
para entender cómo se relaciona la experiencia del cliente con la calidad en toda la operación.

## Contexto

Las encuestas posteriores a la llamada, NPS de 0 a 10 y CSAT de 1 a 5, con un comentario opcional, se cruzan con la evaluación de calidad de la misma llamada. Cada respuesta pertenece a una llamada, y por eso hereda al agente, el equipo, la campaña, el periodo y el puntaje de QA. Con esa unión se calculan el NPS, el CSAT promedio, la tasa de respuesta y la proporción de detractores, se comparan por banda de puntaje de QA y por agente, y se llevan a los reportes. Solo los contactos efectivos pueden responder. El NPS va de −100 a 100: restar la proporción de detractores, de 0 a 6, a la de promotores, de 9 a 10. La función vive en Team Analytics, en la pestaña Customer surveys, y en el generador de reportes, en la sección Customer surveys.

## Referencias de diseño

- Figma: Pendiente (referencia: captura del ticket de Monday "Survey-to-Performance Correlation").
- Componentes clave: tarjetas de indicadores, gráfica de tendencia, barras horizontales, gráfico de dispersión, tablas con paginación y etiquetas de estado. Todos existen en el producto.

## Alcance

**Incluye:**

- Pestaña Customer surveys en Team Analytics para supervisor, QA Manager y Operation Manager, con los mismos filtros, la misma agrupación y la misma comparación con el periodo anterior que las demás pestañas.
- Indicadores: NPS, CSAT promedio, tasa de respuesta sobre contactos efectivos, proporción de detractores y número de respuestas, cada uno con su cambio frente al periodo anterior.
- Tendencia por periodo con selector de métrica. Agrupada, dibuja una línea por segmento y pasa a un panel pequeño por segmento con más de cuatro.
- NPS por banda de puntaje de QA, con los cortes de las bandas de QA que se configuran en Settings y el número de respuestas de cada banda.
- Dispersión por agente: puntaje de QA contra NPS, con el nombre del agente, su QA, su NPS y sus respuestas al pasar el cursor. Solo aparecen agentes con al menos cinco respuestas NPS.
- Últimos doce comentarios dentro de los filtros, con fecha, agente, tipo y calificación. La respuesta se marca en rojo solo si es de un detractor, NPS de 0 a 6 o CSAT de 1 a 2.
- Tabla de segmentación con una fila por equipo, supervisor, agente, campaña o línea de negocio, y su cambio.
- Sección Customer surveys en los reportes, con las subsecciones NPS, CSAT, Tasa de respuesta y Detractores. Cada subsección es una columna de la tabla de la sección y puede mostrarse como valores, barras o líneas. Está disponible también en reportes para clientes.
- Textos en español e inglés.

**No incluye:**

- Que el agente vea la función: queda fuera de su menú y de sus rutas.
- Crear, enviar o configurar encuestas: las respuestas vienen de la fuente de encuestas existente.
- Motivo de la llamada como dimensión de análisis, porque aún no existe un catálogo de motivos.
- Cruce con comportamientos concretos del agente, como errores de QA específicos o emociones, más allá del puntaje general de QA.
- Datos reales: el prototipo calcula todo sobre datos de ejemplo.

## Estados de UI y casos límite

| Estado                      | Disparador                                       | Comportamiento de UI                                                               |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Con respuestas              | Hay encuestas dentro de los filtros              | Indicadores, tendencia, correlación, comentarios y segmentación con datos          |
| Sin respuestas              | Ninguna encuesta en el periodo y alcance         | Las tarjetas muestran su estado vacío y los indicadores indican que no hay datos   |
| Agente con pocas respuestas | Menos de cinco respuestas NPS                    | No aparece en la dispersión; una nota lo explica                                   |
| Banda sin respuestas        | Ninguna respuesta en una banda de QA             | La banda no tiene barra; el resto se dibuja                                        |
| Sin periodo anterior        | La comparación está apagada                      | Se oculta el cambio de los indicadores y de la segmentación                        |
| Detractor                   | Respuesta NPS de 0 a 6 o CSAT de 1 a 2           | Etiqueta en rojo; las demás en gris                                                |
| Comentario ausente          | La respuesta no trae texto                       | Solo cuenta para los indicadores y no aparece en la tabla de comentarios           |
| Rol agente                  | Un agente intenta abrir Team Analytics o Reports | Sin acceso a esas rutas                                                            |
| Reporte para cliente        | La audiencia del reporte es un cliente           | La sección está disponible y los agentes aparecen seudonimizados cuando se ocultan |

Interacción: los filtros se aplican a toda la pestaña a la vez, y todo se ve bien en modo claro y oscuro. El rojo solo marca detractores.

## Notas de datos y lógica

- Cada respuesta guarda tipo NPS o CSAT, calificación y, cuando existe, el comentario, y se liga a la llamada que originó la encuesta.
- NPS de una población: promotores menos detractores, sobre las respuestas NPS, en enteros de −100 a 100. CSAT: promedio de 1 a 5 con un decimal. Tasa de respuesta: respuestas sobre contactos efectivos. Proporción de detractores: detractores sobre respuestas NPS.
- Las bandas de QA usan los cortes configurados en Settings: bajo el mínimo, entre el mínimo y el objetivo, y en el objetivo o por encima.
- Un reporte para cliente nunca muestra nombres reales de agentes si se ocultan.
- Permisos: supervisor, QA Manager y Operation Manager. El supervisor ve solo su equipo.

## Criterios de aceptación

```gherkin
Escenario: Ver las encuestas de un equipo
  Dado que soy supervisor y abro Team Analytics, Customer surveys
  Cuando elijo un periodo de 30 días
  Entonces veo el NPS, el CSAT, la tasa de respuesta y la proporción de detractores de mi equipo con su cambio

Escenario: Comparar NPS con la calidad
  Dado que la pestaña tiene respuestas
  Cuando reviso el NPS por banda de puntaje de QA
  Entonces veo una barra por banda con su NPS y su número de respuestas

Escenario: Ubicar a un agente
  Dado que un agente tiene al menos cinco respuestas NPS
  Cuando paso el cursor por su punto en la dispersión
  Entonces veo su nombre, su puntaje de QA, su NPS y sus respuestas

Escenario: Llevarlo a un reporte
  Dado que estoy en Reports, Builder
  Cuando marco la sección Customer surveys con las subsecciones NPS y CSAT
  Entonces la vista previa muestra una tabla con una fila por agente y una columna por subsección

Escenario: Reporte para cliente
  Dado que la audiencia del reporte es un cliente
  Cuando marco la sección Customer surveys
  Entonces la sección se incluye y los agentes se muestran seudonimizados
```

- [ ] El NPS se muestra como entero con signo y el CSAT con un decimal.
- [ ] Los cortes de las bandas coinciden con los de Settings.
- [ ] Todos los textos existen en español e inglés y el contraste es correcto en modo claro y oscuro.

## Accesibilidad

- La dispersión tiene la tabla de segmentación por agente como alternativa de texto.
- Los detractores se identifican por la etiqueta de texto y no solo por el color rojo.
- Los controles de filtro y las tablas se operan con teclado.

## Preguntas abiertas

- ¿El motivo de la llamada saldrá de un catálogo nuevo o del catálogo de causas raíz de sentimiento?
- ¿Qué comportamientos del agente deben cruzarse con la encuesta además del puntaje general: errores de QA concretos, emociones o señales de negocio?
- ¿Cuántas respuestas mínimas por agente se consideran suficientes para mostrarlo? Hoy son cinco.
- ¿La tasa de respuesta debe calcularse sobre contactos efectivos o sobre todas las llamadas?
