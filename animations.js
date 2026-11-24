/* ==========================================================================
   VETNOVA — CLÍNICA VETERINARIA
   animations.js: Splash, navegación entre secciones, eventos UI y arranque
   ========================================================================== */

const VetnovaAnimations = (() => {
  function actualizarFechaTopbar() {
    const el = document.getElementById('current-date-display');
    if (!el) return;
    const hoy = new Date();
    el.textContent = hoy.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function cerrarSidebarMovil() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('active');
  }

  function mostrarSeccion(sectionId) {
    const secciones = document.querySelectorAll('.spa-section');
    const navItems = document.querySelectorAll('.nav-item[data-section], .brand-link[data-section]');

    let seccionEncontrada = null;

    secciones.forEach((sec) => {
      const esActiva = sec.id === sectionId;
      sec.style.display = '';
      sec.classList.toggle('active', esActiva);
      if (esActiva) {
        seccionEncontrada = sec;
      }
    });

    navItems.forEach((item) => {
      const target = item.getAttribute('data-section');
      const activa = target === sectionId;
      if (item.classList.contains('nav-item')) {
        item.classList.toggle('active', activa);
      }
      if (activa) {
        item.setAttribute('aria-current', 'page');
      } else {
        item.removeAttribute('aria-current');
      }
    });

    if (seccionEncontrada) {
      const titleEl = document.getElementById('topbar-title');
      const subtitleEl = document.getElementById('topbar-subtitle');
      const nuevoTitulo = seccionEncontrada.getAttribute('data-title');
      const nuevoSubtitulo = seccionEncontrada.getAttribute('data-subtitle');
      if (titleEl && nuevoTitulo) titleEl.textContent = nuevoTitulo;
      if (subtitleEl && nuevoSubtitulo) subtitleEl.textContent = nuevoSubtitulo;
    }

    cerrarSidebarMovil();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function configurarSplash() {
    const splash = document.getElementById('splash-screen');
    const appShell = document.getElementById('app-shell');

    if (!splash) return;

    let yaEntro = false;

    function entrar() {
      if (yaEntro) return;
      yaEntro = true;
      splash.classList.add('is-hidden');
      splash.setAttribute('aria-hidden', 'true');
      if (appShell) {
        appShell.setAttribute('aria-hidden', 'false');
      }
      if (typeof VetnovaSections !== 'undefined' && VetnovaSections.renderTodo) {
        VetnovaSections.renderTodo();
      }
    }

    splash.addEventListener('click', entrar);
    setTimeout(entrar, 2200);
  }

  function configurarMenuLateral() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const btnAbrir = document.getElementById('btn-open-sidebar');
    const btnCerrar = document.getElementById('btn-close-sidebar');
    const btnLimpiar = document.getElementById('btn-limpiar-storage');

    if (btnAbrir && sidebar) {
      btnAbrir.addEventListener('click', () => {
        sidebar.classList.add('is-open');
        if (backdrop) backdrop.classList.add('active');
      });
    }

    if (btnCerrar) {
      btnCerrar.addEventListener('click', cerrarSidebarMovil);
    }

    if (backdrop) {
      backdrop.addEventListener('click', cerrarSidebarMovil);
    }

    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', () => {
        localStorage.clear();
        inicializarStorageSeguro();
        if (typeof VetnovaSections !== 'undefined' && VetnovaSections.renderTodo) {
          VetnovaSections.renderTodo();
        }
      });
    }
  }

  function configurarDelegacionEventos() {
    document.addEventListener('click', (e) => {
      const target = e.target;

      const secTrigger = target.closest('[data-section]');
      if (secTrigger) {
        const secId = secTrigger.getAttribute('data-section');
        if (secId) {
          e.preventDefault();
          mostrarSeccion(secId);
          try {
            if (typeof VetnovaSections !== 'undefined' && VetnovaSections.renderTodo) {
              VetnovaSections.renderTodo();
            }
          } catch (err) {
            console.error('Error al renderizar seccion:', err);
          }
          return;
        }
      }

      const jumpBtn = target.closest('[data-jump-section]');
      if (jumpBtn) {
        const secId = jumpBtn.getAttribute('data-jump-section');
        if (secId) {
          mostrarSeccion(secId);
          try {
            if (typeof VetnovaSections !== 'undefined' && VetnovaSections.renderTodo) {
              VetnovaSections.renderTodo();
            }
          } catch (err) {
            console.error('Error al renderizar seccion:', err);
          }
          return;
        }
      }

      const descAlertaBtn = target.closest('[data-descartar-alerta]');
      if (descAlertaBtn) {
        const alertaId = descAlertaBtn.getAttribute('data-descartar-alerta');
        VetnovaFunctions.descartarAlerta(alertaId);
        VetnovaSections.renderDashboard();
        return;
      }

      const fCliTipo = target.closest('[data-filtro-cliente-tipo]');
      if (fCliTipo) {
        VetnovaSections.filtros.clienteTipo = fCliTipo.getAttribute('data-filtro-cliente-tipo');
        VetnovaSections.renderClientes();
        return;
      }

      const editTutorBtn = target.closest('[data-edit-tutor]');
      if (editTutorBtn) {
        const id = editTutorBtn.getAttribute('data-edit-tutor');
        const tutor = VetnovaStorage.leer(VetnovaStorage.keys.TUTORES).find((x) => x.id === id);
        if (tutor) VetnovaFunctionModales.abrirModal('modal-tutor', { tutor });
        return;
      }

      const delTutorBtn = target.closest('[data-delete-tutor]');
      if (delTutorBtn) {
        const id = delTutorBtn.getAttribute('data-delete-tutor');
        VetnovaFunctions.eliminarTutor(id);
        VetnovaSections.renderClientes();
        VetnovaSections.renderDashboard();
        return;
      }

      const nuevaMasTutorBtn = target.closest('[data-nueva-mascota-tutor]');
      if (nuevaMasTutorBtn) {
        const tutorId = nuevaMasTutorBtn.getAttribute('data-nueva-mascota-tutor');
        VetnovaFunctionModales.abrirModal('modal-mascota', { tutorId });
        return;
      }

      const editMasBtn = target.closest('[data-edit-mascota]');
      if (editMasBtn) {
        const id = editMasBtn.getAttribute('data-edit-mascota');
        const mascota = VetnovaStorage.leer(VetnovaStorage.keys.MASCOTAS).find((x) => x.id === id);
        if (mascota) VetnovaFunctionModales.abrirModal('modal-mascota', { mascota });
        return;
      }

      const delMasBtn = target.closest('[data-delete-mascota]');
      if (delMasBtn) {
        const id = delMasBtn.getAttribute('data-delete-mascota');
        VetnovaFunctions.eliminarMascota(id);
        VetnovaSections.renderClientes();
        VetnovaSections.renderDashboard();
        return;
      }

      const fCatBtn = target.closest('[data-filtro-catalogo-cat]');
      if (fCatBtn) {
        VetnovaSections.filtros.catalogoCategoria = fCatBtn.getAttribute('data-filtro-catalogo-cat');
        VetnovaSections.renderCatalogo();
        return;
      }

      const editItemBtn = target.closest('[data-edit-item]');
      if (editItemBtn) {
        const id = editItemBtn.getAttribute('data-edit-item');
        const item = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO).find((x) => x.id === id);
        if (item) VetnovaFunctionModales.abrirModal('modal-item-catalogo', { item });
        return;
      }

      const delItemBtn = target.closest('[data-delete-item]');
      if (delItemBtn) {
        const id = delItemBtn.getAttribute('data-delete-item');
        VetnovaFunctions.eliminarItemCatalogo(id);
        VetnovaSections.renderCatalogo();
        VetnovaSections.renderDashboard();
        return;
      }

      const editComboBtn = target.closest('[data-edit-combo]');
      if (editComboBtn) {
        const id = editComboBtn.getAttribute('data-edit-combo');
        const combo = VetnovaStorage.leer(VetnovaStorage.keys.COMBOS).find((x) => x.id === id);
        if (combo) VetnovaFunctionModales.abrirModal('modal-combo', { combo });
        return;
      }

      const delComboBtn = target.closest('[data-delete-combo]');
      if (delComboBtn) {
        const id = delComboBtn.getAttribute('data-delete-combo');
        VetnovaFunctions.eliminarCombo(id);
        VetnovaSections.renderCatalogo();
        return;
      }

      const boxEstadoBtn = target.closest('[data-box-estado]');
      if (boxEstadoBtn) {
        const boxId = boxEstadoBtn.getAttribute('data-box-estado');
        const estado = boxEstadoBtn.getAttribute('data-estado');
        VetnovaFunctions.cambiarEstadoBox(boxId, estado, '');
        VetnovaSections.renderTurnos();
        VetnovaSections.renderDashboard();
        return;
      }

      const delBoxBtn = target.closest('[data-delete-box]');
      if (delBoxBtn) {
        const id = delBoxBtn.getAttribute('data-delete-box');
        VetnovaFunctions.eliminarBox(id);
        VetnovaSections.renderTurnos();
        VetnovaSections.renderDashboard();
        return;
      }

      const fTurnoBtn = target.closest('[data-filtro-turno-tipo]');
      if (fTurnoBtn) {
        VetnovaSections.filtros.turnoTipo = fTurnoBtn.getAttribute('data-filtro-turno-tipo');
        VetnovaSections.renderTurnos();
        return;
      }

      const editTurnoBtn = target.closest('[data-edit-turno]');
      if (editTurnoBtn) {
        const id = editTurnoBtn.getAttribute('data-edit-turno');
        const turno = VetnovaStorage.leer(VetnovaStorage.keys.TURNOS).find((x) => x.id === id);
        if (turno) VetnovaFunctionModales.abrirModal('modal-turno', { turno });
        return;
      }

      const delTurnoBtn = target.closest('[data-delete-turno]');
      if (delTurnoBtn) {
        const id = delTurnoBtn.getAttribute('data-delete-turno');
        VetnovaFunctions.eliminarTurno(id);
        VetnovaSections.renderTurnos();
        VetnovaSections.renderDashboard();
        return;
      }

      const fPedidoBtn = target.closest('[data-filtro-pedido-estado]');
      if (fPedidoBtn) {
        VetnovaSections.filtros.pedidoEstado = fPedidoBtn.getAttribute('data-filtro-pedido-estado');
        VetnovaSections.renderTurnos();
        return;
      }

      const editPedidoBtn = target.closest('[data-edit-pedido]');
      if (editPedidoBtn) {
        const id = editPedidoBtn.getAttribute('data-edit-pedido');
        const pedido = VetnovaStorage.leer(VetnovaStorage.keys.PEDIDOS).find((x) => x.id === id);
        if (pedido) VetnovaFunctionModales.abrirModal('modal-pedido', { pedido });
        return;
      }

      const delPedidoBtn = target.closest('[data-delete-pedido]');
      if (delPedidoBtn) {
        const id = delPedidoBtn.getAttribute('data-delete-pedido');
        VetnovaFunctions.eliminarPedido(id);
        VetnovaSections.renderTurnos();
        VetnovaSections.renderDashboard();
        return;
      }

      const fStockBtn = target.closest('[data-filtro-stock-estado]');
      if (fStockBtn) {
        VetnovaSections.filtros.stockEstado = fStockBtn.getAttribute('data-filtro-stock-estado');
        VetnovaSections.renderStock();
        return;
      }

      const editLoteBtn = target.closest('[data-edit-lote]');
      if (editLoteBtn) {
        const id = editLoteBtn.getAttribute('data-edit-lote');
        const lote = VetnovaStorage.leer(VetnovaStorage.keys.LOTES).find((x) => x.id === id);
        if (lote) VetnovaFunctionModales.abrirModal('modal-lote', { lote });
        return;
      }

      const delLoteBtn = target.closest('[data-delete-lote]');
      if (delLoteBtn) {
        const id = delLoteBtn.getAttribute('data-delete-lote');
        VetnovaFunctions.eliminarLote(id);
        VetnovaSections.renderStock();
        VetnovaSections.renderCatalogo();
        VetnovaSections.renderDashboard();
        return;
      }

      const delCompraBtn = target.closest('[data-delete-compra]');
      if (delCompraBtn) {
        const id = delCompraBtn.getAttribute('data-delete-compra');
        VetnovaFunctions.eliminarCompra(id);
        VetnovaSections.renderStock();
        VetnovaSections.renderFacturacion();
        VetnovaSections.renderDashboard();
        return;
      }

      const editCobroBtn = target.closest('[data-editar-cobro]');
      if (editCobroBtn) {
        const id = editCobroBtn.getAttribute('data-editar-cobro');
        const comprobante = VetnovaStorage.leer(VetnovaStorage.keys.COMPROBANTES).find(
          (x) => x.id === id
        );
        if (comprobante) {
          VetnovaFunctionModales.abrirModal('modal-editar-cobro', { comprobante });
        }
        return;
      }

      const delCompBtn = target.closest('[data-delete-comprobante]');
      if (delCompBtn) {
        const id = delCompBtn.getAttribute('data-delete-comprobante');
        VetnovaFunctions.eliminarComprobante(id);
        VetnovaSections.renderFacturacion();
        VetnovaSections.renderDashboard();
      }
    });

    document.addEventListener('input', (e) => {
      const target = e.target;
      if (target && target.id === 'input-buscar-cliente') {
        VetnovaSections.filtros.clienteBusqueda = target.value;
        VetnovaSections.renderClientes();
      } else if (target && target.id === 'input-buscar-catalogo') {
        VetnovaSections.filtros.catalogoBusqueda = target.value;
        VetnovaSections.renderCatalogo();
      }
    });

    document.addEventListener('change', (e) => {
      const target = e.target;
      if (target && target.matches('[data-select-pedido-estado]')) {
        const pedidoId = target.getAttribute('data-select-pedido-estado');
        const nuevoEstado = target.value;
        VetnovaFunctions.cambiarEstadoPedido(pedidoId, nuevoEstado);
        VetnovaSections.renderTurnos();
        VetnovaSections.renderDashboard();
      }
    });
  }

  function inicializarStorageSeguro() {
    if (typeof VetnovaStorage === 'undefined') return;

    if (typeof VetnovaStorage.asegurarEstructuraInicial === 'function') {
      VetnovaStorage.asegurarEstructuraInicial();
      return;
    }

    if (typeof VetnovaStorage.inicializar === 'function') {
      VetnovaStorage.inicializar();
      return;
    }

    if (typeof VetnovaStorage.init === 'function') {
      VetnovaStorage.init();
      return;
    }

    if (
      VetnovaStorage.keys &&
      typeof VetnovaStorage.leer === 'function' &&
      typeof VetnovaStorage.guardar === 'function'
    ) {
      Object.values(VetnovaStorage.keys).forEach((clave) => {
        if (localStorage.getItem(clave) === null) {
          VetnovaStorage.guardar(clave, []);
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    actualizarFechaTopbar();

    try {
      inicializarStorageSeguro();
    } catch (err) {
      console.error('Error al inicializar storage:', err);
    }

    configurarSplash();

    try {
      configurarMenuLateral();
      if (typeof VetnovaFunctionModales !== 'undefined') {
        VetnovaFunctionModales.inicializarEventosModales();
      }
      configurarDelegacionEventos();
      mostrarSeccion('sec-dashboard');
      if (typeof VetnovaSections !== 'undefined' && VetnovaSections.renderTodo) {
        VetnovaSections.renderTodo();
      }
    } catch (err) {
      console.error('Error al inicializar UI:', err);
    }
  });

  return {
    mostrarSeccion
  };
})();