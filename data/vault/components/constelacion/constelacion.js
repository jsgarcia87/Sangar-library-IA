/* =====================================================================
   Constelación · Moxen
   Partículas que derivan despacio y se unen con líneas cuando están
   cerca. Al acercar el cursor se juntan a su alrededor, en órbita, y se
   enlazan con él; un clic las dispersa. En canvas, sin dependencias.

     Constelacion(document.querySelector('[data-constelacion]'), { densidad: 1 });

   densidad: 1 es una partícula cada ~11 000 px². El color sale de la
   variable CSS --co-estrella (r, g, b).
   ===================================================================== */
(function () {
  'use strict';

  function Constelacion(caja, opciones) {
    const o = Object.assign({ densidad: 1, enlace: 125, radio: 260, orbita: 90 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lienzo = document.createElement('canvas');
    lienzo.className = 'co-lienzo';
    lienzo.setAttribute('aria-hidden', 'true');
    caja.prepend(lienzo);
    const ctx = lienzo.getContext('2d');

    let W = 0, H = 0, rgb = '244, 244, 244', estrellas = [];
    function nueva(x, y) {
      // cada una tiene su deriva propia, lenta y en cualquier dirección
      const a = Math.random() * Math.PI * 2, v = 8 + Math.random() * 16;
      return { x, y, bx: Math.cos(a) * v, by: Math.sin(a) * v, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 1 + Math.random() * 1.3 };
    }
    function ajusta() {
      const r = devicePixelRatio || 1;
      W = caja.clientWidth; H = caja.clientHeight;
      lienzo.width = W * r; lienzo.height = H * r;
      ctx.setTransform(r, 0, 0, r, 0, 0);
      rgb = getComputedStyle(caja).getPropertyValue('--co-estrella').trim() || rgb;
      const n = Math.round(W * H / 11000 * o.densidad);
      while (estrellas.length < n) estrellas.push(nueva(Math.random() * W, Math.random() * H));
      estrellas.length = n;
    }
    ajusta();
    new ResizeObserver(ajusta).observe(caja);

    let mx = 0, my = 0, dentro = false, visto = false, iman = 0, previo = 0;
    function apunta(e) {
      const r = caja.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      dentro = mx >= 0 && my >= 0 && mx <= r.width && my <= r.height;
      // si el cursor ya estaba encima al cargar, el imán ya está encendido
      if (!visto) { visto = true; if (dentro) iman = 1; }
    }
    addEventListener('pointermove', apunta, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { dentro = false; });
    // un clic las empuja hacia fuera, más fuerte cuanto más cerca
    caja.addEventListener('pointerdown', e => {
      apunta(e);
      estrellas.forEach(s => {
        const dx = s.x - mx, dy = s.y - my, d = Math.hypot(dx, dy) || 1;
        if (d > o.radio * 1.4) return;
        const f = (1 - d / (o.radio * 1.4)) * 520;
        s.vx += dx / d * f; s.vy += dy / d * f;
      });
    });

    function mueve(dt) {
      const R = o.radio;
      estrellas.forEach(s => {
        /* Cerca del cursor, un muelle las lleva hacia un anillo de radio
           «orbita» a su alrededor (no al centro: se amontonarían en un
           punto). Lejos, su velocidad vuelve poco a poco a la deriva. */
        const dx = mx - s.x, dy = my - s.y, d = Math.hypot(dx, dy) || 1;
        if (iman > 0 && d < R) {
          const f = (1 - d / R) * iman, tira = (d - o.orbita) * 3.2 * f;
          s.vx += dx / d * tira * dt; s.vy += dy / d * tira * dt;
          // y una pizca de giro, para que orbiten en vez de quedarse quietas
          s.vx += -dy / d * 26 * f * dt; s.vy += dx / d * 26 * f * dt;
        }
        const k = 1 - Math.exp(-dt * 1.1);
        s.vx += (s.bx - s.vx) * k; s.vy += (s.by - s.vy) * k;
        s.x += s.vx * dt; s.y += s.vy * dt;
        // al salir por un borde, entran por el contrario
        if (s.x < -30) s.x += W + 60; else if (s.x > W + 30) s.x -= W + 60;
        if (s.y < -30) s.y += H + 60; else if (s.y > H + 30) s.y -= H + 60;
      });
    }

    function dibuja() {
      ctx.clearRect(0, 0, W, H);
      const L = o.enlace, R = o.radio, n = estrellas.length;
      ctx.lineWidth = 1;
      for (let i = 0; i < n; i++) {
        const a = estrellas[i];
        for (let j = i + 1; j < n; j++) {
          const b = estrellas[j], dx = a.x - b.x, dy = a.y - b.y;
          if (dx > L || dx < -L || dy > L || dy < -L) continue;   // descarte barato antes de la raíz
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > L) continue;
          ctx.strokeStyle = 'rgba(' + rgb + ', ' + ((1 - d / L) * .38).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        // el hilo hasta el cursor
        if (iman > .01) {
          const d = Math.hypot(a.x - mx, a.y - my);
          if (d < R) {
            ctx.strokeStyle = 'rgba(' + rgb + ', ' + ((1 - d / R) * .7 * iman).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke();
          }
        }
      }
      ctx.fillStyle = 'rgba(' + rgb + ', .9)';
      estrellas.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill(); });
    }

    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      iman += ((dentro ? 1 : 0) - iman) * (1 - Math.exp(-dt * 3));
      mueve(dt);
      dibuja();
      requestAnimationFrame(paso);
    }
    if (reduce) dibuja(); else requestAnimationFrame(paso);

    return { lienzo };
  }

  window.Constelacion = Constelacion;
})();
