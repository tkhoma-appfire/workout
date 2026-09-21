// Same-origin on Vercel (fe + be-node). For split local dev, set VITE_API_BASE_URL in fe/.env.local.
export const BASE_URL_DEVELOPMENT = import.meta.env.VITE_API_BASE_URL ?? "";
