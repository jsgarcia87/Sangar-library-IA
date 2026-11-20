/* =====================================================================
   Elástico · Moxen
   Un texto de goma: se agarra por cualquier punto y, al arrastrar, las
   letras cercanas se estiran hacia el cursor —más cuanto más cerca del
   punto agarrado— mientras las lejanas apenas se mueven. Cuesta cada vez
   más estirar (como una goma de verdad) y, al soltar, todo vuelve con
   un temblor que se va apagando. Con ratón y con el dedo. Sin
   dependencias.

     Elastico(document.querySelector('[data-elastico]'), { alcance: 170 });
   ===================================================================== */
(function () {
  'use strict';

  function Elastico(el, opciones) {
    const o = Object.assign({
      alcance: 170,       // px: hasta dónde se reparte el tirón alrededor del punto agarrado
      tope: 280,          // px: lo máximo que se deja estirar (se acerca, no llega)
      rigidez: 280,       // del resorte al soltar
      roce: 6,            // amortiguación al soltar: poca = más temblor
    }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const texto = el.textContent.trim();
    el.setAttribute('aria-label', texto);
    el.textContent = '';
    const letras = Array.from(texto).map(ch => {
      const i = document.createElement('i');
      i.className = 'el-letra'; i.textContent = ch === ' ' ? ' ' : ch;
      i.setAttribute('aria-hidden', 'true');
      el.appendChild(i);
      return { el: i, cx: 0, h: 1, ux: 0, uy: 0, vx: 0, vy: 0, peso: 0, k: o.rigidez };
    });

    function mide() {
      letras.forEach(l => { l.el.style.transform = ''; });
      letras.forEach(l => {
        const r = l.el.getBoundingClientRect();
        l.cx = r.left + r.width / 2; l.h = r.height;
      });
    }

    // la goma: lineal al principio, cada vez más dura, nunca pasa del tope
    const goma = d => Math.sign(d) * o.tope * (1 - Math.exp(-Math.abs(d) / o.tope));

    let agarre = null, raf = 0, antes = 0;

    /* Cada letra lleva su desplazamiento (ux, uy) y su velocidad. Mientras
       se arrastra, persigue su parte del tirón con un resorte firme y bien
       amortiguado (sigue al dedo sin temblar); al soltar, la meta vuelve a
       cero y el resorte pasa a ser flojo: ahí está el temblor. La rigidez
       cambia un poco de una letra a otra para que no vibren al unísono. */
    function paso(t) {
      const dt = Math.min(.033, Math.max(.001, (t - antes) / 1000)); antes = t;
      let vivo = !!agarre;
      letras.forEach(l => {
        const mx = agarre ? agarre.dx * l.peso : 0, my = agarre ? agarre.dy * l.peso : 0;
        const k = agarre ? 900 : l.k, c = agarre ? 55 : o.roce;
        l.vx += ((mx - l.ux) * k - l.vx * c) * dt;
        l.vy += ((my - l.uy) * k - l.vy * c) * dt;
        l.ux += l.vx * dt; l.uy += l.vy * dt;
        if (Math.abs(l.ux) + Math.abs(l.uy) > .05 || Math.abs(l.vx) + Math.abs(l.vy) > .5) vivo = true;
        pinta(l);
      });
      if (!vivo) letras.forEach(l => { l.ux = l.uy = l.vx = l.vy = 0; l.el.style.transform = ''; });
      raf = vivo ? requestAnimationFrame(paso) : 0;
    }

    /* El estiramiento: la letra crece en la dirección del tirón lo mismo
       que se desplaza (escala desde el lado contrario, que se queda
       quieto) y adelgaza un poco, como la goma al estirarse. El tirón lateral la
       inclina hacia donde va. */
    function pinta(l) {
      const sy = 1 + Math.abs(l.uy) / l.h;
      const sx = 1 / Math.pow(sy, .3);      // adelgaza algo menos que la raíz: sin huecos entre letras
      const inclina = Math.atan(l.ux / (l.h * 1.4)) * 180 / Math.PI;
      l.el.style.transform = 'translate(' + (l.ux * .7).toFixed(2) + 'px,' + (l.uy / 2).toFixed(2) + 'px) skewX(' + (-inclina).toFixed(2) + 'deg) scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')';
    }

    el.addEventListener('pointerdown', e => {
      if (reduce || e.button) return;
      mide();
      const sigma = o.alcance;
      letras.forEach(l => {
        const d = (l.cx - e.clientX) / sigma;
        l.peso = Math.exp(-d * d);
        l.k = o.rigidez * (.85 + Math.random() * .3);
      });
      agarre = { x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 };
      el.classList.add('is-agarrado');
      el.setPointerCapture(e.pointerId);
      if (!raf) { antes = performance.now(); raf = requestAnimationFrame(paso); }
    });
    el.addEventListener('pointermove', e => {
      if (!agarre) return;
      agarre.dx = goma(e.clientX - agarre.x0) * .8;
      agarre.dy = goma(e.clientY - agarre.y0);
    });
    const suelta = () => { if (!agarre) return; agarre = null; el.classList.remove('is-agarrado'); };
    el.addEventListener('pointerup', suelta);
    el.addEventListener('pointercancel', suelta);

    return { letras };
  }

  window.Elastico = Elastico;
})();
