import AdmZip from "adm-zip";
import type { Pool } from "pg";
import { findAllWorkoutsForExport, type ExportWorkoutRow } from "../repositories/workoutRepository.js";
import type { WorkoutCsv } from "../types/workoutCsv.js";
import { formatIsoDate } from "../util/dateFormat.js";

const CSV_HEADERS: (keyof WorkoutCsv)[] = [
  "date",
  "exercise_time",
  "calories",
  "puls",
  "max_puls",
  "intensive",
  "aerobish",
  "anaerobish",
  "training_load",
  "rounds",
  "comment",
  "exercises",
];

function toCsvField(value: string | number | null | undefined): string {
  if (value == null) {
    return "";
  }

  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function formatExercises(rows: ExportWorkoutRow[]): string {
  const parts = rows
    .filter((row) => row.name != null)
    .map((row) => (
      `{name: "${row.name}" ,weight: ${row.weight ?? 0}, order: ${row.ex_order ?? 0}}`
    ));

  return `[${parts.join(",")}]`;
}

function mapWorkoutRows(rows: ExportWorkoutRow[]): WorkoutCsv {
  const first = rows[0];
  if (!first) {
    throw new Error("Cannot map empty workout rows");
  }

  return {
    date: formatIsoDate(first.date),
    exercise_time: String(first.exercise_time ?? ""),
    calories: String(first.calories ?? ""),
    puls: String(first.puls ?? ""),
    max_puls: String(first.puls_max ?? ""),
    intensive: first.intensive ?? "",
    aerobish: first.aero ?? "",
    anaerobish: first.anaero ?? "",
    training_load: String(first.tl ?? ""),
    rounds: first.rounds ?? "",
    comment: first.comment ?? "",
    exercises: formatExercises(rows),
  };
}

function mapToCsvModels(rows: ExportWorkoutRow[]): WorkoutCsv[] {
  const byId = new Map<string, ExportWorkoutRow[]>();

  for (const row of rows) {
    if (!row.id) {
      continue;
    }

    const group = byId.get(row.id) ?? [];
    group.push(row);
    byId.set(row.id, group);
  }

  return Array.from(byId.values())
    .map((workoutRows) => mapWorkoutRows(workoutRows))
    .sort((left, right) => right.date.localeCompare(left.date));
}

function createCsvContent(csvData: WorkoutCsv[]): string {
  const lines = [
    CSV_HEADERS.join(","),
    ...csvData.map((row) => CSV_HEADERS.map((header) => toCsvField(row[header])).join(",")),
  ];

  return `${lines.join("\n")}\n`;
}

export async function exportCsv(pool: Pool): Promise<Buffer | null> {
  const rows = await findAllWorkoutsForExport(pool);
  if (rows.length === 0) {
    return null;
  }

  const csvContent = createCsvContent(mapToCsvModels(rows));
  const zip = new AdmZip();
  zip.addFile("workouts.csv", Buffer.from(csvContent, "utf8"));
  return zip.toBuffer();
}
