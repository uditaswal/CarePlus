"use client";

import Image from "next/image";
import Link from "next/link";

import { PatientForm } from "@/components/forms/PatientForm";
import { PasskeyModal } from "@/components/PasskeyModal";

const Home = ({ searchParams }: SearchParamProps) => {
  const isAdmin = searchParams?.admin === "true";

  return (
    <div className="flex min-h-screen flex-col justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {isAdmin && <PasskeyModal />}

      <main className="w-full max-w-md mx-auto px-4 py-10 space-y-10">
        <div className="flex items-center justify-between">
          <Image
            src="/assets/icons/favicon.ico"
            height={40}
            width={40}
            alt="CarePlus Logo"
            className="h-10 w-10"
          />
          <Link
            href="/?admin=true"
            className="text-sm text-green-600 dark:text-green-400 hover:underline"
          >
            Admin
          </Link>
        </div>

        <PatientForm />

        <footer className="pt-10 border-t border-gray-300 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
          © 2025 CarePlus. All rights reserved.
        </footer>
      </main>

      {/* Uncomment below if you want image section back */}
      {/*
      <section className="hidden xl:block xl:w-1/2 relative">
        <Image
          src="/assets/images/onboarding-img.png"
          alt="Onboarding Illustration"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/50 dark:from-black/40 dark:to-black/60 backdrop-blur-sm" />
      </section>
      */}
    </div>
  );
};

export default Home;
