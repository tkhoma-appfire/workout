/**
 * Full URL of your Vercel deployment (no trailing slash).
 * Same value as `VITE_API_BASE_URL` when pointing the web app at a remote API.
 *
 * Emulator + local API: http://10.0.2.2:8081
 */
export const API_BASE_URL = 'https://workout-delta-livid.vercel.app';

export function isApiConfigured(): boolean {
  const trimmed = API_BASE_URL.trim();
  return (
    trimmed.length > 0
    && !trimmed.includes('YOUR_VERCEL_APP')
    && trimmed !== 'http://localhost'
  );
}
