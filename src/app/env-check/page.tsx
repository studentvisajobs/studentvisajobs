export default function EnvCheckPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Environment Check</h1>
        <pre className="mt-4 whitespace-pre-wrap text-sm text-black/80">
          {JSON.stringify(
            {
              hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
              nodeEnv: process.env.NODE_ENV,
            },
            null,
            2
          )}
        </pre>
      </div>
    </main>
  );
}