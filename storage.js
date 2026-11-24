/* ==========================================================================
   VETNOVA — CLÍNICA VETERINARIA
   storage.js: Definiciones del almacenamiento local (localStorage)
   Inicia limpio sin datos precargados.
   ========================================================================== */

const VETNOVA_STORAGE_KEYS = {
  TUTORES: "vetnova_tutores_v1",
  MASCOTAS: "vetnova_mascotas_v1",
  CATALOGO: "vetnova_catalogo_v1",
  COMBOS: "vetnova_combos_v1",
  HISTORIAL_PRECIOS: "vetnova_historial_precios_v1",
  BOXES: "vetnova_boxes_v1",
  TURNOS: "vetnova_turnos_v1",
  PEDIDOS: "vetnova_pedidos_v1",
  LOTES: "vetnova_lotes_v1",
  COMPRAS: "vetnova_compras_v1",
  DESCUENTOS: "vetnova_descuentos_v1",
  COMPROBANTES: "vetnova_comprobantes_v1",
  CIERRES_CAJA: "vetnova_cierres_caja_v1",
  ALERTAS_DESCARTADAS: "vetnova_alertas_descartadas_v1",
  ACTIVIDAD: "vetnova_actividad_v1"
};

const VETNOVA_COLECCIONES_INICIALES = {
  [VETNOVA_STORAGE_KEYS.TUTORES]: [],
  [VETNOVA_STORAGE_KEYS.MASCOTAS]: [],
  [VETNOVA_STORAGE_KEYS.CATALOGO]: [],
  [VETNOVA_STORAGE_KEYS.COMBOS]: [],
  [VETNOVA_STORAGE_KEYS.HISTORIAL_PRECIOS]: [],
  [VETNOVA_STORAGE_KEYS.BOXES]: [],
  [VETNOVA_STORAGE_KEYS.TURNOS]: [],
  [VETNOVA_STORAGE_KEYS.PEDIDOS]: [],
  [VETNOVA_STORAGE_KEYS.LOTES]: [],
  [VETNOVA_STORAGE_KEYS.COMPRAS]: [],
  [VETNOVA_STORAGE_KEYS.DESCUENTOS]: [],
  [VETNOVA_STORAGE_KEYS.COMPROBANTES]: [],
  [VETNOVA_STORAGE_KEYS.CIERRES_CAJA]: [],
  [VETNOVA_STORAGE_KEYS.ALERTAS_DESCARTADAS]: [],
  [VETNOVA_STORAGE_KEYS.ACTIVIDAD]: []
};

const VetnovaStorage = (() => {
  function asegurarEstructuraLimpia() {
    Object.entries(VETNOVA_COLECCIONES_INICIALES).forEach(([clave, valorInicial]) => {
      if (localStorage.getItem(clave) === null) {
        localStorage.setItem(clave, JSON.stringify(valorInicial));
      }
    });
  }

  function leer(clave) {
    asegurarEstructuraLimpia();
    try {
      const raw = localStorage.getItem(clave);
      if (raw === null) {
        return Array.isArray(VETNOVA_COLECCIONES_INICIALES[clave]) ? [] : null;
      }
      return JSON.parse(raw);
    } catch (error) {
      console.error("Error al leer localStorage en clave:", clave, error);
      return Array.isArray(VETNOVA_COLECCIONES_INICIALES[clave]) ? [] : null;
    }
  }

  function guardar(clave, datos) {
    try {
      localStorage.setItem(clave, JSON.stringify(datos));
      return true;
    } catch (error) {
      console.error("Error al guardar en localStorage en clave:", clave, error);
      return false;
    }
  }

  function vaciarTodo() {
    Object.entries(VETNOVA_COLECCIONES_INICIALES).forEach(([clave, valorInicial]) => {
      localStorage.setItem(clave, JSON.stringify(valorInicial));
    });
  }

  function generarId(prefijo = "VN") {
    const tiempo = Date.now().toString(36).toUpperCase();
    const azar = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefijo}-${tiempo}-${azar}`;
  }

  function fechaHoyISO() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
  }

  function ahoraISO() {
    return new Date().toISOString();
  }

  return {
    keys: VETNOVA_STORAGE_KEYS,
    asegurarEstructuraLimpia,
    leer,
    guardar,
    vaciarTodo,
    generarId,
    fechaHoyISO,
    ahoraISO
  };
})();

VetnovaStorage.asegurarEstructuraLimpia();