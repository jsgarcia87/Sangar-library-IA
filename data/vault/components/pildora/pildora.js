/* =====================================================================
   Píldora · Moxen
   Una barra de navegación que, al bajar, se despega del borde y se
   encoge en una píldora de cristal flotante; al volver arriba, se
   estira otra vez hasta ocupar todo el ancho.

     Pildora(document.querySelector('.pi-nav'));                       // con el scroll de la página
     Pildora(nav, { contenedor: document.querySelector('.pi-pantalla') });  // con el de una caja

   Usa dos umbrales distintos para encoger y para estirar: sin ese
   margen, quedarse justo en el límite la haría parpadear.
   ===================================================================== */
(function () {
  'use strict';

  function Pildora(nav, opciones) {
    const o = Object.assign({
      contenedor: null,   // la caja con scroll; si no, la ventana
      encoge: 48,         // px bajados para pasar a píldora
      estira: 16,         // px por debajo de los cuales vuelve a ser barra
    }, opciones);
    const caja = o.contenedor;
    const altura = () => caja ? caja.scrollTop : scrollY;

    let pildora = false, pendiente = false;
    function revisa() {
      pendiente = false;
      const y = altura();
      const toca = pildora ? y > o.estira : y > o.encoge;
      if (toca === pildora) return;
      pildora = toca;
      nav.classList.toggle('is-pildora', pildora);
    }
    // un vistazo por fotograma como mucho, aunque lleguen muchos eventos
    (caja || window).addEventListener('scroll', () => {
      if (!pendiente) { pendiente = true; requestAnimationFrame(revisa); }
    }, { passive: true });
    revisa();
    return { revisa, pildora: () => pildora };
  }

  window.Pildora = Pildora;
})();
