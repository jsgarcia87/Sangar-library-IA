/* =====================================================================
   Flotante · Moxen
   Un campo con la etiqueta dentro: al entrar o al escribir, la etiqueta
   sube y se encoge letra a letra, como una ola, y la línea de abajo crece
   desde el punto donde tocaste. Si el campo queda vacío, vuelve a bajar.
   Sin dependencias.

     document.querySelectorAll('[data-flotante]').forEach(c => Flotante(c));
   ===================================================================== */
(function () {
  'use strict';

  function Flotante(campo) {
    const entrada = campo.querySelector('input, textarea');
    const etiqueta = campo.querySelector('.fl-etiqueta');
    const texto = etiqueta.textContent;
    // el lector de pantalla lee la etiqueta entera, no letra por letra
    entrada.setAttribute('aria-label', texto);
    etiqueta.setAttribute('aria-hidden', 'true');
    etiqueta.textContent = '';
    const letras = Array.from(texto).map((ch, i) => {
      const s = document.createElement('span');
      s.className = 'fl-letra'; s.textContent = ch;
      s.style.setProperty('--i', i);
      etiqueta.appendChild(s);
      return s;
    });
    etiqueta.style.setProperty('--n', letras.length);

    /* Al encogerse, cada letra se acerca al principio en proporción a lo
       que tiene delante. Se mide la posición en reposo, sin transformar. */
    function mide() {
      const k = parseFloat(getComputedStyle(campo).getPropertyValue('--fl-escala')) || .6;
      letras.forEach(l => l.style.setProperty('--dx', (l.offsetLeft * (k - 1)).toFixed(2) + 'px'));
    }

    function pinta() {
      const foco = document.activeElement === entrada;
      campo.classList.toggle('is-foco', foco);
      campo.classList.toggle('is-arriba', foco || entrada.value !== '');
    }

    // la línea crece desde el punto del clic
    campo.addEventListener('pointerdown', e => {
      const r = campo.getBoundingClientRect();
      campo.style.setProperty('--fl-origen', (e.clientX - r.left).toFixed(0) + 'px');
    });
    entrada.addEventListener('focus', pinta);
    entrada.addEventListener('blur', pinta);
    entrada.addEventListener('input', pinta);
    // un reset cambia los valores después del evento: se mira en el siguiente turno
    if (entrada.form) entrada.form.addEventListener('reset', () => setTimeout(pinta, 0));

    (document.fonts ? document.fonts.ready : Promise.resolve()).then(mide);
    addEventListener('resize', mide);
    mide();
    pinta();
    return { pinta, mide };
  }

  window.Flotante = Flotante;
})();
