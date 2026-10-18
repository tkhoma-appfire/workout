export type TrainingLoadLevel = 'rest' | 'light' | 'moderate' | 'heavy';

/** Absolute bands aligned with heatmap defaults (20 / 35). */
export function classifyTrainingLoad(load: unknown): TrainingLoadLevel {
  const value = Number(load);
  if (!Number.isFinite(value) || value <= 0) {
    return 'rest';
  }
  if (value < 20) {
    return 'light';
  }
  if (value < 35) {
    return 'moderate';
  }
  return 'heavy';
}

export function trainingLoadLabel(level: TrainingLoadLevel): string {
  switch (level) {
    case 'light':
      return 'Light';
    case 'moderate':
      return 'Moderate';
    case 'heavy':
      return 'Heavy';
    default:
      return 'Rest';
  }
}
