/* =====================================================================
   Cortina · Moxen
   Una ventana modal que entra como una cortina de teatro: el fondo cae
   en pliegues, uno tras otro de izquierda a derecha, con el pequeño
   rebote de la tela al llegar abajo; luego baja la ventana colgada de su
   borde de arriba y se balancea hasta quedarse quieta. Al cerrar, todo
   sube al revés. Sin dependencias.

     const c = Cortina(document.querySelector('[data-cortina]'), { pliegues: 9 });
     c.abre(botonQueLaAbrio);     c.cierra();

   Esc y un clic en la tela también la cierran. El foco entra en la
   ventana al abrir y vuelve al botón al cerrar.
   ===================================================================== */
(function () {
  'use strict';

  function Cortina(capa, opciones) {
    const o = Object.assign({ pliegues: 9, cae: 760, escalon: 42 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ventana = capa.querySelector('[role="dialog"]');

    const tela = document.createElement('div');
    tela.className = 'ct-pliegues';
    tela.setAttribute('aria-hidden', 'true');
    const pliegues = Array.from({ length: o.pliegues }, () => {
      const p = document.createElement('i');
      p.className = 'ct-pliegue';
      tela.appendChild(p);
      return p;
    });
    capa.prepend(tela);

    let abierta = false, origen = null, vivas = [];
    const para = () => { vivas.forEach(a => a.cancel()); vivas = []; };
    const anima = (el, cuadros, op) => { const a = el.animate(cuadros, Object.assign({ fill: 'both' }, op)); vivas.push(a); return a; };

    /* Cada pliegue cae con aceleración (ease-in, como la gravedad), toca
       abajo, rebota un 2 % y se asienta. El retraso va creciendo: la
       cortina se desenrolla de un lado al otro. */
    function abre(desde) {
      if (abierta) return;
      abierta = true; origen = desde || document.activeElement;
      para();
      capa.classList.add('is-abierta');
      const d = reduce ? 1 : o.cae;
      pliegues.forEach((p, i) => anima(p, [
        { transform: 'translateY(-102%)', easing: 'cubic-bezier(.5, 0, .75, .1)' },
        { transform: 'translateY(0)', offset: .7, easing: 'cubic-bezier(.22, 1, .36, 1)' },
        { transform: 'translateY(-2.2%)', offset: .85, easing: 'ease-in-out' },
        { transform: 'translateY(0)' },
      ], { duration: d, delay: reduce ? 0 : i * o.escalon }));

      // la ventana baja colgada de arriba y se balancea: gira menos cada vez
      anima(ventana, [
        { transform: 'translateY(-115vh) rotate(-7deg)', easing: 'cubic-bezier(.5, 0, .75, .2)' },
        { transform: 'translateY(18px) rotate(3deg)', offset: .5, easing: 'cubic-bezier(.33, 0, .3, 1)' },
        { transform: 'translateY(-8px) rotate(-1.6deg)', offset: .7, easing: 'ease-in-out' },
        { transform: 'translateY(3px) rotate(.6deg)', offset: .86, easing: 'ease-in-out' },
        { transform: 'none' },
      ], { duration: reduce ? 1 : 1100, delay: reduce ? 0 : 260 });
      Array.from(ventana.children).forEach((h, i) => anima(h, [{ opacity: 0 }, { opacity: 1 }],
        { duration: reduce ? 1 : 420, delay: reduce ? 0 : 640 + i * 60, easing: 'ease-out' }));

      const primero = ventana.querySelector('button, [href], input, [tabindex]');
      setTimeout(() => primero && primero.focus({ preventScroll: true }), reduce ? 0 : 700);
    }

    function cierra() {
      if (!abierta) return;
      abierta = false;
      para();
      const n = pliegues.length;
      anima(ventana, [{ transform: 'none', easing: 'cubic-bezier(.5, 0, .75, 0)' }, { transform: 'translateY(-115vh) rotate(4deg)' }],
        { duration: reduce ? 1 : 520 });
      // sube de derecha a izquierda: el mismo camino, al revés
      pliegues.forEach((p, i) => anima(p, [
        { transform: 'translateY(0)', easing: 'cubic-bezier(.6, 0, .3, 1)' },
        { transform: 'translateY(-102%)' },
      ], { duration: reduce ? 1 : 620, delay: reduce ? 0 : 220 + (n - 1 - i) * o.escalon * .8 }));
      // cuando sube el último pliegue, la capa deja de tapar la página
      setTimeout(() => {
        if (abierta) return;
        capa.classList.remove('is-abierta');
        if (origen && origen.focus) origen.focus({ preventScroll: true });
      }, reduce ? 0 : 220 + (n - 1) * o.escalon * .8 + 620);
    }

    tela.addEventListener('click', cierra);
    addEventListener('keydown', e => { if (e.key === 'Escape') cierra(); });
    // el foco no se escapa de la ventana mientras está abierta
    ventana.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const f = ventana.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });

    return { abre, cierra, abierta: () => abierta };
  }

  window.Cortina = Cortina;
})();
