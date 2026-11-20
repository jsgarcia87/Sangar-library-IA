/* =====================================================================
   Baraja · Moxen
   Un mazo de tarjetas que se abre en abanico al pasar el cursor: cada
   carta gira alrededor de un eje bajo el mazo, con un rebote corto, y la
   que tiene el cursor encima sube y aparta a sus vecinas. En el teléfono
   se abre y se cierra con un toque. Sin dependencias.

     const b = Baraja(document.querySelector('[data-baraja]'), { apertura: 13 });
     b.abre();      b.cierra();

   apertura: grados entre una carta y la siguiente.
   ===================================================================== */
(function () {
  'use strict';

  function Baraja(mazo, opciones) {
    const o = Object.assign({ apertura: 13, aparte: 4, escalon: 34 }, opciones);
    const cartas = Array.from(mazo.querySelectorAll('[data-carta]'));
    const n = cartas.length, medio = (n - 1) / 2;

    /* El desorden del mazo cerrado sale de una semilla fija y no de
       Math.random: así queda igual en cada visita. */
    const azar = k => { const s = Math.sin(k * 91.7 + 13.1) * 43758.5; return s - Math.floor(s) - .5; };
    cartas.forEach((c, i) => {
      const arriba = i === n - 1;   // la de encima va casi recta
      c.style.setProperty('--giro', (arriba ? 0 : azar(i) * 18).toFixed(1) + 'deg');
      c.style.setProperty('--x', (arriba ? 0 : azar(i + 7) * 26).toFixed(1) + 'px');
      c.style.setProperty('--y', (arriba ? 0 : azar(i + 3) * 10).toFixed(1) + 'px');
      c.style.setProperty('--abanico', ((i - medio) * o.apertura).toFixed(1) + 'deg');
    });

    /* Al abrir salen primero las de encima, y al cerrar vuelven primero
       las de los extremos: el escalonado sigue la lógica del mazo. */
    function escalona(abriendo) {
      cartas.forEach((c, i) => {
        const orden = abriendo ? n - 1 - i : Math.abs(i - medio) * -1 + medio;
        c.style.setProperty('--retraso', (orden * o.escalon) + 'ms');
      });
    }

    let recien = 0;
    function abre() {
      if (mazo.hasAttribute('data-abierta')) return;
      escalona(true);
      mazo.setAttribute('data-abierta', '');
      // mientras se reparte, el escalonado manda; luego, el foco es inmediato
      clearTimeout(recien);
      recien = setTimeout(() => { recien = 0; }, n * o.escalon + 120);
    }
    function cierra() {
      if (!mazo.hasAttribute('data-abierta')) return;
      escalona(false);
      enfoca(-1);
      mazo.removeAttribute('data-abierta');
    }

    // la carta con el cursor sube; las demás se apartan unos grados
    function enfoca(k) {
      cartas.forEach((c, i) => {
        c.toggleAttribute('data-foco', i === k);
        const lado = k < 0 || i === k ? 0 : (i < k ? -1 : 1);
        c.style.setProperty('--aparte', (lado * o.aparte) + 'deg');
        if (k >= 0 && !recien) c.style.setProperty('--retraso', '0ms');
      });
    }

    /* Se abre al tocar una carta, no al entrar en la caja: la caja es
       grande para que el abanico abierto no se cierre al pasar entre dos
       cartas, y se cierra solo al salir de ella. */
    mazo.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') cierra(); });
    cartas.forEach((c, i) => {
      c.addEventListener('pointerenter', e => {
        if (e.pointerType !== 'mouse') return;
        abre(); enfoca(i);
      });
      c.addEventListener('pointerleave', e => {
        const otra = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('[data-carta]');
        if (e.pointerType === 'mouse' && !otra && mazo.hasAttribute('data-abierta')) enfoca(-1);
      });
      c.addEventListener('focus', () => { abre(); enfoca(i); });
      /* En pantalla táctil el primer toque abre el mazo en vez de seguir
         el enlace; con el mazo abierto, el toque ya es un clic normal. */
      c.addEventListener('click', e => {
        if (!mazo.hasAttribute('data-abierta')) { e.preventDefault(); abre(); }
      });
    });
    mazo.addEventListener('focusout', e => { if (!mazo.contains(e.relatedTarget)) cierra(); });
    document.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' && !mazo.contains(e.target)) cierra();
    });

    return { abre, cierra };
  }

  window.Baraja = Baraja;
})();
