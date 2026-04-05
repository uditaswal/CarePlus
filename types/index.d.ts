/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

declare type Gender = "Male" | "Female" | "Other";
declare type Status = "pending" | "scheduled" | "cancelled";

declare interface CreateUserParams {
  name: string;
  email: string;
  phone: string;
}
declare interface CreatePortalUserParams extends CreateUserParams {
  password: string;
}
declare interface User extends CreateUserParams {
  $id: string;
}

declare interface RegisterUserParams extends CreateUserParams {
  userId: string;
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

declare type CreateAppointmentParams = {
  userId: string;
  patient: string;
  primaryPhysician: string;
  reason: string;
  schedule: Date;
  status: Status;
  note: string | undefined;
  noteHistory?: string[];
  requestStatus?: "none" | "pending" | "approved" | "declined";
  requestedSchedule?: Date | null;
  rescheduleReason?: string | null;
};

declare type UpdateAppointmentParams = {
  appointmentId: string;
  userId: string;
  timeZone: string;
  appointment: Partial<Appointment>;
  type: string;
};

declare type RequestRescheduleParams = {
  appointmentId: string;
  userId: string;
  requestedSchedule: Date;
  rescheduleReason: string;
};

declare type AddAppointmentCommentParams = {
  appointmentId: string;
  userId: string;
  comment: string;
};

declare type UpdatePatientProfileParams = {
  userId: string;
  patientId: string;
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
  allergies?: string;
  currentMedication?: string;
  familyMedicalHistory?: string;
  pastMedicalHistory?: string;
  identificationType?: string;
  identificationNumber?: string;
};

declare type CreateMedicalRecordParams = {
  userId: string;
  patientId: string;
  appointmentId?: string;
  doctorName: string;
  title: string;
  category: string;
  summary: string;
  uploadedByRole?: "patient" | "doctor" | "admin";
  uploadedByName?: string;
  uploadedAt?: string;
  documentType?: string;
  relatedTo?: string;
  performedOn?: Date | null;
  physicianName?: string;
  bloodWork?: string;
  medications?: string;
  recommendations?: string;
  followUpDate?: Date | null;
  attachments?: string[];
  attachmentMetadata?: string[];
};
