"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Sponsor = {
  id: string;
  name: string;
};

type Company = {
  id: string;
  name: string;
};

function normalizeCompanyName(name: string) {
  return name
    .toLowerCase()
    .replace(/\b(ltd|limited|llp|plc|uk|group|holdings?)\b/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function NewJobPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [company, setCompany] = useState<Company | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [visaSponsorship, setVisaSponsorship] = useState("");
  const [sponsorId, setSponsorId] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [matchMsg, setMatchMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        window.location.href = "/auth";
        return;
      }

      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("id, name")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (companyError) {
        setError(companyError.message);
        setLoading(false);
        return;
      }

      if (!companyData) {
        setError("No company found.");
        setLoading(false);
        return;
      }

      setCompany(companyData as Company);

      const { data: sponsorRows, error: sponsorError } = await supabase
        .from("sponsors")
        .select("id, name")
        .order("name", { ascending: true });

      if (sponsorError) {
        setError(sponsorError.message);
        setLoading(false);
        return;
      }

      const sponsorList = (sponsorRows || []) as Sponsor[];
      setSponsors(sponsorList);

      // Auto-match sponsor based on company name
      const normalizedCompany = normalizeCompanyName(companyData.name);

      const exactMatch = sponsorList.find(
        (s) => normalizeCompanyName(s.name) === normalizedCompany
      );

      if (exactMatch) {
        setSponsorId(exactMatch.id);
        setMatchMsg(`Auto-linked sponsor: ${exactMatch.name}`);
      } else {
        const partialMatch = sponsorList.find((s) => {
          const normalizedSponsor = normalizeCompanyName(s.name);
          return (
            normalizedSponsor.includes(normalizedCompany) ||
            normalizedCompany.includes(normalizedSponsor)
          );
        });

        if (partialMatch) {
          setSponsorId(partialMatch.id);
          setMatchMsg(`Suggested sponsor match: ${partialMatch.name}`);
        }
      }

      setLoading(false);
    })();
  }, []);

  async function createJob(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!company?.id) {
      setError("Company not found.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("jobs").insert({
      company_id: company.id,
      title,
      location,
      work_mode: workMode,
      visa_sponsorship: visaSponsorship,
      sponsor_id: sponsorId || null,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    window.location.href = "/employers";
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
      <h1 className="text-3xl font-bold">Post a job</h1>
      <p className="mt-2 text-black/70">
        Add a new job listing for your company.
      </p>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      {matchMsg && (
        <div className="mt-4 rounded-xl border bg-white p-4 text-sm text-green-700">
          {matchMsg}
        </div>
      )}

      <form
        onSubmit={createJob}
        className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Job title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
              placeholder="e.g. Software Engineer"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Location</label>
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
              placeholder="e.g. London"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Work mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
              required
            >
              <option value="">Select</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Visa sponsorship</label>
            <select
              value={visaSponsorship}
              onChange={(e) => setVisaSponsorship(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
              required
            >
              <option value="">Select</option>
              <option value="Available">Available</option>
              <option value="Not available">Not available</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Linked sponsor company</label>
            <select
              value={sponsorId}
              onChange={(e) => setSponsorId(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
            >
              <option value="">No linked sponsor</option>
              {sponsors.map((sponsor) => (
                <option key={sponsor.id} value={sponsor.id}>
                  {sponsor.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-black/60">
              The system tries to match your company to a sponsor automatically. You can still change it manually.
            </p>
          </div>

          <button
            disabled={saving}
            className="mt-4 w-fit rounded-xl bg-black px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create job"}
          </button>
        </div>
      </form>
    </main>
  );
}