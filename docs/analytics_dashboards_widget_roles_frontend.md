# Analytics Dashboards Widget Roles

## Resumen

Se agrego soporte para asignar multiples roles a un widget de dashboard.

La restriccion solo aplica cuando el usuario consume:

- `POST /analytics-dashboards/dashboards/:id/render`
- `POST /analytics-dashboards/dashboards/:id/render-comparison`

No aplica para listar widgets del dashboard en administracion.

## Regla de visibilidad

- Si un widget no tiene roles asociados, es visible para cualquier usuario del cliente.
- Si un widget tiene uno o mas roles asociados, solo se renderiza si el usuario autenticado tiene al menos uno de esos roles.

## Cambios en create widget

Endpoint:

- `POST /analytics-dashboards/widgets`

Campo nuevo opcional:

```json
{
	"dashboardId": 1,
	"widgetType": "KPI",
	"title": "Blocked Calls",
	"dataConfig": {},
	"roleIds": [1, 2, 5]
}
```

Notas:

- `roleIds` es opcional.
- Si no se envia, el widget queda publico.
- Si se envia con valores, el widget queda restringido a cualquiera de esos roles.

## Cambios en update widget

Endpoint:

- `PATCH /analytics-dashboards/widgets/:id`

Campo nuevo opcional:

```json
{
	"title": "Blocked Calls",
	"roleIds": [2, 7]
}
```

Semantica:

- Si `roleIds` no se envia, no se modifica la configuracion de roles actual.
- Si `roleIds` se envia como `[]`, se eliminan todas las restricciones y el widget vuelve a ser publico.
- Si `roleIds` se envia con ids, reemplaza completamente la lista actual de roles.

## Cambios en respuesta de widget

Endpoints afectados:

- `POST /analytics-dashboards/widgets`
- `PATCH /analytics-dashboards/widgets/:id`
- `GET /analytics-dashboards/dashboards/:dashboardId/widgets`

Nuevo campo en respuesta:

```json
{
	"id": 10,
	"dashboardId": 1,
	"title": "Blocked Calls",
	"roles": [
		{
			"id": 1,
			"name": "Dashboard Admin",
			"code": "DASHBOARD_ADMIN"
		},
		{
			"id": 2,
			"name": "Supervisor",
			"code": "SUPERVISOR"
		}
	]
}
```

## Recomendacion para frontend

- En create/edit widget, cargar catalogo de roles y permitir seleccion multiple.
- Guardar solo `roleIds` en request.
- Usar `roles` de la respuesta para rellenar el formulario al editar.
- Si el usuario limpia todos los roles seleccionados, enviar `roleIds: []`.

## Impacto en render

Los endpoints de render no cambian su payload.

El cambio es funcional: ahora la respuesta solo incluira widgets permitidos para los roles del usuario autenticado.
