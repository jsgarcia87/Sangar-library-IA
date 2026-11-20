/* =====================================================================
   Resorte · Moxen
   Un botón con física de resorte: al pulsarlo se aplasta, al soltarlo
   rebota pasándose de largo y suelta una onda expansiva. Cuanto más rato
   se mantiene pulsado, más se carga y más fuerte es el rebote.

     Resorte(document.querySelector('.rs-boton'), { rigidez: 420, freno: 13 });

   Es un muelle de verdad (fuerza = -rigidez · desplazamiento - freno ·
   velocidad), integrado en pasos pequeños: así el rebote es el mismo a
   60 que a 120 Hz.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function Resorte(boton, opciones) {
    const o = Object.assign({
      rigidez: 420,     // más alto: rebota más rápido
      freno: 13,        // más alto: rebota menos veces
      carga: 650,       // ms pulsado hasta la carga completa
    }, opciones);

    // la onda va detrás del botón, en un envoltorio que no se deforma
    const sitio = document.createElement('span');
    sitio.className = 'rs-sitio';
    boton.replaceWith(sitio);
    sitio.appendChild(boton);

    /* Un solo número describe la deformación: p > 0 aplastado, p < 0
       estirado. El ancho compensa al alto, como una goma que conserva su
       volumen; por eso se aplasta hacia los lados y no solo encoge. */
    let p = 0, v = 0, meta = 0, pulsado = false, desde = 0, raf = 0, ultimo = null;

    function pinta() {
      boton.style.setProperty('--rs-y', (1 - p).toFixed(4));
      boton.style.setProperty('--rs-x', (1 + p * .55).toFixed(4));
    }

    function paso(ts) {
      if (ultimo === null) ultimo = ts;
      let dt = Math.min(.05, (ts - ultimo) / 1000);
      ultimo = ts;
      // mientras se aprieta, el resorte se va cargando poco a poco
      if (pulsado) meta = .1 + .11 * Math.min(1, Math.max(0, ts - desde) / o.carga);
      for (; dt > 0; dt -= 1 / 240) {
        const h = Math.min(dt, 1 / 240);
        v += (-o.rigidez * (p - meta) - o.freno * v) * h;
        p += v * h;
      }
      pinta();
      if (pulsado || Math.abs(v) > .002 || Math.abs(p - meta) > .0005) raf = requestAnimationFrame(paso);
      else { p = meta; pinta(); raf = 0; ultimo = null; }
    }
    const anda = () => { if (!raf) raf = requestAnimationFrame(paso); };

    function aprieta(e) {
      if (reduce || (e.button !== undefined && e.button > 0)) return;
      pulsado = true;
      desde = performance.now();
      v += 3;            // el golpe del dedo: se aplasta aunque el clic sea instantáneo
      anda();
    }

    function suelta() {
      if (!pulsado) return;
      pulsado = false;
      const carga = Math.max(.25, Math.min(1, p / .21));
      meta = 0;
      // la energía guardada sale de golpe: el botón se estira más allá
      v -= 4 + 7 * carga;
      onda(carga);
      anda();
    }

    function onda(fuerza) {
      [0, 110].forEach((retraso, i) => {
        const anillo = document.createElement('span');
        anillo.className = 'rs-onda';
        anillo.setAttribute('aria-hidden', 'true');
        sitio.insertBefore(anillo, boton);
        const lejos = (34 + 56 * fuerza) * (i ? .7 : 1);
        const r = parseFloat(getComputedStyle(boton).borderTopLeftRadius) || 0;
        anillo.animate([
          { inset: '0px', borderRadius: r + 'px', borderWidth: '3px', opacity: .55 },
          { inset: -lejos + 'px', borderRadius: (r + lejos) + 'px', borderWidth: '1px', opacity: 0 },
        ], { duration: 620 + 260 * fuerza, delay: retraso, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' })
          .finished.then(() => anillo.remove());
      });
    }

    boton.addEventListener('pointerdown', aprieta);
    addEventListener('pointerup', suelta);
    addEventListener('pointercancel', suelta);
    // con el teclado (Enter o espacio) también rebota
    boton.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat && !pulsado) aprieta(e); });
    boton.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') suelta(); });

    return { boton };
  }

  window.Resorte = Resorte;
})();
