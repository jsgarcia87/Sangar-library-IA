/* =====================================================================
   Esquiva · Moxen
   Cada letra de un texto se aparta de la punta del cursor y vuelve sola
   en cuanto se aleja. Sin dependencias.

     Esquiva(document.querySelector('.es-texto'), { radio: 110, fuerza: 26 });

   En pantallas táctiles no hace nada: no hay cursor que esquivar, y el
   texto se queda tal cual, sin trocear.
   ===================================================================== */
(function () {
  'use strict';

  function Esquiva(el, opciones) {
    const o = Object.assign({ radio: 110, fuerza: 26 }, opciones);
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return null;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

    // una <i> por letra, y las de cada palabra juntas para no partirla
    const glifos = [];
    const texto = el.textContent.trim();
    el.textContent = '';
    texto.split(/\s+/).forEach((palabra, k) => {
      if (k) el.appendChild(document.createTextNode(' '));
      const w = document.createElement('span');
      w.className = 'es-palabra';
      Array.from(palabra).forEach(ch => {
        const i = document.createElement('i');
        i.className = 'es-letra'; i.textContent = ch;
        w.appendChild(i); glifos.push(i);
      });
      el.appendChild(w);
    });

    /* El centro de reposo de cada letra se mide una vez, en coordenadas de
       la página y sin desplazamientos puestos: medido en cada movimiento, a
       media transición, la letra huiría de su propia posición desplazada y
       temblaría. Se vuelve a medir si cambia el tamaño de la ventana. */
    let centros = [];
    function mide() {
      // sin transición mientras se mide, o saldría la posición a medio volver
      glifos.forEach(g => { g.style.transition = 'none'; g.style.transform = ''; });
      centros = glifos.map(g => {
        const r = g.getBoundingClientRect();
        return [r.left + r.width / 2 + scrollX, r.top + r.height / 2 + scrollY];
      });
      glifos.forEach(g => { g.style.transition = ''; });
    }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(mide);
    addEventListener('resize', mide, { passive: true });

    let quieto = true;
    function mueve(e) {
      if (!centros.length) return;
      let alguna = false;
      glifos.forEach((g, i) => {
        const dx = centros[i][0] - e.pageX, dy = centros[i][1] - e.pageY, d = Math.hypot(dx, dy);
        if (d > o.radio || !d) { g.style.transform = ''; return; }
        const f = (1 - d / o.radio) * o.fuerza;
        g.style.transform = 'translate(' + (dx / d * f).toFixed(1) + 'px, ' + (dy / d * f).toFixed(1) + 'px)';
        alguna = true;
      });
      quieto = !alguna;
    }
    addEventListener('pointermove', mueve, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => {
      if (quieto) return;
      glifos.forEach(g => { g.style.transform = ''; });
      quieto = true;
    });
    return { glifos };
  }

  window.Esquiva = Esquiva;
})();
