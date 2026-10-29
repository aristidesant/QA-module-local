# US-evaluacion-de-compliance-de-llamada: Compliance Monitoring en la evaluación de una llamada

**Prioridad:** Imprescindible · **Estimación:** M — intuición inicial, el equipo la refina

## Historia

Como supervisor o QA Manager,
quiero que cada llamada evaluada traiga su evaluación de cumplimiento ya resuelta (puntuación, violaciones y advertencias por área, con la frase exacta de la transcripción y el punto de la grabación donde ocurre),
para detectar incumplimientos y conductas de riesgo sin tener que escuchar o leer cada interacción completa, y actuar solo sobre las llamadas y los momentos que lo necesitan.

Como agente,
quiero ver la evaluación de cumplimiento de mis propias llamadas con la misma evidencia,
para entender qué se me marcó y, si no estoy de acuerdo, disputarlo con contexto.

## Contexto

Es la pestaña **Compliance** de la pantalla de evaluación de una llamada, a la que se llega desde el detalle de una campaña o, en el caso del agente, desde "My Calls". Esa pantalla se describe en conjunto en la historia de evaluación de llamada; esta historia detalla únicamente la pestaña de cumplimiento: qué muestra, cómo sus hallazgos se conectan con la transcripción y el reproductor, y cómo convive con el ocultamiento de datos sensibles, que es lo que sostiene el control "Data Protection". La evaluación la produce el sistema de forma automática al analizar la llamada; la pantalla la muestra y no permite editarla. Historias relacionadas: Disputes (el agente disputa la evaluación de cumplimiento desde esta misma pestaña), Configuración → Compliance (umbrales y bandas de puntuación) y Configuración → Privacy (reglas de ocultamiento de datos sensibles).

## Referencias de diseño

- Figma: Pendiente (captura de referencia: pestaña Compliance de la llamada TXCALL-00311).
- Componentes clave: tarjetas de sección, panel lateral deslizante, aviso en línea, anillo de puntuación, barra de progreso, etiquetas de estado y tooltips, todos ya existentes en el producto. No se necesita ningún elemento visual nuevo.

## Alcance

**Incluye:**

- Pestaña Compliance en el selector de la pantalla, con la puntuación general y la descripción "Security, Regulatory and Legal compliance checks".
- Cabecera del panel: puntuación general en un anillo, estado de la llamada, número de violaciones y de advertencias.
- Tres áreas en orden fijo (Security, Regulatory, Legal), cada una con descripción, puntuación, barra de progreso y sus controles.
- Controles con estado (Compliant, Warning, Violation), puntuación, nota explicativa y cita de evidencia con quién lo dijo, en qué minuto y un botón para reproducir desde ahí.
- Conexión de cada evidencia con su turno de la transcripción (una etiqueta con el nombre del control y el subrayado de las palabras citadas) y con la línea de tiempo del reproductor.
- Ocultamiento de datos sensibles en las citas y en la transcripción, aviso del estado de ese ocultamiento, silenciado de la grabación en esos tramos y posibilidad de revelarlos temporalmente dejando registro del motivo.
- Visibilidad por rol: el agente ve la pestaña y sus hallazgos, pero no puede revelar datos sensibles.

**No incluye:**

- El análisis que calcula las puntuaciones y detecta incumplimientos (lo hace el sistema de evaluación).
- Edición manual de estados, puntuaciones o notas desde esta pestaña. La pestaña es de solo lectura para todos los roles; un control solo cambia cuando el QA Manager resuelve una disputa (ver "Corrección de un control" en Notas de datos y lógica).
- Configuración de categorías, severidades, bandas y umbrales de cumplimiento (Configuración → Compliance).
- Configuración de las reglas de ocultamiento y de la política de revelado (Configuración → Privacy) y el historial de revelados que se consulta allí.
- Chats u otros canales: esta historia cubre llamadas con grabación y transcripción. La evaluación de un chat, que no tiene reproductor, es una historia aparte.
- Vista agregada de cumplimiento por equipo o campaña (Team Analytics) y alertas automáticas por violación (Triggers).
- Apertura y seguimiento de la disputa (cubiertos en la historia de evaluación de llamada y en Disputes).

## Estados de UI y casos límite

| Estado                              | Disparador                                                                 | Comportamiento de UI                                                                                                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Por defecto                         | Se selecciona la pestaña Compliance                                        | El panel derecho muestra la cabecera y las tres áreas; la transcripción y el reproductor muestran solo las marcas de cumplimiento; el reproductor conserva su posición                                     |
| Cargando                            | Se están pidiendo los datos de la llamada                                  | Placeholders de carga en la cabecera y las áreas; sin puntuaciones parciales ni marcas                                                                                                                     |
| Error de carga                      | Falla la obtención de la evaluación                                        | Mensaje de error con la acción "Reintentar" en el panel; el reproductor y la transcripción siguen funcionando si ya habían cargado                                                                         |
| Llamada sin evaluación              | El sistema aún no evaluó la llamada                                        | La pestaña no muestra puntuación y el panel indica que la evaluación está pendiente                                                                                                                        |
| Llamada conforme                    | Ningún control en advertencia ni violación                                 | Estado "Compliant", "0 violations" y "0 warnings" en gris; nada en rojo                                                                                                                                    |
| Llamada con violación               | Al menos un control en violación                                           | Estado "Violation" en rojo y contador de violaciones en rojo; el control muestra un ícono de alerta rojo y la etiqueta "Violation" en rojo                                                                 |
| Llamada con advertencia             | Al menos un control en advertencia y ninguno en violación                  | Estado "Warning" en gris (sin rojo); el control muestra un ícono de triángulo y la etiqueta "Warning" con borde gris                                                                                       |
| Puntuación baja                     | Puntuación general, de área o de control menor que 70                      | El anillo, la etiqueta del área o la barra de progreso correspondiente pasan a rojo; con 70 o más se mantienen en gris                                                                                     |
| Control sin evidencia               | El control no tiene cita asociada                                          | Se muestra el control con su estado, su nota (si la hay) y su puntuación, sin bloque de cita, sin etiqueta en la transcripción ni marca en el reproductor                                                  |
| Control sin nota                    | El control no tiene texto explicativo                                      | Se muestra solo el nombre, el estado y la puntuación                                                                                                                                                       |
| Evidencia que no encaja en un turno | El minuto de la evidencia no coincide con ningún turno de la transcripción | La cita se muestra en el panel sin el botón de reproducir y sin marca en la transcripción ni en el reproductor                                                                                             |
| Cita parcial                        | La cita es una parte del texto del turno                                   | En la transcripción se subrayan solo las palabras citadas; al hacer clic sobre ellas se salta a ese momento                                                                                                |
| Cita igual al turno completo        | La cita coincide con todo el texto del turno                               | No se subraya nada; la etiqueta del control en el turno sigue siendo el acceso al momento                                                                                                                  |
| Varias evidencias en un turno       | Dos o más controles citan el mismo turno                                   | El turno muestra una etiqueta por control; el reproductor agrupa en una sola marca las que caen en el mismo segundo                                                                                        |
| Momento activo                      | Clic en una cita, en una etiqueta de turno o en una marca del reproductor  | El reproductor salta a ese segundo, la etiqueta se rellena, la cita del panel se resalta y la transcripción se desplaza por dentro hasta ese turno sin mover la página                                     |
| Salto desde otra pestaña            | Se activa un momento de cumplimiento estando en otra pestaña               | La pantalla cambia a la pestaña Compliance y aplica el estado de momento activo                                                                                                                            |
| Otra pestaña abierta                | El usuario está en QA, Sentiment, Business Insights o ESG                  | Las marcas de cumplimiento no se muestran en la transcripción ni en el reproductor                                                                                                                         |
| Ocultamiento activo                 | El ocultamiento está habilitado y la llamada contiene datos sensibles      | Aviso gris "Sensitive data is masked" con el número de elementos y sus tipos; en la transcripción y en las citas cada dato se sustituye por una etiqueta con candado y tipo (por ejemplo "Card •••• 1234") |
| Audio silenciado                    | Ocultamiento activo con silenciado de audio                                | El aviso añade "The recording is muted while they are said"; el reproductor muestra "N muted" y una marca por tramo con tooltip "Audio muted · {tipos}"                                                    |
| Sin datos sensibles                 | Ocultamiento habilitado y nada coincide con las reglas                     | Aviso gris "No sensitive data detected"; sin botón de revelar                                                                                                                                              |
| Ocultamiento desactivado            | El ocultamiento está deshabilitado en Configuración                        | Aviso amarillo "Sensitive data masking is off" indicando que todo es visible y dónde activarlo; no hay etiquetas de ocultamiento ni silenciado                                                             |
| Revelado permitido                  | Rol QA Manager o super admin y la política lo permite                      | El aviso muestra el botón "Reveal for {N} min"                                                                                                                                                             |
| Revelado no permitido               | Rol supervisor o agente, o política de revelado desactivada                | Sin botón; el aviso añade "Only a QA manager or super admin can reveal them"                                                                                                                               |
| Panel de revelado                   | Clic en "Reveal for {N} min"                                               | Se abre un panel lateral con motivo obligatorio (Dispute review, Compliance investigation, Customer request, Fraud check, Other) y una nota; indica que el revelado queda registrado a nombre del usuario  |
| Nota obligatoria                    | La política exige nota, o el motivo elegido es "Other"                     | La nota es obligatoria con al menos 10 caracteres; si no se cumple, el formulario muestra el error y no envía                                                                                              |
| Datos revelados                     | Revelado confirmado                                                        | Aviso rojo "Sensitive data is visible" con quién, hora, motivo y hora de ocultado automático, y botón "Hide now"; la transcripción y las citas muestran los valores reales subrayados; mensaje de éxito    |
| Revelado expirado                   | Se cumple el tiempo configurado                                            | Los datos vuelven a ocultarse solos, sin recargar ni hacer clic; el aviso vuelve al estado oculto                                                                                                          |
| Ocultado anticipado                 | Clic en "Hide now" antes de expirar                                        | Los datos se ocultan de inmediato, aparece el mensaje "Sensitive data hidden again" y el registro guarda la hora de ocultado                                                                               |
| Rol agente                          | Un agente abre una de sus llamadas                                         | Ve la pestaña Compliance completa (panel, marcas y citas con datos ocultos) y el botón de disputa; nunca ve el botón de revelar                                                                            |
| Contenido largo                     | Notas o citas extensas                                                     | El texto se ajusta en varias líneas dentro de su tarjeta; el panel crece hacia abajo y la columna del reproductor se mantiene fija al hacer scroll en pantallas grandes                                    |

Detalles de interacción:

- **Cita de evidencia:** muestra quién lo dijo (Agent o Customer), un ícono de reloj con el minuto y segundo, un botón "Play from here" con tooltip y la cita en cursiva entre comillas. El botón solo existe si la evidencia encaja en un turno de la transcripción.
- **Etiqueta en el turno:** lleva el nombre del control (por ejemplo "Disclosure Compliance"); borde gris si el control no es una violación, fondo rojo claro si lo es, y fondo gris sólido cuando es el momento activo. Un clic en la etiqueta o en las palabras subrayadas activa ese momento.
- **Marca en el reproductor:** una por cada segundo que tenga momentos; su tooltip muestra el área y el control; un clic activa el momento. Los tramos silenciados usan una marca distinta a la de los momentos.
- **Teclado:** la pestaña, los botones de reproducir, las etiquetas de turno, las marcas del reproductor, el botón de revelar, "Hide now" y el formulario de revelado se pueden alcanzar y usar con teclado; la tecla Escape cierra el panel de revelado y el foco vuelve al botón que lo abrió.
- **Pantallas pequeñas:** en pantallas estrechas el panel de cumplimiento se coloca debajo del reproductor y la transcripción; las etiquetas de la cabecera (estado, violaciones, advertencias) pasan a una segunda línea si no caben.
- **Tema:** el rojo de alerta y el gris neutro son los colores estándar del producto; el panel, las etiquetas de datos ocultos y el aviso deben mantener buen contraste en modo claro y oscuro.

## Notas de datos y lógica

- **Resultado de cumplimiento por llamada.** El sistema entrega, ya calculado: puntuación general (0 a 100), estado general (conforme, advertencia o violación), número de violaciones, número de advertencias y tres áreas (Security, Regulatory, Legal), cada una con su puntuación y su lista de controles. Cada control trae nombre, estado, puntuación (0 a 100), una nota opcional y una evidencia opcional.
- **Evidencia.** Minuto y segundo, quién lo dijo (agente o cliente) y la cita textual. La cita debe ser texto literal de la transcripción para poder subrayarla dentro del turno; si no es literal, se muestra igualmente en el panel pero sin subrayado.
- **Catálogo de controles.** Hoy son fijos: Security → Data Protection, Disclosure Compliance; Regulatory → Billing Process, Transparency; Legal → Threats, Social Media, Banking Superintendence, Do-Not-Call. Si el catálogo pasa a configurarse por cliente (categorías de cumplimiento con área, subcategoría y severidad), el sistema debe enviar el nombre y el área con cada control para que la pantalla no dependa de una lista fija.
- **Estado general.** Es "Violation" si algún control está en violación; si no, "Warning" si alguno está en advertencia; si no, "Compliant". Los contadores salen de los controles. La pantalla describe la puntuación general como el promedio de las tres áreas; confirmar si el cálculo es ese o si hay ponderaciones o reglas de corte (por ejemplo, una violación grave fuerza la puntuación a cero).
- **Umbral visual.** Por debajo de 70 una puntuación se pinta en rojo. Confirmar si ese umbral debe tomarse de las bandas de Configuración → Compliance en lugar de ser fijo.
- **Ubicación de las marcas.** La pantalla busca el turno de la transcripción cuyo minuto coincide con el de la evidencia; si no hay coincidencia exacta, toma el turno que estaba en curso en ese segundo. Si no encuentra ninguno, la evidencia no genera marca.
- **Ocultamiento.** Se aplica sobre el texto de la transcripción y de las citas según las reglas de Configuración → Privacy: categorías de datos (pago, identidad, contacto, credenciales), cuántos dígitos finales quedan visibles por categoría, silenciado del audio y política de revelado (minutos, permiso y nota obligatoria). Confirmar si en producción los textos deben llegar ya ocultos y los tramos de audio ya silenciados para los roles sin permiso de revelado, de modo que los valores reales nunca viajen a quien no puede verlos.
- **Revelado.** Solo QA Manager y super admin. Cada revelado registra la llamada, el usuario, el motivo, la nota, la hora y la hora de expiración; si se oculta antes de expirar, también la hora de ocultado. El revelado aplica solo al detalle de esa llamada; en cualquier otra pantalla los datos siguen ocultos. Al recargar la página, el revelado se pierde.
- **Corrección de un control.** La única vía para cambiar un control es resolver una disputa que el agente abrió sobre la evaluación de cumplimiento. Al resolverla, el QA Manager puede, por cada control disputado: mantener su estado; bajar una violación a advertencia; o pasar una violación o una advertencia a conforme (nunca se sube la gravedad). Cada cambio exige una nota de al menos 10 caracteres y permite ajustar el análisis escrito y la frase de evidencia con su minuto. También puede pedir una reevaluación al sistema, que propone un nuevo estado con una explicación breve que se adopta o se ignora, y antes de resolver ve la puntuación anterior y la nueva. Al resolver, la pestaña Compliance de la llamada muestra el resultado corregido. Esta corrección no forma parte de esta historia y se detalla en Disputes.
- **Permisos.** Supervisor y QA Manager ven cualquier llamada de su ámbito; el agente solo las propias. El agente puede disputar la evaluación de cumplimiento, pero no revelar datos.
- **Idioma.** Los textos del panel (cabecera, estados, nombres de área y de control, "Play from here") deben estar disponibles en español e inglés como el resto de la pantalla. Las etiquetas de los datos ocultos (Card, ID, Email, etc.) hoy están solo en inglés; confirmar si se traducen.

## Criterios de aceptación

**Panel de cumplimiento**

```gherkin
Escenario: Llamada con una violación
  Dado que la evaluación tiene un control en violación y ninguno en advertencia
  Cuando abro la pestaña "Compliance"
  Entonces la cabecera muestra la puntuación general en el anillo, la etiqueta "Violation" en rojo, "1 violations" en rojo y "0 warnings" en gris
  Y el control aparece con ícono de alerta rojo, etiqueta "Violation" y su puntuación
  Y los demás controles aparecen con etiqueta de borde gris

Escenario: Llamada conforme
  Dado que todos los controles están conformes
  Cuando abro la pestaña "Compliance"
  Entonces no hay ningún elemento en rojo en el panel
  Y el estado general es "Compliant"

Escenario: Puntuación por debajo del umbral
  Dado que el área "Regulatory" tiene una puntuación menor que 70
  Cuando veo la tarjeta del área
  Entonces su etiqueta de puntuación y su barra de progreso se muestran en rojo
  Y las áreas con 70 o más se muestran en gris

Escenario: Control con nota y evidencia
  Dado que el control "Transparency" tiene nota y una evidencia del agente en el minuto 1:15
  Cuando veo el control
  Entonces la nota se muestra bajo el nombre
  Y debajo aparece la cita con la etiqueta "Agent", "1:15", el botón "Play from here" y el texto citado en cursiva

Escenario: Control sin evidencia
  Dado que el control "Threats" no tiene evidencia
  Cuando veo el control
  Entonces no se muestra bloque de cita
  Y no existe etiqueta ni marca de ese control en la transcripción ni en el reproductor
```

**Marcas en la transcripción y el reproductor**

```gherkin
Escenario: Etiquetas de la pestaña activa
  Dado que estoy en la pestaña "Compliance"
  Cuando miro la transcripción
  Entonces cada turno citado por un control muestra una etiqueta con el nombre del control
  Y las palabras citadas aparecen subrayadas cuando la cita es parte del turno

Escenario: Saltar desde la cita
  Dado que estoy en la pestaña "Compliance"
  Cuando pulso "Play from here" en la cita de "Disclosure Compliance" (0:00)
  Entonces el reproductor se posiciona en 0:00
  Y la etiqueta "Disclosure Compliance" del turno se rellena
  Y la transcripción desplaza ese turno a la vista sin mover la página

Escenario: Saltar desde el turno
  Dado que estoy en la pestaña "Compliance"
  Cuando hago clic en la etiqueta "Transparency" de un turno
  Entonces el reproductor se posiciona en el segundo de esa evidencia
  Y la cita correspondiente del panel se resalta

Escenario: Las marcas pertenecen a su pestaña
  Dado que estoy en la pestaña "QA"
  Cuando miro la transcripción y el reproductor
  Entonces no se muestran las etiquetas ni las marcas de cumplimiento
  Y al volver a "Compliance" reaparecen sin que el reproductor cambie de posición
```

**Datos sensibles**

```gherkin
Escenario: Evidencia con datos ocultos
  Dado que el ocultamiento está habilitado y la cita de "Data Protection" contiene un número de tarjeta y una fecha de expiración
  Cuando veo la cita
  Entonces el número aparece como "Card •••• 1234" y la expiración como "Expiry ••••"
  Y el aviso superior indica el total de elementos ocultos y sus tipos

Escenario: Audio silenciado
  Dado que el silenciado de audio está activo y hay 4 tramos con datos sensibles
  Cuando veo el reproductor
  Entonces muestra "4 muted"
  Y cada tramo tiene una marca con el tooltip "Audio muted · {tipos}"

Escenario: Revelar como QA Manager
  Dado que soy QA Manager y la política permite revelar durante 15 minutos
  Cuando pulso "Reveal for 15 min", elijo "Compliance investigation" y confirmo
  Entonces el aviso pasa a rojo con mi nombre, la hora, el motivo y la hora de ocultado automático
  Y las citas y la transcripción muestran los valores reales
  Y el revelado queda registrado

Escenario: Nota obligatoria con motivo "Other"
  Dado que abrí el panel de revelado
  Cuando elijo "Other" y confirmo con una nota de menos de 10 caracteres
  Entonces el formulario muestra el error en la nota y no revela nada

Escenario: Ocultar antes de tiempo
  Dado que los datos están revelados
  Cuando pulso "Hide now"
  Entonces los datos vuelven a ocultarse de inmediato
  Y veo el mensaje "Sensitive data hidden again"

Escenario: Expiración automática
  Dado que los datos están revelados
  Cuando se cumplen los minutos configurados
  Entonces los datos se ocultan sin recargar la página
  Y el aviso vuelve al estado "Sensitive data is masked"

Escenario: Supervisor sin permiso de revelado
  Dado que soy supervisor
  Cuando veo el aviso de datos sensibles
  Entonces no aparece el botón de revelar
  Y el aviso indica que solo un QA Manager o super admin puede revelarlos

Escenario: Ocultamiento desactivado
  Dado que el ocultamiento está deshabilitado en Configuración → Privacy
  Cuando abro la llamada
  Entonces veo el aviso amarillo "Sensitive data masking is off"
  Y la transcripción y las citas muestran todos los valores sin etiquetas de ocultamiento
```

**Checklist de elementos estáticos**

- [ ] El botón de la pestaña "Compliance" muestra la puntuación general en porcentaje y, al estar activa, la descripción "Security, Regulatory and Legal compliance checks".
- [ ] La cabecera del panel muestra el anillo con la puntuación general, el título "Compliance Score", las etiquetas de estado, violaciones y advertencias, y el texto "Average of Security, Regulatory and Legal area scores".
- [ ] Las áreas aparecen siempre en el orden Security, Regulatory, Legal, cada una con ícono de escudo, descripción, etiqueta de puntuación y barra de progreso.
- [ ] Cada control muestra ícono de estado, nombre, nota (si existe), etiqueta de estado y puntuación en porcentaje.
- [ ] El rojo se usa únicamente para violaciones y puntuaciones por debajo del umbral; el resto del panel es neutro.
- [ ] La etiqueta de un dato oculto muestra un candado, el tipo de dato y los últimos dígitos permitidos para su categoría.
- [ ] Todos los textos visibles del panel están disponibles en español e inglés.
- [ ] El panel, las etiquetas y el aviso mantienen contraste suficiente en modo claro y oscuro.

## Accesibilidad

- El estado de cada control se comunica con texto además del ícono y el color; una violación nunca depende solo del rojo.
- El anillo de puntuación y las barras de progreso tienen su valor numérico disponible para lectores de pantalla.
- Los botones "Play from here" tienen nombre accesible y tooltip; las etiquetas de turno y las palabras subrayadas se pueden usar con teclado y anuncian el nombre del control.
- Las marcas del reproductor (momentos y tramos silenciados) se pueden alcanzar con teclado y su tooltip sirve de nombre accesible.
- Las etiquetas de datos ocultos anuncian el tipo de dato y que está oculto (por ejemplo "Card, oculto, termina en 1234"), no solo los puntos.
- El panel de revelado recibe el foco al abrirse, Escape lo cierra y el foco vuelve al botón "Reveal"; cada error de validación se lee junto a su campo.
- Los cambios de estado del aviso (revelado, ocultado, expirado) se anuncian al lector de pantalla sin que el usuario tenga que buscarlos.
- Zonas táctiles de al menos 32 píxeles en los íconos de acción y 44 en los botones de revelar y ocultar.

## Preguntas abiertas

1. **Falta el enlace de Figma.** La referencia es la captura de la pestaña Compliance de la llamada TXCALL-00311.
2. **Canales.** El ticket menciona llamadas, chats y transcripciones. Se asumió que esta historia cubre solo llamadas; los chats (sin grabación ni reproductor) quedan como historia aparte. Confirmar si la evidencia de un chat se ubica por número de mensaje en lugar de minuto.
3. **Cálculo de la puntuación general.** La pantalla la describe como promedio de las tres áreas. Confirmar si hay ponderaciones o si una violación grave fuerza un valor mínimo.
4. **Umbral de rojo.** Está fijo en 70. Confirmar si debe tomarse de las bandas de Configuración → Compliance.
5. **Catálogo de controles.** Hoy es fijo. Confirmar si pasará a configurarse por cliente (categorías con severidad) y, en ese caso, si la severidad debe mostrarse en cada control.
6. **Ocultamiento en origen.** Se asumió que en producción los textos llegan ya ocultos y los tramos ya silenciados a los roles sin permiso de revelado, y que los valores reales solo se entregan tras un revelado autorizado. Confirmar.
7. **Estado "pendiente de evaluación".** El diseño no contempla aún una llamada sin evaluación de cumplimiento; definir su estado vacío.
8. **Etiquetas de los datos ocultos.** Hoy están solo en inglés; confirmar si se traducen.
9. **Resultado corregido y su historial.** Tras resolver una disputa, confirmar si la pestaña debe mostrar solo el valor corregido o también el valor original, quién lo cambió y cuándo.
10. **Alcance del revelado.** Se incluyó el flujo de revelado en esta historia porque sostiene el control "Data Protection"; si el equipo prefiere entregarlo aparte, puede separarse sin afectar al resto.
