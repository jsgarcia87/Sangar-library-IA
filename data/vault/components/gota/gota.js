/* =====================================================================
   Gota · Moxen
   Un deslizador cuyo valor sale del tirador en una gota: al arrastrar, la
   gota se queda atrás por inercia, se inclina y se estira según la
   velocidad; al soltar se balancea, se asienta y vuelve a meterse en el
   tirador. Teclado con flechas incluido. Sin dependencias.

     Gota(document.querySelector('[data-gota]'), { cambia: v => … });

   La gota cuelga de un resorte poco amortiguado: por eso se pasa y
   vuelve, como algo con peso, en vez de seguir al tirador pegada.
   ===================================================================== */
(function () {
  'use strict';

  function Gota(el, opciones) {
    const o = Object.assign({ cambia: null, paso: 1, rigidez: 240, freno: 15 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const min = parseFloat(el.dataset.min || 0), max = parseFloat(el.dataset.max || 100);
    const gota = el.querySelector('.gt-gota'), num = el.querySelector('.gt-valor');
    el.setAttribute('role', 'slider');
    el.tabIndex = 0;
    el.setAttribute('aria-valuemin', min);
    el.setAttribute('aria-valuemax', max);

    let valor = parseFloat(el.dataset.valor || min);
    let xt = 0, xb = 0, vb = 0;          // tirador y gota (px), y la velocidad de la gota
    let e = 0, ve = 0, metaE = 0;        // cuánto ha salido la gota (0 dentro, 1 fuera)
    let raf = 0, antes = 0, arrastra = false, guarda = 0;

    const ancho = () => el.clientWidth;
    const aX = v => (v - min) / (max - min) * ancho();

    function fija(v) {
      v = Math.min(max, Math.max(min, Math.round(v / o.paso) * o.paso));
      if (v === valor && num.textContent !== '') return;
      valor = v;
      num.textContent = v;
      el.setAttribute('aria-valuenow', v);
      if (o.cambia) o.cambia(v);
    }
    function ponX(x) {
      xt = Math.min(ancho(), Math.max(0, x));
      el.style.setProperty('--gt-x', xt.toFixed(2) + 'px');
    }

    function dibuja() {
      const lag = xt - xb;
      // se inclina hacia atrás, como un péndulo que cuelga de la punta
      const ang = Math.max(-42, Math.min(42, -Math.atan2(lag, 70) * 180 / Math.PI));
      // y se estira a lo largo: más larga y más fina cuanto más tira
      const sy = 1 + Math.min(.45, Math.abs(lag) / 130), sx = 1 / Math.sqrt(sy);
      const k = Math.max(0, e);
      gota.style.transform = 'rotate(' + ang.toFixed(2) + 'deg) scale(' + (k * sx).toFixed(3) + ', ' + (k * sy).toFixed(3) + ')';
      num.style.transform = 'rotate(' + (-ang * .7).toFixed(2) + 'deg)';
    }

    function paso(t) {
      raf = 0;
      const dt = antes ? Math.min((t - antes) / 1000, 1 / 30) : 1 / 60;
      antes = t;
      if (dt > 0) {
        const n = Math.ceil(dt / (1 / 240)), h = dt / n;
        // al esconderse, sin rebote: si no, la gota saldría del revés
        const ce = metaE ? 16 : 2 * Math.sqrt(360);
        for (let s = 0; s < n; s++) {
          vb += (o.rigidez * (xt - xb) - o.freno * vb) * h; xb += vb * h;
          ve += (360 * (metaE - e) - ce * ve) * h; e += ve * h;
        }
      }
      if (reduce) { xb = xt; vb = 0; e = metaE; ve = 0; }
      dibuja();
      const quieto = Math.abs(xt - xb) < .05 && Math.abs(vb) < .5 && Math.abs(metaE - e) < .002 && Math.abs(ve) < .01;
      if (quieto) { xb = xt; vb = 0; e = metaE; ve = 0; dibuja(); }
      else raf = requestAnimationFrame(paso);
    }
    function anima() { if (!raf) { antes = 0; raf = requestAnimationFrame(paso); } }

    function muestra(si, despues) {
      clearTimeout(guarda);
      if (si) metaE = 1;
      else guarda = setTimeout(() => { if (!arrastra) { metaE = 0; anima(); } }, despues || 0);
      anima();
    }

    function desdePuntero(ev) {
      const r = el.getBoundingClientRect();
      ponX(ev.clientX - r.left);
      fija(min + xt / ancho() * (max - min));
      anima();
    }

    el.addEventListener('pointerdown', ev => {
      try { el.setPointerCapture(ev.pointerId); } catch (err) {}
      arrastra = true;
      el.classList.add('is-arrastra');
      desdePuntero(ev);
      muestra(true);
    });
    el.addEventListener('pointermove', ev => { if (arrastra) desdePuntero(ev); });
    const suelta = () => {
      if (!arrastra) return;
      arrastra = false;
      el.classList.remove('is-arrastra');
      ponX(aX(valor));                  // el tirador se asienta justo en su valor
      muestra(false, 700);
    };
    el.addEventListener('pointerup', suelta);
    el.addEventListener('pointercancel', suelta);
    el.addEventListener('keydown', ev => {
      const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[ev.key];
      let v = null;
      if (d) v = valor + d * o.paso * (ev.shiftKey ? 10 : 1);
      if (ev.key === 'Home') v = min;
      if (ev.key === 'End') v = max;
      if (v === null) return;
      ev.preventDefault();
      fija(v); ponX(aX(valor));
      muestra(true); muestra(false, 900);
    });
    addEventListener('resize', () => { ponX(aX(valor)); xb = xt; dibuja(); });

    num.textContent = '';
    fija(valor);
    ponX(aX(valor)); xb = xt;
    dibuja();
    return { valor: () => valor, fija: v => { fija(v); ponX(aX(valor)); anima(); } };
  }

  window.Gota = Gota;
})();
