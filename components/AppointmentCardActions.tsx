"use client";

import { useState } from "react";

import { AppointmentCommentForm } from "@/components/forms/AppointmentCommentForm";
import { RescheduleRequestForm } from "@/components/forms/RescheduleRequestForm";

export const AppointmentCardActions = ({
  appointmentId,
  userId,
}: {
  appointmentId: string;
  userId: string;
}) => {
  const [activePanel, setActivePanel] = useState<"none" | "reschedule" | "comment">(
    "none",
  );

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            setActivePanel((current) =>
              current === "reschedule" ? "none" : "reschedule",
            )
          }
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900"
        >
          Edit appointment request
        </button>
        <button
          type="button"
          onClick={() =>
            setActivePanel((current) =>
              current === "comment" ? "none" : "comment",
            )
          }
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white"
        >
          Add comment
        </button>
      </div>

      {activePanel === "reschedule" && (
        <RescheduleRequestForm appointmentId={appointmentId} userId={userId} />
      )}
      {activePanel === "comment" && (
        <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
          <p className="mb-3 text-sm font-medium text-white">
            Add a note for your care team
          </p>
          <AppointmentCommentForm
            appointmentId={appointmentId}
            userId={userId}
            buttonLabel="Save note"
          />
        </div>
      )}
    </div>
  );
};
