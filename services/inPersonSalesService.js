import { buildApiUrl } from '../config/api';

const stripBom = (text = '') => text.replace(/^\uFEFF/, '').trim();

const request = async (path, token, options = {}) => {
  const response = await fetch(buildApiUrl(path), {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body,
  });
  const rawText = await response.text();
  let payload = {};

  try {
    payload = rawText ? JSON.parse(stripBom(rawText)) : {};
  } catch {
    payload = { message: stripBom(rawText) };
  }

  if (!response.ok) {
    throw new Error(payload.message || payload.error || `Error HTTP ${response.status}`);
  }

  return payload;
};

export const fetchInPersonSales = (token) =>
  request('/ventaspresencial/apiMostrarVentas', token);

export const fetchInPersonSaleDetail = (saleId, token) =>
  request('/ventaspresencial/apiDetalleVenta', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_pedido: Number(saleId) }),
  });

export const fetchInPersonProducts = (token) =>
  request('/ventaspresencial/apiProductos', token);

export const fetchInPersonPaymentMethods = (token) =>
  request('/ventaspresencial/apiMetodosPago', token);

export const fetchInPersonCurrencies = (methodId, token) =>
  request(
    `/ventaspresencial/apiMonedasPorMetodo?idMetodo=${encodeURIComponent(methodId)}`,
    token
  );

export const findInPersonClient = (cedula, token) =>
  request(
    `/ventaspresencial/apiConsultarCliente?cedula=${encodeURIComponent(cedula)}`,
    token
  );

export const registerInPersonSale = (sale, token) =>
  request('/ventaspresencial/apiRegistrarVenta', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale),
  });

export const fetchInPersonBcvRate = async (token) => {
  const payload = await request('/tasa/consultarTasaBcv', token);
  return Number(payload?.data?.tasa_cambio || payload?.tasa_cambio || 0);
};
