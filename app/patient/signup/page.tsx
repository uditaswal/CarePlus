import Link from "next/link";

import { PatientSignupForm } from "@/components/forms/PatientSignupForm";

const PatientSignupPage = () => {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfeff,_#f8fafc_45%,_#e2e8f0_100%)] px-4 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            CarePlus Portal
          </p>
          <h1 className="text-5xl font-semibold leading-tight text-slate-900">
            Stay connected to your care in one place.
          </h1>
          <p className="text-lg text-slate-600">
            Create your account to book appointments, review visit summaries,
            check test results, and keep your health information close at hand.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            <span className="rounded-full bg-white px-4 py-2 shadow">
              Appointment timeline
            </span>
            <span className="rounded-full bg-white px-4 py-2 shadow">
              Lab and blood work
            </span>
            <span className="rounded-full bg-white px-4 py-2 shadow">
              Full medical history
            </span>
          </div>
          <Link href="/patient/login" className="inline-block text-sm font-medium text-sky-700 underline">
            Already registered? Sign in
          </Link>
        </section>

        <PatientSignupForm />
      </div>
    </main>
  );
};

export default PatientSignupPage;
