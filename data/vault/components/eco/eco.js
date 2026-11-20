/* =====================================================================
   Eco · Moxen
   Copias huecas del texto que siguen al cursor con retraso, como un
   eco: cada una se coloca un poco más lejos, hacia donde está el
   cursor, y tarda un poco más en llegar. Quieto, forman un túnel que
   apunta al cursor; en movimiento, la cola se curva y se queda atrás.
   Al salir, vuelven a esconderse detrás del texto. Sin dependencias.

     Eco(document.querySelector('[data-eco]'), { copias: 9, zona: document.body });
   ===================================================================== */
(function () {
  'use strict';

  function Eco(el, opciones) {
    const o = Object.assign({ copias: 8, alcance: 1.15, tope: 320, zona: el.parentElement }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const texto = el.textContent.trim();

    el.textContent = '';
    const caja = document.createElement('span');
    caja.className = 'ec-eco-caja';
    const base = document.createElement('span');
    base.className = 'ec-base'; base.textContent = texto;
    caja.appendChild(base);
    el.appendChild(caja);

    /* La copia 1 es la más cercana: la más visible, la más rápida y la que
       menos se aleja. La última, casi transparente, va a la cola. */
    const copias = reduce ? [] : Array.from({ length: o.copias }, (_, i) => {
      const k = (i + 1) / o.copias;
      const c = document.createElement('span');
      c.className = 'ec-copia'; c.textContent = texto;
      c.setAttribute('aria-hidden', 'true');
      c.style.setProperty('--a', (.62 * (1 - k) + .08).toFixed(3));
      c.style.zIndex = o.copias - i;
      caja.insertBefore(c, base);
      return { c, k, x: 0, y: 0, tau: .05 + .07 * i };   // tau: segundos que tarda en alcanzar su meta
    });

    let mx = 0, my = 0, dentro = false, raf = 0, antes = 0;
    function mira(e) {
      const r = caja.getBoundingClientRect();
      let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      // lejos del texto el eco no sigue creciendo: se acerca al tope sin pasarlo
      const d = Math.hypot(dx, dy) || 1, f = o.tope * (1 - Math.exp(-d / o.tope)) / d;
      mx = dx * f; my = dy * f;
      dentro = true;
      arranca();
    }

    /* Cada copia se acerca a su meta con una exponencial de su propio
       tiempo (tau): como cada una tarda más que la anterior, al mover el
       cursor la fila se dobla y se estira detrás. El texto de delante se
       aparta un pelo en sentido contrario, para dar profundidad. */
    function paso(t) {
      const dt = Math.min(.05, Math.max(.001, (t - antes) / 1000)); antes = t;
      let vivo = dentro;
      copias.forEach(p => {
        const tx = dentro ? mx * p.k * o.alcance : 0, ty = dentro ? my * p.k * o.alcance : 0;
        const f = 1 - Math.exp(-dt / p.tau);
        p.x += (tx - p.x) * f; p.y += (ty - p.y) * f;
        if (Math.abs(tx - p.x) + Math.abs(ty - p.y) > .1) vivo = true;
        p.c.style.transform = 'translate3d(' + p.x.toFixed(2) + 'px,' + p.y.toFixed(2) + 'px,0) scale(' + (1 - p.k * .06).toFixed(4) + ')';
      });
      const bx = dentro ? -mx * .03 : 0, by = dentro ? -my * .03 : 0;
      base.style.transform = 'translate3d(' + bx.toFixed(2) + 'px,' + by.toFixed(2) + 'px,0)';
      raf = vivo ? requestAnimationFrame(paso) : 0;
    }
    function arranca() { if (!raf && !reduce) { antes = performance.now(); raf = requestAnimationFrame(paso); } }

    o.zona.addEventListener('pointermove', mira);
    o.zona.addEventListener('pointerdown', mira);
    o.zona.addEventListener('pointerleave', () => { dentro = false; arranca(); });
    return { copias };
  }

  window.Eco = Eco;
})();
