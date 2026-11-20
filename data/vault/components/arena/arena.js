/* =====================================================================
   Arena · Moxen
   Un reloj de arena de vidrio que se vacía grano a grano y, vacío, se
   da vuelta. La arena es un autómata celular en un lienzo: cada grano
   cae si tiene hueco debajo y, si no, resbala en diagonal. Nadie dibuja
   el embudo de arriba ni el cono de abajo: salen solos, como en la
   arena de verdad. Por el cuello pasan a caudal constante y caen en un
   hilo de partículas con gravedad, que rebotan un poco en el montón.
   Al darse vuelta gira con inercia, se alza y se posa. Sin dependencias.

     Arena(document.querySelector('[data-arena]'), { ciclo: 7 });

   El ciclo dura siempre lo mismo (en segundos), así el bucle es exacto.
   ===================================================================== */
(function () {
  'use strict';

  /* La geometría, en unidades del viewBox (300 × 640). El cuello está en
     el centro y los dos bulbos son iguales: girado media vuelta, el reloj
     es idéntico a sí mismo, y por eso la vuelta no deja costura. */
  const CX = 150, CY = 320;
  const FONDO = 273;            // del cuello a la tapa, por dentro
  const ANCHO = 92;             // medio ancho del bulbo, por dentro
  const CUELLO = 3.8;           // medio ancho del cuello
  const VIENTRE = 205;          // dónde el bulbo es más ancho

  // el medio ancho interior a la distancia d del cuello
  function radio(d) {
    const s = Math.sqrt(d * d + 49) - 7;                 // el cuello, redondeado
    if (s <= VIENTRE) return CUELLO + (ANCHO - CUELLO) * Math.sin(Math.PI / 2 * s / VIENTRE);
    const u = (s - VIENTRE) / (FONDO - VIENTRE);
    return ANCHO - 13 * u * u;                           // el hombro que entra en la tapa
  }
  // el vidrio es más grueso en el cuello, donde se estrangula
  const grosor = d => 2.6 + 3 * Math.exp(-d / 9);

  /* La rejilla de la arena: un grano por celda de 2,4 unidades. Las
     filas se reparten a los dos lados del cuello y la columna central
     cae justo en el eje, así la rejilla también es simétrica. */
  const C = 2.4;
  const COLS = 81, FILAS = 230, CI = 40, MITAD = 115;   // MITAD: primera fila del bulbo de abajo
  const N = COLS * FILAS;
  const gx = i => CX + (i - CI) * C;
  const gy = j => CY + (j - (FILAS - 1) / 2) * C;

  const HZ = 480, PASO = 1 / HZ;   // la física va a pasos fijos: igual a cualquier fps
  const GRAVEDAD = 5200;           // la del hilo, en unidades/s²
  const DESLIZA = .25;             // cuánto resbala de lado: pendientes de unos 33°
  const REBOTA = .45;              // los granos que rebotan al llegar al montón

  const suaveIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const seno = t => (1 - Math.cos(Math.PI * t)) / 2;
  const sale = t => 1 - Math.pow(1 - t, 3);
  const acota = (v, a, b) => Math.max(a, Math.min(b, v));

  /* La vuelta, en segundos desde que empieza (r). El giro tiene inercia:
     arranca despacio, se pasa 6° y vuelve; el reloj se alza mientras
     gira y se posa con un pequeño rebote. */
  function giro(r) {
    const q = (r - .1) / 1.1;
    if (q <= 0) return 0;
    if (q < .64) return 186 * suaveIO(q / .64);
    if (q < 1) return 186 - 6 * seno((q - .64) / .36);
    return 180;
  }
  function alzado(r) {
    if (r < .28) return sale(r / .28);
    if (r < 1.04) return 1;
    if (r < 1.38) { const u = (r - 1.04) / .34; return 1 - u * u; }
    return -.07 * Math.sin(Math.PI * Math.min(1, (r - 1.38) / .14));
  }
  const VUELTA = 1.52;              // lo que dura todo el movimiento
  /* Cuándo se suelta la arena: a 176°, con el bulbo lleno ya arriba.
     Hasta entonces va apretada contra la tapa, como al girar deprisa. */
  let SUELTA = .1;
  while (giro(SUELTA) < 176) SUELTA += .0005;

  function Arena(caja, opciones) {
    const o = Object.assign({
      ciclo: 7,          // segundos de una vuelta completa
      vacia: 5.75,       // lo que tarda en pasar toda la arena
      nivel: 168,        // hasta dónde llega la arena arriba, desde el cuello
      alza: 22,          // cuánto se levanta al girar
      semilla: 7,
    }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cuerpo = caja.querySelector('.ar-cuerpo');
    const sombra = caja.querySelector('.ar-sombra');
    const lienzo = caja.querySelector('.ar-lienzo');
    const ctx = lienzo.getContext('2d');
    const luces = caja.querySelectorAll('.ar-luz');
    const PASOS = Math.round(o.ciclo * HZ);
    const GIRA = o.ciclo - SUELTA;    // cuándo empieza a darse vuelta

    // un azar con semilla (mulberry32): cada vuelta es igual de bonita
    let sem = o.semilla >>> 0;
    const azar = () => {
      sem = (sem + 0x6D2B79F5) | 0;
      let t = Math.imul(sem ^ (sem >>> 15), 1 | sem);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    /* ── el vidrio ─────────────────────────────────────────────────── */
    // una silueta cerrada con medio ancho r(d), de tapa a tapa
    function silueta(r, alto) {
      const izq = [], der = [], n = Math.ceil(alto / .75);
      for (let k = 0; k <= n; k++) {
        const y = -alto + 2 * alto * k / n, w = r(Math.abs(y));
        izq.push((CX - w).toFixed(2) + ' ' + (CY + y).toFixed(2));
        der.unshift((CX + w).toFixed(2) + ' ' + (CY + y).toFixed(2));
      }
      return 'M' + izq.concat(der).join('L') + 'Z';
    }
    /* Un brillo alargado que sigue la curva del vidrio, a una fracción f
       del radio y afilado en las puntas; uno en cada bulbo. */
    function veta(f, d0, d1, ancho, lado) {
      let s = '';
      [-1, 1].forEach(sy => {
        const a = [], b = [];
        for (let k = 0; k <= 48; k++) {
          const d = d0 + (d1 - d0) * k / 48, w = ancho * Math.sin(Math.PI * k / 48) / 2;
          const x = CX + lado * f * radio(d), y = CY + sy * d;
          a.push((x - w).toFixed(2) + ' ' + y.toFixed(2));
          b.unshift((x + w).toFixed(2) + ' ' + y.toFixed(2));
        }
        s += 'M' + a.concat(b).join('L') + 'Z';
      });
      return s;
    }
    const dentro = silueta(radio, FONDO);
    const fuera = silueta(d => radio(d) + grosor(d), FONDO + 2);
    const pon = (sel, d) => caja.querySelectorAll(sel).forEach(e => e.setAttribute('d', d));
    pon('.ar-interior', dentro);
    pon('.ar-pared', fuera + dentro);
    pon('.ar-filo', fuera);
    pon('.ar-filo-dentro', dentro);
    pon('.ar-veta', veta(.66, 58, 236, 9, -1));
    pon('.ar-veta-fina', veta(.72, 96, 214, 2, -1));
    pon('.ar-reflejo', veta(.9, 80, 238, 1.6, 1));
    pon('.ar-hombro', veta(.42, 238, 262, 7, -1));
    pon('.ar-cuello-brillo', veta(1.02, 3, 40, 1.4, -1));
    const recorte = new Path2D(dentro);

    /* ── la arena ──────────────────────────────────────────────────── */
    const celda = new Uint8Array(N);       // 0 hueco · 1 grano · 2 vidrio
    const lado = new Uint8Array(N);        // 0 bulbo de arriba · 1 de abajo
    const tono = new Float32Array(N);      // el brillo propio de cada grano
    const jx = new Float32Array(N), jy = new Float32Array(N);   // su desorden
    const luz = new Float32Array(N);       // la sombra del volumen, por celda
    const marca = new Uint32Array(N);      // para no mover dos veces un grano
    const deja = new Uint32Array(N);       // y para saber qué celdas se vaciaron en esta pasada
    const desde = new Int16Array(FILAS).fill(COLS), hasta = new Int16Array(FILAS).fill(-1);
    const fondoCol = new Int16Array(COLS).fill(-1);
    for (let j = 0; j < FILAS; j++) {
      const d = Math.abs(gy(j) - CY), r = radio(d);
      for (let i = 0; i < COLS; i++) {
        const a = j * COLS + i, dx = Math.abs(gx(i) - CX);
        lado[a] = j >= MITAD ? 1 : 0;
        if (d <= FONDO - .5 && dx <= r - 1) {
          desde[j] = Math.min(desde[j], i); hasta[j] = Math.max(hasta[j], i);
          // más oscura contra el vidrio: se lee el volumen del bulbo
          luz[a] = 1 - .42 * Math.pow(dx / r, 2.2);
          if (j >= MITAD) fondoCol[i] = j;
        } else celda[a] = 2;
      }
    }
    const salidas = [];
    for (let i = desde[MITAD - 1]; i <= hasta[MITAD - 1]; i++) salidas.push((MITAD - 1) * COLS + i);

    // el tono de un grano: casi todos parecidos, alguno oscuro y alguno que brilla
    function tonoGrano() {
      const u = azar();
      return u < .07 ? .55 + .15 * azar() : u > .96 ? 1.12 : .8 + .2 * azar();
    }
    function nuevoGrano(a) {
      celda[a] = 1; tono[a] = tonoGrano();
      jx[a] = (azar() - .5) * .4; jy[a] = (azar() - .5) * .4;
    }

    function mueve(a, b) {
      celda[b] = 1; celda[a] = 0;
      tono[b] = tono[a]; jx[b] = jx[a]; jy[b] = jy[a];
      marca[b] = pasada; deja[a] = pasada;
    }
    const libre = (a, b) => celda[b] === 0 && lado[b] === lado[a];
    /* De lado solo se entra en huecos que ya estaban al empezar la pasada.
       Si no, el hueco que deja una columna al bajar se escaparía por los
       costados a mitad de camino y arriba saldría un pico, no un embudo. */
    const libreDeLado = (a, b) => libre(a, b) && deja[b] !== pasada;

    /* Un paso del autómata. Se recorre de abajo arriba para que una
       columna entera baje de una vez, y cada fila en un sentido distinto
       para no favorecer un lado. Ningún grano cruza el cuello: lo cruzan
       las partículas del hilo. */
    let pasada = 0;
    function automata() {
      pasada++;
      for (let j = FILAS - 2; j > 0; j--) {
        const i0 = desde[j], i1 = hasta[j], al = (j + pasada) & 1;
        for (let n = 0; n <= i1 - i0; n++) {
          const a = j * COLS + (al ? i0 + n : i1 - n);
          if (celda[a] !== 1 || marca[a] === pasada) continue;
          if (libre(a, a + COLS)) { mueve(a, a + COLS); continue; }
          const s = azar() < .5 ? 1 : -1;
          if (libreDeLado(a, a + COLS + s)) { mueve(a, a + COLS + s); continue; }
          if (libreDeLado(a, a + COLS - s)) { mueve(a, a + COLS - s); continue; }
          /* Si las diagonales están llenas, a veces salta dos de lado y
             uno abajo, si el paso está libre: sin esto la arena se quedaría
             en 45°, demasiado empinada; con esto se tiende a la mitad. */
          if (azar() < DESLIZA && libreDeLado(a, a + s) && libreDeLado(a, a + COLS + 2 * s)) mueve(a, a + COLS + 2 * s);
        }
      }
    }

    /* El hueco que deja un grano al salir por el cuello sube hasta la
       superficie: cada grano de encima baja un puesto, casi siempre el de
       justo arriba y a veces uno en diagonal. Así baja el chorro de arena
       que va al cuello y el hueco aparece arriba, en el centro: es donde
       se abre el embudo, que el autómata deja con la pendiente de la arena. */
    function sube(h) {
      for (let n = 0; n < FILAS; n++) {
        const a = h - COLS, iz = a - 1, de = a + 1;
        const ga = celda[a] === 1 && !lado[a], gi = celda[iz] === 1 && !lado[iz], gd = celda[de] === 1 && !lado[de];
        if (!ga && !gi && !gd) return;
        let b;
        if (ga && (azar() < .62 || (!gi && !gd))) b = a;
        else if (gi && gd) b = azar() < .5 ? iz : de;
        else b = gi ? iz : de;
        mueve(b, h);
        h = b;
      }
    }

    // la altura del montón de abajo en cada columna (la primera fila con arena)
    const alto = new Int16Array(COLS);
    function mideMonton() {
      for (let i = 1; i < COLS - 1; i++) {
        let j = MITAD;
        while (j <= fondoCol[i] && celda[j * COLS + i] !== 1) j++;
        alto[i] = j;
      }
    }

    /* ── el hilo ───────────────────────────────────────────────────── */
    let cayendo = [], acum = 0, granos = 0, caudal = 0;
    // por el cuello sale un grano cada 1/caudal segundos, de una celda de salida al azar
    function abreCuello() {
      acum = Math.min(acum + caudal * PASO, 3);
      const k0 = Math.floor(azar() * salidas.length);
      for (let n = 0; n < salidas.length && acum >= 1; n++) {
        const a = salidas[(k0 + n) % salidas.length];
        if (celda[a] !== 1) continue;
        // todos salen por el centro del cuello: el hilo es uno solo y recto
        cayendo.push({ x: CX + (azar() - .5) * 1.2, y: gy(MITAD - 1) + C, vx: (azar() - .5) * 3, vy: 30 + 40 * azar(), tono: tono[a], rebote: false });
        celda[a] = 0; acum -= 1;
        sube(a);
      }
    }
    /* Antes de quedarse, el grano rueda cuesta abajo mientras la columna de
       al lado esté al menos dos granos más baja: así el hilo no levanta una
       torre en la punta y el cono crece por sus laderas. */
    function rueda(i) {
      for (let n = 0; n < 4; n++) {
        const iz = alto[i - 1] - alto[i], de = alto[i + 1] - alto[i];
        if (Math.max(iz, de) < 2 || i < 2 || i > COLS - 3) break;
        i = iz === de ? i + (azar() < .5 ? -1 : 1) : iz > de ? i - 1 : i + 1;
      }
      return i;
    }
    function deposita(p, i) {
      i = rueda(i);
      for (const di of [0, 1, -1, 2, -2]) {
        const c = i + di;
        if (c < 1 || c > COLS - 2 || fondoCol[c] < 0) continue;
        const j = alto[c] <= fondoCol[c] ? alto[c] - 1 : fondoCol[c];
        const a = j * COLS + c;
        if (j >= MITAD && celda[a] === 0) {
          celda[a] = 1; tono[a] = p.tono; jx[a] = (azar() - .5) * .4; jy[a] = (azar() - .5) * .4;
          alto[c] = j; return;
        }
      }
    }
    function hilo() {
      for (let n = cayendo.length - 1; n >= 0; n--) {
        const p = cayendo[n];
        p.vy += GRAVEDAD * PASO; p.x += p.vx * PASO; p.y += p.vy * PASO;
        // las paredes del bulbo devuelven al que rebota hacia un lado
        const r = radio(Math.abs(p.y - CY)) - 1.5;
        if (Math.abs(p.x - CX) > r) { p.x = CX + Math.sign(p.x - CX) * r; p.vx *= -.3; }
        const i = acota(Math.round((p.x - CX) / C) + CI, 1, COLS - 2);
        const suelo = alto[i] <= fondoCol[i] ? gy(alto[i]) - C / 2 : gy(Math.max(MITAD, fondoCol[i])) + C / 2;
        if (p.y < suelo) continue;
        /* Al llegar, algunos granos saltan un poco hacia un lado antes de
           quedarse: es el rebote que se ve en la punta del cono. */
        if (!p.rebote && p.vy > 260 && azar() < REBOTA) {
          p.rebote = true; p.y = suelo - .1;
          p.vy *= -(.06 + .13 * azar());
          p.vx = (azar() - .5) * 2 * (40 + 150 * azar());
          continue;
        }
        deposita(p, i);
        cayendo.splice(n, 1);
      }
    }

    /* ── el ciclo ──────────────────────────────────────────────────── */
    /* Corre la arena hasta GIRA; luego el reloj se da vuelta con la arena
       quieta. Al llegar a 176° termina el ciclo: se da vuelta la rejilla y
       el giro se cuenta desde -4°, que se ve igual porque el reloj es
       simétrico. La arena, ahora arriba, cae al cuello y empieza a correr
       mientras el reloj termina de girar y se posa. */
    let paso = 0, angulo = 0, alza = 0;
    function pose(t) {
      let r = -1, ajuste = 0;
      if (t >= GIRA) r = t - GIRA;
      else if (t < VUELTA - SUELTA) { r = t + SUELTA; ajuste = 180; }
      angulo = r < 0 ? 0 : giro(r) - ajuste;
      alza = r < 0 ? 0 : alzado(r);
    }
    function voltea() {
      [celda, tono, jx, jy].forEach(v => v.reverse());
      for (let a = 0; a < N; a++) { jx[a] = -jx[a]; jy[a] = -jy[a]; }
      cayendo = [];
    }
    function avanza() {
      const t = paso * PASO;
      if (t < GIRA) {
        abreCuello();
        automata(); automata();       // dos pasadas: las laderas corren más que el cuello
        mideMonton();
        hilo();
      }
      if (++paso >= PASOS) { paso = 0; voltea(); }
      pose(paso * PASO);
    }

    /* La arena empieza abajo, como un cono recién caído, y se da vuelta
       sin mostrarlo: así la primera vuelta es igual a todas las demás.
       Cuántos granos: los que llenan el bulbo de arriba hasta el nivel. */
    for (let j = MITAD - 1; j > 0; j--) {
      if (Math.abs(gy(j) - CY) <= o.nivel) granos += hasta[j] - desde[j] + 1;
    }
    const cono = [];
    for (let j = MITAD; j < FILAS - 1; j++) {
      for (let i = desde[j]; i <= hasta[j]; i++) cono.push([j * COLS + i, (FONDO - Math.abs(gy(j) - CY)) + .65 * Math.abs(gx(i) - CX)]);
    }
    cono.sort((p, q) => p[1] - q[1]).slice(0, granos).forEach(c => nuevoGrano(c[0]));
    caudal = granos / o.vacia;
    voltea();
    // y se adelanta hasta que el reloj está posado y el hilo ya corre
    while (paso * PASO < VUELTA - SUELTA + .2) avanza();

    /* ── el dibujo ─────────────────────────────────────────────────── */
    const rgb = nombre => getComputedStyle(caja).getPropertyValue(nombre).split(',').map(Number);
    const oscuro = rgb('--ar-arena-sombra'), claro = rgb('--ar-arena-luz');
    const TONOS = 18, colores = [];
    for (let k = 0; k < TONOS; k++) {
      const u = k / (TONOS - 1);
      colores.push('rgb(' + oscuro.map((c, n) => Math.round(c + (claro[n] - c) * u)).join(',') + ')');
    }
    const TAM = C * 1.12;
    let esc = 1;
    function ajusta() {
      const dpr = Math.min(2, devicePixelRatio || 1);
      lienzo.width = Math.round(caja.clientWidth * dpr);
      lienzo.height = Math.round(caja.clientHeight * dpr);
      esc = caja.clientWidth / 300 * dpr;
    }

    function dibuja() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      ctx.setTransform(esc, 0, 0, esc, 0, 0);
      ctx.save();
      ctx.clip(recorte);
      /* Los granos van en cubetas por tono, cada una en un solo trazado:
         unos pocos fill() en vez de miles. Al de la superficie le da la luz. */
      const cubos = [];
      for (let k = 0; k < TONOS; k++) cubos.push(new Path2D());
      for (let j = 1; j < FILAS - 1; j++) {
        const y = gy(j) - TAM / 2;
        for (let i = desde[j]; i <= hasta[j]; i++) {
          const a = j * COLS + i;
          if (celda[a] !== 1) continue;
          let l = tono[a] * luz[a];
          if (celda[a - COLS] === 0) l = l * 1.1 + .08;
          cubos[acota(Math.round(l * (TONOS - 1)), 0, TONOS - 1)].rect(gx(i) - TAM / 2 + jx[a], y + jy[a], TAM, TAM);
        }
      }
      for (let k = 0; k < TONOS; k++) { ctx.fillStyle = colores[k]; ctx.fill(cubos[k]); }
      /* El hilo: cada grano en vuelo es un trazo corto en la dirección en
         que va, como lo dejaría una cámara; juntos parecen un hilo fino. */
      if (cayendo.length) {
        ctx.lineCap = 'round';
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = colores[TONOS - 3];
        ctx.beginPath();
        cayendo.forEach(p => {
          const v = Math.hypot(p.vx, p.vy) || 1, largo = Math.min(18, v * .009);
          ctx.moveTo(p.x - p.vx / v * largo, p.y - p.vy / v * largo);
          ctx.lineTo(p.x, p.y + .01);
        });
        ctx.stroke();
      }
      ctx.restore();
    }

    function pinta() {
      const k = caja.clientWidth / 300;
      cuerpo.style.transform = 'translateY(' + (-alza * o.alza * k).toFixed(2) + 'px) rotate(' + angulo.toFixed(3) + 'deg)';
      // los brillos se quedan del lado de la luz aunque el reloj gire
      const w = (1 + Math.cos(angulo * Math.PI / 180)) / 2;
      luces[0].style.opacity = w.toFixed(3);
      luces[1].style.opacity = (1 - w).toFixed(3);
      const h = Math.max(0, alza);
      sombra.style.opacity = (1 - .6 * h).toFixed(3);
      sombra.style.transform = 'scale(' + (1 + .2 * h).toFixed(3) + ', ' + (1 + .3 * h).toFixed(3) + ')';
      dibuja();
    }

    ajusta();
    if (window.ResizeObserver) new ResizeObserver(() => { ajusta(); pinta(); }).observe(caja);

    if (reduce) {
      // sin movimiento: el reloj quieto, a media arena
      while (paso * PASO < 2.6) avanza();
      pinta();
      return { caja };
    }
    let previo = null, resto = 0;
    function cuadro(t) {
      if (previo !== null) resto += Math.min(100, t - previo);
      previo = t;
      for (let n = 0; resto >= 1000 / HZ && n < 48; n++) { avanza(); resto -= 1000 / HZ; }
      resto = Math.min(resto, 1000 / HZ);
      pinta();
      requestAnimationFrame(cuadro);
    }
    pinta();
    requestAnimationFrame(cuadro);
    return { caja };
  }

  window.Arena = Arena;
})();
