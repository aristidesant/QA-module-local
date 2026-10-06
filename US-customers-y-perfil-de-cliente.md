# US-customers-y-perfil-de-cliente: Customers y perfil del cliente (Supervisor y QA Manager)

**Prioridad:** Debería · **Estimación:** L — intuición inicial, el equipo la refina

## Historia

Como supervisor o QA Manager,
quiero ver a los clientes contactados por mi equipo, entrar al perfil de cada uno y revisar su historial, su sentimiento, sus ofertas y qué otros productos u oportunidades le podrían interesar,
para entender qué tan receptivo es cada cliente, anticipar el riesgo de que se vaya y decidir cuál es el siguiente paso comercial con él.

## Contexto

Customers es la sección donde el supervisor (`/qa/supervisor/customers`) y el QA Manager (`/qa/qa-manager/customers`) consultan a las personas y empresas contactadas a través de la plataforma. Tiene dos pantallas: el listado de clientes con filtros e indicadores, y el perfil de cada cliente (`/customers/:customerId`) con seis pestañas: Overview, Contacts, Sentiment & Emotion, Offers & Signals, Surveys y Notes. El supervisor ve los clientes contactados por agentes de su equipo; el QA Manager ve todos. La ruta legacy `/qa/profiles/customer/:id` redirige al perfil nuevo. Historias relacionadas: Campañas (origen de los contactos), Evaluación de llamada (detalle de cada contacto) y Triggers & Recognition.

## Referencias de diseño

- Figma: Pendiente
- Componentes clave: `ContentContainer`, `SectionCard`, `BaseTable`, `StatCard`, `EmptyState` (existentes); `Tabs`, `Badge`, `SimpleGrid`, `Textarea`, `Modal` y gráficos de línea y barras de Mantine; medidor de receptividad y tarjetas de encuesta. No se requieren componentes nuevos fuera de la carpeta de la sección.

## Alcance

**Incluye:**

- Listado de clientes con franja de KPIs (clientes, receptivos, riesgo de abandono alto, No llamar y aceptación promedio de ofertas), búsqueda y filtros por segmento, estado, receptividad, riesgo de abandono, agente que lo contactó y solo No llamar.
- Navegación del listado al perfil del cliente y de vuelta.
- Encabezado del perfil: nombre, segmento, estado, datos de contacto, plan actual, valor mensual, canal preferido, idioma, etiquetas, "Tracked since", total de contactos, medidor de receptividad, riesgo de abandono y tendencia de sentimiento.
- Acciones del encabezado: agregar una nota y marcar o quitar "No llamar" con confirmación.
- Pestaña Overview: KPIs de contacto, tendencia de sentimiento, mejores y peores ventanas para contactarlo y señales de negocio.
- Pestaña Contacts: historial de contactos (fecha, dirección, canal, agente, campaña, resultado, duración, sentimiento, emoción y oferta, con el resumen del contacto al expandir la fila) y sentimiento por agente en un gráfico de barras con tabla.
- Pestaña Sentiment & Emotion: sentimiento promedio (primero, último, mejor y peor) y evolución del sentimiento en el tiempo, cliente contra agente. En los gráficos de sentimiento por agente y de sentimiento en el tiempo, el eje Y muestra cada valor de 1 a 5 con su tipo de sentimiento.
- Pestaña Offers & Signals: KPIs de ofertas, historial de ofertas, productos recomendados, oportunidades de negocio, competidores mencionados, objeciones frecuentes y señales de negocio detectadas.
- Pestaña Surveys: NPS, CSAT, tasa de respuesta, tendencia de NPS y respuestas con su comentario.
- Pestaña Notes: notas internas del cliente, visibles para supervisores y QA Managers.
- Pestaña activa reflejada en la URL (`?tab=`).

**No incluye:**

- Crear, editar o eliminar clientes.
- Programar seguimientos o llamadas desde el perfil.
- Columna "Open call" en el historial de contactos (se eliminó; desde el perfil ya no se navega al detalle de la llamada).
- Línea de tiempo de interacciones (se eliminó; el historial vive en Contacts, Offers y Surveys).
- Categorías de sentimiento y emociones dominantes en la pestaña Sentiment & Emotion.
- Razones de no conversión como bloque independiente.
- Presentar o enviar las ofertas recomendadas al cliente.
- Cálculo real de receptividad, abandono o recomendaciones (es una simulación sobre datos de ejemplo).

## Estados de UI y casos límite

| Estado                | Disparador                                                        | Comportamiento de UI                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Por defecto           | Entrada al listado                                                | Todos los clientes visibles para el rol, ordenados por último contacto                                                                                      |
| Cargando              | Se solicitan clientes o perfil                                    | Skeleton de KPIs, tabla y pestañas                                                                                                                          |
| Sin resultados        | Los filtros no coinciden con ningún cliente                       | "No customers match the current filters." con acción "Clear filters"                                                                                        |
| Cliente no encontrado | El id no existe o el supervisor no tiene contacto con ese cliente | Estado vacío "Customer not found" con botón "Back to customers"                                                                                             |
| Cliente prospecto     | Estado Prospect                                                   | Plan actual "—" y valor mensual oculto; sugerencia de conversión en oportunidades                                                                           |
| Cliente perdido       | Estado Churned                                                    | Riesgo de abandono alto; recomendación de recuperación con descuento por lealtad                                                                            |
| No llamar activo      | El cliente tiene la marca No llamar                               | Badge "Do-Not-Call" en el encabezado; sin productos recomendados, un aviso de que no se pueden hacer ofertas y solo una oportunidad de contacto de servicio |
| Sin ofertas           | El cliente no ha recibido ofertas                                 | "No offers presented yet." en el historial                                                                                                                  |
| Sin recomendaciones   | No hay actividad suficiente para recomendar                       | "Not enough activity to recommend anything yet."                                                                                                            |
| Sin encuestas         | El cliente no ha respondido encuestas                             | "No survey responses yet."                                                                                                                                  |
| Sin notas             | El cliente no tiene notas                                         | La pestaña muestra el campo para escribir la primera nota                                                                                                   |
| Pantalla estrecha     | Ancho de 1024 px o menos                                          | Las cuadrículas pasan a una columna y la tabla del listado se adapta al ancho                                                                               |
| Error                 | Falla la petición                                                 | Mensaje de error con acción "Reintentar"                                                                                                                    |

Detalles de interacción:

- **Fila del listado:** al hacer clic se abre el perfil del cliente.
- **Filtros:** se combinan entre sí; "Clear filters" los restablece.
- **Historial de contactos:** al expandir una fila se muestra el resumen del contacto; la fila no abre el detalle de la llamada.
- **Pestañas:** al cambiar de pestaña se actualiza `?tab=`; al recargar se conserva la pestaña.
- **Agregar nota (encabezado):** abre la pestaña Notes con el foco en el campo de texto.
- **Guardar nota:** la nota aparece al inicio de la lista con autor, rol y fecha; el botón está deshabilitado con el campo vacío.
- **No llamar:** pide confirmación; al aceptar, la marca cambia, el consentimiento de marketing se actualiza y las recomendaciones se recalculan.
- **Recomendaciones:** son informativas; no tienen acciones.
- **Tema:** debe verse correctamente en modo claro y oscuro.

## Notas de datos y lógica

- **Cliente:** id, nombre, teléfono, correo, ciudad, segmento (Residential, Business, Premium), estado (Active, Prospect, Churned), idioma, canal preferido, plan actual, valor mensual, fecha de seguimiento inicial, consentimientos, marca No llamar y etiquetas.
- **Visibilidad por rol:** el supervisor ve los clientes contactados por al menos un agente de su equipo; el QA Manager ve todos.
- **Receptividad:** puntaje de 0 a 100 que combina tasa de aceptación de ofertas (50%), tasa de respuesta (25%) y sentimiento promedio (25%). Bandas: Receptive (60 o más), Neutral (35 a 59) y Resistant (menos de 35).
- **Riesgo de abandono:** alto si el cliente está perdido, si su sentimiento promedio es menor a 2.6 o si cae más de 0.5 frente al inicio; medio si el sentimiento es menor a 3.4; bajo en los demás casos.
- **Sentimiento:** escala de 1 a 5 por contacto contestado, con los tipos 1 Very Negative, 2 Negative, 3 Neutral, 4 Positive y 5 Very Positive. La tendencia (sube, baja o estable) compara el primer y el último tercio de los contactos.
- **Ventanas de contacto:** combinación de día de la semana y franja horaria (mañana, tarde, noche), con las mejores por aceptación y tasa de respuesta y las peores por rechazos.
- **Señales de negocio:** conteo y porcentaje, sobre los contactos contestados, de cada señal detectada en las llamadas (por ejemplo, objeción temprana, objeción no atendida, competidor más costo, oferta mal dirigida, mejor franja horaria).
- **Ofertas:** cada oferta tiene nombre, precio mensual, resultado (aceptada, rechazada, aplazada), agente, razón de no conversión y competidor mencionado cuando aplica.
- **Productos recomendados:** hasta tres productos del catálogo de ofertas de la empresa, con precio mensual, nivel de ajuste (alto o medio) y una razón corta. Se excluyen los productos que el cliente ya tiene en su plan o ya aceptó. Se priorizan los productos aplazados, los de menor precio si rechazó una oferta por precio, los premium si es receptivo y el descuento por lealtad si hay riesgo alto, es cliente perdido o mencionó a un competidor. No se recomienda un producto que ya rechazó.
- **Oportunidades de negocio:** hasta cuatro, cada una con tipo (Upsell, Cross-sell, Retention, Win-back, Bundle o Conversion), título, justificación y probabilidad (alta, media o baja). Se derivan del estado del cliente, su receptividad, su riesgo de abandono, su plan y los competidores mencionados. Con No llamar activo solo se muestra un contacto de servicio con probabilidad baja.
- **Notas:** texto libre con autor, rol (Supervisor o QA Manager) y fecha; se ordenan de la más reciente a la más antigua.
- **Encuestas:** NPS (0 a 10) y CSAT (1 a 5) con comentario opcional; los detractores (NPS de 0 a 6) se resaltan.
- **Textos:** disponibles en español e inglés. Los nombres de clientes, planes, productos y los textos de las recomendaciones pueden permanecer en inglés.

## Criterios de aceptación

**Listado**

```gherkin
Escenario: Entrada al listado como supervisor
  Dado que soy supervisor
  Cuando abro /qa/supervisor/customers
  Entonces veo solo los clientes contactados por agentes de mi equipo
  Y veo la franja de KPIs y los filtros

Escenario: Filtrar clientes
  Dado que veo el listado
  Cuando filtro por riesgo de abandono "High" y receptividad "Resistant"
  Entonces veo solo los clientes que cumplen ambos filtros

Escenario: Sin resultados
  Dado que ningún cliente cumple los filtros
  Cuando veo el listado
  Entonces veo "No customers match the current filters." y la acción "Clear filters"

Escenario: Abrir un perfil
  Dado que veo el listado
  Cuando hago clic en la fila de un cliente
  Entonces se abre su perfil con la pestaña Overview activa
```

**Encabezado y acciones**

```gherkin
Escenario: Encabezado del perfil
  Dado que abro el perfil de un cliente
  Cuando se carga
  Entonces veo su plan, valor, canal preferido, idioma y etiquetas
  Y veo "Tracked since {fecha}" y el total de contactos
  Y no veo el texto "Customer since"

Escenario: Marcar No llamar
  Dado que el cliente no tiene la marca No llamar
  Cuando la activo y confirmo
  Entonces el encabezado muestra el badge "Do-Not-Call"
  Y las recomendaciones se actualizan

Escenario: Cliente fuera de mi equipo
  Dado que soy supervisor
  Cuando abro el perfil de un cliente que ningún agente de mi equipo contactó
  Entonces veo "Customer not found" y el botón "Back to customers"
```

**Pestañas**

```gherkin
Escenario: Historial de contactos sin columna de llamada
  Dado que abro la pestaña "Contacts"
  Cuando veo la tabla del historial de contactos
  Entonces no veo la columna "Open call"
  Y al expandir una fila veo el resumen del contacto

Escenario: Eje Y con el tipo de sentimiento
  Dado que veo el gráfico de sentimiento por agente o el de sentimiento en el tiempo
  Cuando reviso el eje Y
  Entonces cada valor de 1 a 5 aparece con su tipo de sentimiento, por ejemplo "1 · Very Negative" y "5 · Very Positive"

Escenario: Pestaña reflejada en la URL
  Dado que estoy en el perfil de un cliente
  Cuando cambio a "Offers & Signals"
  Entonces la URL incluye ?tab=offers
  Y al recargar la página sigo en "Offers & Signals"

Escenario: Pestañas disponibles
  Dado que abro el perfil de un cliente
  Cuando veo las pestañas
  Entonces veo Overview, Contacts, Sentiment & Emotion, Offers & Signals, Surveys y Notes
  Y no veo la pestaña "Timeline"

Escenario: Sentimiento sin categorías
  Dado que abro la pestaña "Sentiment & Emotion"
  Cuando se carga
  Entonces veo el sentimiento promedio y su evolución en el tiempo
  Y no veo la sección "Sentiment categories"
```

**Offers & Signals**

```gherkin
Escenario: Productos recomendados
  Dado que un cliente activo y receptivo no tiene el plan premium
  Cuando abro "Offers & Signals"
  Entonces veo hasta tres productos recomendados con precio, nivel de ajuste y razón
  Y no veo productos que el cliente ya tiene o aceptó

Escenario: Oportunidades de negocio
  Dado que un cliente tiene riesgo de abandono medio o alto
  Cuando abro "Offers & Signals"
  Entonces veo una oportunidad de retención con su justificación y su probabilidad

Escenario: Cliente con No llamar
  Dado que el cliente tiene la marca No llamar
  Cuando abro "Offers & Signals"
  Entonces veo el aviso de que no se pueden hacer ofertas
  Y solo veo una oportunidad de contacto de servicio

Escenario: Sin razones de no conversión
  Dado que abro "Offers & Signals"
  Cuando veo la pantalla
  Entonces no veo el bloque "Non-conversion reasons"
```

**Notes**

```gherkin
Escenario: Agregar una nota desde el encabezado
  Dado que estoy en cualquier pestaña del perfil
  Cuando hago clic en "Add note"
  Entonces se abre la pestaña "Notes" con el foco en el campo de texto

Escenario: Guardar una nota
  Dado que escribí un texto en el campo de nota
  Cuando hago clic en "Save note"
  Entonces la nota aparece al inicio de la lista con mi nombre, mi rol y la fecha
  Y el campo queda vacío

Escenario: Nota vacía
  Dado que el campo de nota está vacío
  Cuando veo el botón "Save note"
  Entonces el botón está deshabilitado
```

**Checklist de elementos estáticos**

- [ ] El listado muestra título, descripción según el rol, franja de KPIs, filtros y contador de clientes.
- [ ] La tabla tiene las columnas Customer, Segment, Status, Contacts, Last contact, Receptiveness, Churn risk, Avg. sentiment, Offer acceptance, Latest NPS, Last agent y Best window.
- [ ] El perfil tiene migas de pan "Customers › {nombre}" y botón de volver.
- [ ] Las pestañas se llaman Overview, Contacts, Sentiment & Emotion, Offers & Signals, Surveys y Notes, con ícono.
- [ ] El encabezado no muestra "Customer since".
- [ ] Offers & Signals muestra las tarjetas "Recommended products" y "Business opportunities" en lugar de "Non-conversion reasons".
- [ ] La tabla del historial de contactos tiene las columnas Date, Direction, Channel, Agent, Campaign, Outcome, Duration, Sentiment, Emotion y Offer, sin "Open call".
- [ ] El eje Y de los gráficos de sentimiento muestra los valores 1 a 5, cada uno con su tipo de sentimiento.
- [ ] Los badges de ajuste, probabilidad y tipo de oportunidad tienen color y texto.
- [ ] Las fechas usan el formato `DD MMM YYYY` y los precios el formato `$X/mo`.
- [ ] Los textos están disponibles en español e inglés.
- [ ] La pantalla mantiene contraste suficiente en modo claro y oscuro.

## Accesibilidad

- Filtros, filas, pestañas, botones de acción y campo de nota son alcanzables y operables con teclado; el foco es visible.
- El riesgo de abandono, la receptividad, el ajuste y la probabilidad no dependen solo del color: tienen etiqueta de texto.
- Los gráficos tienen el tipo de sentimiento en el eje Y, no solo el número, y una alternativa en texto con los valores (primero, último, mejor y peor sentimiento; tabla de sentimiento por agente).
- El modal de No llamar atrapa el foco, se cierra con Esc y devuelve el foco al botón que lo abrió.
- Al abrir "Notes" desde "Add note", el foco pasa al campo de texto y se anuncia el cambio de pestaña.
- Las filas del listado son operables con teclado y tienen nombre accesible con el nombre del cliente.

## Preguntas abiertas

- Falta el enlace de Figma.
- Confirmar los criterios y los umbrales reales de receptividad y riesgo de abandono, y si deben ser configurables.
- Confirmar si las recomendaciones de productos y oportunidades las calcula el backend o una regla de negocio, y con qué datos.
- Confirmar cuál es el catálogo oficial de productos y cómo se determina qué productos tiene ya el cliente.
- Confirmar si las notas pueden editarse o eliminarse y si el agente puede verlas.
- Confirmar si al marcar No llamar debe registrarse quién lo hizo y cuándo, ahora que no hay línea de tiempo.
- Confirmar si el historial de interacciones en forma de línea de tiempo se necesita en otra pantalla.
