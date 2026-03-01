"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Profile = { id: string; role: "student" | "employer" };
type Company = { id: string; name: string; website: string | null; location: string | null };

export default function EmployerHome() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;

      if (!user) {
        window.location.href = "/auth";
        return;
      }

      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

      if (profErr) {
        setError(profErr.message);
        setLoading(false);
        return;
      }

      setProfile(prof as Profile);

      if ((prof as Profile).role !== "employer") {
        setError("This area is for employers only.");
        setLoading(false);
        return;
      }

      const { data: comp, error: compErr } = await supabase
        .from("companies")
        .select("id, name, website, location")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (compErr) {
        setError(compErr.message);
        setLoading(false);
        return;
      }

      setCompany((comp as Company) ?? null);
      setLoading(false);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-black/70">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employer dashboard</h1>
          <p className="mt-2 text-black/70">
            Create your company profile and post jobs.
          </p>
        </div>
        <button
          onClick={signOut}
          className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border bg-white p-5 text-sm text-red-600">
          {error}
        </div>
      )}

      {!error && !company && (
        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Step 1: Create your company</h2>
          <p className="mt-2 text-black/70">
            You need a company profile before posting jobs.
          </p>
          <a
            href="/employer/company"
            className="mt-5 inline-block rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Create company →
          </a>
        </div>
      )}

      {!error && company && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">{company.name}</h2>
            <p className="mt-2 text-black/70">
              {company.location ?? "Location not set"}
            </p>
            {company.website && (
              <p className="mt-1 text-sm text-black/60">{company.website}</p>
            )}
            <div className="mt-5 flex gap-3">
              <a
                href="/employer/company"
                className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Edit company
              </a>
              <a
                href="/employer/jobs/new"
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Post a job
              </a>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Next</h3>
            <p className="mt-2 text-black/70">
              After posting, your jobs will appear on the Jobs page.
            </p>
            <a
              className="mt-5 inline-block text-sm font-semibold hover:text-black/70"
              href="/jobs"
            >
              View Jobs →
            </a>
          </div>
        </div>
      )}
    </main>
  );
}