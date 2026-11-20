/* =====================================================================
   Sacudida · Moxen
   Validación con cuerpo: si el correo está mal, el campo tiembla —una
   oscilación que se apaga, no un vaivén mecánico— y dice exactamente qué
   falta. Mientras corriges, el mensaje se actualiza solo y, cuando por
   fin está bien, el campo se calma y el ! se vuelve ✓. Sin dependencias.

     Sacudida(document.querySelector('[data-sacudida]'), {
       envia: correo => fetch(…),     // opcional
     });
   ===================================================================== */
(function () {
  'use strict';

  // de lo más grueso a lo más fino: se dice solo el primer problema
  function revisa(v) {
    if (!v) return 'Escribe tu correo para continuar.';
    if (/\s/.test(v)) return 'Un correo no lleva espacios.';
    if (!v.includes('@')) return 'Falta la @ entre tu nombre y el dominio.';
    const [antes, despues, ...resto] = v.split('@');
    if (resto.length) return 'Sobra una @: solo puede haber una.';
    if (!antes) return 'Falta lo que va antes de la @.';
    if (!despues) return 'Falta el dominio después de la @.';
    if (!despues.includes('.')) return 'Al dominio le falta la terminación, como .cl o .com.';
    if (!/\.[a-z]{2,}$/i.test(despues)) return 'La terminación quedó corta.';
    return '';
  }

  /* Una oscilación amortiguada: cinco idas y vueltas que se apagan con la
     curva (1 − t)². Así parece un golpe que se disipa y no un adorno. */
  function sacudida(a) {
    const n = 24;
    return Array.from({ length: n + 1 }, (_, k) => {
      const t = k / n, x = a * Math.pow(1 - t, 2) * Math.sin(t * Math.PI * 2 * 5);
      return { transform: 'translateX(' + x.toFixed(2) + 'px)' };
    });
  }

  function Sacudida(form, opciones) {
    const o = Object.assign({ amplitud: 16, envia: () => Promise.resolve(), bien: 'Perfecto, así está bien.' }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const entrada = form.querySelector('input');
    const campo = entrada.closest('.sc-campo');
    const aviso = form.querySelector('.sc-aviso');
    const texto = aviso.querySelector('span');
    const boton = form.querySelector('button[type="submit"]');
    // solo se valida en vivo después del primer intento: antes no se regaña
    let tocado = false, malAntes = false;

    function dice(msg) {
      if (texto.textContent === msg) return;
      texto.textContent = msg;
      texto.classList.remove('is-nuevo');
      void texto.offsetWidth;
      texto.classList.add('is-nuevo');
    }

    function muestra(err) {
      campo.classList.toggle('is-mal', !!err);
      campo.classList.toggle('is-bien', !err);
      entrada.setAttribute('aria-invalid', err ? 'true' : 'false');
      aviso.classList.add('is-visible');
      aviso.classList.toggle('is-bien', !err);
      dice(err || o.bien);
      // de mal a bien: un respiro corto, el campo se asienta
      if (!err && malAntes && !reduce) {
        campo.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.018)', offset: .35 }, { transform: 'scale(1)' }],
          { duration: 520, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      }
      malAntes = !!err;
    }

    function limpia() {
      tocado = malAntes = false;
      entrada.value = '';
      campo.classList.remove('is-mal', 'is-bien');
      aviso.classList.remove('is-visible', 'is-bien');
      boton.classList.remove('is-listo');
      entrada.removeAttribute('aria-invalid');
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (boton.classList.contains('is-listo')) return;
      tocado = true;
      const err = revisa(entrada.value.trim());
      muestra(err);
      if (err) {
        if (!reduce) campo.animate(sacudida(o.amplitud), { duration: 620, easing: 'linear' });
        entrada.focus();
        return;
      }
      boton.classList.add('is-listo');
      Promise.resolve(o.envia(entrada.value.trim())).then(() => setTimeout(limpia, 1700));
    });
    entrada.addEventListener('input', () => { if (tocado) muestra(revisa(entrada.value.trim())); });

    return { limpia, revisa };
  }

  window.Sacudida = Sacudida;
})();
