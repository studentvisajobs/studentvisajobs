"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  role: "student" | "employer";
};

export default function Navbar() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadUser() {
    try {
      setLoading(true);

      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user;

      setUser(currentUser ?? null);

      if (currentUser) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (error) {
          console.error("Navbar profile load error:", error);
          setRole(null);
        } else {
          setRole((profile as Profile | null)?.role ?? null);
        }
      } else {
        setRole(null);
      }
    } catch (err) {
      console.error("Navbar loadUser error:", err);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-black/50">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {!user && (
        <>
          <Link
            href="/auth"
            className="hidden text-sm font-medium hover:text-blue-900 sm:inline"
          >
            Sign in
          </Link>

          <Link
            href="/auth"
            className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Employer
          </Link>
        </>
      )}

      {user && role === "student" && (
        <>
          <Link
            href="/student/dashboard"
            className="text-sm font-medium hover:text-blue-900"
          >
            Dashboard
          </Link>

          <Link
            href="/student/alerts"
            className="text-sm font-medium hover:text-blue-900"
          >
            Alerts
          </Link>

          <button
            onClick={signOut}
            className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Sign out
          </button>
        </>
      )}

      {user && role === "employer" && (
        <>
          <Link
            href="/employers"
            className="text-sm font-medium hover:text-blue-900"
          >
            Employer Dashboard
          </Link>

          <button
            onClick={signOut}
            className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Sign out
          </button>
        </>
      )}

      {user && !role && (
        <>
          <Link
            href="/auth"
            className="text-sm font-medium hover:text-blue-900"
          >
            Complete account
          </Link>

          <button
            onClick={signOut}
            className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Sign out
          </button>
        </>
      )}
    </div>
  );
}