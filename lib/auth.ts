import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "crypto";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ID, Query } from "node-appwrite";

import {
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  users,
} from "@/lib/appwrite.config";
import { logError, logInfo, logWarn } from "@/lib/logger";

export type AuthRole = "admin" | "doctor" | "patient";

type AuthSessionPayload = {
  userId: string;
  role: AuthRole;
  email: string;
  name: string;
  patientId?: string;
  exp: number;
  iat: number;
  jti: string;
};

type LoginActivity = {
  id: string;
  role: AuthRole;
  identifier: string;
  success: boolean;
  reason: string;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;
};

type FailedAttempt = {
  count: number;
  lockedUntil: number | null;
};

type AuthStore = {
  activities: LoginActivity[];
  failedAttempts: Map<string, FailedAttempt>;
};

const SESSION_COOKIE_NAME = "careplus_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const MAX_ACTIVITY_ITEMS = 25;

function getDefaultRedirectForRole(role: AuthRole, userId?: string) {
  if (role === "patient") {
    return userId ? `/portal` : "/patient/login";
  }

  return "/admin";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding ? normalized + "=".repeat(4 - padding) : normalized;

  return Buffer.from(padded, "base64").toString("utf8");
}

function getSessionSecret() {
  return (
    process.env.AUTH_SESSION_SECRET ||
    process.env.API_KEY ||
    "careplus-dev-session-secret"
  );
}

function signValue(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function getAuthStore(): AuthStore {
  const globalStore = globalThis as typeof globalThis & {
    __careplusAuthStore?: AuthStore;
  };

  if (!globalStore.__careplusAuthStore) {
    globalStore.__careplusAuthStore = {
      activities: [],
      failedAttempts: new Map<string, FailedAttempt>(),
    };
  }

  return globalStore.__careplusAuthStore;
}

function buildSessionToken(payload: AuthSessionPayload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);

  const receivedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      base64UrlDecode(encodedPayload),
    ) as AuthSessionPayload;

    if (payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function getAttemptKey(role: AuthRole, identifier: string) {
  return `${role}:${identifier.trim().toLowerCase()}`;
}

function recordLoginActivity(
  role: AuthRole,
  identifier: string,
  success: boolean,
  reason: string,
) {
  const store = getAuthStore();
  const requestHeaders = headers();

  const activity: LoginActivity = {
    id: randomUUID(),
    role,
    identifier,
    success,
    reason,
    timestamp: new Date().toISOString(),
    ipAddress:
      requestHeaders.get("x-forwarded-for") ||
      requestHeaders.get("x-real-ip") ||
      null,
    userAgent: requestHeaders.get("user-agent"),
  };

  store.activities.unshift(activity);
  store.activities = store.activities.slice(0, MAX_ACTIVITY_ITEMS);

  const level = success ? "info" : "warn";
  console[level]("[auth]", {
    role: activity.role,
    identifier: activity.identifier,
    success: activity.success,
    reason: activity.reason,
    timestamp: activity.timestamp,
    ipAddress: activity.ipAddress,
  });

  const logger = success ? logInfo : logWarn;
  logger({
    category: "auth",
    event: success ? "login.activity.success" : "login.activity.failure",
    message: `Authentication activity recorded for ${role}`,
    data: activity,
  }).catch((loggingError) => {
    console.error("Failed to persist auth activity log:", loggingError);
  });
}

function getCredentialsForRole(role: AuthRole) {
  switch (role) {
    case "admin":
      return {
        email: process.env.ADMIN_EMAIL || "admin@careplus.com",
        password: process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSKEY || "",
        name: process.env.ADMIN_NAME || "CarePlus Admin",
        redirectTo: "/admin",
      };
    case "doctor":
      return {
        email: process.env.DOCTOR_EMAIL || "doctor@careplus.local",
        password: process.env.DOCTOR_PASSWORD || "",
        name: process.env.DOCTOR_NAME || "CarePlus Doctor",
        redirectTo: "/admin",
      };
    default:
      return null;
  }
}

export async function setAuthSession(session: {
  userId: string;
  role: AuthRole;
  email: string;
  name: string;
  patientId?: string;
}) {
  const payload: AuthSessionPayload = {
    ...session,
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
    jti: randomUUID(),
  };

  cookies().set(SESSION_COOKIE_NAME, buildSessionToken(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAuthSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function getSession() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function requireSession(options?: {
  roles?: AuthRole[];
  userId?: string;
  redirectTo?: string;
}) {
  const session = await getSession();

  if (!session) {
    redirect(options?.redirectTo || "/login");
  }

  if (options?.roles && !options.roles.includes(session.role)) {
    redirect(getDefaultRedirectForRole(session.role, session.userId));
  }

  if (options?.userId && session.userId !== options.userId) {
    redirect(getDefaultRedirectForRole(session.role, session.userId));
  }

  return session;
}

export async function authenticateWithPassword(input: {
  role: AuthRole;
  email: string;
  password: string;
}) {
  const identifier = input.email.trim().toLowerCase();
  const credentials = getCredentialsForRole(input.role);

  if (!credentials) {
    recordLoginActivity(input.role, identifier, false, "unsupported-role");
    return {
      ok: false as const,
      error: "This sign-in role is not available yet.",
    };
  }

  const attemptKey = getAttemptKey(input.role, identifier);
  const store = getAuthStore();
  const attempt = store.failedAttempts.get(attemptKey);

  if (attempt?.lockedUntil && attempt.lockedUntil > Date.now()) {
    recordLoginActivity(input.role, identifier, false, "account-locked");
    return {
      ok: false as const,
      error: "Account locked after multiple failed attempts. Please try again later.",
    };
  }

  const isValidEmail = identifier === credentials.email.trim().toLowerCase();
  const isValidPassword = input.password === credentials.password;

  if (!isValidEmail || !isValidPassword) {
    const nextCount = (attempt?.count || 0) + 1;
    const shouldLock = nextCount >= MAX_FAILED_ATTEMPTS;

    store.failedAttempts.set(attemptKey, {
      count: shouldLock ? 0 : nextCount,
      lockedUntil: shouldLock ? Date.now() + LOCKOUT_WINDOW_MS : null,
    });

    recordLoginActivity(
      input.role,
      identifier,
      false,
      shouldLock ? "lockout-triggered" : "invalid-credentials",
    );

    return {
      ok: false as const,
      error: shouldLock
        ? "Account locked after multiple failed attempts. Please try again in 15 minutes."
        : "Invalid credentials.",
    };
  }

  store.failedAttempts.delete(attemptKey);

  await setAuthSession({
    userId: `${input.role}:${identifier}`,
    role: input.role,
    email: credentials.email,
    name: credentials.name,
  });

  recordLoginActivity(input.role, identifier, true, "login-success");

  return {
    ok: true as const,
    redirectTo: credentials.redirectTo,
    role: input.role,
  };
}

export function getRecentLoginActivity() {
  return getAuthStore().activities;
}

export async function signupPatientWithPassword(input: CreatePortalUserParams) {
  const identifier = input.email.trim().toLowerCase();

  try {
    const newUser = await users.create(
      ID.unique(),
      identifier,
      input.phone,
      input.password,
      input.name,
    );

    await setAuthSession({
      userId: newUser.$id,
      role: "patient",
      email: newUser.email,
      name: newUser.name,
    });

    recordLoginActivity("patient", identifier, true, "signup-success");

    return {
      ok: true as const,
      userId: newUser.$id,
      redirectTo: `/patients/${newUser.$id}/register`,
    };
  } catch (error: any) {
    if (error?.code === 409) {
      await logWarn({
        category: "auth",
        event: "patient.signup.account_exists",
        message: "Signup blocked because the patient account already exists",
        data: {
          email: identifier,
          phone: input.phone,
        },
      });

      return {
        ok: false as const,
        error:
          "An account already exists for this email. Please sign in instead.",
        redirectTo: "/patient/login?reason=account-exists",
      };
    }

    recordLoginActivity("patient", identifier, false, "signup-failed");
    await logError({
      category: "auth",
      event: "patient.signup.failed",
      message: "Patient signup failed",
      error,
      data: {
        email: identifier,
        phone: input.phone,
      },
    });

    return {
      ok: false as const,
      error: error?.message || "Unable to create account right now.",
    };
  }
}

async function createPatientEmailSession(email: string, password: string) {
  const response = await fetch(`${ENDPOINT}/account/sessions/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": PROJECT_ID!,
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("invalid-credentials");
  }

  return response.json();
}

export async function requestPatientPasswordRecovery(email: string) {
  const identifier = email.trim().toLowerCase();
  const recoveryUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/patient/reset-password`;

  try {
    const response = await fetch(`${ENDPOINT}/account/recovery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": PROJECT_ID!,
      },
      body: JSON.stringify({
        email: identifier,
        url: recoveryUrl,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || "Unable to send reset email");
    }

    await logInfo({
      category: "auth",
      event: "patient.password_recovery.requested",
      message: "Patient password recovery requested",
      data: {
        email: identifier,
        recoveryUrl,
      },
    });

    return {
      ok: true as const,
      message:
        "If an account exists for that email, a password reset link has been sent.",
    };
  } catch (error) {
    await logError({
      category: "auth",
      event: "patient.password_recovery.failed",
      message: "Failed to create password recovery request",
      error,
      data: { email: identifier },
    });

    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Unable to send reset email",
    };
  }
}

export async function resetPatientPassword(input: {
  userId: string;
  secret: string;
  password: string;
}) {
  try {
    const response = await fetch(`${ENDPOINT}/account/recovery`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": PROJECT_ID!,
      },
      body: JSON.stringify({
        userId: input.userId,
        secret: input.secret,
        password: input.password,
        passwordAgain: input.password,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || "Unable to reset password");
    }

    await logInfo({
      category: "auth",
      event: "patient.password_recovery.completed",
      message: "Patient password reset completed",
      data: {
        userId: input.userId,
      },
    });

    return {
      ok: true as const,
      redirectTo: "/patient/login?reason=password-reset",
    };
  } catch (error) {
    await logError({
      category: "auth",
      event: "patient.password_recovery.reset_failed",
      message: "Failed to reset patient password",
      error,
      data: {
        userId: input.userId,
      },
    });

    return {
      ok: false as const,
      error:
        error instanceof Error ? error.message : "Unable to reset password",
    };
  }
}

export async function authenticatePatient(input: {
  email: string;
  password: string;
}) {
  const identifier = input.email.trim().toLowerCase();
  const attemptKey = getAttemptKey("patient", identifier);
  const store = getAuthStore();
  const attempt = store.failedAttempts.get(attemptKey);

  if (attempt?.lockedUntil && attempt.lockedUntil > Date.now()) {
    recordLoginActivity("patient", identifier, false, "account-locked");
    return {
      ok: false as const,
      error: "Account locked after multiple failed attempts. Please try again later.",
    };
  }

  try {
    await createPatientEmailSession(identifier, input.password);

    const matchedUsers = await users.list([Query.equal("email", [identifier])]);
    const appwriteUser = matchedUsers.users[0];

    if (!appwriteUser) {
      throw new Error("user-not-found");
    }

    const patients = PATIENT_COLLECTION_ID
      ? await databases.listDocuments(DATABASE_ID!, PATIENT_COLLECTION_ID, [
          Query.equal("userId", [appwriteUser.$id]),
        ])
      : null;

    const patientProfile = patients?.documents?.[0];

    await setAuthSession({
      userId: appwriteUser.$id,
      role: "patient",
      email: appwriteUser.email,
      name: appwriteUser.name,
      patientId: patientProfile?.$id,
    });

    store.failedAttempts.delete(attemptKey);
    recordLoginActivity("patient", identifier, true, "login-success");

    return {
      ok: true as const,
      redirectTo: patientProfile ? "/portal" : `/patients/${appwriteUser.$id}/register`,
    };
  } catch (error) {
    await logError({
      category: "auth",
      event: "patient.login.failed",
      message: "Patient login failed",
      error,
      data: { email: identifier },
    });

    const nextCount = (attempt?.count || 0) + 1;
    const shouldLock = nextCount >= MAX_FAILED_ATTEMPTS;

    store.failedAttempts.set(attemptKey, {
      count: shouldLock ? 0 : nextCount,
      lockedUntil: shouldLock ? Date.now() + LOCKOUT_WINDOW_MS : null,
    });

    recordLoginActivity(
      "patient",
      identifier,
      false,
      shouldLock ? "lockout-triggered" : "invalid-credentials",
    );

    return {
      ok: false as const,
      error: shouldLock
        ? "Account locked after multiple failed attempts. Please try again in 15 minutes."
        : "Invalid email or password.",
    };
  }
}
