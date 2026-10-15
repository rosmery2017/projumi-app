import { buildApiUrl } from '../config/api';

const DEFAULT_IMAGE_PATH = '/public/img/default_profile.png';

export const getImageUrl = (imagePath, fallbackPath = DEFAULT_IMAGE_PATH) => {
  const rawPath = String(imagePath || fallbackPath || '').trim();

  if (!rawPath) {
    return null;
  }

  if (/^https?:\/\//i.test(rawPath)) {
    try {
      const url = new URL(rawPath);
      const projumiIndex = url.pathname.toLowerCase().indexOf('/projumi/');

      if (projumiIndex >= 0) {
        return buildApiUrl(url.pathname.slice(projumiIndex + '/projumi/'.length));
      }

      return rawPath;
    } catch {
      return rawPath;
    }
  }

  const normalizedPath = rawPath
    .replace(/\\/g, '/')
    .replace(/^(\.\.\/)+/, '')
    .replace(/^\.\/+/, '')
    .replace(/^\/+/, '')
    .replace(/^projumi\//i, '');

  return buildApiUrl(normalizedPath);
};
