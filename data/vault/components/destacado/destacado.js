/* =====================================================================
   Destacado · Moxen
   Un destello recorre el borde de la tarjeta destacada, dando la vuelta
   solo. Al pasar el cursor, la luz se gira a buscarlo; al irse, vuelve
   a dar vueltas sin saltos. Sin dependencias.

     Destacado(document.querySelector('[data-destacado]'), { vuelta: 4 });

   vuelta: segundos que tarda en dar una vuelta completa.
   ===================================================================== */
(function () {
  'use strict';

  function Destacado(el, opciones) {
    const o = Object.assign({ vuelta: 4, inicio: 300 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // las dos capas de luz: el anillo nítido y su halo
    const halo = document.createElement('span');
    const luz = document.createElement('span');
    halo.className = 'de-halo'; luz.className = 'de-luz';
    halo.setAttribute('aria-hidden', 'true'); luz.setAttribute('aria-hidden', 'true');
    el.prepend(halo, luz);

    let ang = o.inicio, vel = 0, meta = null, previo = 0, raf = 0, cola = 160;
    const crucero = 360 / o.vuelta;   // grados por segundo
    el.style.setProperty('--de-angulo', ang + 'deg');
    if (reduce) return { el };

    /* El ángulo del cursor medido desde el centro, con 0° arriba y en el
       sentido del reloj: el mismo convenio que conic-gradient. */
    el.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      meta = Math.atan2(x - r.width / 2, r.height / 2 - y) * 180 / Math.PI;
      el.style.setProperty('--de-x', x + 'px');
      el.style.setProperty('--de-y', y + 'px');
      el.dataset.encima = '';
    });
    el.addEventListener('pointerleave', () => { meta = null; delete el.dataset.encima; });

    function paso(t) {
      // el tiempo real del cuadro, para que la velocidad no dependa de los fps
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      if (meta != null) {
        /* Hacia el cursor por el camino corto (nunca más de 180°), con un
           acercamiento exponencial: rápido al principio y suave al llegar. */
        const d = ((meta - ang) % 360 + 540) % 360 - 180;
        const paso = d * (1 - Math.exp(-dt * 7));
        ang += paso;
        vel = dt ? paso / dt : vel;
      } else {
        // sin cursor recupera la velocidad de crucero poco a poco
        vel += (crucero - vel) * (1 - Math.exp(-dt * 1.4));
        ang += vel * dt;
      }
      ang %= 360;
      /* Con el cursor encima la cola se acorta y la luz se concentra en
         él; sin cursor, vuelve a ser un cometa largo. */
      cola += ((meta != null ? 265 : 160) - cola) * (1 - Math.exp(-dt * 5));
      el.style.setProperty('--de-angulo', ang.toFixed(2) + 'deg');
      el.style.setProperty('--de-cola-desde', cola.toFixed(1) + 'deg');
      raf = requestAnimationFrame(paso);
    }

    // fuera de la pantalla no gasta nada
    new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf); previo = 0;
      if (e.isIntersecting) raf = requestAnimationFrame(paso);
    }).observe(el);

    return { el };
  }

  window.Destacado = Destacado;
})();
