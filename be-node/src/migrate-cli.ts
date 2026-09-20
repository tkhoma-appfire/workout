import "./env.js";
import { getMigrationInfo, runMigrations } from "./db/migrate.js";

const command = process.argv[2] ?? "migrate";

async function main() {
  if (command === "info") {
    const info = await getMigrationInfo();
    console.log(`Migrations dir: ${info.migrationsDir}`);
    console.log(`Applied (${info.applied.length}):`);
    info.applied.forEach((migration) => console.log(`  - ${migration}`));
    console.log(`Pending (${info.pending.length}):`);
    info.pending.forEach((migration) => console.log(`  - ${migration}`));
    return;
  }

  if (command === "migrate") {
    await runMigrations();
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
