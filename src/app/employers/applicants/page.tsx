"use client";

import { useEffect, useState } from "react";
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
  company_id: string;
};

type Company = {
  id: string;
  owner_id: string;
  name: string;
};

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  university: string | null;
  course: string | null;
  graduation_year: string | null;
  visa_status: string | null;
};

export default function ApplicantsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<
    Array<{
      application: Application;
      job: Job | null;
      company: Company | null;
      profile: Profile | null;
      studentEmail: string | null;
    }>
  >([]);

  useEffect(() => {
    loadApplicants();
  }, []);

  async function loadApplicants() {
    setLoading(true);
    setError("");

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    // 1) get employer's companies
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id, owner_id, name")
      .eq("owner_id", user.id);

    if (companiesError) {
      setError(companiesError.message);
      setLoading(false);
      return;
    }

    if (!companies || companies.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    const companyList = companies as Company[];
    const companyIds = companyList.map((c) => c.id);

    // 2) get employer's jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, company_id")
      .in("company_id", companyIds);

    if (jobsError) {
      setError(jobsError.message);
      setLoading(false);
      return;
    }

    if (!jobs || jobs.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    const jobList = jobs as Job[];
    const jobIds = jobList.map((j) => j.id);

    // 3) get applications for those jobs
    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select("id, job_id, user_id, created_at, cover_letter, cv_url")
      .in("job_id", jobIds)
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

    // 4) get student profiles
    const userIds = Array.from(new Set(appList.map((a) => a.user_id)));

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name, university, course, graduation_year, visa_status")
      .in("id", userIds);

    if (profilesError) {
      setError(profilesError.message);
      setLoading(false);
      return;
    }

    const profileMap = new Map<string, Profile>();
    (profiles || []).forEach((p) => {
      profileMap.set(p.id, p as Profile);
    });

    // 5) try to get emails from auth.users through a helper table? not directly possible from client
    // So for now we'll show profile/full_name and user_id fallback.
    // If you want real email display, next step is to mirror email into profiles on signup.

    const jobMap = new Map<string, Job>();
    jobList.forEach((j) => jobMap.set(j.id, j));

    const companyMap = new Map<string, Company>();
    companyList.forEach((c) => companyMap.set(c.id, c));

    const finalRows = appList.map((application) => {
      const job = jobMap.get(application.job_id) ?? null;
      const company = job ? companyMap.get(job.company_id) ?? null : null;
      const profile = profileMap.get(application.user_id) ?? null;

      return {
        application,
        job,
        company,
        profile,
        studentEmail: null, // next upgrade
      };
    });

    setRows(finalRows);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p>Loading applicants...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold">Applicants</h1>
      <p className="mt-2 text-black/70">
        Review applications submitted to your jobs.
      </p>

      {error && (
        <div className="mt-6 rounded-2xl border bg-white p-5 text-sm text-red-600">
          {error}
        </div>
      )}

      {!error && rows.length === 0 && (
        <div className="mt-6 rounded-2xl border bg-white p-6">
          No applications yet.
        </div>
      )}

      {!error && rows.length > 0 && (
        <div className="mt-6 grid gap-4">
          {rows.map(({ application, job, company, profile }) => (
            <div
              key={application.id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">
                  {job?.title ?? "Unknown job"}
                </h2>

                <p className="text-black/70">
                  {company?.name ?? "Unknown company"}
                </p>

                <p className="text-sm text-black/60">
                  Applied: {new Date(application.created_at).toLocaleString()}
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-black/60">
                    Student
                  </h3>

                  <div className="mt-2 text-sm">
                    <p>
                      <strong>Name:</strong>{" "}
                      {profile?.full_name || "Not provided"}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {profile?.email || "Not provided"}
                    </p>                
                    <p>
                      <strong>University:</strong>{" "}
                      {profile?.university || "Not provided"}
                    </p>
                    <p>
                      <strong>Course:</strong>{" "}
                      {profile?.course || "Not provided"}
                    </p>
                    <p>
                      <strong>Graduation year:</strong>{" "}
                      {profile?.graduation_year || "Not provided"}
                    </p>
                    <p>
                      <strong>Visa status:</strong>{" "}
                      {profile?.visa_status || "Not provided"}
                    </p>
                    <p className="mt-2 text-black/50">
                      <strong>User ID:</strong> {application.user_id}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-black/60">
                    Application
                  </h3>

                  <div className="mt-2 text-sm">
                    <p>
                      <strong>Cover letter:</strong>
                    </p>
                    <p className="mt-1 whitespace-pre-line text-black/80">
                      {application.cover_letter || "No cover letter submitted."}
                    </p>

                    <div className="mt-4">
                      <strong>CV:</strong>{" "}
                      {application.cv_url ? (
                        <a
                          href={application.cv_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold hover:text-black/70"
                        >
                          View CV
                        </a>
                      ) : (
                        "No CV uploaded"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}