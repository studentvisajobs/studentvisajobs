type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: "On-site" | "Hybrid" | "Remote";
  type: "Part-time" | "Graduate" | "Full-time" | "Internship";
  sponsorship: "Yes" | "No" | "Preferred";
  posted: string;
};

const SAMPLE_JOBS: Job[] = [
  {
    id: "1",
    title: "Junior Data Analyst",
    company: "VisaFriendly Ltd",
    location: "London",
    workMode: "Hybrid",
    type: "Graduate",
    sponsorship: "Yes",
    posted: "Today",
  },
  {
    id: "2",
    title: "Frontend Developer (React)",
    company: "GlobalTech",
    location: "Remote (UK)",
    workMode: "Remote",
    type: "Full-time",
    sponsorship: "Yes",
    posted: "1 day ago",
  },
  {
    id: "3",
    title: "Barista (Student Visa compliant)",
    company: "Campus Coffee",
    location: "Manchester",
    workMode: "On-site",
    type: "Part-time",
    sponsorship: "No",
    posted: "2 days ago",
  },
  {
    id: "4",
    title: "Graduate Marketing Associate",
    company: "BrightStart",
    location: "Birmingham",
    workMode: "On-site",
    type: "Graduate",
    sponsorship: "Preferred",
    posted: "3 days ago",
  },
  {
    id: "5",
    title: "Software Engineer Intern",
    company: "NorthStar Software",
    location: "Cambridge",
    workMode: "Hybrid",
    type: "Internship",
    sponsorship: "Preferred",
    posted: "5 days ago",
  },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-black/70">
      {children}
    </span>
  );
}

export default function JobsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold">Jobs</h1>
        <p className="mt-2 text-black/70">
          UK roles for international students — including Skilled Worker
          sponsorship opportunities.
        </p>
      </header>

      {/* Filters (top) */}
      <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <input
            className="md:col-span-4 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Job title or keyword"
          />
          <input
            className="md:col-span-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Location (e.g. London)"
          />
          <select className="md:col-span-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10">
            <option>Job type</option>
            <option>Part-time</option>
            <option>Graduate</option>
            <option>Full-time</option>
            <option>Internship</option>
          </select>
          <select className="md:col-span-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10">
            <option>Sponsorship</option>
            <option>Yes</option>
            <option>No</option>
            <option>Preferred</option>
          </select>
          <button className="md:col-span-1 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
            Search
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-black/60">
          <span className="font-semibold text-black/70">Quick filters:</span>
          {["Remote", "Hybrid", "London", "Graduate", "Part-time", "Sponsorship: Yes"].map(
            (chip) => (
              <span key={chip} className="rounded-full border bg-white px-3 py-1">
                {chip}
              </span>
            )
          )}
        </div>
      </section>

      {/* Results */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-black/70">
            Showing <span className="font-semibold">{SAMPLE_JOBS.length}</span>{" "}
            results
          </p>
          <select className="rounded-xl border bg-white px-3 py-2 text-sm">
            <option>Sort: Most recent</option>
            <option>Sort: Sponsorship first</option>
            <option>Sort: Location</option>
          </select>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          {SAMPLE_JOBS.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-bold">{job.title}</h2>
                  <p className="text-sm text-black/70 mt-1">{job.company}</p>
                  <p className="text-sm text-black/60 mt-2">
                    {job.location} • {job.workMode}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Badge>{job.type}</Badge>
                  <Badge>Sponsorship: {job.sponsorship}</Badge>
                  <Badge>{job.posted}</Badge>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-xs text-black/50">
                  Tip: Always confirm sponsorship details on the employer’s site.
                </p>
                <a
  href={`/jobs/${job.id}`}
  className="inline-flex rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
>
  View details →
</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}