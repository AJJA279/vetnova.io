/* ==========================================================================
   VETNOVA — CLÍNICA VETERINARIA
   relations.js: Motor de reglas de negocio, alertas y conexiones entre secciones
   ========================================================================== */

const VetnovaRelations = (() => {
  const DIAS_ALERTA_VENCIMIENTO = 15;
  const HORAS_ALERTA_TURNOS = 24;

  function parsearFechaLocal(fechaStr) {
    if (!fechaStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
      const partes = fechaStr.split("-").map(Number);
      return new Date(partes[0], partes[1] - 1, partes[2], 0, 0, 0, 0);
    }
    const dt = new Date(fechaStr);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  function diasHastaFecha(fechaStr) {
    const objetivo = parsearFechaLocal(fechaStr);
    if (!objetivo) return null;
    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0, 0);
    const inicioObjetivo = new Date(
      objetivo.getFullYear(),
      objetivo.getMonth(),
      objetivo.getDate(),
      0,
      0,
      0,
      0
    );
    const diffMs = inicioObjetivo.getTime() - inicioHoy.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  function horasHastaTurno(fechaStr, horaStr) {
    if (!fechaStr) return null;
    const partesFecha = fechaStr.split("-").map(Number);
    const partesHora = String(horaStr || "00:00").split(":").map(Number);
    const y = partesFecha[0];
    const m = partesFecha[1];
    const d = partesFecha[2];
    const hh = Number.isNaN(partesHora[0]) ? 0 : partesHora[0];
    const mm = Number.isNaN(partesHora[1]) ? 0 : partesHora[1];

    if (!y || !m || !d) return null;
    const cita = new Date(y, m - 1, d, hh, mm, 0, 0);
    const ahora = new Date();
    return (cita.getTime() - ahora.getTime()) / (1000 * 60 * 60);
  }

  function obtenerStockTotalPorItem(itemId) {
    const lotes = VetnovaStorage.leer(VetnovaStorage.keys.LOTES);
    return lotes
      .filter((lote) => lote.itemId === itemId)
      .reduce((acc, lote) => acc + (Number(lote.cantidad) || 0), 0);
  }

  function obtenerAlertasVencimiento() {
    const lotes = VetnovaStorage.leer(VetnovaStorage.keys.LOTES);
    const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);
    const descartadas = VetnovaStorage.leer(VetnovaStorage.keys.ALERTAS_DESCARTADAS);

    return lotes
      .map((lote) => {
        const dias = diasHastaFecha(lote.fechaVencimiento);
        if (dias === null || dias > DIAS_ALERTA_VENCIMIENTO) return null;

        const alertaId = "venc-" + lote.id;
        if (descartadas.includes(alertaId)) return null;

        const item = catalogo.find((c) => c.id === lote.itemId);
        return {
          alertaId,
          tipo: "vencimiento",
          loteId: lote.id,
          itemId: lote.itemId,
          codigoLote: lote.codigoLote || "S/L",
          nombreItem: item ? item.descripcion : lote.descripcion || "Ítem sin nombre",
          categoria: item ? item.categoria : lote.categoria || "",
          cantidad: Number(lote.cantidad) || 0,
          unidad: lote.unidad || "u",
          fechaVencimiento: lote.fechaVencimiento,
          diasRestantes: dias,
          vencido: dias < 0
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  }

  function obtenerAlertasStockMinimo() {
    const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);
    const lotes = VetnovaStorage.leer(VetnovaStorage.keys.LOTES);
    const descartadas = VetnovaStorage.leer(VetnovaStorage.keys.ALERTAS_DESCARTADAS);
    const alertas = [];

    catalogo.forEach((item) => {
      const minimo = Number(item.stockMinimo);
      if (Number.isNaN(minimo) || minimo <= 0) return;

      const stockActual = obtenerStockTotalPorItem(item.id);
      if (stockActual <= minimo) {
        const alertaId = "stock-item-" + item.id;
        if (!descartadas.includes(alertaId)) {
          alertas.push({
            alertaId,
            tipo: "stock_minimo",
            itemId: item.id,
            codigo: item.codigo || "",
            nombreItem: item.descripcion,
            sector: item.sector || "",
            stockActual,
            stockMinimo: minimo,
            unidad: item.unidadBase || "u"
          });
        }
      }
    });

    lotes.forEach((lote) => {
      const minimoLote = Number(lote.stockMinimo);
      const cantLote = Number(lote.cantidad) || 0;
      if (!Number.isNaN(minimoLote) && minimoLote > 0 && cantLote <= minimoLote) {
        const yaCubierto = alertas.some((a) => a.itemId === lote.itemId);
        if (!yaCubierto) {
          const alertaId = "stock-lote-" + lote.id;
          if (!descartadas.includes(alertaId)) {
            const item = catalogo.find((c) => c.id === lote.itemId);
            const nombreBase = item ? item.descripcion : lote.descripcion || "Lote";
            alertas.push({
              alertaId,
              tipo: "stock_minimo",
              loteId: lote.id,
              itemId: lote.itemId,
              codigo: item ? item.codigo : lote.codigoLote || "",
              nombreItem: nombreBase + " (Lote " + (lote.codigoLote || "S/L") + ")",
              sector: item ? item.sector : "",
              stockActual: cantLote,
              stockMinimo: minimoLote,
              unidad: lote.unidad || "u"
            });
          }
        }
      }
    });

    return alertas;
  }

  function obtenerTurnosProximas24Horas() {
    const turnos = VetnovaStorage.leer(VetnovaStorage.keys.TURNOS);
    const tutores = VetnovaStorage.leer(VetnovaStorage.keys.TUTORES);
    const mascotas = VetnovaStorage.leer(VetnovaStorage.keys.MASCOTAS);
    const boxes = VetnovaStorage.leer(VetnovaStorage.keys.BOXES);

    return turnos
      .filter((t) => t.estado !== "Cancelado" && t.estado !== "Completado")
      .map((turno) => {
        const horas = horasHastaTurno(turno.fecha, turno.hora);
        if (horas === null || horas < -2 || horas > HORAS_ALERTA_TURNOS) return null;

        const tutor = tutores.find((x) => x.id === turno.tutorId);
        const mascota = mascotas.find((m) => m.id === turno.mascotaId);
        const box = boxes.find((b) => b.id === turno.boxId);

        return {
          ...turno,
          horasRestantes: Number(horas.toFixed(1)),
          tutorNombre: tutor ? tutor.nombre : "Sin tutor",
          mascotaNombre: mascota ? mascota.nombre : "Sin mascota",
          boxNombre: box ? box.nombre : "Sin box"
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.horasRestantes - b.horasRestantes);
  }

  function obtenerRecordatoriosRefuerzos() {
    const mascotas = VetnovaStorage.leer(VetnovaStorage.keys.MASCOTAS);
    const tutores = VetnovaStorage.leer(VetnovaStorage.keys.TUTORES);
    const descartadas = VetnovaStorage.leer(VetnovaStorage.keys.ALERTAS_DESCARTADAS);

    return mascotas
      .filter((m) => Boolean(m.fechaRefuerzo))
      .map((mascota) => {
        const dias = diasHastaFecha(mascota.fechaRefuerzo);
        if (dias === null || dias > 30) return null;

        const alertaId = "refuerzo-" + mascota.id + "-" + mascota.fechaRefuerzo;
        if (descartadas.includes(alertaId)) return null;

        const tutor = tutores.find((t) => t.id === mascota.tutorId);
        return {
          alertaId,
          tipo: "refuerzo",
          mascotaId: mascota.id,
          mascotaNombre: mascota.nombre,
          especie: mascota.especie || "",
          tutorNombre: tutor ? tutor.nombre : "Sin tutor",
          tipoRefuerzo: mascota.tipoRefuerzo || "Vacuna / Antiparasitario",
          fechaRefuerzo: mascota.fechaRefuerzo,
          diasRestantes: dias
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  }

  function descontarCantidadDeLotes(itemId, cantidadADescontar, motivoTexto, referenciaId) {
    const cantidadReq = Number(cantidadADescontar);
    if (!itemId || Number.isNaN(cantidadReq) || cantidadReq <= 0) {
      return { descontado: 0, faltante: 0, movimientos: [] };
    }

    const lotes = VetnovaStorage.leer(VetnovaStorage.keys.LOTES);
    const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);
    const descuentos = VetnovaStorage.leer(VetnovaStorage.keys.DESCUENTOS);
    const item = catalogo.find((c) => c.id === itemId);

    const lotesOrdenados = lotes
      .filter((l) => l.itemId === itemId && (Number(l.cantidad) || 0) > 0)
      .sort((a, b) => {
        const parsedA = parsearFechaLocal(a.fechaVencimiento);
        const parsedB = parsearFechaLocal(b.fechaVencimiento);
        const fa = parsedA ? parsedA.getTime() : Number.MAX_SAFE_INTEGER;
        const fb = parsedB ? parsedB.getTime() : Number.MAX_SAFE_INTEGER;
        return fa - fb;
      });

    let restantePorDescontar = cantidadReq;
    const movimientosCreados = [];

    lotesOrdenados.forEach((lote) => {
      if (restantePorDescontar <= 0) return;

      const disponible = Number(lote.cantidad) || 0;
      const tomar = Math.min(disponible, restantePorDescontar);
      lote.cantidad = Number((disponible - tomar).toFixed(3));
      restantePorDescontar = Number((restantePorDescontar - tomar).toFixed(3));

      const registroDescuento = {
        id: VetnovaStorage.generarId("DSC"),
        fecha: VetnovaStorage.fechaHoyISO(),
        hora: new Date().toTimeString().slice(0, 5),
        itemId,
        nombreItem: item ? item.descripcion : lote.descripcion || "Ítem",
        loteId: lote.id,
        codigoLote: lote.codigoLote || "S/L",
        cantidad: tomar,
        unidad: lote.unidad || (item && item.unidadBase) || "u",
        motivo: motivoTexto || "Descuento automático",
        referenciaId: referenciaId || ""
      };

      descuentos.unshift(registroDescuento);
      movimientosCreados.push(registroDescuento);
    });

    VetnovaStorage.guardar(VetnovaStorage.keys.LOTES, lotes);
    VetnovaStorage.guardar(VetnovaStorage.keys.DESCUENTOS, descuentos);

    return {
      descontado: Number((cantidadReq - restantePorDescontar).toFixed(3)),
      faltante: restantePorDescontar,
      movimientos: movimientosCreados
    };
  }

  function aplicarDescuentosPorComprobante(comprobante) {
    if (!comprobante || !Array.isArray(comprobante.items)) return [];

    const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);
    const combos = VetnovaStorage.leer(VetnovaStorage.keys.COMBOS);
    const resultados = [];
    const compRef = comprobante.numero || comprobante.id;

    function procesarItemCatalogo(itemCatalogo, cantidadVendida, presentacionElegida) {
      if (!itemCatalogo) return;

      const factorFraccion =
        presentacionElegida && Number(presentacionElegida.factorUnidades) > 0
          ? Number(presentacionElegida.factorUnidades)
          : 1;
      const cantidadDirecta = Number((cantidadVendida * factorFraccion).toFixed(3));
      const esFraccionado = Boolean(presentacionElegida && presentacionElegida.fraccionada);

      if (itemCatalogo.descuentaStockDirecto !== false) {
        const motivoDirecto = esFraccionado
          ? "Venta fraccionada (" + presentacionElegida.nombre + ") - Comp. " + compRef
          : "Venta/Servicio - Comp. " + compRef;

        const resDirecto = descontarCantidadDeLotes(
          itemCatalogo.id,
          cantidadDirecta,
          motivoDirecto,
          comprobante.id
        );
        if (resDirecto.descontado > 0) {
          resultados.push.apply(resultados, resDirecto.movimientos);
        }
      }

      if (Array.isArray(itemCatalogo.insumosAsociados)) {
        itemCatalogo.insumosAsociados.forEach((ins) => {
          const consumoTotal = Number(((Number(ins.cantidad) || 0) * cantidadVendida).toFixed(3));
          if (ins.insumoId && consumoTotal > 0) {
            const motivoInsumo =
              'Insumo en "' + itemCatalogo.descripcion + '" - Comp. ' + compRef;
            const resInsumo = descontarCantidadDeLotes(
              ins.insumoId,
              consumoTotal,
              motivoInsumo,
              comprobante.id
            );
            if (resInsumo.descontado > 0) {
              resultados.push.apply(resultados, resInsumo.movimientos);
            }
          }
        });
      }
    }

    comprobante.items.forEach((linea) => {
      const cantidad = Number(linea.cantidad) || 1;
      if (linea.tipo === "combo") {
        const combo = combos.find((cb) => cb.id === linea.referenciaId);
        if (combo && Array.isArray(combo.componentes)) {
          combo.componentes.forEach((comp) => {
            const itemCat = catalogo.find((c) => c.id === comp.itemId);
            procesarItemCatalogo(itemCat, cantidad * (Number(comp.cantidad) || 1), null);
          });
        }
      } else {
        const itemCat = catalogo.find((c) => c.id === linea.itemId);
        const pres =
          itemCat && Array.isArray(itemCat.presentaciones)
            ? itemCat.presentaciones.find((p) => p.nombre === linea.presentacion)
            : null;
        procesarItemCatalogo(itemCat, cantidad, pres);
      }
    });

    return resultados;
  }

  function obtenerResumenDashboard() {
    const hoy = VetnovaStorage.fechaHoyISO();
    const turnosProximos = obtenerTurnosProximas24Horas();
    const pedidos = VetnovaStorage.leer(VetnovaStorage.keys.PEDIDOS);
    const boxes = VetnovaStorage.leer(VetnovaStorage.keys.BOXES);
    const comprobantes = VetnovaStorage.leer(VetnovaStorage.keys.COMPROBANTES);

    const pedidosActivos = pedidos.filter(
      (p) => p.estado !== "Entregado" && p.estado !== "Cancelado"
    );

    const conteoBoxes = {
      libre: boxes.filter((b) => b.estado === "Libre").length,
      enAtencion: boxes.filter((b) => b.estado === "En atención").length,
      reservado: boxes.filter((b) => b.estado === "Reservado").length,
      total: boxes.length
    };

    const ingresosHoy = comprobantes
      .filter((c) => c.fecha === hoy && c.estado !== "Anulado")
      .reduce((acc, c) => acc + (Number(c.totalCobrado) || 0), 0);

    const alertasVencimiento = obtenerAlertasVencimiento();
    const alertasStock = obtenerAlertasStockMinimo();
    const recordatoriosRefuerzos = obtenerRecordatoriosRefuerzos();

    return {
      turnos24hCount: turnosProximos.length,
      pedidosActivosCount: pedidosActivos.length,
      conteoBoxes,
      ingresosHoy,
      alertasVencimiento,
      alertasStock,
      turnosProximos,
      recordatoriosRefuerzos,
      totalAlertas:
        alertasVencimiento.length +
        alertasStock.length +
        turnosProximos.length +
        recordatoriosRefuerzos.length
    };
  }

  return {
    DIAS_ALERTA_VENCIMIENTO,
    HORAS_ALERTA_TURNOS,
    diasHastaFecha,
    obtenerStockTotalPorItem,
    obtenerAlertasVencimiento,
    obtenerAlertasStockMinimo,
    obtenerTurnosProximas24Horas,
    obtenerRecordatoriosRefuerzos,
    descontarCantidadDeLotes,
    aplicarDescuentosPorComprobante,
    obtenerResumenDashboard
  };
})();