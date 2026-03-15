"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/ensureProfile";

type EmployerProfileForm = {
  full_name: string;
  bio: string;
};

export default function EmployerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<EmployerProfileForm>({
    full_name: "",
    bio: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
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

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, full_name, bio, email")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (!profile || profile.role !== "employer") {
        setMessage("This page is for employers only.");
        setLoading(false);
        return;
      }

      setForm({
        full_name: profile.full_name ?? "",
        bio: profile.bio ?? "",
      });
    } catch (err: any) {
      console.error("Load employer profile error:", err);
      setMessage(err?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(name: keyof EmployerProfileForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveProfile() {
    setSaving(true);
    setMessage("");

    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      const user = auth.user;

      if (authError || !user) {
        window.location.href = "/auth";
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name.trim() || null,
          bio: form.bio.trim() || null,
        })
        .eq("id", user.id);

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Employer profile updated successfully.");
    } catch (err: any) {
      console.error("Save employer profile error:", err);
      setMessage(err?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p>Loading employer profile...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employer Profile</h1>
          <p className="mt-2 text-black/70">
            Update the recruiter profile linked to this employer account.
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
        <div className="grid gap-5">
          <div>
            <label className="text-sm font-semibold">Full name</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
              placeholder="Recruiter or hiring manager name"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Bio</label>
            <textarea
              className="mt-2 min-h-[140px] w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Short description about the recruiter or hiring team"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            type="button"
          >
            {saving ? "Saving..." : "Save profile"}
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
