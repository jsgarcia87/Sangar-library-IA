/* =====================================================================
   Brinco · Moxen
   Botones de opción donde el punto no aparece en la nueva opción: salta
   hasta ella. Se agacha antes de despegar, vuela en parábola estirándose
   en la dirección del vuelo, aterriza aplastándose y rebota hasta quedar
   quieto. El aro de salida cede y el de llegada recibe el golpe.
   Sin dependencias.

     Brinco(document.querySelector('[data-brinco]'), { cambia: valor => … });

   Debajo son <input type="radio"> normales: las flechas del teclado y los
   formularios funcionan como siempre.
   ===================================================================== */
(function () {
  'use strict';

  const AGACHA = 90, ATERRIZA = 300;   // ms antes y después del vuelo

  function Brinco(grupo, opciones) {
    const o = Object.assign({ cambia: null, alto: 150 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const etiquetas = Array.from(grupo.querySelectorAll('label'));
    const radios = etiquetas.map(l => l.querySelector('input[type="radio"]'));
    const aros = etiquetas.map(l => l.querySelector('.br-aro'));
    const punto = document.createElement('span'), sombra = document.createElement('span');
    punto.className = 'br-punto'; sombra.className = 'br-sombra';
    grupo.append(sombra, punto);

    let actual = Math.max(0, radios.findIndex(r => r.checked));
    let x = 0, y = 0, salto = null, raf = 0;

    // el centro de cada aro, sin contar transformaciones: así no le afecta su propio rebote
    function centro(i) {
      const a = aros[i], l = etiquetas[i];
      return [l.offsetLeft + a.offsetLeft + a.offsetWidth / 2, l.offsetTop + a.offsetTop + a.offsetHeight / 2];
    }
    function pinta(px, py, forma) {
      x = px; y = py;
      punto.style.transform = 'translate(' + px.toFixed(2) + 'px, ' + py.toFixed(2) + 'px) ' + (forma || '');
    }
    function marca(i) { etiquetas.forEach((l, k) => l.classList.toggle('is-elegida', k === i)); }

    function paso(t) {
      raf = 0;
      const s = salto;
      if (!s.t0) s.t0 = t;
      const e = t - s.t0, [x0, y0] = s.desde, [x1, y1] = s.hasta;
      if (e < AGACHA) {
        // se agacha: más ancho y más bajo, tomando impulso
        const k = Math.sin(Math.PI / 2 * e / AGACHA) * .38;
        pinta(x0, y0 + 2 * k, 'scale(' + (1 + k) + ', ' + (1 - k) + ')');
      } else if (e < AGACHA + s.dura) {
        /* El vuelo: x avanza parejo y la altura sigue una parábola, como
           algo lanzado. La forma se estira en la dirección de la
           velocidad, y la sombra se achica y se aclara al subir. */
        if (!s.despego) { s.despego = true; aros[s.de].animate([{ transform: 'scale(1)' }, { transform: 'scale(.82)', offset: .35 }, { transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' }); }
        const u = (e - AGACHA) / s.dura, h = 4 * s.alto * u * (1 - u);
        const px = x0 + (x1 - x0) * u, py = y0 + (y1 - y0) * u - h;
        const vx = (x1 - x0), vy = (y1 - y0) - 4 * s.alto * (1 - 2 * u);
        const ang = Math.atan2(vy, vx) * 180 / Math.PI;
        const est = 1 + Math.min(.55, Math.hypot(vx, vy) / s.dura * .32);
        pinta(px, py, 'rotate(' + ang.toFixed(1) + 'deg) scale(' + est.toFixed(3) + ', ' + (1 / Math.sqrt(est)).toFixed(3) + ') rotate(' + (-ang).toFixed(1) + 'deg)');
        const alto = h / s.alto;
        sombra.style.opacity = (.32 * (1 - .7 * alto)).toFixed(3);
        sombra.style.transform = 'translate(' + px.toFixed(2) + 'px, ' + (y0 + (y1 - y0) * u + 12).toFixed(2) + 'px) scale(' + (1 - .5 * alto).toFixed(3) + ')';
      } else if (e < AGACHA + s.dura + ATERRIZA) {
        if (!s.aterrizo) {
          s.aterrizo = true;
          sombra.style.opacity = 0;
          marca(s.a);
          aros[s.a].animate([{ transform: 'scale(1)' }, { transform: 'scale(1.24)', offset: .3 }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.34, 1.4, .64, 1)' });
        }
        // aterriza aplastado y rebota cada vez menos hasta quedar redondo
        const v = (e - AGACHA - s.dura) / ATERRIZA, q = Math.exp(-5 * v) * Math.cos(3 * Math.PI * v) * .42;
        pinta(x1, y1 + 2 * Math.max(0, q), 'scale(' + (1 + q) + ', ' + (1 - q) + ')');
      } else {
        pinta(x1, y1);
        salto = null;
        return;
      }
      raf = requestAnimationFrame(paso);
    }

    function salta(i) {
      if (i === actual && !salto) return;
      const de = actual, desde = salto ? [x, y] : centro(de), hasta = centro(i);
      actual = i;
      if (reduce) { pinta(hasta[0], hasta[1]); marca(i); return; }
      const d = Math.abs(hasta[0] - desde[0]);
      salto = {
        de, a: i, desde, hasta, t0: 0,
        dura: Math.min(700, Math.max(360, 300 + d * .45)),
        alto: Math.min(o.alto, 40 + d * .16),
      };
      if (!raf) raf = requestAnimationFrame(paso);
    }

    radios.forEach((r, i) => r.addEventListener('change', () => {
      if (!r.checked) return;
      salta(i);
      if (o.cambia) o.cambia(r.value);
    }));
    addEventListener('resize', () => { if (!salto) { const c = centro(actual); pinta(c[0], c[1]); } });

    const c = centro(actual);
    pinta(c[0], c[1]);
    marca(actual);
    return { salta: i => { radios[i].checked = true; radios[i].dispatchEvent(new Event('change')); } };
  }

  window.Brinco = Brinco;
})();
