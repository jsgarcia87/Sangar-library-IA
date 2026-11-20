/* =====================================================================
   Mazo · Moxen
   Una pila de tarjetas: la de arriba se arrastra hacia un lado —con el
   ratón o con el dedo— inclinándose como si la sujetaras por abajo, y
   aparece un sello de guardar o descartar. Si la sueltas lejos (o con
   impulso) sale volando y vuelve al fondo del mazo; si no, regresa con
   un resorte. Con el teclado, las flechas. Sin dependencias.

     Mazo(document.querySelector('[data-mazo]'), {
       alSoltar: (tarjeta, lado) => { … },     // lado: 1 guardar, -1 descartar
     });
   ===================================================================== */
(function () {
  'use strict';

  function Mazo(mazo, opciones) {
    const o = Object.assign({ umbral: 110, alSoltar: null }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let pila = Array.from(mazo.querySelectorAll('.mz-tarjeta'));
    pila.forEach(t => {
      t.insertAdjacentHTML('beforeend', '<span class="mz-sello mz-sello--si">Guardar</span><span class="mz-sello mz-sello--no">Descartar</span>');
    });

    /* El sitio de cada tarjeta en la pila: las de abajo asoman un poco
       más abajo, más pequeñas; de la cuarta en adelante no se ven. */
    const sitio = i => 'translateY(' + (i * 18) + 'px) scale(' + (1 - i * .055) + ')';
    function ordena() {
      pila.forEach((t, i) => {
        t.classList.toggle('is-arriba', i === 0);
        t.setAttribute('aria-hidden', String(i !== 0));
        // la que vuela va por encima de todas y no se toca hasta que sale
        if (t.classList.contains('is-volando')) { t.style.zIndex = pila.length + 1; return; }
        t.style.zIndex = pila.length - i;
        t.style.opacity = i < 3 ? 1 : 0;
        t.style.transform = sitio(i);
      });
    }

    /* La de arriba se sujeta por abajo: gira con lo que se aparta en x,
       y mientras se arrastra, la de debajo crece hacia su sitio. */
    function pinta(t, x, y, debajo) {
      const giro = x * .055;
      t.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) rotate(' + giro.toFixed(2) + 'deg)';
      const p = Math.min(1, Math.abs(x) / o.umbral);
      t.style.setProperty('--si', x > 0 ? p.toFixed(3) : 0);
      t.style.setProperty('--no', x < 0 ? p.toFixed(3) : 0);
      if (debajo) {
        debajo.style.transition = 'none';
        debajo.style.transform = 'translateY(' + (18 * (1 - p)) + 'px) scale(' + (1 - .055 * (1 - p)) + ')';
      }
    }

    // sale volando con su impulso; al salir de la vista pasa al fondo
    function vuela(t, x, y, vx, vy) {
      t.classList.add('is-volando');
      /* Sale hacia donde está si ya pasó el umbral; si no, hacia donde
         la lanzaron. Y nunca más lenta que 1700 px/s. */
      const lado = Math.abs(x) > o.umbral ? Math.sign(x) : Math.sign(vx) || 1;
      vx = lado * Math.max(Math.sign(vx) === lado ? Math.abs(vx) : 0, 1700);
      pila.push(pila.shift());
      pila.forEach(c => { if (c !== t) c.style.transition = ''; });
      if (o.alSoltar) o.alSoltar(t, lado);
      let previo = 0;
      const paso = ahora => {
        const dt = Math.min(.032, (ahora - (previo || ahora)) / 1000);
        previo = ahora;
        x += vx * dt; y += vy * dt; vy += 900 * dt;    // un poco de caída
        pinta(t, x, y);
        if (Math.abs(x) < innerWidth * .6 + 300) { requestAnimationFrame(paso); return; }
        // al fondo: sin transición, ya en su sitio de atrás y transparente…
        t.classList.remove('is-volando');
        t.style.transition = 'none';
        t.style.setProperty('--si', 0); t.style.setProperty('--no', 0);
        t.style.transform = sitio(pila.length - 1) + ' translateY(20px)';
        t.style.opacity = 0;
        void t.offsetWidth;
        // …y en el cuadro siguiente vuelven las transiciones, y aparece
        t.style.transition = '';
        ordena();
      };
      ordena();
      if (reduce) { x = lado * 9999; paso(0); return; }
      requestAnimationFrame(paso);
    }

    // vuelve a su sitio con un resorte que se pasa un poco
    function vuelve(t, x, y, vx, vy) {
      let previo = 0;
      const paso = ahora => {
        const dt = Math.min(.032, (ahora - (previo || ahora)) / 1000);
        previo = ahora;
        for (let i = 0; i < 4; i++) {
          const h = dt / 4;
          vx += (-220 * x - 16 * vx) * h; x += vx * h;
          vy += (-220 * y - 16 * vy) * h; y += vy * h;
        }
        pinta(t, x, y, pila[1]);
        if (Math.abs(x) + Math.abs(y) > .3 || Math.abs(vx) + Math.abs(vy) > 5) { requestAnimationFrame(paso); return; }
        t.style.setProperty('--si', 0); t.style.setProperty('--no', 0);
        pila.forEach(c => { c.style.transition = ''; });
        ordena();
      };
      requestAnimationFrame(paso);
    }

    let arrastre = null;
    mazo.addEventListener('pointerdown', e => {
      const t = pila[0];
      if (!t || !t.contains(e.target) || t.classList.contains('is-volando')) return;
      t.setPointerCapture(e.pointerId);
      t.classList.add('is-arrastrada');
      arrastre = { t, x0: e.clientX, y0: e.clientY, x: 0, y: 0, vx: 0, vy: 0, tt: performance.now() };
    });
    mazo.addEventListener('pointermove', e => {
      if (!arrastre) return;
      const a = arrastre, ahora = performance.now(), dt = Math.max(.008, (ahora - a.tt) / 1000);
      const x = e.clientX - a.x0, y = (e.clientY - a.y0) * .5;
      // la velocidad, suavizada, para decidir el impulso al soltar
      a.vx = a.vx * .6 + (x - a.x) / dt * .4; a.vy = a.vy * .6 + (y - a.y) / dt * .4;
      a.x = x; a.y = y; a.tt = ahora;
      pinta(a.t, x, y, pila[1]);
    });
    const suelta = () => {
      if (!arrastre) return;
      const a = arrastre;
      arrastre = null;
      a.t.classList.remove('is-arrastrada');
      if (Math.abs(a.x) > o.umbral || Math.abs(a.vx) > 900) vuela(a.t, a.x, a.y, a.vx, a.vy * .3);
      else vuelve(a.t, a.x, a.y, a.vx, a.vy);
    };
    mazo.addEventListener('pointerup', suelta);
    mazo.addEventListener('pointercancel', suelta);
    mazo.addEventListener('keydown', e => {
      const lado = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (lado && pila[0] && !pila[0].classList.contains('is-volando')) { e.preventDefault(); vuela(pila[0], 0, 0, lado * 1700, -200); }
    });

    ordena();
    return { pila: () => pila.slice() };
  }

  window.Mazo = Mazo;
})();
