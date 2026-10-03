"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container-shell grid min-h-screen place-items-center py-12">
      <div className="card w-full max-w-md p-6">
        <div className="kicker">Something went wrong</div>
        <h1 className="mt-2 text-2xl font-bold">We couldn&apos;t complete that</h1>
        <p className="mt-2 text-sm text-slate-400">
          The request failed. You can try again, and if it keeps happening, check the details you
          entered (for example your plan&apos;s limits).
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-slate-500">Reference: {error.digest}</p>
        )}
        <div className="mt-5 flex gap-3">
          <button onClick={reset} className="btn-primary">Try again</button>
          <Link href="/app" className="text-sm text-sky-300 self-center">Back to dashboard</Link>
        </div>
      </div>
    </main>
  );
}
