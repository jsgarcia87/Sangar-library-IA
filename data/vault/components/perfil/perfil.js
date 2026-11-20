/* =====================================================================
   Perfil · Moxen
   Una tarjeta de perfil que se despliega: el avatar crece y viaja al
   centro, el nombre lo sigue, y después entran los datos, escalonados.
   Al pasar el cursor, al tocarla o con Intro. Sin dependencias.

     const p = Perfil(document.querySelector('[data-perfil]'));
     p.abre();      p.cierra();

   Técnica FLIP: se mide dónde está cada pieza, se cambia de forma, se
   mide de nuevo y se anima la diferencia con transform. El navegador solo
   calcula la maqueta dos veces; el resto es transform y clip-path.
   ===================================================================== */
(function () {
  'use strict';

  function Perfil(tarjeta, opciones) {
    const o = Object.assign({ dura: 720, curva: 'cubic-bezier(.22, 1, .36, 1)' }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const contenido = tarjeta.querySelector('[data-perfil-contenido]');
    const piezas = Array.from(tarjeta.querySelectorAll('[data-perfil-flip]'));
    const cifras = Array.from(tarjeta.querySelectorAll('[data-cuenta]'));
    const radio = parseFloat(getComputedStyle(tarjeta).borderTopLeftRadius) || 0;

    // el fondo, en su capa: crece sin deformar el borde ni la sombra
    const capa = document.createElement('span');
    capa.className = 'pf-capa';
    capa.setAttribute('aria-hidden', 'true');
    tarjeta.prepend(capa);
    piezas.forEach(p => { p.style.transformOrigin = '0 0'; });

    let abierta = false, ocupada = false, deseo = false, vivas = [];

    const mide = () => ({ caja: tarjeta.getBoundingClientRect(), piezas: piezas.map(p => p.getBoundingClientRect()) });
    // la transformación que lleva la pieza de su sitio (de) a otro (a)
    const hacia = (de, a) => 'translate(' + (a.left - de.left) + 'px, ' + (a.top - de.top) + 'px) scale(' + (a.width / de.width) + ')';
    // la franja «banda» de la caja, como recorte o como márgenes
    const margen = (caja, banda) => [banda.top - caja.top, caja.right - banda.right, caja.bottom - banda.bottom, banda.left - caja.left];
    const recorte = m => 'inset(' + m.map(v => v + 'px').join(' ') + ' round ' + radio + 'px)';
    const sitio = m => ({ top: m[0] + 'px', right: m[1] + 'px', bottom: m[2] + 'px', left: m[3] + 'px' });
    const cero = [0, 0, 0, 0];

    /* Las animaciones siempre ocurren con la tarjeta en su forma grande:
       al abrir, desde la pequeña hasta su sitio; al cerrar, desde su sitio
       hasta la pequeña, y solo al final se cambia la maqueta. Así nunca
       hay que dibujar contenido fuera de la caja. */
    function anima(grande, desde, hasta, listo) {
      const ef = { duration: o.dura, easing: o.curva, fill: 'forwards' };
      const m0 = margen(grande.caja, desde.caja), m1 = margen(grande.caja, hasta.caja);
      vivas = [
        contenido.animate([{ clipPath: recorte(m0) }, { clipPath: recorte(m1) }], ef),
        capa.animate([sitio(m0), sitio(m1)], ef),
      ].concat(piezas.map((p, i) => p.animate([
        { transform: hacia(grande.piezas[i], desde.piezas[i]) },
        // los textos se apagan un instante a mitad de viaje: no se pisan con el avatar
        p.dataset.perfilFlip === 'texto' ? { opacity: .1, offset: .3 } : {},
        { transform: hacia(grande.piezas[i], hasta.piezas[i]) },
      ], ef)));
      /* Un temporizador y no onfinish: si alguien pausa las animaciones
         (un grabador, las herramientas del navegador), el final llega igual. */
      setTimeout(() => { listo(); vivas.forEach(a => a.cancel()); vivas = []; ocupada = false; sigue(); }, o.dura + 30);
    }

    function abre() {
      deseo = true;
      if (ocupada || abierta) return;
      ocupada = abierta = true;
      const chica = mide();
      tarjeta.setAttribute('data-abierta', '');
      tarjeta.setAttribute('aria-expanded', 'true');
      const grande = mide();
      cuenta();
      if (reduce) { ocupada = false; return; }
      anima(grande, chica, grande, () => {});
    }

    function cierra() {
      deseo = false;
      if (ocupada || !abierta) return;
      ocupada = true; abierta = false;
      // se mide la forma pequeña un instante, sin llegar a pintarla
      const grande = mide();
      tarjeta.removeAttribute('data-abierta');
      const chica = mide();
      tarjeta.setAttribute('data-abierta', '');
      tarjeta.setAttribute('data-cerrando', '');
      tarjeta.setAttribute('aria-expanded', 'false');
      const fin = () => { tarjeta.removeAttribute('data-abierta'); tarjeta.removeAttribute('data-cerrando'); };
      if (reduce) { fin(); ocupada = false; return; }
      anima(grande, grande, chica, fin);
    }

    // si llegó otra orden a mitad de camino, se cumple al terminar
    function sigue() { if (deseo !== abierta) (deseo ? abre : cierra)(); }

    // las cifras cuentan desde cero, frenando al llegar
    function cuenta() {
      cifras.forEach(c => {
        const meta = +c.dataset.cuenta;
        if (reduce) { c.textContent = meta; return; }
        let t0 = 0;
        const paso = t => {
          if (!t0) t0 = t + 260;   // empiezan cuando ya entraron los datos
          const u = Math.min(1, Math.max(0, (t - t0) / 900));
          c.textContent = Math.round(meta * (1 - Math.pow(1 - u, 3)));
          if (u < 1 && abierta) requestAnimationFrame(paso);
        };
        c.textContent = '0';
        requestAnimationFrame(paso);
      });
    }

    tarjeta.setAttribute('aria-expanded', 'false');
    tarjeta.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') abre(); });
    tarjeta.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') cierra(); });
    // con el dedo o con el teclado se alterna; los enlaces de dentro funcionan
    tarjeta.addEventListener('click', e => {
      if (e.target.closest('a, button') || e.pointerType === 'mouse') return;
      (abierta ? cierra : abre)();
    });
    tarjeta.addEventListener('keydown', e => {
      if (e.target !== tarjeta || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      (abierta ? cierra : abre)();
    });

    return { abre, cierra };
  }

  window.Perfil = Perfil;
})();
