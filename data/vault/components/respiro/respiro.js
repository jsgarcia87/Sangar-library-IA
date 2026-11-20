/* =====================================================================
   Respiro · Moxen
   Tres puntos que respiran por turnos, cada uno con su resorte: reciben
   un empujón, se hinchan, se pasan un poco al deshincharse y se
   asientan. Como es física y no una curva fija, cada respiro se ve
   blando y un poco distinto. Sin dependencias.

     Respiro(document.querySelector('[data-respiro]'), {
       ritmo: 1600,      // ms entre respiros
       desfase: 190,     // ms entre un punto y el siguiente
     });
   ===================================================================== */
(function () {
  'use strict';

  function Respiro(el, opciones) {
    const o = Object.assign({ ritmo: 1600, desfase: 190, fuerza: 6.2, rigidez: 64, roce: 5 }, opciones);
    const puntos = Array.from(el.querySelectorAll('.rs-punto'));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // cada punto: cuánto está hinchado (x) y a qué velocidad (v)
    const estado = puntos.map(() => ({ x: 0, v: 0 }));
    let reloj = 0, previo = 0, raf = 0;

    function paso(t) {
      const dt = Math.min(.032, (t - (previo || t)) / 1000);
      previo = t;
      const antes = reloj;
      reloj += dt * 1000;
      estado.forEach((s, i) => {
        /* El empujón llega cuando el reloj cruza la hora de este punto
           dentro del ciclo: el primero, luego el segundo, luego el tercero. */
        const hora = i * o.desfase;
        const ciclo = Math.floor((reloj - hora) / o.ritmo);
        if (ciclo >= 0 && ciclo !== Math.floor((antes - hora) / o.ritmo)) s.v += o.fuerza;
        // un resorte blando y poco amortiguado: se pasa al volver, y respira
        for (let k = 0; k < 4; k++) {
          const h = dt / 4;
          s.v += (-o.rigidez * s.x - o.roce * s.v) * h;
          s.x += s.v * h;
        }
        const p = puntos[i];
        if (reduce) { p.style.opacity = (.35 + .65 * Math.min(1, Math.max(0, s.x / .55))).toFixed(3); return; }
        // al hincharse deprisa se estira hacia arriba; al soltar, se aplasta
        const e = Math.max(-.12, Math.min(.12, s.v * .016));
        const esc = 1 + s.x;
        p.style.transform = 'translateY(' + (-s.x * 30).toFixed(2) + 'px) scale(' + (esc * (1 - e)).toFixed(4) + ', ' + (esc * (1 + e)).toFixed(4) + ')';
        p.style.opacity = (.35 + .65 * Math.min(1, Math.max(0, s.x / .5))).toFixed(3);
      });
      raf = requestAnimationFrame(paso);
    }
    raf = requestAnimationFrame(paso);

    return { para: () => cancelAnimationFrame(raf) };
  }

  window.Respiro = Respiro;
})();
