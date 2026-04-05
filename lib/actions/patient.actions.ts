"use server";

import { revalidatePath } from "next/cache";
import { ID, InputFile, Query } from "node-appwrite";

import { requireSession, setAuthSession } from "@/lib/auth";
import { logError, logInfo } from "@/lib/logger";

import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";

// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams) => {
  try {
    // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name,
    );

    await setAuthSession({
      userId: newuser.$id,
      role: "patient",
      email: newuser.email,
      name: newuser.name,
    });

    await logInfo({
      category: "patient",
      event: "patient.create_user.success",
      message: "Patient user created",
      data: {
        userId: newuser.$id,
        email: newuser.email,
      },
    });

    return parseStringify(newuser);
  } catch (error: any) {
    // Check existing user
    if (error && error?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);

      if (existingUser.users[0]) {
        await setAuthSession({
          userId: existingUser.users[0].$id,
          role: "patient",
          email: existingUser.users[0].email,
          name: existingUser.users[0].name,
        });

        await logInfo({
          category: "patient",
          event: "patient.create_user.reused",
          message: "Existing patient user reused",
          data: {
            userId: existingUser.users[0].$id,
            email: existingUser.users[0].email,
          },
        });
      }

      return existingUser.users[0];
    }
    await logError({
      category: "patient",
      event: "patient.create_user.failed",
      message: "Failed to create patient user",
      error,
      data: {
        email: user.email,
        phone: user.phone,
      },
    });
    console.error("An error occurred while creating a new user:", error);
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);

    return parseStringify(user);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the user details:",
      error,
    );
  }
};

// REGISTER PATIENT
export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    await requireSession({
      roles: ["patient"],
      userId: patient.userId,
      redirectTo: "/",
    });

    // Upload file ->  // https://appwrite.io/docs/references/cloud/client-web/storage#createFile
    let file;
    if (identificationDocument) {
      const inputFile =
        identificationDocument &&
        InputFile.fromBlob(
          identificationDocument?.get("blobFile") as Blob,
          identificationDocument?.get("fileName") as string,
        );

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    // Create new patient document -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#createDocument
    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id ? file.$id : null,
        identificationDocumentUrl: file?.$id
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view??project=${PROJECT_ID}`
          : null,
        ...patient,
      },
    );

    await setAuthSession({
      userId: patient.userId,
      role: "patient",
      email: patient.email,
      name: patient.name,
      patientId: newPatient.$id,
    });

    await logInfo({
      category: "patient",
      event: "patient.register.success",
      message: "Patient profile registered",
      data: {
        userId: patient.userId,
        patientId: newPatient.$id,
        email: patient.email,
      },
    });

    return parseStringify(newPatient);
  } catch (error) {
    await logError({
      category: "patient",
      event: "patient.register.failed",
      message: "Failed to register patient profile",
      error,
      data: {
        userId: patient.userId,
        email: patient.email,
      },
    });
    console.error("An error occurred while creating a new patient:", error);
  }
};

// GET PATIENT
export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", [userId])],
    );

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the patient details:",
      error,
    );
  }
};

export const updatePatientProfile = async (
  patient: UpdatePatientProfileParams,
) => {
  try {
    await requireSession({
      roles: ["patient"],
      userId: patient.userId,
      redirectTo: "/patient/login",
    });

    const { patientId, ...patientData } = patient;

    const updatedPatient = await databases.updateDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId,
      patientData,
    );

    revalidatePath("/portal");

    await logInfo({
      category: "patient",
      event: "patient.profile.update.success",
      message: "Patient profile updated",
      data: {
        userId: patient.userId,
        patientId,
      },
    });

    return parseStringify(updatedPatient);
  } catch (error) {
    await logError({
      category: "patient",
      event: "patient.profile.update.failed",
      message: "Failed to update patient profile",
      error,
      data: {
        userId: patient.userId,
        patientId: patient.patientId,
      },
    });
    console.error("An error occurred while updating patient profile:", error);
  }
};
