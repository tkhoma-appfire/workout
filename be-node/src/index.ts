import "./env.js";
import { Pool } from "pg";
import { createApp } from "./app.js";
import { getDatabaseConfig } from "./db/config.js";
import { runMigrations } from "./db/migrate.js";

const port = Number(process.env.PORT ?? 8081);

async function main() {
  const pool = new Pool(getDatabaseConfig());
  await runMigrations(pool);

  const app = createApp(pool);
  app.listen(port, () => {
    console.log(`workout-be-node listening on http://localhost:${port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
