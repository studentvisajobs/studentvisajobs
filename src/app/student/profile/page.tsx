"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [msg, setMsg] = useState("");

  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [visaStatus, setVisaStatus] = useState("");
  const [bio, setBio] = useState("");
  const [preferredIndustry, setPreferredIndustry] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [degreeField, setDegreeField] = useState("");
  const [careerLevel, setCareerLevel] = useState("");
  const [email, setEmail] = useState("");
  const [cvUrl, setCvUrl] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        window.location.href = "/auth";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          `
          full_name,
          university,
          course,
          graduation_year,
          visa_status,
          bio,
          preferred_industry,
          preferred_location,
          degree_field,
          career_level,
          email,
          cv_url,
          role
        `
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (profile.role !== "student") {
          setMsg("This page is for students only.");
          setLoading(false);
          return;
        }

        setFullName(profile.full_name ?? "");
        setUniversity(profile.university ?? "");
        setCourse(profile.course ?? "");
        setGraduationYear(
          profile.graduation_year ? String(profile.graduation_year) : ""
        );
        setVisaStatus(profile.visa_status ?? "");
        setBio(profile.bio ?? "");
        setPreferredIndustry(profile.preferred_industry ?? "");
        setPreferredLocation(profile.preferred_location ?? "");
        setDegreeField(profile.degree_field ?? "");
        setCareerLevel(profile.career_level ?? "");
        setEmail(profile.email ?? user.email ?? "");
        setCvUrl(profile.cv_url ?? "");
      } else {
        setEmail(user.email ?? "");
      }

      setLoading(false);
    })();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const graduationYearValue = graduationYear.trim()
      ? Number(graduationYear)
      : null;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      role: "student",
      email: email || user.email || null,
      full_name: fullName || null,
      university: university || null,
      course: course || null,
      graduation_year:
        graduationYearValue && !Number.isNaN(graduationYearValue)
          ? graduationYearValue
          : null,
      visa_status: visaStatus || null,
      bio: bio || null,
      preferred_industry: preferredIndustry || null,
      preferred_location: preferredLocation || null,
      degree_field: degreeField || null,
      career_level: careerLevel || null,
      cv_url: cvUrl || null,
    });

    if (error) {
      setMsg(error.message);
      setSaving(false);
      return;
    }

    setMsg("Profile saved ✅");
    setSaving(false);
  }

  async function uploadCV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploadingCv(true);
    setMsg("");

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const safeFileName = file.name.replace(/\s+/g, "_");
    const filePath = `${user.id}/${Date.now()}_${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(filePath, file, {
        upsert: false,
      });

    if (uploadError) {
      setMsg(uploadError.message || "CV upload failed.");
      setUploadingCv(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("cvs")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ cv_url: publicUrl })
      .eq("id", user.id);

    if (profileError) {
      setMsg(profileError.message || "CV uploaded but profile update failed.");
      setUploadingCv(false);
      return;
    }

    setCvUrl(publicUrl);
    setMsg("CV uploaded successfully ✅");
    setUploadingCv(false);
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
      <h1 className="text-3xl font-bold">Student profile</h1>
      <p className="mt-2 text-black/70">
        Build your profile so employers and matching tools can understand your
        background.
      </p>

      {msg && (
        <div className="mt-4 rounded-xl border bg-white p-4 text-sm text-black/75">
          {msg}
        </div>
      )}

      <form
        onSubmit={saveProfile}
        className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">University</label>
            <input
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="University"
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Course</label>
            <input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Course"
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Graduation year</label>
            <input
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="Graduation year"
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Visa status</label>
            <input
              value={visaStatus}
              onChange={(e) => setVisaStatus(e.target.value)}
              placeholder="Visa status"
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Preferred industry</label>
            <input
              value={preferredIndustry}
              onChange={(e) => setPreferredIndustry(e.target.value)}
              placeholder="Preferred industry"
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Preferred location</label>
            <input
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              placeholder="Preferred location"
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Degree field</label>
            <input
              value={degreeField}
              onChange={(e) => setDegreeField(e.target.value)}
              placeholder="Degree field"
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Career level</label>
            <input
              value={careerLevel}
              onChange={(e) => setCareerLevel(e.target.value)}
              placeholder="Career level"
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short bio"
            className="mt-2 min-h-[120px] w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div className="mt-6 rounded-2xl border bg-gray-50 p-5">
          <h2 className="text-lg font-bold">Upload CV</h2>
          <p className="mt-1 text-sm text-black/60">
            Upload your CV to use with AI tools and job applications.
          </p>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={uploadCV}
            className="mt-4 block w-full text-sm"
          />

          {uploadingCv && (
            <p className="mt-3 text-sm text-black/60">Uploading CV...</p>
          )}

          {cvUrl && (
            <div className="mt-4">
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-blue-900 hover:text-blue-700"
              >
                View uploaded CV →
              </a>
            </div>
          )}
        </div>

        <button
          disabled={saving}
          className="mt-6 w-fit rounded-xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </main>
  );
}