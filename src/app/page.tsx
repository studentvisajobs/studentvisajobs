export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="rounded-3xl bg-white p-8 md:p-12 shadow-sm border">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-black/70">
              UK career platform for international students
            </p>

            <h1 className="mt-3 text-3xl md:text-4xl font-bold leading-snug">
              From Student Visa to Skilled Worker —
              <span className="block">
                find opportunities that support your future in the UK.
              </span>
            </h1>

            <p className="mt-4 text-black/70 max-w-2xl">
              Discover part-time roles, graduate opportunities, and UK employers
              offering Skilled Worker sponsorship. Built specifically for
              international students navigating the UK visa system.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-3">
            <input
              className="md:col-span-5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Job title, keyword (e.g. Data Analyst)"
            />
            <input
              className="md:col-span-4 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Location (e.g. London, Remote)"
            />
            <select className="md:col-span-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10">
              <option>Visa sponsorship</option>
              <option>Required</option>
              <option>Preferred</option>
              <option>Not needed</option>
            </select>

            <button className="md:col-span-12 rounded-xl bg-black px-6 py-3 text-white font-semibold hover:opacity-90">
              Search jobs
            </button>
          </div>

          {/* Quick chips */}
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            {["Software", "Data", "Marketing", "Finance", "Healthcare", "Part-time"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border bg-white px-3 py-1 text-black/70"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Featured jobs</h2>
            <p className="text-black/70 text-sm mt-1">
              Example listings (we’ll connect a database next).
            </p>
          </div>
          <a className="text-sm font-semibold hover:text-black/70" href="/jobs">
            View all →
          </a>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Junior Data Analyst",
              company: "VisaFriendly Ltd",
              meta: "London • Hybrid",
              badge: "Sponsorship",
            },
            {
              title: "Frontend Developer (React)",
              company: "GlobalTech",
              meta: "Remote • UK",
              badge: "Sponsorship",
            },
            {
              title: "Graduate Marketing Associate",
              company: "BrightStart",
              meta: "Manchester • On-site",
              badge: "Preferred",
            },
          ].map((job) => (
            <article
              key={job.title}
              className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{job.title}</h3>
                  <p className="text-sm text-black/70 mt-1">{job.company}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-black/70">
                  {job.badge}
                </span>
              </div>
              <p className="text-sm text-black/70 mt-4">{job.meta}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-black/50">Posted today</span>
                <a className="text-sm font-semibold hover:text-black/70" href="/jobs">
                  Apply →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}