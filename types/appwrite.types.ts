import { Models } from "node-appwrite";

export interface Patient extends Models.Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: Gender;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string | undefined;
  currentMedication: string | undefined;
  familyMedicalHistory: string | undefined;
  pastMedicalHistory: string | undefined;
  identificationType: string | undefined;
  identificationNumber: string | undefined;
  identificationDocument: FormData | undefined;
  privacyConsent: boolean;
}

export interface Appointment extends Models.Document {
  patient: Patient;
  schedule: Date;
  status: Status;
  primaryPhysician: string;
  reason: string;
  note: string;
  noteHistory?: string[];
  requestStatus?: "none" | "pending" | "approved" | "declined";
  requestedSchedule?: Date | string | null;
  rescheduleReason?: string | null;
  userId: string;
  cancellationReason: string | null;
}

export interface MedicalRecord extends Models.Document {
  userId: string;
  patientId: string;
  appointmentId?: string | null;
  doctorName: string;
  title: string;
  category: string;
  summary: string;
  uploadedByRole?: "patient" | "doctor" | "admin";
  uploadedByName?: string;
  uploadedAt?: string;
  documentType?: string | null;
  relatedTo?: string | null;
  performedOn?: Date | string | null;
  physicianName?: string | null;
  bloodWork: string | null;
  medications: string | null;
  recommendations: string | null;
  followUpDate: Date | string | null;
  attachments: string[] | null;
  attachmentMetadata?: string[] | null;
}
