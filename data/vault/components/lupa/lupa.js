/* =====================================================================
   Lupa · Moxen
   Un buscador que empieza siendo una lupa: al tocarla, el lente se abre
   en un campo de texto, el mango viaja con el borde hasta convertirse en
   la × de cerrar y, mientras busca, el lente sin mango gira como
   indicador. Los resultados entran en cascada. Sin dependencias.

     Lupa(document.querySelector('[data-lupa]'), {
       datos: ['Inicio', 'Servicios', 'Precios'],     // o una función
     });

   `datos` puede ser una función (texto) => Promise<string[]> para buscar
   en un servidor; la lista de la demostración se filtra aquí mismo.
   ===================================================================== */
(function () {
  'use strict';

  // sin tildes ni mayúsculas: «pre» encuentra «Prés…» y «PRE…»
  const plano = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const ICONO = '<svg viewBox="0 0 24 24"><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V4a.5.5 0 0 1 .5-.5z"/><path d="M14 3.5V8h4"/></svg>';

  function Lupa(raiz, opciones) {
    const o = Object.assign({ datos: [], espera: 240, max: 5 }, opciones);
    const lente = raiz.querySelector('.lp-lente');
    const entrada = raiz.querySelector('.lp-entrada');
    const cierra = raiz.querySelector('.lp-cierra');
    const panel = raiz.querySelector('.lp-panel');
    const lista = raiz.querySelector('.lp-resultados');
    let abierta = false, reloj = 0, vuelta = 0;

    const busca = typeof o.datos === 'function' ? o.datos : texto => {
      const q = plano(texto);
      return Promise.resolve(o.datos.filter(d => plano(d).includes(q)));
    };

    function abre() {
      if (abierta) return;
      abierta = true;
      raiz.classList.add('is-abierta');
      lente.setAttribute('aria-expanded', 'true');
      entrada.tabIndex = 0; cierra.tabIndex = 0;
      // el foco espera a que el campo aparezca, o el navegador lo desplaza
      setTimeout(() => entrada.focus({ preventScroll: true }), 320);
    }

    function cerrar() {
      if (!abierta) return;
      abierta = false;
      clearTimeout(reloj);
      entrada.value = '';
      muestra([], '');
      raiz.classList.remove('is-abierta', 'is-buscando');
      lente.setAttribute('aria-expanded', 'false');
      entrada.tabIndex = -1; cierra.tabIndex = -1;
      lente.focus({ preventScroll: true });
    }

    // la parte que coincide, resaltada; se arma con nodos para no inyectar HTML
    function resalta(li, texto, q) {
      const s = document.createElement('span'), i = plano(texto).indexOf(plano(q));
      li.appendChild(s);
      if (i < 0 || !q) { s.textContent = texto; return; }
      const m = document.createElement('mark');
      m.textContent = texto.slice(i, i + q.length);
      s.append(texto.slice(0, i), m, texto.slice(i + q.length));
    }

    function muestra(lista_, q) {
      lista.textContent = '';
      if (q && !lista_.length) {
        const li = document.createElement('li');
        li.className = 'lp-nada';
        li.textContent = 'Sin resultados para «' + q + '»';
        li.style.setProperty('--i', 0);
        lista.appendChild(li);
      }
      lista_.slice(0, o.max).forEach((d, i) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.style.setProperty('--i', i);
        li.innerHTML = ICONO;
        resalta(li, d, q);
        lista.appendChild(li);
      });
      const alto = lista.children.length ? lista.offsetHeight : 0;
      panel.style.height = alto + 'px';
      panel.classList.toggle('is-lleno', alto > 0);
    }

    entrada.addEventListener('input', () => {
      const q = entrada.value.trim(), mia = ++vuelta;
      clearTimeout(reloj);
      if (!q) { raiz.classList.remove('is-buscando'); muestra([], ''); return; }
      raiz.classList.add('is-buscando');
      // espera a que deje de teclear un momento antes de buscar
      reloj = setTimeout(() => busca(q).then(r => {
        if (mia !== vuelta) return;          // llegó tarde: ya hay otra búsqueda
        raiz.classList.remove('is-buscando');
        muestra(r, q);
      }), o.espera);
    });
    lente.addEventListener('click', () => abierta ? entrada.focus() : abre());
    cierra.addEventListener('click', cerrar);
    raiz.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });

    return { abre, cierra: cerrar };
  }

  window.Lupa = Lupa;
})();
