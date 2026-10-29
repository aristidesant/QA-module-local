# US-puntos-de-anclaje-de-cumplimiento: Puntos de anclaje en la evaluación de cumplimiento

**Prioridad:** Debería · **Estimación:** M — intuición inicial, el equipo la refina

## Historia

Como QA Manager o supervisor,
quiero que los momentos raros de una llamada que no encajan en las reglas normales de cumplimiento queden capturados como puntos de anclaje, claramente marcados y listos para revisión humana,
para no perder situaciones de riesgo que ningún control estándar detecta y poder decidir sobre ellas con la frase exacta y el punto de la grabación a mano.

## Contexto

Hoy la pestaña Compliance solo muestra los controles fijos (Security, Regulatory, Legal). Si pasa algo inusual que no corresponde a ninguno, no queda ningún rastro en esa pestaña. Un punto de anclaje es un momento concreto de la llamada, ligado a un turno de la transcripción y a un segundo de la grabación, que espera una decisión humana. Funciona igual que los momentos que ya se marcan en la pestaña QA: se marca, queda pendiente y una persona lo confirma o lo descarta. Complementa la historia de evaluación de cumplimiento de llamada.

## Referencias de diseño

- Figma: Pendiente.
- Se reutiliza el aspecto de los momentos de la pestaña QA y de las marcas de cumplimiento ya existentes. No hay elementos visuales nuevos.

## Alcance

**Incluye:**

- Sección "Anchor points" dentro de la pestaña Compliance, separada de las tres áreas, con el número de puntos y cuántos están pendientes.
- Cada punto muestra quién habló, el minuto, la frase, la nota y un estado: Pending, Confirmed o Dismissed.
- Marca visible en la transcripción y en la línea de tiempo del reproductor, y botón para reproducir desde ese punto.
- Marcar manualmente un turno como punto de anclaje, con una nota obligatoria.
- Confirmar un punto, o descartarlo indicando el motivo.
- Los datos sensibles siguen ocultos en la frase y en la nota.

**No incluye:**

- Cambiar la puntuación de cumplimiento al confirmar un punto.
- Detección automática de nuevos tipos de puntos (en esta historia solo se marcan manualmente).
- Avisos o alertas por punto confirmado.
- Que el agente marque, confirme o descarte puntos.

## Estados de UI y casos límite

| Estado                  | Disparador                                       | Comportamiento de UI                                                                                                   |
| ----------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Sin puntos              | La llamada no tiene puntos de anclaje            | La sección muestra un mensaje breve y, para quien puede revisar, la opción de marcar uno                               |
| Pendiente               | Se marca un punto nuevo                          | Etiqueta "Pending" con borde gris, visible en la sección, la transcripción y el reproductor                            |
| Confirmado              | El revisor pulsa "Confirm"                       | Etiqueta "Confirmed" en rojo, porque es lo que requiere atención                                                       |
| Descartado              | El revisor pulsa "Dismiss" y escribe un motivo   | Etiqueta "Dismissed" en gris y el motivo visible bajo la frase; el motivo debe tener al menos 5 caracteres             |
| Deshacer decisión       | Se pulsa "Undo" en un punto ya decidido          | El punto vuelve a "Pending"                                                                                            |
| Marcar un punto         | El revisor pulsa el ícono de bandera en un turno | Se abre un panel con el turno ya elegido y una nota obligatoria de al menos 10 caracteres; al guardar aparece el punto |
| Quitar un punto marcado | El revisor pulsa "Undo" en un punto que él marcó | El punto desaparece de la llamada                                                                                      |
| Rol agente              | Un agente abre su llamada                        | Ve los puntos, sus estados y puede reproducirlos; no ve botones de marcar, confirmar ni descartar                      |
| Datos sensibles         | La frase o la nota contienen datos sensibles     | Se muestran ocultos igual que en el resto de la pantalla, hasta que un QA Manager los revele                           |

Interacción: pulsar un punto, su etiqueta en el turno o su marca en el reproductor lleva la grabación a ese segundo. En modo claro y oscuro el rojo solo se usa para puntos confirmados.

## Notas de datos y lógica

- Cada punto guarda: llamada, turno, minuto, quién habló, frase, nota, estado, quién lo creó (persona o sistema) y, si se descarta, el motivo.
- Solo QA Manager y supervisor pueden marcar, confirmar, descartar y deshacer; el agente solo consulta.
- Un punto de anclaje no pertenece a ninguno de los controles de cumplimiento ni modifica sus puntuaciones.
- Los puntos de la pestaña QA y los de Compliance deben distinguirse: cada uno se muestra solo en su pestaña.
- Los textos deben existir en español e inglés.

## Criterios de aceptación

```gherkin
Escenario: Marcar un momento raro
  Dado que soy supervisor y estoy en la pestaña "Compliance"
  Cuando pulso la bandera de un turno y escribo una nota de al menos 10 caracteres
  Entonces aparece un punto "Pending" en la sección "Anchor points"
  Y el turno muestra su etiqueta y el reproductor su marca

Escenario: Confirmar un punto
  Dado que hay un punto "Pending"
  Cuando pulso "Confirm"
  Entonces su etiqueta pasa a "Confirmed" en rojo

Escenario: Descartar un punto
  Dado que hay un punto "Pending"
  Cuando pulso "Dismiss" y escribo un motivo de al menos 5 caracteres
  Entonces su etiqueta pasa a "Dismissed" en gris y se muestra el motivo

Escenario: Reproducir desde un punto
  Dado que hay un punto en el minuto 1:15
  Cuando pulso su botón de reproducir
  Entonces el reproductor se posiciona en 1:15 y el turno queda resaltado

Escenario: Agente sin permisos de revisión
  Dado que soy agente
  Cuando abro la pestaña "Compliance" de mi llamada
  Entonces veo los puntos y sus estados
  Y no aparecen botones para marcar, confirmar ni descartar
```

- [ ] La sección muestra el total de puntos y cuántos están pendientes.
- [ ] Un punto confirmado es el único elemento rojo de la sección.
- [ ] Marcar un punto no cambia ninguna puntuación de cumplimiento.
- [ ] Todo se ve con buen contraste en modo claro y oscuro.

## Accesibilidad

- El estado de cada punto se lee como texto, no solo por color.
- Marcar, confirmar, descartar y deshacer se pueden hacer con teclado; el panel de marcado devuelve el foco al botón que lo abrió al cerrarse.
- Los errores de nota o de motivo se anuncian junto a su campo.

## Preguntas abiertas

1. **Interpretación del ticket.** Se asumió que "momentos raros que no encajan en las reglas" son momentos marcados por una persona. Confirmar si además deben generarse automáticamente por el sistema.
2. **Efecto en la puntuación.** Se asumió que confirmar un punto no cambia la puntuación. Confirmar con producto.
3. **Quién puede marcar.** Se asumió QA Manager y supervisor. Confirmar si el agente también puede sugerir un punto.
4. **Separación de la pestaña QA.** Hoy los momentos marcados viven en la pestaña QA. Confirmar si los de Compliance son una lista aparte o la misma.
5. **Falta el enlace de Figma.**
