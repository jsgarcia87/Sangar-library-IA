# Sangar AI & Creative Components Studio

> Suite creativa de recursos de Inteligencia Artificial, generadores de prompts para Motion Graphics, Hero Frames, expresiones de After Effects y componentes UI interactivos estilo **21st.dev**, construida sobre el sistema de diseño **Sangar Studio OS**.

---

## Suites integradas

| Suite | Archivo | Descripción |
| :--- | :--- | :--- |
| **Sangar AI Library** | [`index.html`](./index.html) | Generador de prompts para Runway Gen-3 Alpha, Kling AI 1.5, Luma Dream Machine, OpenAI Sora / MiniMax Hailuo, Midjourney v6.1 / Flux, expresiones de After Effects, storyboards de 15s y 30s, glosario y favoritos. |
| **Sangar UI Components** | [`components.html`](./components.html) | Registro de 8 componentes interactivos estilo **21st.dev** con previsualización en vivo y código listo para copiar en **HTML/CSS/JS** y **React + Tailwind CSS**. |

---

## Características principales

### 1. Generador de Prompts para Motion Graphics (`index.html`)
- **Soporte Multi-Motor:** Runway Gen-3 Alpha, Kling AI 1.5, Luma Dream Machine, OpenAI Sora / MiniMax Hailuo, Midjourney v6.1 y Meta-Prompts para LLMs (ChatGPT / Claude).
- **Presets Rápidos:** Configuraciones instantáneas (*Cyberpunk Logo Reveal*, *Tipografía TikTok / Reels*, *Showcase Lujo 3D*, *Bucle Mercurio Líquido*, *Interfaz Holográfica UI*, *Stop-Motion Pastel*).
- **Hero Frames (Midjourney v6.1 & Flux):** Generador de fotogramas maestros en alta resolución (`--style raw`, `--stylize`, lentes, materiales e iluminación de estudio) para el flujo *Image-to-Video*.
- **Expresiones After Effects:** Scripts listos para copiar (*Inertia Bounce*, *Wiggle*, *LoopOut Ping-Pong/Cycle*, *Auto Fade*, *Count-Up Numbers*, *Follow Leader Delay*, *Neon Flicker*).
- **Storyboards de 15s y 30s:** Guiones técnicos plano por plano con movimiento de cámara, diseño de sonido y prompts por escena.
- **Biblioteca, Glosario, Directorio IA y Favoritos:** Buscador y filtros por categoría, comparativa de herramientas y guardado local de prompts en `localStorage` con exportación a JSON.

### 2. Sangar UI Components — Estilo 21st.dev (`components.html`)
- **Spotlight Border Card:** Halo radial reactivo que sigue la posición del puntero.
- **Border Beam Glow:** Haz de luz continuo recorriendo el perímetro mediante `conic-gradient`.
- **Kinetic Text Decryptor / Scramble:** Descifrado tipográfico dinámico al pasar el cursor.
- **Magnetic Dynamic Button:** Botón con atracción magnética hacia el puntero.
- **macOS Magnified Floating Dock:** Barra flotante con magnificación suave al hacer hover.
- **3D Perspective Tilt Glass Card:** Tarjeta translúcida con inclinación tridimensional en los ejes X/Y.
- **Morphing Dynamic Island Widget:** Cápsula expandible con transición fluida.
- **Shimmer Sweep Button:** Barrido especular continuo sobre el botón.
- **Pestañas de Código:** Copia directa en **HTML / CSS / Vanilla JS** o **React + Tailwind CSS**.

### 3. Sistema de Diseño *Warm Studio OS* ([`design.md`](./design.md))
- **Estética:** Superficies cálidas (`#FCFAFB` en modo claro / `#131211` en modo oscuro), carbón `#191716` / `#F0ECE8` y acento coral `#FF7E67` / `#FF8E7A` mediante tokens CSS `--sg-*` definidos en [`public/assets/app.css`](./public/assets/app.css).
- **Tipografía corporativa local:** `Stinger Fit Light` para titulares y métricas y `Raleway` (`400`, `600`, `700`) para interfaz, cargadas desde `public/assets/fonts/`.
- **App Shell unificado (`shell.js`):**
  - Sidebar oscuro fijo (`#191716`) colapsable (`240px` / `76px`) y *drawer* responsivo en móvil (`<= 992px`).
  - Topbar translúcida con saludo contextual, buscador global y **Paleta de Comandos** (`⌘K` / `Ctrl+K`) con `<dialog>` nativo.
  - Selector de tema claro/oscuro/sistema (`localStorage` `sg-theme`), popover de novedades y notificaciones toast accesibles (`aria-live="polite"`).
  - Iconografía **Lucide** (`lucide@0.460.0`) con respaldo SVG inline para funcionamiento sin conexión.

---

## Cómo ejecutar el proyecto

### Con servidor local (recomendado)
```bash
python3 server.py
```
O mediante los scripts de `package.json`:
```bash
npm start
# o con npx serve:
npm run serve
```
- **Sangar AI Library:** [http://localhost:3000/index.html](http://localhost:3000/index.html)
- **Sangar UI Components:** [http://localhost:3000/components.html](http://localhost:3000/components.html)

### Directamente en el navegador
También puedes abrir `index.html` o `components.html` directamente desde el explorador de archivos: `app.js`, `components.js` y `shell.js` incluyen datos e iconos de respaldo para funcionar sin servidor ni conexión.

---

## Estructura del proyecto

```text
Sangar-library-IA/
├── index.html                   # Suite de IA: Generador Vídeo, Hero Frames, Expresiones, Storyboards y Biblioteca
├── components.html              # Biblioteca interactiva de componentes UI estilo 21st.dev
├── shell.js                     # Controlador compartido del App Shell (tema, sidebar, ⌘K, popover, toasts, iconos)
├── app.js                       # Lógica del generador de prompts, módulos de estudio y favoritos
├── components.js                # Motor interactivo de demos UI (spotlight, tilt, scramble, magnetic, island)
├── styles.css                   # Estilos de la plataforma sobre los tokens --sg-* de public/assets/app.css
├── components.css               # Estilos de tarjetas showcase y demos interactivos
├── design.md                    # Sistema de diseño de referencia (Sangar Studio OS)
├── server.py                    # Servidor HTTP local en Python (puerto 3000)
├── package.json                 # Metadatos y scripts de arranque
├── README.md                    # Documentación principal en Markdown
├── readme.txt                   # Documentación en texto plano
├── public/                      # Activos de marca, fuentes y CSS base del sistema
│   └── assets/
│       ├── app.css              # Tokens --sg-*, tipografías @font-face y componentes base Sangar Studio OS
│       ├── membrete.css         # Estilos del visor de membretes/facturas
│       ├── membrete.js          # Lógica del visor de membretes
│       ├── fonts/               # StingerFit-Light.ttf y Raleway (Regular, SemiBold, Bold)
│       └── logos/               # sangar-s-negro.svg, sangar-s-blanco.svg, sangar-lockup-negro.svg
├── data/                        # Conjuntos de datos JSON modulares
│   ├── after-effects-tools.json
│   ├── ai-tools.json
│   ├── animation-glossary.json
│   ├── hero-frames-generator.json
│   ├── motion-generator.json
│   ├── prompts-library.json
│   ├── storyboard-templates.json
│   └── ui-components.json
└── docs/                        # Guías técnicas de referencia
    ├── after-effects-expressions.md
    ├── motion-graphics-guide.md
    ├── prompt-engineering-video.md
    └── tools-comparison.md
```
