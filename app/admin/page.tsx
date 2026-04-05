import Image from "next/image";
import Link from "next/link";

import { AppointmentTrendChart } from "@/components/admin/AppointmentTrendChart";
import { DoctorLoadList } from "@/components/admin/DoctorLoadList";
import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { getRecentLoginActivity, requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const AdminPage = async () => {
  const session = await requireSession({
    roles: ["admin", "doctor"],
    redirectTo: "/login",
  });
  const appointments = await getRecentAppointmentList();
  const recentActivity = getRecentLoginActivity().slice(0, 5);

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/assets/icons/favicon.ico"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-fit"
          />
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-16-semibold">
              {session.role === "doctor" ? "Doctor Dashboard" : "Admin Dashboard"}
            </p>
            <p className="text-14-regular text-dark-700">{session.email}</p>
          </div>

          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-md border border-dark-500 px-4 py-2 text-sm text-white"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header">Operations dashboard</h1>
          <p className="text-dark-700">
            Keep track of bookings, doctor workload, reschedule requests, and
            recent security activity.
          </p>
        </section>

        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={appointments.scheduledCount}
            label="Scheduled appointments"
            icon={"/assets/icons/appointments.svg"}
          />
          <StatCard
            type="pending"
            count={appointments.pendingCount}
            label="Pending appointments"
            icon={"/assets/icons/pending.svg"}
          />
          <StatCard
            type="cancelled"
            count={appointments.cancelledCount}
            label="Cancelled appointments"
            icon={"/assets/icons/cancelled.svg"}
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-dark-500 bg-dark-300 p-6">
            <p className="text-sm text-dark-700">Projected revenue</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              ${appointments.estimatedRevenue.toLocaleString()}
            </h2>
            <p className="mt-2 text-sm text-dark-700">
              Estimated from scheduled appointments only.
            </p>
          </div>

          <div className="rounded-2xl border border-dark-500 bg-dark-300 p-6">
            <p className="text-sm text-dark-700">Reschedule queue</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              {appointments.rescheduleRequestCount}
            </h2>
            <p className="mt-2 text-sm text-dark-700">
              Requests currently waiting for review.
            </p>
          </div>

          <div className="rounded-2xl border border-dark-500 bg-dark-300 p-6">
            <p className="text-sm text-dark-700">Total appointments</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              {appointments.totalCount}
            </h2>
            <p className="mt-2 text-sm text-dark-700">
              Records currently visible to staff.
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          <AppointmentTrendChart data={appointments.dailyBookings} />
          <DoctorLoadList doctors={appointments.topDoctors} />
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="sub-header text-white">Appointments</h2>
            <p className="text-dark-700">
              Review bookings, act on requests, and export the latest list.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/api/admin/appointments/export"
              className="rounded-full border border-dark-500 px-5 py-3 text-sm font-medium text-white"
            >
              Export CSV
            </Link>
            <Link
              href="/admin/medical-records"
              className="rounded-full bg-green-500 px-5 py-3 text-sm font-medium text-white"
            >
              Add medical record
            </Link>
          </div>
        </section>

        <DataTable columns={columns} data={appointments.documents} />

        <section className="space-y-4">
          <div>
            <h2 className="sub-header text-white">Security Activity</h2>
            <p className="text-dark-700">
              Recent login attempts and account lock events.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-dark-500">
            <table className="w-full text-left text-sm">
              <thead className="bg-dark-200 text-white">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <tr key={activity.id} className="border-t border-dark-500">
                      <td className="px-4 py-3 text-dark-700">
                        {new Date(activity.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 capitalize text-white">
                        {activity.role}
                      </td>
                      <td className="px-4 py-3 text-dark-700">
                        {activity.identifier}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            activity.success ? "text-green-500" : "text-red-500"
                          }
                        >
                          {activity.success ? "Success" : "Blocked"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-dark-700">
                        {activity.reason}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-dark-700" colSpan={5}>
                      No login activity yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
