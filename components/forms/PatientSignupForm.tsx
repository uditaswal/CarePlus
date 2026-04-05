"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const COUNTRY_CODES = [
  { code: "+1", country: "United States" },
  { code: "+1", country: "Canada" },
  { code: "+44", country: "United Kingdom" },
  { code: "+91", country: "India" },
  { code: "+61", country: "Australia" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+55", country: "Brazil" },
  { code: "+27", country: "South Africa" },
  { code: "+7", country: "Russia" },
];

export const PatientSignupForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/patient-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phone: `${formData.countryCode}${formData.phone}`,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (payload.redirectTo) {
          router.push(payload.redirectTo);
          router.refresh();
          return;
        }
        throw new Error(payload.error || "Unable to create account");
      }

      router.push(payload.redirectTo || "/portal");
      router.refresh();
    } catch (signupError) {
      setError(
        signupError instanceof Error
          ? signupError.message
          : "Unable to create account"
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
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          Patient Portal
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Create your account
        </h1>
        <p className="text-sm text-slate-600">
          Sign up to manage appointments, review doctor notes, and keep your
          medical records in one place.
        </p>
      </div>

      <input
        type="text"
        placeholder="Full name"
        className="w-full rounded-xl border border-slate-200 px-4 py-3"
        value={formData.name}
        onChange={(event) =>
          setFormData((current) => ({ ...current, name: event.target.value }))
        }
        required
      />

      <input
        type="email"
        placeholder="Email address"
        className="w-full rounded-xl border border-slate-200 px-4 py-3"
        value={formData.email}
        onChange={(event) =>
          setFormData((current) => ({ ...current, email: event.target.value }))
        }
        required
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Country Code
        </label>
        <select
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          value={formData.countryCode}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              countryCode: event.target.value,
            }))
          }
          required
        >
          {COUNTRY_CODES.map((item) => (
            <option key={`${item.code}-${item.country}`} value={item.code}>
              {item.country} ({item.code})
            </option>
          ))}
        </select>
      </div>

      <input
        type="tel"
        placeholder="9999999999"
        className="w-full rounded-xl border border-slate-200 px-4 py-3"
        value={formData.phone}
        onChange={(event) =>
          setFormData((current) => ({ ...current, phone: event.target.value }))
        }
        required
      />

      <input
        type="password"
        placeholder="Create a password"
        className="w-full rounded-xl border border-slate-200 px-4 py-3"
        value={formData.password}
        onChange={(event) =>
          setFormData((current) => ({
            ...current,
            password: event.target.value,
          }))
        }
        required
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/patient/login" className="font-medium text-emerald-700">
          Sign in
        </Link>
      </p>
    </form>
  );
};
