/* =====================================================================
   Migas · Moxen
   Unas migas de pan que lo son de verdad: las del medio del camino se
   quedan en puntitos y, al pasar el cursor, se abren una tras otra en
   etiquetas con su nombre. Al salir, vuelven a ser migas.

     const m = Migas(document.querySelector('[data-migas]'));
     m.abre();      m.cierra();

   El texto de cada miga se mide una vez y se anima hasta ese ancho
   exacto: así cada una se abre lo justo, ni más ni menos.
   ===================================================================== */
(function () {
  'use strict';

  const FLECHA = '<svg class="mi-separa" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6l6 6-6 6"/></svg>';

  function Migas(nav, opciones) {
    const o = Object.assign({ escalon: 55 }, opciones);
    const items = Array.from(nav.querySelectorAll('li'));

    // un separador antes de cada miga menos la primera; las del medio, marcadas
    items.forEach((li, i) => {
      if (i) li.insertAdjacentHTML('afterbegin', FLECHA);
      if (i > 0 && i < items.length - 1) li.classList.add('is-medio');
    });

    function mide() {
      nav.querySelectorAll('.mi-miga > span').forEach(s => {
        s.style.maxWidth = 'none';
        s.style.setProperty('--mi-w', Math.ceil(s.scrollWidth + 2) + 'px');
        s.style.maxWidth = '';
      });
    }

    /* El escalón: al abrir, de izquierda a derecha; al cerrar, de
       derecha a izquierda. Cada miga lleva su espera en --mi-espera. */
    function escalona(abriendo) {
      const n = items.length;
      items.forEach((li, i) => {
        const orden = abriendo ? i : n - 1 - i;
        li.style.setProperty('--mi-espera', (orden * o.escalon) + 'ms');
      });
    }

    let abierta = false;
    function abre() { if (abierta) return; abierta = true; escalona(true); nav.classList.add('is-abierta'); }
    function cierra() { if (!abierta) return; abierta = false; escalona(false); nav.classList.remove('is-abierta'); }

    nav.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') abre(); });
    nav.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') cierra(); });
    nav.addEventListener('focusin', abre);
    nav.addEventListener('focusout', e => { if (!nav.contains(e.relatedTarget)) cierra(); });
    // con el dedo: el primer toque abre el camino en lugar de seguir el enlace
    nav.addEventListener('click', e => {
      if (!abierta) { e.preventDefault(); abre(); }
    });
    document.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && !nav.contains(e.target)) cierra(); });

    mide();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(mide);
    return { abre, cierra, abierta: () => abierta };
  }

  window.Migas = Migas;
})();
