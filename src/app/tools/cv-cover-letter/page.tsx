"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getJobPromptContext } from "@/lib/getJobPromptContext";

function CvCoverLetterPageContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [currentCv, setCurrentCv] = useState("");
  const [currentExperience, setCurrentExperience] = useState("");
  const [tone, setTone] = useState("professional");

  const [profileCvUrl, setProfileCvUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    async function loadProfileCv() {
      setLoadingProfile(true);

      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        setLoadingProfile(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("cv_url")
        .eq("id", user.id)
        .maybeSingle();

      setProfileCvUrl(profile?.cv_url ?? "");
      setLoadingProfile(false);
    }

    loadProfileCv();
  }, []);

  useEffect(() => {
    async function loadJobContext() {
      if (!jobId) return;

      setLoadingJob(true);
      setError("");

      const { data, error } = await getJobPromptContext(jobId);

      if (error || !data) {
        setError(error || "Failed to load job details.");
        setLoadingJob(false);
        return;
      }

      setJobTitle(data.title || "");
      setCompanyName(data.company_name || "");

      const summary = `
Job Title: ${data.title}
Company: ${data.company_name || "Unknown company"}
Location: ${data.location || "Not set"}
Work Mode: ${data.work_mode || "Not set"}
Visa Sponsorship: ${data.visa_sponsorship || "Unknown"}
Company Website: ${data.company_website || "Not set"}

Company / Sponsor Notes:
${data.company_description || "No additional company description available."}
      `.trim();

      setJobDescription(summary);
      setLoadingJob(false);
    }

    loadJobContext();
  }, [jobId]);

  async function generateDocs(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/ai/career-docs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle,
          companyName,
          jobDescription,
          currentCv: currentCv.trim(),
          currentExperience,
          tone,
          jobId,
          profileCvUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to generate documents.");
        setLoading(false);
        return;
      }

      setResult(data.result || "");
    } catch {
      setError("Failed to generate documents.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold">AI CV + Cover Letter Generator</h1>
      <p className="mt-2 text-black/70">
        Paste a job and generate a tailored CV draft and cover letter.
      </p>

      {jobId && (
        <div className="mt-4 rounded-xl border bg-white p-4 text-sm text-black/70">
          {loadingJob
            ? "Loading selected job details..."
            : "Selected job details have been loaded automatically."}
        </div>
      )}

      {!loadingProfile && profileCvUrl && (
        <div className="mt-4 rounded-xl border bg-white p-4 text-sm text-black/70">
          <p className="font-semibold text-black">Profile CV available</p>
          <p className="mt-1">
            If you leave the CV text box empty, the AI tool will use your uploaded
            profile CV as supporting context.
          </p>
          <a
            href={profileCvUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block font-semibold text-blue-900 hover:text-blue-700"
          >
            View uploaded CV →
          </a>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border bg-white p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={generateDocs}
        className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Job title</label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Company name</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Job description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="mt-1 min-h-[220px] w-full rounded-xl border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">
              Current CV (paste text if you want)
            </label>
            <textarea
              value={currentCv}
              onChange={(e) => setCurrentCv(e.target.value)}
              className="mt-1 min-h-[180px] w-full rounded-xl border px-4 py-3"
              placeholder="Paste your current CV text here. If left blank, your uploaded profile CV will be used as supporting context."
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Experience notes</label>
            <textarea
              value={currentExperience}
              onChange={(e) => setCurrentExperience(e.target.value)}
              className="mt-1 min-h-[140px] w-full rounded-xl border px-4 py-3"
              placeholder="Optional extra context..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
            >
              <option value="professional">Professional</option>
              <option value="confident">Confident</option>
              <option value="formal">Formal</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          <button
            disabled={loading || loadingJob || loadingProfile}
            className="mt-2 w-fit rounded-xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate documents"}
          </button>
        </div>
      </form>

      {result && (
        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Generated Output</h2>
          <pre className="mt-4 whitespace-pre-wrap text-sm text-black/80">
            {result}
          </pre>
        </section>
      )}
    </main>
  );
}

export default function CvCoverLetterPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-6 py-12">
          <p>Loading AI tool...</p>
        </main>
      }
    >
      <CvCoverLetterPageContent />
    </Suspense>
  );
}