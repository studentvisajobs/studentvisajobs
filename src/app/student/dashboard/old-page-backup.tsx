"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type Application = {
  id: string;
  job_id: string;
  user_id: string;
  created_at: string;
  cover_letter: string | null;
  cv_url: string | null;
};

type Job = {
  id: string;
  title: string;
  location: string | null;
  work_mode: string | null;
  company_id: string;
};

type Company = {
  id: string;
  name: string;
};

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<
    Array<{
      application: Application;
      job: Job | null;
      company: Company | null;
    }>
  >([]);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    setError("");

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.role !== "student") {
      setError("This page is for students only.");
      setLoading(false);
      return;
    }

    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select("id, job_id, user_id, created_at, cover_letter, cv_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (appsError) {
      setError(appsError.message);
      setLoading(false);
      return;
    }

    if (!applications || applications.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    const appList = applications as Application[];
    const jobIds = Array.from(new Set(appList.map((a) => a.job_id)));

    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, location, work_mode, company_id")
      .in("id", jobIds);

    if (jobsError) {
      setError(jobsError.message);
      setLoading(false);
      return;
    }

    const jobList = (jobs || []) as Job[];
    const companyIds = Array.from(new Set(jobList.map((j) => j.company_id)));

    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id, name")
      .in("id", companyIds);

    if (companiesError) {
      setError(companiesError.message);
      setLoading(false);
      return;
    }

    const companyList = (companies || []) as Company[];

    const jobMap = new Map<string, Job>();
    jobList.forEach((j) => jobMap.set(j.id, j));

    const companyMap = new Map<string, Company>();
    companyList.forEach((c) => companyMap.set(c.id, c));

    const finalRows = appList.map((application) => {
      const job = jobMap.get(application.job_id) ?? null;
      const company = job ? companyMap.get(job.company_id) ?? null : null;

      return {
        application,
        job,
        company,
      };
    });

    setRows(finalRows);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold">My Applications</h1>
      <p className="mt-2 text-black/70">
        Track the jobs you’ve applied for.
      </p>

      {error && (
        <div className="mt-6 rounded-2xl border bg-white p-5 text-sm text-red-600">
          {error}
        </div>
      )}

      {!error && rows.length === 0 && (
        <div className="mt-6 rounded-2xl border bg-white p-6">
          You haven’t applied to any jobs yet.
        </div>
      )}

      {!error && rows.length > 0 && (
        <div className="mt-6 grid gap-4">
          {rows.map(({ application, job, company }) => (
            <div
              key={application.id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold">
                {job?.title ?? "Unknown job"}
              </h2>

              <p className="mt-2 text-black/70">
                {company?.name ?? "Unknown company"} •{" "}
                {job?.location ?? "Location not set"} •{" "}
                {job?.work_mode ?? "Not set"}
              </p>

              <p className="mt-2 text-sm text-black/60">
                Applied: {new Date(application.created_at).toLocaleString()}
              </p>

              <div className="mt-4 grid gap-3">
                <div>
                  <p className="text-sm font-semibold">Cover letter</p>
                  <p className="mt-1 text-sm text-black/80 whitespace-pre-line">
                    {application.cover_letter || "No cover letter submitted."}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold">CV</p>
                  {application.cv_url ? (
                    <a
                      href={application.cv_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold hover:text-black/70"
                    >
                      View uploaded CV
                    </a>
                  ) : (
                    <p className="text-sm text-black/60">No CV uploaded</p>
                  )}
                </div>

                {job && (
                  <div className="pt-2">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                    >
                      View Job
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}