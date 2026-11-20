/* =====================================================================
   Estrellas · Moxen
   Una calificación con estrellas que se encienden en cascada: al pasar
   el cursor se prenden una detrás de otra hasta la que señalas y, si
   retrocedes, se apagan en orden inverso. Al elegir, un destello y una
   ola recorren las encendidas. Elegir la misma otra vez la borra.
   Sin dependencias.

     Estrellas(document.querySelector('[data-estrellas]'), { cambia: v => … });
   ===================================================================== */
(function () {
  'use strict';

  const ESTRELLA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.9l2.73 5.53 6.1.89-4.41 4.3 1.04 6.07L12 16.83l-5.46 2.87 1.04-6.07-4.41-4.3 6.1-.89z"/></svg>';

  function Estrellas(grupo, opciones) {
    const o = Object.assign({ paso: 60, cambia: null }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const n = parseInt(grupo.dataset.total, 10) || 5;
    const nombres = (grupo.dataset.etiquetas || '').split('|');
    const etiqueta = grupo.parentElement.querySelector('[data-estrellas-etiqueta]');

    const estrellas = Array.from({ length: n }, (_, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'et-estrella';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', (i + 1) + ' de ' + n + (nombres[i + 1] ? ': ' + nombres[i + 1] : ''));
      b.innerHTML = ESTRELLA;
      grupo.appendChild(b);
      return b;
    });

    let elegido = 0, mostrado = 0, quieta = -1;

    function dice(v) {
      if (!etiqueta || !nombres[v] || etiqueta.textContent === nombres[v]) return;
      etiqueta.textContent = nombres[v];
      etiqueta.classList.remove('is-nueva');
      void etiqueta.offsetWidth;
      etiqueta.classList.add('is-nueva');
    }

    /* Solo cambian las estrellas entre el valor de antes y el nuevo, y
       cada una espera su turno: hacia la derecha si suben, hacia la
       izquierda si bajan. El retraso va en una variable CSS para que la
       transición del relleno y el saltito queden sincronizados. */
    function enciende(v) {
      dice(v);
      if (v === mostrado) return;
      const sube = v > mostrado;
      estrellas.forEach((e, i) => {
        const k = i + 1;
        if (sube ? k <= mostrado || k > v : k <= v || k > mostrado) return;
        const r = (sube ? k - mostrado - 1 : mostrado - k) * o.paso;
        e.style.setProperty('--retraso', r + 'ms');
        e.classList.toggle('is-llena', sube);
        if (!reduce) e.querySelector('svg').animate(
          sube ? [{ transform: 'scale(1)' }, { transform: 'scale(1.24) rotate(-6deg)', offset: .4 }, { transform: 'scale(1)' }]
               : [{ transform: 'scale(1)' }, { transform: 'scale(.84)', offset: .4 }, { transform: 'scale(1)' }],
          { duration: 460, delay: r, easing: 'cubic-bezier(.34, 1.4, .64, 1)', fill: 'backwards' });
      });
      mostrado = v;
    }

    // el destello: unos rayos cortos que salen de la estrella elegida
    function destello(e) {
      if (reduce) return;
      const t = e.offsetWidth;
      for (let k = 0; k < 8; k++) {
        const r = document.createElement('i');
        r.className = 'et-rayo';
        e.appendChild(r);
        const a = k * 45 + 22.5;
        r.animate([
          { transform: 'rotate(' + a + 'deg) translateY(' + (-t * .5) + 'px) scaleY(.2)', opacity: 0 },
          { transform: 'rotate(' + a + 'deg) translateY(' + (-t * .62) + 'px) scaleY(1)', opacity: 1, offset: .3 },
          { transform: 'rotate(' + a + 'deg) translateY(' + (-t * .82) + 'px) scaleY(.2)', opacity: 0 },
        ], { duration: 620, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' });
        setTimeout(() => r.remove(), 700);
      }
      // y una ola por las encendidas, de la primera a la elegida
      estrellas.slice(0, elegido).forEach((s, i) => s.animate([
        { transform: 'translateY(0)' }, { transform: 'translateY(-14px)', offset: .4 }, { transform: 'translateY(0)' },
      ], { duration: 520, delay: i * 55, easing: 'cubic-bezier(.33, 0, .3, 1)' }));
    }

    function elige(v) {
      elegido = v === elegido ? 0 : v;    // la misma otra vez: se borra
      estrellas.forEach((e, i) => e.setAttribute('aria-checked', i + 1 === elegido ? 'true' : 'false'));
      enciende(elegido);
      if (elegido) destello(estrellas[elegido - 1]);
      if (o.cambia) o.cambia(elegido);
    }

    estrellas.forEach((e, i) => {
      // tras un clic, la vista previa espera a que el cursor cambie de estrella
      e.addEventListener('pointerenter', () => { if (i !== quieta) { quieta = -1; enciende(i + 1); } });
      e.addEventListener('click', () => { quieta = i; elige(i + 1); });
    });
    grupo.addEventListener('pointerleave', () => { quieta = -1; enciende(elegido); });
    grupo.addEventListener('keydown', ev => {
      const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[ev.key];
      if (!d) return;
      ev.preventDefault();
      const v = Math.min(n, Math.max(1, (elegido || (d > 0 ? 0 : 1)) + d));
      estrellas[v - 1].focus();
      elegido = 0;                         // para que elige() no lo tome como «la misma»
      elige(v);
    });

    estrellas.forEach(e => e.setAttribute('aria-checked', 'false'));
    return { elige, valor: () => elegido };
  }

  window.Estrellas = Estrellas;
})();
