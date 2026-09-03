import { Platform } from 'react-native';

const DEFAULT_LOCAL_API_URL =
  Platform.OS === 'android'
    ? 'http://192.168.100.9/projumi'
    : 'http://localhost/projumi';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const trimLeadingSlash = (value) => value.replace(/^\/+/, '');

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || DEFAULT_LOCAL_API_URL;

export const buildApiUrl = (path = '') => {
  const normalizedBaseUrl = trimTrailingSlash(API_BASE_URL);
  const normalizedPath = path ? `/${trimLeadingSlash(path)}` : '';

  return `${normalizedBaseUrl}${normalizedPath}`;
};
