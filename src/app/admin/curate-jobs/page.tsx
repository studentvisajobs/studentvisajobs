"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Sponsor = {
  id: string;
  name: string;
  website: string | null;
  location: string | null;
  industry: string | null;
};

function detectSourceType(url: string) {
  const lower = url.toLowerCase();

  if (!lower) return "Company website";
  if (lower.includes("linkedin.com")) return "LinkedIn";
  if (lower.includes("indeed.")) return "Indeed";
  if (lower.includes("glassdoor.")) return "Glassdoor";
  if (lower.includes("workday")) return "Careers portal";
  if (lower.includes("greenhouse")) return "Careers portal";
  if (lower.includes("lever.co")) return "Careers portal";
  if (lower.includes("jobs.nhs")) return "NHS Jobs";
  if (lower.includes("gov.uk")) return "Government";
  if (lower.includes("gradcracker")) return "Gradcracker";
  return "Company website";
}

function detectWorkMode(text: string) {
  const lower = text.toLowerCase();

  if (lower.includes("remote")) return "Remote";
  if (lower.includes("hybrid")) return "Hybrid";
  if (lower.includes("on-site") || lower.includes("onsite")) return "On-site";

  return "";
}

export default function CurateJobsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorSearch, setSponsorSearch] = useState("");
  const [sponsorId, setSponsorId] = useState("");

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [visaSponsorship, setVisaSponsorship] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceType, setSourceType] = useState("Company website");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    setLoading(false);
  }, []);

  async function searchSponsors(query: string) {
    if (!query || query.length < 2) {
      setSponsors([]);
      return;
    }

    const { data, error } = await supabase
      .from("sponsors")
      .select("id, name, location, industry")
      .ilike("name", `%${query}%`)
      .limit(20);

    if (error) {
      console.error(error);
      return;
    }

    setSponsors(data || []);
  }


  const selectedSponsor = useMemo(() => {
    return sponsors.find((s) => s.id === sponsorId) ?? null;
  }, [sponsors, sponsorId]);

  const filteredSponsors = useMemo(() => {
    if (!sponsorSearch.trim()) return sponsors.slice(0, 20);

    const q = sponsorSearch.toLowerCase();
    return sponsors
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 20);
  }, [sponsors, sponsorSearch]);

  useEffect(() => {
    if (!selectedSponsor) return;

    if (!visaSponsorship) {
      setVisaSponsorship("Available");
    }

    if (!location && selectedSponsor.location) {
      setLocation(selectedSponsor.location);
    }
  }, [selectedSponsor, visaSponsorship, location]);

  function handleUrlChange(value: string) {
    setSourceUrl(value);
    setSourceType(detectSourceType(value));

    if (!description) {
      const detectedType = detectSourceType(value);

      if (detectedType === "NHS Jobs") {
        setDescription("Curated role from NHS Jobs.");
      } else if (detectedType === "LinkedIn") {
        setDescription("Curated external role from LinkedIn.");
      } else if (detectedType === "Gradcracker") {
        setDescription("Curated graduate role from Gradcracker.");
      } else if (detectedType === "Careers portal") {
        setDescription("Curated role from company careers portal.");
      }
    }
  }

  function autofillFromInputs() {
    setMsg("");
    setError("");

    if (!sourceUrl && !title && !description) {
      setError("Add at least a URL, title, or description to use autofill.");
      return;
    }

    const combined = `${title} ${description} ${sourceUrl}`;
    const detectedMode = detectWorkMode(combined);

    if (!workMode && detectedMode) {
      setWorkMode(detectedMode);
    }

    if (!visaSponsorship && sponsorId) {
      setVisaSponsorship("Available");
    }

    setMsg("Autofill suggestions applied where possible.");
  }

  async function refreshSponsorJobCount(linkedSponsorId: string) {
    const { count } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("sponsor_id", linkedSponsorId);

    await supabase
      .from("sponsors")
      .update({ open_jobs_count: count ?? 0 })
      .eq("id", linkedSponsorId);
  }

  async function createCuratedJob(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMsg("");

    if (!title || !location || !workMode || !visaSponsorship || !sourceUrl) {
      setError("Please fill all required fields.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("jobs").insert({
      title,
      location,
      work_mode: workMode,
      visa_sponsorship: visaSponsorship,
      sponsor_id: sponsorId || null,
      company_id: null,
      source_url: sourceUrl,
      source_type: sourceType,
      is_external: true,
      description: description || null,
      expires_at: expiresAt || null,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    if (sponsorId) {
      await refreshSponsorJobCount(sponsorId);
    }

    setMsg("Curated job added ✅");
    setTitle("");
    setLocation("");
    setWorkMode("");
    setVisaSponsorship("");
    setSponsorId("");
    setSponsorSearch("");
    setSourceUrl("");
    setSourceType("Company website");
    setDescription("");
    setExpiresAt("");
    setSaving(false);
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
      <h1 className="text-3xl font-bold">Curate External Jobs</h1>
      <p className="mt-2 text-black/70">
        Paste a job link, search a sponsor, and add a curated role to the platform.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border bg-white p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {msg && (
        <div className="mt-4 rounded-xl border bg-white p-4 text-sm text-green-600">
          {msg}
        </div>
      )}

      <form
        onSubmit={createCuratedJob}
        className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Search sponsor</label>
            <input
              value={sponsorSearch}
              onChange={(e) => {
                const value = e.target.value;
                setSponsorSearch(value);
                searchSponsors(value);
              }}
              className="mt-1 w-full rounded-xl border px-4 py-3"
              placeholder="Search sponsor..."
            />


            <div className="mt-3 max-h-64 overflow-auto rounded-xl border">
              {filteredSponsors.map((sponsor) => (
                <button
                  key={sponsor.id}
                  type="button"
                  onClick={() => {
                    setSponsorId(sponsor.id);
                    setSponsorSearch(sponsor.name);
                  }}
                  className={`block w-full border-b px-4 py-3 text-left last:border-b-0 hover:bg-gray-50 ${
                    sponsorId === sponsor.id ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="font-semibold">{sponsor.name}</div>
                  <div className="text-sm text-black/60">
                    {sponsor.industry || "Industry"} • {sponsor.location || "Location"}
                  </div>
                </button>
              ))}
            </div>

            {selectedSponsor && (
              <p className="mt-2 text-sm text-black/60">
                Selected sponsor: {selectedSponsor.name}
                {selectedSponsor.industry ? ` • ${selectedSponsor.industry}` : ""}
                {selectedSponsor.location ? ` • ${selectedSponsor.location}` : ""}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold">Source URL</label>
            <input
              value={sourceUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
              placeholder="https://company.com/careers/job"
              required
            />
            <p className="mt-2 text-sm text-black/60">
              Detected source type: <span className="font-semibold">{sourceType}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={autofillFromInputs}
              className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Autofill suggestions
            </button>
          </div>

          <div>
            <label className="text-sm font-semibold">Job title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
              placeholder="e.g. Graduate Analyst"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
              placeholder="e.g. London"
              required
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
            <label className="text-sm font-semibold">Source type</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
            >
              <option value="Company website">Company website</option>
              <option value="Careers portal">Careers portal</option>
              <option value="NHS Jobs">NHS Jobs</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Indeed">Indeed</option>
              <option value="Glassdoor">Glassdoor</option>
              <option value="Gradcracker">Gradcracker</option>
              <option value="Government">Government</option>
              <option value="University jobs board">University jobs board</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-[140px] w-full rounded-xl border px-4 py-3"
              placeholder="Short summary of the role..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Expiry date</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <button
            disabled={saving}
            className="mt-4 w-fit rounded-xl bg-black px-6 py-3 text-white font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add curated job"}
          </button>
        </div>
      </form>
    </main>
  );
}