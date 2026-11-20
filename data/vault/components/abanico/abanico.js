/* =====================================================================
   Abanico · Moxen
   Un botón de compartir que se abre como un abanico: una tela plisada
   se despliega de izquierda a derecha y las opciones salen girando del
   centro hasta su pliegue, una detrás de otra. Se cierra en orden inverso.

     const a = Abanico(document.querySelector('[data-abanico]'));
     a.abre();      a.cierra();      a.alterna();

   Dentro van [data-abanico-boton] y las opciones [data-abanico-opcion]:
   pon cuantas quieras, se reparten solas a lo largo del medio círculo.
   ===================================================================== */
(function () {
  'use strict';

  function Abanico(raiz, opciones) {
    // sin «radio», las opciones van a dos tercios de la tela (--ab-radio)
    const tela0 = parseFloat(getComputedStyle(raiz).getPropertyValue('--ab-radio')) || 230;
    const o = Object.assign({
      radio: Math.round(tela0 * .69),   // px del centro a cada opción
      alPulsar: null,                   // función(opción) cuando se elige una
    }, opciones);
    const boton = raiz.querySelector('[data-abanico-boton]');
    const lista = Array.from(raiz.querySelectorAll('[data-abanico-opcion]'));
    const n = lista.length;

    const tela = document.createElement('span');
    tela.className = 'ab-tela';
    tela.setAttribute('aria-hidden', 'true');
    raiz.prepend(tela);

    /* Cada opción, en el centro de su porción del medio círculo: de la
       izquierda (180°) a la derecha (360°), pasando por arriba. Los
       índices van en variables CSS para escalonar la entrada y la salida. */
    lista.forEach((op, i) => {
      const a = Math.PI + (i + .5) * Math.PI / n;
      op.style.setProperty('--ab-x', (Math.cos(a) * o.radio).toFixed(1) + 'px');
      op.style.setProperty('--ab-y', (Math.sin(a) * o.radio).toFixed(1) + 'px');
      op.style.setProperty('--ab-i', i);
      op.style.setProperty('--ab-n', n);
      op.tabIndex = -1;
    });
    boton.setAttribute('aria-expanded', 'false');

    let abierto = false, hecho = 0;
    function pon(v) {
      abierto = v;
      raiz.classList.toggle('is-abierto', v);
      boton.setAttribute('aria-expanded', String(v));
      lista.forEach(op => { op.tabIndex = v ? 0 : -1; });
    }
    const abre = () => { clearTimeout(hecho); raiz.classList.remove('is-hecho'); pon(true); };
    const cierra = () => pon(false);
    const alterna = () => abierto ? cierra() : abre();

    boton.addEventListener('click', alterna);
    lista.forEach(op => op.addEventListener('click', () => {
      if (o.alPulsar) o.alPulsar(op);
      cierra();
      // una palomita breve en el botón: la acción se hizo
      raiz.classList.add('is-hecho');
      clearTimeout(hecho);
      hecho = setTimeout(() => raiz.classList.remove('is-hecho'), 1300);
    }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && abierto) { cierra(); boton.focus(); } });
    document.addEventListener('pointerdown', e => { if (abierto && !raiz.contains(e.target)) cierra(); });

    return { abre, cierra, alterna, abierto: () => abierto };
  }

  window.Abanico = Abanico;
})();
