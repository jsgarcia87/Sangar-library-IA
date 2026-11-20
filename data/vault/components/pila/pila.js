/* =====================================================================
   Pila · Moxen
   Notificaciones que se apilan: la nueva entra arriba y empuja al resto;
   las que no caben quedan asomando debajo, como un mazo. Al cerrar una,
   las demás se reordenan cada una con su propio resorte, y la primera del
   mazo sube a ocupar el hueco. En el teléfono se cierran deslizándolas.

     const pila = Pila(document.querySelector('[data-pila]'), { visibles: 4 });
     const id = pila.agrega({ titulo, texto, cuando: 'ahora', icono: 'ok', tono: 'ok' });
     pila.quita(id);

   Íconos de serie: ok, mensaje, nube, alerta, calendario, descarga, tarjeta (o
   pasa un <svg> propio en `icono`). Tonos: 'ok' (verde) y 'error' (rojo).
   ===================================================================== */
(function () {
  'use strict';

  const ICONOS = {
    ok: '<path d="M5 12.5l4.2 4.2L19 7"/>',
    mensaje: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17A2.5 2.5 0 0 1 4 14.5z"/>',
    nube: '<path d="M7 18h10.5a3.5 3.5 0 0 0 .4-7A5.5 5.5 0 0 0 7.3 9.6 4.2 4.2 0 0 0 7 18z"/>',
    alerta: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.2M12 17h.01"/>',
    calendario: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    descarga: '<path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 20h14"/>',
    tarjeta: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
  };
  const CRUZ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  /* Un resorte amortiguado por cada cosa que se mueve. Con el paso real
     del cuadro (dt), así va igual a 60 que a 120 Hz. */
  const resorte = (x, k, c) => ({ x, v: 0, meta: x, k, c });
  function avanza(r, dt) { r.v += (r.k * (r.meta - r.x) - r.c * r.v) * dt; r.x += r.v * dt; }
  const parado = r => Math.abs(r.meta - r.x) < .05 && Math.abs(r.v) < .05;

  function Pila(caja, opciones) {
    const o = Object.assign({ visibles: 4, hueco: 14, asoma: 12 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let avisos = [], sig = 1, raf = 0, antes = 0;

    const alto = () => avisos.length ? avisos[0].el.offsetHeight : 94;
    function ajustaCaja() {
      // alto fijo: el de los visibles más lo que asoma el mazo, para que nada salte
      caja.style.height = (o.visibles * (alto() + o.hueco) - o.hueco + 2 * o.asoma) + 'px';
    }

    /* El orden manda: los primeros `visibles` en columna, el resto detrás
       del último, cada uno un poco más abajo y más pequeño para que solo
       asome su borde. Aquí solo se fijan metas; el resorte hace el viaje. */
    function ordena() {
      const vivos = avisos.filter(a => !a.saliendo);
      const h = alto();
      let y = 0, ultimo = 0;
      vivos.forEach((a, i) => {
        if (i < o.visibles) {
          a.y.meta = ultimo = y; a.s.meta = 1; a.opaco = 1;
          y += h + o.hueco;
        } else {
          const k = i - o.visibles + 1;
          a.y.meta = ultimo + k * o.asoma; a.s.meta = 1 - k * .05;
          a.opaco = k <= 2 ? 1 - k * .3 : 0;
        }
        a.z = 100 - i;
      });
      arranca();
    }

    function agrega(datos, como) {
      const el = document.createElement('article');
      el.className = 'pl-aviso';
      el.setAttribute('role', 'status');
      const icono = /^\s*</.test(datos.icono || '') && !ICONOS[datos.icono]
        ? datos.icono : '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONOS[datos.icono] || ICONOS.mensaje) + '</svg>';
      el.innerHTML = '<span class="pl-icono"' + (datos.tono ? ' data-tono="' + datos.tono + '"' : '') + '>' + icono + '</span>'
        + '<div class="pl-cuerpo"><strong></strong><span></span></div>'
        + '<div class="pl-lado"><time></time><button class="pl-cerrar" type="button" aria-label="Cerrar aviso">' + CRUZ + '</button></div>';
      el.querySelector('strong').textContent = datos.titulo || '';
      el.querySelector('.pl-cuerpo span').textContent = datos.texto || '';
      el.querySelector('time').textContent = datos.cuando || '';

      const a = {
        id: sig++, el, saliendo: false, opaco: 1, z: 100,
        y: resorte(0, 290, 27), x: resorte(0, 230, 25), s: resorte(1, 300, 26), o: 1,
      };
      // la nueva cae desde un poco más arriba, transparente y algo pequeña
      if (!(como && como.quieto) && !reduce) { a.y.x = -26; a.s.x = .94; a.o = 0; }
      el.querySelector('.pl-cerrar').addEventListener('click', () => quita(a.id));
      arrastrable(a);
      avisos.unshift(a);
      caja.prepend(el);
      ajustaCaja();
      ordena();
      if (como && como.quieto) avisos.forEach(b => { b.y.x = b.y.meta; b.s.x = b.s.meta; b.o = b.opaco; pinta(b); });
      return a.id;
    }

    function quita(id, lado) {
      const a = avisos.find(b => b.id === id);
      if (!a || a.saliendo) return;
      a.saliendo = true;
      a.x.meta = (lado || 1) * 140; a.s.meta = .96; a.opaco = 0;
      a.el.style.pointerEvents = 'none';
      ordena();
    }

    function pinta(a) {
      a.el.style.transform = 'translate3d(' + a.x.x.toFixed(2) + 'px,' + a.y.x.toFixed(2) + 'px,0) scale(' + a.s.x.toFixed(4) + ')';
      a.el.style.opacity = a.o.toFixed(3);
      a.el.style.zIndex = a.z;
    }

    function paso(t) {
      const dt = Math.min(.034, Math.max(.001, (t - antes) / 1000)); antes = t;
      let vivo = false;
      avisos.forEach(a => {
        if (reduce) { a.y.x = a.y.meta; a.s.x = a.s.meta; a.x.x = a.x.meta; a.o = a.opaco; }
        else {
          avanza(a.y, dt); avanza(a.s, dt);
          if (!a.arrastre) avanza(a.x, dt);
          // la opacidad no rebota: se acerca con una exponencial
          a.o += (a.opaco - a.o) * (1 - Math.exp(-dt / (a.saliendo ? .08 : .12)));
        }
        if (!parado(a.y) || !parado(a.s) || !parado(a.x) || Math.abs(a.opaco - a.o) > .005 || a.arrastre) vivo = true;
        pinta(a);
      });
      // las que terminaron de irse salen del DOM
      avisos = avisos.filter(a => {
        if (a.saliendo && a.o < .01) { a.el.remove(); return false; }
        return true;
      });
      raf = vivo ? requestAnimationFrame(paso) : 0;
    }
    function arranca() {
      if (raf) return;
      antes = performance.now();
      raf = requestAnimationFrame(paso);
    }

    /* Con el dedo (o el ratón) se arrastra de lado: pasado un umbral, o con
       un gesto rápido, se va por ese lado; si no, vuelve con el resorte. */
    function arrastrable(a) {
      let x0 = 0, ultX = 0, ultT = 0, vel = 0;
      a.el.addEventListener('pointerdown', e => {
        if (e.button || e.target.closest('button') || a.saliendo) return;
        a.arrastre = true; x0 = e.clientX - a.x.x; ultX = e.clientX; ultT = e.timeStamp; vel = 0;
        a.el.setPointerCapture(e.pointerId);
        arranca();
      });
      a.el.addEventListener('pointermove', e => {
        if (!a.arrastre) return;
        const dx = e.clientX - x0;
        // más allá de la izquierda cuesta más: el gesto natural es hacia la derecha
        a.x.x = dx < 0 ? dx * .6 : dx; a.x.v = 0;
        const dtm = e.timeStamp - ultT;
        if (dtm > 0) vel = (e.clientX - ultX) / dtm;
        ultX = e.clientX; ultT = e.timeStamp;
      });
      const suelta = () => {
        if (!a.arrastre) return;
        a.arrastre = false;
        if (Math.abs(a.x.x) > 100 || Math.abs(vel) > .6) quita(a.id, Math.sign(a.x.x || vel) || 1);
        else { a.x.meta = 0; arranca(); }
      };
      a.el.addEventListener('pointerup', suelta);
      a.el.addEventListener('pointercancel', suelta);
    }

    addEventListener('resize', () => { ajustaCaja(); ordena(); }, { passive: true });
    ajustaCaja();
    return { agrega, quita, avisos: () => avisos.filter(a => !a.saliendo).map(a => a.id) };
  }

  Pila.iconos = ICONOS;
  window.Pila = Pila;
})();
