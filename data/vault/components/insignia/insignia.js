/* =====================================================================
   Insignia · Moxen
   La insignia de contador que salta cuando sube la cifra: se aplasta
   para coger impulso, se estira al subir, cae y se asienta, mientras la
   cifra vieja sale por arriba y la nueva entra desde abajo. Un aro se
   abre detrás. Al pasar de 9 a 10 se ensancha con suavidad; por encima
   del máximo muestra «99+». Sin dependencias.

     const ins = Insignia(boton, { valor: 3, maximo: 99 });
     ins.suma(1);     ins.pon(0);     // a cero se esconde
   ===================================================================== */
(function () {
  'use strict';

  const CURVA = 'cubic-bezier(.22, 1, .36, 1)';

  /* El salto, como en los dibujos animados: antes de despegar se aplasta,
     en el aire se estira, al caer se aplasta otra vez y rebota un poco.
     Todo con el origen en la base, para que el «suelo» no se mueva. */
  const SALTO = [
    { transform: 'none' },
    { transform: 'scale(1.2, .78)', offset: .14 },
    { transform: 'translateY(-15px) scale(.86, 1.18)', offset: .36 },
    { transform: 'translateY(-21px) scale(1, 1)', offset: .52 },
    { transform: 'translateY(0) scale(1.16, .84)', offset: .74 },
    { transform: 'scale(.96, 1.05)', offset: .88 },
    { transform: 'none' },
  ];

  function Insignia(el, opciones) {
    const o = Object.assign({ valor: 0, maximo: 99 }, opciones);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ins = document.createElement('span');
    ins.className = 'in-insignia';
    ins.setAttribute('aria-hidden', 'true');
    ins.innerHTML = '<i class="in-onda"></i><span class="in-cuerpo"></span>';
    const cuerpo = ins.querySelector('.in-cuerpo'), onda = ins.querySelector('.in-onda');
    el.appendChild(ins);
    const nombre = el.getAttribute('aria-label') || '';

    let n = 0, cifra = null, salto = null;
    const texto = v => v > o.maximo ? o.maximo + '+' : String(v);

    // el ancho se fija a mano para que la transición de CSS lo anime
    function ajusta() {
      const medida = cifra ? cifra.offsetWidth : 0;
      cuerpo.style.width = Math.max(cuerpo.parentNode.offsetHeight, medida + 28) + 'px';
    }

    function pon(v, sinEfecto) {
      v = Math.max(0, Math.round(v));
      const antes = n;
      n = v;
      el.setAttribute('aria-label', n ? nombre + ': ' + texto(n) : nombre);
      if (texto(antes) === texto(n) && antes && n) return;   // 99+ → 99+: nada que contar

      if (!n) {
        // a cero: se encoge y desaparece
        if (salto) salto.cancel();
        salto = reduce || sinEfecto ? null : ins.animate([{ transform: 'none' }, { transform: 'scale(1.15)', offset: .3 }, { transform: 'scale(0)' }],
          { duration: 360, easing: 'ease-in', fill: 'forwards' });
        if (!salto) ins.style.transform = 'scale(0)';
        return;
      }
      ins.style.transform = '';
      const nueva = document.createElement('span');
      nueva.textContent = texto(n);
      cuerpo.appendChild(nueva);
      const vieja = cifra;
      cifra = nueva;
      ajusta();
      if (reduce || sinEfecto) { if (vieja) vieja.remove(); return; }

      const sube = n > antes;
      if (vieja) {
        // la vieja se va hacia donde va la cuenta; la nueva llega del otro lado
        vieja.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(' + (sube ? -110 : 110) + '%)', opacity: 0 }],
          { duration: 380, easing: CURVA, fill: 'forwards' });
        nueva.animate([{ transform: 'translateY(' + (sube ? 110 : -110) + '%)' }, { transform: 'none' }], { duration: 420, easing: CURVA });
        setTimeout(() => vieja.remove(), 400);
      }
      if (salto) salto.cancel();
      salto = !antes
        ? ins.animate([{ transform: 'scale(0)' }, { transform: 'translateY(-14px) scale(1.12)', offset: .5 }, { transform: 'scale(.94, 1.06)', offset: .78 }, { transform: 'none' }],
          { duration: 560, easing: CURVA })
        : ins.animate(sube ? SALTO : [{ transform: 'none' }, { transform: 'scale(.86)', offset: .4 }, { transform: 'none' }],
          { duration: sube ? 640 : 380, easing: 'ease-out' });
      if (sube) onda.animate([{ opacity: .55, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.9)' }],
        { duration: 620, delay: antes ? 380 : 120, easing: CURVA, fill: 'backwards' });
    }

    if (o.valor) pon(o.valor, true); else ins.style.transform = 'scale(0)';
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(ajusta);
    return { pon, suma: k => pon(n + (k == null ? 1 : k)), valor: () => n };
  }

  window.Insignia = Insignia;
})();
