/* =====================================================================
   Triturar · Moxen
   Un botón de eliminar con trituradora: al pulsarlo se abre una ranura
   en su canto, el texto baja por ella y sale por debajo cortado en tiras
   de papel que se separan, giran y caen.

     const t = Triturar(document.querySelector('.tr-boton'), { hecho: 'Eliminado', vuelve: 2000 });
     t.tritura();      t.restaura();

   El texto de arriba y las tiras de abajo se mueven con el mismo número
   (los píxeles ya «tragados»): por eso el corte en la ranura es exacto.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function Triturar(boton, opciones) {
    const o = Object.assign({
      hecho: boton.dataset.hecho || 'Eliminado',
      tiras: 15,         // en cuántas tiras se corta
      ritmo: 125,        // px por segundo que traga la trituradora
      vuelve: 0,         // ms hasta volver a «Eliminar» (0: se queda)
    }, opciones);

    const etiqueta = document.createElement('span');
    etiqueta.className = 'tr-etiqueta';
    while (boton.firstChild) etiqueta.appendChild(boton.firstChild);
    const hecho = document.createElement('span');
    hecho.className = 'tr-hecho';
    hecho.textContent = o.hecho;
    const boca = document.createElement('span');
    boca.className = 'tr-boca';
    boca.setAttribute('aria-hidden', 'true');
    boton.append(etiqueta, hecho, boca);

    const sitio = document.createElement('span');
    sitio.className = 'tr-sitio';
    boton.replaceWith(sitio);
    const tiras = document.createElement('span');
    tiras.className = 'tr-tiras';
    tiras.setAttribute('aria-hidden', 'true');
    sitio.append(boton, tiras);

    let estado = 'entero', espera = 0;

    function tritura() {
      if (estado !== 'entero') return;
      estado = 'triturando';
      boton.setAttribute('aria-label', o.hecho);
      if (reduce) return acaba();

      const b = boton.getBoundingClientRect(), e = etiqueta.getBoundingClientRect();
      const H = b.height, margen = 12;
      // el papel de cada tira: el texto con un poco de margen arriba y abajo
      const px = e.left - b.left - margen, py = e.top - b.top - margen;
      const ancho = e.width + 2 * margen, alto = e.height + 2 * margen;
      const n = o.tiras, banda = ancho / n;

      const piezas = Array.from({ length: n }, (_, i) => {
        const t = document.createElement('span');
        t.className = 'tr-tira';
        t.innerHTML = etiqueta.innerHTML;
        t.style.cssText = 'width:' + ancho + 'px;height:' + alto + 'px;font:inherit;gap:.45em;' +
          'clip-path:inset(0 ' + (ancho - (i + 1) * banda + .5).toFixed(2) + 'px 0 ' + (i * banda + .5).toFixed(2) + 'px)';
        tiras.appendChild(t);
        return {
          t, x: 0, y: 0, vx: (Math.random() - .5) * 70, vy: 0, giro: 0, vg: (Math.random() - .5) * 90,
          suelta: Math.random() * .14, fase: Math.random() * 6.28,
        };
      });
      tiras.style.font = getComputedStyle(boton).font;

      boton.classList.add('is-triturando');
      /* «tragado» son los píxeles que han cruzado la ranura. El texto de
         arriba baja eso mismo, y la tira i está «tragado» px más abajo:
         lo que sigue por encima de la ranura lo recorta el contenedor. */
      const fin = H - py;                       // cuando el papel entero ha pasado
      let t0 = null, ultimo = null;
      function paso(ts) {
        if (t0 === null) { t0 = ultimo = ts + 200; }   // la ranura se abre antes de tragar
        const dt = Math.max(0, Math.min(.05, (ts - ultimo) / 1000));
        ultimo = Math.max(ultimo, ts);
        const tragado = Math.max(0, (ts - t0) / 1000 * o.ritmo);
        etiqueta.style.transform = 'translateY(' + Math.min(tragado, fin + alto).toFixed(1) + 'px)';
        let vivas = 0;
        piezas.forEach((p, i) => {
          const fuera = (tragado - fin) / o.ritmo;          // segundos desde que salió entera
          if (fuera < p.suelta) {
            // aún sale: baja al ritmo de la máquina y se abre un poco en abanico
            const salido = Math.max(0, Math.min(1, (py + tragado - H + alto) / alto));
            p.x = Math.sin(p.fase + ts / 120) * 1.2 * salido + (i - (n - 1) / 2) * 1.6 * salido;
            p.y = py + tragado - H;
            p.giro = (i - (n - 1) / 2) * 1.1 * salido;
            p.vy = o.ritmo;
          } else {
            // ya suelta: cae con gravedad, deriva y gira
            p.vy += 1500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.giro += p.vg * dt;
          }
          const desvanece = Math.max(0, Math.min(1, 1 - (fuera - p.suelta - .25) / .45));
          p.t.style.opacity = desvanece.toFixed(3);
          p.t.style.transform = 'translate(' + (px + p.x).toFixed(1) + 'px, ' + p.y.toFixed(1) + 'px) rotate(' + p.giro.toFixed(2) + 'deg)';
          if (desvanece > 0) vivas++;
        });
        // en cuanto el papel ha pasado entero, la máquina se para y el botón lo dice
        if (tragado >= fin && !boton.classList.contains('is-eliminado')) {
          boton.classList.remove('is-triturando');
          boton.classList.add('is-eliminado');
        }
        if (vivas) { requestAnimationFrame(paso); return; }
        tiras.textContent = '';
        acaba();
      }
      requestAnimationFrame(paso);
    }

    function acaba() {
      boton.classList.remove('is-triturando');
      boton.classList.add('is-eliminado');
      estado = 'eliminado';
      if (o.vuelve) espera = setTimeout(restaura, o.vuelve);
    }

    function restaura() {
      if (estado !== 'eliminado') return;
      clearTimeout(espera);
      boton.removeAttribute('aria-label');
      // el texto vuelve a entrar desde arriba, como recién puesto
      etiqueta.style.transition = 'none';
      etiqueta.style.transform = 'translateY(-110%)';
      void etiqueta.offsetWidth;
      etiqueta.style.transition = 'transform .55s cubic-bezier(.22, 1, .36, 1)';
      boton.classList.remove('is-eliminado');
      etiqueta.style.transform = '';
      setTimeout(() => { etiqueta.style.transition = ''; estado = 'entero'; }, 560);
    }

    boton.addEventListener('click', tritura);
    return { tritura, restaura, estado: () => estado };
  }

  window.Triturar = Triturar;
})();
