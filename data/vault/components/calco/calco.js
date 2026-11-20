/* =====================================================================
   Calco · Moxen
   Copiar al portapapeles, a la vista: al pulsar, una copia de cada letra
   sale volando en arco hasta el ícono del portapapeles, que se las traga
   y responde con una palomita. El texto original no se mueve: es una copia.

     Calco(document.querySelector('[data-calco]'));
     // dentro: [data-calco-texto] (lo que se copia) y [data-calco-boton]

   Las letras vuelan con la Web Animations API, cada una con su propio
   arco y un poco de retraso respecto a la anterior: se lee como un chorro.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ICONO =
    '<svg class="ca-tabla" viewBox="0 0 24 24"><rect x="5" y="4.5" width="14" height="16.5" rx="2.5"/>' +
    '<rect x="8.5" y="2.8" width="7" height="3.6" rx="1.2"/>' +
    '<path class="ca-renglon" d="M9 11.5h6"/><path class="ca-renglon" d="M9 15.5h4"/></svg>' +
    '<svg class="ca-palomita" viewBox="0 0 24 24"><path d="M5 12.5l4.6 4.6L19 7.5"/></svg>';

  function Calco(raiz, opciones) {
    const o = Object.assign({ hecho: 'Copiado', vuelve: 1900 }, opciones);
    const texto = raiz.querySelector('[data-calco-texto]');
    const boton = raiz.querySelector('[data-calco-boton]');
    const contenido = texto.textContent;

    // una <span> por letra, para saber de dónde sale cada copia
    texto.textContent = '';
    const letras = Array.from(contenido).map(ch => {
      const s = document.createElement('span');
      s.className = 'ca-letra'; s.textContent = ch;
      texto.appendChild(s); return s;
    });
    texto.setAttribute('aria-label', contenido);

    const icono = document.createElement('span');
    icono.className = 'ca-icono';
    icono.setAttribute('aria-hidden', 'true');
    icono.innerHTML = ICONO;
    const palabras = document.createElement('span');
    palabras.className = 'ca-palabras';
    palabras.innerHTML = '<span></span><span></span>';
    palabras.firstChild.textContent = boton.textContent.trim();
    palabras.lastChild.textContent = o.hecho;
    boton.textContent = '';
    boton.append(icono, palabras);
    // un aviso para lectores de pantalla, sin texto visible
    const aviso = document.createElement('span');
    aviso.setAttribute('role', 'status');
    aviso.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';
    raiz.appendChild(aviso);

    let ocupado = false;

    function copia() {
      if (ocupado) return;
      ocupado = true;
      try { navigator.clipboard && navigator.clipboard.writeText(contenido).catch(() => {}); } catch (e) {}
      aviso.textContent = '';
      if (reduce) return termina(0);

      raiz.classList.add('is-copiando');
      const cs = getComputedStyle(texto);
      const destino = icono.getBoundingClientRect();
      const dx0 = destino.left + destino.width / 2, dy0 = destino.top + destino.height / 2;
      const n = letras.length, retraso = 16, vuelo = 640;

      letras.forEach((l, i) => {
        if (!l.textContent.trim()) return;
        const r = l.getBoundingClientRect();
        /* Dos capas por letra: la de fuera avanza en horizontal y la de
           dentro sube y baja con su propia curva. La horizontal arranca
           despacio: el calco primero se despega entero, legible, y luego
           el portapapeles lo succiona letra a letra. */
        const c = document.createElement('span');
        c.className = 'ca-vuela';
        c.innerHTML = '<span style="display:inline-block"></span>';
        c.firstChild.textContent = l.textContent;
        c.style.font = cs.font; c.style.color = cs.color; c.style.letterSpacing = cs.letterSpacing;
        c.style.left = r.left + 'px'; c.style.top = r.top + 'px';
        document.body.appendChild(c);
        const dx = dx0 - (r.left + r.width / 2), dy = dy0 - (r.top + r.height / 2);
        const alto = 62;
        const cuando = { duration: vuelo, delay: 120 + i * retraso, fill: 'both' };
        c.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(' + dx.toFixed(1) + 'px)' }],
          Object.assign({ easing: 'cubic-bezier(.6, 0, .85, .6)' }, cuando));
        c.firstChild.animate([
          { transform: 'translateY(0) scale(1) rotate(0)', opacity: 1, easing: 'cubic-bezier(.2, .7, .4, 1)' },
          { transform: 'translateY(' + (-alto) + 'px) scale(.92) rotate(' + (i % 2 ? 6 : -6) + 'deg)', opacity: 1, offset: .4, easing: 'cubic-bezier(.6, 0, .8, .5)' },
          { transform: 'translateY(' + dy.toFixed(1) + 'px) scale(.2) rotate(0)', opacity: 0 },
        ], cuando);
        setTimeout(() => c.remove(), 120 + i * retraso + vuelo + 40);
      });

      // el portapapeles empieza a tragar con las primeras y escupe con la última
      setTimeout(() => boton.classList.add('is-tragando'), 120 + vuelo * .6);
      termina(120 + (n - 1) * retraso + vuelo);
    }

    function termina(ms) {
      setTimeout(() => {
        boton.classList.remove('is-tragando');
        boton.classList.add('is-copiado');
        raiz.classList.remove('is-copiando');
        aviso.textContent = o.hecho;
      }, ms);
      setTimeout(() => { boton.classList.remove('is-copiado'); ocupado = false; }, ms + o.vuelve);
    }

    boton.addEventListener('click', copia);
    return { copia };
  }

  window.Calco = Calco;
})();
