/* =====================================================================
   Imprenta · Moxen
   Un botón que se reimprime: al pulsarlo, un cabezal lo cruza de lado a
   lado; a su paso borra el texto viejo y estampa el nuevo letra a letra.

     const im = Imprenta(document.querySelector('.im-boton'), { despues: 'Enviado', vuelve: 2200 });
     im.imprime();      im.restaura();

   Las dos frases viven a la vez dentro del botón, una encima de otra: así
   el ancho es siempre el de la más larga y el botón no salta al cambiar.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // la palomita es un trazo y no un carácter: así también se «entinta»
  const PALOMITA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5l4.8 4.8L19.5 7"/></svg>';
  // arranca y frena con suavidad, como un carro de verdad
  const curva = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function Imprenta(boton, opciones) {
    const o = Object.assign({
      despues: boton.dataset.despues || 'Enviado',
      palomita: true,
      duracion: 950,     // ms que tarda el cabezal en cruzar
      vuelve: 0,         // ms hasta reimprimir el texto inicial (0: se queda)
    }, opciones);

    const inicial = boton.textContent.trim();
    boton.textContent = '';
    const a = capa(inicial, false), b = capa(o.despues, o.palomita);
    const cabezal = document.createElement('span');
    cabezal.className = 'im-cabezal';
    cabezal.setAttribute('aria-hidden', 'true');
    boton.append(a.el, b.el, cabezal);
    boton.setAttribute('aria-label', inicial);
    a.letras.forEach(l => l.classList.add('is-tinta'));

    let estado = 'a', espera = 0;

    function capa(texto, conPalomita) {
      const el = document.createElement('span');
      el.className = 'im-capa';
      el.setAttribute('aria-hidden', 'true');
      const letras = Array.from(texto).map(ch => {
        const s = document.createElement('span');
        s.className = 'im-letra'; s.textContent = ch;
        el.appendChild(s); return s;
      });
      if (conPalomita) {
        const s = document.createElement('span');
        s.className = 'im-letra im-palomita'; s.innerHTML = PALOMITA;
        el.appendChild(s); letras.push(s);
      }
      return { el, letras };
    }

    /* El cabezal cruza en la dirección «dir» (1: hacia la derecha, -1:
       hacia la izquierda). Lo que deja atrás se borra con un recorte, y
       cada letra nueva se estampa cuando el cabezal pasa por su centro:
       no antes, para que se lea como impresa por él. */
    function cruza(sale, entra, dir, fin) {
      if (reduce) {
        sale.letras.forEach(l => l.classList.remove('is-tinta'));
        entra.letras.forEach(l => l.classList.add('is-tinta'));
        return fin();
      }
      const caja = boton.getBoundingClientRect(), W = caja.width, M = 8;
      // el recorte se mide desde la propia capa, que va centrada en el botón
      const sc = sale.el.getBoundingClientRect(), x0 = sc.left - caja.left, x1 = sc.right - caja.left;
      const centros = entra.letras.map(l => {
        const r = l.getBoundingClientRect();
        return r.left - caja.left + r.width / 2;
      });
      boton.classList.add('is-imprimiendo');
      boton.classList.toggle('is-vuelta', dir < 0);
      let t0 = null;
      function paso(ts) {
        if (t0 === null) t0 = ts;
        const u = Math.min(1, (ts - t0) / o.duracion), k = curva(u);
        // entra y sale unos píxeles por fuera para que no asome quieto en el borde
        const x = dir > 0 ? -M + k * (W + 2 * M) : W + M - k * (W + 2 * M);
        cabezal.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
        sale.el.style.clipPath = dir > 0
          ? 'inset(0 0 0 ' + Math.max(0, x - x0).toFixed(1) + 'px)'
          : 'inset(0 ' + Math.max(0, x1 - x).toFixed(1) + 'px 0 0)';
        entra.letras.forEach((l, i) => {
          if (!l.classList.contains('is-tinta') && (dir > 0 ? x >= centros[i] : x <= centros[i]))
            l.classList.add('is-tinta', 'is-recien');
        });
        if (u < 1) { requestAnimationFrame(paso); return; }
        sale.letras.forEach(l => l.classList.remove('is-tinta'));
        sale.el.style.clipPath = '';
        boton.classList.remove('is-imprimiendo');
        setTimeout(() => entra.letras.forEach(l => l.classList.remove('is-recien')), 600);
        fin();
      }
      requestAnimationFrame(paso);
    }

    function imprime() {
      if (estado !== 'a') return;
      estado = 'yendo';
      boton.setAttribute('aria-label', o.despues);
      cruza(a, b, 1, () => {
        estado = 'b';
        if (o.vuelve) espera = setTimeout(restaura, o.vuelve);
      });
    }

    function restaura() {
      if (estado !== 'b') return;
      clearTimeout(espera);
      estado = 'volviendo';
      boton.setAttribute('aria-label', inicial);
      cruza(b, a, -1, () => { estado = 'a'; });
    }

    boton.addEventListener('click', imprime);
    return { imprime, restaura, estado: () => estado };
  }

  window.Imprenta = Imprenta;
})();
