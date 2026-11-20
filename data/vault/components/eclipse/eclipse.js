/* =====================================================================
   Eclipse · Moxen
   Un interruptor de día y noche con un eclipse dentro: al pasar a la
   noche, el sol cruza al otro lado mientras la luna lo va tapando, los
   rayos se recogen, quedan la corona y un filo de luz, y en el cielo
   aparecen las estrellas. Al volver, la luna se aparta y salen las
   nubes. Sin dependencias.

     Eclipse(document.querySelector('[data-eclipse]'), {
       tema: true,                 // además cambia el tema de la página
       cambia: noche => …,
     });
   ===================================================================== */
(function () {
  'use strict';

  function Eclipse(boton, opciones) {
    const o = Object.assign({ tema: false, cambia: null }, opciones);
    const raiz = document.documentElement;
    // con `tema`, el interruptor arranca como esté la página
    let noche = o.tema ? raiz.dataset.tema !== 'claro' : boton.getAttribute('aria-checked') === 'true';

    function pinta() {
      boton.classList.toggle('is-noche', noche);
      boton.setAttribute('aria-checked', noche ? 'true' : 'false');
    }

    boton.addEventListener('click', () => {
      noche = !noche;
      pinta();
      if (o.tema) {
        if (noche) delete raiz.dataset.tema; else raiz.dataset.tema = 'claro';
      }
      if (o.cambia) o.cambia(noche);
    });

    /* El estado inicial se pinta sin transiciones: si no, al cargar de
       noche se vería un eclipse entero sin haber tocado nada. */
    boton.classList.add('ec-quieto');
    pinta();
    requestAnimationFrame(() => requestAnimationFrame(() => boton.classList.remove('ec-quieto')));
    return { noche: () => noche, alterna: () => boton.click() };
  }

  window.Eclipse = Eclipse;
})();
