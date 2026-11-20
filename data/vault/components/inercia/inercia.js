/* =====================================================================
   Inercia · Moxen
   Un carrusel que se arrastra con el ratón o con el dedo y, al soltarlo,
   sigue con el impulso que llevaba hasta frenar en una tarjeta. En los
   bordes se estira como una goma y vuelve. Sin dependencias.

     const c = Inercia(document.querySelector('[data-inercia]'));
     c.ir(3);                               // a la cuarta tarjeta
     c.alMover((avance, indice) => { … });  // 0–1 y la tarjeta más cercana

   Opciones: { friccion: 4, goma: .3, iman: true }.
   ===================================================================== */
(function () {
  'use strict';

  function Inercia(ventana, opciones) {
    const o = Object.assign({ friccion: 4, goma: .3, iman: true }, opciones);
    const pista = ventana.querySelector('[data-inercia-pista]');
    const items = Array.from(pista.children);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const oyentes = [];

    let x = 0, v = 0, meta = 0, min = 0, paradas = [0];
    let agarre = null, muestras = [], previo = 0, raf = 0, quieto = true, inclina = 0, xAntes = 0;

    // los topes y el punto de parada de cada tarjeta (su borde izquierdo)
    function mide() {
      min = Math.min(0, ventana.clientWidth - pista.scrollWidth);
      const margen = items[0] ? items[0].offsetLeft : 0;
      paradas = items.map(it => Math.max(min, Math.min(0, margen - it.offsetLeft)));
    }
    const limita = n => Math.max(min, Math.min(0, n));
    const cercana = n => paradas.reduce((a, p, i) => Math.abs(p - n) < Math.abs(paradas[a] - n) ? i : a, 0);

    /* Pasado el tope, la pista cede cada vez menos: la distancia extra se
       multiplica por la «goma». */
    const estira = n => n > 0 ? n * o.goma : n < min ? min + (n - min) * o.goma : n;

    function pinta(dt) {
      // una leve inclinación con la velocidad: se nota el empuje
      const vel = dt ? (x - xAntes) / dt : 0;
      xAntes = x;
      inclina += (Math.max(-4, Math.min(4, -vel / 450)) - inclina) * (1 - Math.exp(-dt * 10));
      pista.style.transform = 'translate3d(' + x.toFixed(2) + 'px, 0, 0) skewX(' + inclina.toFixed(2) + 'deg)';
      const avance = Math.max(0, Math.min(1, min ? x / min : 0));
      // las últimas tarjetas comparten tope, así que el índice sale del avance
      oyentes.forEach(f => f(avance, Math.round(avance * (items.length - 1))));
    }

    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      if (!agarre && dt) {
        /* Un resorte con amortiguación crítica hacia la parada elegida.
           Con ω = fricción es exactamente la caída exponencial de una
           inercia normal, pero termina justo en la tarjeta. Se integra en
           pasos cortos para que sea estable aunque el cuadro tarde. */
        const w = o.friccion;
        for (let h = dt, s; h > 0; h -= s) {
          s = Math.min(h, 1 / 240);
          v += (-w * w * (x - meta) - 2 * w * v) * s;
          x += v * s;
        }
      }
      pinta(dt);
      quieto = !agarre && Math.abs(x - meta) < .3 && Math.abs(v) < 2 && Math.abs(inclina) < .01;
      if (quieto) { x = meta; v = 0; pinta(0); raf = 0; previo = 0; return; }
      raf = requestAnimationFrame(paso);
    }
    const despierta = () => { if (!raf) raf = requestAnimationFrame(paso); };

    function ir(i) {
      meta = paradas[Math.max(0, Math.min(paradas.length - 1, i))];
      if (reduce) { x = meta; v = 0; pinta(0); return; }
      despierta();
    }

    // ── arrastre ──
    ventana.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      mide();
      agarre = { id: e.pointerId, px: e.clientX, x0: x, movido: false };
      muestras = [{ t: performance.now(), x: e.clientX }];
      v = 0;
      ventana.setPointerCapture(e.pointerId);
      ventana.setAttribute('data-arrastrando', '');
      despierta();
    });
    ventana.addEventListener('pointermove', e => {
      if (!agarre || e.pointerId !== agarre.id) return;
      const d = e.clientX - agarre.px;
      if (Math.abs(d) > 4) agarre.movido = true;
      x = estira(agarre.x0 + d);
      muestras.push({ t: performance.now(), x: e.clientX });
      // solo importan los últimos 100 ms: lo de antes ya no es impulso
      while (muestras.length > 2 && muestras[muestras.length - 1].t - muestras[0].t > 100) muestras.shift();
    });
    function suelta(e) {
      if (!agarre || e.pointerId !== agarre.id) return;
      const a = muestras[0], b = muestras[muestras.length - 1];
      const dt = (b.t - a.t) / 1000;
      v = dt > .005 ? (b.x - a.x) / dt : 0;
      if (x > 0 || x < min) v *= o.goma;   // desde la goma, el impulso es menor
      /* Dónde frenaría solo (x + v/ω) y, con imán, la tarjeta más cercana
         a ese punto: así el impulso decide, y el imán solo afina. */
      const libre = x + v / o.friccion;
      meta = o.iman ? paradas[cercana(limita(libre))] : limita(libre);
      if (agarre.movido) ventana.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); }, { capture: true, once: true });
      agarre = null;
      ventana.removeAttribute('data-arrastrando');
      if (reduce) { x = meta; v = 0; pinta(0); }
      despierta();
    }
    ventana.addEventListener('pointerup', suelta);
    ventana.addEventListener('pointercancel', suelta);

    // ── rueda horizontal y teclado ──
    ventana.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      x = limita(x - e.deltaX); meta = x; v = 0;
      clearTimeout(ventana.__inercia);
      ventana.__inercia = setTimeout(() => o.iman && ir(cercana(x)), 140);
      despierta();
    }, { passive: false });
    ventana.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      ir(cercana(meta) + d);
    });

    mide();
    addEventListener('resize', () => { mide(); meta = paradas[cercana(meta)]; x = meta; pinta(0); });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { mide(); pinta(0); });

    return {
      ir,
      alMover(f) { oyentes.push(f); pinta(0); },
    };
  }

  window.Inercia = Inercia;
})();
