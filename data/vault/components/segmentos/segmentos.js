/* =====================================================================
   Segmentos · Moxen
   Un control segmentado: una píldora se desliza con un resorte hasta la
   opción elegida y, al pasar, invierte el color del texto letra a letra
   —una palabra a medio cubrir sale mitad de cada color—. Teclado con
   flechas incluido. Sin dependencias.

     Segmentos(document.querySelector('[data-segmentos]'), {
       cambia: i => console.log('opción', i),
     });
   ===================================================================== */
(function () {
  'use strict';

  function Segmentos(control, opciones) {
    const o = Object.assign({ rigidez: 360, freno: 29, cambia: null }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const botones = Array.from(control.querySelectorAll('[role="tab"], button'));

    const pildora = document.createElement('span');
    pildora.className = 'sg-pildora';
    control.prepend(pildora);
    // la copia de los textos que solo se ve dentro de la píldora
    const tinta = document.createElement('div');
    tinta.className = 'sg-tinta';
    tinta.setAttribute('aria-hidden', 'true');
    botones.forEach(b => { const s = document.createElement('span'); s.textContent = b.textContent; tinta.appendChild(s); });
    control.appendChild(tinta);

    let actual = Math.max(0, botones.findIndex(b => b.getAttribute('aria-selected') === 'true'));
    const m = { x: 0, w: 0, vx: 0, vw: 0, mx: 0, mw: 0 };
    let raf = 0, antes = 0;

    function dibuja() {
      // un aplastón leve con la velocidad: se nota que lleva inercia
      const s = 1 - Math.min(.14, Math.abs(m.vx) / 9000);
      const alto = pildora.offsetHeight, hueco = pildora.offsetTop + alto * (1 - s) / 2;
      pildora.style.width = m.w.toFixed(2) + 'px';
      pildora.style.transform = 'translateX(' + m.x.toFixed(2) + 'px) scaleY(' + s.toFixed(3) + ')';
      const der = control.clientWidth - m.x - m.w;
      tinta.style.clipPath = 'inset(' + hueco.toFixed(2) + 'px ' + der.toFixed(2) + 'px ' + hueco.toFixed(2) + 'px ' + m.x.toFixed(2) + 'px round 99px)';
    }

    function paso(t) {
      raf = 0;
      const dt = antes ? Math.min((t - antes) / 1000, 1 / 30) : 1 / 60;
      antes = t;
      if (dt > 0) {
        const n = Math.ceil(dt / (1 / 240)), h = dt / n;
        for (let k = 0; k < n; k++) {
          m.vx += (o.rigidez * (m.mx - m.x) - o.freno * m.vx) * h; m.x += m.vx * h;
          m.vw += (o.rigidez * (m.mw - m.w) - o.freno * m.vw) * h; m.w += m.vw * h;
        }
      }
      const quieto = Math.abs(m.mx - m.x) < .05 && Math.abs(m.vx) < .5 && Math.abs(m.mw - m.w) < .05 && Math.abs(m.vw) < .5;
      if (quieto) { m.x = m.mx; m.w = m.mw; m.vx = m.vw = 0; }
      dibuja();
      if (!quieto) raf = requestAnimationFrame(paso);
    }

    function elige(i, sinMover) {
      actual = i;
      botones.forEach((b, k) => {
        b.setAttribute('aria-selected', k === i ? 'true' : 'false');
        b.tabIndex = k === i ? 0 : -1;
      });
      m.mx = botones[i].offsetLeft; m.mw = botones[i].offsetWidth;
      if (sinMover || reduce) { m.x = m.mx; m.w = m.mw; m.vx = m.vw = 0; dibuja(); }
      else if (!raf) { antes = 0; raf = requestAnimationFrame(paso); }
    }

    botones.forEach((b, i) => b.addEventListener('click', () => {
      if (i === actual) return;
      elige(i);
      if (o.cambia) o.cambia(i);
    }));
    control.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const i = (actual + d + botones.length) % botones.length;
      botones[i].focus();
      botones[i].click();
    });
    addEventListener('resize', () => elige(actual, true));

    elige(actual, true);
    return { elige: i => botones[i].click(), actual: () => actual };
  }

  window.Segmentos = Segmentos;
})();
