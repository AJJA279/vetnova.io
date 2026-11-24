/* ==========================================================================
   VETNOVA — CLÍNICA VETERINARIA
   sections.js: Renderizado dinámico de las 6 secciones en el DOM
   ========================================================================== */

const VetnovaSections = (() => {
  const filtros = {
    clienteTipo: "Todos",
    clienteBusqueda: "",
    catalogoCategoria: "Todas",
    catalogoBusqueda: "",
    turnoTipo: "Todos",
    pedidoEstado: "Todos",
    stockEstado: "Todos"
  };

function escapar(texto) {
    return String(texto ?? "")
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"');
  }

  /* ------------------------------------------------------------------------
     SECCIÓN 1: DASHBOARD Y CENTRO DE ALERTAS
     ------------------------------------------------------------------------ */

  function renderDashboard() {
    const resumen = VetnovaRelations.obtenerResumenDashboard();
    const kpisGrid = document.getElementById("dash-kpis-grid");
    const quickRow = document.getElementById("dash-quick-actions");
    const alertasCont = document.getElementById("dash-alertas-container");
    const actividadCont = document.getElementById("dash-actividad-container");

    if (kpisGrid) {
      kpisGrid.innerHTML =
        '<div class="kpi-card" data-jump-section="sec-turnos">' +
          '<span class="kpi-label">Turnos próximas 24 hs</span>' +
          '<span class="kpi-value">' + resumen.turnos24hCount + "</span>" +
          '<span class="kpi-meta">Ver agenda y boxes →</span>' +
        "</div>" +
        '<div class="kpi-card" data-jump-section="sec-turnos">' +
          '<span class="kpi-label">Pedidos activos</span>' +
          '<span class="kpi-value">' + resumen.pedidosActivosCount + "</span>" +
          '<span class="kpi-meta">Mostrador y delivery →</span>' +
        "</div>" +
        '<div class="kpi-card" data-jump-section="sec-turnos">' +
          '<span class="kpi-label">Boxes / Consultorios</span>' +
          '<span class="kpi-value">' + resumen.conteoBoxes.libre + " / " + resumen.conteoBoxes.total + "</span>" +
          '<span class="kpi-meta">Libres · ' + resumen.conteoBoxes.enAtencion + " en atención · " + resumen.conteoBoxes.reservado + " reserv.</span>" +
        "</div>" +
        '<div class="kpi-card" data-jump-section="sec-facturacion">' +
          '<span class="kpi-label">Caja del día</span>' +
          '<span class="kpi-value">' + escapar(VetnovaFunctions.formatearMoneda(resumen.ingresosHoy)) + "</span>" +
          '<span class="kpi-meta">Ingresos verificados hoy →</span>' +
        "</div>";
    }

    if (quickRow) {
      quickRow.innerHTML =
        '<button type="button" class="btn btn-primary" data-open-modal="modal-turno">+ Nuevo turno</button>' +
        '<button type="button" class="btn btn-secondary" data-open-modal="modal-pedido">+ Nuevo pedido</button>' +
        '<button type="button" class="btn btn-ghost" data-open-modal="modal-compra">+ Registrar compra</button>' +
        '<button type="button" class="btn btn-primary" data-open-modal="modal-comprobante">+ Nueva venta / factura</button>';
    }

    if (alertasCont) {
      const vencHtml = resumen.alertasVencimiento.length
        ? resumen.alertasVencimiento
            .map((a) => {
              const badgeClase = a.vencido ? "badge--danger" : "badge--warn";
              const textoVenc = a.vencido
                ? "Vencido (" + Math.abs(a.diasRestantes) + "d)"
                : "Vence en " + a.diasRestantes + "d";

              return (
                '<div class="data-card">' +
                  '<div class="data-card-header">' +
                    '<strong class="data-card-title">' + escapar(a.nombreItem) + "</strong>" +
                    '<span class="badge ' + badgeClase + '">' + escapar(textoVenc) + "</span>" +
                  "</div>" +
                  '<p class="data-card-meta">Lote: ' + escapar(a.codigoLote) + " · Stock: " + a.cantidad + " " + escapar(a.unidad) + " · Fecha: " + escapar(a.fechaVencimiento) + "</p>" +
                  '<div class="data-card-actions">' +
                    '<button type="button" class="btn btn-ghost btn-sm" data-descartar-alerta="' + escapar(a.alertaId) + '">Marcar revisada</button>' +
                    '<button type="button" class="btn btn-secondary btn-sm" data-jump-section="sec-stock">Ir a Stock</button>' +
                  "</div>" +
                "</div>"
              );
            })
            .join("")
        : '<div class="empty-state">Sin productos, vacunas o alimentos próximos a vencer (15 días).</div>';

      const stockHtml = resumen.alertasStock.length
        ? resumen.alertasStock
            .map((a) => {
              const sectorTexto = a.sector ? " · " + escapar(a.sector) : "";
              return (
                '<div class="data-card">' +
                  '<div class="data-card-header">' +
                    '<strong class="data-card-title">' + escapar(a.nombreItem) + "</strong>" +
                    '<span class="badge badge--danger">Stock mínimo</span>' +
                  "</div>" +
                  '<p class="data-card-meta">Actual: ' + a.stockActual + " " + escapar(a.unidad) + " · Mínimo: " + a.stockMinimo + " " + escapar(a.unidad) + sectorTexto + "</p>" +
                  '<div class="data-card-actions">' +
                    '<button type="button" class="btn btn-ghost btn-sm" data-descartar-alerta="' + escapar(a.alertaId) + '">Marcar revisada</button>' +
                    '<button type="button" class="btn btn-primary btn-sm" data-open-modal="modal-compra">Reponer</button>' +
                  "</div>" +
                "</div>"
              );
            })
            .join("")
        : '<div class="empty-state">Sin alertas de stock mínimo activas.</div>';

      const turnos24Html = resumen.turnosProximos.length
        ? resumen.turnosProximos
            .map(
              (t) =>
                '<div class="data-card">' +
                  '<div class="data-card-header">' +
                    '<strong class="data-card-title">' + escapar(t.hora) + " · " + escapar(t.tipo) + "</strong>" +
                    '<span class="badge badge--info">' + escapar(t.fecha) + "</span>" +
                  "</div>" +
                  '<p class="data-card-meta">Mascota: ' + escapar(t.mascotaNombre) + " · Tutor: " + escapar(t.tutorNombre) + " · " + escapar(t.boxNombre) + "</p>" +
                  '<div class="data-card-actions">' +
                    '<button type="button" class="btn btn-secondary btn-sm" data-jump-section="sec-turnos">Ver turno</button>' +
                  "</div>" +
                "</div>"
            )
            .join("")
        : '<div class="empty-state">Sin turnos confirmados en las próximas 24 horas.</div>';

      const refuerzosHtml = resumen.recordatoriosRefuerzos.length
        ? resumen.recordatoriosRefuerzos
            .map((r) => {
              const badgeClase = r.diasRestantes <= 0 ? "badge--danger" : "badge--warn";
              const textoDias = r.diasRestantes <= 0 ? "Vencido / Hoy" : "En " + r.diasRestantes + " días";
              return (
                '<div class="data-card">' +
                  '<div class="data-card-header">' +
                    '<strong class="data-card-title">' + escapar(r.mascotaNombre) + " (" + escapar(r.tutorNombre) + ")</strong>" +
                    '<span class="badge ' + badgeClase + '">' + escapar(textoDias) + "</span>" +
                  "</div>" +
                  '<p class="data-card-meta">' + escapar(r.tipoRefuerzo) + " · Fecha prevista: " + escapar(r.fechaRefuerzo) + "</p>" +
                  '<div class="data-card-actions">' +
                    '<button type="button" class="btn btn-ghost btn-sm" data-descartar-alerta="' + escapar(r.alertaId) + '">Marcar revisada</button>' +
                    '<button type="button" class="btn btn-primary btn-sm" data-open-modal="modal-turno">Agendar refuerzo</button>' +
                  "</div>" +
                "</div>"
              );
            })
            .join("")
        : '<div class="empty-state">Sin recordatorios de refuerzos próximos.</div>';

      alertasCont.innerHTML =
        '<div class="data-card">' +
          '<div class="data-card-header">' +
            '<strong class="data-card-title">Próximos a vencer (15 días)</strong>' +
            '<span class="badge badge--warn">' + resumen.alertasVencimiento.length + "</span>" +
          "</div>" +
          '<div class="list-stack">' + vencHtml + "</div>" +
        "</div>" +
        '<div class="data-card">' +
          '<div class="data-card-header">' +
            '<strong class="data-card-title">Stock mínimo</strong>' +
            '<span class="badge badge--danger">' + resumen.alertasStock.length + "</span>" +
          "</div>" +
          '<div class="list-stack">' + stockHtml + "</div>" +
        "</div>" +
        '<div class="data-card">' +
          '<div class="data-card-header">' +
            '<strong class="data-card-title">Turnos próximos 24 hs</strong>' +
            '<span class="badge badge--info">' + resumen.turnosProximos.length + "</span>" +
          "</div>" +
          '<div class="list-stack">' + turnos24Html + "</div>" +
        "</div>" +
        '<div class="data-card">' +
          '<div class="data-card-header">' +
            '<strong class="data-card-title">Recordatorios de refuerzos</strong>' +
            '<span class="badge badge--ok">' + resumen.recordatoriosRefuerzos.length + "</span>" +
          "</div>" +
          '<div class="list-stack">' + refuerzosHtml + "</div>" +
        "</div>";
    }

    if (actividadCont) {
      const actividad = VetnovaStorage.leer(VetnovaStorage.keys.ACTIVIDAD);
      if (!actividad.length) {
        actividadCont.innerHTML = '<div class="empty-state">Aún no hay movimientos registrados en el almacenamiento local.</div>';
      } else {
        actividadCont.innerHTML = actividad
          .slice(0, 8)
          .map(
            (act) =>
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<span class="data-card-meta">' + escapar(act.fecha) + " " + escapar(act.hora) + " · <strong>" + escapar(act.seccion) + "</strong></span>" +
                "</div>" +
                "<div>" + escapar(act.descripcion) + "</div>" +
              "</div>"
          )
          .join("");
      }
    }
  }

  /* ------------------------------------------------------------------------
     SECCIÓN 2: CLIENTES Y MASCOTAS
     ------------------------------------------------------------------------ */

  function renderClientes() {
    const tutores = VetnovaStorage.leer(VetnovaStorage.keys.TUTORES);
    const mascotas = VetnovaStorage.leer(VetnovaStorage.keys.MASCOTAS);
    const filtrosCont = document.getElementById("clientes-filtros");
    const tutoresCont = document.getElementById("tutores-listado");
    const mascotasCont = document.getElementById("mascotas-listado");
    const historialCont = document.getElementById("clientes-historial-container");

    if (filtrosCont) {
      const tipos = ["Todos", "Particular", "Criadero", "Refugio"];
      filtrosCont.innerHTML =
        tipos
          .map((tp) => {
            const claseBtn = filtros.clienteTipo === tp ? "btn-primary" : "btn-ghost";
            return '<button type="button" class="btn btn-sm ' + claseBtn + '" data-filtro-cliente-tipo="' + escapar(tp) + '">' + escapar(tp) + "</button>";
          })
          .join("") +
        '<input type="text" id="input-buscar-cliente" class="form-control" style="max-width: 260px;" value="' + escapar(filtros.clienteBusqueda) + '" placeholder="Ej: Gómez o Criadero Del Sur" />';
    }

    const tutoresFiltrados = tutores.filter((t) => {
      const matchTipo = filtros.clienteTipo === "Todos" || t.tipo === filtros.clienteTipo;
      const q = filtros.clienteBusqueda.trim().toLowerCase();
      const matchTexto =
        !q ||
        (t.nombre || "").toLowerCase().includes(q) ||
        (t.documentoFiscal || "").toLowerCase().includes(q) ||
        (t.telefono || "").toLowerCase().includes(q);
      return matchTipo && matchTexto;
    });

    if (tutoresCont) {
      if (!tutoresFiltrados.length) {
        tutoresCont.innerHTML = '<div class="empty-state">No hay tutores cargados con ese criterio.</div>';
      } else {
        tutoresCont.innerHTML = tutoresFiltrados
          .map((t) => {
            const mascotasTutor = mascotas.filter((m) => m.tutorId === t.id);
            const doms = (t.domicilios || []).join(" | ") || "Sin domicilio cargado";
            const docParte = t.documentoFiscal ? " (" + escapar(t.documentoFiscal) + ")" : "";

            return (
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<strong class="data-card-title">' + escapar(t.nombre) + "</strong>" +
                  '<span class="badge badge--info">' + escapar(t.tipo) + "</span>" +
                "</div>" +
                '<p class="data-card-meta">Tel: ' + escapar(t.telefono || "-") + " · Fiscal: " + escapar(t.condicionFiscal || "-") + docParte + "</p>" +
                '<p class="data-card-meta">Domicilios: ' + escapar(doms) + "</p>" +
                '<p class="data-card-meta">Mascotas asociadas: <strong>' + mascotasTutor.length + "</strong></p>" +
                '<div class="data-card-actions">' +
                  '<button type="button" class="btn btn-secondary btn-sm" data-edit-tutor="' + escapar(t.id) + '">Editar</button>' +
                  '<button type="button" class="btn btn-primary btn-sm" data-nueva-mascota-tutor="' + escapar(t.id) + '">+ Mascota</button>' +
                  '<button type="button" class="btn btn-danger btn-sm" data-delete-tutor="' + escapar(t.id) + '">Eliminar</button>' +
                "</div>" +
              "</div>"
            );
          })
          .join("");
      }
    }

    if (mascotasCont) {
      if (!mascotas.length) {
        mascotasCont.innerHTML = '<div class="empty-state">No hay mascotas registradas aún.</div>';
      } else {
        mascotasCont.innerHTML = mascotas
          .map((m) => {
            const tutor = tutores.find((t) => t.id === m.tutorId);
            const pesoTexto = m.peso ? escapar(m.peso) + " kg" : "-";
            const refuerzoHtml = m.fechaRefuerzo
              ? '<p class="data-card-meta">Refuerzo: ' + escapar(m.tipoRefuerzo || "Vacuna/Antiparasitario") + " (" + escapar(m.fechaRefuerzo) + ")</p>"
              : "";

            return (
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<strong class="data-card-title">' + escapar(m.nombre) + "</strong>" +
                  '<span class="badge badge--ok">' + escapar(m.especie || "Mascota") + "</span>" +
                "</div>" +
                '<p class="data-card-meta">Tutor: <strong>' + escapar(tutor ? tutor.nombre : "Sin tutor") + "</strong> · Raza: " + escapar(m.raza || "-") + " · Peso: " + pesoTexto + "</p>" +
                '<p class="data-card-meta">Alergias: ' + escapar(m.alergias || "Ninguna registrada") + "</p>" +
                '<p class="data-card-meta">Observaciones: ' + escapar(m.observaciones || "-") + "</p>" +
                refuerzoHtml +
                '<div class="data-card-actions">' +
                  '<button type="button" class="btn btn-secondary btn-sm" data-edit-mascota="' + escapar(m.id) + '">Editar</button>' +
                  '<button type="button" class="btn btn-danger btn-sm" data-delete-mascota="' + escapar(m.id) + '">Eliminar</button>' +
                "</div>" +
              "</div>"
            );
          })
          .join("");
      }
    }

    if (historialCont) {
      if (!tutoresFiltrados.length) {
        historialCont.innerHTML = '<div class="empty-state">Sin historial disponible.</div>';
      } else {
        historialCont.innerHTML = tutoresFiltrados
          .map((t) => {
            const hist = VetnovaFunctions.obtenerHistorialCliente(t.id);
            const totalOps = hist.turnos.length + hist.pedidos.length + hist.comprobantes.length;
            return (
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<strong class="data-card-title">' + escapar(t.nombre) + "</strong>" +
                  '<span class="badge badge--info">' + totalOps + " registros</span>" +
                "</div>" +
                '<p class="data-card-meta">' +
                  "Turnos/Atenciones: <strong>" + hist.turnos.length + "</strong> · " +
                  "Pedidos: <strong>" + hist.pedidos.length + "</strong> · " +
                  "Comprobantes/Compras: <strong>" + hist.comprobantes.length + "</strong>" +
                "</p>" +
              "</div>"
            );
          })
          .join("");
      }
    }
  }

  /* ------------------------------------------------------------------------
     SECCIÓN 3: CATÁLOGO, SERVICIOS, COMBOS E HISTORIAL DE PRECIOS
     ------------------------------------------------------------------------ */

  function renderCatalogo() {
    const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);
    const combos = VetnovaStorage.leer(VetnovaStorage.keys.COMBOS);
    const historialPrecios = VetnovaStorage.leer(VetnovaStorage.keys.HISTORIAL_PRECIOS);

    const filtrosCont = document.getElementById("catalogo-filtros");
    const catalogoCont = document.getElementById("catalogo-listado");
    const combosCont = document.getElementById("combos-listado");
    const historialCont = document.getElementById("historial-precios-listado");

    const categorias = [
      "Todas",
      "Alimentos balanceados",
      "Farmacia veterinaria",
      "Accesorios",
      "Higiene y estética",
      "Servicios clínicos",
      "Peluquería canina"
    ];

    if (filtrosCont) {
      filtrosCont.innerHTML =
        categorias
          .map((cat) => {
            const claseBtn = filtros.catalogoCategoria === cat ? "btn-primary" : "btn-ghost";
            return '<button type="button" class="btn btn-sm ' + claseBtn + '" data-filtro-catalogo-cat="' + escapar(cat) + '">' + escapar(cat) + "</button>";
          })
          .join("") +
        '<input type="text" id="input-buscar-catalogo" class="form-control" style="max-width: 250px;" value="' + escapar(filtros.catalogoBusqueda) + '" placeholder="Ej: ALB-015 o baño" />';
    }

    const itemsFiltrados = catalogo.filter((item) => {
      const matchCat = filtros.catalogoCategoria === "Todas" || item.categoria === filtros.catalogoCategoria;
      const q = filtros.catalogoBusqueda.trim().toLowerCase();
      const matchQ =
        !q ||
        (item.codigo || "").toLowerCase().includes(q) ||
        (item.descripcion || "").toLowerCase().includes(q);
      return matchCat && matchQ;
    });

    if (catalogoCont) {
      if (!itemsFiltrados.length) {
        catalogoCont.innerHTML = '<div class="empty-state">No hay productos ni servicios registrados en este filtro.</div>';
      } else {
        catalogoCont.innerHTML = itemsFiltrados
          .map((item) => {
            const stockTotal = VetnovaRelations.obtenerStockTotalPorItem(item.id);
            const presTexto = (item.presentaciones || []).map((p) => p.nombre).join(", ") || "Estándar";
            const insTexto =
              (item.insumosAsociados || [])
                .map((i) => (i.nombreInsumo || i.insumoId) + " (" + i.cantidad + ")")
                .join(", ") || "Ninguno";
            const badgeClase = item.estado === "Activo" ? "badge--ok" : "badge--warn";
            const durTexto = item.duracionEstimada ? item.duracionEstimada + " min" : "N/A";

            return (
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  "<div>" +
                    '<span class="data-card-meta">' + escapar(item.codigo || "S/C") + " · " + escapar(item.categoria) + "</span>" +
                    '<strong class="data-card-title" style="display:block;">' + escapar(item.descripcion) + "</strong>" +
                  "</div>" +
                  '<span class="badge ' + badgeClase + '">' + escapar(item.estado) + "</span>" +
                "</div>" +
                '<p class="data-card-meta">Costo: <strong>' + escapar(VetnovaFunctions.formatearMoneda(item.costo)) + "</strong> · Venta: <strong>" + escapar(VetnovaFunctions.formatearMoneda(item.precio)) + "</strong></p>" +
                '<p class="data-card-meta">Presentaciones: ' + escapar(presTexto) + "</p>" +
                '<p class="data-card-meta">Sector: ' + escapar(item.sector) + " · Duración: " + escapar(durTexto) + " · Stock: <strong>" + stockTotal + "</strong></p>" +
                '<p class="data-card-meta">Insumos asociados: ' + escapar(insTexto) + "</p>" +
                '<div class="data-card-actions">' +
                  '<button type="button" class="btn btn-secondary btn-sm" data-edit-item="' + escapar(item.id) + '">Editar</button>' +
                  '<button type="button" class="btn btn-danger btn-sm" data-delete-item="' + escapar(item.id) + '">Eliminar</button>' +
                "</div>" +
              "</div>"
            );
          })
          .join("");
      }
    }

    if (combosCont) {
      if (!combos.length) {
        combosCont.innerHTML = '<div class="empty-state">No hay combos promocionales creados.</div>';
      } else {
        combosCont.innerHTML = combos
          .map((cb) => {
            const compTexto =
              (cb.componentes || [])
                .map((c) => (c.descripcion || c.itemId) + " x" + (c.cantidad || 1))
                .join(" + ") || "Sin componentes";
            const badgeClase = cb.estado === "Activo" ? "badge--ok" : "badge--warn";

            return (
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<strong class="data-card-title">' + escapar(cb.nombre) + "</strong>" +
                  '<span class="badge ' + badgeClase + '">' + escapar(cb.estado) + "</span>" +
                "</div>" +
                '<p class="data-card-meta">' + escapar(cb.descripcion || "") + "</p>" +
                '<p class="data-card-meta">Incluye: ' + escapar(compTexto) + "</p>" +
                '<p class="data-card-meta">Precio promo: <strong>' + escapar(VetnovaFunctions.formatearMoneda(cb.precioPromocional)) + "</strong></p>" +
                '<div class="data-card-actions">' +
                  '<button type="button" class="btn btn-secondary btn-sm" data-edit-combo="' + escapar(cb.id) + '">Editar</button>' +
                  '<button type="button" class="btn btn-danger btn-sm" data-delete-combo="' + escapar(cb.id) + '">Eliminar</button>' +
                "</div>" +
              "</div>"
            );
          })
          .join("");
      }
    }

    if (historialCont) {
      if (!historialPrecios.length) {
        historialCont.innerHTML = '<div class="empty-state">Sin ajustes de precio registrados aún.</div>';
      } else {
        historialCont.innerHTML = historialPrecios
          .map(
            (h) =>
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<strong class="data-card-title">' + escapar(h.descripcionItem) + "</strong>" +
                  '<span class="badge badge--info">' + escapar(h.fecha) + "</span>" +
                "</div>" +
                '<p class="data-card-meta">' +
                  "Costo: " + escapar(VetnovaFunctions.formatearMoneda(h.costoAnterior)) + " → <strong>" + escapar(VetnovaFunctions.formatearMoneda(h.costoNuevo)) + "</strong> · " +
                  "Precio: " + escapar(VetnovaFunctions.formatearMoneda(h.precioAnterior)) + " → <strong>" + escapar(VetnovaFunctions.formatearMoneda(h.precioNuevo)) + "</strong>" +
                "</p>" +
                '<p class="data-card-meta">Motivo: ' + escapar(h.motivo || "-") + "</p>" +
              "</div>"
          )
          .join("");
      }
    }
  }

  /* ------------------------------------------------------------------------
     SECCIÓN 4: TURNOS, BOXES Y PEDIDOS
     ------------------------------------------------------------------------ */

  function renderTurnos() {
    const boxes = VetnovaStorage.leer(VetnovaStorage.keys.BOXES);
    const turnos = VetnovaStorage.leer(VetnovaStorage.keys.TURNOS);
    const pedidos = VetnovaStorage.leer(VetnovaStorage.keys.PEDIDOS);
    const tutores = VetnovaStorage.leer(VetnovaStorage.keys.TUTORES);
    const mascotas = VetnovaStorage.leer(VetnovaStorage.keys.MASCOTAS);

    const boxesCont = document.getElementById("boxes-listado");
    const turnosFiltrosCont = document.getElementById("turnos-filtros");
    const turnosCont = document.getElementById("turnos-listado");
    const pedidosFiltrosCont = document.getElementById("pedidos-filtros");
    const pedidosCont = document.getElementById("pedidos-listado");

    if (boxesCont) {
      if (!boxes.length) {
        boxesCont.innerHTML = '<div class="empty-state">No hay boxes o consultorios configurados. Creá uno con "+ Nuevo box".</div>';
      } else {
        boxesCont.innerHTML = boxes
          .map((b) => {
            const badgeClass =
              b.estado === "Libre"
                ? "badge--ok"
                : b.estado === "En atención"
                  ? "badge--danger"
                  : "badge--warn";
            const detalleHtml = b.detalleActual
              ? '<p class="data-card-meta">Detalle: ' + escapar(b.detalleActual) + "</p>"
              : "";

            return (
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<strong class="data-card-title">' + escapar(b.nombre) + "</strong>" +
                  '<span class="badge ' + badgeClass + '">' + escapar(b.estado) + "</span>" +
                "</div>" +
                '<p class="data-card-meta">Sector: ' + escapar(b.sector || "Consultorio") + "</p>" +
                detalleHtml +
                '<div class="data-card-actions">' +
                  '<button type="button" class="btn btn-ghost btn-sm" data-box-estado="' + escapar(b.id) + '" data-estado="Libre">Libre</button>' +
                  '<button type="button" class="btn btn-secondary btn-sm" data-box-estado="' + escapar(b.id) + '" data-estado="En atención">En atención</button>' +
                  '<button type="button" class="btn btn-ghost btn-sm" data-box-estado="' + escapar(b.id) + '" data-estado="Reservado">Reservado</button>' +
                  '<button type="button" class="btn btn-danger btn-sm" data-delete-box="' + escapar(b.id) + '">✕</button>' +
                "</div>" +
              "</div>"
            );
          })
          .join("");
      }
    }

    if (turnosFiltrosCont) {
      const tipos = ["Todos", "Peluquería", "Vacunación", "Consulta"];
      turnosFiltrosCont.innerHTML = tipos
        .map((tp) => {
          const claseBtn = filtros.turnoTipo === tp ? "btn-primary" : "btn-ghost";
          return '<button type="button" class="btn btn-sm ' + claseBtn + '" data-filtro-turno-tipo="' + escapar(tp) + '">' + escapar(tp) + "</button>";
        })
        .join("");
    }

    const turnosFiltrados = turnos.filter(
      (t) => filtros.turnoTipo === "Todos" || t.tipo === filtros.turnoTipo
    );

    if (turnosCont) {
      if (!turnosFiltrados.length) {
        turnosCont.innerHTML = '<div class="empty-state">No hay turnos agendados para este filtro.</div>';
      } else {
        turnosCont.innerHTML = turnosFiltrados
          .map((t) => {
            const tutor = tutores.find((x) => x.id === t.tutorId);
            const mascota = mascotas.find((m) => m.id === t.mascotaId);
            const box = boxes.find((b) => b.id === t.boxId);
            const obsHtml = t.observaciones
              ? '<p class="data-card-meta">Obs: ' + escapar(t.observaciones) + "</p>"
              : "";

            return (
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<strong class="data-card-title">' + escapar(t.fecha) + " · " + escapar(t.hora) + " — " + escapar(t.tipo) + "</strong>" +
                  '<span class="badge badge--info">' + escapar(t.estado || "Confirmado") + "</span>" +
                "</div>" +
                '<p class="data-card-meta">Tutor: <strong>' + escapar(tutor ? tutor.nombre : "Sin tutor") + "</strong> · Mascota: <strong>" + escapar(mascota ? mascota.nombre : "Sin mascota") + "</strong> · Box: " + escapar(box ? box.nombre : "Sin asignar") + "</p>" +
                obsHtml +
                '<div class="data-card-actions">' +
                  '<button type="button" class="btn btn-secondary btn-sm" data-edit-turno="' + escapar(t.id) + '">Editar</button>' +
                  '<button type="button" class="btn btn-danger btn-sm" data-delete-turno="' + escapar(t.id) + '">Eliminar</button>' +
                "</div>" +
              "</div>"
            );
          })
          .join("");
      }
    }

    if (pedidosFiltrosCont) {
      const estados = ["Todos", "En espera", "En proceso", "Listo para retirar", "Entregado", "Cancelado"];
      pedidosFiltrosCont.innerHTML = estados
        .map((est) => {
          const claseBtn = filtros.pedidoEstado === est ? "btn-primary" : "btn-ghost";
          return '<button type="button" class="btn btn-sm ' + claseBtn + '" data-filtro-pedido-estado="' + escapar(est) + '">' + escapar(est) + "</button>";
        })
        .join("");
    }

    const pedidosFiltrados = pedidos.filter(
      (p) => filtros.pedidoEstado === "Todos" || p.estado === filtros.pedidoEstado
    );

    if (pedidosCont) {
      if (!pedidosFiltrados.length) {
        pedidosCont.innerHTML = '<div class="empty-state">No hay pedidos registrados para este estado.</div>';
      } else {
        const estadosFlujo = ["En espera", "En proceso", "Listo para retirar", "Entregado", "Cancelado"];
        pedidosCont.innerHTML = pedidosFiltrados
          .map((p) => {
            const tutor = tutores.find((x) => x.id === p.tutorId);
            const badgeClase =
              p.estado === "Entregado"
                ? "badge--ok"
                : p.estado === "Cancelado"
                  ? "badge--danger"
                  : p.estado === "Listo para retirar"
                    ? "badge--info"
                    : "badge--warn";

            const domTexto = p.domicilioEntrega ? " · Domicilio: " + escapar(p.domicilioEntrega) : "";
            const opcionesSelect = estadosFlujo
              .map(
                (st) =>
                  '<option value="' + escapar(st) + '"' + (p.estado === st ? " selected" : "") + ">" + escapar(st) + "</option>"
              )
              .join("");

            return (
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<strong class="data-card-title">' + escapar(p.numero) + " · " + escapar(p.modalidad) + " (" + escapar(p.sector) + ")</strong>" +
                  '<span class="badge ' + badgeClase + '">' + escapar(p.estado) + "</span>" +
                "</div>" +
                '<p class="data-card-meta">Tutor: <strong>' + escapar(tutor ? tutor.nombre : "Mostrador / Sin tutor") + "</strong>" + domTexto + "</p>" +
                '<p class="data-card-meta">Detalle: ' + escapar(p.detalleItems || "-") + " · Estimado: <strong>" + escapar(VetnovaFunctions.formatearMoneda(p.totalEstimado)) + "</strong></p>" +
                '<div class="data-card-actions">' +
                  '<select class="form-select" style="max-width: 195px;" data-select-pedido-estado="' + escapar(p.id) + '">' + opcionesSelect + "</select>" +
                  '<button type="button" class="btn btn-secondary btn-sm" data-edit-pedido="' + escapar(p.id) + '">Editar</button>' +
                  '<button type="button" class="btn btn-danger btn-sm" data-delete-pedido="' + escapar(p.id) + '">Eliminar</button>' +
                "</div>" +
              "</div>"
            );
          })
          .join("");
      }
    }
  }

  /* ------------------------------------------------------------------------
     SECCIÓN 5: STOCK, COMPRAS Y LOTES
     ------------------------------------------------------------------------ */

  function renderStock() {
    const lotes = VetnovaStorage.leer(VetnovaStorage.keys.LOTES);
    const compras = VetnovaStorage.leer(VetnovaStorage.keys.COMPRAS);
    const descuentos = VetnovaStorage.leer(VetnovaStorage.keys.DESCUENTOS);
    const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);

    const filtrosCont = document.getElementById("stock-filtros");
    const lotesCont = document.getElementById("stock-lotes-listado");
    const comprasCont = document.getElementById("compras-listado");
    const descuentosCont = document.getElementById("descuentos-listado");

    if (filtrosCont) {
      const estados = ["Todos", "Por vencer (15d)", "Stock bajo"];
      filtrosCont.innerHTML = estados
        .map((st) => {
          const claseBtn = filtros.stockEstado === st ? "btn-primary" : "btn-ghost";
          return '<button type="button" class="btn btn-sm ' + claseBtn + '" data-filtro-stock-estado="' + escapar(st) + '">' + escapar(st) + "</button>";
        })
        .join("");
    }

    const lotesFiltrados = lotes.filter((l) => {
      if (filtros.stockEstado === "Por vencer (15d)") {
        const dias = VetnovaRelations.diasHastaFecha(l.fechaVencimiento);
        return dias !== null && dias <= VetnovaRelations.DIAS_ALERTA_VENCIMIENTO;
      }
      if (filtros.stockEstado === "Stock bajo") {
        const min = Number(l.stockMinimo) || 0;
        return min > 0 && (Number(l.cantidad) || 0) <= min;
      }
      return true;
    });

    if (lotesCont) {
      if (!lotesFiltrados.length) {
        lotesCont.innerHTML = '<div class="empty-state">No hay lotes registrados para este filtro.</div>';
      } else {
        lotesCont.innerHTML = lotesFiltrados
          .map((l) => {
            const item = catalogo.find((c) => c.id === l.itemId);
            const dias = VetnovaRelations.diasHastaFecha(l.fechaVencimiento);
            const porVencer = dias !== null && dias <= VetnovaRelations.DIAS_ALERTA_VENCIMIENTO;
            const stockBajo =
              (Number(l.stockMinimo) || 0) > 0 &&
              (Number(l.cantidad) || 0) <= Number(l.stockMinimo);

            const badgeClase = porVencer || stockBajo ? "badge--warn" : "badge--ok";
            const estadoTexto = porVencer ? "Vence en " + dias + "d" : stockBajo ? "Stock bajo" : "OK";
            const nombreLote = item ? item.descripcion : l.descripcion || "Ítem";

            return (
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<strong class="data-card-title">' + escapar(nombreLote) + " — Lote " + escapar(l.codigoLote || "S/L") + "</strong>" +
                  '<span class="badge ' + badgeClase + '">' + escapar(estadoTexto) + "</span>" +
                "</div>" +
                '<p class="data-card-meta">Cantidad: <strong>' + l.cantidad + " " + escapar(l.unidad || "u") + "</strong> · Mínimo: " + (l.stockMinimo || 0) + " · Vencimiento: " + escapar(l.fechaVencimiento || "Sin fecha") + " · Costo unit.: " + escapar(VetnovaFunctions.formatearMoneda(l.costoUnitario)) + "</p>" +
                '<div class="data-card-actions">' +
                  '<button type="button" class="btn btn-secondary btn-sm" data-edit-lote="' + escapar(l.id) + '">Editar lote</button>' +
                  '<button type="button" class="btn btn-danger btn-sm" data-delete-lote="' + escapar(l.id) + '">Eliminar</button>' +
                "</div>" +
              "</div>"
            );
          })
          .join("");
      }
    }

    if (comprasCont) {
      if (!compras.length) {
        comprasCont.innerHTML = '<div class="empty-state">No hay compras a droguerías o distribuidoras registradas.</div>';
      } else {
        comprasCont.innerHTML = compras
          .map(
            (cp) =>
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<strong class="data-card-title">' + escapar(cp.proveedor) + " · " + escapar(cp.comprobanteRef || cp.id) + "</strong>" +
                  '<span class="badge badge--info">' + escapar(cp.fecha) + "</span>" +
                "</div>" +
                '<p class="data-card-meta">' + escapar(cp.descripcionItem) + " (Lote " + escapar(cp.codigoLote || "S/L") + ") · " + cp.cantidad + " " + escapar(cp.unidad) + " a " + escapar(VetnovaFunctions.formatearMoneda(cp.costoUnitario)) + " = <strong>" + escapar(VetnovaFunctions.formatearMoneda(cp.totalCompra)) + "</strong></p>" +
                '<div class="data-card-actions">' +
                  '<button type="button" class="btn btn-danger btn-sm" data-delete-compra="' + escapar(cp.id) + '">Eliminar</button>' +
                "</div>" +
              "</div>"
          )
          .join("");
      }
    }

    if (descuentosCont) {
      if (!descuentos.length) {
        descuentosCont.innerHTML = '<div class="empty-state">Aún no se registraron descuentos automáticos por servicios o venta fraccionada.</div>';
      } else {
        descuentosCont.innerHTML = descuentos
          .slice(0, 25)
          .map(
            (d) =>
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<strong class="data-card-title">-' + d.cantidad + " " + escapar(d.unidad) + " · " + escapar(d.nombreItem) + " (Lote " + escapar(d.codigoLote) + ")</strong>" +
                  '<span class="badge badge--warn">' + escapar(d.fecha) + " " + escapar(d.hora || "") + "</span>" +
                "</div>" +
                '<p class="data-card-meta">' + escapar(d.motivo || "Descuento automático") + "</p>" +
              "</div>"
          )
          .join("");
      }
    }
  }

  /* ------------------------------------------------------------------------
     SECCIÓN 6: FACTURACIÓN Y CAJA
     ------------------------------------------------------------------------ */

  function renderFacturacion() {
    const comprobantes = VetnovaStorage.leer(VetnovaStorage.keys.COMPROBANTES);
    const cierres = VetnovaStorage.leer(VetnovaStorage.keys.CIERRES_CAJA);
    const tutores = VetnovaStorage.leer(VetnovaStorage.keys.TUTORES);

    const compCont = document.getElementById("comprobantes-listado");
    const cobrosCont = document.getElementById("cobros-resumen-listado");
    const cierreActualCont = document.getElementById("cierre-caja-actual");
    const cierresHistCont = document.getElementById("cierres-caja-historial");

    if (compCont) {
      if (!comprobantes.length) {
        compCont.innerHTML = '<div class="empty-state">No hay comprobantes (orden de servicio/remito o factura) emitidos.</div>';
      } else {
        compCont.innerHTML = comprobantes
          .map((c) => {
            const tutor = tutores.find((t) => t.id === c.tutorId);
            const mediosStr =
              (c.pagos || [])
                .map((p) => p.medio + ": " + VetnovaFunctions.formatearMoneda(p.monto))
                .join(" · ") || "Sin cobro";
            const itemsStr =
              (c.items || [])
                .map((it) => (it.descripcion || it.itemId) + " x" + (it.cantidad || 1))
                .join(", ") || "Sin detalle";
            const badgeClase = c.estadoPago === "Pagado" ? "badge--ok" : "badge--warn";

            return (
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<strong class="data-card-title">' + escapar(c.numero) + " (" + escapar(c.tipoComprobante) + ") · " + escapar(c.fecha) + "</strong>" +
                  '<span class="badge ' + badgeClase + '">' + escapar(c.estadoPago) + "</span>" +
                "</div>" +
                '<p class="data-card-meta">Tutor: <strong>' + escapar(tutor ? tutor.nombre : "Consumidor final") + "</strong> · Ítems: " + escapar(itemsStr) + "</p>" +
                '<p class="data-card-meta">Medios: ' + escapar(mediosStr) + " · Total cobrado: <strong>" + escapar(VetnovaFunctions.formatearMoneda(c.totalCobrado)) + "</strong></p>" +
                '<div class="data-card-actions">' +
                  '<button type="button" class="btn btn-secondary btn-sm" data-editar-cobro="' + escapar(c.id) + '">Actualizar ingreso / cobro</button>' +
                  '<button type="button" class="btn btn-danger btn-sm" data-delete-comprobante="' + escapar(c.id) + '">Eliminar</button>' +
                "</div>" +
              "</div>"
            );
          })
          .join("");
      }
    }

    const resumenHoy = VetnovaFunctions.calcularResumenCajaFecha(VetnovaStorage.fechaHoyISO());

    if (cobrosCont) {
      cobrosCont.innerHTML =
        '<div class="data-card">' +
          '<div class="data-card-header">' +
            '<strong class="data-card-title">Desglose por medio de pago (' + escapar(resumenHoy.fecha) + ")</strong>" +
            '<span class="badge badge--ok">' + resumenHoy.cantidadComprobantes + " comprobantes</span>" +
          "</div>" +
          '<p class="data-card-meta">' +
            "Efectivo: <strong>" + escapar(VetnovaFunctions.formatearMoneda(resumenHoy.porMedio.Efectivo)) + "</strong> · " +
            "Débito: <strong>" + escapar(VetnovaFunctions.formatearMoneda(resumenHoy.porMedio["Tarjeta de débito"])) + "</strong> · " +
            "Crédito: <strong>" + escapar(VetnovaFunctions.formatearMoneda(resumenHoy.porMedio["Tarjeta de crédito"])) + "</strong> · " +
            "Transferencia: <strong>" + escapar(VetnovaFunctions.formatearMoneda(resumenHoy.porMedio.Transferencia)) + "</strong>" +
          "</p>" +
        "</div>";
    }

    if (cierreActualCont) {
      cierreActualCont.innerHTML =
        '<div class="data-card">' +
          '<span class="kpi-label">Ingresos del día</span>' +
          '<strong class="kpi-value">' + escapar(VetnovaFunctions.formatearMoneda(resumenHoy.totalIngresos)) + "</strong>" +
        "</div>" +
        '<div class="data-card">' +
          '<span class="kpi-label">Compras registradas hoy</span>' +
          '<strong class="kpi-value">' + escapar(VetnovaFunctions.formatearMoneda(resumenHoy.totalComprasDia)) + "</strong>" +
        "</div>" +
        '<div class="data-card">' +
          '<span class="kpi-label">Diferencia día (Ingresos - Compras)</span>' +
          '<strong class="kpi-value">' + escapar(VetnovaFunctions.formatearMoneda(resumenHoy.balanceNetoDia)) + "</strong>" +
        "</div>";
    }

    if (cierresHistCont) {
      if (!cierres.length) {
        cierresHistCont.innerHTML = '<div class="empty-state">No hay cierres de caja diarios guardados todavía.</div>';
      } else {
        cierresHistCont.innerHTML = cierres
          .map((cj) => {
            const obsHtml = cj.observaciones
              ? '<p class="data-card-meta">Obs: ' + escapar(cj.observaciones) + "</p>"
              : "";
            return (
              '<div class="data-card">' +
                '<div class="data-card-header">' +
                  '<strong class="data-card-title">Cierre ' + escapar(cj.fecha) + " (" + escapar(cj.horaCierre || "") + ")</strong>" +
                  '<span class="badge badge--ok">Cerrado</span>' +
                "</div>" +
                '<p class="data-card-meta">Saldo inicial: ' + escapar(VetnovaFunctions.formatearMoneda(cj.saldoInicial)) + " · Total ingresos: <strong>" + escapar(VetnovaFunctions.formatearMoneda(cj.totalIngresos)) + "</strong> · Efectivo esperado: <strong>" + escapar(VetnovaFunctions.formatearMoneda(cj.efectivoEsperado)) + "</strong></p>" +
                obsHtml +
              "</div>"
            );
          })
          .join("");
      }
    }
  }

  function renderTodo() {
    renderDashboard();
    renderClientes();
    renderCatalogo();
    renderTurnos();
    renderStock();
    renderFacturacion();
  }

  return {
    filtros,
    renderDashboard,
    renderClientes,
    renderCatalogo,
    renderTurnos,
    renderStock,
    renderFacturacion,
    renderTodo
  };
})();
