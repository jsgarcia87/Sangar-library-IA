/* =====================================================================
   Retícula · Moxen
   Un fondo de puntos en rejilla que reacciona al cursor: los cercanos se
   apartan, crecen y se encienden, y al irse vuelven a su sitio con un
   pequeño vaivén. Sin cursor, la rejilla respira despacio. En canvas,
   sin dependencias.

     Reticula(document.querySelector('[data-reticula]'), { paso: 28, radio: 210 });

   paso: distancia entre puntos · radio: alcance del cursor (px).
   El color sale de la variable CSS --rt-punto.
   ===================================================================== */
(function () {
  'use strict';

  function Reticula(caja, opciones) {
    const o = Object.assign({ paso: 28, radio: 210, empuje: 44, tam: 1.2, rigidez: 170, freno: 12 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lienzo = document.createElement('canvas');
    lienzo.className = 'rt-lienzo';
    lienzo.setAttribute('aria-hidden', 'true');
    caja.prepend(lienzo);
    const ctx = lienzo.getContext('2d');

    // posiciones de reposo, desplazamientos y velocidades, en arreglos planos
    let W = 0, H = 0, n = 0, rx, ry, dx, dy, vx, vy, color = '#fff';
    function ajusta() {
      const r = devicePixelRatio || 1;
      W = caja.clientWidth; H = caja.clientHeight;
      lienzo.width = W * r; lienzo.height = H * r;
      ctx.setTransform(r, 0, 0, r, 0, 0);
      const cols = Math.ceil(W / o.paso) + 1, filas = Math.ceil(H / o.paso) + 1;
      // la rejilla centrada: el sobrante se reparte a los dos lados
      const ox = (W - (cols - 1) * o.paso) / 2, oy = (H - (filas - 1) * o.paso) / 2;
      n = cols * filas;
      rx = new Float32Array(n); ry = new Float32Array(n);
      dx = new Float32Array(n); dy = new Float32Array(n);
      vx = new Float32Array(n); vy = new Float32Array(n);
      for (let i = 0; i < n; i++) { rx[i] = ox + (i % cols) * o.paso; ry[i] = oy + Math.floor(i / cols) * o.paso; }
      color = getComputedStyle(caja).getPropertyValue('--rt-punto').trim() || '#fff';
    }
    ajusta();
    new ResizeObserver(ajusta).observe(caja);

    let mx = 0, my = 0, cx = 0, cy = 0, dentro = false, visto = false, asienta = false, fuerza = 0, reloj = 0, previo = 0;
    function apunta(e) {
      const r = caja.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      const antes = dentro;
      dentro = mx >= 0 && my >= 0 && mx <= r.width && my <= r.height;
      if (dentro && !antes && fuerza < .01) { cx = mx; cy = my; }   // sin cruzar la pantalla al entrar
      // si el cursor ya estaba sobre la página al cargar, el efecto ya está ahí
      if (!visto) { visto = true; if (dentro) { fuerza = 1; cx = mx; cy = my; asienta = true; } }
    }
    addEventListener('pointermove', apunta, { passive: true });
    addEventListener('pointerdown', apunta, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { dentro = false; });

    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t; reloj += dt;
      // el punto de influencia se desliza tras el cursor y se apaga al salir
      const k = 1 - Math.exp(-dt * 20);
      cx += (mx - cx) * k; cy += (my - cy) * k;
      fuerza += ((dentro ? 1 : 0) - fuerza) * (1 - Math.exp(-dt * 4));

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color;
      const R = o.radio, pasos = dt > 1 / 70 ? 2 : 1, h = dt / pasos;
      for (let i = 0; i < n; i++) {
        const ex = rx[i] - cx, ey = ry[i] - cy, d = Math.sqrt(ex * ex + ey * ey);
        const c = (d < R ? 1 - d / R : 0) * fuerza;
        // el empuje cae más despacio que el brillo: deja un hueco alrededor
        const empuje = Math.pow(c, 1.4) * o.empuje, f = c * c;
        /* Cada punto tiene un resorte hacia su «meta»: lejos del cursor,
           su sitio; cerca, un poco más allá, en la dirección contraria.
           El resorte da el vaivén al volver. */
        const tx = d ? ex / d * empuje : 0, ty = d ? ey / d * empuje : 0;
        if (reduce || asienta) { dx[i] = tx; dy[i] = ty; vx[i] = vy[i] = 0; }
        else for (let s = 0; s < pasos; s++) {
          vx[i] += (o.rigidez * (tx - dx[i]) - o.freno * vx[i]) * h;
          vy[i] += (o.rigidez * (ty - dy[i]) - o.freno * vy[i]) * h;
          dx[i] += vx[i] * h; dy[i] += vy[i] * h;
        }
        // la respiración: una onda lenta que cruza la rejilla en diagonal
        const ola = reduce ? 0 : Math.sin(reloj * 1.1 - (rx[i] + ry[i]) * .009) * .5 + .5;
        ctx.globalAlpha = Math.min(1, .16 + ola * .12 + f * .84);
        const radio = o.tam + f * 3.2;
        ctx.beginPath();
        ctx.arc(rx[i] + dx[i], ry[i] + dy[i], radio, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      asienta = false;
      requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);

    return { lienzo };
  }

  window.Reticula = Reticula;
})();
