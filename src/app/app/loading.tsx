export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse" role="status" aria-label="Loading">
      <div className="h-4 w-24 rounded bg-white/10" />
      <div className="mt-3 h-9 w-72 rounded bg-white/10" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card h-28" />
        ))}
      </div>
      <div className="card mt-6 h-64" />
    </div>
  );
}
