"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/ensureProfile";

type UserRole = "student" | "employer";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    setMsg("");

    if (!email || !password) {
      setMsg("Please enter an email and password.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: "",
          },
        },
      });

      if (error) {
        setMsg(error.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setMsg("Account created. Check your email to confirm your account.");
        setLoading(false);
        return;
      }

      await ensureProfile(role);

      setMsg("Account created ✅ Check your email to confirm your account.");
    } catch (err: any) {
      console.error("Sign up error:", err);
      setMsg(err?.message || "Something went wrong creating the account.");
    } finally {
      setLoading(false);
    }
  }

  async function signIn() {
    setLoading(true);
    setMsg("");

    if (!email || !password) {
      setMsg("Please enter an email and password.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMsg(error.message);
        setLoading(false);
        return;
      }

      const user = data.user;

      if (!user) {
        setMsg("Sign in failed.");
        setLoading(false);
        return;
      }

      await ensureProfile();

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setMsg(profileError.message);
        setLoading(false);
        return;
      }

      if (!profile) {
        setMsg("Signed in, but your profile could not be found.");
        setLoading(false);
        return;
      }

      if (profile.role === "employer") {
        window.location.href = "/employers";
        return;
      }

      window.location.href = "/student/dashboard";
    } catch (err: any) {
      console.error("Sign in error:", err);
      setMsg(err?.message || "Something went wrong signing in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-black/70">
        Students and employers use the same account system.
      </p>

      <div className="mt-6 space-y-3 rounded-2xl border bg-white p-5 shadow-sm">
        <label className="text-sm font-semibold">I am signing up as:</label>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setRole("student")}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              role === "student"
                ? "bg-blue-900 text-white"
                : "bg-white hover:bg-gray-50"
            }`}
            type="button"
          >
            Student
          </button>

          <button
            onClick={() => setRole("employer")}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              role === "employer"
                ? "bg-blue-900 text-white"
                : "bg-white hover:bg-gray-50"
            }`}
            type="button"
          >
            Employer
          </button>
        </div>

        <input
          className="w-full rounded-xl border bg-gray-50 px-4 py-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full rounded-xl border bg-gray-50 px-4 py-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={signIn}
            disabled={loading}
            className="rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
            type="button"
          >
            {loading ? "Please wait..." : "Sign in"}
          </button>

          <button
            onClick={signUp}
            disabled={loading}
            className="rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            type="button"
          >
            {loading ? "Please wait..." : "Create account"}
          </button>
        </div>

        <div className="pt-1">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-semibold text-blue-900 hover:text-blue-700"
          >
            Forgot password?
          </Link>
        </div>

        {msg && <p className="text-sm text-black/70">{msg}</p>}
      </div>
    </main>
  );
}