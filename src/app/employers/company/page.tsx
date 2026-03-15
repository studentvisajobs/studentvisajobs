"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/ensureProfile";

type CompanyForm = {
  name: string;
  website: string;
  location: string;
  industry: string;
  description: string;
};

export default function EmployerCompanyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [form, setForm] = useState<CompanyForm>({
    name: "",
    website: "",
    location: "",
    industry: "",
    description: "",
  });

  useEffect(() => {
    loadCompany();
  }, []);

  async function loadCompany() {
    setLoading(true);
    setMessage("");

    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      const user = auth.user;

      if (authError || !user) {
        window.location.href = "/auth";
        return;
      }

      await ensureProfile();

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setMessage(profileError.message);
        setLoading(false);
        return;
      }

      if (!profile || profile.role !== "employer") {
        setMessage("This page is for employers only.");
        setLoading(false);
        return;
      }

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id, name, website, location, industry, description")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (companyError) {
        setMessage(companyError.message);
        setLoading(false);
        return;
      }

      if (company) {
        setCompanyId(company.id);
        setForm({
          name: company.name ?? "",
          website: company.website ?? "",
          location: company.location ?? "",
          industry: company.industry ?? "",
          description: company.description ?? "",
        });
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Load company error:", err);
      setMessage(err?.message || "Failed to load company.");
      setLoading(false);
    }
  }

  function updateField(name: keyof CompanyForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveCompany() {
    setSaving(true);
    setMessage("");

    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      const user = auth.user;

      if (authError || !user) {
        window.location.href = "/auth";
        return;
      }

      if (!form.name.trim()) {
        setMessage("Company name is required.");
        setSaving(false);
        return;
      }

      const payload = {
        ...(companyId ? { id: companyId } : {}),
        owner_id: user.id,
        name: form.name.trim(),
        website: form.website.trim() || null,
        location: form.location.trim() || null,
        industry: form.industry.trim() || null,
        description: form.description.trim() || null,
      };

      const { data, error } = await supabase
        .from("companies")
        .upsert(payload)
        .select("id")
        .single();

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setCompanyId(data.id);
      setMessage("Company profile saved successfully.");
    } catch (err: any) {
      console.error("Save company error:", err);
      setMessage(err?.message || "Failed to save company.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p>Loading company profile...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="mt-2 text-black/70">
            Create or update your company profile before posting jobs.
          </p>
        </div>

        <Link
          href="/employers"
          className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Back to employer dashboard
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Company name</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Amazon UK"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Website</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.website}
              onChange={(e) => updateField("website", e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Location</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="e.g. London"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Industry</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.industry}
              onChange={(e) => updateField("industry", e.target.value)}
              placeholder="e.g. Technology"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="text-sm font-semibold">Description</label>
          <textarea
            className="mt-2 min-h-[160px] w-full rounded-xl border bg-gray-50 px-4 py-3"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Tell students about your company, hiring focus, and sponsorship support"
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={saveCompany}
            disabled={saving}
            className="rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            type="button"
          >
            {saving ? "Saving..." : "Save company"}
          </button>

          <Link
            href="/employers"
            className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>

        {message && <p className="mt-4 text-sm text-black/70">{message}</p>}
      </div>
    </main>
  );
}
