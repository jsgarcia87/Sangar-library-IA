/* =====================================================================
   Máquina · Moxen
   Máquina de escribir con cursor: escribe una palabra con ritmo humano
   (ni todas las teclas igual ni todas seguidas), espera, la borra y
   escribe la siguiente. Borra de dos maneras, que puede alternar: con
   la tecla de retroceso, cada vez más rápido, o seleccionándola entera y
   quitándola de un golpe. Sin dependencias.

     Maquina(el, ['sitios web', 'tiendas en línea', 'aplicaciones'], {
       borra: 'alterna',      // 'tecla' | 'seleccion' | 'alterna'
       ritmo: 72,             // ms por letra, de media
     });

   Lo que el elemento trae escrito es la primera palabra. Para lectores
   de pantalla el texto que vale es el del aria-label: la lista entera.
   ===================================================================== */
(function () {
  'use strict';

  function Maquina(el, palabras, opciones) {
    const o = Object.assign({ borra: 'alterna', ritmo: 72, espera: 2000, pausa: 380 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lista = [el.textContent.trim()].concat(palabras.filter(p => p !== el.textContent.trim()));
    el.setAttribute('aria-label', lista.join(', '));

    el.textContent = '';
    const texto = document.createElement('span');
    texto.className = 'mq-texto';
    texto.setAttribute('aria-hidden', 'true');
    const cursor = document.createElement('span');
    cursor.className = 'mq-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    el.append(texto, cursor);

    const letra = (ch, nueva) => {
      const s = document.createElement('span');
      s.className = 'mq-letra';
      s.textContent = ch;
      if (!nueva) s.style.animation = 'none';
      return s;
    };
    lista[0].split('').forEach(ch => texto.appendChild(letra(ch, false)));

    let i = 0, vuelta = 0, reloj = 0;
    const despues = (ms, f) => { reloj = setTimeout(f, ms); };
    const escribiendo = si => el.classList.toggle('is-escribe', si);

    /* El ritmo humano: cada tecla tarda entre el 60 y el 150 % de la
       media, y después de un espacio la mano se toma un respiro. */
    function escribe(palabra, k) {
      escribiendo(true);
      if (k >= palabra.length) { escribiendo(false); return despues(o.espera, borra); }
      texto.appendChild(letra(palabra[k], true));
      const pausa = palabra[k] === ' ' ? o.ritmo * 1.1 : 0;
      despues(o.ritmo * (.6 + Math.random() * .9) + pausa, () => escribe(palabra, k + 1));
    }

    function borra() {
      const modo = o.borra === 'alterna' ? (vuelta++ % 2 ? 'seleccion' : 'tecla') : o.borra;
      const siguiente = () => { i = (i + 1) % lista.length; despues(o.pausa, () => escribe(lista[i], 0)); };
      escribiendo(true);
      if (modo === 'tecla') {
        // retroceso: arranca con calma y acelera, como quien deja el dedo apretado
        let paso = o.ritmo * .75;
        const una = () => {
          if (!texto.lastChild) { escribiendo(false); return siguiente(); }
          texto.lastChild.remove();
          paso = Math.max(22, paso * .86);
          despues(paso, una);
        };
        return una();
      }
      // selección: se marca de derecha a izquierda, se mira un instante y se va
      const letras = Array.from(texto.children);
      let k = letras.length;
      const marca = () => {
        if (k <= 0) return despues(260, () => { texto.textContent = ''; escribiendo(false); siguiente(); });
        letras[--k].classList.add('is-elegida');
        despues(16, marca);
      };
      marca();
    }

    if (!reduce) despues(o.espera, borra);
    else {
      // sin movimiento: cambia la palabra entera, de vez en cuando
      setInterval(() => { i = (i + 1) % lista.length; texto.textContent = lista[i]; }, 2600);
    }
    return { para: () => clearTimeout(reloj) };
  }

  window.Maquina = Maquina;
})();
