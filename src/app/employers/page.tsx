"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/ensureProfile";

type Role = "student" | "employer";

type Profile = {
  id: string;
  role: Role;
};

type Company = {
  id: string;
  name: string;
  website: string | null;
  location: string | null;
};

export default function EmployerHome() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEmployerDashboard() {
      try {
        if (!cancelled) {
          setLoading(true);
          setError(null);
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const user = session?.user;

        if (!user) {
          window.location.href = "/auth";
          return;
        }

        await ensureProfile();

        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", user.id)
          .maybeSingle();

        if (profErr) throw profErr;

        if (!prof) {
          window.location.href = "/auth";
          return;
        }

        if ((prof as Profile).role !== "employer") {
          window.location.href = "/student/dashboard";
          return;
        }

        if (!cancelled) {
          setProfile(prof as Profile);
        }

        const { data: comp, error: compErr } = await supabase
          .from("companies")
          .select("id, name, website, location")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (compErr) throw compErr;

        if (!cancelled) {
          setCompany((comp as Company) ?? null);
          setLoading(false);
        }
      } catch (e: any) {
        console.error("Employer dashboard error:", e);

        if (!cancelled) {
          setError(e?.message ?? "Something went wrong.");
          setLoading(false);
        }
      }
    }

    loadEmployerDashboard();

    return () => {
      cancelled = true;
    };
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

        <div className="flex gap-3">
          <Link
            href="/employers/profile"
            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Edit employer profile
          </Link>

          <button
            onClick={signOut}
            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border bg-white p-5 text-sm text-red-600">
          {error}
        </div>
      )}

      {!error && profile && !company && (
        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Step 1: Create your company</h2>
          <p className="mt-2 text-black/70">
            You need a company profile before posting jobs.
          </p>

          <Link
            href="/employers/company"
            className="mt-5 inline-block rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Create company →
          </Link>
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

            <div className="mt-5 flex gap-3 flex-wrap">
              <Link
                href="/employers/company"
                className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Edit company
              </Link>

              <Link
                href="/employers/jobs/new"
                className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Post a job
              </Link>

              <Link
                href="/employers/applicants"
                className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                View applicants
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Next</h3>

            <p className="mt-2 text-black/70">
              After posting, your jobs will appear on the Jobs page and can be linked to sponsor companies.
            </p>

            <Link
              href="/jobs"
              className="mt-5 inline-block text-sm font-semibold hover:text-black/70"
            >
              View Jobs →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
