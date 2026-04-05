import Link from "next/link";

import { PatientLoginForm } from "@/components/forms/PatientLoginForm";

const PatientLoginPage = () => {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#e2e8f0_100%)] px-4 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Patient Access
          </p>
          <h1 className="text-5xl font-semibold leading-tight text-slate-900">
            Welcome back to your health portal.
          </h1>
          <p className="text-lg text-slate-600">
            Check upcoming appointments, review visit notes, and look back at
            your medical history whenever you need it.
          </p>
          <Link href="/patient/signup" className="inline-block text-sm font-medium text-emerald-700 underline">
            Need an account? Create one here
          </Link>
        </section>

        <PatientLoginForm />
      </div>
    </main>
  );
};

export default PatientLoginPage;
