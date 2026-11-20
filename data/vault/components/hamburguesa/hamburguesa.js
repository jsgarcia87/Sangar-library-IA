/* =====================================================================
   Hamburguesa · Moxen
   Tres maneras de convertir las tres líneas del menú en una X:
     · Cruce: se juntan en el centro y después giran (y al cerrar, al revés).
     · Giro:  el ícono entero da media vuelta mientras forma la X.
     · Trazo: cada línea corre por un camino SVG que acaba en la diagonal.

     Hamburguesa(document.querySelector('.hb-boton'));
     // abre y cierra con clic; avisa con aria-expanded y el evento «hamburguesa»

   Todo el movimiento está en el CSS. El JS solo cambia el estado y, en
   la variante Trazo, mide cada camino para saber dónde termina.
   ===================================================================== */
(function () {
  'use strict';

  function Hamburguesa(boton) {
    /* En Trazo, el tramo visible (45 px) tiene que acabar justo al final
       del camino: para eso hace falta su largo total, que depende de la
       curva. Se mide una vez y va a una variable CSS. */
    boton.querySelectorAll('path').forEach(p => {
      const l = p.getTotalLength();
      p.style.setProperty('--hb-l', l.toFixed(2) + 'px');
    });

    function pon(abierta) {
      boton.classList.toggle('is-abierta', abierta);
      boton.setAttribute('aria-expanded', String(abierta));
      boton.dispatchEvent(new CustomEvent('hamburguesa', { bubbles: true, detail: { abierta } }));
    }
    boton.addEventListener('click', () => pon(boton.getAttribute('aria-expanded') !== 'true'));
    return { abre: () => pon(true), cierra: () => pon(false) };
  }

  window.Hamburguesa = Hamburguesa;
})();
