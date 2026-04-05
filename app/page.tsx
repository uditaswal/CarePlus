"use client";

import Image from "next/image";
import Link from "next/link";

const Home = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc,_#dcfce7_35%,_#dbeafe)] text-gray-900 transition-colors duration-300">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <section className="max-w-xl space-y-8">
          <div className="flex items-center justify-between">
            <Image
              src="/assets/icons/favicon.ico"
              height={40}
              width={40}
              alt="CarePlus Logo"
              className="size-10"
            />
            <Link
              href="/login"
              className="text-sm font-medium text-green-700 hover:underline"
            >
              Staff Sign In
            </Link>
          </div>

          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
              CarePlus
            </p>
            <h1 className="text-5xl font-semibold leading-tight text-slate-900">
              Care that stays easy to follow, before and after every visit.
            </h1>
            <p className="text-lg text-slate-700">
              Use your CarePlus account to book appointments, check schedules,
              read care notes from your doctor, and keep important health
              details together in one secure place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/patient/signup"
              className="rounded-full bg-green-600 px-6 py-3 font-medium text-white"
            >
              Create patient account
            </Link>
            <Link
              href="/patient/login"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 font-medium text-slate-900"
            >
              Patient login
            </Link>
            <Link
              href="/portal"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 font-medium text-slate-900"
            >
              Open portal
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-4 shadow">
              <p className="text-sm text-slate-500">Appointments</p>
              <p className="mt-2 text-lg font-semibold">Schedule and status</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow">
              <p className="text-sm text-slate-500">Reports</p>
              <p className="mt-2 text-lg font-semibold">
                Doctor notes and lab work
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow">
              <p className="text-sm text-slate-500">History</p>
              <p className="mt-2 text-lg font-semibold">
                Long-term medical record
              </p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-xl rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Built around everyday care
          </p>
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold">Track every appointment</h2>
              <p className="mt-2 text-sm text-slate-300">
                See your doctor, date, time, status, and visit notes in one
                clear timeline.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold">Review care updates</h2>
              <p className="mt-2 text-sm text-slate-300">
                Find follow-up instructions, blood work results, and medication
                guidance after your appointments.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold">Keep history ready</h2>
              <p className="mt-2 text-sm text-slate-300">
                Your allergies, medication list, and medical history are there
                whenever you need them.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
