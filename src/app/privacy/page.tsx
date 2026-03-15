export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>

      <div className="mt-6 space-y-6 rounded-2xl border bg-white p-6 shadow-sm text-sm text-black/80">
        <p>
          StudentVisaJobs is operated by <strong>NYVICS CLIENT SERVICES LTD</strong>,
          registered at <strong>4a Rosewood Road  M9 6QJ Manchester</strong>.
        </p>

        <div>
          <h2 className="text-lg font-bold">What we collect</h2>
          <p className="mt-2">
            We may collect account information, profile details, application data,
            uploaded CV content, and usage data needed to operate the platform.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">How we use your data</h2>
          <p className="mt-2">
            We use data to provide job search, sponsor discovery, application tools,
            alerts, and platform improvements.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Third parties</h2>
          <p className="mt-2">
            We may use third-party providers such as hosting, authentication,
            analytics, and AI services to operate parts of the platform.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Contact</h2>
          <p className="mt-2">
            For privacy questions, contact NYVICS CLIENT SERVICES LTD at
            4a Rosewood Road M9 6QJ Manchester.
          </p>
        </div>
      </div>
    </main>
  );
}