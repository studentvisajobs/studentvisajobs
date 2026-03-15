"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type Sponsor = {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  sponsor_tier: string | null;
  priority_score: number | null;
  open_jobs_count: number | null;
};

type Job = {
  id: string;
  title: string;
  location: string | null;
  work_mode: string | null;
  visa_sponsorship: string | null;
  source_url: string | null;
  is_external: boolean | null;
  sponsor_id: string | null;
  company_id: string | null;
};

type SponsorName = {
  id: string;
  name: string;
};

type CompanyName = {
  id: string;
  name: string;
};

export default function HomePage() {
  const [featuredSponsors, setFeaturedSponsors] = useState<Sponsor[]>([]);
  const [latestJobs, setLatestJobs] = useState<
    Array<{
      id: string;
      title: string;
      location: string;
      work_mode: string;
      visa_sponsorship: string;
      displayName: string;
      is_external: boolean;
      source_url: string | null;
    }>
  >([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    loadFeaturedSponsors();
    loadLatestJobs();
  }, []);

  async function loadFeaturedSponsors() {
    setLoadingSponsors(true);

    const { data } = await supabase
      .from("sponsors")
      .select(`
        id,
        name,
        industry,
        location,
        sponsor_tier,
        priority_score,
        open_jobs_count
      `)
      .gt("open_jobs_count", 0)
      .order("open_jobs_count", { ascending: false })
      .order("priority_score", { ascending: false })
      .limit(6);

    setFeaturedSponsors((data || []) as Sponsor[]);
    setLoadingSponsors(false);
  }

  async function loadLatestJobs() {
    setLoadingJobs(true);

    const { data: jobsData } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        location,
        work_mode,
        visa_sponsorship,
        source_url,
        is_external,
        sponsor_id,
        company_id,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(6);

    const jobs = (jobsData || []) as Job[];

    const sponsorIds = Array.from(
      new Set(jobs.map((j) => j.sponsor_id).filter(Boolean))
    ) as string[];

    const companyIds = Array.from(
      new Set(jobs.map((j) => j.company_id).filter(Boolean))
    ) as string[];

    const sponsorMap = new Map<string, string>();
    const companyMap = new Map<string, string>();

    if (sponsorIds.length > 0) {
      const { data: sponsors } = await supabase
        .from("sponsors")
        .select("id, name")
        .in("id", sponsorIds);

      (sponsors || []).forEach((s: SponsorName) => sponsorMap.set(s.id, s.name));
    }

    if (companyIds.length > 0) {
      const { data: companies } = await supabase
        .from("companies")
        .select("id, name")
        .in("id", companyIds);

      (companies || []).forEach((c: CompanyName) => companyMap.set(c.id, c.name));
    }

    setLatestJobs(
      jobs.map((job) => ({
        id: job.id,
        title: job.title,
        location: job.location || "Location not set",
        work_mode: job.work_mode || "Not set",
        visa_sponsorship: job.visa_sponsorship || "Unknown",
        displayName:
          (job.company_id && companyMap.get(job.company_id)) ||
          (job.sponsor_id && sponsorMap.get(job.sponsor_id)) ||
          "Unknown company",
        is_external: Boolean(job.is_external),
        source_url: job.source_url,
      }))
    );

    setLoadingJobs(false);
  }

  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm text-black/70 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Built for international students and professionals in the UK
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-900 md:text-5xl">
              The UK visa sponsorship platform for international students and professionals
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-black/70">
              Discover sponsor companies, curated job opportunities, visa guidance,
              and AI tools that help international students and professionals secure
              sponsored UK roles.
            </p>

            <div className="mt-8 space-y-4">

              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  placeholder="Job title, keyword, or company"
                  className="w-full rounded-xl border px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="Location"
                  className="w-full rounded-xl border px-4 py-3 md:w-64"
                />

                <Link
                  href="/jobs"
                  className="rounded-xl bg-blue-900 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Search Jobs
                </Link>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/jobs"
                  className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-50"
                >
                  Explore Jobs
                </Link>

                <Link
                  href="/sponsors"
                  className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-50"
                >
                  Browse Sponsors
                </Link>

                <Link
                  href="/tools"
                  className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-50"
                >
                  Career Tools
                </Link>
              </div>

            </div>


            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
                  Sponsor database
                </p>
                <p className="mt-2 text-2xl font-bold">125k+</p>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
                  Curated jobs
                </p>
                <p className="mt-2 text-2xl font-bold">Live</p>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
                  AI tools
                </p>
                <p className="mt-2 text-2xl font-bold">Ready</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">
              Why candidates use StudentVisaJobs
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border bg-gray-50 p-4">
                <p className="font-semibold">Find sponsors faster</p>
                <p className="mt-1 text-sm text-black/65">
                  Search sponsor companies by location, industry, open jobs, and student-friendliness.
                </p>
              </div>

              <div className="rounded-2xl border bg-gray-50 p-4">
                <p className="font-semibold">Target better applications</p>
                <p className="mt-1 text-sm text-black/65">
                  Use role and sponsor intelligence to focus on the employers most worth your time.
                </p>
              </div>

              <div className="rounded-2xl border bg-gray-50 p-4">
                <p className="font-semibold">Prepare with AI tools</p>
                <p className="mt-1 text-sm text-black/65">
                  Add the job details you are applying for and your current CV, and our AI tool will help generate a tailored CV and cover letter suited to that role.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Visa-friendly jobs</h2>
            <p className="mt-2 text-sm text-black/70">
              Explore curated and employer-posted roles with sponsorship signals,
              locations, and work modes.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Sponsor database</h2>
            <p className="mt-2 text-sm text-black/70">
              Search thousands of UK sponsor companies by location, industry,
              and student-friendliness.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Visa tools</h2>
            <p className="mt-2 text-sm text-black/70">
              Understand the Skilled Worker path and estimate whether a salary
              looks competitive for sponsorship.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Latest Jobs</h2>
            <p className="mt-1 text-sm text-black/70">
              Recently added roles for international students and professionals.
            </p>
          </div>

          <Link
            href="/jobs"
            className="text-sm font-semibold hover:text-blue-900"
          >
            View all jobs →
          </Link>
        </div>

        {loadingJobs ? (
          <div className="mt-6 rounded-2xl border bg-white p-6">
            Loading jobs...
          </div>
        ) : latestJobs.length === 0 ? (
          <div className="mt-6 rounded-2xl border bg-white p-6 text-black/70">
            No jobs added yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {latestJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-bold">{job.title}</h3>
                <p className="mt-2 text-black/70">{job.displayName}</p>
                <p className="mt-1 text-sm text-black/60">
                  {job.location} • {job.work_mode} • Sponsorship:{" "}
                  {job.visa_sponsorship}
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
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Sponsors With Open Jobs</h2>
            <p className="mt-1 text-sm text-black/70">
              Live sponsor companies currently linked to jobs on the platform.
            </p>
          </div>

          <Link
            href="/sponsors?openJobs=Yes"
            className="text-sm font-semibold hover:text-blue-900"
          >
            View all →
          </Link>
        </div>

        {loadingSponsors ? (
          <div className="mt-6 rounded-2xl border bg-white p-6">
            Loading sponsors...
          </div>
        ) : featuredSponsors.length === 0 ? (
          <div className="mt-6 rounded-2xl border bg-white p-6 text-black/70">
            No sponsor companies with open jobs yet.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {featuredSponsors.map((company) => (
              <div
                key={company.id}
                className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <h3 className="font-bold">{company.name}</h3>

                <p className="mt-2 text-sm text-black/70">
                  {company.industry || "Industry not set"} •{" "}
                  {company.location || "Location not set"}
                </p>

                <p className="mt-1 text-sm text-black/60">
                  Tier: {company.sponsor_tier || "Unknown"} • Score:{" "}
                  {company.priority_score ?? 0}
                </p>

                <p className="mt-1 text-sm font-semibold text-black/70">
                  Open jobs: {company.open_jobs_count ?? 0}
                </p>

                <Link
                  href={`/sponsors/${company.id}`}
                  className="mt-4 inline-block text-sm font-semibold hover:text-blue-900"
                >
                  View sponsor →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border bg-gradient-to-r from-blue-900 to-blue-700 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold">Build stronger applications with AI</h2>
              <p className="mt-2 text-white/85">
                Add the job details you are applying for and your current CV, and our AI tool will help generate a tailored CV and cover letter suited to that role.
              </p>
            </div>

            <Link
              href="/tools/cv-cover-letter"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-900 hover:bg-white/90"
            >
              Open AI tool →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
