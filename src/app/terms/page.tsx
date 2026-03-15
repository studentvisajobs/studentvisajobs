export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Terms of Use</h1>

      <div className="mt-6 space-y-6 rounded-2xl border bg-white p-6 shadow-sm text-sm text-black/80">
        <p>
          StudentVisaJobs is operated by <strong>NYVICS CLIENT SERVICES LTD</strong>,
          registered at <strong>4a Rosewood Road</strong>.
        </p>

        <div>
          <h2 className="text-lg font-bold">Platform use</h2>
          <p className="mt-2">
            Users may browse jobs, sponsors, and visa information, and use tools
            such as alerts and application support, subject to lawful and fair use.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">No guarantee</h2>
          <p className="mt-2">
            We do not guarantee sponsorship, interviews, employment outcomes,
            or visa approval.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">External opportunities</h2>
          <p className="mt-2">
            Some roles are curated external listings. Users should verify details
            on the original employer website before applying.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Changes</h2>
          <p className="mt-2">
            We may update the platform, tools, and these terms as the service evolves.
          </p>
        </div>
      </div>
    </main>
  );
}