"use client";

import { useState } from "react";

import { FileUploader } from "@/components/FileUploader";
import { RecordCategories, TestCatalog } from "@/constants";

type UploadIntent = "general" | "lab" | "prescription" | "test-order";

export const RecordUploadForm = ({
  userId,
  patientId,
  appointmentId = "",
  doctorName = "",
  uploadedByRole,
  uploadedByName,
  buttonLabel,
}: {
  userId: string;
  patientId: string;
  appointmentId?: string;
  doctorName?: string;
  uploadedByRole: "patient" | "doctor" | "admin";
  uploadedByName: string;
  buttonLabel: string;
}) => {
  const [files, setFiles] = useState<File[]>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intent, setIntent] = useState<UploadIntent>("general");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    appointmentId,
    doctorName,
    title: "",
    category: uploadedByRole === "patient" ? "Patient Upload" : "Clinical Note",
    summary: "",
    documentType: "",
    relatedTo: "",
    performedOn: "",
    physicianName: "",
    followUpDate: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const payload = new FormData();
      payload.append("userId", userId);
      payload.append("patientId", patientId);
      payload.append("appointmentId", formData.appointmentId);
      payload.append("doctorName", formData.doctorName);
      payload.append("title", formData.title);
      payload.append("category", formData.category);
      payload.append("summary", formData.summary);
      payload.append("documentType", formData.documentType);
      payload.append("relatedTo", formData.relatedTo);
      payload.append("performedOn", formData.performedOn);
      payload.append("physicianName", formData.physicianName);
      payload.append("followUpDate", formData.followUpDate);
      payload.append("uploadedByRole", uploadedByRole);
      payload.append("uploadedByName", uploadedByName);

      if (files?.[0]) {
        payload.append("file", files[0]);
      }

      const response = await fetch("/api/medical-records", {
        method: "POST",
        body: payload,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to upload document");
      }

      setMessage("Your document has been added.");
      setFiles(undefined);
      setShowForm(false);
      setIntent("general");
      setFormData({
        appointmentId,
        doctorName,
        title: "",
        category:
          uploadedByRole === "patient" ? "Patient Upload" : "Clinical Note",
        summary: "",
        documentType: "",
        relatedTo: "",
        performedOn: "",
        physicianName: "",
        followUpDate: "",
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload document",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const startIntent = (nextIntent: UploadIntent) => {
    const defaults: Record<UploadIntent, Partial<typeof formData>> = {
      general: {
        category: uploadedByRole === "patient" ? "Patient Upload" : "Clinical Note",
        documentType: "",
        title: "",
      },
      lab: {
        category: "Lab Report",
        documentType: "Blood Test",
        title: "Lab report",
      },
      prescription: {
        category: "Prescription",
        documentType: "Prescription",
        title: "Prescription",
      },
      "test-order": {
        category: "Test Order",
        documentType: TestCatalog[0],
        title: "Scheduled test",
      },
    };

    setIntent(nextIntent);
    setShowForm(true);
    setFormData((current) => ({
      ...current,
      ...defaults[nextIntent],
      physicianName: "",
    }));
  };

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6">
      <div>
        <h3 className="text-xl font-semibold text-white">{buttonLabel}</h3>
        <p className="mt-1 text-sm text-slate-400">
          Add clearly labeled documents so each report, test order, note, or
          prescription can be tracked separately.
        </p>
      </div>

      {!showForm && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => startIntent("general")}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900"
          >
            Add note or document
          </button>
          <button
            type="button"
            onClick={() => startIntent("lab")}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white"
          >
            Add lab report
          </button>
          <button
            type="button"
            onClick={() => startIntent("prescription")}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white"
          >
            Add prescription
          </button>
          {uploadedByRole !== "patient" && (
            <button
              type="button"
              onClick={() => startIntent("test-order")}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white"
            >
              Schedule test
            </button>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-400">
            {appointmentId && <p>Appointment: {appointmentId}</p>}
            {doctorName && <p>Doctor: {doctorName}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Title"
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              value={formData.title}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
            />
            <select
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              value={formData.category}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
            >
              {RecordCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              value={formData.documentType}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  documentType: event.target.value,
                }))
              }
            >
              {(intent === "test-order" ? TestCatalog : ["Blood Test", "Prescription", "Clinical Note", "Imaging", "Patient Upload", "Referral"]).map(
                (type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ),
              )}
            </select>
            <input
              type="text"
              placeholder="What this is related to"
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              value={formData.relatedTo}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  relatedTo: event.target.value,
                }))
              }
            />
            <input
              type="date"
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              value={formData.performedOn}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  performedOn: event.target.value,
                }))
              }
            />
            <input
              type="text"
              placeholder="Prescribing or reviewing doctor"
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              value={formData.physicianName}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  physicianName: event.target.value,
                }))
              }
            />
          </div>

          <textarea
            className="min-h-28 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            placeholder={
              intent === "test-order"
                ? "Explain why this test has been requested and what the patient should do next."
                : "Add the details someone should know when they open this record."
            }
            value={formData.summary}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                summary: event.target.value,
              }))
            }
            required
          />

          <div>
            <p className="mb-2 text-sm text-slate-400">Attach file</p>
            <FileUploader files={files} onChange={setFiles} />
          </div>

          {message && <p className="text-sm text-green-400">{message}</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : buttonLabel}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && message && <p className="text-sm text-green-400">{message}</p>}
      {!showForm && error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};
