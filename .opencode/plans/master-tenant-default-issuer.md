# Plan: Master Tenant como Issuer por defecto en generación de facturas

## Context

En la pantalla de generación de facturas (`InvoiceNewPage`), los campos Issuer y Receiver se seleccionan manualmente desde dos dropdowns. El módulo de billing ya es exclusivo para usuarios del master client (`clientId === 1`), por lo que tiene sentido que el Issuer siempre sea el master tenant. Este cambio fija el Issuer al master client, lo muestra deshabilitado, y elimina un paso mental innecesario para el usuario.

## Changes

### 1. `src/modules/billing/InvoiceNewPage/InvoiceNewPage.tsx`

**Importar constante:**

- Agregar import de `MASTER_CLIENT_ID` desde `~/constants/client`

**Form initialValues:**

- Cambiar `issuerClientId: ''` a `issuerClientId: String(MASTER_CLIENT_ID)`

**Issuer Select component (línea ~268-275):**

- Agregar prop `disabled` al Select del issuer
- Agregar prop `description` con el texto de helper (i18n key: `new.form.issuerClient.description`)

**Validación:**

- Remover la validación de `issuerClientId` del objeto `validate` (línea 82). El campo siempre tendrá el valor del master client, por lo que la validación es innecesaria.

### 2. `src/locales/en/billing.json`

Agregar key de descripción bajo `new.form.issuerClient`:

```json
"issuerClient": {
  "label": "Issuer Client",
  "placeholder": "Select issuer",
  "description": "Always the master tenant"
}
```

### 3. `src/locales/es/billing.json`

Agregar key de descripción bajo `new.form.issuerClient`:

```json
"issuerClient": {
  "label": "Cliente Emisor",
  "placeholder": "Seleccionar emisor",
  "description": "Siempre el tenant principal"
}
```

## Files to modify

- `src/modules/billing/InvoiceNewPage/InvoiceNewPage.tsx`
- `src/locales/en/billing.json`
- `src/locales/es/billing.json`

## Verification

1. `npm run typecheck` para verificar que no hay errores de tipos
2. `npm run dev` y navegar a `/billing/invoices/new`
3. Verificar que:
   - El campo Issuer aparece pre-llenado con el nombre del master client
   - El campo Issuer está deshabilitado (no se puede interactuar)
   - El helper text se muestra debajo del campo
   - El summary aside muestra correctamente el issuer
   - La validación no bloquea el envío por el campo issuer
   - El Receiver sigue funcionando normalmente (selección manual)
