import { buildApiUrl } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGIN_ENDPOINT = '/home/api_login';

const normalizeText = (value) =>
  typeof value === 'string' ? value.trim() : '';

const readResponseSafely = async (response) => {
  const text = await response.text();
  const normalizedText = text.replace(/^\uFEFF/, '').trim();

  if (!normalizedText) {
    return { payload: null, rawText: '' };
  }

  try {
    return { payload: JSON.parse(normalizedText), rawText: text };
  } catch {
    return { payload: { message: normalizedText }, rawText: text };
  }
};

const getMessageFromPayload = (payload, fallbackMessage) => {
  if (!payload) {
    return fallbackMessage;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  return (
    payload.message ||
    payload.error ||
    payload.msg ||
    payload.detail ||
    payload.description ||
    fallbackMessage
  );
};

const extractUser = (payload, fallbackCedula) => {
  if (payload?.user && typeof payload.user === 'object') {
    return payload.user;
  }

  return {
    cedula: fallbackCedula,
    name: fallbackCedula,
    raw: payload,
  };
};

export const loginWithBackend = async ({ cedula, password }) => {
  const loginValue = normalizeText(cedula);
  const normalizedPassword = normalizeText(password);

  let response;

  try {
    response = await fetch(buildApiUrl(LOGIN_ENDPOINT), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cedula: loginValue,
        password: normalizedPassword,
      }),
    });
  } catch (error) {
    throw new Error(
      `No se pudo conectar con el backend en ${buildApiUrl(
        LOGIN_ENDPOINT
      )}. Verifica que el celular y la PC esten en la misma red y que Apache permita conexiones.`
    );
  }

  const { payload, rawText } = await readResponseSafely(response);

  console.log('Respuesta login:', payload);
  if (rawText) {
    console.log('Respuesta login cruda:', rawText);
  }

  if (!response.ok || payload?.success === false) {
    if (rawText && !payload?.message && !payload?.error) {
      throw new Error(
        `El backend respondió con ${response.status}. Revisa la consola para ver el contenido de la respuesta.`
      );
    }

    throw new Error(
      getMessageFromPayload(
        payload,
        `No se pudo iniciar sesion (HTTP ${response.status})`
      )
    );
  }

  if (!payload?.token) {
    throw new Error(
      'El backend no devolvió un token JWT válido.'
    );
  }

  // Guardar JWT
  await AsyncStorage.setItem(
    'jwt_token',
    payload.token
  );

  // Guardar usuario (opcional)
  if (payload.user) {
    await AsyncStorage.setItem(
      'user_data',
      JSON.stringify(payload.user)
    );
  }

  return {
    token: payload.token,
    user: extractUser(payload, loginValue),
    raw: payload,
    endpoint: LOGIN_ENDPOINT,
  };
};
