/* =====================================================================
   Dock · Moxen
   Una barra de íconos que se agrandan al pasar el cursor: el más cercano
   crece más y los vecinos lo acompañan, como una lupa que recorre la barra.
   En el teléfono funciona igual arrastrando el dedo. Sin dependencias.

     Dock(document.querySelector('[data-dock]'), { aumento: 1.9, alcance: 190 });

   Cada ícono tiene su propio resorte: no salta a su tamaño, lo alcanza con
   un pequeño rebote, y así la ola se ve continua aunque el cursor vaya
   rápido.
   ===================================================================== */
(function () {
  'use strict';

  function Dock(dock, opciones) {
    const o = Object.assign({
      aumento: 1.9,    // tamaño del ícono bajo el cursor (× el de reposo)
      alcance: 190,    // px: hasta dónde llega la lupa a cada lado
      rigidez: 420,    // el resorte de cada ícono
      freno: 30,
    }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const base = () => parseFloat(getComputedStyle(dock).getPropertyValue('--dk-tam')) || 72;
    const iconos = Array.from(dock.querySelectorAll('[data-dock-item]')).map(el => ({ el, x: 0, v: 0, meta: 0, off: 0 }));

    let px = null, raf = 0, antes = 0;

    /* La distancia se mide contra la posición de reposo de cada ícono, no
       contra la actual: si se midiera la actual, al crecer un ícono empuja
       a los demás, cambia su distancia al cursor y la barra tiembla. La
       barra crece igual hacia los dos lados, así que su centro no se mueve
       y basta guardar cada ícono como un desplazamiento desde ese centro. */
    function mide() {
      const b = base();
      iconos.forEach(i => { i.el.style.width = i.el.style.height = ''; i.x = i.meta = b; i.v = 0; });
      const r = dock.getBoundingClientRect(), c = r.left + r.width / 2;
      iconos.forEach(i => { const q = i.el.getBoundingClientRect(); i.off = q.left + q.width / 2 - c; });
    }

    function apunta() {
      const b = base(), r = dock.getBoundingClientRect(), c = r.left + r.width / 2;
      let cerca = null, mejor = 0;
      iconos.forEach(i => {
        let f = 0;
        if (px !== null && !reduce) {
          const d = Math.abs(px - (c + i.off));
          // coseno elevado: suave en el centro y llega a cero sin escalón
          if (d < o.alcance) f = (1 + Math.cos(Math.PI * d / o.alcance)) / 2;
        }
        i.meta = b * (1 + (o.aumento - 1) * f);
        if (px !== null) {
          const d = Math.abs(px - (c + i.off));
          if (cerca === null || d < mejor) { cerca = i; mejor = d; }
        }
      });
      iconos.forEach(i => i.el.classList.toggle('is-cerca', i === cerca && mejor < b));
      if (!raf) { antes = 0; raf = requestAnimationFrame(paso); }
    }

    function paso(t) {
      raf = 0;
      const dt = antes ? Math.min((t - antes) / 1000, 1 / 30) : 1 / 60;
      antes = t;
      let quieto = true;
      if (dt > 0) {
        // pasos cortos: un resorte rígido con un paso largo se dispara
        const n = Math.ceil(dt / (1 / 240)), h = dt / n;
        iconos.forEach(i => {
          for (let k = 0; k < n; k++) {
            i.v += (o.rigidez * (i.meta - i.x) - o.freno * i.v) * h;
            i.x += i.v * h;
          }
          if (Math.abs(i.meta - i.x) > .05 || Math.abs(i.v) > .05) quieto = false;
          else { i.x = i.meta; i.v = 0; }
          i.el.style.width = i.el.style.height = i.x.toFixed(2) + 'px';
        });
      } else quieto = false;
      if (!quieto) raf = requestAnimationFrame(paso);
    }

    // un salto corto al abrir, como quien llama la atención
    function abre(i) {
      i.el.classList.add('is-abierto');
      if (reduce) return;
      i.el.querySelector('.dk-icono').animate([
        { transform: 'translateY(0)' },
        { transform: 'translateY(-34%)', offset: .28 },
        { transform: 'translateY(0)', offset: .56 },
        { transform: 'translateY(-12%)', offset: .76 },
        { transform: 'translateY(0)' },
      ], { duration: 720, easing: 'cubic-bezier(.33, 0, .3, 1)' });
    }

    dock.addEventListener('pointermove', e => { px = e.clientX; apunta(); });
    dock.addEventListener('pointerdown', e => { px = e.clientX; apunta(); });
    dock.addEventListener('pointerleave', () => { px = null; apunta(); });
    // con el dedo, al levantarlo la barra vuelve a su sitio
    dock.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') { px = null; apunta(); } });
    dock.addEventListener('pointercancel', () => { px = null; apunta(); });
    iconos.forEach(i => i.el.addEventListener('click', () => abre(i)));
    addEventListener('resize', () => { if (px === null) mide(); });

    mide();
    return { abre: n => abre(iconos[n]), mide };
  }

  window.Dock = Dock;
})();
