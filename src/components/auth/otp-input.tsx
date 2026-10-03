"use client";

import { ClipboardEvent, KeyboardEvent, useRef } from "react";

/** Six-digit one-time code field. Supports paste, backspace and the OS autofill for SMS/email codes. */
export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  label = "Verification code",
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  label?: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function setAt(index: number, char: string) {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join("").slice(0, length));
  }

  function onInput(index: number, raw: string) {
    const clean = raw.replace(/\D/g, "");
    if (!clean) return setAt(index, "");
    if (clean.length > 1) {
      // Autofill or fast typing delivers several digits at once.
      const merged = (value.slice(0, index) + clean).slice(0, length);
      onChange(merged);
      refs.current[Math.min(merged.length, length - 1)]?.focus();
      return;
    }
    setAt(index, clean);
    if (index < length - 1) refs.current[index + 1]?.focus();
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < length - 1) refs.current[index + 1]?.focus();
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div role="group" aria-label={label} className="flex gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          value={digit}
          disabled={disabled}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={index === 0 ? length : 1}
          aria-label={`Digit ${index + 1} of ${length}`}
          onChange={(event) => onInput(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={onPaste}
          onFocus={(event) => event.target.select()}
          className="input h-14 w-full min-w-0 px-0 text-center text-2xl font-bold tabular-nums"
        />
      ))}
    </div>
  );
}
