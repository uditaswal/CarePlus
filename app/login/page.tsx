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
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-md"
      >
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          Secure Sign In
        </h1>
        <p className="mb-4 text-sm text-gray-600">
          Sign in with a role-based account. Sessions are stored in secure
          HTTP-only cookies.
        </p>

        <label className="mb-2 block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          className="mb-3 w-full rounded border p-2"
          value={role}
          onChange={(e) => {
            setRole(e.target.value as "admin" | "doctor");
            setError("");
          }}
        >
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
        </select>

        <input
          type="email"
          placeholder={role === "admin" ? "admin@careplus.com" : "doctor@careplus.local"}
          className="mb-3 w-full rounded border p-2"
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
          className="mb-3 w-full rounded border p-2"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          required
        />

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          disabled={isSubmitting}
          className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>

        <p className="mt-4 text-sm text-gray-600">
          Use your staff account to review appointments, approve schedule
          changes, and manage clinical updates.
        </p>

        <Link href="/" className="mt-3 block text-sm text-blue-600 hover:underline">
          Back to patient portal
        </Link>
      </form>
    </main>
  );
}
