/**
 * Sangar UI Components — 21st.dev Style Showcase Engine
 */

let componentsData = [];

// Embedded fallback data for 100% offline & file:// compatibility
const FALLBACK_COMPONENTS = [
  {
    id: "spotlight-card",
    name: "Spotlight Border Card",
    category: "cards",
    tags: ["Tailwind", "Interactive", "Mouse Tracker", "Cards"],
    description: "Tarjeta moderna con un resplandor radial dinámico que sigue las coordenadas exactas del ratón, iluminando sutilmente los bordes y el fondo.",
    previewHtml: `<div class="comp-spotlight-card" id="spotlightCardDemo">
      <div class="spotlight-content">
        <div class="spotlight-icon">⚡</div>
        <h3>Sangar Dynamic Spotlight</h3>
        <p>Mueve el cursor sobre esta tarjeta para ver cómo el halo de luz responde a tu posición en tiempo real.</p>
        <span class="spotlight-tag">21st.dev Style • Interactive</span>
      </div>
    </div>`,
    codeHtml: `<!-- HTML & CSS Spotlight Card -->
<div class="spotlight-card" onmousemove="handleSpotlight(event, this)">
  <div class="card-body">
    <div class="icon">⚡</div>
    <h3>Spotlight Card</h3>
    <p>Halo de luz dinámico que sigue las coordenadas del ratón.</p>
  </div>
</div>

<style>
.spotlight-card {
  position: relative;
  background: #111420;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.spotlight-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(400px circle at var(--mouse-x, -500px) var(--mouse-y, -500px), rgba(99, 102, 241, 0.18), transparent 80%);
  pointer-events: none;
}
</style>

<script>
function handleSpotlight(e, card) {
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--mouse-x', \`\${e.clientX - rect.left}px\`);
  card.style.setProperty('--mouse-y', \`\${e.clientY - rect.top}px\`);
}
</script>`,
    codeReact: `// React + Tailwind CSS Implementation
import React, { useRef } from 'react';

export const SpotlightCard = ({ title, desc, icon }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--x', \`\${e.clientX - rect.left}px\`);
    cardRef.current.style.setProperty('--y', \`\${e.clientY - rect.top}px\`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-2xl transition-colors hover:border-indigo-500/50 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(400px_circle_at_var(--x,-500px)_var(--y,-500px),rgba(99,102,241,0.15),transparent_80%)]"
    >
      <div className="relative z-10 text-white">
        <div className="mb-3 text-2xl">{icon}</div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-1 text-sm text-neutral-400">{desc}</p>
      </div>
    </div>
  );
};`
  },
  {
    id: "border-beam",
    name: "Border Beam Glow",
    category: "cards",
    tags: ["Animation", "CSS Keyframes", "Border Light", "Tailwind"],
    description: "Efecto de haz de luz ultrabrillante que recorre continuamente el perímetro de una tarjeta en un bucle hipnótico sin fin.",
    previewHtml: `<div class="comp-border-beam-card">
      <div class="beam-glow"></div>
      <div class="beam-content">
        <span class="badge-cyan">Infinite Beam</span>
        <h3>Border Beam Light</h3>
        <p>Un haz de luz volumétrico que viaja a lo largo del borde mediante conic-gradient y máscaras CSS.</p>
      </div>
    </div>`,
    codeHtml: `<!-- HTML & CSS Border Beam -->
<div class="border-beam-box">
  <div class="border-beam-glow"></div>
  <div class="box-content">
    <h3>Border Beam</h3>
    <p>Luz infinita recorriendo el borde de la tarjeta.</p>
  </div>
</div>

<style>
.border-beam-box {
  position: relative;
  background: #0f111a;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #1f2335;
  overflow: hidden;
}
.border-beam-glow {
  position: absolute;
  inset: -150%;
  background: conic-gradient(from 0deg, transparent 75%, #06b6d4 90%, #a855f7 100%);
  animation: rotateBeam 4s linear infinite;
  pointer-events: none;
  opacity: 0.85;
}
@keyframes rotateBeam {
  to { transform: rotate(360deg); }
}
</style>`,
    codeReact: `// React + Tailwind Border Beam
export const BorderBeamCard = ({ children }) => (
  <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
    <div className="pointer-events-none absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_75%,#06b6d4_90%,#a855f7_100%)] opacity-70" />
    <div className="relative z-10 rounded-xl bg-neutral-950 p-4 text-white">
      {children}
    </div>
  </div>
);`
  },
  {
    id: "text-scramble",
    name: "Kinetic Text Decryptor / Scramble",
    category: "text",
    tags: ["Typography", "Cyberpunk", "Kinetic", "Microinteraction"],
    description: "Texto interactivo con efecto de descifrado criptográfico tipo Matrix/Cyberpunk al pasar el cursor o al cargarse.",
    previewHtml: `<div class="comp-text-scramble-box">
      <span class="label-dim">Pasa el ratón por encima:</span>
      <h2 class="scramble-trigger" id="demoScrambleText" data-value="SANGAR DESIGN ENGINE">SANGAR DESIGN ENGINE</h2>
      <p style="font-size: 0.75rem; color: var(--text-dim); margin-top: 0.4rem;">Hover para activar el descifrado dinámico</p>
    </div>`,
    codeHtml: `<!-- HTML & Vanilla JS Text Scramble -->
<h2 class="scramble-text" data-value="SANGAR CREATIVE STUDIO">SANGAR CREATIVE STUDIO</h2>

<script>
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

document.querySelector('.scramble-text').onmouseover = event => {  
  let iteration = 0;
  clearInterval(event.target.interval);
  const original = event.target.dataset.value;
  
  event.target.interval = setInterval(() => {
    event.target.innerText = original.split("")
      .map((letter, index) => {
        if(index < iteration) return original[index];
        return letters[Math.floor(Math.random() * letters.length)];
      })
      .join("");
    
    if(iteration >= original.length){
      clearInterval(event.target.interval);
    }
    iteration += 1 / 3;
  }, 30);
};
</script>`,
    codeReact: `// React Scramble Text Component
import React, { useState } from 'react';

export const TextScramble = ({ text }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

  const scramble = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(text.split('').map((char, index) => {
        if (index < iteration) return text[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
  };

  return (
    <span onMouseEnter={scramble} className="font-mono font-bold tracking-wider cursor-pointer">
      {displayText}
    </span>
  );
};`
  },
  {
    id: "magnetic-button",
    name: "Magnetic Dynamic Button",
    category: "buttons",
    tags: ["Physics", "Magnetic", "Buttons", "Framer Motion Style"],
    description: "Botón magnético que es atraído físicamente hacia el cursor del usuario cuando se acerca, con retorno elástico suave.",
    previewHtml: `<div class="comp-magnetic-wrapper" id="magneticContainerDemo">
      <button class="comp-magnetic-btn" id="magneticBtnDemo">
        <span>Descubrir Recursos ↗</span>
      </button>
    </div>`,
    codeHtml: `<!-- HTML & JS Magnetic Button -->
<div class="magnetic-wrap" id="magWrap">
  <button class="magnetic-btn" id="magBtn">Hover Magnético ↗</button>
</div>

<style>
.magnetic-wrap { display: inline-block; padding: 30px; }
.magnetic-btn {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white; border: none; padding: 14px 28px;
  border-radius: 9999px; font-weight: 600; cursor: pointer;
  transition: transform 0.15s ease-out;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}
</style>

<script>
const wrap = document.getElementById('magWrap');
const btn = document.getElementById('magBtn');

wrap.addEventListener('mousemove', (e) => {
  const rect = wrap.getBoundingClientRect();
  const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
  const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
  btn.style.transform = \`translate(\${x}px, \${y}px) scale(1.05)\`;
});

wrap.addEventListener('mouseleave', () => {
  btn.style.transform = 'translate(0px, 0px) scale(1)';
});
</script>`,
    codeReact: `// React + Framer Motion Magnetic Button
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const MagneticButton = ({ children }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.35, y: middleY * 0.35 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.1 }}
      className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg"
    >
      {children}
    </motion.button>
  );
};`
  },
  {
    id: "macos-dock",
    name: "macOS Magnified Floating Dock",
    category: "navigation",
    tags: ["Navigation", "macOS", "Dock", "Magnification", "Dock UI"],
    description: "Barra de navegación flotante estilo dock de macOS con magnificación parabólica suave al pasar el cursor sobre los iconos.",
    previewHtml: `<div class="comp-dock-container">
      <div class="comp-dock-bar" id="macosDockDemo">
        <div class="dock-item">📁</div>
        <div class="dock-item">🎬</div>
        <div class="dock-item">🎨</div>
        <div class="dock-item">⚡</div>
        <div class="dock-item">💎</div>
        <div class="dock-item">🪐</div>
      </div>
    </div>`,
    codeHtml: `<!-- HTML & CSS macOS Dock -->
<div class="dock">
  <button class="dock-icon">📁</button>
  <button class="dock-icon">🎬</button>
  <button class="dock-icon">🎨</button>
  <button class="dock-icon">⚡</button>
  <button class="dock-icon">🪐</button>
</div>

<style>
.dock {
  display: flex; gap: 12px; padding: 10px 16px;
  background: rgba(18, 20, 30, 0.75); backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px;
}
.dock-icon {
  width: 44px; height: 44px; border-radius: 14px;
  background: #1e2235; border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 20px; display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1); cursor: pointer;
}
.dock-icon:hover {
  transform: scale(1.4) translateY(-10px);
}
</style>`,
    codeReact: `// React + Tailwind Dock Component
export const FloatingDock = ({ items }) => (
  <div className="flex items-center gap-3 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-3 shadow-2xl backdrop-blur-xl">
    {items.map((item, idx) => (
      <button
        key={idx}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800/80 text-xl transition-all duration-200 hover:-translate-y-2 hover:scale-125 hover:bg-neutral-700 active:scale-95"
      >
        {item.icon}
      </button>
    ))}
  </div>
);`
  },
  {
    id: "3d-tilt-card",
    name: "3D Perspective Tilt Glass Card",
    category: "cards",
    tags: ["3D", "Tilt", "Glassmorphism", "Cards"],
    description: "Efecto de rotación 3D en perspectiva con brillo especular de cristal que calcula el ángulo según la posición del cursor.",
    previewHtml: `<div class="comp-tilt-card-wrapper" id="tiltCardWrapDemo">
      <div class="comp-tilt-card" id="tiltCardDemo">
        <div class="tilt-card-badge">Spatial 3D</div>
        <h3>Vision Pro Glass</h3>
        <p>La tarjeta pivota en los ejes X e Y generando una sensación de profundidad tridimensional real.</p>
      </div>
    </div>`,
    codeHtml: `<!-- HTML, CSS & JS 3D Tilt Card -->
<div class="tilt-container" id="tiltContainer">
  <div class="tilt-box" id="tiltBox">
    <h3>3D Tilt Card</h3>
    <p>Efecto de rotación en perspectiva tridimensional.</p>
  </div>
</div>

<style>
.tilt-container { perspective: 1000px; display: inline-block; }
.tilt-box {
  width: 320px; padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px; color: white;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
}
</style>

<script>
const c = document.getElementById('tiltContainer');
const b = document.getElementById('tiltBox');

c.addEventListener('mousemove', (e) => {
  const rect = c.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const xRot = ((y - rect.height / 2) / rect.height) * -20;
  const yRot = ((x - rect.width / 2) / rect.width) * 20;
  b.style.transform = \`rotateX(\${xRot}deg) rotateY(\${yRot}deg) scale3d(1.05, 1.05, 1.05)\`;
});

c.addEventListener('mouseleave', () => {
  b.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
});
</script>`,
    codeReact: `// React 3D Tilt Component
import React, { useRef } from 'react';

export const TiltCard = ({ title, children }) => {
  const ref = useRef(null);
  const onMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = \`perspective(1000px) rotateX(\${-y / 10}deg) rotateY(\${x / 10}deg) scale3d(1.02, 1.02, 1.02)\`;
  };
  const onMouseLeave = () => {
    ref.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 transition-transform duration-100 ease-out"
    >
      <h3 className="text-lg font-bold text-white">{title}</h3>
      {children}
    </div>
  );
};`
  },
  {
    id: "dynamic-island",
    name: "Morphing Dynamic Island Widget",
    category: "navigation",
    tags: ["Dynamic Island", "Morphing", "Interactive", "Microinteraction"],
    description: "Cápsula interactiva inspirada en la Dynamic Island de Apple que se expande y contrae fluidamente con físicas de amortiguación al hacer clic.",
    previewHtml: `<div class="comp-island-wrapper">
      <div class="comp-dynamic-island" id="dynamicIslandDemo">
        <div class="island-collapsed">
          <span class="island-dot"></span>
          <span class="island-text">Sangar Music • Playing</span>
          <span class="island-wave">||||</span>
        </div>
        <div class="island-expanded" style="display: none;">
          <div class="island-track-info">
            <div class="track-art">🎵</div>
            <div>
              <strong>Cinematic Motion Beats</strong>
              <span>Runway & Kling Soundscapes</span>
            </div>
          </div>
          <div class="island-controls">
            <button class="btn-ctrl">⏮</button>
            <button class="btn-ctrl">⏸</button>
            <button class="btn-ctrl">⏭</button>
          </div>
        </div>
      </div>
    </div>`,
    codeHtml: `<!-- HTML & JS Morphing Dynamic Island -->
<div class="dynamic-island" id="island" onclick="toggleIsland()">
  <div class="island-content">Tocando: Motion Sounds 🎵</div>
</div>

<style>
.dynamic-island {
  background: #000; color: #fff; border-radius: 9999px;
  padding: 10px 24px; width: fit-content; cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.6);
}
.dynamic-island.expanded {
  border-radius: 28px; padding: 24px; width: 320px;
}
</style>

<script>
function toggleIsland() {
  document.getElementById('island').classList.toggle('expanded');
}
</script>`,
    codeReact: `// React + Framer Motion Dynamic Island
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const DynamicIsland = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      layout
      onClick={() => setExpanded(!expanded)}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="cursor-pointer overflow-hidden bg-black text-white shadow-2xl"
      style={{ borderRadius: expanded ? 32 : 9999, padding: expanded ? 24 : '10px 20px', width: expanded ? 340 : 'auto' }}
    >
      {expanded ? (
        <div className="flex flex-col gap-3">
          <div className="font-bold">Now Playing</div>
          <p className="text-xs text-neutral-400">Runway Gen-3 Soundtrack</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sangar Island</span>
        </div>
      )}
    </motion.div>
  );
};`
  },
  {
    id: "shimmer-button",
    name: "Shimmer Sweep Button",
    category: "buttons",
    tags: ["Buttons", "Shimmer", "Gradient", "Tailwind"],
    description: "Botón premium con una ráfaga de brillo especular continuo barriendo diagonalmente sobre la superficie metálica.",
    previewHtml: `<div style="display: flex; justify-content: center; padding: 20px;">
      <button class="comp-shimmer-btn">
        <span class="shimmer-sweep"></span>
        <span class="shimmer-text">Generar con Sangar IA ✨</span>
      </button>
    </div>`,
    codeHtml: `<!-- HTML & CSS Shimmer Button -->
<button class="shimmer-button">
  <span class="shimmer-effect"></span>
  <span>Crear Proyecto 🚀</span>
</button>

<style>
.shimmer-button {
  position: relative; overflow: hidden;
  background: #181b29; color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px; padding: 14px 28px;
  font-weight: 600; cursor: pointer;
}
.shimmer-effect {
  position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  animation: shimmerSweep 2.5s infinite;
}
@keyframes shimmerSweep { 100% { left: 100%; } }
</style>`,
    codeReact: `// React + Tailwind Shimmer Button
export const ShimmerButton = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="group relative overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 px-6 py-3 font-medium text-white transition-all hover:border-neutral-500 active:scale-95"
  >
    <div className="absolute -inset-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    <span className="relative z-10 flex items-center gap-2">{text}</span>
  </button>
);`
  }
];

document.addEventListener('DOMContentLoaded', () => {
  loadComponents().then(() => {
    renderComponentsShowcase(componentsData);
    setupComponentInteractions();
    setupFilters();
  });
});

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
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-dim);">No se encontraron componentes.</div>`;
    return;
  }

  items.forEach(comp => {
    const card = document.createElement('div');
    card.className = 'component-showcase-card';
    card.innerHTML = `
      <div class="comp-card-header">
        <div class="comp-card-title">
          <h3>${comp.name}</h3>
          <p>${comp.description}</p>
        </div>
        <div class="comp-tabs-switch" data-comp-id="${comp.id}">
          <button class="comp-tab-btn active" data-view="preview">Preview</button>
          <button class="comp-tab-btn" data-view="code-html">HTML / CSS</button>
          <button class="comp-tab-btn" data-view="code-react">React</button>
        </div>
      </div>

      <!-- Preview Stage -->
      <div class="comp-preview-stage" id="preview-stage-${comp.id}">
        ${comp.previewHtml}
      </div>

      <!-- Code Stage (HTML) -->
      <div class="comp-code-stage" id="code-html-stage-${comp.id}">
        <div class="code-subtabs">
          <span class="code-type-pill">HTML + CSS + Vanilla JS</span>
          <button class="btn-copy-mini btn-copy-code" data-code-type="html" data-comp-id="${comp.id}">Copiar Código</button>
        </div>
        <pre class="comp-code-block"><code>${escapeHtml(comp.codeHtml)}</code></pre>
      </div>

      <!-- Code Stage (React) -->
      <div class="comp-code-stage" id="code-react-stage-${comp.id}">
        <div class="code-subtabs">
          <span class="code-type-pill">React + Tailwind CSS</span>
          <button class="btn-copy-mini btn-copy-code" data-code-type="react" data-comp-id="${comp.id}">Copiar Código</button>
        </div>
        <pre class="comp-code-block"><code>${escapeHtml(comp.codeReact)}</code></pre>
      </div>

      <div class="comp-card-footer">
        <div class="card-tags">
          ${(comp.tags || []).map(t => `<span class="tag-badge">#${t}</span>`).join('')}
        </div>
        <button class="btn btn-outline btn-copy-footer" data-comp-id="${comp.id}" style="font-size: 0.78rem; padding: 0.35rem 0.75rem;">
          📋 Copiar Todo
        </button>
      </div>
    `;

    // Tab switching for each component card
    card.querySelectorAll('.comp-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        card.querySelectorAll('.comp-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const prevStage = card.querySelector(`#preview-stage-${comp.id}`);
        const htmlStage = card.querySelector(`#code-html-stage-${comp.id}`);
        const reactStage = card.querySelector(`#code-react-stage-${comp.id}`);

        prevStage.style.display = view === 'preview' ? 'flex' : 'none';
        htmlStage.classList.toggle('active', view === 'code-html');
        reactStage.classList.toggle('active', view === 'code-react');
      });
    });

    // Copy buttons
    card.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-code-type');
        const code = type === 'react' ? comp.codeReact : comp.codeHtml;
        navigator.clipboard.writeText(code).then(() => {
          showToast(`Código ${type.toUpperCase()} copiado`, '📋');
        });
      });
    });

    card.querySelector('.btn-copy-footer').addEventListener('click', () => {
      navigator.clipboard.writeText(comp.codeHtml).then(() => {
        showToast(`Código copiado: ${comp.name}`, '📋');
      });
    });

    grid.appendChild(card);
  });

  // Re-bind interactive micro-interactions for live demos
  attachInteractiveDemos();
}

/**
 * Attach live events for mouse tracking, tilt, scramble, magnetic button, dock
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
}

function setupFilters() {
  const searchInput = document.getElementById('compSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  const pills = document.querySelectorAll('#compCategoryPills .filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      applyFilters();
    });
  });
}

function applyFilters() {
  const query = document.getElementById('compSearchInput')?.value.toLowerCase().trim() || '';
  const activeCat = document.querySelector('#compCategoryPills .filter-pill.active')?.getAttribute('data-cat') || 'all';

  const filtered = componentsData.filter(item => {
    const matchesCat = (activeCat === 'all' || item.category === activeCat);
    const matchesQuery = !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(query)));
    return matchesCat && matchesQuery;
  });

  renderComponentsShowcase(filtered);
}

function setupComponentInteractions() {
  // Global hooks if needed
}

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let toastTimeout = null;
function showToast(message, icon = '✓') {
  const toast = document.getElementById('toastNotice');
  const msgEl = document.getElementById('toastMessage');
  const iconEl = document.getElementById('toastIcon');

  if (!toast) return;
  if (msgEl) msgEl.textContent = message;
  if (iconEl) iconEl.textContent = icon;

  toast.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}
