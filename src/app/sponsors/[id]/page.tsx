"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import SponsorAlertButton from "@/components/SponsorAlertButton";

type Sponsor = {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  sponsorship_status: string | null;
  website: string | null;
  notes: string | null;
  sponsor_tier: string | null;
  priority_score: number | null;
  uk_region: string | null;
  target_student_friendly: boolean | null;
  open_jobs_count: number | null;
  intelligence_notes: string | null;
  top_roles: string[] | null;
  salary_range: string | null;
  visa_history_2024: number | null;
  visa_history_2023: number | null;
};

type Job = {
  id: string;
  title: string;
  location: string | null;
  work_mode: string | null;
  visa_sponsorship: string | null;
  source_url: string | null;
  is_external: boolean | null;
};

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default function SponsorPage() {
  const params = useParams();
  const sponsorId = params?.id as string;

  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSponsor();
  }, [sponsorId]);

  async function loadSponsor() {
    setLoading(true);

    const { data: sponsorData } = await supabase
      .from("sponsors")
      .select(`
        id,
        name,
        industry,
        location,
        sponsorship_status,
        website,
        notes,
        sponsor_tier,
        priority_score,
        uk_region,
        target_student_friendly,
        open_jobs_count,
        intelligence_notes,
        top_roles,
        salary_range,
        visa_history_2024,
        visa_history_2023
      `)
      .eq("id", sponsorId)
      .single();

    if (sponsorData) setSponsor(sponsorData);

    const { data: jobData } = await supabase
      .from("jobs")
      .select("id, title, location, work_mode, visa_sponsorship, source_url, is_external")
      .eq("sponsor_id", sponsorId)
      .order("created_at", { ascending: false });

    if (jobData) setJobs(jobData);

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p>Loading sponsor...</p>
      </main>
    );
  }

  if (!sponsor) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p>Sponsor not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/sponsors"
        className="text-sm font-semibold text-black/70 hover:text-blue-900"
      >
        ← Back to sponsors
      </Link>

      <section className="mt-6 overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-8 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                {sponsor.sponsor_tier && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    {sponsor.sponsor_tier}
                  </span>
                )}
                {sponsor.target_student_friendly && (
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                    Student Friendly
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold md:text-4xl">
                {sponsor.name}
              </h1>

              <p className="mt-3 text-white/85">
                {sponsor.industry || "Industry not set"} •{" "}
                {sponsor.location || "Location not set"}
              </p>

              <p className="mt-2 text-sm text-white/75">
                Sponsorship: {sponsor.sponsorship_status || "Unknown"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {sponsor.website && (
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-white/90"
                >
                  Visit website
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <SponsorAlertButton sponsorId={sponsor.id} />

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <InfoCard
              label="Priority score"
              value={sponsor.priority_score ?? 0}
            />
            <InfoCard
              label="Open jobs"
              value={jobs.length}
            />
            <InfoCard
              label="Region"
              value={sponsor.uk_region || "Unknown"}
            />
            <InfoCard
              label="Salary range"
              value={sponsor.salary_range || "Not set"}
            />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Sponsorship Intelligence</h2>
                <p className="mt-1 text-sm text-black/60">
                  A quick view of where this sponsor may be strongest for international students.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-gray-50 p-5">
                <p className="text-sm font-semibold text-black/60">
                  Visa sponsorship history
                </p>

                {sponsor.visa_history_2024 !== null || sponsor.visa_history_2023 !== null ? (
                  <div className="mt-3 space-y-2 text-black/80">
                    {sponsor.visa_history_2024 !== null && (
                      <p className="text-base font-medium">
                        2024 → {sponsor.visa_history_2024} visas
                      </p>
                    )}
                    {sponsor.visa_history_2023 !== null && (
                      <p className="text-base font-medium">
                        2023 → {sponsor.visa_history_2023} visas
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-black/60">
                    No sponsorship history data added yet.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border bg-gray-50 p-5">
                <p className="text-sm font-semibold text-black/60">
                  Top roles to target
                </p>

                {sponsor.top_roles && sponsor.top_roles.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-black/80">
                    {sponsor.top_roles.map((role) => (
                      <li key={role} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>{role}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-black/60">
                    No target-role data added yet.
                  </p>
                )}
              </div>
            </div>

            {(sponsor.intelligence_notes || sponsor.notes) && (
              <div className="mt-6 rounded-2xl border bg-blue-50 p-5">
                <p className="text-sm font-semibold text-blue-900">
                  Intelligence notes
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  {sponsor.intelligence_notes || sponsor.notes}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Jobs from this sponsor</h2>
                <p className="mt-1 text-sm text-black/60">
                  Live opportunities currently linked on the platform.
                </p>
              </div>
            </div>

            {jobs.length === 0 ? (
              <div className="mt-6 rounded-2xl border bg-gray-50 p-6 text-black/70">
                No jobs posted yet.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                  >
                    <h3 className="text-lg font-bold">{job.title}</h3>

                    <p className="mt-2 text-sm text-black/70">
                      {job.location || "Location not set"} •{" "}
                      {job.work_mode || "Work mode unknown"}
                    </p>

                    <p className="mt-1 text-sm text-black/60">
                      Sponsorship: {job.visa_sponsorship || "Unknown"}
                    </p>

                    {job.is_external && (
                      <span className="mt-3 inline-block rounded-full border px-3 py-1 text-xs font-semibold">
                        External job
                      </span>
                    )}

                    <div className="mt-4">
                      {job.is_external && job.source_url ? (
                        <a
                          href={job.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                        >
                          Apply on company site
                        </a>
                      ) : (
                        <Link
                          href={`/jobs/${job.id}`}
                          className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                        >
                          View details
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Why this sponsor matters</h3>
            <ul className="mt-4 space-y-3 text-sm text-black/75">
              <li>• Stronger sponsors can improve your targeting strategy.</li>
              <li>• Open jobs show where action is available right now.</li>
              <li>• Role and salary insights help you focus your applications.</li>
            </ul>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Next steps</h3>
            <div className="mt-4 space-y-3">
              <Link
                href="/tools/cv-cover-letter"
                className="block rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-gray-50"
              >
                Use AI CV + Cover Letter Tool →
              </Link>
              <Link
                href="/visa-hub"
                className="block rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-gray-50"
              >
                Check Visa Salary Calculator →
              </Link>
              <Link
                href="/jobs"
                className="block rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-gray-50"
              >
                Explore more jobs →
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}