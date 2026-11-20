/* =====================================================================
   Imán · Moxen
   Un botón magnético: cuando el cursor entra en su campo, el botón se
   acerca a él —y su contenido un poco más, para dar profundidad—; al
   salir, un resorte lo devuelve a su sitio con un pequeño vaivén.

     Iman(document.querySelector('.ia-boton'), { fuerza: .3, margen: 72 });

   El campo es el contorno del botón agrandado «margen» píxeles: así un
   botón ancho y uno redondo atraen igual de cerca de su borde.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;

  function Iman(boton, opciones) {
    const o = Object.assign({
      fuerza: .3,       // qué fracción del camino hacia el cursor recorre
      margen: 72,       // px alrededor del botón donde ya atrae
      fondo: .3,        // lo que se adelanta el contenido respecto al botón
      rigidez: 190,
      freno: 15,
    }, opciones);

    const sitio = document.createElement('span');
    sitio.className = 'ia-sitio';
    boton.replaceWith(sitio);
    sitio.appendChild(boton);
    const campo = document.createElement('span');
    campo.className = 'ia-campo';
    campo.setAttribute('aria-hidden', 'true');
    sitio.appendChild(campo);
    const radio = parseFloat(getComputedStyle(boton).borderTopLeftRadius) || 0;
    sitio.style.setProperty('--ia-margen', o.margen + 'px');
    sitio.style.setProperty('--ia-radio-campo', (radio + o.margen) + 'px');
    if (reduce || !fino) return null;      // sin cursor fino no hay a quién atraer

    let x = 0, y = 0, vx = 0, vy = 0, mx = 0, my = 0, raf = 0, ultimo = null;

    /* Se mide el sitio, que no se mueve: medir el botón, que sí, haría
       que persiguiera su propia posición desplazada. */
    function mueve(e) {
      const r = sitio.getBoundingClientRect();
      const fuera = Math.max(r.left - e.clientX, 0, e.clientX - r.right) ** 2 +
                    Math.max(r.top - e.clientY, 0, e.clientY - r.bottom) ** 2;
      const cerca = fuera < o.margen * o.margen;
      sitio.classList.toggle('is-cerca', cerca);
      mx = cerca ? (e.clientX - (r.left + r.width / 2)) * o.fuerza : 0;
      my = cerca ? (e.clientY - (r.top + r.height / 2)) * o.fuerza : 0;
      if (!raf) raf = requestAnimationFrame(paso);
    }

    // un resorte por eje: sigue al cursor con peso y vuelve con vaivén
    function paso(ts) {
      if (ultimo === null) ultimo = ts;
      let dt = Math.min(.05, (ts - ultimo) / 1000);
      ultimo = ts;
      for (; dt > 0; dt -= 1 / 240) {
        const h = Math.min(dt, 1 / 240);
        vx += (-o.rigidez * (x - mx) - o.freno * vx) * h; x += vx * h;
        vy += (-o.rigidez * (y - my) - o.freno * vy) * h; y += vy * h;
      }
      boton.style.transform = 'translate(' + x.toFixed(2) + 'px, ' + y.toFixed(2) + 'px)';
      for (const hijo of boton.children)
        hijo.style.transform = 'translate(' + (x * o.fondo).toFixed(2) + 'px, ' + (y * o.fondo).toFixed(2) + 'px)';
      const quieto = Math.abs(x - mx) + Math.abs(y - my) < .05 && Math.abs(vx) + Math.abs(vy) < .05;
      if (quieto) { raf = 0; ultimo = null; return; }
      raf = requestAnimationFrame(paso);
    }

    addEventListener('pointermove', mueve, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => {
      mx = my = 0; sitio.classList.remove('is-cerca');
      if (!raf) raf = requestAnimationFrame(paso);
    });
    return { boton };
  }

  window.Iman = Iman;
})();
