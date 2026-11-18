================================================================================
SANGAR AI & CREATIVE COMPONENTS STUDIO
================================================================================

Suite personal de recursos de Inteligencia Artificial, generadores de prompts
especializados para Motion Graphics, Hero Frames, expresiones de After Effects
y biblioteca de componentes UI interactivos estilo 21st.dev, diseñada siguiendo
el sistema Sangar Studio OS (design.md).

--------------------------------------------------------------------------------
1. SUITES INTEGRADAS
--------------------------------------------------------------------------------

- Sangar AI Library (index.html)
  Generador de prompts para Runway Gen-3 Alpha, Kling AI 1.5, Luma Dream
  Machine, OpenAI Sora / MiniMax Hailuo, Midjourney v6.1 / Flux y Meta-Prompts
  para LLMs. Incluye presets rápidos, Hero Frames, expresiones de After
  Effects, storyboards de 15s y 30s, biblioteca de prompts curados, guía y
  glosario, directorio comparativo de herramientas IA y gestión de favoritos en
  LocalStorage.

- Sangar UI Components (components.html)
  Registro de 8 componentes interactivos estilo 21st.dev con previsualización en
  vivo y código listo para copiar en HTML/CSS/JS o React + Tailwind CSS:
    * Spotlight Border Card
    * Border Beam Glow
    * Kinetic Text Decryptor / Scramble
    * Magnetic Dynamic Button
    * macOS Magnified Floating Dock
    * 3D Perspective Tilt Glass Card
    * Morphing Dynamic Island Widget
    * Shimmer Sweep Button

--------------------------------------------------------------------------------
2. SISTEMA DE DISEÑO (design.md & public/assets/)
--------------------------------------------------------------------------------

- Estética Warm Studio OS: superficies cálidas (#FCFAFB claro / #131211 oscuro),
  negros carbón (#191716 / #F0ECE8) y acento coral (#FF7E67 / #FF8E7A) mediante
  variables CSS --sg-* definidas en public/assets/app.css.
- Tipografías locales en public/assets/fonts/: Stinger Fit Light para titulares
  y métricas, y Raleway (400, 600, 700) para interfaz.
- App Shell unificado (shell.js):
    * Sidebar oscuro fijo (#191716) colapsable (240px / 76px) y drawer móvil.
    * Topbar translúcida con saludo contextual y paleta de comandos (Cmd+K / Ctrl+K).
    * Selector de modo claro/oscuro/sistema persistido en localStorage (sg-theme).
    * Iconografía Lucide (lucide@0.460.0) con respaldo SVG offline integrado.

--------------------------------------------------------------------------------
3. CÓMO EJECUTAR EL PROYECTO
--------------------------------------------------------------------------------

Opción A — Servidor local Python (recomendado):
  python3 server.py

Opción B — Scripts npm:
  npm start
  npm run serve

URLs locales (puerto 3000 por defecto):
  * AI Motion Studio:    http://localhost:3000/index.html
  * UI Components:       http://localhost:3000/components.html

Opción C — Apertura directa:
  Abre index.html o components.html directamente en tu navegador. Los módulos
  incluyen datos e iconos de respaldo embebidos para funcionar sin servidor.

--------------------------------------------------------------------------------
4. ESTRUCTURA DEL PROYECTO
--------------------------------------------------------------------------------

Sangar-library-IA/
  index.html                     Suite principal de IA y Motion Graphics
  components.html                Catálogo interactivo de componentes 21st.dev
  shell.js                       Controlador compartido del App Shell
  app.js                         Lógica del generador, biblioteca y favoritos
  components.js                  Motor de previsualización e interacción UI
  styles.css                     Estilos de plataforma con tokens --sg-*
  components.css                 Estilos de showcase y demos interactivos
  design.md                      Especificación del sistema Sangar Studio OS
  server.py                      Servidor HTTP local (puerto 3000)
  package.json                   Scripts de ejecución
  README.md                      Documentación en Markdown
  readme.txt                     Este archivo de texto plano
  public/assets/                 CSS base (app.css), fuentes, logos y membrete
  data/                          Bases de datos JSON modulares
  docs/                          Guías técnicas en Markdown

================================================================================
Sangar Studio OS — Laboratorio de Diseño, Animación y Código Creativo
================================================================================
