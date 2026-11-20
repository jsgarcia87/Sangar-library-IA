/* =====================================================================
   Carpetas · Moxen
   Pestañas con forma de carpeta, una detrás de otra como en un cajón. Al
   elegir una, sube por detrás de la de delante, pasa al frente en lo más
   alto y cae en su sitio. Sin dependencias.

     Carpetas(document.querySelector('[data-carpetas]'));

   El salto al frente va dentro de la propia animación (z-index cambia en
   el punto más alto): así nunca se ve atravesar a la otra carpeta.
   ===================================================================== */
(function () {
  'use strict';

  function Carpetas(pila, opciones) {
    const o = Object.assign({ sube: 110, gira: -1.4, dura: 820, hueco: 16 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const carpetas = Array.from(pila.querySelectorAll('[data-carpeta]'));
    const n = carpetas.length;
    let frente = carpetas[0], animando = [], cambio = 0;

    // las pestañas en fila, cada una un poco más a la derecha
    function coloca() {
      const ancho = parseFloat(getComputedStyle(pila).getPropertyValue('--cp-pestana')) || 160;
      carpetas.forEach((c, i) => c.style.setProperty('--x', (i * (ancho + o.hueco)) + 'px'));
    }

    /* Detrás del frente, las demás guardan su orden de siempre, como en un
       cajón: la que sale vuelve a su hueco. */
    function ordena() {
      const resto = carpetas.filter(c => c !== frente);
      [frente].concat(resto).forEach((c, i) => {
        c.style.zIndex = n - i;
        c.dataset.fondo = i;
        const tab = c.querySelector('.cp-pestana');
        tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        c.querySelector('.cp-cuerpo').hidden = false;
        c.querySelector('.cp-cuerpo').inert = i !== 0;
      });
    }

    function elige(c) {
      if (c === frente) return;
      animando.forEach(a => a.finish());
      clearTimeout(cambio);
      ordena();
      const antes = frente, z0 = +c.style.zIndex;
      frente = c;
      if (reduce) { ordena(); return; }
      const arriba = 'translateY(' + (-o.sube) + 'px) rotate(' + o.gira + 'deg)';
      animando = [
        c.animate([
          { transform: 'none', zIndex: z0, easing: 'cubic-bezier(.22, 1, .36, 1)' },
          { transform: arriba, zIndex: z0, offset: .44 },
          { transform: arriba, zIndex: n + 1, offset: .445, easing: 'cubic-bezier(.5, 0, .3, 1.35)' },
          { transform: 'none', zIndex: n + 1 },
        ], { duration: o.dura }),
        // la que estaba delante se hunde un poco al recibir el golpe
        antes.animate([
          { transform: 'none' },
          { transform: 'none', offset: .55 },
          { transform: 'translateY(7px) scale(.995)', offset: .7 },
          { transform: 'none' },
        ], { duration: o.dura, easing: 'cubic-bezier(.22, 1, .36, 1)' }),
      ];
      /* El orden nuevo se aplica en lo más alto del salto: mientras dura la
         animación manda su z-index, y al acabar queda el mismo. El tono
         cambia ahí también, así la carpeta cae ya iluminada. */
      clearTimeout(cambio);
      cambio = setTimeout(ordena, o.dura * .44);
    }

    carpetas.forEach(c => c.querySelector('.cp-pestana').addEventListener('click', () => elige(c)));
    pila.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const i = (carpetas.indexOf(frente) + d + n) % n;
      carpetas[i].querySelector('.cp-pestana').focus();
      elige(carpetas[i]);
    });
    addEventListener('resize', coloca);

    coloca();
    ordena();
    return { elige: i => elige(carpetas[i]) };
  }

  window.Carpetas = Carpetas;
})();
