import { NextResponse } from "next/server";

import { signupPatientWithPassword } from "@/lib/auth";
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
    const payload = (await request.json()) as CreatePortalUserParams;
    await logApiRequest({
      category: "api",
      event: "patient_signup",
      request,
      requestId,
      body: payload as unknown as Record<string, unknown>,
    });

    const result = await signupPatientWithPassword(payload);

    if (!result.ok) {
      await logApiResponse({
        category: "api",
        event: "patient_signup",
        request,
        requestId,
        status: result.redirectTo ? 409 : 400,
        startedAt,
        body: { error: result.error, redirectTo: result.redirectTo },
      });
      return NextResponse.json(
        { error: result.error, redirectTo: result.redirectTo },
        { status: result.redirectTo ? 409 : 400 },
      );
    }

    await logApiResponse({
      category: "api",
      event: "patient_signup",
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
      event: "patient_signup.unhandled_error",
      message: "Unhandled error in patient signup route",
      requestId,
      error,
    });
    return NextResponse.json({ error: "Unable to create account" }, { status: 500 });
  }
}
