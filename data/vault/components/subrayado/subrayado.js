/* =====================================================================
   Subrayado · Moxen
   Pestañas con un subrayado elástico: al cambiar, el extremo que va
   delante sale disparado y el de atrás lo sigue con retraso, así que la
   raya se estira por el camino y se encoge al llegar, como una oruga.

     const s = Subrayado(document.querySelector('[role="tablist"]'));
     s.ve(2);      s.activa();

   Cada extremo es un resorte. El que va delante es rígido y el de atrás
   blando; cuál es cuál depende de hacia dónde se mueva.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function Subrayado(lista, opciones) {
    const o = Object.assign({ delante: 340, detras: 110, freno: 1.45 }, opciones);
    const pestanas = Array.from(lista.querySelectorAll('[role="tab"]'));
    const raya = document.createElement('span');
    raya.className = 'su-raya';
    raya.setAttribute('aria-hidden', 'true');
    lista.appendChild(raya);

    let activa = Math.max(0, pestanas.findIndex(p => p.getAttribute('aria-selected') === 'true'));
    // los dos extremos: posición, velocidad y destino de cada uno
    const izq = { x: 0, v: 0, meta: 0, k: o.delante }, der = { x: 0, v: 0, meta: 0, k: o.delante };
    let raf = 0, ultimo = null;

    function bordes(i) {
      const l = lista.getBoundingClientRect(), r = pestanas[i].getBoundingClientRect();
      return [r.left - l.left, r.right - l.left];
    }
    function pinta() {
      // ancho de verdad y no una escala: así las puntas redondas no se deforman
      raya.style.transform = 'translateX(' + izq.x.toFixed(2) + 'px)';
      raya.style.width = Math.max(4, der.x - izq.x).toFixed(2) + 'px';
    }
    function coloca() {
      [izq.x, der.x] = [izq.meta, der.meta] = bordes(activa);
      izq.v = der.v = 0; pinta();
    }

    function paso(ts) {
      if (ultimo === null) ultimo = ts;
      let dt = Math.min(.05, (ts - ultimo) / 1000);
      ultimo = ts;
      for (; dt > 0; dt -= 1 / 240) {
        const h = Math.min(dt, 1 / 240);
        [izq, der].forEach(e => {
          // algo menos que el freno crítico (2): llega con un rebote pequeño y se queda
          e.v += (-e.k * (e.x - e.meta) - o.freno * Math.sqrt(e.k) * e.v) * h;
          e.x += e.v * h;
        });
      }
      pinta();
      const quieto = [izq, der].every(e => Math.abs(e.x - e.meta) < .1 && Math.abs(e.v) < .1);
      if (quieto) { coloca(); raf = 0; ultimo = null; return; }
      raf = requestAnimationFrame(paso);
    }

    function ve(i) {
      if (i === activa) return;
      const derecha = i > activa;
      pestanas[activa].setAttribute('aria-selected', 'false');
      pestanas[activa].tabIndex = -1;
      activa = i;
      pestanas[i].setAttribute('aria-selected', 'true');
      pestanas[i].tabIndex = 0;
      [izq.meta, der.meta] = bordes(i);
      if (reduce) return coloca();
      // el extremo que va hacia el destino tira; el otro se deja arrastrar
      der.k = derecha ? o.delante : o.detras;
      izq.k = derecha ? o.detras : o.delante;
      if (!raf) raf = requestAnimationFrame(paso);
    }

    pestanas.forEach((p, i) => {
      p.tabIndex = i === activa ? 0 : -1;
      p.addEventListener('click', () => ve(i));
    });
    // las flechas mueven entre pestañas, como pide el patrón de ARIA
    lista.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const i = (activa + d + pestanas.length) % pestanas.length;
      pestanas[i].focus(); ve(i);
    });
    coloca();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { if (!raf) coloca(); });
    addEventListener('resize', () => { if (!raf) coloca(); });
    return { ve, activa: () => activa };
  }

  window.Subrayado = Subrayado;
})();
