/* =====================================================================
   Doble · Moxen
   Un botón con dos caras sobre un bloque 3D: delante, el texto; al pasar
   el cursor, el bloque rueda y enseña la otra cara, con una flecha. Rueda
   hacia donde viene el cursor: si entra por arriba, la cara baja desde
   arriba; si entra por abajo, sube desde abajo.

     Doble(document.querySelector('.db-boton'));

   La flecha va en la cara de arriba y en la de abajo: así el bloque
   puede rodar hacia los dos lados y siempre encuentra la flecha.
   ===================================================================== */
(function () {
  'use strict';

  const FLECHA = '<svg class="db-flecha" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

  function Doble(boton) {
    const texto = boton.innerHTML;
    boton.innerHTML =
      '<span class="db-bloque">' +
        '<span class="db-cara db-frente">' + texto + '</span>' +
        '<span class="db-cara db-arriba" aria-hidden="true">' + FLECHA + '</span>' +
        '<span class="db-cara db-abajo" aria-hidden="true">' + FLECHA + '</span>' +
      '</span>';

    function gira(haciaAbajo) {
      boton.style.setProperty('--db-giro', haciaAbajo ? '-90deg' : '90deg');
      boton.classList.add('is-girado');
    }
    function vuelve() {
      boton.style.setProperty('--db-giro', '0deg');
      boton.classList.remove('is-girado');
    }

    /* Por dónde entra: por encima del centro, la cara de arriba baja;
       por debajo, la de abajo sube. */
    boton.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      const r = boton.getBoundingClientRect();
      gira(e.clientY < r.top + r.height / 2);
    });
    boton.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') vuelve(); });
    // con el teclado, el foco hace de cursor
    boton.addEventListener('focus', () => { if (boton.matches(':focus-visible')) gira(true); });
    boton.addEventListener('blur', vuelve);
    // con el dedo, el primer toque gira y el segundo ya entra
    boton.addEventListener('click', e => {
      if (!boton.classList.contains('is-girado') && matchMedia('(hover: none)').matches) { e.preventDefault(); gira(true); }
    });
    return { gira, vuelve };
  }

  window.Doble = Doble;
})();
