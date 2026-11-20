/* =====================================================================
   Cuenta · Moxen
   Una cuenta regresiva de paletas, como los relojes de aeropuerto: cada
   cifra que cambia se voltea —la mitad de arriba cae de canto y la de
   abajo termina de bajar con un rebote—. Cuando cambian varias a la
   vez, caen de derecha a izquierda, un pelo desfasadas. Sin dependencias.

     const c = Cuenta(document.querySelector('[data-cuenta]'), {
       nombres: ['horas', 'minutos', 'segundos'],
       alTerminar: () => { … },
     });
     c.desde(3600);        // vuelve a empezar con esos segundos
   ===================================================================== */
(function () {
  'use strict';

  const dos = n => String(n).padStart(2, '0');

  function Cuenta(raiz, opciones) {
    const o = Object.assign({ segundos: +raiz.dataset.cuenta || 60, nombres: ['horas', 'minutos', 'segundos'], alTerminar: null }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // tres grupos de dos paletas, con los dos puntos entre medio
    const cartas = [];
    o.nombres.forEach((nombre, g) => {
      if (g) raiz.insertAdjacentHTML('beforeend', '<span class="ct-dos" aria-hidden="true"><i></i><i></i></span>');
      const grupo = document.createElement('div');
      grupo.className = 'ct-grupo';
      grupo.innerHTML = '<div class="ct-par" aria-hidden="true"></div><span class="ct-nombre">' + nombre + '</span>';
      raiz.appendChild(grupo);
      for (let k = 0; k < 2; k++) {
        const c = document.createElement('div');
        c.className = 'ct-carta';
        c.innerHTML = '<div class="ct-mitad ct-arriba"><span>0</span></div><div class="ct-mitad ct-abajo"><span>0</span></div>'
          + '<div class="ct-mitad ct-arriba ct-hoja"><span>0</span></div><div class="ct-mitad ct-abajo ct-hoja"><span>0</span></div>';
        grupo.firstChild.appendChild(c);
        const [arriba, abajo, hojaArriba, hojaAbajo] = Array.from(c.children).map(m => m.firstChild);
        cartas.push({ c, arriba, abajo, hojaArriba, hojaAbajo, valor: null, reloj: 0 });
      }
    });

    function voltea(carta, nuevo, espera) {
      const viejo = carta.valor;
      carta.valor = nuevo;
      clearTimeout(carta.reloj);
      if (viejo === null || reduce) {
        carta.arriba.textContent = carta.abajo.textContent = nuevo;
        return;
      }
      setTimeout(() => {
        // detrás: arriba ya la nueva, abajo aún la vieja; delante, al revés
        carta.arriba.textContent = nuevo; carta.abajo.textContent = viejo;
        carta.hojaArriba.textContent = viejo; carta.hojaAbajo.textContent = nuevo;
        carta.c.classList.remove('is-voltea');
        void carta.c.offsetWidth;          // para que la animación vuelva a empezar
        carta.c.classList.add('is-voltea');
        carta.reloj = setTimeout(() => { carta.abajo.textContent = nuevo; carta.c.classList.remove('is-voltea'); }, 760);
      }, espera);
    }

    let quedan = 0, tic = 0;
    function muestra() {
      const h = Math.floor(quedan / 3600), m = Math.floor(quedan / 60) % 60, s = quedan % 60;
      const cifras = (dos(h) + dos(m) + dos(s)).split('');
      raiz.setAttribute('aria-label', h + ' horas, ' + m + ' minutos y ' + s + ' segundos');
      // de derecha a izquierda: la de los segundos cae primero
      let orden = 0;
      for (let i = cifras.length - 1; i >= 0; i--) {
        if (cartas[i].valor !== cifras[i]) voltea(cartas[i], cifras[i], (orden++) * 45);
      }
    }
    function late() {
      if (quedan <= 0) { if (o.alTerminar) o.alTerminar(); return; }
      quedan--;
      muestra();
      tic = setTimeout(late, 1000);
    }
    function desde(segundos) {
      clearTimeout(tic);
      quedan = Math.max(0, Math.floor(segundos));
      muestra();
      tic = setTimeout(late, 1000);
    }

    desde(o.segundos);
    return { desde, quedan: () => quedan };
  }

  window.Cuenta = Cuenta;
})();
