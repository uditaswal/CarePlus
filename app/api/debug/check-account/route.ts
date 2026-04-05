import { NextResponse } from "next/server";
import {
  debugCheckEmailAccount,
  dangerousDeleteEmailAccount,
} from "@/lib/debug-auth";

/**
 * DEBUG ENDPOINT - Check account status
 * POST /api/debug/check-account?email=user@example.com
 *
 * WARNING: This is for debugging only. Remove in production.
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const action = searchParams.get("action"); // "check" or "delete"
  const adminKey = searchParams.get("key"); // Simple auth check

  // Simple security check - require admin passkey
  const expectedKey = process.env.NEXT_PUBLIC_ADMIN_PASSKEY;
  if (!adminKey || adminKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter required" },
      { status: 400 }
    );
  }

  try {
    if (action === "delete") {
      const result = await dangerousDeleteEmailAccount(email);
      return NextResponse.json(result);
    }

    // Default to check
    const result = await debugCheckEmailAccount(email);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Debug operation failed", details: error },
      { status: 500 }
    );
  }
}
