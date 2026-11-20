/* =====================================================================
   Lámpara · Moxen
   Una lámpara colgante en una habitación a oscuras. Se tira de la
   cadena —con el ratón o con el dedo— y la ampolleta se enciende con un
   parpadeo: el haz se ve en el aire, con su polvo flotando, y la pared
   de abajo se ilumina con una caída suave. La cadena es física de
   verdad (eslabones con restricciones de distancia): cuelga, se tensa,
   tira del interruptor y, al soltarla, vuelve con un rebote y se mece.
   La lámpara también se mece un poco, y su luz con ella. Un toque o la
   tecla Enter dan un tirón corto. Sin dependencias.

     const l = Lampara(document.querySelector('[data-lampara]'), {
       umbral: 26,                       // px de recorrido para que haga clic
       alCambiar: encendida => { … },
     });
     l.alterna();      l.tiron();      l.encendida();
   ===================================================================== */
(function () {
  'use strict';

  /* La lámpara en sus coordenadas, en px: el techo en y = 0 y el eje en
     x = 0. Es lo mismo que el viewBox del SVG. */
  const BOCA = 247, RADIO = 149;      // el centro de la boca y su radio
  const FOCO = 251;                   // el centro de la ampolleta
  const ANCLA = [64, 242];            // de dónde sale la cadena, dentro de la pantalla
  const ABRE = Math.tan(31 * Math.PI / 180);   // cuánto se abre el haz
  const MURO = 160;                   // la pared, detrás del eje de la lámpara

  const HZ = 240, PASO = 1 / HZ;      // física a pasos fijos
  const ESLABONES = 22, LARGO = 7;    // la cadena: 22 tramos de 7 px
  const RECORRIDO = 44;               // lo que baja el interruptor como mucho
  const GRAVEDAD = 4000;
  const RESORTE = 34000;              // la precarga del interruptor (como aceleración)

  const suave = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  /* ── la luz ──────────────────────────────────────────────────────── */
  /* La luz que llega a un punto del espacio frente a la pared: dentro de
     un cono de borde blando y cayendo con la distancia a la ampolleta. */
  function cono(x, y) {
    const D = y - BOCA;
    const R = RADIO * .9 + Math.max(0, D) * ABRE;
    const r = Math.hypot(x, y - FOCO);
    return (1 - suave(.35, 1.3, Math.abs(x) / R)) * suave(-14, 30, D) / (1 + Math.pow(r / 200, 2));
  }
  /* El haz en el aire: la luz por el trozo de cono que cruza la mirada,
     que es más largo en el centro que en los bordes, y el resplandor que
     rodea la ampolleta. */
  function haz(x, y) {
    const R = RADIO * .9 + Math.max(0, y - BOCA) * ABRE, u = Math.min(1, Math.abs(x) / R);
    const r = Math.hypot(x, y - FOCO);
    // el resplandor sale hacia abajo y a los lados, nunca por encima de la pantalla
    const abajo = suave(-.1, .5, (y - BOCA + 6) / (r + 1));
    return cono(x, y) * (.4 + .6 * Math.sqrt(1 - u * u)) / (1 + Math.pow(r / 300, 2)) + .22 / (1 + Math.pow(r / 120, 2)) * abajo;
  }
  /* La pared: está a MURO px detrás del eje, así que el cono la corta en
     un arco que se abre hacia abajo. Llega más luz donde le da de frente
     y cerca; luego se comprime para que no se queme. */
  function pared(x, y) {
    const D = y - BOCA;
    const R = RADIO * .9 + Math.max(0, D) * ABRE;
    const lejos = Math.hypot(x, MURO);
    const dentro = (1 - suave(.55, 1.45, lejos / R)) * suave(-30, 70, D);
    const r = Math.hypot(x, y - FOCO, MURO);
    const e = dentro * (MURO / r) / Math.pow(r / 360, 1.6);
    return 1 - Math.exp(-4.4 * e);
  }

  /* Las dos luces fijas se calculan una vez, a media resolución, en
     texturas blancas cuya opacidad es la luz. Con un poco de ruido al
     redondear: sin él, los degradados oscuros se ven a escalones. */
  const T = { x0: -1000, x1: 1000, y0: 120, y1: 1300, k: .5 };
  function textura(f) {
    const w = Math.round((T.x1 - T.x0) * T.k), h = Math.round((T.y1 - T.y0) * T.k);
    const lienzo = document.createElement('canvas');
    lienzo.width = w; lienzo.height = h;
    const g = lienzo.getContext('2d'), img = g.createImageData(w, h), d = img.data;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const v = f(T.x0 + (i + .5) / T.k, T.y0 + (j + .5) / T.k), k = (j * w + i) * 4;
        d[k] = d[k + 1] = d[k + 2] = 255;
        d[k + 3] = Math.max(0, Math.min(255, Math.round(v * 255 + Math.random() - .5)));
      }
    }
    g.putImageData(img, 0, 0);
    return lienzo;
  }

  /* El encendido: la ampolleta duda antes de quedarse (un parpadeo) y
     empieza tibia, como un filamento que se calienta; al apagarse cae
     enseguida y el filamento se enfría en un brillo tibio. t en segundos. */
  const PARPADEO = [[0, 0], [.035, .8], [.08, .16], [.13, .92], [.19, .42], [.28, 1]];
  function prende(t) {
    for (let k = 1; k < PARPADEO.length; k++) {
      const [ta, a] = PARPADEO[k - 1], [tb, b] = PARPADEO[k];
      if (t < tb) return a + (b - a) * (t - ta) / (tb - ta);
    }
    return 1;
  }

  function Lampara(escena, opciones) {
    const o = Object.assign({ umbral: 26, alCambiar: null }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lampara = escena.querySelector('.lp-lampara');
    const capaPared = escena.querySelector('.lp-pared'), capaAire = escena.querySelector('.lp-aire');
    const cp = capaPared.getContext('2d'), ca = capaAire.getContext('2d');
    const hilo = escena.querySelector('.lp-hilo');
    const bolas = escena.querySelector('.lp-bolas'), brillos = escena.querySelector('.lp-bolas-brillo');
    const tirador = escena.querySelector('.lp-tirador');
    const encendidos = lampara.querySelectorAll('.lp-encendido');
    const tibia = lampara.querySelector('.lp-tibia');
    const css = getComputedStyle(escena);
    const lee = (n, d) => { const v = parseFloat(css.getPropertyValue(n)); return isNaN(v) ? d : v; };
    const AMBIENTE = lee('--lp-ambiente', .1), REBOTE = lee('--lp-rebote', 0), HAZ = lee('--lp-haz', .2);

    const texPared = textura(pared);
    const texHaz = textura(haz);

    // un azar con semilla para el polvo: el vídeo sale siempre igual
    let sem = 11;
    const azar = (a = 0, b = 1) => {
      sem = (sem + 0x6D2B79F5) | 0;
      let t = Math.imul(sem ^ (sem >>> 15), 1 | sem);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return a + (b - a) * (((t ^ (t >>> 14)) >>> 0) / 4294967296);
    };

    /* ── el estado ─────────────────────────────────────────────────── */
    let W = 0, H = 0, dpr = 1;
    let encendida = false, cambio = -10, desde = 0;   // cuándo cambió y con cuánta luz
    let reloj = 0, luz = 0, tibio = 0;
    let fi = 0, vfi = 0;                 // la lámpara meciéndose (radianes)
    let s = 0, vs = 0;                   // el interruptor: cuánto ha bajado
    let armado = true, arrastre = null, objetivo = null;
    const px = new Float64Array(ESLABONES + 1), py = new Float64Array(ESLABONES + 1);
    const vx = new Float64Array(ESLABONES + 1), vy = new Float64Array(ESLABONES + 1);

    // de la lámpara a la pantalla: girar por fi alrededor del techo
    const enPantalla = (x, y) => [W / 2 + x * Math.cos(fi) - y * Math.sin(fi), x * Math.sin(fi) + y * Math.cos(fi)];
    const enLampara = (x, y) => { x -= W / 2; return [x * Math.cos(fi) + y * Math.sin(fi), -x * Math.sin(fi) + y * Math.cos(fi)]; };
    const eje = () => [-Math.sin(fi), Math.cos(fi)];   // «abajo» para la lámpara
    function ancla() { const [ax, ay] = enPantalla(ANCLA[0], ANCLA[1]), [ex, ey] = eje(); return [ax + ex * s, ay + ey * s]; }

    function ajusta() {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = escena.clientWidth; H = escena.clientHeight;
      [capaPared, capaAire].forEach(c => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    }
    ajusta();
    // la cadena empieza colgando quieta
    function cuelga() {
      const [ax, ay] = ancla();
      for (let k = 0; k <= ESLABONES; k++) { px[k] = ax; py[k] = ay + k * LARGO; vx[k] = vy[k] = 0; }
    }
    cuelga();

    // el polvo: motas pequeñas y algunas grandes, fuera de foco
    const motas = [];
    for (let k = 0; k < 230; k++) {
      const z = azar();
      motas.push({ x: azar(-520, 520), y: azar(240, 900), z, vx: azar(-6, 6), vy: azar(-5, 3), f: azar(0, 6.3), w: azar(.4, 1.3), b: azar(.4, 1) });
    }

    /* ── la cadena ─────────────────────────────────────────────────── */
    /* Un paso de física: gravedad, y luego cada tramo vuelve a medir LARGO
       (unas cuantas pasadas). El primer punto es el interruptor: solo se
       mueve a lo largo del eje y un resorte lo devuelve arriba; si la
       cadena tira más que el resorte, baja y hace clic. */
    function paso() {
      reloj += PASO;
      // la lámpara: un péndulo amortiguado; la cadena tensa tira de su ancla
      const [ax, ay] = ancla();
      const fuerza = s > .2 ? RESORTE + 1600 * s : 0;
      const dx = px[1] - ax, dy = py[1] - ay, dl = Math.hypot(dx, dy) || 1;
      const par = (ax - W / 2) * (dy / dl) - ay * (dx / dl);
      vfi += (-9 * fi - 1.1 * vfi + par * fuerza * 4e-8) * PASO;
      fi += vfi * PASO;

      /* El resorte del interruptor viene precargado: aguanta el peso de la
         cadena sin moverse y solo cede a un tirón. Al soltar, vuelve de golpe. */
      vs += (-(RESORTE + 1600 * s) - 40 * vs) * PASO;
      const s0 = s;
      s = Math.max(0, Math.min(RECORRIDO, s + vs * PASO));
      if (s === 0 && vs < 0) vs = 0;
      // el tirón del teclado: una mano invisible baja el tirador y lo suelta
      if (arrastre && arrastre.solo) {
        const u = (reloj - arrastre.t0) / .13;
        objetivo = [arrastre.x, arrastre.y + 48 * (1 - Math.pow(1 - Math.min(1, u), 3))];
        if (u > 1.25) arrastre = null;
      }
      const qx = Float64Array.from(px), qy = Float64Array.from(py);
      const amort = Math.exp(-1.2 * PASO);
      for (let k = 1; k <= ESLABONES; k++) {
        if (k === ESLABONES && arrastre) {
          // el tirador va hacia el dedo con un pelo de retraso
          px[k] += (objetivo[0] - px[k]) * .45; py[k] += (objetivo[1] - py[k]) * .45;
          continue;
        }
        vy[k] += GRAVEDAD * PASO;
        vx[k] *= amort; vy[k] *= amort;
        px[k] += vx[k] * PASO; py[k] += vy[k] * PASO;
      }
      for (let it = 0; it < 12; it++) {
        // el interruptor
        let [x0, y0] = ancla();
        px[0] = x0; py[0] = y0;
        for (let k = 0; k < ESLABONES; k++) {
          const ex = px[k + 1] - px[k], ey = py[k + 1] - py[k], d = Math.hypot(ex, ey) || 1e-6;
          const c = (d - LARGO) / d;
          const wa = k === 0 ? .25 : 1, wb = k + 1 === ESLABONES ? (arrastre ? 0 : .35) : 1;
          const ka = wa / (wa + wb), kb = wb / (wa + wb);
          if (k === 0) {
            // el interruptor solo baja o sube por su eje
            const [ux, uy] = eje();
            if (c > 0 || s > 0) {
              s = Math.max(0, Math.min(RECORRIDO, s + (ex * c * ka) * ux + (ey * c * ka) * uy));
              [x0, y0] = ancla(); px[0] = x0; py[0] = y0;
            }
          } else { px[k] += ex * c * ka; py[k] += ey * c * ka; }
          px[k + 1] -= ex * c * kb; py[k + 1] -= ey * c * kb;
        }
      }
      for (let k = 1; k <= ESLABONES; k++) { vx[k] = (px[k] - qx[k]) / PASO; vy[k] = (py[k] - qy[k]) / PASO; }
      vs = (s - s0) / PASO;
      vigila();
    }

    /* Hace clic una vez por tirón: al pasar el umbral, y no vuelve a
       contar hasta que el interruptor sube casi a su sitio. */
    function vigila() {
      if (armado && s > o.umbral) { armado = false; alterna(); escena.classList.add('is-usada'); }
      else if (!armado && s < o.umbral * .35) armado = true;
    }

    function alterna(valor) {
      const nueva = typeof valor === 'boolean' ? valor : !encendida;
      if (nueva === encendida) return;
      encendida = nueva; cambio = reloj; desde = luz;
      tirador.setAttribute('aria-checked', String(encendida));
      escena.classList.toggle('is-encendida', encendida);
      if (o.alCambiar) o.alCambiar(encendida);
      arranca();
    }

    // la luz de este instante, con su parpadeo
    function calcula() {
      const t = reloj - cambio;
      if (reduce) { luz = encendida ? 1 : 0; tibio = 0; return; }
      if (encendida) { luz = prende(t); tibio = .85 * Math.exp(-t / .35); }
      else { luz = desde * Math.exp(-t / .05); tibio = .6 * desde * Math.exp(-t / .22); }
    }

    /* ── el dibujo ─────────────────────────────────────────────────── */
    function dibujaLuz() {
      // la pared: gris de ambiente y, sumada encima, la mancha de luz
      cp.setTransform(dpr, 0, 0, dpr, 0, 0);
      cp.globalCompositeOperation = 'source-over'; cp.globalAlpha = 1;
      const g = Math.round(255 * AMBIENTE);
      cp.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')';
      cp.fillRect(0, 0, W, H);
      ca.setTransform(1, 0, 0, 1, 0, 0);
      ca.clearRect(0, 0, capaAire.width, capaAire.height);
      if (luz < .002 && tibio < .002) return;
      const giro = (c) => { c.translate(W / 2, 0); c.rotate(fi); };
      cp.save(); giro(cp);
      cp.globalCompositeOperation = 'lighter';
      cp.globalAlpha = luz * (1 - AMBIENTE);
      cp.drawImage(texPared, T.x0, T.y0, T.x1 - T.x0, T.y1 - T.y0);
      cp.restore();

      // el aire: el haz, lo que devuelve la pared y el halo de la ampolleta
      ca.setTransform(dpr, 0, 0, dpr, 0, 0);
      ca.save(); giro(ca);
      /* Todo lo del aire empieza bajo el labio de delante: por encima está
         la pantalla, que tapa la ampolleta y no deja salir la luz. */
      ca.beginPath();
      ca.moveTo(-RADIO - 1, BOCA);
      ca.ellipse(0, BOCA, RADIO + 1, 15, 0, Math.PI, 0);
      ca.lineTo(2000, BOCA); ca.lineTo(2000, 3000); ca.lineTo(-2000, 3000); ca.lineTo(-2000, BOCA);
      ca.closePath();
      ca.clip();
      ca.globalAlpha = Math.min(1, luz * HAZ);
      ca.drawImage(texHaz, T.x0, T.y0, T.x1 - T.x0, T.y1 - T.y0);
      if (REBOTE) { ca.globalAlpha = luz * REBOTE; ca.drawImage(texPared, T.x0, T.y0, T.x1 - T.x0, T.y1 - T.y0); }
      ca.globalAlpha = 1;
      ca.globalCompositeOperation = 'lighter';
      // el halo: blanco, y tibio mientras el filamento se calienta o se enfría
      const tono = (a) => 'rgba(255,' + Math.round(255 - 50 * tibio) + ',' + Math.round(255 - 110 * tibio) + ',' + a.toFixed(3) + ')';
      const brillo = Math.max(luz, tibio * .7);
      const h = ca.createRadialGradient(0, FOCO, 18, 0, FOCO, 86);
      h.addColorStop(0, tono(.7 * brillo)); h.addColorStop(.3, tono(.2 * brillo)); h.addColorStop(1, tono(0));
      ca.fillStyle = h; ca.fillRect(-90, FOCO - 90, 180, 180);

      // el polvo: cada mota brilla según la luz que le llega
      ca.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const m of motas) {
        const [lx, ly] = enLampara(W / 2 + m.x, m.y);
        const b = luz * cono(lx, ly) * m.b * (.55 + .45 * Math.sin(reloj * m.w * 3 + m.f));
        if (b < .01) continue;
        const x = W / 2 + m.x, y = m.y;
        if (m.z > .9) {
          // las de muy cerca: grandes y desenfocadas
          const r = 3 + 5 * (m.z - .9) * 10;
          const gr = ca.createRadialGradient(x, y, 0, x, y, r);
          gr.addColorStop(0, 'rgba(255,255,255,' + (.16 * b).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          ca.fillStyle = gr; ca.fillRect(x - r, y - r, 2 * r, 2 * r);
        } else {
          const r = .45 + 1.1 * m.z;
          ca.fillStyle = 'rgba(255,255,255,' + Math.min(1, .95 * b).toFixed(3) + ')';
          ca.beginPath(); ca.arc(x, y, r, 0, 6.2832); ca.fill();
        }
      }
      ca.restore();
    }

    // la cadena: una curva suave por los eslabones, con bolitas y su brillo
    function dibujaCadena() {
      let d = 'M' + px[0].toFixed(1) + ' ' + py[0].toFixed(1);
      for (let k = 1; k < ESLABONES; k++) {
        const mx = (px[k] + px[k + 1]) / 2, my = (py[k] + py[k + 1]) / 2;
        d += 'Q' + px[k].toFixed(1) + ' ' + py[k].toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1);
      }
      d += 'L' + px[ESLABONES].toFixed(1) + ' ' + py[ESLABONES].toFixed(1);
      hilo.setAttribute('d', d); bolas.setAttribute('d', d); brillos.setAttribute('d', d);
      const k = ESLABONES, ang = Math.atan2(px[k] - px[k - 1], py[k] - py[k - 1]) * -180 / Math.PI;
      tirador.style.transform = 'translate(' + (px[k] - 8).toFixed(1) + 'px, ' + (py[k] - 1).toFixed(1) + 'px) rotate(' + ang.toFixed(2) + 'deg)';
    }

    function pinta() {
      lampara.style.transform = 'rotate(' + (fi * 180 / Math.PI).toFixed(3) + 'deg)';
      encendidos.forEach(e => { e.style.opacity = luz.toFixed(3); });
      tibia.style.opacity = Math.min(1, tibio).toFixed(3);
      escena.style.setProperty('--lp-luz', luz.toFixed(3));
      dibujaLuz();
      dibujaCadena();
    }

    /* ── el tiempo ─────────────────────────────────────────────────── */
    let raf = 0, previo = null, resto = 0;
    function cuadro(t) {
      if (previo !== null) resto += Math.min(100, t - previo);
      previo = t;
      const dt = Math.floor(resto / (1000 / HZ));
      for (let n = 0; n < Math.min(dt, 24); n++) {
        paso();
        if (reduce) continue;
        for (const m of motas) {
          // el polvo flota: deriva lenta y un vaivén
          m.x += (m.vx + 5 * Math.sin(reloj * m.w + m.f)) * PASO;
          m.y += (m.vy + 3 * Math.cos(reloj * m.w * .8 + m.f)) * PASO;
          if (m.x < -540) m.x += 1080; else if (m.x > 540) m.x -= 1080;
          if (m.y < 230) m.y += 680; else if (m.y > 910) m.y -= 680;
        }
      }
      resto -= dt * (1000 / HZ);
      calcula();
      pinta();
      /* Se para cuando ya no hay nada que mover: apagada, la cadena quieta
         y la lámpara en su sitio. */
      const apagada = reduce || (!encendida && luz < .002 && tibio < .002);
      let quieta = !arrastre && apagada && s < .05 && Math.abs(vfi) + Math.abs(fi) < 1e-4;
      for (let k = 1; quieta && k <= ESLABONES; k++) if (Math.abs(vx[k]) + Math.abs(vy[k]) > .5) quieta = false;
      if (quieta) { raf = 0; previo = null; return; }
      raf = requestAnimationFrame(cuadro);
    }
    function arranca() { if (!raf) raf = requestAnimationFrame(cuadro); }

    // un tirón corto, para el toque y para el teclado
    function tiron() {
      if (reduce) { alterna(); calcula(); pinta(); return; }
      if (arrastre) return;
      arrastre = { solo: true, t0: reloj, x: px[ESLABONES], y: py[ESLABONES] };
      objetivo = [arrastre.x, arrastre.y];
      arranca();
    }

    tirador.addEventListener('pointerdown', e => {
      tirador.setPointerCapture(e.pointerId);
      const r = escena.getBoundingClientRect();
      arrastre = { x0: e.clientX, y0: e.clientY, dx: px[ESLABONES] - (e.clientX - r.left), dy: py[ESLABONES] - (e.clientY - r.top), movido: false };
      objetivo = [px[ESLABONES], py[ESLABONES]];
      arranca();
    });
    tirador.addEventListener('pointermove', e => {
      if (!arrastre || arrastre.solo) return;
      if (Math.abs(e.clientX - arrastre.x0) + Math.abs(e.clientY - arrastre.y0) > 4) arrastre.movido = true;
      const r = escena.getBoundingClientRect();
      let tx = e.clientX - r.left + arrastre.dx, ty = e.clientY - r.top + arrastre.dy;
      /* Más allá del largo de la cadena se tira contra el resorte: el
         tirador cede cada vez menos, hasta el tope del interruptor. */
      const [ax, ay] = enPantalla(ANCLA[0], ANCLA[1]), L = ESLABONES * LARGO;
      const d = Math.hypot(tx - ax, ty - ay);
      if (d > L) {
        const n = L + RECORRIDO * .97 * Math.tanh((d - L) / RECORRIDO);
        tx = ax + (tx - ax) / d * n; ty = ay + (ty - ay) / d * n;
      }
      objetivo = [tx, ty];
      if (reduce) { px[ESLABONES] = tx; py[ESLABONES] = ty; }
    });
    const suelta = () => {
      if (!arrastre || arrastre.solo) return;
      tirador.dataset.movido = arrastre.movido ? '1' : '';
      arrastre = null;
      if (reduce) { s = 0; cuelga(); }
      arranca();
    };
    tirador.addEventListener('pointerup', suelta);
    tirador.addEventListener('pointercancel', suelta);
    // un clic sin arrastre (o Enter y Espacio) es un tirón corto
    tirador.addEventListener('click', () => {
      if (tirador.dataset.movido) { tirador.dataset.movido = ''; return; }
      tiron();
    });

    addEventListener('resize', () => { ajusta(); cuelga(); calcula(); pinta(); }, { passive: true });
    calcula();
    pinta();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { calcula(); pinta(); });

    return { alterna: v => { alterna(v); calcula(); pinta(); }, tiron, encendida: () => encendida };
  }

  window.Lampara = Lampara;
})();
