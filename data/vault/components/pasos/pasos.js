/* =====================================================================
   Pasos · Moxen
   Un formulario por pasos: la barra de arriba se llena hasta el paso
   siguiente, el número del paso hecho se vuelve ✓ y la pantalla actual
   sale hacia un lado mientras la nueva entra del otro. Al elegir una
   opción avanza solo. Sin dependencias.

     Pasos(document.querySelector('[data-pasos]'), {
       envia: datos => fetch(…),     // opcional; recibe un FormData
     });

   La barra se arma sola con el data-titulo de cada [data-paso].
   ===================================================================== */
(function () {
  'use strict';

  const VISTO = '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M11 18.5l4.5 4.5L25 13.5" pathLength="1"/></svg>';

  function Pasos(form, opciones) {
    const o = Object.assign({ espera: 380, reinicia: 2200, envia: () => Promise.resolve() }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pasos = Array.from(form.querySelectorAll('[data-paso]'));
    const gracias = form.querySelector('.ps-gracias');
    const barra = form.querySelector('[data-pasos-barra]');
    const atras = form.querySelector('[data-pasos-atras]');
    const n = pasos.length;

    const nodos = pasos.map((p, i) => {
      const li = document.createElement('li');
      li.className = 'ps-nodo';
      li.innerHTML = '<span>' + (i + 1) + VISTO + '</span><small></small>';
      li.querySelector('small').textContent = p.dataset.titulo || '';
      barra.appendChild(li);
      return li;
    });

    let actual = 0, visible = pasos[0], reloj = 0, llega = 0;

    /* Cambiar de pantalla: la que se va sale hacia el lado contrario al
       avance y la nueva entra un poco después, desde el lado del avance. */
    function cambia(nueva, lado) {
      const vieja = visible;
      visible = nueva;
      if (vieja === nueva) return;
      nueva.classList.add('is-visible');
      if (reduce) { vieja.classList.remove('is-visible'); return; }
      vieja.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + (-lado * 40) + 'px)' }],
        { duration: 220, easing: 'cubic-bezier(.4, 0, .6, 1)', fill: 'forwards' });
      setTimeout(() => {
        if (visible === vieja) return;      // volvió a entrar mientras salía
        vieja.classList.remove('is-visible');
        vieja.getAnimations().forEach(a => a.cancel());
      }, 230);
      nueva.animate([{ opacity: 0, transform: 'translateX(' + (lado * 56) + 'px)' }, { opacity: 1, transform: 'none' }],
        { duration: 560, delay: 190, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' });
    }

    function pinta(destino, hecho) {
      barra.style.setProperty('--ps-avance', (destino / (n - 1)).toFixed(4));
      clearTimeout(llega);
      nodos.forEach((nd, k) => {
        nd.classList.toggle('is-hecho', k < destino || (hecho && k === destino));
        if (k !== destino) nd.classList.remove('is-actual');
      });
      // el anillo del paso nuevo se enciende cuando la barra llega a él
      llega = setTimeout(() => { if (!hecho) nodos[destino].classList.add('is-actual'); }, reduce ? 0 : 520);
      atras.hidden = destino === 0 || hecho;
    }

    function ir(i) {
      i = Math.max(0, Math.min(n - 1, i));
      if (i === actual && visible === pasos[i]) return;
      const lado = i >= actual ? 1 : -1;
      actual = i;
      if (i === n - 1) resume();
      pinta(i, false);
      cambia(pasos[i], lado);
    }

    // el último paso repite lo elegido, con el texto de cada opción
    function resume() {
      form.querySelectorAll('[data-resumen]').forEach(dd => {
        const r = form.querySelector('input[name="' + dd.dataset.resumen + '"]:checked');
        dd.textContent = r ? r.value : '—';
      });
    }

    function reinicia() {
      form.reset();
      actual = 0;
      pinta(0, false);
      cambia(pasos[0], -1);
    }

    form.addEventListener('change', e => {
      if (e.target.type !== 'radio') return;
      clearTimeout(reloj);
      // un respiro para ver la opción marcada antes de pasar a la siguiente
      reloj = setTimeout(() => ir(actual + 1), o.espera);
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      Promise.resolve(o.envia(new FormData(form))).then(() => {
        pinta(n - 1, true);
        cambia(gracias, 1);
        clearTimeout(reloj);
        reloj = setTimeout(reinicia, o.reinicia);
      });
    });
    atras.addEventListener('click', () => { clearTimeout(reloj); ir(actual - 1); });

    pasos[0].classList.add('is-visible');
    pinta(0, false);
    return { ir, reinicia };
  }

  window.Pasos = Pasos;
})();
