# Report Values - Sheet Configuration Changes for Frontend

## Resumen

Se agrego soporte para agrupar columnas de `report-values` en multiples sheets al exportar `xlsx`.

Nuevos campos:

- `sheet`: numero de hoja
- `sheetName`: nombre visible de la hoja en Excel

Ademas, ahora una misma columna logica puede existir en multiples sheets como copias independientes.

CSV sigue funcionando plano, sin sheets visibles. XLSX ahora genera una worksheet por cada `sheet` configurado.

---

## Campos nuevos en `ReportValue`

```ts
interface ReportValue {
	id: number;
	originType: 'SQL' | 'DYNAMIC' | 'OBJECT' | 'METADATA';
	key: string;
	label: string;
	dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'DATETIME';
	order: number;
	sheet: number;
	sheetName: string;
	format?: string | null;
	campaignId: number;
	userId: number;
	clientId: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}
```

---

## Defaults

Si el frontend no envia estos campos al crear una columna:

- `sheet` = `1`
- `sheetName` = `Report 1`

Si se envia `sheet = 3` y no se envia `sheetName`, el backend asigna:

- `sheetName` = `Report 3`

---

## Reglas que el frontend debe respetar

### 1. `sheet` y `sheetName` representan la hoja

Todas las columnas que pertenezcan a la misma hoja deben compartir:

- el mismo `sheet`
- el mismo `sheetName`

Ejemplo valido:

```json
[
	{ "label": "Nombre", "sheet": 1, "sheetName": "Datos Generales", "order": 0 },
	{
		"label": "Apellido",
		"sheet": 1,
		"sheetName": "Datos Generales",
		"order": 1
	},
	{ "label": "Balance", "sheet": 2, "sheetName": "Cobros", "order": 0 }
]
```

Ejemplo invalido:

```json
[
	{ "label": "Nombre", "sheet": 1, "sheetName": "Datos Generales", "order": 0 },
	{ "label": "Apellido", "sheet": 1, "sheetName": "Otra Hoja", "order": 1 }
]
```

---

### 2. `order` no se puede repetir dentro del mismo `sheet`

Regla:

- no puede existir mas de una columna con el mismo par `sheet + order` dentro de la misma campaign

Ejemplo invalido:

```json
[
	{ "label": "Nombre", "sheet": 1, "sheetName": "Datos", "order": 0 },
	{ "label": "Apellido", "sheet": 1, "sheetName": "Datos", "order": 0 }
]
```

Ejemplo valido:

```json
[
	{ "label": "Nombre", "sheet": 1, "sheetName": "Datos", "order": 0 },
	{ "label": "Apellido", "sheet": 1, "sheetName": "Datos", "order": 1 },
	{ "label": "Balance", "sheet": 2, "sheetName": "Cobros", "order": 0 }
]
```

---

### 3. La misma columna puede existir en varios sheets

Ahora se permite duplicar una columna existente en otro sheet siempre que no se repita dentro del mismo sheet.

La unicidad real ahora es por:

- `sheet`
- `originType`
- `key`

Ejemplo valido:

```json
[
	{
		"label": "First Name",
		"originType": "SQL",
		"key": "first_name",
		"sheet": 1,
		"sheetName": "Datos Generales",
		"order": 0
	},
	{
		"label": "First Name",
		"originType": "SQL",
		"key": "first_name",
		"sheet": 2,
		"sheetName": "Cobros",
		"order": 1
	}
]
```

Ejemplo invalido:

```json
[
	{
		"label": "First Name",
		"originType": "SQL",
		"key": "first_name",
		"sheet": 1,
		"sheetName": "Datos Generales",
		"order": 0
	},
	{
		"label": "Nombre",
		"originType": "SQL",
		"key": "first_name",
		"sheet": 1,
		"sheetName": "Datos Generales",
		"order": 1
	}
]
```

Aunque cambie el `label`, sigue siendo la misma columna logica porque `originType + key` es igual.

---

### 4. Si se actualiza la hoja, se deben enviar ambos campos

En `PATCH /report-values/:id` y en `PATCH /report-values/campaigns/:campaignId`:

- si cambias `sheet`, debes enviar tambien `sheetName`
- si cambias `sheetName`, debes enviar tambien `sheet`

Si se envia solo uno, el backend responde `400`.

---

### 5. Restricciones de `sheetName`

`sheetName`:

- no puede estar vacio
- maximo `31` caracteres
- no puede contener estos caracteres: `:`, `\\`, `/`, `?`, `*`, `[`, `]`

Esto sigue las reglas de nombres de hojas de Excel.

---

## Cambios en endpoints

## 1. Crear report value

### `POST /report-values`

### Body actualizado

```json
{
	"originType": "SQL",
	"key": "first_name",
	"label": "Nombre",
	"dataType": "STRING",
	"order": 0,
	"sheet": 1,
	"sheetName": "Datos Generales",
	"campaignId": 10
}
```

`sheet` y `sheetName` son opcionales al crear, pero se recomienda que frontend los envie siempre para mantener consistencia visual.

Si frontend quiere “duplicar” una columna existente a otro sheet, no hay un endpoint especial para eso.
La duplicacion se maneja desde frontend creando un nuevo `POST /report-values` con el mismo:

- `originType`
- `key`
- `dataType`

y cambiando al menos:

- `sheet`
- `sheetName`
- `order`

Opcionalmente tambien puede cambiar:

- `label`
- `format`

Las copias son independientes entre si.

---

## 2. Actualizar un report value

### `PATCH /report-values/:id`

### Ejemplo: mover columna a otra hoja

```json
{
	"sheet": 2,
	"sheetName": "Cobros",
	"order": 0
}
```

### Ejemplo invalido

```json
{
	"sheet": 2
}
```

Respuesta esperada:

- `400 Bad Request`

---

## 3. Bulk update

### `PATCH /report-values/campaigns/:campaignId`

Este endpoint es el recomendado para:

- mover columnas entre sheets
- reordenar multiples columnas dentro de una hoja
- intercambiar posiciones entre columnas
- sincronizar varios cambios de `sheet`, `sheetName` y `order` en una sola operacion

No crea duplicados nuevos. Solo actualiza filas existentes por `id`.

No se recomienda hacer estos movimientos complejos con multiples `PATCH /report-values/:id` separados, porque el frontend puede dejar estados intermedios inconsistentes entre una peticion y otra.

### Ejemplo recomendado

```json
{
	"reportValues": [
		{
			"id": 1,
			"label": "Nombre",
			"sheet": 1,
			"sheetName": "Datos Generales",
			"order": 0
		},
		{
			"id": 2,
			"label": "Apellido",
			"sheet": 1,
			"sheetName": "Datos Generales",
			"order": 1
		},
		{
			"id": 3,
			"label": "Balance",
			"sheet": 2,
			"sheetName": "Cobros",
			"order": 0
		}
	]
}
```

### Recomendacion de frontend

Cuando el usuario cambie configuracion de hojas, enviar siempre en el bulk update:

- `id`
- `sheet`
- `sheetName`
- `order`
- cualquier otro campo que tambien haya cambiado

Eso evita inconsistencias entre estado local y validaciones del backend.

Si el usuario quiere que una misma columna aparezca tambien en otro sheet, frontend debe crear una nueva fila con `POST /report-values`.
Si el usuario quiere mover una copia existente, frontend debe usar `PATCH` o `bulk update` sobre esa fila existente.

### Nota importante sobre movimientos entre sheets

Si el usuario mueve, por ejemplo, `First Name` de `sheet 1` a `sheet 2`, y al mismo tiempo hay que reajustar el `order` de otras columnas, frontend debe enviar el nuevo estado final en un solo `bulk update`.

Ejemplo:

- antes:
  - `First Name` -> `sheet: 1`, `order: 1`
  - `Balance` -> `sheet: 2`, `order: 0`
- despues:
  - `First Name` -> `sheet: 2`, `order: 1`
  - otras columnas ajustadas segun el orden final esperado

El backend ya maneja internamente los cambios de posicion para evitar conflictos temporales con el constraint unico, pero el frontend debe seguir mandando un estado final coherente.

---

## Orden de respuesta

Los listados y columnas ahora vienen ordenados por:

1. `sheet ASC`
2. `order ASC`
3. `id ASC`

Esto aplica especialmente a:

- `GET /report-values`
- `GET /report-values/columns/:campaignId`

---

## Exportacion

## CSV

### `GET /report-values/export/:contactGroupId?format=csv`

### `GET /report-values/export/campaign/:campaignId?startDate=...&endDate=...&format=csv`

Comportamiento:

- el CSV sigue siendo una sola tabla
- no crea multiples archivos ni separaciones visuales por sheet
- las columnas salen ordenadas por `sheet`, luego `order`
- si el mismo `label` aparece mas de una vez porque una columna fue duplicada entre sheets, el backend desambiguara el header como `${sheetName} - ${label}`

Frontend no necesita cambios especiales para descargar CSV.

---

## XLSX

### `GET /report-values/export/:contactGroupId?format=xlsx`

### `GET /report-values/export/campaign/:campaignId?startDate=...&endDate=...&format=xlsx`

Comportamiento:

- el archivo puede tener multiples worksheets
- cada worksheet usa el valor de `sheetName`
- las columnas incluidas en cada worksheet son las que pertenecen a ese `sheet`

Ejemplo:

Si la campaign tiene:

- columnas 1 y 2 en `sheet = 1`, `sheetName = "Datos Generales"`
- columnas 3 y 4 en `sheet = 2`, `sheetName = "Cobros"`

el `xlsx` tendra 2 tabs:

- `Datos Generales`
- `Cobros`

---

## Errores nuevos que frontend puede recibir

### 400 - Falta pareja `sheet` / `sheetName`

```json
{
	"message": "sheet and sheetName must be provided together when updating worksheet configuration"
}
```

### 400 - Mismo sheet con nombres distintos

```json
{
	"message": "Sheet 1 must use a single sheetName across the campaign"
}
```

### 400 - Nombre de hoja ya usado por otro sheet

```json
{
	"message": "sheetName \"Cobros\" is already assigned to sheet 2"
}
```

### 400 - `order` repetido dentro de una hoja

```json
{
	"message": "Another report value already uses order 0 in sheet 1"
}
```

### 400 - columna repetida dentro del mismo sheet

```json
{
	"message": "Column SQL:first_name is already configured in sheet 1"
}
```

### 400 - Nombre de hoja invalido

```json
{
	"message": "sheetName contains invalid Excel characters (:, \\, /, ?, *, [, ])"
}
```

---

## Recomendacion de UI

Para evitar errores en frontend:

1. modelar las columnas agrupadas por hoja
2. cuando el usuario cree una hoja nueva, pedir:
   - numero de hoja o generar uno automaticamente
   - nombre visible de hoja
3. cuando el usuario quiera duplicar una columna a otro sheet, crear una nueva fila con `POST /report-values`
4. cuando el usuario mueva una columna de hoja, actualizar siempre:
   - `sheet`
   - `sheetName`
   - `order`
5. evitar que el usuario repita `order` dentro del mismo `sheet`
6. evitar que el usuario duplique la misma combinacion `originType + key` dentro del mismo `sheet`

---

## Resumen operativo para frontend

- agregar `sheet` y `sheetName` al modelo local de columnas
- incluir esos campos en create/update/bulk update
- para duplicar una columna existente en otro sheet, hacer un nuevo `POST /report-values`
- en updates de hoja, enviar siempre ambos campos juntos
- mantener unicidad de `order` dentro de cada `sheet`
- mantener unicidad de `originType + key` dentro de cada `sheet`
- asumir que `xlsx` puede traer multiples tabs y `csv` no
