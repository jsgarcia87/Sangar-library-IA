/* =====================================================================
   Bandera · Moxen
   Letras que ondean como una bandera: el borde izquierdo está atado al
   mástil y la onda crece hacia el extremo libre. Cada letra sube y baja,
   se inclina con la pendiente de la tela y se oscurece cuando se tuerce
   hacia atrás. El cursor es viento: moverlo rápido levanta la bandera y
   la hace flamear; quieto, se calma. Sin dependencias.

     Bandera(document.querySelector('[data-bandera]'), { amplitud: 16 });
   ===================================================================== */
(function () {
  'use strict';

  function Bandera(el, opciones) {
    const o = Object.assign({
      amplitud: 14,         // px de la onda en el extremo libre, sin viento
      largo: 520,           // px: la longitud de una onda
      ritmo: 2.4,           // rad/s con aire en calma
      rafaga: 1.6,          // cuánto puede crecer con viento (×)
    }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // letras sueltas; las de cada palabra juntas, y los <br> se respetan
    const letras = [];
    const html = Array.from(el.childNodes);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    el.textContent = '';
    html.forEach(n => {
      if (n.nodeType !== 3) { el.appendChild(n); return; }
      n.textContent.split(/(\s+)/).forEach(trozo => {
        if (!trozo) return;
        if (/^\s+$/.test(trozo)) { el.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'bd-palabra';
        w.setAttribute('aria-hidden', 'true');
        Array.from(trozo).forEach(ch => {
          const i = document.createElement('i');
          i.className = 'bd-letra'; i.textContent = ch;
          w.appendChild(i); letras.push({ el: i, x: 0, y: 0 });
        });
        el.appendChild(w);
      });
    });

    let ancho = 1;
    function mide() {
      letras.forEach(l => { l.el.style.transform = ''; });
      const r = el.getBoundingClientRect();
      ancho = Math.max(1, r.width);
      letras.forEach(l => {
        const b = l.el.getBoundingClientRect();
        l.x = b.left - r.left + b.width / 2;
        l.y = b.top - r.top + b.height / 2;
      });
    }

    /* El viento sube con la velocidad del cursor y se apaga solo, con una
       exponencial. La fase se acumula (no se calcula con t × ritmo): así,
       al cambiar el ritmo, la onda acelera sin dar un salto. */
    let viento = 0, fase = 0, antes = 0, px = null, py = null;
    const k = 2 * Math.PI / o.largo;
    function paso(t) {
      const dt = Math.min(.05, Math.max(0, (t - (antes || t)) / 1000)); antes = t;
      viento *= Math.exp(-dt / 1.3);
      fase += o.ritmo * (1 + viento * .9) * dt;
      const A = o.amplitud * (1 + viento * o.rafaga);
      letras.forEach(l => {
        const u = l.x / ancho;                                  // 0 en el mástil, 1 en la punta
        const a = A * (.08 + .92 * Math.pow(u, 1.15));
        const ph = k * l.x - fase + l.y * .004;
        const s = Math.sin(ph), c = Math.cos(ph);
        const pendiente = Math.atan(a * k * c) * 180 / Math.PI;  // la inclinación de la tela ahí
        l.el.style.transform = 'translate3d(' + (-a * .18 * (1 - c)).toFixed(2) + 'px,' + (a * s).toFixed(2) + 'px,0) skewY(' + pendiente.toFixed(2) + 'deg)';
        l.el.style.setProperty('--luz', (.5 + .5 * c * Math.min(1, a / 10)).toFixed(3));
      });
      requestAnimationFrame(paso);
    }

    addEventListener('pointermove', e => {
      if (px !== null) {
        const v = Math.hypot(e.clientX - px, e.clientY - py);
        viento = Math.min(1.6, viento + v / 900);
      }
      px = e.clientX; py = e.clientY;
    }, { passive: true });

    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      mide();
      if (!reduce) requestAnimationFrame(paso);
    });
    addEventListener('resize', mide, { passive: true });
    return { sopla: f => { viento = Math.min(1.6, viento + (f || .8)); } };
  }

  window.Bandera = Bandera;
})();
