"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type Sponsor = {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  sponsorship_status: string | null;
  website: string | null;
  notes: string | null;
  sponsor_tier: string | null;
  priority_score: number | null;
  uk_region: string | null;
  target_student_friendly: boolean | null;
  open_jobs_count: number | null;
  intelligence_notes: string | null;
};

type SponsorCardProps = {
  sponsor: Sponsor;
  rank?: number;
  showScore?: boolean;
  showJobs?: boolean;
};

function SponsorCard({
  sponsor,
  rank,
  showScore = true,
  showJobs = true,
}: SponsorCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          {typeof rank === "number" && (
            <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
              Rank #{rank}
            </p>
          )}

          <h3 className="mt-1 text-xl font-bold">{sponsor.name}</h3>

          <p className="mt-2 text-sm text-black/70">
            {sponsor.industry || "Industry not set"} •{" "}
            {sponsor.location || "Location not set"}
          </p>

          <p className="mt-1 text-sm text-black/60">
            Sponsorship: {sponsor.sponsorship_status || "Unknown"}
          </p>

          {showScore && (
            <p className="mt-1 text-sm text-black/60">
              Tier: {sponsor.sponsor_tier || "Unknown"} • Score:{" "}
              {sponsor.priority_score ?? 0}
            </p>
          )}

          {showJobs && (
            <p className="mt-1 text-sm text-black/60">
              Open jobs: {sponsor.open_jobs_count ?? 0}
            </p>
          )}

          {sponsor.target_student_friendly && (
            <span className="mt-3 inline-block rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
              Student Friendly
            </span>
          )}

          {sponsor.intelligence_notes && (
            <p className="mt-3 text-sm text-black/80">
              {sponsor.intelligence_notes}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/sponsors/${sponsor.id}`}
          className="text-sm font-semibold hover:text-black/70"
        >
          View sponsor →
        </Link>

        {sponsor.website && (
          <a
            href={sponsor.website}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold hover:text-black/70"
          >
            Visit website →
          </a>
        )}
      </div>
    </div>
  );
}

export default function TopSponsorsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    loadSponsors();
  }, []);

  async function loadSponsors() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("sponsors")
      .select(`
        id,
        name,
        industry,
        location,
        sponsorship_status,
        website,
        notes,
        sponsor_tier,
        priority_score,
        uk_region,
        target_student_friendly,
        open_jobs_count,
        intelligence_notes
      `)
      .order("priority_score", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSponsors((data || []) as Sponsor[]);
    setLoading(false);
  }

  const highPotentialSponsors = useMemo(() => {
    return sponsors
      .filter((s) => s.sponsor_tier === "High Potential")
      .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0))
      .slice(0, 12);
  }, [sponsors]);

  const studentFriendlySponsors = useMemo(() => {
    return sponsors
      .filter((s) => s.target_student_friendly === true)
      .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0))
      .slice(0, 12);
  }, [sponsors]);

  const sponsorsWithOpenJobs = useMemo(() => {
    return sponsors
      .filter((s) => (s.open_jobs_count ?? 0) > 0)
      .sort((a, b) => (b.open_jobs_count ?? 0) - (a.open_jobs_count ?? 0))
      .slice(0, 12);
  }, [sponsors]);

  const topTechSponsors = useMemo(() => {
    return sponsors
      .filter((s) =>
        (s.industry || "").toLowerCase().includes("tech") ||
        (s.industry || "").toLowerCase().includes("technology")
      )
      .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0))
      .slice(0, 12);
  }, [sponsors]);

  const topLondonSponsors = useMemo(() => {
    return sponsors
      .filter((s) => (s.location || "").toLowerCase().includes("london"))
      .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0))
      .slice(0, 12);
  }, [sponsors]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p>Loading sponsor rankings...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold">Top Visa Sponsors in the UK</h1>
        <p className="mt-3 text-black/70">
          Discover high-potential sponsor companies, student-friendly employers,
          and companies with live job opportunities.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border bg-white p-5 text-sm text-red-600">
          {error}
        </div>
      )}

      {!error && (
        <>
          <section className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">High Potential Sponsors</h2>
                <p className="mt-1 text-sm text-black/70">
                  Ranked by sponsorship intelligence score.
                </p>
              </div>

              <Link
                href="/sponsors"
                className="text-sm font-semibold hover:text-black/70"
              >
                Browse all sponsors →
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {highPotentialSponsors.length > 0 ? (
                highPotentialSponsors.map((sponsor, index) => (
                  <SponsorCard
                    key={sponsor.id}
                    sponsor={sponsor}
                    rank={index + 1}
                  />
                ))
              ) : (
                <div className="rounded-2xl border bg-white p-6">
                  No high-potential sponsors found yet.
                </div>
              )}
            </div>
          </section>

          <section className="mt-12">
            <div>
              <h2 className="text-2xl font-bold">Student-Friendly Sponsors</h2>
              <p className="mt-1 text-sm text-black/70">
                Companies marked as especially relevant for international
                students.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {studentFriendlySponsors.length > 0 ? (
                studentFriendlySponsors.map((sponsor, index) => (
                  <SponsorCard
                    key={sponsor.id}
                    sponsor={sponsor}
                    rank={index + 1}
                  />
                ))
              ) : (
                <div className="rounded-2xl border bg-white p-6">
                  No student-friendly sponsors found yet.
                </div>
              )}
            </div>
          </section>

          <section className="mt-12">
            <div>
              <h2 className="text-2xl font-bold">Sponsors With Open Jobs</h2>
              <p className="mt-1 text-sm text-black/70">
                Sponsors currently linked to live roles on the platform.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {sponsorsWithOpenJobs.length > 0 ? (
                sponsorsWithOpenJobs.map((sponsor, index) => (
                  <SponsorCard
                    key={sponsor.id}
                    sponsor={sponsor}
                    rank={index + 1}
                    showScore={true}
                    showJobs={true}
                  />
                ))
              ) : (
                <div className="rounded-2xl border bg-white p-6">
                  No sponsors with open jobs yet.
                </div>
              )}
            </div>
          </section>

          <section className="mt-12">
            <div>
              <h2 className="text-2xl font-bold">Top Tech Sponsors</h2>
              <p className="mt-1 text-sm text-black/70">
                Sponsors in technology-related industries.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {topTechSponsors.length > 0 ? (
                topTechSponsors.map((sponsor, index) => (
                  <SponsorCard
                    key={sponsor.id}
                    sponsor={sponsor}
                    rank={index + 1}
                  />
                ))
              ) : (
                <div className="rounded-2xl border bg-white p-6">
                  No tech sponsors found yet.
                </div>
              )}
            </div>
          </section>

          <section className="mt-12">
            <div>
              <h2 className="text-2xl font-bold">Top London Sponsors</h2>
              <p className="mt-1 text-sm text-black/70">
                Companies in London that appear strongest for sponsorship.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {topLondonSponsors.length > 0 ? (
                topLondonSponsors.map((sponsor, index) => (
                  <SponsorCard
                    key={sponsor.id}
                    sponsor={sponsor}
                    rank={index + 1}
                  />
                ))
              ) : (
                <div className="rounded-2xl border bg-white p-6">
                  No London sponsors found yet.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}