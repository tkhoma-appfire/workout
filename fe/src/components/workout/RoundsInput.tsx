import { useMemo } from "react";
import { RiCloseFill } from "react-icons/ri";
import {
  formatRoundsData,
  parseRounds,
  serializeRounds,
  type RoundsBlock,
  type RoundsData,
} from "@/utils/rounds";
import { formatMmSsInput, isAllowedMmSsInput } from "@/utils/timeFormat";

type RoundsInputProps = {
  value: string;
  onChange: (value: string) => void;
};

const inputClassName =
  "rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500";

const numberInputClassName = `${inputClassName} w-20`;

const RoundsInput = ({ value, onChange }: RoundsInputProps) => {
  const parsed = useMemo(() => parseRounds(value), [value]);
  const data = useMemo(() => {
    const { rest: _rest, ...withoutRest } = parsed.data;
    return withoutRest;
  }, [parsed]);
  const preview = formatRoundsData(data);

  const updateData = (next: RoundsData) => {
    onChange(serializeRounds(next));
  };

  const updateWeights = (weights: number[]) => {
    updateData({ ...data, weights });
  };

  const updateBlock = (index: number, block: RoundsBlock) => {
    updateData({
      ...data,
      blocks: data.blocks.map((current, blockIndex) => (
        blockIndex === index ? block : current
      )),
    });
  };

  const addWeight = () => {
    updateWeights([...data.weights, 16]);
  };

  const removeWeight = (index: number) => {
    if (data.weights.length <= 1) {
      return;
    }

    updateWeights(data.weights.filter((_, weightIndex) => weightIndex !== index));
  };

  const changeWeight = (index: number, nextValue: string) => {
    const weight = nextValue === "" ? 0 : Number(nextValue);
    updateWeights(data.weights.map((current, weightIndex) => (
      weightIndex === index
        ? (Number.isFinite(weight) ? weight : current)
        : current
    )));
  };

  const addBlock = () => {
    updateData({
      ...data,
      blocks: [...data.blocks, { type: "fixed", reps: 10, rounds: 4 }],
    });
  };

  const removeBlock = (index: number) => {
    if (data.blocks.length <= 1) {
      return;
    }

    updateData({
      ...data,
      blocks: data.blocks.filter((_, blockIndex) => blockIndex !== index),
    });
  };

  const weightsEnabled = data.useWeights !== false;
  const timePerExEnabled = Boolean(data.useTimePerEx);

  const handleTimePerExChange = (value: string) => {
    if (!isAllowedMmSsInput(value)) {
      return;
    }

    updateData({
      ...data,
      timePerEx: formatMmSsInput(value),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {parsed.isLegacy && parsed.legacyText && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Previous free-text rounds: {parsed.legacyText}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={weightsEnabled}
              onChange={(event) => updateData({
                ...data,
                useWeights: event.target.checked,
              })}
            />
            <span className="text-sm font-medium text-slate-700">Kettlebell weights (kg)</span>
          </label>
          <label className={`flex items-center gap-2 ${timePerExEnabled ? "" : "opacity-50"}`}>
            <input
              type="checkbox"
              checked={timePerExEnabled}
              onChange={(event) => updateData({
                ...data,
                useTimePerEx: event.target.checked,
                timePerEx: event.target.checked
                  ? (data.timePerEx ?? "3:00")
                  : data.timePerEx,
              })}
            />
            <span className="text-sm font-medium text-slate-700">Time per exercise</span>
            <input
              type="text"
              disabled={!timePerExEnabled}
              value={data.timePerEx ?? ""}
              onChange={(event) => handleTimePerExChange(event.target.value)}
              placeholder="01:00"
              className={numberInputClassName}
            />
          </label>
        </div>
        <div className={`flex flex-wrap items-center gap-2 ${weightsEnabled ? "" : "opacity-50"}`}>
          {data.weights.map((weight, index) => (
            <div key={`weight-${index}`} className="flex items-center gap-2">
              {index > 0 && <span className="text-slate-500">+</span>}
              <input
                type="number"
                min={0}
                disabled={!weightsEnabled}
                value={weight || ""}
                onChange={(event) => changeWeight(index, event.target.value)}
                className={numberInputClassName}
              />
              {data.weights.length > 1 && (
                <button
                  type="button"
                  disabled={!weightsEnabled}
                  onClick={() => removeWeight(index)}
                  className="text-slate-500 hover:text-red-600 disabled:cursor-not-allowed"
                  aria-label="Remove weight"
                >
                  <RiCloseFill />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            disabled={!weightsEnabled}
            onClick={addWeight}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed"
          >
            Add weight
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Work structure</span>
          <button
            type="button"
            onClick={addBlock}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Add block
          </button>
        </div>

        {data.blocks.map((block, index) => (
          <div
            key={`block-${index}`}
            className="flex flex-wrap items-end gap-3 rounded-md border border-slate-200 p-3"
          >
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">Type</span>
              <select
                value={block.type}
                onChange={(event) => {
                  const nextType = event.target.value;
                  if (nextType === "progressive") {
                    updateBlock(index, { type: "progressive", from: 1, to: 10 });
                    return;
                  }

                  updateBlock(index, { type: "fixed", reps: 10, rounds: 4 });
                }}
                className={inputClassName}
              >
                <option value="progressive">Progressive (1→10)</option>
                <option value="fixed">Fixed reps × rounds</option>
              </select>
            </label>

            {block.type === "progressive" ? (
              <>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">From</span>
                  <input
                    type="number"
                    min={1}
                    value={block.from}
                    onChange={(event) => updateBlock(index, {
                      ...block,
                      from: Number(event.target.value) || 1,
                    })}
                    className={numberInputClassName}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">To</span>
                  <input
                    type="number"
                    min={1}
                    value={block.to}
                    onChange={(event) => updateBlock(index, {
                      ...block,
                      to: Number(event.target.value) || 1,
                    })}
                    className={numberInputClassName}
                  />
                </label>
              </>
            ) : (
              <>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">Reps</span>
                  <input
                    type="number"
                    min={1}
                    value={block.reps}
                    onChange={(event) => updateBlock(index, {
                      ...block,
                      reps: Number(event.target.value) || 1,
                    })}
                    className={numberInputClassName}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">Rounds</span>
                  <input
                    type="number"
                    min={1}
                    value={block.rounds}
                    onChange={(event) => updateBlock(index, {
                      ...block,
                      rounds: Number(event.target.value) || 1,
                    })}
                    className={numberInputClassName}
                  />
                </label>
              </>
            )}

            {data.blocks.length > 1 && (
              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="mb-2 text-slate-500 hover:text-red-600"
                aria-label="Remove block"
              >
                <RiCloseFill />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <span className="font-medium">Preview:</span> {preview}
      </div>
    </div>
  );
};

export default RoundsInput;
