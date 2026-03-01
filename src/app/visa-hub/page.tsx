export default function VisaHubPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Visa Hub</h1>
      <p className="mt-2 text-black/70">
        Clear, student-friendly guidance for the UK Student Visa, Graduate Route, and Skilled Worker pathway.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { title: "Student Visa work rules", desc: "Hours, restrictions, and common pitfalls." },
          { title: "Graduate Route overview", desc: "What it is, who qualifies, and timelines." },
          { title: "Skilled Worker basics", desc: "Sponsorship, salary, and how it works." },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="font-bold">{card.title}</h2>
            <p className="mt-2 text-sm text-black/70">{card.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}