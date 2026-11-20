/* =====================================================================
   Lectura · Moxen
   El avance de lectura de un artículo: una barra que se llena, una
   marca por apartado que se enciende al pasarlo, los minutos que quedan
   y un círculo que al terminar se vuelve «volver arriba». Mide el
   artículo, no la página: la cabecera y el pie no cuentan.
   Sin dependencias.

     Lectura(document.querySelector('[data-lectura]'), { suave: true });

   Dentro (o en cualquier parte del documento) busca, si existen:
   [data-lectura-texto], [data-lectura-barra], [data-lectura-resta],
   [data-lectura-circulo] y [data-lectura-porcentaje].
   suave: true suaviza la rueda del ratón dentro del contenedor.
   ===================================================================== */
(function () {
  'use strict';

  function Lectura(pagina, opciones) {
    const o = Object.assign({ suave: false, ppm: 200 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pieza = s => pagina.querySelector(s) || document.querySelector(s);
    const texto = pieza('[data-lectura-texto]') || pagina;
    const barra = pieza('[data-lectura-barra]');
    const resta = pieza('[data-lectura-resta]');
    const circulo = pieza('[data-lectura-circulo]');
    const porcentaje = pieza('[data-lectura-porcentaje]');
    const palabras = texto.textContent.trim().split(/\s+/).length;

    // dónde empieza y dónde termina la lectura, en píxeles de scroll
    let a = 0, b = 1, marcas = [];
    function mide() {
      const arriba = texto.getBoundingClientRect().top - pagina.getBoundingClientRect().top + pagina.scrollTop;
      a = Math.max(0, arriba - pagina.clientHeight * .2);
      b = Math.max(a + 1, arriba + texto.offsetHeight - pagina.clientHeight);
      if (!barra) return;
      /* Cada apartado se da por «empezado» cuando su título llega a un
         tercio de la ventana; ahí va su marca en la barra. */
      marcas.forEach(m => m.el.remove());
      marcas = Array.from(texto.querySelectorAll('h2')).map(h => {
        const y = h.getBoundingClientRect().top - pagina.getBoundingClientRect().top + pagina.scrollTop;
        const p = Math.max(0, Math.min(1, (y - pagina.clientHeight * .33 - a) / (b - a)));
        const el = document.createElement('span');
        el.className = 'le-marca-apartado';
        el.style.left = (p * 100).toFixed(2) + '%';
        barra.appendChild(el);
        return { el, p };
      });
    }

    let real = 0, visto = 0, previo = 0, raf = 0;
    const leido = () => Math.max(0, Math.min(1, (pagina.scrollTop - a) / (b - a)));

    function pinta() {
      [barra, circulo].forEach(el => el && el.style.setProperty('--le-avance', visto.toFixed(4)));
      marcas.forEach(m => m.el.toggleAttribute('data-leida', visto >= m.p - .002));
      if (porcentaje) porcentaje.textContent = Math.round(visto * 100);
      const fin = real >= .995;
      if (circulo) {
        circulo.toggleAttribute('data-fin', fin);
        circulo.setAttribute('aria-label', fin ? 'Volver arriba' : 'Avance de lectura: ' + Math.round(real * 100) + ' %');
      }
      if (resta) {
        const min = palabras / o.ppm * (1 - real);
        resta.textContent = fin ? 'Leído' : min < 1 ? 'Menos de 1 min' : Math.ceil(min) + ' min';
      }
    }

    /* La barra no salta a la posición nueva: la persigue, rápido pero
       suave, así un salto de la rueda se ve como un deslizamiento. */
    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      visto += (real - visto) * (reduce ? 1 : 1 - Math.exp(-dt * 14));
      if (Math.abs(real - visto) < .0005) visto = real;
      pinta();
      if (visto !== real) raf = requestAnimationFrame(paso);
      else { raf = 0; previo = 0; }
    }
    function actualiza() { real = leido(); if (!raf) raf = requestAnimationFrame(paso); }
    pagina.addEventListener('scroll', actualiza, { passive: true });

    // ── rueda suave (opcional) ──
    let destino = 0, actual = 0, rueda = 0, ruedaPrevio = 0;
    function desliza(t) {
      const dt = ruedaPrevio ? Math.min(.05, (t - ruedaPrevio) / 1000) : 0;
      ruedaPrevio = t;
      actual += (destino - actual) * (1 - Math.exp(-dt * 7));
      if (Math.abs(destino - actual) < .5) actual = destino;
      pagina.scrollTop = actual;
      if (actual !== destino) rueda = requestAnimationFrame(desliza);
      else { rueda = 0; ruedaPrevio = 0; }
    }
    function irA(y) {
      destino = Math.max(0, Math.min(pagina.scrollHeight - pagina.clientHeight, y));
      if (reduce) { pagina.scrollTop = actual = destino; return; }
      if (!rueda) { actual = pagina.scrollTop; rueda = requestAnimationFrame(desliza); }
    }
    if (o.suave) {
      pagina.addEventListener('wheel', e => {
        if (e.ctrlKey) return;   // con Ctrl es zoom: no se toca
        e.preventDefault();
        const k = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? pagina.clientHeight : 1;
        irA((rueda ? destino : pagina.scrollTop) + e.deltaY * k);
      }, { passive: false });
    }

    if (circulo) circulo.addEventListener('click', () => {
      if (!circulo.hasAttribute('data-fin')) return;
      if (o.suave) irA(0);
      else pagina.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    mide(); actualiza();
    addEventListener('resize', () => { mide(); actualiza(); });
    if (document.fonts) document.fonts.ready.then(() => { mide(); actualiza(); });

    return { mide, irA };
  }

  window.Lectura = Lectura;
})();
