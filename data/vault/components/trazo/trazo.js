/* =====================================================================
   Trazo · Moxen
   Casillas de verificación dibujadas a mano: la caja es un cuadrado
   torcido, el ✓ se traza como con un lápiz —acelera, frena y se sale un
   poco de la caja— y después tacha el texto con una línea temblorosa.
   Cada casilla tiene su propio trazo, ninguna sale igual. Sin dependencias.

     Trazo(document.querySelector('[data-trazo]'), { cambia: n => … });

   Debajo siguen siendo <input type="checkbox"> normales: el teclado, los
   formularios y los lectores de pantalla funcionan como siempre.
   ===================================================================== */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  // azar con semilla: el trazo de cada casilla es siempre el mismo
  function azar(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  const f = n => n.toFixed(1);

  /* Un cuadrado de 44 × 44 hecho con cuatro curvas que se comban un poco;
     el último tramo se pasa del punto de partida, como cuando se cierra
     una figura a mano alzada. */
  function caja(r) {
    const j = (a) => a + (r() - .5) * 2.4;
    const p = [[j(6), j(6)], [j(38), j(6)], [j(38), j(38)], [j(6), j(38)]];
    let d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
    for (let k = 1; k <= 4; k++) {
      const a = p[k - 1], b = p[k % 4];
      const mx = (a[0] + b[0]) / 2 + (r() - .5) * 2.2, my = (a[1] + b[1]) / 2 + (r() - .5) * 2.2;
      d += ' Q' + f(mx) + ' ' + f(my) + ' ' + f(b[0]) + ' ' + f(b[1]);
    }
    return d + ' L' + f(p[0][0] + 5 + r() * 3) + ' ' + f(p[0][1] + (r() - .5) * 1.5);
  }
  // el ✓: un trazo corto hacia abajo y uno largo que sale por arriba
  function visto(r) {
    const a = [9 + r() * 5, 19 + r() * 6], b = [16 + r() * 5, 30 + r() * 4], c = [36 + r() * 8, 1 + r() * 7];
    return 'M' + f(a[0]) + ' ' + f(a[1]) + ' Q' + f(a[0] + 2 + r() * 4) + ' ' + f(a[1] + 3 + r() * 3) + ' ' + f(b[0]) + ' ' + f(b[1]) +
      ' Q' + f(b[0] + 5 + r() * 7) + ' ' + f(b[1] - 14 - r() * 8) + ' ' + f(c[0]) + ' ' + f(c[1]);
  }
  // la tachadura: una línea que ondula apenas y no termina donde empezó
  function tacha(r, w) {
    const y = () => 7 + (r() - .5) * 5;
    return 'M0 ' + f(y()) + ' C' + f(w * .18) + ' ' + f(y() - 2) + ' ' + f(w * .32) + ' ' + f(y() + 2) + ' ' + f(w * .5) + ' ' + f(y()) +
      ' S' + f(w * .84) + ' ' + f(y() - 2) + ' ' + f(w) + ' ' + f(y());
  }

  function svg(clase, vb) {
    const s = document.createElementNS(NS, 'svg');
    if (clase) s.setAttribute('class', clase);
    s.setAttribute('viewBox', vb);
    s.setAttribute('aria-hidden', 'true');
    return s;
  }
  function trazo(clase, d) {
    const p = document.createElementNS(NS, 'path');
    if (clase) p.setAttribute('class', clase);
    p.setAttribute('d', d);
    p.setAttribute('pathLength', '1');
    return p;
  }

  function Trazo(lista, opciones) {
    const o = Object.assign({ cambia: null, semilla: 11 }, opciones);
    const items = Array.from(lista.querySelectorAll('label')).map((label, i) => {
      const input = label.querySelector('input[type="checkbox"]');
      const texto = label.querySelector('.tz-texto');
      const r = azar(o.semilla + i * 97);
      const c = document.createElement('span');
      c.className = 'tz-caja';
      const s = svg('', '0 0 44 44');
      s.append(trazo('tz-borde', caja(r)), trazo('tz-visto', visto(r)));
      c.appendChild(s);
      input.after(c);
      const t = svg('tz-tacha', '0 0 100 14');
      t.setAttribute('preserveAspectRatio', 'none');
      const linea = trazo('', '');
      t.appendChild(linea);
      texto.appendChild(t);
      return { input, texto, t, linea, semilla: r() * 1e9 | 0 };
    });

    // la tachadura se rehace al ancho real del texto, cuando ya cargó la letra
    function mide() {
      items.forEach(it => {
        const w = it.texto.offsetWidth + 8;
        it.t.setAttribute('viewBox', '0 0 ' + w + ' 14');
        it.linea.setAttribute('d', tacha(azar(it.semilla), w));
      });
    }
    const cuenta = () => { if (o.cambia) o.cambia(items.filter(it => it.input.checked).length); };

    items.forEach(it => it.input.addEventListener('change', cuenta));
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(mide);
    addEventListener('resize', mide);
    mide();
    cuenta();
    return { mide };
  }

  window.Trazo = Trazo;
})();
