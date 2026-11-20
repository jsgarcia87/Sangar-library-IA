/* =====================================================================
   Sello · Moxen
   Un botón que funciona como un sello de goma: toma impulso, se hunde
   contra el papel y, al levantarse, deja la palabra estampada con tinta.

     const s = Sello(document.querySelector('.se-boton'), { palabra: 'Aprobado', vuelve: 2600 });
     s.estampa();      s.borra();

   La textura de la tinta —bordes comidos y poros donde no cargó— es un
   filtro SVG que se añade una sola vez a la página.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PALOMITA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5l4.8 4.8L19.5 7"/></svg>';

  /* Dos ruidos: uno desplaza el borde unos píxeles (la goma nunca es
     perfecta) y otro abre poros donde la tinta no llegó. */
  function filtro() {
    if (document.getElementById('se-tinta')) return;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    svg.innerHTML =
      '<filter id="se-tinta" x="-5%" y="-10%" width="110%" height="120%">' +
        // el borde ondula un poco: la goma nunca apoya del todo plana
        '<feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="3" result="onda"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="onda" scale="4" xChannelSelector="R" yChannelSelector="G" result="borde"/>' +
        // poros finos donde la tinta no cargó…
        '<feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="8" result="grano"/>' +
        '<feColorMatrix in="grano" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -6 0 0 0 4.4" result="poros"/>' +
        // …y zonas enteras con menos tinta, como un sello cansado
        '<feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="5" result="nube"/>' +
        '<feColorMatrix in="nube" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 .05" result="carga"/>' +
        '<feComposite in="poros" in2="carga" operator="in" result="tinta"/>' +
        '<feComposite in="borde" in2="tinta" operator="in"/>' +
      '</filter>';
    document.body.appendChild(svg);
  }

  function Sello(boton, opciones) {
    const o = Object.assign({
      palabra: boton.dataset.sello || 'Aprobado',
      vuelve: 0,           // ms hasta borrar la marca y devolver el botón (0: se queda)
      papel: boton.closest('[data-sello-papel]'),   // lo que acusa el golpe
    }, opciones);
    filtro();

    // el botón y su marca comparten sitio: la marca queda justo debajo
    const sitio = document.createElement('span');
    sitio.className = 'se-sitio';
    boton.replaceWith(sitio);
    const marca = document.createElement('span');
    marca.className = 'se-marca';
    marca.setAttribute('role', 'status');
    marca.innerHTML = PALOMITA + '<span></span>';
    marca.lastChild.textContent = o.palabra;
    marca.style.filter = 'url(#se-tinta)';
    sitio.append(marca, boton);

    let estado = 'listo', espera = 0;

    function estampa() {
      if (estado !== 'listo') return;
      estado = 'estampado';
      if (reduce) { boton.style.visibility = 'hidden'; marca.classList.add('is-tinta'); return programa(); }
      boton.classList.remove('is-vuelve');
      boton.classList.add('is-golpe');
      /* La tinta aparece en el instante del contacto (el 36 % del golpe),
         todavía tapada por el botón: cuando este se levanta, ya está ahí. */
      setTimeout(() => {
        marca.classList.remove('is-borra');
        marca.classList.add('is-tinta');
        if (!o.papel) return;
        o.papel.classList.remove('is-sacude');
        void o.papel.offsetWidth;              // reinicia la sacudida
        o.papel.classList.add('is-sacude');
      }, 240);
      setTimeout(() => { boton.style.visibility = 'hidden'; }, 660);
      programa();
    }

    function programa() { if (o.vuelve) espera = setTimeout(borra, o.vuelve); }

    function borra() {
      if (estado !== 'estampado') return;
      clearTimeout(espera);
      estado = 'volviendo';
      marca.classList.add('is-borra');
      setTimeout(() => {
        marca.classList.remove('is-tinta', 'is-borra');
        boton.classList.remove('is-golpe');
        boton.style.visibility = '';
        if (!reduce) boton.classList.add('is-vuelve');
        estado = 'listo';
      }, reduce ? 0 : 280);
    }

    boton.addEventListener('click', estampa);
    return { estampa, borra, estado: () => estado };
  }

  window.Sello = Sello;
})();
