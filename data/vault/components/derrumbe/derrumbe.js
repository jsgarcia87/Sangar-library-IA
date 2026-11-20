/* =====================================================================
   Derrumbe · Moxen
   Un párrafo que se viene abajo: al pasar el cursor —o al tocarlo en el
   teléfono— cada letra se suelta y cae con física real hasta el suelo de
   su caja. Un toque entre las letras caídas las hace saltar, y rearma()
   las devuelve a su sitio.

     const d = Derrumbe(document.querySelector('.dr-texto'));
     d.cae();      d.rearma();      d.golpe(x, y);

   Usa Matter.js (MIT) para la física; va en el index.html desde cdnjs.
   Las letras originales no se mueven nunca: se ocultan dejando su hueco y
   caen unas copias. Así el párrafo no se descoloca y volver es exacto.
   ===================================================================== */
(function () {
  'use strict';

  function Derrumbe(parrafo, opciones) {
    const o = Object.assign({
      caja: parrafo.closest('[data-derrumbe-caja]') || parrafo.parentElement,
      radio: 120,          // px: hasta dónde llega un toque
      salto: 11,           // fuerza del salto (media)
    }, opciones);
    const M = window.Matter;
    const caja = o.caja;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Una <i> por letra y las de cada palabra en un <span> que no se parte:
       entre dos inline-block el navegador puede cortar la línea donde
       quiera, y saldría media palabra arriba y media abajo. */
    const letras = [];
    const texto = parrafo.textContent.trim();
    parrafo.textContent = '';
    texto.split(/\s+/).forEach((palabra, k) => {
      if (k) parrafo.appendChild(document.createTextNode(' '));
      const w = document.createElement('span');
      w.className = 'dr-palabra';
      Array.from(palabra).forEach(ch => {
        const i = document.createElement('i');
        i.className = 'dr-letra'; i.textContent = ch;
        w.appendChild(i); letras.push(i);
      });
      parrafo.appendChild(w);
    });

    // la capa donde caen las copias, del tamaño de la caja
    const capa = document.createElement('div');
    capa.className = 'dr-capa';
    capa.setAttribute('aria-hidden', 'true');
    caja.appendChild(capa);

    let estado = 'armado', motor = null, corredor = null, piezas = [], raf = 0;

    function pinta() {
      piezas.forEach(p => {
        const b = p.cuerpo;
        p.copia.style.transform = 'translate(' + (b.position.x - p.w / 2).toFixed(1) + 'px, '
          + (b.position.y - p.h / 2).toFixed(1) + 'px) rotate(' + b.angle.toFixed(3) + 'rad)';
      });
      raf = requestAnimationFrame(pinta);
    }

    function cae() {
      if (estado !== 'armado' || !M || reduce) return;
      estado = 'cayendo';
      const c = caja.getBoundingClientRect();
      /* La capa cuelga de la caja y no del párrafo: sin esto las copias
         heredarían la letra de la caja y caerían pequeñas. */
      const cs = getComputedStyle(parrafo);
      ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'color', 'textTransform']
        .forEach(k => { capa.style[k] = cs[k]; });
      const W = c.width, H = c.height, G = 200;

      motor = M.Engine.create();
      motor.gravity.y = 1;
      motor.positionIterations = 10;
      const fijo = { isStatic: true, friction: .8, restitution: .2 };
      M.Composite.add(motor.world, [
        M.Bodies.rectangle(W / 2, H + G / 2, W * 3, G, fijo),      // suelo
        M.Bodies.rectangle(-G / 2, H / 2, G, H * 3, fijo),         // paredes
        M.Bodies.rectangle(W + G / 2, H / 2, G, H * 3, fijo),
      ]);

      // se miden todas antes de tocar ninguna
      const datos = letras.map(l => {
        const r = l.getBoundingClientRect();
        return { l, x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2, w: r.width, h: r.height };
      });
      piezas = datos.map((d, i) => {
        const copia = d.l.cloneNode(true);
        copia.className = 'dr-copia';
        copia.style.width = d.w + 'px'; copia.style.height = d.h + 'px';
        const cuerpo = M.Bodies.rectangle(d.x, d.y, Math.max(d.w, 3), Math.max(d.h, 3),
          { restitution: .08, friction: .9, frictionStatic: 1.4, frictionAir: .016, density: .0025 });
        M.Body.setStatic(cuerpo, true);
        return Object.assign({}, d, { copia, cuerpo });
      });
      piezas.forEach(p => capa.appendChild(p.copia));
      M.Composite.add(motor.world, piezas.map(p => p.cuerpo));
      corredor = M.Runner.create();
      M.Runner.run(corredor, motor);
      pinta();

      // se sueltan de izquierda a derecha, casi a la vez
      piezas.forEach((p, i) => setTimeout(() => {
        p.l.style.visibility = 'hidden';
        M.Body.setStatic(p.cuerpo, false);
        M.Body.setVelocity(p.cuerpo, { x: (Math.random() - .5) * 4, y: -2 });
        M.Body.setAngularVelocity(p.cuerpo, (Math.random() - .5) * .25);
        if (i === piezas.length - 1) estado = 'caido';
      }, i * 12));
    }

    /* Un toque cerca de las letras caídas: saltan hacia arriba y se apartan
       del dedo, más cuanto más cerca. */
    function golpe(x, y) {
      if (estado !== 'caido') return;
      const c = caja.getBoundingClientRect();
      const px = x - c.left, py = y - c.top;
      piezas.forEach(p => {
        const b = p.cuerpo, dx = b.position.x - px, dy = b.position.y - py;
        const d = Math.hypot(dx, dy);
        if (d > o.radio) return;
        const f = 1 - d / o.radio, u = d || 1;
        M.Body.setVelocity(b, {
          x: b.velocity.x + dx / u * o.salto * .55 * f + (Math.random() - .5) * 2,
          y: Math.min(b.velocity.y, 0) - o.salto * (.45 + .55 * f),
        });
        M.Body.setAngularVelocity(b, (Math.random() - .5) * .45);
      });
    }

    // de vuelta a su hueco, con calma, y entonces reaparecen las de verdad
    function rearma() {
      if (estado !== 'caido') return;
      estado = 'volviendo';
      M.Runner.stop(corredor);
      cancelAnimationFrame(raf);
      piezas.forEach(p => {
        p.copia.style.transition = 'transform .75s cubic-bezier(.22, 1, .36, 1)';
        p.copia.style.transform = 'translate(' + (p.x - p.w / 2).toFixed(1) + 'px, '
          + (p.y - p.h / 2).toFixed(1) + 'px) rotate(0rad)';
      });
      setTimeout(() => {
        piezas.forEach(p => { p.copia.remove(); p.l.style.visibility = ''; });
        piezas = [];
        M.Engine.clear(motor);
        estado = 'armado';
      }, 780);
    }

    parrafo.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') cae(); });
    parrafo.addEventListener('click', cae);
    caja.addEventListener('pointerdown', e => golpe(e.clientX, e.clientY));

    return { cae, rearma, golpe, estado: () => estado };
  }

  window.Derrumbe = Derrumbe;
})();
