"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Props = {
  sponsorId: string;
};

export default function SponsorAlertButton({ sponsorId }: Props) {
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkSubscription();
  }, [sponsorId]);

  async function checkSubscription() {
    setLoading(true);
    setError("");

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("job_alert_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("sponsor_id", sponsorId)
      .maybeSingle();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSubscribed(Boolean(data));
    setLoading(false);
  }

  async function toggleSubscription() {
    setError("");

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    if (subscribed) {
      const { error } = await supabase
        .from("job_alert_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("sponsor_id", sponsorId);

      if (error) {
        setError(error.message);
        return;
      }

      setSubscribed(false);
      return;
    }

    const { error } = await supabase.from("job_alert_subscriptions").insert({
      user_id: user.id,
      sponsor_id: sponsorId,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setSubscribed(true);
  }

  if (loading) {
    return (
      <button className="rounded-xl border px-4 py-2 text-sm font-semibold opacity-50">
        Loading...
      </button>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={toggleSubscription}
        className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
      >
        {subscribed ? "Unsubscribe from alerts" : "Subscribe to sponsor alerts"}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}