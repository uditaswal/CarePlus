import Link from "next/link";
import { redirect } from "next/navigation";

import { PatientProfileForm } from "@/components/forms/PatientProfileForm";
import { RecordUploadForm } from "@/components/forms/RecordUploadForm";
import { PatientAppointmentsSection } from "@/components/PatientAppointmentsSection";
import { TestCatalog } from "@/constants";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { getPatientMedicalRecords } from "@/lib/actions/medical-record.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { getSession, requireSession } from "@/lib/auth";
import { Appointment, MedicalRecord } from "@/types/appwrite.types";

const PatientPortalPage = async () => {
  const session = await requireSession({
    roles: ["patient"],
    redirectTo: "/patient/login",
  });
  const currentSession = await getSession();
  const patient = await getPatient(session.userId);

  if (!patient) {
    redirect(`/patients/${session.userId}/register`);
  }

  const [appointments, medicalRecords] = await Promise.all([
    getPatientAppointments(session.userId),
    getPatientMedicalRecords({
      userId: session.userId,
      patientId: patient.$id,
    }),
  ]);
  const latestAppointment = appointments[0];
  const scheduledTests = medicalRecords.filter(
    (record: MedicalRecord) => record.category === "Test Order",
  );

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl bg-[linear-gradient(135deg,_rgba(16,185,129,0.28),_rgba(15,23,42,0.92))] p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Patient Dashboard
              </p>
              <h1 className="text-4xl font-semibold">
                {patient.name}&apos;s health overview
              </h1>
              <p className="max-w-2xl text-slate-200">
                Track your appointment schedule, assigned doctors, medical
                history, current medications, and any report shared after visits.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/patients/${session.userId}/new-appointment`}
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-900"
              >
                Book appointment
              </Link>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-slate-300">Signed in as</p>
              <p className="mt-2 text-xl font-semibold">
                {currentSession?.email || session.email}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-slate-300">Appointments</p>
              <p className="mt-2 text-xl font-semibold">{appointments.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-slate-300">Medical updates</p>
              <p className="mt-2 text-xl font-semibold">{medicalRecords.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-slate-300">Primary physician</p>
              <p className="mt-2 text-xl font-semibold">
                Dr. {patient.primaryPhysician}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.5fr,1fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Latest appointment</h2>
                  <p className="text-sm text-slate-400">
                    Your most recent visit appears first. You can open the full
                    history when you need it.
                  </p>
                </div>
              </div>

              <PatientAppointmentsSection
                appointments={appointments as Appointment[]}
                userId={session.userId}
              />
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
              <h2 className="text-2xl font-semibold">Reports and blood work</h2>
              <p className="mt-1 text-sm text-slate-400">
                Visit summaries, lab values, prescriptions, and follow-up
                guidance from your care team.
              </p>

              <div className="mt-5 space-y-4">
                {medicalRecords.length > 0 ? (
                  medicalRecords.map((record: MedicalRecord) => (
                    <article
                      key={record.$id}
                      className="rounded-2xl border border-white/10 bg-slate-950 p-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-semibold">{record.title}</p>
                          <p className="text-sm text-slate-400">
                            {record.category} by Dr. {record.doctorName}
                          </p>
                        </div>
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {new Date(record.$createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-4 text-sm text-slate-300">{record.summary}</p>
                      {record.bloodWork && (
                        <p className="mt-3 text-sm text-slate-400">
                          Blood work: {record.bloodWork}
                        </p>
                      )}
                      {record.medications && (
                        <p className="mt-2 text-sm text-slate-400">
                          Medications: {record.medications}
                        </p>
                      )}
                      {record.recommendations && (
                        <p className="mt-2 text-sm text-slate-400">
                          Recommendations: {record.recommendations}
                        </p>
                      )}
                      <div className="mt-3 space-y-2 text-sm text-slate-400">
                        {record.uploadedByName && (
                          <p>
                            Uploaded by {record.uploadedByName} on{" "}
                            {new Date(
                              record.uploadedAt || record.$createdAt,
                            ).toLocaleString()}
                          </p>
                        )}
                        {record.documentType && <p>Document: {record.documentType}</p>}
                        {record.relatedTo && <p>Related to: {record.relatedTo}</p>}
                        {record.performedOn && (
                          <p>
                            Test or report date:{" "}
                            {new Date(record.performedOn).toLocaleDateString()}
                          </p>
                        )}
                        {record.physicianName && (
                          <p>Physician: {record.physicianName}</p>
                        )}
                      </div>
                      {record.attachmentMetadata && record.attachmentMetadata.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {record.attachmentMetadata.map((item, index) => {
                            const metadata = JSON.parse(item) as {
                              fileUrl?: string;
                              fileName?: string;
                              uploadedByName?: string;
                              uploadedAt?: string;
                            };

                            return (
                              <a
                                key={`${record.$id}-file-${index}`}
                                href={metadata.fileUrl || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-xl bg-white/5 px-4 py-3 text-sm text-sky-300"
                              >
                                {metadata.fileName || "View attachment"}
                                {metadata.uploadedByName &&
                                  ` uploaded by ${metadata.uploadedByName}`}
                                {metadata.uploadedAt &&
                                  ` on ${new Date(metadata.uploadedAt).toLocaleDateString()}`}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-sm text-slate-400">
                    No records have been added yet.
                  </div>
                )}
              </div>

              <div className="mt-6">
                <RecordUploadForm
                  userId={session.userId}
                  patientId={patient.$id}
                  appointmentId={latestAppointment?.$id || ""}
                  uploadedByRole="patient"
                  uploadedByName={patient.name}
                  doctorName={latestAppointment?.primaryPhysician || ""}
                  buttonLabel="Upload a report or document"
                />
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
              <h2 className="text-2xl font-semibold">Scheduled tests</h2>
              <p className="mt-2 text-sm text-slate-400">
                Tests requested by your care team appear here.
              </p>
              <div className="mt-5 space-y-3">
                {scheduledTests.length > 0 ? (
                  scheduledTests.map((test) => (
                    <div
                      key={test.$id}
                      className="rounded-2xl border border-white/10 bg-slate-950 p-4"
                    >
                      <p className="text-base font-semibold text-white">
                        {test.documentType || test.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {test.summary}
                      </p>
                      {test.physicianName && (
                        <p className="mt-2 text-sm text-slate-500">
                          Requested by {test.physicianName}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
                    No tests have been scheduled yet.
                  </div>
                )}
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Common tests</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {TestCatalog.slice(0, 6).map((test) => (
                      <span
                        key={test}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300"
                      >
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
              <h2 className="text-2xl font-semibold">Medical history</h2>
              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <div>
                  <p className="text-slate-500">Allergies</p>
                  <p>{patient.allergies || "No allergy information on file"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Current medication</p>
                  <p>
                    {patient.currentMedication ||
                      "No active medication details on file"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Past medical history</p>
                  <p>
                    {patient.pastMedicalHistory ||
                      "No past medical history added yet"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Family medical history</p>
                  <p>
                    {patient.familyMedicalHistory ||
                      "No family medical history added yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
              <h2 className="text-2xl font-semibold">Profile details</h2>
              <p className="mt-2 text-sm text-slate-400">
                Update your contact details, insurance, emergency contact, and
                medical background whenever something changes.
              </p>
              <div className="mt-5">
                <PatientProfileForm patient={patient} />
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
};

export default PatientPortalPage;
