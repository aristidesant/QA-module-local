# US-team-ranking-agente: Team Rankings del agente

**Prioridad:** Debería · **Estimación:** L — intuición inicial, el equipo la refina

## Historia

Como agente de una campaña,
quiero ver el ranking activo de mi equipo con su premio, el podio y la tabla de posiciones, y consultar mis resultados en rankings anteriores,
para saber en qué lugar estoy, qué me falta para subir de posición y reconocer a mis compañeros.

## Contexto

Team Rankings es la pantalla del agente (`/qa/agent/rankings`) donde ve el ranking que su supervisor configuró para su equipo. Tiene dos pestañas: el ranking vigente (premio, podio, tabla de posiciones con detalle por agente) y los rankings pasados con su posición en cada uno. Historias relacionadas: configuración de programas de ranking (supervisor y QA Manager), Triggers (catálogo de badges) y perfil del agente.

## Referencias de diseño

- Figma: Pendiente
- Componentes clave: `ContentContainer`, `SectionCard`, `EmptyState`, `AppDrawer` (existentes); `Tabs`, `Badge`, `SegmentedControl`, `Progress` de Mantine; podio, tabla de posiciones, tarjetas responsive y drawer de detalle del agente. No se requieren componentes nuevos.

## Alcance

**Incluye:**

- Pestañas "Current leaderboard" y "Past leaderboards", con la pestaña activa reflejada en la URL (`?tab=`).
- Encabezado del ranking: nombre, descripción, quién lo definió, tipo de evaluación, premio, fechas, meta, días restantes y progreso del periodo.
- Podio con los tres primeros lugares.
- Tabla de posiciones con selector de periodo.
- Resaltado de la fila del propio agente.
- Reacciones entre compañeros (si el ranking las permite).
- Drawer de detalle de cada agente: rank, score, racha, movimiento, ventaja de puntos, badges y reacciones.
- Rankings pasados con la posición del agente.
- Vista responsive: tarjetas en lugar de tabla en pantallas estrechas.

**No incluye:**

- Crear, editar o cerrar rankings (lo hacen supervisor y QA Manager).
- Definir el catálogo de badges o los hitos.
- Elegir el ganador de un ranking.
- Notificaciones al alcanzar un hito.

## Estados de UI y casos límite

| Estado                            | Disparador                                      | Comportamiento de UI                                                                                           |
| --------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Por defecto                       | Entrada a la pantalla                           | Pestaña "Current leaderboard" activa, periodo por defecto seleccionado                                         |
| Cargando                          | Se solicitan el ranking y las posiciones        | Skeleton de encabezado, podio y tabla                                                                          |
| Sin ranking activo                | El equipo del agente no tiene un ranking activo | Estado vacío con "No active ranking for your team right now"                                                   |
| Ranking completado                | El ranking llegó a su fecha de fin              | El encabezado muestra "Completed" en lugar de los días restantes y el primer lugar muestra insignia de ganador |
| Agente sin ranking                | El agente no alcanza el mínimo de llamadas      | Su fila muestra "Below minimum calls" en rank y sin score                                                      |
| Fila propia                       | La fila corresponde al agente autenticado       | La fila aparece resaltada                                                                                      |
| Sin badges                        | El agente no ha ganado badges                   | La celda muestra vacío; en el detalle, "No badges earned yet" con una sugerencia                               |
| Muchos badges                     | Más de los que caben en la celda                | Se muestran los primeros y un contador "+N"                                                                    |
| Reacciones deshabilitadas         | El ranking no permite reacciones                | No aparece la columna Reactions ni la pestaña Reactions del detalle                                            |
| Fila propia en reacciones         | El agente mira su propia fila                   | En lugar de los botones aparece "Your standing"; no puede reaccionarse a sí mismo                              |
| Sin rankings pasados              | El equipo no tiene rankings completados         | Estado vacío "No past rankings yet"                                                                            |
| Sin posición en un ranking pasado | El agente no clasificó en ese ranking           | "Unranked" en la columna "Your rank"                                                                           |
| Pantalla estrecha                 | Ancho de 1024 px o menos                        | La tabla se reemplaza por tarjetas con la misma información                                                    |
| Error                             | Falla la petición                               | Mensaje de error con acción "Reintentar"                                                                       |

Detalles de interacción:

- **Selector de periodo:** cambia el periodo con el que se calculan las posiciones y recalcula tabla y podio.
- **Fila o tarjeta:** al hacer clic se abre el drawer de detalle de ese agente.
- **Drawer:** se cierra con el botón de cierre, con Esc o al hacer clic fuera.
- **Reacciones:** un clic activa la reacción y otro clic sobre la misma la quita; el clic no abre el drawer.
- **Teclado/foco:** todos los controles son alcanzables y operables con teclado.
- **Tema:** debe verse correctamente en modo claro y oscuro.

## Notas de datos y lógica

- **Ranking activo del agente:** el ranking activo cuyo programa incluye el equipo del agente. Si no hay uno activo, la pestaña actual muestra el estado vacío. Los rankings pasados son los completados de su equipo.
- **Datos del ranking:** nombre, descripción, creador, tipo de evaluación (QA, Sentiment & Emotion, Compliance, Business Insights), premio (icono y título), fecha de inicio y fin, meta, hitos con su badge y si permite reacciones.
- **Progreso del encabezado:** porcentaje del tiempo transcurrido entre fecha de inicio y de fin. Los días restantes se muestran en singular o plural ("1 day left", "N days left").
- **Posiciones:** se calculan por agente a partir de sus llamadas dentro del periodo seleccionado. Cada entrada incluye rank, nombre, score, badges ganados y tendencia de rank frente al periodo anterior. Los agentes que no alcanzan el mínimo de llamadas quedan sin rank y al final.
- **Formato del score:** depende del tipo de evaluación del ranking (por ejemplo, porcentaje o escala sobre 5).
- **Podio:** los tres primeros agentes con rank, con nombre, iniciales y score.
- **Tabla, columnas:** Rank, Name, Scorecard score, Badges y Reactions (esta última solo si el ranking permite reacciones). Orden inicial por rank ascendente; Rank, Name, Score y Badges son ordenables; Reactions no.
- **Detalle del agente:**
  - Rank, score (con la meta del ranking) y racha en semanas activas.
  - Movimiento de posición frente a la semana anterior (sube, baja o se mantiene).
  - Ventaja en puntos sobre el agente en la posición inmediatamente inferior, o indicación de empate o de última posición. La ventaja se resalta como cómoda cuando supera 5 puntos.
  - Reacciones recibidas y badges ganados.
  - Pestañas Achievements (badges ganados con su nivel Bronze, Silver o Gold, y el siguiente badge con su progreso y umbral) y Reactions (quién reaccionó y con qué), esta última solo si el ranking permite reacciones.
- **Reacciones:** cuatro tipos (Thumbs up, Celebrate, Heart, Fire). Cada agente puede dejar una reacción por compañero y por ranking, cambiarla o quitarla. No puede reaccionar a su propia fila. El backend debe persistir las reacciones y devolver los totales por tipo.
- **Hitos:** al abrir la pantalla se reconcilian los hitos que el agente haya alcanzado, para que sus badges estén al día.
- **Rankings pasados:** por cada ranking completado se muestra nombre, periodo, tipo, posición y score del agente ("#N · score" o "Unranked"), ganador y premio.
- **Textos:** disponibles en español e inglés.

## Criterios de aceptación

**Pestañas y encabezado**

```gherkin
Escenario: Entrada con ranking activo
  Dado que mi equipo tiene un ranking activo
  Cuando abro /qa/agent/rankings
  Entonces veo la pestaña "Current leaderboard" activa
  Y veo el encabezado con nombre, creador, tipo, premio, fechas, meta y días restantes
  Y veo el podio y la tabla de posiciones

Escenario: Pestaña reflejada en la URL
  Dado que estoy en "Current leaderboard"
  Cuando cambio a "Past leaderboards"
  Entonces la URL incluye ?tab=past
  Y al recargar la página sigo en "Past leaderboards"

Escenario: Sin ranking activo
  Dado que mi equipo no tiene un ranking activo
  Cuando abro "Current leaderboard"
  Entonces veo "No active ranking for your team right now"

Escenario: Ranking completado
  Dado que el ranking llegó a su fecha de fin
  Cuando veo el encabezado
  Entonces aparece "Completed" en lugar de los días restantes
  Y el primer lugar muestra la insignia de ganador
```

**Tabla de posiciones**

```gherkin
Escenario: Orden inicial y fila propia
  Dado que veo la tabla de posiciones
  Cuando se carga
  Entonces los agentes están ordenados por rank ascendente
  Y mi fila aparece resaltada

Escenario: Cambio de periodo
  Dado que veo la tabla de posiciones
  Cuando selecciono otro periodo en el selector
  Entonces la tabla y el podio se recalculan con ese periodo

Escenario: Agente sin mínimo de llamadas
  Dado que un agente no alcanza el mínimo de llamadas
  Cuando veo su fila
  Entonces su rank muestra "Below minimum calls" y su score aparece vacío

Escenario: Vista en pantalla estrecha
  Dado que el ancho de pantalla es de 1024 px o menos
  Cuando veo el ranking
  Entonces veo tarjetas en lugar de la tabla, con la misma información y las mismas acciones
```

**Reacciones**

```gherkin
Escenario: Reaccionar a un compañero
  Dado que el ranking permite reacciones
  Cuando hago clic en una reacción de la fila de un compañero
  Entonces mi reacción queda activa y el contador aumenta en 1
  Y no se abre el drawer de detalle

Escenario: Quitar mi reacción
  Dado que ya reaccioné a un compañero con "Fire"
  Cuando hago clic de nuevo en "Fire"
  Entonces mi reacción se quita y el contador disminuye en 1

Escenario: No reaccionar a mi propia fila
  Dado que el ranking permite reacciones
  Cuando veo mi propia fila
  Entonces veo "Your standing" en lugar de los botones de reacción

Escenario: Reacciones deshabilitadas
  Dado que el ranking no permite reacciones
  Cuando veo la tabla y el detalle
  Entonces no aparece la columna Reactions ni la pestaña Reactions
```

**Detalle del agente**

```gherkin
Escenario: Abrir el detalle
  Dado que veo la tabla de posiciones
  Cuando hago clic en la fila de un agente
  Entonces se abre el drawer con su rank, score con la meta, racha y señales de movimiento y ventaja de puntos

Escenario: Ventaja sobre la posición siguiente
  Dado que un agente está en una posición intermedia
  Cuando veo su detalle
  Entonces veo cuántos puntos de ventaja tiene sobre el agente inmediatamente inferior
  Y la ventaja se resalta como cómoda si supera 5 puntos

Escenario: Siguiente badge
  Dado que abro la pestaña Achievements de un agente
  Cuando aún le falta algún badge del ranking
  Entonces veo el siguiente badge con su progreso y el valor que lo desbloquea
```

**Rankings pasados**

```gherkin
Escenario: Mi posición en un ranking pasado
  Dado que mi equipo tiene rankings completados
  Cuando abro "Past leaderboards"
  Entonces veo por cada ranking su nombre, periodo, tipo, mi posición con score, ganador y premio

Escenario: No clasifiqué en un ranking pasado
  Dado que no alcancé el mínimo de llamadas en un ranking completado
  Cuando veo su fila
  Entonces mi posición muestra "Unranked"

Escenario: Sin rankings pasados
  Dado que mi equipo no tiene rankings completados
  Cuando abro "Past leaderboards"
  Entonces veo "No past rankings yet"
```

**Checklist de elementos estáticos**

- [ ] Las pestañas se llaman "Current leaderboard" y "Past leaderboards", con ícono.
- [ ] El encabezado incluye nombre, descripción, "Set by {nombre}", badge de tipo de evaluación y badge de premio.
- [ ] Las fechas de inicio y fin usan el formato `DD MMM YYYY`.
- [ ] El encabezado muestra la barra de progreso del periodo.
- [ ] El podio muestra oro, plata y bronce con iniciales, nombre y score.
- [ ] La sección de posiciones muestra el selector de periodo y un contador con el total de agentes.
- [ ] La tabla tiene las columnas Rank, Name, Scorecard score, Badges y Reactions.
- [ ] Los badges de la tabla muestran tooltip con el nombre.
- [ ] Los textos están disponibles en español e inglés.
- [ ] La pantalla mantiene contraste suficiente en modo claro y oscuro.

## Accesibilidad

- Las pestañas, el selector de periodo, las filas y las tarjetas son alcanzables con teclado; el foco es visible.
- Los encabezados ordenables comunican su estado de orden a lectores de pantalla.
- Los botones de reacción exponen su estado (`aria-pressed`) y un nombre accesible que incluye la reacción y el compañero.
- El rank, el movimiento y la ventaja de puntos no dependen solo del color: tienen texto o tooltip accesible por teclado.
- Los badges ganados tienen nombre accesible, no solo ícono.
- El drawer atrapa el foco mientras está abierto, se cierra con Esc y devuelve el foco a la fila que lo abrió.
- Las tarjetas de la vista responsive tienen la misma información y acciones que la tabla.

## Preguntas abiertas

- Falta el enlace de Figma.
- Confirmar los periodos disponibles en el selector y cuál es el periodo por defecto.
- Confirmar el mínimo de llamadas para entrar al ranking y si debe mostrarse al agente.
- Confirmar cómo se calcula la racha en semanas activas.
- Confirmar si el agente debe poder ver los rankings de otros equipos o solo el de su equipo.
- Confirmar si un agente puede cambiar o quitar una reacción en un ranking ya completado.
