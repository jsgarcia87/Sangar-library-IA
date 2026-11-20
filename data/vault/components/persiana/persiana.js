/* =====================================================================
   Persiana · Moxen
   Texto que entra por franjas horizontales, como las lamas de una
   persiana: cada franja es una copia del texto recortada a su altura,
   que gira sobre su propio eje, de canto a plano, una detrás de otra de
   arriba abajo. Para cambiar de texto, las lamas se cierran, se cambia y
   se vuelven a abrir. Sin dependencias.

     const p = Persiana(document.querySelector('[data-persiana]'), { lamas: 14 });
     p.abre();                       // → Promise
     p.cambia('Otro<br>texto');      // cierra, cambia y abre → Promise
   ===================================================================== */
(function () {
  'use strict';

  function Persiana(el, opciones) {
    const o = Object.assign({ lamas: 12, abre: 820, cierra: 520, escalon: 38, perspectiva: 700 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let html = el.innerHTML.trim();
    el.textContent = '';
    const molde = document.createElement('span');
    molde.className = 'ps-molde';
    const capa = document.createElement('span');
    capa.className = 'ps-lamas';
    capa.setAttribute('aria-hidden', 'true');
    el.append(molde, capa);

    let lamas = [];
    function arma() {
      molde.innerHTML = html;
      molde.setAttribute('aria-hidden', 'true');
      el.setAttribute('aria-label', molde.textContent);
      capa.textContent = '';
      lamas = Array.from({ length: o.lamas }, () => {
        const l = document.createElement('span');
        l.className = 'ps-lama';
        l.innerHTML = html;
        capa.appendChild(l);
        return l;
      });
      mide();
    }

    /* Las franjas se cortan en píxeles sobre la altura real del bloque y
       se solapan medio píxel: sin eso, al estar planas, se vería una raya
       fina entre una y otra. El giro va con perspective() dentro de cada
       transform: cada lama tiene su propio punto de fuga, en su centro,
       y gira como una lama de verdad y no como parte de un todo. */
    function mide() {
      // la altura de la caja, no la del texto en línea (que mide la letra, no el renglón)
      const alto = capa.offsetHeight || el.offsetHeight;
      const h = alto / lamas.length;
      lamas.forEach((l, i) => {
        const arriba = i * h, abajo = alto - (i + 1) * h;
        l.style.clipPath = 'inset(' + Math.max(0, arriba - .5).toFixed(2) + 'px -20% ' + Math.max(0, abajo - .5).toFixed(2) + 'px -20%)';
        l.style.transformOrigin = '50% ' + (arriba + h / 2).toFixed(2) + 'px';
      });
    }

    const giro = g => 'perspective(' + o.perspectiva + 'px) rotateX(' + g + 'deg)';
    let vivas = [];
    function anima(cuadros, dura, curva) {
      vivas.forEach(a => a.cancel());
      vivas = lamas.map((l, i) => l.animate(cuadros, {
        duration: reduce ? 1 : dura, delay: reduce ? 0 : i * o.escalon, easing: curva, fill: 'both',
      }));
      // se espera con un reloj y no con .finished: así también se puede pausar y grabar
      const total = reduce ? 0 : dura + (lamas.length - 1) * o.escalon;
      return new Promise(listo => setTimeout(listo, total));
    }

    // de canto (−90°) a plano; la lama se va aclarando según da la cara
    const abre = () => anima([
      { transform: giro(-90), opacity: 0 },
      { opacity: .35, offset: .3 },
      { transform: giro(0), opacity: 1 },
    ], o.abre, 'cubic-bezier(.22, 1, .36, 1)');
    // y se cierra siguiendo el mismo sentido, hasta quedar de canto al otro lado
    const cierra = () => anima([
      { transform: giro(0), opacity: 1 },
      { transform: giro(90), opacity: 0 },
    ], o.cierra, 'cubic-bezier(.55, 0, .75, .2)');

    let cola = Promise.resolve();
    function cambia(nuevo) {
      cola = cola.then(() => cierra()).then(() => { html = nuevo; arma(); return abre(); });
      return cola;
    }

    arma();
    // con la letra ya cargada, el bloque puede medir otra cosa
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(mide);
    addEventListener('resize', mide, { passive: true });
    return { abre, cierra, cambia };
  }

  window.Persiana = Persiana;
})();
