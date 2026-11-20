/* =====================================================================
   Globo · Moxen
   Un tooltip que se comporta como un globo atado: aparece con un resorte
   que se pasa un poco, y al ir de un elemento a otro viaja en vez de
   desaparecer, se ladea con la velocidad (la cola tira, el cuerpo se
   queda atrás) y ajusta su ancho al texto nuevo. Si el elemento se mueve,
   lo sigue. Sin dependencias.

     <button data-globo="Negrita" data-atajo="⌘B">…</button>
     Globo(document.querySelectorAll('[data-globo]'), { distancia: 14 });

   En el teléfono aparece al tocar y se va solo al rato.
   ===================================================================== */
(function () {
  'use strict';

  const resorte = (x, k, c) => ({ x, v: 0, meta: x, k, c });
  function avanza(r, dt) { r.v += (r.k * (r.meta - r.x) - r.c * r.v) * dt; r.x += r.v * dt; }
  const limita = (v, a, b) => Math.max(a, Math.min(b, v));

  function Globo(elementos, opciones) {
    const o = Object.assign({ distancia: 12, retraso: 110, relleno: 18, inclina: .011 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const globo = document.createElement('div');
    globo.className = 'gl-globo';
    globo.setAttribute('role', 'tooltip');
    globo.id = 'gl-globo-' + Math.random().toString(36).slice(2, 7);
    globo.innerHTML = '<div class="gl-caja"></div><i class="gl-cola"></i>';
    const caja = globo.firstChild;
    const mide = document.createElement('span');
    mide.className = 'gl-mide';
    document.body.append(globo, mide);

    /* La posición (x, y) es la punta de la cola. La escala, el giro y el
       ancho llevan cada uno su resorte; la opacidad solo se acerca. */
    const x = resorte(0, 340, 31), y = resorte(0, 340, 31);
    const s = resorte(0, 430, 21);          // poco amortiguado: el «pop» se pasa
    const r = resorte(0, 240, 19), w = resorte(80, 360, 34);
    let op = 0, meta = 0, objetivo = null, texto = null, oculta = 0, raf = 0, antes = 0;

    function rotulo(el) {
      const t = document.createElement('span');
      t.className = 'gl-texto';
      t.textContent = el.dataset.globo;
      if (el.dataset.atajo) { const k = document.createElement('kbd'); k.textContent = el.dataset.atajo; t.appendChild(k); }
      mide.innerHTML = t.innerHTML;
      mide.style.gap = '9px'; mide.style.display = 'inline-flex';
      return { t, ancho: mide.offsetWidth + 2 * o.relleno };
    }

    function muestra(el) {
      clearTimeout(oculta);
      if (el === objetivo && meta) return;
      const antes = objetivo, visible = meta && op > .05;
      objetivo = el; meta = 1;
      el.setAttribute('aria-describedby', globo.id);
      const { t, ancho } = rotulo(el);
      w.meta = ancho;
      // el texto viejo sale hacia donde se va y el nuevo entra desde atrás
      const dir = antes && visible ? Math.sign(centro(el)[0] - centro(antes)[0]) || 1 : 0;
      if (texto && dir && !reduce) {
        const viejo = texto;
        viejo.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + (-dir * 16) + 'px)' }],
          { duration: 120, easing: 'ease-in', fill: 'forwards' });
        setTimeout(() => viejo.remove(), 140);
        // el nuevo espera a que el viejo casi se haya ido: nunca se leen dos a la vez
        t.animate([{ opacity: 0, transform: 'translateX(' + (dir * 16) + 'px)' }, { opacity: 1, transform: 'none' }],
          { duration: 260, delay: 80, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' });
      } else if (texto) texto.remove();
      caja.appendChild(t);
      texto = t;
      if (!visible) {
        // aparece donde está el elemento, sin viajar desde el anterior
        const [cx, cy] = centro(el);
        x.x = x.meta = cx; y.x = y.meta = cy; x.v = y.v = 0;
        w.x = ancho; s.x = .35; s.v = 0; r.x = r.v = 0;
      }
      arranca();
    }
    function esconde() {
      clearTimeout(oculta);
      oculta = setTimeout(() => {
        meta = 0;
        if (objetivo) objetivo.removeAttribute('aria-describedby');
        arranca();
      }, o.retraso);
    }
    function centro(el) {
      const b = el.getBoundingClientRect();
      return [b.left + b.width / 2, b.top - o.distancia];
    }

    function paso(t) {
      const dt = Math.min(.034, Math.max(.001, (t - antes) / 1000)); antes = t;
      if (objetivo) {
        // se mide cada cuadro: si el elemento se mueve, el globo va detrás
        const [cx, cy] = centro(objetivo);
        x.meta = cx; y.meta = cy;
      }
      s.meta = meta ? 1 : .6;
      if (reduce) { x.x = x.meta; y.x = y.meta; w.x = w.meta; s.x = 1; r.x = 0; op = meta; }
      else {
        avanza(x, dt); avanza(y, dt); avanza(w, dt); avanza(s, dt);
        // el giro persigue a la velocidad: la cola tira y el cuerpo se ladea hacia atrás
        r.meta = limita(-x.v * o.inclina, -16, 16);
        avanza(r, dt);
        op += (meta - op) * (1 - Math.exp(-dt / (meta ? .07 : .06)));
      }
      globo.style.transform = 'translate(' + x.x.toFixed(2) + 'px,' + y.x.toFixed(2) + 'px) rotate(' + r.x.toFixed(2) + 'deg) scale(' + Math.max(0, s.x).toFixed(4) + ')';
      globo.style.opacity = op.toFixed(3);
      caja.style.width = w.x.toFixed(2) + 'px';
      const quieto = Math.abs(x.v) + Math.abs(y.v) + Math.abs(s.v) + Math.abs(r.v) + Math.abs(w.v) < .02
        && Math.abs(op - meta) < .003 && Math.abs(s.meta - s.x) < .001;
      raf = quieto ? 0 : requestAnimationFrame(paso);
      if (quieto && !meta) objetivo = null;
    }
    function arranca() {
      if (raf) return;
      antes = performance.now();
      raf = requestAnimationFrame(paso);
    }

    Array.from(elementos).forEach(el => {
      el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') muestra(el); });
      el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') esconde(); });
      el.addEventListener('focus', () => muestra(el));
      el.addEventListener('blur', esconde);
      // con el dedo: aparece al tocar y se va solo
      el.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse') return;
        muestra(el);
        clearTimeout(oculta);
        oculta = setTimeout(esconde, 1400);
      });
    });
    addEventListener('scroll', arranca, { passive: true, capture: true });

    return { muestra, esconde };
  }

  window.Globo = Globo;
})();
