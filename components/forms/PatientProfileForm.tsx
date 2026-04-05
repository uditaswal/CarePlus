"use client";

import { useState } from "react";

import { updatePatientProfile } from "@/lib/actions/patient.actions";
import { Patient } from "@/types/appwrite.types";

export const PatientProfileForm = ({ patient }: { patient: Patient }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: patient.name || "",
    email: patient.email || "",
    phone: patient.phone || "",
    birthDate: patient.birthDate
      ? new Date(patient.birthDate).toISOString().slice(0, 10)
      : "",
    gender: patient.gender || "Male",
    address: patient.address || "",
    occupation: patient.occupation || "",
    emergencyContactName: patient.emergencyContactName || "",
    emergencyContactNumber: patient.emergencyContactNumber || "",
    primaryPhysician: patient.primaryPhysician || "",
    insuranceProvider: patient.insuranceProvider || "",
    insurancePolicyNumber: patient.insurancePolicyNumber || "",
    allergies: patient.allergies || "",
    currentMedication: patient.currentMedication || "",
    familyMedicalHistory: patient.familyMedicalHistory || "",
    pastMedicalHistory: patient.pastMedicalHistory || "",
    identificationType: patient.identificationType || "",
    identificationNumber: patient.identificationNumber || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (key: string, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      await updatePatientProfile({
        ...formData,
        userId: patient.userId,
        patientId: patient.$id,
        birthDate: new Date(formData.birthDate),
        gender: formData.gender as Gender,
      });
      setMessage("Your details have been updated.");
      setIsEditing(false);
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : "Unable to update profile",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="space-y-2 text-sm text-slate-300">
          <p>Email: {formData.email}</p>
          <p>Phone: {formData.phone}</p>
          <p>Insurance: {formData.insuranceProvider}</p>
          <p>Policy number: {formData.insurancePolicyNumber}</p>
          <p>Emergency contact: {formData.emergencyContactName}</p>
          <p>Emergency number: {formData.emergencyContactNumber}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-900"
        >
          Edit personal details
        </button>
        {message && <p className="text-sm text-green-400">{message}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        {[
          ["name", "Full name"],
          ["email", "Email"],
          ["phone", "Phone"],
          ["birthDate", "Birth date"],
          ["gender", "Gender"],
          ["address", "Address"],
          ["occupation", "Occupation"],
          ["emergencyContactName", "Emergency contact"],
          ["emergencyContactNumber", "Emergency phone"],
          ["primaryPhysician", "Primary physician"],
          ["insuranceProvider", "Insurance provider"],
          ["insurancePolicyNumber", "Policy number"],
          ["allergies", "Allergies"],
          ["currentMedication", "Current medication"],
          ["familyMedicalHistory", "Family medical history"],
          ["pastMedicalHistory", "Past medical history"],
          ["identificationType", "Identification type"],
          ["identificationNumber", "Identification number"],
        ].map(([key, label]) => (
          <div key={key}>
            <p className="mb-1 text-sm text-slate-500">{label}</p>
            {key === "allergies" ||
            key === "currentMedication" ||
            key === "familyMedicalHistory" ||
            key === "pastMedicalHistory" ||
            key === "address" ? (
              <textarea
                className="min-h-20 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                value={formData[key as keyof typeof formData]}
                onChange={(event) => updateField(key, event.target.value)}
              />
            ) : (
              <input
                type={key === "birthDate" ? "date" : "text"}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                value={formData[key as keyof typeof formData]}
                onChange={(event) => updateField(key, event.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {message && <p className="text-sm text-green-400">{message}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
