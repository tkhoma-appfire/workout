import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const projectRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..");

function loadEnvFile(fileName: string, override = false): void {
  const filePath = join(projectRoot, fileName);
  if (existsSync(filePath)) {
    config({ path: filePath, override });
  }
}

// Vercel injects env vars at runtime — do not read .env files there.
if (!process.env.VERCEL) {
  loadEnvFile(".env");
}
