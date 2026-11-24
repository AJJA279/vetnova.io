/* ==========================================================================
   VETNOVA — CLÍNICA VETERINARIA
   functions.js: Operaciones CRUD y lógica de negocio de todas las secciones
   ========================================================================== */

const VetnovaFunctions = (() => {
  function registrarActividad(descripcion, seccion) {
    const actividad = VetnovaStorage.leer(VetnovaStorage.keys.ACTIVIDAD);
    actividad.unshift({
      id: VetnovaStorage.generarId("ACT"),
      fecha: VetnovaStorage.fechaHoyISO(),
      hora: new Date().toTimeString().slice(0, 5),
      seccion: seccion || "Sistema",
      descripcion: descripcion || ""
    });
    VetnovaStorage.guardar(VetnovaStorage.keys.ACTIVIDAD, actividad.slice(0, 40));
  }

  function formatearMoneda(monto) {
    const num = Number(monto) || 0;
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2
    }).format(num);
  }

  function descartarAlerta(alertaId) {
    if (!alertaId) return;
    const descartadas = VetnovaStorage.leer(VetnovaStorage.keys.ALERTAS_DESCARTADAS);
    if (!descartadas.includes(alertaId)) {
      descartadas.push(alertaId);
      VetnovaStorage.guardar(VetnovaStorage.keys.ALERTAS_DESCARTADAS, descartadas);
      registrarActividad("Alerta marcada como revisada (" + alertaId + ")", "Alertas");
    }
  }

  /* ------------------------------------------------------------------------
     SECCIÓN 2: TUTORES Y MASCOTAS
     ------------------------------------------------------------------------ */

  function guardarTutor(datos, idEdicion) {
    const tutores = VetnovaStorage.leer(VetnovaStorage.keys.TUTORES);
    const domiciliosLimpios = Array.isArray(datos.domicilios)
      ? datos.domicilios.map((d) => String(d || "").trim()).filter(Boolean)
      : [];

    if (idEdicion) {
      const idx = tutores.findIndex((t) => t.id === idEdicion);
      if (idx !== -1) {
        tutores[idx] = {
          ...tutores[idx],
          tipo: datos.tipo || "Particular",
          nombre: String(datos.nombre || "").trim(),
          telefono: String(datos.telefono || "").trim(),
          email: String(datos.email || "").trim(),
          documentoFiscal: String(datos.documentoFiscal || "").trim(),
          condicionFiscal: String(datos.condicionFiscal || "").trim(),
          domicilios: domiciliosLimpios,
          notas: String(datos.notas || "").trim()
        };
        VetnovaStorage.guardar(VetnovaStorage.keys.TUTORES, tutores);
        registrarActividad("Tutor actualizado: " + tutores[idx].nombre, "Clientes y Mascotas");
        return tutores[idx];
      }
    }

    const nuevoTutor = {
      id: VetnovaStorage.generarId("TUT"),
      tipo: datos.tipo || "Particular",
      nombre: String(datos.nombre || "").trim(),
      telefono: String(datos.telefono || "").trim(),
      email: String(datos.email || "").trim(),
      documentoFiscal: String(datos.documentoFiscal || "").trim(),
      condicionFiscal: String(datos.condicionFiscal || "").trim(),
      domicilios: domiciliosLimpios,
      notas: String(datos.notas || "").trim(),
      creadoEn: VetnovaStorage.fechaHoyISO()
    };

    tutores.push(nuevoTutor);
    VetnovaStorage.guardar(VetnovaStorage.keys.TUTORES, tutores);
    registrarActividad(
      "Nuevo tutor registrado: " + nuevoTutor.nombre + " (" + nuevoTutor.tipo + ")",
      "Clientes y Mascotas"
    );
    return nuevoTutor;
  }

  function eliminarTutor(tutorId) {
    const tutores = VetnovaStorage.leer(VetnovaStorage.keys.TUTORES);
    const tutor = tutores.find((t) => t.id === tutorId);
    const filtrados = tutores.filter((t) => t.id !== tutorId);
    VetnovaStorage.guardar(VetnovaStorage.keys.TUTORES, filtrados);

    const mascotas = VetnovaStorage.leer(VetnovaStorage.keys.MASCOTAS).filter(
      (m) => m.tutorId !== tutorId
    );
    VetnovaStorage.guardar(VetnovaStorage.keys.MASCOTAS, mascotas);

    if (tutor) {
      registrarActividad("Tutor eliminado: " + tutor.nombre, "Clientes y Mascotas");
    }
  }

  function guardarMascota(datos, idEdicion) {
    const mascotas = VetnovaStorage.leer(VetnovaStorage.keys.MASCOTAS);

    if (idEdicion) {
      const idx = mascotas.findIndex((m) => m.id === idEdicion);
      if (idx !== -1) {
        mascotas[idx] = {
          ...mascotas[idx],
          tutorId: datos.tutorId,
          nombre: String(datos.nombre || "").trim(),
          especie: String(datos.especie || "").trim(),
          raza: String(datos.raza || "").trim(),
          peso: datos.peso !== "" && datos.peso !== undefined ? Number(datos.peso) : "",
          alergias: String(datos.alergias || "").trim(),
          observaciones: String(datos.observaciones || "").trim(),
          tipoRefuerzo: String(datos.tipoRefuerzo || "").trim(),
          fechaRefuerzo: String(datos.fechaRefuerzo || "").trim()
        };
        VetnovaStorage.guardar(VetnovaStorage.keys.MASCOTAS, mascotas);
        registrarActividad("Mascota actualizada: " + mascotas[idx].nombre, "Clientes y Mascotas");
        return mascotas[idx];
      }
    }

    const nuevaMascota = {
      id: VetnovaStorage.generarId("MAS"),
      tutorId: datos.tutorId,
      nombre: String(datos.nombre || "").trim(),
      especie: String(datos.especie || "").trim(),
      raza: String(datos.raza || "").trim(),
      peso: datos.peso !== "" && datos.peso !== undefined ? Number(datos.peso) : "",
      alergias: String(datos.alergias || "").trim(),
      observaciones: String(datos.observaciones || "").trim(),
      tipoRefuerzo: String(datos.tipoRefuerzo || "").trim(),
      fechaRefuerzo: String(datos.fechaRefuerzo || "").trim(),
      creadoEn: VetnovaStorage.fechaHoyISO()
    };

    mascotas.push(nuevaMascota);
    VetnovaStorage.guardar(VetnovaStorage.keys.MASCOTAS, mascotas);
    registrarActividad(
      "Nueva mascota registrada: " + nuevaMascota.nombre + " (" + nuevaMascota.especie + ")",
      "Clientes y Mascotas"
    );
    return nuevaMascota;
  }

  function eliminarMascota(mascotaId) {
    const mascotas = VetnovaStorage.leer(VetnovaStorage.keys.MASCOTAS);
    const mascota = mascotas.find((m) => m.id === mascotaId);
    VetnovaStorage.guardar(
      VetnovaStorage.keys.MASCOTAS,
      mascotas.filter((m) => m.id !== mascotaId)
    );
    if (mascota) {
      registrarActividad("Mascota eliminada: " + mascota.nombre, "Clientes y Mascotas");
    }
  }

  function obtenerHistorialCliente(tutorId) {
    const turnos = VetnovaStorage.leer(VetnovaStorage.keys.TURNOS).filter(
      (t) => t.tutorId === tutorId
    );
    const pedidos = VetnovaStorage.leer(VetnovaStorage.keys.PEDIDOS).filter(
      (p) => p.tutorId === tutorId
    );
    const comprobantes = VetnovaStorage.leer(VetnovaStorage.keys.COMPROBANTES).filter(
      (c) => c.tutorId === tutorId
    );
    return { turnos, pedidos, comprobantes };
  }

  /* ------------------------------------------------------------------------
     SECCIÓN 3: CATÁLOGO, SERVICIOS, COMBOS E HISTORIAL DE PRECIOS
     ------------------------------------------------------------------------ */

  function registrarCambioPrecio(
    itemId,
    descripcionItem,
    costoAnterior,
    costoNuevo,
    precioAnterior,
    precioNuevo,
    motivo
  ) {
    const cambioCosto = Number(costoAnterior) !== Number(costoNuevo);
    const cambioPrecio = Number(precioAnterior) !== Number(precioNuevo);
    if (!cambioCosto && !cambioPrecio) return;

    const historial = VetnovaStorage.leer(VetnovaStorage.keys.HISTORIAL_PRECIOS);
    historial.unshift({
      id: VetnovaStorage.generarId("PRC"),
      fecha: VetnovaStorage.fechaHoyISO(),
      itemId,
      descripcionItem,
      costoAnterior: Number(costoAnterior) || 0,
      costoNuevo: Number(costoNuevo) || 0,
      precioAnterior: Number(precioAnterior) || 0,
      precioNuevo: Number(precioNuevo) || 0,
      motivo: motivo || "Actualización de ficha"
    });
    VetnovaStorage.guardar(VetnovaStorage.keys.HISTORIAL_PRECIOS, historial);
  }

  function guardarItemCatalogo(datos, idEdicion) {
    const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);
    const costoNum = Number(datos.costo) || 0;
    const precioNum = Number(datos.precio) || 0;
    const presentaciones = Array.isArray(datos.presentaciones) ? datos.presentaciones : [];
    const insumosAsociados = Array.isArray(datos.insumosAsociados) ? datos.insumosAsociados : [];

    if (idEdicion) {
      const idx = catalogo.findIndex((c) => c.id === idEdicion);
      if (idx !== -1) {
        const previo = catalogo[idx];
        catalogo[idx] = {
          ...previo,
          codigo: String(datos.codigo || "").trim(),
          descripcion: String(datos.descripcion || "").trim(),
          categoria: datos.categoria || "Alimentos balanceados",
          presentaciones,
          costo: costoNum,
          precio: precioNum,
          insumosAsociados,
          duracionEstimada: Number(datos.duracionEstimada) || 0,
          sector: datos.sector || "Salón de ventas",
          estado: datos.estado || "Activo",
          stockMinimo: Number(datos.stockMinimo) || 0,
          unidadBase: String(datos.unidadBase || "u").trim()
        };
        VetnovaStorage.guardar(VetnovaStorage.keys.CATALOGO, catalogo);
        registrarCambioPrecio(
          catalogo[idx].id,
          catalogo[idx].descripcion,
          previo.costo,
          costoNum,
          previo.precio,
          precioNum,
          "Edición manual de ítem"
        );
        registrarActividad(
          "Ítem de catálogo actualizado: " + catalogo[idx].descripcion,
          "Catálogo y Servicios"
        );
        return catalogo[idx];
      }
    }

    const nuevoItem = {
      id: VetnovaStorage.generarId("ITM"),
      codigo: String(datos.codigo || "").trim(),
      descripcion: String(datos.descripcion || "").trim(),
      categoria: datos.categoria || "Alimentos balanceados",
      presentaciones,
      costo: costoNum,
      precio: precioNum,
      insumosAsociados,
      duracionEstimada: Number(datos.duracionEstimada) || 0,
      sector: datos.sector || "Salón de ventas",
      estado: datos.estado || "Activo",
      stockMinimo: Number(datos.stockMinimo) || 0,
      unidadBase: String(datos.unidadBase || "u").trim(),
      creadoEn: VetnovaStorage.fechaHoyISO()
    };

    catalogo.push(nuevoItem);
    VetnovaStorage.guardar(VetnovaStorage.keys.CATALOGO, catalogo);
    registrarCambioPrecio(
      nuevoItem.id,
      nuevoItem.descripcion,
      0,
      costoNum,
      0,
      precioNum,
      "Alta inicial de ítem"
    );
    registrarActividad("Nuevo ítem en catálogo: " + nuevoItem.descripcion, "Catálogo y Servicios");
    return nuevoItem;
  }

  function eliminarItemCatalogo(itemId) {
    const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);
    const item = catalogo.find((c) => c.id === itemId);
    VetnovaStorage.guardar(
      VetnovaStorage.keys.CATALOGO,
      catalogo.filter((c) => c.id !== itemId)
    );
    if (item) {
      registrarActividad("Ítem eliminado del catálogo: " + item.descripcion, "Catálogo y Servicios");
    }
  }

  function guardarCombo(datos, idEdicion) {
    const combos = VetnovaStorage.leer(VetnovaStorage.keys.COMBOS);
    const componentes = Array.isArray(datos.componentes) ? datos.componentes : [];

    if (idEdicion) {
      const idx = combos.findIndex((cb) => cb.id === idEdicion);
      if (idx !== -1) {
        combos[idx] = {
          ...combos[idx],
          nombre: String(datos.nombre || "").trim(),
          descripcion: String(datos.descripcion || "").trim(),
          precioPromocional: Number(datos.precioPromocional) || 0,
          estado: datos.estado || "Activo",
          componentes
        };
        VetnovaStorage.guardar(VetnovaStorage.keys.COMBOS, combos);
        registrarActividad("Combo actualizado: " + combos[idx].nombre, "Catálogo y Servicios");
        return combos[idx];
      }
    }

    const nuevoCombo = {
      id: VetnovaStorage.generarId("CMB"),
      nombre: String(datos.nombre || "").trim(),
      descripcion: String(datos.descripcion || "").trim(),
      precioPromocional: Number(datos.precioPromocional) || 0,
      estado: datos.estado || "Activo",
      componentes,
      creadoEn: VetnovaStorage.fechaHoyISO()
    };

    combos.push(nuevoCombo);
    VetnovaStorage.guardar(VetnovaStorage.keys.COMBOS, combos);
    registrarActividad("Nuevo combo promocional: " + nuevoCombo.nombre, "Catálogo y Servicios");
    return nuevoCombo;
  }

  function eliminarCombo(comboId) {
    const combos = VetnovaStorage.leer(VetnovaStorage.keys.COMBOS);
    const combo = combos.find((cb) => cb.id === comboId);
    VetnovaStorage.guardar(
      VetnovaStorage.keys.COMBOS,
      combos.filter((cb) => cb.id !== comboId)
    );
    if (combo) {
      registrarActividad("Combo eliminado: " + combo.nombre, "Catálogo y Servicios");
    }
  }

  /* ------------------------------------------------------------------------
     SECCIÓN 4: BOXES, TURNOS Y PEDIDOS
     ------------------------------------------------------------------------ */

  function guardarBox(datos, idEdicion) {
    const boxes = VetnovaStorage.leer(VetnovaStorage.keys.BOXES);

    if (idEdicion) {
      const idx = boxes.findIndex((b) => b.id === idEdicion);
      if (idx !== -1) {
        boxes[idx] = {
          ...boxes[idx],
          nombre: String(datos.nombre || "").trim(),
          sector: datos.sector || "Consultorio",
          estado: datos.estado || "Libre",
          detalleActual: String(datos.detalleActual || "").trim()
        };
        VetnovaStorage.guardar(VetnovaStorage.keys.BOXES, boxes);
        registrarActividad(
          "Box actualizado: " + boxes[idx].nombre + " (" + boxes[idx].estado + ")",
          "Turnos, Boxes y Pedidos"
        );
        return boxes[idx];
      }
    }

    const nuevoBox = {
      id: VetnovaStorage.generarId("BOX"),
      nombre: String(datos.nombre || "").trim(),
      sector: datos.sector || "Consultorio",
      estado: datos.estado || "Libre",
      detalleActual: String(datos.detalleActual || "").trim()
    };

    boxes.push(nuevoBox);
    VetnovaStorage.guardar(VetnovaStorage.keys.BOXES, boxes);
    registrarActividad("Nuevo box creado: " + nuevoBox.nombre, "Turnos, Boxes y Pedidos");
    return nuevoBox;
  }

  function cambiarEstadoBox(boxId, nuevoEstado, detalleActual) {
    const boxes = VetnovaStorage.leer(VetnovaStorage.keys.BOXES);
    const idx = boxes.findIndex((b) => b.id === boxId);
    if (idx === -1) return null;
    boxes[idx].estado = nuevoEstado;
    boxes[idx].detalleActual =
      nuevoEstado === "Libre" ? "" : detalleActual || boxes[idx].detalleActual;
    VetnovaStorage.guardar(VetnovaStorage.keys.BOXES, boxes);
    registrarActividad(
      'Box "' + boxes[idx].nombre + '" pasó a ' + nuevoEstado,
      "Turnos, Boxes y Pedidos"
    );
    return boxes[idx];
  }

  function eliminarBox(boxId) {
    const boxes = VetnovaStorage.leer(VetnovaStorage.keys.BOXES);
    const box = boxes.find((b) => b.id === boxId);
    VetnovaStorage.guardar(
      VetnovaStorage.keys.BOXES,
      boxes.filter((b) => b.id !== boxId)
    );
    if (box) {
      registrarActividad("Box eliminado: " + box.nombre, "Turnos, Boxes y Pedidos");
    }
  }

  function guardarTurno(datos, idEdicion) {
    const turnos = VetnovaStorage.leer(VetnovaStorage.keys.TURNOS);

    if (idEdicion) {
      const idx = turnos.findIndex((t) => t.id === idEdicion);
      if (idx !== -1) {
        turnos[idx] = {
          ...turnos[idx],
          tipo: datos.tipo || "Consulta",
          fecha: datos.fecha || VetnovaStorage.fechaHoyISO(),
          hora: datos.hora || "09:00",
          tutorId: datos.tutorId || "",
          mascotaId: datos.mascotaId || "",
          servicioId: datos.servicioId || "",
          boxId: datos.boxId || "",
          estado: datos.estado || "Confirmado",
          observaciones: String(datos.observaciones || "").trim()
        };
        VetnovaStorage.guardar(VetnovaStorage.keys.TURNOS, turnos);
        registrarActividad(
          "Turno actualizado (" +
            turnos[idx].tipo +
            " · " +
            turnos[idx].fecha +
            " " +
            turnos[idx].hora +
            ")",
          "Turnos, Boxes y Pedidos"
        );
        return turnos[idx];
      }
    }

    const nuevoTurno = {
      id: VetnovaStorage.generarId("TRN"),
      tipo: datos.tipo || "Consulta",
      fecha: datos.fecha || VetnovaStorage.fechaHoyISO(),
      hora: datos.hora || "09:00",
      tutorId: datos.tutorId || "",
      mascotaId: datos.mascotaId || "",
      servicioId: datos.servicioId || "",
      boxId: datos.boxId || "",
      estado: datos.estado || "Confirmado",
      observaciones: String(datos.observaciones || "").trim()
    };

    turnos.push(nuevoTurno);
    VetnovaStorage.guardar(VetnovaStorage.keys.TURNOS, turnos);
    registrarActividad(
      "Nuevo turno agendado: " +
        nuevoTurno.tipo +
        " (" +
        nuevoTurno.fecha +
        " " +
        nuevoTurno.hora +
        ")",
      "Turnos, Boxes y Pedidos"
    );
    return nuevoTurno;
  }

  function eliminarTurno(turnoId) {
    const turnos = VetnovaStorage.leer(VetnovaStorage.keys.TURNOS);
    const turno = turnos.find((t) => t.id === turnoId);
    VetnovaStorage.guardar(
      VetnovaStorage.keys.TURNOS,
      turnos.filter((t) => t.id !== turnoId)
    );
    if (turno) {
      registrarActividad(
        "Turno eliminado (" + turno.tipo + " · " + turno.fecha + ")",
        "Turnos, Boxes y Pedidos"
      );
    }
  }

  function guardarPedido(datos, idEdicion) {
    const pedidos = VetnovaStorage.leer(VetnovaStorage.keys.PEDIDOS);

    if (idEdicion) {
      const idx = pedidos.findIndex((p) => p.id === idEdicion);
      if (idx !== -1) {
        pedidos[idx] = {
          ...pedidos[idx],
          modalidad: datos.modalidad || "Mostrador",
          tutorId: datos.tutorId || "",
          domicilioEntrega: String(datos.domicilioEntrega || "").trim(),
          sector: datos.sector || "Salón de ventas",
          detalleItems: String(datos.detalleItems || "").trim(),
          totalEstimado: Number(datos.totalEstimado) || 0,
          estado: datos.estado || "En espera",
          notas: String(datos.notas || "").trim()
        };
        VetnovaStorage.guardar(VetnovaStorage.keys.PEDIDOS, pedidos);
        registrarActividad(
          "Pedido " + pedidos[idx].numero + " actualizado (" + pedidos[idx].estado + ")",
          "Turnos, Boxes y Pedidos"
        );
        return pedidos[idx];
      }
    }

    const correlativo = String(pedidos.length + 1).padStart(4, "0");
    const nuevoPedido = {
      id: VetnovaStorage.generarId("PED"),
      numero: "PED-" + correlativo,
      fecha: VetnovaStorage.fechaHoyISO(),
      modalidad: datos.modalidad || "Mostrador",
      tutorId: datos.tutorId || "",
      domicilioEntrega: String(datos.domicilioEntrega || "").trim(),
      sector: datos.sector || "Salón de ventas",
      detalleItems: String(datos.detalleItems || "").trim(),
      totalEstimado: Number(datos.totalEstimado) || 0,
      estado: datos.estado || "En espera",
      notas: String(datos.notas || "").trim()
    };

    pedidos.push(nuevoPedido);
    VetnovaStorage.guardar(VetnovaStorage.keys.PEDIDOS, pedidos);
    registrarActividad(
      "Nuevo pedido " +
        nuevoPedido.numero +
        " (" +
        nuevoPedido.modalidad +
        " · " +
        nuevoPedido.sector +
        ")",
      "Turnos, Boxes y Pedidos"
    );
    return nuevoPedido;
  }

  function cambiarEstadoPedido(pedidoId, nuevoEstado) {
    const pedidos = VetnovaStorage.leer(VetnovaStorage.keys.PEDIDOS);
    const idx = pedidos.findIndex((p) => p.id === pedidoId);
    if (idx === -1) return null;
    pedidos[idx].estado = nuevoEstado;
    VetnovaStorage.guardar(VetnovaStorage.keys.PEDIDOS, pedidos);
    registrarActividad(
      "Pedido " + pedidos[idx].numero + ' cambió a "' + nuevoEstado + '"',
      "Turnos, Boxes y Pedidos"
    );
    return pedidos[idx];
  }

  function eliminarPedido(pedidoId) {
    const pedidos = VetnovaStorage.leer(VetnovaStorage.keys.PEDIDOS);
    const pedido = pedidos.find((p) => p.id === pedidoId);
    VetnovaStorage.guardar(
      VetnovaStorage.keys.PEDIDOS,
      pedidos.filter((p) => p.id !== pedidoId)
    );
    if (pedido) {
      registrarActividad("Pedido " + pedido.numero + " eliminado", "Turnos, Boxes y Pedidos");
    }
  }

  /* ------------------------------------------------------------------------
     SECCIÓN 5: LOTES, COMPRAS Y STOCK
     ------------------------------------------------------------------------ */

  function guardarLote(datos, idEdicion) {
    const lotes = VetnovaStorage.leer(VetnovaStorage.keys.LOTES);
    const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);
    const item = catalogo.find((c) => c.id === datos.itemId);

    if (idEdicion) {
      const idx = lotes.findIndex((l) => l.id === idEdicion);
      if (idx !== -1) {
        lotes[idx] = {
          ...lotes[idx],
          itemId: datos.itemId,
          descripcion: item ? item.descripcion : String(datos.descripcion || "").trim(),
          codigoLote: String(datos.codigoLote || "").trim(),
          cantidad: Number(datos.cantidad) || 0,
          unidad: String(datos.unidad || (item && item.unidadBase) || "u").trim(),
          stockMinimo: Number(datos.stockMinimo) || 0,
          fechaVencimiento: String(datos.fechaVencimiento || "").trim(),
          costoUnitario: Number(datos.costoUnitario) || 0
        };
        VetnovaStorage.guardar(VetnovaStorage.keys.LOTES, lotes);
        registrarActividad(
          "Lote actualizado: " + (lotes[idx].codigoLote || lotes[idx].id),
          "Stock, Compras y Lotes"
        );
        return lotes[idx];
      }
    }

    const nuevoLote = {
      id: VetnovaStorage.generarId("LOT"),
      itemId: datos.itemId,
      descripcion: item ? item.descripcion : String(datos.descripcion || "").trim(),
      codigoLote: String(datos.codigoLote || "").trim(),
      cantidad: Number(datos.cantidad) || 0,
      unidad: String(datos.unidad || (item && item.unidadBase) || "u").trim(),
      stockMinimo: Number(datos.stockMinimo) || 0,
      fechaVencimiento: String(datos.fechaVencimiento || "").trim(),
      costoUnitario: Number(datos.costoUnitario) || 0,
      creadoEn: VetnovaStorage.fechaHoyISO()
    };

    lotes.push(nuevoLote);
    VetnovaStorage.guardar(VetnovaStorage.keys.LOTES, lotes);
    registrarActividad(
      "Nuevo lote registrado: " +
        nuevoLote.descripcion +
        " (" +
        nuevoLote.cantidad +
        " " +
        nuevoLote.unidad +
        ")",
      "Stock, Compras y Lotes"
    );
    return nuevoLote;
  }

  function eliminarLote(loteId) {
    const lotes = VetnovaStorage.leer(VetnovaStorage.keys.LOTES);
    const lote = lotes.find((l) => l.id === loteId);
    VetnovaStorage.guardar(
      VetnovaStorage.keys.LOTES,
      lotes.filter((l) => l.id !== loteId)
    );
    if (lote) {
      registrarActividad(
        "Lote eliminado (" + (lote.codigoLote || lote.descripcion) + ")",
        "Stock, Compras y Lotes"
      );
    }
  }

  function registrarCompraProveedor(datos) {
    const compras = VetnovaStorage.leer(VetnovaStorage.keys.COMPRAS);
    const lotes = VetnovaStorage.leer(VetnovaStorage.keys.LOTES);
    const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);

    const cantidad = Number(datos.cantidad) || 0;
    const costoUnitario = Number(datos.costoUnitario) || 0;
    const totalCompra = Number((cantidad * costoUnitario).toFixed(2));
    const item = catalogo.find((c) => c.id === datos.itemId);

    const nuevoLote = {
      id: VetnovaStorage.generarId("LOT"),
      itemId: datos.itemId,
      descripcion: item ? item.descripcion : String(datos.descripcionItem || "").trim(),
      codigoLote: String(datos.codigoLote || "").trim(),
      cantidad,
      unidad: String(datos.unidad || (item && item.unidadBase) || "u").trim(),
      stockMinimo:
        Number(datos.stockMinimo) || (item ? Number(item.stockMinimo) || 0 : 0),
      fechaVencimiento: String(datos.fechaVencimiento || "").trim(),
      costoUnitario,
      creadoEn: datos.fecha || VetnovaStorage.fechaHoyISO()
    };

    lotes.push(nuevoLote);
    VetnovaStorage.guardar(VetnovaStorage.keys.LOTES, lotes);

    if (item && costoUnitario > 0) {
      const idxCat = catalogo.findIndex((c) => c.id === item.id);
      if (idxCat !== -1) {
        const costoAnterior = catalogo[idxCat].costo;
        catalogo[idxCat].costo = costoUnitario;
        VetnovaStorage.guardar(VetnovaStorage.keys.CATALOGO, catalogo);
        registrarCambioPrecio(
          item.id,
          item.descripcion,
          costoAnterior,
          costoUnitario,
          item.precio,
          item.precio,
          "Compra a " + (datos.proveedor || "Proveedor")
        );
      }
    }

    const nuevaCompra = {
      id: VetnovaStorage.generarId("CMP"),
      fecha: datos.fecha || VetnovaStorage.fechaHoyISO(),
      proveedor: String(datos.proveedor || "").trim(),
      tipoProveedor: datos.tipoProveedor || "Droguería / Distribuidora",
      comprobanteRef: String(datos.comprobanteRef || "").trim(),
      itemId: datos.itemId,
      descripcionItem: nuevoLote.descripcion,
      codigoLote: nuevoLote.codigoLote,
      cantidad,
      unidad: nuevoLote.unidad,
      costoUnitario,
      totalCompra,
      loteId: nuevoLote.id
    };

    compras.unshift(nuevaCompra);
    VetnovaStorage.guardar(VetnovaStorage.keys.COMPRAS, compras);
    registrarActividad(
      "Compra registrada a " +
        nuevaCompra.proveedor +
        ": " +
        nuevaCompra.descripcionItem +
        " (" +
        cantidad +
        " " +
        nuevaCompra.unidad +
        ")",
      "Stock, Compras y Lotes"
    );
    return nuevaCompra;
  }

  function eliminarCompra(compraId) {
    const compras = VetnovaStorage.leer(VetnovaStorage.keys.COMPRAS);
    const compra = compras.find((c) => c.id === compraId);
    VetnovaStorage.guardar(
      VetnovaStorage.keys.COMPRAS,
      compras.filter((c) => c.id !== compraId)
    );
    if (compra) {
      registrarActividad(
        "Compra " + (compra.comprobanteRef || compra.id) + " eliminada",
        "Stock, Compras y Lotes"
      );
    }
  }

  /* ------------------------------------------------------------------------
     SECCIÓN 6: FACTURACIÓN, COBROS MULTIMEDIOS Y CIERRE DE CAJA
     ------------------------------------------------------------------------ */

  function guardarComprobante(datos, idEdicion) {
    const comprobantes = VetnovaStorage.leer(VetnovaStorage.keys.COMPROBANTES);
    const pagos = Array.isArray(datos.pagos) ? datos.pagos : [];
    const totalCobrado = pagos.reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
    const totalComprobante =
      Number(datos.totalComprobante) > 0 ? Number(datos.totalComprobante) : totalCobrado;

    let estadoPago = "Pagado";
    if (totalCobrado <= 0) {
      estadoPago = "Pendiente";
    } else if (totalCobrado < totalComprobante) {
      estadoPago = "Pago parcial";
    }

    if (idEdicion) {
      const idx = comprobantes.findIndex((c) => c.id === idEdicion);
      if (idx !== -1) {
        comprobantes[idx] = {
          ...comprobantes[idx],
          tipoComprobante: datos.tipoComprobante || "Factura",
          fecha: datos.fecha || comprobantes[idx].fecha,
          tutorId: datos.tutorId || "",
          mascotaId: datos.mascotaId || "",
          items: Array.isArray(datos.items) ? datos.items : comprobantes[idx].items,
          pagos,
          totalComprobante,
          totalCobrado,
          estadoPago,
          observaciones: String(datos.observaciones || "").trim()
        };
        VetnovaStorage.guardar(VetnovaStorage.keys.COMPROBANTES, comprobantes);
        registrarActividad(
          "Comprobante " +
            comprobantes[idx].numero +
            " actualizado (" +
            formatearMoneda(totalCobrado) +
            ")",
          "Facturación y Caja"
        );
        return comprobantes[idx];
      }
    }

    const correlativo = String(comprobantes.length + 1).padStart(4, "0");
    const prefijo = datos.tipoComprobante === "Factura" ? "FAC" : "OSR";
    const nuevoComprobante = {
      id: VetnovaStorage.generarId("CMPB"),
      numero: prefijo + "-" + correlativo,
      tipoComprobante: datos.tipoComprobante || "Factura",
      fecha: datos.fecha || VetnovaStorage.fechaHoyISO(),
      tutorId: datos.tutorId || "",
      mascotaId: datos.mascotaId || "",
      items: Array.isArray(datos.items) ? datos.items : [],
      pagos,
      totalComprobante,
      totalCobrado,
      estadoPago,
      estado: "Emitido",
      observaciones: String(datos.observaciones || "").trim()
    };

    comprobantes.unshift(nuevoComprobante);
    VetnovaStorage.guardar(VetnovaStorage.keys.COMPROBANTES, comprobantes);

    if (datos.descontarStock !== false) {
      VetnovaRelations.aplicarDescuentosPorComprobante(nuevoComprobante);
    }

    registrarActividad(
      "Comprobante " +
        nuevoComprobante.numero +
        " emitido por " +
        formatearMoneda(totalCobrado) +
        " (" +
        estadoPago +
        ")",
      "Facturación y Caja"
    );
    return nuevoComprobante;
  }

  function actualizarPagosComprobante(comprobanteId, nuevosPagos) {
    const comprobantes = VetnovaStorage.leer(VetnovaStorage.keys.COMPROBANTES);
    const idx = comprobantes.findIndex((c) => c.id === comprobanteId);
    if (idx === -1) return null;

    const pagosLimpios = Array.isArray(nuevosPagos) ? nuevosPagos : [];
    const totalCobrado = pagosLimpios.reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
    const totalComprobante = Math.max(Number(comprobantes[idx].totalComprobante) || 0, totalCobrado);

    let estadoPago = "Pagado";
    if (totalCobrado <= 0) {
      estadoPago = "Pendiente";
    } else if (totalCobrado < totalComprobante) {
      estadoPago = "Pago parcial";
    }

    comprobantes[idx].pagos = pagosLimpios;
    comprobantes[idx].totalComprobante = totalComprobante;
    comprobantes[idx].totalCobrado = totalCobrado;
    comprobantes[idx].estadoPago = estadoPago;

    VetnovaStorage.guardar(VetnovaStorage.keys.COMPROBANTES, comprobantes);
    registrarActividad(
      "Ingreso/cobro actualizado en " +
        comprobantes[idx].numero +
        ": " +
        formatearMoneda(totalCobrado),
      "Facturación y Caja"
    );
    return comprobantes[idx];
  }

  function eliminarComprobante(comprobanteId) {
    const comprobantes = VetnovaStorage.leer(VetnovaStorage.keys.COMPROBANTES);
    const comp = comprobantes.find((c) => c.id === comprobanteId);
    VetnovaStorage.guardar(
      VetnovaStorage.keys.COMPROBANTES,
      comprobantes.filter((c) => c.id !== comprobanteId)
    );
    if (comp) {
      registrarActividad("Comprobante " + comp.numero + " eliminado", "Facturación y Caja");
    }
  }

  function calcularResumenCajaFecha(fechaISO) {
    const fechaTarget = fechaISO || VetnovaStorage.fechaHoyISO();
    const comprobantes = VetnovaStorage.leer(VetnovaStorage.keys.COMPROBANTES).filter(
      (c) => c.fecha === fechaTarget && c.estado !== "Anulado"
    );
    const compras = VetnovaStorage.leer(VetnovaStorage.keys.COMPRAS).filter(
      (cp) => cp.fecha === fechaTarget
    );

    const porMedio = {
      Efectivo: 0,
      "Tarjeta de débito": 0,
      "Tarjeta de crédito": 0,
      Transferencia: 0,
      Otro: 0
    };

    let totalIngresos = 0;

    comprobantes.forEach((comp) => {
      (comp.pagos || []).forEach((pago) => {
        const monto = Number(pago.monto) || 0;
        const medio = porMedio[pago.medio] !== undefined ? pago.medio : "Otro";
        porMedio[medio] = Number((porMedio[medio] + monto).toFixed(2));
        totalIngresos = Number((totalIngresos + monto).toFixed(2));
      });
    });

    const totalComprasDia = compras.reduce((acc, cp) => acc + (Number(cp.totalCompra) || 0), 0);

    return {
      fecha: fechaTarget,
      cantidadComprobantes: comprobantes.length,
      porMedio,
      totalIngresos,
      totalComprasDia,
      balanceNetoDia: Number((totalIngresos - totalComprasDia).toFixed(2))
    };
  }

  function registrarCierreCaja(datos) {
    const cierres = VetnovaStorage.leer(VetnovaStorage.keys.CIERRES_CAJA);
    const fecha = datos.fecha || VetnovaStorage.fechaHoyISO();
    const resumen = calcularResumenCajaFecha(fecha);
    const saldoInicial = Number(datos.saldoInicial) || 0;

    const nuevoCierre = {
      id: VetnovaStorage.generarId("CJ"),
      fecha,
      horaCierre: new Date().toTimeString().slice(0, 5),
      saldoInicial,
      totalIngresos: resumen.totalIngresos,
      totalComprasDia: resumen.totalComprasDia,
      efectivoEsperado: Number((saldoInicial + resumen.porMedio.Efectivo).toFixed(2)),
      porMedio: resumen.porMedio,
      observaciones: String(datos.observaciones || "").trim()
    };

    cierres.unshift(nuevoCierre);
    VetnovaStorage.guardar(VetnovaStorage.keys.CIERRES_CAJA, cierres);
    registrarActividad(
      "Cierre de caja registrado (" +
        fecha +
        ") · Total: " +
        formatearMoneda(nuevoCierre.totalIngresos),
      "Facturación y Caja"
    );
    return nuevoCierre;
  }

  return {
    registrarActividad,
    formatearMoneda,
    descartarAlerta,
    guardarTutor,
    eliminarTutor,
    guardarMascota,
    eliminarMascota,
    obtenerHistorialCliente,
    guardarItemCatalogo,
    eliminarItemCatalogo,
    guardarCombo,
    eliminarCombo,
    guardarBox,
    cambiarEstadoBox,
    eliminarBox,
    guardarTurno,
    eliminarTurno,
    guardarPedido,
    cambiarEstadoPedido,
    eliminarPedido,
    guardarLote,
    eliminarLote,
    registrarCompraProveedor,
    eliminarCompra,
    guardarComprobante,
    actualizarPagosComprobante,
    eliminarComprobante,
    calcularResumenCajaFecha,
    registrarCierreCaja
  };
})();