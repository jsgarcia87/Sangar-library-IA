/* =====================================================================
   Volteo · Moxen
   Una tarjeta de dos caras que se da vuelta al hacer clic, con un
   resorte: se levanta hacia ti mientras gira, se oscurece de canto y
   al llegar se pasa un pelo y se asienta. Gira hacia el lado donde
   tocas, como si la empujaras. Enter o Espacio también. Sin dependencias.

     const v = Volteo(document.querySelector('[data-volteo]'));
     v.voltea();       v.voltea(-1);     // hacia la izquierda
   ===================================================================== */
(function () {
  'use strict';

  function Volteo(tarjeta) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frente = tarjeta.querySelector('.vo-frente'), dorso = tarjeta.querySelector('.vo-dorso');
    let giro = 0, vel = 0, meta = 0, raf = 0, previo = 0;

    function pinta() {
      const a = giro * Math.PI / 180, c = Math.cos(a);
      tarjeta.style.setProperty('--giro', giro.toFixed(2));
      // se levanta lo más a medio giro, cuando está de canto
      tarjeta.style.setProperty('--alza', (70 * Math.abs(Math.sin(a))).toFixed(2));
      tarjeta.style.setProperty('--luz-frente', ((1 - Math.max(0, c)) * .55).toFixed(3));
      tarjeta.style.setProperty('--luz-dorso', ((1 - Math.max(0, -c)) * .55).toFixed(3));
    }

    /* Un resorte poco amortiguado lleva el giro a su meta: rápido al
       principio y con un rebote corto al llegar. */
    function paso(t) {
      const dt = Math.min(.032, (t - (previo || t)) / 1000);
      previo = t;
      for (let i = 0; i < 4; i++) {
        const h = dt / 4;
        vel += (-95 * (giro - meta) - 11.5 * vel) * h;
        giro += vel * h;
      }
      pinta();
      if (Math.abs(giro - meta) < .05 && Math.abs(vel) < .5) { giro = meta; pinta(); raf = 0; previo = 0; return; }
      raf = requestAnimationFrame(paso);
    }

    function voltea(lado) {
      meta += 180 * (lado < 0 ? -1 : 1);
      const atras = Math.round(meta / 180) % 2 !== 0;
      tarjeta.setAttribute('aria-pressed', String(atras));
      // solo la cara que se ve existe para el lector de pantalla
      frente.setAttribute('aria-hidden', String(atras));
      dorso.setAttribute('aria-hidden', String(!atras));
      if (reduce) { giro = meta; pinta(); return; }
      if (!raf) raf = requestAnimationFrame(paso);
    }

    // gira hacia donde tocas: en la mitad derecha, el borde derecho se hunde
    tarjeta.addEventListener('click', e => {
      const r = tarjeta.getBoundingClientRect();
      voltea(e.detail === 0 || e.clientX > r.left + r.width / 2 ? 1 : -1);
    });
    tarjeta.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); voltea(1); }
    });

    pinta();
    return { voltea, atras: () => Math.round(meta / 180) % 2 !== 0 };
  }

  window.Volteo = Volteo;
})();
