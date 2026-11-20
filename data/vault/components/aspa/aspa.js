/* =====================================================================
   Aspa · Moxen
   Un cursor en forma de X. Sobre lo que se puede pulsar gira tres
   octavos de vuelta, crece y queda en cruz; al salir sigue girando en el
   mismo sentido hasta volver a ser una X. Al hacer clic da otro cuarto de
   vuelta. Todo con resortes. Sin dependencias.

     Aspa();                                   // toda la página
     Aspa({ pulsables: 'a, button, [data-aspa]' });

   En pantallas táctiles no hace nada: no hay cursor que reemplazar.
   ===================================================================== */
(function () {
  'use strict';

  /* Un resorte amortiguado: va hacia «meta» con algo de inercia y un
     rebote corto. Se integra en pasos pequeños para que sea estable. */
  function resorte(valor, rigidez, freno) {
    return {
      valor, meta: valor, vel: 0,
      paso(dt) {
        for (let h = dt, s; h > 0; h -= s) {
          s = Math.min(h, 1 / 240);
          this.vel += (rigidez * (this.meta - this.valor) - freno * this.vel) * s;
          this.valor += this.vel * s;
        }
      },
    };
  }

  function Aspa(opciones) {
    const o = Object.assign({
      pulsables: 'a, button, [role="button"], input, select, textarea, label, summary, [data-aspa]',
      chico: 30, grande: 76,      // largo de las barras, en px
      seguir: 22,                 // cuánto se pega al puntero (más = menos retraso)
    }, opciones);
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return null;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const el = document.createElement('div');
    el.className = 'as-cursor';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<i></i><i></i>';
    document.body.appendChild(el);
    document.documentElement.classList.add('as-activo');

    const giro = resorte(45, 120, 13);     // 45° = X; 180° = cruz
    const largo = resorte(o.chico, 300, 18);
    let x = -100, y = -100, px = -100, py = -100, encima = false, previo = 0;

    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX; py = e.clientY;
      if (!el.hasAttribute('data-visible')) { x = px; y = py; el.setAttribute('data-visible', ''); }
      const sobre = !!(e.target.closest && e.target.closest(o.pulsables));
      if (sobre !== encima) {
        encima = sobre;
        /* Siempre en el mismo sentido: 135° para pasar de X a cruz y 45°
           para volver. Nunca desanda el camino, solo sigue girando. */
        giro.meta += encima ? 135 : 45;
        largo.meta = encima ? o.grande : o.chico;
      }
    }, { passive: true });
    addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      giro.meta += 90;
      largo.valor *= .7;   // un golpe seco: se encoge y el resorte la devuelve
    });
    document.documentElement.addEventListener('pointerleave', () => el.removeAttribute('data-visible'));

    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      const k = 1 - Math.exp(-dt * o.seguir);
      x += (px - x) * k; y += (py - y) * k;
      if (reduce) { giro.valor = giro.meta; largo.valor = largo.meta; }
      else { giro.paso(dt); largo.paso(dt); }
      el.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) rotate(' + giro.valor.toFixed(2) + 'deg)';
      el.style.setProperty('--as-largo', Math.max(6, largo.valor).toFixed(2) + 'px');
      requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);

    return { el };
  }

  window.Aspa = Aspa;
})();
