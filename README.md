# Sangar AI & Creative Components Studio

> Suite creativa de recursos de Inteligencia Artificial, generadores de prompts para Motion Graphics, Hero Frames, expresiones de After Effects y **Galería de Referencias UI & Prompts de Agentes**, enriquecida con los recursos profesionales de **Creadores Digitales IA** y construida sobre el sistema de diseño **Sangar Studio OS**.

---

## Suites integradas

| Suite | Archivo | Descripción |
| :--- | :--- | :--- |
| **Sangar AI Studio** | [`index.html`](./index.html) | Generador de prompts para Runway Gen-3 Alpha, Kling AI 1.5, Luma Dream Machine, OpenAI Sora / MiniMax Hailuo, Midjourney v6.1 / Flux, Higgsfield AI, Remotion 3D, Claude Artifacts (Canvas 30fps), expresiones de After Effects, 5 storyboards técnicos, glosario ampliado y biblioteca con 27 prompts curados. |
| **Galería de Referencias UI** | [`components.html`](./components.html) | Galería dual con selector de suites: **Sangar Studio Core** (15 componentes interactivos en vivo con código en HTML/CSS y React + prompts de agente) y la **Librería de Animaciones Moxen** (880 animaciones interactivas con preview en vídeo al pasar el cursor y prompts para agentes de código). |

---

## Recursos integrados de Creadores Digitales IA

La biblioteca ha sido alimentada con el contenido curado y recursos técnicos de la biblioteca gratuita de [Creadores Digitales IA](https://creadoresdigitalesia.com/gratis) de Daniel Brown:

1. **10 Estilos de Animación con Claude (Canvas HTML5 & Three.js):**
   - **Pixel Art:** Lienzo interno 135×240 escalado ×8 sin suavizado, paleta de 24 colores y ciclo de caminata en 120 fotogramas.
   - **Pizarra con Tiza:** Fondo verde pizarra con textura granulada y trazos con efecto hervido (*boiling*) cada 3 fotogramas.
   - **Boceto Luminoso (Neón):** Fondo azul noche con emisión de luz en doble trazo (halo difuso exterior + filamento blanco central).
   - **PlayStation 2 (Retro 3D):** Render Three.js *low-poly* con `flatShading`, resolución nativa 270×480 y niebla cálida de distancia.
   - **Cómic / Novela Gráfica:** Tinta gruesa, tramas de puntos de semitono (*Ben-Day dots*) y líneas cinéticas de acción.
   - **Vector Plano Minimalista:** Formas geométricas limpias sin contornos negros, sombras oblicuas a 45° y conos de luz translúcidos.
   - **Línea Minimalista Monocroma:** Fondo blanco marfil `#F8F7F4`, trazo negro uniforme de 2px y acento focal en coral `#FF7E67`.
   - **CGI Hiperrealista Three.js:** `MeshPhysicalMaterial`, mapas de sombras suaves, luces cenitales y *tone mapping* ACES Filmic.
   - **LEGO Stop-Motion:** Minifigura clásica con manos en C, base con tachuelas (*studs*) y animación *a treses* (10 fps reales).
   - **3D Explicativo Isométrico:** Cámara ortográfica a 45°, geometrías redondeadas (`RoundedBoxGeometry`) y paleta pastel luminosa.
   - **Skill Maestra de Animación (`animacion-estilos`):** Reglas matemáticas de sincronía de zancada (velocidad del fondo = zancada ÷ duración del paso), tiempo determinista dependiente de `f` y botón integrado de exportación de vídeo con `canvas.captureStream(30)` y `MediaRecorder`.

2. **Generación de Vídeo con IA en Claude con Higgsfield:**
   - Conector e integración oficial de **Higgsfield AI** con asistentes conversacionales mediante MCP.
   - Prompts de producción testeados: *Anuncio de perfume con oro líquido en cámara lenta (9:16 vertical)*, *Vídeo UGC en gimnasio grabado con smartphone* y *Secuencia cinemática de persecución de auto clásico en el desierto al atardecer*.

3. **Vídeos 3D con Claude y Remotion (Sin After Effects ni Blender):**
   - Pipeline de 5 pasos para crear animaciones tridimensionales programadas en React con `@remotion/three`.
   - Renderizado acelerado por GPU en macOS Apple Silicon y Windows mediante `npx remotion render --gl=angle`.

4. **Diseños Web Profesionales con Claude Code (Anti-Genéricos):**
   - Integración de **Taste Skill** (`Leonxlnx/taste-skill`), **Impeccable UI** (`pbakaus/impeccable`) y las skills de **Emil Kowalski**.
   - Conexión de servidores MCP para **Figma** y **Playwright** con testing visual autónomo en escritorio y móvil.

5. **3 Sistemas SaaS / Apps Virales con Claude Code:**
   - *Comparador de Precios y Gift Cards:* Arquitectura en Next.js con monitor periódico de precios y programa de afiliados.
   - *Trend Radar para Creadores de Contenido:* Next.js + Supabase + YouTube Data API + Google Trends + titulación viral con LLM.
   - *Generador de Retratos / Avatares Estilo Portada:* Carga móvil con API de inferencia de imagen (*Flux LoRA* / *Fal.ai*) y retención segura de 24 horas.

6. **Desarrollo de Videojuegos 3D en 5 Rondas:**
   - Metodología iterativa para construir un videojuego en Three.js y Vite desde el bucle de mecánicas básicas hasta el planeador y los créditos.
   - Conexión de Claude Code con **Unreal Engine 5** a través de `Unreal-MCP`.

---

## Características de la plataforma

### 1. Generador de Prompts para Motion Graphics (`index.html`)
- **10 Motores Soportados:** Runway Gen-3 Alpha, Kling AI 1.5, Luma Dream Machine, OpenAI Sora / MiniMax Hailuo, Midjourney v6.1, ChatGPT / Claude Director, Higgsfield AI, Remotion + Three.js, Claude Canvas y Unreal Engine 5.
- **12 Presets Rápidos:** Cyberpunk Logo Reveal, Tipografía Cinética TikTok, Showcase Lujo 3D, Bucle Mercurio Líquido, Interfaz Holográfica UI, Stop-Motion Pastel, Anuncio Perfume Oro Líquido Higgsfield, Ciclo Caminata Pixel Art 120f, Composición 3D Remotion, Boceto Luminoso Neón, Retro 3D PS2 Flat y LEGO Stop-Motion.
- **17 Estilos Visuales:** Desde liquid chrome y estética suiza hasta pixel art 8-bit, pizarra con tiza, neón, cómic pop-art, LEGO y 3D isométrico pastel.
- **Hero Frames (Midjourney v6.1 & Flux):** Generador de fotogramas maestros en alta resolución (`--style raw`, `--stylize`, lentes, materiales e iluminación de estudio).
- **Expresiones After Effects:** Scripts matemáticos listos para copiar (*Inertia Bounce*, *Wiggle*, *LoopOut Ping-Pong/Cycle*, *Auto Fade*, *Count-Up Numbers*, *Follow Leader Delay*, *Neon Flicker*).
- **5 Storyboards Técnicos:** Plantillas plano a plano para *Reel Viral de 15s*, *Spot Comercial de 30s*, *Spot de Lujo 10s (Higgsfield)*, *UGC Fitness 10s* y *Pipeline de Videojuego 3D en 5 Rondas*.
- **Biblioteca de 27 Prompts Curados:** Filtro por categorías (*Todos*, *Estilos Animación*, *Video IA & Social*, *Claude Code & SaaS*, *Logo Reveal*, *Tipografía Cinética*, *Bucles & VJ*, *UI & Spatial*, *Productos 3D*), búsqueda instantánea y guardado de favoritos en `localStorage`.

### 2. Galería de Referencias UI & Prompts de Agentes (`components.html`)
- **Spotlight Border Card:** Halo radial reactivo al puntero.
- **Border Beam Glow:** Haz de luz continuo recorriendo el perímetro mediante `conic-gradient`.
- **Kinetic Text Decryptor / Scramble:** Descifrado tipográfico dinámico al pasar el cursor.
- **Magnetic Dynamic Button:** Botón con atracción elástica magnética.
- **macOS Magnified Floating Dock:** Barra flotante con magnificación suave parabólica.
- **3D Perspective Tilt Glass Card:** Tarjeta translúcida con inclinación tridimensional en los ejes X/Y.
- **Morphing Dynamic Island Widget:** Cápsula interactiva con expansión suave inspirada en iOS.
- **Shimmer Sweep Button:** Barrido especular continuo sobre el botón.
- **Canvas Loop 30fps & Video Recorder:** Lienzo interactivo en bucle matemático de 120 fotogramas con botón de grabación y exportación de vídeo WebM con `MediaRecorder`.
- **Taste Skill Design Quality Badge:** Insignia interactiva con pulso lumínico y métrica anti-genérica.
- **Aurora Mesh Gradient Background:** Fondo atmosférico con gradientes fluidos orgánicos y desenfoque gausiano profundo.
- **Interactive Bento Showcase Grid:** Cuadrícula bento asimétrica con tarjetas modulares, micro-glows y estadísticas.
- **WebGL Interactive Shader Canvas:** Fondo procedural en tiempo real con shaders GLSL de ondas cálidas.
- **Scroll Expansion Hero Banner:** Contenedor interactivo que se expande con físicas de transición fluida.
- **Pulse Glowing Status Badge:** Insignia con micro-indicador pulsante y halo reactivo perimetral.
- **Pestañas de Código & Prompts:** Alternancia instantánea entre **Vista Previa**, **Prompt Agente** (para Claude Code, Cursor y v0), **HTML / CSS** y **React + Tailwind CSS**.

### 3. Librería de Animaciones Moxen (`components.html#moxen`)
- **880 Animaciones Indexadas:** Extraídas y estructuradas a partir del catálogo técnico de [Moxen](https://moxen.cl/recursos.html).
- **24 Categorías Especializadas:** Formularios (119), Sistemas (99), Gráficos (63), Listas (59), Texto cinético (55), Navegación (51), Secciones (45), Avisos (40), Precios (39), Generativo (38), Tarjetas (32), Media (31), Cargas/Spinners (27), Diagramas (27), Botones (24), Galerías (22), Iconos animados (21), Interruptores (19), Transiciones (14), 3D (14), Scroll (11), Portadas (11), Fondos (10) y Punteros/Cursor (9).
- **Zero-Dependency First:** 864 componentes sin dependencias externas (HTML, CSS y JavaScript nativo), más componentes especializados en WebGL2, WebGL y Matter.js.
- **Reproducción de Vídeo en Hover:** Tarjetas optimizadas con carga perezosa (`preload="none"` y `data-src`) que reproducen el bucle MP4 solo al situar el ratón encima, manteniendo el rendimiento del navegador al 100%.
- **Buscador & Filtros Dinámicos:** Búsqueda en tiempo real por nombre, concepto, descripción, dependencia o categoría, con paginación progresiva (+24 componentes por tanda).
- **Modal de Detalle & Prompts para Agentes:** Diálogo nativo `<dialog>` con reproductor de vídeo ampliado, lista de archivos modulares (`index.html`, `{slug}.css`, `{slug}.js`), enlace directo a la fuente y botón para **Copiar Prompt de Agente** en 1 clic optimizado para Claude Code, Cursor, v0 o ChatGPT.

### 4. Sistema de Diseño *Warm Studio OS* ([`design.md`](./design.md))
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
También puedes abrir `index.html` o `components.html` directamente desde el explorador de archivos: `app.js`, `components.js` y `shell.js` incluyen datos e iconos de respaldo para funcionar de forma autónoma sin servidor ni conexión a internet.

---

## Estructura del proyecto

```text
Sangar-library-IA/
├── index.html                   # Suite de IA: Generador Vídeo, Hero Frames, Expresiones, Storyboards y Biblioteca
├── components.html              # Galería de Referencias UI y Prompts para Agentes de Código
├── shell.js                     # Controlador compartido del App Shell (tema, sidebar, ⌘K, popover, toasts, iconos)
├── app.js                       # Lógica del generador de prompts, módulos de estudio y favoritos
├── components.js                # Motor interactivo de demos UI (spotlight, tilt, scramble, magnetic, island, canvas)
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
│   ├── after-effects-tools.json # Expresiones matemáticas de After Effects (7 scripts)
│   ├── ai-tools.json            # Directorio comparativo de herramientas IA (10 herramientas)
│   ├── animation-glossary.json  # Principios y glosario de Motion Graphics (14 términos)
│   ├── hero-frames-generator.json # Presets y parámetros Midjourney/Flux (5 configuraciones)
│   ├── motion-generator.json    # Presets, estilos, dinámicas y motores (12 presets, 17 estilos, 9 motores)
│   ├── prompts-library.json     # Biblioteca de prompts curados listos para copiar (27 prompts)
│   ├── storyboard-templates.json# Plantillas de storyboards técnicos (5 estructuras)
│   ├── ui-components.json       # Galería de Referencias UI con código y prompts de agente (15 componentes)
│   └── moxen-components.json    # Catálogo completo de animaciones Moxen (880 animaciones, vídeos y prompts)
└── docs/                        # Guías técnicas de referencia
```
