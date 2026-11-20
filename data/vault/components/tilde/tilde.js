/* =====================================================================
   Tilde · Moxen
   Un interruptor que, al activarse, se recoge en un ✓: la perilla corre
   hasta el final, el carril se encoge hasta ser un círculo y dentro se
   dibuja la marca. Al desactivarlo, lo mismo al revés. Toda la
   coreografía está en tilde.css; esto solo cambia el estado.

     <button role="switch" aria-checked="false" data-tilde>…</button>

   Se inicia solo sobre cada [data-tilde]. Avisa con un evento «cambio»
   (e.detail = true / false). Sin dependencias.
   ===================================================================== */
(function () {
  'use strict';

  function Tilde(boton) {
    function fija(activo) {
      boton.setAttribute('aria-checked', String(activo));
      boton.classList.add('is-tocada');
      boton.dispatchEvent(new CustomEvent('cambio', { detail: activo, bubbles: true }));
    }
    // un <button> ya responde a Enter y Espacio con un clic
    boton.addEventListener('click', () => fija(boton.getAttribute('aria-checked') !== 'true'));
    return { fija, activo: () => boton.getAttribute('aria-checked') === 'true' };
  }

  document.querySelectorAll('[data-tilde]').forEach(Tilde);
  window.Tilde = Tilde;
})();
