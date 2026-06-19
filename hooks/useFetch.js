import { useState, useEffect, useCallback } from 'react';

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

const useFetch = (URL, options = {}, enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const optionsKey = JSON.stringify(options || {});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(URL, options);
      const { payload, rawText } = await readResponseSafely(response);

      console.log('useFetch:', {
        url: URL,
        ok: response.ok,
        status: response.status,
        rawText,
        payload,
      });

      if (!response.ok) {
        const errorMessage =
          payload?.message ||
          payload?.error ||
          payload?.msg ||
          rawText ||
          `Error: ${response.status}`;
        throw new Error(errorMessage);
      }

      if (payload === null) {
        throw new Error('La API devolvió una respuesta vacía.');
      }

      setData(payload);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [URL, optionsKey]);

  useEffect(() => {
    if (enabled) {
      fetchData();
      return;
    }

    setLoading(false);
  }, [fetchData, enabled]);

  const refetch = () => {
    if (enabled) {
      fetchData();
    }
  };

  return { data, loading, error, refetch };
};

export default useFetch;
