// lib/config.ts
import { getSecret } from "./secrets";

export async function loadConfig() {
  return {
    NEXT_PUBLIC_ENDPOINT: await getSecret("next-public-endpoint"),
    PROJECT_ID: await getSecret("project-id"),
    API_KEY: await getSecret("api-key"),
    DATABASE_ID: await getSecret("database-id"),
    PATIENT_COLLECTION_ID: await getSecret("patient-collection-id"),
    DOCTOR_COLLECTION_ID: await getSecret("doctor-collection-id"),
    NEXT_PUBLIC_ADMIN_PASSKEY: await getSecret("next-public-admin-passkey"),
    APPOINTMENT_COLLECTION_ID: await getSecret("appointment-collection-id"),
    NEXT_PUBLIC_BUCKET_ID: await getSecret("next-public-bucket-id"),
  };
}
