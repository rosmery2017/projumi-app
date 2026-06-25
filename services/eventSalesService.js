import { buildApiUrl } from '../config/api';

const VENTAS_LOTE_INDEX_PATH = '/ventaslote/index';
const VENTAS_LOTE_LIST_PATH = '/ventaslote/mostrarVentas';
const VENTAS_LOTE_DETAIL_PATH = '/ventaslote/detalleVentaEvento';
const VENTAS_LOTE_REGISTER_PATH = '/ventaslote/registrarVentaEvento';
const PRODUCTOS_EMPRENDEDOR_PATH = '/productos/mostrarProductosPorEmprendedor';
const MONEDAS_POR_METODO_PATH = '/pagos/monedasPorMetodo';
const TASA_CAMBIO_PATH = '/tasa/consultarTasaBcv';

const FALLBACK_PAYMENT_METHODS = [
  { id_metodo_pago: '1', nombre: 'Efectivo' },
  { id_metodo_pago: '2', nombre: 'Transferencia' },
  { id_metodo_pago: '3', nombre: 'Pago movil' },
];

const stripBom = (value = '') => value.replace(/^\uFEFF/, '').trim();
const isHtmlDocument = (value = '') => /^<(?:!doctype|html)\b/i.test(stripBom(value));

const decodeHtmlEntities = (value = '') =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

const createHeaders = (token, accept = 'application/json', extras = {}) => {
  const headers = {
    Accept: accept,
    ...extras,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const readResponse = async (response) => {
  const rawText = await response.text();
  const normalizedText = stripBom(rawText);

  if (!normalizedText) {
    return { payload: null, rawText };
  }

  if (isHtmlDocument(normalizedText)) {
    return {
      payload: {
        message:
          'El backend devolvio HTML en lugar de JSON. Verifica que la sesion PHP del modulo de ventas por evento siga activa.',
      },
      rawText,
    };
  }

  try {
    return { payload: JSON.parse(normalizedText), rawText };
  } catch {
    return { payload: { message: normalizedText }, rawText };
  }
};

const requestJson = async (path, token, options = {}) => {
  const response = await fetch(buildApiUrl(path), {
    method: options.method || 'GET',
    headers: createHeaders(token, 'application/json', options.headers || {}),
    body: options.body,
    credentials: 'include',
  });

  const { payload, rawText } = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      payload?.message || payload?.error || rawText || `Error HTTP ${response.status}`
    );
  }

  return payload;
};

const requestText = async (path, token) => {
  const response = await fetch(buildApiUrl(path), {
    method: 'GET',
    headers: createHeaders(
      token,
      'text/html,application/xhtml+xml,application/json;q=0.9'
    ),
    credentials: 'include',
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(stripBom(text) || `Error HTTP ${response.status}`);
  }

  return text;
};

const parseSelectOptions = (html, selectId) => {
  const selectMatch = html.match(
    new RegExp(`<select[^>]*id=["']${selectId}["'][^>]*>([\\s\\S]*?)<\\/select>`, 'i')
  );

  if (!selectMatch) {
    return null;
  }

  const options = [];
  const optionRegex = /<option[^>]*value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi;
  let optionMatch = optionRegex.exec(selectMatch[1]);

  while (optionMatch) {
    const value = stripBom(optionMatch[1]);
    const label = decodeHtmlEntities(optionMatch[2].replace(/<[^>]+>/g, '').trim());

    if (value) {
      options.push({ value, label });
    }

    optionMatch = optionRegex.exec(selectMatch[1]);
  }

  return options;
};

const parsePaymentMethods = (html) => {
  const scriptMatch = html.match(/const\s+metodosPago\s*=\s*(\[[\s\S]*?\]);/i);

  if (!scriptMatch) {
    return FALLBACK_PAYMENT_METHODS;
  }

  try {
    const parsed = JSON.parse(scriptMatch[1]);
    return Array.isArray(parsed) && parsed.length ? parsed : FALLBACK_PAYMENT_METHODS;
  } catch {
    return FALLBACK_PAYMENT_METHODS;
  }
};

const normalizeProducts = (payload) => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item) => ({
    ...item,
    id_producto: Number(item.id_producto),
    precio: Number(item.precio || 0),
    stock: Number(item.stock || 0),
  }));
};

export const fetchEventSalesBootstrap = async (token) => {
  const html = await requestText(VENTAS_LOTE_INDEX_PATH, token);
  const events = parseSelectOptions(html, 'selectEvento');

  if (events === null) {
    throw new Error(
      'No se pudo acceder al formulario de ventas por evento. Verifica que el usuario tenga permisos de emprendedor y que la sesion del backend este activa.'
    );
  }

  return {
    eventos: events.map((event) => ({
      id: event.value,
      nombre: event.label,
    })),
    metodosPago: parsePaymentMethods(html).map((method) => ({
      ...method,
      id_metodo_pago: String(method.id_metodo_pago),
    })),
  };
};

export const fetchEventProducts = async (token) => {
  const payload = await requestJson(PRODUCTOS_EMPRENDEDOR_PATH, token);
  const products = normalizeProducts(payload);

  if (!products.length && payload?.message) {
    throw new Error(payload.message);
  }

  return products;
};

export const fetchEventSales = async (token) => {
  const payload = await requestJson(VENTAS_LOTE_LIST_PATH, token);

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload?.message) {
    throw new Error(payload.message);
  }

  return [];
};

export const fetchEventSaleDetail = async (eventId, token) => {
  const payload = await requestJson(VENTAS_LOTE_DETAIL_PATH, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_evento: Number(eventId) }),
  });

  if (!payload?.success) {
    throw new Error(payload?.message || 'No se pudo cargar el detalle de la venta.');
  }

  return payload;
};

export const registerEventSale = async (salePayload, token) => {
  const payload = await requestJson(VENTAS_LOTE_REGISTER_PATH, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(salePayload),
  });

  if (!payload?.success) {
    throw new Error(payload?.message || 'No se pudo registrar la venta por evento.');
  }

  return payload;
};

export const fetchCurrenciesByMethod = async (methodId, token) => {
  const payload = await requestJson(
    `${MONEDAS_POR_METODO_PATH}?idMetodo=${encodeURIComponent(methodId)}`,
    token
  );

  if (payload?.status === 'error') {
    throw new Error(payload?.message || 'No se pudieron cargar las monedas.');
  }

  return Array.isArray(payload?.data)
    ? payload.data.map((item) => ({
        value: String(item.id_detalle_pago),
        label: item.simbolo,
      }))
    : [];
};

export const fetchBcvRate = async (token) => {
  try {
    const payload = await requestJson(TASA_CAMBIO_PATH, token);
    const value = Number(payload?.data?.tasa_cambio || payload?.tasa_cambio || 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
};
