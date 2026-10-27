# Matriz de acceso por rol

Qué ve y qué puede editar cada rol del módulo QA: Agent, Supervisor, QA Manager y Operation Manager (más el Super Admin, que solo tiene Configuración global).

Generada a partir del mock el 2026-10-27, leyendo el código, no la documentación. Complementa `role-ownership-matrix.md` (2026-10-21), que trata quién debería ser dueño de cada capacidad. Esta describe lo que la app hace hoy.

## Leyenda

| Símbolo  | Significado                                                                      |
| -------- | -------------------------------------------------------------------------------- |
| **Menú** | Aparece en el sidebar de ese rol                                                 |
| **URL**  | No está en su menú, pero carga si se escribe la dirección. El mock no lo bloquea |
| **E**    | Edita: crea, modifica o elimina                                                  |
| **V**    | Solo ve                                                                          |
| **A**    | Actúa: confirma, responde, abre, resuelve                                        |
| **R**    | Lo recibe o le afecta                                                            |
| —        | Sin acceso ni enlace                                                             |

Personas del mock: AGT-004 John Smith · SUP-001 Maria García (Equipo 1) · QAM-001 Elena Ruiz · OPM-001 Sofía Navarro.

## 1. Menú lateral por rol

Orden real del sidebar. Los grupos sin cabecera son bloques separados por una línea. "Configuración" es el único grupo plegable y arranca plegado.

| #   | Agent (6)    | Supervisor (13)               | QA Manager (15)                 | Operation Manager (8)                     | Super Admin (1) |
| --- | ------------ | ----------------------------- | ------------------------------- | ----------------------------------------- | --------------- |
| 1   | Dashboard    | Dashboard                     | Dashboard                       | Dashboard                                 | Global Settings |
| 2   | My Calls     | Inbox                         | Inbox                           | Inbox                                     |                 |
| 3   | Inbox        | Your Team                     | Teams                           | Campaign Assignment                       |                 |
| 4   | Team Ranking | Conversations                 | Conversations                   | Team Health → página Teams del QA Manager |                 |
| 5   | My Learning  | Customers                     | Customers                       | Clients → página Customers del QA Manager |                 |
| 6   | Coaching     | Campaigns                     | Campaigns                       | Rankings → página Rankings del QA Manager |                 |
| 7   |              | Coachings                     | Coachings                       | Analytics                                 |                 |
| 8   |              | Learning                      | Learning                        | Reports → página Reports del QA Manager   |                 |
| 9   |              | Disputes                      | Forms                           |                                           |                 |
| 10  |              | Analytics                     | Disputes                        |                                           |                 |
| 11  |              | Reports                       | Analytics                       |                                           |                 |
| 12  |              | Configuración ▸ Team Triggers | Reports                         |                                           |                 |
| 13  |              | Configuración ▸ Rankings      | Configuración ▸ Triggers Config |                                           |                 |
| 14  |              |                               | Configuración ▸ Rankings        |                                           |                 |
| 15  |              |                               | Configuración ▸ Settings        |                                           |                 |

Notas:

- El Operation Manager solo tiene tres páginas propias: Inbox, Campaign Assignment y Analytics. Las otras cuatro entradas abren páginas del QA Manager, con las mismas capacidades que él.
- Contadores: Inbox muestra los no leídos de cada persona. Disputes muestra las disputas abiertas de su alcance, solo para Supervisor y QA Manager.
- El Agent no tiene entrada de Disputes. Sus disputas son una pestaña dentro de My Calls.

## 2. Acceso y capacidades por sección

| Sección                         | Agent                                                                                                        | Supervisor                                                                                                                                                                                       | QA Manager                                                                                                                         | Operation Manager                                                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**                   | Menú · V. Sus propios indicadores                                                                            | Menú · V. Su equipo                                                                                                                                                                              | Menú · V. Todos los equipos                                                                                                        | Menú · V. Vista de operaciones                                                                                                                                                                                                               |
| **Inbox**                       | Menú · A. Lee y responde a su supervisor o QA Manager                                                        | Menú · A. Lee y responde                                                                                                                                                                         | Menú · A. Lee y responde                                                                                                           | Menú · V. Solo lectura, no puede responder                                                                                                                                                                                                   |
| **Llamadas / Conversations**    | Menú (My Calls) · V de sus llamadas. Abre disputas. No edita momentos. Sin pestañas Business Insights ni ESG | Menú · V de las llamadas del equipo. Revisa momentos                                                                                                                                             | Menú · V de todas. Revisa momentos. Único que puede revelar datos enmascarados                                                     | URL · Como QA Manager, sin revelar datos                                                                                                                                                                                                     |
| **Equipos**                     | —                                                                                                            | Menú (Your Team) · V. Roster y perfiles del Equipo 1                                                                                                                                             | Menú (Teams) · E. Cambia supervisor, añade o quita miembros, asigna campañas al equipo. No crea ni disuelve equipos                | Menú (Campaign Assignment) · E. Decide qué campañas ve cada supervisor y ve los agentes que trabajan en ellas, solo lectura. Los supervisores los crea el Super Admin. Team Health abre la página del QA Manager con sus acciones de edición |
| **Customers**                   | —                                                                                                            | Menú · A. Clientes de su equipo: añadir nota, marcar Do Not Call                                                                                                                                 | Menú · A. Todos los clientes, mismas acciones                                                                                      | Menú (Clients) · A. Página del QA Manager, mismas acciones                                                                                                                                                                                   |
| **Campaigns**                   | Redirigido a My Calls                                                                                        | Menú · E. Crea campañas, pausa, reanuda y completa. Roster limitado a su equipo, sin pestaña Call source                                                                                         | Menú · E. Todo                                                                                                                     | URL · Como QA Manager                                                                                                                                                                                                                        |
| **Forms**                       | URL                                                                                                          | URL                                                                                                                                                                                              | Menú · E. Crea, duplica, edita y elimina formularios y tipos de error                                                              | URL                                                                                                                                                                                                                                          |
| **Coaching**                    | Menú · A. Ve sesiones, confirma tareas y compromisos                                                         | Menú · E. Agentes de su equipo. Reglas: ve las suyas y las globales, y al guardar una se limita a su equipo. Sesiones, grupos y lote semanal de su equipo                                        | Menú · E. Todos los agentes. Reglas globales. Columna de coach y filtro por equipo. Impacto por equipo. Grupos de cualquier equipo | URL · Como QA Manager                                                                                                                                                                                                                        |
| **Learning (LMS)**              | Menú (My Learning) · A. Sus asignaciones, práctica y resultados. Acepta plazos o propone otra fecha          | Menú · E. Biblioteca solo con lo publicado. Asigna a su equipo. Grupos y reportes                                                                                                                | Menú · E. Biblioteca completa: publica, archiva y restaura. Asigna a cualquiera. Filtro por equipo                                 | URL · Como QA Manager                                                                                                                                                                                                                        |
| **Disputes**                    | Pestaña en My Calls · A. Abre disputas desde la evaluación y ve las suyas                                    | Menú · V. Las de su equipo. No resuelve                                                                                                                                                          | Menú · A. Todas. Único que resuelve                                                                                                | URL · Como QA Manager, incluida la resolución                                                                                                                                                                                                |
| **Analytics**                   | —                                                                                                            | Menú · V. Su equipo                                                                                                                                                                              | Menú · V. Todos los equipos                                                                                                        | Menú · V. Versión propia con datos de todos. Las vistas guardadas se comparten entre roles                                                                                                                                                   |
| **Reports**                     | —                                                                                                            | Menú · E. Constructor con alcance Equipo 1 por defecto, no bloqueado. Ve los suyos y los del Equipo 1                                                                                            | Menú · E. Todo                                                                                                                     | Menú · E. Página del QA Manager, firma como QA Manager                                                                                                                                                                                       |
| **Triggers & Recognition**      | R. Recibe alertas y reconocimientos                                                                          | Menú (Team Triggers) · E. Crea, edita, pausa y elimina reglas, insignias y plantillas. Sin selector de supervisores. La lista no se filtra, así que ve y edita también las reglas del QA Manager | Menú (Triggers Config) · E. Igual, con selector de supervisores                                                                    | URL · Como QA Manager. No existe como destinatario de alertas                                                                                                                                                                                |
| **Rankings**                    | Menú (Team Ranking) · V. Clasificación y reacciones                                                          | Menú · E. Programas con equipos fijados al Equipo 1 y sin métricas de Business Insights. Edita y activa cualquier programa que incluya su equipo                                                 | Menú · E. Cualquier equipo y todas las métricas. Filtro por equipo                                                                 | Menú · E. Página del QA Manager, firma como QA Manager                                                                                                                                                                                       |
| **Settings (configuración QA)** | URL                                                                                                          | URL                                                                                                                                                                                              | Menú · E                                                                                                                           | URL                                                                                                                                                                                                                                          |
| **Global configuration**        | URL                                                                                                          | URL                                                                                                                                                                                              | URL                                                                                                                                | URL. Solo el Super Admin la tiene en el menú                                                                                                                                                                                                 |

## 3. Configuración general: quién edita qué

### Settings del QA Manager (`/qa/qa-manager/settings`)

Siete pestañas. Solo el QA Manager la tiene en el menú. Los demás roles llegan por URL y pueden editarla, porque nada lo bloquea. Los cambios no se guardan al recargar.

| Pestaña             | Qué configura                                                                                                          | Edita por menú |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------- |
| Quality Assurance   | Bandas de puntuación QA (On target 90, Watch 70), bandas por categoría COPC, umbral de incidente                       | QA Manager     |
| Compliance          | Bandas Compliant / Warning / Violation, overrides por métrica, umbral de aprobado por área                             | QA Manager     |
| Sentiment & Emotion | Puntos de corte de la escala 1 a 5, umbral de incidente, asignación de emociones a cada banda                          | QA Manager     |
| Business Insights   | Bandas de conversión y alertas por señal (objeciones, competencia, oferta mal dirigida)                                | QA Manager     |
| Coaching            | Grupos de desempeño del scorecard semanal (Excellent, Good, Needs improvement, Critical)                               | QA Manager     |
| Burnout             | 15 señales de voz y 2 de contexto, léxicos por idioma, línea base, ventana, niveles                                    | QA Manager     |
| Privacy             | Enmascarado por categoría, silenciado de grabación, permiso y duración de revelado. Registro de revelados solo lectura | QA Manager     |

### Global configuration del Super Admin (`/role-preview/global-settings`)

Siete pestañas en un almacén separado del de Settings. La escala de puntuación y el catálogo de emociones existen en los dos sitios y no se sincronizan.

| Pestaña            | Qué configura                                                                                          | Edita por menú |
| ------------------ | ------------------------------------------------------------------------------------------------------ | -------------- |
| Call analysis      | Idioma de transcripción, retención de audio, diarización, análisis a ejecutar, duración mínima         | Super Admin    |
| Evaluation         | Formato (Standard / COPC), formulario por defecto, evaluador principal y de respaldo. Guarda versiones | Super Admin    |
| Context rules      | Reglas de contexto por cliente, tipo de campaña o campaña. Crear, duplicar, activar, eliminar          | Super Admin    |
| Campaign types     | Tipos de campaña propios. Los integrados están bloqueados                                              | Super Admin    |
| Naming convention  | Separador, formato de fecha y orden de segmentos del nombre de audio                                   | Super Admin    |
| Score scales       | Escalas con nombre y bandas, usadas en reglas de alerta                                                | Super Admin    |
| Sentiment analysis | Prompt del LLM, instrucciones de clasificación y catálogo de emociones. Guarda versiones               | Super Admin    |

## 4. Lo que el mock no bloquea

Importa para no leer la tabla como permisos reales.

- **No hay guard por rol.** Todo `/qa` tiene una sola puerta, "QA admin". Dentro, cualquier rol puede abrir cualquier URL y obtiene la página completa con el alcance que marca el prefijo de la URL.
- **La URL manda sobre el rol.** El rol se elige en el menú de usuario, "Preview as role", disponible para cualquier usuario, y se guarda en el navegador. Si un Agent abre `/qa/qa-manager/settings`, edita como QA Manager.
- **El Operation Manager no existe en la mayoría de las áreas.** Donde no tiene página propia, el código lo trata como QA Manager (rankings, reportes, disputas, triggers) o como Supervisor (ayudante `roleFromPath`).
- **Las únicas reglas que sí dependen del rol elegido:** el Agent es redirigido al salir de la lista de campañas; solo QA Manager y Super Admin pueden revelar datos enmascarados; el Operation Manager no puede responder en Inbox; el Supervisor no ve la pestaña Call source ni las métricas de Business Insights en rankings; resolver disputas solo funciona en la ruta del QA Manager.

## 5. Incoherencias detectadas

1. El QA Manager firma las reglas de triggers como "Laura Gómez" y los revelados como "Laura Méndez". La persona es Elena Ruiz.
2. Elegir el preview de Supervisor concede la puerta de QA admin a cualquier usuario.
3. En las páginas antiguas de disputas (`/qa/disputes`), la comprobación de QA Manager mira al Operation Manager. Parece invertida. Y `/qa/qamanager/disputes` se evalúa con alcance de Agent.
4. Settings del QA Manager y Global configuration guardan escalas y emociones por separado.
5. El selector de agentes del Supervisor en triggers lista a todos los agentes, no solo a su equipo.
6. `getSuperAdminNavigation()` es código muerto: su etiqueta no existe en los idiomas.

## Archivos fuente

| Tema                 | Archivos                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sidebar              | `src/components/Sidebar/roleNavigation.tsx`, `src/components/Sidebar/Sidebar.tsx` (rolePreviewNav)                                                                  |
| Rol y guards         | `src/routes.tsx`, `src/components/ModuleGuard`, `src/hooks/useIsQaAdmin.ts`, `src/stores/roleMockStore.ts`, `src/components/UserMenu/UserMenu.tsx`                  |
| Alcance por URL      | `src/modules/qa/team/helpers.ts` (roleFromPath), `src/modules/qa/inbox/constants.ts`, `src/modules/qa/triggers/constants.ts`, `src/modules/qa/analytics/helpers.ts` |
| Settings             | `src/modules/qa/settings/`, `src/stores/qa/settingsStore.ts`                                                                                                        |
| Global configuration | `src/modules/qa/global-config/`, `src/stores/qa/globalConfigStore.ts`                                                                                               |
