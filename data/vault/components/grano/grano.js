/* =====================================================================
   Grano · Moxen
   Grano de película animado sobre cualquier sección: ruido que cambia
   24 veces por segundo, motas de polvo, alguna raya, el parpadeo de la
   lámpara y el leve vaivén del fotograma. Todo escala con la intensidad.
   En canvas, sin dependencias.

     const g = Grano(document.querySelector('[data-grano]'), { intensidad: .45 });
     g.intensidad(.8);

   Lo marcado con [data-grano-vaiven] tiembla con el fotograma.
   ===================================================================== */
(function () {
  'use strict';

  function Grano(caja, opciones) {
    const o = Object.assign({ intensidad: .45, fps: 24, escala: 2, cuadros: 8 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const vaiven = Array.from(caja.querySelectorAll('[data-grano-vaiven]'));

    const lienzo = document.createElement('canvas');
    lienzo.className = 'gr-lienzo';
    lienzo.setAttribute('aria-hidden', 'true');
    caja.appendChild(lienzo);
    const ctx = lienzo.getContext('2d');

    /* El ruido se fabrica una vez, en unos pocos cuadros a media
       resolución, y luego se van alternando: generar millones de píxeles
       al azar en cada cuadro no hace falta para que parezca vivo. */
    let W = 0, H = 0, ruidos = [];
    function fabrica() {
      const r = devicePixelRatio || 1;
      W = caja.clientWidth; H = caja.clientHeight;
      lienzo.width = W * r; lienzo.height = H * r;
      ctx.setTransform(r, 0, 0, r, 0, 0);
      const w = Math.ceil(W / o.escala), h = Math.ceil(H / o.escala);
      ruidos = Array.from({ length: o.cuadros }, () => {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const cc = c.getContext('2d'), img = cc.createImageData(w, h), d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          /* Cada grano es una mota clara o una oscura, casi siempre muy
             tenue: así se ve sobre negro y sobre blanco a la vez, sin
             agrisar todo el cuadro. */
          const claro = Math.random() < .5, v = claro ? 255 : 0, a = Math.pow(Math.random(), 3);
          d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = a * 255;
        }
        cc.putImageData(img, 0, 0);
        return c;
      });
    }
    fabrica();
    new ResizeObserver(() => { if (caja.clientWidth !== W || caja.clientHeight !== H) fabrica(); }).observe(caja);

    let fuerza = o.intensidad, acumulado = 0, previo = 0, ultimo = -1;
    function intensidad(v) {
      fuerza = Math.max(0, Math.min(1, v));
      caja.style.setProperty('--gr-intensidad', fuerza.toFixed(3));
      if (reduce) cuadro();
    }

    // un fotograma de película: ruido, polvo, a veces una raya, y el temblor
    function cuadro() {
      ctx.clearRect(0, 0, W, H);
      if (!fuerza) return;
      let k = Math.floor(Math.random() * ruidos.length);
      if (k === ultimo) k = (k + 1) % ruidos.length;   // nunca dos iguales seguidos
      ultimo = k;
      ctx.imageSmoothingEnabled = true;   // suavizado: el grano de película es blando, no de píxeles
      ctx.globalAlpha = fuerza * .42;
      // un desfase al azar: aunque se repita el cuadro, no cae en el mismo sitio
      const ox = -Math.random() * o.escala * 8, oy = -Math.random() * o.escala * 8;
      ctx.drawImage(ruidos[k], ox, oy, W + o.escala * 8, H + o.escala * 8);
      if (reduce) { ctx.globalAlpha = 1; return; }

      // motas de polvo: pocas, de tamaños distintos, claras u oscuras
      const motas = Math.random() < fuerza ? 1 + Math.floor(Math.random() * 4 * fuerza) : 0;
      for (let i = 0; i < motas; i++) {
        ctx.globalAlpha = .35 + Math.random() * .5;
        ctx.fillStyle = Math.random() < .6 ? '#fff' : '#000';
        ctx.beginPath();
        ctx.ellipse(Math.random() * W, Math.random() * H, .6 + Math.random() * 2.4, .6 + Math.random() * 1.6, Math.random() * 3, 0, 6.2832);
        ctx.fill();
      }
      // de vez en cuando, una raya vertical de arriba abajo
      if (Math.random() < .12 * fuerza) {
        ctx.globalAlpha = .18 + Math.random() * .3;
        ctx.fillStyle = '#fff';
        ctx.fillRect(Math.random() * W, 0, .8, H);
      }
      ctx.globalAlpha = 1;
      // la lámpara parpadea y el fotograma se mueve medio píxel
      caja.style.setProperty('--gr-destello', (Math.random() * .05 * fuerza).toFixed(3));
      const tx = ((Math.random() - .5) * 1.4 * fuerza).toFixed(2), ty = ((Math.random() - .5) * 1.4 * fuerza).toFixed(2);
      vaiven.forEach(el => { el.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)'; });
    }

    function paso(t) {
      const dt = previo ? Math.min(.1, (t - previo) / 1000) : 0;
      previo = t;
      // el ruido cambia al ritmo del cine, no al de la pantalla
      acumulado += dt;
      if (acumulado >= 1 / o.fps) { acumulado %= 1 / o.fps; cuadro(); }
      requestAnimationFrame(paso);
    }

    intensidad(fuerza);
    cuadro();
    if (!reduce) requestAnimationFrame(paso);

    return { intensidad };
  }

  window.Grano = Grano;
})();
