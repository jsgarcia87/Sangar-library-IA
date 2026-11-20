/* =====================================================================
   Idiomas · Moxen
   Un selector de idioma (ES · EN · FR) con un indicador que se desliza
   estirándose —el borde de delante tira y el de atrás lo alcanza— y que
   invierte las letras justo por donde pasa. El texto de muestra cambia
   palabra a palabra: las viejas suben y se van, las nuevas llegan desde
   abajo. Sin dependencias.

     Idiomas(document.querySelector('[data-idiomas]'), elementoDelTexto, {
       alCambiar: codigo => { … },        // 'es', 'en', 'fr'
     });
   ===================================================================== */
(function () {
  'use strict';

  function Idiomas(selector, frase, opciones) {
    const o = Object.assign({ alCambiar: null }, opciones);
    const botones = Array.from(selector.querySelectorAll('[data-idioma]'));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // el indicador va debajo de las etiquetas; la copia invertida, encima
    const indicador = document.createElement('div');
    indicador.className = 'id-indicador';
    const invertida = document.createElement('div');
    invertida.className = 'id-invertida';
    invertida.setAttribute('aria-hidden', 'true');
    botones.forEach(b => { const s = document.createElement('span'); s.textContent = b.textContent; invertida.appendChild(s); });
    selector.prepend(indicador);
    selector.appendChild(invertida);

    /* Dos resortes, uno por borde. El de delante es duro y el de atrás
       blando: al moverse, la pastilla se estira hacia donde va y luego
       se recoge. Cuál es «delante» depende de hacia dónde vaya. */
    let izq = 0, der = 0, vIzq = 0, vDer = 0, metaIzq = 0, metaDer = 0, raf = 0, previo = 0, actual = -1;
    const DURO = [560, 40], BLANDO = [210, 25];

    function pinta() {
      selector.style.setProperty('--id-izq', izq.toFixed(2) + 'px');
      selector.style.setProperty('--id-ancho', Math.max(0, der - izq).toFixed(2) + 'px');
    }
    function paso(t) {
      const dt = Math.min(.032, (t - (previo || t)) / 1000);
      previo = t;
      const haciaDer = metaIzq > izq;
      const [kI, cI] = haciaDer ? BLANDO : DURO, [kD, cD] = haciaDer ? DURO : BLANDO;
      for (let i = 0; i < 4; i++) {
        const h = dt / 4;
        vIzq += (-kI * (izq - metaIzq) - cI * vIzq) * h; izq += vIzq * h;
        vDer += (-kD * (der - metaDer) - cD * vDer) * h; der += vDer * h;
      }
      pinta();
      if (Math.abs(izq - metaIzq) + Math.abs(der - metaDer) < .05 && Math.abs(vIzq) + Math.abs(vDer) < .5) {
        izq = metaIzq; der = metaDer; pinta(); raf = 0; previo = 0; return;
      }
      raf = requestAnimationFrame(paso);
    }

    // la frase nueva entra palabra a palabra; la vieja se va igual, delante
    function escribe(texto, lang, deGolpe) {
      frase.querySelectorAll('.id-capa').forEach(vieja => {
        if (vieja.classList.contains('id-sale')) return;
        vieja.classList.add('id-sale');
        vieja.setAttribute('aria-hidden', 'true');
        setTimeout(() => vieja.remove(), 700);
      });
      const capa = document.createElement('span');
      capa.className = 'id-capa' + (deGolpe ? '' : ' id-entra');
      texto.split(' ').forEach((p, i) => {
        if (i) capa.appendChild(document.createTextNode(' '));
        const s = document.createElement('span');
        s.className = 'id-palabra'; s.textContent = p; s.style.setProperty('--i', i);
        capa.appendChild(s);
      });
      frase.appendChild(capa);
      frase.lang = lang;
    }

    function elige(i, deGolpe) {
      if (i === actual) return;
      actual = i;
      const b = botones[i];
      botones.forEach((x, k) => { x.setAttribute('aria-checked', String(k === i)); x.tabIndex = k === i ? 0 : -1; });
      metaIzq = b.offsetLeft - indicador.offsetLeft;
      metaDer = metaIzq + b.offsetWidth;
      if (deGolpe || reduce) { izq = metaIzq; der = metaDer; pinta(); }
      else if (!raf) raf = requestAnimationFrame(paso);
      escribe(b.dataset.frase || '', b.dataset.idioma, deGolpe);
      if (!deGolpe && o.alCambiar) o.alCambiar(b.dataset.idioma);
    }

    botones.forEach((b, i) => b.addEventListener('click', () => elige(i)));
    // con el teclado: las flechas recorren las opciones, como en un grupo de radios
    selector.addEventListener('keydown', e => {
      const paso = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!paso) return;
      e.preventDefault();
      const i = (actual + paso + botones.length) % botones.length;
      elige(i); botones[i].focus();
    });

    elige(Math.max(0, botones.findIndex(b => b.dataset.idioma === (document.documentElement.lang || 'es'))), true);
    return { elige: codigo => elige(botones.findIndex(b => b.dataset.idioma === codigo)) };
  }

  window.Idiomas = Idiomas;
})();
