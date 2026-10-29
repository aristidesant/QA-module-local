# US-analisis-de-comentarios-de-encuestas: Análisis de los comentarios de las encuestas de clientes

**Prioridad:** Debería · **Estimación:** L — intuición inicial, el equipo la refina

## Historia

Como QA Manager,
quiero que los comentarios de texto libre de las encuestas se conviertan en temas y causas raíz, con foco en los comentarios de los detractores,
para entender por qué los clientes califican mal y actuar sobre el problema y no solo sobre el número.

Como supervisor,
quiero ver los comentarios de mi equipo agrupados por tema y los de cada agente con su calificación,
para dar coaching con lo que el cliente realmente dijo.

Como Operation Manager,
quiero ver qué temas se repiten entre los detractores por equipo y campaña,
para priorizar mejoras de proceso, precio o capacidad.

## Contexto

Una encuesta de satisfacción trae una calificación y, a veces, un comentario. El análisis de comentarios lee ese texto libre y lo convierte en información estructurada: de qué habla el cliente, qué tema es y qué causa está detrás de una calificación baja. Cada comentario conserva su calificación, el agente y la llamada que lo originó, de modo que un tema se puede cruzar con el desempeño. El resultado se consulta en Team Analytics, junto a las demás métricas de encuestas, y puede llevarse a los reportes. Los comentarios de detractores y pasivos se clasifican con el mismo catálogo de causas raíz que usan las caídas de sentimiento, con sus familias de negocio y de agente, y los de promotores con una lista corta de fortalezas.

## Referencias de diseño

- Figma: Pendiente (referencia: captura del ticket de Monday "Survey Commentary Analysis").
- Componentes clave: tabla con etiquetas de estado, barras horizontales de ranking, tarjetas de sección y filtros de Team Analytics. Todos existen en el producto.

## Alcance

**Incluye:**

- Tabla de los últimos comentarios dentro de los filtros de Team Analytics, con fecha, agente, tipo de encuesta, calificación, tema y texto, visible para supervisor, QA Manager y Operation Manager.
- Marca de detractor en rojo para NPS de 0 a 6 y CSAT de 1 a 2, y en gris para el resto. Las etiquetas de tema van siempre en gris.
- Clasificación de cada comentario por tema: los de detractores y pasivos con una de las nueve causas raíz del catálogo de sentimiento, con los nombres y descripciones configurados; los de promotores con una de cuatro fortalezas: resolución rápida, explicación clara, agente paciente y resuelto en la primera llamada.
- Palabras resaltadas en cada comentario: las que sostienen el tema detectado.
- Ranking de las causas detrás de los comentarios de detractores, con el número de comentarios, su proporción y el cambio frente al periodo anterior, y la proporción entre causas de negocio y de agente con cuántas respuestas de detractores se clasificaron.
- Ranking de las fortalezas que nombran los promotores.
- Tendencia por periodo de las cuatro causas más frecuentes.
- Filtro "Comment themes" en el cajón de filtros de Team Analytics, agrupado en causas raíz y fortalezas, que acota toda la pestaña.
- Cada comentario ligado a su agente, su equipo y su campaña, de modo que respeta los filtros y la agrupación existentes.
- Los comentarios del cliente visibles en el historial de encuestas de su perfil.

**No incluye:**

- Sección de comentarios por tema en los reportes.
- Revisión humana del tema detectado, para confirmarlo o corregirlo.
- Temas fuera del catálogo de causas raíz y de la lista de fortalezas.
- Datos reales: el prototipo asigna los temas a comentarios de ejemplo.

## Estados de UI y casos límite

| Estado                         | Disparador                                | Comportamiento de UI                                                                                        |
| ------------------------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Con comentarios                | Hay comentarios dentro de los filtros     | La tabla muestra los doce más recientes, del más nuevo al más antiguo                                       |
| Sin comentarios                | Ninguna respuesta con texto en el periodo | La tarjeta muestra su estado vacío                                                                          |
| Detractor                      | NPS de 0 a 6 o CSAT de 1 a 2              | Etiqueta de calificación en rojo                                                                            |
| Respuesta sin texto            | La encuesta no trae comentario            | No aparece en la tabla de comentarios                                                                       |
| Comentario largo               | El texto supera el ancho de la celda      | Se muestra completo en varias líneas                                                                        |
| Rol agente                     | Un agente intenta abrir Team Analytics    | Sin acceso                                                                                                  |
| Tema sin detectar              | El análisis no reconoce ningún tema       | El comentario queda como "Sin tema" y entra al análisis con esa etiqueta                                    |
| Filtro por tema                | Se elige un tema en el cajón de filtros   | Toda la pestaña muestra solo las respuestas cuyo comentario tiene ese tema, y aparece un chip para quitarlo |
| Sin comentarios de detractores | Ningún detractor dejó texto en el periodo | El ranking, la proporción de negocio y agente y la tendencia muestran su estado vacío                       |

Interacción: la tabla respeta los filtros de la pestaña y se recorre con teclado. Modo claro y oscuro correctos; el rojo solo marca detractores.

## Notas de datos y lógica

- Cada comentario trae tipo de encuesta, calificación, texto, fecha, agente y la llamada de origen.
- Un tema pertenece a un catálogo cerrado. Un comentario puede tener un tema principal y temas secundarios, y los agregados cuentan el principal.
- Un comentario de detractor o de pasivo lleva una causa raíz; uno de promotor lleva una fortaleza. Cada tema guarda las palabras del texto que lo sostienen.
- El ranking cuenta solo los comentarios de detractores, y su proporción es sobre ellos. La cantidad de respuestas de detractores sin comentario se muestra aparte.
- Los datos personales que aparezcan en un comentario se ocultan según las reglas de Privacy antes de mostrarlos.
- Permisos: supervisor, QA Manager y Operation Manager. El supervisor ve solo su equipo.

## Criterios de aceptación

```gherkin
Escenario: Leer los últimos comentarios
  Dado que soy supervisor y abro Team Analytics, Customer surveys
  Cuando reviso la tabla de comentarios recientes
  Entonces veo la fecha, el agente, el tipo, la calificación y el texto de cada comentario

Escenario: Distinguir a los detractores
  Dado que un comentario viene de una respuesta NPS de 4
  Cuando lo veo en la tabla
  Entonces su calificación aparece en rojo y las de promotores y pasivos en gris

Escenario: Respetar los filtros
  Dado que filtro por un agente
  Cuando reviso la tabla
  Entonces solo veo comentarios de ese agente

Escenario: Ver las causas detrás de los detractores
  Dado que hay comentarios de detractores dentro de los filtros
  Cuando reviso el ranking de causas
  Entonces veo cada causa con su número de comentarios, su proporción y su cambio frente al periodo anterior

Escenario: Ver el tema de un comentario
  Dado que un comentario menciona una espera de veinte minutos
  Cuando lo veo en la tabla
  Entonces aparece su etiqueta de tema y las palabras de la espera quedan resaltadas

Escenario: Filtrar por tema
  Dado que elijo "Pricing & billing" en Comment themes
  Cuando se aplica el filtro
  Entonces toda la pestaña muestra solo respuestas cuyo comentario trata de precio y facturación
```

- [ ] Solo aparecen respuestas que traen comentario.
- [ ] Toda respuesta con comentario trae un tema, y el texto resaltado es parte del comentario.
- [ ] Los nombres de las causas siguen los que configura el QA Manager en Settings.
- [ ] Los datos personales del texto se muestran ocultos.
- [ ] Todos los textos existen en español e inglés y el contraste es correcto en modo claro y oscuro.

## Accesibilidad

- La condición de detractor se comunica con la etiqueta de texto y no solo con el color.
- La tabla tiene encabezados y se recorre con teclado.

## Preguntas abiertas

- ¿Los temas detectados pueden corregirse por una persona, con revisión como en las causas de sentimiento?
- ¿Las fortalezas necesitan descripciones configurables como las causas raíz, o la lista queda fija?
- ¿La sección de comentarios por tema debe llegar también a los reportes?
- ¿Un comentario puede tener más de un tema, o siempre se cuenta solo el principal?
