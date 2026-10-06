# US-evaluacion-de-llamada: Pantalla de evaluación de una llamada

**Prioridad:** Imprescindible · **Estimación:** L — intuición inicial, el equipo la refina

## Historia

Como supervisor, QA Manager o agente de una campaña,
quiero abrir una llamada concreta y ver su grabación, su transcripción y su evaluación (QA, Sentiment & Emotion, Compliance y Business Insights) en una sola pantalla,
para entender cómo se desempeñó el agente en esa llamada y, si soy el agente, disputar una evaluación con la que no estoy de acuerdo.

## Contexto

La pantalla es el detalle de una llamada individual dentro de una campaña (ruta `/qa/campaigns/:campaignId/calls/:callId`, id `qa.campaigns.conversation`). Se llega desde el detalle de una campaña o, en el rol agente, desde "My Calls". Reúne en un solo lugar el audio, la conversación y los resultados de evaluación, y es el punto de entrada para abrir una disputa. Historias relacionadas: Disputes (apertura de disputa), Customer Profile (destino del enlace al cliente).

## Referencias de diseño

- Figma: Pendiente
- Componentes clave: `Breadcrumbs`, `Card`, `Badge`, `Button`, `ScrollArea` de Mantine; paneles `QAEvaluationPanel`, `SentimentEmotionPanel`, `CompliancePanel`, `BusinessInsightsPanel`; `OpenDisputeDrawer` (existente). No se requieren componentes nuevos.

## Alcance

**Incluye:**

- Navegación (botón volver y breadcrumbs según rol).
- Encabezado con datos de la llamada y enlace al perfil del cliente.
- Selector de cuatro pestañas con badge de score y descripción de la pestaña activa.
- Reproductor de audio y transcripción por turnos.
- Panel de evaluación de la pestaña activa.
- Visibilidad por rol de la pestaña Business Insights y del botón de disputa.
- Apertura del drawer de disputa con el tipo precargado.

**No incluye:**

- Edición de la evaluación o de los scores.
- Creación o gestión del flujo posterior de la disputa (resolución, estados).
- Descarga o compartición de la grabación o la transcripción.
- Navegación entre llamadas (anterior/siguiente).

## Estados de UI y casos límite

| Estado                    | Disparador                                                     | Comportamiento de UI                                                                                  |
| ------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Por defecto               | Entrada a la pantalla                                          | Pestaña "QA" seleccionada, reproductor en pausa, transcripción visible desde el primer turno          |
| Cargando                  | Se solicitan los datos de la llamada                           | Skeleton o indicador de carga en encabezado, reproductor, transcripción y panel; sin scores parciales |
| Llamada no encontrada     | `callId` inexistente o sin acceso                              | Mensaje de error con acción de volver a la campaña (o a "My Calls" en rol agente)                     |
| Error de carga            | Falla la petición                                              | Mensaje de error con acción "Reintentar"                                                              |
| Campaña sin nombre        | `campaignId` sin nombre resoluble                              | El breadcrumb muestra "Campaign"                                                                      |
| Transcripción vacía       | La llamada no tiene turnos                                     | Badge "0 turns" y mensaje de transcripción no disponible                                              |
| Reproduciendo             | Clic en Play                                                   | El botón cambia a "Pause" con ícono de pausa                                                          |
| Rol agente                | Rol agente activo                                              | Se oculta la pestaña Business Insights y aparece el botón de disputa                                  |
| Disputa ya abierta        | Existe una disputa abierta para la llamada y la pestaña activa | Botón de disputa deshabilitado con tooltip explicativo                                                |
| Drawer de disputa abierto | Clic en el botón de disputa                                    | Se abre `OpenDisputeDrawer` con el tipo de la pestaña activa preseleccionado                          |
| Contenido largo           | Transcripción extensa                                          | La transcripción hace scroll interno (alto fijo de 420 px) sin alargar la página                      |

Detalles de interacción:

- **Teclado/foco:** todos los controles (volver, breadcrumbs, pestañas, play/pause, botón de disputa, enlace al cliente) son alcanzables y operables con teclado.
- **Responsive:** por debajo del breakpoint `lg` las dos columnas se apilan (reproductor y transcripción primero, panel de evaluación después). El comportamiento sticky de la columna izquierda aplica solo en `lg` o superior.
- **Tema:** debe verse correctamente en modo claro y oscuro.
- **Volver:** el botón de volver usa el historial del navegador.

## Notas de datos y lógica

- **Datos de la llamada:** nombre de archivo, agente, cliente (con id para el enlace a su perfil), fecha, duración en segundos, dirección (inbound/outbound), transcripción (turnos con id, hablante agente/cliente, timestamp y texto), y los resultados de las cuatro evaluaciones.
- **Badge por pestaña:**
  - QA: score general en porcentaje.
  - Sentiment & Emotion: score general del cliente sobre 5, con un decimal.
  - Compliance: score general en porcentaje.
  - Business Insights: señales detectadas sobre el total de señales.
- **Permisos:** la pestaña Business Insights no debe exponerse al rol agente. El backend no debe enviar esos datos a ese rol; ocultarlos en la UI no basta.
- **Disputas:** se necesita saber si ya hay una disputa abierta para la combinación llamada + tipo de evaluación. Al abrir una nueva se envían la llamada, la campaña y el tipo.
- **Nombre de campaña:** se resuelve a partir de `campaignId`; si no existe, se muestra "Campaign".
- **Audio:** el backend debe exponer la URL (o el flujo) de la grabación y su duración. El reproductor reproduce el audio real, muestra el progreso y el tiempo transcurrido sobre la duración total, y permite ajustar el volumen.
- **Rol:** la visibilidad de pestañas y del botón de disputa se determina con el rol real del usuario autenticado.

## Criterios de aceptación

**Navegación y encabezado**

```gherkin
Escenario: Breadcrumbs para supervisor y QA Manager
  Dado que soy supervisor o QA Manager
  Cuando abro una llamada de una campaña
  Entonces veo "Campaigns › {nombre de campaña} › Call {callId}"
  Y "Campaigns" y el nombre de la campaña navegan a sus rutas respectivas

Escenario: Breadcrumbs para agente
  Dado que soy agente
  Cuando abro una de mis llamadas
  Entonces veo "My Calls › Call {callId}"
  Y "My Calls" navega a /qa/agent/calls

Escenario: Enlace al cliente
  Dado que estoy en la pantalla de una llamada
  Cuando hago clic en el nombre del cliente del encabezado
  Entonces navego a /qa/supervisor/customers/{customerId}
```

**Pestañas de evaluación**

```gherkin
Escenario: Cambio de pestaña
  Dado que estoy en la pestaña "QA"
  Cuando selecciono "Compliance"
  Entonces el panel derecho muestra la evaluación de Compliance
  Y la descripción bajo los botones corresponde a Compliance
  Y el reproductor y la transcripción no se reinician

Escenario: Business Insights oculta para el agente
  Dado que soy agente
  Cuando veo el selector de pestañas
  Entonces solo veo QA, Sentiment & Emotion y Compliance
```

**Disputa (solo agente)**

```gherkin
Escenario: Abrir una disputa
  Dado que soy agente y la pestaña activa es "Compliance"
  Y no existe una disputa abierta para esta llamada y pestaña
  Cuando hago clic en el botón de disputa
  Entonces se abre el drawer de disputa con el tipo "Compliance" preseleccionado

Escenario: Disputa ya abierta
  Dado que soy agente y ya existe una disputa abierta para esta llamada y la pestaña activa
  Cuando paso el cursor sobre el botón de disputa
  Entonces el botón está deshabilitado
  Y un tooltip explica que ya hay una disputa abierta

Escenario: Supervisor sin botón de disputa
  Dado que soy supervisor o QA Manager
  Cuando veo la fila de pestañas
  Entonces no aparece el botón de disputa
```

**Checklist de elementos estáticos**

- [ ] Cada botón de pestaña muestra un badge con el valor descrito en "Notas de datos y lógica".
- [ ] El reproductor muestra botón Play/Pause, barra de progreso, tiempo actual / duración total y control de volumen.
- [ ] El botón alterna entre "Play" y "Pause" con su ícono correspondiente.
- [ ] La transcripción muestra, por turno, el hablante (Agent/Customer), el timestamp y el texto, con fondo distinto por hablante.
- [ ] El badge de la transcripción indica el número de turnos.
- [ ] La columna izquierda (reproductor + transcripción) permanece fija al hacer scroll en pantallas `lg` o mayores.
- [ ] Por debajo de `lg` las columnas se apilan en una sola.
- [ ] Todos los textos visibles están disponibles en español e inglés.
- [ ] La pantalla mantiene contraste suficiente en modo claro y oscuro.

## Accesibilidad

- Orden de foco: volver, breadcrumbs, pestañas, botón de disputa, reproductor, transcripción, panel de evaluación.
- El botón de volver tiene etiqueta accesible ("Back").
- Las pestañas indican cuál está seleccionada (`aria-pressed` o rol `tab` con `aria-selected`) y su badge se lee junto al nombre.
- El botón de disputa deshabilitado expone el motivo (tooltip accesible por teclado y lector de pantalla).
- Play/Pause comunica su estado actual; la barra de progreso y el volumen tienen etiqueta y valor accesibles.
- Los turnos de la transcripción identifican al hablante en texto, no solo por color o ícono.
- La región de transcripción con scroll es alcanzable y desplazable con teclado.
- Áreas táctiles de al menos 44×44 px en los controles principales.

## Preguntas abiertas

- Falta el enlace de Figma.
- Definir el diseño final de los estados de carga, error y "llamada no encontrada".
- Confirmar el formato de audio y si el reproductor permite saltar a un punto de la grabación (clic en la barra de progreso) y sincronizar la transcripción con la posición de reproducción.
- Confirmar los permisos exactos por rol para ver la pantalla (por ejemplo, si un agente solo puede abrir sus propias llamadas).
