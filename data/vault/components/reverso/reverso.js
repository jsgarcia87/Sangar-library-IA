/* =====================================================================
   Reverso · Moxen
   Una tarjeta de pago que acompaña al formulario: las cifras caen en su
   sitio mientras escribes, un marco se desliza hasta la zona que estás
   llenando y, al llegar al código de seguridad, la tarjeta da la vuelta
   para mostrar el dorso. Se inclina un poco hacia el cursor.
   Sin dependencias.

     Reverso(document.querySelector('[data-reverso]'), {
       paga: datos => fetch(…),     // opcional; recibe un FormData
     });

   Es solo la interfaz: los datos de una tarjeta real nunca deben pasar
   por tu servidor; úsala con el formulario seguro de tu pasarela de pago.
   ===================================================================== */
(function () {
  'use strict';

  const solo = (v, n) => v.replace(/\D/g, '').slice(0, n);

  function Reverso(raiz, opciones) {
    const o = Object.assign({ paga: () => new Promise(r => setTimeout(r, 250)), reinicia: 1600 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const marco = raiz.querySelector('.rv-carta-marco');
    const carta = raiz.querySelector('.rv-carta');
    const form = raiz.querySelector('form');
    const c = form.elements;
    const boton = form.querySelector('[type="submit"]');
    const ver = n => raiz.querySelector('[data-ver="' + n + '"]');
    const vacio = { nombre: ver('nombre').textContent, vence: ver('vence').textContent, cvc: ver('cvc').textContent };

    // dieciséis casillas para las cifras, en cuatro grupos
    const numero = raiz.querySelector('.rv-numero');
    const cifras = [];
    for (let g = 0; g < 4; g++) {
      const b = document.createElement('b');
      for (let k = 0; k < 4; k++) {
        const i = document.createElement('i');
        i.className = 'is-vacia'; i.textContent = '•';
        b.appendChild(i); cifras.push(i);
      }
      numero.appendChild(b);
    }

    function pinta() {
      const d = solo(c.numero.value, 16);
      cifras.forEach((i, k) => {
        const ch = d[k] || '•';
        if (i.textContent === ch) return;
        i.textContent = ch;
        i.classList.toggle('is-vacia', !d[k]);
        i.classList.remove('is-nueva');
        if (d[k]) { void i.offsetWidth; i.classList.add('is-nueva'); }
      });
      ver('nombre').textContent = c.nombre.value.trim().toUpperCase().slice(0, 22) || vacio.nombre;
      ver('vence').textContent = c.vence.value || vacio.vence;
      ver('cvc').textContent = c.cvc.value || vacio.cvc;
    }

    // el formato mientras se escribe: grupos de cuatro y la barra de la fecha
    c.numero.addEventListener('input', () => { c.numero.value = solo(c.numero.value, 16).replace(/(\d{4})(?=\d)/g, '$1 '); pinta(); });
    c.vence.addEventListener('input', () => { const d = solo(c.vence.value, 4); c.vence.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; pinta(); });
    c.cvc.addEventListener('input', () => { c.cvc.value = solo(c.cvc.value, 4); pinta(); });
    c.nombre.addEventListener('input', pinta);

    /* El marco de foco se mide con offsetLeft/offsetTop, no con
       getBoundingClientRect: la tarjeta está girada en 3D y las medidas
       en pantalla saldrían deformadas. */
    function hasta(el, cara) {
      let x = 0, y = 0;
      for (let n = el; n && n !== cara; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
      return [x, y];
    }
    function enfoca(zona) {
      const atras = zona === 'cvc';
      if (carta.classList.contains('is-vuelta') !== atras) {
        carta.classList.toggle('is-vuelta', atras);
        // a medio giro se levanta un poco, como al darla vuelta con la mano
        if (!reduce) carta.animate([{ scale: 1, translate: '0 0' }, { scale: 1.05, translate: '0 -14px', offset: .45 }, { scale: 1, translate: '0 0' }],
          { duration: 850, easing: 'cubic-bezier(.33, 0, .3, 1)' });
      }
      raiz.querySelectorAll('.rv-foco').forEach(f => f.classList.remove('is-visible'));
      if (!zona) return;
      const el = raiz.querySelector('[data-zona="' + zona + '"]');
      const cara = el.closest('.rv-cara'), foco = cara.querySelector('.rv-foco');
      const [x, y] = hasta(el, cara);
      foco.style.setProperty('--fx', (x - 9) + 'px');
      foco.style.setProperty('--fy', (y - 7) + 'px');
      foco.style.setProperty('--fw', (el.offsetWidth + 18) + 'px');
      foco.style.setProperty('--fh', (el.offsetHeight + 14) + 'px');
      foco.classList.add('is-visible');
    }
    form.addEventListener('focusin', e => { if (e.target.name in { numero: 1, nombre: 1, vence: 1, cvc: 1 }) enfoca(e.target.name); });
    // al salir del formulario, la tarjeta vuelve a mostrar el frente
    form.addEventListener('focusout', () => setTimeout(() => { if (!form.contains(document.activeElement) || document.activeElement === boton) enfoca(null); }, 0));

    // se inclina apenas hacia el cursor, como algo que se sostiene en la mano
    addEventListener('pointermove', e => {
      if (reduce) return;
      const r = marco.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      marco.style.setProperty('--rv-ty', (dx * 14).toFixed(2) + 'deg');
      marco.style.setProperty('--rv-tx', (-dy * 10).toFixed(2) + 'deg');
    }, { passive: true });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (boton.classList.contains('is-listo')) return;
      boton.focus({ preventScroll: true });
      enfoca(null);
      Promise.resolve(o.paga(new FormData(form))).then(() => {
        boton.classList.add('is-listo');
        setTimeout(() => { form.reset(); pinta(); boton.classList.remove('is-listo'); boton.blur(); }, o.reinicia);
      });
    });

    pinta();
    return { enfoca, pinta };
  }

  window.Reverso = Reverso;
})();
