# US-analisis-de-sentimiento-y-causa-raiz: Análisis de sentimiento y causa raíz

**Prioridad:** Debería · **Estimación:** M — intuición inicial, el equipo la refina

## Historia

Como supervisor o QA Manager,
quiero ver por qué cayó el sentimiento del cliente en una llamada, con la evidencia del minuto exacto, y poder confirmar o corregir esa causa,
para dar coaching sobre el problema real y no solo sobre el síntoma.

Como Operation Manager,
quiero ver qué causas provocan más caídas de sentimiento en la operación, cómo cambian en el tiempo y si vienen del negocio o del agente,
para decidir dónde actuar: procesos, precios, esperas o capacitación.

## Contexto

El sistema ya muestra los cambios de sentimiento del cliente y del agente en el detalle de la llamada y en el análisis de equipo, pero no explica el motivo. Esta historia agrega la causa raíz de cada caída y su resumen por periodo. Historias relacionadas: Evaluación de una llamada (pestaña Sentimiento y emoción) y Análisis de equipo (área Sentimiento).

## Referencias de diseño

- Figma: Pendiente.
- Componentes clave: tarjeta de sección, cita con minuto y botón de reproducir, etiquetas de estado, menú agrupado, tabla de ranking, barra de proporción y gráfica de tendencia. Todos existen en el producto; no hay componentes nuevos.

## Alcance

**Incluye:**

- Tarjeta "Causa raíz de la caída de sentimiento" en la pestaña Sentimiento y emoción del detalle de la llamada.
- Catálogo fijo de nueve causas en dos familias. Negocio: tiempo de espera, precio y facturación, falla técnica, proceso y políticas, promesa incumplida. Agente: tono del agente, falta de empatía, interrupciones, información incorrecta.
- Una causa principal con evidencia (minuto y cita del cliente) y de 0 a 2 causas secundarias.
- Revisión de la causa principal: confirmar, cambiar por otra del catálogo o deshacer.
- Sección de causas en el área Sentimiento del análisis de equipo: ranking con comparación contra el periodo anterior, proporción negocio frente a agente y tendencia de las cuatro causas principales.
- Causa como nueva opción de agrupación, nuevo filtro y dos métricas: tasa y número de llamadas con caída.
- Catálogo de causas en Configuración global, pestaña Sentimiento (solo super admin): agregar causas propias a una familia y escribir para cada causa, original o propia, una descripción de lo que la IA debe buscar en la llamada. Las nueve originales traen una por defecto y las propias la exigen. Al guardar se crea una nueva versión junto con los prompts y las emociones.
- Preferencias de la operación en Settings, pestaña Sentimiento (QA Manager): apagar las causas que no se usen, renombrarlas y definir desde cuántos puntos una caída se considera fuerte.
- Las causas agregadas solo se ofrecen al corregir una llamada, no se pueden eliminar (solo apagar) y no aparecen en los datos de análisis de equipo hasta que exista una detección real.
- Textos en español e inglés.

**No incluye:**

- Perfiles de agente y de cliente.
- Vista del agente: nunca ve la causa raíz.
- Eliminar causas o cambiar la familia de una causa ya creada.
- Lista de llamadas al pulsar una causa en el ranking.
- Guardar las revisiones: en esta versión no persisten.
- Causa raíz de chats o correos.

## Estados de UI y casos límite

| Estado                 | Disparador                               | Comportamiento de UI                                                                         |
| ---------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| Pendiente de revisión  | La llamada tiene causa y nadie la revisó | Etiqueta gris con borde "Pendiente de revisión"; botones "Confirmar causa" y "Cambiar causa" |
| Confirmada             | El revisor confirma                      | Etiqueta "Confirmada"; botones "Cambiar causa" y "Deshacer revisión"                         |
| Corregida              | El revisor elige otra causa              | Se muestra la causa elegida, con la línea "La IA la leyó como X" y la etiqueta "Corregida"   |
| Sin caída              | La llamada no tuvo caída de sentimiento  | Tarjeta con el texto "No se detectó una caída de sentimiento en esta llamada."               |
| Caída fuerte           | La caída es de 1.0 punto o más           | La etiqueta de caída se muestra en rojo; si es menor, en gris                                |
| Sin evidencia          | La causa no trae cita ni minuto          | Se oculta el bloque de evidencia                                                             |
| Sin causas secundarias | La llamada tiene 0 secundarias           | Se oculta el bloque de causas secundarias                                                    |
| Análisis sin datos     | Los filtros no dejan llamadas con caída  | Las tarjetas de ranking, proporción y tendencia muestran estado vacío                        |
| Sin periodo anterior   | La comparación está apagada              | Se ocultan las columnas "Anterior" y "Variación"                                             |
| Rol agente             | Vista previa o sesión de agente          | La tarjeta no se muestra                                                                     |

- Al pulsar la cita o el botón de reproducir, el reproductor salta al minuto y se resalta el turno en la transcripción.
- En el ranking, una causa que sube su proporción se marca en rojo; las demás van en gris.
- La tendencia dibuja como máximo cuatro líneas.

## Notas de datos y lógica

- Se detecta una caída cuando el sentimiento del cliente queda bajo el umbral de incidente, cuando la emoción predominante es negativa o cuando hubo una caída que luego se recuperó.
- Cada llamada con caída guarda: causa principal, causas secundarias (sin repetir la principal), puntos perdidos desde el inicio de la llamada, y evidencia con minuto, quien habla y cita.
- Los agregados cuentan solo la causa principal.
- El ranking muestra por causa: llamadas, proporción sobre las llamadas con caída, caída promedio y, con comparación activa, llamadas anteriores y variación en puntos porcentuales.
- Las llamadas sin caída entran al filtro y a la agrupación como "Sin caída de sentimiento".
- Permisos: supervisor, QA Manager y Operation Manager ven la causa; solo supervisor y QA Manager la revisan. El catálogo y las descripciones solo los edita el super admin; el umbral, apagar y renombrar los edita el QA Manager.
- La API debe exponer la revisión (estado, causa corregida, fecha) por llamada.

## Criterios de aceptación

```gherkin
Escenario: Ver la causa de una caída
  Dado que soy supervisor y abro una llamada con caída de sentimiento
  Cuando entro a la pestaña Sentimiento y emoción
  Entonces veo la causa principal con su familia, la caída en puntos y la cita del cliente con su minuto

Escenario: Saltar a la evidencia
  Dado que la tarjeta muestra una cita con minuto
  Cuando pulso el botón de reproducir
  Entonces el reproductor salta a ese minuto y se resalta el turno en la transcripción

Escenario: Confirmar la causa
  Dado que la revisión está pendiente
  Cuando pulso "Confirmar causa"
  Entonces la etiqueta cambia a "Confirmada" y aparece "Deshacer revisión"

Escenario: Corregir la causa
  Dado que veo el menú "Cambiar causa" agrupado por familia, sin la causa actual
  Cuando elijo "Tiempo de espera"
  Entonces la causa principal pasa a "Tiempo de espera", aparece "La IA la leyó como Precio y facturación" y la etiqueta dice "Corregida"

Escenario: Deshacer la revisión
  Dado que la causa está confirmada o corregida
  Cuando pulso "Deshacer revisión"
  Entonces vuelve a "Pendiente de revisión" con la causa original de la IA

Escenario: El agente no ve la causa
  Dado que entro como agente
  Cuando abro cualquier llamada
  Entonces no aparece la tarjeta de causa raíz
```

- [ ] El área Sentimiento del análisis de equipo muestra el ranking de causas, la barra negocio frente a agente y la tendencia de las cuatro causas principales.
- [ ] Con comparación activa, el ranking suma las columnas "Anterior" y "Variación".
- [ ] "Causa de la caída de sentimiento" aparece como opción de agrupación y "Causas de caída de sentimiento" como filtro.
- [ ] La tasa de caídas aparece como una de las tarjetas de métrica del área.
- [ ] Todos los textos existen en español e inglés.
- [ ] La tarjeta y las secciones mantienen contraste correcto en modo claro y oscuro.

## Accesibilidad

- El estado de revisión se comunica con texto, no solo con color.
- Los botones de revisión y el menú se operan con teclado; al elegir una causa, el foco vuelve al botón "Cambiar causa".
- Los cambios de estado de la revisión se anuncian al lector de pantalla.
- El botón de reproducir tiene una etiqueta que incluye el minuto.

## Preguntas abiertas

- ¿La corrección del revisor debe reflejarse en los agregados del análisis de equipo? En esta versión no se aplica y la revisión no persiste.
- ¿Se valida el catálogo de nueve causas con QA Managers y operación antes de construir?
- ¿El umbral de 1.0 punto para marcar una caída fuerte es el correcto?
