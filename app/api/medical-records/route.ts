import { NextResponse } from "next/server";

import {
  createMedicalRecord,
  uploadMedicalRecordAttachment,
} from "@/lib/actions/medical-record.actions";
import {
  createRequestId,
  logApiRequest,
  logApiResponse,
  logError,
} from "@/lib/logger";

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = createRequestId();

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      const body = {
        userId: String(formData.get("userId") || ""),
        patientId: String(formData.get("patientId") || ""),
        appointmentId: String(formData.get("appointmentId") || ""),
        doctorName: String(formData.get("doctorName") || ""),
        title: String(formData.get("title") || ""),
        category: String(formData.get("category") || ""),
        summary: String(formData.get("summary") || ""),
        documentType: String(formData.get("documentType") || ""),
        relatedTo: String(formData.get("relatedTo") || ""),
        performedOn: String(formData.get("performedOn") || ""),
        physicianName: String(formData.get("physicianName") || ""),
        bloodWork: String(formData.get("bloodWork") || ""),
        medications: String(formData.get("medications") || ""),
        recommendations: String(formData.get("recommendations") || ""),
        followUpDate: String(formData.get("followUpDate") || ""),
        uploadedByRole: String(formData.get("uploadedByRole") || ""),
        uploadedByName: String(formData.get("uploadedByName") || ""),
      };

      await logApiRequest({
        category: "api",
        event: "medical_record_create",
        request,
        requestId,
        body,
      });

      const attachments: string[] = [];
      const attachmentMetadata: string[] = [];

      if (file instanceof File && file.size > 0) {
        const uploadedFile = await uploadMedicalRecordAttachment({
          file,
          fileName: file.name,
          documentType: body.documentType || body.category,
          relatedTo: body.relatedTo || body.title,
          uploadedByRole:
            (body.uploadedByRole as "patient" | "doctor" | "admin") || "patient",
          uploadedByName: body.uploadedByName || "CarePlus User",
        });

        attachments.push(uploadedFile.fileUrl);
        attachmentMetadata.push(uploadedFile.metadata);
      }

      const record = await createMedicalRecord({
        userId: body.userId,
        patientId: body.patientId,
        appointmentId: body.appointmentId || undefined,
        doctorName: body.doctorName,
        title: body.title,
        category: body.category,
        summary: body.summary,
        documentType: body.documentType || undefined,
        relatedTo: body.relatedTo || undefined,
        performedOn: body.performedOn ? new Date(body.performedOn) : null,
        physicianName: body.physicianName || undefined,
        bloodWork: body.bloodWork || undefined,
        medications: body.medications || undefined,
        recommendations: body.recommendations || undefined,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
        uploadedByRole:
          (body.uploadedByRole as "patient" | "doctor" | "admin") || undefined,
        uploadedByName: body.uploadedByName || undefined,
        attachments,
        attachmentMetadata,
      });

      await logApiResponse({
        category: "api",
        event: "medical_record_create",
        request,
        requestId,
        status: 200,
        startedAt,
        body: {
          recordId: record.$id,
          userId: body.userId,
          patientId: body.patientId,
        },
      });

      return NextResponse.json(record);
    }

    const body = (await request.json()) as CreateMedicalRecordParams & {
      followUpDate?: string | null;
      performedOn?: string | null;
    };

    await logApiRequest({
      category: "api",
      event: "medical_record_create",
      request,
      requestId,
      body: body as unknown as Record<string, unknown>,
    });

    const record = await createMedicalRecord({
      ...body,
      performedOn: body.performedOn ? new Date(body.performedOn) : null,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
    });

    await logApiResponse({
      category: "api",
      event: "medical_record_create",
      request,
      requestId,
      status: 200,
      startedAt,
      body: {
        recordId: record.$id,
        userId: body.userId,
        patientId: body.patientId,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    await logError({
      category: "api",
      event: "medical_record_create.unhandled_error",
      message: "Unhandled error in medical record route",
      requestId,
      error,
    });
    await logApiResponse({
      category: "api",
      event: "medical_record_create",
      request,
      requestId,
      status: 400,
      startedAt,
      body: {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create medical record",
      },
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create medical record",
      },
      { status: 400 },
    );
  }
}
