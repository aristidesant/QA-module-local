# Client Selector — Avatar Grid Design

## Problem

El `ClientSelectionPanel` actual usa un grid de cards rectangulares con icono genérico. Funciona bien para 2-4 clients pero no escala: con 10+ clients el scroll se vuelve tedioso y la densidad de información es baja (~5 items visibles sin scroll).

## Solution

Reemplazar el grid de cards con un **Avatar Grid** inspirado en el selector de cuentas de Google/GitHub. Cada client se representa con un avatar circular que contiene sus iniciales y un color único generado determinísticamente.

## Architecture

### Avatar Generation

- **Función**: `generateClientAvatar(client: ClientSelectOption) => { initials: string, gradient: string }`
- **Iniciales**: Primeras 2 letras del `clientName` convertidas a mayúsculas (ej: "Acme Corporation" → "AC"). Si el nombre tiene una sola letra, se usa esa letra duplicada (ej: "A" → "AA")
- **Color**: Hash determinístico del `clientId` → paleta de 12 gradientes predefinidos
- **Ubicación**: `src/utils/clientAvatar.ts`

### Layout Adaptativo

| Clients | Avatar size | Grid columns | Search visible | Roles visible |
| ------- | ----------- | ------------ | -------------- | ------------- |
| 1-4     | 72px        | 2            | No             | Sí            |
| 5-8     | 56px        | 3            | Sí             | Tooltip       |
| 9+      | 48px        | 4            | Sí             | Tooltip       |

- Threshold configurable vía prop `compactThreshold` (default 5)
- Una vez en modo denso, no regresa a modo espaciado aunque el search filtre < threshold items
- Grid usa CSS `grid-template-columns: repeat(auto-fit, minmax(..., 1fr))` para responsividad

### Component Changes

**`ClientSelectionPanel.tsx`**:

- Reemplazar `Card` grid con avatar grid
- Añadir `AvatarCircle` sub-component (inline o archivo separado)
- Mantener: search, loading skeletons, empty state, selección, keyboard nav
- Mantener: `currentClientId`, `currentClientLabel`, `currentClientTooltip` (usados por `ClientSwitcherModal`)
- Añadir: keyboard nav con flechas en todos los modos

**`ClientSelectionPanel.module.css`**:

- Nuevos estilos para `.avatarGrid`, `.avatarCircle`, `.avatarItem`
- Mantener dark mode compatibility
- Hover states sutiles (sin transform/scale para evitar layout shift)

**`ClientSelectionModal.tsx`**:

- Ajustar `size` del modal: `size={760}` para ambos modos
- Ajustar `max-height` del `ScrollArea` según modo

### Files Modified

| File                                                                       | Change                                |
| -------------------------------------------------------------------------- | ------------------------------------- |
| `src/components/ClientSelectionPanel/ClientSelectionPanel.tsx`             | Reemplazar cards con avatar grid      |
| `src/components/ClientSelectionPanel/ClientSelectionPanel.module.css`      | Nuevos estilos avatar grid            |
| `src/utils/clientAvatar.ts`                                                | Nuevo archivo: generación de avatares |
| `src/modules/auth/LoginForm/ClientSelectionModal/ClientSelectionModal.tsx` | Ajuste menor de modal size            |

### No Changes

- `ClientSelectOption` interface
- `ClientSelectionModal` API props (incluyendo `currentClientId`, `currentClientLabel`, `currentClientTooltip` usados por `ClientSwitcherModal`)
- Login/auth flow
- i18n keys (reutilizar existentes)
- Empty/error/loading states (solo estilos cambian)
