import { DoctorLoad } from "@/lib/appointment-analytics";

type DoctorLoadListProps = {
  doctors: DoctorLoad[];
};

export const DoctorLoadList = ({ doctors }: DoctorLoadListProps) => {
  return (
    <div className="rounded-2xl border border-dark-500 bg-dark-300 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Most booked doctors</h2>
        <p className="text-sm text-dark-700">
          Current appointment volume by doctor.
        </p>
      </div>

      <div className="space-y-4">
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div
              key={doctor.doctorName}
              className="rounded-xl border border-dark-500 bg-dark-400 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-dark-700">Doctor</p>
                  <p className="text-base font-semibold text-white">
                    Dr. {doctor.doctorName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-dark-700">Total</p>
                  <p className="text-2xl font-semibold text-white">
                    {doctor.appointments}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-green-500/15 px-3 py-1 text-green-400">
                  Scheduled {doctor.scheduled}
                </span>
                <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-yellow-300">
                  Pending {doctor.pending}
                </span>
                <span className="rounded-full bg-red-500/15 px-3 py-1 text-red-400">
                  Cancelled {doctor.cancelled}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-dark-500 p-6 text-sm text-dark-700">
            No doctor activity yet.
          </div>
        )}
      </div>
    </div>
  );
};
