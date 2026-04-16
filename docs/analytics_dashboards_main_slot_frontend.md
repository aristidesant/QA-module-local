# Analytics Dashboards Main Slot

## Resumen

Se agrego una nueva propiedad opcional en dashboard llamada `mainSlot`.

Esta propiedad permite marcar dashboards globales como uno de los 3 slots principales del cliente:

- `MAIN_1`
- `MAIN_2`
- `MAIN_3`

`mainSlot` coexiste con `isDefault`. No lo reemplaza.

## Regla de negocio

`mainSlot` solo aplica a dashboards globales.

Reglas:

1. Un dashboard con `campaignId` no puede tener `mainSlot`.
2. `mainSlot` es opcional.
3. Por cada `clientId` solo puede existir un dashboard con `MAIN_1`, uno con `MAIN_2` y uno con `MAIN_3`.
4. Si un slot ya esta ocupado, el backend responde error.
5. Un cliente puede tener 0, 1, 2 o 3 dashboards principales.
6. Un dashboard puede tener `isDefault` y `mainSlot` al mismo tiempo.

## Enum expuesto por API

Valores soportados:

```ts
type DashboardMainSlot = 'MAIN_1' | 'MAIN_2' | 'MAIN_3';
```

Si el frontend quiere mostrar etiquetas mas amigables, puede mapear asi:

```ts
const dashboardMainSlotLabel = {
	MAIN_1: 'MAIN-1',
	MAIN_2: 'MAIN-2',
	MAIN_3: 'MAIN-3',
};
```

## Endpoints impactados

Los cambios aplican a los endpoints de dashboards:

- `POST /analytics-dashboards/dashboards`
- `PATCH /analytics-dashboards/dashboards/:id`
- `GET /analytics-dashboards/dashboards`
- `GET /analytics-dashboards/dashboards/:id`

## Shape actualizado

### Create dashboard

```json
{
	"campaignId": null,
	"name": "Sales Overview",
	"description": "Main operational dashboard",
	"mainSlot": "MAIN_1",
	"isDefault": false,
	"layoutConfig": {
		"columns": 12
	}
}
```

### Update dashboard

```json
{
	"mainSlot": "MAIN_2"
}
```

### Liberar slot

Para quitar un slot principal, enviar `null`:

```json
{
	"mainSlot": null
}
```

### Response dashboard

```json
{
	"id": 15,
	"clientId": 42,
	"campaignId": null,
	"userId": 9,
	"name": "Sales Overview",
	"description": "Main operational dashboard",
	"mainSlot": "MAIN_1",
	"isDefault": true,
	"layoutConfig": {
		"columns": 12
	},
	"createdAt": "2026-04-15T12:00:00.000Z",
	"updatedAt": "2026-04-15T12:00:00.000Z"
}
```

## Validaciones importantes para frontend

Antes de enviar el formulario:

1. Si el dashboard tiene `campaignId`, no permitir seleccionar `mainSlot`.
2. Si el usuario cambia el dashboard a uno de campaña, limpiar o deshabilitar `mainSlot` en UI.
3. Mostrar solo estas 3 opciones: `MAIN_1`, `MAIN_2`, `MAIN_3`.
4. Permitir valor vacio para dashboards que no sean main.

## Errores esperados del backend

### Caso 1: dashboard de campana con `mainSlot`

Request:

```json
{
	"campaignId": 497,
	"name": "Campaign Dashboard",
	"mainSlot": "MAIN_1"
}
```

Respuesta esperada:

```json
{
	"statusCode": 400,
	"message": "mainSlot is only allowed for global dashboards",
	"error": "Bad Request"
}
```

### Caso 2: slot ya ocupado por otro dashboard del mismo cliente

Respuesta esperada:

```json
{
	"statusCode": 400,
	"message": "Dashboard main slot MAIN_1 is already assigned for this client",
	"error": "Bad Request"
}
```

## Comportamiento recomendado en UI

### Formulario create/edit

- Agregar un selector opcional `Main slot`
- Opciones:
  - vacio
  - `MAIN_1`
  - `MAIN_2`
  - `MAIN_3`
- Si `campaignId` tiene valor:
  - deshabilitar selector, o
  - ocultarlo

### Listado de dashboards

Opcionalmente se puede mostrar un badge:

- `MAIN-1`
- `MAIN-2`
- `MAIN-3`

### Dashboard details

Si `mainSlot` viene en response, mostrarlo como metadata del dashboard.

## Casos validos

### Dashboard global sin slot

```json
{
	"campaignId": null,
	"name": "General Dashboard",
	"mainSlot": null
}
```

### Dashboard global con slot

```json
{
	"campaignId": null,
	"name": "Executive Dashboard",
	"mainSlot": "MAIN_3"
}
```

### Dashboard de campana sin slot

```json
{
	"campaignId": 497,
	"name": "Campaign Performance",
	"mainSlot": null
}
```

## Casos invalidos

### Dashboard de campana con slot

```json
{
	"campaignId": 497,
	"name": "Campaign Performance",
	"mainSlot": "MAIN_2"
}
```

### Duplicar slot dentro del mismo cliente

Si ya existe un dashboard con `MAIN_2`, otro dashboard del mismo cliente no puede usar `MAIN_2`.

## Nota tecnica

La restriccion de unicidad esta protegida en dos capas:

1. validacion en servicio para devolver errores claros
2. indice unico parcial en PostgreSQL para evitar duplicados reales
