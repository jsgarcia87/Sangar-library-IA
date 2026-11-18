/* =====================================================================
   Membrete · Moxen adaptado para Sangar Studio OS
   Motor interactivo de facturas con odómetro, resortes FLIP y 3 estilos.
   ===================================================================== */
(function () {
  'use strict';

  /* ── utilidades ───────────────────────────────────────────────────── */
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const quieto = () => mq.matches;
  const lim = (v, a, b) => Math.max(a, Math.min(b, v));
  const SOPORTA_LINEAR = !!(window.CSS && CSS.supports && CSS.supports('animation-timing-function', 'linear(0, 1)'));

  function muelle(k, c) {
    if (!SOPORTA_LINEAR) return 'cubic-bezier(.34, 1.3, .64, 1)';
    const pts = [0];
    let x = 0, v = 0, t = 0;
    while (t < 3) {
      v += (k * (1 - x) - c * v) / 240; x += v / 240; t += 1 / 240;
      pts.push(x);
      if (t > .15 && Math.abs(1 - x) < .002 && Math.abs(v) < .02) break;
    }
    const out = [];
    for (let i = 0; i <= 40; i++) out.push(pts[Math.round(i / 40 * (pts.length - 1))].toFixed(4));
    out[40] = '1';
    return 'linear(' + out.join(', ') + ')';
  }

  const MUELLES = {
    pieza: { k: 190, c: 21 },
    hoja: { k: 120, c: 21.9 },
    pildora: { k: 300, c: 19 },
  };

  const miles = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const cts = v => String(Math.round(Math.abs(v) * 100) % 100).padStart(2, '0');

  const FMT = {
    papel: {
      mon: v => miles(Math.floor(v)) + ',' + cts(v) + ' €',
      tot: v => miles(Math.floor(v)) + ',' + cts(v) + ' €',
      dec: ','
    },
    bloque: {
      mon: v => miles(Math.floor(v)) + ',' + cts(v) + ' €',
      tot: v => miles(Math.floor(v)) + ',' + cts(v) + ' €',
      dec: ','
    },
    terminal: {
      mon: v => Math.floor(v) + '.' + cts(v) + ' EUR',
      tot: v => Math.floor(v) + '.' + cts(v) + ' EUR',
      dec: '.'
    },
  };

  const NOMBRES = { papel: 'Papel', bloque: 'Bloque', terminal: 'Terminal' };
  const ESTILOS = ['papel', 'bloque', 'terminal'];

  /* =====================================================================
     Las cifras que ruedan (odómetro dígito a dígito)
     ===================================================================== */
  function Cifras(el) {
    if (!el) return { pon: () => {} };
    let cols = [], pre = null;
    el.classList.add('mb-cifra');
    el.textContent = '';

    function columna(ch) {
      const c = document.createElement('span'), dig = /\d/.test(ch);
      c.dataset.tipo = dig ? 'd' : 's';
      if (dig) {
        c.className = 'mb-col';
        const t = document.createElement('span');
        t.className = 'mb-tira';
        t.innerHTML = '0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9';
        c.appendChild(t);
      } else {
        c.className = 'mb-sep';
        c.textContent = ch;
      }
      c.setAttribute('aria-hidden', 'true');
      return c;
    }

    function pon(texto, desdeCero, sepDec) {
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', texto);
      const m = /^(\D*)([\s\S]*)$/.exec(texto) || ['', '', texto], resto = Array.from(m[2]);
      if (!pre) {
        pre = document.createElement('span');
        pre.className = 'mb-sig';
        pre.setAttribute('aria-hidden', 'true');
        el.appendChild(pre);
      }
      pre.textContent = m[1].trim();
      pre.hidden = !m[1].trim();

      while (cols.length > resto.length) el.removeChild(cols.shift());
      while (cols.length < resto.length) {
        const c = columna(resto[resto.length - cols.length - 1]);
        el.insertBefore(c, pre.nextSibling);
        cols.unshift(c);
      }
      resto.forEach((ch, i) => {
        if (cols[i].dataset.tipo === (/\d/.test(ch) ? 'd' : 's')) return;
        const c = columna(ch);
        el.replaceChild(c, cols[i]);
        cols[i] = c;
      });

      if (desdeCero && !quieto()) {
        el.classList.add('mb-cero');
        cols.forEach(c => { if (c.dataset.tipo === 'd') c.style.setProperty('--d', 0); });
        void el.offsetWidth;
        el.classList.remove('mb-cero');
      }

      const coma = sepDec ? resto.lastIndexOf(sepDec) : -1;
      resto.forEach((ch, i) => {
        const c = cols[i];
        c.classList.toggle('mb-dec', coma > -1 && i >= coma);
        if (c.dataset.tipo === 'd') {
          c.style.setProperty('--i', resto.length - 1 - i);
          c.style.setProperty('--d', ch);
        } else if (c.textContent !== ch) {
          c.textContent = ch;
        }
      });
    }

    return { pon };
  }

  /* =====================================================================
     El componente Membrete Factura
     ===================================================================== */
  function Membrete(raiz, opc) {
    if (!raiz) return null;
    opc = Object.assign({
      estilo: localStorage.getItem('sg-factura-estilo') || 'papel',
      modo: 'crear', // 'crear' | 'editar' | 'ver'
      alCambiar: null,
      alDescargar: null
    }, opc || {});

    const q = s => raiz.querySelector(s);
    const qa = s => Array.from(raiz.querySelectorAll(s));

    const hoja = q('[data-hoja]'), doc = q('[data-doc]'), voz = q('[data-voz]');
    const sel = q('[data-sel]'), pildora = q('[data-pildora]'), ops = qa('[data-op]');
    const boton = q('[data-boton]'), btxt = q('[data-btxt]'), sello = q('[data-sello]');
    const contFilas = q('[data-p="filas"]');

    let estilo = ESTILOS.indexOf(opc.estilo) > -1 ? opc.estilo : 'papel';
    let lineas = [];

    // Módulos de Odómetro para Totales
    const cSub = Cifras(q('[data-sub]'));
    const cImp = Cifras(q('[data-imp]'));
    const cIrpf = Cifras(q('[data-irpf]'));
    const cTot = Cifras(q('[data-total]'));

    // Curvas dinámicas
    const curvaPieza = muelle(MUELLES.pieza.k, MUELLES.pieza.c);
    raiz.style.setProperty('--mb-hoja-c', muelle(MUELLES.hoja.k, MUELLES.hoja.c));
    raiz.style.setProperty('--mb-pil', muelle(MUELLES.pildora.k, MUELLES.pildora.c));

    /* ── Registrar una fila del detalle ──────────────────────────────── */
    function vincularFila(el) {
      const inputCant = el.querySelector('[data-input-cant]') || el.querySelector('input[name*="[cantidad]"]');
      const inputPre  = el.querySelector('[data-input-pre]')  || el.querySelector('input[name*="[precio_unitario]"]');
      const inputImp  = el.querySelector('[data-input-imp]');
      const inputIva  = el.querySelector('input[name*="[tipo_iva]"]');
      const inputIrpf = el.querySelector('input[name*="[tipo_irpf]"]');
      const btnMenos  = el.querySelector('[data-menos]');
      const btnMas    = el.querySelector('[data-mas]');
      const btnDel    = el.querySelector('[data-del]');
      const elN       = el.querySelector('[data-n]');
      const elImp     = el.querySelector('[data-importe]');
      const elPre     = el.querySelector('[data-precio]');

      const cN   = elN ? Cifras(elN) : null;
      const cImp = elImp ? Cifras(elImp) : null;

      const obj = {
        el,
        inputCant,
        inputPre,
        inputImp,
        inputIva,
        inputIrpf,
        btnMenos,
        btnMas,
        btnDel,
        elPre,
        cN,
        cImp,
        getCant: () => parseFloat(inputCant ? inputCant.value : (el.dataset.cant || '1')) || 0,
        getPrecio: () => parseFloat(inputPre ? inputPre.value : (el.dataset.precio || '0')) || 0,
        getIva: () => parseFloat(inputIva ? inputIva.value : '21') || 0,
        getIrpf: () => parseFloat(inputIrpf ? inputIrpf.value : '0') || 0,
        setCant: (n) => {
          n = Math.max(0.01, Math.round(n * 100) / 100);
          if (inputCant) inputCant.value = n;
          el.dataset.cant = n;
          if (inputImp && inputPre) {
            const pre = parseFloat(inputPre.value) || 0;
            inputImp.value = (Math.round(n * pre * 100) / 100).toFixed(2);
          }
          actualizar();
        }
      };

      if (btnMenos) {
        btnMenos.onclick = (e) => {
          e.preventDefault();
          obj.setCant(Math.max(1, Math.floor(obj.getCant()) - 1));
        };
      }
      if (btnMas) {
        btnMas.onclick = (e) => {
          e.preventDefault();
          obj.setCant(Math.floor(obj.getCant()) + 1);
        };
      }
      if (btnDel) {
        btnDel.onclick = (e) => {
          e.preventDefault();
          if (lineas.length <= 1) {
            // dejar fila en blanco en vez de borrar todo
            if (inputPre) inputPre.value = 0;
            if (inputImp) inputImp.value = '0.00';
            const inputCon = el.querySelector('input[name*="[concepto]"]');
            if (inputCon) inputCon.value = '';
            obj.setCant(1);
            return;
          }
          el.remove();
          lineas = lineas.filter(l => l !== obj);
          actualizar();
          ajustaHoja(false);
        };
      }
      if (inputPre) {
        inputPre.addEventListener('input', () => {
          if (inputImp) {
            const cant = obj.getCant();
            const pre = parseFloat(inputPre.value) || 0;
            inputImp.value = (Math.round(cant * pre * 100) / 100).toFixed(2);
          }
          actualizar();
        });
      }
      if (inputImp) {
        inputImp.addEventListener('input', () => {
          const cant = obj.getCant() || 1;
          const imp = parseFloat(inputImp.value) || 0;
          const pre = Math.round((imp / cant) * 100) / 100;
          if (inputPre) {
            inputPre.value = pre;
          }
          actualizar();
        });
      }
      if (inputCant) {
        inputCant.addEventListener('input', () => {
          el.dataset.cant = inputCant.value;
          if (inputImp && inputPre) {
            const cant = parseFloat(inputCant.value) || 0;
            const pre = parseFloat(inputPre.value) || 0;
            inputImp.value = (Math.round(cant * pre * 100) / 100).toFixed(2);
          }
          actualizar();
        });
      }

      lineas.push(obj);
      return obj;
    }

    // Inicializar filas existentes
    qa('.mb-fila').forEach(vincularFila);

    /* ── Calcular totales y pintar cifras ────────────────────────────── */
    function totales() {
      let sub = 0;
      let totalIva = 0;
      let totalIrpf = 0;

      lineas.forEach(l => {
        const importe = l.getCant() * l.getPrecio();
        sub += importe;
        totalIva += importe * (l.getIva() / 100);
        totalIrpf += importe * (l.getIrpf() / 100);
      });

      const total = Math.max(0, sub + totalIva - totalIrpf);
      return { sub, totalIva, totalIrpf, total };
    }

    function pintar(desdeCero) {
      const f = FMT[estilo];
      const t = totales();

      lineas.forEach(l => {
        const cant = l.getCant();
        const pre = l.getPrecio();
        const imp = cant * pre;

        if (l.cN) l.cN.pon(String(cant % 1 === 0 ? cant : cant.toFixed(2)), desdeCero);
        if (l.elPre) l.elPre.textContent = f.mon(pre);
        if (l.cImp) l.cImp.pon(f.mon(imp), desdeCero, f.dec);
        if (l.inputImp && document.activeElement !== l.inputImp) {
          l.inputImp.value = (Math.round(imp * 100) / 100).toFixed(2);
        }
        if (l.btnMenos) l.btnMenos.disabled = cant <= 1;
      });

      if (cSub) cSub.pon(f.mon(t.sub), desdeCero, f.dec);
      if (cImp) cImp.pon(f.mon(t.totalIva), desdeCero, f.dec);
      if (cIrpf) {
        cIrpf.pon('-' + f.mon(t.totalIrpf), desdeCero, f.dec);
        const elIrpfRow = q('[data-p="irpf"]');
        if (elIrpfRow) elIrpfRow.style.display = t.totalIrpf > 0 ? '' : 'none';
      }
      if (cTot) cTot.pon(f.tot(t.total), desdeCero, f.dec);
    }

    function actualizar() {
      pintar(false);
    }

    /* ── Selector de estilo (Píldora deslizante) ───────────────────────── */
    function mideSel() {
      if (!sel || !pildora) return;
      const a = ops.find(o => o.dataset.op === estilo);
      if (!a || !a.offsetWidth) return;
      pildora.style.setProperty('--x', (a.offsetLeft - 5) + 'px');
      pildora.style.setProperty('--w', a.offsetWidth + 'px');
    }

    function marcaSel() {
      if (!ops.length) return;
      ops.forEach(o => {
        const on = o.dataset.op === estilo;
        o.setAttribute('aria-checked', on ? 'true' : 'false');
        o.tabIndex = on ? 0 : -1;
      });
      mideSel();
    }

    /* ── La Hoja (transformación continua) ────────────────────────────── */
    let rectHoja = '';
    function ajustaHoja(sinTransicion) {
      if (!hoja || !doc) return;
      const e = raiz.getBoundingClientRect();
      const r = estilo === 'bloque' ? e : doc.getBoundingClientRect();
      const v = [r.left - e.left, r.top - e.top, r.width, r.height].map(n => n.toFixed(1));
      const clave = v.join(',') + estilo;
      if (clave === rectHoja) return;
      rectHoja = clave;

      if (sinTransicion) hoja.classList.add('sin-trans');
      hoja.style.left = v[0] + 'px';
      hoja.style.top = v[1] + 'px';
      hoja.style.width = v[2] + 'px';
      hoja.style.height = v[3] + 'px';
      if (sinTransicion) {
        void hoja.offsetWidth;
        hoja.classList.remove('sin-trans');
      }
    }

    /* ── Cambio de estilo con vuelo FLIP de resortes ─────────────────── */
    function vuela(nuevo, instante) {
      const anima = !instante && !quieto();
      const piezas = qa('[data-p]');
      const antes = new Map();

      if (anima) {
        piezas.forEach(p => antes.set(p, p.getBoundingClientRect()));
      }
      piezas.forEach(p => p.getAnimations().forEach(a => { if (a.__vuelo) a.cancel(); }));

      estilo = nuevo;
      raiz.dataset.estilo = nuevo;
      localStorage.setItem('sg-factura-estilo', nuevo);

      marcaSel();
      ajustaHoja(!anima);
      pintar(anima);
      ponTexto(etiquetaActual(), false);

      if (!anima) return;

      const medida = piezas.map(p => p.getBoundingClientRect());
      piezas.forEach((p, i) => {
        const r0 = antes.get(p), r1 = medida[i];
        if (!r0 || !r1) return;
        const dx = r0.left - r1.left, dy = r0.top - r1.top, id = p.dataset.p;
        const delay = i * 16;
        let a, b;

        if (id === 'td') {
          const sx = r0.width / Math.max(1, r1.width), sy = r0.height / Math.max(1, r1.height);
          a = p.animate(
            [{ transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`, transformOrigin: '0 0' },
             { transform: 'none', transformOrigin: '0 0' }],
            { duration: 880, delay, easing: curvaPieza, fill: 'backwards' }
          );
        } else if (id === 'boton') {
          a = p.animate(
            [{ transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`, width: r0.width.toFixed(1) + 'px', height: r0.height.toFixed(1) + 'px' },
             { transform: 'none', width: r1.width.toFixed(1) + 'px', height: r1.height.toFixed(1) + 'px' }],
            { duration: 880, delay, easing: curvaPieza, fill: 'backwards' }
          );
        } else {
          a = p.animate(
            [{ transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)` },
             { transform: 'none' }],
            { duration: 880, delay, easing: curvaPieza, fill: 'backwards' }
          );
        }

        b = p.animate(
          [{ opacity: 0, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0px)' }],
          { duration: 300, delay, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' }
        );
        a.__vuelo = b.__vuelo = true;
      });

      if (sello && sello.classList.contains('is-cae')) {
        sello.classList.remove('is-cae');
      }
    }

    function elige(nuevo, foco) {
      if (nuevo === estilo || ESTILOS.indexOf(nuevo) < 0) return;
      vuela(nuevo, false);
      if (foco) {
        const o = ops.find(op => op.dataset.op === nuevo);
        if (o) o.focus();
      }
      anuncia('Estilo ' + NOMBRES[nuevo]);
      if (opc.alCambiar) opc.alCambiar({ estilo: nuevo });
    }

    /* ── Botón de Acción / Guardar / Descargar ───────────────────────── */
    let fase = 'reposo';
    let temporizador = 0;

    const ETIQUETAS = {
      papel: {
        reposo: opc.modo === 'ver' ? 'Descargar PDF' : (opc.modo === 'editar' ? 'Guardar cambios' : 'Crear factura'),
        gen: p => 'Procesando ' + p + ' %',
        ok: opc.modo === 'ver' ? '¡PDF listo!' : '¡Factura lista!'
      },
      bloque: {
        reposo: opc.modo === 'ver' ? 'Descargar PDF' : (opc.modo === 'editar' ? 'Guardar cambios' : 'Crear factura'),
        gen: p => 'Procesando ' + p + ' %',
        ok: opc.modo === 'ver' ? '¡Listo!' : '¡Guardada!'
      },
      terminal: {
        reposo: opc.modo === 'ver' ? 'descargar --pdf' : (opc.modo === 'editar' ? 'factura --guardar' : 'factura --crear'),
        gen: p => 'compilando ' + p + '%',
        ok: opc.modo === 'ver' ? 'factura.pdf · ok' : 'commit --ok'
      }
    };

    const etiquetaActual = () => {
      const e = ETIQUETAS[estilo];
      if (fase === 'listo') return e.ok;
      if (fase === 'generando') return e.gen(Math.round((+boton.style.getPropertyValue('--p') || 0) * 100));
      return e.reposo;
    };

    function ponTexto(txt, anima) {
      if (!btxt) return;
      const actual = btxt.querySelector('span:last-child');
      if (actual && actual.textContent === txt) return;
      if (!anima || quieto()) {
        btxt.textContent = '';
        const s = document.createElement('span');
        s.textContent = txt;
        btxt.appendChild(s);
        return;
      }
      const w0 = boton.getBoundingClientRect().width;
      btxt.style.flexDirection = 'column';
      const viejos = Array.from(btxt.children);
      const s = document.createElement('span');
      s.textContent = txt;
      btxt.appendChild(s);
      const h = btxt.clientHeight || 20;

      viejos.forEach(v => { v.style.display = 'none'; });
      const w1 = boton.getBoundingClientRect().width;
      viejos.forEach(v => { v.style.display = ''; });

      if (Math.abs(w1 - w0) > 1 && w1 < (boton.parentNode ? boton.parentNode.clientWidth : 900)) {
        boton.animate([{ width: w0 + 'px' }, { width: w1 + 'px' }], { duration: 500, easing: curvaPieza });
      }

      const mover = (el, de, a) => el.animate(
        [{ transform: `translateY(${de}px)` }, { transform: `translateY(${a}px)` }],
        { duration: 400, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' }
      );
      viejos.forEach(v => mover(v, 0, -h));
      const an = mover(s, 0, -h);
      an.onfinish = () => {
        viejos.forEach(v => v.remove());
        an.cancel();
        btxt.style.flexDirection = '';
      };
    }

    function ponFase(f) {
      fase = f;
      if (boton) {
        boton.dataset.estado = f;
        boton.setAttribute('aria-busy', f === 'generando' ? 'true' : 'false');
      }
    }

    const RUTA = [[0, 0], [.22, .38], [.5, .56], [.78, .84], [1, 1]];
    function ruta(u) {
      for (let i = 1; i < RUTA.length; i++) {
        if (u <= RUTA[i][0]) {
          const a = RUTA[i - 1], b = RUTA[i], k = (u - a[0]) / (b[0] - a[0]);
          return a[1] + (b[1] - a[1]) * (k * k * (3 - 2 * k) * .35 + k * .65);
        }
      }
      return 1;
    }

    function animarAccion(cb) {
      if (fase !== 'reposo') return;
      clearTimeout(temporizador);
      if (boton) boton.style.setProperty('--p', 0);
      ponFase('generando');
      ponTexto(ETIQUETAS[estilo].gen(0), true);

      const DUR = quieto() ? 300 : 900;
      let t0 = null;
      const paso = ahora => {
        if (fase !== 'generando') return;
        if (t0 === null) t0 = ahora;
        const u = lim((ahora - t0) / DUR, 0, 1), p = ruta(u);
        if (boton) boton.style.setProperty('--p', p.toFixed(3));
        const tx = ETIQUETAS[estilo].gen(Math.round(p * 100));
        const s = btxt ? btxt.querySelector('span:last-child') : null;
        if (s && !btxt.querySelector('span + span') && s.textContent !== tx) s.textContent = tx;

        if (u < 1) {
          requestAnimationFrame(paso);
        } else {
          ponFase('listo');
          ponTexto(ETIQUETAS[estilo].ok, true);
          if (sello) {
            sello.classList.remove('is-cae');
            void sello.offsetWidth;
            sello.classList.add('is-cae');
          }
          temporizador = setTimeout(() => {
            if (cb) cb();
            temporizador = setTimeout(() => {
              ponFase('reposo');
              ponTexto(ETIQUETAS[estilo].reposo, true);
              if (boton) boton.style.setProperty('--p', 0);
            }, 1200);
          }, 450);
        }
      };
      requestAnimationFrame(paso);
    }

    if (boton) {
      boton.addEventListener('click', (e) => {
        const form = boton.closest('form');
        if (form && opc.modo !== 'ver') {
          e.preventDefault();
          // Validar campos requeridos antes de animar
          if (!form.checkValidity()) {
            form.reportValidity();
            return;
          }
          animarAccion(() => {
            form.submit();
          });
        } else if (opc.alDescargar) {
          e.preventDefault();
          animarAccion(() => {
            opc.alDescargar();
          });
        }
      });
    }

    /* ── Añadir fila al detalle ───────────────────────────────────────── */
    let lineaIdCounter = qa('.mb-fila').length;
    function addLinea(concepto = '', cant = 1, precio = 0, iva = 21, irpf = 0) {
      if (!contFilas) return;
      const idx = lineaIdCounter++;
      const row = document.createElement('div');
      row.className = 'mb-fila';
      row.role = 'group';
      row.setAttribute('aria-label', concepto || 'Nuevo concepto');

      const impVal = (cant * precio).toFixed(2);
      row.innerHTML = `
        <span class="mb-con">
          <button type="button" class="mb-btn-del" data-del title="Eliminar línea">✕</button>
          <input class="mb-input-inline" name="lineas[${idx}][concepto]" value="${concepto.replace(/"/g, '&quot;')}" placeholder="Descripción del servicio..." required>
        </span>
        <span class="mb-cant">
          <button class="mb-paso" type="button" data-menos aria-label="Quitar una unidad"><svg viewBox="0 0 12 12"><path d="M2.5 6h7"/></svg></button>
          <b class="mb-n" data-n></b>
          <input type="hidden" name="lineas[${idx}][cantidad]" data-input-cant value="${cant}">
          <button class="mb-paso" type="button" data-mas aria-label="Añadir una unidad"><svg viewBox="0 0 12 12"><path d="M2.5 6h7M6 2.5v7"/></svg></button>
        </span>
        <span class="mb-pre">
          <input class="mb-input-inline mb-input-pre" type="number" step="0.01" name="lineas[${idx}][precio_unitario]" data-input-pre value="${precio}" placeholder="0.00">
        </span>
        <span class="mb-imp">
          <input class="mb-input-inline mb-input-imp" type="number" step="0.01" data-input-imp value="${impVal}" placeholder="0.00">
        </span>
        <input type="hidden" name="lineas[${idx}][tipo_iva]" value="${iva}">
        <input type="hidden" name="lineas[${idx}][tipo_irpf]" value="${irpf}">
      `;

      contFilas.appendChild(row);
      vincularFila(row);
      actualizar();
      ajustaHoja(false);

      const inputCon = row.querySelector('input[name*="[concepto]"]');
      if (inputCon && !concepto) inputCon.focus();
    }

    /* ── Sincronizar Cliente ──────────────────────────────────────────── */
    const clienteSel = document.getElementById('mb-cliente-sel') || document.querySelector('select[name="cliente_id"]');
    if (clienteSel) {
      clienteSel.addEventListener('change', () => {
        const opt = clienteSel.options[clienteSel.selectedIndex];
        const razon = opt ? (opt.dataset.razon || opt.text) : 'Cliente';
        const nif = opt ? (opt.dataset.nif || '') : '';
        const email = opt ? (opt.dataset.email || '') : '';

        const elRazon = q('[data-cliente-nombre]');
        const elNif = q('[data-cliente-nif]');
        const elEmail = q('[data-cliente-email]');

        if (elRazon) elRazon.textContent = opt && opt.value ? razon : 'Selecciona un cliente...';
        if (elNif) elNif.textContent = nif ? 'NIF ' + nif : '';
        if (elEmail) elEmail.textContent = email;
      });
    }

    /* ── Selector de Estilo: Teclado y Click ─────────────────────────── */
    ops.forEach(o => o.addEventListener('click', () => elige(o.dataset.op, false)));
    if (sel) {
      sel.addEventListener('keydown', e => {
        const i = ESTILOS.indexOf(estilo);
        let j = i;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % ESTILOS.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i + ESTILOS.length - 1) % ESTILOS.length;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = ESTILOS.length - 1;
        else return;
        e.preventDefault();
        elige(ESTILOS[j], true);
      });
    }

    function anuncia(t) {
      if (!voz) return;
      voz.textContent = '';
      setTimeout(() => { voz.textContent = t; }, 30);
    }

    // Observadores de tamaño
    if (window.ResizeObserver) {
      new ResizeObserver(() => { ajustaHoja(true); mideSel(); }).observe(doc);
      new ResizeObserver(() => { ajustaHoja(true); }).observe(raiz);
    }

    /* ── Arranque inicial ─────────────────────────────────────────────── */
    raiz.dataset.estilo = estilo;
    marcaSel();
    ponTexto(etiquetaActual(), false);

    function empieza() {
      rectHoja = '';
      ajustaHoja(true);
      mideSel();
      pintar(true);
      raiz.classList.add('is-lista');
      if (!quieto()) {
        const piezas = qa('[data-p]');
        piezas.forEach((p, i) => {
          const a = p.animate(
            [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
            { duration: 640, delay: 60 + i * 32, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' }
          );
          a.__vuelo = true;
        });
      }
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(empieza);
    } else {
      empieza();
    }
    ajustaHoja(true);
    raiz.classList.add('is-lista');

    return {
      estilo: nuevo => { if (nuevo) elige(nuevo, false); return estilo; },
      addLinea,
      actualizar,
      descargar: animarAccion
    };
  }

  window.Membrete = Membrete;
})();
