import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-shell grid min-h-screen place-items-center py-12">
      <div className="card w-full max-w-md p-6">
        <div className="kicker">404</div>
        <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-slate-400">
          That page doesn&apos;t exist or has moved.
        </p>
        <Link href="/" className="btn-primary mt-5 inline-block">Go home</Link>
      </div>
    </main>
  );
}
