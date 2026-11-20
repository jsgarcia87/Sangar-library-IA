/* =====================================================================
   Inclinación · Moxen
   Una tarjeta que se inclina en 3D hacia el cursor, con capas que
   flotan a distinta altura, una luz que la recorre y la sombra que se
   aparta del lado que sube. Al soltarla vuelve con un pequeño vaivén.
   En el teléfono se inclina arrastrando el dedo. Sin dependencias.

     Inclinacion(document.querySelector('[data-inclinacion]'), { max: 16 });

   Cada hijo con data-profundidad="40" flota 40 px sobre la tarjeta.
   ===================================================================== */
(function () {
  'use strict';

  function Inclinacion(tarjeta, opciones) {
    const o = Object.assign({ max: 16 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    tarjeta.querySelectorAll('[data-profundidad]').forEach(c => c.style.setProperty('--z', c.dataset.profundidad));

    /* Lo que se ve persigue al puntero con un resorte: duro mientras el
       cursor está encima (responde sin retraso) y más blando al salir,
       para que vuelva con un vaivén y no de golpe. */
    const meta = { x: 0, y: 0, f: 0 }, s = { x: 0, y: 0, f: 0, vx: 0, vy: 0, vf: 0 };
    let encima = false, raf = 0, previo = 0;

    function paso(t) {
      const dt = Math.min(.032, (t - (previo || t)) / 1000);
      previo = t;
      const [k, c] = encima ? [170, 22] : [90, 9];
      for (let i = 0; i < 4; i++) {
        const h = dt / 4;
        s.vx += (-k * (s.x - meta.x) - c * s.vx) * h; s.x += s.vx * h;
        s.vy += (-k * (s.y - meta.y) - c * s.vy) * h; s.y += s.vy * h;
        s.vf += (-120 * (s.f - meta.f) - 22 * s.vf) * h; s.f += s.vf * h;
      }
      const st = tarjeta.style;
      // x a la derecha gira en y; y hacia abajo gira en x (al revés: baja el borde de abajo)
      st.setProperty('--ry', (s.x * o.max).toFixed(3) + 'deg');
      st.setProperty('--rx', (-s.y * o.max).toFixed(3) + 'deg');
      st.setProperty('--ry-n', s.x.toFixed(4));
      st.setProperty('--rx-n', (-s.y).toFixed(4));
      st.setProperty('--gx', (50 + s.x * 50).toFixed(2) + '%');
      st.setProperty('--gy', (50 + s.y * 50).toFixed(2) + '%');
      st.setProperty('--fuerza', Math.max(0, Math.min(1, s.f)).toFixed(3));
      const quieta = Math.abs(s.x - meta.x) + Math.abs(s.y - meta.y) + Math.abs(s.f - meta.f) < .001
        && Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.vf) < .01;
      if (quieta && !encima) { raf = 0; previo = 0; return; }
      raf = requestAnimationFrame(paso);
    }
    const arranca = () => { if (!raf) raf = requestAnimationFrame(paso); };

    function apunta(e) {
      if (reduce) return;
      const r = tarjeta.getBoundingClientRect();
      // -1…1 desde el centro; medido sobre la caja sin inclinar sería lo ideal,
      // pero con 14° la diferencia no se nota y así sigue al dedo de verdad
      meta.x = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1));
      meta.y = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
      meta.f = .55 + .45 * Math.min(1, Math.hypot(meta.x, meta.y));
      arranca();
    }
    function suelta() { encima = false; meta.x = meta.y = meta.f = 0; arranca(); }

    tarjeta.addEventListener('pointerenter', e => { encima = true; apunta(e); });
    tarjeta.addEventListener('pointermove', apunta);
    tarjeta.addEventListener('pointerleave', suelta);
    tarjeta.addEventListener('pointercancel', suelta);
    // con el dedo, pointerleave llega al levantarlo
    tarjeta.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { encima = true; apunta(e); } });
    tarjeta.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') suelta(); });

    return { suelta };
  }

  window.Inclinacion = Inclinacion;
})();
