type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: "On-site" | "Hybrid" | "Remote";
  type: "Part-time" | "Graduate" | "Full-time" | "Internship";
  sponsorship: "Yes" | "No" | "Preferred";
  posted: string;
  description: string;
  requirements: string[];
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
    description:
      "Work with stakeholders to turn data into insights. Support reporting, dashboards, and analysis across key business areas.",
    requirements: [
      "Good Excel/Google Sheets skills",
      "Basic SQL (or willingness to learn)",
      "Clear communication and attention to detail",
    ],
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
    description:
      "Build and ship user-facing features in React/Next.js. Collaborate with design and backend teams to deliver a polished UX.",
    requirements: [
      "React fundamentals (components, state, hooks)",
      "Comfort with HTML/CSS",
      "Git + collaborative workflow",
    ],
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
    description:
      "Provide friendly customer service and maintain quality standards. Ideal for students seeking part-time work during term time.",
    requirements: [
      "Reliable and punctual",
      "Good customer service",
      "Comfortable working in a busy environment",
    ],
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
    description:
      "Support campaigns across email, social, and events. Assist with reporting and content planning to improve performance.",
    requirements: [
      "Strong written communication",
      "Basic analytics/reporting",
      "Organised and proactive mindset",
    ],
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
    description:
      "Join an engineering team to build internal tools and customer features. Great for students looking to gain industry experience.",
    requirements: [
      "Programming basics (any language)",
      "Willingness to learn quickly",
      "Teamwork and problem-solving",
    ],
  },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-black/70">
      {children}
    </span>
  );
}

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = SAMPLE_JOBS.find((j) => j.id === id);

  if (!job) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-bold">Job not found</h1>
        <p className="mt-2 text-black/70">
          This listing doesn’t exist (yet). Try going back to the jobs page.
        </p>
        <a
          href="/jobs"
          className="mt-6 inline-block rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Back to Jobs
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <a className="text-sm font-semibold hover:text-black/70" href="/jobs">
        ← Back to Jobs
      </a>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main */}
        <section className="md:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
          <p className="mt-2 text-black/70">{job.company}</p>
          <p className="mt-2 text-sm text-black/60">
            {job.location} • {job.workMode}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{job.type}</Badge>
            <Badge>Sponsorship: {job.sponsorship}</Badge>
            <Badge>Posted: {job.posted}</Badge>
          </div>

          <h2 className="mt-8 text-lg font-bold">Overview</h2>
          <p className="mt-2 text-black/70 leading-relaxed">{job.description}</p>

          <h2 className="mt-8 text-lg font-bold">Requirements</h2>
          <ul className="mt-3 list-disc pl-5 text-black/70 space-y-2">
            {job.requirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        {/* Sidebar */}
        <aside className="rounded-2xl border bg-white p-6 shadow-sm h-fit">
          <h3 className="text-lg font-bold">Apply</h3>
          <p className="mt-2 text-sm text-black/70">
            Always confirm sponsorship details on the employer’s official job post.
          </p>

          <button className="mt-5 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
            Apply on employer site →
          </button>

          <div className="mt-6 border-t pt-5">
            <h4 className="font-bold">Visa note</h4>
            <p className="mt-2 text-sm text-black/70">
              Sponsorship availability can change. Treat “Preferred” as “possible”
              and double-check before applying.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}