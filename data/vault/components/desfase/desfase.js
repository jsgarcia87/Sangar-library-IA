/* =====================================================================
   Desfase · Moxen
   Un desplazamiento de canales sobrio, en blanco y grises: al pasar el
   cursor, el texto se separa en dos copias, una gris clara que se
   adelanta en la dirección del movimiento y otra más oscura que se queda
   atrás. Cuanto más rápido va el cursor, más se separan; con el cursor
   quieto quedan apenas despegadas, y al salir vuelven con un pequeño
   vaivén. A mucha velocidad, una franja suelta se descuelga un instante.
   Sin dependencias.

     Desfase(document.querySelectorAll('[data-desfase]'), { fuerza: 1 });
   ===================================================================== */
(function () {
  'use strict';

  const limita = (v, m) => Math.max(-m, Math.min(m, v));

  function Desfase(elementos, opciones) {
    const o = Object.assign({ fuerza: 1, maximo: 22, reposo: 3 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return [];

    return Array.from(elementos).map(el => {
      const txt = el.textContent;
      el.classList.add('df-texto');
      el.innerHTML = '';
      const capa = clase => {
        const s = document.createElement('span');
        s.className = 'df-canal ' + clase;
        s.textContent = txt;
        s.setAttribute('aria-hidden', 'true');
        el.appendChild(s);
        return s;
      };
      const a = capa('is-a'), b = capa('is-b'), corte = capa('is-corte');
      const base = document.createElement('span');
      base.className = 'df-base'; base.textContent = txt;
      el.appendChild(base);

      /* Cuatro resortes (x e y de cada copia), poco amortiguados para que
         al soltar se pasen y vuelvan. La meta sale de la velocidad del
         cursor, suavizada, y de un desfase mínimo mientras está encima. */
      const r = () => ({ x: 0, v: 0, meta: 0 });
      const ax = r(), ay = r(), bx = r(), by = r();
      let encima = false, vx = 0, vy = 0, ult = null, raf = 0, antes = 0, cambioCorte = 0;

      function paso(t) {
        const dt = Math.min(.033, Math.max(.001, (t - antes) / 1000)); antes = t;
        // la velocidad se va apagando sola si el cursor se detiene
        vx *= Math.exp(-dt / .12); vy *= Math.exp(-dt / .12);
        const k = o.fuerza * .02;
        ax.meta = encima ? limita(vx * k, o.maximo) + o.reposo : 0;
        ay.meta = encima ? limita(vy * k, o.maximo * .5) : 0;
        bx.meta = -ax.meta * .8; by.meta = -ay.meta * .8;
        let vivo = encima;
        [ax, ay, bx, by].forEach(s => {
          s.v += ((s.meta - s.x) * 260 - s.v * 15) * dt;
          s.x += s.v * dt;
          if (Math.abs(s.v) > .02 || Math.abs(s.meta - s.x) > .02) vivo = true;
        });
        a.style.transform = 'translate3d(' + ax.x.toFixed(2) + 'px,' + ay.x.toFixed(2) + 'px,0)';
        b.style.transform = 'translate3d(' + bx.x.toFixed(2) + 'px,' + by.x.toFixed(2) + 'px,0)';

        /* La franja: si el cursor va deprisa, una tira horizontal del texto
           se corre el doble que la copia clara. Cambia de altura cada poco,
           y desaparece en cuanto se frena. */
        const rapido = Math.hypot(vx, vy) > 900 * (1 / o.fuerza);
        if (rapido && t > cambioCorte) {
          const arriba = 15 + Math.random() * 55, alto = 6 + Math.random() * 14;
          corte.style.clipPath = 'inset(' + arriba + '% -10% ' + Math.max(0, 100 - arriba - alto) + '% -10%)';
          cambioCorte = t + 70 + Math.random() * 90;
        }
        corte.style.opacity = rapido ? 1 : 0;
        corte.style.transform = 'translate3d(' + (ax.x * 2.1).toFixed(2) + 'px,0,0)';
        if (!vivo) { [ax, ay, bx, by].forEach(s => { s.x = s.v = 0; }); }
        raf = vivo ? requestAnimationFrame(paso) : 0;
      }
      const arranca = () => { if (!raf) { antes = performance.now(); raf = requestAnimationFrame(paso); } };

      const zona = el.closest('a, button') || el;
      zona.addEventListener('pointerenter', e => { encima = true; ult = { x: e.clientX, y: e.clientY, t: e.timeStamp }; arranca(); });
      zona.addEventListener('pointermove', e => {
        if (ult) {
          const dtm = Math.max(1, e.timeStamp - ult.t);
          // velocidad en px/s, mezclada con la anterior para que no tiemble
          vx = vx * .6 + (e.clientX - ult.x) / dtm * 1000 * .4;
          vy = vy * .6 + (e.clientY - ult.y) / dtm * 1000 * .4;
        }
        ult = { x: e.clientX, y: e.clientY, t: e.timeStamp };
        arranca();
      });
      zona.addEventListener('pointerleave', () => { encima = false; ult = null; arranca(); });
      zona.addEventListener('focus', () => { encima = true; arranca(); });
      zona.addEventListener('blur', () => { encima = false; arranca(); });
      return { el };
    });
  }

  window.Desfase = Desfase;
})();
