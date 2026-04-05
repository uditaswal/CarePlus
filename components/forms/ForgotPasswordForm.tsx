"use client";

import Link from "next/link";
import { useState } from "react";

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/patient-forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to send reset email");
      }

      setMessage(payload.message || "Password reset instructions have been sent.");
    } catch (forgotError) {
      setError(
        forgotError instanceof Error
          ? forgotError.message
          : "Unable to send reset email",
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
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">
          Password Help
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Reset your password
        </h1>
        <p className="text-sm text-slate-600">
          Enter the email linked to your account and we&apos;ll send you a
          password reset link.
        </p>
      </div>

      <input
        type="email"
        placeholder="Email address"
        className="w-full rounded-xl border border-slate-200 px-4 py-3"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-amber-500 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-amber-300"
      >
        {isSubmitting ? "Sending..." : "Send reset link"}
      </button>

      <p className="text-sm text-slate-600">
        Remembered it?{" "}
        <Link href="/patient/login" className="font-medium text-amber-700">
          Back to sign in
        </Link>
      </p>
    </form>
  );
};
