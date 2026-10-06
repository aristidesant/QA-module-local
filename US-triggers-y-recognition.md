# US-triggers-y-recognition: Triggers & Recognition (Supervisor y QA Manager)

**Prioridad:** Debería · **Estimación:** L — intuición inicial, el equipo la refina

## Historia

Como supervisor o QA Manager,
quiero configurar reglas automáticas de alerta y de reconocimiento, gestionar el catálogo de badges y las plantillas de mensaje, y revisar un registro de todo lo que se ha disparado,
para detectar a tiempo problemas en mi equipo, reconocer buen desempeño sin trabajo manual y mantener un comportamiento consistente en todas las notificaciones.

## Contexto

Triggers & Recognition es la sección donde el supervisor (`/qa/supervisor/triggers`) y el QA Manager (`/qa/qa-manager/triggers`) gestionan las reglas que se evalúan sobre las llamadas y los resultados de los agentes. La sección tiene cinco pestañas: Alerts (reglas de alerta), Recognition (reconocimientos automáticos), Badges (catálogo de insignias), Templates (plantillas de mensaje) y Activity (registro de disparos). Reemplaza las pantallas legacy de triggers (`/qa/auto-triggers` y `/qa/qamanager/admin/triggers`), que redirigen a la nueva sección. Historias relacionadas: Inbox del manager (donde llegan las alertas), Rankings (badges y reacciones), Team Analytics (acciones de burnout) y Team Rankings del agente.

## Referencias de diseño

- Figma: Pendiente
- Componentes clave: `SectionCard`, `AppDrawer` (editor y detalles), `BaseTable` (tablas de reglas, badges y actividad), `EmptyState`, `FilterContainer`, `StatCard`, `InlineNotice`, `PaginationControls`, `ContentContainer`; `Tabs`, `Switch`, `SegmentedControl`, `Badge`, `Modal` (selector de tipo de regla) y `modals.openConfirmModal` de Mantine. No se requieren componentes nuevos fuera de la carpeta de la sección.

## Alcance

**Incluye:**

- Encabezado con título, descripción, contexto del rol (equipo o todos los equipos) y botón "New rule".
- Franja de KPIs: reglas activas (con pausadas y borradores), alertas disparadas en 7 días, reconocimientos enviados en 7 días y badges otorgados en 30 días.
- Pestañas con la pestaña activa reflejada en la URL (`?tab=`).
- Pestaña Alerts y Recognition: tabla de reglas con filtros, activar o pausar, duplicar, eliminar y enviar prueba; detalle en drawer; creación y edición en un editor de drawer con secciones y vista previa en vivo.
- Tipos de regla de alerta: métrica (umbral o rango), tendencia (caída o aumento porcentual), resumen semanal y riesgo de burnout.
- Tipos de regla de reconocimiento: hito, racha, mejora y otorgamiento de badge.
- Pestaña Badges: tarjetas de badge con niveles Bronze, Silver y Gold, badge vinculado a una regla de reconocimiento, lista de poseedores y editor en drawer.
- Pestaña Templates: biblioteca de mensajes con variables, editor en drawer y vista previa.
- Pestaña Activity: registro de disparos con filtros y drawer de detalle; desde cada entrada se navega a la analítica del agente o al Inbox.
- Destinatarios configurables: agente, supervisor o ambos.
- Frecuencia configurable (días de enfriamiento, máximo por semana y horas de silencio) para evitar fatiga de alertas.
- Redirección de las rutas legacy a la nueva sección.

**No incluye:**

- Evaluar llamadas o calcular métricas (lo hace el motor de evaluación).
- Envío real de correos, notificaciones push o mensajes de chat.
- Gestión de permisos por rol más allá de la visibilidad de la sección.
- Programas de ranking (se gestionan en Rankings).
- Edición de rúbricas o de los criterios de evaluación.

## Estados de UI y casos límite

| Estado                         | Disparador                                           | Comportamiento de UI                                           |
| ------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------- |
| Por defecto                    | Entrada a la sección                                 | Pestaña "Alerts" activa con sus reglas y KPIs cargados         |
| Cargando                       | Se solicitan reglas, badges, plantillas o actividad  | Skeleton en KPIs y tabla                                       |
| Sin reglas                     | No existe ninguna regla de la pestaña                | Estado vacío con botón "New rule"                              |
| Sin resultados de filtro       | Los filtros no coinciden con ninguna regla o entrada | Mensaje "No matching results" con acción "Clear filters"       |
| Regla en borrador              | La regla se guardó sin activar                       | Badge "Draft" en la tabla; no se evalúa                        |
| Regla pausada                  | El usuario la pausa                                  | Badge "Paused"; no se evalúa ni envía                          |
| Regla sin destinatarios        | Se intenta activar sin destinatario                  | Error de validación en la sección Scope                        |
| Métrica sin valor              | La condición no tiene umbral                         | Error de validación en la sección Condition                    |
| Vista previa sin coincidencias | Ningún agente cumple la condición hoy                | La vista previa muestra "0 of N agents match today"            |
| Badge sin poseedores           | Ningún agente tiene el badge                         | Lista vacía con "No holders yet"                               |
| Plantilla en uso               | Una regla usa la plantilla                           | Al eliminarla se muestra confirmación con las reglas afectadas |
| Actividad vacía                | No se ha disparado ninguna regla en el rango         | Estado vacío "No activity in this period"                      |
| Pantalla estrecha              | Ancho de 1024 px o menos                             | La tabla se reemplaza por tarjetas con la misma información    |
| Error                          | Falla una petición                                   | Mensaje de error con acción "Retry"                            |

Detalles de interacción:

- **Fila de regla:** al hacer clic se abre el drawer de detalle; los controles de la fila (activar, menú) no lo abren.
- **Activar o pausar:** cambia el estado de inmediato y muestra una notificación de confirmación.
- **Duplicar:** crea una copia en borrador con el nombre "(copy)" y abre el editor.
- **Eliminar:** pide confirmación; no se puede eliminar una regla activa sin antes pausarla.
- **Enviar prueba:** genera una entrada de prueba en el Inbox del destinatario indicado sin afectar contadores de producción.
- **Editor:** guardar en borrador o guardar y activar; cerrar con cambios sin guardar pide confirmación.
- **Vista previa:** se actualiza al cambiar cualquier campo de la regla o del mensaje.
- **Plantillas:** insertar variables desde chips en el cuerpo del mensaje; las variables no reconocidas se marcan como error.
- **Activity:** filtros por tipo, estado, fecha y regla; cada entrada abre su detalle.
- **Tema:** toda la sección debe verse correctamente en modo claro y oscuro.

## Notas de datos y lógica

- **Regla:** tiene nombre, tipo, tipo de evaluación (QA, Compliance, Sentiment & Emotion, Business Insights), aspecto evaluado, condición (métrica, operador, valor y ventana), lógica de condiciones (todas o cualquiera), severidad (Info, Warning, Critical), destinatarios, mensaje, frecuencia, programación y estado (activa, pausada o borrador).
- **Ventana de evaluación:** por llamada, últimas N llamadas o 7, 14 o 30 días.
- **Tendencia:** compara el periodo actual con el anterior y dispara por caída o aumento porcentual superior al umbral.
- **Riesgo de burnout:** regla de alerta cuyas condiciones se evalúan por agente; las reglas activas alimentan el nivel de burnout que se muestra en Team Analytics.
- **Reconocimiento automático:** al cumplirse la condición se envía el mensaje de la plantilla elegida, con destinatario y visibilidad (privado o feed del equipo). Si la regla está vinculada a un badge, el badge se otorga al mismo tiempo.
- **Badges:** cada badge tiene nombre, icono, color, niveles Bronze, Silver y Gold con su umbral, y puede otorgarse automáticamente o de forma manual. Los niveles se calculan a partir de los poseedores de la regla vinculada.
- **Frecuencia:** días mínimos entre disparos para el mismo agente, máximo de disparos por semana y horas de silencio. Un disparo bloqueado por frecuencia se registra en Activity con su motivo.
- **Estadísticas por regla:** disparos en 7 y 30 días y fecha del último disparo, visibles en la tabla y en el detalle.
- **Actividad:** cada entrada guarda fecha y hora, regla, agente, destinatario, valor que disparó la regla, estado (enviado, bloqueado por frecuencia o prueba) y, si aplica, si fue reconocido o escalado al QA Manager cuando no fue atendido.
- **Alcance por rol:** el supervisor ve las reglas de su equipo; el QA Manager ve las de todos los equipos y puede filtrar por equipo.
- **Textos:** disponibles en español e inglés. Los nombres de reglas y el contenido de plantillas de ejemplo pueden permanecer en inglés.

## Criterios de aceptación

**Pestañas, encabezado y KPIs**

```gherkin
Escenario: Entrada a la sección
  Dado que soy supervisor
  Cuando abro /qa/supervisor/triggers
  Entonces veo el encabezado con mi equipo, la franja de KPIs y la pestaña "Alerts" activa

Escenario: Pestaña reflejada en la URL
  Dado que estoy en "Alerts"
  Cuando cambio a "Activity"
  Entonces la URL incluye ?tab=activity
  Y al recargar la página sigo en "Activity"

Escenario: Redirección de la ruta legacy
  Dado que abro /qa/auto-triggers
  Cuando la página carga
  Entonces soy redirigido a /qa/qa-manager/triggers
```

**Reglas de alerta y reconocimiento**

```gherkin
Escenario: Crear una regla de alerta
  Dado que estoy en "Alerts"
  Cuando hago clic en "New rule" y elijo el tipo "Metric alert"
  Y completo nombre, condición, destinatarios y mensaje
  Y guardo y activo la regla
  Entonces la regla aparece en la tabla con estado "Active"

Escenario: Validación de destinatarios
  Dado que estoy editando una regla
  Cuando intento activarla sin destinatarios
  Entonces veo un error en la sección Scope y la regla no se activa

Escenario: Vista previa en vivo
  Dado que estoy editando la condición de una regla
  Cuando cambio el umbral
  Entonces la vista previa muestra cuántos agentes cumplen la condición hoy

Escenario: Pausar una regla
  Dado que una regla está activa
  Cuando la pauso desde su fila
  Entonces su estado cambia a "Paused" y deja de evaluarse

Escenario: Eliminar una regla activa
  Dado que una regla está activa
  Cuando intento eliminarla
  Entonces veo un mensaje que pide pausarla primero

Escenario: Enviar prueba
  Dado que una regla tiene destinatarios
  Cuando hago clic en "Send test"
  Entonces aparece una entrada de prueba en el Inbox del destinatario
  Y los contadores de disparos de producción no cambian
```

**Recognition y badges**

```gherkin
Escenario: Reconocimiento con badge vinculado
  Dado que una regla de reconocimiento está vinculada a un badge
  Cuando un agente cumple la condición
  Entonces se envía el mensaje de la plantilla y el badge se otorga con su nivel

Escenario: Badge sin poseedores
  Dado que ningún agente tiene un badge
  Cuando abro su detalle
  Entonces veo "No holders yet" en la lista de poseedores

Escenario: Badge en uso
  Dado que un badge está vinculado a una regla
  Cuando intento eliminarlo
  Entonces veo la confirmación con la regla afectada
```

**Plantillas y actividad**

```gherkin
Escenario: Insertar variable en plantilla
  Dado que estoy editando una plantilla
  Cuando hago clic en el chip de variable "{agent_name}"
  Entonces la variable se inserta en la posición del cursor

Escenario: Variable no reconocida
  Dado que escribo "{agnet_name}" en el cuerpo
  Cuando se valida el mensaje
  Entonces veo un error que indica la variable no válida

Escenario: Filtrar actividad
  Dado que estoy en "Activity"
  Cuando filtro por tipo "Alert" y estado "Blocked by frequency"
  Entonces solo veo las entradas que coinciden

Escenario: Ir al detalle del agente desde actividad
  Dado que veo una entrada de actividad
  Cuando abro su detalle y elijo el agente
  Entonces navego a la analítica de ese agente
```

**Checklist de elementos estáticos**

- [ ] Las pestañas se llaman "Alerts", "Recognition", "Badges", "Templates" y "Activity", con ícono.
- [ ] El encabezado muestra el título "Triggers & Recognition", la descripción y el botón "New rule".
- [ ] La franja de KPIs muestra reglas activas, alertas de 7 días, reconocimientos de 7 días y badges de 30 días.
- [ ] La tabla de reglas muestra nombre, tipo, severidad, destinatarios, estado, disparos de 7 y 30 días y último disparo.
- [ ] Los estados Active, Paused y Draft tienen color y texto distintos.
- [ ] Las fechas usan el formato `DD MMM YYYY` y las horas el formato local.
- [ ] La severidad Info, Warning y Critical usa etiqueta de texto además de color.
- [ ] Los textos están disponibles en español e inglés.
- [ ] La sección mantiene contraste suficiente en modo claro y oscuro.

## Accesibilidad

- Pestañas, filtros, filas, tarjetas, chips de variables y controles del editor son alcanzables y operables con teclado; el foco es visible.
- Los switches de activar o pausar tienen nombre accesible que incluye la regla.
- Severidad, estado y tendencia no dependen solo del color: tienen texto visible o tooltip accesible.
- Los badges tienen nombre accesible, no solo icono.
- Los drawers atrapan el foco mientras están abiertos, se cierran con Esc y devuelven el foco al elemento que los abrió.
- Los errores de validación del editor se anuncian a lectores de pantalla y enfocan el primer campo con error.
- Las tarjetas de la vista responsive tienen la misma información y acciones que la tabla.

## Preguntas abiertas

- Falta el enlace de Figma.
- Confirmar si el QA Manager puede editar reglas creadas por un supervisor o solo verlas.
- Confirmar los valores por defecto de frecuencia (días de enfriamiento, máximo semanal y horas de silencio).
- Confirmar si las horas de silencio aplican a reconocimientos o solo a alertas.
- Confirmar el umbral de "no atendida" que dispara la escalación al QA Manager.
- Confirmar si el burnout se configura solo en Triggers o también desde Team Analytics.
- Confirmar si un badge manual puede otorgarse a un agente fuera de su equipo.
