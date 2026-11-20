/* =====================================================================
   Newton · Moxen
   Un péndulo de Newton: la bola de un extremo sale, vuelve, choca, y la
   del otro extremo sale con la misma fuerza, mientras las del medio
   apenas tiemblan. Cada salida es medio periodo de un péndulo de
   verdad: sale rápida del choque y se frena arriba. Sin dependencias.

     Newton(document.querySelector('[data-newton]'), {
       vaiven: 1000,      // ms que tarda una bola en salir y volver
       angulo: 28,        // grados que sube
     });
   ===================================================================== */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const RAD = Math.PI / 180;

  function Newton(svg, opciones) {
    const o = Object.assign({ bolas: +svg.dataset.bolas || 5, vaiven: 1000, angulo: 28, radio: 32, largo: 262, techo: 78 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const centro = 350, suelo = 462;
    const nodo = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); svg.appendChild(n); return n; };

    // cada bola: su punto de cuelgue, sus dos hilos en V, su sombra y ella
    const bolas = [];
    for (let i = 0; i < o.bolas; i++) {
      const x = centro + (i - (o.bolas - 1) / 2) * o.radio * 2;
      bolas.push({
        x,
        sombra: nodo('ellipse', { fill: 'url(#nw-sombra)', cy: suelo - 4, ry: 7 }),
        hiloA: nodo('line', { class: 'nw-hilo', x1: x - 12, y1: o.techo }),
        hiloB: nodo('line', { class: 'nw-hilo', x1: x + 12, y1: o.techo }),
        bola: nodo('circle', { class: 'nw-bola', r: o.radio }),
      });
    }

    function coloca(b, ang) {
      const a = ang * RAD;
      const cx = b.x + Math.sin(a) * o.largo, cy = o.techo + Math.cos(a) * o.largo;
      b.bola.setAttribute('cx', cx.toFixed(2)); b.bola.setAttribute('cy', cy.toFixed(2));
      // los hilos se atan arriba de la bola, sobre la línea del péndulo
      const ax = cx - Math.sin(a) * o.radio, ay = cy - Math.cos(a) * o.radio;
      [b.hiloA, b.hiloB].forEach(h => { h.setAttribute('x2', ax.toFixed(2)); h.setAttribute('y2', ay.toFixed(2)); });
      // la sombra sigue a la bola y se encoge y aclara cuanto más sube
      const alto = (o.techo + o.largo) - cy;
      b.sombra.setAttribute('cx', cx.toFixed(2));
      b.sombra.setAttribute('rx', (o.radio * (1 - alto / 260)).toFixed(2));
      b.sombra.style.opacity = (1 - alto / 120).toFixed(3);
    }

    /* Media vuelta de péndulo: sale con la velocidad del choque y se
       frena hasta pararse arriba; luego cae igual. Primero la derecha,
       después la izquierda. Al chocar, las del medio tiemblan un poco. */
    let t0 = null;
    function pinta(t) {
      if (t0 === null) t0 = t;
      const e = ((t - t0) % (2 * o.vaiven)) / o.vaiven;      // 0…2
      const lado = e < 1 ? 1 : -1, u = e % 1;
      const salida = reduce ? 0 : o.angulo * Math.sin(Math.PI * u);
      const temblor = reduce ? 0 : .5 * Math.exp(-u * 9) * Math.sin(u * 60);
      bolas.forEach((b, i) => {
        let ang = 0;
        if (lado > 0 && i === bolas.length - 1) ang = salida;
        else if (lado < 0 && i === 0) ang = -salida;
        else if (i > 0 && i < bolas.length - 1) ang = temblor * lado;
        coloca(b, ang);
      });
      if (!reduce) requestAnimationFrame(pinta);
    }
    requestAnimationFrame(pinta);
  }

  window.Newton = Newton;
})();
