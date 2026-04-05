"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "doctor">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role, email, password }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to sign in");
        }

        router.push(data.redirectTo || "/admin");
        router.refresh();
      })
      .catch((fetchError: Error) => {
        setError(fetchError.message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f3f4f6,_#ffffff_45%,_#e5e7eb_100%)] px-4 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">
            Staff Access
          </p>
          <h1 className="text-5xl font-semibold leading-tight text-slate-900">
            Manage appointments and patient care.
          </h1>
          <p className="text-lg text-slate-600">
            Review scheduled appointments, approve reschedule requests, manage
            patient records, and coordinate clinical updates with your team.
          </p>
          <Link
            href="/patient/login"
            className="inline-block text-sm font-medium text-blue-700 underline"
          >
            Patient portal
          </Link>
        </section>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl"
        >
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
              STAFF LOGIN
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Welcome back
            </h2>
            <p className="text-sm text-slate-600">
              Sign in to access your staff dashboard and manage appointments.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Account Type
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as "admin" | "doctor");
                setError("");
              }}
            >
              <option value="admin">Administrator</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <input
            type="email"
            placeholder={
              role === "admin" ? "admin@careplus.com" : "doctor@careplus.local"
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-blue-300 hover:bg-blue-700"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <Link
            href="/"
            className="block text-center text-sm text-blue-600 hover:underline"
          >
            Back to HomePage
          </Link>
        </form>
      </div>
    </main>
  );
}
