"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/ensureProfile";




type JobRow = {
  id: string;
  title: string;
  location: string | null;
  work_mode: string | null;
  visa_sponsorship: string | null;
  company_id: string | null;
  sponsor_id: string | null;
  source_url: string | null;
  source_type: string | null;
  is_external: boolean | null;
  created_at: string;
};

type CompanyRow = {
  id: string;
  name: string;
  industry?: string | null;
};

type SponsorRow = {
  id: string;
  name: string;
  industry?: string | null;
};

type Profile = {
  id: string;
  role: "student" | "employer";
  preferred_industry: string | null;
  preferred_location: string | null;
  degree_field: string | null;
  course: string | null;
  career_level: string | null;
};

type JobCard = {
  id: string;
  title: string;
  location: string;
  work_mode: string;
  visa_sponsorship: string;
  displayName: string;
  displayIndustry: string | null;
  posted: string;
  is_external: boolean;
  source_url: string | null;
  matchScore: number | null;
  matchReasons: string[];
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

function includesLoose(
  source: string | null | undefined,
  target: string | null | undefined
) {
  if (!source || !target) return false;
  return source.toLowerCase().includes(target.toLowerCase());
}

function computeJobMatch(
  job: {
    title: string;
    location: string;
    work_mode: string;
    visa_sponsorship: string;
    displayIndustry: string | null;
  },
  profile: Profile | null
) {
  if (!profile || profile.role !== "student") {
    return {
      matchScore: null,
      matchReasons: [] as string[],
    };
  }

  let score = 0;
  const reasons: string[] = [];
  const title = job.title.toLowerCase();
  const location = job.location.toLowerCase();
  const workMode = job.work_mode.toLowerCase();
  const visa = job.visa_sponsorship.toLowerCase();
  const industry = job.displayIndustry?.toLowerCase() ?? "";

  if (profile.preferred_location) {
    const preferredLocation = profile.preferred_location.toLowerCase();

    if (location.includes(preferredLocation)) {
      score += 25;
      reasons.push("Matches your preferred location");
    } else if (workMode.includes("remote") || workMode.includes("hybrid")) {
      score += 10;
      reasons.push("Flexible work mode may suit your location preference");
    }
  }

  if (profile.preferred_industry && industry) {
    if (industry.includes(profile.preferred_industry.toLowerCase())) {
      score += 20;
      reasons.push("Matches your preferred industry");
    }
  }

  if (profile.degree_field) {
    const degreeField = profile.degree_field.toLowerCase();
    if (title.includes(degreeField)) {
      score += 20;
      reasons.push("Title aligns with your degree field");
    }
  }

  if (profile.course) {
    const course = profile.course.toLowerCase();
    if (title.includes(course)) {
      score += 15;
      reasons.push("Title aligns with your course");
    }
  }

  if (profile.career_level) {
    const careerLevel = profile.career_level.toLowerCase();

    if (
      (careerLevel.includes("graduate") && title.includes("graduate")) ||
      (careerLevel.includes("entry") &&
        (title.includes("entry") ||
          title.includes("junior") ||
          title.includes("assistant")))
    ) {
      score += 15;
      reasons.push("Fits your career level");
    }
  } else {
    if (
      title.includes("graduate") ||
      title.includes("junior") ||
      title.includes("assistant") ||
      title.includes("trainee")
    ) {
      score += 8;
      reasons.push("Suitable for early-career candidates");
    }
  }

  if (visa.includes("available")) {
    score += 20;
    reasons.push("Visa sponsorship is available");
  }

  if (workMode.includes("remote")) {
    score += 5;
    reasons.push("Remote working option");
  } else if (workMode.includes("hybrid")) {
    score += 4;
    reasons.push("Hybrid working option");
  }

  const finalScore = Math.max(0, Math.min(100, score));

  if (reasons.length === 0) {
    reasons.push("General relevance based on your profile");
  }

  return {
    matchScore: finalScore,
    matchReasons: reasons,
  };
}

export default function JobsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("");
  const [visaFilter, setVisaFilter] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;

        if (user) {
          await ensureProfile();

          const { data: profileData } = await supabase
            .from("profiles")
            .select(
              "id, role, preferred_industry, preferred_location, degree_field, course, career_level"
            )
            .eq("id", user.id)
            .maybeSingle();

          if (profileData && profileData.role === "student") {
            setProfile(profileData as Profile);
          }
        }

        const { data: jobRows, error: jobsErr } = await supabase
          .from("jobs")
          .select(
            "id, title, location, work_mode, visa_sponsorship, company_id, sponsor_id, source_url, source_type, is_external, created_at"
          )
          .order("created_at", { ascending: false });

        if (jobsErr) {
          setError(jobsErr.message);
          setLoading(false);
          return;
        }

        const companyIds = Array.from(
          new Set((jobRows ?? []).map((j) => j.company_id).filter(Boolean))
        ) as string[];

        const sponsorIds = Array.from(
          new Set((jobRows ?? []).map((j) => j.sponsor_id).filter(Boolean))
        ) as string[];

        const companyMap = new Map<string, { name: string; industry: string | null }>();
        const sponsorMap = new Map<string, { name: string; industry: string | null }>();

        if (companyIds.length > 0) {
          const { data: companies } = await supabase
            .from("companies")
            .select("id, name, industry")
            .in("id", companyIds);

          (companies ?? []).forEach((c: CompanyRow) => {
            companyMap.set(c.id, {
              name: c.name,
              industry: c.industry ?? null,
            });
          });
        }

        if (sponsorIds.length > 0) {
          const { data: sponsors } = await supabase
            .from("sponsors")
            .select("id, name, industry")
            .in("id", sponsorIds);

          (sponsors ?? []).forEach((s: SponsorRow) => {
            sponsorMap.set(s.id, {
              name: s.name,
              industry: s.industry ?? null,
            });
          });
        }

        const currentProfile =
          user && profile === null
            ? await (async () => {
                const { data: p } = await supabase
                  .from("profiles")
                  .select(
                    "id, role, preferred_industry, preferred_location, degree_field, course, career_level"
                  )
                  .eq("id", user.id)
                  .maybeSingle();

                return p && p.role === "student" ? (p as Profile) : null;
              })()
            : profile;

        const cards: JobCard[] = (jobRows ?? []).map((j: JobRow) => {
          const companyInfo = j.company_id ? companyMap.get(j.company_id) : null;
          const sponsorInfo = j.sponsor_id ? sponsorMap.get(j.sponsor_id) : null;

          const displayName =
            companyInfo?.name ||
            sponsorInfo?.name ||
            "Hiring company not disclosed";

          const displayIndustry =
            companyInfo?.industry || sponsorInfo?.industry || null;

          const baseCard = {
            id: j.id,
            title: j.title,
            location: j.location ?? "Location not set",
            work_mode: j.work_mode ?? "Not set",
            visa_sponsorship: j.visa_sponsorship ?? "Unknown",
            displayName,
            displayIndustry,
            posted: timeAgo(j.created_at),
            is_external: Boolean(j.is_external),
            source_url: j.source_url,
          };

          const match = computeJobMatch(baseCard, currentProfile);

          return {
            ...baseCard,
            matchScore: match.matchScore,
            matchReasons: match.matchReasons,
          };
        });

        setJobs(cards);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.displayName.toLowerCase().includes(search.toLowerCase()) ||
        includesLoose(job.displayIndustry, search);

      const matchesLocation =
        !locationFilter ||
        job.location.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesWorkMode =
        !workModeFilter || job.work_mode === workModeFilter;

      const matchesVisa =
        !visaFilter || job.visa_sponsorship === visaFilter;

      return matchesSearch && matchesLocation && matchesWorkMode && matchesVisa;
    });
  }, [jobs, search, locationFilter, workModeFilter, visaFilter]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-black/70">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold">Jobs</h1>
        <p className="mt-2 text-black/70">
          Explore curated and employer-posted UK roles for international students.
        </p>
      </div>

      {profile && (
        <div className="mt-4 rounded-2xl border bg-white p-4 text-sm text-black/70 shadow-sm">
          Personalized job match is active based on your student profile.
        </div>
      )}

      <div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="text"
            placeholder="Search job title or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border px-4 py-3"
          />

          <input
            type="text"
            placeholder="Filter by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-xl border px-4 py-3"
          />

          <select
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="rounded-xl border px-4 py-3"
          >
            <option value="">All work modes</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>

          <select
            value={visaFilter}
            onChange={(e) => setVisaFilter(e.target.value)}
            className="rounded-xl border px-4 py-3"
          >
            <option value="">All sponsorship types</option>
            <option value="Available">Available</option>
            <option value="Not available">Not available</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border bg-white p-5 text-sm text-red-600">
          {error}
        </div>
      )}

      {!error && filteredJobs.length === 0 && (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-black/70">
          No jobs match your filters yet.
        </div>
      )}

      {!error && filteredJobs.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filteredJobs.map((job) => {
            const showMatch = job.matchScore !== null;

            return (
              <div
                key={job.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{job.title}</h2>
                    <p className="mt-2 text-black/70">{job.displayName}</p>
                    <p className="mt-1 text-sm text-black/60">
                      {job.location} • {job.work_mode} • Sponsorship:{" "}
                      {job.visa_sponsorship}
                    </p>

                    {job.displayIndustry && (
                      <p className="mt-1 text-sm text-black/60">
                        Industry: {job.displayIndustry}
                      </p>
                    )}

                    {job.is_external && (
                      <span className="mt-3 inline-block rounded-full border px-3 py-1 text-xs font-semibold">
                        External job
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-black/50">{job.posted}</span>

{job.matchScore !== null && (
  <div className="mt-2 rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold text-white">
    {job.matchScore < 50
      ? "Low match (<50%)"
      : job.matchScore >= 80
      ? "Strong match"
      : `Match ${job.matchScore}%`}
  </div>
)}
                  </div>
                </div>

                {showMatch && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-black/80">
                      Why this matches
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-black/70">
                      {job.matchReasons.map((reason, index) => (
                        <li key={`${job.id}-reason-${index}`}>✔ {reason}</li>
                      ))}
                    </ul>
                  </div>
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
            );
          })}
        </div>
      )}
    </main>
  );
}