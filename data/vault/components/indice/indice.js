/* =====================================================================
   Índice · Moxen
   Un índice lateral que sigue la lectura de un contenedor con scroll: cada
   entrada lleva su tramo de riel, que se llena mientras se lee esa sección,
   y un punto baja por el riel marcando dónde vas. Un clic en una entrada
   lleva a su sección. Sin dependencias.

     Indice(document.querySelector('[data-indice]'),
            document.querySelector('[data-indice-doc]'));

   La lista se arma sola con el <h2> de cada <section> del documento.
   ===================================================================== */
(function () {
  'use strict';

  function Indice(nav, doc, opciones) {
    const o = Object.assign({ suavidad: 9 }, opciones);   // más alto, más seco
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lista = nav.querySelector('ol');
    const total = nav.querySelector('[data-indice-total]');
    if (getComputedStyle(doc).position === 'static') doc.style.position = 'relative';

    const secciones = Array.from(doc.querySelectorAll('section')).map((sec, i) => {
      const li = document.createElement('li');
      li.className = 'ix-entrada';
      li.innerHTML = '<span class="ix-relleno"></span><button class="ix-boton" type="button"><small></small><span></span></button>';
      li.querySelector('small').textContent = String(i + 1).padStart(2, '0');
      li.querySelector('.ix-boton span').textContent = (sec.querySelector('h2, h3') || sec).textContent.trim();
      li.querySelector('.ix-boton').addEventListener('click', () => irA(sec));
      lista.appendChild(li);
      return { sec, li };
    });
    const cabezal = document.createElement('i');
    cabezal.className = 'ix-cabezal';
    cabezal.setAttribute('aria-hidden', 'true');
    nav.appendChild(cabezal);

    const max = () => Math.max(0, doc.scrollHeight - doc.clientHeight);

    /* La línea de lectura empieza arriba del todo y termina abajo del
       todo: baja más rápido que el scroll. Con una línea fija a media
       altura, las últimas secciones no llegarían nunca al 100 %. */
    function pinta() {
      const y = doc.scrollTop, m = max(), h = doc.clientHeight;
      const linea = y + (m ? y / m : 0) * h;
      let activa = secciones[0];
      secciones.forEach(s => {
        const a = s.sec.offsetTop, b = a + s.sec.offsetHeight;
        s.p = Math.min(1, Math.max(0, (linea - a) / (b - a)));
        if (linea >= a) activa = s;
        s.li.style.setProperty('--ix-p', s.p.toFixed(4));
        s.li.classList.toggle('is-leida', s.p >= 1);
      });
      secciones.forEach(s => s.li.classList.toggle('is-activa', s === activa));
      cabezal.style.setProperty('--ix-y', (activa.li.offsetTop + activa.p * activa.li.offsetHeight).toFixed(1) + 'px');
      if (total) total.textContent = Math.round(m ? y / m * 100 : 0) + ' %';
    }

    /* Scroll suave con la rueda: cada giro mueve una meta y el contenido
       la persigue con un freno exponencial. La posición se lleva aparte en
       decimales porque scrollTop redondea y el final se notaría a saltos. */
    let meta = doc.scrollTop, pos = meta, raf = 0, antes = 0;
    function corre(t) {
      raf = 0;
      const dt = antes ? Math.min((t - antes) / 1000, .05) : 1 / 60;
      antes = t;
      pos += (meta - pos) * (1 - Math.exp(-o.suavidad * dt));
      if (Math.abs(meta - pos) < .5) pos = meta;
      doc.scrollTop = pos;
      pinta();
      if (pos !== meta) raf = requestAnimationFrame(corre);
    }
    function arranca() {
      if (reduce) { doc.scrollTop = pos = meta; return; }
      if (!raf) { antes = 0; raf = requestAnimationFrame(corre); }
    }
    function irA(sec) {
      // la primera sección vuelve al principio del todo, con su portada
      meta = sec === secciones[0].sec ? 0 : Math.min(max(), Math.max(0, sec.offsetTop - 24));
      arranca();
    }

    doc.addEventListener('wheel', e => {
      if (e.ctrlKey) return;            // el zoom del trackpad, que pase
      e.preventDefault();
      const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? doc.clientHeight : 1;
      meta = Math.min(max(), Math.max(0, meta + e.deltaY * k));
      arranca();
    }, { passive: false });
    // el dedo, el teclado o la barra mandan: la meta se queda donde estén
    doc.addEventListener('scroll', () => { if (!raf) meta = pos = doc.scrollTop; pinta(); }, { passive: true });
    doc.addEventListener('pointerdown', () => { cancelAnimationFrame(raf); raf = 0; meta = pos = doc.scrollTop; });
    addEventListener('resize', pinta);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(pinta);
    pinta();

    return { irA: n => irA(secciones[n].sec), pinta };
  }

  window.Indice = Indice;
})();
