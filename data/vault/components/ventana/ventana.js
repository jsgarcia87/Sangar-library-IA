/* =====================================================================
   Ventana · Moxen
   Una letra que se abre como ventana: al pasar el cursor se rellena de
   imágenes que se relevan de prisa, recortadas por el propio glifo. Al
   salir vuelve a ser una letra lisa. En pantallas táctiles, donde no hay
   cursor, las imágenes corren solas.

     <h1><span data-ventana>V</span>ista</h1>
     Ventana(document.querySelectorAll('[data-ventana]'), { rellenos: [...] });

   `rellenos` acepta URLs de imágenes o fondos CSS (degradados). Sin nada,
   usa los ocho degradados de la hoja de estilos (--vt-1 … --vt-8).
   ===================================================================== */
(function () {
  'use strict';

  const fondo = r => /^(https?:|\/|\.|data:)/.test(r) ? 'url("' + r + '")' : r;

  function Ventana(elementos, opciones) {
    const o = Object.assign({
      rellenos: Array.from({ length: 8 }, (_, i) => 'var(--vt-' + (i + 1) + ')'),
      cada: 230,           // ms entre imagen e imagen
      solas: !matchMedia('(hover: hover) and (pointer: fine)').matches,
    }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // las imágenes se piden antes del primer paso del cursor
    o.rellenos.filter(r => /^(https?:|\/|\.)/.test(r)).forEach(r => { new Image().src = r; });

    return Array.from(elementos.length != null ? elementos : [elementos]).map(el => {
      /* Dos capas encima de la letra: la que entra aparece mientras la que
         sale se apaga, así el cambio no parpadea. La letra de abajo reserva
         el sitio y es la que se ve en reposo. */
      const ch = el.textContent;
      el.classList.add('vt-letra');
      el.innerHTML = '<span class="vt-base">' + ch + '</span>'
                   + '<span class="vt-capa" aria-hidden="true">' + ch + '</span>'
                   + '<span class="vt-capa" aria-hidden="true">' + ch + '</span>';
      const capas = el.querySelectorAll('.vt-capa');
      let viva = capas[0], j = -1, ciclo = 0;

      const cambia = () => {
        j = (j + 1) % o.rellenos.length;
        const entra = viva === capas[0] ? capas[1] : capas[0];
        entra.style.backgroundImage = fondo(o.rellenos[j]);
        entra.classList.add('is-on');
        viva.classList.remove('is-on');
        viva = entra;
        el.classList.add('is-abierta');
      };
      const abre = () => { if (ciclo || reduce) return; j = (Math.random() * o.rellenos.length) | 0; cambia(); ciclo = setInterval(cambia, o.cada); };
      const cierra = () => {
        clearInterval(ciclo); ciclo = 0;
        capas.forEach(c => c.classList.remove('is-on'));
        el.classList.remove('is-abierta');
      };

      if (o.solas) {
        // sin cursor: corren solas mientras la letra se ve
        new IntersectionObserver(([e]) => e.isIntersecting ? abre() : cierra()).observe(el);
      } else {
        el.addEventListener('pointerenter', abre);
        el.addEventListener('pointerleave', cierra);
      }
      return { abre, cierra };
    });
  }

  window.Ventana = Ventana;
})();
