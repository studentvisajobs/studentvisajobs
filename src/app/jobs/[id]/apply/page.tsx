"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

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

type ExistingApplication = {
  id: string;
  cover_letter: string | null;
  cv_url: string | null;
};

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [existingApplication, setExistingApplication] =
    useState<ExistingApplication | null>(null);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      setMsg("");

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
        setError("Only students can apply.");
        setLoading(false);
        return;
      }

      const { data: jobData, error: jobErr } = await supabase
        .from("jobs")
        .select("id, title, location, work_mode, company_id")
        .eq("id", jobId)
        .maybeSingle();

      if (jobErr || !jobData) {
        setError(jobErr?.message || "Job not found.");
        setLoading(false);
        return;
      }

      setJob(jobData as Job);

      const { data: companyData } = await supabase
        .from("companies")
        .select("id, name")
        .eq("id", jobData.company_id)
        .maybeSingle();

      if (companyData) {
        setCompany(companyData as Company);
      }

      const { data: existing } = await supabase
        .from("applications")
        .select("id, cover_letter, cv_url")
        .eq("job_id", jobId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const app = existing as ExistingApplication;
        setExistingApplication(app);
        setCoverLetter(app.cover_letter ?? "");
      }

      setLoading(false);
    })();
  }, [jobId]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMsg("");

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    let cvUrl = existingApplication?.cv_url ?? null;

    if (cvFile) {
      const fileExt = cvFile.name.split(".").pop();
      const filePath = `${user.id}/${jobId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(filePath, cvFile, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("cvs")
        .getPublicUrl(filePath);

      cvUrl = publicUrlData.publicUrl;
    }

    if (existingApplication) {
      const { error: updateError } = await supabase
        .from("applications")
        .update({
          cover_letter: coverLetter,
          cv_url: cvUrl,
        })
        .eq("id", existingApplication.id);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      setMsg("Application updated ✅");
    } else {
      const { error: insertError } = await supabase.from("applications").insert({
        job_id: jobId,
        user_id: user.id,
        cover_letter: coverLetter,
        cv_url: cvUrl,
      });

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }

      setMsg("Application submitted ✅");
    }

    setSaving(false);

    setTimeout(() => {
      router.push(`/jobs/${jobId}`);
    }, 1200);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <button
        onClick={() => router.push(`/jobs/${jobId}`)}
        className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
      >
        ← Back
      </button>

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Apply for {job?.title}</h1>
        <p className="mt-2 text-black/70">
          {company?.name} • {job?.location} • {job?.work_mode}
        </p>

        {existingApplication && (
          <p className="mt-4 text-sm text-black/70">
            You already applied for this job. You can update your cover letter or CV below.
          </p>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {msg && <p className="mt-4 text-sm text-green-600">{msg}</p>}

        <form onSubmit={handleApply} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-semibold">Cover letter</label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="mt-1 min-h-[150px] w-full rounded-xl border px-4 py-3"
              placeholder="Tell the employer why you're a good fit..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold" htmlFor="cv-upload">
              CV
            </label>

            <label
              htmlFor="cv-upload"
              className="inline-block cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              {cvFile ? "Change CV" : "Upload CV"}
            </label>

            <input
              id="cv-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />

            <div className="mt-2 text-sm text-black/70">
              {cvFile?.name
                ? `Selected: ${cvFile.name}`
                : existingApplication?.cv_url
                ? "A CV is already attached to this application."
                : "No CV selected yet."}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-fit rounded-xl bg-black px-6 py-3 text-white font-semibold disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : existingApplication
              ? "Update application"
              : "Submit application"}
          </button>
        </form>
      </div>
    </main>
  );
}