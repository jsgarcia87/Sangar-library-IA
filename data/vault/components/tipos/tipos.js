/* =====================================================================
   Tipos · Moxen
   Letras que cambian de tipografía al pasar el cursor: cada una salta a
   una serif, una cursiva, una mono, una de sistema muy negra o una muy
   fina, y el hueco que ocupa se estira o se encoge con un resorte para
   que la línea se reacomode sola. Al rato vuelven a la de siempre. Solo
   usa letras del sistema: no hay nada que descargar. Sin dependencias.

     Tipos(document.querySelector('[data-tipos]'), {
       estilos: ['serif', 'cursiva', 'mono', 'negra', 'fina'],
       vuelve: 2200,       // ms hasta volver a la tipografía base (0: no vuelve)
     });
   ===================================================================== */
(function () {
  'use strict';

  function Tipos(el, opciones) {
    const o = Object.assign({ estilos: ['serif', 'cursiva', 'mono', 'negra', 'fina'], vuelve: 2200 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const letras = [];
    const nodos = Array.from(el.childNodes);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    el.textContent = '';
    nodos.forEach(n => {
      if (n.nodeType !== 3) { el.appendChild(n); return; }
      n.textContent.split(/(\s+)/).forEach(trozo => {
        if (!trozo) return;
        if (/^\s+$/.test(trozo)) { el.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'tp-palabra';
        w.setAttribute('aria-hidden', 'true');
        Array.from(trozo).forEach(ch => {
          const hueco = document.createElement('span');
          hueco.className = 'tp-letra';
          const g = document.createElement('i');
          g.className = 'tp-glifo'; g.textContent = ch;
          hueco.appendChild(g); w.appendChild(hueco);
          const l = { hueco, g, ch, estilo: '', anchos: {}, reloj: 0 };
          letras.push(l);
          hueco.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') cambia(l); });
          hueco.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') cambia(l); });
        });
        el.appendChild(w);
      });
    });

    /* Se mide cada letra en cada estilo dentro del propio texto (hereda
       tamaño y peso). Con esos anchos el hueco sabe a qué medida ir antes
       de que la letra cambie, y la transición de CSS hace el resto. */
    function mide() {
      const m = document.createElement('i');
      el.appendChild(m);
      letras.forEach(l => {
        ['', ...o.estilos].forEach(e => {
          m.className = 'tp-glifo tp-mide' + (e ? ' is-' + e : '');
          m.textContent = l.ch;
          l.anchos[e] = m.getBoundingClientRect().width;
        });
        l.hueco.style.width = l.anchos[l.estilo].toFixed(2) + 'px';
      });
      m.remove();
    }

    function pon(l, estilo) {
      l.estilo = estilo;
      l.g.className = 'tp-glifo' + (estilo ? ' is-' + estilo : '');
      l.hueco.style.width = (l.anchos[estilo] || 0).toFixed(2) + 'px';
      // un chasquido: la letra nueva se abre en vertical, como una tipo de imprenta al caer
      if (!reduce) l.g.animate([{ transform: 'scaleY(.25)', opacity: .3 }, { transform: 'scaleY(1.08)', opacity: 1, offset: .6 }, { transform: 'none' }],
        { duration: 260, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    }

    function cambia(l) {
      // otra distinta de la que tiene, al azar
      const otras = o.estilos.filter(e => e !== l.estilo);
      pon(l, otras[(Math.random() * otras.length) | 0]);
      clearTimeout(l.reloj);
      if (o.vuelve) l.reloj = setTimeout(() => pon(l, ''), o.vuelve + Math.random() * 400);
    }

    mide();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(mide);
    addEventListener('resize', mide, { passive: true });
    return { cambia: i => letras[i] && cambia(letras[i]), letras };
  }

  window.Tipos = Tipos;
})();
