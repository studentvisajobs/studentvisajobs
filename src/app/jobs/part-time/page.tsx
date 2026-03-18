"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type Job = {
  id: string;
  title: string;
  location: string | null;
  work_mode: string | null;
  visa_sponsorship: string | null;
  source_url: string | null;
  is_external: boolean | null;
  created_at: string;
  employment_type: string | null;
};

function timeAgo(dateIso: string) {
  const d = new Date(dateIso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - d);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function PartTimeJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id, title, location, work_mode, visa_sponsorship, source_url, is_external, created_at, employment_type"
        )
        .eq("employment_type", "Part-time")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setJobs((data || []) as Job[]);
      setLoading(false);
    }

    loadJobs();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Part-Time Jobs for International Students in the UK
        </h1>
        <p className="mt-3 max-w-2xl text-black/70">
          Explore part-time jobs suitable for international students in the UK.
          Find flexible roles, student-friendly employers, and opportunities to
          gain experience while studying.
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          Loading part-time jobs...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border bg-white p-6 text-red-600 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          No part-time jobs added yet.
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{job.title}</h2>
                  <p className="mt-2 text-sm text-black/60">
                    {job.location || "Location not set"} •{" "}
                    {job.work_mode || "Not set"} • Sponsorship:{" "}
                    {job.visa_sponsorship || "Unknown"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-blue-900">
                    Part-time
                  </p>
                </div>

                <span className="text-xs text-black/50">
                  {timeAgo(job.created_at)}
                </span>
              </div>

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
    </main>
  );
}