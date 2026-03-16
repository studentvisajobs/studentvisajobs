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
  const [latestJobs, setLatestJobs] = useState<any[]>([]);
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
      .select(
        `
        id,
        name,
        industry,
        location,
        sponsor_tier,
        priority_score,
        open_jobs_count
      `
      )
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
      .select(
        `
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
      `
      )
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
      const { data } = await supabase
        .from("sponsors")
        .select("id,name")
        .in("id", sponsorIds);

      (data || []).forEach((s: SponsorName) => sponsorMap.set(s.id, s.name));
    }

    if (companyIds.length > 0) {
      const { data } = await supabase
        .from("companies")
        .select("id,name")
        .in("id", companyIds);

      (data || []).forEach((c: CompanyName) => companyMap.set(c.id, c.name));
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

      {/* HERO */}

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm text-black/70 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Built for international students and professionals in the UK
            </div>

            <h1 className="mt-6 max-w-3xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              The UK visa sponsorship platform for international students
            </h1>

            <p className="mt-4 max-w-2xl text-black/70 sm:text-lg">
              Discover sponsor companies, curated jobs, visa guidance, and AI tools
              to help international students secure sponsored roles in the UK.
            </p>

            {/* SEARCH */}

            <div className="mt-8 flex flex-col gap-3 md:flex-row">

              <input
                placeholder="Job title or company"
                className="w-full rounded-xl border bg-white px-4 py-3"
              />

              <input
                placeholder="Location"
                className="w-full rounded-xl border bg-white px-4 py-3 md:w-64"
              />

              <Link
                href="/jobs"
                className="rounded-xl bg-blue-900 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800"
              >
                Search Jobs
              </Link>

            </div>

            {/* QUICK LINKS */}

            <div className="mt-4 flex flex-wrap gap-3">

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

            {/* TRUST SIGNALS */}

            <div className="mt-5 flex flex-col gap-2 text-sm text-black/70 sm:flex-row sm:gap-4">

              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                125k+ UK sponsor companies
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                AI CV + cover letter generator
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                Curated visa-friendly jobs
              </div>

            </div>

          </div>

          {/* HERO CARD */}

          <div className="rounded-3xl border bg-white p-6 shadow-xl">

            <p className="text-sm font-semibold uppercase text-blue-900">
              Why candidates use StudentVisaJobs
            </p>

            <div className="mt-5 space-y-4">

              <div className="rounded-xl border bg-gray-50 p-4">
                <p className="font-semibold">Find sponsors faster</p>
                <p className="text-sm text-black/65">
                  Search UK sponsor companies by industry, location and job activity.
                </p>
              </div>

              <div className="rounded-xl border bg-gray-50 p-4">
                <p className="font-semibold">Target better applications</p>
                <p className="text-sm text-black/65">
                  Focus on companies most likely to sponsor international talent.
                </p>
              </div>

              <div className="rounded-xl border bg-gray-50 p-4">
                <p className="font-semibold">AI application tools</p>
                <p className="text-sm text-black/65">
                  Generate tailored CVs and cover letters for specific jobs.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* LATEST JOBS */}

      <section className="mx-auto max-w-6xl px-6 pb-16">

        <div className="flex items-end justify-between">

          <div>
            <h2 className="text-2xl font-bold">Latest Jobs</h2>
            <p className="text-sm text-black/70">
              Recently added opportunities.
            </p>
          </div>

          <Link
            href="/jobs"
            className="text-sm font-semibold hover:text-blue-900"
          >
            View all →
          </Link>

        </div>

        {loadingJobs ? (

          <div className="mt-6 rounded-xl border bg-white p-6">
            Loading jobs...
          </div>

        ) : (

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {latestJobs.map((job) => (

              <div
                key={job.id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >

                <h3 className="text-xl font-bold">{job.title}</h3>

                <p className="mt-1 text-black/70">{job.displayName}</p>

                <p className="text-sm text-black/60">
                  {job.location} • {job.work_mode}
                </p>

                <div className="mt-4">

                  {job.is_external ? (

                    <a
                      href={job.source_url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                      Apply
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

    </main>
  );
}