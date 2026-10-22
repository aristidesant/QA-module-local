# Riesgo de burnout: detección por análisis de voz de las llamadas

## Contexto

Hoy el riesgo de burnout de un agente sale de reglas de Triggers sobre sentimiento, emoción y QA. Eso no alcanza: el burnout se manifiesta antes en la voz y en el habla (energía, ritmo, apatía, niebla mental) que en el score de la llamada. Este plan define qué determina el burnout, qué señales se pueden extraer solo del audio de las llamadas, cómo convertirlas en un riesgo por agente explicable y configurable, y cómo mostrarlo en la plataforma. La implementación es un mockup (sin backend real), pero el modelo debe ser el que un equipo de datos podría construir después.

Decisiones tomadas: análisis + diseño del producto; riesgo por desviación del propio agente más umbrales; configuración propia de Burnout en Settings con reglas de Triggers solo para avisar; las cuatro familias de señales (acústicas, tempo, léxicas, cognitivas) entran en la primera versión.

---

## Parte 1 · Qué determina el burnout

El burnout es un **patrón sostenido**, no el estado de una llamada. El marco más usado (Maslach) lo describe en tres dimensiones, y cada una deja huella distinta en la voz:

| Dimensión                        | Qué es                               | Cómo suena en una llamada                                                                               |
| -------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Agotamiento emocional**        | Falta de energía, fatiga crónica     | Voz plana y apagada, menos variación de tono, habla más lenta, pausas largas, suspiros                  |
| **Despersonalización / cinismo** | Desapego del cliente, trato mecánico | Respuestas cortas o de guion, sin frases de empatía, lenguaje negativo o de desgano, interrupciones     |
| **Baja realización / eficacia**  | Sensación de no rendir, errores      | Pedir que repitan, perder el hilo, autocorrecciones, muletillas, errores de datos, más tiempo en espera |

Tres reglas que gobiernan todo lo demás:

1. **Lo que importa es el cambio.** Un agente que siempre habla despacio no está quemado; uno que hablaba rápido y ahora habla despacio, quizá sí. Cada señal se mide contra la línea base del propio agente, y además contra un umbral absoluto para los casos extremos.
2. **Una llamada no es un patrón.** El riesgo solo sube cuando varias señales empeoran de forma sostenida (varios días, mínimo de llamadas).
3. **La plataforma detecta señales, no diagnostica.** No conoce la causa (carga, vida personal, salud). Cada resultado tiene que ser explicable y lo confirma o descarta un supervisor.

### Lo que no se puede saber solo con voz

Causas, estado de salud, lo que pasa fuera de las llamadas. Tampoco hay señal única fiable: la detección se apoya en la **convergencia** de varias señales y en su **persistencia**.

---

## Parte 2 · Señales detectables solo con el audio de las llamadas

Cada señal se extrae por llamada (del audio o de su transcripción) y se agrega por agente. Confianza = cuánta evidencia hay de que la señal refleja fatiga, apatía o niebla mental, no cuánto cuesta medirla.

### A. Acústicas (del audio)

| Señal                             | Qué mide                                                    | Dimensión   | Confianza | Peor cuando |
| --------------------------------- | ----------------------------------------------------------- | ----------- | --------- | ----------- |
| Variabilidad de tono              | Desviación del tono (F0) del agente; baja = voz monótona    | Agotamiento | Alta      | Baja        |
| Energía vocal                     | Intensidad media del agente y su caída dentro de la llamada | Agotamiento | Alta      | Baja o cae  |
| Voz apagada                       | Proporción de voz aspirada o sin brillo                     | Agotamiento | Media     | Alta        |
| Suspiros y respiraciones audibles | Conteo por minuto                                           | Agotamiento | Media     | Alta        |

### B. Tempo (del audio y la transcripción)

| Señal                 | Qué mide                                                   | Dimensión              | Confianza | Peor cuando            |
| --------------------- | ---------------------------------------------------------- | ---------------------- | --------- | ---------------------- |
| Ritmo de habla        | Palabras por minuto del agente                             | Agotamiento            | Alta      | Cae respecto a la base |
| Pausas largas         | Silencios del agente de más de N segundos por llamada      | Agotamiento / Eficacia | Alta      | Sube                   |
| Latencia de respuesta | Segundos entre que el cliente termina y el agente responde | Eficacia               | Alta      | Sube                   |
| Muletillas            | "eh", "mmm", "o sea" por minuto                            | Eficacia               | Media     | Sube                   |

### C. Léxicas (de la transcripción)

| Señal                        | Qué mide                                                                | Dimensión | Confianza | Peor cuando              |
| ---------------------------- | ----------------------------------------------------------------------- | --------- | --------- | ------------------------ |
| Lenguaje negativo            | Palabras y expresiones negativas del agente por cada 100 palabras       | Cinismo   | Media     | Sube                     |
| Frases de apatía             | "da igual", "no puedo hacer nada", "lo que usted diga", "es lo que hay" | Cinismo   | Media     | Sube                     |
| Respuestas cortas o de guion | Longitud media de turno del agente y proporción de turnos de guion      | Cinismo   | Media     | Cae longitud, sube guion |
| Ausencia de empatía          | Frases de empatía por llamada (ya se detectan hoy)                      | Cinismo   | Media     | Cae                      |

### D. Cognitivas (de la transcripción y el audio)

| Señal                       | Qué mide                                              | Dimensión | Confianza | Peor cuando |
| --------------------------- | ----------------------------------------------------- | --------- | --------- | ----------- |
| Pedir que repitan           | "¿me lo repite?", "perdón, ¿cómo dijo?" por llamada   | Eficacia  | Alta      | Sube        |
| Autocorrecciones            | Reformulaciones y rectificaciones del agente          | Eficacia  | Media     | Sube        |
| Perder el hilo              | Volver a preguntar algo que el cliente ya dijo        | Eficacia  | Alta      | Sube        |
| Errores de datos            | Ítems de QA de exactitud fallados (ya existen)        | Eficacia  | Alta      | Sube        |
| Tiempo en espera o silencio | Hold y mute por llamada (ya existe `holdTimeSeconds`) | Eficacia  | Media     | Sube        |

### E. Contexto que ya existe y sigue contando

Sentimiento y emoción del agente, interrupciones, recuperación del sentimiento, AHT, llamadas fuera de horario, días consecutivos. No son señales de voz nuevas, pero entran en el score como familia "Contexto" con peso bajo.

---

## Parte 3 · De la llamada al agente: el modelo de cálculo

```
Llamada ──▶ señales por llamada (valor + unidad)
          ──▶ agregado por agente y ventana (7 / 14 / 30 días)
          ──▶ desviación vs línea base del agente  +  umbral absoluto
          ──▶ señal ACTIVA / CERCA / OK
          ──▶ score 0-100 (pesos por señal × persistencia)
          ──▶ nivel Bajo / Medio / Alto (bandas)
          ──▶ reglas de Triggers: cuándo y a quién avisar
```

1. **Señales por llamada.** Cada llamada guarda sus señales con valor y unidad (`CallVoiceSignals`). Son lo que se muestra en la tarjeta de burnout del detalle de la llamada.
2. **Línea base del agente.** Mediana de cada señal en sus primeras 4 semanas con al menos 40 llamadas; si no las hay, mediana móvil de 90 días excluyendo las últimas 2 semanas. Se recalcula cada mes. Un supervisor puede "reiniciar la base" tras un cambio de campaña.
3. **Agregado y desviación.** Por señal y ventana: mediana del agente en la ventana, porcentaje de cambio frente a su base y comparación con el umbral absoluto. Mínimo de llamadas en la ventana para contar (por defecto 15).
4. **Estado de cada señal.** ACTIVA si supera el umbral absoluto o la desviación configurada; CERCA si llega a la mitad de la desviación; OK en otro caso.
5. **Score 0-100.** Suma de los pesos de las señales activas (más la mitad del peso de las cercanas), normalizada al total de pesos habilitados, multiplicada por un factor de persistencia (días consecutivos con señales activas, hasta 1.5×). Un bonus por **convergencia**: si hay señales activas en 3 familias distintas, +10.
6. **Nivel.** Bandas configurables: Alto ≥ 70, Medio ≥ 40, Bajo el resto. Se exige además un mínimo de 2 señales activas para salir de Bajo.
7. **Avisos.** Las reglas de Triggers de tipo Burnout pasan a tener condiciones sobre el score, el nivel, el cambio del score o una señal concreta. La configuración de Burnout decide _qué es riesgo_; las reglas deciden _cuándo avisar, a quién y cada cuánto_.
8. **Cierre del ciclo.** El supervisor confirma o descarta el riesgo desde el perfil. Un descarte silencia al agente N días y queda en el historial; se usa después para ajustar pesos.

Principios de producto: todo resultado muestra las señales que lo explican, con su valor, su base y la desviación. Solo se guardan agregados, nunca fragmentos de audio etiquetados como "burnout". El agente no ve su propio score en esta versión.

---

## Parte 4 · Diseño en la plataforma (mockups)

### A. Settings → nueva pestaña "Burnout" (QA Manager)

Archivos: `src/modules/qa/settings/SettingsPage/tabs/BurnoutTab.tsx` (nuevo), `types.ts` (`SettingsAspect` + `BurnoutSettings`), `constants.ts` (defaults), `stores/qa/settingsStore.ts` (ya guarda por aspecto). Reutilizar `ScoreBandsEditor`, `MetricOverridesTable` como patrón de tabla y `SettingsActions`.

Secciones, de arriba abajo:

1. **Señales**, una tabla por familia (Acústicas, Tempo, Léxicas, Cognitivas, Contexto). Columnas: señal (con descripción corta), habilitada (switch), peso (1-5), umbral absoluto (con unidad), desviación de la base (%), ventana (7 / 14 / 30 d). Una fila de resumen por familia con el peso total.
2. **Línea base**: método (primeras 4 semanas / móvil 90 días), mínimo de llamadas, recalculo mensual. Texto que explica por qué importa.
3. **Score y niveles**: bandas Medio y Alto (`ScoreBandsEditor`), mínimo de señales activas, días de persistencia para el factor máximo, bonus por convergencia.
4. **Vista previa**: con la configuración actual, cuántos agentes quedarían en cada nivel y los 5 primeros, para calibrar antes de guardar (mismo patrón que la vista previa de reglas).
5. **Footer** con guardar / descartar / restablecer, como las otras pestañas.

### B. Triggers → reglas de Burnout

- Ampliar `TRIGGER_METRIC_CATALOG` (`src/modules/qa/triggers/constants.ts`) con `BURNOUT_SCORE`, `BURNOUT_LEVEL` y una métrica por señal (`VOICE_PITCH_VARIABILITY`, `VOICE_ENERGY`, `SPEECH_RATE`, `LONG_PAUSE_COUNT`, `RESPONSE_LATENCY`, `FILLER_RATE`, `NEGATIVE_LANGUAGE_RATE`, `APATHY_PHRASE_RATE`, `EMPATHY_PHRASE_RATE`, `REPEAT_REQUEST_RATE`, `SELF_CORRECTION_RATE`, `LOST_THREAD_COUNT`), área nueva `WELLBEING`.
- Nuevo modo de condición `BASELINE_DEVIATION` ("se desvía más de X% de su base") junto a umbral, rango, cambio y consecutivas (`RuleCondition.mode` en `src/models/qa/triggerRules.ts`, `ConditionRow`, `describeCondition`).
- Las dos reglas por defecto pasan a: Alto = score ≥ 70 durante 5 días; Medio = score ≥ 40 durante 7 días o 2 señales acústicas activas.
- `assessBurnout` (`src/modules/qa/analytics/helpers.ts`) deja de decidir el nivel: lo lee del score de la configuración y solo evalúa las reglas para avisar.

### C. Detalle de la llamada → tarjeta "Agent burnout risk"

Vuelve a listar señales, pero ahora cada fila es: señal · valor en esta llamada · base del agente · desviación (↑ 35%) · estado. Arriba, el nivel y score actuales del agente (ya está) y una frase: "3 señales de esta llamada se desvían de su base". Las señales con evidencia en la transcripción (pedir repetir, apatía) enlazan al momento, reutilizando los moments del plan anterior.

### D. Perfil del agente → pestaña Burnout

- Cabecera: score, nivel, tendencia del score (30 d) y días en el nivel.
- **Qué lo explica**: una tarjeta por familia con sus señales: valor actual, base, desviación, sparkline de 30 días y estado. Reemplaza al listado por regla actual (`BurnoutDrivers`), que pasa a una sección "Avisos" con las reglas de Triggers que se cumplen.
- Se mantienen carga de trabajo, llamadas de evidencia (ahora con la señal que las marcó) e historial de acciones.
- Botones Confirmar riesgo / Descartar (motivo, silenciar N días).

### E. Dashboard del supervisor → tarjeta Burnout

Igual que hoy, más la **señal principal** de cada agente ("Energía vocal ↓ 28%") y el número de días en el nivel.

### F. Analytics → pestaña Burnout

Distribución del score, señales más frecuentes en el equipo, evolución por semana. Fuera del alcance del primer mockup; dejar nota.

### G. Datos mock

- `CallVoiceSignals` en `TeamCallMetric` (`src/modules/qa/analytics/types.ts`) generado en `analytics/mockData.ts` con una base por agente y un patrón de deterioro en 2 o 3 agentes (uno acústico, uno cognitivo, uno mixto) para que la demo tenga casos claros.
- `computeBurnoutScore(agentId, settings)` en `analytics/helpers.ts` con baseline, desviación, score y explicación.
- `BurnoutSettings` por defecto en `settings/constants.ts`.

---

## Parte 5 · Orden de implementación (mockup)

1. Tipos y datos: `CallVoiceSignals`, `BurnoutSettings`, generación de mock con patrones.
2. Cálculo: `computeBurnoutScore` + baseline; `assessBurnout` lee el score.
3. Settings → pestaña Burnout.
4. Perfil del agente → pestaña Burnout rediseñada; dashboard con señal principal.
5. Detalle de la llamada → señales con base y desviación.
6. Triggers → catálogo ampliado y modo "desviación de la base".
7. Textos en inglés y español; typecheck.

Cada paso deja la app compilando. Sin dev server ni commits salvo que se pidan.

## Verificación

- `npm run typecheck` tras cada paso.
- Con los datos mock, los 2 o 3 agentes con patrón deben quedar en Medio o Alto y el resto en Bajo; cambiar un peso o un umbral en Settings debe mover la vista previa.
- Cada nivel mostrado en perfil, dashboard y llamada debe explicarse con señales visibles.

## Preguntas abiertas

- ¿El agente debería ver sus propias señales (sin score) como autoconocimiento, o nada?
- ¿Quién puede editar la configuración de Burnout: solo QA Manager, o también supervisor para su equipo?
- ¿Guardamos el descarte del supervisor como señal para ajustar pesos, o solo como historial?
- Las frases de apatía y de repetición dependen del idioma: ¿diccionario por idioma configurable en Settings?
