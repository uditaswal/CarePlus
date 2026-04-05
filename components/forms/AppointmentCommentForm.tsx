"use client";

import { useState } from "react";

import { addAppointmentComment } from "@/lib/actions/appointment.actions";

export const AppointmentCommentForm = ({
  appointmentId,
  userId,
  buttonLabel = "Add update",
}: {
  appointmentId: string;
  userId: string;
  buttonLabel?: string;
}) => {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await addAppointmentComment({
        appointmentId,
        userId,
        comment,
      });
      setComment("");
    } catch (commentError) {
      setError(
        commentError instanceof Error
          ? commentError.message
          : "Unable to add update",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        className="min-h-24 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
        placeholder="Share an update for this appointment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        required
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : buttonLabel}
      </button>
    </form>
  );
};
