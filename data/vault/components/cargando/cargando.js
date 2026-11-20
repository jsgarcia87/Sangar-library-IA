/* =====================================================================
   Cargando · Moxen
   La palabra «Cargando» con las letras saltando en ola: cada una se
   agacha, sube estirándose, cae y se aplasta al tocar el suelo, con su
   sombra encogiéndose debajo. Todo el salto está en cargando.css; esto
   solo separa las letras y les da su turno. Sin dependencias.

     Cargando(document.querySelector('[data-cargando]'));

   Sirve con cualquier texto; el ritmo, el desfase y la altura del salto
   son variables CSS (--cg-ritmo, --cg-desfase, --cg-salto).
   ===================================================================== */
(function () {
  'use strict';

  function Cargando(el) {
    const texto = el.textContent.trim();
    // el lector de pantalla oye la palabra entera, no letra a letra
    el.setAttribute('aria-label', texto.replace(/\.+$/, ''));
    el.textContent = '';
    Array.from(texto).forEach((ch, i) => {
      const letra = document.createElement('span');
      letra.className = 'cg-letra';
      letra.setAttribute('aria-hidden', 'true');
      letra.style.setProperty('--i', i);
      const i_ = document.createElement('i');
      i_.textContent = ch === ' ' ? ' ' : ch;
      letra.appendChild(i_);
      el.appendChild(letra);
    });
    return el;
  }

  window.Cargando = Cargando;
})();
