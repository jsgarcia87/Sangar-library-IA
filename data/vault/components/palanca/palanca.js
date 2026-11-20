/* =====================================================================
   Palanca · Moxen
   Un interruptor de palanca de los de antes, en 3D de verdad: la placa,
   el casquillo y la palanca están hechos con caras de CSS 3D, y cada
   cara se ilumina según hacia dónde mira, así que la palanca brilla
   distinto en cada posición. Se arrastra arriba y abajo, o un clic, o
   Espacio. Sin dependencias.

     const p = Palanca(document.querySelector('[data-palanca]'), {
       alCambiar: encendida => { … },
     });
     p.alterna();      p.encendida();
   ===================================================================== */
(function () {
  'use strict';

  const RAD = Math.PI / 180;
  // vectores: rotaciones como las de CSS (y hacia abajo, z hacia ti)
  const rx = (v, a) => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
  const ry = (v, a) => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
  const rz = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
  const punto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const unitario = v => { const n = Math.hypot(v[0], v[1], v[2]); return v.map(x => x / n); };

  // la luz viene de arriba a la izquierda y algo de frente
  const LUZ = unitario([-.72, -.42, .6]);
  const MEDIO = unitario([LUZ[0], LUZ[1], LUZ[2] + 1]);   // para el brillo del metal
  /* El brillo de una cara de metal: un poco de ambiente, la luz difusa y
     un reflejo muy concentrado, que es lo que la hace parecer cromada. */
  function metal(n) {
    const d = Math.max(0, punto(n, LUZ)), s = Math.pow(Math.max(0, punto(n, MEDIO)), 28);
    const g = Math.min(255, Math.round(52 + 150 * d + 200 * s));
    return 'rgb(' + g + ',' + g + ',' + (g + 2 > 255 ? 255 : g + 2) + ')';
  }

  function Palanca(placa, opciones) {
    const o = Object.assign({ angulo: 38, alCambiar: null }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // la inclinación de la placa, leída del CSS, para iluminar en el mismo espacio
    const m = new DOMMatrixReadOnly(getComputedStyle(placa).transform);
    const placaAMundo = v => [m.m11 * v[0] + m.m21 * v[1] + m.m31 * v[2], m.m12 * v[0] + m.m22 * v[1] + m.m32 * v[2], m.m13 * v[0] + m.m23 * v[1] + m.m33 * v[2]];
    const mundoAPlaca = v => [m.m11 * v[0] + m.m12 * v[1] + m.m13 * v[2], m.m21 * v[0] + m.m22 * v[1] + m.m23 * v[2], m.m31 * v[0] + m.m32 * v[1] + m.m33 * v[2]];

    const el = (clase, padre) => { const d = document.createElement('div'); d.className = clase; padre.appendChild(d); return d; };

    // el grosor: capas detrás de la cara, y una sombra más atrás aún
    const cara = placa.querySelector('.pl-cara');
    const sombra = el('pl-capa pl-capa--sombra', placa);
    sombra.style.transform = 'translateZ(-40px) translateY(26px)';
    for (let i = 8; i >= 1; i--) el('pl-capa', placa).style.transform = 'translateZ(' + (-i * 2) + 'px)';
    placa.appendChild(cara);
    const sombraPalanca = el('pl-sombra-palanca', placa);
    sombraPalanca.style.transform = 'translateZ(.5px)';

    /* Un cilindro hecho de gajos. A lo largo de y (la palanca) o de z (el
       casquillo, que sale de la placa). Cada gajo guarda su normal. */
    function cilindro(padre, r, largo, n, desde, eje) {
      const ancho = 2 * r * Math.tan(Math.PI / n) + .6, gajos = [];
      for (let i = 0; i < n; i++) {
        const a = i * 360 / n, g = el('pl-gajo', padre);
        g.style.width = ancho + 'px'; g.style.height = largo + 'px';
        g.style.left = -ancho / 2 + 'px';
        if (eje === 'y') {
          g.style.top = -(desde + largo) + 'px';
          g.style.transform = 'rotateY(' + a + 'deg) translateZ(' + r + 'px)';
          gajos.push({ g, n: [Math.sin(a * RAD), 0, Math.cos(a * RAD)] });
        } else {
          g.style.top = -largo / 2 + 'px';
          g.style.transform = 'rotateZ(' + a + 'deg) translateZ(' + (desde + largo / 2) + 'px) translateY(' + r + 'px) rotateX(-90deg)';
          gajos.push({ g, n: rz([0, 1, 0], a * RAD) });
        }
      }
      return gajos;
    }
    function tapa(padre, r, transform, clase) {
      const t = el('pl-tapa' + (clase ? ' ' + clase : ''), padre);
      t.style.width = t.style.height = 2 * r + 'px';
      t.style.left = t.style.top = -r + 'px';
      t.style.transform = transform;
      return t;
    }

    // el casquillo: quieto, se ilumina una vez
    const pieza = el('pl-pieza', placa);
    cilindro(pieza, 34, 14, 30, 0, 'z').forEach(c => { c.g.style.background = metal(placaAMundo(c.n)); });
    const boca = tapa(pieza, 34, 'translateZ(14px)');
    const nb = placaAMundo([0, 0, 1]);
    boca.style.background = 'radial-gradient(circle, #050505 0 11px, ' + metal(nb) + ' 12px, #6d6d6d 22px, ' + metal(nb) + ' 24px, #444 34px)';

    // la palanca: un eje que gira en x, con la varilla y el mango
    const eje = el('pl-eje', placa);
    const varilla = cilindro(eje, 10, 106, 18, 0, 'y');
    const mango = cilindro(eje, 15, 52, 24, 106, 'y');
    const punta = tapa(eje, 15, 'translateY(-158px) rotateX(90deg)');
    const caras = varilla.concat(mango);

    let encendida = false, ang = -o.angulo, vel = 0, meta = -o.angulo, raf = 0, previo = 0, arrastre = null;

    /* Pinta la palanca con su ángulo (0° = apunta a ti, + = hacia arriba):
       el eje gira en x y cada gajo se vuelve a iluminar. */
    function pinta() {
      const a = (ang - 90) * RAD;
      eje.style.transform = 'translateZ(12px) rotateX(' + (ang - 90).toFixed(2) + 'deg)';
      caras.forEach(c => { c.g.style.background = metal(placaAMundo(rx(c.n, a))); });
      punta.style.background = metal(placaAMundo(rx([0, -1, 0], a)));
      // la sombra: la punta proyectada sobre la placa, en contra de la luz
      const L = mundoAPlaca(LUZ), largo = 158;
      const tip = [0, -Math.sin(ang * RAD) * largo, Math.cos(ang * RAD) * largo + 12];
      const s = [tip[0] - L[0] * tip[2] / L[2], tip[1] - L[1] * tip[2] / L[2]];
      const d = Math.hypot(s[0], s[1]);
      sombraPalanca.style.height = d.toFixed(1) + 'px';
      sombraPalanca.style.transform = 'translateZ(.5px) rotate(' + (Math.atan2(-s[0], s[1]) / RAD).toFixed(2) + 'deg)';
    }

    function fija(valor) {
      encendida = valor;
      placa.classList.toggle('is-encendida', encendida);
      placa.setAttribute('aria-checked', String(encendida));
      if (o.alCambiar) o.alCambiar(encendida);
    }
    function alterna(valor) {
      fija(typeof valor === 'boolean' ? valor : !encendida);
      meta = encendida ? o.angulo : -o.angulo;
      if (reduce) { ang = meta; vel = 0; pinta(); return; }
      arranca();
    }

    /* Un resorte duro y poco amortiguado: llega, se pasa un pelo y
       rebota contra el tope, como el «clac» de un interruptor. */
    function paso(t) {
      const dt = Math.min(.032, (t - (previo || t)) / 1000);
      previo = t;
      if (!arrastre) {
        for (let i = 0; i < 4; i++) {
          const h = dt / 4;
          vel += (-900 * (ang - meta) - 26 * vel) * h;
          ang += vel * h;
          // el tope: la palanca no pasa de su ángulo, rebota
          if (Math.abs(ang) > o.angulo + 3) { ang = Math.sign(ang) * (o.angulo + 3); vel *= -.35; }
        }
      }
      pinta();
      if (!arrastre && Math.abs(ang - meta) < .02 && Math.abs(vel) < .2) { ang = meta; pinta(); raf = 0; previo = 0; return; }
      raf = requestAnimationFrame(paso);
    }
    const arranca = () => { if (!raf) raf = requestAnimationFrame(paso); };

    // arrastrar: lo vertical mueve la palanca; al soltar va al lado más cercano
    placa.addEventListener('pointerdown', e => {
      placa.setPointerCapture(e.pointerId);
      arrastre = { y: e.clientY, ang, movido: false };
      arranca();
    });
    placa.addEventListener('pointermove', e => {
      if (!arrastre) return;
      const dy = e.clientY - arrastre.y;
      if (Math.abs(dy) > 4) arrastre.movido = true;
      ang = Math.max(-o.angulo, Math.min(o.angulo, arrastre.ang - dy * .8));
      // pasa el punto medio: el interruptor cambia ahí, como uno real
      if (ang > 0 !== encendida && Math.abs(ang) > 2) { fija(ang > 0); meta = encendida ? o.angulo : -o.angulo; }
    });
    const suelta = () => {
      if (!arrastre) return;
      const movido = arrastre.movido;
      arrastre = null;
      if (!movido) alterna();
      else { meta = encendida ? o.angulo : -o.angulo; vel = 0; arranca(); }
    };
    placa.addEventListener('pointerup', suelta);
    placa.addEventListener('pointercancel', () => { arrastre = null; arranca(); });
    placa.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); alterna(); }
      if (e.key === 'ArrowUp') alterna(true);
      if (e.key === 'ArrowDown') alterna(false);
    });

    pinta();
    return { alterna, encendida: () => encendida };
  }

  window.Palanca = Palanca;
})();
