/* =====================================================================
   Aumento · Moxen
   Una lupa que sigue al cursor y amplía lo que hay debajo. Dentro de la
   lupa va una copia del contenido, escalada y desplazada para que el
   punto bajo el cursor quede justo en el centro: es HTML de verdad, así
   que la letra ampliada sale nítida. Con el dedo, se arrastra.

     Aumento(document.querySelector('[data-aumento]'), { zoom: 2.6, tam: 230 });

   zoom: cuántas veces amplía · tam: diámetro de la lupa en px.
   ===================================================================== */
(function () {
  'use strict';

  function Aumento(zona, opciones) {
    const o = Object.assign({ zoom: 2.5, tam: 220, suavidad: 16 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const R = o.tam / 2;

    /* La copia se hace antes de meter la lupa (si no, la lupa saldría
       dentro de sí misma). Sin ids repetidos y oculta a los lectores de
       pantalla: el texto ya está en el original. */
    const copia = zona.cloneNode(true);
    copia.removeAttribute('data-aumento');
    copia.classList.add('au-copia');
    copia.setAttribute('aria-hidden', 'true');
    copia.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));

    const lente = document.createElement('div');
    lente.className = 'au-lente';
    lente.setAttribute('aria-hidden', 'true');
    const vidrio = document.createElement('div');
    vidrio.className = 'au-vidrio';
    vidrio.appendChild(copia);
    lente.appendChild(vidrio);
    zona.appendChild(lente);
    zona.style.setProperty('--au-tam', o.tam + 'px');

    // la copia mide lo mismo que el original, para que todo caiga igual
    const ajusta = () => { copia.style.width = zona.offsetWidth + 'px'; copia.style.height = zona.offsetHeight + 'px'; };
    ajusta();
    addEventListener('resize', ajusta);

    let mx = 0, my = 0, x = 0, y = 0, previo = 0, raf = 0;

    function pinta() {
      lente.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)';
      copia.style.transform = 'translate(' + (R - x * o.zoom).toFixed(1) + 'px, ' + (R - y * o.zoom).toFixed(1) + 'px) scale(' + o.zoom + ')';
    }
    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      /* La lupa va un pelo por detrás del cursor, como un objeto con peso.
         Lo que amplía es su propio centro, no el cursor: así lo que se ve
         dentro siempre coincide con lo que tiene debajo. */
      const k = reduce ? 1 : 1 - Math.exp(-dt * o.suavidad);
      x += (mx - x) * k; y += (my - y) * k;
      pinta();
      if (Math.abs(mx - x) + Math.abs(my - y) < .05) { raf = 0; previo = 0; return; }
      raf = requestAnimationFrame(paso);
    }

    function mueve(e) {
      const r = zona.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      if (!zona.hasAttribute('data-lupa')) {
        // aparece donde está el cursor, sin venir de lejos
        x = mx; y = my; pinta();
        zona.setAttribute('data-lupa', '');
      }
      if (!raf) raf = requestAnimationFrame(paso);
    }
    zona.addEventListener('pointerenter', mueve);
    zona.addEventListener('pointermove', mueve);
    zona.addEventListener('pointerdown', mueve);
    zona.addEventListener('pointerleave', () => zona.removeAttribute('data-lupa'));
    zona.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') zona.removeAttribute('data-lupa'); });

    return { lente };
  }

  window.Aumento = Aumento;
})();
