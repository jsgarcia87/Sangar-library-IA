/* =====================================================================
   Chispas · Moxen
   Al hacer clic saltan chispas: trazos cortos que salen disparados,
   caen con gravedad y se apagan, más una onda que se abre. Sobre lo
   marcado con [data-chispas-fuerte] el estallido es más grande. Con el
   dedo también funciona. Sin dependencias.

     const c = Chispas();
     c.estalla(x, y, 1.6);     // a mano, donde quieras

   Son blancas y el lienzo se mezcla en «diferencia»: se ven en
   cualquier fondo. Para otro color, cambia o.color y quita la mezcla.
   ===================================================================== */
(function () {
  'use strict';

  function Chispas(opciones) {
    const o = Object.assign({ cantidad: 14, gravedad: 1300, cursor: true, color: '#fff' }, opciones);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return { estalla() {} };

    const lienzo = document.createElement('canvas');
    lienzo.className = 'ch-lienzo';
    lienzo.setAttribute('aria-hidden', 'true');
    document.body.appendChild(lienzo);
    const ctx = lienzo.getContext('2d');
    let W = 0, H = 0;
    function ajusta() {
      const r = devicePixelRatio || 1;
      W = innerWidth; H = innerHeight;
      lienzo.width = W * r; lienzo.height = H * r;
      ctx.setTransform(r, 0, 0, r, 0, 0);
    }
    ajusta();
    addEventListener('resize', ajusta);

    // el cursor propio, solo donde hay ratón
    const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
    let aro = null;
    if (o.cursor && fino) {
      aro = document.createElement('div');
      aro.className = 'ch-cursor';
      aro.setAttribute('aria-hidden', 'true');
      aro.innerHTML = '<i></i>';
      document.body.appendChild(aro);
      document.documentElement.classList.add('ch-activo');
      addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        aro.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
        aro.setAttribute('data-visible', '');
      }, { passive: true });
      /* Un clic rápido dura un instante: el aro se queda encogido al
         menos 110 ms para que se llegue a ver. */
      addEventListener('pointerup', () => {
        const falta = Math.max(0, 110 - (performance.now() - pulsado));
        setTimeout(() => aro.removeAttribute('data-pulsado'), falta);
      });
      document.documentElement.addEventListener('pointerleave', () => aro.removeAttribute('data-visible'));
    }

    let chispas = [], ondas = [], raf = 0, previo = 0, pulsado = 0;

    function estalla(x, y, fuerza) {
      const f = fuerza || 1, n = Math.round(o.cantidad * f);
      for (let i = 0; i < n; i++) {
        /* Ángulos repartidos con un poco de azar: al azar puro se
           amontonan y quedan huecos; repartidos del todo parece un sello. */
        const a = (i / n) * Math.PI * 2 + (Math.random() - .5) * .5;
        const v = (320 + Math.random() * 440) * Math.sqrt(f);
        chispas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, vida: 0, dura: .45 + Math.random() * .35, punto: Math.random() < .3 });
      }
      ondas.push({ x, y, vida: 0, dura: .42, r: 34 * f });
      if (!raf) raf = requestAnimationFrame(paso);
    }

    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = ctx.fillStyle = o.color;
      ctx.lineCap = 'round';

      chispas = chispas.filter(c => (c.vida += dt) < c.dura);
      chispas.forEach(c => {
        // el aire las frena y la gravedad las curva hacia abajo
        const freno = Math.exp(-dt * 3.2);
        c.vx *= freno; c.vy = c.vy * freno + o.gravedad * dt;
        c.x += c.vx * dt; c.y += c.vy * dt;
        const u = c.vida / c.dura, alfa = Math.pow(1 - u, 1.3);
        ctx.globalAlpha = alfa;
        if (c.punto) {
          ctx.beginPath(); ctx.arc(c.x, c.y, 2.2 * (1 - u) + .5, 0, Math.PI * 2); ctx.fill();
        } else {
          // un trazo hacia atrás, del largo de su velocidad: parece una chispa
          ctx.lineWidth = 2.8 * (1 - u) + .6;
          ctx.beginPath(); ctx.moveTo(c.x - c.vx * .038, c.y - c.vy * .038); ctx.lineTo(c.x, c.y); ctx.stroke();
        }
      });

      ondas = ondas.filter(w => (w.vida += dt) < w.dura);
      ondas.forEach(w => {
        const u = w.vida / w.dura, e = 1 - Math.pow(1 - u, 3);
        ctx.globalAlpha = (1 - u) * .7;
        ctx.lineWidth = 1.5 * (1 - u) + .3;
        ctx.beginPath(); ctx.arc(w.x, w.y, 4 + w.r * e, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.globalAlpha = 1;

      if (chispas.length || ondas.length) raf = requestAnimationFrame(paso);
      else { raf = 0; previo = 0; }
    }

    addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      if (aro && e.pointerType === 'mouse') { aro.setAttribute('data-pulsado', ''); pulsado = performance.now(); }
      const fuerte = e.target.closest && e.target.closest('[data-chispas-fuerte]');
      estalla(e.clientX, e.clientY, fuerte ? 1.7 : 1);
    });

    return { estalla };
  }

  window.Chispas = Chispas;
})();
