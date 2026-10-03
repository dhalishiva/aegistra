"use client";

import { useState } from "react";
import {
  HIGH_THRESHOLD,
  MEDIUM_THRESHOLD,
  explainGovernancePriority,
  type PriorityInputs,
  type PriorityLevel,
} from "@/lib/scoring";

type Preset = { name: string; provider: string; inputs: PriorityInputs };

// Example systems. The scores are computed by the same function the app uses.
const presets: Preset[] = [
  {
    name: "Candidate screening copilot",
    provider: "Recruiting vendor",
    inputs: {
      dataSensitivity: "personal",
      autonomy: "decision",
      impact: "high",
      humanReview: false,
      publicInteraction: false,
      generatesContent: false,
    },
  },
  {
    name: "Support reply agent",
    provider: "Model API",
    inputs: {
      dataSensitivity: "personal",
      autonomy: "recommendation",
      impact: "moderate",
      humanReview: true,
      publicInteraction: true,
      generatesContent: true,
    },
  },
  {
    name: "Meeting summarizer",
    provider: "Built into a meeting app",
    inputs: {
      dataSensitivity: "internal",
      autonomy: "assistive",
      impact: "low",
      humanReview: true,
      publicInteraction: false,
      generatesContent: true,
    },
  },
];

const levelStyle: Record<PriorityLevel, { label: string; text: string; bar: string; chip: string; rank: string }> = {
  high: {
    label: "High priority",
    text: "text-signal-high",
    bar: "bg-signal-high",
    chip: "badge-high",
    rank: "Ranks near the top of your review queue.",
  },
  medium: {
    label: "Medium priority",
    text: "text-signal-medium",
    bar: "bg-signal-medium",
    chip: "badge-medium",
    rank: "Ranks in the middle of your review queue.",
  },
  low: {
    label: "Low priority",
    text: "text-signal-low",
    bar: "bg-signal-low",
    chip: "badge-low",
    rank: "Ranks near the bottom of your review queue.",
  },
};

const dataLabel = {
  none: "No sensitive data",
  internal: "Internal data",
  personal: "Personal data",
  sensitive: "Sensitive data",
} as const;

const autonomyLabel = {
  assistive: "Assists a person",
  recommendation: "Recommends actions",
  decision: "Makes decisions",
  autonomous: "Acts on its own",
} as const;

const impactLabel = {
  low: "Low potential impact",
  moderate: "Moderate potential impact",
  high: "High potential impact",
} as const;

function sameInputs(a: PriorityInputs, b: PriorityInputs) {
  return (Object.keys(a) as (keyof PriorityInputs)[]).every((key) => a[key] === b[key]);
}

function Segmented<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
  columns,
}: {
  legend: string;
  name: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
  columns: string;
}) {
  return (
    <fieldset>
      <legend className="label">{legend}</legend>
      <div className={`grid gap-1.5 ${columns}`}>
        {options.map(([optionValue, optionLabel]) => {
          const checked = value === optionValue;
          return (
            <label
              key={optionValue}
              className={`flex cursor-pointer items-center justify-center rounded-md border px-2 py-2 text-center text-sm font-medium transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-sky-300 ${
                checked
                  ? "border-sky-400 bg-sky-400/15 text-sky-100"
                  : "border-white/10 text-slate-300 hover:bg-white/5"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={optionValue}
                checked={checked}
                onChange={() => onChange(optionValue)}
                className="sr-only"
              />
              {optionLabel}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 p-3 text-sm text-slate-300 transition has-[:checked]:border-sky-400/50 has-[:checked]:bg-sky-400/10 has-[:checked]:text-sky-50 hover:bg-white/5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-sky-400"
      />
      {label}
    </label>
  );
}

export function ScoreDemo() {
  const [inputs, setInputs] = useState<PriorityInputs>(presets[0].inputs);

  const { score, level, parts } = explainGovernancePriority(inputs);
  const style = levelStyle[level];
  const activePreset = presets.find((preset) => sameInputs(preset.inputs, inputs));

  function set<K extends keyof PriorityInputs>(key: K, value: PriorityInputs[K]) {
    setInputs((current) => ({ ...current, [key]: value }));
  }

  const rows: { label: string; points: number }[] = [
    { label: dataLabel[inputs.dataSensitivity], points: parts.data },
    { label: autonomyLabel[inputs.autonomy], points: parts.autonomy },
    { label: impactLabel[inputs.impact], points: parts.impact },
    { label: inputs.humanReview ? "Human review in place" : "No human review", points: parts.review },
    { label: "Talks to customers or the public", points: parts.publicInteraction },
    { label: "Generates visible content", points: parts.generatesContent },
  ];

  return (
    <section
      aria-label="Try the priority score"
      className="rounded-2xl border border-white/10 bg-panel shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]"
    >
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-bold">Add an AI system</h2>
        <p className="mt-1 text-sm text-slate-400">
          Change any answer. This runs the same scoring the app uses.
        </p>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_19rem] xl:grid-rows-[auto_1fr] xl:gap-x-8 xl:px-5">
        {/* Controls */}
        <div className="space-y-6 px-5 py-5 xl:col-start-1 xl:row-span-2 xl:px-0">
          <div>
            <div className="label">Start from an example</div>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => {
                const active = activePreset?.name === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setInputs(preset.inputs)}
                    className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition ${
                      active
                        ? "border-sky-400 bg-sky-400/15 text-sky-100"
                        : "border-white/10 text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          <Segmented
            legend="Data sensitivity"
            name="data_sensitivity"
            columns="grid-cols-2 sm:grid-cols-4 xl:grid-cols-2"
            value={inputs.dataSensitivity}
            onChange={(value) => set("dataSensitivity", value)}
            options={[
              ["none", "None"],
              ["internal", "Internal"],
              ["personal", "Personal"],
              ["sensitive", "Sensitive"],
            ]}
          />
          <Segmented
            legend="Autonomy"
            name="autonomy"
            columns="grid-cols-2 sm:grid-cols-4 xl:grid-cols-2"
            value={inputs.autonomy}
            onChange={(value) => set("autonomy", value)}
            options={[
              ["assistive", "Assistive"],
              ["recommendation", "Recommendation"],
              ["decision", "Decision"],
              ["autonomous", "Autonomous"],
            ]}
          />
          <Segmented
            legend="Potential impact"
            name="impact"
            columns="grid-cols-3"
            value={inputs.impact}
            onChange={(value) => set("impact", value)}
            options={[
              ["low", "Low"],
              ["moderate", "Moderate"],
              ["high", "High"],
            ]}
          />

          <div className="grid gap-2">
            <Toggle
              label="Human review before material action"
              checked={inputs.humanReview}
              onChange={(value) => set("humanReview", value)}
            />
            <Toggle
              label="Interacts with customers/public"
              checked={inputs.publicInteraction}
              onChange={(value) => set("publicInteraction", value)}
            />
            <Toggle
              label="Generates externally visible content"
              checked={inputs.generatesContent}
              onChange={(value) => set("generatesContent", value)}
            />
          </div>
        </div>

        {/* Score summary: stays in view on phones while answers change */}
        <div className="sticky top-16 z-10 order-first border-b border-white/10 bg-panel px-5 py-4 xl:static xl:order-none xl:col-start-2 xl:row-start-1 xl:border-b-0 xl:px-0 xl:pb-2 xl:pt-5">
          <div className="truncate text-sm text-slate-400">
            {activePreset ? activePreset.name : "Your AI system"}
          </div>
          <div className="mt-1 flex items-end justify-between gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-6xl font-extrabold leading-none tabular-nums ${style.text}`}>{score}</span>
              <span className="text-lg text-slate-500">/100</span>
            </div>
            <span className={`badge ${style.chip} mb-1`}>{style.label}</span>
          </div>
          <p className="sr-only" aria-live="polite">
            Score {score} out of 100. {style.label}.
          </p>

          <div className="relative mt-4">
            <div className="flex h-3 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className={`${style.bar} h-full flex-none transition-[width] duration-300 motion-reduce:transition-none ${
                    row.points > 0 ? "border-r-2 border-panel" : ""
                  }`}
                  style={{ width: `${row.points}%` }}
                />
              ))}
            </div>
            <span
              aria-hidden="true"
              className="absolute top-3 h-2 w-px bg-white/50"
              style={{ left: `${MEDIUM_THRESHOLD}%` }}
            />
            <span
              aria-hidden="true"
              className="absolute top-3 h-2 w-px bg-white/50"
              style={{ left: `${HIGH_THRESHOLD}%` }}
            />
            <div className="relative mt-2.5 h-4 text-xs text-slate-400" aria-hidden="true">
              <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${MEDIUM_THRESHOLD}%` }}>
                Medium {MEDIUM_THRESHOLD}+
              </span>
              <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${HIGH_THRESHOLD}%` }}>
                High {HIGH_THRESHOLD}+
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="px-5 pb-5 pt-2 xl:col-start-2 xl:row-start-2 xl:px-0">
          <h3 className="text-sm font-semibold text-slate-300">Where the points come from</h3>
          <ul className="mt-2 divide-y divide-white/10 text-sm">
            {rows.map((row) => (
              <li
                key={row.label}
                className={`flex items-center justify-between py-2 ${row.points === 0 ? "text-slate-500" : "text-slate-200"}`}
              >
                <span>{row.label}</span>
                <span className="font-semibold tabular-nums">{row.points === 0 ? "0" : `+${row.points}`}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-slate-400">{style.rank}</p>
        </div>
      </div>
    </section>
  );
}
