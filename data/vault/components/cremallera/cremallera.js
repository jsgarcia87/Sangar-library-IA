/* =====================================================================
   Cremallera · Moxen
   Un botón de descarga que se abre como un cierre: el tirador lo recorre,
   las dos mitades se separan y dentro aparece el progreso. Al terminar,
   el cierre vuelve a subir y el botón dice «Listo».

     Cremallera(boton);                                   // descarga simulada
     Cremallera(boton, { descarga: avance => miDescarga(avance) });

   «descarga» recibe una función avance(0…1) y devuelve una promesa que se
   cumple al terminar. Las solapas y los dientes se dibujan en SVG en cada
   fotograma: la abertura sigue al tirador con una curva suave, en V.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ns = 'http://www.w3.org/2000/svg';
  const suave = u => u * u * (3 - 2 * u);
  const vaiven = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const FLECHA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.6 4.6L19 7.5"/></svg>';

  // una descarga de mentira, a tirones como las de verdad
  function simula(avance) {
    return new Promise(listo => {
      let p = 0;
      const t = setInterval(() => {
        p = Math.min(1, p + .015 + Math.random() * .06);
        avance(p);
        if (p >= 1) { clearInterval(t); listo(); }
      }, 90);
    });
  }

  // anima un número de «desde» a «hasta» en «ms», y avisa en cada paso
  function tween(desde, hasta, ms, alPaso) {
    return new Promise(listo => {
      let t0 = null;
      const paso = ts => {
        if (t0 === null) t0 = ts;
        const u = Math.min(1, (ts - t0) / ms);
        alPaso(desde + (hasta - desde) * vaiven(u));
        u < 1 ? requestAnimationFrame(paso) : listo();
      };
      requestAnimationFrame(paso);
    });
  }
  const espera = ms => new Promise(r => setTimeout(r, ms));

  function Cremallera(boton, opciones) {
    const o = Object.assign({
      descarga: simula,
      listo: 'Listo',
      tramo: 130,       // px que tarda la abertura en separarse del todo tras el tirador
      orilla: 14,       // px de solapa que quedan a la vista, arriba y abajo, al abrir
    }, opciones);

    // lo de siempre a una etiqueta; la de «listo», al lado
    const etiqueta = document.createElement('span');
    etiqueta.className = 'cr-etiqueta';
    while (boton.firstChild) etiqueta.appendChild(boton.firstChild);
    const listo = document.createElement('span');
    listo.className = 'cr-listo';
    listo.innerHTML = '<span></span>' + FLECHA;
    listo.firstChild.textContent = o.listo;

    const dentro = document.createElement('span');
    dentro.className = 'cr-dentro';
    dentro.setAttribute('aria-hidden', 'true');
    dentro.innerHTML = '<span class="cr-relleno"></span><span>Descargando</span><span class="cr-cifra">0 %</span>';
    const relleno = dentro.querySelector('.cr-relleno'), cifra = dentro.querySelector('.cr-cifra');

    const tela = document.createElementNS(ns, 'svg');
    tela.setAttribute('class', 'cr-tela');
    tela.setAttribute('aria-hidden', 'true');
    tela.innerHTML =
      '<path class="cr-solapa"/><path class="cr-solapa"/>' +
      '<path class="cr-dientes"/><path class="cr-dientes is-abajo"/>' +
      '<g class="cr-carro"><rect x="-17" y="-11" width="30" height="22" rx="6"/>' +
      '<rect class="cr-ojal" x="-8" y="-3" width="12" height="6" rx="3"/>' +
      '<rect x="8" y="-5" width="22" height="10" rx="5"/></g>';
    const [arriba, abajo, dArriba, dAbajo] = tela.querySelectorAll('path');
    const carro = tela.querySelector('.cr-carro');
    boton.append(dentro, tela, etiqueta, listo);

    let W = 0, H = 0, x = -40, estado = 'cerrada';
    const anchoTela = () => { const r = boton.getBoundingClientRect(); W = r.width; H = r.height; dibuja(); };

    /* Cuánto se ha separado cada borde en el punto «px»: nada delante
       del tirador, y del todo un «tramo» por detrás de él. */
    function abertura(px) {
      const G = H / 2 - o.orilla;
      return G * suave(Math.max(0, Math.min(1, (x - px) / o.tramo)));
    }

    function dibuja() {
      const paso = 3, borde = [];
      for (let px = 0; px <= W + paso; px += paso) borde.push([Math.min(px, W), abertura(px)]);
      const sup = borde.map(([px, g]) => px.toFixed(1) + ' ' + (H / 2 - g).toFixed(1));
      const inf = borde.map(([px, g]) => px.toFixed(1) + ' ' + (H / 2 + g).toFixed(1));
      arriba.setAttribute('d', 'M0 0H' + W + 'V' + (H / 2 - abertura(W)).toFixed(1) + 'L' + sup.slice().reverse().join('L') + 'Z');
      abajo.setAttribute('d', 'M0 ' + H + 'H' + W + 'V' + (H / 2 + abertura(W)).toFixed(1) + 'L' + inf.slice().reverse().join('L') + 'Z');
      // los dientes, un pelo hacia su lado: cerrados se ven encajados en zigzag
      dArriba.setAttribute('d', 'M' + borde.map(([px, g]) => px.toFixed(1) + ' ' + (H / 2 - g - 1.5).toFixed(1)).join('L'));
      dAbajo.setAttribute('d', 'M' + borde.map(([px, g]) => px.toFixed(1) + ' ' + (H / 2 + g + 1.5).toFixed(1)).join('L'));
      carro.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + (H / 2) + ')');
    }

    function muestra(p) {
      relleno.style.width = (p * 100).toFixed(1) + '%';
      cifra.textContent = Math.round(p * 100) + ' %';
    }

    async function abre() {
      if (estado !== 'cerrada') return;
      estado = 'abriendo';
      boton.setAttribute('aria-busy', 'true');
      anchoTela();
      muestra(0);
      boton.classList.add('is-cosida');            // la etiqueta sale, aparecen dientes y tirador
      if (!reduce) {
        await espera(260);
        await tween(-40, W + o.tramo * .55, 820, v => { x = v; dibuja(); });
      } else { x = W + o.tramo; dibuja(); }

      /* La barra no salta con cada aviso de la descarga: persigue el valor
         real con suavidad, y la promesa espera a que llegue al 100 %. */
      estado = 'bajando';
      let real = 0, visto = 0, fin = false;
      await new Promise(listo => {
        const persigue = () => {
          visto += (real - visto) * (reduce ? 1 : .14);
          if (real - visto < .002) visto = real;
          muestra(visto);
          if (fin && visto >= 1) return listo();
          requestAnimationFrame(persigue);
        };
        requestAnimationFrame(persigue);
        Promise.resolve(o.descarga(p => { real = Math.max(real, Math.min(1, p)); }))
          .then(() => { real = 1; fin = true; });
      });

      estado = 'cerrando';
      await espera(280);
      if (!reduce) await tween(x, -40, 700, v => { x = v; dibuja(); });
      else { x = -40; dibuja(); }
      boton.classList.remove('is-cosida');
      boton.classList.add('is-lista');
      boton.removeAttribute('aria-busy');
      await espera(1700);
      boton.classList.remove('is-lista');
      estado = 'cerrada';
    }

    addEventListener('resize', anchoTela);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(anchoTela);
    boton.addEventListener('click', abre);
    return { abre, estado: () => estado };
  }

  window.Cremallera = Cremallera;
})();
