import Link from "next/link";

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold">Career Tools</h1>
        <p className="mt-2 text-black/70">
          Use practical tools to improve your applications, understand visa
          thresholds, and prepare for sponsorship opportunities in the UK.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/tools/cv-cover-letter"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:bg-gray-50"
        >
          <h2 className="text-xl font-bold">AI CV + Cover Letter Generator</h2>
          <p className="mt-2 text-sm text-black/70">
            Paste a job description and generate a tailored CV draft and cover
            letter for sponsorship-focused roles.
          </p>
          <p className="mt-4 text-sm font-semibold">Open tool →</p>
        </Link>

        <Link
          href="/visa-hub"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:bg-gray-50"
        >
          <h2 className="text-xl font-bold">Visa Salary Threshold Calculator</h2>
          <p className="mt-2 text-sm text-black/70">
            Estimate whether a salary looks competitive for Skilled Worker
            sponsorship and compare it to role-area benchmarks.
          </p>
          <p className="mt-4 text-sm font-semibold">Open calculator →</p>
        </Link>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Interview Prep</h2>
          <p className="mt-2 text-sm text-black/70">
            Coming soon: prepare answers for sponsorship-related questions and
            common UK graduate interview formats.
          </p>
          <p className="mt-4 text-sm font-semibold text-black/50">
            Coming soon
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">CV Review</h2>
          <p className="mt-2 text-sm text-black/70">
            Coming soon: deeper feedback on your CV structure, clarity, and fit
            for sponsor-friendly employers.
          </p>
          <p className="mt-4 text-sm font-semibold text-black/50">
            Coming soon
          </p>
        </div>
      </div>
    </main>
  );
}