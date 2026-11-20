/* =====================================================================
   Chicle · Moxen
   Un interruptor con el botón de goma: al cambiar de lado, la punta sale
   primero y la cola llega después, así el botón se estira, se adelgaza
   y al llegar se aplasta un poco antes de quedar redondo. Al mantenerlo
   presionado ya se inclina hacia el otro lado, y se puede arrastrar.
   Sin dependencias.

     document.querySelectorAll('[data-chicle]').forEach(b => Chicle(b, {
       cambia: encendido => …,
     }));
   ===================================================================== */
(function () {
  'use strict';

  // la punta es rápida; la cola, blanda y con algo de rebote
  const PUNTA = { k: 720, c: 40 }, COLA = { k: 160, c: 13.5 };

  function Chicle(boton, opciones) {
    const o = Object.assign({ cambia: null, tira: 12 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bola = document.createElement('span');
    bola.className = 'ch-bola';
    boton.appendChild(bola);

    const margen = () => parseFloat(getComputedStyle(boton).getPropertyValue('--ch-margen')) || 7;
    const diam = () => boton.clientHeight - 2 * margen();
    let on = boton.getAttribute('aria-checked') === 'true';
    const izq = { x: 0, v: 0, meta: 0, par: COLA }, der = { x: 0, v: 0, meta: 0, par: COLA };
    let raf = 0, antes = 0;

    // dónde deben quedar los dos bordes en cada lado
    function reposo() {
      const m = margen(), d = diam(), w = boton.clientWidth;
      return on ? [w - m - d, w - m] : [m, m + d];
    }

    /* El alto sale del ancho: si se estira, adelgaza; si se aplasta,
       engorda. Es la raíz del cociente, que a ojo conserva el volumen. */
    function dibuja() {
      const d = diam(), w = der.x - izq.x;
      const h = Math.max(d * .62, Math.min(d * 1.18, d * Math.sqrt(d / Math.max(1, w))));
      bola.style.width = w.toFixed(2) + 'px';
      bola.style.height = h.toFixed(2) + 'px';
      bola.style.transform = 'translate(' + izq.x.toFixed(2) + 'px, -50%)';
    }

    function paso(t) {
      raf = 0;
      const dt = antes ? Math.min((t - antes) / 1000, 1 / 30) : 1 / 60;
      antes = t;
      if (dt > 0) {
        const n = Math.ceil(dt / (1 / 240)), h = dt / n, d = diam();
        for (let s = 0; s < n; s++) {
          [izq, der].forEach(b => { b.v += (b.par.k * (b.meta - b.x) - b.par.c * b.v) * h; b.x += b.v * h; });
          // nunca más angosto que tres cuartos de su diámetro
          if (der.x - izq.x < d * .75) { const c = (der.x + izq.x) / 2; izq.x = c - d * .375; der.x = c + d * .375; }
        }
        dibuja();
      }
      const quieto = [izq, der].every(b => Math.abs(b.meta - b.x) < .05 && Math.abs(b.v) < .5);
      if (quieto) { izq.x = izq.meta; der.x = der.meta; izq.v = der.v = 0; dibuja(); }
      else raf = requestAnimationFrame(paso);
    }
    function anima() {
      if (reduce) { izq.x = izq.meta; der.x = der.meta; dibuja(); return; }
      if (!raf) { antes = 0; raf = requestAnimationFrame(paso); }
    }

    // el borde que mira hacia donde va es la punta; el otro, la cola
    function apunta(haciaOn) {
      der.par = haciaOn ? PUNTA : COLA;
      izq.par = haciaOn ? COLA : PUNTA;
    }

    function pon(valor) {
      const previo = on;
      on = valor;
      boton.setAttribute('aria-checked', on ? 'true' : 'false');
      apunta(on);
      [izq.meta, der.meta] = reposo();
      anima();
      if (o.cambia && on !== previo) o.cambia(on);
    }

    /* Presionar: la punta ya tira hacia el otro lado. Arrastrar: la punta
       sigue al dedo y la cola se queda, como goma; al soltar, gana el
       lado donde quedó el centro. */
    let x0 = null, arrastra = false, ignora = false;
    boton.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      try { boton.setPointerCapture(e.pointerId); } catch (err) {}
      x0 = e.clientX; arrastra = false;
      apunta(!on);
      const [a, b] = reposo();
      if (on) izq.meta = a - o.tira; else der.meta = b + o.tira;
      anima();
    });
    boton.addEventListener('pointermove', e => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      if (!arrastra && Math.abs(dx) < 4) return;
      arrastra = true;
      const m = margen(), w = boton.clientWidth, [a, b] = reposo();
      if (on) izq.meta = Math.max(m, Math.min(a, a + dx));
      else der.meta = Math.min(w - m, Math.max(b, b + dx));
      anima();
    });
    function suelta() {
      if (x0 === null) return;
      x0 = null;
      if (arrastra) {
        ignora = true;                 // el clic que viene después no cuenta
        // cambia de lado si la punta recorrió más del 40 % del camino
        const [a, b] = reposo(), viaje = boton.clientWidth - 2 * margen() - diam();
        const avance = on ? a - izq.meta : der.meta - b;
        pon(avance > viaje * .4 ? !on : on);
      } else {
        // sin arrastre, la punta vuelve a su sitio y el clic hace el cambio
        apunta(on); [izq.meta, der.meta] = reposo(); anima();
      }
    }
    boton.addEventListener('pointerup', suelta);
    boton.addEventListener('pointercancel', suelta);
    boton.addEventListener('click', () => {
      if (ignora) { ignora = false; return; }
      pon(!on);
    });
    addEventListener('resize', () => { [izq.meta, der.meta] = reposo(); izq.x = izq.meta; der.x = der.meta; dibuja(); });

    [izq.meta, der.meta] = reposo();
    izq.x = izq.meta; der.x = der.meta;
    dibuja();
    return { pon, on: () => on };
  }

  window.Chicle = Chicle;
})();
