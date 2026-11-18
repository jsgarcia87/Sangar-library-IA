/**
 * Sangar AI Library v2.0 Pro — Core Application Logic
 * Interactive Prompt Generator for Motion Graphics, Hero Frames (Midjourney/Flux),
 * After Effects Expressions Studio, Storyboards & Tool Hub.
 */

// Embedded fallback data for seamless offline & file:// protocol operation
const DEFAULT_CONFIG = {
  presets: [
    {
      id: "cyberpunk_logo",
      name: "⚡ Cyberpunk Neon Logo Reveal",
      projectType: "logo_reveal",
      subject: "Logotipo minimalista con líneas geométricas limpias",
      style: "cyberpunk_neon",
      motion: "electric_assembly",
      camera: "dolly_in_rapid",
      lighting: "neon_dual",
      tempo: "snappy_dynamic",
      aspectRatio: "16:9",
      isLoop: false,
      motionStrength: 7,
      targetEngine: "runway_gen3",
      extra: "Líneas de neón brillante estabilizándose en un isotipo nítido",
      tip: "Usa destellos de neón y partículas eléctricas antes de estabilizar el logo para maximizar el impacto visual."
    },
    {
      id: "kinetic_typography",
      name: "💥 Tipografía Cinética para Reels / TikTok",
      projectType: "kinetic_typography",
      subject: "Frase de impacto tipográfica con fuentes serif y sans-serif en contraste",
      style: "swiss_minimalist",
      motion: "elastic_snap",
      camera: "kinetic_tracking",
      lighting: "studio_clean",
      tempo: "fast_rhythmic",
      aspectRatio: "9:16",
      isLoop: true,
      motionStrength: 8,
      targetEngine: "kling",
      extra: "Cortes ultra limpios y rebote elástico tipográfico",
      tip: "Mantén las transiciones de palabras entre 0.3 y 0.5 segundos para retener la atención del espectador."
    },
    {
      id: "luxury_product",
      name: "✨ Showcase de Producto de Lujo 3D",
      projectType: "product_showcase",
      subject: "Reloj de alta gama con esfera de cristal de zafiro y engranajes vistos",
      style: "dark_luxury",
      motion: "smooth_float",
      camera: "orbit_360",
      lighting: "moody_rim",
      tempo: "slow_cinematic",
      aspectRatio: "16:9",
      isLoop: false,
      motionStrength: 4,
      targetEngine: "luma",
      extra: "Reflejos dorados de 24k en los bordes biselados",
      tip: "La iluminación de borde (rim lighting) resaltará la silueta del objeto creando profundidad tridimensional."
    },
    {
      id: "abstract_chrome_loop",
      name: "🌀 Bucle Abstracto de Mercurio Líquido",
      projectType: "abstract_loop",
      subject: "Escultura biomórfica de cromo líquido flotante que cambia de forma continuamente",
      style: "liquid_chrome",
      motion: "fluid_morphing",
      camera: "slow_dolly_drift",
      lighting: "iridescent_hdr",
      tempo: "hypnotic_slow",
      aspectRatio: "16:9",
      isLoop: true,
      motionStrength: 5,
      targetEngine: "sora",
      extra: "Refracción cáustica espectral continua",
      tip: "Activa siempre el modificador de 'seamless loop' para usarlo como fondo VJ o backdrop de presentaciones."
    },
    {
      id: "futuristic_ui",
      name: "🌐 Interfaz Holográfica UI Sci-Fi",
      projectType: "ui_animation",
      subject: "Panel de control holográfico flotante con gráficos circulares y métricas cuánticas",
      style: "holographic_scifi",
      motion: "hud_unfolding",
      camera: "shallow_dof_pan",
      lighting: "cyan_glow",
      tempo: "snappy_dynamic",
      aspectRatio: "16:9",
      isLoop: false,
      motionStrength: 6,
      targetEngine: "runway_gen3",
      extra: "Luz volumétrica azul cian penetrando la niebla",
      tip: "Combina profundidad de campo reducida para enfocar un elemento de la interfaz mientras el resto se desdibuja con bokeh."
    },
    {
      id: "claymation_fun",
      name: "🎨 Stop-Motion Claymation Pastel",
      projectType: "brand_animation",
      subject: "Personaje geométrico y formas de plastilina suave interactuando de forma divertida",
      style: "claymation_pastel",
      motion: "stopmotion_bounce",
      camera: "fixed_isometric",
      lighting: "soft_studio",
      tempo: "playful_stopmotion",
      aspectRatio: "1:1",
      isLoop: true,
      motionStrength: 6,
      targetEngine: "kling",
      extra: "Texturas de huellas dactilares táctiles",
      tip: "Especificar 'stop-motion a 12 fps' aporta un encanto orgánico artesanal que los clientes adoran."
    }
  ],
  projectTypes: [
    { id: "logo_reveal", label: "Animación / Revelado de Logo (Logo Reveal)", en: "logo reveal animation", es: "revelado y animación de logotipo" },
    { id: "kinetic_typography", label: "Tipografía Cinética (Kinetic Typography)", en: "kinetic typography text motion", es: "animación de tipografía cinética" },
    { id: "product_showcase", label: "Showcase de Producto 3D (Product Visualizer)", en: "3D product showcase commercial", es: "showcase comercial de producto 3D" },
    { id: "abstract_loop", label: "Loop Abstracto / Fondo VJ (Abstract Seamless Loop)", en: "abstract hypnotic seamless looping background", es: "bucle abstracto hipnótico continuo para fondo o VJ" },
    { id: "ui_animation", label: "Microinteracción / UI Holográfica (UI Motion)", en: "futuristic UI interface microinteraction", es: "microinteracción de interfaz de usuario futurista" },
    { id: "transition_morph", label: "Transición Dinámica / Morphing (Scene Transition)", en: "seamless dynamic morphing transition", es: "transición de escena dinámica con morphing fluido" },
    { id: "cinematic_titles", label: "Títulos y Créditos Cinemáticos (Title Sequence)", en: "cinematic opening title sequence", es: "secuencia de títulos iniciales cinematográficos" },
    { id: "social_ad", label: "Anuncio Dinámico para Redes (Social Media Motion Ad)", en: "high-energy social media motion graphic ad", es: "anuncio dinámico en motion graphics para redes sociales" }
  ],
  visualStyles: [
    { id: "cyberpunk_neon", label: "Cyberpunk Neón & Dark City", en: "dark futuristic cyberpunk aesthetic with glowing neon tube accents, high contrast and moody reflections", es: "estética cyberpunk futurista oscura con acentos de neón brillante, alto contraste y reflejos atmosféricos" },
    { id: "swiss_minimalist", label: "Minimalismo Suizo / Bauhaus", en: "Swiss design typography, Bauhaus minimalist motion, clean geometric layout, high visual clarity and negative space", es: "diseño gráfico suizo, minimalismo estilo Bauhaus, composición geométrica limpia, máxima claridad y espacio negativo" },
    { id: "liquid_chrome", label: "Liquid Chrome & Mercurio 3D", en: "ultra-reflective liquid chrome metal, fluid mercury ripples, iridescent caustic highlights, clean 3D render", es: "metal de cromo líquido ultra-reflectante, ondas fluidas de mercurio, destellos cáusticos iridiscentes, render 3D impecable" },
    { id: "dark_luxury", label: "Lujo Oscuro (Obsidiana y Oro Mate)", en: "high-end luxury aesthetic, matte black obsidian textures, brushed gold metallic accents, sophisticated atmosphere", es: "estética de lujo refinado, texturas de obsidiana negra mate, acentos metálicos en oro cepillado y atmósfera sofisticada" },
    { id: "holographic_scifi", label: "Holográfico Sci-Fi & HUD", en: "semi-transparent glowing holographic HUD display, volumetric light rays, floating luminous glass elements", es: "pantalla holográfica HUD semitransparente luminosa, haces de luz volumétrica y elementos de cristal flotantes" },
    { id: "claymation_pastel", label: "Claymation & Plastilina Pastel", en: "tactile plasticine claymation style, soft fingerprint textures, cheerful pastel color palette, stop-motion charm", es: "estilo de plastilina claymation artesanal, texturas suaves con huellas táctiles, paleta pastel alegre y encanto stop-motion" },
    { id: "glassmorphism_3d", label: "Glassmorphism 3D Translúcido", en: "frosted glassmorphism 3D panels, refractive light dispersion, chromatic aberration, frosted acrylic blur", es: "paneles 3D estilo glassmorphism translúcido esmerilado, dispersión de luz refractiva y aberración cromática" },
    { id: "y2k_retro", label: "Retro Y2K / Acid Graphic Motion", en: "Y2K millennium chrome aesthetic, metallic bubbles, vaporwave digital accents, retro-futuristic vibes", es: "estética milenarista Y2K chrome, burbujas metálicas, toques vaporwave digitales y aire retro-futurista" },
    { id: "paper_cutout", label: "Papel Recortado & Stop Motion", en: "layered textured paper craft cutout animation, subtle cast shadows, tactile depth and handcrafted feel", es: "animación de capas de papel recortado con textura, sombras arrojadas sutiles y profundidad artesanal" },
    { id: "cinematic_photoreal", label: "Cinematográfico Hiperrealista", en: "cinematic photo-realism, 8k resolution, photorealistic physically-based rendering (PBR), anamorphic lens bokeh", es: "fotorrealismo cinematográfico en 8k, renderizado basado en físicas reales (PBR) y bokeh de lente anamórfica" }
  ],
  motionDynamics: [
    { id: "electric_assembly", label: "Ensamblaje Eléctrico / Piezas Magnéticas", en: "snapping together magnetically with subtle electric spark arcs and kinetic lock-in shockwave", es: "piezas ensamblándose magnéticamente con arcos eléctricos sutiles y onda de choque cinética al encajar" },
    { id: "fluid_morphing", label: "Morphing Fluido y Continuo", en: "smooth liquid morphing transformation, shifting geometries with continuous organic deformation", es: "transformación líquida por morphing suave, geometrías mutantes con deformación orgánica continua" },
    { id: "elastic_snap", label: "Rebote Elástico / Overshoot Snappy", en: "snappy entrance with elastic overshoot bounce, playful anticipation and crisp settling ease", es: "entrada ágil con rebote elástico overshoot, anticipación sutil y asentamiento suave" },
    { id: "smooth_float", label: "Flotación Ingrávida / Gravedad Cero", en: "gentle zero-gravity weightless floating, subtle orbital drift with calm natural physics", es: "suave flotación en gravedad cero sin peso, deriva orbital tranquila con físicas naturales" },
    { id: "particle_dissolve", label: "Disolución y Recomposición de Partículas", en: "disintegrating into millions of luminous micro-particles and magically reforming smoothly", es: "desintegrándose en millones de micropartículas luminosas y recomponiéndose mágicamente con suavidad" },
    { id: "hud_unfolding", label: "Despliegue Holográfico / Scanline Reveal", en: "laser scanline sweep revealing elements, digital wireframes expanding into solid illuminated graphics", es: "barrido de escaneo láser revelando elementos, mallas digitales expandiéndose en gráficos luminosos" },
    { id: "stopmotion_bounce", label: "Saltitos Stop-Motion (12 FPS)", en: "stepped 12 frames-per-second stop-motion stutter movement with bouncy organic physics", es: "movimiento escalonado stop-motion a 12 fotogramas por segundo con físicas elásticas orgánicas" },
    { id: "vortex_spin", label: "Vórtice Centrífugo y Aceleración", en: "swirling vortex centrifugal spin accelerating rapidly then decelerating into precise composition", es: "giro centrífugo en vórtice acelerando con fuerza para luego desacelerar suavemente en su lugar" },
    { id: "datamosh_glitch", label: "Glitch Digital y Datamoshing", en: "controlled digital glitch distortions, chromatic RGB split, snappy frame drops and pixel displacement", es: "distorsiones glitch digitales controladas, separación cromática RGB y desplazamiento dinámico de píxeles" }
  ],
  cameraMovements: [
    { id: "dolly_in_rapid", label: "Slow Dolly In a Rápido Snap", en: "smooth slow dolly-in camera push gradually accelerating into an intense dramatic closeup", es: "avance de cámara lento en dolly-in acelerando gradualmente hacia un primer plano dramático" },
    { id: "orbit_360", label: "Giro Orbital 360° Cinemático", en: "cinematic 360-degree continuous camera orbit around the main subject showcasing full volume and depth", es: "giro orbital cinematográfico continuo de 360 grados alrededor del sujeto mostrando su volumen y tridimensionalidad" },
    { id: "kinetic_tracking", label: "Tracking Lateral Dinámico", en: "rapid horizontal tracking shot locked onto the action with smooth motion blur on the background", es: "plano de seguimiento horizontal rápido bloqueado en la acción con desenfoque de movimiento en el fondo" },
    { id: "shallow_dof_pan", label: "Panorámica con Foco Selectivo (Bokeh)", en: "gentle camera pan with shallow depth of field, creamy bokeh and rack focus shifting attention", es: "paneo suave con profundidad de campo reducida, bokeh cremoso y cambio de enfoque selectivo" },
    { id: "top_down_cenital", label: "Plano Cenital con Rotación (Top-Down)", en: "overhead top-down 90-degree flat lay view with slow hypnotic rotational movement", es: "vista cenital cenital cenital a 90 grados con suave rotación hipnótica" },
    { id: "fpv_flythrough", label: "Vuelo FPV Inmersivo a Través de Objetos", en: "dynamic FPV drone flythrough threading cleanly through gaps between geometric floating elements", es: "vuelo inmersivo tipo dron FPV cruzando limpiamente a través de los espacios entre los elementos flotantes" },
    { id: "crash_zoom", label: "Crash Zoom & Quick Pull-Back", en: "instant crash zoom punch-in followed by a smooth cushioned pull back settling into place", es: "aproximación instantánea en crash zoom seguida de una suave retirada amortiguada" },
    { id: "static_locked", label: "Cámara Fija (Trípode Estable)", en: "locked-off static tripod camera allowing the internal motion graphics physics to command full focus", es: "cámara estática fijada en trípode para que todo el protagonismo recaiga en la física de animación interna" }
  ],
  lightingColor: [
    { id: "neon_dual", label: "Neón Dual (Cian & Magenta)", en: "electric dual-tone lighting with saturated cyan and vibrant magenta rim lights, deep black shadows", es: "iluminación bitono eléctrica con luces de borde en cian saturado y magenta vibrante, sombras negras profundas" },
    { id: "studio_clean", label: "Estudio Blanco Softbox Impecable", en: "pristine high-key studio softbox lighting, ultra clean diffuse reflections, neutral color grading", es: "iluminación de estudio softbox en clave alta, reflejos difusos ultra limpios y etalonaje neutro" },
    { id: "moody_rim", label: "Claroscuro con Luz de Borde (Rim Light)", en: "dramatic chiaroscuro lighting, crisp golden rim light outlining silhouette against a dark backdrop", es: "iluminación claroscuro dramática, luz de borde dorada nítida perfilando la silueta sobre fondo oscuro" },
    { id: "iridescent_hdr", label: "Iridiscencia Prisma & Cáusticas HDR", en: "prismatic chromatic reflections, rainbow specular dispersion, complex studio HDR environment maps", es: "reflejos prismáticos cromáticos, dispersión especular arcoíris y mapa de entorno HDR complejo" },
    { id: "cyan_glow", label: "Glow Cian Holográfico & Rayos Volumétricos", en: "ethereal cyan volumetric glow, God rays penetrating mist, high luminance emission", es: "resplandor volumétrico cian etéreo, rayos de luz penetrando la niebla y alta luminiscencia" },
    { id: "soft_studio", label: "Luz Cálida Natural & Sombras Suaves", en: "warm morning sunlight ambient fill, diffused soft ambient occlusion shadows, gentle contrast", es: "luz matutina cálida natural, sombras difusas de oclusión ambiental y contraste suave" },
    { id: "monochrome_gold", label: "Monocromo Negro & Acentos en Oro", en: "monochromatic deep graphite and velvet black with rich 24k polished gold reflective accents", es: "monocromo en grafito profundo y negro terciopelo con lujosos acentos reflectantes en oro de 24k" },
    { id: "acid_hypercolor", label: "Hipercolor Ácido & Contraste Extremo", en: "acid green and electric violet hyper-saturated lighting, futuristic energetic color grading", es: "iluminación hipersaturada verde ácido y violeta eléctrico con etalonaje futurista enérgico" }
  ],
  tempos: [
    { id: "snappy_dynamic", label: "Ágil y Enérgico (Snappy con Ease In-Out)", en: "snappy 2-second dynamic tempo with aggressive ease-in and cushioned ease-out", es: "tempo ágil y dinámico con aceleración agresiva y frenado amortiguado (ease in-out)" },
    { id: "fast_rhythmic", label: "Rápido al Ritmo (BPM 128 TikTok/Reels)", en: "high-paced rhythmic cut matching 128 BPM music beat, quick energetic bursts", es: "ritmo rápido y sincopado acorde a 128 BPM musicales, ideal para clips virales" },
    { id: "slow_cinematic", label: "Cinematográfico Contemplativo (Slow-Mo 60fps)", en: "slow-motion graceful tempo, luxurious cinematic pacing with floating momentum", es: "cámara lenta elegante, ritmo cinematográfico contemplativo con sensación de gravedad suave" },
    { id: "hypnotic_slow", label: "Bucle Hipnótico Continuo", en: "hypnotic perpetual motion, seamless rhythmic breathing rhythm with no harsh breaks", es: "movimiento perpetuo hipnótico, respiración rítmica continua sin cambios bruscos" },
    { id: "playful_stopmotion", label: "Juguetón y Alegre (Chunky Physics)", en: "playful cadence with organic chunky physics and delightful micro-pauses", es: "cadencia alegre y juguetona con físicas orgánicas y micro-pausas agradables" }
  ],
  targetEngines: [
    {
      id: "runway_gen3",
      name: "Runway Gen-3 Alpha",
      syntax: "--fps 24",
      tip: "Usa descriptores cinematográficos de cámara y físicas de partículas. El control de cámara de Gen-3 responde excelente a términos como 'dolly-in', 'orbital' y 'shallow depth of field'."
    },
    {
      id: "kling",
      name: "Kling AI 1.5",
      syntax: "--motion 6 --duration 5s",
      tip: "Kling sobresale en dinámicas de fluidos, telas y elásticas. Incluye siempre la masa y el peso de los objetos para un movimiento ultra realista."
    },
    {
      id: "luma",
      name: "Luma Dream Machine",
      syntax: "--camera orbit --fps 24",
      tip: "Luma destaca por trayectorias de cámara fluidas en 3D y coherencia espacial. Prueba a usar 'Start Frame' y 'End Frame' para transiciones impecables."
    },
    {
      id: "sora",
      name: "OpenAI Sora / Minimax Hailuo",
      syntax: "--style photoreal --resolution 4k",
      tip: "Describe la física de la luz, los materiales táctiles y el ambiente con riqueza visual: cáusticas, reflejos HDR y dispersión cromática."
    },
    {
      id: "midjourney",
      name: "Midjourney v6.1 (Hero Frame Inicial)",
      syntax: "--v 6.1 --ar {AR} --style raw --stylize 250",
      tip: "Genera el fotograma de inicio perfecto (Hero Frame) en Midjourney antes de animar en Runway o Kling con Image-to-Video."
    },
    {
      id: "llm_director",
      name: "ChatGPT / Claude (Director de Arte & AE)",
      syntax: "[Meta-Prompt]",
      tip: "Pega el Meta-Prompt en ChatGPT o Claude para obtener el storyboard desglosado segundo a segundo o código ExtendScript / expresiones para After Effects."
    }
  ],
  aspectRatios: [
    { id: "16:9", label: "16:9 Panorámico (YouTube, Pantallas, TV)", value: "16:9" },
    { id: "9:16", label: "9:16 Vertical (Reels, TikTok, Shorts)", value: "9:16" },
    { id: "1:1", label: "1:1 Cuadrado (Instagram Feed, Web)", value: "1:1" },
    { id: "4:5", label: "4:5 Vertical Feed (Instagram)", value: "4:5" },
    { id: "21:9", label: "21:9 Ultra-Panorámico Cinemático", value: "21:9" }
  ]
};

// Global App State
const state = {
  config: DEFAULT_CONFIG,
  heroConfig: null,
  expressions: [],
  storyboards: [],
  promptsLibrary: [],
  glossary: [],
  tools: [],
  favorites: [],
  activeTab: 'generator'
};

const TAB_LABELS = {
  generator: 'Generador de Motion Graphics',
  heroframes: 'Hero Frames (Midjourney & Flux)',
  expressions: 'Expresiones After Effects',
  storyboard: 'Storyboards & Guiones Técnicos',
  library: 'Biblioteca de Prompts Curados',
  glossary: 'Guía & Glosario de Motion',
  tools: 'Directorio de Herramientas IA',
  favorites: 'Mis Prompts Guardados'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadStoredFavorites();
  loadAllData().then(() => {
    populateGeneratorSelects();
    initHeroFrameGenerator();
    renderExpressions();
    renderStoryboards();
    renderPromptsLibrary();
    renderGlossary();
    renderToolsDirectory();
    renderFavorites();
    updateKpiCounts();
    registerCommandPaletteItems();
    setupEventListeners();
    updateGeneratorPrompt(); // Initial prompt generation

    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && TAB_LABELS[initialHash]) {
      switchTab(initialHash, false);
    }

    if (window.SangarShell) window.SangarShell.renderIcons();
  });
});

/**
 * Tab Navigation
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  document.querySelectorAll('[data-tab-jump]').forEach(el => {
    el.addEventListener('click', (e) => {
      const targetTab = el.getAttribute('data-tab-jump');
      if (targetTab && TAB_LABELS[targetTab]) {
        e.preventDefault();
        switchTab(targetTab);
      }
    });
  });

  const quickHero = document.getElementById('topbar-quick-hero');
  if (quickHero) {
    quickHero.addEventListener('click', () => switchTab('heroframes'));
  }

  window.addEventListener('hashchange', () => {
    const hashTab = window.location.hash.replace('#', '');
    if (hashTab && TAB_LABELS[hashTab] && hashTab !== state.activeTab) {
      switchTab(hashTab, false);
    }
  });
}

function switchTab(tabId, updateHash = true) {
  if (!TAB_LABELS[tabId]) return;
  state.activeTab = tabId;

  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    const active = btn.getAttribute('data-tab') === tabId;
    btn.classList.toggle('is-active', active);
    if (active) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });

  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabId}`);
  });

  const subtitle = document.getElementById('topbar-subtitle');
  if (subtitle) {
    subtitle.textContent = `Sangar AI Library · ${TAB_LABELS[tabId]}`;
  }

  if (updateHash && window.location.hash !== `#${tabId}`) {
    history.replaceState(null, '', `#${tabId}`);
  }

  if (tabId === 'favorites') {
    renderFavorites();
  }

  if (window.SangarShell && typeof window.SangarShell.closeMobileDrawer === 'function') {
    window.SangarShell.closeMobileDrawer();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Fetch external JSON datasets with robust fallbacks
 */
async function loadAllData() {
  try {
    const [genRes, heroRes, exprRes, storyRes, libRes, toolRes, glossRes] = await Promise.all([
      fetch('data/motion-generator.json').catch(() => null),
      fetch('data/hero-frames-generator.json').catch(() => null),
      fetch('data/after-effects-tools.json').catch(() => null),
      fetch('data/storyboard-templates.json').catch(() => null),
      fetch('data/prompts-library.json').catch(() => null),
      fetch('data/ai-tools.json').catch(() => null),
      fetch('data/animation-glossary.json').catch(() => null)
    ]);

    if (genRes && genRes.ok) state.config = await genRes.json();
    if (heroRes && heroRes.ok) state.heroConfig = await heroRes.json();
    if (exprRes && exprRes.ok) state.expressions = await exprRes.json();
    if (storyRes && storyRes.ok) state.storyboards = await storyRes.json();
    if (libRes && libRes.ok) state.promptsLibrary = await libRes.json();
    if (toolRes && toolRes.ok) state.tools = await toolRes.json();
    if (glossRes && glossRes.ok) state.glossary = await glossRes.json();
  } catch (err) {
    console.info("Using embedded fallbacks where necessary.");
  }
}

/**
 * Populate Motion Generator Form Selects
 */
function populateGeneratorSelects() {
  populateSelect('projectTypeSelect', state.config.projectTypes, 'logo_reveal');
  populateSelect('targetEngineSelect', state.config.targetEngines, 'runway_gen3');
  populateSelect('styleSelect', state.config.visualStyles, 'cyberpunk_neon');
  populateSelect('motionSelect', state.config.motionDynamics, 'electric_assembly');
  populateSelect('cameraSelect', state.config.cameraMovements, 'dolly_in_rapid');
  populateSelect('lightingSelect', state.config.lightingColor, 'neon_dual');
  populateSelect('tempoSelect', state.config.tempos, 'snappy_dynamic');
  populateSelect('aspectRatioSelect', state.config.aspectRatios, '16:9');
}

function populateSelect(selectId, items, defaultVal) {
  const select = document.getElementById(selectId);
  if (!select || !items) return;
  select.innerHTML = '';
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item.label || item.name;
    if (item.id === defaultVal) opt.selected = true;
    select.appendChild(opt);
  });
}

/**
 * HERO FRAMES GENERATOR MODULE (Midjourney & Flux)
 */
function initHeroFrameGenerator() {
  if (!state.heroConfig) return;

  populateSelect('heroEngineSelect', state.heroConfig.engines, 'octane_render');
  populateSelect('heroLensSelect', state.heroConfig.lenses, 'lens_85mm');
  populateSelect('heroMaterialSelect', state.heroConfig.materials, 'titanium_gold');
  populateSelect('heroLightingSelect', state.heroConfig.lighting, 'studio_softbox');

  const heroForm = document.getElementById('heroFrameForm');
  if (heroForm) {
    heroForm.addEventListener('input', updateHeroFramePrompt);
    heroForm.addEventListener('change', updateHeroFramePrompt);
  }

  const stylizeRange = document.getElementById('heroStylizeRange');
  const stylizeVal = document.getElementById('heroStylizeVal');
  if (stylizeRange && stylizeVal) {
    stylizeRange.addEventListener('input', () => {
      stylizeVal.textContent = stylizeRange.value;
      updateHeroFramePrompt();
    });
  }

  document.querySelectorAll('.hero-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.hero-preset-chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const pId = chip.getAttribute('data-preset');
      applyHeroPreset(pId);
    });
  });

  const resetHeroBtn = document.getElementById('resetHeroBtn');
  if (resetHeroBtn) {
    resetHeroBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.hero-preset-chip').forEach(c => c.classList.remove('is-active'));
      applyHeroPreset('hero_logo_3d');
    });
  }

  setupCopyBtn('copyHeroPromptBtn', () => document.getElementById('heroPromptOutput').value, 'Prompt Midjourney copiado');
  setupCopyBtn('copyHeroActionBtn', () => document.getElementById('heroPromptOutput').value, 'Prompt Midjourney copiado');

  updateHeroFramePrompt();
}

function applyHeroPreset(presetId) {
  if (!state.heroConfig || !state.heroConfig.presets) return;
  const p = state.heroConfig.presets.find(x => x.id === presetId);
  if (!p) return;

  setSelectValue('heroEngineSelect', p.engine);
  setSelectValue('heroLensSelect', p.lens);
  setSelectValue('heroMaterialSelect', p.material);
  setSelectValue('heroLightingSelect', p.lighting);
  setSelectValue('heroArSelect', p.aspectRatio);

  const subjectInput = document.getElementById('heroSubjectInput');
  if (subjectInput) subjectInput.value = p.subject;

  const stylizeRange = document.getElementById('heroStylizeRange');
  const stylizeVal = document.getElementById('heroStylizeVal');
  if (stylizeRange && stylizeVal) {
    stylizeRange.value = p.stylize || 250;
    stylizeVal.textContent = stylizeRange.value;
  }

  const rawToggle = document.getElementById('heroStyleRawToggle');
  if (rawToggle) rawToggle.checked = Boolean(p.styleRaw);

  updateHeroFramePrompt();
  showToast(`Preset Hero cargado: ${p.name}`, 'success');
}

function updateHeroFramePrompt() {
  if (!state.heroConfig) return;

  const subject = document.getElementById('heroSubjectInput')?.value.trim() || "3D logo mark";
  const engineId = document.getElementById('heroEngineSelect')?.value;
  const lensId = document.getElementById('heroLensSelect')?.value;
  const matId = document.getElementById('heroMaterialSelect')?.value;
  const lightId = document.getElementById('heroLightingSelect')?.value;
  const ar = document.getElementById('heroArSelect')?.value || "16:9";
  const stylize = document.getElementById('heroStylizeRange')?.value || "250";
  const isRaw = document.getElementById('heroStyleRawToggle')?.checked;

  const engObj = state.heroConfig.engines?.find(e => e.id === engineId) || {};
  const lensObj = state.heroConfig.lenses?.find(l => l.id === lensId) || {};
  const matObj = state.heroConfig.materials?.find(m => m.id === matId) || {};
  const lightObj = state.heroConfig.lighting?.find(li => li.id === lightId) || {};

  let parts = [translateSubjectToEn(subject)];
  if (matObj.en) parts.push(matObj.en);
  if (engObj.en) parts.push(engObj.en);
  if (lensObj.en) parts.push(lensObj.en);
  if (lightObj.en) parts.push(lightObj.en);

  let params = [`--v 6.1`, `--ar ${ar}`];
  if (isRaw) params.push(`--style raw`);
  if (stylize) params.push(`--stylize ${stylize}`);

  const fullPrompt = `${parts.join(", ")} ${params.join(" ")}`;

  const outputEl = document.getElementById('heroPromptOutput');
  if (outputEl) outputEl.value = fullPrompt;

  const heroParamsBar = document.getElementById('heroParamsBar');
  if (heroParamsBar) {
    heroParamsBar.innerHTML = '';
    params.forEach(p => {
      const span = document.createElement('span');
      span.className = 'param-pill';
      span.textContent = p;
      heroParamsBar.appendChild(span);
    });
  }
}

/**
 * AFTER EFFECTS EXPRESSIONS MODULE
 */
function renderExpressions() {
  const container = document.getElementById('expressionsGridContainer');
  if (!container) return;
  container.innerHTML = '';

  const esc = window.SangarShell ? window.SangarShell.escapeHtml : (s) => s;

  state.expressions.forEach(expr => {
    const card = document.createElement('article');
    card.className = 'expr-card';
    card.innerHTML = `
      <div class="card-top">
        <h2 class="card-title">${esc(expr.name)}</h2>
        <span class="sg-badge sg-badge--success">${esc(expr.property)}</span>
      </div>
      <p class="card-desc">${esc(expr.description)}</p>
      <div class="expr-howto">
        <strong>Cómo usarlo:</strong> ${esc(expr.howToUse)}
      </div>
      <pre class="card-prompt-code"><code>${esc(expr.code)}</code></pre>
      <div class="card-actions">
        <button type="button" class="sg-btn sg-btn--primary sg-btn--sm btn-copy-expr" style="width: 100%;">
          <i data-lucide="copy"></i> Copiar Expresión para After Effects
        </button>
      </div>
    `;

    card.querySelector('.btn-copy-expr').addEventListener('click', () => {
      copyText(expr.code, `Expresión copiada: ${expr.name}`, 'success');
    });

    container.appendChild(card);
  });

  if (window.SangarShell) window.SangarShell.renderIcons(container);
}

/**
 * STORYBOARDS & SCRIPTS MODULE
 */
function renderStoryboards() {
  const container = document.getElementById('storyboardContainer');
  if (!container) return;
  container.innerHTML = '';

  const esc = window.SangarShell ? window.SangarShell.escapeHtml : (s) => s;

  state.storyboards.forEach(sb => {
    const wrap = document.createElement('article');
    wrap.className = 'storyboard-wrapper';

    let shotsHtml = sb.shots.map(s => `
      <div class="shot-card">
        <span class="sg-badge sg-badge--coral" style="align-self:flex-start;">Plano ${esc(s.shot)}</span>
        <h4>${esc(s.name)}</h4>
        <p class="shot-goal">${esc(s.goal)}</p>
        <div class="shot-detail-row">
          <i data-lucide="clapperboard"></i>
          <span><strong>Cámara:</strong> ${esc(s.camera)}</span>
        </div>
        <div class="shot-detail-row">
          <i data-lucide="sparkles"></i>
          <span><strong>Audio/SFX:</strong> ${esc(s.audio)}</span>
        </div>
        <pre class="card-prompt-code"><code>${esc(s.promptIdea)}</code></pre>
        <button type="button" class="btn-copy-mini btn-copy-shot-prompt" style="margin-top: auto; align-self: flex-start;">
          <i data-lucide="copy"></i> Copiar Prompt Plano ${esc(s.shot)}
        </button>
      </div>
    `).join('');

    wrap.innerHTML = `
      <div class="storyboard-header">
        <div>
          <h2>${esc(sb.title)}</h2>
          <p>${esc(sb.description)}</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <span class="sg-badge sg-badge--neutral">${esc(sb.duration)}</span>
          <span class="sg-badge sg-badge--info">${esc(sb.format)}</span>
          <button type="button" class="sg-btn sg-btn--outline sg-btn--sm btn-copy-all-shots">
            <i data-lucide="copy"></i> Copiar Guión Completo
          </button>
        </div>
      </div>
      <div class="shots-timeline-grid">
        ${shotsHtml}
      </div>
    `;

    wrap.querySelectorAll('.btn-copy-shot-prompt').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        copyText(sb.shots[idx].promptIdea, `Prompt Plano ${idx + 1} copiado`, 'success');
      });
    });

    wrap.querySelector('.btn-copy-all-shots').addEventListener('click', () => {
      const fullScript = `GUIÓN TÉCNICO Y STORYBOARD — ${sb.title}\nDuración: ${sb.duration} | Formato: ${sb.format}\n\n` +
        sb.shots.map(s => `[PLANO ${s.shot}: ${s.name}]\nObjetivo: ${s.goal}\nCámara: ${s.camera}\nAudio: ${s.audio}\nPrompt IA: ${s.promptIdea}\n`).join('\n');
      copyText(fullScript, 'Guión técnico completo copiado', 'success');
    });

    container.appendChild(wrap);
  });

  if (window.SangarShell) window.SangarShell.renderIcons(container);
}

/**
 * Setup Main Event Listeners
 */
function setupEventListeners() {
  const form = document.getElementById('promptGeneratorForm');
  if (form) {
    form.addEventListener('input', updateGeneratorPrompt);
    form.addEventListener('change', updateGeneratorPrompt);
  }

  // Motion strength range display
  const range = document.getElementById('motionStrengthRange');
  const rangeVal = document.getElementById('motionStrengthVal');
  if (range && rangeVal) {
    range.addEventListener('input', () => {
      rangeVal.textContent = `${range.value} / 10`;
      updateGeneratorPrompt();
    });
  }

  // Quick subject ideas
  document.querySelectorAll('.quick-sub-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const subjectInput = document.getElementById('subjectInput');
      subjectInput.value = btn.getAttribute('data-subject');
      updateGeneratorPrompt();
    });
  });

  // Preset chips
  document.querySelectorAll('.presets-bar .preset-chip:not(.hero-preset-chip)').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.presets-bar .preset-chip:not(.hero-preset-chip)').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const presetId = chip.getAttribute('data-preset');
      applyPreset(presetId);
    });
  });

  // Reset Form
  const resetBtn = document.getElementById('resetFormBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.presets-bar .preset-chip:not(.hero-preset-chip)').forEach(c => c.classList.remove('is-active'));
      applyPreset('cyberpunk_logo');
      showToast('Parámetros restaurados al valor por defecto', 'info');
    });
  }

  // Copy Buttons
  setupCopyBtn('copyPromptEnBtn', () => document.getElementById('promptOutputEn').value, 'Prompt en inglés copiado');
  setupCopyBtn('copyPromptEsBtn', () => document.getElementById('promptOutputEs').value, 'Prompt en español copiado');
  setupCopyBtn('copyMetaPromptBtn', () => document.getElementById('metaPromptOutput').value, 'Meta-Prompt para LLM copiado');
  setupCopyBtn('copyFullActionBtn', () => document.getElementById('promptOutputEn').value, 'Prompt listo para el motor copiado');

  // Save Favorite
  const saveFavBtn = document.getElementById('saveFavoriteBtn');
  if (saveFavBtn) {
    saveFavBtn.addEventListener('click', saveCurrentToFavorites);
  }

  // Clear & Export Favorites
  const clearFavBtn = document.getElementById('clearFavoritesBtn');
  if (clearFavBtn) clearFavBtn.addEventListener('click', clearAllFavorites);

  const exportFavBtn = document.getElementById('exportFavoritesBtn');
  if (exportFavBtn) exportFavBtn.addEventListener('click', exportFavoritesAsJson);

  // Library Search and Filters
  const searchInput = document.getElementById('librarySearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterPromptsLibrary);
  }

  const catPills = document.querySelectorAll('#categoryFilterContainer .sg-filter-pill');
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      filterPromptsLibrary();
    });
  });
}

function copyText(text, successMsg, variant = 'success') {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, variant);
    }).catch(() => {
      fallbackCopy(text);
      showToast(successMsg, variant);
    });
  } else {
    fallbackCopy(text);
    showToast(successMsg, variant);
  }
}

function setupCopyBtn(btnId, getTextFn, successMsg) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    copyText(getTextFn(), successMsg, 'success');
  });
}

function fallbackCopy(text) {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

/**
 * Apply a preset configuration
 */
function applyPreset(presetId) {
  const preset = state.config.presets.find(p => p.id === presetId);
  if (!preset) return;

  setSelectValue('projectTypeSelect', preset.projectType);
  setSelectValue('targetEngineSelect', preset.targetEngine);
  setSelectValue('styleSelect', preset.style);
  setSelectValue('motionSelect', preset.motion);
  setSelectValue('cameraSelect', preset.camera);
  setSelectValue('lightingSelect', preset.lighting);
  setSelectValue('tempoSelect', preset.tempo);
  setSelectValue('aspectRatioSelect', preset.aspectRatio);

  const subjectInput = document.getElementById('subjectInput');
  if (subjectInput) subjectInput.value = preset.subject;

  const extraInput = document.getElementById('extraDetailsInput');
  if (extraInput) extraInput.value = preset.extra || '';

  const loopToggle = document.getElementById('loopToggle');
  if (loopToggle) loopToggle.checked = Boolean(preset.isLoop);

  const motionRange = document.getElementById('motionStrengthRange');
  const motionVal = document.getElementById('motionStrengthVal');
  if (motionRange && motionVal) {
    motionRange.value = preset.motionStrength || 6;
    motionVal.textContent = `${motionRange.value} / 10`;
  }

  updateGeneratorPrompt();
  showToast(`Preset cargado: ${preset.name}`, 'success');
}

function setSelectValue(selectId, val) {
  const select = document.getElementById(selectId);
  if (select && val) select.value = val;
}

/**
 * Compute and update the Prompt outputs in real-time
 */
function updateGeneratorPrompt() {
  const projectTypeId = document.getElementById('projectTypeSelect')?.value;
  const engineId = document.getElementById('targetEngineSelect')?.value;
  const styleId = document.getElementById('styleSelect')?.value;
  const motionId = document.getElementById('motionSelect')?.value;
  const cameraId = document.getElementById('cameraSelect')?.value;
  const lightingId = document.getElementById('lightingSelect')?.value;
  const tempoId = document.getElementById('tempoSelect')?.value;
  const arId = document.getElementById('aspectRatioSelect')?.value;
  const subject = document.getElementById('subjectInput')?.value.trim() || "Logotipo abstracto";
  const extra = document.getElementById('extraDetailsInput')?.value.trim();
  const isLoop = document.getElementById('loopToggle')?.checked;
  const motionStrength = document.getElementById('motionStrengthRange')?.value || 6;

  // Retrieve objects
  const projectObj = state.config.projectTypes.find(x => x.id === projectTypeId) || {};
  const engineObj = state.config.targetEngines.find(x => x.id === engineId) || {};
  const styleObj = state.config.visualStyles.find(x => x.id === styleId) || {};
  const motionObj = state.config.motionDynamics.find(x => x.id === motionId) || {};
  const cameraObj = state.config.cameraMovements.find(x => x.id === cameraId) || {};
  const lightingObj = state.config.lightingColor.find(x => x.id === lightingId) || {};
  const tempoObj = state.config.tempos.find(x => x.id === tempoId) || {};

  // Build English Prompt
  let enParts = [];
  enParts.push(`Cinematic 3D ${projectObj.en || "motion graphic"}`);
  enParts.push(`featuring ${translateSubjectToEn(subject)}`);
  if (styleObj.en) enParts.push(styleObj.en);
  if (motionObj.en) enParts.push(motionObj.en);
  if (cameraObj.en) enParts.push(cameraObj.en);
  if (lightingObj.en) enParts.push(lightingObj.en);
  if (tempoObj.en) enParts.push(tempoObj.en);
  if (isLoop) enParts.push("seamless continuous loop, perfect cyclical rhythm with matching end and start frames");
  if (extra) enParts.push(extra);

  let finalPromptEn = enParts.join(", ");

  // Build Engine Parameters
  let paramParts = [];
  if (arId) paramParts.push(`--ar ${arId}`);

  if (engineId === 'runway_gen3') {
    paramParts.push(`--fps 24`);
    paramParts.push(`--motion ${motionStrength}`);
    if (isLoop) paramParts.push(`--loop`);
  } else if (engineId === 'kling') {
    paramParts.push(`--motion ${motionStrength}`);
    paramParts.push(`--duration 5s`);
  } else if (engineId === 'luma') {
    paramParts.push(`--motion ${motionStrength}`);
    paramParts.push(`--camera ${cameraId.replace('_', ' ')}`);
  } else if (engineId === 'midjourney') {
    paramParts = [`--v 6.1`, `--ar ${arId}`, `--style raw`, `--stylize 250`];
  } else if (engineId === 'sora') {
    paramParts.push(`--style photoreal 8k`);
  }

  const fullPromptWithParams = `${finalPromptEn} ${paramParts.join(" ")}`.trim();

  // Build Spanish Concept Description
  let esParts = [];
  esParts.push(`Pieza de ${projectObj.es || "motion graphics"}:`);
  esParts.push(`como elemento principal presenta ${subject}.`);
  if (styleObj.es) esParts.push(`Estilo visual en ${styleObj.es}.`);
  if (motionObj.es) esParts.push(`Comportamiento de movimiento con ${motionObj.es}.`);
  if (cameraObj.es) esParts.push(`Cámara: ${cameraObj.es}.`);
  if (lightingObj.es) esParts.push(`Iluminación: ${lightingObj.es}.`);
  if (tempoObj.es) esParts.push(`Ritmo: ${tempoObj.es}.`);
  if (isLoop) esParts.push(`Animado en bucle continuo perfecto (seamless loop).`);
  if (extra) esParts.push(`Detalles extra: ${extra}.`);

  const finalPromptEs = esParts.join(" ");

  // Build Meta-Prompt for LLMs
  const metaPrompt = `Actúa como un Director de Arte y Diseñador de Motion Graphics Senior. Desglosa esta escena en un storyboard técnico de 5 a 8 segundos plano por plano, especificando fotogramas clave, curvas de aceleración (ease-in/ease-out), y escribe las expresiones matemáticas de After Effects (para Escala, Opacidad o Posición con rebote elástico) para llevarlo a cabo:

PROYECTO: ${projectObj.label || 'Motion Graphic'}
ELEMENTO: ${subject}
ESTILO: ${styleObj.label || '3D'}
DINÁMICA: ${motionObj.label || 'Fluido'}
CÁMARA: ${cameraObj.label || 'Dolly in'}
ILUMINACIÓN: ${lightingObj.label || 'Neón'}
MOTOR DESTINO: ${engineObj.name || 'Runway'}`;

  // Update DOM Outputs
  const outputEnEl = document.getElementById('promptOutputEn');
  const outputEsEl = document.getElementById('promptOutputEs');
  const metaPromptEl = document.getElementById('metaPromptOutput');
  const engineBadge = document.getElementById('targetEngineBadge');
  const paramsBar = document.getElementById('parametersBar');
  const tipText = document.getElementById('directorTipText');

  if (outputEnEl) outputEnEl.value = fullPromptWithParams;
  if (outputEsEl) outputEsEl.value = finalPromptEs;
  if (metaPromptEl) metaPromptEl.value = metaPrompt;

  if (engineBadge) engineBadge.textContent = engineObj.name || "Runway Gen-3 Alpha";

  // Update Parameters Bar
  if (paramsBar) {
    paramsBar.innerHTML = '';
    paramParts.forEach(p => {
      const span = document.createElement('span');
      span.className = 'param-pill';
      span.textContent = p;
      paramsBar.appendChild(span);
    });
  }

  // Update Dynamic Tip
  if (tipText) {
    tipText.textContent = engineObj.tip || styleObj.es || "Usa iluminación de borde para separar claramente la geometría del fondo y resaltar los reflejos.";
  }
}

/**
 * English dictionary mapping for common Spanish subject phrases
 */
function translateSubjectToEn(spanishSubject) {
  const dict = [
    { es: /logotipo minimalista.*líneas geométricas/i, en: "a sleek minimalist 3D geometric logo mark" },
    { es: /monograma geométrico 3D flotante/i, en: "a floating 3D geometric monogram with beveled edges" },
    { es: /botella de perfume.*cristal/i, en: "a luxury faceted glass perfume bottle on black volcanic stone" },
    { es: /plataforma de datos cuánticos.*isométrica/i, en: "an isometric quantum data platform with floating server racks" },
    { es: /estructura biomórfica de cromo/i, en: "a biomorphic liquid chrome sculpture suspended in zero gravity" },
    { es: /logotipo/i, en: "a 3D brand logo" },
    { es: /monograma/i, en: "a luxury geometric monogram" },
    { es: /frase de impacto tipográfica.*serif/i, en: "bold contrasting typography letterforms in serif and sans-serif" },
    { es: /tipografía bold/i, en: "bold massive 3D typography letters" },
    { es: /reloj de alta gama/i, en: "a luxury high-end skeleton watch with visible sapphire gear mechanisms" },
    { es: /panel de control holográfico/i, en: "a floating futuristic holographic HUD interface dashboard" },
    { es: /esfera de vidrio/i, en: "an iridescent translucent frosted glass sphere" },
    { es: /zapatilla/i, en: "a futuristic techwear sneaker with layered exploded components" },
    { es: /tarjeta/i, en: "a floating translucent glassmorphism fintech credit card" },
    { es: /personaje.*plastilina/i, en: "a tactile claymation character with playful geometric shapes" }
  ];

  for (const item of dict) {
    if (item.es.test(spanishSubject)) {
      return item.en;
    }
  }
  return spanishSubject;
}

/**
 * Render Prompts Library
 */
function renderPromptsLibrary(itemsToRender = null) {
  const container = document.getElementById('promptsGridContainer');
  if (!container) return;

  const esc = window.SangarShell ? window.SangarShell.escapeHtml : (s) => s;
  const items = itemsToRender || state.promptsLibrary;
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = `
      <div class="sg-empty" style="grid-column: 1 / -1;">
        <div class="sg-empty__img"><i data-lucide="search"></i></div>
        <div class="sg-empty__title">Sin coincidencias</div>
        <p class="sg-empty__desc">No se encontraron prompts coincidentes con tu búsqueda o categoría actual.</p>
      </div>
    `;
    if (window.SangarShell) window.SangarShell.renderIcons(container);
    return;
  }

  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'prompt-card';
    card.innerHTML = `
      <div class="card-top">
        <h2 class="card-title">${esc(item.title)}</h2>
        <span class="sg-badge sg-badge--coral">${esc(item.recommended_tool)}</span>
      </div>
      <p class="card-desc">${esc(item.description)}</p>
      <div class="card-tags">
        ${(item.tags || []).map(t => `<span class="tag-badge">#${esc(t)}</span>`).join('')}
      </div>
      <pre class="card-prompt-code"><code>${esc(item.prompt_en)}</code></pre>
      <div class="card-actions">
        <span class="card-params-mono">${esc(item.parameters || '')}</span>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="sg-btn sg-btn--secondary sg-btn--sm btn-copy-card">
            <i data-lucide="copy"></i> Copiar
          </button>
          <button type="button" class="sg-btn sg-btn--outline sg-btn--sm btn-save-card" aria-label="Guardar ${esc(item.title)} en favoritos">
            <i data-lucide="star"></i>
          </button>
        </div>
      </div>
    `;

    card.querySelector('.btn-copy-card').addEventListener('click', () => {
      copyText(item.prompt_en, `Copiado: ${item.title}`, 'success');
    });

    card.querySelector('.btn-save-card').addEventListener('click', () => {
      saveCustomFavorite({
        title: item.title,
        engine: item.recommended_tool,
        prompt_en: item.prompt_en,
        prompt_es: item.prompt_es || item.description,
        created: new Date().toLocaleDateString()
      });
    });

    container.appendChild(card);
  });

  if (window.SangarShell) window.SangarShell.renderIcons(container);
}

function filterPromptsLibrary() {
  const query = document.getElementById('librarySearchInput')?.value.toLowerCase().trim() || '';
  const activeCat = document.querySelector('#categoryFilterContainer .sg-filter-pill.is-active')?.getAttribute('data-cat') || 'all';

  const filtered = state.promptsLibrary.filter(item => {
    const matchesCat = (activeCat === 'all' || item.category === activeCat);
    const matchesQuery = !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.prompt_en.toLowerCase().includes(query) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(query)));
    return matchesCat && matchesQuery;
  });

  renderPromptsLibrary(filtered);
}

/**
 * Render Glossary
 */
function renderGlossary() {
  const container = document.getElementById('glossaryGridContainer');
  if (!container) return;
  container.innerHTML = '';

  const esc = window.SangarShell ? window.SangarShell.escapeHtml : (s) => s;

  state.glossary.forEach(term => {
    const card = document.createElement('article');
    card.className = 'glossary-card';
    card.innerHTML = `
      <div class="glossary-cat">${esc(term.category)}</div>
      <h3 class="glossary-title">${esc(term.term)}</h3>
      <p class="glossary-desc">${esc(term.description)}</p>
      <div class="glossary-snippet">${esc(term.promptSnippet)}</div>
      <div class="card-actions">
        <span style="font-size: 12px; color: var(--sg-gris-55);">Uso: ${esc(term.recommendedUse)}</span>
        <button type="button" class="btn-copy-mini" style="flex-shrink: 0;"><i data-lucide="copy"></i> Copiar Snippet</button>
      </div>
    `;

    card.querySelector('.btn-copy-mini').addEventListener('click', () => {
      copyText(term.promptSnippet, `Snippet copiado: ${term.term}`, 'success');
    });

    container.appendChild(card);
  });

  if (window.SangarShell) window.SangarShell.renderIcons(container);
}

/**
 * Render Tools Directory
 */
function renderToolsDirectory() {
  const container = document.getElementById('toolsGridContainer');
  if (!container) return;
  container.innerHTML = '';

  const esc = window.SangarShell ? window.SangarShell.escapeHtml : (s) => s;

  state.tools.forEach(tool => {
    const card = document.createElement('article');
    card.className = 'tool-card';
    card.innerHTML = `
      <div class="tool-header">
        <div>
          <h2 class="tool-name">${esc(tool.name)}</h2>
          <span class="tool-dev">${esc(tool.developer)} · ${esc(tool.category)}</span>
        </div>
        <span class="sg-badge sg-badge--warning">★ ${esc(tool.rating)}</span>
      </div>
      <div>
        <span class="sg-badge sg-badge--coral">${esc(tool.badge)}</span>
      </div>
      <ul class="tool-features-list">
        ${(tool.strengths || []).map(s => `<li>${esc(s)}</li>`).join('')}
      </ul>
      <div class="tool-protip">
        <strong>Pro-tip:</strong> ${esc(tool.promptingTip)}
      </div>
      <div class="card-actions">
        <span style="font-size: 12px; color: var(--sg-gris-55);">${esc(tool.pricing)}</span>
        <a href="${esc(tool.website)}" target="_blank" rel="noopener noreferrer" class="sg-btn sg-btn--outline sg-btn--sm">
          Visitar Web <i data-lucide="arrow-up-right"></i>
        </a>
      </div>
    `;
    container.appendChild(card);
  });

  if (window.SangarShell) window.SangarShell.renderIcons(container);
}

/**
 * Favorites System (LocalStorage)
 */
function loadStoredFavorites() {
  try {
    const raw = localStorage.getItem('sangar_library_favorites');
    state.favorites = raw ? JSON.parse(raw) : [];
  } catch (e) {
    state.favorites = [];
  }
  updateFavoritesBadge();
}

function updateFavoritesBadge() {
  const badge = document.getElementById('favCountBadge');
  if (badge) badge.textContent = state.favorites.length;
  const kpiFav = document.getElementById('kpiFavoritesCount');
  if (kpiFav) kpiFav.textContent = state.favorites.length;
}

function updateKpiCounts() {
  const promptsEl = document.getElementById('kpiPromptsCount');
  const exprEl = document.getElementById('kpiExpressionsCount');
  const toolsEl = document.getElementById('kpiToolsCount');
  if (promptsEl && state.promptsLibrary.length) promptsEl.textContent = state.promptsLibrary.length;
  if (exprEl && state.expressions.length) exprEl.textContent = state.expressions.length;
  if (toolsEl && state.tools.length) toolsEl.textContent = state.tools.length;
  updateFavoritesBadge();
}

function registerCommandPaletteItems() {
  if (!window.SangarShell || typeof window.SangarShell.registerSearchItems !== 'function') return;

  const items = [
    { id: 'view-generator', scope: 'views', title: 'Generador de Vídeo IA', subtitle: 'Runway Gen-3, Kling, Luma, Sora y Meta-Prompts', icon: 'clapperboard', badge: 'Módulo', action: () => switchTab('generator') },
    { id: 'view-heroframes', scope: 'views', title: 'Hero Frames (Midjourney & Flux)', subtitle: 'Fotogramas maestros para Image-to-Video', icon: 'gem', badge: 'Módulo', action: () => switchTab('heroframes') },
    { id: 'view-expressions', scope: 'views', title: 'Expresiones After Effects', subtitle: 'Scripts de rebote, wiggle y bucles', icon: 'wand-sparkles', badge: 'Módulo', action: () => switchTab('expressions') },
    { id: 'view-storyboard', scope: 'views', title: 'Storyboards & Guiones', subtitle: 'Plantillas de 15s y 30s plano a plano', icon: 'film', badge: 'Módulo', action: () => switchTab('storyboard') },
    { id: 'view-library', scope: 'views', title: 'Biblioteca de Prompts', subtitle: 'Colección curada lista para copiar', icon: 'book-open', badge: 'Módulo', action: () => switchTab('library') },
    { id: 'view-glossary', scope: 'views', title: 'Guía & Glosario de Motion', subtitle: 'Flujo Image-to-Video y snippets', icon: 'graduation-cap', badge: 'Módulo', action: () => switchTab('glossary') },
    { id: 'view-tools', scope: 'views', title: 'Directorio de Herramientas IA', subtitle: 'Comparativa de modelos de vídeo y diseño', icon: 'cpu', badge: 'Módulo', action: () => switchTab('tools') },
    { id: 'view-favorites', scope: 'views', title: 'Mis Favoritos', subtitle: 'Prompts guardados localmente', icon: 'star', badge: 'Módulo', action: () => switchTab('favorites') },
    { id: 'view-components', scope: 'views', title: 'Componentes UI (21st.dev)', subtitle: 'Abrir librería interactiva de componentes', icon: 'layers', badge: 'Suite', action: () => { window.location.href = 'components.html'; } }
  ];

  (state.config.presets || []).forEach(p => {
    items.push({
      id: `preset-${p.id}`,
      scope: 'presets',
      title: p.name,
      subtitle: p.subject,
      keywords: `${p.style} ${p.targetEngine}`,
      icon: 'zap',
      badge: 'Preset',
      action: () => {
        switchTab('generator');
        applyPreset(p.id);
      }
    });
  });

  state.promptsLibrary.forEach((p, idx) => {
    items.push({
      id: `prompt-${p.id || idx}`,
      scope: 'prompts',
      title: p.title,
      subtitle: `${p.recommended_tool} · ${p.description}`,
      keywords: (p.tags || []).join(' '),
      icon: 'book-open',
      badge: 'Prompt',
      action: () => {
        switchTab('library');
        const search = document.getElementById('librarySearchInput');
        if (search) {
          search.value = p.title;
          filterPromptsLibrary();
        }
      }
    });
  });

  state.expressions.forEach(expr => {
    items.push({
      id: `expr-${expr.id}`,
      scope: 'expressions',
      title: expr.name,
      subtitle: `${expr.property} · ${expr.description}`,
      icon: 'wand-sparkles',
      badge: 'AE Script',
      action: () => {
        switchTab('expressions');
        copyText(expr.code, `Expresión copiada: ${expr.name}`, 'success');
      }
    });
  });

  state.tools.forEach(tool => {
    items.push({
      id: `tool-${tool.id}`,
      scope: 'tools',
      title: tool.name,
      subtitle: `${tool.developer} · ${tool.badge}`,
      icon: 'cpu',
      badge: `★ ${tool.rating}`,
      action: () => switchTab('tools')
    });
  });

  window.SangarShell.registerSearchItems(items);
}

function saveCurrentToFavorites() {
  const en = document.getElementById('promptOutputEn')?.value;
  const es = document.getElementById('promptOutputEs')?.value;
  const engine = document.getElementById('targetEngineBadge')?.textContent;
  const subject = document.getElementById('subjectInput')?.value || 'Prompt';

  if (!en) return;

  const item = {
    id: Date.now().toString(),
    title: `Motion: ${subject.slice(0, 32)}${subject.length > 32 ? '…' : ''}`,
    engine: engine,
    prompt_en: en,
    prompt_es: es,
    created: new Date().toLocaleDateString()
  };

  saveCustomFavorite(item);
}

function saveCustomFavorite(item) {
  if (!item.id) item.id = Date.now().toString();
  const exists = state.favorites.some(f => f.prompt_en === item.prompt_en);
  if (exists) {
    showToast('Este prompt ya está en tus favoritos', 'info');
    return;
  }

  state.favorites.unshift(item);
  persistFavorites();
  updateFavoritesBadge();
  showToast('Guardado en tus Favoritos', 'success');
}

function persistFavorites() {
  try {
    localStorage.setItem('sangar_library_favorites', JSON.stringify(state.favorites));
  } catch (e) {
    console.error("Storage error", e);
  }
}

function renderFavorites() {
  const container = document.getElementById('favoritesGridContainer');
  if (!container) return;
  container.innerHTML = '';

  const esc = window.SangarShell ? window.SangarShell.escapeHtml : (s) => s;

  if (state.favorites.length === 0) {
    container.innerHTML = `
      <div class="sg-empty" style="grid-column: 1 / -1;">
        <div class="sg-empty__img"><i data-lucide="star"></i></div>
        <div class="sg-empty__title">Aún no tienes prompts guardados</div>
        <p class="sg-empty__desc">Genera un prompt con el Generador o pulsa el botón estrella en cualquier tarjeta de la biblioteca para guardarlo aquí.</p>
        <button type="button" class="sg-btn sg-btn--primary" id="empty-go-generator">
          <i data-lucide="clapperboard"></i> Ir al Generador
        </button>
      </div>
    `;
    const goBtn = container.querySelector('#empty-go-generator');
    if (goBtn) goBtn.addEventListener('click', () => switchTab('generator'));
    if (window.SangarShell) window.SangarShell.renderIcons(container);
    return;
  }

  state.favorites.forEach((fav, index) => {
    const card = document.createElement('article');
    card.className = 'prompt-card';
    card.innerHTML = `
      <div class="card-top">
        <h2 class="card-title">${esc(fav.title)}</h2>
        <span class="sg-badge sg-badge--coral">${esc(fav.engine || 'AI Engine')}</span>
      </div>
      <p class="card-desc" style="font-size: 12px; color: var(--sg-gris-55);">Guardado el: ${esc(fav.created)}</p>
      <pre class="card-prompt-code"><code>${esc(fav.prompt_en)}</code></pre>
      <div class="card-actions">
        <button type="button" class="sg-btn sg-btn--outline sg-btn--sm btn-delete-fav" style="color: var(--sg-danger); border-color: var(--sg-danger-bg);">
          <i data-lucide="trash-2"></i> Eliminar
        </button>
        <button type="button" class="sg-btn sg-btn--primary sg-btn--sm btn-copy-fav">
          <i data-lucide="copy"></i> Copiar
        </button>
      </div>
    `;

    card.querySelector('.btn-copy-fav').addEventListener('click', () => {
      copyText(fav.prompt_en, 'Prompt copiado al portapapeles', 'success');
    });

    card.querySelector('.btn-delete-fav').addEventListener('click', () => {
      state.favorites.splice(index, 1);
      persistFavorites();
      updateFavoritesBadge();
      renderFavorites();
      showToast('Prompt eliminado de favoritos', 'info');
    });

    container.appendChild(card);
  });

  if (window.SangarShell) window.SangarShell.renderIcons(container);
}

function clearAllFavorites() {
  if (state.favorites.length === 0) return;
  if (confirm("¿Estás seguro de que quieres vaciar todos tus favoritos guardados?")) {
    state.favorites = [];
    persistFavorites();
    updateFavoritesBadge();
    renderFavorites();
    showToast('Favoritos vaciados', 'info');
  }
}

function exportFavoritesAsJson() {
  if (state.favorites.length === 0) {
    showToast('No hay favoritos para exportar', 'info');
    return;
  }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.favorites, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `sangar-ai-library-favorites-${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Archivo JSON exportado', 'success');
}

/**
 * Toast Notice System (delegates to SangarShell)
 */
function showToast(message, variant = 'default') {
  if (window.SangarShell && typeof window.SangarShell.showToast === 'function') {
    const mapped = ['success', 'danger', 'info', 'default'].includes(variant) ? variant : 'success';
    window.SangarShell.showToast(message, mapped);
  }
}
