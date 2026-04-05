import Link from "next/link";

import { RecordUploadForm } from "@/components/forms/RecordUploadForm";
import { requireSession } from "@/lib/auth";

const AdminMedicalRecordsPage = async () => {
  const session = await requireSession({
    roles: ["admin", "doctor"],
    redirectTo: "/login",
  });

  return (
    <main className="min-h-screen bg-dark-300 px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-14-regular text-dark-700">Clinical Records</p>
            <h1 className="header">Patient Medical Records</h1>
          </div>
          <Link href="/admin" className="text-sm text-green-500 underline">
            Back to dashboard
          </Link>
        </div>

        <RecordUploadForm
          userId=""
          patientId=""
          uploadedByRole={session.role === "admin" ? "admin" : "doctor"}
          uploadedByName={session.name}
          doctorName={session.role === "doctor" ? session.name : ""}
          buttonLabel="Save clinical record"
        />
      </div>
    </main>
  );
};

export default AdminMedicalRecordsPage;
