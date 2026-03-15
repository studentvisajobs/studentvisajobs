"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/ensureProfile";

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

type Sponsor = {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  sponsorship_status: string | null;
  sponsor_tier: string | null;
  priority_score: number | null;
  target_student_friendly: boolean | null;
  open_jobs_count: number | null;
};

type RecommendedSponsor = Sponsor & {
  matchScore: number;
  matchReasons: string[];
};

type Profile = {
  id: string;
  role: "student" | "employer";
  full_name: string | null;
  email: string | null;
  university: string | null;
  course: string | null;
  graduation_year: number | null;
  visa_status: string | null;
  bio: string | null;
  preferred_industry: string | null;
  preferred_location: string | null;
  degree_field: string | null;
  career_level: string | null;
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

  const [profile, setProfile] = useState<Profile | null>(null);
  const [recommendedSponsors, setRecommendedSponsors] = useState<
    RecommendedSponsor[]
  >([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      const user = auth.user;

      if (authError || !user) {
        window.location.href = "/auth";
        return;
      }

      await ensureProfile();

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          role,
          full_name,
          email,
          university,
          course,
          graduation_year,
          visa_status,
          bio,
          preferred_industry,
          preferred_location,
          degree_field,
          career_level
        `)
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (!profileData || profileData.role !== "student") {
        setError("This page is for students only.");
        setLoading(false);
        return;
      }

      const studentProfile = profileData as Profile;
      setProfile(studentProfile);

      await Promise.all([
        loadApplications(user.id),
        loadRecommendedSponsors(studentProfile),
      ]);
    } catch (err: any) {
      console.error("Dashboard load error:", err);
      setError(err?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function loadApplications(userId: string) {
    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select("id, job_id, user_id, created_at, cover_letter, cv_url")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (appsError) {
      setError(appsError.message);
      return;
    }

    if (!applications || applications.length === 0) {
      setRows([]);
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
      return;
    }

    const jobList = (jobs || []) as Job[];
    const companyIds = Array.from(
      new Set(jobList.map((j) => j.company_id).filter(Boolean))
    );

    let companyList: Company[] = [];

    if (companyIds.length > 0) {
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("id, name")
        .in("id", companyIds);

      if (companiesError) {
        setError(companiesError.message);
        return;
      }

      companyList = (companies || []) as Company[];
    }

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
  }

  async function loadRecommendedSponsors(studentProfile: Profile) {
    const { data: sponsorsData, error: sponsorsError } = await supabase
      .from("sponsors")
      .select(`
        id,
        name,
        industry,
        location,
        sponsorship_status,
        sponsor_tier,
        priority_score,
        target_student_friendly,
        open_jobs_count
      `)
      .order("priority_score", { ascending: false })
      .limit(50);

    if (sponsorsError) {
      setError(sponsorsError.message);
      return;
    }

    const sponsors = (sponsorsData || []) as Sponsor[];

    const scored: RecommendedSponsor[] = sponsors.map((sponsor) => {
      let score = 0;
      const reasons: string[] = [];

      if (sponsor.priority_score !== null) {
        score += Math.min(sponsor.priority_score, 30);
      }

      if (
        studentProfile.preferred_industry &&
        sponsor.industry &&
        sponsor.industry
          .toLowerCase()
          .includes(studentProfile.preferred_industry.toLowerCase())
      ) {
        score += 20;
        reasons.push("Matches your preferred industry");
      }

      if (
        studentProfile.preferred_location &&
        sponsor.location &&
        sponsor.location
          .toLowerCase()
          .includes(studentProfile.preferred_location.toLowerCase())
      ) {
        score += 15;
        reasons.push("Matches your preferred location");
      }

      if (sponsor.target_student_friendly) {
        score += 15;
        reasons.push("Known to be student friendly");
      }

      if ((sponsor.open_jobs_count ?? 0) > 0) {
        score += 10;
        reasons.push("Has active jobs open now");
      }

      if ((sponsor.priority_score ?? 0) >= 20) {
        score += 10;
        reasons.push("Strong sponsorship profile");
      }

      if (
        sponsor.sponsorship_status &&
        sponsor.sponsorship_status.toLowerCase().includes("active")
      ) {
        score += 10;
        reasons.push("Active sponsorship status");
      }

      const finalScore = Math.max(0, Math.min(100, score));

      if (reasons.length === 0) {
        reasons.push("General sponsor fit based on platform data");
      }

      return {
        ...sponsor,
        matchScore: finalScore,
        matchReasons: reasons,
      };
    });

    const topMatches = scored
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);

    setRecommendedSponsors(topMatches);
  }

  const hasApplications = useMemo(() => rows.length > 0, [rows]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="mt-2 text-black/70">
          Track your applications and discover sponsors matched to your profile.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border bg-white p-5 text-sm text-red-600">
          {error}
        </div>
      )}

      {!error && (
        <>
          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">My Profile</h2>
                <p className="mt-1 text-sm text-black/70">
                  This is the student profile currently linked to your account.
                </p>
              </div>

              <Link
                href="/student/profile"
                className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Edit profile
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-black/60">Full name</p>
                  <p className="mt-1">{profile?.full_name || "Not set"}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-black/60">Email</p>
                  <p className="mt-1">{profile?.email || "Not set"}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-black/60">Role</p>
                  <p className="mt-1 capitalize">{profile?.role || "Not set"}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-black/60">Visa status</p>
                  <p className="mt-1">{profile?.visa_status || "Not set"}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-black/60">University</p>
                  <p className="mt-1">{profile?.university || "Not set"}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-black/60">Course</p>
                  <p className="mt-1">{profile?.course || "Not set"}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-black/60">
                    Graduation year
                  </p>
                  <p className="mt-1">{profile?.graduation_year ?? "Not set"}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-black/60">
                    Degree field
                  </p>
                  <p className="mt-1">{profile?.degree_field || "Not set"}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-black/60">
                    Preferred industry
                  </p>
                  <p className="mt-1">
                    {profile?.preferred_industry || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-black/60">
                    Preferred location
                  </p>
                  <p className="mt-1">
                    {profile?.preferred_location || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-black/60">
                    Career level
                  </p>
                  <p className="mt-1">{profile?.career_level || "Not set"}</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-black/60">Bio</p>
                <p className="mt-1 text-black/80">
                  {profile?.bio || "No bio added yet."}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Recommended Sponsors For You</h2>
                <p className="mt-1 text-sm text-black/70">
                  Based on your student profile, sponsorship strength, and open jobs.
                </p>
              </div>

              <Link
                href="/sponsors"
                className="text-sm font-semibold hover:text-black/70"
              >
                Browse all sponsors →
              </Link>
            </div>

            {recommendedSponsors.length === 0 ? (
              <div className="mt-6 rounded-2xl border bg-white p-6">
                No sponsor recommendations yet.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {recommendedSponsors.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-bold">{sponsor.name}</h3>

                      <div className="rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold text-white">
                        Match {sponsor.matchScore}%
                      </div>
                    </div>

                    <p className="mt-2 text-black/70">
                      {sponsor.industry || "Industry not set"} •{" "}
                      {sponsor.location || "Location not set"}
                    </p>

                    <p className="mt-1 text-sm text-black/60">
                      Sponsorship: {sponsor.sponsorship_status || "Unknown"}
                    </p>

                    <p className="mt-1 text-sm text-black/60">
                      Tier: {sponsor.sponsor_tier || "Unknown"} • Priority:{" "}
                      {sponsor.priority_score ?? 0}
                    </p>

                    <p className="mt-1 text-sm text-black/60">
                      Open jobs: {sponsor.open_jobs_count ?? 0}
                    </p>

                    {sponsor.target_student_friendly && (
                      <span className="mt-3 inline-block rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold text-white">
                        Student Friendly
                      </span>
                    )}

                    <div className="mt-4">
                      <p className="text-sm font-semibold text-black/80">
                        Why this matches
                      </p>

                      <ul className="mt-2 space-y-1 text-sm text-black/70">
                        {sponsor.matchReasons.map((reason, index) => (
                          <li key={`${sponsor.id}-reason-${index}`}>
                            ✔ {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/sponsors/${sponsor.id}`}
                        className="text-sm font-semibold hover:text-black/70"
                      >
                        View sponsor →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-12">
            <div>
              <h2 className="text-2xl font-bold">My Applications</h2>
              <p className="mt-1 text-sm text-black/70">
                Track the jobs you’ve applied for.
              </p>
            </div>

            {!hasApplications && (
              <div className="mt-6 rounded-2xl border bg-white p-6">
                You haven’t applied to any jobs yet.
              </div>
            )}

            {hasApplications && (
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
                        <p className="mt-1 whitespace-pre-line text-sm text-black/80">
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
                            className="inline-block rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
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
          </section>
        </>
      )}
    </main>
  );
}
