import { NextResponse } from "next/server";

import { authenticateWithPassword, type AuthRole } from "@/lib/auth";
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
    const { email = "", password = "", role = "admin" } = (await request.json()) as {
      email?: string;
      password?: string;
      role?: AuthRole;
    };
    await logApiRequest({
      category: "api",
      event: "staff_login",
      request,
      requestId,
      body: { email, role },
    });

    const result = await authenticateWithPassword({
      email,
      password,
      role,
    });

    if (!result.ok) {
      await logApiResponse({
        category: "api",
        event: "staff_login",
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
      event: "staff_login",
      request,
      requestId,
      status: 200,
      startedAt,
      body: { redirectTo: result.redirectTo, role: result.role },
    });

    return NextResponse.json({
      redirectTo: result.redirectTo,
      role: result.role,
    });
  } catch (error) {
    await logError({
      category: "api",
      event: "staff_login.unhandled_error",
      message: "Unhandled error in staff login route",
      requestId,
      error,
    });
    return NextResponse.json({ error: "Unable to sign in" }, { status: 500 });
  }
}
