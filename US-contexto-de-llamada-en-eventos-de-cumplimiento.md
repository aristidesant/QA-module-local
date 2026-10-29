# US-contexto-de-llamada-en-eventos-de-cumplimiento: Contexto de la llamada ante un evento de cumplimiento

**Prioridad:** Debería · **Estimación:** S — intuición inicial, el equipo la refina

## Historia

Como supervisor o QA Manager,
quiero abrir la llamada de un evento de cumplimiento y tener en un solo lugar la grabación, la transcripción, los hallazgos con su evidencia y las notas del equipo,
para entender qué pasó en el momento exacto y dejar constancia de mi revisión sin buscar la información en varias pantallas.

## Contexto

Cuando una llamada tiene un evento de cumplimiento, por ejemplo una divulgación de grabación omitida, quien la revisa necesita entender qué ocurrió sin escuchar la conversación completa. Esta funcionalidad reúne en la pantalla de la llamada todo el contexto de ese evento. Incluye los momentos clave marcados, la grabación y la transcripción sincronizadas, los hallazgos de cumplimiento con su frase exacta y su minuto, y las notas compartidas del equipo. El revisor salta directo al momento del evento, comprueba la evidencia y deja constancia escrita de su revisión para que otra persona no repita el análisis. Los datos sensibles se muestran ocultos en toda la pantalla.

## Referencias de diseño

- Figma: Pendiente (referencia: captura del ticket de Monday "Cumplimiento - Contexto de Llamada y Accountability").
- Componentes clave: reproductor con línea de tiempo, transcripción, pestaña Compliance, sección de puntos de anclaje y sección de notas. Todos existen en el producto; no hay componentes nuevos.

## Alcance

**Incluye:**

- Saltar a los momentos clave de la llamada desde los puntos de anclaje, cada uno ligado a un turno de la transcripción y a un segundo de la grabación.
- Revisar la grabación y la transcripción en la misma pantalla, con el turno resaltado al reproducir.
- Ver en la pestaña Compliance los hallazgos por área, con la frase exacta y el minuto. Ejemplo: "Recording disclosure given at the start".
- Dejar y leer notas compartidas sobre la llamada, con la opción de ligarlas a un minuto.
- Datos sensibles ocultos en frases, notas y transcripción.
- Textos en español e inglés.

**No incluye:**

- Petición en lenguaje natural para encontrar llamadas, como "Show me calls where there was a missed recording disclosure".
- Lista de llamadas filtrada por un evento concreto de cumplimiento.
- Tarea de cumplimiento con responsable, estado y fecha límite.
- Avisos o menciones a otras personas.

## Estados de UI y casos límite

| Estado                  | Disparador                                                     | Comportamiento de UI                                                                                                        |
| ----------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Llamada con evento      | La llamada tiene hallazgos o puntos de anclaje de cumplimiento | La pestaña Compliance muestra los hallazgos y los puntos, con el número de pendientes                                       |
| Llamada sin hallazgos   | La evaluación no encontró nada                                 | Mensaje breve de que no hay hallazgos; la grabación y la transcripción siguen disponibles                                   |
| Saltar a un momento     | Se pulsa un punto, una frase o su marca en el reproductor      | La grabación salta a ese segundo y el turno queda resaltado en la transcripción                                             |
| Sin notas               | Nadie ha escrito sobre la llamada                              | Mensaje que invita a dejar la primera nota                                                                                  |
| Nota ligada a un minuto | La nota tiene un minuto                                        | Al pulsar el minuto la grabación salta ahí                                                                                  |
| Datos sensibles         | Una frase o nota los contiene                                  | Se muestran ocultos hasta que un QA Manager los revele                                                                      |
| Rol agente              | Un agente abre su llamada                                      | Ve hallazgos y puntos con su evidencia, puede reproducirlos y disputarlos, pero no ve las notas ni las acciones de revisión |
| Evaluación en curso     | La llamada aún se está analizando                              | Aviso de que la evaluación no está lista; la grabación y la transcripción se pueden usar                                    |

Interacción: todo el recorrido se puede hacer con teclado y se ve bien en modo claro y oscuro. En pantallas estrechas las secciones se apilan.

## Notas de datos y lógica

- La evaluación de cumplimiento la produce el sistema de forma automática y la pantalla no la edita.
- Cada hallazgo y cada punto de anclaje trae el turno de la transcripción y el segundo de la grabación para poder saltar a él.
- Permisos: supervisor y QA Manager ven y revisan; el agente ve la evidencia de sus llamadas sin notas ni acciones de revisión.
- Las reglas de ocultamiento de datos sensibles son las de Configuración, Privacy.

## Criterios de aceptación

```gherkin
Escenario: Saltar al momento del evento
  Dado que abro una llamada con un punto de anclaje de cumplimiento
  Cuando pulso el punto
  Entonces la grabación salta a su segundo y el turno queda resaltado en la transcripción

Escenario: Revisar la evidencia de un hallazgo
  Dado que la pestaña Compliance muestra un hallazgo
  Cuando lo reviso
  Entonces veo el área, la frase exacta y el minuto en que ocurre

Escenario: Dejar una nota ligada al momento
  Dado que soy supervisor y estoy en el minuto 0:42 de la grabación
  Cuando escribo una nota y marco la opción de ligarla al minuto actual
  Entonces la nota aparece con el minuto 0:42 y al pulsarlo la grabación salta ahí

Escenario: El agente revisa su llamada
  Dado que entro como agente
  Cuando abro una de mis llamadas con hallazgos de cumplimiento
  Entonces veo la evidencia y puedo reproducirla, pero no veo la sección de notas ni botones de revisión
```

- [ ] La grabación, la transcripción y la pestaña Compliance se abren en la misma pantalla de la llamada.
- [ ] Los datos sensibles aparecen ocultos en frases, notas y transcripción.
- [ ] Todos los textos existen en español e inglés.
- [ ] El recorrido mantiene contraste correcto en modo claro y oscuro.

## Accesibilidad

- Los puntos, las frases y los minutos de las notas se activan con teclado.
- El turno resaltado en la transcripción se anuncia al lector de pantalla.
- El estado de un punto se comunica con texto, no solo con color.

## Preguntas abiertas

- ¿El agente debe poder leer las notas del equipo sobre sus propias llamadas? En esta historia no.
- ¿La historia de tarea con responsable y búsqueda en lenguaje natural se redacta como una sola o como dos?
