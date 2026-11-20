/* =====================================================================
   Perilla · Moxen
   Una perilla de volumen: se gira arrastrando alrededor de ella —con el
   ratón o con el dedo—, con la rueda o con las flechas, y las marcas de
   alrededor se van encendiendo hasta el valor. Gira con un poco de
   inercia, como si pesara. Sin dependencias.

     Perilla(document.querySelector('[data-perilla]'), {
       marcas: 31, valor: 24,
       alCambiar: v => { … },            // 0 … 100
     });
   ===================================================================== */
(function () {
  'use strict';

  const DESDE = -135, RECORRIDO = 270;      // de las 7 y media a las 4 y media

  function Perilla(el, opciones) {
    const o = Object.assign({ marcas: 31, valor: +el.getAttribute('aria-valuenow') || 0, alCambiar: null }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pomo = el.querySelector('.pr-pomo');

    // las marcas, repartidas por el recorrido
    const marcas = [];
    for (let i = 0; i < o.marcas; i++) {
      const m = document.createElement('i');
      m.className = 'pr-marca';
      m.style.setProperty('--a', (DESDE + RECORRIDO * i / (o.marcas - 1)) + 'deg');
      el.insertBefore(m, el.firstChild);
      marcas.push(m);
    }

    /* El valor manda; lo que se ve lo persigue con un resorte crítico
       (sin rebote): así un tirón brusco no hace saltar la perilla. */
    let valor = o.valor, visto = o.valor, vel = 0, raf = 0, previo = 0, ultimo = -1;

    function pinta() {
      pomo.style.setProperty('--pr-giro', (DESDE + RECORRIDO * visto / 100).toFixed(2) + 'deg');
      const n = Math.round(visto / 100 * (o.marcas - 1));
      if (n === ultimo) return;
      ultimo = n;
      marcas.forEach((m, i) => { m.classList.toggle('is-on', i <= n && visto > .5); m.classList.toggle('is-punta', i === n && visto > .5); });
    }
    function paso(t) {
      const dt = Math.min(.032, (t - (previo || t)) / 1000);
      previo = t;
      const k = 260, c = 2 * Math.sqrt(k);
      for (let i = 0; i < 4; i++) { const h = dt / 4; vel += (-k * (visto - valor) - c * vel) * h; visto += vel * h; }
      pinta();
      if (Math.abs(visto - valor) < .02 && Math.abs(vel) < .05) { visto = valor; pinta(); raf = 0; previo = 0; return; }
      raf = requestAnimationFrame(paso);
    }

    function fija(v) {
      v = Math.max(0, Math.min(100, v));
      if (v === valor) return;
      valor = v;
      const entero = Math.round(valor);
      if (+el.getAttribute('aria-valuenow') !== entero) {
        el.setAttribute('aria-valuenow', entero);
        if (o.alCambiar) o.alCambiar(entero);
      }
      if (reduce) { visto = valor; pinta(); return; }
      if (!raf) raf = requestAnimationFrame(paso);
    }

    /* Arrastrar en círculo: cuenta cuánto gira el puntero alrededor del
       centro desde el último movimiento. Cerca del centro el ángulo es
       inestable, así que ahí no se cuenta. */
    let arrastre = null;
    const angulo = e => {
      const r = el.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      return { a: Math.atan2(y, x) * 180 / Math.PI, d: Math.hypot(x, y) };
    };
    el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); arrastre = angulo(e); });
    el.addEventListener('pointermove', e => {
      if (!arrastre) return;
      const p = angulo(e);
      if (p.d > 24 && arrastre.d > 24) {
        let d = p.a - arrastre.a;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        fija(valor + d / RECORRIDO * 100);
      }
      arrastre = p;
    });
    const suelta = () => { arrastre = null; };
    el.addEventListener('pointerup', suelta);
    el.addEventListener('pointercancel', suelta);
    el.addEventListener('wheel', e => { e.preventDefault(); fija(valor - e.deltaY * .04); }, { passive: false });
    el.addEventListener('keydown', e => {
      const salto = { ArrowUp: 2, ArrowRight: 2, ArrowDown: -2, ArrowLeft: -2, PageUp: 10, PageDown: -10 }[e.key];
      if (salto) { e.preventDefault(); fija(Math.round(valor) + salto); }
      if (e.key === 'Home') fija(0);
      if (e.key === 'End') fija(100);
    });

    pinta();
    return { fija, valor: () => Math.round(valor) };
  }

  window.Perilla = Perilla;
})();
