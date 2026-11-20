/* =====================================================================
   Radial · Moxen
   Un menú circular que aparece al mantener presionado: un anillo se llena
   bajo el dedo, las acciones salen en abanico y basta con arrastrar hacia
   una y soltar. Soltar en el centro cancela. Sin dependencias.

     Radial(document.querySelector('[data-radial]'), { radio: 150 });

   Se elige por dirección y no por puntería: lo que cuenta es el ángulo
   entre el centro y el dedo, así una acción se acierta con un gesto corto
   y sin mirar.
   ===================================================================== */
(function () {
  'use strict';

  function Radial(area, opciones) {
    const css = getComputedStyle(area);
    const o = Object.assign({
      radio: 150,                                         // px: del centro a cada acción
      espera: parseFloat(css.getPropertyValue('--rd-espera')) || 380,   // ms presionado
      muerta: 40,                                         // px: el centro, donde soltar cancela
    }, opciones);
    const menu = area.querySelector('[data-radial-menu]');
    const items = Array.from(menu.querySelectorAll('[data-radial-item]'));
    const nombre = menu.querySelector('[data-radial-nombre]');
    const linea = area.querySelector('[data-radial-linea]');
    const aviso = area.querySelector('[data-radial-aviso]');

    // cada acción a su ángulo, empezando arriba y en el sentido del reloj
    const paso = 2 * Math.PI / items.length;
    items.forEach((it, i) => {
      const a = -Math.PI / 2 + i * paso;
      it.style.setProperty('--x', (Math.cos(a) * o.radio).toFixed(1) + 'px');
      it.style.setProperty('--y', (Math.sin(a) * o.radio).toFixed(1) + 'px');
      it.style.setProperty('--i', i);
      it.setAttribute('aria-label', it.dataset.nombre);
    });

    let estado = 'quieto', cx = 0, cy = 0, px = 0, py = 0, elegido = null, espera = 0, oculta = 0, avisoT = 0;

    function local(e) {
      const r = area.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }

    function apunta() {
      if (linea) {
        linea.setAttribute('x1', cx); linea.setAttribute('y1', cy);
        linea.setAttribute('x2', px); linea.setAttribute('y2', py);
      }
      if (estado !== 'abierto') return;
      const dx = px - cx, dy = py - cy;
      let nuevo = null;
      if (Math.hypot(dx, dy) > o.muerta) {
        // el ángulo, girado para que el sector de cada acción quede centrado en ella
        const a = Math.atan2(dy, dx) + Math.PI / 2 + paso / 2;
        nuevo = items[Math.floor(((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / paso) % items.length];
      }
      if (nuevo === elegido) return;
      if (elegido) elegido.classList.remove('is-elegido');
      elegido = nuevo;
      menu.classList.toggle('is-eligiendo', !!elegido);
      if (elegido) {
        elegido.classList.add('is-elegido');
        nombre.textContent = elegido.dataset.nombre;
        if (navigator.vibrate) navigator.vibrate(6);
      }
    }

    function abre() {
      estado = 'abierto';
      menu.classList.add('is-abierto');
      area.querySelector('.rd-trazo').classList.add('is-visible');
      apunta();
    }

    function cierra() {
      clearTimeout(espera);
      estado = 'quieto';
      if (elegido) elegido.classList.remove('is-elegido');
      elegido = null;
      menu.classList.remove('is-abierto', 'is-cargando', 'is-eligiendo');
      area.querySelector('.rd-trazo').classList.remove('is-visible');
      // se oculta del todo cuando las acciones ya volvieron al centro
      clearTimeout(oculta);
      oculta = setTimeout(() => { if (estado === 'quieto') menu.classList.remove('is-visible'); }, 320);
    }

    function dispara(it) {
      it.dispatchEvent(new CustomEvent('radial', { bubbles: true, detail: { accion: it.dataset.nombre } }));
      if (aviso) {
        aviso.textContent = it.dataset.hecho || it.dataset.nombre;
        aviso.style.left = cx + 'px';
        aviso.style.top = cy + 'px';
        aviso.classList.add('is-visible');
        clearTimeout(avisoT);
        avisoT = setTimeout(() => aviso.classList.remove('is-visible'), 1500);
      }
    }

    area.addEventListener('pointerdown', e => {
      if (e.button !== 0 || estado !== 'quieto') return;
      try { area.setPointerCapture(e.pointerId); } catch (err) {}
      [px, py] = local(e);
      // cerca del borde, el círculo se corre hacia dentro para que quepa entero
      const m = o.radio + 56, r = area.getBoundingClientRect();
      cx = Math.min(r.width - m, Math.max(m, px));
      cy = Math.min(r.height - m, Math.max(m, py));
      menu.style.transform = 'translate(' + cx + 'px, ' + cy + 'px)';
      if (aviso) aviso.classList.remove('is-visible');
      clearTimeout(oculta);
      menu.classList.add('is-visible');
      void menu.offsetWidth;            // que el anillo arranque vacío
      menu.classList.add('is-cargando');
      estado = 'cargando';
      espera = setTimeout(abre, o.espera);
      apunta();
    });
    area.addEventListener('pointermove', e => { if (estado !== 'quieto') { [px, py] = local(e); apunta(); } });
    area.addEventListener('pointerup', () => {
      if (estado === 'abierto' && elegido) { const it = elegido; cierra(); dispara(it); }
      else if (estado !== 'quieto') cierra();
    });
    area.addEventListener('pointercancel', () => { if (estado !== 'quieto') cierra(); });
    area.addEventListener('contextmenu', e => e.preventDefault());
    // con teclado: las acciones también son botones normales
    items.forEach(it => it.addEventListener('click', () => { if (estado === 'quieto') dispara(it); }));

    return { cierra };
  }

  window.Radial = Radial;
})();
