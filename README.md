# 🪐 Sangar AI & Creative Components Studio

> Tu suite personal de recursos de Inteligencia Artificial, generadores de prompts especializados, animaciones creativas y componentes UI interactivos estilo **21st.dev**.

---

## 🚀 Las Dos Grandes Librerías Integradas

Este repositorio contiene dos aplicaciones web interactivas complementarias:

| Suite | Archivo | Descripción |
|---|---|---|
| **🎬 Sangar AI Motion Studio** | [`index.html`](file:///Users/jesussanchez/Documents/GitHub/Sangar-library-IA/index.html) | Generador de prompts para Runway Gen-3, Kling, Sora, Hero Frames para Midjourney v6.1 / Flux, expresiones de After Effects y storyboards. |
| **✨ Sangar UI Components (21st.dev Style)** | [`components.html`](file:///Users/jesussanchez/Documents/GitHub/Sangar-library-IA/components.html) | Registro de componentes interactivos para Design Engineers con previsualización en vivo y código listo para copiar en React, Tailwind CSS o HTML/CSS. |

---

## ✨ Características Principales

### 1. 🎬 Generador Pro de Prompts para Motion Graphics
- **Soporte Multi-Motor:** Runway Gen-3 Alpha, Kling AI 1.5, Luma Dream Machine, OpenAI Sora / MiniMax Hailuo y LLMs directores de arte.
- **Hero Frames (Midjourney & Flux):** Diseña el fotograma inicial en Octane Render, Redshift o Hasselblad para el flujo *Image-to-Video*.
- **Expresiones After Effects:** Rebote elástico (*Inertia bounce*), bucles infinitos (*LoopOut*), wiggle orgánico y contadores dinámicos sin keyframes manuales.
- **Storyboards de 15s y 30s:** Desglose plano por plano con prompts, movimientos de cámara y diseño de sonido.

### 2. ⚡ Sangar UI Components (Inspirado en 21st.dev)
- **Live Interactive Previews:** Puedes probar e interactuar con cada componente en tiempo real dentro del navegador.
- **Spotlight Border Card:** Halo de luz radial reactivo que sigue la posición del ratón.
- **Border Beam Glow:** Haz de luz infinito recorriendo el perímetro con gradiente cónico.
- **Kinetic Text Scramble / Decryptor:** Descifrado dinámico de texto al pasar el cursor.
- **Magnetic Dynamic Button:** Botón con física de atracción magnética hacia el ratón.
- **macOS Floating Dock:** Barra de navegación con magnificación parabólica suave.
- **3D Perspective Tilt Glass Card:** Tarjeta translúcida con rotación tridimensional en los ejes X/Y.
- **Morphing Dynamic Island:** Widget expandible para notificaciones y reproductores.
- **Shimmer Sweep Button:** Barrido especular metálico sobre el botón.
- **Doble pestaña de código:** Código listo para copiar en **HTML/CSS/JS** o en **React + Tailwind CSS**.

---

## 🖥️ Cómo Ejecutar el Proyecto

Puedes abrir cualquiera de las aplicaciones directamente:

### Con Servidor Local (Recomendado)
```bash
python3 server.py
```
O con npm:
```bash
npm start
```
- Para el Generador Motion & IA: [http://localhost:3000/index.html](http://localhost:3000/index.html)
- Para la Biblioteca de Componentes 21st.dev: [http://localhost:3000/components.html](http://localhost:3000/components.html)

### Directamente en el navegador
Haz doble clic en `index.html` o `components.html` desde el Finder de macOS. Funcionan sin dependencias externas.

---

## 📁 Estructura del Proyecto

```
Sangar-library-IA/
├── index.html                   # Suite de IA, Motion Graphics, Hero Frames y Expresiones
├── components.html              # Biblioteca de Componentes Interactivos estilo 21st.dev
├── app.js                       # Lógica de la suite de IA y prompts
├── components.js                # Motor interactivo de componentes (spotlight, tilt, scramble)
├── styles.css                   # Estilos principales modo oscuro
├── components.css               # Estilos y keyframes de animaciones de componentes
├── server.py                    # Servidor local ligero
├── package.json                 # Scripts de conveniencia
├── data/                        # Bases de datos JSON modulares
│   ├── ui-components.json       # Componentes con código HTML y React (21st.dev style)
│   ├── motion-generator.json    # Parámetros y presets para vídeo con IA
│   ├── hero-frames-generator.json # Parámetros para Midjourney y Flux
│   ├── after-effects-tools.json # Expresiones matemáticas para After Effects
│   ├── storyboard-templates.json # Plantillas narrativas de 15s y 30s
│   ├── prompts-library.json     # Prompts curados de motion graphics
│   ├── ai-tools.json            # Directorio comparativo de herramientas
│   └── animation-glossary.json  # Glosario técnico de animación
└── docs/                        # Guías y documentación técnica
    ├── after-effects-expressions.md
    ├── motion-graphics-guide.md
    ├── prompt-engineering-video.md
    └── tools-comparison.md
```

---

Creado para **Sangar AI & Creative Studio** — Tu laboratorio personal de Diseño, Animación y Código Creativo.
