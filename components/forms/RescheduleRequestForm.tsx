"use client";

import { useState } from "react";

import { requestAppointmentReschedule } from "@/lib/actions/appointment.actions";

export const RescheduleRequestForm = ({
  appointmentId,
  userId,
}: {
  appointmentId: string;
  userId: string;
}) => {
  const [requestedSchedule, setRequestedSchedule] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      await requestAppointmentReschedule({
        appointmentId,
        userId,
        requestedSchedule: new Date(requestedSchedule),
        rescheduleReason: reason,
      });
      setMessage("Your reschedule request has been sent for review.");
      setRequestedSchedule("");
      setReason("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to send request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-white/10 bg-slate-950 p-4">
      <p className="text-sm font-medium text-white">Request a new time</p>
      <input
        type="datetime-local"
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
        value={requestedSchedule}
        onChange={(event) => setRequestedSchedule(event.target.value)}
        required
      />
      <textarea
        className="min-h-24 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
        placeholder="Tell us why you need a new time"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        required
      />
      {message && <p className="text-sm text-green-400">{message}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Request reschedule"}
      </button>
    </form>
  );
};
