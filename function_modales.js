/* ==========================================================================
   VETNOVA — CLÍNICA VETERINARIA
   function_modales.js: Control de apertura/cierre de modales y envío de forms
   ========================================================================== */

const VetnovaFunctionModales = (() => {
  let modalActivoId = null;

  function obtenerElementosModal() {
    const overlay =
      document.getElementById('modal-overlay') ||
      document.getElementById('modal-backdrop');
    const dialog = document.getElementById('modal-dialog');
    const titulo =
      document.getElementById('modal-title') ||
      document.getElementById('modal-titulo');
    const cuerpo =
      document.getElementById('modal-body') ||
      document.getElementById('modal-cuerpo');
    const btnCerrar =
      document.getElementById('btn-close-modal') ||
      document.getElementById('btn-cerrar-modal');
    return { overlay, dialog, titulo, cuerpo, btnCerrar };
  }

  function abrirModal(modalId, contextData) {
    const { overlay, titulo, cuerpo } = obtenerElementosModal();
    if (!overlay || !titulo || !cuerpo) return;

    const construido = VetnovaModales.construirFormulario(modalId, contextData || {});
    titulo.textContent = construido.titulo;
    cuerpo.innerHTML = construido.html;

    modalActivoId = modalId;
    overlay.classList.add('active', 'is-open', 'open');
    overlay.setAttribute('aria-hidden', 'false');

    const primerInput = cuerpo.querySelector('input, select, textarea');
    if (primerInput) {
      setTimeout(() => primerInput.focus(), 40);
    }
  }

  function cerrarModal() {
    const { overlay, cuerpo } = obtenerElementosModal();
    if (!overlay) return;

    overlay.classList.remove('active', 'is-open', 'open');
    overlay.setAttribute('aria-hidden', 'true');
    if (cuerpo) cuerpo.innerHTML = '';
    modalActivoId = null;
  }

  function parsearPresentaciones(rawStr) {
    const limpio = String(rawStr || '').trim();
    if (!limpio) return [];
    return limpio
      .split('|')
      .map((parte) => parte.trim())
      .filter(Boolean)
      .map((parte) => {
        const piezas = parte.split(':').map((p) => p.trim());
        const nombre = piezas[0] || 'Presentación';
        const factorUnidades = Number(piezas[1]) > 0 ? Number(piezas[1]) : 1;
        const fraccionada = (piezas[2] || '').toLowerCase() === 'frac';
        return { nombre, factorUnidades, fraccionada };
      });
  }

  function parsearInsumosExtras(rawStr) {
    const limpio = String(rawStr || '').trim();
    if (!limpio) return [];
    return limpio
      .split('|')
      .map((parte) => parte.trim())
      .filter(Boolean)
      .map((parte) => {
        const piezas = parte.split(':').map((p) => p.trim());
        return {
          insumoId: piezas[0] || '',
          cantidad: Number(piezas[1]) || 0
        };
      })
      .filter((x) => x.insumoId && x.cantidad > 0);
  }

  function manejarEnvioFormulario(form) {
    const id = form.id;
    const editId = form.getAttribute('data-edit-id') || '';
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    if (id === 'form-modal-tutor') {
      const domicilios = String(data.domicilios || '')
        .split('|')
        .map((d) => d.trim())
        .filter(Boolean);
      VetnovaFunctions.guardarTutor({ ...data, domicilios }, editId || null);
      VetnovaSections.renderClientes();
      VetnovaSections.renderDashboard();
      cerrarModal();
      return;
    }

    if (id === 'form-modal-mascota') {
      VetnovaFunctions.guardarMascota(data, editId || null);
      VetnovaSections.renderClientes();
      VetnovaSections.renderDashboard();
      cerrarModal();
      return;
    }

    if (id === 'form-modal-item') {
      const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);
      const presentaciones = parsearPresentaciones(data.presentacionesRaw);
      const insumosAsociados = [];

      if (data.insumoId) {
        const cantPrincipal = Number(data.insumoCantidad) > 0 ? Number(data.insumoCantidad) : 1;
        const insRef = catalogo.find((c) => c.id === data.insumoId);
        insumosAsociados.push({
          insumoId: data.insumoId,
          nombreInsumo: insRef ? insRef.descripcion : data.insumoId,
          cantidad: cantPrincipal
        });
      }

      parsearInsumosExtras(data.insumosRaw).forEach((extra) => {
        const insRef = catalogo.find((c) => c.id === extra.insumoId);
        insumosAsociados.push({
          insumoId: extra.insumoId,
          nombreInsumo: insRef ? insRef.descripcion : extra.insumoId,
          cantidad: extra.cantidad
        });
      });

      VetnovaFunctions.guardarItemCatalogo(
        {
          ...data,
          presentaciones,
          insumosAsociados
        },
        editId || null
      );
      VetnovaSections.renderCatalogo();
      VetnovaSections.renderDashboard();
      cerrarModal();
      return;
    }

    if (id === 'form-modal-combo') {
      const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);
      const componentes = [];

      if (data.comp1Id) {
        const c1 = catalogo.find((x) => x.id === data.comp1Id);
        componentes.push({
          itemId: data.comp1Id,
          descripcion: c1 ? c1.descripcion : data.comp1Id,
          cantidad: Number(data.comp1Cant) > 0 ? Number(data.comp1Cant) : 1
        });
      }

      if (data.comp2Id) {
        const c2 = catalogo.find((x) => x.id === data.comp2Id);
        componentes.push({
          itemId: data.comp2Id,
          descripcion: c2 ? c2.descripcion : data.comp2Id,
          cantidad: Number(data.comp2Cant) > 0 ? Number(data.comp2Cant) : 1
        });
      }

      VetnovaFunctions.guardarCombo(
        {
          nombre: data.nombre,
          descripcion: data.descripcion,
          precioPromocional: data.precioPromocional,
          estado: data.estado,
          componentes
        },
        editId || null
      );
      VetnovaSections.renderCatalogo();
      cerrarModal();
      return;
    }

    if (id === 'form-modal-box') {
      VetnovaFunctions.guardarBox(data, editId || null);
      VetnovaSections.renderTurnos();
      VetnovaSections.renderDashboard();
      cerrarModal();
      return;
    }

    if (id === 'form-modal-turno') {
      VetnovaFunctions.guardarTurno(data, editId || null);
      VetnovaSections.renderTurnos();
      VetnovaSections.renderDashboard();
      cerrarModal();
      return;
    }

    if (id === 'form-modal-pedido') {
      VetnovaFunctions.guardarPedido(data, editId || null);
      VetnovaSections.renderTurnos();
      VetnovaSections.renderDashboard();
      cerrarModal();
      return;
    }

    if (id === 'form-modal-lote') {
      VetnovaFunctions.guardarLote(data, editId || null);
      VetnovaSections.renderStock();
      VetnovaSections.renderCatalogo();
      VetnovaSections.renderDashboard();
      cerrarModal();
      return;
    }

    if (id === 'form-modal-compra') {
      VetnovaFunctions.registrarCompraProveedor(data);
      VetnovaSections.renderStock();
      VetnovaSections.renderCatalogo();
      VetnovaSections.renderFacturacion();
      VetnovaSections.renderDashboard();
      cerrarModal();
      return;
    }

    if (id === 'form-modal-comprobante') {
      const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);
      const combos = VetnovaStorage.leer(VetnovaStorage.keys.COMBOS);

      let tipoLinea = 'item';
      let referenciaId = '';
      let itemId = '';
      let descripcionLinea = 'Ítem / Servicio';

      if (data.referenciaSeleccion && data.referenciaSeleccion.indexOf(':') !== -1) {
        const partes = data.referenciaSeleccion.split(':');
        tipoLinea = partes[0];
        referenciaId = partes[1];

        if (tipoLinea === 'combo') {
          const cb = combos.find((x) => x.id === referenciaId);
          descripcionLinea = cb ? cb.nombre : referenciaId;
        } else {
          itemId = referenciaId;
          const it = catalogo.find((x) => x.id === itemId);
          descripcionLinea = it ? it.descripcion : itemId;
        }
      }

      const pagos = [];
      const m1 = Number(data.monto1) || 0;
      if (data.medio1 && m1 > 0) {
        pagos.push({ medio: data.medio1, monto: m1 });
      }
      const m2 = Number(data.monto2) || 0;
      if (data.medio2 && m2 > 0) {
        pagos.push({ medio: data.medio2, monto: m2 });
      }

      VetnovaFunctions.guardarComprobante({
        tipoComprobante: data.tipoComprobante,
        fecha: data.fecha,
        tutorId: data.tutorId,
        mascotaId: data.mascotaId,
        items: [
          {
            tipo: tipoLinea,
            referenciaId,
            itemId,
            descripcion: descripcionLinea,
            presentacion: data.presentacion || '',
            cantidad: Number(data.cantidad) || 1
          }
        ],
        totalComprobante: Number(data.totalComprobante) || 0,
        pagos,
        observaciones: data.observaciones || '',
        descontarStock: true
      });

      VetnovaSections.renderFacturacion();
      VetnovaSections.renderStock();
      VetnovaSections.renderDashboard();
      cerrarModal();
      return;
    }

    if (id === 'form-modal-editar-cobro') {
      const comprobanteId = form.getAttribute('data-comprobante-id');
      const pagos = [];
      const m1 = Number(data.monto1) || 0;
      if (data.medio1 && m1 > 0) {
        pagos.push({ medio: data.medio1, monto: m1 });
      }
      const m2 = Number(data.monto2) || 0;
      if (data.medio2 && m2 > 0) {
        pagos.push({ medio: data.medio2, monto: m2 });
      }

      VetnovaFunctions.actualizarPagosComprobante(comprobanteId, pagos);
      VetnovaSections.renderFacturacion();
      VetnovaSections.renderDashboard();
      cerrarModal();
      return;
    }

    if (id === 'form-modal-cierre-caja') {
      VetnovaFunctions.registrarCierreCaja(data);
      VetnovaSections.renderFacturacion();
      VetnovaSections.renderDashboard();
      cerrarModal();
    }
  }

  function inicializarEventosModales() {
    const { overlay, btnCerrar } = obtenerElementosModal();

    if (btnCerrar) {
      btnCerrar.addEventListener('click', cerrarModal);
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          cerrarModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalActivoId) {
        cerrarModal();
      }
    });

    document.addEventListener('click', (e) => {
      const cerrarBtn = e.target.closest('[data-cerrar-modal]');
      if (cerrarBtn) {
        cerrarModal();
        return;
      }

      const openBtn = e.target.closest('[data-open-modal]');
      if (openBtn) {
        const modalId = openBtn.getAttribute('data-open-modal');
        abrirModal(modalId, {});
      }
    });

    document.addEventListener('submit', (e) => {
      const form = e.target.closest('form[id^="form-modal-"]');
      if (form) {
        e.preventDefault();
        manejarEnvioFormulario(form);
      }
    });
  }

  return {
    abrirModal,
    cerrarModal,
    inicializarEventosModales
  };
})();