/* =====================================================================
   Telón · Moxen
   Un menú a pantalla completa que cae como un telón de teatro: tiras de
   tela plisada que bajan una tras otra —con el bajo festoneado y un
   rebote de tela con peso— y, cuando ya cubren, los enlaces suben uno a
   uno desde detrás de su línea. Al cerrar, todo sale en orden inverso.

     const t = Telon(document.querySelector('[data-telon]'), { pliegues: 9 });
     t.abre();      t.cierra();

   El botón apunta a su menú con aria-controls. Escape cierra, y el foco
   va al primer enlace al abrir y vuelve al botón al cerrar.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function Telon(boton, opciones) {
    const menu = document.getElementById(boton.getAttribute('aria-controls'));
    const o = Object.assign({ pliegues: Math.max(5, Math.round(innerWidth / 150)) }, opciones);

    /* Las tiras caen empezando por el lado del botón: el telón «sale»
       de donde se ha pulsado. --te-j es el orden de caída; --te-i, el de
       subida (al revés, para que se recoja hacia el mismo lado). */
    const telon = document.createElement('div');
    telon.className = 'te-telon';
    telon.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < o.pliegues; i++) {
      const p = document.createElement('i');
      p.className = 'te-pliegue';
      p.style.setProperty('--te-i', i);
      p.style.setProperty('--te-j', o.pliegues - 1 - i);
      telon.appendChild(p);
    }
    document.body.appendChild(telon);
    menu.querySelectorAll('a').forEach((a, i) => a.style.setProperty('--te-i', i));
    const raiz = document.documentElement;

    let abierto = false, espera = 0;
    function abre() {
      if (abierto) return;
      abierto = true;
      clearTimeout(espera);
      menu.hidden = false;
      void menu.offsetWidth;                  // para que las transiciones arranquen desde fuera
      raiz.classList.add('is-telon');
      boton.setAttribute('aria-expanded', 'true');
      boton.setAttribute('aria-label', 'Cerrar menú');
      setTimeout(() => { const a = menu.querySelector('a'); if (a) a.focus({ preventScroll: true }); }, reduce ? 0 : 1000);
    }
    function cierra() {
      if (!abierto) return;
      abierto = false;
      raiz.classList.remove('is-telon');
      boton.setAttribute('aria-expanded', 'false');
      boton.removeAttribute('aria-label');
      // el menú se esconde del todo cuando el telón ya ha subido
      espera = setTimeout(() => { menu.hidden = true; }, reduce ? 0 : 1100);
      if (menu.contains(document.activeElement)) boton.focus({ preventScroll: true });
    }

    boton.addEventListener('click', () => abierto ? cierra() : abre());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') cierra(); });
    return { abre, cierra, abierto: () => abierto };
  }

  window.Telon = Telon;
})();
