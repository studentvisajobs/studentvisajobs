"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/ensureProfile";

type Job = {
  id: string;
  title: string;
  location: string | null;
  work_mode: string | null;
  visa_sponsorship: string | null;
  company_id: string | null;
  sponsor_id?: string | null;
  created_at: string;
};

type Company = {
  id: string;
  name: string;
  website: string | null;
  location: string | null;
  industry?: string | null;
  description?: string | null;
};

type Sponsor = {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  sponsorship_status: string | null;
  priority_score: number | null;
  target_student_friendly: boolean | null;
  open_jobs_count: number | null;
};

type Profile = {
  id: string;
  role: "student" | "employer";
  preferred_industry: string | null;
  preferred_location: string | null;
  degree_field: string | null;
  course: string | null;
  career_level: string | null;
  visa_status?: string | null;
  full_name?: string | null;
  university?: string | null;
};

type ReadinessResult = {
  label: "Strong fit" | "Good fit" | "Possible fit" | "Low fit";
  strengths: string[];
  improvements: string[];
};

function computeJobMatch(
  input: {
    title: string;
    location: string;
    workMode: string;
    visaSponsorship: string;
    industry: string | null;
    sponsorPriorityScore: number | null;
    sponsorStudentFriendly: boolean | null;
    sponsorOpenJobsCount: number | null;
    sponsorStatus: string | null;
  },
  profile: Profile | null
) {
  if (!profile || profile.role !== "student") {
    return {
      matchScore: null as number | null,
      matchReasons: [] as string[],
    };
  }

  let score = 0;
  const reasons: string[] = [];

  const title = input.title.toLowerCase();
  const location = input.location.toLowerCase();
  const workMode = input.workMode.toLowerCase();
  const visa = input.visaSponsorship.toLowerCase();
  const industry = input.industry?.toLowerCase() ?? "";

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
          title.includes("assistant") ||
          title.includes("trainee")))
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

  if (input.sponsorStudentFriendly) {
    score += 8;
    reasons.push("Sponsor is student friendly");
  }

  if ((input.sponsorOpenJobsCount ?? 0) > 0) {
    score += 5;
    reasons.push("Sponsor has active jobs");
  }

  if ((input.sponsorPriorityScore ?? 0) >= 20) {
    score += 8;
    reasons.push("Strong sponsorship profile");
  }

  if (
    input.sponsorStatus &&
    input.sponsorStatus.toLowerCase().includes("active")
  ) {
    score += 6;
    reasons.push("Active sponsorship status");
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

function computeReadiness(
  matchScore: number | null,
  job: Job,
  profile: Profile | null,
  sponsor: Sponsor | null
): ReadinessResult | null {
  if (matchScore === null || !profile || profile.role !== "student") {
    return null;
  }

  const strengths: string[] = [];
  const improvements: string[] = [];

  const title = (job.title || "").toLowerCase();
  const visa = (job.visa_sponsorship || "").toLowerCase();
  const workMode = (job.work_mode || "").toLowerCase();

  if (visa.includes("available")) {
    strengths.push("Visa sponsorship is available for this role");
  } else {
    improvements.push("Confirm sponsorship availability before applying");
  }

  if (
    profile.preferred_location &&
    job.location &&
    job.location.toLowerCase().includes(profile.preferred_location.toLowerCase())
  ) {
    strengths.push("The location matches your stated preference");
  } else if (workMode.includes("remote") || workMode.includes("hybrid")) {
    strengths.push("Flexible work mode may still make this role suitable");
  }

  if (profile.preferred_industry && sponsor?.industry) {
    if (
      sponsor.industry
        .toLowerCase()
        .includes(profile.preferred_industry.toLowerCase())
    ) {
      strengths.push("The role sits in your preferred industry");
    }
  }

  if (profile.degree_field) {
    if (title.includes(profile.degree_field.toLowerCase())) {
      strengths.push("The role aligns with your degree field");
    } else {
      improvements.push("Highlight projects and modules related to this role");
    }
  } else {
    improvements.push("Complete your profile degree field for better matching");
  }

  if (profile.course) {
    if (!title.includes(profile.course.toLowerCase())) {
      improvements.push("Tailor your CV to show course-relevant skills");
    }
  }

  if (profile.career_level) {
    const careerLevel = profile.career_level.toLowerCase();
    if (
      (careerLevel.includes("graduate") && title.includes("graduate")) ||
      (careerLevel.includes("entry") &&
        (title.includes("entry") ||
          title.includes("junior") ||
          title.includes("assistant") ||
          title.includes("trainee")))
    ) {
      strengths.push("The role appears suitable for your career level");
    } else {
      improvements.push("Explain clearly why you fit this level in your cover letter");
    }
  } else {
    improvements.push("Set your career level in your student profile");
  }

  if (sponsor?.target_student_friendly) {
    strengths.push("This sponsor appears student friendly");
  }

  if ((sponsor?.priority_score ?? 0) >= 20) {
    strengths.push("This employer has a strong sponsorship profile");
  }

  if (!profile.visa_status) {
    improvements.push("Add your visa status to your profile before applying");
  }

  if (!profile.full_name || !profile.university) {
    improvements.push("Complete your profile details so your application looks stronger");
  }

  improvements.push("Tailor your CV and cover letter to this exact job before applying");

  const uniqueStrengths = Array.from(new Set(strengths)).slice(0, 4);
  const uniqueImprovements = Array.from(new Set(improvements)).slice(0, 4);

  let label: ReadinessResult["label"] = "Low fit";
  if (matchScore >= 85) label = "Strong fit";
  else if (matchScore >= 65) label = "Good fit";
  else if (matchScore >= 40) label = "Possible fit";

  return {
    label,
    strengths: uniqueStrengths,
    improvements: uniqueImprovements,
  };
}

function readinessBadgeClasses(label: ReadinessResult["label"]) {
  if (label === "Strong fit") {
    return "bg-emerald-600 text-white";
  }
  if (label === "Good fit") {
    return "bg-blue-900 text-white";
  }
  if (label === "Possible fit") {
    return "bg-amber-500 text-white";
  }
  return "bg-red-600 text-white";
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [matchReasons, setMatchReasons] = useState<string[]>([]);
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: jobRow, error: jobErr } = await supabase
          .from("jobs")
          .select(
            "id, title, location, work_mode, visa_sponsorship, company_id, sponsor_id, created_at"
          )
          .eq("id", jobId)
          .single();

        if (jobErr) {
          setError(jobErr.message);
          setLoading(false);
          return;
        }

        const currentJob = jobRow as Job;
        setJob(currentJob);

        let currentCompany: Company | null = null;
        let currentSponsor: Sponsor | null = null;

        if (currentJob.company_id) {
          const { data: compRow, error: compErr } = await supabase
            .from("companies")
            .select("id, name, website, location, industry, description")
            .eq("id", currentJob.company_id)
            .single();

          if (compErr) {
            setError(compErr.message);
            setLoading(false);
            return;
          }

          currentCompany = compRow as Company;
          setCompany(currentCompany);
        }

        if (currentJob.sponsor_id) {
          const { data: sponsorRow } = await supabase
            .from("sponsors")
            .select(
              "id, name, industry, location, sponsorship_status, priority_score, target_student_friendly, open_jobs_count"
            )
            .eq("id", currentJob.sponsor_id)
            .maybeSingle();

          if (sponsorRow) {
            currentSponsor = sponsorRow as Sponsor;
            setSponsor(currentSponsor);
          }
        }

        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;

        if (user) {
          await ensureProfile();

          const { data: profileRow } = await supabase
            .from("profiles")
            .select(
              "id, role, preferred_industry, preferred_location, degree_field, course, career_level, visa_status, full_name, university"
            )
            .eq("id", user.id)
            .maybeSingle();

          if (profileRow && profileRow.role === "student") {
            const studentProfile = profileRow as Profile;
            setProfile(studentProfile);

            const match = computeJobMatch(
              {
                title: currentJob.title,
                location: currentJob.location ?? "Location not set",
                workMode: currentJob.work_mode ?? "Not set",
                visaSponsorship: currentJob.visa_sponsorship ?? "Unknown",
                industry:
                  currentCompany?.industry ?? currentSponsor?.industry ?? null,
                sponsorPriorityScore: currentSponsor?.priority_score ?? null,
                sponsorStudentFriendly:
                  currentSponsor?.target_student_friendly ?? null,
                sponsorOpenJobsCount: currentSponsor?.open_jobs_count ?? null,
                sponsorStatus: currentSponsor?.sponsorship_status ?? null,
              },
              studentProfile
            );

            setMatchScore(match.matchScore);
            setMatchReasons(match.matchReasons);

            setReadiness(
              computeReadiness(
                match.matchScore,
                currentJob,
                studentProfile,
                currentSponsor
              )
            );
          }

          const { data: existing } = await supabase
            .from("applications")
            .select("id")
            .eq("job_id", jobId)
            .eq("user_id", user.id)
            .maybeSingle();

          if (existing) setApplied(true);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Job details load error:", err);
        setError(err?.message || "Failed to load job.");
        setLoading(false);
      }
    })();
  }, [jobId]);

  async function applyToJob() {
    setApplyError(null);
    setApplying(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr) {
      setApplyError(profErr.message);
      setApplying(false);
      return;
    }

    if (!prof) {
      setApplyError("No profile found for this account.");
      setApplying(false);
      return;
    }

    if ((prof as { role: "student" | "employer" }).role !== "student") {
      setApplyError("Only students can apply.");
      setApplying(false);
      return;
    }

    const { error } = await supabase.from("applications").insert({
      job_id: jobId,
      user_id: user.id,
    });

    if (error) {
      if (error.message.toLowerCase().includes("duplicate")) {
        setApplied(true);
        setApplying(false);
        return;
      }

      setApplyError(error.message);
      setApplying(false);
      return;
    }

    setApplied(true);
    setApplying(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-black/70">Loading…</p>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-2xl border bg-white p-6 text-red-600">
          {error ?? "Job not found."}
        </div>
        <div className="mt-4">
          <Link className="text-sm font-semibold hover:text-black/70" href="/jobs">
            ← Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  const displayOrgName = company?.name || sponsor?.name || "Unknown company";

  const displayOrgLocation =
    job.location || company?.location || sponsor?.location || "Location not set";

  const displayIndustry = company?.industry || sponsor?.industry || null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Link className="text-sm font-semibold hover:text-black/70" href="/jobs">
        ← Back to Jobs
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="mt-2 text-black/70">{displayOrgName}</p>
          <p className="mt-1 text-sm text-black/60">
            {displayOrgLocation} • {job.work_mode ?? "Not set"} • Sponsorship:{" "}
            {job.visa_sponsorship ?? "Unknown"}
          </p>

          {displayIndustry && (
            <p className="mt-2 text-sm text-black/60">
              Industry: {displayIndustry}
            </p>
          )}

          {company?.website && (
            <p className="mt-2 text-sm">
              <a
                className="font-semibold hover:text-black/70"
                href={company.website}
                target="_blank"
                rel="noreferrer"
              >
                {company.website}
              </a>
            </p>
          )}

          {company?.description && (
            <div className="mt-6">
              <h2 className="text-lg font-bold">About the company</h2>
              <p className="mt-2 whitespace-pre-line text-black/70">
                {company.description}
              </p>
            </div>
          )}

          <div className="mt-6">
            {applyError && (
              <p className="mb-3 text-sm text-red-600">{applyError}</p>
            )}

            {applied ? (
              <div className="inline-block rounded-xl border px-4 py-2 text-sm font-semibold">
                Already applied
              </div>
            ) : (
              <button
                onClick={applyToJob}
                disabled={applying}
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                type="button"
              >
                {applying ? "Applying..." : "Apply"}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {matchScore !== null && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">Match Score</h2>
                <div className="rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold text-white">
                  {matchScore}%
                </div>
              </div>

              <p className="mt-3 text-sm text-black/70">
                Based on your student profile, preferences, and this job’s details.
              </p>

              <div className="mt-4">
                <p className="text-sm font-semibold text-black/80">
                  Why this matches
                </p>
                <ul className="mt-2 space-y-1 text-sm text-black/70">
                  {matchReasons.map((reason, index) => (
                    <li key={`reason-${index}`}>✔ {reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {readiness && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">Application Readiness</h2>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${readinessBadgeClasses(
                    readiness.label
                  )}`}
                >
                  {readiness.label}
                </div>
              </div>

              <p className="mt-3 text-sm text-black/70">
                A quick view of how ready you are to apply for this role based on your profile and the job details.
              </p>

              <div className="mt-4">
                <p className="text-sm font-semibold text-black/80">Strengths</p>
                <ul className="mt-2 space-y-1 text-sm text-black/70">
                  {readiness.strengths.map((item, index) => (
                    <li key={`strength-${index}`}>✔ {item}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-black/80">
                  Before applying
                </p>
                <ul className="mt-2 space-y-1 text-sm text-black/70">
                  {readiness.improvements.map((item, index) => (
                    <li key={`improvement-${index}`}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Job Summary</h2>
            <div className="mt-4 space-y-3 text-sm text-black/70">
              <p>
                <span className="font-semibold text-black">Company:</span>{" "}
                {displayOrgName}
              </p>
              <p>
                <span className="font-semibold text-black">Location:</span>{" "}
                {displayOrgLocation}
              </p>
              <p>
                <span className="font-semibold text-black">Work mode:</span>{" "}
                {job.work_mode ?? "Not set"}
              </p>
              <p>
                <span className="font-semibold text-black">Visa sponsorship:</span>{" "}
                {job.visa_sponsorship ?? "Unknown"}
              </p>
              <p>
                <span className="font-semibold text-black">Posted:</span>{" "}
                {new Date(job.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {sponsor && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Sponsor Intelligence</h2>
              <div className="mt-4 space-y-3 text-sm text-black/70">
                <p>
                  <span className="font-semibold text-black">Sponsor:</span>{" "}
                  {sponsor.name}
                </p>
                <p>
                  <span className="font-semibold text-black">Status:</span>{" "}
                  {sponsor.sponsorship_status || "Unknown"}
                </p>
                <p>
                  <span className="font-semibold text-black">Priority score:</span>{" "}
                  {sponsor.priority_score ?? 0}
                </p>
                <p>
                  <span className="font-semibold text-black">Open jobs:</span>{" "}
                  {sponsor.open_jobs_count ?? 0}
                </p>
                <p>
                  <span className="font-semibold text-black">Student friendly:</span>{" "}
                  {sponsor.target_student_friendly ? "Yes" : "No"}
                </p>
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
          )}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Application Tools</h2>
            <div className="mt-4 space-y-3">
              <Link
                href={`/tools/cv-cover-letter?jobId=${job.id}`}
                className="block rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-gray-50"
              >
                Generate tailored CV / cover letter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
