import { NextResponse } from "next/server";

import { requestPatientPasswordRecovery } from "@/lib/auth";
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
    const { email = "" } = (await request.json()) as { email?: string };

    await logApiRequest({
      category: "api",
      event: "patient_forgot_password",
      request,
      requestId,
      body: { email },
    });

    const result = await requestPatientPasswordRecovery(email);

    if (!result.ok) {
      await logApiResponse({
        category: "api",
        event: "patient_forgot_password",
        request,
        requestId,
        status: 400,
        startedAt,
        body: { error: result.error },
      });
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await logApiResponse({
      category: "api",
      event: "patient_forgot_password",
      request,
      requestId,
      status: 200,
      startedAt,
      body: { message: result.message },
    });

    return NextResponse.json({ message: result.message });
  } catch (error) {
    await logError({
      category: "api",
      event: "patient_forgot_password.unhandled_error",
      message: "Unhandled error in forgot password route",
      requestId,
      error,
    });
    return NextResponse.json(
      { error: "Unable to send reset email" },
      { status: 500 },
    );
  }
}
