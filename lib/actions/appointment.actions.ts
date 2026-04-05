"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { buildAppointmentAnalytics } from "@/lib/appointment-analytics";
import { requireSession } from "@/lib/auth";
import { logError, logInfo } from "@/lib/logger";
import { Appointment } from "@/types/appwrite.types";

import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";

const formatAppointmentComment = (author: string, comment: string) =>
  `${author} updated on ${new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}: ${comment}`;

const getAuthorizedAppointmentDocuments = async () => {
  await requireSession({
    roles: ["admin", "doctor"],
    redirectTo: "/login",
  });

  const appointments = await databases.listDocuments(
    DATABASE_ID!,
    APPOINTMENT_COLLECTION_ID!,
    [Query.orderDesc("$createdAt")]
  );

  return appointments.documents as Appointment[];
};

//  CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    await requireSession({
      roles: ["patient"],
      userId: appointment.userId,
      redirectTo: "/",
    });

    // Remove fields that don't exist in the database schema
    const {
      noteHistory,
      requestStatus,
      requestedSchedule,
      rescheduleReason,
      ...appointmentData
    } = appointment;

    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointmentData
    );

    revalidatePath("/admin");
    revalidatePath("/portal");
    await logInfo({
      category: "appointment",
      event: "appointment.create.success",
      message: "Appointment created",
      data: {
        appointmentId: newAppointment.$id,
        userId: appointment.userId,
        doctorName: appointment.primaryPhysician,
        status: appointment.status,
      },
    });
    return parseStringify(newAppointment);
  } catch (error) {
    await logError({
      category: "appointment",
      event: "appointment.create.failed",
      message: "Failed to create appointment",
      error,
      data: {
        userId: appointment.userId,
        doctorName: appointment.primaryPhysician,
      },
    });
    console.error("An error occurred while creating a new appointment:", error);
  }
};

//  GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    const documents = await getAuthorizedAppointmentDocuments();
    const analytics = buildAppointmentAnalytics(documents);

    const data = {
      totalCount: documents.length,
      ...analytics,
      documents,
    };

    return parseStringify(data);
  } catch (error) {
    await logError({
      category: "appointment",
      event: "appointment.list.failed",
      message: "Failed to retrieve appointment list",
      error,
    });
    console.error(
      "An error occurred while retrieving the recent appointments:",
      error
    );
  }
};

export const getPatientAppointments = async (userId: string) => {
  try {
    const session = await requireSession({
      roles: ["patient", "admin", "doctor"],
      redirectTo: "/patient/login",
    });

    if (session.role === "patient" && session.userId !== userId) {
      throw new Error("Unauthorized appointment access.");
    }

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.equal("userId", [userId]), Query.orderDesc("$createdAt")]
    );

    return parseStringify(appointments.documents as Appointment[]);
  } catch (error) {
    await logError({
      category: "appointment",
      event: "appointment.patient_list.failed",
      message: "Failed to retrieve patient appointments",
      error,
      data: { userId },
    });
    console.error(
      "An error occurred while retrieving patient appointments:",
      error
    );
    return [];
  }
};

export const requestAppointmentReschedule = async ({
  appointmentId,
  userId,
  requestedSchedule,
  rescheduleReason,
}: RequestRescheduleParams) => {
  try {
    await requireSession({
      roles: ["patient"],
      userId,
      redirectTo: "/patient/login",
    });

    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      {
        requestStatus: "pending",
        requestedSchedule,
        rescheduleReason,
        noteHistory: [
          ...(appointment.noteHistory || []),
          formatAppointmentComment(
            "Patient",
            `requested a new time for ${formatDateTime(requestedSchedule).dateTime}. ${rescheduleReason}`
          ),
        ],
      }
    );

    revalidatePath("/admin");
    revalidatePath("/portal");
    await logInfo({
      category: "appointment",
      event: "appointment.reschedule_request.success",
      message: "Reschedule request submitted",
      data: {
        appointmentId,
        userId,
      },
    });

    return parseStringify(updatedAppointment);
  } catch (error) {
    await logError({
      category: "appointment",
      event: "appointment.reschedule_request.failed",
      message: "Failed to submit reschedule request",
      error,
      data: {
        appointmentId,
        userId,
      },
    });
    throw error;
  }
};

export const addAppointmentComment = async ({
  appointmentId,
  userId,
  comment,
}: AddAppointmentCommentParams) => {
  try {
    const session = await requireSession({
      roles: ["patient", "admin", "doctor"],
      redirectTo: "/patient/login",
    });

    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    if (session.role === "patient" && appointment.userId !== userId) {
      throw new Error("Unauthorized comment update.");
    }

    const author =
      session.role === "patient"
        ? "Patient"
        : session.role === "doctor"
          ? "Doctor"
          : "Admin";

    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      {
        note: comment,
        noteHistory: [
          ...(appointment.noteHistory || []),
          formatAppointmentComment(author, comment),
        ],
      }
    );

    revalidatePath("/admin");
    revalidatePath("/portal");
    await logInfo({
      category: "appointment",
      event: "appointment.comment.success",
      message: "Appointment comment updated",
      data: {
        appointmentId,
        userId,
        author,
      },
    });

    return parseStringify(updatedAppointment);
  } catch (error) {
    await logError({
      category: "appointment",
      event: "appointment.comment.failed",
      message: "Failed to update appointment comment",
      error,
      data: {
        appointmentId,
        userId,
      },
    });
    throw error;
  }
};

//  SEND SMS NOTIFICATION
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    await logError({
      category: "messaging",
      event: "sms.send.failed",
      message: "Failed to send SMS notification",
      error,
      data: { userId },
    });
    console.error("An error occurred while sending sms:", error);
  }
};

//  UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  timeZone,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    await requireSession({
      roles: ["admin", "doctor"],
      redirectTo: "/login",
    });

    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      {
        ...appointment,
        requestStatus:
          type === "schedule"
            ? "approved"
            : appointment.requestStatus || "none",
        requestedSchedule:
          type === "schedule" ? null : appointment.requestedSchedule || null,
        rescheduleReason:
          type === "schedule" ? null : appointment.rescheduleReason || null,
        noteHistory: appointment.note
          ? [
              ...(appointment.noteHistory || []),
              formatAppointmentComment("Staff", appointment.note),
            ]
          : appointment.noteHistory,
      }
    );

    if (!updatedAppointment) throw Error;

    // ✅ SAFE date formatting
    const dateTime =
      appointment.schedule && timeZone
        ? formatDateTime(appointment.schedule, timeZone).dateTime
        : "N/A";

    const smsMessage =
      type === "schedule"
        ? `Greetings from CarePlus. Your appointment is confirmed for ${dateTime} with Dr. ${appointment.primaryPhysician}.`
        : `We regret to inform that your appointment for ${dateTime} is cancelled. Reason: ${appointment.cancellationReason || "No reason provided"}.`;

    await sendSMSNotification(userId, smsMessage);

    revalidatePath("/admin");
    revalidatePath("/portal");
    await logInfo({
      category: "appointment",
      event: "appointment.update.success",
      message: "Appointment updated",
      data: {
        appointmentId,
        userId,
        type,
        status: appointment.status,
      },
    });
    return parseStringify(updatedAppointment);
  } catch (error) {
    await logError({
      category: "appointment",
      event: "appointment.update.failed",
      message: "Failed to update appointment",
      error,
      data: {
        appointmentId,
        userId,
        type,
      },
    });
    console.error("An error occurred while scheduling an appointment:", error);
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    await logError({
      category: "appointment",
      event: "appointment.get.failed",
      message: "Failed to retrieve appointment",
      error,
      data: { appointmentId },
    });
    console.error(
      "An error occurred while retrieving the existing patient:",
      error
    );
  }
};
