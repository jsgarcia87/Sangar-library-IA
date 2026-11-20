/* =====================================================================
   Clave · Moxen
   Un código de verificación en casillas: cada cifra entra con un saltito
   y el foco pasa sola a la siguiente; borrar vuelve atrás y pegar reparte
   el código entero. Al completarlo, una ola recorre las casillas mientras
   se comprueba y, si está bien, se juntan en una sola pieza con un ✓.
   Sin dependencias.

     const c = Clave(document.querySelector('[data-clave]'), {
       verifica: codigo => fetch(…).then(r => r.ok),   // true o false
     });
     c.limpia();
   ===================================================================== */
(function () {
  'use strict';

  function Clave(grupo, opciones) {
    const o = Object.assign({ verifica: () => Promise.resolve(true) }, opciones);
    const n = parseInt(grupo.dataset.largo, 10) || 6;
    let ocupado = false;

    const casillas = Array.from({ length: n }, (_, i) => {
      const c = document.createElement('div');
      c.className = 'cl-casilla is-vacia';
      c.style.setProperty('--i', i);
      const e = document.createElement('input');
      e.type = 'text'; e.inputMode = 'numeric'; e.maxLength = 1; e.pattern = '[0-9]*';
      e.autocomplete = i === 0 ? 'one-time-code' : 'off';
      e.setAttribute('aria-label', 'Cifra ' + (i + 1) + ' de ' + n);
      c.appendChild(e);
      grupo.appendChild(c);
      return { c, e };
    });

    function pon(i, cifra) {
      const { c, e } = casillas[i];
      e.value = cifra;
      c.classList.toggle('is-vacia', !cifra);
      // reinicia la animación de entrada aunque la casilla ya tuviera cifra
      c.classList.remove('is-nueva');
      if (cifra) { void c.offsetWidth; c.classList.add('is-nueva'); }
    }
    const codigo = () => casillas.map(k => k.e.value).join('');

    /* Reparte desde la casilla i todas las cifras que lleguen de golpe:
       sirve igual para teclear una, pegar seis o el autocompletado del
       teléfono, que escribe el código entero en la primera. */
    function escribe(i, texto) {
      const cifras = texto.replace(/\D/g, '').split('');
      if (!cifras.length) { pon(i, ''); return; }
      cifras.slice(0, n - i).forEach((d, k) => pon(i + k, d));
      const sig = Math.min(n - 1, i + cifras.length);
      casillas[sig].e.focus();
      if (codigo().length === n) comprueba();
    }

    function comprueba() {
      if (ocupado) return;
      ocupado = true;
      casillas.forEach(k => k.e.blur());
      grupo.classList.add('is-revisa');
      Promise.resolve(o.verifica(codigo())).then(bien => {
        grupo.classList.remove('is-revisa');
        if (bien) { grupo.classList.add('is-listo'); return; }
        grupo.classList.add('is-mal');
        setTimeout(() => { grupo.classList.remove('is-mal'); limpia(); }, 500);
      });
    }

    function limpia() {
      ocupado = false;
      grupo.classList.remove('is-listo', 'is-revisa', 'is-mal');
      casillas.forEach((k, i) => pon(i, ''));
      casillas[0].e.focus({ preventScroll: true });
    }

    casillas.forEach(({ e }, i) => {
      e.addEventListener('input', () => escribe(i, e.value.slice(-n)));
      e.addEventListener('focus', () => e.select());
      e.addEventListener('paste', ev => {
        ev.preventDefault();
        escribe(i, (ev.clipboardData || window.clipboardData).getData('text'));
      });
      e.addEventListener('keydown', ev => {
        if (ocupado) { ev.preventDefault(); return; }
        if (ev.key === 'Backspace' && !e.value && i > 0) { ev.preventDefault(); pon(i - 1, ''); casillas[i - 1].e.focus(); }
        else if (ev.key === 'ArrowLeft' && i > 0) { ev.preventDefault(); casillas[i - 1].e.focus(); }
        else if (ev.key === 'ArrowRight' && i < n - 1) { ev.preventDefault(); casillas[i + 1].e.focus(); }
      });
    });

    return { limpia, codigo };
  }

  window.Clave = Clave;
})();
