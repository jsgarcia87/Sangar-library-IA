/* =====================================================================
   Resaltador · Moxen
   Un párrafo que aparece palabra a palabra mientras un marcador repasa
   las partes importantes: en cuanto termina de aparecer un <mark>, el
   trazo lo cruza de izquierda a derecha, tardando según lo largo que
   sea. El trazo se pinta en modo «diferencia», así que la letra que tapa
   cambia de color sola, sin duplicar el texto. Sin dependencias.

     const r = Resaltador(document.querySelector('[data-resaltador]'), { ritmo: 70 });
     r.reproduce();       // vuelve a empezar

   Empieza solo cuando el párrafo entra en pantalla.
   ===================================================================== */
(function () {
  'use strict';

  function Resaltador(el, opciones) {
    const o = Object.assign({ ritmo: 70, velocidad: 900, respiro: 140 }, opciones);   // velocidad: px/s del trazo
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Se trocea en palabras sin perder los <mark>: cada palabra va en su
       caja y las que estaban marcadas siguen dentro de su <mark>. */
    const palabras = [];
    const marcas = [];
    function trocea(nodo, destino, marca) {
      Array.from(nodo.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) { destino.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span');
            s.className = 'rs-palabra'; s.textContent = t;
            destino.appendChild(s);
            palabras.push({ el: s, marca });
          });
        } else if (n.nodeName === 'MARK') {
          const m = document.createElement('mark');
          m.className = 'rs-marca';
          destino.appendChild(m);
          const datos = { el: m, ultima: null };
          marcas.push(datos);
          trocea(n, m, datos);
        } else destino.appendChild(n.cloneNode(true));
      });
    }
    const copia = el.cloneNode(true);
    el.textContent = '';
    trocea(copia, el, null);
    palabras.forEach(p => { if (p.marca) p.marca.ultima = p; });

    let relojes = [];
    function reproduce() {
      relojes.forEach(clearTimeout); relojes = [];
      el.classList.add('is-reinicio');
      palabras.forEach(p => p.el.classList.remove('is-vista'));
      marcas.forEach(m => m.el.classList.remove('is-pintada'));
      if (reduce) {
        el.classList.remove('is-reinicio');
        palabras.forEach(p => p.el.classList.add('is-vista'));
        marcas.forEach(m => m.el.classList.add('is-pintada'));
        return;
      }
      // se fija el estado inicial sin transiciones y se vuelven a encender
      void el.offsetWidth;
      el.classList.remove('is-reinicio');
      palabras.forEach((p, i) => {
        relojes.push(setTimeout(() => p.el.classList.add('is-vista'), i * o.ritmo));
        /* La última palabra de un <mark> da la salida al trazo, un respiro
           después: primero se lee, luego se subraya. Cuanto más largo, más
           tarda, a velocidad constante, como una mano. */
        if (p.marca && p.marca.ultima === p) {
          const m = p.marca.el;
          relojes.push(setTimeout(() => {
            m.style.setProperty('--rs-dura', Math.max(.28, m.offsetWidth / o.velocidad).toFixed(2) + 's');
            m.classList.add('is-pintada');
          }, i * o.ritmo + o.respiro + 260));
        }
      });
    }

    // arranca la primera vez que se ve
    if ('IntersectionObserver' in window) {
      const vigia = new IntersectionObserver(([e]) => { if (e.isIntersecting) { vigia.disconnect(); reproduce(); } }, { threshold: .4 });
      vigia.observe(el);
    } else reproduce();

    return { reproduce };
  }

  window.Resaltador = Resaltador;
})();
