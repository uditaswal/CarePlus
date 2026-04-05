import { NextResponse } from "next/server";
import { Query } from "node-appwrite";

import { serializeAppointmentsToCsv } from "@/lib/appointment-analytics";
import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
} from "@/lib/appwrite.config";
import { getSession } from "@/lib/auth";
import {
  createRequestId,
  logApiRequest,
  logApiResponse,
  logError,
} from "@/lib/logger";
import { Appointment } from "@/types/appwrite.types";

export async function GET(request: Request) {
  const requestId = createRequestId();
  const startedAt = Date.now();

  await logApiRequest({
    category: "admin",
    event: "appointments.export",
    request,
    requestId,
  });

  try {
    const session = await getSession();

    if (!session || !["admin", "doctor"].includes(session.role)) {
      await logApiResponse({
        category: "admin",
        event: "appointments.export",
        request,
        requestId,
        status: 401,
        startedAt,
      });

      return NextResponse.json(
        { error: "You are not authorized to export appointments." },
        { status: 401 },
      );
    }

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")],
    );

    const csv = serializeAppointmentsToCsv(
      appointments.documents as Appointment[],
    );

    await logApiResponse({
      category: "admin",
      event: "appointments.export",
      request,
      requestId,
      status: 200,
      startedAt,
      body: {
        rows: appointments.documents.length,
      },
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="appointments-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    await logError({
      category: "admin",
      event: "appointments.export.failed",
      message: "Failed to export appointments CSV",
      requestId,
      error,
    });

    await logApiResponse({
      category: "admin",
      event: "appointments.export",
      request,
      requestId,
      status: 500,
      startedAt,
    });

    return NextResponse.json(
      { error: "Unable to export appointments right now." },
      { status: 500 },
    );
  }
}
