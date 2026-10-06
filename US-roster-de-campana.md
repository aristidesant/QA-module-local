# US-roster-de-campana: Pestaña Roster en el detalle de campaña

**Prioridad:** Debería · **Estimación:** M — intuición inicial, el equipo la refina

## Historia

Como supervisor o QA Manager,
quiero ver en la pestaña Roster de una campaña los agentes que participan en ella junto con su actividad en esa campaña,
para identificar rápido qué agentes necesitan atención y entrar directamente a su perfil.

## Contexto

La pestaña Roster es la tercera del detalle de campaña (`/qa/campaigns/:id`), junto a Overview y Conversations. Responde a la pregunta "¿quién trabaja en esta campaña y cuánta actividad tiene?" sin tener que revisar llamada por llamada. Historias relacionadas: detalle de campaña, perfil de agente (destino de la navegación por fila) y Team Analytics.

## Referencias de diseño

- Figma: Pendiente
- Componentes clave: `SectionCard` y `BaseTable` (existentes), `Avatar`, `Badge` y `Tabs` de Mantine. No se requieren componentes nuevos.

## Alcance

**Incluye:**

- Pestaña "Roster" en el detalle de campaña.
- Tabla de agentes de la campaña con su actividad dentro de esa campaña.
- Columnas según el rol: el QA Manager ve la columna Supervisor; el supervisor no.
- Contador de agentes y descripción según el rol.
- Alcance por rol: el QA Manager ve a todos los agentes; el supervisor solo a los de su equipo.
- Navegación al perfil del agente al hacer clic en una fila.
- Estados vacío, de carga y de error.

**No incluye:**

- Agregar, quitar o editar agentes de la campaña.
- Buscador y filtros de la tabla.
- Exportación de la tabla.
- Score promedio de QA por agente.
- Cambios en el perfil del agente.

## Estados de UI y casos límite

| Estado                | Disparador                                          | Comportamiento de UI                                                              |
| --------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------- |
| Por defecto           | Se abre la pestaña Roster                           | Tabla ordenada por Calls de mayor a menor, 10 filas por página, densidad compacta |
| Cargando              | Se solicitan los datos del roster                   | Skeleton de la tabla; el contador no se muestra hasta tener datos                 |
| Vacío (supervisor)    | Ningún agente de su equipo participa en la campaña  | Mensaje "No agents from your team participate in this campaign."                  |
| Vacío (QA Manager)    | La campaña no tiene agentes                         | Mensaje "No agents participate in this campaign yet."                             |
| Error                 | Falla la petición                                   | Mensaje de error con acción "Reintentar"                                          |
| Agente sin llamadas   | El agente está en la campaña pero no tiene llamadas | Calls = 0, Auto-fails = "0" en gris, Last call = "—"                              |
| Agente con auto-fails | Auto-fails mayor a 0                                | Badge rojo con el número                                                          |
| Hover/foco en fila    | Cursor o teclado sobre una fila                     | La fila indica que es clicable                                                    |
| Paginación            | Más de 10 agentes                                   | Controles de paginación bajo la tabla                                             |
| Pantalla estrecha     | Ancho reducido                                      | La tabla permite scroll horizontal sin romper el layout                           |

Detalles de interacción:

- **Teclado/foco:** las filas son alcanzables con teclado y se activan con Enter.
- **Cambio de pestaña:** al salir de la pestaña y volver, los datos se recargan.
- **Tema:** debe verse correctamente en modo claro y oscuro.

## Notas de datos y lógica

- **Agentes de la campaña:** los agentes que tienen asignada esa campaña. Por cada uno se necesita: id, nombre, color de avatar, supervisor (id y nombre) y estado (Active, On leave, Training).
- **Métricas por agente, solo dentro de la campaña:**
  - **Calls:** cantidad de llamadas del agente en la campaña.
  - **Auto-fails:** cantidad de esas llamadas con auto-fail.
  - **Last call:** fecha y hora de la llamada más reciente, o sin valor si no hay llamadas.
- **Columnas por rol:**
  - QA Manager: Agent, Supervisor, Status, Calls, Auto-fails y Last call.
  - Supervisor: Agent, Status, Calls, Auto-fails y Last call. Supervisor no se muestra porque todos los agentes pertenecen a su propio equipo.
  - La columna Team no se muestra en ningún rol.
- **Alcance por rol:** el QA Manager recibe todos los agentes de la campaña. El supervisor recibe solo los agentes de su equipo. El filtrado debe resolverse en el backend, no solo en la interfaz.
- **Orden inicial:** Calls descendente. Los agentes sin llamadas quedan al final.
- **Destino de la fila:**
  - QA Manager: `/qa/qa-manager/teams/{supervisorId}/agents/{agentId}`.
  - Supervisor: `/qa/supervisor/your-team/{agentId}`.
- **Contador:** "{N} agents", donde N es el total de agentes visibles para el rol, no solo los de la página actual.
- **Textos:** disponibles en español e inglés.

## Criterios de aceptación

**Visibilidad, columnas y alcance por rol**

```gherkin
Escenario: QA Manager ve todos los agentes
  Dado que soy QA Manager
  Cuando abro la pestaña Roster de una campaña
  Entonces veo todos los agentes que participan en la campaña
  Y la descripción dice "Agents participating in this campaign"
  Y la tabla incluye la columna Supervisor y no incluye la columna Team

Escenario: Supervisor ve solo su equipo
  Dado que soy supervisor
  Cuando abro la pestaña Roster de una campaña
  Entonces veo solo los agentes de mi equipo que participan en la campaña
  Y la descripción dice "Agents from your team participating in this campaign"
  Y la tabla no incluye las columnas Supervisor ni Team

Escenario: Supervisor sin agentes en la campaña
  Dado que soy supervisor y ningún agente de mi equipo participa en la campaña
  Cuando abro la pestaña Roster
  Entonces veo "No agents from your team participate in this campaign."

Escenario: Campaña sin agentes
  Dado que soy QA Manager y la campaña no tiene agentes
  Cuando abro la pestaña Roster
  Entonces veo "No agents participate in this campaign yet."
```

**Navegación**

```gherkin
Escenario: Abrir perfil desde la fila (QA Manager)
  Dado que soy QA Manager y veo la tabla del roster
  Cuando hago clic en la fila de un agente
  Entonces navego a /qa/qa-manager/teams/{supervisorId}/agents/{agentId}

Escenario: Abrir perfil desde la fila (supervisor)
  Dado que soy supervisor y veo la tabla del roster
  Cuando hago clic en la fila de un agente
  Entonces navego a /qa/supervisor/your-team/{agentId}
```

**Métricas**

```gherkin
Escenario: Agente sin llamadas en la campaña
  Dado que un agente participa en la campaña pero no tiene llamadas en ella
  Cuando veo su fila
  Entonces Calls es 0, Auto-fails es "0" y Last call es "—"

Escenario: Agente con auto-fails
  Dado que un agente tiene 2 llamadas con auto-fail en la campaña
  Cuando veo su fila
  Entonces Auto-fails muestra un badge rojo con "2"

Escenario: Orden inicial
  Dado que abro la pestaña Roster
  Cuando se carga la tabla
  Entonces los agentes aparecen ordenados por Calls de mayor a menor
  Y los agentes sin llamadas aparecen al final
```

**Checklist de elementos estáticos**

- [ ] La pestaña se llama "Roster" y aparece como tercera, después de Overview y Conversations.
- [ ] Para el QA Manager la tabla tiene las columnas Agent, Supervisor, Status, Calls, Auto-fails y Last call.
- [ ] Para el supervisor la tabla tiene las columnas Agent, Status, Calls, Auto-fails y Last call.
- [ ] La columna Agent muestra avatar, nombre e id.
- [ ] Status se muestra como badge: Active (verde), On leave (gris), Training (azul).
- [ ] Last call usa el mismo formato de fecha y hora que el resto de la plataforma.
- [ ] El contador "{N} agents" aparece arriba a la derecha de la sección y cuenta todos los agentes visibles.
- [ ] La tabla pagina de 10 en 10 con densidad compacta.
- [ ] Todos los textos están disponibles en español e inglés.
- [ ] La pestaña mantiene contraste suficiente en modo claro y oscuro.

## Accesibilidad

- Las filas clicables son alcanzables con teclado y se activan con Enter; el foco es visible.
- Los encabezados de columna ordenables comunican su estado de orden (ascendente/descendente) a lectores de pantalla.
- El estado del agente no depende solo del color: el badge incluye texto.
- El badge de auto-fails comunica la cantidad en texto.
- El contador de agentes y los mensajes de estado vacío o error se anuncian a lectores de pantalla.
- Áreas táctiles de al menos 44×44 px en los controles de paginación.

## Preguntas abiertas

- Falta el enlace de Figma.
- Confirmar si todas las columnas deben ser ordenables y si el orden inicial por Calls descendente es el definitivo.
- Confirmar si los stakeholders necesitan buscador o filtros (por supervisor, por estado) en esta historia o en otra.
- Confirmar si el supervisor debe poder ver agentes de otros equipos que participan en la campaña, o si el alcance a su equipo es definitivo.
- Confirmar si la columna Supervisor debe ocultarse también para el QA Manager (hoy solo se oculta para el supervisor).
