import "server-only";

import { Query } from "node-appwrite";
import {
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  databases,
  users,
} from "@/lib/appwrite.config";
import { logInfo } from "@/lib/logger";

/**
 * Debug function to check if an email account exists and its registration status
 * Use this to diagnose signup issues
 */
export async function debugCheckEmailAccount(email: string) {
  const identifier = email.trim().toLowerCase();

  try {
    // Check if user exists in Appwrite users collection
    const existingUsers = await users.list([Query.equal("email", identifier)]);

    if (existingUsers.users.length === 0) {
      return {
        exists: false,
        message: "No account found with this email",
        email: identifier,
      };
    }

    const existingUser = existingUsers.users[0];

    // Check patient profile
    const patientProfile = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", existingUser.$id)]
    );

    const result = {
      exists: true,
      user: {
        id: existingUser.$id,
        email: existingUser.email,
        phone: existingUser.phone,
        name: existingUser.name,
      },
      patientProfile: {
        exists: patientProfile.documents.length > 0,
        count: patientProfile.documents.length,
        documents: patientProfile.documents.map((doc) => ({
          id: doc.$id,
          userId: doc.userId,
          // Add other relevant fields
        })),
      },
    };

    await logInfo({
      category: "auth",
      event: "debug.check_email_account",
      message: "Email account debug check",
      data: result,
    });

    return result;
  } catch (error) {
    return {
      error: true,
      message: "Failed to check account",
      email: identifier,
      details: error,
    };
  }
}

/**
 * WARNING: This deletes the account and patient profile for an email
 * Only use this if you're sure about it!
 */
export async function dangerousDeleteEmailAccount(email: string) {
  const identifier = email.trim().toLowerCase();

  try {
    const existingUsers = await users.list([Query.equal("email", identifier)]);

    if (existingUsers.users.length === 0) {
      return {
        success: false,
        message: "No account found with this email",
      };
    }

    const existingUser = existingUsers.users[0];

    // Delete patient profiles
    const patientProfiles = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", existingUser.$id)]
    );

    for (const doc of patientProfiles.documents) {
      await databases.deleteDocument(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        doc.$id
      );
    }

    // Delete user
    await users.delete(existingUser.$id);

    await logInfo({
      category: "auth",
      event: "debug.delete_email_account",
      message: "Email account deleted",
      data: {
        email: identifier,
        userId: existingUser.$id,
        patientProfilesDeleted: patientProfiles.documents.length,
      },
    });

    return {
      success: true,
      message: "Account and patient profiles deleted",
      deletedProfiles: patientProfiles.documents.length,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete account",
      error,
    };
  }
}
