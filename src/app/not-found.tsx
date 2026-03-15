import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="mt-3 text-black/70">
          The page you’re looking for doesn’t exist or has moved.
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}