"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const PatientLoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/patient-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to sign in");
      }

      router.push(payload.redirectTo || "/portal");
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">
          Patient Portal
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-600">
          View your schedule, doctor updates, lab work, and long-term medical
          history.
        </p>
        {searchParams.get("reason") === "account-exists" && (
          <p className="text-sm text-amber-700">
            An account already exists for that email. Please sign in here.
          </p>
        )}
        {searchParams.get("reason") === "password-reset" && (
          <p className="text-sm text-green-700">
            Your password has been updated. You can sign in now.
          </p>
        )}
      </div>

      <input
        type="email"
        placeholder="Email address"
        className="w-full rounded-xl border border-slate-200 px-4 py-3"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full rounded-xl border border-slate-200 px-4 py-3"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-sky-600 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-sky-300"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-sm text-slate-600">
        New here?{" "}
        <Link href="/patient/signup" className="font-medium text-sky-700">
          Create a patient account
        </Link>
      </p>
      <p className="text-sm text-slate-600">
        Forgot your password?{" "}
        <Link
          href="/patient/forgot-password"
          className="font-medium text-sky-700"
        >
          Reset it here
        </Link>
      </p>
    </form>
  );
};
