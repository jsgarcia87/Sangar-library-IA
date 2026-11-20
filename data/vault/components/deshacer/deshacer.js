/* =====================================================================
   Deshacer · Moxen
   El aviso que deja arrepentirse: aparece al borrar algo, con un anillo
   que se vacía y una cifra que cuenta hacia atrás. Mientras el cursor
   está encima, la cuenta se detiene. Si se deshace, el anillo se cambia
   por un visto; si se acaba el tiempo, la acción se confirma de verdad.
   Sin dependencias.

     const aviso = Deshacer(document.querySelector('[data-deshacer]'), { segundos: 5 });
     const vuelve = Deshacer.retira(fila);        // la pliega sin borrarla
     aviso.pide({ texto: '«Contrato» eliminado', deshaz: vuelve, confirma: () => fila.remove() });

   Si llega otra acción con el aviso abierto, la anterior se confirma.
   ===================================================================== */
(function () {
  'use strict';

  const CURVA = 'cubic-bezier(.22, 1, .36, 1)';

  function Deshacer(aviso, opciones) {
    const o = Object.assign({ segundos: 5, hecho: 'Restaurado' }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    aviso.innerHTML =
      '<div class="dh-anillo" aria-hidden="true">'
      + '<svg class="dh-aro" viewBox="0 0 46 46"><circle class="dh-pista-anillo" cx="23" cy="23" r="20"/>'
      + '<circle class="dh-resto" cx="23" cy="23" r="20" pathLength="100" stroke-dasharray="100"/></svg>'
      + '<span class="dh-cifra"></span>'
      + '<svg class="dh-hecho" viewBox="0 0 30 30"><path d="M8 15.5l4.5 4.5L22 10"/></svg></div>'
      + '<span class="dh-mensaje"></span>'
      + '<button class="dh-deshaz" type="button">Deshacer</button>';
    const aro = aviso.querySelector('.dh-aro'), resto = aviso.querySelector('.dh-resto');
    const cifra = aviso.querySelector('.dh-cifra'), hecho = aviso.querySelector('.dh-hecho');
    const mensaje = aviso.querySelector('.dh-mensaje'), boton = aviso.querySelector('.dh-deshaz');

    let actual = null, raf = 0, antes = 0, encima = false, mostrada = -1, salida = null, cierre = 0;

    /* La cifra que baja entra desde arriba y la vieja se va hacia abajo:
       el movimiento acompaña a la cuenta. */
    function pon(n) {
      if (n === mostrada) return;
      const vieja = cifra.lastElementChild;
      const nueva = document.createElement('span');
      nueva.textContent = n;
      cifra.appendChild(nueva);
      if (vieja && !reduce && mostrada !== -1) {
        vieja.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(90%)', opacity: 0 }], { duration: 320, easing: CURVA, fill: 'forwards' });
        nueva.animate([{ transform: 'translateY(-90%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: CURVA });
        setTimeout(() => vieja.remove(), 340);
      } else if (vieja) vieja.remove();
      mostrada = n;
    }

    function paso(t) {
      const dt = Math.min(.05, Math.max(0, (t - antes) / 1000)); antes = t;
      if (!actual) { raf = 0; return; }
      // con el cursor o el foco encima, el tiempo no corre
      if (!encima && !aviso.contains(document.activeElement)) actual.resta -= dt;
      const p = Math.max(0, actual.resta / actual.total);
      resto.style.strokeDashoffset = (100 * (1 - p)).toFixed(2);
      pon(Math.max(1, Math.ceil(actual.resta)));
      if (actual.resta <= 0) { const a = actual; actual = null; raf = 0; a.confirma && a.confirma(); oculta(); return; }
      raf = requestAnimationFrame(paso);
    }

    function entra() {
      if (salida) { salida.cancel(); salida = null; }
      const ya = aviso.classList.contains('is-visible');
      aviso.classList.add('is-visible');
      if (reduce) return;
      if (ya) aviso.animate([{ transform: 'scale(.96)' }, { transform: 'none' }], { duration: 360, easing: CURVA });
      else aviso.animate([
        { transform: 'translateY(150%) scale(.9)', opacity: 0 },
        { transform: 'translateY(-8%) scale(1.01)', opacity: 1, offset: .6 },
        { transform: 'none', opacity: 1 },
      ], { duration: 620, easing: CURVA });
    }
    function oculta() {
      clearTimeout(cierre);
      const fin = () => { aviso.classList.remove('is-visible', 'is-hecho'); salida = null; };
      if (reduce) return fin();
      const a = salida = aviso.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(150%) scale(.94)', opacity: 0 }],
        { duration: 420, easing: 'cubic-bezier(.5, 0, .75, 0)', fill: 'forwards' });
      // con un reloj y no con onfinish: así también se puede pausar y grabar
      setTimeout(() => { if (salida === a) { fin(); a.cancel(); } }, 430);
    }

    function pide(datos) {
      if (actual && actual.confirma) actual.confirma();      // la anterior ya no tiene vuelta
      clearTimeout(cierre);
      actual = Object.assign({ total: o.segundos, resta: o.segundos }, datos);
      aviso.classList.remove('is-hecho');
      mensaje.textContent = datos.texto || '';
      aro.style.opacity = cifra.style.opacity = 1; hecho.style.opacity = 0;
      mostrada = -1; pon(o.segundos);
      resto.style.strokeDashoffset = 0;
      entra();
      if (!raf) { antes = performance.now(); raf = requestAnimationFrame(paso); }
    }

    function deshaz() {
      if (!actual) return;
      const a = actual; actual = null;
      a.deshaz && a.deshaz();
      /* El anillo se va, en su sitio se dibuja un visto y el botón
         desaparece: el aviso se encoge a su nuevo ancho en vez de saltar. */
      const w1 = aviso.offsetWidth;
      aviso.classList.add('is-hecho');
      mensaje.textContent = o.hecho;
      if (!reduce) aviso.animate([{ width: w1 + 'px' }, { width: aviso.offsetWidth + 'px' }], { duration: 420, easing: CURVA });
      if (!reduce) {
        aro.animate([{ opacity: 1, transform: 'rotate(-90deg)' }, { opacity: 0, transform: 'rotate(-90deg) scale(.6)' }], { duration: 220, easing: 'ease-in' });
        cifra.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160 });
        aro.style.opacity = cifra.style.opacity = 0;
        hecho.style.opacity = 1;
        hecho.firstChild.animate([{ strokeDashoffset: 24 }, { strokeDashoffset: 0 }], { duration: 380, delay: 140, easing: CURVA, fill: 'both' });
        mensaje.animate([{ opacity: 0, transform: 'translateY(30%)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: CURVA });
      } else { aro.style.opacity = cifra.style.opacity = 0; hecho.style.opacity = 1; hecho.firstChild.style.strokeDashoffset = 0; }
      cierre = setTimeout(oculta, 1300);
    }

    boton.addEventListener('click', deshaz);
    aviso.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') encima = true; });
    aviso.addEventListener('pointerleave', () => { encima = false; });

    return { pide, deshaz };
  }

  /* Pliega un elemento sin quitarlo del DOM y devuelve la función que lo
     despliega en su sitio. Lo borra quien llame, cuando toque. */
  Deshacer.retira = function (el) {
    const h = el.offsetHeight;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ida = el.animate([
      { height: h + 'px', opacity: 1, transform: 'none' },
      { opacity: 0, offset: .45 },
      { height: '0px', opacity: 0, transform: 'translateX(-32px)', borderTopWidth: '0px' },
    ], { duration: reduce ? 1 : 460, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' });
    el.inert = true;
    return function vuelve() {
      ida.cancel();
      el.inert = false;
      if (reduce) return;
      el.animate([
        { height: '0px', opacity: 0, transform: 'translateX(-32px)', borderTopWidth: '0px' },
        { height: h + 'px', opacity: 1, transform: 'translateX(5px)', offset: .65 },
        { height: h + 'px', opacity: 1, transform: 'none' },
      ], { duration: 620, easing: CURVA });
    };
  };

  window.Deshacer = Deshacer;
})();
