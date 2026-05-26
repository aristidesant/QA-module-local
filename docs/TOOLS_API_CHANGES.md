# Tools API - Breaking Changes

## Resumen

La API de tools fue actualizada para alinearse con la nueva version del SDK de ElevenLabs. Hay cambios **breaking** en los endpoints existentes y **2 endpoints nuevos**.

---

## Cambios Breaking

### 1. `config` ahora requiere campo `type` (discriminador)

Antes el `config` era un objeto libre. Ahora **debe** incluir un campo `type` que determina el tipo de tool:

| `type`      | Descripcion                                                                  |
| ----------- | ---------------------------------------------------------------------------- |
| `"webhook"` | Tool que llama un endpoint externo desde el servidor de ElevenLabs           |
| `"client"`  | Tool que envia un evento al cliente del usuario                              |
| `"system"`  | Tool nativo del sistema (end_call, transfer_call, voicemail_detection, etc.) |
| `"mcp"`     | Tool basado en MCP server                                                    |

**Antes:**

```json
{
	"name": "register_delivery_location",
	"description": "Register a delivery location",
	"type": "webhook",
	"responseTimeoutSecs": 20,
	"apiSchema": {
		"url": "https://example.com/delivery-location",
		"method": "POST",
		"requestBodySchema": { "type": "object" }
	}
}
```

**Ahora:**

```json
{
	"type": "webhook",
	"name": "register_delivery_location",
	"description": "Register a delivery location",
	"responseTimeoutSecs": 20,
	"apiSchema": {
		"url": "https://example.com/delivery-location",
		"method": "POST",
		"requestBodySchema": { "type": "object" }
	}
}
```

> El campo `type` ahora es obligatorio y debe ser el primer campo del objeto `config`.

### 2. Nueva propiedad `responseMocks`

Los endpoints de create y update ahora aceptan un campo opcional `responseMocks` para configurar respuestas mock de testing:

```json
{
	"name": "My Tool",
	"description": "...",
	"prompt": "...",
	"categoryId": 1,
	"status": "active",
	"config": {
		"type": "webhook",
		"name": "my_tool",
		"description": "...",
		"apiSchema": { "url": "https://example.com", "method": "POST" }
	},
	"responseMocks": [
		{
			"parameterConditions": [],
			"mockResult": "{\"status\": \"success\"}"
		}
	]
}
```

### 3. `DELETE /tools/:id` acepta query param `force`

```
DELETE /tools/:id?force=true
```

Si `force=true`, el tool se elimina incluso si esta siendo usado por agentes (se desvincula automaticamente de los agentes dependientes).

---

## Endpoints Nuevos

### `GET /tools/:id/dependent-agents`

Retorna los agentes que dependen de este tool.

**Response:**

```json
{
	"agents": [
		{
			"agentId": "agent_abc123",
			"agentName": "Sales Agent"
		}
	],
	"branches": [
		{
			"branchId": "branch_xyz",
			"agentId": "agent_abc123"
		}
	],
	"nextCursor": "cursor_token",
	"hasMore": false
}
```

### `GET /tools/:id/executions`

Retorna las ejecuciones de un tool con paginacion y filtros.

**Query Params:**

| Param       | Tipo    | Descripcion                             |
| ----------- | ------- | --------------------------------------- |
| `cursor`    | string  | Cursor de paginacion                    |
| `pageSize`  | number  | Tamano de pagina (max 100, default 30)  |
| `isError`   | boolean | Filtrar por estado de error             |
| `agentId`   | string  | Filtrar por agente                      |
| `branchId`  | string  | Filtrar por branch                      |
| `startTime` | number  | Filtro desde timestamp Unix (inclusivo) |
| `endTime`   | number  | Filtro hasta timestamp Unix (inclusivo) |

**Response:**

```json
{
	"executions": [
		{
			"toolCallId": "call_xyz",
			"agentId": "agent_abc123",
			"timestamp": 1700000000,
			"latencySecs": 1.5,
			"isError": false
		}
	],
	"nextCursor": "cursor_token",
	"hasMore": true
}
```

---

## Cambios en la respuesta de Tool

El objeto `Tool` en las respuestas ahora incluye el campo `responseMocks`:

```json
{
	"id": 1,
	"identifier": "tool_el_id",
	"name": "My Tool",
	"description": "...",
	"prompt": "...",
	"categoryId": 1,
	"status": "active",
	"config": {
		"type": "webhook",
		"name": "my_tool",
		"description": "...",
		"apiSchema": { "url": "https://example.com", "method": "POST" }
	},
	"responseMocks": [
		{
			"parameterConditions": [],
			"mockResult": "{\"status\": \"success\"}"
		}
	],
	"createdAt": "2024-01-01T00:00:00Z",
	"updatedAt": "2024-01-01T00:00:00Z"
}
```

---

## Ejemplos de `config` por tipo

### Webhook

```json
{
	"type": "webhook",
	"name": "check_balance",
	"description": "Check the user's account balance",
	"responseTimeoutSecs": 20,
	"apiSchema": {
		"url": "https://api.example.com/balance",
		"method": "GET",
		"requestHeaders": { "Authorization": "Bearer token" },
		"queryParamsSchema": {
			"type": "object",
			"properties": { "user_id": { "type": "string" } }
		},
		"requestBodySchema": { "type": "object" }
	}
}
```

### Client

```json
{
	"type": "client",
	"name": "show_map",
	"description": "Display a map on the client",
	"expectsResponse": false,
	"parameters": {
		"type": "object",
		"properties": {
			"location": { "type": "string", "description": "Location to display" }
		}
	}
}
```

### System (end_call)

```json
{
	"type": "system",
	"name": "end_call",
	"params": {
		"systemToolType": "end_call"
	}
}
```

---

## Resumen de migracion

| Cambio                      | Accion requerida                                             |
| --------------------------- | ------------------------------------------------------------ |
| `config` requiere `type`    | Agregar campo `type` en todos los forms de crear/editar tool |
| Nuevo campo `responseMocks` | Agregar soporte UI opcional para gestionar mocks             |
| `DELETE` con `force`        | Agregar checkbox o confirmacion para forzar eliminacion      |
| Endpoint `dependent-agents` | Mostrar agentes dependientes antes de eliminar               |
| Endpoint `executions`       | Nueva vista/tab de ejecuciones del tool                      |
