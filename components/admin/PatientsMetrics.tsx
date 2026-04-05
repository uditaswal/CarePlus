export const PatientsMetrics = ({ totalPatients, activePatients, newPatients }: { totalPatients: number; activePatients: number; newPatients: number }) => {
  return (
    <div className="rounded-2xl border border-dark-500 bg-dark-300 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Patient Metrics
      </h2>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-dark-700">Total Patients</p>
          <h3 className="mt-2 text-3xl font-semibold text-white">
            {totalPatients}
          </h3>
          <p className="mt-1 text-xs text-dark-700">Registered in system</p>
        </div>
        <div>
          <p className="text-sm text-dark-700">Active Patients</p>
          <h3 className="mt-2 text-3xl font-semibold text-emerald-400">
            {activePatients}
          </h3>
          <p className="mt-1 text-xs text-dark-700">With appointments this month</p>
        </div>
        <div>
          <p className="text-sm text-dark-700">New Patients</p>
          <h3 className="mt-2 text-3xl font-semibold text-blue-400">
            {newPatients}
          </h3>
          <p className="mt-1 text-xs text-dark-700">Registered this month</p>
        </div>
      </div>
    </div>
  );
};
