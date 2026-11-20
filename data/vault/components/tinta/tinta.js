/* =====================================================================
   Tinta · Moxen
   Un texto que se revela con una mancha de tinta: al hacer clic cae una
   gota, salpica alrededor y se extiende con el borde irregular de la
   tinta en el papel; por donde pasa, el texto aparece entero. Otro clic,
   y la tinta se seca y se retira. Sin dependencias.

     <svg data-tinta viewBox="0 0 1200 520"><text x="600" y="150">…</text>…</svg>
     const t = Tinta(document.querySelector('[data-tinta]'));
     t.mancha(x, y);      // en coordenadas del SVG
     t.seca();

   La mancha es una máscara SVG: círculos que crecen, deformados por un
   ruido (feTurbulence + feDisplacementMap) que les da el borde de tinta.
   ===================================================================== */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const nuevo = (tipo, atr) => { const e = document.createElementNS(NS, tipo); for (const k in atr) e.setAttribute(k, atr[k]); return e; };
  const sale = t => 1 - Math.pow(1 - t, 3);

  function Tinta(svg, opciones) {
    const o = Object.assign({ crece: 1900, seca: 1100, borde: 46, gotas: 9, salpicaduras: 16 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const vb = svg.viewBox.baseVal;
    const id = 'tn' + Math.random().toString(36).slice(2, 7);

    // el texto original pasa a ser dos capas: el contorno de siempre y el relleno con máscara
    const textos = Array.from(svg.querySelectorAll('text'));
    const fantasma = nuevo('g', { class: 'tn-fantasma', 'aria-hidden': 'true' });
    const tinta = nuevo('g', { class: 'tn-tinta', mask: 'url(#' + id + '-m)', 'aria-hidden': 'true' });
    const huella = nuevo('rect', { class: 'tn-huella', x: vb.x - 200, y: vb.y - 200, width: vb.width + 400, height: vb.height + 400 });
    tinta.appendChild(huella);
    textos.forEach(t => { fantasma.appendChild(t.cloneNode(true)); tinta.appendChild(t); });

    /* El ruido desplaza los bordes de los círculos hasta `borde` px: así
       una suma de círculos lisos se convierte en una mancha que se corre. */
    const defs = nuevo('defs', {});
    defs.innerHTML =
      '<filter id="' + id + '-f" filterUnits="userSpaceOnUse" x="' + (vb.x - 300) + '" y="' + (vb.y - 300) + '" width="' + (vb.width + 600) + '" height="' + (vb.height + 600) + '">'
      + '<feTurbulence type="fractalNoise" baseFrequency=".012 .016" numOctaves="3" seed="7" result="r"/>'
      + '<feDisplacementMap in="SourceGraphic" in2="r" scale="' + o.borde + '" xChannelSelector="R" yChannelSelector="G"/></filter>'
      + '<mask id="' + id + '-m" maskUnits="userSpaceOnUse" x="' + (vb.x - 300) + '" y="' + (vb.y - 300) + '" width="' + (vb.width + 600) + '" height="' + (vb.height + 600) + '">'
      + '<g fill="#fff" filter="url(#' + id + '-f)"></g></mask>';
    const manchas = defs.querySelector('mask g');
    svg.append(defs, fantasma, tinta);

    let gotas = [], estado = 'seca', raf = 0;

    /* Una mancha son tres cosas: la gota principal, unas gotas vecinas que
       crecen con retraso (por eso no es un círculo) y salpicaduras finas
       que aparecen al instante, lejos, y luego quedan dentro. */
    function mancha(x, y) {
      manchas.textContent = ''; gotas = [];
      const lejos = Math.max(Math.hypot(x - vb.x, y - vb.y), Math.hypot(x - vb.x - vb.width, y - vb.y),
        Math.hypot(x - vb.x, y - vb.y - vb.height), Math.hypot(x - vb.x - vb.width, y - vb.y - vb.height)) + 80;
      const pon = (cx, cy, r, retraso, dura) => {
        const c = nuevo('circle', { cx, cy, r: 0 });
        manchas.appendChild(c);
        gotas.push({ c, r, retraso, dura, actual: 0 });
      };
      pon(x, y, lejos, 0, o.crece);
      for (let i = 0; i < o.gotas; i++) {
        const a = Math.random() * Math.PI * 2, d = lejos * (.18 + Math.random() * .42);
        pon(x + Math.cos(a) * d, y + Math.sin(a) * d, lejos * (.22 + Math.random() * .3), 120 + Math.random() * 520, o.crece * (.7 + Math.random() * .4));
      }
      for (let i = 0; i < o.salpicaduras; i++) {
        const a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 300;
        pon(x + Math.cos(a) * d, y + Math.sin(a) * d, 4 + Math.random() * 15, Math.random() * 90, 240);
      }
      estado = 'llena';
      arranca(performance.now(), false);
    }

    // al secarse cada gota se encoge sobre sí misma: la mancha se retira por islas
    function seca() {
      if (estado !== 'llena') return;
      estado = 'secando';
      arranca(performance.now(), true);
    }

    let t0 = 0, encoge = false;
    function arranca(t, hacia) {
      t0 = t; encoge = hacia;
      gotas.forEach(g => { g.desde = g.actual; });
      if (reduce) { gotas.forEach(g => { g.actual = encoge ? 0 : g.r; g.c.setAttribute('r', g.actual); }); if (encoge) estado = 'seca'; return; }
      if (!raf) raf = requestAnimationFrame(paso);
    }
    function paso(t) {
      let viva = false;
      gotas.forEach((g, i) => {
        if (encoge) {
          const u = Math.min(1, Math.max(0, (t - t0 - (i % 5) * 60) / o.seca));
          g.actual = g.desde * (1 - u * u);              // ease-in: arranca despacio y se va de golpe
          if (u < 1) viva = true;
        } else {
          const u = Math.min(1, Math.max(0, (t - t0 - g.retraso) / g.dura));
          g.actual = g.desde + (g.r - g.desde) * sale(u);
          if (u < 1) viva = true;
        }
        g.c.setAttribute('r', g.actual.toFixed(1));
      });
      /* La huella gris se ve mientras la tinta corre y el papel la absorbe
         al terminar: así se ve la forma de la mancha sin que acabe tiñendo
         toda la página. Al secarse vuelve a marcar las islas que quedan. */
      const u = Math.min(1, Math.max(0, (t - t0) / (encoge ? o.seca : o.crece)));
      huella.setAttribute('opacity', (encoge ? .2 + .55 * u : 1 - .8 * sale(u)).toFixed(3));
      if (encoge && !viva) estado = 'seca';
      raf = viva ? requestAnimationFrame(paso) : 0;
    }

    svg.addEventListener('click', e => {
      if (estado === 'llena') return seca();
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
      mancha(p.x, p.y);
    });

    return { mancha, seca, estado: () => estado };
  }

  window.Tinta = Tinta;
})();
