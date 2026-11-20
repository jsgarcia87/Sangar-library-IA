/* =====================================================================
   Aurora · Moxen
   Un degradado vivo: cuatro luces difusas que derivan despacio, cada
   una a su ritmo, y una de ellas se inclina hacia el cursor. Se dibuja
   en un canvas diminuto que el navegador agranda: el desenfoque sale
   gratis. Sin dependencias.

     Aurora(document.querySelector('[data-aurora]'), { velocidad: 1 });

   Los colores salen de las variables CSS --ar-luz-1 … --ar-luz-4.
   ===================================================================== */
(function () {
  'use strict';

  /* Cada luz: dónde vive (fracciones del ancho y del alto), cuánto se
     aleja de ahí, a qué ritmo y qué tamaño tiene. Ritmos distintos y sin
     múltiplos comunes: así el dibujo casi nunca se repite. */
  const LUCES = [
    { x: .22, y: .3,  ax: .16, ay: .12, wx: .21, wy: .17, r: .46, f: 0 },
    { x: .78, y: .28, ax: .14, ay: .16, wx: .15, wy: .23, r: .42, f: 1.7 },
    { x: .55, y: .78, ax: .2,  ay: .1,  wx: .19, wy: .13, r: .36, f: 3.1, sigue: true },
    { x: .3,  y: .82, ax: .12, ay: .14, wx: .25, wy: .19, r: .44, f: 4.4 },
  ];

  /* El mismo color con alfa 0. Fundir hacia «transparente» a secas es
     fundir hacia negro transparente, y a medio camino sale un gris sucio
     (se nota mucho sobre fondo claro). */
  const prueba = document.createElement('canvas').getContext('2d');
  function apagado(color) {
    prueba.fillStyle = '#000'; prueba.fillStyle = color;
    const c = prueba.fillStyle;   // el navegador lo devuelve como #rrggbb o rgba(…)
    if (c[0] === '#') return 'rgba(' + parseInt(c.slice(1, 3), 16) + ', ' + parseInt(c.slice(3, 5), 16) + ', ' + parseInt(c.slice(5, 7), 16) + ', 0)';
    return c.replace(/,\s*[\d.]+\)$/, ', 0)');
  }

  function Aurora(caja, opciones) {
    const o = Object.assign({ velocidad: 1, escala: 8 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lienzo = document.createElement('canvas');
    lienzo.className = 'ar-lienzo';
    lienzo.setAttribute('aria-hidden', 'true');
    caja.prepend(lienzo);
    const ctx = lienzo.getContext('2d');

    let w = 0, h = 0, colores = [], bordes = [], mezcla = 'screen', fondo = '#0a0a0a';
    function ajusta() {
      // un píxel del lienzo por cada «escala» píxeles de pantalla
      w = Math.max(16, Math.round(caja.clientWidth / o.escala));
      h = Math.max(10, Math.round(caja.clientHeight / o.escala));
      lienzo.width = w; lienzo.height = h;
      const cs = getComputedStyle(caja);
      colores = LUCES.map((_, i) => cs.getPropertyValue('--ar-luz-' + (i + 1)).trim() || 'rgba(255,255,255,.3)');
      bordes = colores.map(apagado);
      mezcla = cs.getPropertyValue('--ar-mezcla').trim() || 'screen';
      fondo = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : getComputedStyle(document.body).backgroundColor;
    }
    ajusta();
    new ResizeObserver(ajusta).observe(caja);

    // la luz que sigue al cursor lo hace muy despacio, como si pesara
    let px = .55, py = .78, sx = .55, sy = .78, cursor = 0, metaCursor = 0, reloj = 7, previo = 0;
    addEventListener('pointermove', e => {
      const r = caja.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width; py = (e.clientY - r.top) / r.height;
      metaCursor = px >= 0 && px <= 1 && py >= 0 && py <= 1 ? 1 : 0;
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { metaCursor = 0; });

    function dibuja() {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = fondo;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = mezcla;
      const lado = Math.max(w, h);
      LUCES.forEach((l, i) => {
        let x = l.x + Math.sin(reloj * l.wx + l.f) * l.ax;
        let y = l.y + Math.cos(reloj * l.wy + l.f * 1.3) * l.ay;
        if (l.sigue) { x += (sx - x) * cursor * .7; y += (sy - y) * cursor * .7; }
        // el tamaño también respira, apenas
        const r = l.r * lado * (1 + Math.sin(reloj * .31 + l.f) * .08);
        const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r);
        g.addColorStop(0, colores[i]);
        g.addColorStop(1, bordes[i]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });
    }

    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      reloj += dt * o.velocidad;
      const k = 1 - Math.exp(-dt * 1.2);
      sx += (px - sx) * k; sy += (py - sy) * k;
      cursor += (metaCursor - cursor) * (1 - Math.exp(-dt * .8));
      dibuja();
      requestAnimationFrame(paso);
    }
    if (reduce) dibuja(); else requestAnimationFrame(paso);

    return { lienzo };
  }

  window.Aurora = Aurora;
})();
