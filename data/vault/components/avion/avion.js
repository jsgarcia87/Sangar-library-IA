/* =====================================================================
   Avión · Moxen
   Un botón «Enviar» que se pliega en un avión de papel: se encoge hasta
   ser una hoja, la hoja se dobla, el avión sale volando por la esquina,
   da la vuelta y aterriza en su sitio para desplegarse en «Enviado ✓».

     const a = Avion(document.querySelector('.av-boton'), { hecho: 'Enviado', vuelve: 1800 });
     a.envia();

   El avión son dos polígonos de cuatro vértices: los mismos que forman
   las dos mitades de la hoja. Doblar es llevar cada vértice a su sitio.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ns = 'http://www.w3.org/2000/svg';
  const PALOMITA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.6 4.6L19 7.5"/></svg>';
  const vaiven = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const espera = ms => new Promise(r => setTimeout(r, ms));

  // la hoja (mitad de arriba y de abajo) y el avión (ala y quilla), centrados en 0,0
  const HOJA = [[[-60, -40], [60, -40], [60, 0], [-60, 0]], [[-60, 0], [60, 0], [60, 40], [-60, 40]]];
  const AVION = [[[-64, -27], [70, 0], [70, 0], [-26, 4]], [[-26, 4], [70, 0], [-46, 26], [-46, 26]]];

  // anima k de 0 a 1 en «ms» con la curva dada, y avisa en cada fotograma
  function tween(ms, curva, alPaso) {
    return new Promise(listo => {
      let t0 = null;
      const paso = ts => {
        if (t0 === null) t0 = ts;
        const u = Math.min(1, (ts - t0) / ms);
        alPaso(curva(u));
        u < 1 ? requestAnimationFrame(paso) : listo();
      };
      requestAnimationFrame(paso);
    });
  }

  // un punto y su dirección sobre una curva de Bézier cúbica
  function bezier(p, u) {
    const v = 1 - u;
    const x = v * v * v * p[0][0] + 3 * v * v * u * p[1][0] + 3 * v * u * u * p[2][0] + u * u * u * p[3][0];
    const y = v * v * v * p[0][1] + 3 * v * v * u * p[1][1] + 3 * v * u * u * p[2][1] + u * u * u * p[3][1];
    const dx = 3 * v * v * (p[1][0] - p[0][0]) + 6 * v * u * (p[2][0] - p[1][0]) + 3 * u * u * (p[3][0] - p[2][0]);
    const dy = 3 * v * v * (p[1][1] - p[0][1]) + 6 * v * u * (p[2][1] - p[1][1]) + 3 * u * u * (p[3][1] - p[2][1]);
    return [x, y, Math.atan2(dy, dx)];
  }

  function Avion(boton, opciones) {
    const o = Object.assign({ hecho: boton.dataset.hecho || 'Enviado', vuelve: 1800 }, opciones);

    const etiqueta = document.createElement('span');
    etiqueta.className = 'av-etiqueta';
    while (boton.firstChild) etiqueta.appendChild(boton.firstChild);
    const hecho = document.createElement('span');
    hecho.className = 'av-hecho';
    hecho.innerHTML = '<span></span>' + PALOMITA;
    hecho.firstChild.textContent = o.hecho;
    boton.append(etiqueta, hecho);

    let cielo = null, ala, quilla, estela, avion, puntos = [], estado = 'listo';

    // el cielo se crea la primera vez que hace falta, y se reutiliza
    function prepara() {
      if (cielo) return;
      cielo = document.createElementNS(ns, 'svg');
      cielo.setAttribute('class', 'av-cielo');
      cielo.setAttribute('aria-hidden', 'true');
      cielo.innerHTML = '<path class="av-estela"/><g><polygon class="av-quilla"/><polygon class="av-ala"/></g>';
      estela = cielo.querySelector('.av-estela');
      avion = cielo.querySelector('g');
      ala = cielo.querySelector('.av-ala');
      quilla = cielo.querySelector('.av-quilla');
      document.body.appendChild(cielo);
    }

    // k = 0: hoja; k = 1: avión
    function forma(k) {
      [ala, quilla].forEach((poli, i) => poli.setAttribute('points', HOJA[i].map((h, j) => {
        const a = AVION[i][j];
        return (h[0] + (a[0] - h[0]) * k).toFixed(2) + ',' + (h[1] + (a[1] - h[1]) * k).toFixed(2);
      }).join(' ')));
    }
    function pose(x, y, ang, esc) {
      avion.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (ang * 180 / Math.PI).toFixed(2) + ') scale(' + esc.toFixed(3) + ')');
    }
    function traza(x, y) {
      puntos.push(x.toFixed(1) + ' ' + y.toFixed(1));
      estela.setAttribute('d', 'M' + puntos.join('L'));
    }

    async function envia() {
      if (estado !== 'listo') return;
      estado = 'volando';
      if (reduce) {
        boton.classList.add('is-hecho');
        await espera(o.vuelve);
        boton.classList.remove('is-hecho'); estado = 'listo'; return;
      }
      prepara();
      const r = boton.getBoundingClientRect(), W = r.width, H = r.height;
      const cx = r.left + W / 2, cy = r.top + H / 2, vw = innerWidth;
      const radio = parseFloat(getComputedStyle(boton).borderTopLeftRadius) || 0;
      const recorte = 'inset(' + (H / 2 - 40) + 'px ' + (W / 2 - 60) + 'px round 3px)';

      // 1 · la cara del botón se encoge hasta ser una hoja
      boton.classList.add('is-plegando');
      boton.animate([{ clipPath: 'inset(0px 0px round ' + radio + 'px)' }, { clipPath: recorte }],
        { duration: 300, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' });
      await espera(300);

      // 2 · la hoja de verdad pasa al cielo, y allí se dobla
      forma(0); pose(cx, cy, 0, 1);
      estela.classList.remove('is-seca'); puntos = []; estela.removeAttribute('d');
      cielo.style.display = '';
      boton.getAnimations().forEach(a => a.cancel());
      boton.classList.add('is-fuera');
      await tween(420, vaiven, k => { forma(k); pose(cx, cy - 6 * k, -.12 * k, 1 + .08 * k); });

      // 3 · coge impulso hacia atrás y sale disparado por arriba a la derecha
      await tween(170, vaiven, k => pose(cx - 18 * k, cy - 6 + 4 * k, -.12 + .06 * k, 1.08));
      const ida = [[cx - 18, cy - 2], [cx + 240, cy + 40], [cx + 420, cy - 90], [vw + 160, cy - 330]];
      await tween(900, u => u * u, u => {
        const [x, y, ang] = bezier(ida, u);
        traza(x, y); pose(x, y, ang, 1.08 - .5 * u);
      });
      estela.classList.add('is-seca');
      await espera(420);

      // 4 · vuelve desde la izquierda, en curva, frenando hasta posarse
      puntos = []; estela.classList.remove('is-seca');
      const vuelta = [[-140, cy - 250], [cx - 560, cy - 300], [cx - 320, cy + 6], [cx, cy]];
      await tween(1150, u => 1 - Math.pow(1 - u, 3), u => {
        const [x, y, ang] = bezier(vuelta, u);
        traza(x, y); pose(x, y, ang * (1 - u * u), .55 + .45 * u);
      });
      estela.classList.add('is-seca');

      // 5 · se despliega: avión → hoja → botón, que ahora dice «Enviado ✓»
      await tween(360, vaiven, k => { forma(1 - k); pose(cx, cy, 0, 1); });
      boton.classList.remove('is-fuera', 'is-plegando');
      boton.classList.add('is-hecho');
      boton.animate([{ clipPath: recorte }, { clipPath: 'inset(0px 0px round ' + radio + 'px)' }],
        { duration: 340, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      cielo.style.display = 'none';
      await espera(o.vuelve);
      boton.classList.remove('is-hecho');
      estado = 'listo';
    }

    boton.addEventListener('click', envia);
    return { envia, estado: () => estado };
  }

  window.Avion = Avion;
})();
