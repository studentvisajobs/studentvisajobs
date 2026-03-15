"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/ensureProfile";

type ProfileForm = {
  full_name: string;
  university: string;
  course: string;
  graduation_year: string;
  visa_status: string;
  bio: string;
  preferred_industry: string;
  preferred_location: string;
  degree_field: string;
  career_level: string;
};

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    university: "",
    course: "",
    graduation_year: "",
    visa_status: "",
    bio: "",
    preferred_industry: "",
    preferred_location: "",
    degree_field: "",
    career_level: "",
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
        .select(`
          role,
          full_name,
          university,
          course,
          graduation_year,
          visa_status,
          bio,
          preferred_industry,
          preferred_location,
          degree_field,
          career_level
        `)
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (!profile || profile.role !== "student") {
        setMessage("This page is for students only.");
        setLoading(false);
        return;
      }

      setForm({
        full_name: profile.full_name ?? "",
        university: profile.university ?? "",
        course: profile.course ?? "",
        graduation_year: profile.graduation_year
          ? String(profile.graduation_year)
          : "",
        visa_status: profile.visa_status ?? "",
        bio: profile.bio ?? "",
        preferred_industry: profile.preferred_industry ?? "",
        preferred_location: profile.preferred_location ?? "",
        degree_field: profile.degree_field ?? "",
        career_level: profile.career_level ?? "",
      });
    } catch (err: any) {
      console.error("Load profile error:", err);
      setMessage(err?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(name: keyof ProfileForm, value: string) {
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

      const graduationYearValue =
        form.graduation_year.trim() === ""
          ? null
          : Number(form.graduation_year.trim());

      if (graduationYearValue !== null && Number.isNaN(graduationYearValue)) {
        setMessage("Graduation year must be a valid number.");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name.trim() || null,
          university: form.university.trim() || null,
          course: form.course.trim() || null,
          graduation_year: graduationYearValue,
          visa_status: form.visa_status.trim() || null,
          bio: form.bio.trim() || null,
          preferred_industry: form.preferred_industry.trim() || null,
          preferred_location: form.preferred_location.trim() || null,
          degree_field: form.degree_field.trim() || null,
          career_level: form.career_level.trim() || null,
        })
        .eq("id", user.id);

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Profile updated successfully.");
    } catch (err: any) {
      console.error("Save profile error:", err);
      setMessage(err?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="mt-2 text-black/70">
            Update your student profile so we can show better sponsor and job matches.
          </p>
        </div>

        <Link
          href="/student/dashboard"
          className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Full name</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Visa status</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.visa_status}
              onChange={(e) => updateField("visa_status", e.target.value)}
              placeholder="e.g. Student Visa, Graduate Visa"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">University</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.university}
              onChange={(e) => updateField("university", e.target.value)}
              placeholder="Your university"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Course</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.course}
              onChange={(e) => updateField("course", e.target.value)}
              placeholder="Your course"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Graduation year</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.graduation_year}
              onChange={(e) => updateField("graduation_year", e.target.value)}
              placeholder="e.g. 2026"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Degree field</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.degree_field}
              onChange={(e) => updateField("degree_field", e.target.value)}
              placeholder="e.g. Computer Science"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Preferred industry</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.preferred_industry}
              onChange={(e) => updateField("preferred_industry", e.target.value)}
              placeholder="e.g. Technology"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Preferred location</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.preferred_location}
              onChange={(e) => updateField("preferred_location", e.target.value)}
              placeholder="e.g. London"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Career level</label>
            <input
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              value={form.career_level}
              onChange={(e) => updateField("career_level", e.target.value)}
              placeholder="e.g. Graduate, Entry Level"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="text-sm font-semibold">Bio</label>
          <textarea
            className="mt-2 min-h-[140px] w-full rounded-xl border bg-gray-50 px-4 py-3"
            value={form.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            placeholder="Tell employers a little about yourself"
          />
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
            href="/student/dashboard"
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
