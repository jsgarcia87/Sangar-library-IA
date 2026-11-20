/* =====================================================================
   Odómetro · Moxen
   Números que giran como un cuentakilómetros: cada cifra es un tambor
   en 3D con sus diez caras, que rueda hacia delante hasta la nueva
   cifra. Las de la derecha dan más vueltas, se detienen de izquierda a
   derecha y al parar se pasan un pelo y se asientan, como un mecanismo.
   Las caras se apagan al girar hacia atrás. Sin dependencias.

     const odo = Odometro(el, { valor: 128493, cifras: 7, separador: '.' });
     odo.pon(131270);
   ===================================================================== */
(function () {
  'use strict';

  function Odometro(el, opciones) {
    const o = Object.assign({ valor: 0, cifras: 6, separador: '.', dura: 1500, escalon: 170 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PASO = 36;                                   // grados entre cara y cara

    // columnas de izquierda a derecha, con un punto cada tres cifras
    el.textContent = '';
    const cols = [];
    for (let j = 0; j < o.cifras; j++) {
      const desdeDcha = o.cifras - 1 - j;
      const col = document.createElement('span');
      col.className = 'od-col';
      col.setAttribute('aria-hidden', 'true');
      const rueda = document.createElement('span');
      rueda.className = 'od-rueda';
      const caras = Array.from({ length: 10 }, (_, d) => {
        const c = document.createElement('span');
        c.className = 'od-cara'; c.textContent = d;
        rueda.appendChild(c);
        return c;
      });
      col.appendChild(rueda);
      el.appendChild(col);
      cols.push({ col, rueda, caras, pos: 0, vel: 0, meta: 0, desde: 0, hasta: 0, t0: 0, dura: 0, desdeDcha });
      if (o.separador && desdeDcha && desdeDcha % 3 === 0) {
        const p = document.createElement('span');
        p.className = 'od-punto'; p.textContent = o.separador; p.setAttribute('aria-hidden', 'true');
        el.appendChild(p);
      }
    }

    /* El radio del tambor sale de la altura de una cara: diez caras de
       alto h forman un decágono de radio (h / 2) / tan(18°). */
    let radio = 0;
    function mide() {
      const h = cols[0].rueda.offsetHeight;
      radio = h / 2 / Math.tan(Math.PI / 10);
      cols.forEach(c => c.caras.forEach((cara, d) =>
        cara.style.transform = 'rotateX(' + (-d * PASO) + 'deg) translateZ(' + radio.toFixed(2) + 'px)'));
      cols.forEach(pinta);
    }

    // cada cara se apaga según lo que se aleja de mirar al frente
    function pinta(c) {
      const giro = c.pos * PASO;
      c.rueda.style.transform = 'translateZ(' + (-radio).toFixed(2) + 'px) rotateX(' + giro.toFixed(3) + 'deg)';
      c.caras.forEach((cara, d) => {
        let rel = ((d * PASO - giro) % 360 + 540) % 360 - 180;
        cara.style.opacity = Math.pow(Math.max(0, Math.cos(rel * Math.PI / 180)), 5).toFixed(3);
      });
    }

    let valor = 0, raf = 0, antes = 0;
    const cifrasDe = v => String(Math.max(0, Math.floor(v))).padStart(o.cifras, '0').slice(-o.cifras).split('').map(Number);
    const sale = t => 1 - Math.pow(1 - t, 4);

    /* Cada tambor tiene una meta que avanza con una curva que frena al
       final, y el tambor la persigue con un resorte firme y poco
       amortiguado: al llegar se pasa un poco y vuelve, como un trinquete. */
    function paso(t) {
      const dt = Math.min(.033, Math.max(0, (t - antes) / 1000)); antes = t;
      let moviendo = false;
      cols.forEach(c => {
        const u = Math.min(1, Math.max(0, (t - c.t0) / c.dura));
        c.meta = c.desde + (c.hasta - c.desde) * sale(u);
        c.vel += ((c.meta - c.pos) * 520 - c.vel * 26) * dt;
        c.pos += c.vel * dt;
        if (u < 1 || Math.abs(c.meta - c.pos) > .001 || Math.abs(c.vel) > .01) moviendo = true;
        else { c.pos = c.meta; c.vel = 0; }
        pinta(c);
      });
      raf = moviendo ? requestAnimationFrame(paso) : 0;
    }

    function pon(v, sinEfecto) {
      const ant = cifrasDe(valor), nue = cifrasDe(v);
      valor = Math.max(0, Math.floor(v));
      el.setAttribute('aria-label', valor.toLocaleString('es-CL'));
      const ahora = performance.now();
      let cero = true;
      cols.forEach((c, j) => {
        cero = cero && nue[j] === 0 && j < o.cifras - 1;
        c.col.classList.toggle('is-cero', cero);
        // siempre hacia delante: lo que falta hasta la cifra nueva, más vueltas
        const actual = ((Math.round(c.pos) % 10) + 10) % 10;
        let avance = (nue[j] - actual + 10) % 10;
        const cambia = ant.slice(0, j + 1).join('') !== nue.slice(0, j + 1).join('') || avance;
        if (cambia && !sinEfecto && !reduce) avance += 10 * Math.max(0, 3 - Math.floor(c.desdeDcha / 1.5));
        c.desde = c.pos; c.hasta = Math.round(c.pos) + avance;
        c.t0 = ahora; c.dura = o.dura + j * o.escalon;
        if (sinEfecto || reduce) { c.pos = c.meta = c.desde = c.hasta; c.vel = 0; pinta(c); }
      });
      if (!sinEfecto && !reduce && !raf) { antes = ahora; raf = requestAnimationFrame(paso); }
    }

    pon(o.valor, true);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(mide);
    mide();
    addEventListener('resize', mide, { passive: true });
    return { pon, valor: () => valor };
  }

  window.Odometro = Odometro;
})();
