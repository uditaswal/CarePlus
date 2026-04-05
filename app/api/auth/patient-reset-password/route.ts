import { NextResponse } from "next/server";

import { resetPatientPassword } from "@/lib/auth";
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
    const { userId = "", secret = "", password = "" } = (await request.json()) as {
      userId?: string;
      secret?: string;
      password?: string;
    };

    await logApiRequest({
      category: "api",
      event: "patient_reset_password",
      request,
      requestId,
      body: { userId, secret, password },
    });

    const result = await resetPatientPassword({ userId, secret, password });

    if (!result.ok) {
      await logApiResponse({
        category: "api",
        event: "patient_reset_password",
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
      event: "patient_reset_password",
      request,
      requestId,
      status: 200,
      startedAt,
      body: { redirectTo: result.redirectTo },
    });

    return NextResponse.json({ redirectTo: result.redirectTo });
  } catch (error) {
    await logError({
      category: "api",
      event: "patient_reset_password.unhandled_error",
      message: "Unhandled error in reset password route",
      requestId,
      error,
    });
    return NextResponse.json(
      { error: "Unable to reset password" },
      { status: 500 },
    );
  }
}
