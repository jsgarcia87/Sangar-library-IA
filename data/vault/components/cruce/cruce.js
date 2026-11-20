/* =====================================================================
   Cruce · Moxen
   Una frase enorme que cruza la pantalla en horizontal mientras se baja.
   Cada palabra se rellena al pasar por el centro y la frase se inclina
   con la velocidad del scroll, como si la arrastrara. Una segunda fila,
   hueca, va en sentido contrario. Sin dependencias.

     <main data-cruce>
       <div class="cr-pista"><div class="cr-escenario">
         <h1 data-cruce-frase>…</h1>  <p data-cruce-contra>…</p>
       </div></div>
     </main>
     Cruce(document.querySelector('[data-cruce]'), { inclina: 10 });

   La rueda se suaviza dentro del contenedor; con el dedo es nativa.
   ===================================================================== */
(function () {
  'use strict';

  const limita = (v, a, b) => Math.max(a, Math.min(b, v));

  function Cruce(caja, opciones) {
    const o = Object.assign({ suavidad: 140, inclina: 10, margen: .06 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frase = caja.querySelector('[data-cruce-frase]');
    const contra = caja.querySelector('[data-cruce-contra]');
    const barra = caja.querySelector('[data-cruce-barra]');
    const cifra = caja.querySelector('[data-cruce-cifra]');
    const pista = frase.closest('.cr-pista') || caja.firstElementChild;

    // una caja por palabra: cada una lleva su propio relleno
    const palabras = frase.textContent.trim().split(/\s+/).map((p, i) => {
      const s = document.createElement('span');
      s.className = 'cr-palabra'; s.textContent = p;
      return s;
    });
    frase.setAttribute('aria-label', frase.textContent.trim());
    frase.textContent = '';
    palabras.forEach((s, i) => { if (i) frase.appendChild(document.createTextNode(' ')); frase.appendChild(s); });

    let ancho = 0, anchoContra = 0, centros = [], tramo = 1, inicio = 0;
    function mide() {
      ancho = frase.scrollWidth;
      anchoContra = contra ? contra.scrollWidth : 0;
      centros = palabras.map(s => s.offsetLeft + s.offsetWidth / 2);
      inicio = pista.offsetTop;
      tramo = Math.max(1, pista.offsetHeight - caja.clientHeight);
    }

    /* Todo sale del avance p (0 → 1) del escenario pegado. La frase empieza
       con su primera palabra en el margen y termina con la última en el
       margen opuesto; la fila hueca hace el viaje al revés. */
    let inclinacion = 0, velInc = 0;
    function pinta(y, v, dt) {
      const W = caja.clientWidth, m = W * o.margen;
      const p = limita((y - inicio) / tramo, 0, 1);
      const x = m - p * (ancho - W + 2 * m);

      /* La inclinación persigue a la velocidad con un resorte: al frenar
         en seco no se endereza de golpe, se pasa un poco y se asienta. */
      const meta = reduce ? 0 : limita(-v * o.inclina / 2600, -o.inclina, o.inclina);
      velInc += ((meta - inclinacion) * 170 - velInc * 18) * dt;
      inclinacion += velInc * dt;
      frase.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0) skewX(' + inclinacion.toFixed(2) + 'deg)';

      // relleno: lleno cerca del centro, hueco a partir de ~40 % del ancho
      palabras.forEach((s, i) => {
        const d = Math.abs(x + centros[i] - W / 2);
        s.style.setProperty('--ll', limita(1 - (d - W * .16) / (W * .24), 0, 1).toFixed(3));
      });
      if (contra) contra.style.transform = 'translate3d(' + (-(anchoContra - W) * (1 - p)).toFixed(1) + 'px,0,0) skewX(' + (-inclinacion * .6).toFixed(2) + 'deg)';
      if (barra) barra.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      if (cifra) cifra.textContent = String(Math.round(p * 100)).padStart(3, '0');
    }

    // ── la rueda, suavizada ──────────────────────────────────────────
    let destino = caja.scrollTop, actual = destino, escrito = destino, antes = 0, previo = destino;
    caja.addEventListener('wheel', e => {
      if (e.ctrlKey || reduce) return;
      e.preventDefault();
      const u = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? caja.clientHeight : 1;
      destino = limita(destino + e.deltaY * u, 0, caja.scrollHeight - caja.clientHeight);
    }, { passive: false });

    function paso(t) {
      const dt = Math.min(64, t - (antes || t)); antes = t;
      if (Math.abs(caja.scrollTop - escrito) > 1.5) destino = actual = caja.scrollTop;   // dedo, teclado o barra
      actual += (destino - actual) * (1 - Math.exp(-dt / o.suavidad));
      if (Math.abs(destino - actual) < .2) actual = destino;
      caja.scrollTop = actual;
      escrito = caja.scrollTop;
      const v = dt ? (escrito - previo) / dt * 1000 : 0;   // px/s
      previo = escrito;
      pinta(escrito, v, dt / 1000);
      requestAnimationFrame(paso);
    }

    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      mide();
      pinta(caja.scrollTop, 0, 0);
      requestAnimationFrame(paso);
    });
    addEventListener('resize', mide, { passive: true });

    return { mide, ir: y => { destino = y; } };
  }

  window.Cruce = Cruce;
})();
