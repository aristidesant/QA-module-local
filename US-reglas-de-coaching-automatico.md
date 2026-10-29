# US-reglas-de-coaching-automatico: Reglas de coaching automático

**Prioridad:** Imprescindible · **Estimación:** M — intuición inicial, el equipo la refina

## Historia

Como supervisor o QA Manager,
quiero crear reglas que detecten automáticamente cuándo los resultados de calidad de un agente necesitan acción, y que esa acción (material de aprendizaje con fecha límite, una sesión de coaching o un mensaje automático) se prepare sola,
para atender a más agentes sin revisar llamada por llamada y actuar a tiempo cuando el desempeño baja.

## Contexto

Hoy los resultados de evaluación de llamadas quedan en los informes, pero nadie los convierte en acción de coaching sin trabajo manual. Esta historia cubre la pestaña **Reglas** de la sección de Coaching: la pantalla donde se define qué se mide, cuándo cuenta, qué recibe el agente y para quién aplica. Las reglas comparten los mismos indicadores que las alertas de Triggers. La decisión semanal que crea sesiones de coaching para todo el equipo se describe en la historia del lote semanal de coaching. Historias relacionadas: Triggers & Recognition, Lote semanal de coaching y LMS (biblioteca y asignación de material).

## Referencias de diseño

- Figma: Pendiente (referencia: pantalla actual de Coaching → Reglas y el formulario "Nueva regla").
- Componentes clave: tabla de reglas, formulario por secciones, selector de material, fila de condiciones en forma de frase. Todos ya existen en el producto.

## Alcance

**Incluye:**

- Lista de reglas con búsqueda, filtro por aspecto y estado, y un interruptor para activar o pausar cada una.
- Crear, editar, duplicar y eliminar reglas.
- Una regla se define en seis partes: nombre, cuándo se cumple, qué recibe el agente, con qué frecuencia puede repetirse, a quién aplica y cómo se mide si funcionó.
- Dos modos de disparo: en cuanto se cumplen las condiciones, o una revisión semanal de todo el equipo.
- Vista previa en frase, por ejemplo: "Se activa cuando el puntaje de calidad es menor que 80 % en los últimos 14 días".
- Ejecutar una regla ahora para los agentes que ya cumplen la condición.
- Ver el detalle de una regla: cuántas veces se activó, a cuántos agentes afectó y qué porcentaje mejoró.

**No incluye:**

- El cálculo de los resultados de calidad (lo hace el sistema de evaluación).
- La decisión semanal de 1:1 o mensaje automático para cada agente (historia aparte del lote semanal).
- Crear o editar el material de aprendizaje (biblioteca de LMS).
- La medición detallada de impacto por material y por regla (historia aparte).
- Las alertas y reconocimientos de Triggers.

## Estados de UI y casos límite

| Estado                    | Disparador                                                       | Comportamiento de UI                                                                            |
| ------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Sin reglas                | No hay reglas creadas                                            | Mensaje "No hay reglas de coaching todavía", explicación breve y botón "Nueva regla"            |
| Cargando                  | Se abre la pestaña                                               | Indicador de carga en la tabla, sin reglas a medio cargar                                       |
| Lista con reglas          | Hay reglas en el ámbito del usuario                              | Tabla ordenada: activas primero, luego borradores y pausadas, y dentro de cada grupo por nombre |
| Sin resultados            | Los filtros no coinciden con ninguna regla                       | Mensaje "No hay reglas con esos filtros" y botón para limpiar filtros                           |
| Regla activa              | Estado activo                                                    | Interruptor encendido, etiqueta verde "Activa"                                                  |
| Regla pausada             | Estado pausado                                                   | Interruptor apagado, etiqueta gris "Pausada"; no se dispara                                     |
| Borrador                  | Se guardó sin activar                                            | Interruptor deshabilitado, etiqueta amarilla "Borrador"                                         |
| Revisión semanal          | Modo semanal                                                     | Etiqueta azul "Revisión semanal" junto al nombre                                                |
| Nombre vacío              | Se intenta guardar sin nombre                                    | Error bajo el campo de nombre y aviso general "Corrige los campos marcados"                     |
| Sin condición             | Se intenta guardar sin ninguna condición                         | Error bajo las condiciones: "Agrega al menos una condición"                                     |
| Rango inválido            | El valor máximo es menor o igual que el mínimo                   | Error bajo las condiciones y no se guarda                                                       |
| Sin material elegido      | La acción es asignar material y no hay ninguno                   | Error bajo el selector de material                                                              |
| Sin ruta elegida          | La acción es inscribir en una ruta y no hay ninguna              | Error bajo el selector de ruta                                                                  |
| Plazo fuera de rango      | El plazo no está entre 1 y 90 días                               | Error bajo el campo de plazo                                                                    |
| Cambios sin guardar       | Se intenta cerrar el formulario con cambios                      | Pregunta "¿Descartar los cambios?" con confirmación                                             |
| Regla sin agentes         | Ningún agente cumple la condición en este momento                | Mensaje "Ningún agente cumple esta regla ahora" al ejecutar la regla                            |
| Espera entre activaciones | El agente fue afectado hace menos días que la espera configurada | La regla no se vuelve a activar para ese agente hasta cumplir la espera                         |
| Límite alcanzado          | El agente llegó al máximo de activaciones                        | La regla deja de activarse para ese agente                                                      |
| Eliminar regla            | Clic en eliminar                                                 | Confirmación "¿Eliminar la regla?"; las asignaciones ya creadas se conservan                    |

Detalles de interacción:

- Todo el formulario se puede recorrer con teclado, y el mensaje de error se lee junto al campo que lo causa.
- En pantallas pequeñas, las secciones se apilan en una sola columna y los botones de guardar quedan visibles al fondo.
- Los colores (verde, amarillo, gris, azul) deben mantener buen contraste en modo claro y oscuro.

## Notas de datos y lógica

- **Cuándo se cumple una regla.** Puede tener varias condiciones, unidas por "y" o por "o". Cada condición mide un indicador de calidad, cumplimiento, sentimiento o negocio, y se compara con un valor o con un cambio frente al periodo anterior.
- **Periodo de medición.** Cada condición se evalúa en cada llamada, en las últimas N llamadas, o en los últimos 7, 14 o 30 días. Las reglas semanales siempre miran los últimos 7 días.
- **Modo de disparo.** "Cuando se cumplan las condiciones" evalúa a cada agente en cuanto cumple la regla. "Revisión semanal" evalúa a todos los agentes del ámbito cada lunes con los últimos 7 días.
- **Qué recibe el agente.** Material de la biblioteca o una ruta de aprendizaje, con un plazo de 1 a 90 días. Puede ser obligatorio, y el agente puede tener que aceptar el plazo. Si se activa la opción, también se programa una sesión de coaching o un mensaje automático, con su tema y su coach (supervisor o QA Manager).
- **Aviso al supervisor.** Opción para notificar al supervisor cuando la regla se activa.
- **Límites.** Espera entre activaciones en días (0 significa sin espera) y, opcionalmente, un máximo de activaciones por agente.
- **Seguimiento.** Ventana de medición en días, puntos de control, umbral de mejora en puntos y opción de volver a asignar material si el puntaje baja después de completarlo.
- **Ámbito ("Para quién").** Todo el ámbito del usuario, equipos concretos, agentes específicos, campañas, línea de negocio o tipo de campaña.
- **Permisos.** El supervisor solo crea y ve reglas de su propio equipo. El QA Manager ve y gestiona reglas de todos los equipos.
- **Estado de una regla.** Activa, pausada o borrador. Solo las activas se disparan.
- **Estadísticas.** Activaciones en los últimos 30 días, agentes afectados, porcentaje de mejora y fecha de la última activación.
- **Idioma.** Todos los textos de la pantalla deben estar en español e inglés.

## Criterios de aceptación

```gherkin
Escenario: Crear una regla activa
  Dado que soy supervisor y completo nombre, condición, material y plazo
  Cuando pulso "Guardar y activar"
  Entonces la regla aparece en la lista con la etiqueta "Activa"
  Y la vista previa describe la condición en una frase

Escenario: Guardar un borrador
  Dado que completo el formulario sin activarlo
  Cuando pulso "Guardar como borrador"
  Entonces la regla aparece con la etiqueta "Borrador"
  Y no se dispara para ningún agente

Escenario: Falta un dato obligatorio
  Dado que dejo el nombre vacío
  Cuando pulso guardar
  Entonces el campo de nombre muestra el error
  Y la regla no se guarda

Escenario: Pausar una regla
  Dado que una regla está activa
  Cuando apago su interruptor en la lista
  Entonces su etiqueta cambia a "Pausada"
  Y deja de activarse para los agentes

Escenario: Regla semanal
  Dado que elijo "Revisión semanal" como modo de disparo
  Cuando guardo la regla
  Entonces la regla muestra la etiqueta "Revisión semanal"
  Y las condiciones miran los últimos 7 días

Escenario: Ámbito limitado al equipo del supervisor
  Dado que soy supervisor del equipo 1
  Cuando abro la lista de reglas
  Entonces solo veo las reglas de mi equipo

Escenario: Límite de activaciones por agente
  Dado que una regla permite 3 activaciones por agente y el agente ya tiene 3
  Cuando se cumple la condición para ese agente
  Entonces la regla no genera una nueva asignación para él

Escenario: Descartar cambios
  Dado que modifiqué el formulario sin guardar
  Cuando intento cerrarlo
  Entonces aparece la pregunta "¿Descartar los cambios?"
  Y solo se cierra si confirmo

Escenario: Ejecutar ahora
  Dado que hay agentes que cumplen la condición
  Cuando pulso "Ejecutar ahora"
  Entonces se crean las asignaciones para esos agentes
  Y la regla suma las activaciones en sus estadísticas

Escenario: Ejecutar sin agentes que cumplan
  Dado que ningún agente cumple la condición
  Cuando pulso "Ejecutar ahora"
  Entonces veo el aviso "Ningún agente cumple esta regla ahora"
```

Lista de comprobación de elementos fijos:

- [ ] La pestaña muestra el título "Reglas de coaching" y su descripción.
- [ ] La tabla muestra nombre, condición, acción, ámbito, activaciones de 30 días, porcentaje de mejora, estado y fecha de actualización.
- [ ] Los filtros de búsqueda, aspecto y estado funcionan juntos.
- [ ] El botón "Nueva regla" está visible en la cabecera de la sección.
- [ ] El formulario muestra las secciones en este orden: Datos básicos, Quién, Cuándo, Qué recibe, Recurrencia, Seguimiento.
- [ ] La vista previa de la condición se actualiza al cambiar cualquier campo.
- [ ] Los botones de guardar quedan visibles al fondo al desplazarse por el formulario.

## Accesibilidad

- Cada campo tiene una etiqueta visible o accesible, incluidos los interruptores y los selectores de la condición.
- El estado de cada regla se comunica con texto ("Activa", "Pausada", "Borrador"), no solo con color.
- Los errores de validación se leen junto al campo que los causa.
- El interruptor de activar o pausar se puede usar con teclado y anuncia el nuevo estado.
- Las zonas para tocar los iconos de acción tienen al menos 32 píxeles.

## Preguntas abiertas

1. **Falta el enlace de Figma.** La referencia es la pantalla actual de Coaching → Reglas.
2. **Sesiones y mensajes automáticos.** Confirmar si una regla que programa una sesión debe crear una sesión real del supervisor o solo una propuesta que el supervisor confirma.
3. **Revisión semanal.** Confirmar si la hora de ejecución del lunes es fija o configurable.
4. **Reglas duplicadas.** Confirmar si dos reglas que disparan lo mismo para un agente deben combinarse o avisar al usuario.
5. **Medición del impacto.** Confirmar si la ventana de medición y el umbral de mejora deben ser fijos o por cliente.
6. **Elección de agentes en "Ejecutar ahora".** Confirmar si el usuario puede elegir a qué agentes aplicar la regla, o solo todos los que cumplen.
