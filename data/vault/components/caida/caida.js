/* =====================================================================
   Caída · Moxen
   Al pasar el cursor, cada letra se cae: da un saltito, se suelta, gira
   un poco y sale por el suelo de su hueco; enseguida entra desde arriba,
   cae en su sitio, rebota y se aplasta al tocar el suelo. Con el dedo,
   un toque hace caer la palabra entera, en cadena. Sin dependencias.

     Caida(document.querySelector('[data-caida]'), { gravedad: 4600 });
   ===================================================================== */
(function () {
  'use strict';

  function Caida(el, opciones) {
    const o = Object.assign({ gravedad: 4600, rebote: .34 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // hueco > letra; las de cada palabra juntas y los <br> en su sitio
    const letras = [];
    const nodos = Array.from(el.childNodes);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    el.textContent = '';
    nodos.forEach(n => {
      if (n.nodeType !== 3) { el.appendChild(n); return; }
      n.textContent.split(/(\s+)/).forEach(trozo => {
        if (!trozo) return;
        if (/^\s+$/.test(trozo)) { el.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'ca-palabra';
        w.setAttribute('aria-hidden', 'true');
        Array.from(trozo).forEach(ch => {
          const h = document.createElement('span');
          h.className = 'ca-hueco';
          const i = document.createElement('i');
          i.className = 'ca-letra'; i.textContent = ch;
          h.appendChild(i); w.appendChild(h);
          const l = { h, el: i, estado: 0, y: 0, vy: 0, giro: 0, vg: 0, aplasta: 0, palabra: w };
          letras.push(l);
          h.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') suelta(l); });
        });
        el.appendChild(w);
      });
    });

    /* Tres estados: 0 quieta, 1 cayendo hacia el suelo, 2 entrando desde
       el techo. Es caída libre de verdad (la velocidad crece con la
       gravedad), así que la salida empieza lenta y acaba rápida. */
    let raf = 0, antes = 0;
    function suelta(l) {
      if (l.estado || reduce) return;
      l.estado = 1;
      l.vy = -260 - Math.random() * 120;                  // el saltito antes de caer
      l.vg = (Math.random() - .5) * 420;                  // grados por segundo
      if (!raf) { antes = performance.now(); raf = requestAnimationFrame(paso); }
    }

    function paso(t) {
      const dt = Math.min(.033, Math.max(0, (t - antes) / 1000)); antes = t;
      let alguna = false;
      letras.forEach(l => {
        if (l.aplasta > .001) { l.aplasta *= Math.exp(-dt / .07); alguna = true; } else l.aplasta = 0;
        if (!l.estado && !l.aplasta) return;
        const H = l.h.offsetHeight;
        if (l.estado === 1) {
          l.vy += o.gravedad * dt; l.y += l.vy * dt; l.giro += l.vg * dt;
          // salió por abajo: aparece justo encima del techo, derecha y quieta
          if (l.y > H) { l.estado = 2; l.y = -H; l.vy = 0; l.giro = 0; }
        } else if (l.estado === 2) {
          l.vy += o.gravedad * dt; l.y += l.vy * dt;
          if (l.y >= 0) {
            l.y = 0;
            // toca el suelo: rebota con lo que le queda y se aplasta según el golpe
            l.aplasta = Math.min(.26, l.vy / 5200);
            if (l.vy > 320) l.vy = -l.vy * o.rebote; else { l.vy = 0; l.estado = 0; }
          }
        }
        const a = l.aplasta;
        l.el.style.transform = l.estado || a
          ? 'translateY(' + l.y.toFixed(2) + 'px) rotate(' + l.giro.toFixed(2) + 'deg) scale(' + (1 + a * .7).toFixed(3) + ',' + (1 - a).toFixed(3) + ')'
          : '';
        alguna = true;
      });
      raf = alguna ? requestAnimationFrame(paso) : 0;
    }

    // con el dedo: la palabra tocada cae entera, letra a letra
    el.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      const h = e.target.closest('.ca-hueco');
      if (!h) return;
      letras.filter(l => l.palabra === h.parentNode).forEach((l, i) => setTimeout(() => suelta(l), i * 45));
    });

    return { suelta: i => letras[i] && suelta(letras[i]), todas: () => letras.forEach((l, i) => setTimeout(() => suelta(l), i * 30)) };
  }

  window.Caida = Caida;
})();
