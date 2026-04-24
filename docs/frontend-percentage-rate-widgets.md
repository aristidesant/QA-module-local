# Frontend Changes For Percentage Rate Widgets

## Goal

Alinear el frontend con el nuevo comportamiento del backend para widgets de tasa porcentual, empezando por `is_abandoned`.

El backend ahora puede devolver tasas como porcentaje real para widgets configurados con:

1. `sourceType = DISPOSITION`
2. `aggregationType = AVG`
3. `fieldName = is_abandoned`
4. `resultType = PERCENT`

## Backend Behavior

Para métricas de tasa soportadas, el backend ahora devuelve:

1. `value` como número porcentual
2. `valueFormat` como string con `%`

Ejemplo:

```json
{
	"kind": "single_value",
	"metricKey": "is_abandoned",
	"value": 17.35,
	"valueFormat": "17.35%",
	"meta": {
		"sourceType": "DISPOSITION",
		"aggregationType": "AVG"
	}
}
```

## Important Semantic Change

Antes el frontend podia recibir algo como `0.985` y convertirlo o mostrarlo manualmente.

Ahora no debe hacerlo.

La fuente oficial es:

1. `value` ya normalizado en porcentaje
2. `valueFormat` ya formateado para mostrar

## Frontend Work Required

## 1. KPI Rendering

Cuando `valueFormat` exista, usarlo como valor de display.

Recomendacion:

1. usar `value` para calculos internos si hace falta
2. usar `valueFormat` para mostrar en cards, tablas y tooltips

Para este tipo de widget, el texto esperado es algo como:

```text
17.35%
```

## 2. Do Not Re-Scale Percentages

No volver a multiplicar por `100` en frontend.

No hacer esto:

```ts
display = `${(value * 100).toFixed(2)}%`;
```

Porque ahora `value` ya viene como `17.35`.

## 3. Comparison UI

Para widgets KPI con comparison:

1. `current.value` vendra como porcentaje numerico
2. `current.valueFormat` vendra como porcentaje string
3. `previous.value` vendra como porcentaje numerico
4. `previous.valueFormat` vendra como porcentaje string

Ejemplo esperado:

```json
{
	"current": {
		"value": 17.35,
		"valueFormat": "17.35%"
	},
	"previous": {
		"value": 22.1,
		"valueFormat": "22.10%"
	},
	"comparison": {
		"absoluteChange": -4.75,
		"percentageChange": -21.49,
		"trend": "DOWN"
	}
}
```

Notas:

1. `absoluteChange` aqui representa puntos porcentuales
2. `percentageChange` representa variacion relativa entre periodos

## 4. Widget Builder Rules

Para `is_abandoned`:

### Count widget

Cantidad de abandonadas:

```json
{
	"metric": {
		"sourceType": "DISPOSITION",
		"aggregationType": "COUNT",
		"fieldName": "is_abandoned",
		"resultType": "NUMBER"
	},
	"runtimeFilters": [
		{
			"field": "is_abandoned",
			"operator": "eq",
			"value": true
		}
	]
}
```

### Rate widget

Tasa de abandono:

```json
{
	"metric": {
		"sourceType": "DISPOSITION",
		"aggregationType": "AVG",
		"fieldName": "is_abandoned",
		"resultType": "PERCENT"
	}
}
```

### Important

No agregar este filtro en el widget de tasa:

```json
{
	"field": "is_abandoned",
	"operator": "eq",
	"value": true
}
```

Si el frontend lo agrega, rompe el denominador y la tasa deja de ser real.

## 5. Metric Catalog / Builder UI

El builder ahora debe interpretar `is_abandoned` asi:

1. `COUNT` = cantidad
2. `AVG` = tasa porcentual
3. `resultType = PERCENT` = mostrar como porcentaje

Si hay textos auxiliares en UI, sugerencia:

1. `COUNT`: `Numero de llamadas abandonadas`
2. `AVG`: `Porcentaje de llamadas abandonadas`

## 6. Formatting Rules In Frontend

Regla recomendada:

1. si `valueFormat` viene informado, usarlo para display
2. si no viene, aplicar el formateo actual del frontend

Esto evita que el frontend tenga que adivinar si una metrica es tiempo, porcentaje o entero.

## 7. What Frontend Should Not Assume

No asumir esto:

1. que `AVG` siempre devuelve decimal plano
2. que una tasa llega como `0.17`
3. que hay que multiplicar por `100`
4. que `COUNT(is_abandoned)` es porcentaje

La fuente oficial para display es:

1. `valueFormat`

La fuente oficial para calculos es:

1. `value`

## 8. Recommended QA Cases

Validar en frontend estos casos:

1. `value = 0`, `valueFormat = "0.00%"`
2. `value = 17.35`, `valueFormat = "17.35%"`
3. `value = 100`, `valueFormat = "100.00%"`
4. comparison con `DOWN`, `UP` y `FLAT`
5. builder no agrega filtro `is_abandoned = true` cuando el usuario elige `AVG`

## 9. Summary

Para widgets de tasa como `is_abandoned`:

1. backend ya devuelve porcentaje listo
2. frontend debe mostrar `valueFormat`
3. frontend no debe volver a escalar por `100`
4. `AVG` sin filtro = tasa
5. `COUNT` con filtro `true` = cantidad
