export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Contact Us</h1>

      <p className="mt-4 text-black/70">
        If you have questions, feedback, partnership enquiries, or need support,
        feel free to reach out. We aim to respond as soon as possible.
      </p>

      <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Email</h2>

        <p className="mt-2 text-black/70">
          For all enquiries, contact us at:
        </p>

        <a
          href="mailto:hello@studentvisajobs.com"
          className="mt-2 inline-block font-semibold text-blue-900 hover:text-blue-700"
        >
          hello@studentvisajobs.com
        </a>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">What you can contact us about</h2>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-black/70">
          <li>General questions about the platform</li>
          <li>Reporting incorrect job or sponsor information</li>
          <li>Partnerships or collaborations</li>
          <li>Employer enquiries</li>
          <li>Technical issues</li>
        </ul>
      </div>

      <div className="mt-6 text-sm text-black/50">
        <p>
          We are continuously improving StudentVisaJobs to better support
          international students and professionals in the UK.
        </p>
      </div>
    </main>
  );
}