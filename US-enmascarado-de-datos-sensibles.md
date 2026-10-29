# US-enmascarado-de-datos-sensibles: Enmascarado automático de datos sensibles

**Prioridad:** Imprescindible · **Estimación:** M — intuición inicial, el equipo la refina

## Historia

Como QA Manager,
quiero que los datos sensibles de una llamada (tarjetas, documentos de identidad, contacto y credenciales) se oculten automáticamente en la transcripción, en las evidencias y en la grabación,
para proteger la privacidad de los clientes y cumplir con la regulación sin que nadie tenga que revisar a mano cada interacción.

## Contexto

Las llamadas contienen datos que los clientes dicen en voz alta y que no deben ser visibles para todos. El enmascarado se activa y se configura en Configuración → Privacy, y se nota en toda la plataforma: la evaluación de la llamada, los momentos marcados, el coaching y las disputas. El análisis de la llamada sigue funcionando con el contenido completo; solo cambia lo que ve cada persona. Esta historia complementa la de evaluación de cumplimiento, donde el control "Data Protection" depende de este enmascarado.

## Referencias de diseño

- Figma: Pendiente.
- Se reutilizan el aviso en línea, las etiquetas con candado, el panel lateral y las tarjetas de sección ya existentes. No hay elementos visuales nuevos.

## Alcance

**Incluye:**

- Activar o desactivar el enmascarado para toda la plataforma.
- Elegir qué grupos de datos se ocultan: tarjetas y cuentas bancarias, documentos de identidad, contacto y ubicación, credenciales y datos personales.
- Definir, por grupo, cuántos dígitos finales quedan visibles (de 0 a 4).
- Silenciar la grabación mientras se dice un dato sensible.
- Probar una frase de ejemplo y ver qué se ocultaría.
- Mostrar los datos ocultos como etiquetas con candado y tipo, por ejemplo "Card •••• 1234".
- Aviso en la llamada que indica cuántos datos hay ocultos y de qué tipo.
- Revelar temporalmente los datos reales, solo QA Manager y super admin, con motivo y registro.

**No incluye:**

- Cambiar el análisis ni las puntuaciones de la llamada, que siguen calculándose con el texto completo.
- Que supervisores o agentes vean los datos reales en ningún caso.
- Ocultar datos en documentos o canales distintos de las llamadas.

## Estados de UI y casos límite

| Estado                  | Disparador                                               | Comportamiento de UI                                                                                                               |
| ----------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Datos ocultos           | Enmascarado activo y la llamada contiene datos sensibles | Aviso gris con el número de elementos y sus tipos; en transcripción y evidencias aparecen las etiquetas con candado                |
| Audio silenciado        | Silenciado activo                                        | El aviso lo indica; el reproductor muestra cuántos tramos están silenciados y los marca en la línea de tiempo                      |
| Sin datos sensibles     | Nada coincide con las reglas                             | Aviso gris "No sensitive data detected"                                                                                            |
| Enmascarado desactivado | El interruptor está apagado                              | Aviso amarillo "Sensitive data masking is off"; todo se ve sin ocultar                                                             |
| Revelado                | QA Manager o super admin confirma el revelado            | Aviso rojo con quién, hora, motivo y hora de ocultado automático; los datos reales se ven y se pueden volver a ocultar al instante |
| Revelado expirado       | Pasa el tiempo configurado                               | Los datos vuelven a ocultarse solos                                                                                                |
| Sin permiso de revelado | Rol supervisor o agente, o revelado desactivado          | No aparece el botón; el aviso explica quién puede revelar                                                                          |
| Configuración con error | Minutos fuera de 5 a 120 o dígitos fuera de 0 a 4        | Mensaje de error junto al campo y el botón de guardar queda deshabilitado                                                          |

Interacción: los cambios de configuración se guardan con el botón "Save changes", se pueden descartar o volver a los valores por defecto. El probador de frases muestra el resultado al escribir. Todo debe verse bien en modo claro y oscuro.

## Notas de datos y lógica

- **Valores por defecto:** enmascarado activo, los cuatro grupos activos, tarjetas con 4 dígitos finales visibles y el resto sin ninguno, audio silenciado, revelado permitido por 15 minutos y sin nota obligatoria.
- **Dónde se aplica:** transcripciones, citas de evidencia, momentos marcados, coaching y disputas. En coaching y disputas siempre se ve oculto.
- **Revelado:** solo en el detalle de la llamada, por llamada, con motivo obligatorio (Dispute review, Compliance investigation, Customer request, Fraud check u Other) y nota si la política la exige o el motivo es "Other". Dura entre 5 y 120 minutos y no se conserva al recargar.
- **Registro de revelados:** cada revelado guarda cuándo, quién, qué llamada, motivo, nota y estado (visible, expirado u ocultado antes de tiempo), y se consulta en Configuración → Privacy.
- **Seguridad:** el sistema debe entregar los textos ya ocultos y los tramos de audio ya silenciados a quien no pueda revelar, de modo que los valores reales nunca lleguen a su pantalla.
- Los textos deben existir en español e inglés.

## Criterios de aceptación

```gherkin
Escenario: Ocultar una tarjeta
  Dado que el enmascarado está activo y la tarjeta muestra 4 dígitos finales
  Cuando se dice "4512 3456 7890 1234" en la llamada
  Entonces la transcripción y las evidencias muestran "Card •••• 1234"
  Y el aviso de la llamada cuenta ese elemento

Escenario: Apagar un grupo de datos
  Dado que desactivo el grupo "Contact and location"
  Cuando abro una llamada con un correo electrónico
  Entonces el correo se ve completo
  Y los demás grupos siguen ocultos

Escenario: Silenciar la grabación
  Dado que el silenciado está activo
  Cuando reproduzco el tramo donde se dice un dato sensible
  Entonces no se oye el dato
  Y la línea de tiempo marca ese tramo

Escenario: Probar una frase
  Dado que estoy en Configuración → Privacy
  Cuando escribo "My card is 4512 3456 7890 1234"
  Entonces veo "1 item would be masked"

Escenario: Revelar con motivo
  Dado que soy QA Manager y el revelado está permitido
  Cuando pulso "Reveal", elijo un motivo y confirmo
  Entonces veo los datos reales durante los minutos configurados
  Y el revelado aparece en el registro

Escenario: Supervisor o agente
  Dado que soy supervisor o agente
  Cuando abro una llamada con datos sensibles
  Entonces no puedo revelarlos
  Y el aviso lo explica

Escenario: Valor fuera de rango
  Dado que escribo 200 minutos de revelado
  Cuando intento guardar
  Entonces veo un error y el botón de guardar queda deshabilitado
```

- [ ] Cada grupo de datos explica en una línea qué reconoce.
- [ ] Los dígitos visibles aceptan de 0 a 4 y el tiempo de revelado de 5 a 120 minutos.
- [ ] Las etiquetas de datos ocultos tienen buen contraste en modo claro y oscuro.
- [ ] Ninguna pantalla distinta del detalle de la llamada permite ver los datos reales.

## Accesibilidad

- Las etiquetas de datos ocultos se leen como "tarjeta, oculta, termina en 1234", no solo como puntos.
- Los cambios de estado del aviso (revelado, ocultado, expirado) se anuncian al lector de pantalla.
- El panel de revelado devuelve el foco al botón que lo abrió y se cierra con Escape.
- Los interruptores y campos de la configuración tienen nombre claro y sus errores se leen junto al campo.

## Preguntas abiertas

1. **Grabaciones de pantalla.** El ticket las menciona y la configuración dice que se difuminan, pero la pantalla de la llamada solo tiene audio. Confirmar si existen y dónde se verían.
2. **Reconocimiento de datos.** Hoy se detectan por patrones de formato (números, correos, etc.). Confirmar si basta o si hace falta reconocimiento por contexto, por ejemplo un número dicho en palabras.
3. **Idiomas.** Los patrones actuales parecen pensados para inglés. Confirmar qué idiomas y formatos de documento deben cubrirse.
4. **Etiquetas en inglés.** Los nombres de las etiquetas (Card, Email, etc.) están solo en inglés; confirmar si se traducen.
5. **Falta el enlace de Figma.**
