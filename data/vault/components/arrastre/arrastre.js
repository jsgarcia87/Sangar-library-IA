/* =====================================================================
   Arrastre · Moxen
   Una zona para soltar archivos que respira en reposo, toma aire cuando
   algo pasa por encima y usa su propio borde como barra de progreso: el
   contorno se va dibujando mientras suben los archivos. Sin dependencias.

     const z = Arrastre(document.querySelector('[data-arrastre]'), {
       sube: (archivo, avance) => …,   // tu subida real; llama avance(0..1)
     });
     z.limpia();

   Sin `sube`, la subida se simula (sirve para probar la interfaz). Con
   `simula: [{ name, size }, …]`, un clic añade esos archivos de ejemplo
   en vez de abrir el selector.
   ===================================================================== */
(function () {
  'use strict';

  const peso = b => b < 1e6 ? Math.max(1, Math.round(b / 1e3)) + ' KB' : (b / 1e6).toFixed(1).replace('.', ',') + ' MB';
  // azar con semilla: la demostración sale igual cada vez
  function azar(s) { return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function Arrastre(zona, opciones) {
    const o = Object.assign({ simula: null, sube: null }, opciones);
    const rects = zona.querySelectorAll('.ar-borde rect');
    const progreso = zona.querySelector('.ar-progreso');
    const lista = zona.querySelector('.ar-lista');
    const input = zona.querySelector('input[type="file"]');
    const estado = zona.parentElement.querySelector('[data-arrastre-estado]');
    let archivos = [], raf = 0, antes = 0, rnd = azar(7);

    // el contorno se dibuja con las medidas reales de la zona
    function mide() {
      const w = zona.offsetWidth, h = zona.offsetHeight;
      const r = parseFloat(getComputedStyle(zona).borderTopLeftRadius) || 0;
      rects.forEach(el => {
        el.setAttribute('x', 1); el.setAttribute('y', 1);
        el.setAttribute('width', w - 2); el.setAttribute('height', h - 2);
        el.setAttribute('rx', Math.max(0, r - 1));
      });
    }

    function dice(t) { if (estado) estado.textContent = t; }

    function agrega(lote) {
      Array.from(lote).forEach(f => {
        const li = document.createElement('li');
        li.className = 'ar-archivo';
        li.style.setProperty('--i', lista.children.length);
        li.innerHTML = '<span class="ar-tipo"></span><span class="ar-nombre"></span><span class="ar-peso"></span><span class="ar-barra"><i></i></span>';
        li.querySelector('.ar-tipo').textContent = (f.name.split('.').pop() || '').slice(0, 4);
        li.querySelector('.ar-nombre').textContent = f.name;
        lista.appendChild(li);
        // lo pequeño sube antes: la duración crece con el logaritmo del peso
        const dura = (.7 + .55 * Math.log10(Math.max(f.size || 1, 1e4) / 1e4)) * (.85 + .3 * rnd());
        const a = { f, li, total: f.size || 1, hecho: 0, dura, fase: rnd() * 6, real: false };
        a.peso = li.querySelector('.ar-peso'); a.barra = li.querySelector('.ar-barra i');
        // con una subida real, el avance lo informa ella
        if (o.sube) { a.real = true; o.sube(f, p => { a.hecho = Math.min(1, p) * a.total; }); }
        archivos.push(a);
      });
      zona.classList.remove('is-encima', 'is-lista');
      zona.classList.add('is-ocupada');
      if (!raf) { antes = 0; raf = requestAnimationFrame(paso); }
    }

    /* La subida simulada no es lineal: la velocidad sube y baja con una
       onda propia de cada archivo, como una conexión de verdad. */
    function paso(t) {
      raf = 0;
      const dt = antes ? Math.min((t - antes) / 1000, .05) : 1 / 60;
      antes = t;
      let total = 0, hecho = 0, quedan = 0;
      archivos.forEach(a => {
        if (!a.real && a.hecho < a.total) {
          a.fase += dt;
          const ritmo = .55 + .9 * (.5 + .5 * Math.sin(a.fase * 3.1));
          a.hecho = Math.min(a.total, a.hecho + a.total / a.dura * dt * ritmo);
        }
        const p = a.hecho / a.total;
        a.barra.style.setProperty('--p', p.toFixed(4));
        const listo = p >= 1;
        if (listo && !a.li.classList.contains('is-lista')) a.li.classList.add('is-lista');
        a.peso.textContent = listo ? peso(a.total) + ' · listo' : peso(a.hecho) + ' de ' + peso(a.total);
        total += a.total; hecho += a.hecho;
        if (!listo) quedan++;
      });
      const p = total ? hecho / total : 0;
      progreso.style.strokeDasharray = p.toFixed(4) + ' 2';
      const n = archivos.length;
      if (quedan) {
        dice('Subiendo ' + n + (n === 1 ? ' archivo' : ' archivos') + ' · ' + Math.floor(p * 100) + ' %');
        raf = requestAnimationFrame(paso);
      } else {
        zona.classList.add('is-lista');
        dice(n + (n === 1 ? ' archivo listo' : ' archivos listos'));
      }
    }

    function limpia() {
      cancelAnimationFrame(raf); raf = 0;
      archivos = []; rnd = azar(7);
      lista.textContent = '';
      progreso.style.strokeDasharray = '0 2';
      zona.classList.remove('is-ocupada', 'is-lista', 'is-encima');
      dice('');
    }

    function elige() {
      if (zona.classList.contains('is-ocupada')) return;
      if (o.simula) agrega(o.simula); else input.click();
    }

    zona.addEventListener('click', elige);
    zona.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elige(); } });
    input.addEventListener('change', () => { if (input.files.length) agrega(input.files); input.value = ''; });
    // pasar por encima (con el cursor o arrastrando algo) la hace tomar aire
    const encima = si => { if (!zona.classList.contains('is-ocupada') || si === false) zona.classList.toggle('is-encima', si); };
    zona.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') encima(true); });
    zona.addEventListener('pointerleave', () => encima(false));
    zona.addEventListener('dragover', e => { e.preventDefault(); encima(true); });
    zona.addEventListener('dragleave', e => { if (!zona.contains(e.relatedTarget)) encima(false); });
    zona.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) agrega(e.dataTransfer.files); });
    addEventListener('resize', mide);

    mide();
    return { agrega, limpia };
  }

  window.Arrastre = Arrastre;
})();
