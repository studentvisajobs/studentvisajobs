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
  const [menuOpen, setMenuOpen] = useState(false);

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

  function closeMenu() {
    setMenuOpen(false);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-black/50 sm:text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50 md:hidden"
        aria-label="Toggle menu"
      >
        ☰
      </button>

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
            className="rounded-2xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Sign up
          </Link>
        </>
      )}

      {user && role === "student" && (
        <>
          <Link
            href="/student/dashboard"
            className="text-sm font-medium hover:text-blue-900"
          >
            <span className="sm:hidden">Dashboard</span>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <Link
            href="/student/alerts"
            className="hidden text-sm font-medium hover:text-blue-900 sm:inline"
          >
            Alerts
          </Link>

          <button
            onClick={signOut}
            className="rounded-2xl border px-3 py-1.5 text-sm hover:bg-gray-50 sm:px-4 sm:py-2"
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
            <span className="sm:hidden">Dashboard</span>
            <span className="hidden sm:inline">Employer Dashboard</span>
          </Link>

          <button
            onClick={signOut}
            className="rounded-2xl border px-3 py-1.5 text-sm hover:bg-gray-50 sm:px-4 sm:py-2"
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
            className="rounded-2xl border px-3 py-1.5 text-sm hover:bg-gray-50 sm:px-4 sm:py-2"
          >
            Sign out
          </button>
        </>
      )}

      {menuOpen && (
        <div className="absolute right-0 top-14 z-50 w-64 rounded-2xl border bg-white p-3 shadow-xl md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/jobs"
              onClick={closeMenu}
              className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Jobs
            </Link>

            <Link
              href="/jobs/part-time"
              onClick={closeMenu}
              className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Part-time Jobs
            </Link>

            <Link
              href="/sponsors"
              onClick={closeMenu}
              className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Sponsors
            </Link>

            <Link
              href="/sponsors/top"
              onClick={closeMenu}
              className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Top Sponsors
            </Link>

            <Link
              href="/visa-hub"
              onClick={closeMenu}
              className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Visa Hub
            </Link>

            <Link
              href="/tools"
              onClick={closeMenu}
              className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Career Tools
            </Link>

            <div className="my-2 border-t" />

            {!user && (
              <Link
                href="/auth"
                onClick={closeMenu}
                className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Sign in
              </Link>
            )}

            {user && role === "student" && (
              <Link
                href="/student/alerts"
                onClick={closeMenu}
                className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Alerts
              </Link>
            )}

            {user && role === "employer" && (
              <Link
                href="/employers"
                onClick={closeMenu}
                className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Employer Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}