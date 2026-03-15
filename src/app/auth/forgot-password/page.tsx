"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Password reset email sent. Please check your inbox and spam folder."
    );
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-3xl font-bold">Forgot password</h1>
      <p className="mt-2 text-black/70">
        Enter your email and we’ll send you a password reset link.
      </p>

      <form
        onSubmit={handleResetRequest}
        className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>

          <Link
            href="/auth"
            className="text-sm font-semibold hover:text-black/70"
          >
            ← Back to sign in
          </Link>
        </div>

        {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}