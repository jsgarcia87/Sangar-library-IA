/* =====================================================================
   Ondas · Moxen
   Un campo de líneas horizontales, como agua quieta. Cada clic deja caer
   una gota: un tren de ondas concéntricas se abre desde ahí, dobla las
   líneas a su paso y se apaga con la distancia. Las ondas se suman entre
   sí. En canvas, sin dependencias.

     const o = Ondas(document.querySelector('[data-ondas]'));
     o.gota(x, y);      // a mano, en coordenadas de la página

   El color sale de la variable CSS --on-trazo (r, g, b).
   ===================================================================== */
(function () {
  'use strict';

  function Ondas(caja, opciones) {
    const o = Object.assign({
      separacion: 15,      // px entre líneas
      velocidad: 340,      // px por segundo del frente de onda
      amplitud: 15,        // px de altura de la onda al nacer
      longitud: 62,        // px entre cresta y cresta
      vida: 3.4,           // segundos hasta apagarse
    }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lienzo = document.createElement('canvas');
    lienzo.className = 'on-lienzo';
    lienzo.setAttribute('aria-hidden', 'true');
    caja.prepend(lienzo);
    const ctx = lienzo.getContext('2d');

    let W = 0, H = 0, rgb = '244, 244, 244', gotas = [], reloj = 0, previo = 0;
    function ajusta() {
      const r = devicePixelRatio || 1;
      W = caja.clientWidth; H = caja.clientHeight;
      lienzo.width = W * r; lienzo.height = H * r;
      ctx.setTransform(r, 0, 0, r, 0, 0);
      rgb = getComputedStyle(caja).getPropertyValue('--on-trazo').trim() || rgb;
    }
    ajusta();
    new ResizeObserver(ajusta).observe(caja);

    const K = Math.PI * 2 / o.longitud, S = o.longitud * .85;

    /* La altura del agua en un punto: la suma de todas las gotas vivas.
       Cada una es un paquete de ondas (un seno bajo una campana) centrado
       en su frente, que avanza a «velocidad» y pierde fuerza con el
       tiempo y con la distancia. */
    function altura(x, y) {
      let h = 0;
      for (let i = 0; i < gotas.length; i++) {
        const g = gotas[i], dx = x - g.x, dy = y - g.y;
        const d = Math.sqrt(dx * dx + dy * dy), u = d - g.edad * o.velocidad;
        if (u > S * 2.5 || u < -S * 3) continue;
        const campana = Math.exp(-(u * u) / (2 * S * S));
        h += Math.sin(u * K) * campana * g.fuerza;
      }
      return h * o.amplitud;
    }

    /* Cada tramo se pinta más claro cuanto más se dobla, para que las
       crestas brillen y se lean los anillos. Los tramos se agrupan en diez
       tonos y cada tono se traza de una vez: diez trazos por cuadro en vez
       de miles. */
    const TONOS = 10;
    function dibuja() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      const grupos = Array.from({ length: TONOS }, () => new Path2D());
      const paso = 8, filas = Math.ceil(H / o.separacion) + 1;
      for (let j = 0; j < filas; j++) {
        const y0 = (j + .5) * o.separacion;
        let px = 0, py = 0;
        for (let x = 0, k = 0; x <= W + paso; x += paso, k++) {
          // el agua nunca está del todo quieta: una ondulación muy lenta
          const calma = reduce ? 0 : Math.sin(x * .011 + reloj * .8 + j * .42) * 1.4;
          const h = altura(x, y0), y = y0 + calma + h;
          if (k) {
            const g = grupos[Math.min(TONOS - 1, Math.floor(Math.abs(h) / o.amplitud * TONOS * 1.4))];
            g.moveTo(px, py); g.lineTo(x, y);
          }
          px = x; py = y;
        }
      }
      grupos.forEach((g, i) => {
        ctx.strokeStyle = 'rgba(' + rgb + ', ' + (.13 + i / (TONOS - 1) * .62).toFixed(3) + ')';
        ctx.stroke(g);
      });
    }

    function paso(t) {
      const dt = previo ? Math.min(.05, (t - previo) / 1000) : 0;
      previo = t; reloj += dt;
      gotas = gotas.filter(g => {
        g.edad += dt;
        // la fuerza se apaga con la edad, suave al principio
        g.fuerza = Math.pow(Math.max(0, 1 - g.edad / o.vida), 1.6);
        return g.edad < o.vida;
      });
      dibuja();
      requestAnimationFrame(paso);
    }

    function gota(x, y, edad) {
      const r = caja.getBoundingClientRect();
      gotas.push({ x: x - r.left, y: y - r.top, edad: edad || 0, fuerza: 1 });
      if (gotas.length > 12) gotas.shift();
      if (reduce) dibuja();
    }
    caja.addEventListener('pointerdown', e => gota(e.clientX, e.clientY));

    // una primera gota al cargar, ya abierta, para que el agua no empiece muerta
    const r0 = caja.getBoundingClientRect();
    gota(r0.left + r0.width * .26, r0.top + r0.height * .7, .9);
    if (reduce) dibuja(); else requestAnimationFrame(paso);

    return { gota };
  }

  window.Ondas = Ondas;
})();
