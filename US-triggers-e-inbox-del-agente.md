# US-triggers-e-inbox-del-agente: Triggers & Recognition y el Inbox del agente como un solo flujo

**Prioridad:** Debería · **Estimación:** L — intuición inicial, el equipo la refina

## Historia

Como supervisor o QA Manager,
quiero que las reglas de alerta y de reconocimiento que configuro en Triggers & Recognition lleguen de forma automática y trazable al Inbox del agente, con una acción clara para cada tipo de aviso,
para que el agente se entere a tiempo de lo que importa (alertas, reconocimientos, badges, avisos de burnout y resúmenes), pueda actuar o responder desde el mismo lugar y yo pueda confirmar que el mensaje se recibió y se atendió.

Como agente,
quiero un Inbox donde ver, filtrar, leer, archivar y responder todo lo que el sistema y mis responsables me envían, y saltar desde cada aviso a la pantalla donde puedo actuar,
para no perder alertas ni reconocimientos y saber qué se espera de mí.

## Contexto

Triggers & Recognition (`/qa/supervisor/triggers` y `/qa/qa-manager/triggers`) es donde se definen las reglas, los badges y las plantillas. El Inbox del agente (`/qa/agent/inbox`) es donde esas reglas aterrizan. Las dos pantallas comparten el mismo modelo de notificación: una regla que se cumple genera una entrada en Activity (lado manager) y una notificación en el Inbox del destinatario (lado agente). Esta historia describe el flujo completo y los puntos donde ambos lados se tocan. Complementa a `US-triggers-y-recognition.md`, que detalla la configuración de las reglas, y reutiliza el mismo Inbox que ya tienen el supervisor (`/qa/supervisor/inbox`) y el QA Manager (`/qa/qa-manager/inbox`), con contenido filtrado por destinatario.

## Referencias de diseño

- Figma: Pendiente
- Componentes clave: `SectionCard`, `AppDrawer` (detalle de la notificación), `BaseTable` (lista del Inbox y tablas de Triggers), `InboxFilters`, `ContentContainer`, `Badge`, `ActionIcon`, `Tooltip`. Sin componentes nuevos: el flujo reutiliza las pantallas existentes de ambas secciones.

## Alcance

**Incluye:**

- Entrega de la notificación al Inbox según la configuración de la regla: destinatarios (agente, supervisor, QA Manager), canal "Inbox" y mensaje renderizado desde la plantilla.
- Correspondencia entre tipos de regla y tipos de aviso en el Inbox (ver tabla en "Notas de datos y lógica").
- Inbox del agente: lista, contador de no leídas (también en el menú lateral), "Mark all as read", filtros (búsqueda, estado, tipos, rango de fechas), marcar como leído o no leído, archivar y detalle en drawer.
- Detalle por tipo de aviso con su acción principal que lleva a la sección relacionada (analítica, rankings, coaching, aprendizaje, disputas, seguimiento de cliente).
- Respuesta del agente en el hilo de un mensaje, reflejada en el Inbox del responsable.
- Prueba de envío desde Triggers ("Send test"), que genera una notificación en el Inbox del destinatario sin afectar los contadores de producción.
- Trazabilidad en Activity: estado de cada disparo (enviado, reconocido, escalado, suprimido) y navegación desde cada entrada al Inbox o a la analítica del agente.
- Protección contra exceso de avisos: días de enfriamiento, máximo por semana y horas de silencio.

**No incluye:**

- Evaluar llamadas o calcular las métricas que disparan las reglas (lo hace el motor de evaluación).
- Envío real de correos, notificaciones push o mensajes de chat; el canal "Email" y "Dashboard" se configuran pero no se entregan en esta historia.
- Edición del contenido de las plantillas más allá de lo definido en Triggers & Recognition.
- Gestión de permisos más allá de qué Inbox ve cada rol.
- Notificaciones en tiempo real (websocket o push del navegador).

## Estados de UI y casos límite

| Estado                      | Disparador                                                              | Comportamiento de UI                                                                                        |
| --------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Por defecto (Inbox)         | Entrada a `/qa/agent/inbox`                                             | Lista ordenada por fecha descendente, encabezado con el número de no leídas y filtros visibles              |
| Cargando                    | Se solicitan las notificaciones                                         | Skeleton de la tabla                                                                                        |
| Inbox vacío                 | El agente no tiene notificaciones                                       | Estado vacío con un mensaje breve (texto por definir con UX writing)                                        |
| Sin resultados de filtro    | Los filtros no coinciden con ninguna notificación                       | Mensaje "No matching results" y acción "Clear filters"                                                      |
| Notificación no leída       | La notificación aún no se abre ni se marca                              | Punto de lectura activo en la fila y contador sumado en el encabezado y en el menú lateral                  |
| Notificación leída          | El agente abre el detalle o la marca como leída                         | Se quita el punto de lectura y baja el contador                                                             |
| Notificación archivada      | El agente la archiva                                                    | Desaparece de la lista, baja el contador si estaba sin leer                                                 |
| Todas leídas                | No quedan notificaciones sin leer                                       | El botón "Mark all as read" queda deshabilitado y el contador desaparece                                    |
| Detalle por tipo            | El agente abre una notificación                                         | El drawer muestra el detalle del tipo (métrica y umbral, tendencia, badge, resumen semanal, etc.)           |
| Respuesta enviada           | El agente responde un mensaje                                           | La respuesta se añade al hilo, la notificación pasa a "actioned" y se refleja en el Inbox de quien escribió |
| Regla en borrador o pausada | La regla no está activa                                                 | No genera notificaciones y no aparece en Activity                                                           |
| Disparo suprimido           | El disparo cae en enfriamiento, tope semanal u horas de silencio        | No llega al Inbox; Activity lo registra con estado "Suppressed" y su motivo                                 |
| Destinatario sin Inbox      | La regla solo tiene canales Email o Dashboard                           | No llega al Inbox; Activity registra el envío sin notificación                                              |
| Aviso escalado              | El agente no reconoce el aviso en el tiempo de escalamiento configurado | Activity pasa a "Escalated" y el QA Manager recibe el aviso                                                 |
| Prueba de envío             | El manager pulsa "Send test"                                            | Aparece una notificación marcada como prueba en el Inbox del destinatario y una entrada en Activity         |
| Error                       | Falla la carga o una acción                                             | Mensaje de error con acción "Retry"; el estado de lectura no cambia                                         |
| Pantalla estrecha           | Ancho de 1024 px o menos                                                | La tabla se muestra como tarjetas con la misma información                                                  |

Detalles de interacción:

- **Fila del Inbox:** al hacer clic se abre el detalle; los controles de la fila (punto de lectura, archivar) no lo abren.
- **Punto de lectura:** alterna leído y no leído con un clic, con tooltip.
- **Detalle:** al abrir una notificación no leída se marca como leída. El drawer permite marcar como no leída, archivar, ejecutar la acción principal y responder.
- **Acción principal:** navega a la sección relacionada del rol que ve la notificación y cierra el drawer.
- **Filtros:** búsqueda por texto, estado (todas, no leídas, leídas), tipos (múltiple), rango de fechas y "Clear filters".
- **Teclado:** el foco entra al drawer al abrir y vuelve a la fila al cerrar; Escape cierra el drawer.
- **Tema:** el Inbox y el drawer deben verse correctamente en modo claro y oscuro.

## Notas de datos y lógica

- **De regla a notificación.** Cada disparo crea (1) una entrada de actividad (regla, agente, supervisor, campaña, métrica y valor observado, resumen de la condición, destinatarios, canales, estado, fecha, mensaje ya renderizado y badge si aplica) y (2) una notificación por cada destinatario que tenga el canal Inbox.
- **Correspondencia entre tipos.**

| Regla (Triggers & Recognition)                              | Aviso en el Inbox                    | Detalle del drawer                                 | Acción principal                                                     |
| ----------------------------------------------------------- | ------------------------------------ | -------------------------------------------------- | -------------------------------------------------------------------- |
| Alerta por métrica (`METRIC_ALERT`)                         | Metric Alert                         | Métrica, valor, umbral, ventana y mini gráfico     | Abrir analítica                                                      |
| Alerta por tendencia (`TREND_WARNING`)                      | Trend Warning                        | De, a, variación y periodo, con mini gráfico       | Abrir analítica                                                      |
| Resumen semanal (`WEEKLY_SUMMARY`)                          | Weekly Summary                       | KPIs con variación y aspectos destacados           | Abrir analítica                                                      |
| Riesgo de burnout (`BURNOUT_RISK`)                          | Metric Alert (prioridad según nivel) | Nivel, porcentaje y factores                       | Agente: responder al supervisor; manager: abrir analítica de burnout |
| Hito, racha o mejora (`MILESTONE`, `STREAK`, `IMPROVEMENT`) | Recognition                          | Tipo de logro, valor, semanas de racha o variación | —                                                                    |
| Otorgamiento de badge (`BADGE_AWARD`)                       | Recognition con badge ganado         | Nombre, icono, color, nivel y motivo               | Abrir Rankings                                                       |

- **Otros avisos que comparten el Inbox** (los generan coaching, aprendizaje, disputas y rankings): sesión de coaching, asignación de aprendizaje, seguimiento de cliente, actualización de disputa y actualización de ranking, cada uno con su acción principal hacia la sección correspondiente.
- **Destino de una notificación.** Se identifica por rol (agente, supervisor, QA Manager) e identificador. Una notificación solo aparece en el Inbox de su destinatario y no en el de otro rol.
- **Estado de lectura.** Cada notificación guarda leída, archivada, accionada, fecha de lectura y, opcionalmente, fecha de expiración. El contador del encabezado y el del menú lateral cuentan solo las no leídas y no archivadas del destinatario.
- **Prioridad.** Crítica, Alta, Normal o Baja, con color en la tabla. Se asume que se deriva de la severidad de la regla (Info, Warning, Critical); confirmar la equivalencia exacta.
- **Hilo de respuestas.** Responder agrega un mensaje al hilo y marca la notificación como accionada. La respuesta del agente se duplica en el Inbox del responsable que envió el aviso, y la del responsable en el del agente.
- **Frecuencia.** Mínimo de días entre disparos para el mismo agente, máximo por semana y horas de silencio. Un disparo bloqueado no llega al Inbox y queda registrado como suprimido con su motivo.
- **Estados de la actividad.** Enviado, Reconocido, Escalado, Suprimido. El reconocimiento guarda la fecha y se realiza en Activity; el escalamiento depende de las horas configuradas en la regla.
- **Prueba de envío.** Agrega la entrada de actividad y la notificación, e incrementa las estadísticas de la regla (disparos de 7 y 30 días, último disparo). Debe quedar marcada como prueba para no contaminar los contadores reales.
- **Alcance por rol.** El supervisor ve y configura las reglas de su equipo; el QA Manager, las de todos los equipos. Cada Inbox muestra únicamente lo dirigido a esa persona.
- **Textos.** Disponibles en español e inglés. El contenido de las plantillas de ejemplo puede permanecer en inglés.

## Criterios de aceptación

**De la regla al Inbox**

```gherkin
Escenario: Una regla activa llega al Inbox del agente
  Dado que existe una regla de alerta activa con destinatario "Agent" y canal "Inbox"
  Cuando un agente cumple la condición de la regla
  Entonces aparece una notificación nueva y sin leer en el Inbox de ese agente
  Y se crea una entrada en Activity con estado "Sent", el valor observado y el mensaje renderizado

Escenario: Regla con varios destinatarios
  Dado que la regla tiene destinatarios "Agent" y "Supervisor"
  Cuando se dispara
  Entonces el agente y el supervisor reciben cada uno su notificación en su propio Inbox
  Y ningún Inbox muestra la notificación del otro

Escenario: Regla pausada o en borrador
  Dado que la regla está pausada
  Cuando un agente cumple la condición
  Entonces no se crea notificación ni entrada en Activity

Escenario: Disparo suprimido por frecuencia
  Dado que el agente ya recibió la misma regla dentro de los días de enfriamiento
  Cuando vuelve a cumplir la condición
  Entonces no llega nada a su Inbox
  Y Activity registra el disparo como "Suppressed" con el motivo "cooldown"

Escenario: Regla sin canal Inbox
  Dado que la regla solo tiene los canales "Email" y "Dashboard"
  Cuando se dispara
  Entonces Activity registra el envío
  Y el Inbox del agente no recibe notificación

Escenario: Prueba de envío
  Dado que estoy en el detalle de una regla en Triggers & Recognition
  Cuando pulso "Send test" eligiendo a un agente como destinatario
  Entonces la notificación de prueba aparece en el Inbox de ese agente
  Y Activity muestra la entrada marcada como prueba
  Y el contador de disparos de la regla no cambia respecto de los reales
```

**Inbox del agente**

```gherkin
Escenario: Contador de no leídas
  Dado que tengo 3 notificaciones sin leer
  Cuando abro /qa/agent/inbox
  Entonces el encabezado muestra "3 unread"
  Y el menú lateral muestra el número 3 junto a "Inbox"

Escenario: Abrir una notificación
  Dado que tengo una notificación sin leer
  Cuando hago clic en su fila
  Entonces se abre el drawer con el detalle de su tipo
  Y la notificación pasa a leída y el contador baja en uno

Escenario: Marcar todas como leídas
  Dado que tengo notificaciones sin leer
  Cuando pulso "Mark all as read"
  Entonces todas pasan a leídas
  Y el botón queda deshabilitado

Escenario: Archivar
  Dado que la fila de una notificación está visible
  Cuando pulso el icono de archivar
  Entonces la notificación desaparece de la lista
  Y si estaba sin leer el contador baja en uno

Escenario: Filtrar
  Dado que tengo notificaciones de varios tipos
  Cuando elijo el tipo "Metric Alert" y el estado "Unread"
  Entonces la lista muestra solo alertas de métrica sin leer
  Y "Clear filters" restaura la lista completa

Escenario: Sin resultados
  Dado que los filtros activos no coinciden con ninguna notificación
  Cuando se actualiza la lista
  Entonces veo "No matching results" y la acción "Clear filters"

Escenario: Acción principal del detalle
  Dado que abrí un aviso de badge ganado
  Cuando pulso el botón principal del drawer
  Entonces navego a Rankings y el drawer se cierra

Escenario: Responder a un mensaje
  Dado que abrí un mensaje de mi supervisor
  Cuando escribo una respuesta y la envío
  Entonces la respuesta aparece en el hilo y la notificación queda accionada
  Y el supervisor la recibe en su Inbox como un mensaje nuevo
```

**Trazabilidad y escalamiento**

```gherkin
Escenario: Reconocer una alerta
  Dado que una entrada de Activity está en estado "Sent"
  Cuando el manager la marca como reconocida
  Entonces su estado pasa a "Acknowledged" y se guarda la fecha de reconocimiento

Escenario: Escalar una alerta no atendida
  Dado que una regla tiene escalamiento activo a las 24 horas
  Cuando pasan 24 horas sin que la alerta se reconozca
  Entonces la entrada pasa a "Escalated"
  Y el QA Manager recibe una notificación en su Inbox
```

**Checklist de interfaz**

- [ ] La tabla del Inbox muestra las columnas Tipo, Título, Prioridad, Origen y Fecha, y se ordena por fecha descendente por defecto
- [ ] Cada tipo de aviso usa el color e icono definidos para su categoría y la prioridad se muestra con su color
- [ ] Los filtros permiten búsqueda por texto, estado, tipos múltiples y rango de fechas
- [ ] El drawer ofrece las acciones "Marcar como no leída" y "Archivar" con tooltip
- [ ] A 1024 px o menos la tabla se reemplaza por tarjetas con la misma información
- [ ] Todo el flujo es legible en modo claro y modo oscuro
- [ ] Los textos están disponibles en español e inglés

## Accesibilidad

- El punto de lectura y los iconos de archivar y marcar como no leída llevan etiqueta accesible y tooltip; el estado de lectura no se comunica solo por color.
- Cada fila del Inbox es alcanzable con teclado y se abre con Enter; los controles internos mantienen su propio foco.
- Al abrir el drawer el foco pasa al título y al cerrarlo vuelve a la fila de origen; Escape cierra el drawer.
- Los cambios de contador (por ejemplo, tras "Mark all as read") y las confirmaciones de archivar o responder se anuncian con una región `aria-live`.
- La prioridad y la categoría tienen texto además del color, con contraste suficiente en ambos temas.
- Las áreas táctiles de los iconos de acción miden al menos 32 px.

## Preguntas abiertas

1. **Motor de evaluación.** Hoy el único modo de generar una notificación desde una regla es "Send test". ¿Cuándo y quién evalúa las reglas en producción (job programado, evento por llamada evaluada, ambos)? Esta historia asume que el motor existe y entrega el disparo con el valor observado.
2. **Lectura y reconocimiento.** ¿Abrir la notificación en el Inbox debe marcar automáticamente la entrada de Activity como "Acknowledged", o el reconocimiento sigue siendo una acción manual del manager? Se asumió lo segundo.
3. **Escalamiento.** ¿A quién se escala cuando el destinatario original es el supervisor? Se asumió que siempre sube al QA Manager.
4. **Correspondencia de categorías.** Se asumió que los reconocimientos y los badges aparecen bajo la categoría "Recognition" y el riesgo de burnout bajo "Metric Alert". Confirmar con producto si el burnout merece categoría propia.
5. **Prueba de envío.** ¿Debe distinguirse visualmente en el Inbox del agente (etiqueta "Test") o basta con el registro en Activity? Se asumió una etiqueta visible.
6. **Retención.** ¿Cuánto tiempo se conservan las notificaciones archivadas y las leídas, y qué pasa con las que tienen fecha de expiración?
7. **Notificaciones externas.** ¿Los canales Email y Dashboard entran en una historia posterior o se deprecan? Mientras tanto solo se entrega por Inbox.
