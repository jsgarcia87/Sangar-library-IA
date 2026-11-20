/* =====================================================================
   Salto · Moxen
   Una barra de pestañas cuyo indicador —una bola detrás del ícono—
   salta en arco de una pestaña a otra: se estira en el aire en la
   dirección del vuelo y se aplasta al caer, como una pelota de goma.

     const s = Salto(document.querySelector('[data-salto]'));
     s.ve(3);      s.activa();

   El arco es más alto cuanto más lejos va. Si se pulsa otra pestaña a
   medio salto, sale desde donde esté: nunca vuelve al punto de partida.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const curva = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function Salto(barra, opciones) {
    const o = Object.assign({ duracion: 540 }, opciones);
    const pestanas = Array.from(barra.querySelectorAll('[data-salto-pestana]'));
    const bola = document.createElement('span');
    bola.className = 'sa-bola';
    bola.setAttribute('aria-hidden', 'true');
    barra.prepend(bola);

    let activa = Math.max(0, pestanas.findIndex(p => p.classList.contains('is-activa')));
    let x = 0, y = 0, raf = 0;

    // el centro del ícono de una pestaña, en coordenadas de la barra
    function centro(i) {
      const b = barra.getBoundingClientRect(), r = pestanas[i].querySelector('.sa-icono').getBoundingClientRect();
      return [r.left - b.left + r.width / 2, r.top - b.top + r.height / 2];
    }
    const radio = () => bola.offsetWidth / 2;

    /* La bola se deforma a lo largo de su velocidad: girar, escalar y
       deshacer el giro estira en esa dirección sin torcer la bola. */
    function pinta(px, py, estira, ang, aplasta) {
      const r = radio();
      bola.style.transform = 'translate(' + (px - r).toFixed(1) + 'px, ' + (py - r + aplasta * r).toFixed(1) + 'px)' +
        ' rotate(' + ang.toFixed(3) + 'rad) scale(' + (1 + estira).toFixed(3) + ', ' + (1 - estira * .7).toFixed(3) + ') rotate(' + (-ang).toFixed(3) + 'rad)' +
        ' scale(' + (1 + aplasta).toFixed(3) + ', ' + (1 - aplasta).toFixed(3) + ')';
    }
    function coloca() { [x, y] = centro(activa); pinta(x, y, 0, 0, 0); }

    function ve(i) {
      if (i === activa && !raf) return;
      pestanas[activa].classList.remove('is-activa');
      pestanas[activa].removeAttribute('aria-current');
      activa = i;
      pestanas[i].setAttribute('aria-current', 'page');
      if (reduce) { pestanas[i].classList.add('is-activa'); return coloca(); }

      cancelAnimationFrame(raf);
      const [x0, y0] = [x, y], [x1, y1] = centro(i);
      const alto = 30 + Math.abs(x1 - x0) * .16;          // más lejos, más alto
      let t0 = null, px = x0, py = y0;
      function vuela(ts) {
        if (t0 === null) t0 = ts;
        const u = Math.min(1, (ts - t0) / o.duracion), k = curva(u);
        x = x0 + (x1 - x0) * k;
        y = y0 + (y1 - y0) * k - alto * 4 * u * (1 - u);
        const vx = x - px, vy = y - py, v = Math.hypot(vx, vy);
        px = x; py = y;
        pinta(x, y, Math.min(.28, v * .018), Math.atan2(vy, vx), 0);
        if (u < 1) { raf = requestAnimationFrame(vuela); return; }
        pestanas[i].classList.add('is-activa');
        aterriza();
      }
      raf = requestAnimationFrame(vuela);
    }

    // al caer se aplasta y rebota con un resorte corto
    function aterriza() {
      let q = .24, v = 0, ultimo = null;
      function paso(ts) {
        if (ultimo === null) ultimo = ts;
        let dt = Math.min(.05, (ts - ultimo) / 1000);
        ultimo = ts;
        for (; dt > 0; dt -= 1 / 240) { const h = Math.min(dt, 1 / 240); v += (-700 * q - 16 * v) * h; q += v * h; }
        pinta(x, y, 0, 0, q);
        if (Math.abs(q) > .002 || Math.abs(v) > .02) raf = requestAnimationFrame(paso);
        else { raf = 0; pinta(x, y, 0, 0, 0); }
      }
      raf = requestAnimationFrame(paso);
    }

    pestanas.forEach((p, i) => p.addEventListener('click', () => ve(i)));
    // con las flechas del teclado, de pestaña en pestaña
    barra.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const i = (activa + d + pestanas.length) % pestanas.length;
      pestanas[i].focus(); ve(i);
    });
    coloca();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { if (!raf) coloca(); });
    addEventListener('resize', () => { if (!raf) coloca(); });
    return { ve, activa: () => activa };
  }

  window.Salto = Salto;
})();
