"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const ResetPasswordForm = ({
  userId,
  secret,
}: {
  userId: string;
  secret: string;
}) => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/patient-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, secret, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to reset password");
      }

      router.push(payload.redirectTo || "/patient/login?reason=password-reset");
      router.refresh();
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to reset password",
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
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">
          Secure Reset
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Choose a new password
        </h1>
        <p className="text-sm text-slate-600">
          Enter a new password for your CarePlus account.
        </p>
      </div>

      <input
        type="password"
        placeholder="New password"
        className="w-full rounded-xl border border-slate-200 px-4 py-3"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Confirm new password"
        className="w-full rounded-xl border border-slate-200 px-4 py-3"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        required
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-violet-600 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-violet-300"
      >
        {isSubmitting ? "Updating..." : "Update password"}
      </button>

      <p className="text-sm text-slate-600">
        Back to{" "}
        <Link href="/patient/login" className="font-medium text-violet-700">
          patient login
        </Link>
      </p>
    </form>
  );
};
