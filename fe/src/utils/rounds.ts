import { isValidMmSs, normalizeMmSs } from "@/utils/timeFormat";

export type RoundsBlockProgressive = {
  type: "progressive";
  from: number;
  to: number;
};

export type RoundsBlockFixed = {
  type: "fixed";
  reps: number;
  rounds: number;
};

export type RoundsBlock = RoundsBlockProgressive | RoundsBlockFixed;

export type RoundsRest = {
  duration: number;
  unit: "min" | "sec";
  note?: string;
};

export type RoundsData = {
  weights: number[];
  blocks: RoundsBlock[];
  useWeights?: boolean;
  useTimePerEx?: boolean;
  timePerEx?: string;
  rest?: RoundsRest;
};

export type ParsedRounds = {
  data: RoundsData;
  isLegacy: boolean;
  legacyText?: string;
};

const emptyRoundsData = (): RoundsData => ({
  weights: [16],
  useWeights: true,
  blocks: [{ type: "progressive", from: 1, to: 11 }],
});

const normalizeBlock = (block: RoundsBlock): RoundsBlock => {
  if (block.type === "progressive") {
    return {
      type: "progressive",
      from: Math.max(1, Math.floor(block.from)),
      to: Math.max(1, Math.floor(block.to)),
    };
  }

  return {
    type: "fixed",
    reps: Math.max(1, Math.floor(block.reps)),
    rounds: Math.max(1, Math.floor(block.rounds)),
  };
};

const normalizeRounds = (
  raw: Partial<RoundsData> & {
    useTimePerRound?: boolean;
    timePerRound?: string | number;
  },
): RoundsData => {
  const weights = (raw.weights ?? [])
    .map((weight) => Number(weight))
    .filter((weight) => Number.isFinite(weight) && weight > 0);

  const blocks = (raw.blocks ?? [])
    .map((block) => normalizeBlock(block as RoundsBlock))
    .filter((block) => block.type === "progressive" || block.type === "fixed");

  const rest = raw.rest
    ? {
      duration: Math.max(1, Math.floor(Number(raw.rest.duration))),
      unit: raw.rest.unit === "sec" ? "sec" as const : "min" as const,
      note: raw.rest.note?.trim() || undefined,
    }
    : undefined;

  const timePerEx = normalizeMmSs(raw.timePerEx ?? raw.timePerRound);

  const useWeights = raw.useWeights !== false;

  const useTimePerEx = raw.useTimePerEx === false || raw.useTimePerRound === false
    ? false
    : raw.useTimePerEx === true || raw.useTimePerRound === true || timePerEx != null;

  return {
    weights: weights.length > 0 ? weights : [16],
    blocks: blocks.length > 0 ? blocks : [{ type: "progressive", from: 1, to: 11 }],
    useWeights,
    useTimePerEx,
    timePerEx,
    rest,
  };
};

export function createDefaultRounds(): string {
  return serializeRounds(emptyRoundsData());
}

export function parseRounds(raw: string): ParsedRounds {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return { data: emptyRoundsData(), isLegacy: false };
  }

  try {
    const parsed = JSON.parse(trimmed) as Partial<RoundsData> & {
      useTimePerRound?: boolean;
      timePerRound?: string | number;
    };
    if (Array.isArray(parsed.weights) && Array.isArray(parsed.blocks)) {
      return { data: normalizeRounds(parsed), isLegacy: false };
    }
  } catch {
    // fall through to legacy text
  }

  return {
    data: emptyRoundsData(),
    isLegacy: true,
    legacyText: trimmed,
  };
}

export function serializeRounds(data: RoundsData): string {
  return JSON.stringify({
    v: 1,
    weights: data.weights,
    blocks: data.blocks,
    ...(data.useWeights === false ? { useWeights: false } : {}),
    ...(data.useTimePerEx ? { useTimePerEx: true } : {}),
    ...(data.timePerEx ? { timePerEx: data.timePerEx } : {}),
    ...(data.rest ? { rest: data.rest } : {}),
  });
}

const formatWeights = (weights: number[]): string => weights.join("кг + ");

const formatBlock = (block: RoundsBlock): string => {
  if (block.type === "progressive") {
    return `${block.from}-${block.to}`;
  }

  return `${block.reps}р - ${block.rounds}к`;
};

const formatRest = (rest: RoundsRest): string => {
  const unit = rest.unit === "min" ? "хв" : "с";
  const note = rest.note ? ` – ${rest.note}` : "";
  return `${rest.duration}${unit}${note}`;
};

export function formatRoundsDisplay(raw: string): string {
  const parsed = parseRounds(raw);
  if (parsed.isLegacy) {
    return parsed.legacyText ?? raw;
  }

  return formatRoundsData(parsed.data);
}

export function formatRoundsData(data: RoundsData): string {
  const weights = data.useWeights !== false
    ? data.weights.filter((weight) => weight > 0)
    : [];
  const blocksText = data.blocks
    .map((block, index) => (
      data.blocks.length > 1
        ? `${index + 1}. ${formatBlock(block)}`
        : formatBlock(block)
    ))
    .join(", ");
  const showTimePerEx = data.useTimePerEx && data.timePerEx;

  let result = "";
  if (weights.length > 0) {
    const weightsText = formatWeights(weights) + "кг,";
    result = showTimePerEx
      ? `${weightsText}, ${data.timePerEx}/вправа`
      : `${weightsText}.`;
  } else if (showTimePerEx) {
    result = `${data.timePerEx}/вправа`;
  }
  if (blocksText) {
    result = result ? `${result} ${blocksText}` : blocksText;
  }
  if (data.rest?.duration) {
    const restText = formatRest(data.rest);
    result = result ? `${result}; ${restText}` : restText;
  }

  return result.trim();
}

export function isValidRoundsData(data: RoundsData): boolean {
  const hasWeights = data.useWeights === false
    || data.weights.some((weight) => weight > 0);
  const hasBlocks = data.blocks.length > 0 && data.blocks.every((block) => {
    if (block.type === "progressive") {
      return block.from > 0 && block.to >= block.from;
    }

    return block.reps > 0 && block.rounds > 0;
  });

  const restValid = !data.rest || data.rest.duration > 0;
  const timePerExValid = !data.useTimePerEx
    || (data.timePerEx != null && isValidMmSs(data.timePerEx));

  return hasWeights && hasBlocks && restValid && timePerExValid;
}

export function isValidRounds(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) {
    return false;
  }

  const parsed = parseRounds(trimmed);
  if (parsed.isLegacy) {
    return true;
  }

  return isValidRoundsData(parsed.data);
}
