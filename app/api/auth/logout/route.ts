import { NextResponse } from "next/server";

import { clearAuthSession } from "@/lib/auth";
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
    await logApiRequest({
      category: "api",
      event: "logout",
      request,
      requestId,
    });
    await clearAuthSession();

    await logApiResponse({
      category: "api",
      event: "logout",
      request,
      requestId,
      status: 302,
      startedAt,
      body: { redirectTo: "/login" },
    });

    return NextResponse.redirect(new URL("/login", request.url));
  } catch (error) {
    await logError({
      category: "api",
      event: "logout.unhandled_error",
      message: "Unhandled error in logout route",
      requestId,
      error,
    });
    return NextResponse.json({ error: "Unable to sign out" }, { status: 500 });
  }
}
