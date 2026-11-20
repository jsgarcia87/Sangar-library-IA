/* =====================================================================
   Aparición · Moxen
   Bloques que aparecen escalonados al entrar en pantalla: suben, se
   enfocan y se asientan. Los que entran juntos salen uno tras otro, en
   orden de lectura. Si vuelven a quedar por debajo, se esconden para
   aparecer otra vez. Sin dependencias.

     Aparicion(document.querySelector('[data-aparicion-raiz]'), { suave: true });

   Marca con data-aparicion lo que deba aparecer, y con
   data-aparicion="linea" las líneas de un título (dentro de un
   contenedor con overflow: hidden). suave: true suaviza la rueda.
   ===================================================================== */
(function () {
  'use strict';

  function Aparicion(raiz, opciones) {
    const o = Object.assign({ escalon: 90, maximo: 6, suave: false, repite: true }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const piezas = Array.from(raiz.querySelectorAll('[data-aparicion]'));
    // la raíz del observador es el contenedor con scroll (o la ventana)
    const conScroll = raiz.scrollHeight > raiz.clientHeight || getComputedStyle(raiz).overflowY !== 'visible';

    /* Una línea de título nace escondida bajo su máscara: medida ella
       misma, nunca «se ve». Por eso se vigila a su contenedor. */
    const vigia = el => el.dataset.aparicion === 'linea' ? el.parentElement : el;
    const piezaDe = new Map(piezas.map(el => [vigia(el), el]));

    const ojo = new IntersectionObserver(entradas => {
      const entran = [];
      entradas.forEach(e => {
        const el = piezaDe.get(e.target);
        if (e.isIntersecting && !el.hasAttribute('data-visible')) entran.push({ el, r: e.boundingClientRect });
      });
      /* Las que entran a la vez se ordenan como se lee —de arriba abajo
         y de izquierda a derecha— y cada una sale un escalón después. */
      entran.sort((a, b) => (Math.abs(a.r.top - b.r.top) > 8 ? a.r.top - b.r.top : a.r.left - b.r.left));
      entran.forEach(({ el }, i) => {
        el.style.setProperty('--ap-retraso', reduce ? '0s' : (Math.min(i, o.maximo) * o.escalon / 1000) + 's');
        el.setAttribute('data-visible', '');
      });
    }, { root: conScroll ? raiz : null, rootMargin: '0px 0px -10% 0px', threshold: .12 });
    piezas.forEach(el => ojo.observe(vigia(el)));

    /* Otro vigía, sin márgenes, para saber cuándo algo salió del todo por
       abajo: entonces se esconde para volver a aparecer. Lo que salió por
       arriba (lo ya leído) se queda como está. */
    if (o.repite) {
      const fuera = new IntersectionObserver(entradas => entradas.forEach(e => {
        if (e.isIntersecting || !e.rootBounds || e.boundingClientRect.top < e.rootBounds.bottom) return;
        const el = piezaDe.get(e.target);
        el.removeAttribute('data-visible');
        el.style.setProperty('--ap-retraso', '0s');
      }), { root: conScroll ? raiz : null, threshold: 0 });
      piezas.forEach(el => fuera.observe(vigia(el)));
    }

    // ── rueda suave (opcional), para contenedores con scroll propio ──
    let destino = 0, actual = 0, rueda = 0, previo = 0;
    function desliza(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      actual += (destino - actual) * (1 - Math.exp(-dt * 6.5));
      if (Math.abs(destino - actual) < .5) actual = destino;
      raiz.scrollTop = actual;
      if (actual !== destino) rueda = requestAnimationFrame(desliza);
      else { rueda = 0; previo = 0; }
    }
    function irA(y) {
      destino = Math.max(0, Math.min(raiz.scrollHeight - raiz.clientHeight, y));
      if (reduce) { raiz.scrollTop = actual = destino; return; }
      if (!rueda) { actual = raiz.scrollTop; rueda = requestAnimationFrame(desliza); }
    }
    if (o.suave && conScroll) {
      raiz.addEventListener('wheel', e => {
        if (e.ctrlKey) return;
        e.preventDefault();
        const k = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? raiz.clientHeight : 1;
        irA((rueda ? destino : raiz.scrollTop) + e.deltaY * k);
      }, { passive: false });
    }

    return { irA };
  }

  window.Aparicion = Aparicion;
})();
