import {API_BASE_URL} from '../config/api';

export function apiUrl(path: string): string {
  // Site root only — paths already include `/api/...` (same as fe `apiUrl`).
  const base = API_BASE_URL.trim().replace(/\/+$/, '').replace(/\/api$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
