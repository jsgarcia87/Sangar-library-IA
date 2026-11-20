/* =====================================================================
   Entrada · Moxen
   Una pantalla de carga: las letras de una palabra suben una a una
   desde debajo de su línea y la forman, una línea fina cuenta hasta
   100, y al terminar las letras siguen subiendo y la pantalla se
   levanta entera, dejando ver la página. Sin dependencias.

     const c = Entrada(document.querySelector('[data-entrada]'), {
       palabra: 'MOXEN',      // o el texto de data-entrada
       dura: 2600,            // ms que tarda la cuenta
       espera: 600,           // ms antes de que entre la primera letra
       repite: 0,             // ms para volver a empezar sola (0 = nunca)
     });
     c.corre();               // la vuelve a pasar desde el principio

   En una web de verdad, llama a c.sale() cuando la página esté lista.
   ===================================================================== */
(function () {
  'use strict';

  function Entrada(pantalla, opciones) {
    const o = Object.assign({ palabra: pantalla.dataset.entrada || 'MOXEN', dura: 2600, espera: 600, repite: 0 }, opciones);

    // la palabra, una letra por <span>, y debajo la línea con la cuenta
    pantalla.innerHTML = '<div class="en-centro"><p class="en-palabra"></p>'
      + '<div class="en-pie"><span class="en-linea"><i></i></span><span class="en-cuenta">0</span></div></div>';
    const palabra = pantalla.querySelector('.en-palabra');
    Array.from(o.palabra).forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'en-letra'; s.textContent = ch; s.style.setProperty('--i', i);
      palabra.appendChild(s);
    });
    const cuenta = pantalla.querySelector('.en-cuenta');

    // con movimiento reducido el orden y los tiempos son los mismos: solo
    // las transiciones se acortan (en el CSS)
    let relojes = [], raf = 0;
    const luego = (f, ms) => relojes.push(setTimeout(f, ms));

    /* La cuenta no avanza pareja: arranca rápido, duda un poco hacia
       la mitad y remata. Así se lee como una carga y no como un reloj. */
    const curva = p => p < .5 ? 2.4 * p * p * (1.5 - p) : 1 - Math.pow(1 - p, 3) * .9 - .1 * (1 - p);
    function cuentaHasta(t0) {
      const paso = t => {
        const p = Math.min(1, (t - t0) / o.dura), v = Math.min(1, Math.max(0, curva(p)));
        pantalla.style.setProperty('--en-avance', v.toFixed(4));
        cuenta.textContent = Math.round(v * 100);
        if (p < 1) raf = requestAnimationFrame(paso);
      };
      raf = requestAnimationFrame(paso);
    }

    function sale() {
      pantalla.classList.add('is-sale');
      luego(() => pantalla.classList.add('is-fuera'), 700);
    }

    function corre() {
      relojes.forEach(clearTimeout); relojes = [];
      cancelAnimationFrame(raf);
      // de vuelta al principio, sin transiciones, y se fuerza el cálculo
      pantalla.classList.add('sin-paso');
      pantalla.classList.remove('is-entra', 'is-sale', 'is-fuera');
      pantalla.style.setProperty('--en-avance', 0);
      cuenta.textContent = '0';
      void pantalla.offsetWidth;
      pantalla.classList.remove('sin-paso');

      luego(() => { pantalla.classList.add('is-entra'); cuentaHasta(performance.now()); }, o.espera);
      luego(sale, o.espera + o.dura + 250);
      if (o.repite) luego(corre, o.repite);
    }

    corre();
    return { corre, sale };
  }

  window.Entrada = Entrada;
})();
