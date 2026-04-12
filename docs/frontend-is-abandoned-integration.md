# Frontend Changes For `is_abandoned`

## Goal

Alinear el frontend con el nuevo soporte backend para `is_abandoned` en:

1. `disposition_node`
2. `call_disposition`

Este cambio permite marcar outcomes del catalogo como abandono y ver ese estado ya materializado en la disposicion final de la llamada.

## Backend Contract Added

### Disposition Nodes

Los nodos del catalogo de outcomes ahora incluyen:

```ts
isAbandoned?: boolean
```

Disponible en:

1. `POST /disposition-nodes`
2. `PATCH /disposition-nodes/:id`
3. `GET /disposition-nodes`
4. `GET /disposition-nodes/:id`
5. `GET /disposition-nodes/tree/catalog/:catalogId`
6. `GET /disposition-nodes/management/all-with-inactive`
7. `GET /disposition-nodes/management/tree-with-inactive/catalog/:catalogId`

Tambien existe filtro nuevo:

```ts
isAbandoned?: boolean
```

en `GET /disposition-nodes` y `GET /disposition-nodes/management/all-with-inactive`.

### Call Dispositions

Las disposiciones finales de llamada ahora incluyen:

```ts
isAbandoned: boolean;
```

Disponible en respuestas de:

1. `POST /call-dispositions`
2. `POST /call-dispositions/with-ai`
3. `GET /call-dispositions`
4. `GET /call-dispositions/:id`
5. `GET /call-dispositions/conversation/:conversationId`
6. `GET /call-dispositions/report`

Tambien existe filtro nuevo:

```ts
isAbandoned?: boolean
```

en `GET /call-dispositions` y `GET /call-dispositions/report`.

## Frontend Work Required

## 1. Update Types

Actualizar los tipos/interfaces del frontend.

### `DispositionNode`

Agregar:

```ts
isAbandoned?: boolean
```

### `CreateDispositionNodePayload`

Agregar:

```ts
isAbandoned?: boolean
```

### `UpdateDispositionNodePayload`

Agregar:

```ts
isAbandoned?: boolean
```

### `DispositionNodeFilters`

Agregar:

```ts
isAbandoned?: boolean
```

### `CallDisposition`

Agregar:

```ts
isAbandoned: boolean;
```

### `CallDispositionFilters`

Agregar:

```ts
isAbandoned?: boolean
```

## 2. Catalog / Outcome Admin UI

En la pantalla donde se crean o editan `disposition nodes`, agregar un nuevo control booleano.

Recomendacion de label:

```text
Es abandono
```

Texto de ayuda sugerido:

```text
Marca este outcome cuando el cliente cierra la llamada antes de concluir el flujo.
```

Este campo debe aparecer en:

1. formulario de crear nodo
2. formulario de editar nodo
3. vista de detalle del nodo
4. tree admin o tabla del catalogo

Representacion visual sugerida:

1. `switch` o `checkbox`
2. badge en listados: `Abandono`

## 3. Tree / Table Visualization

En listados de outcomes conviene mostrar `isAbandoned` con una columna o badge.

Ejemplos:

1. columna `Abandono`
2. badge `Abandoned`
3. icono de alerta o corte de llamada

Esto ayuda a validar visualmente que el catalogo este bien configurado.

## 4. Query Params For Filters

Actualizar los helpers de query params para soportar:

### Disposition nodes

```ts
GET /disposition-nodes?isAbandoned=true
GET /disposition-nodes/management/all-with-inactive?isAbandoned=true
```

### Call dispositions

```ts
GET /call-dispositions?isAbandoned=true
GET /call-dispositions/report?isAbandoned=true
```

Importante:

1. enviar `true` o `false` como string en query params
2. no enviar el parametro si el filtro no esta activo

## 5. AI Classification Preview / Review Screens

Si el frontend tiene una vista donde se muestra el resultado de clasificacion AI antes o despues de guardar, agregar el campo:

```ts
selectedDisposition.isAbandoned;
```

Uso sugerido:

1. mostrar badge `Abandono`
2. resaltar que esa llamada cuenta para la metrica de abandono

## 6. Call Disposition Detail Screens

En vistas de detalle de llamada o de disposition, mostrar el nuevo flag:

```ts
callDisposition.isAbandoned;
```

Uso sugerido:

1. badge `Abandonada`
2. filtro rapido en tablas
3. columna exportable si el frontend exporta resultados

## 7. Forms Payload Examples

### Create disposition node

```json
{
	"name": "Cliente colgo antes de finalizar",
	"description": "El cliente termino la llamada antes de llegar a un cierre del flujo",
	"catalogId": 12,
	"parentId": 45,
	"isFinal": true,
	"requiresReschedule": false,
	"isVoiceMail": false,
	"doNotCall": false,
	"isAbandoned": true
}
```

### Update disposition node

```json
{
	"isAbandoned": true
}
```

### Filter call dispositions

```ts
{
  isAbandoned: true,
  campaignId: 10
}
```

## 8. Response Examples

### Disposition node response

```json
{
	"id": 45,
	"name": "Cliente colgo antes de finalizar",
	"description": "El cliente termino la llamada antes de llegar a un cierre del flujo",
	"isFinal": true,
	"isVoiceMail": false,
	"doNotCall": false,
	"isAbandoned": true,
	"catalogId": 12,
	"parentId": 20
}
```

### Call disposition response

```json
{
	"id": 900,
	"conversationId": 2454,
	"dispositionName": "Cliente colgo antes de finalizar",
	"isFinal": true,
	"doNotCall": false,
	"isAbandoned": true,
	"callDispositionNodeId": 45
}
```

## 9. Frontend Validation Rules

Aplicar estas reglas:

1. `isAbandoned` debe tratarse como booleano
2. default UI recomendado: `false`
3. no inferir abandono en frontend por nombre del disposition
4. usar siempre el flag backend `isAbandoned`

Esto evita reglas duplicadas o inconsistentes entre frontend y backend.

## 10. UX Recommendations

Recomendado para que todo encaje bien:

1. agregar toggle `Es abandono` en editor de outcomes
2. agregar filtro rapido `Solo abandonos` en listados de dispositions
3. mostrar badge visible en llamadas abandonadas
4. no mezclar `isAbandoned` con `doNotCall`, `isVoiceMail` o `isFinal`

Cada uno representa una cosa distinta.

## 11. Things Frontend Should Not Assume

No asumir esto:

1. que `dispositionName` contiene la palabra abandono
2. que `termination_reason` define abandono
3. que toda llamada corta es abandono
4. que `isFinal = false` implica abandono

La fuente oficial ahora es:

1. `disposition_node.isAbandoned` para el catalogo
2. `call_disposition.isAbandoned` para la llamada clasificada

## 12. Suggested Delivery Order For Frontend

1. actualizar tipos
2. actualizar formularios de `disposition nodes`
3. actualizar tablas/arboles del catalogo
4. actualizar filtros de `call-dispositions`
5. actualizar detalle de disposition/llamada
6. conectar futuros widgets de abandono usando `callDisposition.isAbandoned`

## 13. Pending But Not Required For This Change

Este cambio no incluye todavia:

1. widget analytics de abandono
2. metric engine para dashboards
3. porcentaje de abandono
4. backfill historico

Eso puede montarse despues sobre este contrato nuevo.
