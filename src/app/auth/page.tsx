"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "employer">("student");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    setMsg(null);

  // 🔎 Validation
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


    const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    setMsg(error.message);
  } else {
    setMsg("Check your email to confirm your account.");
  }

  setLoading(false);
  }

  async function signIn() {
    setLoading(true);
    setMsg(null);

    if (!email || !password) {
    setMsg("Please enter an email and password.");
    setLoading(false);
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setMsg(error.message);
  } else {
    window.location.href = "/employer";
  }

  setLoading(false);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-black/70">
        Students and employers use the same account system.
      </p>

      <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm space-y-3">
        <label className="text-sm font-semibold">I am a:</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setRole("student")}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              role === "student" ? "bg-black text-white" : "bg-white"
            }`}
            type="button"
          >
            Student
          </button>
          <button
            onClick={() => setRole("employer")}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              role === "employer" ? "bg-black text-white" : "bg-white"
            }`}
            type="button"
          >
            Employer
          </button>
        </div>

        <input
          className="w-full rounded-xl border bg-gray-50 px-4 py-3"
          placeholder="Email"
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
            Sign in
          </button>
          <button
            onClick={signUp}
            disabled={loading}
            className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            type="button"
          >
            Create account
          </button>
        </div>

        {msg && <p className="text-sm text-black/70">{msg}</p>}
      </div>
    </main>
  );
}