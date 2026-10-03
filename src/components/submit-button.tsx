"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="animate-spin motion-reduce:animate-none"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Submit button for server-action forms: disables itself and shows a spinner while the action runs. */
export function SubmitButton({
  children,
  pendingLabel,
  className = "btn-primary",
  ...rest
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "className" | "children">) {
  const { pending } = useFormStatus();
  return (
    <button
      {...rest}
      type="submit"
      disabled={pending || rest.disabled}
      aria-busy={pending}
      className={`${className} gap-2 disabled:cursor-wait disabled:opacity-70`}
    >
      {pending ? (
        <>
          <Spinner />
          {pendingLabel ?? "Working…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}
