// app/patient/layout.tsx
import React from "react";
import Link from "next/link";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-100 p-4">
        <nav className="flex flex-col space-y-2">
          <Link href="/patient">Dashboard</Link>
          <Link href="/patient/appointments">Appointments</Link>
          {/* <Link href="/patient/book">Book Appointment</Link> */}
          {/* <Link href="/patient/profile">Profile</Link> */}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
