# US-notas-de-la-llamada: Notas compartidas en la evaluación de una llamada

**Prioridad:** Debería · **Estimación:** M — intuición inicial, el equipo la refina

## Historia

Como supervisor o QA Manager,
quiero dejar notas en una llamada y leer las que dejaron otras personas del equipo de revisión,
para colaborar sobre la misma llamada, compartir observaciones y no repetir un análisis que otra persona ya hizo.

## Contexto

La pantalla de evaluación de una llamada permite saltar a momentos clave y revisar la grabación y la transcripción, pero no tiene un lugar donde varias personas escriban sobre la llamada. Hoy solo existen notas sueltas dentro de otros flujos, como el motivo al descartar un momento o los comentarios de una disputa. Esta historia añade una sección de notas propia de la llamada, visible desde cualquiera de sus pestañas. Complementa la historia de evaluación de llamada.

## Referencias de diseño

- Figma: Pendiente.
- Se reutilizan la tarjeta de sección, los campos de texto, las etiquetas y los menús ya existentes. No hay elementos visuales nuevos.

## Alcance

**Incluye:**

- Sección "Notes" en la pantalla de la llamada, con el número de notas.
- Escribir una nota nueva, con la opción de ligarla al minuto actual de la grabación.
- Lista de notas con autor, rol, fecha y hora, ordenada de la más reciente a la más antigua.
- Pulsar el minuto de una nota lleva la grabación a ese punto.
- Editar y borrar las propias notas; el QA Manager puede borrar cualquiera.
- Los datos sensibles se ocultan también dentro de las notas.

**No incluye:**

- Que el agente vea o escriba notas.
- Responder a una nota, menciones a otras personas o avisos por nota nueva.
- Adjuntar archivos o imágenes.
- Actualización en vivo: las notas nuevas de otras personas aparecen al recargar la pantalla.
- Notas fuera de la pantalla de la llamada.

## Estados de UI y casos límite

| Estado                  | Disparador                                   | Comportamiento de UI                                                                                                 |
| ----------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Sin notas               | La llamada no tiene notas                    | Mensaje breve que invita a dejar la primera nota y el campo para escribirla                                          |
| Con notas               | Existen una o más notas                      | Campo para escribir arriba y la lista debajo, de más reciente a más antigua                                          |
| Cargando                | Se piden las notas                           | Placeholders de carga en la lista; el campo para escribir ya se puede usar                                           |
| Error al cargar         | Falla la obtención                           | Mensaje de error con la acción "Reintentar"                                                                          |
| Nota vacía              | El campo está vacío o con solo espacios      | El botón "Add note" queda deshabilitado                                                                              |
| Nota muy larga          | El texto supera el máximo permitido          | Contador de caracteres y mensaje de error; no se guarda                                                              |
| Guardando               | Se pulsa "Add note"                          | El botón muestra carga; al terminar la nota aparece arriba de la lista y el campo se vacía                           |
| Error al guardar        | Falla el guardado                            | Mensaje de error, el texto escrito se conserva y se puede reintentar                                                 |
| Nota ligada a un minuto | Se marca la opción de ligar al minuto actual | La nota muestra el minuto como enlace; al pulsarlo la grabación salta ahí y el turno correspondiente queda resaltado |
| Nota propia             | La escribió la persona que la ve             | Muestra las acciones "Edit" y "Delete"                                                                               |
| Nota editada            | Se guarda un cambio                          | La nota indica "Edited" con la hora del cambio                                                                       |
| Nota de otra persona    | La escribió alguien más                      | Solo lectura; el QA Manager además ve "Delete"                                                                       |
| Confirmar borrado       | Se pulsa "Delete"                            | Confirmación breve antes de borrar; al borrar desaparece de la lista                                                 |
| Rol agente              | Un agente abre su llamada                    | La sección no aparece y ninguna nota se envía a su pantalla                                                          |
| Datos sensibles         | La nota contiene datos sensibles             | Se muestran ocultos como en el resto de la pantalla, hasta que un QA Manager los revele                              |
| Muchas notas            | Más de 10 notas                              | Se muestran las 10 más recientes y un botón "Show more" para el resto                                                |

Interacción: se puede enviar con el teclado y todo debe verse bien en modo claro y oscuro. En pantallas estrechas la sección se coloca debajo del contenido principal.

## Notas de datos y lógica

- Cada nota guarda: llamada, texto, autor, rol del autor, fecha de creación, fecha de edición si la hubo y, opcionalmente, el minuto de la grabación al que está ligada.
- Todas las personas supervisoras y QA Managers con acceso a la llamada ven todas sus notas, de cualquier autor.
- El texto tiene un máximo de 1000 caracteres (por confirmar).
- Borrar una nota la elimina definitivamente y no se puede deshacer.
- Las notas siguen la misma regla de ocultamiento de datos sensibles que la transcripción, y el sistema no debe enviarlas a una persona sin permiso de verlas.
- Los textos deben existir en español e inglés.

## Criterios de aceptación

```gherkin
Escenario: Dejar una nota
  Dado que soy supervisor y estoy en la pantalla de una llamada
  Cuando escribo una nota y pulso "Add note"
  Entonces la nota aparece primera en la lista con mi nombre, mi rol y la hora
  Y el campo queda vacío

Escenario: Ligar una nota a un minuto
  Dado que la grabación está en el minuto 1:15
  Cuando escribo una nota y marco "Link to current time"
  Entonces la nota muestra "1:15" como enlace
  Y al pulsarlo la grabación salta a 1:15

Escenario: Leer notas de otras personas
  Dado que un QA Manager dejó una nota en la llamada
  Cuando un supervisor abre la misma llamada
  Entonces ve esa nota con el nombre y el rol del QA Manager
  Y no puede editarla ni borrarla

Escenario: Editar mi nota
  Dado que escribí una nota
  Cuando la edito y guardo
  Entonces la nota muestra el nuevo texto y la marca "Edited"

Escenario: Borrar la nota de otra persona
  Dado que soy QA Manager
  Cuando borro una nota escrita por un supervisor y confirmo
  Entonces la nota desaparece de la lista

Escenario: Agente sin acceso
  Dado que soy agente
  Cuando abro mi llamada
  Entonces no veo la sección de notas

Escenario: Nota con datos sensibles
  Dado que una nota incluye un número de tarjeta
  Cuando la veo sin haber revelado los datos
  Entonces el número aparece oculto como "Card •••• 1234"
```

- [ ] La sección muestra el número de notas junto al título.
- [ ] Cada nota muestra autor, rol, fecha y hora.
- [ ] El botón "Add note" está deshabilitado con el campo vacío.
- [ ] La sección se ve con buen contraste en modo claro y oscuro.

## Accesibilidad

- El campo de nota tiene etiqueta clara y los errores se leen junto al campo.
- Las acciones "Edit" y "Delete" se pueden usar con teclado y tienen nombre accesible.
- Al guardar, editar o borrar, el resultado se anuncia al lector de pantalla.
- El enlace del minuto indica a qué momento lleva, por ejemplo "Ir al minuto 1:15".
- Las zonas táctiles de las acciones miden al menos 32 píxeles.

## Preguntas abiertas

1. **Agente.** Se asumió que no ve las notas. Confirmar si debe poder verlas, o solo las que se le dirijan.
2. **Dónde se ubica la sección.** Se asumió visible desde todas las pestañas de la llamada. Confirmar si es una pestaña propia o un bloque debajo del contenido.
3. **Máximo de texto.** Se propuso 1000 caracteres.
4. **Colaboración real.** Se asumió que no hay actualización en vivo, respuestas ni menciones. Confirmar si el ticket las espera.
5. **Notas y disputas.** Confirmar si una nota debe poder citarse al resolver una disputa o en una sesión de coaching.
6. **Falta el enlace de Figma.**
