"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { AppWindow } from "./app-screens";
import { sampleSystems } from "./sample-data";

/**
 * The register as it looks in the app. When it scrolls into view the rows start in the order they were
 * added and then re-sort by priority, which is what the real register does for you.
 */
export function RegisterScreen() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [sorted, setSorted] = useState(false);

  // Order added: alphabetical stands in for "the order people typed them in".
  const unsorted = [...sampleSystems].sort((a, b) => a.name.localeCompare(b.name));
  const rows = sorted || reduce ? sampleSystems : unsorted;

  useEffect(() => {
    if (!inView || reduce) return;
    const timer = setTimeout(() => setSorted(true), 700);
    return () => clearTimeout(timer);
  }, [inView, reduce]);

  return (
    <AppWindow path="/app/systems">
      <div ref={ref}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-sky-300">Register</div>
            <div className="mt-1 text-2xl font-bold">AI systems</div>
            <p className="mt-1 text-sm text-slate-400">Every AI-enabled system or business use your team relies on.</p>
          </div>
          {!reduce && (
            <button
              type="button"
              onClick={() => {
                setSorted(false);
                setTimeout(() => setSorted(true), 900);
              }}
              className="btn-secondary shrink-0 gap-1.5 px-2.5 py-1.5 text-xs"
              aria-label="Replay the sort"
            >
              <RotateCcw size={13} aria-hidden="true" /> Replay
            </button>
          )}
        </div>

        <div className="table-wrap mt-5">
          <table className="table">
            <thead>
              <tr>
                <th>System</th>
                <th>Owner</th>
                <th>Lifecycle</th>
                <th>Priority</th>
                <th className="whitespace-nowrap">Review due</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((system) => (
                <motion.tr
                  key={system.name}
                  layout={!reduce}
                  transition={{ type: "spring", stiffness: 260, damping: 30 }}
                >
                  <td className="min-w-[11rem]">
                    <div className="font-semibold">{system.name}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {system.provider} · {system.purpose}
                    </div>
                  </td>
                  <td className="whitespace-nowrap">{system.owner ?? "—"}</td>
                  <td>{system.lifecycle}</td>
                  <td className="whitespace-nowrap">
                    <span className={`badge badge-${system.level} capitalize`}>
                      {system.level} · {system.score}
                    </span>
                  </td>
                  <td className="whitespace-nowrap">{system.review ?? "Not set"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppWindow>
  );
}
