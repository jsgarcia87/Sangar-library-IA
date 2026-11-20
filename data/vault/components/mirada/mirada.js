/* =====================================================================
   Mirada · Moxen
   Un campo de contraseña con un ojo de verdad: la pupila sigue al cursor
   —también cuando mira lo que escribes— y parpadea al mostrar u ocultar
   la contraseña. De vez en cuando parpadea solo. Sin dependencias.

     Mirada(document.querySelector('[data-mirada]'));
   ===================================================================== */
(function () {
  'use strict';

  function Mirada(campo, opciones) {
    const o = Object.assign({ x: 11, y: 6, cerca: 240, cada: 3400 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const entrada = campo.querySelector('input');
    const ojo = campo.querySelector('.mr-ojo');
    const svg = ojo.querySelector('svg');
    const iris = svg.querySelector('.mr-iris');
    const parpado = svg.querySelector('.mr-parpado');

    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, antes = 0;

    /* La pupila no se mueve en círculo sino dentro de una elipse más ancha
       que alta, como un ojo. Lejos del cursor se va al borde; cerca, se
       queda casi al centro, porque mira «hacia ti». */
    function mira(px, py) {
      const r = svg.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / o.cerca);
      tx = dx / d * o.x * k; ty = dy / d * o.y * k;
      if (!raf) { antes = 0; raf = requestAnimationFrame(sigue); }
    }
    function sigue(t) {
      raf = 0;
      const dt = antes ? Math.min((t - antes) / 1000, .05) : 1 / 60;
      antes = t;
      const f = reduce ? 1 : 1 - Math.exp(-16 * dt);
      x += (tx - x) * f; y += (ty - y) * f;
      iris.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ')');
      if (Math.abs(tx - x) > .02 || Math.abs(ty - y) > .02) raf = requestAnimationFrame(sigue);
    }

    // el parpadeo: el ojo entero se aplasta contra su línea media y vuelve
    function parpadea(mitad) {
      if (reduce) { if (mitad) mitad(); return; }
      parpado.animate([
        { transform: 'scaleY(1)' },
        { transform: 'scaleY(.06)', offset: .42 },
        { transform: 'scaleY(.06)', offset: .58 },
        { transform: 'scaleY(1)' },
      ], { duration: 280, easing: 'cubic-bezier(.45, 0, .55, 1)' });
      if (mitad) setTimeout(mitad, 120);
    }

    function alterna() {
      // el cambio se hace con el ojo cerrado: al abrirlo, ya ve otra cosa
      parpadea(() => {
        const ver = entrada.type === 'password';
        entrada.type = ver ? 'text' : 'password';
        ojo.setAttribute('aria-pressed', ver ? 'true' : 'false');
        ojo.setAttribute('aria-label', ver ? 'Ocultar contraseña' : 'Mostrar contraseña');
        entrada.classList.remove('is-cambia');
        void entrada.offsetWidth;
        entrada.classList.add('is-cambia');
      });
    }

    // y de vez en cuando, un parpadeo suelto
    let vez = 0;
    (function solo() {
      setTimeout(() => { parpadea(); solo(); }, o.cada + (vez++ % 3) * 900);
    })();

    addEventListener('pointermove', e => mira(e.clientX, e.clientY), { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(sigue); });
    ojo.addEventListener('click', alterna);
    // en el teléfono no hay cursor: mira hacia el dedo cuando toca
    addEventListener('pointerdown', e => mira(e.clientX, e.clientY), { passive: true });

    return { alterna, parpadea: () => parpadea() };
  }

  window.Mirada = Mirada;
})();
