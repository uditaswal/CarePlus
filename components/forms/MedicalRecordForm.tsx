"use client";

import { useState } from "react";

export const MedicalRecordForm = () => {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    userId: "",
    patientId: "",
    appointmentId: "",
    doctorName: "",
    title: "",
    category: "Post Appointment",
    summary: "",
    bloodWork: "",
    medications: "",
    recommendations: "",
    followUpDate: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    try {
      const response = await fetch("/api/medical-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          followUpDate: formData.followUpDate || null,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save medical record");
      }

      setStatus("saved");
      setMessage("Medical record saved.");
      setFormData({
        userId: "",
        patientId: "",
        appointmentId: "",
        doctorName: "",
        title: "",
        category: "Post Appointment",
        summary: "",
        bloodWork: "",
        medications: "",
        recommendations: "",
        followUpDate: "",
      });
    } catch (recordError) {
      setStatus("error");
      setMessage(
        recordError instanceof Error
          ? recordError.message
          : "Unable to save medical record",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-dark-500 bg-dark-200 p-6"
    >
      <div>
        <h2 className="sub-header text-white">Add Medical Record</h2>
        <p className="text-14-regular text-dark-700">
          Save post-appointment notes, blood work, and follow-up guidance for a
          patient.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="rounded-xl border border-dark-500 bg-dark-400 px-4 py-3 text-white"
          placeholder="User ID"
          value={formData.userId}
          onChange={(event) =>
            setFormData((current) => ({ ...current, userId: event.target.value }))
          }
          required
        />
        <input
          className="rounded-xl border border-dark-500 bg-dark-400 px-4 py-3 text-white"
          placeholder="Patient Document ID"
          value={formData.patientId}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              patientId: event.target.value,
            }))
          }
          required
        />
        <input
          className="rounded-xl border border-dark-500 bg-dark-400 px-4 py-3 text-white"
          placeholder="Appointment ID (optional)"
          value={formData.appointmentId}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              appointmentId: event.target.value,
            }))
          }
        />
        <input
          className="rounded-xl border border-dark-500 bg-dark-400 px-4 py-3 text-white"
          placeholder="Doctor name"
          value={formData.doctorName}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              doctorName: event.target.value,
            }))
          }
          required
        />
        <input
          className="rounded-xl border border-dark-500 bg-dark-400 px-4 py-3 text-white"
          placeholder="Record title"
          value={formData.title}
          onChange={(event) =>
            setFormData((current) => ({ ...current, title: event.target.value }))
          }
          required
        />
        <input
          className="rounded-xl border border-dark-500 bg-dark-400 px-4 py-3 text-white"
          placeholder="Category"
          value={formData.category}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              category: event.target.value,
            }))
          }
          required
        />
        <input
          type="date"
          className="rounded-xl border border-dark-500 bg-dark-400 px-4 py-3 text-white"
          value={formData.followUpDate}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              followUpDate: event.target.value,
            }))
          }
        />
      </div>

      <textarea
        className="min-h-28 w-full rounded-xl border border-dark-500 bg-dark-400 px-4 py-3 text-white"
        placeholder="Doctor summary"
        value={formData.summary}
        onChange={(event) =>
          setFormData((current) => ({ ...current, summary: event.target.value }))
        }
        required
      />
      <textarea
        className="min-h-24 w-full rounded-xl border border-dark-500 bg-dark-400 px-4 py-3 text-white"
        placeholder="Blood work / lab values"
        value={formData.bloodWork}
        onChange={(event) =>
          setFormData((current) => ({
            ...current,
            bloodWork: event.target.value,
          }))
        }
      />
      <textarea
        className="min-h-24 w-full rounded-xl border border-dark-500 bg-dark-400 px-4 py-3 text-white"
        placeholder="Medications"
        value={formData.medications}
        onChange={(event) =>
          setFormData((current) => ({
            ...current,
            medications: event.target.value,
          }))
        }
      />
      <textarea
        className="min-h-24 w-full rounded-xl border border-dark-500 bg-dark-400 px-4 py-3 text-white"
        placeholder="Recommendations and follow-up plan"
        value={formData.recommendations}
        onChange={(event) =>
          setFormData((current) => ({
            ...current,
            recommendations: event.target.value,
          }))
        }
      />

      {message && (
        <p className={status === "saved" ? "text-green-500" : "text-red-500"}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-xl bg-green-600 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-green-300"
      >
        {status === "saving" ? "Saving..." : "Save medical record"}
      </button>
    </form>
  );
};
