/* =====================================================================
   Campana · Moxen
   Una campana de avisos que suena de verdad: cada aviso nuevo le da un
   empujón, la copa se balancea como un péndulo y el badajo, que cuelga
   suelto por dentro, se queda atrás hasta chocar con la pared. Cada
   choque lanza unas ondas. El contador sube con la cifra rodando hacia
   arriba. Sin dependencias.

     const c = Campana(document.querySelector('[data-campana]'));
     c.suma(1);     // llega un aviso: suena y sube el contador
     c.lee();       // se leen: el contador se va
   ===================================================================== */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  function Campana(boton, opciones) {
    const o = Object.assign({ fuerza: 3.3, cuenta: boton.querySelector('[data-cuenta]') }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const svg = boton.querySelector('svg');
    const cuerpo = boton.querySelector('.cm-cuerpo');
    const badajo = boton.querySelector('.cm-badajo');
    const caja = o.cuenta;
    let n = 0, cifra = null, pop = null;

    /* Dos péndulos colgados del mismo punto, en radianes: la copa (th) y el
       badajo (ph). La copa recibe el empujón; el badajo, por inercia, se
       queda atrás, y solo puede separarse de ella HOLGURA radianes: ahí
       está la pared, y ahí choca y rebota. */
    const K = 72, C = 1.15;       // copa: algo más de una oscilación por segundo
    const Kb = 40, Cb = .8;       // badajo: más lento y más suelto
    const HOLGURA = .27;
    let th = 0, w = 0, ph = 0, wp = 0, raf = 0, antes = 0, lado = 1, ultimoGolpe = -1e9;

    function ondas(s) {
      // dos arcos en el lado del golpe que se abren y se apagan
      [0, 1].forEach(i => {
        const p = document.createElementNS(NS, 'path');
        const x = 60 + s * (50 + i * 11), alto = 22 + i * 10;
        p.setAttribute('d', 'M' + x + ' ' + (54 - alto) + 'q' + (s * 11) + ' ' + alto + ' 0 ' + (alto * 2));
        p.setAttribute('class', 'cm-onda');
        p.style.setProperty('--cm-dx', (s * 12) + 'px');
        p.style.animationDelay = (i * 70) + 'ms';
        svg.appendChild(p);
        setTimeout(() => p.remove(), 900);
      });
    }

    function paso(t) {
      const dt = Math.min(.033, Math.max(0, (t - antes) / 1000)); antes = t;
      // cuatro subpasos: el choque con la pared necesita pasos cortos
      for (let i = 0; i < 4; i++) {
        const h = dt / 4;
        w += (-K * th - C * w) * h; th += w * h;
        wp += (-Kb * ph - Cb * wp) * h; ph += wp * h;
        const rel = ph - th;
        if (Math.abs(rel) > HOLGURA) {
          const s = Math.sign(rel), vr = wp - w;
          ph = th + s * HOLGURA;
          if (vr * s > 0) {
            // suena si el choque es fuerte y no acaba de sonar
            if (vr * s > 1.4 && t - ultimoGolpe > 160) { ultimoGolpe = t; ondas(s); }
            wp = w - vr * .35;
          }
        }
      }
      cuerpo.style.transform = 'rotate(' + th.toFixed(4) + 'rad)';
      badajo.style.transform = 'rotate(' + ph.toFixed(4) + 'rad)';
      const quieta = Math.abs(th) + Math.abs(w) + Math.abs(ph) + Math.abs(wp) < .002;
      raf = quieta ? 0 : requestAnimationFrame(paso);
    }

    function empuja(f) {
      if (reduce) return;
      w += lado * f;
      lado = -lado;            // la siguiente, hacia el otro lado
      if (!raf) { antes = performance.now(); raf = requestAnimationFrame(paso); }
    }

    /* La cifra nueva entra desde abajo mientras la vieja sale por arriba:
       el contador «sube» también a la vista. */
    function pinta(anterior) {
      const txt = n > 99 ? '99+' : String(n);
      boton.setAttribute('aria-label', n ? 'Avisos: ' + n + ' sin leer' : 'Avisos');
      if (!caja) return;
      const curva = 'cubic-bezier(.22, 1, .36, 1)';
      if (n && !anterior) {
        caja.textContent = ''; cifra = null;
        if (pop) pop.cancel();
        pop = caja.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.18)', offset: .55 }, { transform: 'scale(1)' }],
          { duration: reduce ? 1 : 520, easing: curva, fill: 'forwards' });
      } else if (!n && anterior) {
        if (pop) pop.cancel();
        pop = caja.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)', offset: .25 }, { transform: 'scale(0)' }],
          { duration: reduce ? 1 : 380, easing: 'ease-in', fill: 'forwards' });
        return;
      }
      const nueva = document.createElement('span');
      nueva.textContent = txt;
      caja.appendChild(nueva);
      if (cifra && !reduce) {
        const vieja = cifra;
        vieja.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-120%)', opacity: 0 }],
          { duration: 420, easing: curva, fill: 'forwards' });
        nueva.animate([{ transform: 'translateY(120%)' }, { transform: 'translateY(0)' }], { duration: 420, easing: curva });
        setTimeout(() => vieja.remove(), 440);
      } else if (cifra) cifra.remove();
      cifra = nueva;
    }

    function suma(k) {
      const antes = n;
      n = Math.max(0, n + (k == null ? 1 : k));
      pinta(antes);
      empuja(o.fuerza);
    }
    function lee() {
      const antes = n;
      n = 0;
      pinta(antes);
      empuja(.9);              // un saludo pequeño, sin llegar a sonar
    }

    boton.addEventListener('click', lee);
    // al pasar el cursor, un roce
    boton.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !raf) empuja(.8); });

    return { suma, lee, cuenta: () => n };
  }

  window.Campana = Campana;
})();
