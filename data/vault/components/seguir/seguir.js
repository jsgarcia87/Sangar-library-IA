/* =====================================================================
   Seguir · Moxen
   Un botón «Seguir» que pasa a «Siguiendo»: el ancho se estira con un
   rebote hasta la palabra nueva, las palabras se relevan en vertical y
   el contador de seguidores sube rodando, cifra a cifra.

     const s = Seguir(document.querySelector('.sg-boton'), { contador: el });
     s.alterna();      s.siguiendo();

   Las dos caras se miden al empezar; el botón anima entre esos dos
   anchos. Medir en cada clic haría que saltara si cambia la letra.
   ===================================================================== */
(function () {
  'use strict';

  const MAS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  const OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.6 4.6L19 7.5"/></svg>';
  // 1284 → «1.284», con el punto de miles como se escribe aquí
  const miles = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  function Contador(el, inicial) {
    let columnas = [];
    function pinta(n) {
      const s = miles(n);
      // si cambia la forma (999 → 1.000) se rehace; si no, solo ruedan las columnas
      if (s.replace(/\d/g, '0') !== el.dataset.forma) {
        el.dataset.forma = s.replace(/\d/g, '0');
        el.textContent = '';
        el.classList.add('sg-cuenta');
        columnas = [];
        for (const ch of s) {
          if (/\d/.test(ch)) {
            const c = document.createElement('span');
            c.className = 'sg-columna';
            c.innerHTML = '0123456789'.split('').map(d => '<span>' + d + '</span>').join('');
            el.appendChild(c); columnas.push(c);
          } else {
            const g = document.createElement('span');
            g.className = 'sg-signo'; g.textContent = ch; el.appendChild(g);
          }
        }
      }
      s.replace(/\D/g, '').split('').forEach((d, i) => {
        columnas[i].style.transform = 'translateY(' + (-d * 1.1) + 'em)';
      });
      el.setAttribute('aria-label', s);
    }
    pinta(inicial);
    return pinta;
  }

  function Seguir(boton, opciones) {
    const o = Object.assign({ despues: 'Siguiendo', contador: null }, opciones);
    const antes = boton.textContent.trim();
    boton.innerHTML = '<span class="sg-cara">' + MAS + '<span></span></span><span class="sg-cara">' + OK + '<span></span></span>';
    const [a, b] = boton.querySelectorAll('.sg-cara');
    a.lastChild.textContent = antes;
    b.lastChild.textContent = o.despues;
    boton.setAttribute('aria-pressed', 'false');

    let cuenta = o.contador ? +o.contador.dataset.seguirCuenta || 0 : 0;
    const pinta = o.contador ? Contador(o.contador, cuenta) : () => {};

    // el ancho de cada cara, con el relleno lateral del botón
    let anchos = [0, 0], sigue = false;
    function mide() {
      const relleno = parseFloat(getComputedStyle(boton).fontSize) * 1.5 * 2;
      anchos = [a, b].map(c => Math.ceil(c.getBoundingClientRect().width + relleno));
      boton.style.width = anchos[sigue ? 1 : 0] + 'px';
    }
    mide();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(mide);   // con la letra ya cargada

    function alterna() {
      sigue = !sigue;
      boton.classList.toggle('is-sigue', sigue);
      boton.setAttribute('aria-pressed', String(sigue));
      boton.style.width = anchos[sigue ? 1 : 0] + 'px';
      cuenta += sigue ? 1 : -1;
      pinta(cuenta);
    }

    boton.addEventListener('click', alterna);
    return { alterna, siguiendo: () => sigue };
  }

  window.Seguir = Seguir;
})();
