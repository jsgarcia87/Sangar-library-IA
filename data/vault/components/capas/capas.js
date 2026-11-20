/* =====================================================================
   Capas · Moxen
   Parallax de capas tipográficas dentro de un contenedor con scroll
   propio. Cada elemento con data-capa lleva una profundidad: 1 se mueve
   con el contenido, menos de 1 va al fondo y se queda atrás, más de 1
   viene al frente y se adelanta. Sin dependencias.

     <main data-capas> … <h2 data-capa="1">…</h2> <span data-capa=".4">…</span> … </main>
     const c = Capas(document.querySelector('[data-capas]'), { suavidad: 120 });
     c.mide();     // tras cambiar el contenido

   La rueda se suaviza: fija un destino y el scroll llega a él con una
   curva. Con el dedo, el teclado o la barra, el scroll es el nativo.
   ===================================================================== */
(function () {
  'use strict';

  function Capas(caja, opciones) {
    const o = Object.assign({ suavidad: 120 }, opciones);   // ms: cuánto tarda en alcanzar la rueda
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const capas = Array.from(caja.querySelectorAll('[data-capa]')).map(el => ({
      el, k: parseFloat(el.dataset.capa) || 1, reposo: 0,
    }));

    /* Cada capa tiene un punto de reposo: el scroll en el que su tramo (el
       hijo directo del contenedor que la contiene) queda centrado en la
       vista. Ahí se ve exactamente como está maquetada; antes y después se
       adelanta o se atrasa. Se mide sin transformaciones y en coordenadas
       del contenido, no de la pantalla, para no arrastrar errores. */
    function mide() {
      capas.forEach(p => { p.el.style.transform = ''; });
      const caj = caja.getBoundingClientRect();
      const max = caja.scrollHeight - caja.clientHeight;
      capas.forEach(p => {
        let tramo = p.el;
        while (tramo.parentElement && tramo.parentElement !== caja) tramo = tramo.parentElement;
        const r = tramo.getBoundingClientRect(), cs = getComputedStyle(tramo);
        const arriba = parseFloat(cs.paddingTop), abajo = parseFloat(cs.paddingBottom);
        const centro = r.top - caj.top + caja.scrollTop + arriba + (r.height - arriba - abajo) / 2;
        p.reposo = Math.max(0, Math.min(max, centro - caja.clientHeight / 2));
      });
      pinta(caja.scrollTop, true);
    }

    /* Lo que se ha alejado del reposo, multiplicado por (1 − k): con k = .4
       la capa recorre el 40 % de lo que recorre el contenido (se queda
       atrás), con k = 1.6 el 160 % (se adelanta). */
    let ultimo = -1;
    function pinta(y, forzar) {
      if (!forzar && Math.abs(y - ultimo) < .05) return;
      ultimo = y;
      capas.forEach(p => {
        if (p.k === 1) return;
        p.el.style.transform = 'translate3d(0,' + ((y - p.reposo) * (1 - p.k)).toFixed(2) + 'px,0)';
      });
    }

    // ── la rueda, suavizada ──────────────────────────────────────────
    let destino = caja.scrollTop, actual = destino, escrito = destino, antes = 0;
    caja.addEventListener('wheel', e => {
      if (e.ctrlKey || reduce) return;          // el zoom y el movimiento reducido, nativos
      e.preventDefault();
      const u = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? caja.clientHeight : 1;
      const max = caja.scrollHeight - caja.clientHeight;
      destino = Math.max(0, Math.min(max, destino + e.deltaY * u));
    }, { passive: false });

    function paso(t) {
      const dt = Math.min(64, t - (antes || t)); antes = t;
      // si el scroll cambió por otra vía (dedo, teclado, barra), se adopta
      if (Math.abs(caja.scrollTop - escrito) > 1.5) destino = actual = caja.scrollTop;
      // exponencial con el tiempo real del cuadro: igual a 60 Hz que a 120 Hz
      actual += (destino - actual) * (1 - Math.exp(-dt / o.suavidad));
      if (Math.abs(destino - actual) < .2) actual = destino;
      caja.scrollTop = actual;
      escrito = caja.scrollTop;
      if (!reduce) pinta(escrito);
      requestAnimationFrame(paso);
    }

    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      mide();
      requestAnimationFrame(paso);
    });
    addEventListener('resize', mide, { passive: true });

    return { mide, ir: y => { destino = y; } };
  }

  window.Capas = Capas;
})();
