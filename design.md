# Sangar Studio OS — Sistema de Diseño (`design.md`)

Documento de referencia visual y de componentes de **Sangar Studio OS** (CRM, Facturación, Proyectos y Content Planner), extraído directamente del sistema CSS (`public/assets/app.css`), las plantillas (`src/View/layout.php`, `src/View/layout_public.php`) y los módulos de producto.

---

## 1. Filosofía y Dirección Visual

- **Concepto:** Estética editorial cálida y minimalista (*Warm Studio OS*) que combina superficies *off-white* cálidas, negros carbón orgánicos y un único acento coral vibrante.
- **Tono:** Profesional, táctil, cercano y de alta legibilidad. Evita los grises azulados fríos genéricos y las tablas densas tradicionales cuando pueden resolverse con tarjetas, cápsulas o tableros Kanban.
- **Dualidad del sistema:**
  - **Interfaz interna (App Shell):** Sidebar oscuro fijo (`#191716`) estilo *CRM Fusion / Intelly*, barra superior translúcida con desenfoque (`backdrop-filter: blur(12px)`), tarjetas con bordes suaves (`16px`–`24px`) y soporte completo de modo claro/oscuro.
  - **Documentos para cliente (Presupuesto público / PDF / Membrete):** Sobriedad tipográfica. El PDF oficial (`PdfService`) es estrictamente **blanco y negro**; el visor interactivo (`membrete.css`) ofrece tres estilos editoriales (*Papel*, *Bloque* y *Terminal*).

---

## 2. Identidad de Marca y Activos

| Activo | Ruta | Uso |
| :--- | :--- | :--- |
| Isotipos `S` negro / blanco | `public/assets/logos/sangar-s-negro.svg`, `sangar-s-blanco.svg` | Logotipo en sidebar (`30×30px` / `32×32px`, `border-radius: 8px`). En modo oscuro se invierte con `filter: brightness(0) invert(1)`. |
| Lockup completo | `public/assets/logos/sangar-lockup-negro.svg` | Pantalla de acceso (`/login`, `48×48px`, `border-radius: 12px`). |
| Logo de documentos PDF | `src/Logo/logo_sangar_studio_black.svg` | Fallback para facturas y presupuestos PDF si no hay `public/uploads/logo_agencia.*`. |
| Iconografía UI | Lucide (`lucide@0.460.0` CDN) | `<i data-lucide="nombre"></i>`. Tamaños estándar: `18px` en nav/botones, `16px`–`17px` en utilidades, `14px` en enlaces de tarjeta, `20px` en acciones rápidas. |

---

## 3. Paleta de Color (Tokens CSS `--sg-*`)

**Regla estricta:** Usar siempre las variables CSS definidas en `:root` de `public/assets/app.css`. No introducir colores hexadecimales sueltos en vistas nuevas.

### 3.1 Neutros y Superficies

| Token | Modo Claro (`:root`) | Modo Oscuro (`[data-theme="dark"]`) | Uso principal |
| :--- | :--- | :--- | :--- |
| `--sg-negro` | `#191716` | `#F0ECE8` | Texto principal, botones secundarios, filtros activos |
| `--sg-negro-soft` | `#292625` | `#D0C8C0` | Hover de botones secundarios |
| `--sg-blanco` | `#FFFFFF` | `#0F0E0D` | Texto sobre botones sólidos / contraste inverso |
| `--sg-gris-80` | `#4A4644` | `#A09890` | Texto de cuerpo secundario e iconos de utilidad |
| `--sg-gris-55` | `#87817D` | `#88807A` | Subtítulos, etiquetas de campo, metadatos (`--sg-text-muted`) |
| `--sg-gris-30` | `#C5BDB7` | `#484440` | Bordes de inputs, placeholders, hover de bordes |
| `--sg-gris-12` | `#EBE5E0` | `#2A2724` | Divisores, bordes de tarjetas y paneles, fondo de badges neutros |
| `--sg-bg-app` (`--sg-bg`) | `#FCFAFB` | `#131211` | Lienzo general de la aplicación |
| `--sg-bg-panel` (`--sg-bg-card`) | `#FFFFFF` | `#1A1816` | Superficie de tarjetas, modales y paneles |
| `--sg-bg-hover` | `#F5F1EE` | `#242220` | Fondo de filas interactivas, columnas Kanban y hover |
| `--sg-bg-blur` | `rgba(252, 250, 251, 0.85)` | `rgba(19, 18, 17, 0.85)` | Topbar fija con `backdrop-filter: blur(12px)` |

### 3.2 Acento de Marca y Estados Semánticos

| Token | Modo Claro | Modo Oscuro | Fondo suave (`*-bg` / `*-light`) | Uso |
| :--- | :--- | :--- | :--- | :--- |
| `--sg-coral` (`--sg-primario`) | `#FF7E67` | `#FF8E7A` | `rgba(255, 126, 103, 0.12)` (dark `0.15`) | CTA primario, elemento activo, foco, selección |
| `--sg-coral-hover` | `#F2664D` | `#FF9E8A` | — | Hover sobre botones primarios |
| `--sg-success` | `#4BA373` | `#5DBF8A` | `rgba(75, 163, 115, 0.12)` (dark `0.15`) | Pagado, aceptado, completado, toast éxito |
| `--sg-warning` | `#E89A3E` | `#F0AD55` | `rgba(232, 154, 62, 0.12)` (dark `0.15`) | Pendiente, revisión, prioridad media, tareas vencidas |
| `--sg-danger` (`--sg-rojo`) | `#D15858` | `#E06B6B` | `rgba(209, 88, 88, 0.12)` (dark `0.15`) | Vencido, rechazado, anulado, prioridad alta, eliminar |
| `--sg-info` | `#5887D1` | `#6B9AE0` | `rgba(88, 135, 209, 0.12)` (dark `0.15`) | Emitida, enviada, en progreso |

### 3.3 Acentos Suaves de Métricas (CRM Fusion & Dashboard Intelly)

- **Iconos de KPI (`.sg-metric-card`):**
  - `--sg-accent-lime` (`rgba(255, 126, 103, 0.14)` / texto `#D95B43`; dark `#FF9E8A`)
  - `--sg-accent-lavender` (`#EFE6FF` / texto `#6D28D9`; dark `rgba(139, 92, 246, 0.18)` / `#C4B5FD`)
  - `--sg-accent-blue` (`#E3F0FF` / texto `#2563EB`; dark `rgba(107, 154, 224, 0.18)` / `#93C5FD`)
  - `--sg-accent-yellow` (`#FFF1C9` / texto `#B45309`; dark `rgba(240, 173, 85, 0.18)` / `#FCD34D`)
- **Tarjetas Hero del Dashboard (`.sg-intelly-card` en `src/View/dashboard.php`):**
  - `--amber`: fondo `#F0A26A`, texto `#2D1404`
  - `--coral`: fondo `#FF7E67`, texto `#FFFFFF`
  - `--black`: fondo `#191716`, texto `#FFFFFF`
  - `--sand`: fondo `#EDE7DE` (dark `#2A2624`), texto `#191716` (dark `#FCFAFB`)

### 3.4 Modo Oscuro

Se activa automáticamente vía `@media (prefers-color-scheme: dark)` (si no hay `data-theme="light"`) o de forma manual con `data-theme="dark"` en `<html>`, persistido en `localStorage.getItem('sg-theme')`.

---

## 4. Tipografía

Las fuentes corporativas se sirven localmente desde `public/assets/fonts/` con `font-display: swap`:

| Rol | Token | Familia y archivos | Pesos |
| :--- | :--- | :--- | :--- |
| **Titulares y cifras** | `--sg-titular` | `'Stinger Fit Light', 'Arial', sans-serif` (`StingerFit-Light.ttf`) | `300` (declarado) / `700`–`800` en clases de titular |
| **Cuerpo e interfaz** | `--sg-texto` | `'Raleway', 'Calibri', 'Arial', sans-serif` (`Raleway-Regular.ttf`, `Raleway-SemiBold.ttf`, `Raleway-Bold.ttf`) | `400`, `600`, `700` |
| **Atajos / código** | — | `ui-monospace, SFMono-Regular, Menlo, monospace` | `700` (`.sg-kbd`) |

### Escala Tipográfica

- **Base:** `html { font-size: 16px }`, `body { line-height: 1.6 }`, suavizado `-webkit-font-smoothing: antialiased`.
- **KPI / Métrica Hero:** `36px` (`.sg-kpi__val`) o `32px` (`.sg-metric-card__value`), `letter-spacing: -0.03em`, `line-height: 1`.
- **Saludo / Workspace Title:** `32px`–`34px`, `letter-spacing: -0.02em` / `-0.03em`.
- **Topbar Title / Greeting:** `20px`–`24px` (`18px` en móvil).
- **Título de sección / tarjeta:** `18px`–`20px` (`16px` en móvil).
- **Cuerpo / Inputs:** `14px`–`15px` (`line-height: 1.5`–`1.6`).
- **Metadatos y microetiquetas:** `11px`–`13px`; etiquetas de sección/tabla en mayúsculas con `font-size: 10.5px`–`11px`, `font-weight: 700`, `letter-spacing: 0.04em`–`0.08em`.

---

## 5. Layout, Espaciado, Radios y Sombras

### 5.1 Tokens Estructurales

| Categoría | Tokens y Valores |
| :--- | :--- |
| **Shell** | `--sg-sidebar-w: 248px` (en `layout.php` sobrescrito a `240px`), `--sg-sidebar-collapsed-w: 76px`, `--sg-topbar-h: 72px` (`56px` en `<= 992px`), `.sg-content` `max-width: 1400px` |
| **Espaciado** | `--sg-gap: 24px` (`16px` móvil), `--sg-gap-s: 16px` (`12px` móvil), `--sg-space-page: 24px`, `--sg-space-section: 20px`, `--sg-space-card: 16px`, `--sg-space-compact: 8px` |
| **Radios** | `--sg-radius-sm: 10px` (inputs, botones compactos, tiles), `--sg-radius: 16px` (tarjetas, popovers), `--sg-radius-lg: 24px` (headers workspace, login box), `999px` (pills, badges, filas cápsula, nav activa en `layout.php`) |
| **Sombras (Claro)** | `--sg-shadow-sm: 0 4px 12px rgba(25, 23, 22, 0.04)`<br>`--sg-shadow-md: 0 8px 24px rgba(25, 23, 22, 0.08)`<br>`--sg-shadow-lg: 0 16px 48px rgba(25, 23, 22, 0.12)` |
| **Sombras (Oscuro)** | `--sg-shadow-sm: 0 4px 12px rgba(0,0,0,0.25)`, `--sg-shadow-md: 0 8px 24px rgba(0,0,0,0.35)`, `--sg-shadow-lg: 0 16px 48px rgba(0,0,0,0.45)` |

### 5.2 Sistemas de Grid y Breakpoints

- **Grid de tarjetas:** `.sg-grid` (`repeat(auto-fill, minmax(320px, 1fr))`, `gap: var(--sg-gap)`).
- **Dashboard Fusion:** `.sg-fusion-grid` de `12` columnas (`.sg-col-12` a `.sg-col-3`), que colapsa a `8` columnas en `<= 1180px` y `4` columnas en `<= 768px`.
- **Vista de detalle:** `.sg-detail-layout` (`1fr 320px`), pasa a `1fr` en `<= 992px`.
- **Breakpoints principales:**
  - `1180px` / `1120px` / `1100px`: colapso de grids multi-columna del dashboard y workspace de leads.
  - `992px`: sidebar pasa a drawer deslizante (`translate3d(-100%, 0, 0)` con `.sg-sidebar-overlay`), topbar compacta, formularios `.sg-form__row` a 1 columna.
  - `768px`: tablas `.sg-detail-table` y líneas de formulario `.sg-linea` pasan a diseño apilado; búsqueda global salta a fila completa.
  - `560px` / `480px` / `400px`: grids de métricas y acciones en `1fr`.

---

## 6. Arquitectura del Shell (`src/View/layout.php`)

1. **Sidebar Oscuro (`#191716`):**
   - Cabecera con logo + marca `Sangar OS` + botón colapsar (`#btn-sidebar-collapse`, guarda estado en `localStorage` `sg-sidebar-collapsed`).
   - *Workspace Switcher* (`.sg-workspace-switcher`) enlazado a `/clientes`.
   - Dos secciones de navegación fija:
     - **Comercial & CRM:** Inicio, Leads (con contador), Empresas, Contactos, Oportunidades (con contador), Tareas (con badge `--warn` para vencidas), Calendario, Informes.
     - **Facturación & Estudio:** Facturas, Gastos, Catálogo, Biblioteca.
   - Footer con Configuración, Centro de ayuda (`openCmd()`), tarjeta de perfil (`.sg-profile-card`) y cierre de sesión.
   - En estado activo (`.sg-nav__item.is-active`), la píldora toma fondo `--sg-coral` `#FF7E67` y texto blanco.
2. **Topbar Fija (`.sg-topbar--fusion`):**
   - Izquierda: botón menú móvil + saludo contextual según hora del día (`Buenos días / tardes / noches`) o título de página.
   - Centro: disparador de Command Palette (`.sg-global-search`, `⌘K` / `Ctrl+K`).
   - Derecha: acciones rápidas globales (*Nuevo lead*, *Nueva tarea*), botón de notificaciones con popover (`.sg-popover-panel`, estado leído en `localStorage` `sg-read-notifs`), selector de tema (`.sg-theme-toggle`) y píldora de perfil.
3. **Paleta de Comandos (`#cmd-palette`):** Modal centrado (`max-width: 600px`) con filtros por ámbito (`all`, `commands`, `leads`, `companies`, `contacts`, `deals`, `tasks`), navegación por teclado (`ArrowUp`, `ArrowDown`, `Enter`, `ESC`) y acciones directas.
4. **Layout Público (`src/View/layout_public.php`):** Contenedor centrado `max-width: 800px` en tema claro forzado (`data-theme="light"`), usado para aceptación pública de presupuestos (`/p/{token}`).

---

## 7. Catálogo de Componentes

- **Botones (`.sg-btn`):** Altura `44px`, `padding: 0 20px`, `border-radius: 12px`, `font-weight: 600`.
  - Variantes: `--primary` (coral + sombra coral), `--secondary` (`--sg-negro`), `--outline` (borde `--sg-gris-30`), `--ghost` (transparente).
  - Modificadores: `--sm` (`32px`, `border-radius: 8px`), `--icon` (`44×44px`).
  - Microinteracción: `:active { transform: scale(0.97) }`, hover eleva `-1px`.
- **Badges y Chips (`.sg-badge`, `.sg-priority-chip`):** `height: 24px`, `border-radius: 12px`, `11px` uppercase bold. Variantes `--success`, `--warning`, `--danger`, `--info`, `--neutral`, `--coral` (más aliases heredados `--borrador`, `--emitida`, `--aceptado`, `--pagada`, `--vencida`, etc.).
- **Tarjetas (`.sg-card-item`, `.sg-card`, `.sg-fusion-card`):** Fondo `--sg-bg-panel`, borde `1px solid var(--sg-gris-12)`, `border-radius: var(--sg-radius)`. `.sg-card-item` incluye header, body, footer con divisor superior e importe en `--sg-titular`; en hover sube `-4px` con `--sg-shadow-md` y borde `--sg-coral-light`.
- **Tableros Kanban y Calendario (`.sg-kanban`, `.sg-pipeline-stages`, `.sg-cal-grid`):**
  - Columnas Kanban (`300px`–`320px` con `scroll-snap-type: x mandatory` en Proyectos y Contenidos; grid de 5 columnas en Pipeline).
  - Borde superior de color por estado (p. ej. `#8b5cf6` Planificación, `#3b82f6` En Progreso, `#f59e0b` Revisión, `#10b981` Completado).
- **Formularios (`.sg-form`, `.sg-input`, `.sg-select`, `.sg-textarea`):** Borde `1px solid var(--sg-gris-30)`, `border-radius: 10px`, `padding: 12px 16px`. Foco con anillo `0 0 0 3px var(--sg-coral-light)` y validación nativa `:user-invalid` / `:user-valid`. Líneas de factura/presupuesto en grid de 6 columnas (`.sg-linea`).
- **Estados de Proceso y Timeline (`.sg-pipeline`, `.sg-historial__item`):** Barra segmentada de pasos (`.is-done`, `.is-current`, `.is-danger`) y línea temporal vertical con puntos activos en coral.
- **Feedback y Overlays:**
  - **Modales (`.sg-modal-backdrop`):** Fondo `rgba(25, 23, 22, 0.5)` con `backdrop-filter: blur(4px)`.
  - **Toasts (`.sg-toast-wrap`):** Fijos abajo a la derecha (`bottom: 24px; right: 24px`), variantes por defecto (`--sg-negro`), `--success`, `--danger`.
  - **Empty State (`.sg-empty`):** Borde discontinuo `2px dashed var(--sg-gris-12)`, círculo de `120px` con fondo `--sg-coral-light`.
  - **AI Hint (`.sg-ai-hint`):** Gradiente sutil `135deg` de `--sg-coral-light` a `rgba(88, 135, 209, 0.08)` con icono coral de `40×40px`.

---

## 8. Movimiento, Transiciones y Accesibilidad

- **Curvas de animación:**
  - `--transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1)` (hover de botones, inputs, enlaces).
  - `--transition-smooth: 0.3s cubic-bezier(0.25, 1, 0.5, 1)` (tarjetas, apertura/cierre de sidebar).
- **Entrada escalonada:** `.sg-stagger > *` aplica `@keyframes sg-fade-up` (`12px` vertical) con retardos de `0.05s` hasta el 8.º hijo.
- **View Transitions API:** `<meta name="view-transition" content="same-origin">` con duración `0.25s` entre navegaciones.
- **Accesibilidad:**
  - Anillo de foco global `:focus-visible { outline: 2px solid var(--sg-coral); outline-offset: 2px; }`.
  - Respeto a `@media (prefers-reduced-motion: reduce)` desactivando animaciones de entrada, toasts y transiciones de tarjetas.
  - Atributos `aria-label`, `aria-expanded`, `role="dialog"`, `aria-modal="true"` en controles del shell.

---

## 9. Sistema de Documentos y Membretes (Cliente Final)

### 9.1 PDF Oficial (`src/Service/PdfService.php`)
- **Estética:** Editorial minimalista estrictamente monocromática (`#000`, `#fff`, `#333`, `#737373`, `#e0e0e0`), `A4 portrait`, `padding: 48px`.
- **Tipografía:** `Helvetica, Arial, sans-serif` (`11px` base, etiquetas `8px`–`9px` en mayúsculas con `letter-spacing: 0.12em`–`0.2em`).

### 9.2 Visor Interactivo de Factura (`public/assets/membrete.css`)
Sistema modular `.mb-escena` con tipografías *Cabinet Grotesk* (`--mb-display`) y *JetBrains Mono* (`--mb-mono`), odómetro animado en cifras y selector de píldora con tres modos:
- `data-estilo="papel"`: Hoja marfil (`#f7f4ee`) con textura de ruido SVG, borde superior/inferior dentado y líneas punteadas.
- `data-estilo="bloque"`: Fondo naranja intenso (`#ff4a12`), tinta `#161616`, sin radios ni sombras, tipografía gigante (`76px`).
- `data-estilo="terminal"`: Hoja oscura (`#121212`), barra de ventana tipo terminal, cursor parpadeante y bordes `#444`.

---

## 10. Convenciones para Desarrollo de UI

1. **No crear frameworks ni CSS paralelos:** Añadir estilos reutilizables en `public/assets/app.css` usando tokens `--sg-*`. Evitar repetir `<style>` inline en vistas salvo layouts muy específicos de módulo.
2. **Coherencia con Dark Mode:** Toda clase nueva debe usar variables `--sg-*` (`--sg-bg-panel`, `--sg-negro`, `--sg-gris-12`, etc.) para heredar el modo oscuro automáticamente sin sobrescrituras manuales.
3. **Vistas de visualización de datos:** En `Chart.js` (`src/View/analitica/index.php`), leer los colores en runtime con `getComputedStyle(document.documentElement).getPropertyValue('--sg-...')` y usar la fuente `'Raleway'`.
4. **Build:** Tras modificar CSS o vistas, recordar ejecutar `./build.sh` según las reglas de `agent.md`.
