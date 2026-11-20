/* =====================================================================
   Marcador · Moxen
   Un botón de guardar con una cinta de marcapáginas: al guardar, la
   cinta cae desde el canto, rebota como una tela con peso, se balancea y
   se rellena de tinta. Al quitarlo, se vacía y se recoge.

     const m = Marcador(document.querySelector('.mc-boton'), { hecho: 'Guardado' });
     m.guarda();      m.quita();      m.alterna();

   La caída y el balanceo son dos resortes: uno para el largo de la cinta
   y otro para su ángulo, colgada de su punto más alto.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ns = 'http://www.w3.org/2000/svg';
  let cuenta = 0;

  function Marcador(boton, opciones) {
    const o = Object.assign({
      hecho: boton.dataset.hecho || 'Guardado',
      ancho: 36,       // px de la cinta
      pico: 13,        // px de la muesca en V
      asoma: 34,       // px que cuelga por debajo del botón
      recogida: 15,    // px que se ve cuando no está guardado
    }, opciones);

    // las dos palabras, una encima de otra
    const texto = document.createElement('span');
    texto.className = 'mc-texto';
    texto.innerHTML = '<span></span><span></span>';
    texto.firstChild.textContent = boton.textContent.trim();
    texto.lastChild.textContent = o.hecho;
    boton.textContent = '';
    boton.appendChild(texto);
    boton.setAttribute('aria-pressed', 'false');

    /* La cinta: un trazado con la muesca abajo, y un degradado de corte
       seco que hace de nivel de tinta (por encima del corte, llena). */
    const id = 'mc-tinta-' + (++cuenta);
    const cinta = document.createElementNS(ns, 'svg');
    cinta.setAttribute('class', 'mc-cinta');
    cinta.setAttribute('aria-hidden', 'true');
    cinta.innerHTML =
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="currentColor"/><stop offset="0" stop-color="currentColor"/>' +
      '<stop offset="0" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>' +
      '<g><path fill="url(#' + id + ')"/></g>';
    cinta.style.color = 'var(--mc-cinta)';
    const grupo = cinta.querySelector('g'), trazo = cinta.querySelector('path');
    const [, s1, s2] = cinta.querySelectorAll('stop');
    boton.appendChild(cinta);

    let largo = o.recogida, vLargo = 0, meta = o.recogida;
    let ang = 0, vAng = 0, tinta = 0, metaTinta = 0, raf = 0, ultimo = null, guardado = false;
    const alto = () => boton.getBoundingClientRect().height;

    function dibuja() {
      const L = Math.max(1, largo), w = o.ancho, v = Math.min(o.pico, L * .6);
      trazo.setAttribute('d', 'M0 0H' + w + 'V' + L.toFixed(1) + 'L' + (w / 2) + ' ' + (L - v).toFixed(1) + 'L0 ' + L.toFixed(1) + 'Z');
      grupo.setAttribute('transform', 'rotate(' + ang.toFixed(2) + ' ' + (w / 2) + ' 0)');
      const f = Math.max(0, Math.min(1, tinta)).toFixed(3);
      s1.setAttribute('offset', f); s2.setAttribute('offset', f);
    }

    function paso(ts) {
      if (ultimo === null) ultimo = ts;
      let dt = Math.min(.05, (ts - ultimo) / 1000);
      ultimo = ts;
      for (; dt > 0; dt -= 1 / 240) {
        const h = Math.min(dt, 1 / 240);
        // el largo: un resorte flojo, para que la tela rebote un par de veces
        vLargo += (-230 * (largo - meta) - 9 * vLargo) * h; largo += vLargo * h;
        // el ángulo: un péndulo con poco freno
        vAng += (-60 * ang - 2.6 * vAng) * h; ang += vAng * h;
        // la tinta baja a velocidad constante, como si se empapara
        tinta += Math.sign(metaTinta - tinta) * Math.min(Math.abs(metaTinta - tinta), h * 2.6);
      }
      dibuja();
      const quieto = Math.abs(largo - meta) < .05 && Math.abs(vLargo) < .05 && Math.abs(ang) < .02 && Math.abs(vAng) < .02 && tinta === metaTinta;
      if (quieto) { raf = 0; ultimo = null; return; }
      raf = requestAnimationFrame(paso);
    }
    const anda = () => { if (!raf) raf = requestAnimationFrame(paso); };

    function guarda() {
      if (guardado) return;
      guardado = true;
      boton.classList.add('is-guardado');
      boton.setAttribute('aria-pressed', 'true');
      meta = alto() + o.asoma;
      if (reduce) { largo = meta; tinta = metaTinta = 1; return dibuja(); }
      vLargo = 190;          // sale con impulso: cae, no se desliza
      vAng = 26;             // y un empujón de lado para que se balancee
      metaTinta = 0;
      // la tinta, cuando ya ha caído
      setTimeout(() => { if (guardado) { metaTinta = 1; anda(); } }, 380);
      anda();
    }

    function quita() {
      if (!guardado) return;
      guardado = false;
      boton.classList.remove('is-guardado');
      boton.setAttribute('aria-pressed', 'false');
      if (reduce) { largo = meta = o.recogida; tinta = metaTinta = 0; return dibuja(); }
      metaTinta = 0;
      setTimeout(() => { if (!guardado) { meta = o.recogida; vAng = -12; anda(); } }, 260);
      anda();
    }

    const alterna = () => guardado ? quita() : guarda();
    boton.addEventListener('click', alterna);
    dibuja();
    return { guarda, quita, alterna, guardado: () => guardado };
  }

  window.Marcador = Marcador;
})();
