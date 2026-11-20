/* =====================================================================
   Latido · Moxen
   Un «me gusta» con pulso: al pulsarlo, el corazón da un doble golpe
   —lub-dub—, se llena desde el centro y suelta chispas y corazones
   pequeños; la cuenta sube rodando. Mientras sigue marcado, late suave.

     const l = Latido(document.querySelector('.la-boton'), { cuenta: 128 });
     l.alterna();      l.marcado();

   Las chispas van en un <canvas> encima del botón, con su propia física
   (empuje, roce del aire y un poco de gravedad).
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ns = 'http://www.w3.org/2000/svg';
  // un corazón de 24 × 24, el mismo para la silueta, el recorte y las chispas
  const CORAZON = 'M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 6.9 4.5c2.1 0 3.6 1.2 5.1 3 1.5-1.8 3-3 5.1-3 3.5 0 5.5 3.5 4.2 6.8-1.8 4.6-9.3 9.2-9.3 9.2z';
  let cuenta = 0;

  function Latido(boton, opciones) {
    const o = Object.assign({ cuenta: 0, chispas: 26 }, opciones);
    const id = 'la-recorte-' + (++cuenta);

    boton.innerHTML =
      '<span class="la-corazon" aria-hidden="true"><svg viewBox="0 0 24 24"><g class="la-latido">' +
      '<clipPath id="' + id + '"><path d="' + CORAZON + '"/></clipPath>' +
      '<circle class="la-relleno" cx="12" cy="12.5" clip-path="url(#' + id + ')"/>' +
      '<path class="la-silueta" d="' + CORAZON + '"/></g></svg></span>' +
      '<span class="la-cuenta" aria-live="polite"></span>';
    const corazon = boton.querySelector('.la-corazon');
    const caja = boton.querySelector('.la-cuenta');
    boton.setAttribute('aria-pressed', 'false');

    /* La cuenta: una columna 0–9 por dígito. Cambiar de número es mover
       cada columna a su cifra; las que no cambian no se mueven. */
    let columnas = [];
    function pinta(n) {
      const cifras = String(n).split('');
      if (cifras.length !== columnas.length) {
        caja.textContent = '';
        columnas = cifras.map(() => {
          const c = document.createElement('span');
          c.className = 'la-columna';
          c.innerHTML = '<span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>';
          caja.appendChild(c); return c;
        });
      }
      cifras.forEach((d, i) => { columnas[i].style.transform = 'translateY(' + (-d) + 'em)'; });
      caja.setAttribute('aria-label', n + ' me gusta');
    }
    let n = o.cuenta, gusta = false;
    pinta(n);

    // el lienzo de las chispas, centrado en el corazón
    const lienzo = document.createElement('canvas');
    lienzo.className = 'la-lienzo';
    lienzo.setAttribute('aria-hidden', 'true');
    corazon.appendChild(lienzo);
    const L = 520, dpr = Math.min(2, devicePixelRatio || 1);
    lienzo.width = lienzo.height = L * dpr;
    lienzo.style.width = lienzo.style.height = L + 'px';
    lienzo.style.margin = (-L / 2) + 'px 0 0 ' + (-L / 2) + 'px';
    const ctx = lienzo.getContext('2d');
    const forma = new Path2D(CORAZON);
    let chispas = [], anillo = null, raf = 0, ultimo = null;

    function estalla() {
      const color = getComputedStyle(boton).getPropertyValue('--la-corazon').trim() || '#fff';
      chispas = Array.from({ length: o.chispas }, (_, i) => {
        const a = (i / o.chispas) * Math.PI * 2 + (Math.random() - .5) * .5;
        const v = 240 + Math.random() * 330, esCorazon = i % 4 === 0;
        return {
          x: 0, y: 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, vida: 0,
          dura: .55 + Math.random() * .45, r: esCorazon ? 7 + Math.random() * 5 : 1.6 + Math.random() * 2.4,
          esCorazon, giro: (Math.random() - .5) * 3, color,
        };
      });
      anillo = { r: 18, vida: 0, color };
      if (!raf) raf = requestAnimationFrame(paso);
    }

    function paso(ts) {
      if (ultimo === null) ultimo = ts;
      const dt = Math.min(.05, (ts - ultimo) / 1000);
      ultimo = ts;
      ctx.setTransform(dpr, 0, 0, dpr, L / 2 * dpr, L / 2 * dpr);
      ctx.clearRect(-L / 2, -L / 2, L, L);
      if (anillo) {
        anillo.vida += dt;
        const u = anillo.vida / .5;
        if (u >= 1) anillo = null;
        else {
          ctx.globalAlpha = (1 - u) * .7;
          ctx.strokeStyle = anillo.color; ctx.lineWidth = 3 * (1 - u) + .5;
          ctx.beginPath(); ctx.arc(0, 0, 22 + 120 * (1 - Math.pow(1 - u, 3)), 0, Math.PI * 2); ctx.stroke();
        }
      }
      chispas = chispas.filter(c => (c.vida += dt) < c.dura);
      chispas.forEach(c => {
        // roce del aire: frenan rápido y caen un poco
        const roce = Math.pow(.04, dt);
        c.vx *= roce; c.vy = c.vy * roce + 420 * dt;
        c.x += c.vx * dt; c.y += c.vy * dt;
        const u = c.vida / c.dura;
        ctx.globalAlpha = 1 - u * u;
        ctx.fillStyle = c.color;
        if (c.esCorazon) {
          ctx.save();
          ctx.translate(c.x, c.y); ctx.rotate(c.giro * u); ctx.scale(c.r / 12 * (1 - u * .4), c.r / 12 * (1 - u * .4)); ctx.translate(-12, -12.5);
          ctx.fill(forma); ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(c.x, c.y, c.r * (1 - u * .5), 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      if (chispas.length || anillo) raf = requestAnimationFrame(paso);
      else { raf = 0; ultimo = null; ctx.clearRect(-L / 2, -L / 2, L, L); }
    }

    let golpe = 0;
    function alterna() {
      gusta = !gusta;
      n += gusta ? 1 : -1;
      pinta(n);
      boton.classList.toggle('is-gusta', gusta);
      boton.setAttribute('aria-pressed', String(gusta));
      if (!gusta || reduce) return;
      // reinicia el golpe aunque se pulse seguido
      boton.classList.remove('is-late');
      void boton.offsetWidth;
      boton.classList.add('is-late');
      clearTimeout(golpe);
      golpe = setTimeout(() => boton.classList.remove('is-late'), 650);
      setTimeout(estalla, 130);       // las chispas salen con el segundo golpe, el fuerte
    }

    boton.addEventListener('click', alterna);
    return { alterna, marcado: () => gusta };
  }

  window.Latido = Latido;
})();
