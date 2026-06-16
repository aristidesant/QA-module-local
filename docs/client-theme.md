# Client Theme - API para Frontend

Fecha: 2026-06-13
Spec interna: `docs/superpowers/specs/2026-06-13-client-theme-design.md`

## Resumen

Dos endpoints para asignar el logo y el theme a un cliente:

1. **`POST /files`** — registrar metadata del logo (subir binario a S3 por tu cuenta primero).
2. **`PATCH /clients/:id/theme`** — asignar el `logoFileId` + colores + brand name al theme del cliente.

Ambos endpoints requieren ser **super admin del master tenant**.

---

## 1. `POST /files` — registrar el logo

El backend no maneja el upload binario. Vos subís a S3 por tu cuenta y después registrás la metadata.

### Flujo

1. Subir el binario del logo a S3/Spaces (presigned URL, CLI, SDK). Eso te da:
   - `repositoryKey` (key interno, ej. `client-1/logos/acme.png`)
   - `repositoryRoute` (URL pública o pre-firmada)
2. Registrar metadata con `POST /files`.

### Request

```http
POST /files
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "name": "acme-logo",
  "mime": "image/png",
  "extension": "png",
  "repositoryKey": "client-1/logos/acme-abc123.png",
  "repositoryRoute": "https://nyc3.digitaloceanspaces.com/bucket/client-1/logos/acme-abc123.png",
  "description": "Acme Corp logo",
  "typeId": 42
}
```

### Campos del body

| Campo             | Tipo   | Requerido | Ejemplo                                     | Notas                                                                                                                           |
| ----------------- | ------ | --------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | string | sí        | `"acme-logo"`                               | Nombre legible, sin extensión.                                                                                                  |
| `mime`            | string | sí        | `"image/png"`                               | MIME type. Comunes para logos: `image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`.                                        |
| `extension`       | string | sí        | `"png"`                                     | Sin punto.                                                                                                                      |
| `repositoryKey`   | string | sí        | `"client-1/logos/acme-abc123.png"`          | Key interno en S3. Formato típico: `client-{clientId}/{path-del-FileType}/{nombre-unico}.{ext}`.                                |
| `repositoryRoute` | string | sí        | `"https://nyc3.digitaloceanspaces.com/..."` | URL pública o pre-firmada del archivo.                                                                                          |
| `description`     | string | opcional  | `"Acme Corp logo"`                          | Texto libre.                                                                                                                    |
| `typeId`          | number | sí        | `42`                                        | ID del `FileType` con `code: 'logo'`. Lo obtenés con `SELECT id FROM file_type WHERE code = 'logo' AND client_id = {clientId};` |

### Response 200

```json
{
	"id": 123,
	"name": "acme-logo",
	"mime": "image/png",
	"extension": "png",
	"repositoryKey": "client-1/logos/acme-abc123.png",
	"repositoryRoute": "https://...",
	"description": "Acme Corp logo",
	"typeId": 42,
	"userId": 1,
	"clientId": 1,
	"createdAt": "2026-06-13T...",
	"updatedAt": "2026-06-13T...",
	"type": { "...": "..." }
}
```

Guardá `id` — ese es el `logoFileId` que va en el siguiente endpoint.

### Errores

- `400 Bad Request` — campos requeridos faltantes o mal formados.
- `401 Unauthorized` — JWT inválido o expirado.
- `403 Forbidden` — no tenés permisos.
- `404 Not Found` — el `typeId` no existe para tu cliente.

---

## 2. `PATCH /clients/:id/theme` — asignar el theme

### Request

```http
PATCH /clients/1/theme
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "primaryColor": "#1A73E8",
  "secondaryColor": "#34A853",
  "logoFileId": 123,
  "brandName": "Acme Corp"
}
```

### Campos del body

| Campo            | Tipo           | Requerido | Validación                                         | Notas                                                                                 |
| ---------------- | -------------- | --------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `primaryColor`   | string         | opcional  | Hex: `#RGB`, `#RRGGBB`, o `#RRGGBBAA`              |                                                                                       |
| `secondaryColor` | string         | opcional  | Hex (mismo formato)                                |                                                                                       |
| `logoFileId`     | number \| null | opcional  | Entero ≥ 1, o `null` para limpiar                  | Debe ser un `File` existente que pertenezca al **mismo cliente** del `:id` en la URL. |
| `brandName`      | string \| null | opcional  | Max 150 chars, o `null` para limpiar               |                                                                                       |
| `...extras`      | cualquier      | opcional  | Sin validación, pero **max 20 claves y 2KB total** | Claves reservadas (`__proto__`, `constructor`, `prototype`) → 400.                    |

**Semántica: MERGE, no reemplazo.** Si mandás `{ "primaryColor": "#FF5722" }`, el theme conserva `secondaryColor`, `logoFileId`, `brandName` y extras anteriores. Para limpiar un campo, mandá `null` explícito.

### Response 200

```json
{
	"primaryColor": "#1A73E8",
	"secondaryColor": "#34A853",
	"logoFileId": 123,
	"logoUrl": "https://nyc3.digitaloceanspaces.com/bucket/client-1/logos/acme-abc123.png?X-Amz-...",
	"brandName": "Acme Corp"
}
```

`logoUrl` es una URL presigned de S3 con expiración de **24h**. Se regenera en cada response — no la caches por más de 24h.

### Errores

- `400 Bad Request` — color mal formado, `logoFileId` no numérico, `logoFileId: 0`, `logoFileId` negativo, > 20 extras, > 2KB extras, claves reservadas en extras.
- `401 Unauthorized` — JWT inválido o expirado.
- `403 Forbidden` — no sos super admin o no pertenecés al master tenant.
- `404 Not Found` — el cliente no existe, o el `logoFileId` no existe.

---

## Flujo end-to-end

```ts
// 1. Login como super admin master
const loginRes = await fetch('/auth/login', { method: 'POST', body: ... });
const { accessToken } = await loginRes.json();

// 2. Subir binario del logo a S3 (vía SDK / presigned URL propia — fuera de este backend)
const { repositoryKey, repositoryRoute } = await uploadToS3(logoBlob);

// 3. Registrar metadata
const fileRes = await fetch('/files', {
  method: 'POST',
  headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'client-logo',
    mime: logoBlob.type,
    extension: 'png',
    repositoryKey,
    repositoryRoute,
    typeId: <FileType-logo-id>,
  }),
});
const { id: logoFileId } = await fileRes.json();

// 4. Asignar al theme del cliente
await fetch(`/clients/${clientId}/theme`, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    logoFileId,
    primaryColor: '#1A73E8',
    secondaryColor: '#34A853',
    brandName: 'Acme Corp',
  }),
});
```

## Notas para el front

- `logoUrl` expira a las 24h. Si el `<img>` falla al cargar, hacé un nuevo `PATCH` (o esperá al próximo login) para regenerar la URL.
- Si el cliente no tiene theme configurado, el backend devuelve los defaults (`primaryColor: '#1A73E8'`, `secondaryColor: '#34A853'`).
- Si el `logoFileId` apunta a un archivo borrado o de otro cliente, el `logoUrl` viene `null` pero el `logoFileId` puede seguir poblado. Mostrá placeholder en ese caso.
- Para **limpiar** el logo o el brand name, mandá `null` explícito en el `PATCH`.

## Changelog

- **2026-06-13** — Versión inicial. `POST /files` + `PATCH /clients/:id/theme` para asignar logo y theme a un cliente.
