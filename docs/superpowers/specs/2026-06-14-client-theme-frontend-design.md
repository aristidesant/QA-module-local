# Client Theme Management - Frontend Design

Fecha: 2026-06-14
Spec del backend: `docs/client-theme.md`

## Objetivo

UI para que un **super admin del master tenant** pueda gestionar el theme (logo, colores, brand name) de cada cliente, consumiendo:

- `POST /files` — registrar metadata del logo (binario ya subido a S3 por el front).
- `PATCH /clients/:id/theme` — asignar `logoFileId` + colores + brand name.

## Decisiones de UX

- **Ubicación**: sección "Branding" dentro del `ClientForm` modal de edición, debajo de "Invoice Settings".
- **Visibilidad**: solo si `isMasterClient && isEditMode`.
- **Upload del logo**: `POST /files/upload` (multipart) — el backend recibe el binario y devuelve el `FileModel` con `id` listo para usar como `logoFileId`. El front **no** sube directo a S3.
- **Cache de `logoUrl`**: React Query con `staleTime` de 24h + retry on-error de la imagen.
- **FileType 'logo'**: se obtiene vía `useGetFileTypes` (existente) filtrado por `code === 'logo'`.

## Estructura

```
src/
├── api/
│   ├── clientApi.ts        ← patchClientTheme()
│   └── fileApi.ts          ← uploadFile() (existente) — POST /files/upload
├── queries/
│   ├── clientQueries.ts    ← useGetClientTheme(), useUpdateClientTheme()
│   └── fileQueries.ts      ← useUploadFile() (existente)
├── models/
│   └── ClientTheme.ts      ← NUEVO
├── utils/
│   └── clientTheme.ts      ← NUEVO (validaciones hex + constantes de logo)
└── modules/clients/
    ├── ClientForm/
    │   ├── ClientForm.tsx           ← integración
    │   ├── ClientForm.module.css
    │   ├── ClientThemeSection.tsx   ← NUEVO
    │   └── ClientThemeSection.module.css ← NUEVO
```

## Modelos

```ts
// src/models/ClientTheme.ts
export interface ClientThemeModel {
	primaryColor: string;
	secondaryColor: string;
	logoFileId: number | null;
	logoUrl: string | null;
	brandName: string | null;
	extras?: Record<string, unknown>;
}

export type UpdateClientThemeRequest = Partial<{
	primaryColor: string | null;
	secondaryColor: string | null;
	logoFileId: number | null;
	brandName: string | null;
}>;
```

## API

- `clientApi().patchClientTheme(id, data)` → `axios.patch('/clients/:id/theme', data)`.
- `fileApi().uploadFile(file, codeType, typeId, targetClientId?)` → `axios.post('/files/upload', multipart)`. Devuelve `FileModel` con `id` listo para usar. `targetClientId` es opcional y se usa para asociar el archivo a un cliente distinto al del usuario actual (caso: super admin del master subiendo el logo de un cliente hijo).

## Queries

- `useGetClientTheme(id, enabled)` — `queryKey: ['clientTheme', id]`, `staleTime: 24h`.
- `useUpdateClientTheme()` — invalida `['clientTheme', id]` + `['client', id]`.
- `useUploadFile()` (existente) — recibe `{ file, codeType: 'logo', typeId: <logoTypeId>, targetClientId: <clientId> }`.

## UI: ClientThemeSection

Inputs:

- `TextInput` brandName (max 150).
- `ColorInput` primaryColor + secondaryColor (con text input hex).
- `FileInput` logo con accept `image/png,jpeg,svg+xml,webp`, max 2 MB.
- Si hay logo cargado: preview `<img>` + botón "Remove".
- Al seleccionar archivo:
  1. Llama `useUploadFile({ file, codeType: 'logo', typeId: logoTypeId, targetClientId: clientId })` → `POST /files/upload`.
  2. Setea `logoFileId` en el form con el `id` de la response.

## Data flow submit

```
handleSubmit (edit + master)
  ├── useUpdateClientTheme.mutateAsync({ id, data })  // MERGE: solo campos cambiados
  └── useUpdateClient.mutateAsync({ id, data })
        ↓
  invalidates ['client', id] + ['clientTheme', id]
        ↓
  notifications.show(green) + onSuccess
```

## Validaciones (cliente)

- Hex: `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`.
- brandName: max 150.
- Logo: <= 2 MB, MIME permitido.

## Error handling

| Error                                 | UX                                                          |
| ------------------------------------- | ----------------------------------------------------------- |
| 400 validación                        | Mostrar `form.errors[field]`.                               |
| 401/403                               | Notification roja; form permanece abierto.                  |
| 404 cliente                           | Notification + cerrar modal.                                |
| Upload S3 falla                       | Notification "Couldn't upload logo"; no setea `logoFileId`. |
| `logoFileId` apunta a archivo borrado | Placeholder gris con `IconPhotoOff`.                        |

## Cache de logoUrl 24h

- `staleTime: 24 * 60 * 60 * 1000` en `useGetClientTheme`.
- `onError` del `<img>`: `refetch()` una sola vez. Si vuelve a fallar, placeholder.

## i18n (en + es)

- `form.sections.branding.{title, description}`
- `form.fields.brandName.{label, placeholder}`
- `form.fields.primaryColor.{label, description}`
- `form.fields.secondaryColor.{label, description}`
- `form.fields.logo.{label, change, remove, replace, uploading, upload, errors.*}`
- `notifications.themeUpdated.{title, message}`
- `notifications.themeUpdateFailed.{title}`

## Env vars

Ninguna. El backend maneja la subida vía `POST /files/upload`.

## Riesgos

1. **FileType 'logo'**: depende de que `useGetFileTypes` devuelva el `id` correcto para `code: 'logo'`. Si no existe, el form deshabilita el upload con mensaje "Logo file type not configured".

## Testing

No se crean tests (convención del proyecto).
