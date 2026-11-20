/* =====================================================================
   Rayas · Moxen
   Una barra de progreso con rayas diagonales que avanzan mientras
   carga. Le dices hasta dónde va con fija(0…1) y la barra llega con un
   resorte suave, sin saltos aunque el progreso llegue a tirones; el
   porcentaje, los megas y el tiempo que falta se escriben solos. Al
   llegar a 1, las rayas se paran y queda lisa. Sin dependencias.

     const b = Rayas(document.querySelector('[data-rayas]'));
     b.fija(.4);      b.fija(1);      b.reinicia();     b.reinicia(true);  // sin fundido
   ===================================================================== */
(function () {
  'use strict';

  const num = (x, d) => x.toFixed(d).replace('.', ',');

  function Rayas(el, opciones) {
    const o = Object.assign({ total: +el.dataset.total || 0 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const barra = el.querySelector('[role="progressbar"]');
    const por = el.querySelector('[data-rayas-por]');
    const mb = el.querySelector('[data-rayas-mb]');
    const falta = el.querySelector('[data-rayas-falta]');

    let meta = 0, visto = 0, vel = 0, raf = 0, previo = 0;
    // la velocidad media reciente, para estimar lo que falta
    let ritmo = 0, ultimoAvance = 0;

    function pinta() {
      el.style.setProperty('--ry-avance', visto.toFixed(4));
      const p = Math.round(visto * 100);
      por.textContent = p + '%';
      barra.setAttribute('aria-valuenow', p);
      if (mb && o.total) mb.textContent = num(visto * o.total, 1) + ' MB de ' + num(o.total, 1) + ' MB';
      if (falta) {
        if (p === 100) falta.textContent = 'Completado';
        else if (ritmo > .01) falta.textContent = 'Quedan ' + Math.max(1, Math.ceil((1 - visto) / ritmo)) + ' s';
        else falta.textContent = 'Calculando…';
      }
    }

    /* Un resorte crítico persigue la meta: los saltos del progreso real
       se convierten en un avance continuo. */
    function paso(t) {
      const dt = Math.min(.032, (t - (previo || t)) / 1000);
      previo = t;
      const k = 34, c = 2 * Math.sqrt(k);
      vel += (-k * (visto - meta) - c * vel) * dt;
      visto = Math.min(1, Math.max(0, visto + vel * dt));
      ritmo += ((Math.max(0, vel)) - ritmo) * Math.min(1, dt * 1.5);
      pinta();
      if (Math.abs(visto - meta) < .0005 && Math.abs(vel) < .001) {
        visto = meta; pinta(); raf = 0; previo = 0;
        if (meta >= 1) el.classList.add('is-lista');
        return;
      }
      raf = requestAnimationFrame(paso);
    }

    function fija(p) {
      clearTimeout(vaciado);
      meta = Math.max(0, Math.min(1, p));
      el.classList.add('is-andando');
      if (reduce) { visto = meta; pinta(); if (meta >= 1) el.classList.add('is-lista'); return; }
      if (!raf) raf = requestAnimationFrame(paso);
    }
    /* Vuelve a cero: primero se apaga el relleno y después, ya sin
       verse, se ponen los números a cero. reinicia(true): de golpe. */
    let vaciado = 0;
    function reinicia(deGolpe) {
      cancelAnimationFrame(raf); raf = 0; previo = 0;
      const seVeia = el.classList.contains('is-andando');
      clearTimeout(vaciado);
      const cero = () => { meta = visto = vel = ritmo = 0; pinta(); };
      if (deGolpe === true || !seVeia || reduce) {
        el.classList.add('sin-paso');
        el.classList.remove('is-lista', 'is-andando');
        cero();
        void el.offsetWidth;
        el.classList.remove('sin-paso');
        return;
      }
      el.classList.remove('is-lista', 'is-andando');
      vaciado = setTimeout(cero, 350);
    }

    pinta();
    return { fija, reinicia };
  }

  window.Rayas = Rayas;
})();
