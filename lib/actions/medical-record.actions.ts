"use server";

import { ID, InputFile, Query } from "node-appwrite";

import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  MEDICAL_RECORD_COLLECTION_ID,
  PROJECT_ID,
  databases,
  storage,
} from "@/lib/appwrite.config";
import { requireSession } from "@/lib/auth";
import { logInfo } from "@/lib/logger";
import { MedicalRecord } from "@/types/appwrite.types";

import { parseStringify } from "../utils";

export const createMedicalRecord = async (
  record: CreateMedicalRecordParams
) => {
  if (!MEDICAL_RECORD_COLLECTION_ID) {
    throw new Error(
      "MEDICAL_RECORD_COLLECTION_ID is not configured. Create the collection in Appwrite first."
    );
  }

  const session = await requireSession({
    roles: ["admin", "doctor", "patient"],
    redirectTo: "/patient/login",
  });

  if (session.role === "doctor" && record.doctorName !== session.name) {
    throw new Error("Doctors can only save records under their own name.");
  }

  if (session.role === "patient" && session.userId !== record.userId) {
    throw new Error("Patients can only upload files to their own profile.");
  }

  // Store record metadata as JSON and basic required fields
  const metadata = JSON.stringify({
    doctorName: record.doctorName,
    title: record.title,
    category: record.category,
    summary: record.summary,
    documentType: record.documentType || null,
    relatedTo: record.relatedTo || null,
    performedOn: record.performedOn || null,
    physicianName: record.physicianName || null,
    bloodWork: record.bloodWork || null,
    medications: record.medications || null,
    recommendations: record.recommendations || null,
    followUpDate: record.followUpDate || null,
  });

  const newRecord = await databases.createDocument(
    DATABASE_ID!,
    MEDICAL_RECORD_COLLECTION_ID,
    ID.unique(),
    {
      patientId: record.patientId,
      userId: record.userId,
      appointmentId: record.appointmentId || null,
      uploadedByRole: record.uploadedByRole || session.role,
      uploadedByName: record.uploadedByName || session.name,
      uploadedAt: record.uploadedAt || new Date().toISOString(),
      attachments: record.attachments || [],
      attachmentMetadata: record.attachmentMetadata || [],
      metadata: metadata,
    }
  );

  await logInfo({
    category: "medical_record",
    event: "medical_record.create.success",
    message: "Medical record created",
    data: {
      recordId: newRecord.$id,
      userId: record.userId,
      patientId: record.patientId,
      appointmentId: record.appointmentId,
      doctorName: record.doctorName,
      category: record.category,
    },
  });

  return parseStringify(newRecord);
};

export const uploadMedicalRecordAttachment = async ({
  file,
  fileName,
  documentType,
  relatedTo,
  uploadedByRole,
  uploadedByName,
}: {
  file: File;
  fileName: string;
  documentType: string;
  relatedTo: string;
  uploadedByRole: "patient" | "doctor" | "admin";
  uploadedByName: string;
}) => {
  if (!BUCKET_ID) {
    throw new Error("Bucket configuration is missing.");
  }

  const uploadedFile = await storage.createFile(
    BUCKET_ID,
    ID.unique(),
    InputFile.fromBuffer(Buffer.from(await file.arrayBuffer()), fileName)
  );

  const fileUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view?project=${PROJECT_ID}`;
  const metadata = JSON.stringify({
    fileId: uploadedFile.$id,
    fileName,
    fileUrl,
    documentType,
    relatedTo,
    uploadedByRole,
    uploadedByName,
    uploadedAt: new Date().toISOString(),
  });

  return {
    fileId: uploadedFile.$id,
    fileUrl,
    metadata,
  };
};

export const getPatientMedicalRecords = async ({
  userId,
  patientId,
}: {
  userId: string;
  patientId: string;
}) => {
  if (!MEDICAL_RECORD_COLLECTION_ID) {
    return [];
  }

  const session = await requireSession({
    roles: ["patient", "admin", "doctor"],
    redirectTo: "/login",
  });

  if (session.role === "patient" && session.userId !== userId) {
    throw new Error("Unauthorized medical record access.");
  }

  const records = await databases.listDocuments(
    DATABASE_ID!,
    MEDICAL_RECORD_COLLECTION_ID,
    [Query.orderDesc("$createdAt")]
  );

  // Filter records to only return those matching the requested patientId
  const filteredRecords = records.documents.filter(
    (record: any) => record.patientId === patientId
  );

  return parseStringify(filteredRecords as MedicalRecord[]);
};
