/* =====================================================================
   Altavoz · Moxen
   El botón de silenciar: con sonido, las ondas laten y del botón salen
   ecos; al silenciar, las ondas se recogen hacia el altavoz —de fuera
   hacia dentro— y se dibuja una cruz. Al volver, salen otra vez. Toda
   la animación está en altavoz.css; esto solo cambia el estado.

     <button aria-pressed="false" data-altavoz>…</button>

   Se inicia solo sobre cada [data-altavoz] y avisa con un evento
   «silencio» (e.detail = true / false). Sin dependencias.
   ===================================================================== */
(function () {
  'use strict';

  function Altavoz(boton, opciones) {
    const o = Object.assign({ textos: ['Silenciar', 'Activar el sonido'] }, opciones);
    function fija(callado) {
      boton.setAttribute('aria-pressed', String(callado));
      // la etiqueta dice lo que hará el botón, no lo que está pasando
      boton.setAttribute('aria-label', o.textos[callado ? 1 : 0]);
      boton.dispatchEvent(new CustomEvent('silencio', { detail: callado, bubbles: true }));
    }
    boton.addEventListener('click', () => fija(boton.getAttribute('aria-pressed') !== 'true'));
    return { fija, callado: () => boton.getAttribute('aria-pressed') === 'true' };
  }

  document.querySelectorAll('[data-altavoz]').forEach(b => Altavoz(b));
  window.Altavoz = Altavoz;
})();
