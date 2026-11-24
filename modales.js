/* ==========================================================================
   VETNOVA — CLÍNICA VETERINARIA
   modales.js: Construcción de formularios modales para cada sección
   ========================================================================== */

const VetnovaModales = (() => {
  function esc(val) {
    return String(val ?? '')
      .split('&').join('&')
      .split('<').join('<')
      .split('>').join('>')
      .split('"').join('"');
  }

  function campoTexto(cfg) {
    const id = cfg.id;
    const name = cfg.name;
    const label = cfg.label;
    const placeholder = cfg.placeholder || '';
    const value = cfg.value ?? '';
    const required = Boolean(cfg.required);
    const type = cfg.type || 'text';
    const step = cfg.step || '';

    const reqAttr = required ? ' required' : '';
    const stepAttr = step ? ' step="' + esc(step) + '"' : '';
    const reqMark = required ? ' *' : '';

    return (
      '<div class="form-group">' +
        '<label class="form-label" for="' + esc(id) + '">' + esc(label) + reqMark + '</label>' +
        '<input' +
          ' type="' + esc(type) + '"' +
          ' id="' + esc(id) + '"' +
          ' name="' + esc(name) + '"' +
          ' class="form-control"' +
          ' value="' + esc(value) + '"' +
          ' placeholder="' + esc(placeholder) + '"' +
          stepAttr +
          reqAttr +
        ' />' +
      '</div>'
    );
  }

  function campoTextarea(cfg) {
    const id = cfg.id;
    const name = cfg.name;
    const label = cfg.label;
    const placeholder = cfg.placeholder || '';
    const value = cfg.value ?? '';
    const required = Boolean(cfg.required);

    const reqAttr = required ? ' required' : '';
    const reqMark = required ? ' *' : '';

    return (
      '<div class="form-group">' +
        '<label class="form-label" for="' + esc(id) + '">' + esc(label) + reqMark + '</label>' +
        '<textarea' +
          ' id="' + esc(id) + '"' +
          ' name="' + esc(name) + '"' +
          ' class="form-textarea"' +
          ' placeholder="' + esc(placeholder) + '"' +
          reqAttr +
        '>' + esc(value) + '</textarea>' +
      '</div>'
    );
  }

  function campoSelect(cfg) {
    const id = cfg.id;
    const name = cfg.name;
    const label = cfg.label;
    const opciones = cfg.opciones || [];
    const value = cfg.value ?? '';
    const required = Boolean(cfg.required);

    const reqAttr = required ? ' required' : '';
    const reqMark = required ? ' *' : '';

    const optsHtml = opciones
      .map((op) => {
        const val = typeof op === 'object' ? op.value : op;
        const txt = typeof op === 'object' ? op.label : op;
        const sel = String(val) === String(value) ? ' selected' : '';
        return '<option value="' + esc(val) + '"' + sel + '>' + esc(txt) + '</option>';
      })
      .join('');

    return (
      '<div class="form-group">' +
        '<label class="form-label" for="' + esc(id) + '">' + esc(label) + reqMark + '</label>' +
        '<select id="' + esc(id) + '" name="' + esc(name) + '" class="form-select"' + reqAttr + '>' +
          optsHtml +
        '</select>' +
      '</div>'
    );
  }

  function botonesModal(textoGuardar) {
    return (
      '<div class="data-card-actions">' +
        '<button type="submit" class="btn btn-primary">' + esc(textoGuardar) + '</button>' +
        '<button type="button" class="btn btn-ghost" data-cerrar-modal="1">Cancelar</button>' +
      '</div>'
    );
  }

  function construirFormulario(modalId, contextData) {
    const ctx = contextData || {};
    const tutores = VetnovaStorage.leer(VetnovaStorage.keys.TUTORES);
    const mascotas = VetnovaStorage.leer(VetnovaStorage.keys.MASCOTAS);
    const catalogo = VetnovaStorage.leer(VetnovaStorage.keys.CATALOGO);
    const combos = VetnovaStorage.leer(VetnovaStorage.keys.COMBOS);
    const boxes = VetnovaStorage.leer(VetnovaStorage.keys.BOXES);

    if (modalId === 'modal-tutor') {
      const t = ctx.tutor || null;
      const domsStr = t && Array.isArray(t.domicilios) ? t.domicilios.join(' | ') : '';
      return {
        titulo: t ? 'Editar tutor / cliente' : 'Nuevo tutor / cliente',
        html:
          '<form id="form-modal-tutor" data-edit-id="' + esc(t ? t.id : '') + '">' +
            campoSelect({
              id: 'tut-tipo',
              name: 'tipo',
              label: 'Tipo de tutor',
              value: t ? t.tipo : 'Particular',
              opciones: ['Particular', 'Criadero', 'Refugio']
            }) +
            campoTexto({
              id: 'tut-nombre',
              name: 'nombre',
              label: 'Nombre completo o razón social',
              placeholder: 'Ej: Martín Gómez o Criadero Del Sur',
              value: t ? t.nombre : '',
              required: true
            }) +
            campoTexto({
              id: 'tut-telefono',
              name: 'telefono',
              label: 'Teléfono / WhatsApp',
              placeholder: 'Ej: 3865-412890',
              value: t ? t.telefono : ''
            }) +
            campoTexto({
              id: 'tut-email',
              name: 'email',
              label: 'Correo electrónico',
              type: 'email',
              placeholder: 'Ej: contacto@veterinaria.com',
              value: t ? t.email : ''
            }) +
            campoTexto({
              id: 'tut-documento',
              name: 'documentoFiscal',
              label: 'DNI / CUIT',
              placeholder: 'Ej: 20-38451290-4',
              value: t ? t.documentoFiscal : ''
            }) +
            campoTexto({
              id: 'tut-condicion',
              name: 'condicionFiscal',
              label: 'Condición fiscal',
              placeholder: 'Ej: Consumidor Final / Monotributo / Resp. Inscripto',
              value: t ? t.condicionFiscal : ''
            }) +
            campoTexto({
              id: 'tut-domicilios',
              name: 'domicilios',
              label: 'Múltiples domicilios (separados por |)',
              placeholder: 'Ej: Ruta 38 km 760 | Av. Avellaneda 420',
              value: domsStr
            }) +
            campoTextarea({
              id: 'tut-notas',
              name: 'notas',
              label: 'Notas adicionales',
              placeholder: 'Ej: Preferencia de horario para entregas o contacto',
              value: t ? t.notas : ''
            }) +
            botonesModal('Guardar tutor') +
          '</form>'
      };
    }

    if (modalId === 'modal-mascota') {
      const m = ctx.mascota || null;
      const tutorPreseleccionado = m ? m.tutorId : ctx.tutorId || (tutores[0] ? tutores[0].id : '');
      const opcionesTutor = tutores.length
        ? tutores.map((x) => ({ value: x.id, label: x.nombre + ' (' + x.tipo + ')' }))
        : [{ value: '', label: 'Primero registre un tutor' }];

      return {
        titulo: m ? 'Editar mascota' : 'Nueva mascota',
        html:
          '<form id="form-modal-mascota" data-edit-id="' + esc(m ? m.id : '') + '">' +
            campoSelect({
              id: 'mas-tutor',
              name: 'tutorId',
              label: 'Tutor asociado',
              value: tutorPreseleccionado,
              opciones: opcionesTutor,
              required: true
            }) +
            campoTexto({
              id: 'mas-nombre',
              name: 'nombre',
              label: 'Nombre de la mascota',
              placeholder: 'Ej: Kira o Rocco',
              value: m ? m.nombre : '',
              required: true
            }) +
            campoTexto({
              id: 'mas-especie',
              name: 'especie',
              label: 'Especie',
              placeholder: 'Ej: Canino o Felino',
              value: m ? m.especie : '',
              required: true
            }) +
            campoTexto({
              id: 'mas-raza',
              name: 'raza',
              label: 'Raza',
              placeholder: 'Ej: Pastor Alemán o Mestizo',
              value: m ? m.raza : ''
            }) +
            campoTexto({
              id: 'mas-peso',
              name: 'peso',
              label: 'Peso (kg)',
              type: 'number',
              step: '0.1',
              placeholder: 'Ej: 28.5',
              value: m ? m.peso : ''
            }) +
            campoTexto({
              id: 'mas-alergias',
              name: 'alergias',
              label: 'Alergias',
              placeholder: 'Ej: Alergia leve a antiparasitarios tópicos',
              value: m ? m.alergias : ''
            }) +
            campoTextarea({
              id: 'mas-obs',
              name: 'observaciones',
              label: 'Observaciones clínicas',
              placeholder: 'Ej: Antecedentes, controles, dieta especial o indicaciones',
              value: m ? m.observaciones : ''
            }) +
            campoTexto({
              id: 'mas-tipo-refuerzo',
              name: 'tipoRefuerzo',
              label: 'Próximo refuerzo (vacuna / antiparasitario)',
              placeholder: 'Ej: Antirrábica / Antiparasitario interno',
              value: m ? m.tipoRefuerzo : ''
            }) +
            campoTexto({
              id: 'mas-fecha-refuerzo',
              name: 'fechaRefuerzo',
              label: 'Fecha estimada de refuerzo',
              type: 'date',
              placeholder: 'Ej: 2026-12-10',
              value: m ? m.fechaRefuerzo : ''
            }) +
            botonesModal('Guardar mascota') +
          '</form>'
      };
    }

    if (modalId === 'modal-item-catalogo') {
      const it = ctx.item || null;
      const presStr =
        it && Array.isArray(it.presentaciones)
          ? it.presentaciones
              .map((p) => p.nombre + ':' + (p.factorUnidades || 1) + ':' + (p.fraccionada ? 'frac' : 'std'))
              .join(' | ')
          : '';
      const insStr =
        it && Array.isArray(it.insumosAsociados)
          ? it.insumosAsociados.map((i) => i.insumoId + ':' + i.cantidad).join(' | ')
          : '';

      const opcionesInsumo = [{ value: '', label: 'Sin insumo asociado' }].concat(
        catalogo.map((c) => ({
          value: c.id,
          label: (c.codigo ? c.codigo + ' - ' : '') + c.descripcion
        }))
      );

      return {
        titulo: it ? 'Editar producto o servicio' : 'Nuevo producto o servicio',
        html:
          '<form id="form-modal-item" data-edit-id="' + esc(it ? it.id : '') + '">' +
            campoTexto({
              id: 'itm-codigo',
              name: 'codigo',
              label: 'Código',
              placeholder: 'Ej: ALB-015 o PEL-004',
              value: it ? it.codigo : '',
              required: true
            }) +
            campoTexto({
              id: 'itm-descripcion',
              name: 'descripcion',
              label: 'Descripción',
              placeholder: 'Ej: Alimento Perro Adulto o Baño y corte sanitario',
              value: it ? it.descripcion : '',
              required: true
            }) +
            campoSelect({
              id: 'itm-categoria',
              name: 'categoria',
              label: 'Categoría',
              value: it ? it.categoria : 'Alimentos balanceados',
              opciones: [
                'Alimentos balanceados',
                'Farmacia veterinaria',
                'Accesorios',
                'Higiene y estética',
                'Servicios clínicos',
                'Peluquería canina'
              ]
            }) +
            campoTexto({
              id: 'itm-presentaciones',
              name: 'presentacionesRaw',
              label: 'Presentaciones (nombre:factor:std|frac separados por |)',
              placeholder: 'Ej: Bolsa 15kg:15:std | Suelto por kg:1:frac | Dosis unitaria:1:std',
              value: presStr
            }) +
            campoTexto({
              id: 'itm-costo',
              name: 'costo',
              label: 'Costo ($)',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 25000',
              value: it ? it.costo : ''
            }) +
            campoTexto({
              id: 'itm-precio',
              name: 'precio',
              label: 'Precio de venta ($)',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 38000',
              value: it ? it.precio : ''
            }) +
            campoSelect({
              id: 'itm-insumo-id',
              name: 'insumoId',
              label: 'Insumo principal asociado (servicio / venta fraccionada)',
              value: it && it.insumosAsociados && it.insumosAsociados[0] ? it.insumosAsociados[0].insumoId : '',
              opciones: opcionesInsumo
            }) +
            campoTexto({
              id: 'itm-insumo-cant',
              name: 'insumoCantidad',
              label: 'Cantidad de insumo por servicio/unidad',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 80 o 1',
              value: it && it.insumosAsociados && it.insumosAsociados[0] ? it.insumosAsociados[0].cantidad : ''
            }) +
            campoTexto({
              id: 'itm-insumos-extra',
              name: 'insumosRaw',
              label: 'Insumos adicionales (idInsumo:cantidad separados por |)',
              placeholder: 'Ej: ITM-XXXX:1 | ITM-YYYY:2',
              value: insStr
            }) +
            campoTexto({
              id: 'itm-duracion',
              name: 'duracionEstimada',
              label: 'Duración estimada (minutos)',
              type: 'number',
              step: '1',
              placeholder: 'Ej: 60',
              value: it ? it.duracionEstimada : ''
            }) +
            campoSelect({
              id: 'itm-sector',
              name: 'sector',
              label: 'Sector',
              value: it ? it.sector : 'Salón de ventas',
              opciones: ['Consultorio', 'Peluquería', 'Salón de ventas']
            }) +
            campoSelect({
              id: 'itm-estado',
              name: 'estado',
              label: 'Estado',
              value: it ? it.estado : 'Activo',
              opciones: ['Activo', 'Inactivo']
            }) +
            campoTexto({
              id: 'itm-minimo',
              name: 'stockMinimo',
              label: 'Stock mínimo de alerta',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 5',
              value: it ? it.stockMinimo : ''
            }) +
            campoTexto({
              id: 'itm-unidad',
              name: 'unidadBase',
              label: 'Unidad base',
              placeholder: 'Ej: u, kg, ml, dosis',
              value: it ? it.unidadBase : ''
            }) +
            botonesModal('Guardar ítem') +
          '</form>'
      };
    }

    if (modalId === 'modal-combo') {
      const cb = ctx.combo || null;
      const opcionesComp = [{ value: '', label: 'Seleccione ítem del catálogo' }].concat(
        catalogo.map((c) => ({
          value: c.id,
          label: (c.codigo ? c.codigo + ' - ' : '') + c.descripcion
        }))
      );

      return {
        titulo: cb ? 'Editar combo promocional' : 'Nuevo combo promocional',
        html:
          '<form id="form-modal-combo" data-edit-id="' + esc(cb ? cb.id : '') + '">' +
            campoTexto({
              id: 'cmb-nombre',
              name: 'nombre',
              label: 'Nombre del combo',
              placeholder: 'Ej: Pack Cuidados Mensuales',
              value: cb ? cb.nombre : '',
              required: true
            }) +
            campoTextarea({
              id: 'cmb-desc',
              name: 'descripcion',
              label: 'Descripción de la promoción',
              placeholder: 'Ej: Baño y corte sanitario más pipeta antipulgas',
              value: cb ? cb.descripcion : ''
            }) +
            campoSelect({
              id: 'cmb-comp1-id',
              name: 'comp1Id',
              label: 'Componente 1 del combo',
              value: cb && cb.componentes && cb.componentes[0] ? cb.componentes[0].itemId : '',
              opciones: opcionesComp,
              required: true
            }) +
            campoTexto({
              id: 'cmb-comp1-cant',
              name: 'comp1Cant',
              label: 'Cantidad componente 1',
              type: 'number',
              step: '1',
              placeholder: 'Ej: 1',
              value: cb && cb.componentes && cb.componentes[0] ? cb.componentes[0].cantidad : ''
            }) +
            campoSelect({
              id: 'cmb-comp2-id',
              name: 'comp2Id',
              label: 'Componente 2 del combo (opcional)',
              value: cb && cb.componentes && cb.componentes[1] ? cb.componentes[1].itemId : '',
              opciones: opcionesComp
            }) +
            campoTexto({
              id: 'cmb-comp2-cant',
              name: 'comp2Cant',
              label: 'Cantidad componente 2',
              type: 'number',
              step: '1',
              placeholder: 'Ej: 1',
              value: cb && cb.componentes && cb.componentes[1] ? cb.componentes[1].cantidad : ''
            }) +
            campoTexto({
              id: 'cmb-precio',
              name: 'precioPromocional',
              label: 'Precio promocional ($)',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 29500',
              value: cb ? cb.precioPromocional : '',
              required: true
            }) +
            campoSelect({
              id: 'cmb-estado',
              name: 'estado',
              label: 'Estado',
              value: cb ? cb.estado : 'Activo',
              opciones: ['Activo', 'Inactivo']
            }) +
            botonesModal('Guardar combo') +
          '</form>'
      };
    }

    if (modalId === 'modal-box') {
      const b = ctx.box || null;
      return {
        titulo: b ? 'Editar box / consultorio' : 'Nuevo box / consultorio',
        html:
          '<form id="form-modal-box" data-edit-id="' + esc(b ? b.id : '') + '">' +
            campoTexto({
              id: 'box-nombre',
              name: 'nombre',
              label: 'Nombre o número de box / consultorio',
              placeholder: 'Ej: Consultorio 1 o Box Peluquería 2',
              value: b ? b.nombre : '',
              required: true
            }) +
            campoSelect({
              id: 'box-sector',
              name: 'sector',
              label: 'Sector',
              value: b ? b.sector : 'Consultorio',
              opciones: ['Consultorio', 'Peluquería', 'Salón de ventas']
            }) +
            campoSelect({
              id: 'box-estado',
              name: 'estado',
              label: 'Estado actual',
              value: b ? b.estado : 'Libre',
              opciones: ['Libre', 'En atención', 'Reservado']
            }) +
            campoTexto({
              id: 'box-detalle',
              name: 'detalleActual',
              label: 'Mascota / atención asociada (opcional)',
              placeholder: 'Ej: Rocco - Consulta clínica',
              value: b ? b.detalleActual : ''
            }) +
            botonesModal('Guardar box') +
          '</form>'
      };
    }

    if (modalId === 'modal-turno') {
      const t = ctx.turno || null;
      const opTutores = [{ value: '', label: 'Seleccione tutor' }].concat(
        tutores.map((x) => ({ value: x.id, label: x.nombre + ' (' + x.tipo + ')' }))
      );
      const opMascotas = [{ value: '', label: 'Seleccione mascota' }].concat(
        mascotas.map((m) => ({ value: m.id, label: m.nombre + ' (' + (m.especie || 'Mascota') + ')' }))
      );
      const opBoxes = [{ value: '', label: 'Sin box asignado' }].concat(
        boxes.map((b) => ({ value: b.id, label: b.nombre + ' (' + b.estado + ')' }))
      );
      const opServicios = [{ value: '', label: 'Sin servicio específico' }].concat(
        catalogo.map((c) => ({
          value: c.id,
          label: (c.codigo ? c.codigo + ' - ' : '') + c.descripcion
        }))
      );

      return {
        titulo: t ? 'Editar turno' : 'Nuevo turno',
        html:
          '<form id="form-modal-turno" data-edit-id="' + esc(t ? t.id : '') + '">' +
            campoSelect({
              id: 'trn-tipo',
              name: 'tipo',
              label: 'Tipo de turno',
              value: t ? t.tipo : 'Consulta',
              opciones: ['Peluquería', 'Vacunación', 'Consulta']
            }) +
            campoTexto({
              id: 'trn-fecha',
              name: 'fecha',
              label: 'Fecha del turno',
              type: 'date',
              placeholder: 'Ej: 2026-11-24',
              value: t ? t.fecha : '',
              required: true
            }) +
            campoTexto({
              id: 'trn-hora',
              name: 'hora',
              label: 'Hora del turno',
              type: 'time',
              placeholder: 'Ej: 16:30',
              value: t ? t.hora : '',
              required: true
            }) +
            campoSelect({
              id: 'trn-tutor',
              name: 'tutorId',
              label: 'Tutor',
              value: t ? t.tutorId : '',
              opciones: opTutores,
              required: true
            }) +
            campoSelect({
              id: 'trn-mascota',
              name: 'mascotaId',
              label: 'Mascota',
              value: t ? t.mascotaId : '',
              opciones: opMascotas,
              required: true
            }) +
            campoSelect({
              id: 'trn-servicio',
              name: 'servicioId',
              label: 'Servicio / prestación',
              value: t ? t.servicioId : '',
              opciones: opServicios
            }) +
            campoSelect({
              id: 'trn-box',
              name: 'boxId',
              label: 'Box / consultorio',
              value: t ? t.boxId : '',
              opciones: opBoxes
            }) +
            campoSelect({
              id: 'trn-estado',
              name: 'estado',
              label: 'Estado del turno',
              value: t ? t.estado : 'Confirmado',
              opciones: ['Confirmado', 'En atención', 'Completado', 'Cancelado']
            }) +
            campoTextarea({
              id: 'trn-obs',
              name: 'observaciones',
              label: 'Observaciones',
              placeholder: 'Ej: Control general o aplicación de refuerzo',
              value: t ? t.observaciones : ''
            }) +
            botonesModal('Guardar turno') +
          '</form>'
      };
    }

    if (modalId === 'modal-pedido') {
      const p = ctx.pedido || null;
      const opTutores = [{ value: '', label: 'Mostrador / Sin tutor asociado' }].concat(
        tutores.map((x) => ({ value: x.id, label: x.nombre + ' (' + x.tipo + ')' }))
      );

      return {
        titulo: p ? 'Editar pedido ' + p.numero : 'Nuevo pedido (mostrador / delivery)',
        html:
          '<form id="form-modal-pedido" data-edit-id="' + esc(p ? p.id : '') + '">' +
            campoSelect({
              id: 'ped-modalidad',
              name: 'modalidad',
              label: 'Modalidad de pedido',
              value: p ? p.modalidad : 'Mostrador',
              opciones: ['Mostrador', 'Delivery a domicilio']
            }) +
            campoSelect({
              id: 'ped-tutor',
              name: 'tutorId',
              label: 'Tutor',
              value: p ? p.tutorId : '',
              opciones: opTutores
            }) +
            campoTexto({
              id: 'ped-domicilio',
              name: 'domicilioEntrega',
              label: 'Domicilio de entrega (si es delivery)',
              placeholder: 'Ej: Av. Avellaneda 420',
              value: p ? p.domicilioEntrega : ''
            }) +
            campoSelect({
              id: 'ped-sector',
              name: 'sector',
              label: 'Derivación al sector',
              value: p ? p.sector : 'Salón de ventas',
              opciones: ['Consultorio', 'Peluquería', 'Salón de ventas']
            }) +
            campoTextarea({
              id: 'ped-items',
              name: 'detalleItems',
              label: 'Productos o servicios solicitados',
              placeholder: 'Ej: 1 bolsa alimento 15 kg + 2 antiparasitarios',
              value: p ? p.detalleItems : '',
              required: true
            }) +
            campoTexto({
              id: 'ped-total',
              name: 'totalEstimado',
              label: 'Importe estimado ($)',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 45000',
              value: p ? p.totalEstimado : ''
            }) +
            campoSelect({
              id: 'ped-estado',
              name: 'estado',
              label: 'Estado del pedido',
              value: p ? p.estado : 'En espera',
              opciones: ['En espera', 'En proceso', 'Listo para retirar', 'Entregado', 'Cancelado']
            }) +
            campoTexto({
              id: 'ped-notas',
              name: 'notas',
              label: 'Notas de entrega o preparación',
              placeholder: 'Ej: Avisar por WhatsApp al llegar',
              value: p ? p.notas : ''
            }) +
            botonesModal('Guardar pedido') +
          '</form>'
      };
    }

    if (modalId === 'modal-lote') {
      const l = ctx.lote || null;
      const opItems = [{ value: '', label: 'Seleccione producto o insumo del catálogo' }].concat(
        catalogo.map((c) => ({
          value: c.id,
          label: (c.codigo ? c.codigo + ' - ' : '') + c.descripcion
        }))
      );

      return {
        titulo: l ? 'Editar lote / stock' : 'Nuevo lote / control de stock',
        html:
          '<form id="form-modal-lote" data-edit-id="' + esc(l ? l.id : '') + '">' +
            campoSelect({
              id: 'lot-item',
              name: 'itemId',
              label: 'Producto o insumo',
              value: l ? l.itemId : '',
              opciones: opItems,
              required: true
            }) +
            campoTexto({
              id: 'lot-codigo',
              name: 'codigoLote',
              label: 'Número / código de lote',
              placeholder: 'Ej: VR-882 o AL-104',
              value: l ? l.codigoLote : '',
              required: true
            }) +
            campoTexto({
              id: 'lot-cantidad',
              name: 'cantidad',
              label: 'Cantidad disponible',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 12',
              value: l ? l.cantidad : '',
              required: true
            }) +
            campoTexto({
              id: 'lot-unidad',
              name: 'unidad',
              label: 'Unidad de medida',
              placeholder: 'Ej: dosis, kg, ml, u',
              value: l ? l.unidad : ''
            }) +
            campoTexto({
              id: 'lot-minimo',
              name: 'stockMinimo',
              label: 'Umbral de stock mínimo',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 5',
              value: l ? l.stockMinimo : ''
            }) +
            campoTexto({
              id: 'lot-vencimiento',
              name: 'fechaVencimiento',
              label: 'Fecha de vencimiento',
              type: 'date',
              placeholder: 'Ej: 2026-12-02',
              value: l ? l.fechaVencimiento : ''
            }) +
            campoTexto({
              id: 'lot-costo',
              name: 'costoUnitario',
              label: 'Costo unitario ($)',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 4200',
              value: l ? l.costoUnitario : ''
            }) +
            botonesModal('Guardar lote') +
          '</form>'
      };
    }

    if (modalId === 'modal-compra') {
      const opItems = [{ value: '', label: 'Seleccione ítem comprado' }].concat(
        catalogo.map((c) => ({
          value: c.id,
          label: (c.codigo ? c.codigo + ' - ' : '') + c.descripcion
        }))
      );

      return {
        titulo: 'Registrar compra a droguería / distribuidora',
        html:
          '<form id="form-modal-compra">' +
            campoTexto({
              id: 'cmp-proveedor',
              name: 'proveedor',
              label: 'Droguería / distribuidora / proveedor',
              placeholder: 'Ej: VetSur Distribuidora',
              required: true
            }) +
            campoTexto({
              id: 'cmp-comprobante',
              name: 'comprobanteRef',
              label: 'Número de factura / remito proveedor',
              placeholder: 'Ej: FC-0004-00001289'
            }) +
            campoTexto({
              id: 'cmp-fecha',
              name: 'fecha',
              label: 'Fecha de compra',
              type: 'date',
              placeholder: 'Ej: 2026-11-23',
              required: true
            }) +
            campoSelect({
              id: 'cmp-item',
              name: 'itemId',
              label: 'Producto o insumo',
              opciones: opItems,
              required: true
            }) +
            campoTexto({
              id: 'cmp-lote',
              name: 'codigoLote',
              label: 'Código de lote ingresado',
              placeholder: 'Ej: VR-910',
              required: true
            }) +
            campoTexto({
              id: 'cmp-cantidad',
              name: 'cantidad',
              label: 'Cantidad comprada',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 10',
              required: true
            }) +
            campoTexto({
              id: 'cmp-unidad',
              name: 'unidad',
              label: 'Unidad',
              placeholder: 'Ej: dosis, kg, ml, u'
            }) +
            campoTexto({
              id: 'cmp-minimo',
              name: 'stockMinimo',
              label: 'Stock mínimo del lote',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 5'
            }) +
            campoTexto({
              id: 'cmp-vencimiento',
              name: 'fechaVencimiento',
              label: 'Fecha de vencimiento del lote',
              type: 'date',
              placeholder: 'Ej: 2027-08-20'
            }) +
            campoTexto({
              id: 'cmp-costo',
              name: 'costoUnitario',
              label: 'Costo unitario ($)',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 4200',
              required: true
            }) +
            botonesModal('Registrar compra e ingresar stock') +
          '</form>'
      };
    }

    if (modalId === 'modal-comprobante') {
      const opTutores = [{ value: '', label: 'Consumidor final / Sin tutor' }].concat(
        tutores.map((x) => ({
          value: x.id,
          label: x.nombre + ' (' + (x.condicionFiscal || x.tipo) + ')'
        }))
      );
      const opMascotas = [{ value: '', label: 'No aplica / Varias' }].concat(
        mascotas.map((m) => ({ value: m.id, label: m.nombre + ' (' + (m.especie || 'Mascota') + ')' }))
      );

      const opItemsCat = catalogo.map((c) => ({
        value: 'item:' + c.id,
        label: '[Ítem] ' + c.descripcion + ' (' + VetnovaFunctions.formatearMoneda(c.precio) + ')'
      }));
      const opCombosCat = combos.map((cb) => ({
        value: 'combo:' + cb.id,
        label: '[Combo] ' + cb.nombre + ' (' + VetnovaFunctions.formatearMoneda(cb.precioPromocional) + ')'
      }));
      const opCatalogo = opItemsCat.concat(opCombosCat);

      return {
        titulo: 'Emitir comprobante y registrar cobro',
        html:
          '<form id="form-modal-comprobante">' +
            campoSelect({
              id: 'cbte-tipo',
              name: 'tipoComprobante',
              label: 'Tipo de comprobante',
              opciones: ['Factura', 'Orden de servicio / Remito']
            }) +
            campoTexto({
              id: 'cbte-fecha',
              name: 'fecha',
              label: 'Fecha de emisión',
              type: 'date',
              placeholder: 'Ej: 2026-11-23',
              required: true
            }) +
            campoSelect({
              id: 'cbte-tutor',
              name: 'tutorId',
              label: 'Tutor / Cliente',
              opciones: opTutores
            }) +
            campoSelect({
              id: 'cbte-mascota',
              name: 'mascotaId',
              label: 'Mascota vinculada',
              opciones: opMascotas
            }) +
            campoSelect({
              id: 'cbte-ref',
              name: 'referenciaSeleccion',
              label: 'Producto, servicio o combo',
              opciones: opCatalogo.length
                ? opCatalogo
                : [{ value: '', label: 'Cargue ítems en Catálogo primero' }]
            }) +
            campoTexto({
              id: 'cbte-presentacion',
              name: 'presentacion',
              label: 'Presentación (si aplica)',
              placeholder: 'Ej: Bolsa 15kg o Suelto por kg'
            }) +
            campoTexto({
              id: 'cbte-cantidad',
              name: 'cantidad',
              label: 'Cantidad',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 1',
              required: true
            }) +
            campoTexto({
              id: 'cbte-total',
              name: 'totalComprobante',
              label: 'Importe total del comprobante ($)',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 25000',
              required: true
            }) +
            campoSelect({
              id: 'cbte-medio-1',
              name: 'medio1',
              label: 'Medio de pago principal',
              opciones: ['Efectivo', 'Tarjeta de débito', 'Tarjeta de crédito', 'Transferencia']
            }) +
            campoTexto({
              id: 'cbte-monto-1',
              name: 'monto1',
              label: 'Monto abonado medio 1 ($)',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 15000',
              required: true
            }) +
            campoSelect({
              id: 'cbte-medio-2',
              name: 'medio2',
              label: 'Segundo medio de pago (opcional)',
              opciones: ['', 'Efectivo', 'Tarjeta de débito', 'Tarjeta de crédito', 'Transferencia']
            }) +
            campoTexto({
              id: 'cbte-monto-2',
              name: 'monto2',
              label: 'Monto abonado medio 2 ($)',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 10000'
            }) +
            campoTexto({
              id: 'cbte-obs',
              name: 'observaciones',
              label: 'Observaciones',
              placeholder: 'Ej: Incluye descuento automático de insumos'
            }) +
            botonesModal('Confirmar cobro y guardar') +
          '</form>'
      };
    }

    if (modalId === 'modal-editar-cobro') {
      const comp = ctx.comprobante;
      const p0 = comp && comp.pagos && comp.pagos[0] ? comp.pagos[0] : { medio: 'Efectivo', monto: '' };
      const p1 = comp && comp.pagos && comp.pagos[1] ? comp.pagos[1] : { medio: '', monto: '' };

      return {
        titulo: 'Actualizar ingreso / cobro · ' + (comp ? comp.numero : ''),
        html:
          '<form id="form-modal-editar-cobro" data-comprobante-id="' + esc(comp ? comp.id : '') + '">' +
            campoSelect({
              id: 'edit-cobro-medio-1',
              name: 'medio1',
              label: 'Medio de pago 1',
              value: p0.medio || 'Efectivo',
              opciones: ['Efectivo', 'Tarjeta de débito', 'Tarjeta de crédito', 'Transferencia']
            }) +
            campoTexto({
              id: 'edit-cobro-monto-1',
              name: 'monto1',
              label: 'Monto medio 1 ($)',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 28000',
              value: p0.monto ?? '',
              required: true
            }) +
            campoSelect({
              id: 'edit-cobro-medio-2',
              name: 'medio2',
              label: 'Medio de pago 2 (opcional)',
              value: p1.medio || '',
              opciones: ['', 'Efectivo', 'Tarjeta de débito', 'Tarjeta de crédito', 'Transferencia']
            }) +
            campoTexto({
              id: 'edit-cobro-monto-2',
              name: 'monto2',
              label: 'Monto medio 2 ($)',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 0',
              value: p1.monto ?? ''
            }) +
            botonesModal('Guardar corrección en localStorage') +
          '</form>'
      };
    }

    if (modalId === 'modal-cierre-caja') {
      return {
        titulo: 'Registrar cierre de caja diario',
        html:
          '<form id="form-modal-cierre-caja">' +
            campoTexto({
              id: 'cj-fecha',
              name: 'fecha',
              label: 'Fecha del cierre',
              type: 'date',
              placeholder: 'Ej: 2026-11-23',
              required: true
            }) +
            campoTexto({
              id: 'cj-saldo-inicial',
              name: 'saldoInicial',
              label: 'Saldo inicial / apertura ($)',
              type: 'number',
              step: '0.01',
              placeholder: 'Ej: 10000'
            }) +
            campoTextarea({
              id: 'cj-obs',
              name: 'observaciones',
              label: 'Observaciones del cierre',
              placeholder: 'Ej: Arqueo verificado sin diferencias'
            }) +
            botonesModal('Guardar cierre de caja') +
          '</form>'
      };
    }

    return {
      titulo: 'Ventana',
      html: '<p class="data-card-meta">Formulario no disponible.</p>'
    };
  }

  return {
    construirFormulario
  };
})();