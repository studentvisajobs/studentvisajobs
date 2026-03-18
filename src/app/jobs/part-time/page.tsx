export default function PartTimeJobsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Part-Time Jobs for International Students in the UK
        </h1>
        <p className="mt-3 max-w-2xl text-black/70">
          Explore part-time job opportunities suitable for international students in the UK.
          Find flexible roles, student-friendly employers, and opportunities to gain experience while studying.
        </p>
      </div>

      {/* Placeholder / coming soon */}
      <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-semibold">🚧 Jobs coming soon</p>
        <p className="mt-2 text-sm text-black/60">
          We’re currently adding part-time roles for students. Check back shortly.
        </p>
      </div>
    </main>
  );
}