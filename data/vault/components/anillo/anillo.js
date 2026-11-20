/* =====================================================================
   Anillo · Moxen
   Un anillo de progreso con el porcentaje en el centro, que cuenta a la
   par que el arco. Al llegar a 100 la cifra se va, se dibuja un ✓ y el
   anillo late una vez. Para vaciarlo, la cola persigue a la cabeza y el
   arco se cierra sobre sí mismo. Sin dependencias.

     const a = Anillo(document.querySelector('[data-anillo]'));
     a.fija(.6);            // hasta el 60 %, en un tiempo que depende del tramo
     a.fija(1, 3400);       // hasta el final, en 3,4 s
     a.vacia();             // se vacía (a.vacia(0): de golpe)
   ===================================================================== */
(function () {
  'use strict';

  // acelera y frena: se lee como un trabajo que arranca y remata
  const suave = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function Anillo(el) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const arco = el.querySelector('.an-arco');
    const numero = el.querySelector('[data-anillo-numero]');
    // el arco va de la cola a la cabeza, las dos entre 0 y 1
    let cola = 0, cabeza = 0, raf = 0;

    function pinta() {
      const largo = Math.max(0, cabeza - cola) * 100;
      arco.style.strokeDasharray = largo.toFixed(3) + ' 100';
      arco.style.strokeDashoffset = (-cola * 100).toFixed(3);
      // con largo 0 el remate redondo dibujaría un punto: se esconde
      arco.style.opacity = largo > .05 ? 1 : 0;
      const p = Math.round((cabeza - cola) * 100);
      numero.textContent = p;
      el.setAttribute('aria-valuenow', p);
    }

    /* Lleva la cabeza (o la cola) de donde está a donde va, con una curva
       suave y en el tiempo dado. */
    function lleva(cual, hasta, ms, alFinal) {
      cancelAnimationFrame(raf);
      const desde = cual === 'cabeza' ? cabeza : cola;
      if (reduce || !ms) { if (cual === 'cabeza') cabeza = hasta; else cola = hasta; pinta(); if (alFinal) alFinal(); return; }
      let t0 = null;
      const paso = t => {
        if (t0 === null) t0 = t;
        const u = Math.min(1, (t - t0) / ms), v = desde + (hasta - desde) * suave(u);
        if (cual === 'cabeza') cabeza = v; else cola = v;
        pinta();
        if (u < 1) raf = requestAnimationFrame(paso);
        else if (alFinal) alFinal();
      };
      raf = requestAnimationFrame(paso);
    }

    function fija(p, ms) {
      p = Math.max(0, Math.min(1, p));
      el.classList.remove('is-listo');
      const dura = ms != null ? ms : 500 + Math.abs(p - cabeza) * 2400;
      lleva('cabeza', p, dura, () => { if (p >= 1) el.classList.add('is-listo'); });
    }
    // la cola alcanza a la cabeza; luego las dos vuelven a cero, sin verse
    function vacia(ms) {
      el.classList.remove('is-listo');
      lleva('cola', cabeza, ms != null ? ms : 700, () => { cola = cabeza = 0; pinta(); });
    }

    pinta();
    return { fija, vacia };
  }

  window.Anillo = Anillo;
})();
