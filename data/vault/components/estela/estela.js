/* =====================================================================
   Estela · Moxen
   Una estela de puntos que sigue al cursor como una cuerda: cada punto
   persigue al anterior con un resorte, así que la cola se curva en los
   giros, se estira con la velocidad y se recoge cuando paras.
   Sin dependencias.

     Estela({ puntos: 24, tam: 16 });

   En pantallas táctiles no hace nada: no hay cursor que seguir.
   ===================================================================== */
(function () {
  'use strict';

  function Estela(opciones) {
    const o = Object.assign({
      puntos: 34,       // cuántos puntos tiene la cola
      tam: 16,          // diámetro de la cabeza, en px
      rigidez: 2400,    // cuánto tira cada punto del siguiente
      freno: 62,        // menos freno = más vaivén
    }, opciones);
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return null;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

    const capa = document.createElement('div');
    capa.className = 'et-capa';
    capa.setAttribute('aria-hidden', 'true');
    capa.style.setProperty('--et-tam', o.tam + 'px');
    document.documentElement.classList.add('et-activo');

    const puntos = Array.from({ length: o.puntos }, (_, i) => {
      const el = document.createElement('i');
      el.className = 'et-punto';
      const f = 1 - i / o.puntos;
      // la cola adelgaza y se apaga hacia el final
      el.style.opacity = (.25 + .75 * f).toFixed(3);
      return { el, x: -100, y: -100, vx: 0, vy: 0, escala: .15 + .85 * Math.pow(f, 1.4) };
    });
    // la cabeza va la última en el DOM: así se pinta encima de su cola
    puntos.slice().reverse().forEach(p => capa.appendChild(p.el));
    document.body.appendChild(capa);

    let px = -100, py = -100, previo = 0;

    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX; py = e.clientY;
      if (!capa.hasAttribute('data-visible')) {
        // la primera vez todos nacen en el puntero, sin cruzar la pantalla
        puntos.forEach(p => { p.x = px; p.y = py; p.vx = p.vy = 0; });
        capa.setAttribute('data-visible', '');
      }
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => capa.removeAttribute('data-visible'));

    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      /* La cabeza va pegada al puntero; cada punto siguiente es un
         resorte amortiguado que persigue al anterior. En pasos de 1/240 s
         para que la cuerda no se vuelva inestable con cuadros lentos. */
      for (let h = dt, s; h > 0; h -= s) {
        s = Math.min(h, 1 / 240);
        const cabeza = puntos[0], k = 1 - Math.exp(-s * 60);
        cabeza.x += (px - cabeza.x) * k; cabeza.y += (py - cabeza.y) * k;
        for (let i = 1; i < puntos.length; i++) {
          const p = puntos[i], q = puntos[i - 1];
          p.vx += (o.rigidez * (q.x - p.x) - o.freno * p.vx) * s;
          p.vy += (o.rigidez * (q.y - p.y) - o.freno * p.vy) * s;
          p.x += p.vx * s; p.y += p.vy * s;
        }
      }
      puntos.forEach(p => {
        p.el.style.transform = 'translate(' + p.x.toFixed(1) + 'px, ' + p.y.toFixed(1) + 'px) scale(' + p.escala.toFixed(3) + ')';
      });
      requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);

    return { capa };
  }

  window.Estela = Estela;
})();
