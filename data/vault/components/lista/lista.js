/* =====================================================================
   Lista · Moxen
   Una lista de tareas que se completa una a una: la que está en curso
   se enciende con un brillo y su aro gira; al terminar, el círculo se
   llena, se dibuja el ✓ y aparece lo que tardó. Cuando caen todas, el
   título cambia. Sin dependencias.

     const l = Lista(document.querySelector('[data-lista]'));
     l.empieza(0);   l.completa(0);        // a mano, con tu proceso real
     l.corre([800, 1000, 700], 250);       // o sola, con esos tiempos (ms)
     l.reinicia();
   ===================================================================== */
(function () {
  'use strict';

  const ICONO = '<svg viewBox="0 0 26 26" aria-hidden="true">'
    + '<circle class="ls-aro" cx="13" cy="13" r="12"/>'
    + '<circle class="ls-giro" cx="13" cy="13" r="12" pathLength="100"/>'
    + '<circle class="ls-lleno" cx="13" cy="13" r="13"/>'
    + '<path class="ls-marca" d="M8 13.4l3.4 3.4L18.2 9.6"/></svg>';

  function Lista(raiz) {
    const filas = Array.from(raiz.querySelectorAll('.ls-tareas li'));
    const cuenta = raiz.querySelector('[data-lista-cuenta]');
    filas.forEach(li => {
      li.innerHTML = '<span class="ls-icono">' + ICONO + '</span><span class="ls-texto">' + li.textContent + '</span><span class="ls-tiempo"></span>';
    });
    const inicio = [];
    let relojes = [];

    function resume() {
      const hechas = filas.filter(li => li.classList.contains('is-hecha')).length;
      if (cuenta) cuenta.textContent = hechas + ' de ' + filas.length;
      raiz.style.setProperty('--ls-avance', (hechas / filas.length).toFixed(3));
      raiz.classList.toggle('is-terminada', hechas === filas.length);
    }
    function empieza(i) {
      const li = filas[i];
      if (!li) return;
      li.classList.add('is-curso');
      li.removeAttribute('aria-label');
      inicio[i] = performance.now();
    }
    function completa(i) {
      const li = filas[i];
      if (!li) return;
      li.classList.remove('is-curso');
      li.classList.add('is-hecha');
      // lo que tardó, con una coma decimal
      const s = (performance.now() - (inicio[i] || performance.now())) / 1000;
      li.querySelector('.ls-tiempo').textContent = s.toFixed(1).replace('.', ',') + ' s';
      li.setAttribute('aria-label', li.querySelector('.ls-texto').textContent + ': hecho');
      resume();
    }
    // reinicia(true): de golpe, sin las transiciones de vuelta
    function reinicia(deGolpe) {
      relojes.forEach(clearTimeout); relojes = [];
      if (deGolpe === true) raiz.classList.add('sin-paso');
      filas.forEach(li => { li.classList.remove('is-curso', 'is-hecha'); li.removeAttribute('aria-label'); });
      resume();
      if (deGolpe === true) { void raiz.offsetWidth; raiz.classList.remove('sin-paso'); }
    }
    // en cadena: cada tarea empieza justo cuando termina la anterior
    function corre(tiempos, espera) {
      reinicia(true);
      let t = espera || 0;
      filas.forEach((_, i) => {
        relojes.push(setTimeout(() => empieza(i), t));
        t += tiempos[i % tiempos.length];
        relojes.push(setTimeout(() => completa(i), t));
      });
    }

    resume();
    return { empieza, completa, corre, reinicia };
  }

  window.Lista = Lista;
})();
