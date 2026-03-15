"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type SubscriptionRow = {
  sponsor_id: string;
};

type Sponsor = {
  id: string;
  name: string;
  location: string | null;
  industry: string | null;
  open_jobs_count: number | null;
};

export default function StudentAlertsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    setLoading(true);
    setError("");

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const { data: subscriptions, error: subError } = await supabase
      .from("job_alert_subscriptions")
      .select("sponsor_id")
      .eq("user_id", user.id);

    if (subError) {
      setError(subError.message);
      setLoading(false);
      return;
    }

    const sponsorIds = (subscriptions || []).map(
      (row: SubscriptionRow) => row.sponsor_id
    );

    if (sponsorIds.length === 0) {
      setSponsors([]);
      setLoading(false);
      return;
    }

    const { data: sponsorRows, error: sponsorError } = await supabase
      .from("sponsors")
      .select("id, name, location, industry, open_jobs_count")
      .in("id", sponsorIds)
      .order("open_jobs_count", { ascending: false });

    if (sponsorError) {
      setError(sponsorError.message);
      setLoading(false);
      return;
    }

    setSponsors((sponsorRows || []) as Sponsor[]);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p>Loading alerts...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold">My Job Alerts</h1>
      <p className="mt-2 text-black/70">
        Track sponsors you subscribed to and see where new jobs may appear.
      </p>

      {error && (
        <div className="mt-6 rounded-2xl border bg-white p-5 text-sm text-red-600">
          {error}
        </div>
      )}

      {!error && sponsors.length === 0 && (
        <div className="mt-6 rounded-2xl border bg-white p-6">
          You haven’t subscribed to any sponsor alerts yet.
        </div>
      )}

      {!error && sponsors.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold">{sponsor.name}</h2>
              <p className="mt-2 text-black/70">
                {sponsor.industry || "Industry not set"} •{" "}
                {sponsor.location || "Location not set"}
              </p>
              <p className="mt-2 text-sm text-black/60">
                Open jobs currently linked: {sponsor.open_jobs_count ?? 0}
              </p>

              <div className="mt-4">
                <Link
                  href={`/sponsors/${sponsor.id}`}
                  className="text-sm font-semibold hover:text-black/70"
                >
                  View sponsor →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}