/* =====================================================================
   Linterna · Moxen
   Una composición a oscuras que se revela con un círculo de luz que
   sigue al cursor (o al dedo). Bajo la luz no solo se enciende el
   texto: aparecen sus planos —líneas de base, altura de las letras,
   márgenes y medidas—, medidos sobre el texto de verdad. Sin cursor,
   la luz pasea sola. Sin dependencias.

     Linterna(document.querySelector('[data-linterna]'), { radio: 230 });
   ===================================================================== */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  function Linterna(escena, opciones) {
    const o = Object.assign({ radio: 230 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    escena.style.setProperty('--ln-radio', o.radio + 'px');

    // la capa iluminada: una copia de la composición y, encima, los planos
    const luz = document.createElement('div');
    luz.className = 'ln-luz';
    luz.setAttribute('aria-hidden', 'true');
    luz.appendChild(escena.querySelector('.ln-composicion').cloneNode(true));
    const planos = document.createElementNS(NS, 'svg');
    planos.setAttribute('class', 'ln-planos');
    luz.appendChild(planos);
    escena.appendChild(luz);

    const dibuja = (tag, attrs, texto) => {
      const n = document.createElementNS(NS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      if (texto) n.textContent = texto;
      planos.appendChild(n);
    };

    /* Los planos se miden sobre el texto real: un marcador de alto cero
       en la línea de base de cada renglón da su altura exacta. */
    function mide() {
      planos.textContent = '';
      const e = escena.getBoundingClientRect(), W = e.width, H = e.height;
      const lineas = Array.from(luz.querySelectorAll('.ln-linea'));
      if (!lineas.length) return;
      const em = parseFloat(getComputedStyle(lineas[0]).fontSize);
      let izq = Infinity, der = 0;
      // la retícula de doce columnas, muy tenue
      for (let c = 1; c < 12; c++) dibuja('line', { x1: W * c / 12, x2: W * c / 12, y1: 0, y2: H, class: 'ln-punteada', opacity: .35 });
      lineas.forEach((l, i) => {
        const m = document.createElement('i');
        m.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        l.appendChild(m);
        const base = m.getBoundingClientRect().top - e.top;
        m.remove();
        const r = l.getBoundingClientRect();
        const ancho = Array.from(l.childNodes).reduce((a, n) => { const g = document.createRange(); g.selectNodeContents(n); return Math.max(a, g.getBoundingClientRect().right); }, 0) - e.left;
        izq = Math.min(izq, r.left - e.left); der = Math.max(der, ancho);
        // base, altura de la x y de las mayúsculas (General Sans: ~.5 y ~.7 em)
        dibuja('line', { x1: 0, x2: W, y1: base, y2: base });
        dibuja('line', { x1: 0, x2: W, y1: base - em * .5, y2: base - em * .5, class: 'ln-punteada' });
        dibuja('line', { x1: 0, x2: W, y1: base - em * .7, y2: base - em * .7, class: 'ln-punteada' });
        dibuja('text', { x: 24, y: base - 6 }, 'base ' + (i + 1));
        dibuja('text', { x: ancho + 14, y: base - em * .5 - 6 }, 'x ' + Math.round(em * .5) + ' px');
        // el ancho de cada renglón, con su medida
        dibuja('line', { x1: r.left - e.left, x2: ancho, y1: base + 18, y2: base + 18 });
        dibuja('text', { x: ancho - 64, y: base + 34 }, Math.round(ancho - (r.left - e.left)) + ' px');
      });
      // el margen izquierdo
      dibuja('line', { x1: izq, x2: izq, y1: 0, y2: H });
      dibuja('text', { x: izq + 8, y: 30 }, 'margen ' + Math.round(izq) + ' px');
      // la figura: su caja y su centro
      const f = luz.querySelector('.ln-figura');
      if (f) {
        const b = f.getBoundingClientRect();
        dibuja('rect', { x: b.left - e.left, y: b.top - e.top, width: b.width, height: b.height, class: 'ln-punteada' });
        dibuja('circle', { cx: b.left - e.left + b.width / 2, cy: b.top - e.top + b.height / 2, r: 4 });
        dibuja('text', { x: b.left - e.left, y: b.bottom - e.top + 22 }, Math.round(b.width) + ' × ' + Math.round(b.height));
        dibuja('text', { x: b.left - e.left, y: b.top - e.top - 12 }, '33°27′ S · 70°40′ O');
      }
    }

    /* La luz persigue al puntero con un resorte suave, que le da peso.
       Sin puntero, pasea sola por una curva de Lissajous. */
    const p = { x: 0, y: 0, vx: 0, vy: 0 };
    let meta = null, quieto = 0, previo = 0, reloj = 0;
    function paso(t) {
      const dt = Math.min(.032, (t - (previo || t)) / 1000);
      previo = t; reloj += dt;
      const e = escena.getBoundingClientRect();
      let mx, my;
      if (meta) { mx = meta.x; my = meta.y; }
      else {
        mx = e.width * (.5 + .34 * Math.sin(reloj * .55));
        my = e.height * (.5 + .3 * Math.sin(reloj * .9 + 1));
      }
      if (!p.x && !p.y) { p.x = mx; p.y = my; }
      for (let i = 0; i < 4; i++) {
        const h = dt / 4;
        p.vx += (-90 * (p.x - mx) - 17 * p.vx) * h; p.x += p.vx * h;
        p.vy += (-90 * (p.y - my) - 17 * p.vy) * h; p.y += p.vy * h;
      }
      escena.style.setProperty('--x', p.x.toFixed(1) + 'px');
      escena.style.setProperty('--y', p.y.toFixed(1) + 'px');
      requestAnimationFrame(paso);
    }

    escena.addEventListener('pointermove', ev => {
      const e = escena.getBoundingClientRect();
      meta = { x: ev.clientX - e.left, y: ev.clientY - e.top };
    });
    escena.addEventListener('pointerleave', () => { meta = null; });

    (document.fonts ? document.fonts.ready : Promise.resolve()).then(mide);
    addEventListener('resize', mide, { passive: true });
    mide();
    if (reduce) { escena.style.setProperty('--ln-radio', '200vmax'); return; }
    requestAnimationFrame(paso);
  }

  window.Linterna = Linterna;
})();
