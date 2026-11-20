/* =====================================================================
   Lluvia · Moxen
   Letras que caen y se apilan en el suelo como arena: si al llegar la
   columna vecina está más baja, ruedan hacia ella. Cada letra dura unos
   segundos, se apaga, y las de encima bajan a ocupar su sitio con un
   rebote suave. El cursor hace de paraguas. En canvas, sin dependencias.

     Lluvia(document.querySelector('[data-lluvia]'), { ritmo: 26 });

   ritmo: letras por segundo. El color sale de --ll-letra (r, g, b).
   ===================================================================== */
(function () {
  'use strict';

  function Lluvia(caja, opciones) {
    const o = Object.assign({
      ritmo: 26, tam: 20, letras: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
      vida: [4, 8],      // segundos que dura apilada (entre uno y otro)
      alto: 7,           // filas como máximo en una columna
      paraguas: 50,      // radio del paraguas del cursor, en px
      gravedad: 900,
    }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lienzo = document.createElement('canvas');
    lienzo.className = 'll-lienzo';
    lienzo.setAttribute('aria-hidden', 'true');
    caja.prepend(lienzo);
    const ctx = lienzo.getContext('2d');
    const cw = o.tam * 1.15, ch = o.tam * 1.3;    // el ancho de columna y el alto de fila
    const azar = (a, b) => a + Math.random() * (b - a);

    let W = 0, H = 0, dpr = 1, cols = 0, x0 = 0, pilas = [], cayendo = [], rgb = '244, 244, 244';
    function ajusta() {
      dpr = devicePixelRatio || 1;
      W = caja.clientWidth; H = caja.clientHeight;
      lienzo.width = W * dpr; lienzo.height = H * dpr;
      cols = Math.max(1, Math.floor(W / cw));
      x0 = (W - cols * cw) / 2;
      while (pilas.length < cols) pilas.push([]);
      pilas.length = cols;
      rgb = getComputedStyle(caja).getPropertyValue('--ll-letra').trim() || rgb;
    }
    ajusta();
    new ResizeObserver(ajusta).observe(caja);

    const fila = i => H - 4 - ch * (i + .5);          // el centro de la fila i, desde el suelo
    const columna = x => Math.max(0, Math.min(cols - 1, Math.floor((x - x0) / cw)));

    let px = -999, py = -999, paraguas = 0, metaParaguas = 0, cuenta = 0, previo = 0;
    addEventListener('pointermove', e => {
      const r = caja.getBoundingClientRect();
      px = e.clientX - r.left; py = e.clientY - r.top;
      metaParaguas = px >= 0 && py >= 0 && px <= r.width && py <= r.height ? 1 : 0;
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { metaParaguas = 0; });

    function nace() {
      cayendo.push({
        c: o.letras[Math.floor(Math.random() * o.letras.length)],
        x: azar(x0, x0 + cols * cw), y: -ch, vx: 0, vy: azar(60, 180),
        giro: azar(-.4, .4), vg: azar(-.9, .9),
      });
    }

    /* Al tocar la pila, la letra busca dónde quedarse: mientras una
       vecina esté al menos dos filas más baja, rueda hacia ella. Así se
       forman montoncitos con pendiente, no torres. */
    function aterriza(l) {
      let c = columna(l.x);
      for (let k = 0; k < cols; k++) {
        const h = pilas[c].length;
        const iz = c > 0 ? pilas[c - 1].length : Infinity, de = c < cols - 1 ? pilas[c + 1].length : Infinity;
        if (Math.min(iz, de) > h - 2) break;
        c = iz === de ? c + (Math.random() < .5 ? -1 : 1) : iz < de ? c - 1 : c + 1;
      }
      pilas[c].push({
        c: l.c, x: l.x, y: l.y, vy: l.vy * .15, tx: x0 + (c + .5) * cw,
        giro: l.giro, metaGiro: azar(-.22, .22), vida: azar(o.vida[0], o.vida[1]), alfa: 1,
      });
      // si la columna ya es muy alta, la de abajo empieza a irse
      if (pilas[c].length > o.alto) pilas[c][0].vida = Math.min(pilas[c][0].vida, 0);
    }

    function avanza(dt) {
      cuenta += dt * o.ritmo;
      while (cuenta >= 1) { cuenta -= 1; nace(); }
      paraguas += (metaParaguas - paraguas) * (1 - Math.exp(-dt * 6));
      const R = o.paraguas;

      cayendo = cayendo.filter(l => {
        l.vy = Math.min(560, l.vy + o.gravedad * dt);
        l.vx *= Math.exp(-dt * 1.2);
        l.x += l.vx * dt; l.y += l.vy * dt; l.giro += l.vg * dt;
        // el paraguas: la letra que entra en el círculo sale por su borde y rebota
        if (paraguas > .5) {
          const dx = l.x - px, dy = l.y - py, d = Math.hypot(dx, dy);
          if (d < R && d > 0) {
            const nx = dx / d, ny = dy / d, vn = l.vx * nx + l.vy * ny;
            l.x = px + nx * R; l.y = py + ny * R;
            if (vn < 0) { l.vx -= 1.35 * vn * nx; l.vy -= 1.35 * vn * ny; l.vg += nx * 4; }
          }
        }
        if (l.x < -cw || l.x > W + cw) return false;
        const tope = H - 4 - pilas[columna(l.x)].length * ch;
        if (l.y + ch / 2 >= tope) { aterriza(l); return false; }
        return true;
      });

      /* Las apiladas buscan su fila con un resorte un poco flojo: al caer
         la de abajo, las de encima bajan y rebotan apenas. */
      pilas.forEach(pila => {
        for (let i = 0; i < pila.length; i++) {
          const s = pila[i];
          s.vy += (320 * (fila(i) - s.y) - 24 * s.vy) * dt;
          s.y += s.vy * dt;
          s.x += (s.tx - s.x) * (1 - Math.exp(-dt * 10));
          s.giro += (s.metaGiro - s.giro) * (1 - Math.exp(-dt * 8));
          s.vida -= dt;
          if (s.vida <= 0) s.alfa -= dt * 2.2;
        }
        for (let i = pila.length - 1; i >= 0; i--) if (pila[i].alfa <= 0) pila.splice(i, 1);
      });
    }

    function letra(l, alfa) {
      const c = Math.cos(l.giro), s = Math.sin(l.giro);
      ctx.globalAlpha = alfa;
      ctx.setTransform(c * dpr, s * dpr, -s * dpr, c * dpr, l.x * dpr, l.y * dpr);
      ctx.fillText(l.c, 0, 0);
    }
    function dibuja() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = '600 ' + o.tam + 'px "General Sans", system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgb(' + rgb + ')';
      cayendo.forEach(l => letra(l, .5));
      pilas.forEach(pila => pila.forEach(s => letra(s, .9 * Math.max(0, s.alfa))));
      // el paraguas se insinúa: medio aro muy tenue sobre el cursor
      if (paraguas > .01) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalAlpha = .3 * paraguas;
        ctx.strokeStyle = 'rgb(' + rgb + ')'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(px, py, o.paraguas, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      avanza(dt);
      dibuja();
      requestAnimationFrame(paso);
    }

    // empieza con la lluvia ya cayendo y algo apilado, no con la pantalla vacía
    for (let i = 0; i < 60 * 7; i++) avanza(1 / 60);
    if (reduce) dibuja();
    else (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(paso));

    return { lienzo };
  }

  window.Lluvia = Lluvia;
})();
