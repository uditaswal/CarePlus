"use client";

import { useState } from "react";

import { AppointmentCardActions } from "@/components/AppointmentCardActions";
import { formatDateTime } from "@/lib/utils";
import { Appointment } from "@/types/appwrite.types";

const AppointmentCard = ({
  appointment,
  userId,
}: {
  appointment: Appointment;
  userId: string;
}) => (
  <div className="rounded-2xl border border-white/10 bg-slate-950 p-5">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-lg font-semibold">Dr. {appointment.primaryPhysician}</p>
        <p className="text-sm text-slate-400">
          {formatDateTime(appointment.schedule).dateTime}
        </p>
      </div>
      <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">
        {appointment.status}
      </span>
    </div>
    <p className="mt-4 text-sm text-slate-300">{appointment.reason}</p>
    <div className="mt-4 grid gap-3 rounded-2xl bg-white/5 p-4 md:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Appointment summary
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Visit with Dr. {appointment.primaryPhysician} on{" "}
          {formatDateTime(appointment.schedule).dateTime}.
        </p>
        <p className="mt-2 text-sm text-slate-400">Status: {appointment.status}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Reschedule request
        </p>
        <p className="mt-2 text-sm text-slate-300">
          {appointment.requestStatus === "pending"
            ? `Pending review for ${
                appointment.requestedSchedule
                  ? formatDateTime(appointment.requestedSchedule).dateTime
                  : "a new time"
              }`
            : appointment.requestStatus === "approved"
              ? "A requested time change has been approved."
              : "No reschedule request is waiting right now."}
        </p>
        {appointment.rescheduleReason && (
          <p className="mt-2 text-sm text-slate-400">
            Reason: {appointment.rescheduleReason}
          </p>
        )}
      </div>
    </div>
    {appointment.note && (
      <p className="mt-2 text-sm text-slate-400">Note: {appointment.note}</p>
    )}
    {appointment.cancellationReason && (
      <p className="mt-2 text-sm text-red-300">
        Cancellation reason: {appointment.cancellationReason}
      </p>
    )}
    <div className="mt-4 space-y-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        Comment history
      </p>
      {appointment.noteHistory && appointment.noteHistory.length > 0 ? (
        <div className="space-y-2">
          {appointment.noteHistory.map((historyItem, index) => (
            <p
              key={`${appointment.$id}-${index}`}
              className="rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300"
            >
              {historyItem}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No updates have been added to this appointment yet.
        </p>
      )}
    </div>
    <div className="mt-4">
      <AppointmentCardActions appointmentId={appointment.$id} userId={userId} />
    </div>
  </div>
);

export const PatientAppointmentsSection = ({
  appointments,
  userId,
}: {
  appointments: Appointment[];
  userId: string;
}) => {
  const [showAll, setShowAll] = useState(false);

  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-sm text-slate-400">
        No appointments yet. Book your first consultation from the button above.
      </div>
    );
  }

  const latestAppointment = appointments[0];
  const remainingAppointments = appointments.slice(1);

  return (
    <div className="space-y-4">
      <AppointmentCard appointment={latestAppointment} userId={userId} />

      {remainingAppointments.length > 0 && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white"
          >
            {showAll ? "Hide older appointments" : "View all appointments"}
          </button>

          {showAll && (
            <div className="space-y-4">
              {remainingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.$id}
                  appointment={appointment}
                  userId={userId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
