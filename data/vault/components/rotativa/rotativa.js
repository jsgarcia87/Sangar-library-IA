/* =====================================================================
   Rotativa · Moxen
   Una palabra que cambia girando como un cubo: la nueva sube desde la
   cara de abajo mientras la vieja se va por arriba, con un resorte que
   se pasa un poco y vuelve. La cara que se aparta se oscurece, y la caja
   ajusta su ancho a la palabra que entra. Cuatro caras bastan para una
   lista de cualquier largo: la de abajo se reescribe antes de cada giro.
   Sin dependencias.

     Rotativa(el, ['clínicas', 'colegios', 'viñas'], { cada: 2100 });

   Gira sola; un clic (o Enter) adelanta la siguiente.
   ===================================================================== */
(function () {
  'use strict';

  function Rotativa(el, palabras, opciones) {
    const o = Object.assign({ cada: 2200 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lista = [el.textContent.trim()].concat(palabras);
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');

    el.textContent = '';
    const medida = document.createElement('span');
    medida.className = 'rt-medida';
    medida.setAttribute('aria-hidden', 'true');
    const prisma = document.createElement('span');
    prisma.className = 'rt-prisma';
    prisma.setAttribute('aria-hidden', 'true');
    const caras = Array.from({ length: 4 }, (_, i) => {
      const c = document.createElement('span');
      c.className = 'rt-cara';
      // cara i: girada −90°·i y empujada media altura hacia fuera
      c.style.transform = 'rotateX(' + (-90 * i) + 'deg) translateZ(.55em)';
      prisma.appendChild(c);
      return c;
    });
    const texto = document.createElement('span');
    texto.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';
    el.append(medida, prisma, texto);

    let n = 0, i = 0;
    caras[0].textContent = lista[0];
    texto.textContent = lista[0];
    function ancho(palabra) {
      medida.textContent = palabra;
      el.style.width = medida.offsetWidth + 'px';
    }
    ancho(lista[0]);

    /* El ángulo persigue a su meta con un resorte algo flojo: llega, se
       pasa unos grados y vuelve. Cada cara toma luz según lo que se
       aparta de mirar al frente (coseno del ángulo relativo). */
    let ang = 0, vel = 0, meta = 0, raf = 0, antes = 0;
    function paso(t) {
      const dt = Math.min(.033, Math.max(.001, (t - antes) / 1000)); antes = t;
      vel += ((meta - ang) * 150 - vel * 14) * dt;
      ang += vel * dt;
      const quieto = Math.abs(meta - ang) < .02 && Math.abs(vel) < .02;
      if (quieto) { ang = meta; vel = 0; }
      pinta();
      raf = quieto ? 0 : requestAnimationFrame(paso);
    }
    function pinta() {
      prisma.style.transform = 'translateZ(-.55em) rotateX(' + ang.toFixed(3) + 'deg)';
      caras.forEach((c, k) => {
        const rel = (k * 90 - ang) * Math.PI / 180;
        c.style.setProperty('--luz', Math.max(0, Math.cos(rel)).toFixed(3));
      });
    }

    let reloj = 0;
    function gira() {
      clearTimeout(reloj);
      n += 1; i = (i + 1) % lista.length;
      // la cara de abajo (la que va a subir) se escribe justo antes del giro
      caras[n % 4].textContent = lista[i];
      texto.textContent = lista[i];
      ancho(lista[i]);
      meta = n * 90;
      if (reduce) { ang = meta; pinta(); }
      else if (!raf) { antes = performance.now(); raf = requestAnimationFrame(paso); }
      reloj = setTimeout(gira, o.cada);
    }

    pinta();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => ancho(lista[i]));
    el.addEventListener('click', gira);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); gira(); } });
    reloj = setTimeout(gira, o.cada);
    return { gira, para: () => clearTimeout(reloj) };
  }

  window.Rotativa = Rotativa;
})();
