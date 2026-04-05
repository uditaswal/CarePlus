import { NextResponse } from "next/server";

import { authenticatePatient } from "@/lib/auth";
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
    const { email = "", password = "" } = (await request.json()) as {
      email?: string;
      password?: string;
    };
    await logApiRequest({
      category: "api",
      event: "patient_login",
      request,
      requestId,
      body: { email },
    });

    const result = await authenticatePatient({ email, password });

    if (!result.ok) {
      await logApiResponse({
        category: "api",
        event: "patient_login",
        request,
        requestId,
        status: 401,
        startedAt,
        body: { error: result.error },
      });
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    await logApiResponse({
      category: "api",
      event: "patient_login",
      request,
      requestId,
      status: 200,
      startedAt,
      body: { redirectTo: result.redirectTo },
    });

    return NextResponse.json({
      redirectTo: result.redirectTo,
    });
  } catch (error) {
    await logError({
      category: "api",
      event: "patient_login.unhandled_error",
      message: "Unhandled error in patient login route",
      requestId,
      error,
    });
    return NextResponse.json({ error: "Unable to sign in" }, { status: 500 });
  }
}
