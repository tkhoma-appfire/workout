export type MigrationFile = {
  version: string;
  description: string;
  filename: string;
  path: string;
  sql: string;
  checksum: number;
};

export type AppliedMigration = {
  version: string | null;
  description: string;
  script: string;
  success: boolean;
};
