/* =====================================================================
   Negativo · Moxen
   Un círculo que invierte los colores de lo que pisa. Sobre los enlaces
   crece con un rebote y se deja atraer un poco hacia su centro; al
   moverse rápido se estira en la dirección del movimiento.
   Sin dependencias.

     Negativo({ tam: 36, grande: 140 });

   En pantallas táctiles no hace nada: no hay cursor que reemplazar.
   ===================================================================== */
(function () {
  'use strict';

  function Negativo(opciones) {
    const o = Object.assign({
      tam: 36, grande: 140,        // diámetros en reposo y sobre un enlace
      enlaces: 'a, button, [role="button"], [data-negativo]',
      iman: .22, seguir: 16,
    }, opciones);
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return null;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const el = document.createElement('div');
    el.className = 'ng-cursor';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    document.documentElement.classList.add('ng-activo');
    const base = el.offsetWidth;    // el tamaño real; se escala desde ahí

    let px = 0, py = 0, mx = 0, my = 0, x = 0, y = 0, vx = 0, vy = 0, previo = 0;
    // el diámetro es un resorte: crece pasándose un poco y se asienta
    let d = o.tam, dv = 0, dMeta = o.tam;

    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX; py = e.clientY;
      const enlace = e.target.closest && e.target.closest(o.enlaces);
      if (enlace) {
        const r = enlace.getBoundingClientRect();
        mx = px + (r.left + r.width / 2 - px) * o.iman;
        my = py + (r.top + r.height / 2 - py) * o.iman;
        dMeta = o.grande;
      } else { mx = px; my = py; dMeta = o.tam; }
      if (!el.hasAttribute('data-visible')) { x = mx; y = my; el.setAttribute('data-visible', ''); }
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => el.removeAttribute('data-visible'));

    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      const k = reduce ? 1 : 1 - Math.exp(-dt * o.seguir);
      const nx = x + (mx - x) * k, ny = y + (my - y) * k;
      if (dt) { vx = (nx - x) / dt; vy = (ny - y) / dt; }
      x = nx; y = ny;
      if (reduce) d = dMeta;
      else for (let h = dt, s; h > 0; h -= s) {
        s = Math.min(h, 1 / 240);
        dv += (240 * (dMeta - d) - 19 * dv) * s;
        d += dv * s;
      }
      /* Estirado según la velocidad, y menos cuanto más grande: un círculo
         chico que corre se alarga; uno grande sobre un enlace, apenas. */
      const rapidez = Math.hypot(vx, vy);
      const estira = reduce ? 1 : 1 + Math.min(.35, rapidez / 4000) * (o.tam / Math.max(o.tam, d));
      const angulo = Math.atan2(vy, vx);
      const e = Math.max(1, d) / base;
      el.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) rotate(' + angulo.toFixed(3) + 'rad) scale('
        + (e * estira).toFixed(4) + ', ' + (e / estira).toFixed(4) + ')';
      requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);

    return { el };
  }

  window.Negativo = Negativo;
})();
