/* =====================================================================
   Marea · Moxen
   Al pasar el cursor, el botón se llena de abajo arriba con una ola que
   no deja de moverse; al salir, se vacía. El texto cambia de color justo
   donde lo toca el agua.

     Marea(document.querySelector('.ma-boton'));

   Las olas son dos trazados SVG que se repiten: el doble de ancho que el
   botón y desplazados la mitad, en bucle, así nunca se ve dónde empiezan.
   ===================================================================== */
(function () {
  'use strict';

  /* Cuatro crestas en 240 × 26: al correr la mitad, la ola queda
     exactamente igual que al principio y el bucle no salta. */
  const OLA = 'M0 14 Q15 -2 30 14 T60 14 T90 14 T120 14 T150 14 T180 14 T210 14 T240 14 V26 H0 Z';

  function ola(clase) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 240 26');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('class', 'ma-ola' + (clase ? ' ' + clase : ''));
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', OLA);
    svg.appendChild(p);
    return svg;
  }

  function Marea(boton) {
    // el texto (y el ícono) a una capa propia, por encima del agua
    const texto = document.createElement('span');
    texto.className = 'ma-texto';
    while (boton.firstChild) texto.appendChild(boton.firstChild);
    const agua = document.createElement('span');
    agua.className = 'ma-agua';
    agua.setAttribute('aria-hidden', 'true');
    agua.append(ola('is-atras'), ola());
    boton.append(agua, texto);

    /* En una pantalla táctil no hay «pasar por encima»: un toque llena
       el botón y se vacía solo al rato. */
    let espera = 0;
    boton.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      boton.classList.add('is-llena');
      clearTimeout(espera);
      espera = setTimeout(() => boton.classList.remove('is-llena'), 1400);
    });
    return { boton };
  }

  window.Marea = Marea;
})();
