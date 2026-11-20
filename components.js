/**
 * Sangar UI Studio — Galería de Referencias & Prompts UI
 * Engine de componentes interactivos con soporte de código (HTML/React)
 * y Prompts optimizados para Agentes de Código (Claude Code, Cursor, v0).
 */

let componentsData = [];
let moxenData = [];
let moxenFiltered = [];
let moxenRenderLimit = 24;
const MOXEN_BATCH_SIZE = 24;
let activeMoxenCategory = 'all';

// Embedded fallback data for 100% offline & file:// compatibility
const FALLBACK_COMPONENTS = [
  {
    "id": "spotlight-card",
    "name": "Spotlight Border Card",
    "category": "cards",
    "tags": [
      "Tailwind",
      "Interactive",
      "Mouse Tracker",
      "Cards",
      "Glow"
    ],
    "description": "Tarjeta moderna con un resplandor radial dinámico que sigue las coordenadas exactas del ratón, iluminando sutilmente los bordes y el fondo.",
    "promptAgent": "Crea un componente 'SpotlightCard' en React con Tailwind CSS. Debe calcular la posición del cursor del ratón (clientX, clientY) relativo a los límites de la tarjeta y actualizar variables CSS (--mouse-x, --mouse-y) para proyectar un gradiente radial sutil (400px circle) con color de acento (#FF7E67 o indigo) que ilumine el borde y el fondo oscuro (#111420). Incluye soporte de accesibilidad, transiciones suaves y un diseño responsive elegante.",
    "previewHtml": "<div class=\"comp-spotlight-card\" id=\"spotlightCardDemo\">\n  <div class=\"spotlight-content\">\n    <div class=\"spotlight-icon\">⚡</div>\n    <h3>Sangar Dynamic Spotlight</h3>\n    <p>Mueve el cursor sobre esta tarjeta para ver cómo el halo de luz responde a tu posición en tiempo real.</p>\n    <span class=\"spotlight-tag\">Sangar Studio • Interactive</span>\n  </div>\n</div>",
    "codeHtml": "<!-- HTML & Tailwind / CSS -->\n<div class=\"spotlight-card\" onmousemove=\"handleSpotlight(event, this)\">\n  <div class=\"spotlight-overlay\"></div>\n  <div class=\"card-body\">\n    <div class=\"icon\">⚡</div>\n    <h3>Spotlight Card</h3>\n    <p>Halo de luz dinámico que sigue las coordenadas del ratón.</p>\n  </div>\n</div>\n\n<style>\n.spotlight-card {\n  position: relative;\n  background: #111420;\n  border-radius: 16px;\n  padding: 24px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  overflow: hidden;\n}\n.spotlight-card::before {\n  content: \"\";\n  position: absolute;\n  top: 0; left: 0; right: 0; bottom: 0;\n  background: radial-gradient(400px circle at var(--mouse-x, -500px) var(--mouse-y, -500px), rgba(255, 126, 103, 0.2), transparent 80%);\n  pointer-events: none;\n  transition: opacity 0.3s ease;\n}\n</style>\n\n<script>\nfunction handleSpotlight(e, card) {\n  const rect = card.getBoundingClientRect();\n  card.style.setProperty(\"--mouse-x\", `${e.clientX - rect.left}px`);\n  card.style.setProperty(\"--mouse-y\", `${e.clientY - rect.top}px`);\n}\n</script>",
    "codeReact": "// React + Tailwind CSS Implementation\nimport React, { useRef } from \"react\";\n\nexport const SpotlightCard = ({ title, desc, icon }) => {\n  const cardRef = useRef(null);\n\n  const handleMouseMove = (e) => {\n    if (!cardRef.current) return;\n    const rect = cardRef.current.getBoundingClientRect();\n    cardRef.current.style.setProperty(\"--x\", `${e.clientX - rect.left}px`);\n    cardRef.current.style.setProperty(\"--y\", `${e.clientY - rect.top}px`);\n  };\n\n  return (\n    <div\n      ref={cardRef}\n      onMouseMove={handleMouseMove}\n      className=\"relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-2xl transition-colors hover:border-orange-500/50 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(400px_circle_at_var(--x,-500px)_var(--y,-500px),rgba(255,126,103,0.18),transparent_80%)]\"\n    >\n      <div className=\"relative z-10 text-white\">\n        <div className=\"mb-3 text-2xl\">{icon}</div>\n        <h3 className=\"text-lg font-bold\">{title}</h3>\n        <p className=\"mt-1 text-sm text-neutral-400\">{desc}</p>\n      </div>\n    </div>\n  );\n};"
  },
  {
    "id": "border-beam",
    "name": "Border Beam Glow",
    "category": "cards",
    "tags": [
      "Animation",
      "CSS Keyframes",
      "Border Light",
      "Tailwind"
    ],
    "description": "Efecto de haz de luz ultrabrillante que recorre continuamente el perímetro de una tarjeta en un bucle hipnótico sin fin.",
    "promptAgent": "Crea un componente 'BorderBeamCard' en React con Tailwind CSS. Utiliza un contenedor relativo con bordes redondeados y un elemento pseudo-capa animado con conic-gradient continuo que rote 360 grados infinitamente. Aplica máscaras CSS (mask-composite: exclude) para recortar el interior y dejar únicamente visible el haz de luz sobre el borde de 2px con resplandor en los colores corporativos (#FF7E67 y #FFB3A3).",
    "previewHtml": "<div class=\"comp-border-beam-card\">\n  <div class=\"beam-glow\"></div>\n  <div class=\"beam-content\">\n    <span class=\"badge-cyan\">Infinite Beam</span>\n    <h3>Border Beam Light</h3>\n    <p>Un haz de luz volumétrico que viaja a lo largo del borde mediante conic-gradient y máscaras CSS.</p>\n  </div>\n</div>",
    "codeHtml": "<!-- HTML & CSS Border Beam -->\n<div class=\"border-beam-box\">\n  <div class=\"border-beam-glow\"></div>\n  <div class=\"box-content\">\n    <h3>Border Beam</h3>\n    <p>Luz infinita recorriendo el borde de la tarjeta.</p>\n  </div>\n</div>\n\n<style>\n.border-beam-box {\n  position: relative;\n  background: #0f111a;\n  border-radius: 16px;\n  padding: 24px;\n  border: 1px solid #1f2335;\n  overflow: hidden;\n}\n.border-beam-glow {\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  padding: 2px;\n  background: conic-gradient(from var(--beam-angle, 0deg), transparent 75%, #FF7E67 90%, #FFB3A3 100%);\n  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);\n  -webkit-mask-composite: xor;\n  mask-composite: exclude;\n  pointer-events: none;\n  animation: rotateBeam 4s linear infinite;\n}\n@keyframes rotateBeam {\n  to { transform: rotate(360deg); }\n}\n</style>",
    "codeReact": "// React + Tailwind Border Beam\nexport const BorderBeamCard = ({ children }) => (\n  <div className=\"relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6\">\n    <div className=\"pointer-events-none absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_75%,#FF7E67_90%,#FFB3A3_100%)] opacity-80\" />\n    <div className=\"relative z-10 rounded-xl bg-neutral-950 p-4 text-white\">\n      {children}\n    </div>\n  </div>\n);"
  },
  {
    "id": "text-scramble",
    "name": "Kinetic Text Decryptor / Scramble",
    "category": "text",
    "tags": [
      "Typography",
      "Cyberpunk",
      "Kinetic",
      "Microinteraction"
    ],
    "description": "Texto interactivo con efecto de descifrado criptográfico tipo Matrix/Cyberpunk al pasar el cursor o al cargarse.",
    "promptAgent": "Crea un componente 'TextScramble' en React y TypeScript. Al hacer hover (onMouseEnter), el texto debe reproducir un efecto de descifrado criptográfico aleatorio utilizando una cadena de caracteres especiales ('!@#$%^&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'). Las letras originales deben fijarse progresivamente de izquierda a derecha en un intervalo de 30ms con una cadencia de 1/3 de iteración por paso. Añade tipografía monospace e interactividad accesible.",
    "previewHtml": "<div class=\"comp-text-scramble-box\">\n  <span class=\"label-dim\">Pasa el ratón por encima:</span>\n  <h2 class=\"scramble-trigger\" id=\"demoScrambleText\" data-value=\"SANGAR DESIGN ENGINE\">SANGAR DESIGN ENGINE</h2>\n  <p class=\"text-xs text-muted\">Re-scramble trigger on hover</p>\n</div>",
    "codeHtml": "<!-- HTML & Vanilla JS Text Scramble -->\n<h2 class=\"scramble-text\" data-value=\"SANGAR CREATIVE STUDIO\">SANGAR CREATIVE STUDIO</h2>\n\n<script>\nconst letters = \"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*\";\n\ndocument.querySelector(\".scramble-text\").onmouseover = event => {  \n  let iteration = 0;\n  clearInterval(event.target.interval);\n  const original = event.target.dataset.value;\n  \n  event.target.interval = setInterval(() => {\n    event.target.innerText = original.split(\"\")\n      .map((letter, index) => {\n        if(index < iteration) return original[index];\n        return letters[Math.floor(Math.random() * letters.length)];\n      })\n      .join(\"\");\n    \n    if(iteration >= original.length){\n      clearInterval(event.target.interval);\n    }\n    iteration += 1 / 3;\n  }, 30);\n};\n</script>",
    "codeReact": "// React Scramble Text Component\nimport React, { useState } from \"react\";\n\nexport const TextScramble = ({ text = \"SANGAR CREATIVE ENGINE\" }) => {\n  const [displayText, setDisplayText] = useState(text);\n  const chars = \"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*\";\n\n  const scramble = () => {\n    let iteration = 0;\n    const interval = setInterval(() => {\n      setDisplayText(text.split(\"\").map((char, index) => {\n        if (index < iteration) return text[index];\n        return chars[Math.floor(Math.random() * chars.length)];\n      }).join(\"\"));\n      if (iteration >= text.length) clearInterval(interval);\n      iteration += 1 / 3;\n    }, 30);\n  };\n\n  return (\n    <span onMouseEnter={scramble} className=\"font-mono font-bold tracking-wider cursor-pointer text-orange-400\">\n      {displayText}\n    </span>\n  );\n};"
  },
  {
    "id": "magnetic-button",
    "name": "Magnetic Dynamic Button",
    "category": "buttons",
    "tags": [
      "Physics",
      "Magnetic",
      "Buttons",
      "Framer Motion"
    ],
    "description": "Botón magnético que es atraído físicamente hacia el cursor del usuario cuando se acerca, con retorno elástico suave.",
    "promptAgent": "Crea un componente 'MagneticButton' en React utilizando Framer Motion. Debe calcular la distancia del cursor respecto al centro geométrico del botón y aplicar un desplazamiento elástico amortiguado (spring con stiffness: 200, damping: 15, mass: 0.1) que atraiga el botón hacia el ratón con un factor de 0.35. Al salir del área hover (mouseleave), debe regresar suavemente a las coordenadas (0, 0).",
    "previewHtml": "<div class=\"comp-magnetic-wrapper\" id=\"magneticContainerDemo\">\n  <button class=\"comp-magnetic-btn\" id=\"magneticBtnDemo\">\n    <span class=\"btn-magnetic-text\">Descubrir Recursos ↗</span>\n  </button>\n</div>",
    "codeHtml": "<!-- HTML & JS Magnetic Button -->\n<div class=\"magnetic-wrap\" id=\"magWrap\">\n  <button class=\"magnetic-btn\" id=\"magBtn\">Hover Magnético ↗</button>\n</div>\n\n<style>\n.magnetic-wrap { display: inline-block; padding: 30px; }\n.magnetic-btn {\n  background: linear-gradient(135deg, #FF7E67, #FF5A36);\n  color: white;\n  border: none;\n  padding: 14px 28px;\n  border-radius: 9999px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: transform 0.15s ease-out;\n  box-shadow: 0 4px 20px rgba(255, 126, 103, 0.4);\n}\n</style>\n\n<script>\nconst wrap = document.getElementById(\"magWrap\");\nconst btn = document.getElementById(\"magBtn\");\nwrap.addEventListener(\"mousemove\", (e) => {\n  const rect = wrap.getBoundingClientRect();\n  const x = (e.clientX - rect.left - rect.width / 2) * 0.4;\n  const y = (e.clientY - rect.top - rect.height / 2) * 0.4;\n  btn.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;\n});\nwrap.addEventListener(\"mouseleave\", () => {\n  btn.style.transform = \"translate(0px, 0px) scale(1)\";\n});\n</script>",
    "codeReact": "// React + Framer Motion Magnetic Button\nimport React, { useRef, useState } from \"react\";\nimport { motion } from \"framer-motion\";\n\nexport const MagneticButton = ({ children = \"Descubrir Recursos ↗\" }) => {\n  const ref = useRef(null);\n  const [position, setPosition] = useState({ x: 0, y: 0 });\n\n  const handleMouseMove = (e) => {\n    const { clientX, clientY } = e;\n    const { left, top, width, height } = ref.current.getBoundingClientRect();\n    const middleX = clientX - (left + width / 2);\n    const middleY = clientY - (top + height / 2);\n    setPosition({ x: middleX * 0.35, y: middleY * 0.35 });\n  };\n\n  const reset = () => setPosition({ x: 0, y: 0 });\n\n  return (\n    <motion.button\n      ref={ref}\n      onMouseMove={handleMouseMove}\n      onMouseLeave={reset}\n      animate={{ x: position.x, y: position.y }}\n      transition={{ type: \"spring\", stiffness: 200, damping: 15, mass: 0.1 }}\n      className=\"rounded-full bg-gradient-to-r from-orange-500 to-rose-600 px-8 py-3.5 font-semibold text-white shadow-lg hover:shadow-orange-500/25\"\n    >\n      {children}\n    </motion.button>\n  );\n};"
  },
  {
    "id": "macos-dock",
    "name": "macOS Magnified Floating Dock",
    "category": "navigation",
    "tags": [
      "Navigation",
      "macOS",
      "Dock",
      "Magnification"
    ],
    "description": "Barra de navegación flotante estilo dock de macOS con magnificación parabólica suave al pasar el cursor sobre los iconos.",
    "promptAgent": "Crea una barra de navegación flotante tipo 'macOS Dock' en React con Tailwind CSS y Framer Motion. Debe calcular la distancia horizontal de cada icono respecto a las coordenadas del ratón en tiempo real y escalar el tamaño del icono (de 44px a 72px) siguiendo una curva gaussiana / parabólica con elevación en el eje Y (-12px). Aplica backdrop-blur, borde translúcido y tooltips animados con nombre de la herramienta.",
    "previewHtml": "<div class=\"comp-dock-container\">\n  <div class=\"comp-dock-bar\" id=\"macosDockDemo\">\n    <div class=\"dock-item\" data-tooltip=\"Finder\">📁</div>\n    <div class=\"dock-item\" data-tooltip=\"After Effects\">🎬</div>\n    <div class=\"dock-item\" data-tooltip=\"Figma\">🎨</div>\n    <div class=\"dock-item\" data-tooltip=\"Terminal\">⚡</div>\n    <div class=\"dock-item\" data-tooltip=\"Midjourney\">💎</div>\n    <div class=\"dock-item\" data-tooltip=\"Sangar AI\">🪐</div>\n  </div>\n</div>",
    "codeHtml": "<!-- HTML & CSS macOS Dock -->\n<div class=\"dock-wrapper\">\n  <div class=\"dock\" id=\"dock\">\n    <button class=\"dock-icon\">📁</button>\n    <button class=\"dock-icon\">🎬</button>\n    <button class=\"dock-icon\">🎨</button>\n    <button class=\"dock-icon\">⚡</button>\n    <button class=\"dock-icon\">🪐</button>\n  </div>\n</div>\n\n<style>\n.dock-wrapper { display: flex; justify-content: center; padding: 20px; }\n.dock {\n  display: flex;\n  gap: 12px;\n  padding: 10px 16px;\n  background: rgba(18, 20, 30, 0.75);\n  backdrop-filter: blur(16px);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 24px;\n}\n.dock-icon {\n  width: 44px; height: 44px;\n  border-radius: 14px;\n  background: #1e2235;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  font-size: 20px;\n  display: flex; align-items: center; justify-content: center;\n  transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);\n  cursor: pointer;\n}\n.dock-icon:hover {\n  transform: scale(1.4) translateY(-10px);\n}\n</style>",
    "codeReact": "// React + Tailwind Dock Component\nimport React from \"react\";\n\nexport const FloatingDock = ({ items = [{ icon: \"📁\" }, { icon: \"🎬\" }, { icon: \"⚡\" }, { icon: \"🪐\" }] }) => (\n  <div className=\"flex items-center gap-3 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-3 shadow-2xl backdrop-blur-xl\">\n    {items.map((item, idx) => (\n      <button\n        key={idx}\n        className=\"flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800/80 text-xl transition-all duration-200 hover:-translate-y-2 hover:scale-125 hover:bg-neutral-700 active:scale-95\"\n      >\n        {item.icon}\n      </button>\n    ))}\n  </div>\n);"
  },
  {
    "id": "3d-tilt-card",
    "name": "3D Perspective Tilt Glass Card",
    "category": "cards",
    "tags": [
      "3D",
      "Tilt",
      "Glassmorphism",
      "Cards"
    ],
    "description": "Efecto de rotación 3D en perspectiva con brillo especular de cristal que calcula el ángulo según la posición del cursor.",
    "promptAgent": "Crea un componente 'TiltCard' en React con Tailwind CSS. Aplica 'perspective: 1000px' y 'transform-style: preserve-3d' al contenedor. En el evento mousemove, calcula la posición relativa del ratón respecto al centro y rota el elemento en rotateX y rotateY entre -15deg y 15deg con amortiguación suave. Añade una capa superior con degradado radial que proyecte un reflejo de cristal especular que se desplace al inclinar la tarjeta.",
    "previewHtml": "<div class=\"comp-tilt-card-wrapper\" id=\"tiltCardWrapDemo\">\n  <div class=\"comp-tilt-card\" id=\"tiltCardDemo\">\n    <div class=\"tilt-card-badge\">Spatial 3D</div>\n    <h3>Vision Pro Glass</h3>\n    <p>La tarjeta pivota en los ejes X e Y generando una sensación de profundidad tridimensional real.</p>\n    <div class=\"tilt-glare\"></div>\n  </div>\n</div>",
    "codeHtml": "<!-- HTML, CSS & JS 3D Tilt Card -->\n<div class=\"tilt-container\" id=\"tiltContainer\">\n  <div class=\"tilt-box\" id=\"tiltBox\">\n    <h3>3D Tilt Card</h3>\n    <p>Efecto de rotación en perspectiva tridimensional.</p>\n  </div>\n</div>\n\n<style>\n.tilt-container { perspective: 1000px; display: inline-block; }\n.tilt-box {\n  width: 320px; padding: 24px;\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(12px);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 20px;\n  color: white;\n  transform-style: preserve-3d;\n  transition: transform 0.1s ease-out;\n}\n</style>\n\n<script>\nconst c = document.getElementById(\"tiltContainer\");\nconst b = document.getElementById(\"tiltBox\");\nc.addEventListener(\"mousemove\", (e) => {\n  const rect = c.getBoundingClientRect();\n  const x = e.clientX - rect.left;\n  const y = e.clientY - rect.top;\n  const xRot = ((y - rect.height / 2) / rect.height) * -20;\n  const yRot = ((x - rect.width / 2) / rect.width) * 20;\n  b.style.transform = `rotateX(${xRot}deg) rotateY(${yRot}deg) scale3d(1.05, 1.05, 1.05)`;\n});\nc.addEventListener(\"mouseleave\", () => {\n  b.style.transform = \"rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)\";\n});\n</script>",
    "codeReact": "// React 3D Tilt Component\nimport React, { useRef } from \"react\";\n\nexport const TiltCard = ({ title = \"Vision Pro Glass\", children }) => {\n  const ref = useRef(null);\n  const onMouseMove = (e) => {\n    const rect = ref.current.getBoundingClientRect();\n    const x = e.clientX - rect.left - rect.width / 2;\n    const y = e.clientY - rect.top - rect.height / 2;\n    ref.current.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg) scale3d(1.02, 1.02, 1.02)`;\n  };\n  const onMouseLeave = () => {\n    ref.current.style.transform = \"perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)\";\n  };\n  return (\n    <div\n      ref={ref}\n      onMouseMove={onMouseMove}\n      onMouseLeave={onMouseLeave}\n      className=\"rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 transition-transform duration-100 ease-out shadow-2xl backdrop-blur-md\"\n    >\n      <h3 className=\"text-lg font-bold text-white\">{title}</h3>\n      {children}\n    </div>\n  );\n};"
  },
  {
    "id": "dynamic-island",
    "name": "Morphing Dynamic Island Widget",
    "category": "navigation",
    "tags": [
      "Dynamic Island",
      "Morphing",
      "Interactive",
      "Microinteraction"
    ],
    "description": "Cápsula interactiva inspirada en la Dynamic Island de Apple que se expande y contrae fluidamente con físicas de amortiguación al hacer clic.",
    "promptAgent": "Crea un widget interactivo tipo 'DynamicIsland' en React con Tailwind CSS y Framer Motion. En estado colapsado debe ser una píldora negra compacta con un indicador de estado en vivo (onda sónica o punto pulsante) y texto conciso. Al hacer clic, debe expandirse mediante layout animations con físicas de resorte (spring stiffness: 350, damping: 25) para revelar controles de medios, carátula de audio y botones de acción sin saltos de layout.",
    "previewHtml": "<div class=\"comp-island-wrapper\">\n  <div class=\"comp-dynamic-island\" id=\"dynamicIslandDemo\">\n    <div class=\"island-collapsed\">\n      <span class=\"island-dot\"></span>\n      <span class=\"island-text\">Sangar Music • Playing</span>\n      <span class=\"island-wave\">||||</span>\n    </div>\n    <div class=\"island-expanded\" style=\"display: none;\">\n      <div class=\"island-track-info\">\n        <div class=\"track-art\">🎵</div>\n        <div>\n          <strong>Cinematic Motion Beats</strong>\n          <span>Runway & Kling Soundscapes</span>\n        </div>\n      </div>\n      <div class=\"island-controls\">\n        <button class=\"btn-ctrl\">⏮</button>\n        <button class=\"btn-ctrl\">⏸</button>\n        <button class=\"btn-ctrl\">⏭</button>\n      </div>\n    </div>\n  </div>\n</div>",
    "codeHtml": "<!-- HTML & JS Morphing Dynamic Island -->\n<div class=\"dynamic-island\" id=\"island\" onclick=\"toggleIsland()\">\n  <div class=\"island-content\">Tocando: Motion Sounds 🎵</div>\n</div>\n\n<style>\n.dynamic-island {\n  background: #000; color: #fff; border-radius: 9999px;\n  padding: 10px 24px; width: fit-content; cursor: pointer;\n  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);\n  box-shadow: 0 10px 30px rgba(0,0,0,0.6);\n}\n.dynamic-island.expanded {\n  border-radius: 28px;\n  padding: 24px;\n  width: 320px;\n}\n</style>\n\n<script>\nfunction toggleIsland() {\n  document.getElementById(\"island\").classList.toggle(\"expanded\");\n}\n</script>",
    "codeReact": "// React + Framer Motion Dynamic Island\nimport React, { useState } from \"react\";\nimport { motion } from \"framer-motion\";\n\nexport const DynamicIsland = () => {\n  const [expanded, setExpanded] = useState(false);\n  return (\n    <motion.div\n      layout\n      onClick={() => setExpanded(!expanded)}\n      transition={{ type: \"spring\", stiffness: 350, damping: 25 }}\n      className=\"cursor-pointer overflow-hidden bg-black text-white shadow-2xl\"\n      style={{ borderRadius: expanded ? 32 : 9999, padding: expanded ? 24 : \"10px 20px\", width: expanded ? 340 : \"auto\" }}\n    >\n      {expanded ? (\n        <div className=\"flex flex-col gap-3\">\n          <div className=\"font-bold\">Now Playing</div>\n          <p className=\"text-xs text-neutral-400\">Runway Gen-3 Soundtrack</p>\n        </div>\n      ) : (\n        <div className=\"flex items-center gap-2 text-sm\">\n          <span className=\"h-2 w-2 rounded-full bg-emerald-500 animate-pulse\" />\n          <span>Sangar Island</span>\n        </div>\n      )}\n    </motion.div>\n  );\n};"
  },
  {
    "id": "shimmer-button",
    "name": "Shimmer Sweep Button",
    "category": "buttons",
    "tags": [
      "Buttons",
      "Shimmer",
      "Gradient",
      "Tailwind"
    ],
    "description": "Botón premium con una ráfaga de brillo especular continuo barriendo diagonalmente sobre la superficie metálica.",
    "promptAgent": "Crea un componente 'ShimmerButton' en React con Tailwind CSS. El botón debe tener un fondo oscuro elegante con borde sutil y un elemento interno absoluto que reproduzca un barrido de brillo diagonal continuo con gradiente (from-transparent via-white/20 to-transparent) mediante una animación CSS @keyframes de 2.5s. Debe soportar hover, estados activos con micro-scale (active:scale-95) y accesibilidad de teclado.",
    "previewHtml": "<div style=\"display: flex; justify-content: center; padding: 20px;\">\n  <button class=\"comp-shimmer-btn\">\n    <span class=\"shimmer-sweep\"></span>\n    <span class=\"shimmer-text\">Generar con Sangar IA ✨</span>\n  </button>\n</div>",
    "codeHtml": "<!-- HTML & CSS Shimmer Button -->\n<button class=\"shimmer-button\">\n  <span class=\"shimmer-effect\"></span>\n  <span>Crear Proyecto 🚀</span>\n</button>\n\n<style>\n.shimmer-button {\n  position: relative;\n  overflow: hidden;\n  background: #181b29;\n  color: #fff;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  border-radius: 12px;\n  padding: 14px 28px;\n  font-weight: 600;\n  cursor: pointer;\n}\n.shimmer-effect {\n  position: absolute;\n  top: 0; left: -100%; width: 100%; height: 100%;\n  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);\n  animation: shimmerSweep 2.5s infinite;\n}\n@keyframes shimmerSweep {\n  100% { left: 100%; }\n}\n</style>",
    "codeReact": "// React + Tailwind Shimmer Button\nexport const ShimmerButton = ({ text = \"Generar con Sangar IA ✨\", onClick }) => (\n  <button\n    onClick={onClick}\n    className=\"group relative overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 px-6 py-3 font-medium text-white transition-all hover:border-neutral-500 active:scale-95\"\n  >\n    <div className=\"absolute -inset-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent\" />\n    <span className=\"relative z-10 flex items-center gap-2\">{text}</span>\n  </button>\n);"
  },
  {
    "id": "canvas-loop-recorder",
    "name": "Canvas Loop 30fps & Video Recorder",
    "category": "animation",
    "tags": [
      "Canvas HTML5",
      "MediaRecorder",
      "Interactive Loop",
      "30 FPS"
    ],
    "description": "Lienzo de animación matemática en bucle perfecto de 120 cuadros con renderizado determinista y exportación de video nativa mediante canvas.captureStream(30) y MediaRecorder.",
    "promptAgent": "Crea una aplicación de animación en HTML5 Canvas con bucle matemático perfecto de 120 fotogramas a 30 fps (4 segundos). El render debe calcularse estrictamente a partir del número de cuadro (frame % 120) para garantizar determinismo sin saltos. Añade un botón que capture el stream del canvas usando canvas.captureStream(30) y MediaRecorder, acumulando los chunks para permitir la descarga directa de un archivo de vídeo .webm listo para compartir en redes sociales.",
    "previewHtml": "<div class=\"comp-canvas-recorder-card\" style=\"background: #111420; border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.08); text-align: center;\">\n  <div style=\"position: relative; width: 100%; max-width: 240px; margin: 0 auto 16px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,126,103,0.3); background: #0b0c10;\">\n    <canvas id=\"demoLoopCanvas\" width=\"240\" height=\"240\" style=\"display: block; width: 100%; aspect-ratio: 1/1;\"></canvas>\n    <span style=\"position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.7); font-size: 10px; padding: 2px 8px; border-radius: 9999px; color: #FF7E67; font-family: monospace;\">● 120f Loop</span>\n  </div>\n  <button type=\"button\" id=\"btnDemoRecordCanvas\" class=\"sg-btn sg-btn--primary sg-btn--sm\" style=\"margin: 0 auto;\">\n    <i data-lucide=\"video\"></i> Grabar 4s Video\n  </button>\n</div>",
    "codeHtml": "<!-- HTML5 Canvas con bucle determinista y grabador de vídeo WebM -->\n<div class=\"canvas-box\">\n  <canvas id=\"loopCanvas\" width=\"1080\" height=\"1920\"></canvas>\n  <button id=\"recordBtn\" class=\"btn-record\">Grabar 4s Video</button>\n</div>\n\n<script>\nconst canvas = document.getElementById(\"loopCanvas\");\nconst ctx = canvas.getContext(\"2d\");\nlet frame = 0;\nconst totalFrames = 120;\n\nfunction render() {\n  const f = frame % totalFrames;\n  const progress = f / totalFrames;\n  ctx.fillStyle = \"#0f111a\";\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n  const angle = progress * Math.PI * 2;\n  const cx = canvas.width / 2 + Math.cos(angle) * 150;\n  const cy = canvas.height / 2 + Math.sin(angle) * 80;\n  ctx.fillStyle = \"#FF7E67\";\n  ctx.beginPath();\n  ctx.arc(cx, cy, 60, 0, Math.PI * 2);\n  ctx.fill();\n  frame++;\n  requestAnimationFrame(render);\n}\nrequestAnimationFrame(render);\n\ndocument.getElementById(\"recordBtn\").onclick = () => {\n  frame = 0;\n  const stream = canvas.captureStream(30);\n  const recorder = new MediaRecorder(stream, { mimeType: \"video/webm\" });\n  const chunks = [];\n  recorder.ondataavailable = e => chunks.push(e.data);\n  recorder.onstop = () => {\n    const blob = new Blob(chunks, { type: \"video/webm\" });\n    const a = document.createElement(\"a\");\n    a.href = URL.createObjectURL(blob);\n    a.download = \"animacion-bucle.webm\";\n    a.click();\n  };\n  recorder.start();\n  setTimeout(() => recorder.stop(), 4000);\n};\n</script>",
    "codeReact": "// React + HTML5 Canvas Loop Recorder Hook\nimport React, { useRef, useEffect, useState } from \"react\";\n\nexport const CanvasLoopRecorder = () => {\n  const canvasRef = useRef(null);\n  const [recording, setRecording] = useState(false);\n\n  useEffect(() => {\n    const canvas = canvasRef.current;\n    if (!canvas) return;\n    const ctx = canvas.getContext(\"2d\");\n    let f = 0;\n    let handle;\n    const loop = () => {\n      const p = (f % 120) / 120;\n      ctx.fillStyle = \"#0f111a\";\n      ctx.fillRect(0, 0, canvas.width, canvas.height);\n      ctx.fillStyle = \"#FF7E67\";\n      ctx.beginPath();\n      ctx.arc(120 + Math.cos(p * Math.PI * 2) * 40, 120 + Math.sin(p * Math.PI * 2) * 20, 24, 0, Math.PI * 2);\n      ctx.fill();\n      f++;\n      handle = requestAnimationFrame(loop);\n    };\n    handle = requestAnimationFrame(loop);\n    return () => cancelAnimationFrame(handle);\n  }, []);\n\n  const handleRecord = () => {\n    setRecording(true);\n    const stream = canvasRef.current.captureStream(30);\n    const rec = new MediaRecorder(stream, { mimeType: \"video/webm\" });\n    const chunks = [];\n    rec.ondataavailable = (e) => chunks.push(e.data);\n    rec.onstop = () => {\n      const url = URL.createObjectURL(new Blob(chunks, { type: \"video/webm\" }));\n      const a = document.createElement(\"a\");\n      a.href = url;\n      a.download = \"loop-4s.webm\";\n      a.click();\n      setRecording(false);\n    };\n    rec.start();\n    setTimeout(() => rec.stop(), 4000);\n  };\n\n  return (\n    <div className=\"flex flex-col items-center gap-4 rounded-2xl bg-neutral-900 p-6 border border-neutral-800\">\n      <canvas ref={canvasRef} width={240} height={240} className=\"rounded-xl border border-neutral-800\" />\n      <button onClick={handleRecord} disabled={recording} className=\"rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50\">\n        {recording ? \"Grabando 4 segundos...\" : \"Grabar Video 4s (MediaRecorder)\"}\n      </button>\n    </div>\n  );\n};"
  },
  {
    "id": "taste-skill-badge",
    "name": "Taste Skill Design Quality Badge",
    "category": "cards",
    "tags": [
      "Design System",
      "Taste Skill",
      "Microinteraction",
      "Quality Metric"
    ],
    "description": "Insignia de calidad de diseño con microinteracción de pulso magnético y medidor de fidelidad tipográfica anti-genérica para páginas web y dashboards.",
    "promptAgent": "Crea una insignia 'TasteSkillBadge' en React con Tailwind CSS. Debe mostrar una píldora translúcida con borde fino de acento (#FF7E67 / orange-500), un punto indicador con pulso lumínico infinito (shadow glow con keyframes), el título de certificación en tipografía sans refinada y un badge monospace con el porcentaje de métrica anti-genérica.",
    "previewHtml": "<div class=\"comp-taste-badge-demo\" style=\"display: inline-flex; align-items: center; gap: 10px; background: rgba(255,126,103,0.08); border: 1px solid rgba(255,126,103,0.3); border-radius: 9999px; padding: 8px 18px;\">\n  <span style=\"display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #FF7E67; box-shadow: 0 0 10px #FF7E67;\"></span>\n  <span style=\"font-family: var(--font-heading); font-size: 13px; font-weight: 600; color: #FFF;\">Taste Skill Certified</span>\n  <span style=\"font-family: monospace; font-size: 11px; background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 6px; color: #FF7E67;\">99.4% Anti-Generic</span>\n</div>",
    "codeHtml": "<!-- HTML & CSS Taste Skill Quality Badge -->\n<div class=\"taste-badge\">\n  <span class=\"pulse-dot\"></span>\n  <span class=\"badge-title\">Taste Skill Certified</span>\n  <span class=\"badge-score\">99.4% Anti-Generic</span>\n</div>\n\n<style>\n.taste-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 10px;\n  background: rgba(255, 126, 103, 0.08);\n  border: 1px solid rgba(255, 126, 103, 0.3);\n  border-radius: 9999px;\n  padding: 8px 18px;\n  backdrop-filter: blur(12px);\n  transition: all 0.2s ease;\n}\n.pulse-dot {\n  width: 8px; height: 8px;\n  border-radius: 50%;\n  background: #FF7E67;\n  box-shadow: 0 0 8px #FF7E67;\n  animation: pulseGlow 2s infinite;\n}\n@keyframes pulseGlow {\n  0%, 100% { opacity: 1; transform: scale(1); }\n  50% { opacity: 0.5; transform: scale(0.85); }\n}\n.badge-title { color: #fff; font-size: 13px; font-weight: 600; }\n.badge-score {\n  font-family: monospace;\n  font-size: 11px;\n  background: rgba(255, 255, 255, 0.08);\n  padding: 2px 8px;\n  border-radius: 6px;\n  color: #FF7E67;\n}\n</style>",
    "codeReact": "// React + Tailwind Taste Skill Badge\nexport const TasteSkillBadge = ({ score = \"99.4%\" }) => (\n  <div className=\"group inline-flex items-center gap-2.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 backdrop-blur-md transition-all hover:border-orange-500 hover:shadow-[0_0_20px_rgba(255,126,103,0.25)]\">\n    <span className=\"h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_#ff7e67] animate-pulse\" />\n    <span className=\"text-xs font-semibold text-white\">Taste Skill Certified</span>\n    <span className=\"rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-orange-400\">\n      {score} Anti-Generic\n    </span>\n  </div>\n);"
  },
  {
    "id": "aurora-background",
    "name": "Aurora Mesh Gradient Background",
    "category": "backgrounds",
    "tags": [
      "Backgrounds",
      "Aurora",
      "Glow",
      "Mesh Gradient",
      "Animation"
    ],
    "description": "Fondo atmosférico de aurora boreal con gradientes fluidos orgánicos en movimiento continuo, desenfoque profundo y capas translúcidas para landing pages modernas.",
    "promptAgent": "Crea un componente 'AuroraBackground' en React con Tailwind CSS. Debe implementar un contenedor relativo con overflow-hidden y una capa de fondo con múltiples esferas de gradiente elípticas animadas con keyframes que se muevan suavemente en trayectorias orgánicas con blur intenso (filter: blur(80px)). Colores de aurora: violeta (#8B5CF6), cian (#06B6D4) y coral cálido (#FF7E67) sobre un lienzo oscuro (#0B0C10) para crear una atmósfera inmersiva de alta tecnología.",
    "previewHtml": "<div class=\"comp-aurora-box\" id=\"demoAuroraBox\" style=\"position: relative; width: 100%; height: 160px; border-radius: 14px; overflow: hidden; background: #0B0C10; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.08);\">\n  <div class=\"comp-aurora-blob blob-1\" style=\"position: absolute; width: 140px; height: 140px; background: rgba(255,126,103,0.45); filter: blur(40px); border-radius: 50%; top: -20px; left: 10%;\"></div>\n  <div class=\"comp-aurora-blob blob-2\" style=\"position: absolute; width: 160px; height: 160px; background: rgba(139,92,246,0.4); filter: blur(45px); border-radius: 50%; bottom: -30px; right: 15%;\"></div>\n  <div style=\"position: relative; z-index: 2; text-align: center; color: #FFF;\">\n    <strong style=\"display:block; font-size: 15px;\">Aurora Atmospheric Glow</strong>\n    <span style=\"font-size: 11px; color: rgba(255,255,255,0.65);\">Mesh gradient orgánico continuo</span>\n  </div>\n</div>",
    "codeHtml": "<!-- HTML & CSS Aurora Mesh Gradient -->\n<div class=\"aurora-container\">\n  <div class=\"aurora-blob blob-coral\"></div>\n  <div class=\"aurora-blob blob-violet\"></div>\n  <div class=\"aurora-content\">\n    <h2>Aurora Glow Background</h2>\n  </div>\n</div>\n\n<style>\n.aurora-container {\n  position: relative;\n  background: #0b0c10;\n  overflow: hidden;\n  border-radius: 16px;\n  padding: 40px;\n}\n.aurora-blob {\n  position: absolute;\n  border-radius: 50%;\n  filter: blur(60px);\n  opacity: 0.6;\n  animation: floatAurora 8s ease-in-out infinite alternate;\n}\n.blob-coral { width: 300px; height: 300px; background: #FF7E67; top: -50px; left: 20%; }\n.blob-violet { width: 350px; height: 350px; background: #8B5CF6; bottom: -80px; right: 20%; animation-delay: -4s; }\n@keyframes floatAurora {\n  0% { transform: translate(0, 0) scale(1); }\n  100% { transform: translate(40px, 30px) scale(1.15); }\n}\n</style>",
    "codeReact": "// React + Tailwind Aurora Background\nimport React from \"react\";\n\nexport const AuroraBackground = ({ children }) => (\n  <div className=\"relative overflow-hidden rounded-3xl bg-[#0B0C10] p-8 border border-white/10\">\n    <div className=\"pointer-events-none absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-orange-500/35 blur-3xl animate-[pulse_6s_ease-in-out_infinite]\" />\n    <div className=\"pointer-events-none absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-purple-600/30 blur-3xl animate-[pulse_8s_ease-in-out_infinite_delay-1000]\" />\n    <div className=\"relative z-10\">{children}</div>\n  </div>\n);"
  },
  {
    "id": "bento-grid",
    "name": "Interactive Bento Showcase Grid",
    "category": "cards",
    "tags": [
      "Bento",
      "Layout",
      "Grid",
      "Interactive",
      "Showcase"
    ],
    "description": "Distribución asimétrica inspirada en Bento grids con tarjetas modulares de distintas proporciones, micro-glows y estadísticas destacadas.",
    "promptAgent": "Crea un componente 'BentoGrid' responsivo en React con Tailwind CSS. Debe usar una cuadrícula CSS 'grid-cols-1 md:grid-cols-3 gap-4' con tarjetas de proporciones 1x1 y 2x1 (col-span-2). Cada tarjeta bento debe contar con borde oscuro translúcido (border-white/10), hover con sutil brillo de acento (#FF7E67), badge superior, tipografía con alto contraste y espacio para métricas visuales o gráficos.",
    "previewHtml": "<div class=\"comp-bento-preview\" style=\"display: grid; grid-template-columns: 2fr 1fr; gap: 10px; width: 100%;\">\n  <div style=\"background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px;\">\n    <span style=\"font-size: 10px; color: #FF7E67; font-weight: 600;\">FEATURE HIGHLIGHT</span>\n    <h4 style=\"margin: 4px 0 2px; font-size: 14px; color: #FFF;\">AI Motion Engine</h4>\n    <p style=\"font-size: 11px; color: rgba(255,255,255,0.5); margin: 0;\">Generación paramétrica 4K.</p>\n  </div>\n  <div style=\"background: rgba(255,126,103,0.08); border: 1px solid rgba(255,126,103,0.25); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; justify-content: center; text-align: center;\">\n    <span style=\"font-size: 20px; font-weight: 800; color: #FF7E67;\">99.8%</span>\n    <span style=\"font-size: 10px; color: rgba(255,255,255,0.6);\">Precisión</span>\n  </div>\n</div>",
    "codeHtml": "<!-- HTML & CSS Bento Grid -->\n<div class=\"bento-grid\">\n  <div class=\"bento-card col-span-2\">\n    <span class=\"badge\">NÚCLEO IA</span>\n    <h3>Motor de Motion Graphics</h3>\n    <p>Pipeline automatizado en 4K.</p>\n  </div>\n  <div class=\"bento-card stat-card\">\n    <h3>+27</h3>\n    <p>Prompts de Producción</p>\n  </div>\n</div>\n\n<style>\n.bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }\n.bento-card {\n  background: #111420;\n  border: 1px solid rgba(255,255,255,0.08);\n  border-radius: 16px;\n  padding: 24px;\n  transition: border-color 0.2s;\n}\n.bento-card:hover { border-color: #FF7E67; }\n.col-span-2 { grid-column: span 2; }\n</style>",
    "codeReact": "// React + Tailwind Bento Grid\nexport const BentoGrid = () => (\n  <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">\n    <div className=\"md:col-span-2 rounded-2xl border border-white/10 bg-neutral-900/80 p-6 hover:border-orange-500/50 transition-colors\">\n      <span className=\"text-xs font-semibold text-orange-400\">FEATURE</span>\n      <h3 className=\"mt-1 text-lg font-bold text-white\">AI Motion Engine</h3>\n      <p className=\"mt-1 text-sm text-neutral-400\">Generación y renderizado en alta resolución.</p>\n    </div>\n    <div className=\"rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6 flex flex-col justify-center items-center text-center\">\n      <span className=\"text-3xl font-extrabold text-orange-400\">+27</span>\n      <span className=\"text-xs text-neutral-300 mt-1\">Prompts Curados</span>\n    </div>\n  </div>\n);"
  },
  {
    "id": "shader-canvas",
    "name": "WebGL Interactive Shader Canvas",
    "category": "backgrounds",
    "tags": [
      "Shader",
      "WebGL",
      "GLSL",
      "Backgrounds",
      "Canvas"
    ],
    "description": "Lienzo WebGL en tiempo real con shader de fragmentos (GLSL) que genera ondas lumínicas continuas interactuando con las coordenadas del ratón.",
    "promptAgent": "Crea un componente 'ShaderCanvas' en React utilizando WebGL plano con Three.js o WebGL nativo. Debe inicializar un plano de pantalla completa con un vertex shader estándar y un fragment shader GLSL con variables uniformes para u_time, u_resolution y u_mouse. El shader debe renderizar ondas de plasma o caústicas fluidas con tonos cálidos (#FF7E67) y oscuros (#0B0C10), adaptándose automáticamente a cambios de resolución (resize) con optimización de FPS.",
    "previewHtml": "<div class=\"comp-shader-preview\" style=\"position: relative; width: 100%; height: 140px; border-radius: 12px; overflow: hidden; background: #0B0C10; border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center;\">\n  <div style=\"position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(255,126,103,0.35), transparent 70%), repeating-radial-gradient(circle at 20% 80%, rgba(139,92,246,0.3) 0px, transparent 40px); filter: blur(20px); animation: pulseShader 4s ease infinite alternate;\"></div>\n  <span style=\"position: relative; z-index: 2; font-family: monospace; font-size: 12px; color: #FFF; background: rgba(0,0,0,0.6); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);\">WebGL GLSL Shader • Active</span>\n</div>",
    "codeHtml": "<!-- HTML & WebGL Shader Setup -->\n<canvas id=\"shaderCanvas\" style=\"width: 100%; height: 300px; display: block;\"></canvas>\n\n<script>\n// Shader canvas minimal loop\nconst canvas = document.getElementById(\"shaderCanvas\");\nconst gl = canvas.getContext(\"webgl\");\n// Setup vertex & fragment shaders with u_time\n</script>",
    "codeReact": "// React Shader Canvas Wrapper\nimport React, { useRef, useEffect } from \"react\";\n\nexport const ShaderCanvas = () => {\n  const canvasRef = useRef(null);\n  useEffect(() => {\n    // WebGL Context & GLSL Shader init logic\n  }, []);\n  return <canvas ref={canvasRef} className=\"w-full h-64 rounded-2xl border border-white/10\" />;\n};"
  },
  {
    "id": "scroll-expansion",
    "name": "Scroll Expansion Hero Banner",
    "category": "cards",
    "tags": [
      "Hero",
      "Scroll",
      "Expansion",
      "Animation",
      "Interactive"
    ],
    "description": "Contenedor de tarjeta hero interactivo que se expande suavemente en tamaño y escala al hacer clic o al desplazarse, revelando contenido inmersivo.",
    "promptAgent": "Crea un componente 'ScrollExpansionHero' en React con Tailwind CSS y Framer Motion. Debe comenzar en una escala compacta centrada (max-w-md, rounded-2xl) y expandirse de forma fluida a pantalla completa o max-w-5xl (rounded-none o rounded-3xl) al interactuar o mediante scroll con useScroll() y useTransform(). Debe incluir una imagen de fondo o video con máscara de recorte y texto de cabecera que mantenga la legibilidad en cualquier punto de la transición.",
    "previewHtml": "<div class=\"comp-expansion-demo\" id=\"demoExpandHero\" style=\"cursor: pointer; background: linear-gradient(135deg, rgba(255,126,103,0.15), rgba(18,20,30,0.9)); border: 1px solid rgba(255,126,103,0.3); border-radius: 14px; padding: 20px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);\">\n  <div style=\"display: flex; justify-content: space-between; align-items: center;\">\n    <div>\n      <span style=\"font-size: 10px; color: #FF7E67; font-weight: 700; text-transform: uppercase;\">Interactiva</span>\n      <h3 style=\"margin: 2px 0; font-size: 15px; color: #FFF;\">Hero Expansible</h3>\n      <p style=\"margin: 0; font-size: 11px; color: rgba(255,255,255,0.6);\">Haz clic para alternar escala expandida.</p>\n    </div>\n    <span style=\"font-size: 18px;\">⤢</span>\n  </div>\n</div>",
    "codeHtml": "<!-- HTML & CSS Expansion Card -->\n<div class=\"expand-card\" onclick=\"this.classList.toggle('expanded')\">\n  <div class=\"card-inner\">\n    <h3>Click to Expand Hero</h3>\n  </div>\n</div>\n\n<style>\n.expand-card {\n  max-width: 380px;\n  border-radius: 16px;\n  background: #111420;\n  border: 1px solid rgba(255,255,255,0.1);\n  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);\n  cursor: pointer;\n}\n.expand-card.expanded {\n  max-width: 100%;\n  border-color: #FF7E67;\n}\n</style>",
    "codeReact": "// React + Framer Motion Expansion Card\nimport React, { useState } from \"react\";\nimport { motion } from \"framer-motion\";\n\nexport const ScrollExpansionHero = ({ title = \"Hero Inmersivo\" }) => {\n  const [expanded, setExpanded] = useState(false);\n  return (\n    <motion.div\n      layout\n      onClick={() => setExpanded(!expanded)}\n      className={`cursor-pointer overflow-hidden border border-white/10 bg-neutral-900 transition-all ${\n        expanded ? \"w-full rounded-3xl p-10\" : \"max-w-md rounded-2xl p-6\"\n      }`}\n    >\n      <h2 className=\"text-xl font-bold text-white\">{title}</h2>\n      <p className=\"text-sm text-neutral-400 mt-2\">Haz clic para contraer o expandir.</p>\n    </motion.div>\n  );\n};"
  },
  {
    "id": "glowing-badge",
    "name": "Pulse Glowing Status Badge",
    "category": "buttons",
    "tags": [
      "Badges",
      "Status",
      "Glow",
      "Pulse",
      "Microinteraction"
    ],
    "description": "Insignia de estado en vivo con micro-indicador pulsante, resplandor radial en borde y respuesta háptica visual.",
    "promptAgent": "Crea un componente 'GlowingStatusBadge' en React con Tailwind CSS. Debe aceptar props para 'status' ('live', 'beta', 'ready'), 'text' y 'variant'. Debe renderizar una píldora con fondo semitransparente, un punto de estado con animación de pulso concéntrico (ping + pulse), borde con halo reactivo y soporte de foco accesible para lectura de pantalla.",
    "previewHtml": "<div style=\"display: flex; gap: 10px; align-items: center; justify-content: center; padding: 10px;\">\n  <span class=\"sg-badge sg-badge--coral\" style=\"display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 12px; border-radius: 9999px;\">\n    <span style=\"display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #FF7E67; box-shadow: 0 0 8px #FF7E67; animation: pulse 1.5s infinite;\"></span>\n    <span>Producción Lista</span>\n  </span>\n  <span class=\"sg-badge\" style=\"display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 12px; border-radius: 9999px;\">\n    <span style=\"display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981;\"></span>\n    <span>Agente Conectado</span>\n  </span>\n</div>",
    "codeHtml": "<!-- HTML & CSS Glowing Status Badge -->\n<span class=\"glowing-badge\">\n  <span class=\"glow-dot\"></span>\n  <span class=\"glow-text\">Sistema En Línea</span>\n</span>\n\n<style>\n.glowing-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  padding: 6px 14px;\n  border-radius: 9999px;\n  background: rgba(255, 126, 103, 0.1);\n  border: 1px solid rgba(255, 126, 103, 0.3);\n  color: #fff;\n  font-size: 12px;\n  font-weight: 600;\n}\n.glow-dot {\n  width: 6px; height: 6px;\n  border-radius: 50%;\n  background: #FF7E67;\n  box-shadow: 0 0 8px #FF7E67;\n  animation: pulseDot 2s infinite;\n}\n@keyframes pulseDot { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.75); opacity: 0.6; } }\n</style>",
    "codeReact": "// React + Tailwind Glowing Badge\nexport const GlowingBadge = ({ label = \"En Vivo\", color = \"orange\" }) => (\n  <div className=\"inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md\">\n    <span className=\"relative flex h-2 w-2\">\n      <span className=\"absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75\" />\n      <span className=\"relative inline-flex h-2 w-2 rounded-full bg-orange-500\" />\n    </span>\n    <span>{label}</span>\n  </div>\n);"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  syncFavBadge();
  initSuiteSwitching();
  setupMoxenModal();

  loadComponents().then(() => {
    const countPill = document.getElementById('compCountPill');
    if (countPill) {
      countPill.innerHTML = `<i data-lucide="layers"></i> ${componentsData.length} Componentes Curados`;
    }
    const badgeSangar = document.getElementById('countBadgeSangar');
    if (badgeSangar) {
      badgeSangar.textContent = componentsData.length;
    }
    renderComponentsShowcase(componentsData);
    setupFilters();
    registerComponentsInCmd();
    if (window.SangarShell) window.SangarShell.renderIcons();
  });

  loadMoxenComponents();
});

function syncFavBadge() {
  const badge = document.getElementById('favCountBadge');
  if (!badge) return;
  try {
    const raw = localStorage.getItem('sangar_library_favorites');
    const favs = raw ? JSON.parse(raw) : [];
    badge.textContent = Array.isArray(favs) ? favs.length : 0;
  } catch (_) {
    badge.textContent = '0';
  }
}

async function loadComponents() {
  try {
    const res = await fetch('data/ui-components.json');
    if (res.ok) {
      componentsData = await res.json();
    } else {
      componentsData = FALLBACK_COMPONENTS;
    }
  } catch (e) {
    componentsData = FALLBACK_COMPONENTS;
  }
}

function renderComponentsShowcase(items) {
  const grid = document.getElementById('componentsShowcaseGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="sg-empty" style="grid-column: 1 / -1;">
        <div class="sg-empty__img"><i data-lucide="layers"></i></div>
        <div class="sg-empty__title">No se encontraron componentes</div>
        <p class="sg-empty__desc">Prueba con otro término de búsqueda o selecciona otra categoría de la galería.</p>
      </div>
    `;
    if (window.SangarShell) window.SangarShell.renderIcons(grid);
    return;
  }

  items.forEach(comp => {
    const card = document.createElement('article');
    card.className = 'component-showcase-card';
    card.id = `comp-${comp.id}`;
    card.innerHTML = `
      <div class="comp-card-header">
        <div class="comp-card-title">
          <h2>${escapeHtml(comp.name)}</h2>
          <p>${escapeHtml(comp.description)}</p>
        </div>
        <div class="comp-tabs-switch" data-comp-id="${escapeHtml(comp.id)}" role="tablist" aria-label="Vista de ${escapeHtml(comp.name)}">
          <button type="button" class="comp-tab-btn active" data-view="preview" role="tab" aria-selected="true">Vista Previa</button>
          <button type="button" class="comp-tab-btn" data-view="prompt-agent" role="tab" aria-selected="false">Prompt Agente 🤖</button>
          <button type="button" class="comp-tab-btn" data-view="code-html" role="tab" aria-selected="false">HTML / CSS</button>
          <button type="button" class="comp-tab-btn" data-view="code-react" role="tab" aria-selected="false">React</button>
        </div>
      </div>

      <!-- Preview Stage -->
      <div class="comp-preview-stage" id="preview-stage-${escapeHtml(comp.id)}">
        ${comp.previewHtml}
      </div>

      <!-- Prompt Agent Stage -->
      <div class="comp-code-stage" id="prompt-agent-stage-${escapeHtml(comp.id)}">
        <div class="code-subtabs">
          <span class="code-type-pill" style="color: #FF9E8A; border-color: rgba(255, 126, 103, 0.35);">
            <i data-lucide="sparkles"></i> Prompt para Claude Code, Cursor & v0
          </span>
          <button type="button" class="btn-copy-mini btn-copy-agent-direct" data-comp-id="${escapeHtml(comp.id)}">
            <i data-lucide="bot"></i> Copiar Prompt
          </button>
        </div>
        <pre class="comp-code-block" style="white-space: pre-wrap; font-family: var(--font-body, inherit); font-size: 13px; line-height: 1.6; color: #F0ECE8;"><code>${escapeHtml(comp.promptAgent || comp.description)}</code></pre>
      </div>

      <!-- Code Stage (HTML) -->
      <div class="comp-code-stage" id="code-html-stage-${escapeHtml(comp.id)}">
        <div class="code-subtabs">
          <span class="code-type-pill">HTML + CSS + Vanilla JS</span>
          <button type="button" class="btn-copy-mini btn-copy-code" data-code-type="html" data-comp-id="${escapeHtml(comp.id)}">
            <i data-lucide="copy"></i> Copiar Código
          </button>
        </div>
        <pre class="comp-code-block"><code>${escapeHtml(comp.codeHtml)}</code></pre>
      </div>

      <!-- Code Stage (React) -->
      <div class="comp-code-stage" id="code-react-stage-${escapeHtml(comp.id)}">
        <div class="code-subtabs">
          <span class="code-type-pill">React + Tailwind CSS</span>
          <button type="button" class="btn-copy-mini btn-copy-code" data-code-type="react" data-comp-id="${escapeHtml(comp.id)}">
            <i data-lucide="copy"></i> Copiar Código
          </button>
        </div>
        <pre class="comp-code-block"><code>${escapeHtml(comp.codeReact)}</code></pre>
      </div>

      <div class="comp-card-footer">
        <div class="card-tags">
          ${(comp.tags || []).map(t => `<span class="tag-badge">#${escapeHtml(t)}</span>`).join('')}
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" class="sg-btn sg-btn--primary sg-btn--sm btn-card-copy-agent" data-comp-id="${escapeHtml(comp.id)}">
            <i data-lucide="bot"></i> Prompt Agente
          </button>
          <button type="button" class="sg-btn sg-btn--secondary sg-btn--sm btn-copy-footer" data-comp-id="${escapeHtml(comp.id)}">
            <i data-lucide="copy"></i> Código
          </button>
        </div>
      </div>
    `;

    // View Switching logic (Preview / Prompt Agente / HTML / React)
    const tabs = card.querySelectorAll('.comp-tab-btn');
    const prevStage = card.querySelector(`#preview-stage-${comp.id}`);
    const agentStage = card.querySelector(`#prompt-agent-stage-${comp.id}`);
    const htmlStage = card.querySelector(`#code-html-stage-${comp.id}`);
    const reactStage = card.querySelector(`#code-react-stage-${comp.id}`);

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const view = tab.getAttribute('data-view');
        prevStage.style.display = view === 'preview' ? 'flex' : 'none';
        agentStage.classList.toggle('active', view === 'prompt-agent');
        htmlStage.classList.toggle('active', view === 'code-html');
        reactStage.classList.toggle('active', view === 'code-react');
      });
    });

    // Copy Agent Prompt buttons
    const copyAgentPrompt = () => {
      const promptText = comp.promptAgent || comp.description;
      copyText(promptText, `Prompt de agente copiado: ${comp.name} 🤖`);
    };

    card.querySelectorAll('.btn-copy-agent-direct, .btn-card-copy-agent').forEach(btn => {
      btn.addEventListener('click', copyAgentPrompt);
    });

    // Copy Code buttons
    card.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-code-type');
        const code = type === 'react' ? comp.codeReact : comp.codeHtml;
        copyText(code, `Código ${type.toUpperCase()} copiado: ${comp.name}`);
      });
    });

    card.querySelector('.btn-copy-footer').addEventListener('click', () => {
      const activeTab = card.querySelector('.comp-tab-btn.active')?.getAttribute('data-view');
      const code = activeTab === 'code-react' ? comp.codeReact : comp.codeHtml;
      copyText(code, `Código copiado: ${comp.name}`);
    });

    grid.appendChild(card);
  });

  if (window.SangarShell) window.SangarShell.renderIcons(grid);

  // Re-bind interactive micro-interactions for live demos
  attachInteractiveDemos();
}

/**
 * Attach live events for mouse tracking, tilt, scramble, magnetic button, dock, canvas recorder, hero expand
 */
function attachInteractiveDemos() {
  // 1. Spotlight Card Tracker
  const spotlightCard = document.getElementById('spotlightCardDemo');
  if (spotlightCard) {
    spotlightCard.addEventListener('mousemove', (e) => {
      const rect = spotlightCard.getBoundingClientRect();
      spotlightCard.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      spotlightCard.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  }

  // 2. Text Scramble
  const scrambleEl = document.getElementById('demoScrambleText');
  if (scrambleEl) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    const originalText = scrambleEl.getAttribute('data-value');
    let interval = null;

    scrambleEl.addEventListener('mouseenter', () => {
      let iteration = 0;
      clearInterval(interval);
      interval = setInterval(() => {
        scrambleEl.innerText = originalText.split('')
          .map((char, index) => {
            if (index < iteration) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        if (iteration >= originalText.length) {
          clearInterval(interval);
        }
        iteration += 1 / 3;
      }, 30);
    });
  }

  // 3. Magnetic Button
  const magWrap = document.getElementById('magneticContainerDemo');
  const magBtn = document.getElementById('magneticBtnDemo');
  if (magWrap && magBtn) {
    magWrap.addEventListener('mousemove', (e) => {
      const rect = magWrap.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
      magBtn.style.transform = `translate(${x}px, ${y}px) scale(1.06)`;
    });

    magWrap.addEventListener('mouseleave', () => {
      magBtn.style.transform = 'translate(0px, 0px) scale(1)';
    });
  }

  // 4. 3D Tilt Card
  const tiltWrap = document.getElementById('tiltCardWrapDemo');
  const tiltCard = document.getElementById('tiltCardDemo');
  if (tiltWrap && tiltCard) {
    tiltWrap.addEventListener('mousemove', (e) => {
      const rect = tiltWrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xRot = ((y - rect.height / 2) / rect.height) * -22;
      const yRot = ((x - rect.width / 2) / rect.width) * 22;
      tiltCard.style.transform = `rotateX(${xRot}deg) rotateY(${yRot}deg) scale3d(1.05, 1.05, 1.05)`;
    });

    tiltWrap.addEventListener('mouseleave', () => {
      tiltCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  // 5. Dynamic Island Expand/Collapse
  const island = document.getElementById('dynamicIslandDemo');
  if (island) {
    island.addEventListener('click', () => {
      island.classList.toggle('expanded');
      const collapsed = island.querySelector('.island-collapsed');
      const expanded = island.querySelector('.island-expanded');
      if (island.classList.contains('expanded')) {
        collapsed.style.display = 'none';
        expanded.style.display = 'block';
      } else {
        collapsed.style.display = 'flex';
        expanded.style.display = 'none';
      }
    });
  }

  // 6. Canvas Loop 30fps & Recorder Demo
  const loopCanvas = document.getElementById('demoLoopCanvas');
  const recordBtn = document.getElementById('btnDemoRecordCanvas');
  if (loopCanvas && !loopCanvas._hasLoop) {
    loopCanvas._hasLoop = true;
    const ctx = loopCanvas.getContext('2d');
    let frame = 0;
    const totalFrames = 120;

    function renderLoop() {
      const f = frame % totalFrames;
      const progress = f / totalFrames;
      ctx.fillStyle = '#0b0c10';
      ctx.fillRect(0, 0, loopCanvas.width, loopCanvas.height);

      const angle = progress * Math.PI * 2;
      const cx = loopCanvas.width / 2 + Math.cos(angle) * 45;
      const cy = loopCanvas.height / 2 + Math.sin(angle) * 30;

      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(255, 126, 103, 0.6)';
      ctx.fillStyle = '#FF7E67';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      frame++;
      requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);

    if (recordBtn && !recordBtn._hasListener) {
      recordBtn._hasListener = true;
      recordBtn.addEventListener('click', () => {
        if (!window.MediaRecorder || typeof loopCanvas.captureStream !== 'function') {
          alert('MediaRecorder o captureStream no está disponible en este navegador.');
          return;
        }
        const origText = recordBtn.innerHTML;
        recordBtn.innerHTML = '<i data-lucide="loader"></i> Grabando 4s...';
        recordBtn.disabled = true;
        if (window.SangarShell) window.SangarShell.renderIcons(recordBtn);

        frame = 0;
        const stream = loopCanvas.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'sangar-canvas-loop-4s.webm';
          a.click();
          recordBtn.innerHTML = origText;
          recordBtn.disabled = false;
          if (window.SangarShell) window.SangarShell.renderIcons(recordBtn);
        };
        recorder.start();
        setTimeout(() => recorder.stop(), 4000);
      });
    }
  }

  // 7. Scroll Expansion Hero Demo
  const expandHero = document.getElementById('demoExpandHero');
  if (expandHero && !expandHero._hasListener) {
    expandHero._hasListener = true;
    expandHero.addEventListener('click', () => {
      expandHero.classList.toggle('is-expanded');
      if (expandHero.classList.contains('is-expanded')) {
        expandHero.style.borderColor = '#FF7E67';
        expandHero.style.boxShadow = '0 0 25px rgba(255,126,103,0.3)';
        expandHero.style.transform = 'scale(1.02)';
      } else {
        expandHero.style.borderColor = 'rgba(255,126,103,0.3)';
        expandHero.style.boxShadow = 'none';
        expandHero.style.transform = 'scale(1)';
      }
    });
  }
}

function setupFilters() {
  const searchInput = document.getElementById('compSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  const pills = document.querySelectorAll('#compCategoryPills .sg-filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      applyFilters();
    });
  });
}

function applyFilters() {
  const query = document.getElementById('compSearchInput')?.value.toLowerCase().trim() || '';
  const activeCat = document.querySelector('#compCategoryPills .sg-filter-pill.is-active')?.getAttribute('data-cat') || 'all';

  const filtered = componentsData.filter(item => {
    const matchesCat = (activeCat === 'all' || item.category === activeCat);
    const matchesQuery = !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      (item.promptAgent && item.promptAgent.toLowerCase().includes(query)) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(query)));
    return matchesCat && matchesQuery;
  });

  renderComponentsShowcase(filtered);
}

function registerComponentsInCmd() {
  if (!window.SangarShell || typeof window.SangarShell.registerSearchItems !== 'function') return;

  const items = componentsData.map(comp => ({
    id: `comp-${comp.id}`,
    scope: 'components',
    title: comp.name,
    subtitle: comp.description,
    keywords: (comp.tags || []).join(' ') + ' prompt agente ' + comp.category,
    icon: 'layers',
    badge: 'Componente',
    action: () => {
      const el = document.getElementById(`comp-${comp.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.outline = '2px solid #FF7E67';
        setTimeout(() => { el.style.outline = 'none'; }, 1500);
      }
    }
  }));

  window.SangarShell.registerSearchItems(items);
}

function copyText(text, successMsg = 'Copiado al portapapeles') {
  if (window.SangarShell && typeof window.SangarShell.copyText === 'function') {
    window.SangarShell.copyText(text, successMsg);
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      alert(successMsg);
    });
  }
}

function escapeHtml(str) {
  if (window.SangarShell && typeof window.SangarShell.escapeHtml === 'function') {
    return window.SangarShell.escapeHtml(str);
  }
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ==========================================================================
   SUITE SWITCHING: Sangar Studio Core vs. Librería Moxen
   ========================================================================== */

function initSuiteSwitching() {
  const btnSangar = document.getElementById('tabSwitchSangar');
  const btnMoxen = document.getElementById('tabSwitchMoxen');
  const navSangar = document.getElementById('navItemSangarCore');
  const navMoxen = document.getElementById('navItemMoxen');

  function switchSuite(suite) {
    const secSangar = document.getElementById('sectionSangar');
    const secMoxen = document.getElementById('sectionMoxen');
    if (!secSangar || !secMoxen) return;

    if (suite === 'moxen') {
      secSangar.style.display = 'none';
      secMoxen.style.display = 'block';
      if (btnSangar) {
        btnSangar.classList.remove('is-active');
        btnSangar.setAttribute('aria-selected', 'false');
      }
      if (btnMoxen) {
        btnMoxen.classList.add('is-active');
        btnMoxen.setAttribute('aria-selected', 'true');
      }
      if (navSangar) navSangar.classList.remove('is-active');
      if (navMoxen) navMoxen.classList.add('is-active');
      if (window.location.hash !== '#moxen') {
        history.replaceState(null, '', '#moxen');
      }
    } else {
      secSangar.style.display = 'block';
      secMoxen.style.display = 'none';
      if (btnSangar) {
        btnSangar.classList.add('is-active');
        btnSangar.setAttribute('aria-selected', 'true');
      }
      if (btnMoxen) {
        btnMoxen.classList.remove('is-active');
        btnMoxen.setAttribute('aria-selected', 'false');
      }
      if (navSangar) navSangar.classList.add('is-active');
      if (navMoxen) navMoxen.classList.remove('is-active');
      if (window.location.hash !== '#sangar' && window.location.hash === '#moxen') {
        history.replaceState(null, '', '#sangar');
      }
    }
    if (window.SangarShell) window.SangarShell.renderIcons();
  }

  if (btnSangar) btnSangar.addEventListener('click', () => switchSuite('sangar'));
  if (btnMoxen) btnMoxen.addEventListener('click', () => switchSuite('moxen'));
  if (navSangar) navSangar.addEventListener('click', (e) => { e.preventDefault(); switchSuite('sangar'); });
  if (navMoxen) navMoxen.addEventListener('click', (e) => { e.preventDefault(); switchSuite('moxen'); });

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#moxen') {
      switchSuite('moxen');
    } else if (window.location.hash === '#sangar') {
      switchSuite('sangar');
    }
  });

  // Initial hash check
  if (window.location.hash === '#moxen') {
    switchSuite('moxen');
  }
}

/* ==========================================================================
   MOXEN ANIMATIONS SUITE (880 Components)
   ========================================================================== */

async function loadMoxenComponents() {
  try {
    const res = await fetch('data/moxen-components.json');
    if (res.ok) {
      moxenData = await res.json();
    } else {
      console.warn('No se pudo cargar data/moxen-components.json vía fetch');
      moxenData = [];
    }
  } catch (err) {
    console.warn('Error al cargar data/moxen-components.json', err);
    moxenData = [];
  }

  const badgeMoxen = document.getElementById('countBadgeMoxen');
  if (badgeMoxen) {
    badgeMoxen.textContent = moxenData.length;
  }

  renderMoxenCategories();
  setupMoxenControls();
  applyMoxenFilters();
  registerMoxenInCmd();
}

function renderMoxenCategories() {
  const container = document.getElementById('moxenCategoryPills');
  if (!container) return;

  const counts = {};
  const labels = {};
  moxenData.forEach(item => {
    const cat = item.category || 'otros';
    counts[cat] = (counts[cat] || 0) + 1;
    if (!labels[cat] && item.categoryLabel) {
      labels[cat] = item.categoryLabel;
    }
  });

  const sortedCats = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  let html = `
    <button type="button" class="sg-filter-pill is-active" data-cat="all">
      Todas <span class="badge-count">${moxenData.length}</span>
    </button>
  `;

  sortedCats.forEach(cat => {
    const label = labels[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1));
    html += `
      <button type="button" class="sg-filter-pill" data-cat="${escapeHtml(cat)}">
        ${escapeHtml(label)} <span class="badge-count">${counts[cat]}</span>
      </button>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.sg-filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.sg-filter-pill').forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      activeMoxenCategory = pill.getAttribute('data-cat') || 'all';
      applyMoxenFilters();
    });
  });
}

function setupMoxenControls() {
  const searchInput = document.getElementById('moxenSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyMoxenFilters();
    });
  }

  const btnLoadMore = document.getElementById('btnMoxenLoadMore');
  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', () => {
      moxenRenderLimit += MOXEN_BATCH_SIZE;
      renderMoxenGrid();
    });
  }
}

function applyMoxenFilters() {
  const query = document.getElementById('moxenSearchInput')?.value.toLowerCase().trim() || '';

  moxenFiltered = moxenData.filter(item => {
    const matchesCat = (activeMoxenCategory === 'all' || item.category === activeMoxenCategory);
    const matchesQuery = !query ||
      item.name.toLowerCase().includes(query) ||
      (item.tagline && item.tagline.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.categoryLabel && item.categoryLabel.toLowerCase().includes(query)) ||
      (item.dependencies && item.dependencies.toLowerCase().includes(query)) ||
      (item.promptAgent && item.promptAgent.toLowerCase().includes(query));
    return matchesCat && matchesQuery;
  });

  moxenRenderLimit = MOXEN_BATCH_SIZE;
  renderMoxenGrid();
}

function renderMoxenGrid() {
  const grid = document.getElementById('moxenGridContainer');
  const counterText = document.getElementById('moxenCounterText');
  const btnLoadMore = document.getElementById('btnMoxenLoadMore');
  if (!grid) return;

  grid.innerHTML = '';

  if (moxenFiltered.length === 0) {
    grid.innerHTML = `
      <div class="sg-empty" style="grid-column: 1 / -1;">
        <div class="sg-empty__img"><i data-lucide="search-x"></i></div>
        <div class="sg-empty__title">No se encontraron animaciones</div>
        <p class="sg-empty__desc">Prueba a buscar por otro término (ej: 'menú', 'reloj', 'efecto', 'tarjeta') o cambia de categoría.</p>
      </div>
    `;
    if (counterText) counterText.textContent = '0 animaciones encontradas';
    if (btnLoadMore) btnLoadMore.style.display = 'none';
    if (window.SangarShell) window.SangarShell.renderIcons(grid);
    return;
  }

  const itemsToShow = moxenFiltered.slice(0, moxenRenderLimit);
  if (counterText) {
    counterText.textContent = `Mostrando ${itemsToShow.length} de ${moxenFiltered.length} animaciones${moxenFiltered.length !== moxenData.length ? ` (de ${moxenData.length} totales)` : ''}`;
  }

  if (btnLoadMore) {
    btnLoadMore.style.display = itemsToShow.length < moxenFiltered.length ? 'inline-flex' : 'none';
    const remaining = moxenFiltered.length - itemsToShow.length;
    const nextBatch = Math.min(MOXEN_BATCH_SIZE, remaining);
    const labelSpan = btnLoadMore.querySelector('span');
    if (labelSpan) {
      labelSpan.textContent = `Cargar ${nextBatch} animaciones más (${remaining} restantes)`;
    }
  }

  itemsToShow.forEach(item => {
    const card = document.createElement('article');
    card.className = 'moxen-card';
    card.id = `moxen-${item.id}`;

    const depsLabel = item.dependencies === 'Ninguna' ? 'Sin dependencias' : item.dependencies;

    card.innerHTML = `
      <div class="moxen-card__media" data-id="${escapeHtml(item.id)}" title="Haz clic para ver detalles y prompt">
        <img class="moxen-card__poster" src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.name)}" loading="lazy">
        <video class="moxen-card__video" loop muted playsinline preload="none" data-src="${escapeHtml(item.video)}"></video>
        <span class="moxen-card__play-badge">
          <i data-lucide="play" style="width: 10px; height: 10px;"></i> Hover para reproducir
        </span>
      </div>
      <div class="moxen-card__body">
        <div class="moxen-card__top">
          <span class="moxen-card__category">${escapeHtml(item.categoryLabel || item.category)}</span>
          <span class="moxen-card__deps" title="Dependencias">${escapeHtml(depsLabel)}</span>
        </div>
        <h3 class="moxen-card__title">${escapeHtml(item.name)}</h3>
        <p class="moxen-card__tagline">${escapeHtml(item.tagline || item.description)}</p>
        <div class="moxen-card__footer">
          <button type="button" class="sg-btn sg-btn--primary sg-btn--xs btn-copy-moxen-prompt" data-id="${escapeHtml(item.id)}" title="Copiar prompt para Claude Code, Cursor, v0 o ChatGPT">
            <i data-lucide="sparkles"></i> Prompt Agente
          </button>
          <button type="button" class="sg-btn sg-btn--outline sg-btn--xs btn-view-moxen-detail" data-id="${escapeHtml(item.id)}" title="Ver vídeo completo y código">
            <i data-lucide="maximize-2"></i> Detalle
          </button>
        </div>
      </div>
    `;

    // Video hover to play logic
    const mediaWrap = card.querySelector('.moxen-card__media');
    const videoEl = card.querySelector('.moxen-card__video');

    if (mediaWrap && videoEl) {
      mediaWrap.addEventListener('mouseenter', () => {
        if (!videoEl.src && videoEl.dataset.src) {
          videoEl.src = videoEl.dataset.src;
        }
        videoEl.play().catch(() => {});
        videoEl.classList.add('is-playing');
      });

      mediaWrap.addEventListener('mouseleave', () => {
        videoEl.pause();
        videoEl.classList.remove('is-playing');
      });

      mediaWrap.addEventListener('click', () => {
        openMoxenModal(item);
      });
    }

    // Buttons click
    const btnPrompt = card.querySelector('.btn-copy-moxen-prompt');
    if (btnPrompt) {
      btnPrompt.addEventListener('click', (e) => {
        e.stopPropagation();
        copyText(item.promptAgent, `Prompt copiado para ${item.name}`);
      });
    }

    const btnDetail = card.querySelector('.btn-view-moxen-detail');
    if (btnDetail) {
      btnDetail.addEventListener('click', (e) => {
        e.stopPropagation();
        openMoxenModal(item);
      });
    }

    grid.appendChild(card);
  });

  if (window.SangarShell) {
    window.SangarShell.renderIcons(grid);
  }
}

/* ==========================================================================
   MOXEN DETAIL MODAL (<dialog>)
   ========================================================================== */

let currentModalItem = null;

function setupMoxenModal() {
  const modal = document.getElementById('moxenDetailModal');
  const btnClose = document.getElementById('moxenModalClose');
  const btnCopyPrompt = document.getElementById('btnCopyMoxenModalPrompt');

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => {
      closeMoxenModal();
    });
  }

  if (modal) {
    modal.addEventListener('close', () => {
      const videoEl = document.getElementById('moxenModalVideo');
      if (videoEl) {
        videoEl.pause();
        videoEl.src = '';
      }
    });

    // Close when clicking outside content (on backdrop)
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeMoxenModal();
      }
    });
  }

  if (btnCopyPrompt) {
    btnCopyPrompt.addEventListener('click', () => {
      if (currentModalItem && currentModalItem.promptAgent) {
        copyText(currentModalItem.promptAgent, `Prompt copiado para ${currentModalItem.name}`);
      }
    });
  }
}

function openMoxenModal(item) {
  currentModalItem = item;
  const modal = document.getElementById('moxenDetailModal');
  if (!modal) return;

  const titleEl = document.getElementById('moxenModalTitle');
  const catEl = document.getElementById('moxenModalCategory');
  const taglineEl = document.getElementById('moxenModalTagline');
  const descEl = document.getElementById('moxenModalDesc');
  const depsEl = document.getElementById('moxenModalDeps');
  const filesEl = document.getElementById('moxenModalFiles');
  const extLinkEl = document.getElementById('moxenModalExternalLink');
  const promptEl = document.getElementById('moxenModalPromptText');
  const videoEl = document.getElementById('moxenModalVideo');

  if (titleEl) titleEl.textContent = item.name;
  if (catEl) catEl.textContent = item.categoryLabel || item.category;
  if (taglineEl) taglineEl.textContent = item.tagline || '';
  if (descEl) descEl.textContent = item.description || '';
  if (depsEl) depsEl.innerHTML = `<i data-lucide="box"></i> Dependencias: ${escapeHtml(item.dependencies)}`;
  if (filesEl) {
    const filesCount = Array.isArray(item.files) ? item.files.length : 3;
    const fileNames = Array.isArray(item.files) ? item.files.join(', ') : 'index.html, css, js';
    filesEl.innerHTML = `<i data-lucide="file-code"></i> ${filesCount} archivos (${escapeHtml(fileNames)})`;
  }
  if (extLinkEl) {
    extLinkEl.href = `https://moxen.cl/recursos.html#${item.id}`;
  }
  if (promptEl) {
    promptEl.textContent = item.promptAgent || '';
  }

  if (videoEl) {
    videoEl.poster = item.poster || '';
    videoEl.src = item.video || '';
    videoEl.play().catch(() => {});
  }

  if (window.SangarShell) window.SangarShell.renderIcons(modal);

  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }
}

function closeMoxenModal() {
  const modal = document.getElementById('moxenDetailModal');
  const videoEl = document.getElementById('moxenModalVideo');
  if (videoEl) {
    videoEl.pause();
    videoEl.src = '';
  }
  if (modal) {
    if (typeof modal.close === 'function') {
      modal.close();
    } else {
      modal.removeAttribute('open');
    }
  }
}

function registerMoxenInCmd() {
  if (!window.SangarShell || typeof window.SangarShell.registerSearchItems !== 'function') return;

  const items = moxenData.map(item => ({
    id: `moxen-${item.id}`,
    scope: 'components',
    title: item.name,
    subtitle: `${item.categoryLabel || item.category} · ${item.tagline || item.description}`,
    keywords: `${item.name} ${item.category} ${item.categoryLabel} ${item.tagline} moxen animacion`,
    icon: 'play-circle',
    badge: 'Moxen',
    action: () => {
      const btnMoxen = document.getElementById('tabSwitchMoxen');
      if (btnMoxen) btnMoxen.click();
      openMoxenModal(item);
    }
  }));

  window.SangarShell.registerSearchItems(items);
}
