/* =====================================================================
   Barra · Moxen
   Un cursor que entiende lo que tiene debajo: es un punto en reposo, se
   vuelve una barra de escribir —de la altura exacta de la línea— al
   pasar sobre un texto, y un círculo hueco que abraza los botones.
   Sin dependencias.

     Barra();
     Barra({ botones: 'a, button, .tarjeta', textos: 'p, h1, h2, li' });

   En pantallas táctiles no hace nada: no hay cursor que reemplazar.
   ===================================================================== */
(function () {
  'use strict';

  function Barra(opciones) {
    const o = Object.assign({
      botones: 'a, button, [role="button"], input[type="submit"], [data-barra-boton]',
      textos: 'p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption, label, td, th, [data-barra-texto]',
      iman: .3,          // cuánto tira el botón del círculo hacia su centro
      seguir: 24,
    }, opciones);
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return null;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const el = document.createElement('div');
    el.className = 'br-cursor';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="br-forma"></div>';
    document.body.appendChild(el);
    document.documentElement.classList.add('br-activo');

    let px = 0, py = 0, mx = 0, my = 0, x = 0, y = 0, previo = 0, quieto = 0;
    const rango = document.createRange();

    /* ¿Está el puntero sobre letras? No basta con estar dentro del
       párrafo: un Range sobre su texto da una caja por cada línea, y solo
       cuenta si el puntero cae dentro de una de ellas. Esa caja dice
       también la altura y el centro de la línea. */
    function lineaBajo(bloque, x, y) {
      rango.selectNodeContents(bloque);
      const cajas = rango.getClientRects();
      // entre dos líneas queda el interlineado: se reparte a medias
      const cs = getComputedStyle(bloque);
      const alto = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      for (let i = 0; i < cajas.length; i++) {
        const c = cajas[i], medio = c.top + c.height / 2;
        if (x >= c.left - 2 && x <= c.right + 2 && Math.abs(y - medio) <= Math.max(c.height, alto) / 2) return c;
      }
      return null;
    }

    function decide(e) {
      const objetivo = e.target.closest ? e.target : null;
      const boton = objetivo && objetivo.closest(o.botones);
      if (boton) {
        const r = boton.getBoundingClientRect();
        el.dataset.modo = 'boton';
        el.style.setProperty('--br-aro', (r.height + 22).toFixed(0) + 'px');
        // el círculo se deja llevar un poco hacia el centro del botón
        mx = px + (r.left + r.width / 2 - px) * o.iman;
        my = py + (r.top + r.height / 2 - py) * o.iman;
        return;
      }
      const bloque = objetivo && objetivo.closest(o.textos);
      const linea = bloque && lineaBajo(bloque, px, py);
      if (linea) {
        el.dataset.modo = 'texto';
        el.style.setProperty('--br-alto', (linea.height * .96).toFixed(1) + 'px');
        // la barra se asienta en el centro de la línea, como un cursor de verdad
        mx = px; my = linea.top + linea.height / 2;
        return;
      }
      el.dataset.modo = 'punto';
      mx = px; my = py;
    }

    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const movido = e.clientX !== px || e.clientY !== py;
      px = e.clientX; py = e.clientY;
      decide(e);
      if (!el.hasAttribute('data-visible')) { x = mx; y = my; el.setAttribute('data-visible', ''); }
      if (!movido) return;
      // quieto un momento sobre texto: empieza a parpadear
      el.removeAttribute('data-quieto');
      clearTimeout(quieto);
      quieto = setTimeout(() => el.setAttribute('data-quieto', ''), 650);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => el.removeAttribute('data-visible'));

    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      const k = reduce ? 1 : 1 - Math.exp(-dt * o.seguir);
      x += (mx - x) * k; y += (my - y) * k;
      el.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)';
      requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);

    return { el };
  }

  window.Barra = Barra;
})();
