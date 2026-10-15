/**
 * AGROTRACE - Sistema de Registro de Lotes de Cosecha & Trazabilidad
 * Lógica modular en Vanilla JavaScript
 */

// Clave de almacenamiento local
const STORAGE_KEY = 'agrotrace_harvest_lots_v1';

// Mapeo de códigos de cultivo y emojis representativos
const CROPS_CONFIG = {
  'Café Arábica': { code: 'CAF', emoji: '☕', defaultUnit: 'kg' },
  'Café Robusta': { code: 'CFR', emoji: '☕', defaultUnit: 'kg' },
  'Cacao Criollo': { code: 'CAC', emoji: '🍫', defaultUnit: 'kg' },
  'Aguacate Hass': { code: 'AGU', emoji: '🥑', defaultUnit: 'kg' },
  'Maíz Blanco': { code: 'MAI', emoji: '🌽', defaultUnit: 'kg' },
  'Papa Criolla': { code: 'PAP', emoji: '🥔', defaultUnit: 'kg' },
  'Tomate Chonto': { code: 'TOM', emoji: '🍅', defaultUnit: 'kg' },
  'Plátano Hartón': { code: 'PLA', emoji: '🍌', defaultUnit: 'kg' },
  'Arroz Paddy': { code: 'ARR', emoji: '🌾', defaultUnit: 'kg' },
  'Mango Tommy': { code: 'MNG', emoji: '🥭', defaultUnit: 'kg' },
  'Otro': { code: 'GEN', emoji: '🌱', defaultUnit: 'kg' }
};

// Semillas iniciales si no hay datos previos
const INITIAL_LOTS = [
  {
    id: 'LOT-CAF-20261014-8B2F',
    cultivo: 'Café Arábica',
    variedad: 'Castillo Supremo',
    fecha: '2026-10-14',
    cantidad: 1250,
    unidad: 'kg',
    parcela: 'Lote La Esperanza #3',
    productor: 'Finca El Paraíso - Mauricio M.',
    metodo: 'Manual Selectiva',
    estado: 'Trazabilidad Iniciada',
    notas: 'Grano con 12% de humedad en cereza madura, excelente consistencia.',
    createdAt: '2026-10-14T09:30:00.000Z'
  },
  {
    id: 'LOT-CAC-20261012-4M9X',
    cultivo: 'Cacao Criollo',
    variedad: 'Fino de Aroma',
    fecha: '2026-10-12',
    cantidad: 840,
    unidad: 'kg',
    parcela: 'Sector Río Claro #1',
    productor: 'Agropecuaria San José',
    metodo: 'Manual',
    estado: 'Trazabilidad Iniciada',
    notas: 'Fermentación en cajones de madera iniciada en beneficio central.',
    createdAt: '2026-10-12T14:15:00.000Z'
  },
  {
    id: 'LOT-AGU-20261010-9Q7Z',
    cultivo: 'Aguacate Hass',
    variedad: 'Exportación Tipo 1',
    fecha: '2026-10-10',
    cantidad: 3200,
    unidad: 'kg',
    parcela: 'Finca Altamira - Terraza 2',
    productor: 'Cooperativa Verde Sur',
    metodo: 'Corte Técnico con Tijera',
    estado: 'Trazabilidad Iniciada',
    notas: 'Materia seca superior al 24%. Destinado a empaque para exportación.',
    createdAt: '2026-10-10T11:00:00.000Z'
  }
];

// Estado de la Aplicación
let state = {
  lots: [],
  currentFilterCrop: 'ALL',
  searchQuery: '',
  activeView: 'grid' // 'grid' | 'table'
};

// Elementos del DOM
const elements = {
  form: document.getElementById('harvest-form'),
  inputCultivo: document.getElementById('input-cultivo'),
  inputCustomCultivoGroup: document.getElementById('custom-cultivo-group'),
  inputCustomCultivo: document.getElementById('input-custom-cultivo'),
  inputFecha: document.getElementById('input-fecha'),
  inputCantidad: document.getElementById('input-cantidad'),
  inputUnidad: document.getElementById('input-unidad'),
  inputParcela: document.getElementById('input-parcela'),
  inputProductor: document.getElementById('input-productor'),
  inputMetodo: document.getElementById('input-metodo'),
  inputNotas: document.getElementById('input-notas'),
  previewCode: document.getElementById('preview-code'),
  lotsContainer: document.getElementById('lots-container'),
  tableContainer: document.getElementById('table-wrapper'),
  tableBody: document.getElementById('table-body'),
  emptyState: document.getElementById('empty-state'),
  searchInput: document.getElementById('search-input'),
  filterCrop: document.getElementById('filter-crop'),
  btnViewGrid: document.getElementById('btn-view-grid'),
  btnViewTable: document.getElementById('btn-view-table'),
  kpiTotalLots: document.getElementById('kpi-total-lots'),
  kpiTotalVolume: document.getElementById('kpi-total-volume'),
  kpiActiveCrops: document.getElementById('kpi-active-crops'),
  kpiLastDate: document.getElementById('kpi-last-date'),
  modal: document.getElementById('trace-modal'),
  modalContent: document.getElementById('modal-details-content'),
  btnModalClose: document.getElementById('modal-close-btn'),
  btnModalPrint: document.getElementById('btn-modal-print'),
  toastContainer: document.getElementById('toast-container'),
  btnResetData: document.getElementById('btn-reset-demo')
};

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  loadLotsFromStorage();
  setDefaultHarvestDate();
  populateFilterDropdown();
  bindEventListeners();
  updateCodePreview();
  render();
}

/**
 * Carga lotes de localStorage o inicializa con ejemplos
 */
function loadLotsFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state.lots = JSON.parse(saved);
    } catch (e) {
      console.error('Error al parsear lotes de localStorage:', e);
      state.lots = [...INITIAL_LOTS];
      saveLotsToStorage();
    }
  } else {
    // Si es primera vez, cargamos las semillas demostrativas
    state.lots = [...INITIAL_LOTS];
    saveLotsToStorage();
  }
}

function saveLotsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lots));
}

/**
 * Configura la fecha de hoy por defecto en el input
 */
function setDefaultHarvestDate() {
  if (elements.inputFecha) {
    const today = new Date().toISOString().split('T')[0];
    elements.inputFecha.value = today;
  }
}

/**
 * Llena el dropdown de filtros de cultivo dinámicamente
 */
function populateFilterDropdown() {
  if (!elements.filterCrop) return;
  elements.filterCrop.innerHTML = '<option value="ALL">Todos los Cultivos</option>';
  
  const crops = Object.keys(CROPS_CONFIG);
  crops.forEach(crop => {
    const opt = document.createElement('option');
    opt.value = crop;
    opt.textContent = `${CROPS_CONFIG[crop].emoji} ${crop}`;
    elements.filterCrop.appendChild(opt);
  });
}

// ==========================================
// GENERADOR DE CÓDIGO ÚNICO DE LOTE
// ==========================================
/**
 * Genera un código único alfanumérico para el lote.
 * Estructura: LOT-[CÓDIGO_CULTIVO]-[FECHA_AAAAMMDD]-[RANDOM_4_CHARS]
 * Ejemplo: LOT-CAF-20261015-7X3A
 */
function generateUniqueLotCode(cropName, harvestDate) {
  let cropPrefix = 'AGR';
  if (CROPS_CONFIG[cropName]) {
    cropPrefix = CROPS_CONFIG[cropName].code;
  } else if (cropName) {
    cropPrefix = cropName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'AGR';
  }

  let dateStr = '';
  if (harvestDate) {
    dateStr = harvestDate.replace(/-/g, '');
  } else {
    dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  }

  // Genera sufijo aleatorio único no repetido
  let randomSuffix = '';
  let fullCode = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 100) {
    attempts++;
    randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    fullCode = `LOT-${cropPrefix}-${dateStr}-${randomSuffix}`;
    const exists = state.lots.some(lot => lot.id === fullCode);
    if (!exists) {
      isUnique = true;
    }
  }

  return fullCode;
}

/**
 * Actualiza la vista previa del código único en tiempo real en el formulario
 */
function updateCodePreview() {
  if (!elements.previewCode) return;
  const cropValue = getEffectiveCrop();
  const dateValue = elements.inputFecha ? elements.inputFecha.value : '';
  const simulatedCode = generateUniqueLotCode(cropValue, dateValue);
  elements.previewCode.textContent = simulatedCode;
}

function getEffectiveCrop() {
  const selected = elements.inputCultivo ? elements.inputCultivo.value : '';
  if (selected === 'Otro') {
    return elements.inputCustomCultivo ? elements.inputCustomCultivo.value.trim() || 'Otro' : 'Otro';
  }
  return selected;
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function bindEventListeners() {
  // Cambio de cultivo para mostrar input personalizado si elige 'Otro'
  if (elements.inputCultivo) {
    elements.inputCultivo.addEventListener('change', () => {
      if (elements.inputCultivo.value === 'Otro') {
        elements.inputCustomCultivoGroup.style.display = 'block';
        elements.inputCustomCultivo.focus();
      } else {
        elements.inputCustomCultivoGroup.style.display = 'none';
      }
      updateCodePreview();
    });
  }

  if (elements.inputCustomCultivo) {
    elements.inputCustomCultivo.addEventListener('input', updateCodePreview);
  }

  if (elements.inputFecha) {
    elements.inputFecha.addEventListener('change', updateCodePreview);
  }

  // Envío del Formulario
  if (elements.form) {
    elements.form.addEventListener('submit', handleFormSubmit);
  }

  // Búsqueda en vivo
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      render();
    });
  }

  // Filtro de Cultivo
  if (elements.filterCrop) {
    elements.filterCrop.addEventListener('change', (e) => {
      state.currentFilterCrop = e.target.value;
      render();
    });
  }

  // Alternar Vista Tarjetas / Tabla
  if (elements.btnViewGrid) {
    elements.btnViewGrid.addEventListener('click', () => {
      state.activeView = 'grid';
      elements.btnViewGrid.classList.add('active');
      elements.btnViewTable.classList.remove('active');
      render();
    });
  }

  if (elements.btnViewTable) {
    elements.btnViewTable.addEventListener('click', () => {
      state.activeView = 'table';
      elements.btnViewTable.classList.add('active');
      elements.btnViewGrid.classList.remove('active');
      render();
    });
  }

  // Modal Cerrar
  if (elements.btnModalClose) {
    elements.btnModalClose.addEventListener('click', closeModal);
  }

  if (elements.modal) {
    elements.modal.addEventListener('click', (e) => {
      if (e.target === elements.modal) closeModal();
    });
  }

  // Imprimir ficha de lote
  if (elements.btnModalPrint) {
    elements.btnModalPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Botón restaurar datos muestra
  if (elements.btnResetData) {
    elements.btnResetData.addEventListener('click', () => {
      if (confirm('¿Deseas restaurar los lotes de ejemplo del sistema?')) {
        state.lots = [...INITIAL_LOTS];
        saveLotsToStorage();
        render();
        showToast('Lotes de demostración restaurados exitosamente', 'success');
      }
    });
  }

  // Tecla Escape cierra modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// ==========================================
// VALIDACIÓN Y REGISTRO DE LOTE
// ==========================================
function handleFormSubmit(e) {
  e.preventDefault();

  const cultivo = getEffectiveCrop();
  const fecha = elements.inputFecha ? elements.inputFecha.value : '';
  const cantidadStr = elements.inputCantidad ? elements.inputCantidad.value : '';
  const cantidad = parseFloat(cantidadStr);
  const unidad = elements.inputUnidad ? elements.inputUnidad.value : 'kg';
  const parcela = elements.inputParcela ? elements.inputParcela.value.trim() : 'Sin especificar';
  const productor = elements.inputProductor ? elements.inputProductor.value.trim() : 'Productor General';
  const metodo = elements.inputMetodo ? elements.inputMetodo.value : 'Manual';
  const notas = elements.inputNotas ? elements.inputNotas.value.trim() : '';

  // Validación estricta de requerimientos obligatorios
  let hasErrors = false;

  // 1. Validar Cultivo
  const errCultivo = document.getElementById('error-cultivo');
  if (!cultivo || cultivo === '') {
    showFieldError(elements.inputCultivo, errCultivo, 'Debes seleccionar o indicar un cultivo.');
    hasErrors = true;
  } else {
    clearFieldError(elements.inputCultivo, errCultivo);
  }

  // Si seleccionó 'Otro' pero dejó vacío el texto
  if (elements.inputCultivo.value === 'Otro' && (!elements.inputCustomCultivo.value.trim())) {
    showFieldError(elements.inputCustomCultivo, errCultivo, 'Por favor escribe el nombre del cultivo.');
    hasErrors = true;
  }

  // 2. Validar Fecha
  const errFecha = document.getElementById('error-fecha');
  if (!fecha) {
    showFieldError(elements.inputFecha, errFecha, 'La fecha de cosecha es obligatoria.');
    hasErrors = true;
  } else {
    clearFieldError(elements.inputFecha, errFecha);
  }

  // 3. Validar Cantidad
  const errCantidad = document.getElementById('error-cantidad');
  if (isNaN(cantidad) || cantidad <= 0) {
    showFieldError(elements.inputCantidad, errCantidad, 'Ingresa una cantidad cosechada válida mayor a 0.');
    hasErrors = true;
  } else {
    clearFieldError(elements.inputCantidad, errCantidad);
  }

  if (hasErrors) {
    showToast('Por favor completa todos los campos obligatorios.', 'error');
    return;
  }

  // Generar Código Único definitivo para este lote
  const uniqueCode = generateUniqueLotCode(cultivo, fecha);

  // Crear objeto del lote
  const newLot = {
    id: uniqueCode,
    cultivo,
    variedad: cultivo.includes('Café') ? 'Supremo' : 'Estándar',
    fecha,
    cantidad,
    unidad,
    parcela: parcela || 'Parcela Principal',
    productor: productor || 'Productor Registrado',
    metodo: metodo || 'Cosecha Manual',
    estado: 'Trazabilidad Iniciada',
    notas,
    createdAt: new Date().toISOString()
  };

  // Guardar en el estado al inicio de la lista
  state.lots.unshift(newLot);
  saveLotsToStorage();

  // Limpiar campos del formulario
  resetForm();

  // Actualizar UI
  render();

  // Notificación de éxito
  showToast(`¡Lote ${uniqueCode} registrado exitosamente! Trazabilidad iniciada.`, 'success');

  // Abre automáticamente el modal del lote recién registrado para ver el pasaporte de trazabilidad
  setTimeout(() => {
    openModal(newLot);
  }, 400);
}

function showFieldError(inputEl, errorEl, msg) {
  if (inputEl) inputEl.classList.add('is-invalid');
  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.classList.add('visible');
  }
}

function clearFieldError(inputEl, errorEl) {
  if (inputEl) inputEl.classList.remove('is-invalid');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
}

function resetForm() {
  if (elements.form) elements.form.reset();
  if (elements.inputCustomCultivoGroup) elements.inputCustomCultivoGroup.style.display = 'none';
  setDefaultHarvestDate();
  updateCodePreview();
}

// ==========================================
// RENDERIZADO Y FILTRADO
// ==========================================
function getFilteredLots() {
  return state.lots.filter(lot => {
    // Filtro por Cultivo
    const matchesCrop = (state.currentFilterCrop === 'ALL') || (lot.cultivo === state.currentFilterCrop);

    // Filtro por Búsqueda (Código, Cultivo, Parcela, Productor)
    const matchesSearch = !state.searchQuery || 
      lot.id.toLowerCase().includes(state.searchQuery) ||
      lot.cultivo.toLowerCase().includes(state.searchQuery) ||
      (lot.parcela && lot.parcela.toLowerCase().includes(state.searchQuery)) ||
      (lot.productor && lot.productor.toLowerCase().includes(state.searchQuery));

    return matchesCrop && matchesSearch;
  });
}

function render() {
  const filtered = getFilteredLots();
  updateKPIs();

  // Manejo de Estado Vacío
  if (filtered.length === 0) {
    if (elements.lotsContainer) elements.lotsContainer.style.display = 'none';
    if (elements.tableContainer) elements.tableContainer.classList.remove('active');
    if (elements.emptyState) elements.emptyState.style.display = 'flex';
    return;
  }

  if (elements.emptyState) elements.emptyState.style.display = 'none';

  if (state.activeView === 'grid') {
    if (elements.lotsContainer) {
      elements.lotsContainer.style.display = 'grid';
      elements.lotsContainer.innerHTML = '';
      filtered.forEach(lot => {
        elements.lotsContainer.appendChild(createLotCardElement(lot));
      });
    }
    if (elements.tableContainer) elements.tableContainer.classList.remove('active');
  } else {
    if (elements.lotsContainer) elements.lotsContainer.style.display = 'none';
    if (elements.tableContainer) {
      elements.tableContainer.classList.add('active');
      renderTableRows(filtered);
    }
  }
}

/**
 * Crea la tarjeta visual de un lote para el Grid
 */
function createLotCardElement(lot) {
  const card = document.createElement('div');
  card.className = 'lot-card';
  card.setAttribute('data-id', lot.id);

  const emoji = (CROPS_CONFIG[lot.cultivo] && CROPS_CONFIG[lot.cultivo].emoji) || '🌱';
  const formattedDate = formatDateDisplay(lot.fecha);
  const formattedNumber = new Intl.NumberFormat('es-CO').format(lot.cantidad);

  card.innerHTML = `
    <div class="lot-card-header">
      <div class="lot-crop-info">
        <div class="crop-avatar" title="${lot.cultivo}">${emoji}</div>
        <div>
          <h4 class="crop-name">${escapeHTML(lot.cultivo)}</h4>
          <span class="crop-variety">${escapeHTML(lot.parcela || 'Parcela no asignada')}</span>
        </div>
      </div>
      <div class="status-badge">
        <span class="status-badge-dot"></span>
        ${lot.estado || 'Trazabilidad Iniciada'}
      </div>
    </div>

    <div class="lot-code-box">
      <div>
        <div class="lot-code-label">Código Único de Trazabilidad</div>
        <div class="lot-code-value">${lot.id}</div>
      </div>
      <button class="btn-copy-code" title="Copiar código al portapapeles" onclick="copyLotCode('${lot.id}')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
    </div>

    <div class="lot-meta-grid">
      <div class="lot-meta-item">
        <span class="lot-meta-title">Fecha Cosecha</span>
        <span class="lot-meta-val">${formattedDate}</span>
      </div>
      <div class="lot-meta-item">
        <span class="lot-meta-title">Cantidad Cosechada</span>
        <span class="lot-meta-val">
          ${formattedNumber} <span class="lot-meta-unit">${lot.unidad}</span>
        </span>
      </div>
    </div>

    <div class="lot-actions">
      <button class="btn-view-trace" onclick="viewLotDetails('${lot.id}')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        Ver Pasaporte & QR
      </button>
      <button class="btn-delete-lot" title="Eliminar registro" onclick="deleteLot('${lot.id}')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  `;

  return card;
}

/**
 * Renderiza filas en la vista de tabla
 */
function renderTableRows(lots) {
  if (!elements.tableBody) return;
  elements.tableBody.innerHTML = '';

  lots.forEach(lot => {
    const tr = document.createElement('tr');
    const emoji = (CROPS_CONFIG[lot.cultivo] && CROPS_CONFIG[lot.cultivo].emoji) || '🌱';
    const formattedDate = formatDateDisplay(lot.fecha);
    const formattedNumber = new Intl.NumberFormat('es-CO').format(lot.cantidad);

    tr.innerHTML = `
      <td><span class="mono font-bold" style="color: var(--primary-800);">${lot.id}</span></td>
      <td>
        <span style="display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 600;">
          ${emoji} ${escapeHTML(lot.cultivo)}
        </span>
      </td>
      <td>${formattedDate}</td>
      <td><strong>${formattedNumber}</strong> ${lot.unidad}</td>
      <td>${escapeHTML(lot.parcela || '-')}</td>
      <td>
        <span class="status-badge">
          <span class="status-badge-dot"></span>
          ${lot.estado || 'Iniciado'}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 0.35rem;">
          <button class="btn-secondary" style="padding: 0.35rem 0.6rem; font-size: 0.78rem;" onclick="viewLotDetails('${lot.id}')">
            Detalles
          </button>
          <button class="btn-delete-lot" onclick="deleteLot('${lot.id}')" title="Eliminar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    `;
    elements.tableBody.appendChild(tr);
  });
}

/**
 * Actualiza las tarjetas de métricas / KPIs
 */
function updateKPIs() {
  const totalLots = state.lots.length;
  const totalVolume = state.lots.reduce((acc, lot) => acc + (Number(lot.cantidad) || 0), 0);
  const uniqueCrops = new Set(state.lots.map(l => l.cultivo)).size;

  if (elements.kpiTotalLots) {
    elements.kpiTotalLots.textContent = totalLots;
  }
  if (elements.kpiTotalVolume) {
    elements.kpiTotalVolume.textContent = `${new Intl.NumberFormat('es-CO').format(totalVolume)} kg`;
  }
  if (elements.kpiActiveCrops) {
    elements.kpiActiveCrops.textContent = uniqueCrops;
  }
  if (elements.kpiLastDate) {
    if (state.lots.length > 0) {
      const dates = state.lots.map(l => l.fecha).sort().reverse();
      elements.kpiLastDate.textContent = formatDateDisplay(dates[0]);
    } else {
      elements.kpiLastDate.textContent = 'Ninguno';
    }
  }
}

// ==========================================
// MODAL DE TRAZABILIDAD Y GENERADOR DE QR
// ==========================================
window.viewLotDetails = function(lotId) {
  const lot = state.lots.find(l => l.id === lotId);
  if (lot) {
    openModal(lot);
  }
};

function openModal(lot) {
  if (!elements.modal || !elements.modalContent) return;

  const emoji = (CROPS_CONFIG[lot.cultivo] && CROPS_CONFIG[lot.cultivo].emoji) || '🌱';
  const qrSvg = generateSVGQRCode(lot.id, lot.cultivo, lot.cantidad, lot.unidad, lot.fecha);
  const formattedDate = formatDateDisplay(lot.fecha);
  const formattedNumber = new Intl.NumberFormat('es-CO').format(lot.cantidad);

  elements.modalContent.innerHTML = `
    <div class="passport-header">
      <div class="passport-qr">
        ${qrSvg}
      </div>
      <div class="passport-details">
        <div class="passport-title">${emoji} ${escapeHTML(lot.cultivo)}</div>
        <div class="passport-code">${lot.id}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          <strong>Productor:</strong> ${escapeHTML(lot.productor || 'Productor Registrado')} | 
          <strong>Ubicación:</strong> ${escapeHTML(lot.parcela || 'General')}
        </div>
        <span class="status-badge">
          <span class="status-badge-dot"></span> Trazabilidad Iniciada con Éxito
        </span>
      </div>
    </div>

    <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem;">
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; text-align: center;">
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Fecha de Cosecha</span>
          <div style="font-size: 1rem; font-weight: 800; color: var(--text-main);">${formattedDate}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Cantidad Registrada</span>
          <div style="font-size: 1rem; font-weight: 800; color: var(--primary-700);">${formattedNumber} ${lot.unidad}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Método Cosecha</span>
          <div style="font-size: 1rem; font-weight: 800; color: var(--text-main);">${escapeHTML(lot.metodo || 'Manual')}</div>
        </div>
      </div>
      ${lot.notas ? `
        <div style="margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px dashed var(--border-color); font-size: 0.82rem; color: var(--text-muted);">
          <strong>Observaciones de Campo:</strong> ${escapeHTML(lot.notas)}
        </div>
      ` : ''}
    </div>

    <div>
      <div class="timeline-title">Cadena de Trazabilidad del Lote</div>
      <div class="timeline">
        <div class="timeline-step completed">
          <div class="timeline-dot">✓</div>
          <div class="timeline-content-title">1. Registro de Cosecha (Completado)</div>
          <div class="timeline-content-desc">Lote recolectado y asignado con código único <strong>${lot.id}</strong> el ${formattedDate}. Registro formal para inicio de cadena de custodia.</div>
        </div>
        <div class="timeline-step active">
          <div class="timeline-dot">2</div>
          <div class="timeline-content-title">2. Recepción y Pesaje en Centro de Acopio (En Progreso)</div>
          <div class="timeline-content-desc">Verificación física de ${formattedNumber} ${lot.unidad} y control inicial de humedad e impurezas.</div>
        </div>
        <div class="timeline-step">
          <div class="timeline-dot">3</div>
          <div class="timeline-content-title">3. Control de Calidad y Clasificación</div>
          <div class="timeline-content-desc">Toma de muestras fitosanitarias, grado de madurez y certificación de origen.</div>
        </div>
        <div class="timeline-step">
          <div class="timeline-dot">4</div>
          <div class="timeline-content-title">4. Empaque, Rotulado y Despacho</div>
          <div class="timeline-content-desc">Generación de etiquetas finales con código QR para trazabilidad al consumidor.</div>
        </div>
      </div>
    </div>
  `;

  elements.modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!elements.modal) return;
  elements.modal.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Generador SVG de código QR autónomo y reproducible
 * No requiere librerías externas ni conexión a internet
 */
function generateSVGQRCode(code, crop, quantity, unit, date) {
  // Genera un patrón de matriz visual estilo QR consistente basado en el hash del código
  const size = 21;
  const matrix = Array(size).fill(0).map(() => Array(size).fill(0));

  // Función para calcular un hash simple del código
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = ((hash << 5) - hash) + code.charCodeAt(i);
    hash |= 0;
  }

  // Patrones de esquinas (Finder Patterns obligatorios de QR)
  function drawFinder(r, c) {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          matrix[r + i][c + j] = 1;
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Líneas de sincronización (Timing patterns)
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = (i % 2 === 0) ? 1 : 0;
    matrix[i][6] = (i % 2 === 0) ? 1 : 0;
  }

  // Rellenar datos simulados con el hash del código
  let seed = Math.abs(hash);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Si no es parte de los patrones de esquina ni sincronización
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= size - 8) ||
        (r >= size - 8 && c < 8) ||
        r === 6 || c === 6
      ) {
        continue;
      }
      seed = (seed * 9301 + 49297) % 233280;
      matrix[r][c] = (seed % 2 === 0) ? 1 : 0;
    }
  }

  // Construir SVG
  const cellSize = 5;
  const viewBoxSize = size * cellSize;
  let rects = '';

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#064e3b" />`;
      }
    }
  }

  return `
    <svg viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect width="100%" height="100%" fill="white" />
      ${rects}
    </svg>
  `;
}

// ==========================================
// FUNCIONES AUXILIARES GLOBALES
// ==========================================
window.copyLotCode = function(code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast(`Código ${code} copiado al portapapeles`, 'success');
  }).catch(() => {
    showToast(`Código: ${code}`, 'success');
  });
};

window.deleteLot = function(lotId) {
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot) return;

  if (confirm(`¿Estás seguro de eliminar el lote "${lot.id}" de ${lot.cultivo}? Esta acción no se puede deshacer.`)) {
    state.lots = state.lots.filter(l => l.id !== lotId);
    saveLotsToStorage();
    render();
    showToast(`Lote ${lotId} eliminado del registro.`, 'error');
  }
};

function formatDateDisplay(dateStr) {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${day} ${months[monthIndex]} ${year}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function showToast(message, type = 'success') {
  if (!elements.toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `${icon}<span>${escapeHTML(message)}</span>`;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
