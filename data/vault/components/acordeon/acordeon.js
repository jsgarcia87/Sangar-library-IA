/* =====================================================================
   Acordeón · Moxen
   Paneles que se abren de uno en uno: al abrir uno se cierra el que
   estaba abierto, y la altura se anima sola, sin medir el contenido.
   Sin dependencias.

     const a = Acordeon(document.querySelector('[data-acordeon]'));
     a.abre(2);      a.cierra();

   Opciones: { uno: false } deja abrir varios a la vez.
   ===================================================================== */
(function () {
  'use strict';

  let serie = 0;

  function Acordeon(raiz, opciones) {
    const o = Object.assign({ uno: true }, opciones);
    const paneles = Array.from(raiz.querySelectorAll('[data-acordeon-panel]'));
    const n = ++serie;

    /* Los atributos ARIA se ponen aquí y no en el HTML: así el marcado
       queda limpio y un lector de pantalla siempre sabe qué está abierto. */
    const partes = paneles.map((p, i) => {
      const boton = p.querySelector('[data-acordeon-boton]');
      const cuerpo = p.querySelector('[data-acordeon-cuerpo]');
      boton.id = boton.id || 'ac-' + n + '-b' + i;
      cuerpo.id = cuerpo.id || 'ac-' + n + '-c' + i;
      boton.setAttribute('aria-controls', cuerpo.id);
      cuerpo.setAttribute('role', 'region');
      cuerpo.setAttribute('aria-labelledby', boton.id);
      return { p, boton, cuerpo };
    });

    function pinta() {
      partes.forEach(({ p, boton, cuerpo }) => {
        const abierto = p.hasAttribute('data-abierto');
        boton.setAttribute('aria-expanded', abierto);
        /* Cerrado no basta con altura 0: inert lo saca del tabulador, para
           que no se pueda enfocar un enlace que no se ve. */
        cuerpo.inert = !abierto;
      });
    }

    function abre(i) {
      partes.forEach((x, k) => {
        if (k === i) x.p.setAttribute('data-abierto', '');
        else if (o.uno) x.p.removeAttribute('data-abierto');
      });
      pinta();
    }
    function cierra(i) {
      partes.forEach((x, k) => { if (i == null || k === i) x.p.removeAttribute('data-abierto'); });
      pinta();
    }

    partes.forEach(({ p, boton }, i) => {
      boton.addEventListener('click', () => (p.hasAttribute('data-abierto') ? cierra(i) : abre(i)));
      // flechas arriba y abajo para saltar de cabecera en cabecera
      boton.addEventListener('keydown', e => {
        const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        partes[(i + d + partes.length) % partes.length].boton.focus();
      });
    });
    pinta();

    return { abre, cierra };
  }

  window.Acordeon = Acordeon;
})();
