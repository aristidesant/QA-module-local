# Design System: Newtech

**Skill:** stitch-design-taste  
**Versión:** 1.0 · Abril 2026  
**Apps:** Newtech Software · Newtech Global · Newtech Teleservices

---

## Configuration — Dials

| Dial              | Level | Razonamiento                                                                                                                                       |
| ----------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Creativity**    | `7`   | Corporativo con personalidad. Layouts asimétricos, jerarquía tipográfica fuerte, marca visual de nodos como firma gráfica. No editorial artístico. |
| **Density**       | `6`   | Apps de datos — dashboards, tablas, KPIs. Espacio generoso en marketing, denso en operaciones.                                                     |
| **Variance**      | `7`   | Sin grids idénticos entre secciones. Bento asimétrico en features, splits en hero.                                                                 |
| **Motion Intent** | `6`   | Micro-interacciones fluidas. Spring physics en componentes. Sin teatralidad.                                                                       |

---

## 1. Visual Theme & Atmosphere

Un sistema construido sobre datos y confianza. La interfaz se siente como una sala de control bien iluminada — ordenada, rápida, con señales visuales que hablan antes de que el usuario las lea. El verde de los nodos del logo ancla todo: no es decorativo, es funcional — informa el estado activo, el éxito, el movimiento hacia adelante. El azul modula y complementa sin competir.

La atmósfera es **corporativa sin ser genérica**: densidad media-alta en pantallas de operaciones, aireada en portales de clientes. La varianza mantiene el interés visual entre secciones — nunca dos layouts idénticos seguidos. El motion es deliberado: los elementos cobran vida al montar, los estados activos pulsan suavemente, los datos actualizan con transiciones que confirman la acción sin distraer.

La filosofía de diseño: **cada pixel justifica su presencia**. Iconos Tabler de trazo uniforme (2 px). Superficies con bordes muy sutiles y sombras frías difusas. Tipografía geométrica que hereda la forma del wordmark.

---

## 2. Color Palette & Roles

### Superficies

- **Canvas Frost** (`#F7F8FA`) — Fondo principal de la app. Levemente frío, nunca clínico puro.
- **Pure Surface** (`#FFFFFF`) — Fill de cards, paneles, modals. Siempre acompañado de borde o sombra.
- **Sunken Base** (`#EEF0F3`) — Inputs inactivos, headers de tabla, zonas de bajo énfasis.
- **Whisper Border** (`rgba(221, 226, 232, 0.7)`) — Líneas estructurales de 1 px. Semi-transparente para profundidad.
- **Diffused Shadow** (`rgba(15, 23, 42, 0.06)`) — Elevación difusa. Spread 40 px, offset −15 px. Nunca dura.

### Texto

- **Ink Primary** (`#141A22`) — Texto principal. Ink-900 — nunca negro puro.
- **Steel Secondary** (`#4B5563`) — Cuerpo, descripciones, metadatos. Ink-600.
- **Muted Slate** (`#6B7684`) — Labels de tabla, timestamps, texto terciario. Ink-500.

### Brand (acento único — verde como primario)

- **Newtech Green** (`#1BB54A`) — CTA primario, estado activo, éxito, progreso. El único acento dominante.
- **Green Hover** (`#11933B`) — Estado hover/pressed sobre primario.
- **Green Soft** (`#ECFDF2`) — Fondo suave para badges, estados activos en nav, highlight de fila seleccionada.
- **Green Dark** (`#0D7530`) — Texto sobre fondos verdes suaves, accesibilidad AA garantizada.

### Accent (azul — rol secundario y de información)

- **Newtech Blue** (`#0098D4`) — Links, badges informativos, gráficas secundarias, iconos de acción neutros.
- **Blue Soft** (`#ECF8FD`) — Fondo suave para badges info, alertas informativas.
- **Blue Dark** (`#007AAE`) — Hover sobre elementos azules.

### Semánticos

- **Success** (`#1BB54A` sobre `#ECFDF2`) — Estado pagado, activo, dentro del SLA.
- **Info** (`#0098D4` sobre `#ECF8FD`) — Estado en curso, informativo.
- **Warning** (`#F59E0B` sobre `#FEF3C7`) — Requiere revisión, próximo a vencer.
- **Danger** (`#E53935` sobre `#FEE2E2`) — Error, vencido, crítico.

### Dark Surface (Teleservices / modo oscuro de sección)

- **Dark Canvas** (`#0B0F14`) — Fondo oscuro principal. Ink-950.
- **Dark Card** (`#141A22`) — Cards sobre fondo oscuro. Ink-900.
- **Dark Card Elevated** (`#1F2731`) — Cards con elevación visual (SectionCard, modals). Más claro que Dark Card para distinguir del fondo.
- **Dark Border** (`#232C38`) — Bordes en tema oscuro.
- **Dark Text Primary** (`#FFFFFF`) — Texto sobre oscuro.
- **Dark Text Secondary** (`#B8C0CC`) — Texto secundario sobre oscuro.

### Colores Prohibidos

- Gradientes neón o violeta — el "AI Purple" está estrictamente prohibido.
- Negro puro (`#000000`) — siempre Off-Black (Ink-900/950).
- Acentos con saturación > 80%.
- Mezclar grises cálidos y fríos en el mismo producto.

---

## 3. Typography Rules

- **Display / Headlines:** `DM Sans` — Track-tight (`−0.03em` en display, `−0.02em` en h1–h2), escala fluida vía `clamp()`, peso 700–800. Jerarquía por peso y color, no por tamaño descomunal. Leading comprimido en display (`1.05`), relajado en cuerpo.
- **Body:** `DM Sans` weight 400–500 — Leading `1.55`, max `65ch` por línea, color Steel Secondary (`#4B5563`). Nunca menor de `14px`.
- **Mono:** `JetBrains Mono` — Para código, tokens, timestamps, IDs de factura, datos tabulares de alta densidad. Cuando la densidad supera Level 7, todos los números numéricos cambian a monospace.
- **Scale:**
  - Display XL: `clamp(40px, 5vw, 60px)` / weight 700 / leading 1.02
  - H1: `32px` / weight 700 / leading 1.2
  - H2: `24px` / weight 700 / leading 1.25
  - H3: `20px` / weight 600 / leading 1.3
  - Body LG: `18px` / weight 400 / leading 1.55
  - Body: `15px` / weight 400 / leading 1.55
  - Body SM: `14px` / weight 400 / leading 1.55
  - Caption / Label: `12px` / weight 600 / leading 1.35 / `letter-spacing: 0.06em` / uppercase

### Fuentes Prohibidas

- `Inter` — prohibida en todos los contextos de esta marca.
- Fuentes serif genéricas (`Times New Roman`, `Georgia`, `Garamond`) — PROHIBIDAS en todas las apps. Son interfaces de software; el serif no existe aquí.
- `Arial`, `Roboto`, `system-ui` como fuente primaria visible — usar DM Sans siempre como fallback explícito.

---

## 4. Component Stylings

### Botones

- **Primario:** Fill `#1BB54A`, texto blanco, `border-radius: 8px`, `padding: 10px 16px`, `font-weight: 600`, `font-size: 14px`. Hover: `#11933B`. Active: `translateY(1px)` o `scale(0.98)` — feedback táctil. Sin glow exterior. Sin cursor custom.
- **Secundario (azul):** Fill `#0098D4`, texto blanco. Hover: `#007AAE`.
- **Outline:** Borde `#C3CAD4` 1 px, fondo transparente, texto `Ink-900`. Hover: fondo `#EEF0F3`.
- **Ghost:** Sin borde ni fondo. Texto `Steel-600`. Hover: fondo `#EEF0F3`.
- **Destructivo:** Fill `#E53935`. Hover: `#C62A27`.
- **Tamaños:** `sm` (6/12 px, radius 6), `base` (10/16 px, radius 8), `lg` (14/22 px, radius 12).
- **Icono:** `padding: 10px`, dimensión cuadrada fija (`40px` base, `32px` sm).
- **Disabled:** `opacity: 0.5`, `cursor: not-allowed`, sin hover.
- **Focus ring:** `0 0 0 4px rgba(27,181,74,0.22)` — verde, nunca azul browser default.

### Cards / Contenedores

- `border-radius: 12px`, `border: 1px solid rgba(221,226,232,0.7)`, `background: #FFFFFF`, `box-shadow: 0 4px 12px rgba(15,23,42,0.06)`.
- Padding interno `24px`.
- Elevación solo cuando comunica jerarquía real. En pantallas de alta densidad (tablas, listas densas) reemplazar cards con divisores `border-top` o espacio negativo.
- **Nunca** anidar cards dentro de cards.

### Inputs / Formularios

- `border: 1px solid #DDE2E8`, `border-radius: 8px`, `padding: 10px 12px`, `font-size: 14px`, `background: #FFFFFF`.
- Focus: `border-color: #1BB54A`, `box-shadow: 0 0 0 4px rgba(27,181,74,0.22)`.
- Error: `border-color: #E53935`, `box-shadow: 0 0 0 4px rgba(229,57,53,0.18)`.
- Label encima del input, `font-size: 13px`, `font-weight: 600`. Sin labels flotantes.
- Helper text opcional debajo en `#6B7684`. Error text debajo en `#E53935`. Gap `6px` entre label–input–helper.
- Input group con icono: icono Tabler 18 px posicionado absolutamente a la izquierda (`left: 12px`), `padding-left: 38px` en el input.

### Navegación (Sidebar)

- Ancho `240px`, fondo `#FFFFFF`, borde derecho `1px #DDE2E8`.
- Items: `padding: 9px 12px`, `border-radius: 8px`, `margin: 1px 8px`, `font-size: 14px`, `font-weight: 500`.
- Activo: fondo `#ECFDF2`, texto `#0D7530`, `font-weight: 600`.
- Hover: fondo `#EEF0F3`, texto `#141A22`.
- Section labels: `font-size: 11px`, uppercase, `letter-spacing: 0.08em`, color `#6B7684`, `padding: 14px 12px 4px`.
- Counters/badges en items: fondo `#EEF0F3`, texto `#6B7684`, radius full, `font-size: 12px`.

### Badges / Tags

- `border-radius: 999px`, `padding: 2px 8px`, `font-size: 12px`, `font-weight: 600`, `line-height: 18px`.
- Variantes con fondo suave y texto oscuro correspondiente (nunca texto blanco sobre color saturado en badge pequeño).
- Dot indicator: pseudo-elemento `6px` de color `currentColor` antes del label.

### Alertas

- `border-radius: 8px`, `padding: 14px 16px`, `border: 1px solid [color-200]`, fondo `[color-50]`.
- Icono Tabler `20px` a la izquierda, alineado `flex-start`.
- Título: `font-weight: 600`, `14px`. Cuerpo: `13px`, color semántico oscuro.

### Tablas

- `border-collapse: separate`, `border-spacing: 0`.
- Headers: `font-size: 12px`, uppercase, `letter-spacing: 0.04em`, `font-weight: 600`, color `#6B7684`, fondo `#EEF0F3`.
- Celdas: `padding: 12px 16px`, `border-bottom: 1px solid #DDE2E8`.
- Hover de fila: fondo `#F7F8FA`.
- Checkboxes en primera columna para selección múltiple.

### Progress

- Track: `#EEF0F3`, altura `8px`, radius full.
- Fill: gradiente `linear-gradient(90deg, #1BB54A, #0098D4)`. Nunca color plano en la barra.

### Loaders

- Shimmer esquelético que replica exactamente la forma y dimensiones del contenido real.
- Nunca spinners circulares genéricos.
- Animación: `background: linear-gradient(90deg, #EEF0F3 25%, #DDE2E8 50%, #EEF0F3 75%)`, `background-size: 200%`, `animation: shimmer 1.5s infinite`.

### Empty States

- Composición ilustrada con icono Tabler grande (48–64 px, color `#C3CAD4`) + título descriptivo + texto guía de acción.
- Nunca solo "Sin datos" o "No hay registros".

---

## 5. Hero Section

- **Layout asimétrico obligatorio** — Split Screen: columna izquierda copy (55%), columna derecha preview visual (45%). Centrado prohibido a este nivel de varianza.
- **Preview ventana de app:** Mockup de la interfaz real (browser/app chrome) en perspectiva sutil `perspective(1400px) rotateY(−4deg) rotateX(4deg)`. Sombra dramática fría difusa.
- **Eyebrow:** Pill badge pequeño con dots de color de marca + texto descriptivo. No emojis.
- **Headline:** DM Sans weight 700, `clamp(40px, 5vw, 60px)`, tracking `−0.03em`. Palabra o frase clave con gradiente `linear-gradient(90deg, #1BB54A, #0098D4)` recortado a texto. Uso restringido — máximo una frase, no headers completos.
- **Lead:** `18px`, color `#4B5563`, máximo `520px` de ancho, `line-height: 1.55`.
- **CTA:** Máximo un botón primario verde. Un botón outline como máximo. Sin "Saber más" redundante.
- **Stats row:** Grid 4 columnas en card integrada. `font-size: 28px`, `font-weight: 700`, labels uppercase `12px`. Datos reales únicamente — sin números fabricados.
- **Apps row:** Fila inferior con las tres apps. Dot animado de identidad visual por producto.

---

## 6. Layout Principles

- **CSS Grid para estructura.** Flexbox solo para alineación dentro de componentes pequeños. `calc(33% - 1rem)` está PROHIBIDO.
- **Sin elementos superpuestos.** Cada elemento ocupa su propio grid cell o posición de flujo. Sin `z-index` para apilar contenido sobre contenido (solo para Navbar, Modal, Overlay).
- **El grid de 3 cards iguales horizontales está PROHIBIDO.** Usar Bento asimétrico (2fr 1fr), Zig-Zag 2 columnas, o scroll horizontal para features.
- **Containment:** `max-width: 1240px` centrado. Padding `32px` desktop, `24px` tablet, `16px` mobile.
- **Full-height:** Siempre `min-height: 100dvh`. Nunca `height: 100vh`.
- **Dark sections:** Las pantallas de operaciones (Teleservices) usan el dark surface. Transición entre temas a nivel de sección, no de página completa. Clase `.nt-dark` sobre el contenedor raíz de la sección.
- **Bento para dashboards:** Row 1: 4 KPI cards iguales. Row 2: gráfica principal (2fr) + panel lateral (1fr). Row 3: tabla full-width. Nunca invertir esta jerarquía.

---

## 7. Responsive Rules

- **Mobile-first collapse (< 768 px):** Todo grid multi-columna colapsa a columna única. `width: 100%`, `padding: 16px`, `gap: 16px`. Sin excepciones.
- **Sin scroll horizontal.** Overflow horizontal en mobile es un fallo crítico.
- **Typography scaling:** Headlines via `clamp()`. Body mínimo `14px`. Nunca comprimir body.
- **Touch targets:** Mínimo `44px` de altura para todos los elementos interactivos. Botones a ancho completo en mobile.
- **Sidebar:** En mobile, colapsa a bottom navigation bar de 5 items o drawer lateral. Nunca sidebar fija en pantallas < 768 px.
- **Tablas:** En mobile, scroll horizontal contenido dentro de un wrapper `overflow-x: auto`. Nunca tabla rota.
- **Spacing:** Gaps de sección: `clamp(3rem, 8vw, 6rem)`.
- **Viewports a verificar:** 375 px (iPhone SE), 390 px (iPhone 14), 768 px (iPad), 1024 px (laptop), 1440 px (desktop).

---

## 8. Motion & Interaction

> Stitch genera pantallas estáticas. Esta sección documenta el **comportamiento de motion previsto** para el agente de código (Antigravity, Cursor, Claude Code) que implemente el diseño exportado en producto vivo.

- **Spring physics:** `stiffness: 100, damping: 20` en todos los elementos interactivos. Sin `linear` easing en ningún lugar.
- **Micro-loops perpetuos:** Dots de estado activo → `pulse` suave 2 s infinite. Barras de progreso al montar → fill animado desde 0. Shimmer en loaders → infinite. Status indicators en Teleservices → blink lento.
- **Staggered mount:** Listas, grids de KPI y tablas montan con `animation-delay: calc(var(--index) * 60ms)`. Waterfall reveal, nunca mount instantáneo.
- **Hover states:** Botones con `translateY(−1px)` en hover, `translateY(1px)` en active. Cards con `translateY(−2px)` y sombra ligeramente mayor. Duración `120ms`, `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Focus transitions:** `box-shadow` con ring verde aparece en `120ms ease-out`.
- **Performance:** Animar EXCLUSIVAMENTE `transform` y `opacity`. Nunca `top`, `left`, `width`, `height`, `background-color` directamente. Filtros grain/noise solo en pseudo-elementos fijos con `pointer-events: none`.
- **Variables de timing:**
  - `--dur-fast: 120ms` — hover, focus, press
  - `--dur-med: 220ms` — modals open, tab switch
  - `--dur-slow: 380ms` — page transitions, mount de secciones

---

## 9. Anti-Patterns (Prohibidos)

- Sin emojis — en ninguna parte de la UI, código o alt text
- Sin `Inter` — usar `DM Sans` siempre
- Sin fuentes serif genéricas (`Times New Roman`, `Georgia`, `Garamond`) — estas son apps de software
- Sin negro puro (`#000000`) — siempre Ink-900 (`#141A22`) o Ink-950 (`#0B0F14`)
- Sin glows neón ni `box-shadow` con color saturado exterior
- Sin acentos de saturación > 80%
- Sin gradientes de texto en headers completos — solo en una o dos palabras clave como máximo
- Sin cursores custom
- Sin elementos superpuestos — texto nunca encima de imágenes ni de otro texto
- Sin grid de 3 cards iguales horizontales — Bento asimétrico siempre
- Sin Hero centrado (a este nivel de varianza)
- Sin filler UI: "Scroll para explorar", "Desliza hacia abajo", flechas de scroll, chevrons rebotando — PROHIBIDOS
- Sin nombres genéricos: "Juan García", "Acme Corp", "SmartFlow", "Nexus"
- Sin números redondos fabricados: `99.99%`, `50%` — usar datos orgánicos o placeholders `[métrica]`
- Sin datos inventados — métricas de uptime, tiempos de respuesta, conteos — si no los provee el usuario, usar `[dato]`
- Sin secciones de "estadísticas del sistema" rellenas con datos inventados
- Sin formato `LABEL // AÑO` — "SISTEMA // 2025" es una convención lazy de IA, no diseño tipográfico
- Sin copywriting de IA: "Potencia", "Seamless", "Revoluciona", "Next-Gen", "De clase mundial"
- Sin links rotos de Unsplash — usar `picsum.photos/seed/{id}/800/600` o avatars SVG
- Sin `z-index` masivo — solo Navbar (10), Modal (100), Overlay (90)
- Sin `height: 100vh` — siempre `min-height: 100dvh`
- Sin spinners circulares genéricos — shimmer esquelético siempre
- Sin cards anidadas dentro de cards
- Sin importar el tema oscuro como "modo alternativo" visible — las secciones dark son componentes del sistema, no una preferencia de usuario

---

## 10. Icon Usage (Tabler Icons)

- **Librería:** `@tabler/icons` — 5 880+ iconos, stroke `2px`, `stroke-linecap: round`, `stroke-linejoin: round`.
- **Tamaños por contexto:**
  - `16px` — Inline con texto body, dentro de badges
  - `18–20px` — Dentro de botones, inputs
  - `22–24px` — Headers de sección, títulos de card
  - `32–48px` — Empty states, onboarding
- **Color:** Siempre heredado vía CSS `color`. Nunca hardcodeado en el SVG.
- **Sin iconos decorativos vacíos** — cada icono debe comunicar algo. Preferir texto cuando el icono no agrega claridad.
- **Consistencia de peso:** No mezclar iconos de distintas librerías. Tabler exclusivamente.

---

## 11. Firma Visual de Marca (Nodos)

El patrón de nodos del logo (círculos verdes y azules en posiciones irregulares conectando un grafo implícito) es la **firma gráfica de Newtech**. Puede aparecer como:

- Logotipo completo (marca + wordmark)
- Background texture sutil en headers de sección oscura (opacidad 4–6%)
- Ilustración escalada en empty states o pantallas de carga
- Elemento gráfico en materiales de marketing

**Reglas:**

- Verde (`#1BB54A`) para nodos de datos/conexión periférica
- Azul (`#0098D4`) para nodos centrales/hub
- Nunca deformar, rotar el logotipo, ni cambiar los colores de los nodos
- Área de respeto mínima equivalente a una 'n' del wordmark en todos los lados
- Nunca colocar sobre fondos de bajo contraste sin probar accesibilidad

---

_Generado con el skill `stitch-design-taste` aplicado al sistema de diseño Newtech · v1.0_
