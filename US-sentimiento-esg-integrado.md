# US-sentimiento-esg-integrado: Seguimiento de sentimiento ESG integrado

**Prioridad:** Debería · **Estimación:** L — intuición inicial, el equipo la refina

## Historia

Como QA Manager,
quiero que cada llamada muestre cómo se trató el tema de sostenibilidad (ambiental, social y de gobernanza) y qué dijo el cliente sobre ese tema,
para detectar prácticas débiles y riesgos de reputación en llamadas concretas y dar coaching con evidencia.

Como Operation Manager,
quiero ver el puntaje ESG de toda la marca, por equipo y por campaña, con su tendencia, y cómo se relaciona con el NPS de los clientes en un informe de salud de marca,
para saber si la sostenibilidad se refleja en la experiencia del cliente, decidir dónde actuar a nivel operación y diferenciar la marca en mercados donde los clientes valoran el compromiso social.

Como supervisor,
quiero ver el puntaje ESG de mi equipo y las llamadas que lo están bajando,
para dar coaching concreto sobre prácticas ambientales, sociales o de gobernanza, sin revisar cada llamada.

## Contexto

Hoy el sistema evalúa cada llamada en tres pilares ESG (ambiental, social y de gobernanza), pero solo mide lo que hace el agente, y el puntaje ESG solo aparece a nivel de llamada. El NPS ya existe por cliente, pero no se cruza con temas de sostenibilidad. Esta historia une ambas piezas: mide la práctica del agente, captura lo que el cliente dice sobre sostenibilidad y lo presenta junto con el NPS para entender el efecto en la marca. El panel del Operation Manager ya tiene una tarjeta ESG de marca, pero con datos de ejemplo; esta historia la conecta con datos reales y le añade la vista de NPS. Historias relacionadas: Evaluación de una llamada (pestaña ESG), Dashboard de desempeño (área ESG), Perfil de cliente (NPS) y Coaching.

## Referencias de diseño

- Figma: Pendiente (referencia: pestaña ESG del detalle de una llamada y el área ESG del panel de desempeño).
- Componentes clave: tarjetas de sección, anillo de puntaje, barras de progreso, etiquetas de estado, cita con minuto, tarjetas de área del panel de desempeño y tarjeta de NPS del perfil de cliente. Todos existen en el producto; el informe de salud de marca es el único elemento nuevo.

## Alcance

**Incluye:**

- Evaluación ESG por llamada: tres pilares (Ambiental, Social, Gobernanza), cada uno con tres prácticas observadas, con estado (cumple, advertencia o incumplimiento), puntaje y, cuando aplica, una cita con su minuto.
- Pestaña ESG en el detalle de la llamada, visible solo para supervisores y QA Managers.
- Área ESG en el panel de desempeño de QA Managers, supervisores y Operation Managers: puntaje general, tres pilares y número de llamadas señaladas.
- Temas de sostenibilidad que menciona el cliente en la llamada, con su tono (positivo, neutro o negativo) y una cita.
- Vista del NPS del cliente junto a sus temas de sostenibilidad.
- Informe de salud de marca que cruza ESG y NPS por periodo, equipo y tema.
- Vista de marca para el Operation Manager: puntaje ESG de toda la marca, tendencia y desglose por equipo y campaña, con los estados bien, en vigilancia o en riesgo.
- Filtro de llamadas por pilar o por tema de sostenibilidad.

**No incluye:**

- Evaluación de chats o correos (solo llamadas grabadas y transcritas).
- Configuración de pesos, umbrales y catálogo de prácticas ESG (quedan fijos en esta versión).
- Vista del agente de su propio puntaje ESG (oculta por decisión de producto).
- Certificaciones externas, reportes regulatorios de sostenibilidad o cálculo de huella de carbono.
- Encuestas nuevas de sostenibilidad (solo se usa el NPS existente).
- Reportes de ESG fuera del informe de salud de marca.

## Criterios de evaluación ESG por llamada

Las nueve prácticas y sus nombres ya existen en el producto. Lo que el código no define son las reglas para decidir si una práctica cumple, tiene advertencia o incumple. Esta sección propone esas reglas para validarlas con los QA Managers y con producto.

**Paso 1. Identificar las prácticas aplicables.** Cada llamada se revisa contra las nueve prácticas. Si una práctica no tuvo ocasión de aparecer, por ejemplo cuando nunca se habla de equipos o de cobro, se marca "No aplica" y no entra en el cálculo. (Propuesto.)

**Paso 2. Asignar el estado de cada práctica.** Las reglas propuestas son:

| Pilar      | Práctica                             | Cumple                                                                                                   | Advertencia                                            | Incumplimiento                                                                         |
| ---------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Ambiental  | Facturación digital ofrecida         | Se ofrece cuando se habla de cobro o de un paquete nuevo                                                 | Se habla de cobro o de un paquete nuevo y no se ofrece | El agente afirma que no hay facturación digital cuando sí la hay                       |
| Ambiental  | Devolución y reciclaje de equipos    | Al cambiar o retirar un equipo se explica cómo devolverlo y reciclarlo                                   | Se explica a medias, sin mencionar el reciclaje        | El agente indica que el equipo se desecha cuando el cliente pregunta por su devolución |
| Ambiental  | Opción sostenible mencionada         | Se menciona la opción sostenible del producto cuando existe (por ejemplo, un módem de ahorro de energía) | Existe la opción y no se menciona                      | No aplica: esta práctica nunca pasa a incumplimiento (propuesto)                       |
| Social     | Lenguaje incluyente y respetuoso     | Trato respetuoso durante toda la llamada                                                                 | Un comentario o tono que molesta, sin ser ofensivo     | Lenguaje discriminatorio, despectivo o burlón                                          |
| Social     | Ajustes de accesibilidad             | Si el cliente pide o necesita apoyo (por ejemplo, un resumen por escrito), el agente lo ofrece           | Hay señal de la necesidad y no se ofrece               | Se niega un ajuste que el cliente pidió                                                |
| Social     | Trato a clientes vulnerables         | Reconoce la preocupación del cliente y no presiona                                                       | Reconoce la preocupación, pero insiste en la oferta    | Presiona a un cliente que expresó dificultad o vulnerabilidad                          |
| Gobernanza | Precios y condiciones transparentes  | Se dicen el precio promocional, el precio regular, la duración y lo que incluye                          | Falta un dato, por ejemplo el precio regular           | Se oculta o se miente sobre el precio o las condiciones                                |
| Gobernanza | Consentimiento de datos y privacidad | Se informa la grabación y se pide consentimiento cuando se capturan datos                                | Se informa la grabación, pero no el uso de los datos   | Se capturan datos sin consentimiento                                                   |
| Gobernanza | Ruta de quejas y escalamiento        | Si el cliente se queja, el agente explica cómo escalar                                                   | Se atiende la queja sin mencionar cómo escalar         | Se ignora la queja o se impide escalarla                                               |

**Paso 3. Convertir el estado en puntaje.** Valores propuestos por estado:

| Estado                                | Puntaje                      |
| ------------------------------------- | ---------------------------- |
| Cumple                                | 100                          |
| Cumple con reserva (una brecha menor) | 75                           |
| Advertencia                           | 50                           |
| Incumplimiento                        | De 0 a 40, según la gravedad |

**Paso 4. Calcular pilares y puntaje general.** Esta regla ya está aplicada en los datos de ejemplo. El puntaje de cada pilar es el promedio simple de sus prácticas aplicables. El puntaje general es el promedio de los tres pilares. En la llamada de ejemplo, Ambiental suma 50, 100 y 50, y da 67; el general da 81.

**Paso 5. Asignar el estado general.** Es "Violation" si alguna práctica está en incumplimiento; "Warning" si alguna está en advertencia; y "Compliant" si ninguna lo está. Es la misma regla de la evaluación de compliance.

**Paso 6. Señalar la llamada.** Si algún pilar queda bajo 70, la llamada aparece como señalada en la pestaña y cuenta en el área ESG del panel.

**Reglas de evidencia.**

- Una advertencia o un incumplimiento necesitan una cita literal con minuto y hablante, o una nota que diga qué se buscó y en qué tramo. (Propuesto.)
- Un cumplimiento puede llevar cita. Si la tiene, sirve como ejemplo positivo, pero no es obligatoria.
- Si la cita no aparece literal en la transcripción, se muestra sin subrayado. Un incumplimiento con cita no verificable requiere revisión humana antes de contar. (Propuesto.)

**Cuándo se evalúa.** La evaluación corre sola al terminar la transcripción de cada llamada. No se puede editar a mano desde la pestaña. Una llamada sin transcripción muestra "Evaluación ESG pendiente". (Supuesto: cobertura de todas las llamadas con grabación.)

**Qué no evalúa.** No juzga si la oferta es buena para el cliente. Solo evalúa la conducta del agente y la información que recibe el cliente sobre los temas ESG cuando corresponde.

## Estados de UI y casos límite

| Estado                                            | Disparador                                                   | Comportamiento de UI                                                                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Por defecto                                       | Se abre la pestaña ESG de una llamada                        | Puntaje general en anillo, estado, número de incumplimientos y advertencias, y los tres pilares en orden fijo                        |
| Cargando                                          | Se están pidiendo los datos de la llamada o del panel        | Marcadores de carga en el anillo y en los pilares; sin puntajes parciales                                                            |
| Error de carga                                    | Falla la obtención de la evaluación ESG                      | Mensaje de error con botón "Reintentar"; el resto de la llamada sigue funcionando                                                    |
| Sin evaluación                                    | La llamada aún no fue evaluada en ESG                        | Mensaje "Evaluación ESG pendiente" sin puntaje                                                                                       |
| Pilar sin práctica observada                      | Ninguna práctica del pilar aplica a la llamada               | El pilar muestra "No aplica" en gris y no cuenta para el puntaje general                                                             |
| Pilar bajo 70                                     | Puntaje del pilar menor que 70                               | La barra y la etiqueta del pilar pasan a rojo; con 70 o más se mantienen en gris                                                     |
| Incumplimiento                                    | Una práctica en incumplimiento                               | Etiqueta "Violation" en rojo con ícono de alerta; la nota explica qué faltó                                                          |
| Advertencia                                       | Una práctica en advertencia                                  | Etiqueta "Warning" en gris con ícono de triángulo                                                                                    |
| Cliente menciona sostenibilidad de forma positiva | El cliente elogia una práctica ambiental o social            | Tema en la lista del cliente con etiqueta verde y cita con minuto                                                                    |
| Cliente menciona sostenibilidad de forma negativa | El cliente critica una práctica o pide más                   | Tema con etiqueta gris de riesgo y cita con minuto; cuenta como señal en el informe                                                  |
| Sin temas de sostenibilidad                       | La llamada no tiene ningún tema ESG del cliente              | Mensaje "No se mencionaron temas de sostenibilidad" en la sección del cliente                                                        |
| Cliente sin NPS                                   | El cliente no tiene respuesta de NPS                         | Guion "—" en la tarjeta de NPS; no se incluye en el cruce del informe                                                                |
| NPS con banda                                     | El cliente tiene NPS                                         | Número con su banda (promotor, pasivo o detractor) con la misma escala de la pestaña de encuestas                                    |
| Muestra insuficiente                              | Un tema o equipo tiene menos casos que el mínimo del informe | Aviso "Muestra insuficiente para comparar" en lugar de la diferencia de NPS                                                          |
| Informe sin datos                                 | No hay llamadas ni NPS en el periodo elegido                 | Mensaje "No hay datos para este periodo" con sugerencia de ampliar el rango                                                          |
| Periodo cambiado                                  | El usuario cambia el rango de fechas del informe             | Los gráficos y tablas se actualizan sin recargar la página                                                                           |
| Rol agente                                        | Un agente abre una de sus llamadas                           | No ve la pestaña ESG, ni el área ESG, ni el informe de salud de marca                                                                |
| Operation Manager                                 | Abre el panel de desempeño o la tarjeta ESG                  | Ve el puntaje de marca, los tres pilares y el desglose por equipo y campaña; no ve transcripciones ni citas de llamadas individuales |
| Marca en vigilancia                               | Puntaje de marca entre 70 y 79 (umbral propuesto)            | Estado "En vigilancia" en ámbar en la tarjeta ESG                                                                                    |
| Marca en riesgo                                   | Puntaje de marca menor que 70                                | Estado "En riesgo" en rojo en la tarjeta ESG                                                                                         |
| Llamada con datos sensibles                       | La cita del cliente o del agente contiene datos ocultos      | La cita muestra el dato enmascarado con la misma etiqueta de ocultamiento de la evaluación de llamada                                |
| Contenido largo                                   | Citas o notas extensas                                       | El texto se ajusta en varias líneas dentro de su tarjeta                                                                             |

Detalles de interacción:

- Clic en una cita o en un tema del cliente: abre la llamada en ese minuto, en la pestaña ESG.
- El informe de salud de marca muestra un aviso permanente: "Relación, no causa. El NPS y los temas ESG se cruzan por correlación."
- Teclado: la pestaña, los pilares desplegables, las citas, los filtros y los controles del informe se pueden usar con teclado.
- En pantallas pequeñas, el anillo y los pilares se apilan en una columna; los gráficos del informe pasan a tabla.
- Los colores deben mantener buen contraste en modo claro y oscuro; el rojo se reserva para incumplimientos y puntajes bajo 70.

## Notas de datos y lógica

- **Puntaje ESG por llamada.** Cada pilar recibe un puntaje de 0 a 100 a partir de sus tres prácticas. El puntaje general es el promedio de los tres pilares. Una llamada queda señalada si algún pilar está bajo 70 (meta fija en esta versión). El detalle de cada práctica y de sus estados está en Criterios de evaluación ESG por llamada.
- **Prácticas observadas.** Ambiental: ofrecer facturación digital, explicar la devolución y reciclaje de equipos, mencionar opciones sostenibles. Social: lenguaje incluyente y respetuoso, accesibilidad, trato a clientes vulnerables. Gobernanza: precios y condiciones transparentes, consentimiento de datos, ruta de quejas y escalamiento.
- **Evidencia.** Cada práctica con evidencia guarda minuto, hablante (agente o cliente) y cita textual. Si la cita no es texto literal de la transcripción, se muestra sin subrayado dentro de la transcripción.
- **Temas de sostenibilidad del cliente.** Se detectan en la transcripción de la llamada: tema, tono (positivo, neutro o negativo), minuto y cita. Supuesto: esta es la fuente de "feedback del cliente" (confirmar en preguntas abiertas).
- **NPS.** Es el último NPS del cliente, ya existente. El informe calcula el NPS promedio de los clientes agrupados por tema de sostenibilidad y por tono, y lo compara con el NPS de los clientes que no mencionaron el tema.
- **Muestra mínima.** Un cruce solo se muestra si tiene al menos 30 casos (valor propuesto; confirmar).
- **ESG es medida de marca.** El puntaje ESG del informe se agrega por periodo, equipo, campaña y marca. El NPS individual sigue en el perfil del cliente.
- **Permisos.** Supervisor ve su equipo; QA Manager ve todos los equipos y sus llamadas; Operation Manager ve la marca completa, sus equipos y sus campañas en agregado, pero no las transcripciones ni las citas de llamadas individuales (supuesto, ver preguntas). El agente no ve nada de ESG. Las reglas de privacidad de datos del cliente se aplican igual en las citas.
- **Ocultamiento.** Las citas del cliente y del agente siguen las reglas de ocultamiento de datos sensibles de la evaluación de llamada.
- **Sin acción automática.** Esta historia solo muestra resultados. Las reglas que asignan material o coaching a partir de ESG son parte de la historia de reglas de coaching.
- **Idioma.** Dashboard, perfil de cliente e informe en español e inglés. La pestaña de llamada es solo en inglés hoy (ver preguntas abiertas).

## Criterios de aceptación

```gherkin
Escenario: Llamada con un pilar bajo
  Dado que el pilar Social de una llamada tiene un puntaje de 62
  Cuando abro la pestaña ESG de la llamada
  Entonces la barra y la etiqueta del pilar Social se muestran en rojo
  Y la llamada aparece como señalada

Escenario: Práctica en incumplimiento con cita
  Dado que la práctica "Data Consent & Privacy" está en incumplimiento con una cita en el minuto 2:10
  Cuando veo el pilar Gobernanza
  Entonces la práctica muestra la etiqueta "Violation" en rojo
  Y la cita muestra el minuto 2:10 y el botón "Play from here"

Escenario: Pilar sin práctica observada
  Dado que ninguna práctica del pilar Ambiental aplica a la llamada
  Cuando veo el pilar Ambiental
  Entonces muestra "No aplica"
  Y no cuenta para el puntaje general

Escenario: Cliente critica una práctica
  Dado que el cliente dice en el minuto 4:05 que no le ofrecieron factura digital
  Cuando abro la sección de temas de sostenibilidad de la llamada
  Entonces aparece el tema "Facturación digital" con tono negativo
  Y la cita muestra el minuto 4:05

Escenario: Agente no ve ESG
  Dado que soy agente y abro una de mis llamadas
  Cuando reviso las pestañas
  Entonces no aparece la pestaña ESG
  Y el panel de desempeño no muestra el área ESG

Escenario: Área ESG en el panel de desempeño
  Dado que soy QA Manager u Operation Manager
  Cuando elijo el área ESG en el panel de desempeño
  Entonces veo el puntaje general y las tarjetas de los tres pilares
  Y una tarjeta con el número de llamadas señaladas

Escenario: Operation Manager ve la marca completa
  Dado que soy Operation Manager
  Cuando abro la tarjeta ESG del panel
  Entonces veo el puntaje de la marca y los tres pilares
  Y puedo desglosar el puntaje por equipo y por campaña

Escenario: Operation Manager no abre transcripciones
  Dado que soy Operation Manager y veo el desglose de una campaña
  Cuando busco una llamada concreta
  Entonces no veo transcripciones ni citas de llamadas individuales

Escenario: Marca en riesgo
  Dado que el puntaje de la marca es 68
  Cuando abro la tarjeta ESG
  Entonces el estado muestra "En riesgo" en rojo

Escenario: Informe de salud de marca cruza ESG y NPS
  Dado que hay al menos 30 clientes con temas de sostenibilidad y NPS en el periodo
  Cuando abro el informe de salud de marca
  Entonces veo el NPS promedio de los clientes que mencionaron cada tema
  Y veo el aviso "Relación, no causa"

Escenario: Muestra insuficiente
  Dado que un tema tiene 12 clientes con NPS en el periodo
  Cuando abro el informe de salud de marca
  Entonces ese tema muestra "Muestra insuficiente para comparar"
  Y no muestra la diferencia de NPS

Escenario: Cliente sin NPS
  Dado que un cliente no tiene respuesta de NPS
  Cuando veo su tarjeta de NPS en el perfil
  Entonces muestra "—"
  Y no entra en el cruce del informe

Escenario: Periodo sin datos
  Dado que no hay llamadas evaluadas en el periodo elegido
  Cuando abro el informe de salud de marca
  Entonces veo "No hay datos para este periodo"
  Y el botón para ampliar el rango
```

Lista de comprobación de elementos fijos:

- [ ] La pestaña ESG muestra el anillo con el puntaje general, la etiqueta de estado, el número de incumplimientos y advertencias, y el texto "Average of Environmental, Social and Governance pillar scores".
- [ ] Los pilares aparecen siempre en el orden Ambiental, Social, Gobernanza, cada uno con su descripción y puntaje.
- [ ] El rojo se usa solo para incumplimientos y puntajes bajo 70.
- [ ] El área ESG del panel muestra cuatro tarjetas: tres pilares y llamadas señaladas.
- [ ] El NPS del cliente muestra número y banda con la misma escala de la pestaña de encuestas.
- [ ] La tarjeta ESG del Operation Manager muestra el puntaje de marca, su estado y los tres pilares con datos reales en lugar de los de ejemplo.
- [ ] El informe muestra el aviso "Relación, no causa" de forma visible, no al pie de página.
- [ ] Todos los textos del dashboard, del perfil y del informe están en español e inglés.
- [ ] Los colores tienen buen contraste en modo claro y oscuro.

## Accesibilidad

- El estado de cada práctica se comunica con texto ("Violation", "Warning", "No aplica"), no solo con color ni con el ícono.
- El anillo y las barras de progreso tienen su valor numérico disponible para lectores de pantalla.
- Cada cita anuncia su hablante y su minuto, por ejemplo "Agente, minuto 2 con 10 segundos".
- Los gráficos del informe tienen una tabla equivalente accesible con los mismos valores.
- El aviso "Relación, no causa" se lee al abrir el informe.
- Las zonas para tocar los íconos de acción tienen al menos 32 píxeles.

## Preguntas abiertas

1. **Falta el enlace de Figma.** La referencia es la pestaña ESG de una llamada y el área ESG del panel.
2. **Fuente del "feedback del cliente".** Se asumió que son las transcripciones de llamadas. Confirmar si también deben entrar encuestas de satisfacción o comentarios escritos.
3. **Práctica del agente y voz del cliente.** Confirmar si ambas se muestran en la misma pestaña ESG o si la voz del cliente va en una sección aparte.
4. **Tamaño mínimo de muestra.** Se propuso 30 casos para cruzar con NPS. Confirmar el número.
5. **Catálogo ESG.** Hoy es fijo. Confirmar si cada cliente podrá configurar sus propias prácticas y pesos.
6. **Umbral de 70.** Confirmar si debe tomarse de Configuración en lugar de ser fijo.
7. **Idioma de la pestaña de llamada.** Hoy es solo en inglés. Confirmar si se traduce en esta historia.
8. **Dividir la historia.** Si el equipo prefiere, puede separarse en dos: evaluación ESG por llamada (ya planeada) e informe de salud de marca con NPS.
9. **Lectura del informe.** Confirmar que el informe muestre siempre el aviso de correlación y que el equipo no lo presente como causalidad.
10. **Acceso del Operation Manager al detalle.** Se asumió que no ve transcripciones. Confirmar si debe poder abrir una llamada desde el desglose de campaña.
11. **Umbrales de estado de marca.** Se propone 80 para "en vigilancia" y 70 para "en riesgo". Confirmar los valores.
12. **Supervisor.** Confirmar si el supervisor mantiene el acceso al área ESG o si la vista queda solo para QA Manager y Operation Manager.
13. **Umbral entre cumple y advertencia.** Los datos de ejemplo dan 75 a una práctica "cumple" y 50 a una "advertencia". Confirmar si 75 cuenta como cumple o como advertencia.
14. **Coherencia con Compliance.** Un precio promocional sin precio regular es incumplimiento (40) en Compliance y advertencia (50) en ESG. Confirmar cuál regla aplica.
15. **Solapamiento de consentimiento.** La práctica de consentimiento de datos se solapa con los controles de grabación y protección de datos de Compliance. Confirmar si se mantiene separada o si reutiliza el resultado de Compliance.
16. **Cobertura y aplicabilidad.** Confirmar si todas las llamadas se evalúan en ESG o solo una muestra, y qué tipos de llamada pueden quedar como "No aplica".
17. **Corrección de un resultado ESG.** El agente no ve ESG y la planeación excluyó ESG de las disputas. Confirmar si el QA Manager necesita un camino para corregir un resultado erróneo.
