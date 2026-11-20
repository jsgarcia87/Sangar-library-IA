/* =====================================================================
   Vidrio · Moxen
   Una tarjeta de vidrio esmerilado con una luz que sigue al cursor: un
   brillo difuso por dentro y el borde que se enciende donde está la luz.
   La tarjeta se inclina apenas hacia el cursor. Sin dependencias.

     Vidrio(document.querySelector('[data-vidrio]'), { inclina: 7 });

   inclina: grados máximos de giro (0 para dejarla plana).
   ===================================================================== */
(function () {
  'use strict';

  function Vidrio(el, opciones) {
    const o = Object.assign({ inclina: 7, suavidad: 9 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // las dos capas de luz
    ['vi-luz', 'vi-filo'].forEach(c => {
      const s = document.createElement('span');
      s.className = c; s.setAttribute('aria-hidden', 'true');
      el.appendChild(s);
    });

    /* Lo que pide el cursor (meta) y lo que se pinta (ahora) van por
       separado: cada cuadro se acerca un poco, y la luz se desliza en vez
       de saltar de un punto a otro. */
    const meta = { x: .5, y: .5, luz: 0 };
    const ahora = { x: .5, y: .5, luz: 0 };
    let raf = 0, previo = 0;

    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      const k = 1 - Math.exp(-dt * o.suavidad);
      ahora.x += (meta.x - ahora.x) * k;
      ahora.y += (meta.y - ahora.y) * k;
      ahora.luz += (meta.luz - ahora.luz) * (1 - Math.exp(-dt * 5));
      const r = el.getBoundingClientRect();
      el.style.setProperty('--vi-x', (ahora.x * r.width).toFixed(1) + 'px');
      el.style.setProperty('--vi-y', (ahora.y * r.height).toFixed(1) + 'px');
      el.style.setProperty('--vi-encendido', ahora.luz.toFixed(3));
      if (!reduce) {
        // se inclina hacia el cursor, y más cuanto más encendida está
        el.style.setProperty('--vi-rx', ((.5 - ahora.y) * 2 * o.inclina * ahora.luz).toFixed(2) + 'deg');
        el.style.setProperty('--vi-ry', ((ahora.x - .5) * 2 * o.inclina * ahora.luz).toFixed(2) + 'deg');
      }
      const quieto = Math.abs(meta.x - ahora.x) + Math.abs(meta.y - ahora.y) + Math.abs(meta.luz - ahora.luz) < .001;
      if (quieto && previo) { raf = 0; previo = 0; return; }
      raf = requestAnimationFrame(paso);
    }
    const despierta = () => { if (!raf) raf = requestAnimationFrame(paso); };

    /* Se mide sobre la caja sin girar: con la tarjeta inclinada el
       rectángulo cambia un poco, pero la diferencia no se nota y así no
       hay que deshacer la perspectiva. */
    function mueve(e) {
      const r = el.getBoundingClientRect();
      meta.x = Math.max(-.2, Math.min(1.2, (e.clientX - r.left) / r.width));
      meta.y = Math.max(-.2, Math.min(1.2, (e.clientY - r.top) / r.height));
      meta.luz = 1;
      despierta();
    }
    el.addEventListener('pointerenter', mueve);
    el.addEventListener('pointermove', mueve);
    el.addEventListener('pointerdown', mueve);
    el.addEventListener('pointerleave', () => { meta.luz = 0; despierta(); });

    return { el };
  }

  window.Vidrio = Vidrio;
})();
